import React from "react";
import Chart from "react-apexcharts";

const ClinicFinancialsPieChart = ({ view, financialData }) => {
  const currentData = financialData.data[view];

  const options = {
    chart: {
      id: "clinic-financials-pie",
      toolbar: { show: false },
      // Responsive ayarlar
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              width: "100%",
              height: 300, // Laptop ve daha küçük ekranlarda 300px'e düş
            },
          },
        },
        {
          breakpoint: 768,
          options: {
            chart: {
              width: "100%",
              height: 250, // Tablet ve daha küçük ekranlarda 250px'e düş
            },
          },
        },
      ],
    },
    labels: ["Maliyet", "Kazanç"],
    colors: ["#F38A84", "#00A3A8"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()} TL`,
      },
    },
  };

  const series = [currentData.totalExpense.value, currentData.totalIncome.value];

  return (
    <div 
      className="
        max-w-xl
        w-full
        mx-auto
        p-5
        overflow-hidden  /* Grafik taşmasını önler */
      "
    >
      <h2
        className="
          text-center 
          text-[#333] 
          text-lg 
          sm:text-xl 
          font-bold 
          font-montserrat 
          mb-4
        "
      >
        Poliklinik Gelir ve Gider Dağılımı
      </h2>
      {/* width="100%" / height={400}: Temel değer, responsive ile override edilebilir */}
      <Chart options={options} series={series} type="pie" width="100%" height={400} />
    </div>
  );
};

export default ClinicFinancialsPieChart;
