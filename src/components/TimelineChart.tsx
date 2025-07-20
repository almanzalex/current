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

const TimelineChart: React.FC = () => {
  const { news, tweets, stockData } = useStore();

  const chartData = useMemo(() => {
    // Create a map of timestamps to aggregate data
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

    return {
      labels: sortedData.map(d => new Date(d.timestamp).toLocaleString()),
      datasets: [
        {
          label: 'News Articles',
          data: sortedData.map(d => d.newsCount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Social Sentiment',
          data: sortedData.map(d => d.averageSentiment),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          yAxisID: 'y1',
        },
        {
          label: 'Stock Price',
          data: sortedData.map(d => d.price),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          yAxisID: 'y2',
        },
      ],
    };
  }, [news, tweets, stockData]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Correlation Timeline',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'News Count',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Sentiment Score',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Stock Price ($)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimelineChart; 