import Chart from "react-apexcharts";

const ClinicFinancialsChart = ({ view, financialData }) => {
  const currentData = financialData.data[view];

  const options = {
    chart: {
      id: "clinic-financials",
      toolbar: { show: false },
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
          ? [
              "Pazartesi",
              "Salı",
              "Çarşamba",
              "Perşembe",
              "Cuma",
              "Cumartesi",
              "Pazar",
            ]
          : view === "monthly"
          ? ["1. Hafta", "2. Hafta", "3. Hafta", "4. Hafta"]
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          fontSize: "20px",
          fontWeight: "bold",
          fontFamily: "Montserrat",
        }}
      >
        Poliklinik Maliyet ve Kazanç Grafiği
      </h2>
      <Chart options={options} series={series} type="bar" height={450} />
    </div>
  );
};

export default ClinicFinancialsChart;
