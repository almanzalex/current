import axios from 'axios';
import { NewsArticle } from '../types';

const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export const newsService = {
  async getNews(searchTerm: string, timeRange: string): Promise<NewsArticle[]> {
    try {
      // Calculate the from date based on timeRange
      const now = new Date();
      const from = new Date(now.getTime());
      
      switch (timeRange) {
        case '1h':
          from.setHours(now.getHours() - 1);
          break;
        case '24h':
          from.setDate(now.getDate() - 1);
          break;
        case '7d':
          from.setDate(now.getDate() - 7);
          break;
        case '30d':
          from.setDate(now.getDate() - 30);
          break;
      }

      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: searchTerm,
          from: from.toISOString(),
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
        },
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },
}; 