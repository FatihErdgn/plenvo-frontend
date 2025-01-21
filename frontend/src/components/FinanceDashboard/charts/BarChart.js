import React from "react";
import Chart from "react-apexcharts";

const ClinicFinancialsChart = ({ view, financialData }) => {
  const currentData = financialData.data[view];

  const options = {
    chart: {
      id: "clinic-financials",
      toolbar: { show: false },
      // Ekran boyutuna göre height'i otomatik küçültmek için responsive ayarları
      responsive: [
        {
          breakpoint: 1024, // 1024px ve altı
          options: {
            chart: {
              width: "100%",
              height: 350, // Laptop ve daha küçük ekranlarda yüksekliği 350 yap
            },
            legend: {
              position: "bottom", // Legend'ı üstten alta alarak dikey alanı daralt
            },
            xaxis: {
              // Eksen yazıları büyükse küçültebilirsiniz
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
          breakpoint: 768, // 768px ve altı (tablet, telefon)
          options: {
            chart: {
              width: "100%",
              height: 300, // Daha küçük ekranlarda 300px
            },
            legend: {
              position: "bottom",
            },
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
      categories:
        view === "weekly"
          ? ["Paz", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"] // Çok uzun yazıları kısaltabilirsiniz
          : view === "monthly"
          ? ["1. H", "2. H", "3. H", "4. H"]
          : [
              "Ocak",
              "Şubat",
              "Mart",
              "Nisan",
              "Mayıs",
              "Haziran",
              "Temmuz",
              "Ağustos",
              "Eylül",
              "Ekim",
              "Kasım",
              "Aralık",
            ],
      title: {
        text:
          view === "weekly"
            ? "Haftanın Günleri"
            : view === "monthly"
            ? "Haftalar"
            : "Aylar",
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
      y: {
        formatter: (value) => `${value.toLocaleString()} TL`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Maliyet",
      data: currentData.totalExpense.trend,
    },
    {
      name: "Kazanç",
      data: currentData.totalIncome.trend,
    },
  ];

  return (
    <div
      className="
        max-w-[1000px] 
        w-full 
        mx-auto 
        px-5 
        py-5
        overflow-hidden 
      "
    >
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
      {/* 
        Varsayılan olarak height={400} veya 450 kullanabilirsiniz.
        Farklı breakpoint’lerde apex ‘responsive’ ayarları bunu override edecek.
      */}
      <Chart 
        options={options} 
        series={series} 
        type="bar" 
        width="100%" 
        height={400} 
      />
    </div>
  );
};

export default ClinicFinancialsChart;
