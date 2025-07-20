import { Tweet, SentimentScore } from '../types';

const BACKEND_URL = 'http://localhost:3001';

console.log('TwitterService Debug:');
console.log('Backend URL:', BACKEND_URL);
console.log('Using real social media data via backend server (Reddit API)');

const analyzeSentiment = (text: string): SentimentScore => {
  // Simple sentiment analysis based on keyword matching
  // In a production environment, you'd want to use a proper NLP service
  const positiveWords = ['great', 'good', 'awesome', 'excellent', 'up', 'gain', 'profit', 'bull'];
  const negativeWords = ['bad', 'poor', 'terrible', 'down', 'loss', 'bear', 'crash', 'decline'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  score = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);
  
  return {
    score: Math.max(-1, Math.min(1, score)), // Clamp between -1 and 1
    label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    confidence: Math.abs(score),
  };
};

export const twitterService = {
  async getTweets(searchTerm: string, timeRange: string): Promise<Tweet[]> {
    try {
      console.log(`Fetching real social media data for term: ${searchTerm}, timeRange: ${timeRange}`);
      
      // Call the backend API for real social media data from Reddit
      const response = await fetch(`${BACKEND_URL}/api/social/${encodeURIComponent(searchTerm)}?timeRange=${timeRange}`, {
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

      const socialPosts = await response.json();
      console.log(`Received ${socialPosts.length} real social media posts for ${searchTerm}`);
      
      // Convert Reddit posts to Tweet format for compatibility
      const realTweets: Tweet[] = socialPosts.map((post: any, index: number) => ({
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

      console.log(`Returning ${realTweets.length} real social media posts`);
      return realTweets;
      
      // TODO: Uncomment below when Twitter API access is properly configured
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