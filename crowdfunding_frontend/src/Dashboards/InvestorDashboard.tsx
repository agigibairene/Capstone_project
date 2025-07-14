/* eslint-disable @typescript-eslint/no-explicit-any */ 
import SideBar from "../Utils/SideBar";
import { menuItems } from "../data/data";
import { useEffect, useState, type JSX } from "react";
import AllProjects from "./AllProjects";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { fetchUserKYC } from "../redux/KycSlice";
import type { AppDispatch, RootState } from "../redux/store";
import Loader from "../Utils/Loader";
import InvestorHome from "../Investor/InvestorHome";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { kycData, loading, error } = useSelector((state: RootState) => state.kycReducer,shallowEqual);
  const dispatch = useDispatch<AppDispatch>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadings, setLoadings] = useState(true);
  const [errors, setErrors] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  console.log(projects)

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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (loading) return <Loader text="Loading" />;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;
  if (!kycData || !kycData.kyc){
    return <p className="text-white p-4">No KYC data found for your account</p>;
  }
  
  const userKYC = kycData.kyc;
  const initials = userKYC?.full_name?.split(" ").map((name: string) => name[0]).join("").toUpperCase() || "";
  const mainContent: MainContentMap = {
    Dashboard: <InvestorHome />,
    'All Projects': <AllProjects loading={loadings} error={errors} projects={projects} forbidden={forbidden}/>
  }

  return(
    <section className="min-h-screen font-Outfit bg-gradient-to-br from-emerald-700 via-bgColor to-teal-900">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          lg:transform-none
        `}>
          <SideBar 
            menuItems={menuItems} 
            activeItem={activeItem} 
            setActiveItem={setActiveItem}
            full_name={userKYC.full_name}
            initial={initials}
            role={userKYC.role}
            onCollapse={handleSidebarCollapse}
          />
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          
          {/* Fixed Header for Mobile */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 pl-20">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-white">{activeItem}</h1>
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{initials}</span>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col flex-1 overflow-hidden pt-16 lg:pt-0">
            {activeItem === "Dashboard" && (
              <header className="hidden lg:block rounded-lg backdrop-blur-lg border-b border-white/30 p-3 pl-28 sm:p-4 md:p-6 mx-2 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white text-sm md:text-lg font-medium">
                      Welcome back, <span className="hidden sm:inline">{userKYC.full_name}</span><span className="sm:hidden">{userKYC.full_name.split(" ")[0]}</span> 👋
                    </p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-limeTxt mt-1">
                      Dashboard
                    </h1>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm">{initials}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            )}

            {/* Main Content Area */}
            <main className="flex-1 ml-20 lg:ml-2 no-scrollbar overflow-y-auto p-2 lg:p-4">
              <div className="max-w-full">
                {mainContent[activeItem]}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  )
}