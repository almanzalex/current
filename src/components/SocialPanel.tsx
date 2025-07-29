import React from 'react';
import { Tweet, SentimentData } from '../types';

interface SocialPanelProps {
  tweets: Tweet[] | any;
  sentimentData?: SentimentData;
}

const SocialPanel: React.FC<SocialPanelProps> = ({ tweets, sentimentData }) => {
  const sentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600 bg-green-50';
    if (sentiment < -0.3) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const sentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return '↗';
    if (sentiment < -0.3) return '↘';
    return '→';
  };

  const overallColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'border-green-200 bg-green-50 text-green-700';
    if (sentiment < -0.3) return 'border-red-200 bg-red-50 text-red-700';
    return 'border-gray-200 bg-gray-50 text-gray-700';
  };

  const overallIcon = (sentiment: number) => {
    if (sentiment > 0.3) return '↗';
    if (sentiment < -0.3) return '↘';
    return '→';
  };

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

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          Reddit Discussions
          {sentimentData && (
            <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${overallColor(sentimentData.sentiment)}`}>
              <span className="mr-1">{overallIcon(sentimentData.sentiment)}</span>
              {sentimentData.sentiment.toFixed(2)}
            </div>
          )}
        </h3>
      </div>

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
        </div>
      ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {tweets.slice(0, 10).map((post: any, index: number) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${sentimentColor(post.sentiment)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.text}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{post.author}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(post.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs ${sentimentColor(post.sentiment)}`}>
                        {sentimentIcon(post.sentiment)}
                      </span>
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
            ))}
          </div>
        )}
    </div>
  );
};

export default SocialPanel; 