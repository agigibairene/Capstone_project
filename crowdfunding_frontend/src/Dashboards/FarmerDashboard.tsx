import { useState, type JSX } from "react";
import { Search } from "lucide-react";
import SideBar from "../Utils/SideBar";
import CreateProject from "../Farmer/CreateProject";
import { farmerMenuItems } from "../data/data";
import InvestorMainContent from "../Investor/InvestorMainContent";
import ChatBot from "../chatbot/ChatBot";

type MainContentMap = {
  [key: string]: JSX.Element;
};

export default function FarmerDashboard(){
    const [activeItem, setActiveItem] = useState("Dashboard");


    const mainContent: MainContentMap = {
        Dashboard: <InvestorMainContent />,
        'Create Project': <CreateProject />,
        ChatBot: <ChatBot />
    }

    return(
        <section className="min-h-screen font-Outfit bg-gradient-to-br from-emerald-700 via-bgColor to-teal-900 p-2">
            <div className="flex">
                <SideBar menuItems={farmerMenuItems} activeItem={activeItem} setActiveItem={setActiveItem}/>

                 <div className="flex-1 ml-72">
                    <header className="rounded-lg backdrop-blur-lg border-b border-white/30 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm md:text-lg font-medium">Welcome back, Irene Akawin 👋</p>
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
                                    <span className="text-white font-semibold text-xs">IA</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Irene Akawin</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mt-2">
                        {mainContent[activeItem]}
                    </main>
                 </div>
            </div>
        </section>
    )
}