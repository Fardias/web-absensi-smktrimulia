import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

// Komponen untuk Pie Chart Presentase Kehadiran
export const AttendancePieChart = ({ hadirCount, belumHadirCount, presentRate }) => {
  const data = {
    labels: ['Hadir', 'Belum Hadir'],
    datasets: [
      {
        data: [hadirCount, belumHadirCount],
        backgroundColor: ['#14b8a6', '#e5e7eb'],
        borderColor: ['#0d9488', '#d1d5db'],
        borderWidth: 2,
        cutout: '70%', // Membuat donut chart lebih besar
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Kita akan buat legend custom
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = hadirCount + belumHadirCount;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} siswa (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex flex-col items-center">
        {/* Chart Container */}
        <div className="relative w-32 h-32 mb-4">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {presentRate}%
            </span>
            <span className="text-xs text-gray-500">Kehadiran</span>
          </div>
        </div>
        
        {/* Legend dan Info */}
        <div className="w-full">
          <p className="text-lg font-semibold text-gray-900 text-center mb-3">
            Persentase Kehadiran
          </p>
          
          {/* Legend Items */}
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hadir</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{hadirCount} siswa</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Belum Hadir</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{belumHadirCount} siswa</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// Komponen untuk Line Chart Tren Kehadiran
export const AttendanceTrendChart = ({ trendData }) => {
  const data = {
    labels: trendData.map(item => item.label),
    datasets: [
      {
        label: 'Persentase Kehadiran',
        data: trendData.map(item => item.rate),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#0ea5e9',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Kehadiran: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Tren Kehadiran 7 Hari</h3>
      <div className="w-full h-36">
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Tidak ada data tren.
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};