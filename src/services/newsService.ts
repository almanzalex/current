import { NewsArticle } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';



export const newsService = {
  async getNews(searchTerm: string): Promise<NewsArticle[]> {
    try {
      // call backend api
      const response = await fetch(`${BACKEND_URL}/api/news/${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newsArticles: NewsArticle[] = await response.json();
      return newsArticles;
    } catch (error: any) {
      console.error('Error fetching news:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      
      throw new Error(`Failed to fetch news for ${searchTerm}: ${error.message}`);
    }
  },
}; 