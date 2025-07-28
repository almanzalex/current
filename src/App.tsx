import React, { useEffect, useCallback } from 'react';
import { useStore } from './store';
import SearchBar from './components/SearchBar';
import NewsPanel from './components/NewsPanel';
import SocialPanel from './components/SocialPanel';
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
    sentimentData,
    setTimeRange,
    fetchData,
  } = useStore();

  const handleFetchData = useCallback((term: string) => {
    fetchData(term);
  }, [fetchData]);

  useEffect(() => {
    if (searchTerm) {
      handleFetchData(searchTerm);
    }
  }, [searchTerm, timeRange, handleFetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm shadow border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Current
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Real-time financial data and analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <TimeRangeSelector
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {searchTerm && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Analysis for {searchTerm.toUpperCase()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLoading ? 'Loading market data...' : 'Market dashboard'}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : searchTerm ? (
          <div className="space-y-8">
            <TimelineChart />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <NewsPanel news={news} />
              </div>
              <div className="xl:col-span-1">
                <SocialPanel tweets={tweets} sentimentData={sentimentData} />
              </div>
              <div className="xl:col-span-1">
                <StockPanel data={stockData} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Current
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Search for any stock symbol to get market data, news, and social sentiment analysis
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 