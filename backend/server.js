const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// openai setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateSummary(content, type = 'article') {
  try {
    const prompt = type === 'article' 
      ? `Summarize this in 2-3 sentences, focus on financial impact:\n\n${content}`
      : `Quick summary in 1-2 sentences:\n\n${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Short financial summaries only. Stay factual." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Keys
const ALPHA_VANTAGE_API_KEY = 'RS9IVVUP8KI6N4QH';
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY || '0d1612bb8edc4f2393e69b566f80a3aa';

console.log('Starting server...');
console.log('Alpha Vantage API:', ALPHA_VANTAGE_API_KEY ? 'OK' : 'missing');
console.log('News API:', NEWS_API_KEY ? 'OK' : 'missing');

// Stock API Route
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange = '7d' } = req.query;

    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({ error: 'Alpha Vantage API key not configured' });
    }

    const config = {
      '1h': { function: 'TIME_SERIES_DAILY', interval: 'daily' },
      '24h': { function: 'TIME_SERIES_INTRADAY', interval: '60min' },
      '7d': { function: 'TIME_SERIES_DAILY', interval: 'daily' },
      '30d': { function: 'TIME_SERIES_DAILY', interval: 'daily' }
    };
    const { function: function_name, interval } = config[timeRange] || config['7d'];

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: function_name,
        symbol: symbol.toUpperCase(),
        interval,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact'
      }
    });

    if (response.data['Error Message']) {
      return res.status(404).json({ error: response.data['Error Message'] });
    }
    if (response.data['Note']) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
    }

    const timeSeriesData = function_name === 'TIME_SERIES_INTRADAY' 
      ? response.data[`Time Series (${interval})`]
      : response.data['Time Series (Daily)'];

    if (!timeSeriesData) {
      return res.status(404).json({ error: `No data found for symbol ${symbol}` });
    }

    const dataPoints = Object.entries(timeSeriesData)
      .map(([date, data]) => ({
        timestamp: new Date(date).getTime() / 1000,
        price: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const getLimitedData = () => {
      if (timeRange === '1h') {
        const mostRecentData = dataPoints[dataPoints.length - 1];
        if (!mostRecentData) return dataPoints.slice(-1);
        
        const currentTime = Math.floor(Date.now() / 1000);
        return Array.from({ length: 12 }, (_, i) => ({
          timestamp: currentTime - (11 - i) * 300,
          price: mostRecentData.price,
          volume: Math.floor(mostRecentData.volume / 12)
        }));
      }
      
      const sliceMap = { '24h': -24, '7d': -7, '30d': -30 };
      return dataPoints.slice(sliceMap[timeRange] || -7);
    };
    
    const limitedDataPoints = getLimitedData();


    res.json(limitedDataPoints);
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

    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const from = new Date();
    from.setDate(from.getDate() - 7);

    const searchQueries = [`${searchTerm} stock`, `${searchTerm} earnings`, `${searchTerm} news`, searchTerm];

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
        continue;
      }
    }
    const uniqueArticles = allArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 10);

    const articlesWithSummaries = await Promise.all(
      uniqueArticles.map(async (article) => {
        const content = `Title: ${article.title}\n\nDescription: ${article.description}`;
        const aiSummary = await generateSummary(content, 'article');
        return { ...article, aiSummary };
      })
    );

    res.json(articlesWithSummaries);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news data',
      details: error.response?.data || error.message 
    });
  }
});

// Helper function to calculate sentiment
function calculateSentiment(text) {
  const lowerText = text.toLowerCase();
  const positiveWords = ['buy', 'bull', 'bullish', 'up', 'gain', 'profit', 'good', 'great', 'excellent', 'strong', 'rise', 'moon'];
  const negativeWords = ['sell', 'bear', 'bearish', 'down', 'loss', 'bad', 'terrible', 'weak', 'drop', 'crash', 'fall'];
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 0.5;
  if (negativeCount > positiveCount) return -0.5;
  return 0;
}

// Social media endpoint - Reddit scraping
app.get('/api/social/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    
    const results = [];
    const subreddits = ['stocks', 'StockMarket', 'investing', 'wallstreetbets'];
    
    for (const subreddit of subreddits) {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchTerm)}&sort=new&limit=5&t=week`;
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 10000
        });

        if (response.data && response.data.data && response.data.data.children) {
          const posts = response.data.data.children.map(post => ({
            title: post.data.title,
            content: post.data.selftext || '',
            url: `https://reddit.com${post.data.permalink}`,
            score: post.data.score,
            subreddit: post.data.subreddit,
            created: new Date(post.data.created_utc * 1000).toISOString(),
            sentiment: calculateSentiment(post.data.title + ' ' + (post.data.selftext || ''))
          }));
          
          results.push(...posts);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.error(`Error fetching from r/${subreddit}:`, err.message);
      }
    }
    
    // Sort by date and limit
    const sortedResults = results
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 10);
    
    res.json(sortedResults);
  } catch (error) {
    console.error('Social endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch social data' });
  }
});

// Sentiment API Route
app.get('/api/sentiment/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const socialResponse = await axios.get(`http://localhost:3001/api/social/${encodeURIComponent(searchTerm)}`);
    const socialPosts = socialResponse.data;

    if (!socialPosts?.length) {
      return res.json({
        sentiment: 0, confidence: 0, totalPosts: 0,
        positivePosts: 0, negativePosts: 0, neutralPosts: 0
      });
    }
    let totalSentiment = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    socialPosts.forEach(post => {
      const sentiment = post.sentiment?.score || 0;
      totalSentiment += sentiment;
      
      if (sentiment > 0.1) positiveCount++;
      else if (sentiment < -0.1) negativeCount++;
      else neutralCount++;
    });

    const averageSentiment = totalSentiment / socialPosts.length;
    const confidence = Math.abs(averageSentiment);

    res.json({
      sentiment: Math.max(-1, Math.min(1, averageSentiment)), // keep in -1 to 1 range
      confidence: Math.min(1, confidence),
      total: socialPosts.length,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount
    });
  } catch (error) {
    console.error('Sentiment API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to calculate sentiment',
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
      alphaVantage: ALPHA_VANTAGE_API_KEY ? 'configured' : 'missing',
      news: NEWS_API_KEY ? 'configured' : 'missing',
      social: 'reddit-scraping'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 