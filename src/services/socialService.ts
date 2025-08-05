import { Tweet } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

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

      const socialResponse = await response.json();
      console.log('Social Service: Raw response:', socialResponse);
      
      // Handle the response format: {posts: [...]} or {posts: [], message: "...", isBlocked: true}
      const socialPosts = socialResponse.posts || [];
      
      if (socialResponse.isBlocked || socialPosts.length === 0) {
        console.log('Social Service: Reddit data blocked or empty, returning empty array');
        return [];
      }
      
      // convert reddit posts to tweet format for compatibility
      const socialPostsConverted: Tweet[] = socialPosts.map((post: any, index: number) => ({
        id: post.id || index.toString(),
        text: post.text || post.title || 'No content',
        url: post.url,
        author: post.author || 'unknown',
        createdAt: post.createdAt || new Date().toISOString(),
        sentiment: post.sentiment || 0, // Reddit backend returns numeric sentiment
        summary: post.summary,
      }));

      console.log('Social Service: Converted posts:', socialPostsConverted.length, 'items');
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
          'Content-Type': 'application/json',
        },
        params: {
          query: searchTerm,
          'tweet.fields': 'created_at,author_id,public_metrics',
          'user.fields': 'username',
          'expansions': 'author_id',
          'start_time': startTime.toISOString(),
          'max_results': 10,
        },
      });

      const { data: tweets, includes } = response.data;
      
      if (!tweets || tweets.length === 0) {
        return [];
      }

      // Map users for easier lookup
      const usersMap = (includes?.users || []).reduce((acc: any, user: any) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Convert Twitter data to our format
      const convertedTweets: Tweet[] = tweets.map((tweet: any) => {
        const author = usersMap[tweet.author_id];
        
        return {
          id: tweet.id,
          text: tweet.text,
          url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
          author: author?.username || 'Unknown',
          createdAt: tweet.created_at,
          sentiment: 0, // We'll calculate this separately
        };
      });

      return convertedTweets;
      */
    } catch (error: any) {
      console.error('Error fetching social posts:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      
      throw new Error(`Failed to fetch social posts for ${searchTerm}: ${error.message}`);
    }
  },
}; 