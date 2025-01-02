import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChartComponent({ data }) {
  const labels = data.map(item => item.label);
  const values = data.map(item => item.value);
  const currencies = data.map(item => item.curr);

  // Pastel ve canlı renklerin dengeli bir karışımı
  const colors = [
    '#007E85', // Ana renk
    '#FFB3BA', // Pastel kırmızı
    '#FFDFBA', // Pastel turuncu
    '#FFFFBA', // Pastel sarı
    '#BAE1FF', // Pastel mavi
    '#B3E5FC', // Pastel açık mavi
    '#C8E6C9', // Pastel açık yeşil
    '#F8BBD0', // Pastel pembe
    '#D1C4E9', // Pastel mor
    '#FFCCBC', // Pastel şeftali
    '#E6EE9C', // Pastel limon
    '#FFAB91', // Pastel somon
    '#F48FB1', // Pastel gül
    '#CE93D8', // Pastel lavanta
    '#B39DDB', // Pastel leylak
    '#FF5733', // Canlı kırmızı
    '#FFC300', // Canlı sarı
    '#DAF7A6', // Canlı yeşil
    '#FF33FF', // Canlı pembe
    '#33FF57'  // Canlı yeşil
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: values,
        backgroundColor: '#FFAB91' //colors.slice(0, labels.length), // Renk paletini kullan
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const value = context.dataset.data[index];
            const currency = currencies[index];
            return `${value} ${currency}`;
          }
        }
      }
    },
  };

  return (
    <div style={{ width: '50%', height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}