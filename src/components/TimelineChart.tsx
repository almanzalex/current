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
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TimelineChart: React.FC = () => {
  const { news, tweets, stockData, timeRange } = useStore();

  const chartData = useMemo(() => {
    const dataMap = new Map();

    // Process news articles
    news.forEach(article => {
      const timestamp = new Date(article.publishedAt).getTime();
      const hour = Math.floor(timestamp / 3600000) * 3600000;
      
      if (!dataMap.has(hour)) {
        dataMap.set(hour, { newsCount: 0, sentimentSum: 0, tweetCount: 0, price: null });
      }
      
      dataMap.get(hour).newsCount++;
    });

    // Process tweets
    tweets.forEach(tweet => {
      if (!tweet.createdAt) return; // Skip tweets without creation date
      const timestamp = new Date(tweet.createdAt).getTime();
      const hour = Math.floor(timestamp / 3600000) * 3600000;
      
      if (!dataMap.has(hour)) {
        dataMap.set(hour, { newsCount: 0, sentimentSum: 0, tweetCount: 0, price: null });
      }
      
      const data = dataMap.get(hour);
      data.sentimentSum += tweet.sentiment.score;
      data.tweetCount++;
    });

    // Process stock data
    stockData.forEach(point => {
      const hour = Math.floor(point.timestamp * 1000 / 3600000) * 3600000;
      
      if (!dataMap.has(hour)) {
        dataMap.set(hour, { newsCount: 0, sentimentSum: 0, tweetCount: 0, price: null });
      }
      
      dataMap.get(hour).price = point.price;
    });

    // Convert map to sorted array
    const sortedData = Array.from(dataMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([timestamp, data]) => ({
        timestamp,
        newsCount: data.newsCount,
        averageSentiment: data.tweetCount > 0 ? data.sentimentSum / data.tweetCount : 0,
        price: data.price,
      }));

    // Generate cleaner labels based on time range
    const maxLabels = 6;
    const labelInterval = Math.max(1, Math.ceil(sortedData.length / maxLabels));
    
    const cleanLabels = sortedData.map((d, index) => {
      if (index % labelInterval === 0 || index === sortedData.length - 1) {
        const date = new Date(d.timestamp);
        
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
      }
      return '';
    });

    return {
      labels: cleanLabels,
      sortedData, // Store the actual data for tooltip access
      datasets: [
        {
          label: 'News Volume',
          data: sortedData.map(d => d.newsCount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Social Sentiment',
          data: sortedData.map(d => d.averageSentiment),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
        {
          label: 'Stock Price',
          data: sortedData.map(d => d.price),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: false,
          yAxisID: 'y2',
        },
      ],
    };
  }, [news, tweets, stockData, timeRange]);

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
        text: 'Market Data Correlation Timeline',
        font: {
          size: 18,
          weight: 600,
        },
        color: '#374151',
        padding: 20,
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            if (context[0]?.dataIndex !== undefined) {
              const dataIndex = context[0].dataIndex;
              const dataPoint = chartData.sortedData[dataIndex];
              if (dataPoint) {
                const date = new Date(dataPoint.timestamp);
                
                // Format tooltip title based on time range
                switch (timeRange) {
                  case '1h':
                    return date.toLocaleString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                  case '24h':
                    return date.toLocaleString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                  case '7d':
                    return date.toLocaleString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                  case '30d':
                    return date.toLocaleDateString([], { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  default:
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
          text: 'News Articles',
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
        },
        border: {
          display: false,
        }
      },
      y1: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 11,
          },
        },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
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
          drawOnChartArea: false,
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