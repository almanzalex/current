import React from 'react';
import { Tweet, SentimentData } from '../types';

interface SocialPanelProps {
  tweets: Tweet[] | any;
  sentimentData?: SentimentData;
}

const SocialPanel: React.FC<SocialPanelProps> = ({ tweets, sentimentData }) => {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
        
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSentimentDisplay = (sentiment: number) => {
    if (sentiment > 0.1) {
      return { label: 'Positive', color: 'text-green-600 bg-green-50' };
    } else if (sentiment < -0.1) {
      return { label: 'Negative', color: 'text-red-600 bg-red-50' };
    } else {
      return { label: 'Neutral', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const getOverallSentimentDisplay = (sentimentData?: SentimentData) => {
    if (!sentimentData) return null;
    
    const { sentiment } = sentimentData;
    
    let color = 'text-gray-600 bg-gray-50';
    let label = 'Neutral';
    
    if (sentiment > 0.1) {
      color = 'text-green-600 bg-green-50';
      label = 'Positive';
    } else if (sentiment < -0.1) {
      color = 'text-red-600 bg-red-50';
      label = 'Negative';
    }
    
    return {
      color,
      label
    };
  };

  const handleRedditClick = (url: string, postTitle: string) => {
    // check url
    if (!url) {
      alert('Sorry, this Reddit post link is not available.');
      return;
    }
    
    // add domain if needed
    let finalUrl = url;
    if (!url.startsWith('http')) {
      finalUrl = `https://www.reddit.com${url}`;
    }
    
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const overallSentiment = getOverallSentimentDisplay(sentimentData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Reddit Discussions</h2>
        {overallSentiment ? (
          <div className={`px-2 py-1 rounded-full text-xs font-medium border-gray-200 ${overallSentiment.color}`}>
            {overallSentiment.label}
          </div>
        ) : (
          <div className="px-2 py-1 rounded-full text-xs font-medium border-gray-200 bg-gray-50 text-gray-500">
            Analyzing...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {(!tweets || tweets.length === 0) ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 text-gray-300 mx-auto mb-3">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {tweets?.message && tweets?.isBlocked 
                ? "Reddit scraping blocked on deployed servers. For social sentiment analysis, run the app locally where Reddit data can be accessed."
                : "No recent discussions found"
              }
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Try searching for a different stock symbol
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.slice(0, 10).map((post: any, index: number) => {
              const postSentiment = getSentimentDisplay(post.sentiment || 0);
              return (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-gray-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.text}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">{post.author}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(post.createdAt)}
                        </span>
                        {post.sentiment !== undefined && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className={`text-xs px-1 py-0.5 rounded ${postSentiment.color}`}>
                              ({postSentiment.label})
                            </span>
                          </>
                        )}
                        {post.url && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <button
                              onClick={() => handleRedditClick(post.url, post.text)}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View
                            </button>
                          </>
                        )}
                      </div>
                      {post.summary && (
                        <p className="text-xs text-gray-600 mt-2 italic">{post.summary}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPanel; 