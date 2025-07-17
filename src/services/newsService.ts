import { NewsArticle } from '../types';

const BACKEND_URL = 'http://localhost:3001';

console.log('NewsService Debug:');
console.log('Backend URL:', BACKEND_URL);
console.log('Using real API data via backend server');

export const newsService = {
  async getNews(searchTerm: string, timeRange: string): Promise<NewsArticle[]> {
    try {
      console.log(`Fetching real news for term: ${searchTerm}, timeRange: ${timeRange}`);
      
      // Call the backend API
      const response = await fetch(`${BACKEND_URL}/api/news/${encodeURIComponent(searchTerm)}?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newsArticles: NewsArticle[] = await response.json();
      console.log(`Received ${newsArticles.length} real news articles for ${searchTerm}`);
      
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