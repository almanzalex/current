export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  aiSummary?: string;
}

export interface Tweet {
  id: string;
  text: string;
  description?: string;
  author?: string;
  author_username?: string;
  createdAt?: string;
  created_at?: string;
  source: string;
  url?: string;
  score?: number;
  platform: 'reddit' | 'x';
  sentiment: {
    label: string;
    score: number;
  };
  aiSummary?: string;
}

export interface SentimentData {
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface StockData {
  timestamp: number;
  price: number;
  volume: number;
}

export interface AppState {
  searchTerm: string;
  timeRange: '1h' | '24h' | '7d' | '30d';
  isLoading: boolean;
  error: string | null;
  news: NewsArticle[];
  tweets: Tweet[];
  stockData: StockData[];
  sentimentData?: SentimentData;
  setSearchTerm: (term: string) => void;
  setTimeRange: (range: '1h' | '24h' | '7d' | '30d') => void;
  fetchData: (term: string) => Promise<void>;
} 