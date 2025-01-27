// pages/FinancialDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ClinicFinancialsChart from "../components/ClinicFinancialsChart";
import ClinicFinancialsPieChart from "../components/ClinicFinancialsPieChart";
import Card from "../components/Card";

const FinancialDashboard = () => {
  const [view, setView] = useState("weekly"); // "daily", "weekly", "monthly", "yearly" vs.
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
  });
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API'den veriyi çekme
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/dashboard", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          interval: view,
        },
      });
      setFinancialData(res.data);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Finansal veriler alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    // view veya dateRange değiştiğinde yeniden istek at
  }, [view, dateRange]);

  // Örnek: UI'da basit butonlarla "weekly"/"monthly"/"yearly" seçtiriyoruz:
  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setView("daily")}
          className={`px-4 py-2 rounded ${
            view === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setView("weekly")}
          className={`px-4 py-2 rounded ${
            view === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`px-4 py-2 rounded ${
            view === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setView("yearly")}
          className={`px-4 py-2 rounded ${
            view === "yearly" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
          }
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
          }
          className="p-2 border rounded"
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Chartları ancak financialData geldiyse göster */}
      {financialData && financialData.data && financialData.data[view] && (
        <>
          <ClinicFinancialsChart view={view} financialData={financialData} />
          <ClinicFinancialsPieChart view={view} financialData={financialData} />

          {/* Card örnekleri -> totalIncome, totalExpense, profitability, patientCount */}
          <div className="flex flex-wrap">
            <Card
              title="Gelir"
              value={`${financialData.data[view].totalIncome.value.toLocaleString()} TL`}
              change={financialData.data[view].totalIncome.change}
              trendData={financialData.data[view].totalIncome.trend}
            />
            <Card
              title="Gider"
              value={`${financialData.data[view].totalExpense.value.toLocaleString()} TL`}
              change={financialData.data[view].totalExpense.change}
              trendData={financialData.data[view].totalExpense.trend}
            />
            <Card
              title="Kârlılık"
              value={`${financialData.data[view].profitability.value.toLocaleString()} TL`}
              change={financialData.data[view].profitability.change}
              trendData={financialData.data[view].profitability.trend}
            />
            <Card
              title="Hasta Sayısı"
              value={`${financialData.data[view].patientCount.value}`}
              change={financialData.data[view].patientCount.change}
              trendData={financialData.data[view].patientCount.trend}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialDashboard;
