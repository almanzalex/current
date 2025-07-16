import React from 'react';
import { Tweet } from '../types';

interface TweetPanelProps {
  tweets: Tweet[];
}

const TweetPanel: React.FC<TweetPanelProps> = ({ tweets }) => {
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Sentiment</h2>
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <p className="text-gray-500">No tweets found.</p>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    @{tweet.author_username}
                  </p>
                  <p className="text-gray-600 mt-1">{tweet.text}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-500">
                      {new Date(tweet.created_at).toLocaleString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span
                      className={`font-medium ${getSentimentColor(
                        tweet.sentiment.score
                      )}`}
                    >
                      {getSentimentIcon(tweet.sentiment.score)}{' '}
                      {tweet.sentiment.label.charAt(0).toUpperCase() +
                        tweet.sentiment.label.slice(1)}{' '}
                      ({Math.round(tweet.sentiment.confidence * 100)}%)
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

export default TweetPanel; 