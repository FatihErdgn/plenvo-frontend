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
  // Küçük ekranlarda input formu açmak için state
  const [showInputForm, setShowInputForm] = useState(false);

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

  // Sayfa yüklendiğinde giderleri getir
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

  // ✅ Dropdown için unique değerler
  const uniqueCategories = [
    ...new Set(expensesData.map((item) => item.expenseCategory)),
  ];
  const uniqueKinds = ["Sabit", "Genel"];
  const uniqueCurrencies = ["TRY", "USD", "EUR"];

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[40px] relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Üst başlık ve kontrol elemanları */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Maliyet Yönetimi</h1>
          <div className="flex items-center gap-4">
            <SearchContainer onSearchChange={handleSearchChange} />
            <DateFilter
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />
            {/* Büyük ekranlarda input form görünür, küçük ekranlarda hamburger buton */}
            <div className="hidden md:block">
              <ExpensesInputForm
                onAddExpense={handleAddExpense}
                uniqueCategories={uniqueCategories}
                uniqueKinds={uniqueKinds}
                uniqueCurrencies={uniqueCurrencies}
              />
            </div>
            <button
              className="block md:hidden p-2 bg-white rounded shadow"
              onClick={() => setShowInputForm(true)}
            >
              {/* Hamburger ikon SVG */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* İçerik: Giderler tablosu */}
        <div className="md:flex md:flex-row gap-8">
          {/* Büyük ekranlarda input form zaten üstte gösterildiği için burada sadece tablo */}
          <div className="w-full">
            <ExpensesTableWrapper
              searchQuery={searchQuery}
              data={expensesData}
              startDate={startDate}
              endDate={endDate}
              loading={loading}
              fetchExpenses={fetchExpenses} // Silme sonrası tabloyu güncellemek için
            />
          </div>
        </div>

        {/* Küçük ekranlarda hamburger butona tıklandığında açılan modal */}
        {showInputForm && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-11/12 p-4 rounded shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-700"
                onClick={() => setShowInputForm(false)}
              >
                {/* Kapatma ikonu */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <ExpensesInputForm
                onAddExpense={handleAddExpense}
                uniqueCategories={uniqueCategories}
                uniqueKinds={uniqueKinds}
                uniqueCurrencies={uniqueCurrencies}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
