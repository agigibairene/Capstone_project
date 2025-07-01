
import logo from '../assets/logo.png';
import type { LucideIcon } from "lucide-react";
import { logout } from '../redux/login_auth';
import type { AppDispatch } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';


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
}

export default function SideBar({ menuItems, activeItem, setActiveItem, full_name, initial, role }: Props) {

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>()
  
  function handleItemClick(itemName: string) {
    setActiveItem(itemName);
  }

  function handleLogout(){
    dispatch(logout());
    navigate('/');
  }

  return (
    <aside 
      className="h-screen bg-white/20 backdrop-blur-sm border-r border-white/30 flex flex-col fixed z-10 w-16 sm:w-64 transition-all duration-300 group"
    >
      <div className="p-4 flex items-center justify-center sm:justify-start">
        <img src={logo} className="w-[26px]" alt="logo" />
        <p className="hidden sm:block font-logo text-xl text-limeTxt ml-2">Agriconnect</p>
      </div>

      <nav className="flex-1 p-2 sm:p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          const isLogout = item.name === "Log Out"; 

          return (
            <button
              key={index}
              onClick={() => {
                if (isLogout) {
                  handleLogout(); 
                } else {
                  handleItemClick(item.name); 
                }
              }}
              className={`w-full flex items-center cursor-pointer px-2 sm:px-4 py-3 rounded-xl transition-all duration-200
                ${isActive && !isLogout ? "bg-bgColor text-limeTxt shadow-lg" : "text-white hover:bg-white/30 hover:text-gray-900"}`}
            >
              <div className={`w-2 h-2 rounded-full ${item.color} ${isActive && !isLogout ? "opacity-100" : "opacity-60"} mr-2`} />
              <Icon size={20} className="text-white" />
              <span className={`ml-2 hidden sm:inline font-medium ${isActive && !isLogout ? "text-limeTxt" : "text-white"}`}>
                {item.name}
              </span>

              <span className="absolute left-full ml-2 w-max px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 sm:hidden">
                {item.name}
              </span>
            </button>
          );
        })}

        
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initial}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{full_name}</p>
            <p className="text-xs text-white">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
