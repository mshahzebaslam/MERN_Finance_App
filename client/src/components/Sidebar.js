import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  FileTextIcon,
  DollarSignIcon,
  TargetIcon,
  SettingsIcon,
  LogOutIcon,
  BookOpenIcon
} from "lucide-react";
const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically:
    // 1. Clear any user session/token from storage
    // localStorage.removeItem('authToken');
    // 2. Redirect to signin page
    navigate('/signin');
  };

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold p-6">Smart Spend</div>
        <nav className="flex flex-col gap-2 px-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive
                  ? 'bg-[#15615a] text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <HomeIcon size={20} /> Overview
          </NavLink>
          
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive
                  ? 'bg-[#15615a] text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <FileTextIcon size={20} /> Transactions
          </NavLink>
          <NavLink
            to="/bills"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive
                  ? 'bg-[#15615a] text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <DollarSignIcon size={20} /> Bills
          </NavLink>
         
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded ${
                isActive
                  ? 'bg-[#15615a] text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <TargetIcon size={20} /> Goals
          </NavLink>

          <NavLink
  to="/articles"
  className={({ isActive }) =>
    `flex items-center gap-2 p-2 rounded ${
      isActive
        ? 'bg-[#15615a] text-white'
        : 'text-gray-300 hover:bg-gray-800'
    }`
  }
>
  <BookOpenIcon size={20} /> Articles
</NavLink>
          
        </nav>
      </div>

      <div className="px-4 py-6">
        <button 
          className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-800 rounded text-gray-300"
          onClick={handleLogout}
        >
          <LogOutIcon size={20} /> Logout
        </button>
       
      </div>
    </div>
  );
};

export default Sidebar;