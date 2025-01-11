import React, { useState } from "react";
import SearchContainer from "../components/SearchContainer";
import ExpenseTable from "../components/Finance/ExpensesTable";
import expensesData from "../expensesData.json";
import ExpensesInputForm from "../components/Finance/ExpensesInputForm";
// import BarChartComponent from "../components/Finance/BarChart";

// const categoryData = expensesData
//   .reduce((acc, expense) => {
//     const existingCategory = acc.find(
//       (item) => item.label === expense.ExpenseCategory
//     );
//     if (existingCategory) {
//       existingCategory.data.push(expense.Amount);
//       existingCategory.currencies.push(expense.Currency);
//     } else {
//       acc.push({
//         label: expense.ExpenseCategory,
//         data: [expense.Amount],
//         currencies: [expense.Currency],
//       });
//     }
//     return acc;
//   }, [])
//   .map((item) => ({
//     label: item.label,
//     value: item.data.reduce((sum, amount) => sum + amount, 0),
//     curr: item.currencies[0], // İlk currency değerini alıyoruz
//   }));

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Gelir/Gider Yönetimi</h1>
        <div className="flex flex-row justify-end gap-4">
          <SearchContainer onSearchChange={handleSearchChange} />
        </div>
      </div>
      {/* İçerik */}
      {/* <BarChartComponent data={categoryData} /> */}
      <div className="flex flex-row gap-8">
        <ExpensesInputForm expensesData={expensesData} />
        <ExpenseTable searchQuery={searchQuery} data={expensesData} />
      </div>
    </div>
  );
}
