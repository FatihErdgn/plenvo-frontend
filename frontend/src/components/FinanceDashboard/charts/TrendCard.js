// components/FinanceDashboard/charts/TrendCard.js

import React from "react";
import Chart from "react-apexcharts";

const Card = ({ title, value, change, trendData }) => {
  // Eğer trendData boş veya undefined ise, varsayılan boş dizi kullan
  const safeTrend = trendData || [];
  
  // change değeri undefined ya da null ise 0 kabul edelim
  const safeChange = (change === undefined || change === null) ? 0 : change;
  
  // Eğer kart "Toplam Gider" veya "Hasta Sayısı" ise sabit renk "#F38A84" kullan, 
  // diğer durumlarda change'a göre renk belirleyelim:
  const primaryColor =
    title === "Toplam Gider" || title === "Hasta Sayısı"
      ? "#F38A84"
      : safeChange >= 0
      ? "#007E85"
      : "#FF4560";

  const options = {
    chart: {
      id: `${title}-trend`,
      sparkline: { enabled: true },
      responsive: [
        {
          breakpoint: 1024, // 1024px ve altı
          options: {
            chart: {
              width: "100%",
              height: 60,
            },
          },
        },
        {
          breakpoint: 768, // 768px ve altı (tablet, telefon)
          options: {
            chart: {
              width: "100%",
              height: 50,
            },
          },
        },
      ],
    },
    colors: [primaryColor],
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
        gradientToColors: [primaryColor],
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    tooltip: {
      enabled: false, // Tooltip kapalı, sadece trend görüntüleniyor
    },
    xaxis: { categories: [] }, // Sparkline için x ekseni kullanılmıyor
  };

  const series = [
    {
      name: `${title} Trend`,
      data: safeTrend,
    },
  ];

  return (
    <div className="bg-white w-full max-w-sm md:max-w-md h-auto font-montserrat p-6 rounded-3xl shadow-md flex flex-col justify-between overflow-hidden mb-2">
      {/* Üst Kısım: Başlık ve Değer */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p
          className={`text-3xl font-bold ${
            title === "Toplam Gider" || title === "Hasta Sayısı"
              ? "text-[#F38A84]"
              : "text-[#007E85]"
          }`}
        >
          {value}
        </p>
        {/* İsteğe bağlı olarak change bilgisini de ekleyebilirsiniz */}
      </div>
      {/* Alt Kısım: Sparkline Trend Grafiği */}
      <div className="flex-1 flex items-center justify-center">
        <Chart options={options} series={series} type="area" width="100%" height={70} />
      </div>
    </div>
  );
};

export default Card;
