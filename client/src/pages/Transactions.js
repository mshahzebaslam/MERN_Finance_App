import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "" });

  // 1. Load Transactions
  const getTransactions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(res.data.transactions || []); // <- update list
    } catch (error) {
      console.error("Error fetching transactions", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  // 2. Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Add Transaction
  const addTransaction = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          category: "shopping",
          type: "expense",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTransactions((prev) => [...prev, data.transaction]);
        setForm({ description: "", amount: "" });
      }
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  };

  // 4. Delete Transaction
  const removeTransaction = async (index) => {
    const token = localStorage.getItem("token");
    const transactionId = transactions[index]._id;
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setTransactions((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-800 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Transactions</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={addTransaction}
            className="text-white font-semibold rounded-lg px-4 py-3 transition-all"
            style={{ background: "linear-gradient(135deg, #247f78, #2eb89d)" }}
          >
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id}
            className="p-5 bg-white rounded-2xl shadow relative"
            style={{ background: "#247f78" }}
          >
            <button
              onClick={() => removeTransaction(index)}
              className="absolute top-3 right-3 text-red-500 text-lg font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-white mb-1">
              {transaction.description}
            </h3>
            <p className="text-md text-white font-bold">
              ${transaction.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
