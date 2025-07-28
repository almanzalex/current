import React from 'react';
import { Tweet, SentimentData } from '../types';

interface SocialPanelProps {
  tweets: Tweet[];
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Reddit Discussions</h2>
        {sentimentData && (
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${overallColor(sentimentData.sentiment)}`}>
            <span className="mr-1">{overallIcon(sentimentData.sentiment)}</span>
            {sentimentData.sentiment.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {tweets.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <p className="font-medium">No Reddit posts found</p>
              <p className="text-sm text-gray-400 mt-1">Try searching for a different stock symbol</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((post) => {
              return (
                <div
                  key={post.id}
                  className="group border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {post.author}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Reddit
                          </span>
                        </div>
                        
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${sentimentColor(post.sentiment.score)}`}>
                          <span className="mr-1">{sentimentIcon(post.sentiment.score)}</span>
                          {post.sentiment.label.charAt(0).toUpperCase() + post.sentiment.label.slice(1)}
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                        {post.text}
                      </h3>
                      
                      {post.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {post.description}
                        </p>
                      )}
                      
                      {post.aiSummary && (
                        <div className="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-xs font-semibold text-purple-700 uppercase">Summary</span>
                          </div>
                          <p className="text-sm text-purple-800 leading-relaxed">
                            {post.aiSummary}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatDateTime(post.createdAt || '')}
                        </div>
                        
                        <button
                          onClick={() => handleRedditClick(post.url || '', post.text)}
                          className="flex items-center text-orange-600 hover:text-orange-700 transition-colors font-medium"
                        >
                          <span className="mr-1">View on Reddit</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
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