import React, { useState, useEffect } from "react";
import SearchContainer from "../components/SearchContainer";
import { getExpenses, createExpense } from "../services/expenseService";
import ExpensesInputForm from "../components/Finance/ExpensesInputForm";
import ExpensesTableWrapper from "../components/Finance/ExpensesTableWrapper";
import DateFilter from "../components/DateFilter";

export default function FinancePage() {
  const [expensesData, setExpensesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Verileri çekme fonksiyonu
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses();
      setExpensesData(response.expense || []);
      console.log("Giderler alındı:", response.expense);
    } catch (error) {
      console.error("Giderleri alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sayfa yüklendiğinde giderleri getir
  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Yeni bir gider eklediğinde tabloyu güncelle
  const handleAddExpense = async (expenseData) => {
    try {
      console.log("📤 API'ye Gönderilen Veri:", expenseData);
      const newExpense = await createExpense(expenseData);

      setExpensesData((prevData) => [newExpense.expense, ...prevData]);
      await fetchExpenses();
    } catch (error) {
      console.error("Gider eklenirken hata oluştu:", error);
    }
  };

  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleStartDateChange = (event) => setStartDate(event.target.value);
  const handleEndDateChange = (event) => setEndDate(event.target.value);

  // ✅ Dropdown için unique değerleri hesapla
  const uniqueCategories = [
    ...new Set(expensesData.map((item) => item.expenseCategory)),
  ];
  const uniqueKinds = ["Sabit", "Genel"];
  const uniqueCurrencies = ["TRY", "USD", "EUR"];

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[2.5rem] relative z-20">
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

      <div className="flex flex-row gap-8">
        <ExpensesInputForm
          onAddExpense={handleAddExpense}
          uniqueCategories={uniqueCategories}
          uniqueKinds={uniqueKinds}
          uniqueCurrencies={uniqueCurrencies}
        />
        <ExpensesTableWrapper
          searchQuery={searchQuery}
          data={expensesData}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          fetchExpenses={fetchExpenses}
        />
      </div>
    </div>
  );
}
