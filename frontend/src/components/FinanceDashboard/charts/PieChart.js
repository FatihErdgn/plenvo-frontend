import Chart from "react-apexcharts";

const ClinicFinancialsPieChart = ({ view, financialData }) => {
  const currentData = financialData.data[view];

  const options = {
    chart: {
      id: "clinic-financials-pie",
      toolbar: { show: false },
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

  const series = [
    currentData.totalExpense.value,
    currentData.totalIncome.value,
  ];

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", color: "#333", fontSize: "20px", fontWeight: "bold",fontFamily: "Montserrat" }}>
        Poliklinik Gelir ve Gider Dağılımı
      </h2>
      <Chart options={options} series={series} type="pie" height={400} />
    </div>
  );
};

export default ClinicFinancialsPieChart;
