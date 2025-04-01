import React, { useState, useEffect } from "react";
import SearchContainer from "../components/SearchContainer";
import { getExpenses, createExpense } from "../services/expenseService";
import ExpensesInputForm from "../components/Finance/ExpensesInputForm";
import ExpensesTableWrapper from "../components/Finance/ExpensesTableWrapper";
import DateFilter from "../components/DateFilter";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";

export default function FinancePage() {
  const [expensesData, setExpensesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  // ✅ Verileri çekme fonksiyonu
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses();
      setExpensesData(response.expense || []);
      // console.log("Giderler alındı:", response.expense);
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
      // console.log("📤 API'ye Gönderilen Veri:", expenseData);
      const newExpense = await createExpense(expenseData);

      setExpensesData((prevData) => [newExpense.expense, ...prevData]);
      await fetchExpenses();
      setShowMobileForm(false); // Mobil formun otomatik kapanması
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
    <div className="w-screen bg-[#f4f7fe] p-4 md:p-8 overflow-auto rounded-l-[2.5rem] relative z-20">
      <div className="flex flex-col md:flex-row md:justify-between mb-3 items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Maliyet Yönetimi</h1>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
          <SearchContainer onSearchChange={handleSearchChange} />
          <DateFilter
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          
          {/* Mobil buton - Sadece mobil görünümde */}
          <button 
            onClick={() => setShowMobileForm(true)}
            className="md:hidden flex items-center justify-center w-[9rem] h-10 rounded-2xl bg-[#399AA1] hover:bg-[#007E85] shadow-md text-white"
          >
            <IoAddCircleOutline className="w-6 h-6" /> Gider Ekle
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Desktop görünümde normal form */}
        <div className="hidden md:block">
          <ExpensesInputForm
            onAddExpense={handleAddExpense}
            uniqueCategories={uniqueCategories}
            uniqueKinds={uniqueKinds}
            uniqueCurrencies={uniqueCurrencies}
          />
        </div>
        
        {/* Mobil popup form */}
        {showMobileForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 md:hidden">
            <div className="bg-white rounded-lg w-full max-w-md p-4 relative max-h-[90vh] overflow-auto">
              <button
                onClick={() => setShowMobileForm(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <IoIosCloseCircleOutline className="w-6 h-6 text-red-500" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">Yeni Gider Ekle</h2>
              <ExpensesInputForm
                onAddExpense={handleAddExpense}
                uniqueCategories={uniqueCategories}
                uniqueKinds={uniqueKinds}
                uniqueCurrencies={uniqueCurrencies}
                isMobile={true} // Mobil görünüm için ek prop
              />
            </div>
          </div>
        )}
        
        <ExpensesTableWrapper
          searchQuery={searchQuery}
          data={expensesData}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          fetchExpenses={fetchExpenses}
          className="w-full"
        />
      </div>
    </div>
  );
}
