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

interface StockPanelProps {
  data: StockData[];
  news: NewsArticle[];
  tweets: Tweet[];
}

const StockPanel: React.FC<StockPanelProps> = ({ data, news, tweets }) => {
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

  const analyzeSentiment = () => {
    const socialSentiments = tweets.map(t => t.sentiment.score);
    const avgSocialSentiment = socialSentiments.length > 0 
      ? socialSentiments.reduce((a, b) => a + b, 0) / socialSentiments.length
      : 0;
    
    const positiveTerms = ['growth', 'increase', 'profit', 'bullish', 'up', 'higher', 'beat', 'positive'];
    const negativeTerms = ['decline', 'decrease', 'loss', 'bearish', 'down', 'lower', 'miss', 'negative'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    news.forEach(article => {
      const text = `${article.title} ${article.description} ${article.aiSummary || ''}`.toLowerCase();
      positiveTerms.forEach(term => {
        if (text.includes(term)) positiveCount++;
      });
      negativeTerms.forEach(term => {
        if (text.includes(term)) negativeCount++;
      });
    });

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
    const priceChange = getPercentageChange();
    const isUptrend = priceChange > 0;
    
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

    const topTopics = Array.from(discussionTopics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    const keyPoints = [];

    keyPoints.push({
      type: 'trend',
      icon: 'TrendingUp',
      text: `Stock ${isUptrend ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(2)}% with ${sentiment.overallSentiment.toLowerCase()} market sentiment`,
      color: isUptrend ? 'text-green-600' : 'text-red-600',
      bgColor: isUptrend ? 'bg-green-50' : 'bg-red-50'
    });

    const volume = data[data.length - 1]?.volume || 0;
    keyPoints.push({
      type: 'volume',
      icon: 'BarChart',
      text: `Trading volume at ${volume.toLocaleString()} shares`,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50'
    });

    if (significantNews.length > 0) {
      keyPoints.push({
        type: 'news',
        icon: 'News',
        text: 'Key developments: ' + significantNews.map(n => n.aiSummary).join(' '),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    }

    if (topTopics.length > 0) {
      keyPoints.push({
        type: 'social',
        icon: 'MessageCircle',
        text: `Most discussed topics: ${topTopics.join(', ')}`,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    }

    const sentimentCounts = tweets.reduce((acc, tweet) => {
      acc[tweet.sentiment.label] = (acc[tweet.sentiment.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    keyPoints.push({
      type: 'sentiment',
      icon: 'Target',
      text: `Community sentiment: ${
        Object.entries(sentimentCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => `${count} ${label.toLowerCase()}`)
          .join(', ')
      }`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Stock Performance</h2>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isPositive 
              ? 'text-green-700 bg-green-100' 
              : 'text-red-700 bg-red-100'
          }`}
        >
          <span className="mr-1">{isPositive ? '↗' : '↘'}</span>
          {Math.abs(percentageChange).toFixed(2)}%
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
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

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment</h3>
              
              <div className="flex items-center mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                  sentiment.overallSentiment === 'Positive' ? 'text-green-700 bg-green-100' :
                  sentiment.overallSentiment === 'Negative' ? 'text-red-700 bg-red-100' :
                  'text-yellow-700 bg-yellow-100'
                }`}>
                  {sentiment.overallSentiment}
                </div>
                <span className="ml-3 text-sm text-gray-500">
                  {(sentiment.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">News Analysis ({news.length} articles)</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${getSentimentColor(sentiment.newsSentiment)}`}>
                      {sentiment.newsSentiment}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {sentiment.positiveSignals}+ {sentiment.negativeSignals}-
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Social Discussions ({tweets.length} posts)</span>
                  <span className={`font-medium ${getSentimentColor(sentiment.socialSentiment)}`}>
                    {sentiment.socialSentiment}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Market Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg ${insight.bgColor}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${insight.color.replace('text-', 'bg-')}`} />
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