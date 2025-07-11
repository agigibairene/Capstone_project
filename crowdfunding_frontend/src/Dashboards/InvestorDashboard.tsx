/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import SideBar from "../Utils/SideBar";
import { menuItems } from "../data/data";
import { useEffect, useState, type JSX } from "react";
import AllProjects from "./AllProjects";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { fetchUserKYC } from "../redux/KycSlice";
import type { AppDispatch, RootState } from "../redux/store";
import Loader from "../Utils/Loader";
import Card from "../Farmer/FarmerHome";
import { API_URL } from "../Utils/constants";

export interface Project {
  id: string;
  name: string;
  title: string;
  brief: string;
  target_amount: string;
  benefits: string;
  created_at: string;
  days_remaining: number;
  deadline: string;
  description: string;
  email: string;
  farmer: number;
  farmer_name: string;
  image_url: string | null;
  is_farmer: boolean;
  status: string;
  watermarked_proposal: string;
}

type MainContentMap = {
  [key: string]: JSX.Element;
};

export default function InvestorDashboard(){

    const [activeItem, setActiveItem] = useState("Dashboard");
    const { kycData, loading, error } = useSelector((state: RootState) => state.kycReducer,shallowEqual);
    const dispatch = useDispatch<AppDispatch>();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadings, setLoadings] = useState(true);
    const [errors, setErrors] = useState<string | null>(null);
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
      if (!kycData) {
        dispatch(fetchUserKYC());
      }
    }, [dispatch, kycData]);

    useEffect(() => {
        const fetchProjects = async () => {
          setLoadings(true);
          setErrors(null);
          setForbidden(false);
    
          try {
            const res = await fetch(`${API_URL}/projects/`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`
              }
            });
    
            const data = await res.json();
            console.log("API Response:", data);
    
            if (res.status === 403) {
              setForbidden(true);
              throw new Error(data.message || "Access denied");
            }
    
            if (!res.ok) throw new Error(data.message || "Failed to fetch projects");
    
            setProjects(data);
          } catch (err: any) {
            if (!forbidden) {
              setErrors(err.message || "An error occurred");
            }
          } finally {
            setLoadings(false);
          }
        };
    
        fetchProjects();
    }, []);

    if (loading) return <Loader text="Loading" />;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!kycData || !kycData.kyc){
        return <p className="text-white">No KYC data found for your account</p>;
    }
    
    const userKYC = kycData.kyc;
    const initials = userKYC?.full_name?.split(" ").map((name: string) => name[0]).join("").toUpperCase() || "";

    const mainContent: MainContentMap = {
        Dashboard: <Card />,
        'All Projects': <AllProjects loading={loadings} error={errors} projects={projects} forbidden={forbidden}/>
    }

    return(
        <section className="min-h-screen font-Outfit bg-gradient-to-br from-emerald-700 via-bgColor to-teal-900 p-2">
            <div className="flex">
                <SideBar 
                    menuItems={menuItems} 
                    activeItem={activeItem} 
                    setActiveItem={setActiveItem}
                    full_name={userKYC.full_name}
                    initial={initials}
                    role={userKYC.role}
                />

                {/* Main Content */}
                 <div className="flex-1 ml-72">
                    {activeItem === "Dashboard" && (
                        <header className="rounded-lg backdrop-blur-lg border-b border-white/30 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-sm md:text-lg font-medium">Welcome back, {userKYC.full_name}👋</p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-limeTxt mt-1">Dashboard</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bgColor" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs">{initials}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                    )}

                    <main className="mt-2">
                      {mainContent[activeItem]}
                    </main>
                 </div>
            </div>
        </section>
    )
}