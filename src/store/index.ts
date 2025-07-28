import create from 'zustand';
import { AppState } from '../types';
import { newsService } from '../services/newsService';
import { socialService } from '../services/socialService';
import { stockService } from '../services/stockService';
import { sentimentService } from '../services/sentimentService';

export const useStore = create<AppState>((set, get) => ({
  searchTerm: '',
  timeRange: '7d',
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
      // get all data at once
      const [newsPromise, tweetsPromise, stockDataPromise, sentimentPromise] = [
        newsService.getNews(term),
        socialService.getSocialPosts(term),
        stockService.getStockData(term, timeRange), // only stock uses timeRange
        sentimentService.getSentiment(term),
      ];

      const [news, tweets, stockData, sentimentData] = await Promise.all([
        newsPromise,
        tweetsPromise,
        stockDataPromise,
        sentimentPromise,
      ]);

      set({
        news,
        tweets,
        stockData,
        sentimentData,
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