import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    // e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email: email,
        password: password,
      });
      localStorage.setItem("token", response.data.token); 
      console.log("Login successful:", response.data);
      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert("Invalid credentials. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15615a] to-[#33bca7] flex flex-col md:flex-row">
     
      <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24 w-full md:w-1/2 order-1 md:order-none">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome to SmartSpend
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
        Your Personal Finance Assistant
        </h2>
        <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
        Take control of your finances. With SmartSpend, you can track expenses, set goals, and make smarter financial decisions every day. Our platform helps you stay on top of your money with intuitive tools and clear insights.
        </p>
      </div>

      
      <div className="flex items-center justify-center p-4 sm:p-6 w-full md:w-1/2 order-2 md:order-none">
        <div className="w-full max-w-md bg-white rounded-xl md:rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign in</h2>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end">
            </div>

            <button
              className="w-full bg-gradient-to-r from-[#299d91] to-[#3ac1ad] text-white py-3 rounded-lg font-medium hover:from-[#247f78] hover:to-[#2eb89d] transition-all"
            onClick={handleSubmit}
            >
              Sign in
            </button>

            <div className="text-center mt-4">
              <a href="#" className="text-sm text-[#299d91] hover:underline flex items-center justify-center gap-1"
                 onClick={() => navigate("/signup")}>
                Don't have an account? Sign up <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
