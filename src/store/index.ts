import create from 'zustand';
import { AppState } from '../types';
import { newsService } from '../services/newsService';
import { twitterService } from '../services/twitterService';
import { stockService } from '../services/stockService';

export const useStore = create<AppState>((set, get) => ({
  searchTerm: '',
  timeRange: '24h',
  isLoading: false,
  error: null,
  news: [],
  tweets: [],
  stockData: [],

  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setTimeRange: (range: '1h' | '24h' | '7d' | '30d') => set({ timeRange: range }),

  fetchData: async (term: string) => {
    const { timeRange } = get();
    set({ isLoading: true, error: null });

    try {
      // Fetch data in parallel
      const [newsPromise, tweetsPromise, symbolPromise] = [
        newsService.getNews(term, timeRange),
        twitterService.getTweets(term, timeRange),
        stockService.getSymbol(term),
      ];

      const [news, tweets, symbol] = await Promise.all([
        newsPromise,
        tweetsPromise,
        symbolPromise,
      ]);

      // Once we have the symbol, fetch stock data
      const stockData = await stockService.getStockData(symbol, timeRange);

      set({
        news,
        tweets,
        stockData,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },
})); 