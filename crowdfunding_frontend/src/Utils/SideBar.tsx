import { useState } from "react";
import {
  BarChart3,
  Users,
  MessageCircle,
  BarChart,
  Calendar,
  DollarSign,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import logo from '../assets/logo.png';

export default function SideBar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuItems = [
    {
      name: "Dashboard",
      icon: BarChart3,
      color: "bg-teal-500",
      active: true,
    },
    {
      name: "Squad",
      icon: Users,
      color: "bg-blue-500",
      active: false,
    },
    {
      name: "Messenger",
      icon: MessageCircle,
      color: "bg-green-500",
      active: false,
    },
    {
      name: "Statistic",
      icon: BarChart,
      color: "bg-orange-500",
      active: false,
    },
    {
      name: "Calendar",
      icon: Calendar,
      color: "bg-purple-500",
      active: false,
    },
    {
      name: "Finance",
      icon: DollarSign,
      color: "bg-yellow-500",
      active: false,
    },
    {
      name: "Transfers",
      icon: TrendingUp,
      color: "bg-red-500",
      active: false,
    },
    {
      name: "Youth academy",
      icon: GraduationCap,
      color: "bg-indigo-500",
      active: false,
    },
  ];

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
  };

  return (
    <aside className="w-64 h-screen bg-white/20 backdrop-blur-sm border-r rounded-lg border-white/30 flex flex-col fixed z-10">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <img src={logo} className='w-[26px]' alt="" />
          <p className='font-logo text-xl text-limeTxt cursor-pointer'>Agriconnect</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              key={index}
              onClick={() => handleItemClick(item.name)}
              className={`w-full flex items-center cursor-pointer space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive
                  ? "bg-bgColor text-limeTxt shadow-lg"
                  : "text-white hover:bg-white/30 hover:text-gray-900"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${item.color} ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
              />
              <Icon
                size={20}
                className={`${isActive ? "text-white" : "text-white"}`}
              />
              <span
                className={`font-medium ${
                  isActive ? "text-limeTxt" : "text-white"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section - User Profile */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Andrea Pirlo</p>
            <p className="text-xs text-gray-600">Head Coach</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
