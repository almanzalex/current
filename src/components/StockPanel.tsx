import React from 'react';
import { StockData } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockPanelProps {
  data: StockData[];
}

const StockPanel: React.FC<StockPanelProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => new Date(d.timestamp * 1000).toLocaleString()),
    datasets: [
      {
        label: 'Stock Price',
        data: data.map(d => d.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const getPercentageChange = () => {
    if (data.length < 2) return 0;
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Stock Performance</h2>
        <div
          className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(2)}%
        </div>
      </div>
      
      {data.length === 0 ? (
        <p className="text-gray-500">No stock data available.</p>
      ) : (
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Current Price</p>
            <p className="font-medium text-gray-900">
              ${data[data.length - 1].price.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Volume</p>
            <p className="font-medium text-gray-900">
              {data[data.length - 1].volume.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPanel; 