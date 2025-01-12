import React from "react";
import Chart from "react-apexcharts";

const Card = ({ title, value, change, trendData }) => {
  // Grafik seçenekleri
  const options = {
    chart: {
      id: `${title}-trend`,
      sparkline: { enabled: true },
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
    <div className="bg-white h-[20vh] w-[40vh] font-montserrat p-6 rounded-3xl shadow-md flex flex-col justify-between">
      {/* Kartın üst kısmı */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold text-[#007E85]">{value}</p>
        <p
          className={`text-md ${
            change >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {change >= 0 ? `+${change}%` : `${change}%`}
        </p>
      </div>

      {/* Grafik kısmı */}
      <div className="flex-1 flex items-center justify-center">
        <Chart options={options} series={series} type="area" height={70} />
      </div>
    </div>
  );
};

export default Card;
