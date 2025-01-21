import React, { useState } from "react";
import SearchContainer from "../components/SearchContainer";
import expensesData from "../expensesData.json";
import ExpensesInputForm from "../components/Finance/ExpensesInputForm";
import ExpensesTableWrapper from "../components/Finance/ExpensesTableWrapper";
import DateFilter from "../components/DateFilter";

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Maliyet Yönetimi</h1>
        <div className="flex flex-row justify-end gap-4">
          <SearchContainer onSearchChange={handleSearchChange} />
          <DateFilter
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        </div>
      </div>
      {/* İçerik */}
      {/* <BarChartComponent data={categoryData} /> */}
      <div className="flex flex-row gap-8">
        <ExpensesInputForm expensesData={expensesData} />
        {/* <ExpenseTable searchQuery={searchQuery} data={expensesData} /> */}
        <ExpensesTableWrapper
          searchQuery={searchQuery}
          data={expensesData}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}
