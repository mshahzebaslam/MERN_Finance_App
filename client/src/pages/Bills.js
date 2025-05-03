import React, { useState, useEffect } from "react";
import axios from "axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [newBill, setNewBill] = useState({ name: "", amount: "", dueDate: "" });
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/bills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBills(response.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  const handleChange = (e) => {
    setNewBill({ ...newBill, [e.target.name]: e.target.value });
  };

  const addBill = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/bills",
        newBill,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBills([...bills, response.data]);
      setNewBill({ name: "", amount: "", dueDate: "" });
    } catch (err) {
      console.error("Error adding bill:", err);
    }
  };

  const removeBill = async (index) => {
    const billId = bills[index]._id;
    try {
      await axios.delete(`http://localhost:5000/api/bills/${billId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = bills.filter((_, i) => i !== index);
      setBills(updated);
    } catch (err) {
      console.error("Error deleting bill:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-800 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Upcoming Bills</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Bill</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="name"
            value={newBill.name}
            onChange={handleChange}
            placeholder="Bill name"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            name="amount"
            value={newBill.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="date"
            name="dueDate"
            value={newBill.dueDate}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={addBill}
            className="text-white font-semibold rounded-lg px-4 py-3 transition-all"
            style={{ background: "linear-gradient(135deg, #247f78, #2eb89d)" }}
          >
            Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.length > 0 ? (
          bills.map((bill, index) => {
            const date = new Date(bill.dueDate);
            const month = date.toLocaleString("default", { month: "short" });
            const day = date.getDate();

            return (
              <div
                key={index}
                className="flex items-center bg-white p-4 rounded-2xl shadow-md justify-between relative"
              >
                <button
                  onClick={() => removeBill(index)}
                  className="absolute top-2 right-2 text-red-500 text-lg font-bold"
                >
                  &times;
                </button>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-xl text-center p-2 w-16">
                    <p className="text-sm font-bold text-gray-800">{month}</p>
                    <p className="text-lg font-bold text-gray-800">{day}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 leading-tight">
                      {bill.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {bill.dueDate}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-xl shadow-sm">
                  ${bill.amount}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No bills available.</p>
        )}
      </div>
    </div>
  );
};

export default Bills;
