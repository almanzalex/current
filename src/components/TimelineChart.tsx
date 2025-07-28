import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useStore } from '../store';
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

const TimelineChart: React.FC = () => {
  const { stockData, timeRange } = useStore();

  const chartData = useMemo(() => {
    if (!stockData || stockData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Generate labels based on time range
    const labels = stockData.map((point, index) => {
      const date = new Date(point.timestamp * 1000);
      
      // Format based on time range
      switch (timeRange) {
        case '1h':
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        case '24h':
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        case '7d':
          return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        case '30d':
          return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric' 
          });
        default:
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Stock Price',
          data: stockData.map(d => d.price),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [stockData, timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Stock Price Chart',
        font: {
          size: 18,
          weight: 600,
        },
        color: '#374151',
        padding: 20,
      },
      legend: {
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
          title: function(context: any) {
            if (context[0]?.dataIndex !== undefined) {
              const dataIndex = context[0].dataIndex;
              const dataPoint = stockData[dataIndex];
              if (dataPoint) {
                const date = new Date(dataPoint.timestamp * 1000);
                
                // format date based on time range
                if (timeRange === '30d') {
                  return date.toLocaleDateString([], { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                } else {
                  return date.toLocaleString([], { 
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                }
              }
            }
            return 'Data Point';
          },
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
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
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 11,
          },
          maxTicksLimit: 6,
        },
        border: {
          display: false,
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Stock Price ($)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 500,
          },
        },
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
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimelineChart; 