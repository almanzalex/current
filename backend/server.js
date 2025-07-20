const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
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
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

console.log('Backend Server Starting...');
console.log('Finnhub API Key available:', FINNHUB_API_KEY ? 'YES' : 'NO');
console.log('News API Key available:', NEWS_API_KEY ? 'YES' : 'NO');

// Stock API Route
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`Fetching stock data for: ${symbol}`);

    if (!FINNHUB_API_KEY) {
      return res.status(500).json({ error: 'Finnhub API key not configured' });
    }

    // Get real-time quote from Finnhub
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

    // Generate time series data with current price and previous close
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const dataPoints = [];

    // Add previous close as starting point
    if (quote.pc && quote.pc > 0) {
      dataPoints.push({
        timestamp: currentTimestamp - 86400, // 24 hours ago
        price: quote.pc,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }

    // Add some intermediate points for visualization
    if (quote.pc && quote.pc > 0 && quote.c !== quote.pc) {
      const priceChange = quote.c - quote.pc;
      const steps = 8;
      
      for (let i = 1; i < steps; i++) {
        const ratio = i / steps;
        const interpolatedPrice = quote.pc + (priceChange * ratio);
        dataPoints.push({
          timestamp: currentTimestamp - 86400 + (86400 * ratio),
          price: interpolatedPrice,
          volume: Math.floor(Math.random() * 1000000) + 500000
        });
      }
    }

    // Add current price
    dataPoints.push({
      timestamp: currentTimestamp,
      price: quote.c,
      volume: Math.floor(Math.random() * 1000000) + 500000
    });

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
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
          params: {
            q: searchTerm,
            restrict_sr: 1,
            sort: 'relevance',
            t: timeFilter,
            limit: 5
          },
          headers: {
            'User-Agent': 'CurrentApp/1.0'
          }
        });

        const posts = response.data.data.children
          .filter(post => post.data.title && post.data.selftext !== '[removed]')
          .map(post => {
            const data = post.data;
            
            // Simple sentiment analysis
            const text = `${data.title} ${data.selftext || ''}`.toLowerCase();
            const positiveWords = ['buy', 'bullish', 'up', 'gain', 'profit', 'good', 'great', 'excellent', 'strong'];
            const negativeWords = ['sell', 'bearish', 'down', 'loss', 'bad', 'terrible', 'weak', 'drop', 'crash'];
            
            let sentiment = 'neutral';
            const positiveCount = positiveWords.filter(word => text.includes(word)).length;
            const negativeCount = negativeWords.filter(word => text.includes(word)).length;
            
            if (positiveCount > negativeCount) sentiment = 'positive';
            else if (negativeCount > positiveCount) sentiment = 'negative';

            return {
              id: data.id,
              text: data.title,
              description: data.selftext ? data.selftext.substring(0, 200) + '...' : '',
              author: `r/${subreddit}`,
              createdAt: new Date(data.created_utc * 1000).toISOString(),
              source: `r/${subreddit}`,
              url: `https://reddit.com${data.permalink}`,
              score: data.score,
              platform: 'reddit',
              sentiment: {
                label: sentiment,
                score: (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1)
              }
            };
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
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

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
  const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
  const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

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
  console.log(`📊 Stock API: http://localhost:${PORT}/api/stock/AAPL`);
  console.log(`📰 News API: http://localhost:${PORT}/api/news/AAPL`);
  console.log(`❤️ Health: http://localhost:${PORT}/health\n`);
}); 