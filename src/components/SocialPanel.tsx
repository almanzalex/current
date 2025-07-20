import React from 'react';
import { Tweet } from '../types';

interface SocialPanelProps {
  tweets: Tweet[];
}

const SocialPanel: React.FC<SocialPanelProps> = ({ tweets }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return '↑';
    if (sentiment < -0.3) return '↓';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-96 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reddit Discussions</h2>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {tweets.length === 0 ? (
          <p className="text-gray-500">No Reddit posts found.</p>
        ) : (
          tweets.map((post) => (
            <div
              key={post.id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {post.author}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-800">
                      Reddit
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{post.text}</p>
                  {post.aiSummary ? (
                    <div className="mt-2 mb-2">
                      <p className="text-sm font-medium text-blue-600 mb-1">AI Analysis:</p>
                      <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        {post.aiSummary}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span
                      className={`font-medium ${getSentimentColor(
                        post.sentiment.score
                      )}`}
                    >
                      {getSentimentIcon(post.sentiment.score)}{' '}
                      {post.sentiment.label.charAt(0).toUpperCase() +
                        post.sentiment.label.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialPanel; 