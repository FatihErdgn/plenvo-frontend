import React, { useState } from "react";
import SearchContainer from "../components/SearchContainer";
import ExpenseTable from "../components/Finance/ExpensesTable";
import PieChartComponent from "../components/Finance/PieChart";
import expensesData from "../expensesData.json";

const categoryData = expensesData.reduce((acc, expense) => {
  const existingCategory = acc.find(item => item.label === expense.ExpenseCategory);
  if (existingCategory) {
    existingCategory.value += expense.Amount;
  } else {
    acc.push({
      label: expense.ExpenseCategory,
      value: expense.Amount,
    });
  }
  return acc;
}, []);

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="w-screen bg-white p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Manage Expenses</h1>
        <div className="flex flex-row justify-end gap-4">
          <SearchContainer onSearchChange={handleSearchChange} />
        </div>
      </div>
      {/* İçerik */}
      <div className="flex flex-row gap-8 mt-8">
      <PieChartComponent data={categoryData} />
        <ExpenseTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
