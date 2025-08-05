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
  timeRange: '1h' | '24h' | '7d' | '30d';
  fetchData: (symbol: string, timeRange: '1h' | '24h' | '7d' | '30d') => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  stockData: [],
  news: [],
  tweets: [],
  sentimentData: null,
  isLoading: false,
  error: null,
  currentSymbol: '',
  timeRange: '24h' as '1h' | '24h' | '7d' | '30d',

  fetchData: async (symbol: string, timeRange: '1h' | '24h' | '7d' | '30d') => {
    console.log('Store: fetchData called with:', symbol, timeRange);
    set({ isLoading: true, error: null });

    // Initialize default values
    let stockData: StockData[] = [];
    let newsData: NewsArticle[] = [];
    let socialData: Tweet[] = [];
    let sentimentData: SentimentData | null = null;
    let finalError: string | null = null;

    try {
      // Fetch stock data
      console.log('Store: Fetching stock data...');
      try {
        stockData = await stockService.getStockData(symbol, timeRange);
        console.log('Store: Stock data fetched successfully:', stockData.length, 'items');
      } catch (error: any) {
        console.error('Store: Stock data failed:', error.message);
        finalError = error.message;
      }

      // Fetch news data (don't let it fail everything)
      console.log('Store: Fetching news data...');
      try {
        newsData = await newsService.getNews(symbol);
        console.log('Store: News data fetched successfully:', newsData.length, 'items');
      } catch (error: any) {
        console.error('Store: News data failed (continuing):', error.message);
        // Don't set finalError for news failures
      }

      // Fetch social data (don't let it fail everything)
      console.log('Store: Fetching social data...');
      try {
        socialData = await socialService.getSocialPosts(symbol);
        console.log('Store: Social data fetched successfully:', Array.isArray(socialData) ? socialData.length : 'non-array response');
      } catch (error: any) {
        console.error('Store: Social data failed (continuing):', error.message);
        // Don't set finalError for social failures
      }

      // Fetch sentiment data (don't let it fail everything)
      console.log('Store: Fetching sentiment data...');
      try {
        sentimentData = await sentimentService.getSentiment(symbol);
        console.log('Store: Sentiment data fetched successfully:', sentimentData);
      } catch (error: any) {
        console.error('Store: Sentiment data failed (continuing):', error.message);
        // Don't set finalError for sentiment failures
      }

      // Update state with whatever data we got
      set({
        stockData,
        news: newsData,
        tweets: socialData,
        sentimentData, // Now actually setting the sentiment data
        isLoading: false,
        error: finalError, // Only set if stock data (the main data) failed
        currentSymbol: symbol,
        timeRange
      });

      console.log('Store: fetchData completed. Error:', finalError);
    } catch (error: any) {
      console.error('Store: Unexpected error in fetchData:', error);
      set({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        isLoading: false,
      });
    }
  },
})); 