import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { getDashboardData } from "../services/dashboardService";
import { getUsers, getProfile } from "../services/userService";
import Card from "../components/FinanceDashboard/charts/TrendCard";
import { FaCalendarAlt, FaFilter, FaChartLine, FaMoneyBillWave, FaUserMd } from "react-icons/fa";

// Modern renk paleti
const palette = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#EC4899"];

export default function FinanceDashboard() {
  // Tarih seçimleri
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Ayın 1'i olarak ayarla
    return d.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1); // Bir sonraki ay
    d.setDate(1); // Ayın 1'i olarak ayarla
    return d.toISOString().split("T")[0];
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Giriş yapan kullanıcı bilgisi ve doktor listesi
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  // Dashboard verilerini çeken fonksiyon
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      // Eğer kullanıcı admin, superadmin ya da manager ise ve doktor seçildiyse query parametresine ekle
      if (
        loggedInUser &&
        ["admin", "superadmin", "manager"].includes(
          loggedInUser.roleId?.roleName
        )
      ) {
        if (selectedDoctor) {
          params.doctorId = selectedDoctor;
        }
      }
      const response = await getDashboardData(params);
      if (response.status === "success") {
        setDashboardData(response.data);
      } else {
        console.error("Dashboard verileri alınırken hata oluştu:", response);
      }
    } catch (error) {
      console.error("Dashboard verileri alınırken hata oluştu:", error);
    }
    setLoading(false);
  };

  // Kullanıcı profil bilgisini al
  const fetchUserProfile = async () => {
    try {
      const response = await getProfile();
      if (response.success) {
        setLoggedInUser(response.user);
      }
    } catch (error) {
      console.error("Profil bilgisi alınırken hata oluştu:", error);
    }
  };

  // Sadece doktor rolündeki kullanıcıları getir
  const fetchDoctorList = async () => {
    try {
      const response = await getUsers();
      if (response.success && Array.isArray(response.data)) {
        // Doktor rolü için roleId.populate edilmiş roleName üzerinden filtreleme
        const doctors = response.data.filter(
          (user) => user.roleId?.roleName === "doctor" || user.roleId?.roleName === "admin"
        );
        setDoctorList(doctors);
      }
    } catch (error) {
      console.error("Doktor listesi alınırken hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Eğer admin/superadmin/manager ise doktor listesini getir
  useEffect(() => {
    if (
      loggedInUser &&
      ["admin", "superadmin", "manager"].includes(loggedInUser.roleId?.roleName)
    ) {
      fetchDoctorList();
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      fetchDashboard();
    }
  }, [startDate, endDate, selectedDoctor, loggedInUser]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xl">Dashboard yükleniyor...</div>
    );
  }
  if (!dashboardData) {
    return (
      <div className="p-8 text-center text-xl">
        Dashboard verisi bulunamadı.
      </div>
    );
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
    colors: palette.slice(0, 3),
    grid: { borderColor: "#e0e0e0" },
  };
  const lineChartSeries = [
    { name: "Gelir", data: trend.income },
    { name: "Gider", data: trend.expense },
    { name: "Kâr", data: trend.profit },
  ];

  // --- Pie Chart: Gelir Breakdown ---
  const incomePieOptions = {
    labels: breakdown.incomeMethods.map((item) => item.method),
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} TL` } },
    colors: palette,
    legend: { position: "bottom", fontSize: "14px" },
  };
  const incomePieSeries = breakdown.incomeMethods.map((item) => item.amount);

  // --- Pie Chart: Gider Breakdown ---
  const expensePieOptions = {
    labels: breakdown.expenseDescriptions.map((item) => item.description),
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} TL` } },
    colors: palette,
    legend: { position: "bottom", fontSize: "14px" },
  };
  const expensePieSeries = breakdown.expenseDescriptions.map(
    (item) => item.amount
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fe] w-screen rounded-l-[2.5rem] relative z-20 flex flex-col">
      {/* Başlık Bölümü - Daha kısa ve sıkı */}
      <div className="p-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Finansal Dashboard</h1>
            <p className="text-md text-gray-600">Klinik finansal performans analizi</p>
        </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 rounded-md p-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            <div className="flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 rounded-md p-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            
          {loggedInUser &&
            ["admin", "superadmin", "manager"].includes(
              loggedInUser.roleId?.roleName
            ) && (
                <div className="flex items-center gap-1">
                  <FaUserMd className="text-gray-400" />
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="bg-gray-50 rounded-md p-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Klinik</option>
                  {doctorList.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
          <button
            onClick={fetchDashboard}
              className="px-3 py-1.5 bg-[#007E85] text-white rounded-md shadow hover:bg-[#00A3A8] transition-colors flex items-center gap-1"
          >
              <FaFilter />
              Uygula
          </button>
          </div>
        </div>
      </div>

      {/* Ana İçerik - Flex yapı */}
      <div className="flex-1 overflow-hidden px-4 pb-4 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
          </div>
        ) : !dashboardData ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm p-8 text-center flex items-center justify-center">
            <div>
              <div className="text-gray-500 text-xl">Veri bulunamadı</div>
              <p className="mt-2 text-gray-400">Lütfen tarih aralığını değiştirin veya filtrelerinizi kontrol edin.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Ana Metriks Kartları - Hover efektli */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-base font-medium">Toplam Gelir</p>
                    <h3 className="text-2xl font-bold text-gray-800">{summary.totalIncome.toLocaleString()} ₺</h3>
                  </div>
                  <div className={`flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${summary.incomeChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {summary.incomeChange !== null ? 
                      `${summary.incomeChange >= 0 ? '+' : ''}${summary.incomeChange.toFixed(1)}%` : 
                      '0%'}
                  </div>
                </div>
                <div className="mt-2 h-8">
                  <Chart
                    options={{
                      chart: {id: 'income-spark', sparkline: {enabled: true}},
                      stroke: {width: 2, curve: 'smooth'},
                      colors: ['#10B981'],
                      tooltip: {enabled: false}
                    }}
                    series={[{data: trend.income}]}
                    type="line"
                    height={32}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-base font-medium">Toplam Gider</p>
                    <h3 className="text-2xl font-bold text-gray-800">{summary.totalExpense.toLocaleString()} ₺</h3>
                  </div>
                  <div className={`flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${summary.expenseChange <= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {summary.expenseChange !== null ? 
                      `${summary.expenseChange >= 0 ? '+' : ''}${summary.expenseChange.toFixed(1)}%` : 
                      '0%'}
                  </div>
                </div>
                <div className="mt-2 h-8">
                  <Chart
                    options={{
                      chart: {id: 'expense-spark', sparkline: {enabled: true}},
                      stroke: {width: 2, curve: 'smooth'},
                      colors: ['#F59E0B'],
                      tooltip: {enabled: false}
                    }}
                    series={[{data: trend.expense}]}
                    type="line"
                    height={32}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-base font-medium">
                      {selectedDoctor ? "Danışmana Ödenecek" : "Toplam Kâr"}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">{summary.profit.toLocaleString()} ₺</h3>
                  </div>
                  <div className={`flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${summary.profitChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {summary.profitChange !== null ? 
                      `${summary.profitChange >= 0 ? '+' : ''}${summary.profitChange.toFixed(1)}%` : 
                      '0%'}
                  </div>
                </div>
                <div className="mt-2 h-8">
                  <Chart
                    options={{
                      chart: {id: 'profit-spark', sparkline: {enabled: true}},
                      stroke: {width: 2, curve: 'smooth'},
                      colors: ['#6366F1'],
                      tooltip: {enabled: false}
                    }}
                    series={[{data: trend.profit}]}
                    type="line"
                    height={32}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-base font-medium">Hasta Sayısı</p>
                    <h3 className="text-2xl font-bold text-gray-800">{summary.patientCount}</h3>
                  </div>
                  <div className={`flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${summary.patientChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {summary.patientChange !== null ? 
                      `${summary.patientChange >= 0 ? '+' : ''}${summary.patientChange.toFixed(1)}%` : 
                      '0%'}
                  </div>
                </div>
                <div className="mt-2 h-8">
                  <Chart
                    options={{
                      chart: {id: 'patient-spark', sparkline: {enabled: true}},
                      stroke: {width: 2, curve: 'smooth'},
                      colors: ['#EC4899'],
                      tooltip: {enabled: false}
                    }}
                    series={[{data: trend.patientCount}]}
                    type="line"
                    height={32}
            />
          </div>
              </div>
            </div>
            
            {/* Ana grafikler - Flexible layout */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
              {/* Sol bölüm - Ana grafikler */}
              <div className="col-span-8 grid grid-rows-2 gap-3 min-h-0">
                {/* Trend Grafiği - Hover efektli */}
                <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-1">
                      <FaChartLine className="text-blue-600" /> Finansal Trend Analizi
            </h2>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span><span className="text-xs text-gray-500">Gelir</span></div>
                      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"></span><span className="text-xs text-gray-500">Gider</span></div>
                      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span><span className="text-xs text-gray-500">Kâr</span></div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
            <Chart
                      options={{
                        chart: { 
                          id: "trend-line-chart", 
                          toolbar: { show: false }, 
                          fontFamily: "Inter, sans-serif", 
                          background: "transparent",
                          animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                          }
                        },
                        xaxis: {
                          categories: trend.dates,
                          labels: { style: { fontSize: "10px", colors: "#6B7280" } },
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        yaxis: {
                          labels: { 
                            style: { fontSize: "10px", colors: "#6B7280" },
                            formatter: (value) => `${value.toLocaleString()} ₺`
                          },
                        },
                        stroke: { curve: "smooth", width: 2 },
                        markers: { size: 0, hover: { size: 3 } },
                        dataLabels: { enabled: false },
                        tooltip: { y: { formatter: (val) => `${val.toLocaleString()} ₺` } },
                        colors: ["#3B82F6", "#F59E0B", "#6366F1"],
                        grid: { borderColor: "#F3F4F6", row: { colors: ["transparent", "transparent"] } },
                        legend: { show: false },
                        theme: { mode: "light" },
                        responsive: [{
                          breakpoint: 1000,
                          options: {
                            chart: {
                              height: '100%'
                            }
                          }
                        }]
                      }}
                      series={[
                        { name: "Gelir", data: trend.income },
                        { name: "Gider", data: trend.expense },
                        { name: "Kâr", data: trend.profit },
                      ]}
              type="line"
                      width="100%"
                      height="100%"
            />
          </div>
        </div>

                {/* Hizmet Bazlı Gelir Analizi - Dropdown kaldırıldı */}
                <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <div className="mb-1">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-1">
                      <FaMoneyBillWave className="text-indigo-600" /> Hizmet Bazlı Gelir Analizi
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {breakdown.incomeMethods && breakdown.incomeMethods.length > 0 ? (
                      <div className="flex-1 overflow-auto">
                        <Chart
                          options={{
                            chart: {
                              type: 'bar',
                              toolbar: { show: false },
                              fontFamily: "Inter, sans-serif",
                              background: "transparent",
                              stacked: false,
                              animations: {
                                enabled: true,
                                easing: 'easeinout',
                                speed: 500,
                                animateGradually: {
                                  enabled: true,
                                  delay: 150
                                },
                                dynamicAnimation: {
                                  enabled: true,
                                  speed: 350
                                }
                              }
                            },
                            plotOptions: {
                              bar: {
                                horizontal: true,
                                borderRadius: 4,
                                barHeight: '70%',
                                dataLabels: {
                                  position: 'top',
                                },
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toLocaleString() + ' ₺';
                              },
                              style: {
                                fontSize: '10px',
                                colors: ['#333']
                              },
                              offsetX: 20
                            },
                            xaxis: {
                              categories: breakdown.incomeMethods.map(item => item.method),
                              labels: {
                                style: { fontSize: "10px", colors: "#6B7280" },
                                formatter: (value) => `${value.toLocaleString()} ₺`
                              },
                              axisBorder: { show: false },
                              axisTicks: { show: false },
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: "10px", colors: "#6B7280" }
                              }
                            },
                            colors: ["#3B82F6"],
                            tooltip: {
                              y: {
                                formatter: (val) => `${val.toLocaleString()} ₺`
                              }
                            },
                            grid: {
                              borderColor: "#F3F4F6",
                              xaxis: {
                                lines: {
                                  show: true
                                }
                              },
                              yaxis: {
                                lines: {
                                  show: false
                                }
                              },
                            },
                            // Ortalama hasta değeri bilgisi
                            annotations: breakdown.incomeMethods.length <= 4 ? {
                              points: breakdown.incomeMethods.map((item, index) => ({
                                x: item.amount,
                                y: item.method,
                                marker: {
                                  size: 4,
                                  fillColor: '#10B981',
                                  strokeColor: '#fff',
                                  strokeWidth: 1,
                                  radius: 2,
                                },
                                label: {
                                  text: `Ort. ${Math.round(item.paymentCount > 0 ? (item.amount / item.paymentCount) : 0).toLocaleString()} ₺/İşlem`,
                                  borderColor: '#10B981',
                                  offsetY: 0,
                                  style: {
                                    color: '#fff',
                                    background: '#10B981',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: {
                                      left: 5,
                                      right: 5,
                                      top: 2,
                                      bottom: 2
                                    },
                                    borderRadius: 2
                                  }
                                }
                              }))
                            } : {}
                          }}
                          series={[{
                            name: "Gelir",
                            data: breakdown.incomeMethods.map(item => item.amount)
                          }]}
                          type="bar"
                          width="100%"
                          height={breakdown.incomeMethods.length * 40 + 40}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Bu tarih aralığında veri bulunmamaktadır.</p>
                      </div>
                    )}

                    {/* Küçük özet bilgiler */}
                    <div className="grid grid-cols-4 gap-2 mt-1 text-center flex-shrink-0">
                      <div className="bg-blue-50 rounded-lg p-1 hover:bg-blue-100 transition-colors">
                        <p className="text-[10px] text-blue-700 font-semibold">En Yüksek Gelir</p>
                        <p className="text-xs font-bold truncate">
                          {breakdown.incomeMethods.length > 0 ? 
                            breakdown.incomeMethods.sort((a, b) => b.amount - a.amount)[0].method : "-"}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-1 hover:bg-green-100 transition-colors">
                        <p className="text-[10px] text-green-700 font-semibold">Ort. Hasta Geliri</p>
                        <p className="text-xs font-bold">
                          {summary.patientCount > 0 ? 
                            Math.round(summary.totalIncome / summary.patientCount).toLocaleString() + " ₺" : "-"}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-1 hover:bg-purple-100 transition-colors">
                        <p className="text-[10px] text-purple-700 font-semibold">Gelir Çeşidi</p>
                        <p className="text-xs font-bold">{breakdown.incomeMethods.length}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-1 hover:bg-yellow-100 transition-colors">
                        <p className="text-[10px] text-yellow-700 font-semibold">Toplam Gelir</p>
                        <p className="text-xs font-bold">{summary.totalIncome.toLocaleString()} ₺</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sağ bölüm - pie chartlar */}
              <div className="col-span-4 grid grid-rows-2 gap-3 min-h-0">
                {/* Gelir Dağılımı - Hover efektli */}
                <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-1">
                    <FaMoneyBillWave className="text-green-600" /> Gelir Dağılımı
            </h2>
                  
                  <div className="flex-1 min-h-0">
            {incomePieSeries.length > 0 ? (
              <Chart
                        options={{
                          labels: breakdown.incomeMethods.map((item) => item.method),
                          tooltip: { y: { formatter: (val) => `${val.toLocaleString()} ₺` } },
                          colors: palette,
                          legend: { 
                            position: "bottom",
                            fontSize: "9px", 
                            offsetY: 0, 
                            itemMargin: { horizontal: 5, vertical: 2 },
                            formatter: function(seriesName, opts) {
                              return seriesName.length > 15 ? seriesName.substring(0, 12) + '...' : seriesName;
                            }
                          },
                          stroke: { width: 0 },
                          dataLabels: { 
                            enabled: true, 
                            style: { fontSize: '9px', fontWeight: 'bold' },
                            formatter: (val) => Math.round(val) + '%'
                          },
                          plotOptions: {
                            pie: {
                              donut: {
                                size: '55%',
                                labels: {
                                  show: true,
                                  name: { show: true, fontSize: '9px' },
                                  value: {
                                    show: true,
                                    fontSize: '11px',
                                    formatter: (val) => `${parseInt(val).toLocaleString()} ₺`
                                  },
                                  total: {
                                    show: true,
                                    fontSize: '11px',
                                    formatter: () => `${summary.totalIncome.toLocaleString()} ₺`
                                  }
                                }
                              }
                            }
                          },
                          chart: {
                            animations: {
                              enabled: true,
                              easing: 'easeinout',
                              speed: 800,
                              animateGradually: {
                                enabled: true,
                                delay: 150
                              }
                            }
                          },
                          responsive: [{
                            breakpoint: 1000,
                            options: {
                              chart: {
                                height: '100%'
                              }
                            }
                          }]
                        }}
                series={incomePieSeries}
                        type="donut"
                        width="100%"
                        height="100%"
              />
            ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Bu tarih aralığında veri bulunmamaktadır.</p>
                      </div>
            )}
          </div>
                </div>
                
                {/* Gider Dağılımı - Hover efektli */}
                <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-1">
                    <FaMoneyBillWave className="text-yellow-600" /> Gider Dağılımı
            </h2>
                  
                  <div className="flex-1 min-h-0">
            {expensePieSeries.length > 0 ? (
              <Chart
                        options={{
                          labels: breakdown.expenseDescriptions.map((item) => item.description),
                          tooltip: { y: { formatter: (val) => `${val.toLocaleString()} ₺` } },
                          colors: palette,
                          legend: { 
                            position: "bottom", 
                            fontSize: "9px", 
                            offsetY: 0, 
                            itemMargin: { horizontal: 5, vertical: 2 },
                            formatter: function(seriesName, opts) {
                              return seriesName.length > 15 ? seriesName.substring(0, 12) + '...' : seriesName;
                            }
                          },
                          stroke: { width: 0 },
                          dataLabels: { 
                            enabled: true, 
                            style: { fontSize: '9px', fontWeight: 'bold' },
                            formatter: (val) => Math.round(val) + '%'
                          },
                          plotOptions: {
                            pie: {
                              donut: {
                                size: '55%',
                                labels: {
                                  show: true,
                                  name: { show: true, fontSize: '9px' },
                                  value: {
                                    show: true,
                                    fontSize: '11px',
                                    formatter: (val) => `${parseInt(val).toLocaleString()} ₺`
                                  },
                                  total: {
                                    show: true,
                                    fontSize: '11px',
                                    formatter: () => `${summary.totalExpense.toLocaleString()} ₺`
                                  }
                                }
                              }
                            }
                          },
                          chart: {
                            animations: {
                              enabled: true,
                              easing: 'easeinout',
                              speed: 800,
                              animateGradually: {
                                enabled: true,
                                delay: 150
                              }
                            }
                          },
                          responsive: [{
                            breakpoint: 1000,
                            options: {
                              chart: {
                                height: '100%'
                              }
                            }
                          }]
                        }}
                series={expensePieSeries}
                        type="donut"
                        width="100%"
                        height="100%"
              />
            ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Bu tarih aralığında veri bulunmamaktadır.</p>
                      </div>
            )}
          </div>
        </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
