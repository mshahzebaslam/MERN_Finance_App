import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Bills from "./pages/Bills";
import Goals from "./pages/Goals";
import Articles from "./pages/Articles";
import Settings from "./pages/Settings";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <Router>
      <Routes>
      
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

       
        <Route path="*" element={
          <div className="flex h-screen overflow-hidden">
            <div className={`fixed z-30 md:static ${sidebarOpen ? "block" : "hidden"} md:block`}>
              <Sidebar />
            </div>

            <div className="flex-1 bg-gray-100 overflow-y-auto w-full">
              <div className="md:hidden p-4 bg-white shadow flex justify-between items-center">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu size={24} />
                </button>
                <div className="text-lg font-bold">FINEbank.IO</div>
              </div>

              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/articles" element={<Articles />} />
                
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}
