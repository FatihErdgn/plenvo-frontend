// components/Card.jsx

import React from "react";
import Chart from "react-apexcharts";

const Card = ({ title, value, change, trendData }) => {
  // Grafik seçenekleri
  const options = {
    chart: {
      id: `${title}-trend`,
      sparkline: { enabled: true },
      // Küçük ekranlarda daha küçük boyuta inmesi için responsive ayarlar
      responsive: [
        {
          breakpoint: 1024, // 1024px ve altı ekran için
          options: {
            chart: {
              width: "100%",
              height: 60,
            },
          },
        },
        {
          breakpoint: 768, // 768px ve altı ekran için
          options: {
            chart: {
              width: "100%",
              height: 50,
            },
          },
        },
      ],
    },
    colors: [change >= 0 ? "#007E85" : "#FF4560"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: [change >= 0 ? "#00A3A8" : "#FF7F7F"],
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    tooltip: {
      enabled: false, // Tooltip kapalı, sadece trend görüntüleniyor
    },
    xaxis: { categories: [] }, // Sparkline için x ekseni yok
  };

  const series = [
    {
      name: `${title} Trend`,
      data: trendData,
    },
  ];

  return (
    <div
      className="
        bg-white 
        w-full
        max-w-sm 
        md:max-w-md
        h-auto 
        font-montserrat 
        p-6 
        rounded-3xl 
        shadow-md 
        flex 
        flex-col 
        justify-between 
        overflow-hidden   /* İçerikte taşma olmasın */
        m-2
      "
    >
      {/* Kartın üst kısmı */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold text-[#007E85]">{value}</p>
        {change !== null && (
          <p
            className={`text-md ${
              change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {change !== null
              ? change >= 0
                ? `+${change.toFixed(2)}%`
                : `${change.toFixed(2)}%`
              : "N/A"}
          </p>
        )}
      </div>

      {/* Grafik kısmı */}
      <div className="flex-1 flex items-center justify-center">
        {/* width="100%" ve height sabit bir değerden ziyade ApexCharts responsive kullanarak ayarlayacağız */}
        <Chart options={options} series={series} type="area" width="100%" height={70} />
      </div>
    </div>
  );
};

export default Card;
