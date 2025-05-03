// utils/analysis.js
// import { transactions } from './data/transactions';

export const analyzeSpending = () => {
    const transactions = [
        { id: 1, category: "Food", amount: 50, date: "2025-04-25", description: "Grocery shopping" },
        { id: 2, category: "Food", amount: 30, date: "2025-04-26", description: "Dining out" },
        { id: 3, category: "Entertainment", amount: 100, date: "2025-04-20", description: "Movie tickets" },
        { id: 4, category: "Transport", amount: 20, date: "2025-04-22", description: "Uber ride" },
        { id: 5, category: "Bills", amount: 150, date: "2025-04-15", description: "Electricity bill" },
        { id: 6, category: "Savings", amount: 200, date: "2025-04-18", description: "Savings deposit" },
      ];
  const spendingSummary = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += transaction.amount;
    return acc;
  }, {});

  // Calculate total spending
  const totalSpending = Object.values(spendingSummary).reduce((acc, amount) => acc + amount, 0);

  // Personalized insights and recommendations
  const recommendations = [];
  if (spendingSummary.Food > 100) {
    recommendations.push("Consider reducing your food expenses. Try cooking more at home.");
  }
  if (spendingSummary.Entertainment > 100) {
    recommendations.push("You might want to lower entertainment spending this month.");
  }
  if (spendingSummary.Savings < 200) {
    recommendations.push("Try to increase your savings to reach your financial goals.");
  }

  return { spendingSummary, totalSpending, recommendations };
};
