import React, { useEffect, useCallback } from 'react';
import { useStore } from './store';
import SearchBar from './components/SearchBar';
import NewsPanel from './components/NewsPanel';
import TweetPanel from './components/TweetPanel';
import StockPanel from './components/StockPanel';
import TimelineChart from './components/TimelineChart';
import TimeRangeSelector from './components/TimeRangeSelector';

function App() {
  const {
    searchTerm,
    timeRange,
    isLoading,
    error,
    news,
    tweets,
    stockData,
    setTimeRange,
    fetchData,
  } = useStore();

  // Wrap fetchData with useCallback to prevent unnecessary re-renders
  const handleFetchData = useCallback((term: string) => {
    fetchData(term);
  }, [fetchData]);

  useEffect(() => {
    if (searchTerm) {
      handleFetchData(searchTerm);
    }
  }, [searchTerm, timeRange, handleFetchData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Current</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time news, social media, and stock market correlation
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-grow">
              <SearchBar />
            </div>
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <TimelineChart />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <NewsPanel news={news} />
                <TweetPanel tweets={tweets} />
                <StockPanel data={stockData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 