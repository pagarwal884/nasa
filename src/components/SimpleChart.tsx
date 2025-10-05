// Enhanced SimpleChart.tsx with Chart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  type: 'bar' | 'line';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options: any;
}

interface SimpleChartProps {
  data: ChartData;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        color: 'white',
        ...data.options.plugins?.title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        ...data.options.scales?.y,
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        ...data.options.scales?.x,
      },
    },
  };

  const chartData = {
    labels: data.data.labels,
    datasets: data.data.datasets,
  };

  return (
    <div className="w-full h-64">
      {data.type === 'bar' ? (
        <Bar data={chartData} options={chartOptions} />
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
  
};