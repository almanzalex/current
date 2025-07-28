import { Tweet } from '../types';

const BACKEND_URL = 'http://localhost:3001';





export const socialService = {
  async getSocialPosts(searchTerm: string): Promise<Tweet[]> {
    try {
      // call backend for social media data from reddit
      const response = await fetch(`${BACKEND_URL}/api/social/${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const socialPosts = await response.json();
      
      // convert reddit posts to tweet format for compatibility
      const socialPostsConverted: Tweet[] = socialPosts.map((post: any, index: number) => ({
        id: post.id || index.toString(),
        text: post.text,
        description: post.description,
        author: post.author,
        createdAt: post.createdAt,
        source: post.source,
        url: post.url,
        score: post.score,
        platform: 'reddit',
        sentiment: {
          label: post.sentiment?.label || 'neutral',
          score: post.sentiment?.score || 0,
        },
        aiSummary: post.aiSummary,
      }));

      return socialPostsConverted;
      
      // note: twitter api stuff commented out for now
      /*
      // Calculate start_time based on timeRange
      const now = new Date();
      const startTime = new Date(now.getTime());
      
      switch (timeRange) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
      }

      const response = await axios.get(`${TWITTER_API_BASE_URL}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${TWITTER_API_KEY}`,
        },
        params: {
          query: searchTerm,
          'start_time': startTime.toISOString(),
          'tweet.fields': 'created_at,author_id',
          'user.fields': 'username',
          'max_results': 100,
        },
      });

      return response.data.data.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author_username: tweet.author_id, // In real implementation, we'd get the actual username
        sentiment: analyzeSentiment(tweet.text),
      }));
      */
    } catch (error: any) {
      console.error('Error fetching social media data:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      
      throw new Error(`Failed to fetch social media data for ${searchTerm}: ${error.message}`);
    }
  },
}; 