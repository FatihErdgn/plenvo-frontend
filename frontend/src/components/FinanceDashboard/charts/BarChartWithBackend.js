// components/ClinicFinancialsChart.jsx

import React from "react";
import Chart from "react-apexcharts";

/**
 * Bu bileşen:
 * - "view" -> "daily", "weekly", "monthly", "yearly" vb.
 * - "financialData" -> backend'den gelen JSON obje
 * 
 * Dinamik xAxis + tooltip içinde description listesini gösterir.
 */
const ClinicFinancialsChart = ({ view, financialData }) => {
  const currentData = financialData.data[view];

  // 1) Gelir (Income) verileri
  const incomeDates = currentData.totalIncome.trendDates;   // ["2025-01-01", "2025-01-02", ...]
  const incomeValues = currentData.totalIncome.trend;       // [5000, 3000, ...]
  const incomeDescs  = currentData.totalIncome.trendDesc;   // [["Ödeme A","Ödeme B"], ["Ödeme C"], ...]

  // 2) Gider (Expense) verileri
  const expenseDates = currentData.totalExpense.trendDates;
  const expenseValues = currentData.totalExpense.trend;
  const expenseDescs = currentData.totalExpense.trendDesc;  // [["Kira","Elektrik"], ... ]

  // 3) Ortak xAxis oluşturmak için
  const allDatesSet = new Set([...incomeDates, ...expenseDates]);
  const allDates = Array.from(allDatesSet).sort(); 
  // ["2025-01-01","2025-01-02","2025-01-03", ...]

  // 4) Map => tarih -> { value, desc[] }
  // Gelir
  const incomeMap = {};
  incomeDates.forEach((dateStr, i) => {
    incomeMap[dateStr] = {
      value: incomeValues[i],
      desc: incomeDescs[i], // array of descriptions
    };
  });
  // Gider
  const expenseMap = {};
  expenseDates.forEach((dateStr, i) => {
    expenseMap[dateStr] = {
      value: expenseValues[i],
      desc: expenseDescs[i],
    };
  });

  // 5) Her tarih için data dizileri oluştur
  const mergedIncomeData = allDates.map((d) => {
    if (incomeMap[d]) {
      return {
        y: incomeMap[d].value || 0,
        desc: incomeMap[d].desc || [],
      };
    } else {
      // O gün income yok
      return { y: 0, desc: [] };
    }
  });

  const mergedExpenseData = allDates.map((d) => {
    if (expenseMap[d]) {
      return {
        y: expenseMap[d].value || 0,
        desc: expenseMap[d].desc || [],
      };
    } else {
      // O gün expense yok
      return { y: 0, desc: [] };
    }
  });

  // 6) ApexCharts options
  const options = {
    chart: {
      id: "clinic-financials",
      toolbar: { show: false },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: "100%", height: 350 },
            legend: { position: "bottom" },
            xaxis: {
              labels: {
                style: {
                  fontSize: "12px",
                },
              },
            },
            dataLabels: {
              style: {
                fontSize: "11px",
              },
            },
          },
        },
        {
          breakpoint: 768,
          options: {
            chart: { width: "100%", height: 300 },
            legend: { position: "bottom" },
            xaxis: {
              labels: {
                style: {
                  fontSize: "10px",
                },
              },
            },
            dataLabels: {
              style: {
                fontSize: "10px",
              },
            },
          },
        },
      ],
    },
    colors: ["#F38A84", "#00A3A8"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ["#FFFFFF"],
        fontSize: "12px", // Varsayılan font boyutu (daha büyük ekranlar)
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: allDates, // <-- dinamik tarih etiketleri
      title: {
        text: "Tarih",
        style: {
          color: "#777",
          fontSize: "14px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Miktar (TL)",
        style: {
          color: "#777",
          fontSize: "14px",
        },
      },
    },
    fill: {
      opacity: 0.9,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        // seriesIndex => 0 (Maliyet), 1 (Kazanç)
        // dataPointIndex => x eksenindeki index
        const dataArr = w.config.series[seriesIndex].data; 
        // dataArr => mergedExpenseData veya mergedIncomeData
        const pointData = dataArr[dataPointIndex];
        // pointData = { y: 5000, desc: ["Ödeme A", "Ödeme B"] }

        const val = pointData.y.toLocaleString(); // rakam
        const descList = pointData.desc; // array of strings

        // Tooltip başlığı
        const seriesName = w.config.series[seriesIndex].name; // "Maliyet" / "Kazanç"
        const dateLabel = w.globals.categoryLabels[dataPointIndex]; // allDates[dataPointIndex]

        // Description'ları alt alta veya virgüllü gösterebiliriz
        // <ul><li>Ödeme A</li><li>Ödeme B</li></ul> vs.
        const descHtml = descList.length
          ? `<ul style="margin:5px 0;padding-left:15px; list-style-type: disc;">${descList
              .map((d) => `<li>${d}</li>`)
              .join("")}</ul>`
          : `<i style="color:#999">Açıklama yok</i>`;

        return `
          <div style="padding:10px;">
            <div><strong>${dateLabel}</strong></div>
            <div><strong>${seriesName}:</strong> ${val} TL</div>
            <div><strong>Kalemler:</strong></div>
            ${descHtml}
          </div>
        `;
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  // 7) Series
  // ApexCharts'e data dizisi olarak "y" ve "desc" ekledik
  const series = [
    {
      name: "Maliyet",
      data: mergedExpenseData, // [ {y: x, desc: [...]}, {y: x, desc: [...]}, ... ]
    },
    {
      name: "Kazanç",
      data: mergedIncomeData,
    },
  ];

  return (
    <div className="max-w-[1000px] w-full mx-auto px-5 py-5 overflow-hidden">
      <h2
        className="
          text-center 
          text-[#333] 
          font-bold 
          font-montserrat 
          mb-4 
          text-lg 
          sm:text-xl
        "
      >
        Poliklinik Maliyet ve Kazanç Grafiği
      </h2>
      <Chart options={options} series={series} type="bar" width="100%" height={400} />
    </div>
  );
};

export default ClinicFinancialsChart;
