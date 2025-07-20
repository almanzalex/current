import React from 'react';
import { StockData, NewsArticle, Tweet } from '../types';
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
  news: NewsArticle[];
  tweets: Tweet[];
}

const StockPanel: React.FC<StockPanelProps> = ({ data, news, tweets }) => {
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

  const analyzeSentiment = () => {
    // Count positive/negative sentiment from social media
    const socialSentiments = tweets.map(t => t.sentiment.score);
    const avgSocialSentiment = socialSentiments.length > 0 
      ? socialSentiments.reduce((a, b) => a + b, 0) / socialSentiments.length
      : 0;
    
    // Count mentions of key terms in news and summaries
    const positiveTerms = ['growth', 'increase', 'profit', 'bullish', 'up', 'higher', 'beat', 'positive'];
    const negativeTerms = ['decline', 'decrease', 'loss', 'bearish', 'down', 'lower', 'miss', 'negative'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Analyze news articles
    news.forEach(article => {
      const text = `${article.title} ${article.description} ${article.aiSummary || ''}`.toLowerCase();
      positiveTerms.forEach(term => {
        if (text.includes(term)) positiveCount++;
      });
      negativeTerms.forEach(term => {
        if (text.includes(term)) negativeCount++;
      });
    });

    // Calculate overall sentiment metrics
    const sentimentScore = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);
    const socialConfidence = Math.abs(avgSocialSentiment);
    const newsConfidence = (positiveCount + negativeCount) / (news.length || 1);

    return {
      overallSentiment: sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral',
      sentimentScore: sentimentScore,
      socialSentiment: avgSocialSentiment > 0.1 ? 'Positive' : avgSocialSentiment < -0.1 ? 'Negative' : 'Neutral',
      newsSentiment: positiveCount > negativeCount ? 'Positive' : positiveCount < negativeCount ? 'Negative' : 'Neutral',
      positiveSignals: positiveCount,
      negativeSignals: negativeCount,
      confidence: (socialConfidence + newsConfidence) / 2
    };
  };

  const generateInsights = () => {
    // Analyze price trends
    const priceChange = getPercentageChange();
    const isUptrend = priceChange > 0;
    
    // Find most significant news
    const significantNews = news
      .filter(article => article.aiSummary)
      .sort((a, b) => {
        const aScore = (a.aiSummary?.toLowerCase().includes('significant') || 
                       a.aiSummary?.toLowerCase().includes('major') ||
                       a.aiSummary?.toLowerCase().includes('important')) ? 1 : 0;
        const bScore = (b.aiSummary?.toLowerCase().includes('significant') || 
                       b.aiSummary?.toLowerCase().includes('major') ||
                       b.aiSummary?.toLowerCase().includes('important')) ? 1 : 0;
        return bScore - aScore;
      })
      .slice(0, 2);

    // Analyze discussion trends
    const discussionTopics = new Map();
    tweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      ['revenue', 'earnings', 'growth', 'product', 'market', 'competition', 'technology', 'management']
        .forEach(topic => {
          if (text.includes(topic)) {
            discussionTopics.set(topic, (discussionTopics.get(topic) || 0) + 1);
          }
        });
    });

    // Sort topics by frequency
    const topTopics = Array.from(discussionTopics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Generate key points
    const keyPoints = [];

    // Price trend point
    keyPoints.push({
      type: 'trend',
      text: `Stock ${isUptrend ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(2)}% with ${
        sentiment.overallSentiment.toLowerCase()} market sentiment`,
      color: isUptrend ? 'text-green-600' : 'text-red-600'
    });

    // Volume point
    const volume = data[data.length - 1].volume;
    keyPoints.push({
      type: 'volume',
      text: `Trading volume at ${volume.toLocaleString()} shares`,
      color: 'text-gray-600'
    });

    // News impact
    if (significantNews.length > 0) {
      keyPoints.push({
        type: 'news',
        text: 'Key developments: ' + significantNews.map(n => n.aiSummary).join(' '),
        color: 'text-blue-600'
      });
    }

    // Social discussion trends
    if (topTopics.length > 0) {
      keyPoints.push({
        type: 'social',
        text: `Most discussed topics: ${topTopics.join(', ')}`,
        color: 'text-purple-600'
      });
    }

    // Sentiment distribution
    const sentimentCounts = tweets.reduce((acc, tweet) => {
      acc[tweet.sentiment.label] = (acc[tweet.sentiment.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    keyPoints.push({
      type: 'sentiment',
      text: `Community sentiment: ${
        Object.entries(sentimentCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => `${count} ${label.toLowerCase()}`)
          .join(', ')
      }`,
      color: 'text-orange-600'
    });

    return keyPoints;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;
  const sentiment = analyzeSentiment();
  const insights = generateInsights();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

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
        <>
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>

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

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Market Sentiment Analysis</h3>
            
            <div className={`text-lg font-semibold mb-2 ${getSentimentColor(sentiment.overallSentiment)}`}>
              {sentiment.overallSentiment} Sentiment
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({(sentiment.confidence * 100).toFixed(1)}% confidence)
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">News Sentiment ({news.length} articles)</p>
                <p className={`font-medium ${getSentimentColor(sentiment.newsSentiment)}`}>
                  {sentiment.newsSentiment}
                  <span className="text-gray-500 ml-2">
                    ({sentiment.positiveSignals} positive vs {sentiment.negativeSignals} negative signals)
                  </span>
                </p>
              </div>

              <div>
                <p className="text-gray-500">Social Sentiment ({tweets.length} discussions)</p>
                <p className={`font-medium ${getSentimentColor(sentiment.socialSentiment)}`}>
                  {sentiment.socialSentiment}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">AI Market Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className={`mt-1 ${insight.color}`}>
                    {insight.type === 'trend' && '📈'}
                    {insight.type === 'volume' && '📊'}
                    {insight.type === 'news' && '📰'}
                    {insight.type === 'social' && '💬'}
                    {insight.type === 'sentiment' && '🎯'}
                  </div>
                  <p className="text-sm text-gray-700">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockPanel; 