import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setSuccessMessage("Account created successfully!");
      setError(""); 

      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      setSuccessMessage(""); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15615a] to-[#33bca7] flex flex-col md:flex-row">
      <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24 w-full md:w-1/2 order-1 md:order-none">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Join SmartSpend
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
          Your Personal Finance Assistant
        </h2>
        <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
          Take control of your finances. With SmartSpend, you can track expenses, 
          set goals, and make smarter financial decisions every day. Our platform 
          helps you stay on top of your money with intuitive tools and clear insights.
        </p>
      </div>
      
      <div className="flex items-center justify-center p-4 sm:p-6 w-full md:w-1/2 order-2 md:order-none">
        <div className="w-full max-w-md bg-white rounded-xl md:rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign Up</h2>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#15615a] focus:border-[#15615a] focus:outline-none transition-colors"
              />
            </div>
            
            <button
              className="w-full bg-gradient-to-r from-[#299d91] to-[#3ac1ad] text-white py-3 rounded-lg font-medium hover:from-[#247f78] hover:to-[#2eb89d] transition-all"
              onClick={handleSubmit}
            >
              Create Account
            </button>
            
            <div className="text-center mt-4">
              <a
                href="#"
                className="text-sm text-[#299d91] hover:underline flex items-center justify-center gap-1"
                onClick={() => navigate("/signin")}
              >
                Already have an account? Sign in <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
