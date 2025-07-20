import React from 'react';
import { NewsArticle } from '../types';

interface NewsPanelProps {
  news: NewsArticle[];
}

const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-96 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest News</h2>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {news.length === 0 ? (
          <p className="text-gray-500">No news articles found.</p>
        ) : (
          news.map((article) => (
            <article
              key={article.url}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-2 -mx-2"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {article.source.name} •{' '}
                  {new Date(article.publishedAt).toLocaleString()}
                </p>
                {article.aiSummary ? (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-blue-600 mb-1">AI Summary:</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      {article.aiSummary}
                    </p>
                  </div>
                ) : null}
                <p className="text-gray-600">{article.description}</p>
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsPanel; 