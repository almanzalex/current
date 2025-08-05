import React, { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import NewsPanel from './components/NewsPanel';
import SocialPanel from './components/SocialPanel';
import StockPanel from './components/StockPanel';
import TimelineChart from './components/TimelineChart';
import TimeRangeSelector from './components/TimeRangeSelector';
import { useStore } from './store';

function App() {
  const {
    timeRange,
    isLoading,
    error,
    news,
    tweets,
    stockData,
    sentimentData,
    fetchData,
  } = useStore();

  const [currentSymbol, setCurrentSymbol] = useState('');

  const handleFetchData = useCallback((term: string) => {
    setCurrentSymbol(term);
    fetchData(term, timeRange);
  }, [fetchData, timeRange]);

  const handleTimeRangeChange = useCallback((newTimeRange: '1h' | '24h' | '7d' | '30d') => {
    if (currentSymbol) {
      fetchData(currentSymbol, newTimeRange);
    }
  }, [fetchData, currentSymbol]);

  // Removed automatic data loading - wait for user search
  // useEffect(() => {
  //   fetchData('AAPL', '24h');
  // }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm shadow border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Current
              </h1>
              <p className="ml-4 text-gray-600 dark:text-gray-300 hidden md:block">
                Real-time financial data and analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <TimeRangeSelector
                value={timeRange as '1h' | '24h' | '7d' | '30d'}
                onChange={handleTimeRangeChange}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleFetchData} />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading market data...</span>
          </div>
        ) : currentSymbol ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market dashboard</h2>
              <TimelineChart />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <NewsPanel news={news} />
              </div>
              <div className="xl:col-span-1">
                <SocialPanel tweets={tweets} sentimentData={sentimentData || undefined} />
              </div>
              <div className="xl:col-span-1">
                <StockPanel data={stockData} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to explore market data</h3>
            <p className="text-gray-600 mb-4">Search for a stock symbol to view real-time data, news, and social sentiment</p>
            <p className="text-sm text-gray-500">Try popular symbols like TSLA, NVDA, or AAPL</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 