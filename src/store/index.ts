import { create } from 'zustand';
import { StockData, NewsArticle, Tweet, SentimentData, SocialResponse } from '../types';
import { stockService } from '../services/stockService';
import { newsService } from '../services/newsService';
import { socialService } from '../services/socialService';
import { sentimentService } from '../services/sentimentService';

interface AppState {
  stockData: StockData[];
  news: NewsArticle[];
  tweets: Tweet[] | SocialResponse;
  sentimentData: SentimentData | null;
  isLoading: boolean;
  error: string | null;
  currentSymbol: string;
  timeRange: string;
  fetchData: (symbol: string, timeRange: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  stockData: [],
  news: [],
  tweets: [],
  sentimentData: null,
  isLoading: false,
  error: null,
  currentSymbol: '',
  timeRange: '24h',

  fetchData: async (symbol: string, timeRange: string) => {
    set({ isLoading: true, error: null });

    try {
      // get all data at once
      const [stockData, newsData, socialData, sentimentData] = await Promise.all([
        stockService.getStockData(symbol, timeRange),
        newsService.getNews(symbol),
        socialService.getSocialPosts(symbol),
        sentimentService.getSentiment(symbol)
      ]);

      set({
        stockData,
        news: newsData,
        tweets: socialData,
        sentimentData,
        isLoading: false,
        error: null,
        currentSymbol: symbol,
        timeRange
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },
})); 