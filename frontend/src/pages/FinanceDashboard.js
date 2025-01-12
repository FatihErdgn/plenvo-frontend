import React, { useState } from "react";
import ClinicFinancialsChart from "../components/FinanceDashboard/charts/BarChart";
import ClinicFinancialsPieChart from "../components/FinanceDashboard/charts/PieChart";
import Card from "../components/FinanceDashboard/charts/TrendCard"; // Yeni Card
import financialData from "../components/FinanceDashboard/chart-data/chartData.json";

export default function FinanceDashboard() {
  const [view, setView] = useState("weekly"); // Default view
  // const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentData = financialData.data[view]; // JSON'dan mevcut veriler

  // const handleSelect = (key, value) => {
  //   setView((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  //   setDropdownOpen((prev) => ({
  //     ...prev,
  //     [key]: false,
  //   }));
  // };

  // const toggleDropdown = (key) => {
  //   setDropdownOpen((prev) => ({
  //     ...prev,
  //     [key]: !prev[key],
  //   }));
  // };

  // const renderDropdown = (label, key, options) => (
  //   <div className="relative mb-3 dropdown-container">
  //     <label htmlFor={key} className="text-gray-700 mb-2 block">
  //       {label}
  //     </label>
  //     <div
  //       className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center"
  //       onClick={() => toggleDropdown(key)}
  //     >
  //       {currentData[key] || `${label} Seçin`}
  //       <span className="ml-2 transform transition-transform duration-200 opacity-50">
  //         {dropdownOpen[key] ? "▲" : "▼"}
  //       </span>
  //     </div>
  //     {dropdownOpen[key] && (
  //       <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg max-h-40 overflow-auto z-10">
  //         {options.map((option, index) => (
  //           <li
  //             key={index}
  //             className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
  //             onClick={() => handleSelect(key, option)}
  //           >
  //             {option}
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-hidden rounded-l-[40px] relative z-20 font-montserrat">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Finansal Dashboard</h1>

        <div className="mb-6">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="p-3 text-lg border rounded-md shadow-md"
          >
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
            <option value="yearly">Yıllık</option>
          </select>
        </div>
      </div>
      <div className="flex flex-row mx-4 gap-4 items-center justify-between">
        <Card
          title="Toplam Gelir"
          value={`${currentData.totalIncome.value.toLocaleString()} TL`}
          change={currentData.totalIncome.change}
          trendData={currentData.totalIncome.trend}
        />
        <Card
          title="Toplam Gider"
          value={`${currentData.totalExpense.value.toLocaleString()} TL`}
          change={currentData.totalExpense.change}
          trendData={currentData.totalExpense.trend}
        />
        <Card
          title="Kârlılık"
          value={`${currentData.profitability.value.toLocaleString()} TL`}
          change={currentData.profitability.change}
          trendData={currentData.profitability.trend}
        />
        <Card
          title="Hasta Sayısı"
          value={currentData.patientCount.value.toLocaleString()}
          change={currentData.patientCount.change}
          trendData={currentData.patientCount.trend}
        />
      </div>

      <div className="flex flex-row mx-4 mt-8 gap-4 items-center justify-between">
        <div className="bg-white justify-between h-[60vh] w-[50vh] font-montserrat p-6 rounded-3xl shadow-md">
          <ClinicFinancialsPieChart view={view} financialData={financialData} />
        </div>
        <div className="bg-white justify-between h-[60vh] w-[107vh] font-montserrat p-6 rounded-3xl shadow-md">
          <ClinicFinancialsChart view={view} financialData={financialData} />
        </div>
      </div>
    </div>
  );
}
