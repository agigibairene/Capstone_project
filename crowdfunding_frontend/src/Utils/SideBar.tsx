import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import type { LucideIcon } from "lucide-react";
import { resetKYCState } from '../redux/KycSlice';
import { logout } from '../redux/login_auth';
import type { AppDispatch } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SideBarProps {
  name: string;
  icon: LucideIcon;
  color: string;
  active: boolean;
}

interface Props {
  menuItems: SideBarProps[];
  activeItem: string;
  setActiveItem: (item: string) => void;
  full_name: string;
  initial: string;
  role: string;
  onCollapse?: (collapsed: boolean) => void;
}

export default function SideBar({
  menuItems,
  activeItem,
  setActiveItem,
  full_name,
  initial,
  role,
  onCollapse,
}: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth < 900);
  const isCollapsed = isManuallyCollapsed || isScreenSmall;

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 900;
      setIsScreenSmall(isSmall);
      onCollapse?.(isSmall || isManuallyCollapsed);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isManuallyCollapsed, onCollapse]);

  const handleToggle = () => {
    const newVal = !isManuallyCollapsed;
    setIsManuallyCollapsed(newVal);
    onCollapse?.(newVal || isScreenSmall);
  };

  function handleItemClick(itemName: string) {
    setActiveItem(itemName);
  }

  function handleLogout() {
    dispatch(logout());
    dispatch(resetKYCState());
    navigate('/login');
  }

  return (
    <aside
      className={`min-h-screen bg-white/20 backdrop-blur-sm border-r border-white/30 flex flex-col fixed z-10 transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={logo} className="w-[26px]" alt="logo" />
          {!isCollapsed && (
            <p className="font-logo text-xl text-limeTxt">Agriconnect</p>
          )}
        </div>
        {!isScreenSmall && (
          <button onClick={handleToggle} className="text-white cursor-pointer border-0 outline-0">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          const isLogout = item.name === "Log Out";

          return (
            <button
              key={index}
              onClick={() => isLogout ? handleLogout() : handleItemClick(item.name)}
              className={`w-full flex items-center cursor-pointer px-2 py-3 border-0 outline-0 rounded-xl transition-all duration-200
              ${isActive && !isLogout ? "bg-bgColor text-limeTxt shadow-lg" : "text-white hover:bg-white/30 hover:text-gray-900"}`}
            >
              <div className={`w-2 h-2 rounded-full ${item.color} ${isActive && !isLogout ? "opacity-100" : "opacity-60"} mr-2`} />
              <Icon size={20} className="text-white" />
              {!isCollapsed && (
                <span className={`ml-2 font-medium ${isActive && !isLogout ? "text-limeTxt" : "text-white"}`}>
                  {item.name}
                </span>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-2 w-max px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      {!isCollapsed && (
        <div className="p-4 hidden md:block border-t border-white/20">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{initial}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{full_name}</p>
              <p className="text-xs text-white">{role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
