// pages/FinanceDashboard.js

import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { getDashboardData } from "../services/dashboardService";
import Card from "../components/FinanceDashboard/charts/TrendCard";
import ClinicFinancialsChart from "../components/FinanceDashboard/charts/BarChart";
import ClinicFinancialsPieChart from "../components/FinanceDashboard/charts/PieChart";

// Renk paletimiz (pie chart'ta kullanılan renkler)
const palette = ["#00A3A8", "#F38A84", "#FFB400", "#007E85", "#FF4560"];

export default function FinanceDashboard() {
  // Varsayılan: Son 7 gün
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData({ startDate, endDate });
      if (response.status === "success") {
        // Backend yanıtı: { status, updatedAt, data: { summary, trend, breakdown } }
        setDashboardData(response.data);
        console.log("Dashboard verileri alındı:", response.data);
      } else {
        console.error("Dashboard verileri alınırken bir hata oluştu:", response);
      }
    } catch (error) {
      console.error("Dashboard verileri alınırken bir hata oluştu:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [startDate, endDate]);

  if (loading) {
    return <div className="p-8 text-center text-xl">Dashboard yükleniyor...</div>;
  }
  if (!dashboardData) {
    return <div className="p-8 text-center text-xl">Dashboard verisi bulunamadı.</div>;
  }

  const { summary, trend, breakdown } = dashboardData;

  // --- Line Chart (Günlük Trend) ---
  const lineChartOptions = {
    chart: { id: "trend-line-chart", background: "#fff" },
    xaxis: {
      categories: trend.dates,
      labels: { style: { fontSize: "14px", color: "#555" } },
    },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} TL` } },
    colors: palette.slice(0, 3), // İlk 3 rengi kullanıyoruz
    grid: { borderColor: "#e0e0e0" },
  };
  const lineChartSeries = [
    { name: "Gelir", data: trend.income },
    { name: "Gider", data: trend.expense },
    { name: "Kâr", data: trend.profit },
  ];

  // --- Pie Chart: Gelir Breakdown ---
  const incomePieOptions = {
    labels: breakdown.incomeMethods.map(item => item.method),
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} TL` } },
    colors: palette, // Paletimizin tamamını kullanabilirsiniz
    legend: { position: "bottom", fontSize: "14px" },
  };
  const incomePieSeries = breakdown.incomeMethods.map(item => item.amount);

  // --- Pie Chart: Gider Breakdown ---
  const expensePieOptions = {
    labels: breakdown.expenseDescriptions.map(item => item.description),
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} TL` } },
    colors: palette, // Aynı paleti kullanıyoruz
    legend: { position: "bottom", fontSize: "14px" },
  };
  const expensePieSeries = breakdown.expenseDescriptions.map(item => item.amount);

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fe] p-6 w-screen rounded-l-[2.5rem] relative z-20">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Finansal Dashboard</h1>
          <p className="text-lg text-gray-600">Finansal özet ve günlük trendler</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-md shadow-sm"
            />
          </div>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-[#007E85] text-white rounded-md shadow hover:bg-[#00A3A8]"
          >
            Verileri Getir
          </button>
        </div>
      </header>

      {/* Ana İçerik: Sol (%65) ve Sağ (%35) Bölümleri */}
      <div className="flex h-[calc(100%-7.5rem)] overflow-hidden">
        {/* Sol Bölüm (yaklaşık %65) */}
        <div className="w-2/3 overflow-y-auto">
          {/* Özet Kartlar: 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <Card
              title="Toplam Gelir"
              value={`${summary.totalIncome.toLocaleString()} TL`}
              change={summary.incomeChange}
              trendData={trend.income}
            />
            <Card
              title="Toplam Gider"
              value={`${summary.totalExpense.toLocaleString()} TL`}
              change={summary.expenseChange}
              trendData={trend.expense}
            />
            <Card
              title="Kâr"
              value={`${summary.profit.toLocaleString()} TL`}
              change={summary.profitChange}
              trendData={trend.profit}
            />
            <Card
              title="Hasta Sayısı"
              value={summary.patientCount}
              change={summary.patientChange}
              trendData={trend.patientCount}
            />
          </div>
          {/* Trend Line Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Günlük Trend</h2>
            <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={255} />
          </div>
        </div>

        {/* Sağ Bölüm (yaklaşık %35) */}
        <div className="w-1/3 pl-4 flex flex-col gap-4 overflow-y-auto h-full">
          <div className="bg-white p-6 rounded-3xl shadow-lg flex-1 h-[calc(50%-8px)]">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gelir Dağılımı</h2>
            {incomePieSeries.length > 0 ? (
              <Chart options={incomePieOptions} series={incomePieSeries} type="pie" height={270} />
            ) : (
              <p className="text-center text-gray-500">Veri Yok</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg flex-1 h-[calc(50%-8px)]">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gider Dağılımı</h2>
            {expensePieSeries.length > 0 ? (
              <Chart options={expensePieOptions} series={expensePieSeries} type="pie" height={270} />
            ) : (
              <p className="text-center text-gray-500">Veri Yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
