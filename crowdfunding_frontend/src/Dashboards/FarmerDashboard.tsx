import { useEffect, useState, type JSX } from "react";
import { Search } from "lucide-react";
import SideBar from "../Utils/SideBar";
import CreateProject from "../Farmer/CreateProject";
import { farmerMenuItems } from "../data/data";
import ChatBot from "../chatbot/ChatBot";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchUserKYC } from "../redux/KycSlice";
import Loader from "../Utils/Loader";
import FarmerHome from "../Farmer/FarmerHome";

type MainContentMap = {
  [key: string]: JSX.Element;
};

export default function FarmerDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const { kycData, loading, error } = useSelector((state: RootState) => state.kycReducer,shallowEqual);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!kycData) {
      dispatch(fetchUserKYC());
    }
  }, [dispatch, kycData]);

  if (loading) return <Loader text="Loading" />;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!kycData || !kycData.kyc)
    return <p className="text-white">No KYC data found for your account</p>;

  const userKYC = kycData.kyc;
  const initials = userKYC?.full_name?.split(" ").map((name: string) => name[0]).join("").toUpperCase() || "";

  const mainContent: MainContentMap = {
    Dashboard: <FarmerHome />,
    "Create Project": <CreateProject />,
    ChatBot: <ChatBot />,
  };

  return (
    <section className="min-h-screen font-Outfit bg-gradient-to-br from-emerald-700 via-bgColor to-teal-900 p-2">
      <div className="flex">
        <SideBar
          menuItems={farmerMenuItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          full_name={userKYC.full_name}
          initial={initials}
          role={userKYC.role}
        />

        <div className="flex-1 ml-24 lg:ml-72">
          <header className="rounded-lg backdrop-blur-lg border-b border-white/30 p-3 sm:p-4 md:p-6">
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
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bgColor" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full sm:w-auto pl-10 pr-4 py-2 text-sm bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-gray-600"
                  />
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs sm:text-sm">{initials}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="mt-2">{mainContent[activeItem]}</main>
        </div>
      </div>
    </section>
  );
}