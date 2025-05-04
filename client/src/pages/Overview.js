import React, { useEffect, useState } from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Pencil, ArrowUpRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import moment from 'moment';
import autoTable from 'jspdf-autotable';

const Overview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigate();
  const formatDateForFilename = () => moment().format('YYYY-MMM-DD');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generatePDF = async () => {
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/reports/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
  
      if (!result.success) {
        console.error('Report generation failed');
        return;
      }
  
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Financial Report Summary', 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated At: ${new Date(result.generatedAt).toLocaleString()}`, 14, 30);
  
      let yPos = 40;
  
      result.data.forEach((section) => {
        const title = section.title;
        const sectionData = section.data;
  
        if (sectionData.length > 0) {
          doc.setFontSize(14);
          doc.text(title, 14, yPos);
          yPos += 6;
  
          const headers = Object.keys(sectionData[0]);
          const rows = sectionData.map(item => headers.map(header => item[header]));
  
          autoTable(doc, {
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 10 },
            theme: 'striped',
            margin: { left: 14, right: 14 }
          });
  
          yPos = doc.lastAutoTable.finalY + 10;
        }
      });
  
      doc.save(`financial-summary_${formatDateForFilename()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const updateBalance = async () => {
    const token = localStorage.getItem("token");
    const newBalance = prompt("Enter new balance:");

    if (newBalance) {
      try {
        const response = await fetch("http://localhost:5000/api/users/balance", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ balance: parseFloat(newBalance) }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData((prevData) => ({ ...prevData, balance: data.balance }));
      } catch (error) {
        console.error("Failed to update balance", error);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#299d91]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-500">
        Error loading dashboard: {error}
      </div>
    );
  }

  const {
    username = "User",
    balance = 0,
    upcomingBills = [],
    goals = [],
    thisMonthTarget = 0,
    recentTransactions = [],
    expenseBreakdown = [],
  } = dashboardData || {};

  const firstGoal = goals[0] || {};
  const goalTarget = firstGoal.targetAmount || 0;
  const goalAchieved = firstGoal.currentAmount || 0;
  const progressPercent = goalTarget > 0 ? (goalAchieved / goalTarget) * 100 : 0;


  const getCategoryIcon = (category) => {
    const icons = {
      housing: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      entertainment: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      ),
      food: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      shopping: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      transportation: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a1 1 0 00-.293-.707l-3-3A1 1 0 0016 7h-1V5a1 1 0 00-1-1H3z" />
        </svg>
      ),
      default: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
        </svg>
      )
    };

    return icons[category.toLowerCase()] || icons.default;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-800 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome back, {username}!</h1>
        <div className="flex items-center gap-4">
          <button
            className="text-sm bg-[#299d91] text-white px-3 py-1 rounded-md hover:bg-[#1f7a70] transition-colors"
            onClick={generatePDF}
          >
            Download Report
          </button>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      {/* Top Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div>
          <h2 className="text-sm text-gray-500 mb-2">Total Balance</h2>
          <div className="p-6 bg-white rounded-2xl shadow-md h-[220px] flex flex-col justify-between">

            {/* Top Section */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-bold">${balance.toLocaleString()}</p>
              <Pencil size={16} className="text-gray-500 cursor-pointer"
                onClick={updateBalance} />
            </div>

            {/* Credit Card Summary */}
            <div className="bg-[#299d91] text-white rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-white/70">Account Type</p>
                <p className="font-semibold text-white">Credit Card</p>
                <p className="text-sm mt-1 tracking-wider">**** **** **** 2598</p>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-lg">$25,000</p>
                  <ArrowUpRight size={16} />
                </div>
                <div className="mt-2 flex gap-1">

                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400 -ml-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Goal */}
        <div>
          <h2 className="text-sm text-gray-500 mb-2">Goals</h2>
          <div className="p-6 bg-white rounded-2xl shadow-md h-[220px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xl font-bold">${goalTarget.toLocaleString()}</p>

            </div>
            <div className="text-sm text-gray-400 mb-2">
              {firstGoal.targetDate ? new Date(firstGoal.targetDate).toLocaleDateString('default', { month: 'long', year: 'numeric' }) : "May, 2023"}
            </div>
            <div className="flex justify-between items-center">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">🎯 Target Achieved</p>
                  <p className="font-semibold">${goalAchieved.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">📅 This Month Target</p>
                  <p className="font-semibold">${thisMonthTarget.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-24 h-24">
                <CircularProgressbar
                  value={progressPercent}
                  text={`${(goalAchieved / 1000).toFixed(1)}K`}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: "#299d91",
                    textColor: "#222",
                    trailColor: "#eee",
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bill */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-gray-500">Upcoming Bill</h2>
            <button className="text-sm text-[#15615a] flex items-center gap-1 hover:underline"
              onClick={() => navigation("/bills")}>
              View All <Plus size={16} />
            </button>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-md h-[220px] space-y-4">
            {upcomingBills.slice(0, 2).map((bill) => (
              <div key={bill._id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-md px-2 py-1 text-xs font-semibold text-gray-600">
                    {new Date(bill.dueDate).toLocaleString('default', { month: 'short' })} <br />
                    {new Date(bill.dueDate).getDate()}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${bill.amount > 500 ? 'text-red-500' : ''}`}>
                      {bill.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last Charge - {new Date(bill.dueDate).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold">${bill.amount}</p>
              </div>
            ))}
            {upcomingBills.length === 0 && (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                No upcoming bills
              </div>
            )}
          </div>
        </div>

      </div>


      {/* Statistics and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-lg mb-2">Statistics</h2>
          <div className="bg-white rounded-2xl shadow-md p-6 h-[250px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Weekly Comparison</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#299d91]"></div>
                  This week
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  Last week
                </span>
              </div>
            </div>

            <div className="flex items-end h-32 space-x-1">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-full text-xs text-gray-500 mr-2">
                <span>$250k</span>
                <span>$50k</span>
                <span>$10k</span>
                <span>$2k</span>
                <span>$0</span>
              </div>

              {/* Bars for this week */}
              <div className="flex space-x-4 items-end flex-grow">
                {[17, 18, 19, 20, 21, 22, 23].map((day, i) => (
                  <div key={`this-week-${day}`} className="flex flex-col items-center">
                    <div
                      className="w-4 bg-[#299d91] rounded-t"
                      style={{ height: `${Math.max(5, 30 + i * 10)}px` }}
                    ></div>
                    <span className="text-xs mt-1 text-gray-600">{day}</span>
                    <span className="text-xs text-gray-400">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Recent Transactions</h2>
            <button className="text-sm text-[#15615a] flex items-center gap-1 hover:underline"
              onClick={() => navigation("/transactions")}>
              View All <Plus size={16} />
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 h-[250px] overflow-y-auto">
            <ul className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <li key={transaction._id} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getCategoryIcon(transaction.category || 'default')}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('default', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}${transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.category}</p>
                  </div>
                </li>
              ))}
              {recentTransactions.length === 0 && (
                <li className="text-center text-gray-400 py-4">
                  No recent transactions
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Expenses Breakdown</h2>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseBreakdown.map((item) => (
              <div key={item.category} className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 capitalize">{item.category}</h3>
                  <p className="text-lg font-bold">${item.total}</p>
                  <p className="text-xs text-gray-400">
                    {Math.round((item.total / expenseBreakdown.reduce((sum, i) => sum + i.total, 0)) * 100)}
                  </p>
                </div>
              </div>
            ))}
            {expenseBreakdown.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 py-4">
                No expense data available
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;