import React from 'react';
import { NewsArticle } from '../types';

interface NewsPanelProps {
  news: NewsArticle[];
}

const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Latest News</h2>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100">
          {news.length} Articles
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {news.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="font-medium">No news articles found</p>
              <p className="text-sm text-gray-400 mt-1">Try searching for a different stock symbol</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article, index) => (
              <article
                key={article.url}
                className="group border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 pr-4">
                      {article.title}
                    </h3>
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 font-medium">
                      {article.source.name}
                    </span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {article.aiSummary && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Summary</span>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {article.aiSummary}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPanel; 