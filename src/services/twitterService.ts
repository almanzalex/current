import axios from 'axios';
import { Tweet, SentimentScore } from '../types';

const TWITTER_API_KEY = process.env.REACT_APP_TWITTER_API_KEY;
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';

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
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw error;
    }
  },
}; 