import React, { useState, useEffect } from "react";
import axios from "axios";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: "", target: "", amount: "" });

  const token = localStorage.getItem("token");

  const fetchGoals = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addGoal = async () => {
    const newGoal = {
      name: form.name,
      targetAmount: parseFloat(form.target),
      currentAmount: parseFloat(form.amount),
    };

    try {
      const response = await axios.post("http://localhost:5000/api/goals", newGoal, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      setGoals([...goals, response.data]); 
      setForm({ name: "", target: "", amount: "" });
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

 
  const removeGoal = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      setGoals(goals.filter((goal) => goal._id !== id));
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-800 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Financial Goals</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Goal name"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            name="target"
            value={form.target}
            onChange={handleChange}
            placeholder="Target amount"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Saved so far"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={addGoal}
            className="text-white font-semibold rounded-lg px-4 py-3 transition-all"
            style={{ background: "linear-gradient(135deg, #247f78, #2eb89d)" }}
          >
            Add Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const target = parseFloat(goal.targetAmount);
            const amount = parseFloat(goal.currentAmount);
            const progress = target ? Math.min((amount / target) * 100, 100) : 0;

            return (
              <div
                key={goal._id}
                className="p-5 rounded-2xl shadow relative"
                style={{ background: "#247f78" }}
              >
                <button
                  onClick={() => removeGoal(goal._id)}
                  className="absolute top-3 right-3 text-red-500 text-lg font-bold"
                >
                  &times;
                </button>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#FFFFFFE6" }}>
                  {goal.name}
                </h3>
                <p className="text-md text-white font-bold">Target: ${target}</p>
                <p className="text-sm text-white">Saved: ${amount}</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-white h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p
            className="text-gray-500"
            style={{ alignItems: "center", marginTop: "50%", textAlign: "center" }}
          >
            No goals available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Goals;
