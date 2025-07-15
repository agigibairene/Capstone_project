import { useEffect, useState, type JSX } from "react";
import SideBar from "../Utils/SideBar";
import CreateProject from "../Farmer/CreateProject";
import { farmerMenuItems } from "../data/data";
import ChatBot from "../chatbot/ChatBot";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchUserKYC } from "../redux/KycSlice";
import Loader from "../Utils/Loader";
import FarmerHome from "../Farmer/FarmerHome";
import UserProfile from "./UserProfile";

type MainContentMap = {
  [key: string]: JSX.Element;
};

export default function FarmerDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { kycData, loading, error } = useSelector((state: RootState) => state.kycReducer, shallowEqual);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!kycData) {
      dispatch(fetchUserKYC());
    }
  }, [dispatch, kycData]);

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

  if (loading) return <Loader text="Loading..." />;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;
  if (!kycData || !kycData.kyc) {
    return <p className="text-white p-4">No KYC data found for your account</p>;
  }

  const userKYC = kycData.kyc;
  const initials = userKYC?.full_name?.split(" ").map((name: string) => name[0]).join("").toUpperCase() || "";


  const mainContent: MainContentMap = {
    Dashboard: <FarmerHome />,
    "Create Project": <CreateProject />,
    ChatBot: <ChatBot />,
    'Your Profile': <UserProfile />
  };

  return (
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
            menuItems={farmerMenuItems} 
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
            {/* Dashboard Header for Large Screens - Fixed */}
           {activeItem !== "Your Profile" && <header className="hidden lg:block  top-0 left-0 right-0 z-30 rounded-lg backdrop-blur-lg border-b border-white/30 p-3 pl-28 sm:p-4 md:p-6 mx-2 mt-2"
              style={{ left: sidebarCollapsed ? '4rem' : '16rem' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm md:text-lg font-medium">
                    Welcome back, <span className="hidden sm:inline">{userKYC.full_name}</span><span className="sm:hidden">{userKYC.full_name.split(" ")[0]}</span> 👋
                  </p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-limeTxt mt-1">
                    {activeItem}
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
            </header>}

            {/* Main Content Area */}
            <main className="flex-1 ml-20 lg:ml-2 no-scrollbar overflow-y-auto p-2 lg:p-4 lg:pt-4">
              <div className="max-w-full">
                {mainContent[activeItem]}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}