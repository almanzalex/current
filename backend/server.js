const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI with configuration
const openai = new OpenAI({
  apiKey: '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'
});

// Helper function to generate AI summaries
async function generateSummary(content, type = 'article') {
  try {
    console.log(`Generating AI summary for ${type}...`);
    let prompt;
    if (type === 'article') {
      prompt = `Please provide a concise 2-3 sentence summary of this news article, focusing on the key financial implications:\n\n${content}`;
    } else {
      prompt = `Please provide a 1-2 sentence summary of this social media discussion, focusing on the main sentiment and key points:\n\n${content}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          "role": "system", 
          "content": "You are a financial analyst providing brief, factual summaries. Focus on key points and market implications. Be concise and objective."
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const summary = completion.choices[0].message.content.trim();
    console.log('AI Summary generated:', summary);
    return summary;
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Keys
const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY || '0d1612bb8edc4f2393e69b566f80a3aa';
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

console.log('Backend Server Starting...');
console.log('Finnhub API Key available:', FINNHUB_API_KEY ? 'YES' : 'NO');
console.log('News API Key available:', NEWS_API_KEY ? 'YES' : 'NO');

// Stock API Route
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange = '7d' } = req.query;
    
    console.log(`Fetching stock data for: ${symbol}, timeRange: ${timeRange}`);

    if (!FINNHUB_API_KEY) {
      return res.status(500).json({ error: 'Finnhub API key not configured' });
    }

    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: symbol.toUpperCase()
      },
      headers: {
        'X-Finnhub-Token': FINNHUB_API_KEY
      }
    });

    const quote = response.data;
    console.log('Finnhub response:', quote);

    if (!quote || typeof quote.c !== 'number') {
      return res.status(404).json({ error: `No data found for symbol ${symbol}` });
    }

    // Calculate time range in seconds
    let timeRangeSeconds;
    let dataPointsCount;
    
    switch (timeRange) {
      case '1h':
        timeRangeSeconds = 3600; // 1 hour
        dataPointsCount = 12; // 5-minute intervals
        break;
      case '24h':
        timeRangeSeconds = 86400; // 24 hours
        dataPointsCount = 24; // 1-hour intervals
        break;
      case '7d':
        timeRangeSeconds = 604800; // 7 days
        dataPointsCount = 28; // 6-hour intervals
        break;
      case '30d':
        timeRangeSeconds = 2592000; // 30 days
        dataPointsCount = 30; // 1-day intervals
        break;
      default:
        timeRangeSeconds = 604800; // Default to 7 days
        dataPointsCount = 28;
    }

    // Generate time series data
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const dataPoints = [];

    // Calculate price volatility for realistic data generation
    const priceVolatility = Math.abs(quote.c - (quote.pc || quote.c)) / quote.c;
    const basePrice = quote.pc || quote.c;
    const currentPrice = quote.c;

    // Generate historical data points
    for (let i = 0; i < dataPointsCount; i++) {
      const timeOffset = (timeRangeSeconds / dataPointsCount) * i;
      const timestamp = currentTimestamp - timeRangeSeconds + timeOffset;
      
      // Create realistic price movement
      let price;
      if (i === 0) {
        // Start with previous close or current price
        price = basePrice;
      } else if (i === dataPointsCount - 1) {
        // End with current price
        price = currentPrice;
      } else {
        // Interpolate with some randomness
        const progress = i / (dataPointsCount - 1);
        const linearPrice = basePrice + (currentPrice - basePrice) * progress;
        const randomFactor = 1 + (Math.random() - 0.5) * priceVolatility * 0.5;
        price = linearPrice * randomFactor;
      }

      // Generate realistic volume
      const baseVolume = Math.floor(Math.random() * 2000000) + 500000;
      const volumeMultiplier = 0.5 + Math.random() * 1.5; // 50% to 150% variation
      const volume = Math.floor(baseVolume * volumeMultiplier);

      dataPoints.push({
        timestamp,
        price: Math.round(price * 100) / 100, // Round to 2 decimal places
        volume
      });
    }

    console.log(`Generated ${dataPoints.length} data points for ${timeRange} time range`);
    res.json(dataPoints);
  } catch (error) {
    console.error('Stock API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.response?.data || error.message 
    });
  }
});

// News API Route
app.get('/api/news/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { timeRange = '7d' } = req.query;
    
    console.log(`Fetching news for: ${searchTerm}, timeRange: ${timeRange}`);

    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    // Calculate from date based on timeRange
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

    // Try multiple search strategies for better results
    const searchQueries = [
      `${searchTerm} stock`,
      `${searchTerm} earnings`,
      `${searchTerm} news`,
      searchTerm
    ];

    let allArticles = [];
    
    for (const query of searchQueries) {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: query,
            from: from.toISOString(),
            sortBy: 'publishedAt',
            language: 'en',
            apiKey: NEWS_API_KEY,
            pageSize: 5
          }
        });

        const articles = response.data.articles
          .filter(article => article.title && article.description)
          .map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: {
              name: article.source.name
            }
          }));

        allArticles = allArticles.concat(articles);
        
        if (allArticles.length >= 10) break;
      } catch (queryError) {
        console.log(`Query "${query}" failed:`, queryError.message);
        continue;
      }
    }

    // Remove duplicates and limit results
    const uniqueArticles = allArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 10);

    // Generate AI summaries for each article
    const articlesWithSummaries = await Promise.all(
      uniqueArticles.map(async (article) => {
        const content = `Title: ${article.title}\n\nDescription: ${article.description}`;
        const aiSummary = await generateSummary(content, 'article');
        return {
          ...article,
          aiSummary
        };
      })
    );

    console.log(`Found ${articlesWithSummaries.length} unique news articles with AI summaries`);
    res.json(articlesWithSummaries);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news data',
      details: error.response?.data || error.message 
    });
  }
});

// Social Media API Route (Reddit only)
app.get('/api/social/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { timeRange = '7d' } = req.query;
    
    console.log(`Fetching social media data for: ${searchTerm}, timeRange: ${timeRange}`);

    // Calculate time filter for Reddit
    let timeFilter = 'day';
    switch (timeRange) {
      case '1h':
        timeFilter = 'hour';
        break;
      case '24h':
        timeFilter = 'day';
        break;
      case '7d':
        timeFilter = 'week';
        break;
      case '30d':
        timeFilter = 'month';
        break;
    }

    // Search relevant subreddits for stock discussions
    const subreddits = ['stocks', 'investing', 'SecurityAnalysis', 'StockMarket', 'wallstreetbets'];
    let allPosts = [];

    for (const subreddit of subreddits) {
      try {
        console.log(`Fetching from r/${subreddit} for search term: ${searchTerm}`);
        
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
          params: {
            q: searchTerm,
            restrict_sr: 1,
            sort: 'new',
            t: timeFilter,
            limit: 5
          },
          headers: {
            'User-Agent': 'CurrentApp/1.0 (by /u/currentapp)'
          }
        });

        console.log(`Response from r/${subreddit}:`, {
          status: response.status,
          dataLength: response.data?.data?.children?.length || 0
        });

        if (!response.data?.data?.children) {
          console.log(`No data returned from r/${subreddit}`);
          continue;
        }

        const posts = response.data.data.children
          .filter(post => post.data.title && post.data.selftext !== '[removed]')
          .map(post => {
            const data = post.data;
            console.log('Processing Reddit post:', {
              id: data.id,
              title: data.title,
              permalink: data.permalink,
              created_utc: data.created_utc,
              created_utc_type: typeof data.created_utc,
              url: data.url,
              subreddit: data.subreddit
            });
            
            // Simple sentiment analysis
            const text = `${data.title} ${data.selftext || ''}`.toLowerCase();
            const positiveWords = ['buy', 'bullish', 'up', 'gain', 'profit', 'good', 'great', 'excellent', 'strong'];
            const negativeWords = ['sell', 'bearish', 'down', 'loss', 'bad', 'terrible', 'weak', 'drop', 'crash'];
            
            let sentiment = 'neutral';
            const positiveCount = positiveWords.filter(word => text.includes(word)).length;
            const negativeCount = negativeWords.filter(word => text.includes(word)).length;
            
            if (positiveCount > negativeCount) sentiment = 'positive';
            else if (negativeCount > positiveCount) sentiment = 'negative';

            // Ensure we always have a valid URL
            let postUrl;
            if (data.permalink) {
              postUrl = `https://www.reddit.com${data.permalink}`;
            } else if (data.url && data.url.startsWith('http')) {
              postUrl = data.url;
            } else {
              // Fallback to subreddit URL
              postUrl = `https://www.reddit.com/r/${data.subreddit || subreddit}`;
            }

            const postData = {
              id: data.id || `reddit_${Date.now()}_${Math.random()}`,
              text: data.title || 'Reddit Post',
              description: data.selftext ? data.selftext.substring(0, 200) + '...' : '',
              author: `r/${data.subreddit || subreddit}`,
              createdAt: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : new Date().toISOString(),
              source: `r/${data.subreddit || subreddit}`,
              url: postUrl,
              score: data.score || 0,
              platform: 'reddit',
              sentiment: {
                label: sentiment,
                score: (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1)
              }
            };
            
            console.log('Processed post data:', {
              id: postData.id,
              text: postData.text,
              url: postData.url,
              author: postData.author,
              createdAt: postData.createdAt,
              original_created_utc: data.created_utc,
              converted_date: data.created_utc ? new Date(data.created_utc * 1000).toLocaleString() : 'N/A'
            });
            return postData;
          });

        allPosts = allPosts.concat(posts);
        
        if (allPosts.length >= 10) break;
      } catch (subredditError) {
        console.log(`Subreddit r/${subreddit} failed:`, subredditError.message);
        continue;
      }
    }

    // Sort by score and remove duplicates
    const uniquePosts = allPosts
      .filter((post, index, self) => 
        index === self.findIndex(p => p.text === post.text)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Debug: Log the sorted posts with their dates
    console.log('\n=== REDDIT POSTS SORTING DEBUG ===');
    uniquePosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.text}" - Created: ${post.createdAt} (${new Date(post.createdAt).toLocaleString()})`);
    });
    console.log('=== END SORTING DEBUG ===\n');

    // Generate AI summaries for each post
    const postsWithSummaries = await Promise.all(
      uniquePosts.map(async (post) => {
        const content = `${post.text}\n\n${post.description || ''}`;
        const aiSummary = await generateSummary(content, 'social');
        return {
          ...post,
          aiSummary
        };
      })
    );

    console.log(`Found ${postsWithSummaries.length} Reddit posts with AI summaries`);
    res.json(postsWithSummaries);
  } catch (error) {
    console.error('Social media API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch social media data',
      details: error.message 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apis: {
      finnhub: FINNHUB_API_KEY ? 'configured' : 'missing',
      news: NEWS_API_KEY ? 'configured' : 'missing',
      social: 'reddit-api'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`�� Stock API: http://localhost:${PORT}/api/stock/AAPL`);
  console.log(`📰 News API: http://localhost:${PORT}/api/news/AAPL`);
  console.log(`❤️ Health: http://localhost:${PORT}/health\n`);
}); 