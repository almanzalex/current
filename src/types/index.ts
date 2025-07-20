// News types
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

// Tweet types
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

export interface SentimentScore {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

// Stock data types
export interface StockData {
  timestamp: number;
  price: number;
  volume: number;
}

// Combined data point for visualization
export interface TimelineDataPoint {
  timestamp: string;
  newsCount: number;
  averageSentiment: number;
  stockPrice: number;
  tweets: Tweet[];
  news: NewsArticle[];
}

// Store state types
export interface AppState {
  searchTerm: string;
  timeRange: '1h' | '24h' | '7d' | '30d';
  isLoading: boolean;
  error: string | null;
  news: NewsArticle[];
  tweets: Tweet[];
  stockData: StockData[];
  setSearchTerm: (term: string) => void;
  setTimeRange: (range: '1h' | '24h' | '7d' | '30d') => void;
  fetchData: (term: string) => Promise<void>;
} 