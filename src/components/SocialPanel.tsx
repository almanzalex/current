import React from 'react';
import { Tweet } from '../types';

interface SocialPanelProps {
  tweets: Tweet[];
}

const SocialPanel: React.FC<SocialPanelProps> = ({ tweets }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600 bg-green-100';
    if (sentiment < -0.3) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return '↗';
    if (sentiment < -0.3) return '↘';
    return '→';
  };

  const formatDateTime = (dateString: string) => {
    try {
      console.log('Formatting date string:', dateString);
      const date = new Date(dateString);
      console.log('Parsed date object:', date);
      console.log('Is valid date:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
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
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleRedditClick = (url: string, postTitle: string) => {
    console.log('Opening Reddit post - URL:', url);
    console.log('Post title:', postTitle);
    console.log('URL type:', typeof url);
    console.log('URL value:', url);
    
    // Check if URL exists and is valid
    if (!url) {
      console.error('No URL provided for Reddit post');
      alert('Sorry, this Reddit post link is not available.');
      return;
    }
    
    // Ensure URL is properly formatted
    let finalUrl = url;
    if (!url.startsWith('http')) {
      finalUrl = `https://www.reddit.com${url}`;
    }
    
    console.log('Final URL:', finalUrl);
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Reddit Discussions</h2>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-orange-700 bg-orange-100">
          {tweets.length} Posts
        </div>
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
              console.log('Rendering post:', post);
              return (
                <div
                  key={post.id}
                  className="group border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
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
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Reddit
                          </span>
                        </div>
                        
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(post.sentiment.score)}`}>
                          <span className="mr-1">{getSentimentIcon(post.sentiment.score)}</span>
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
                            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">AI Analysis</span>
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
                          className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium"
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