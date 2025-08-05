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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

interface StockPanelProps {
  data: StockData[];
}

const StockPanel: React.FC<StockPanelProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d, index) => {
      if (data.length <= 6) return new Date(d.timestamp * 1000).toLocaleTimeString();
      if (index % Math.ceil(data.length / 6) === 0) {
        return new Date(d.timestamp * 1000).toLocaleTimeString();
      }
      return '';
    }),
    datasets: [
      {
        label: 'Price',
        data: data.map(d => d.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
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
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
          title: function(context: any) {
            if (context[0]?.dataIndex !== undefined) {
              const dataPoint = data[context[0].dataIndex];
              return new Date(dataPoint.timestamp * 1000).toLocaleString();
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 11,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          borderDash: [2, 2],
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        },
        border: {
          display: false,
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const getPercentageChange = () => {
    if (data.length < 2) return 0;
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };



  const generateInsights = () => {
    const priceChange = getPercentageChange();
    const isUp = priceChange > 0;
    
    const insights = [];

    insights.push({
      type: 'trend',
      icon: 'TrendingUp',
      text: `${isUp ? 'Up' : 'Down'} ${Math.abs(priceChange).toFixed(2)}% this period`,
      color: isUp ? 'text-green-600' : 'text-red-600',
      bgColor: isUp ? 'bg-green-50' : 'bg-red-50'
    });

    const volume = data[data.length - 1]?.volume || 0;
    insights.push({
      type: 'volume',
      icon: 'BarChart',
      text: `Volume: ${volume.toLocaleString()} shares`,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50'
    });

    const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
    insights.push({
      type: 'avgVolume',
      icon: 'BarChart',
      text: `Avg volume: ${Math.round(avgVolume).toLocaleString()}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    });

    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    insights.push({
      type: 'range',
      icon: 'Minus',
      text: `Range: $${min.toFixed(2)} - $${max.toFixed(2)}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    });

    return insights;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;
  const insights = generateInsights();



  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Stock Performance</h2>
        <div
          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isPositive 
              ? 'text-green-700 bg-green-100' 
              : 'text-red-700 bg-red-100'
          }`}
        >
          <span className="mr-1">{isPositive ? '↗' : '↘'}</span>
          {Math.abs(percentageChange).toFixed(2)}%
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>No stock data available</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 mb-6">
              <Line data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data[data.length - 1].price.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data[data.length - 1].volume / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>



            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg ${insight.bgColor}`}>
                    <div className="flex items-start space-x-3">
                      {insight.type !== 'avgVolume' && (
                        <div className={`w-2 h-2 rounded-full mt-2 ${insight.color.replace('text-', 'bg-')}`} />
                      )}
                      <p className="text-sm text-gray-700 flex-1">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockPanel; 