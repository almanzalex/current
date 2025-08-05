# Current - Local Stock Dashboard

A real-time financial dashboard that aggregates stock prices, news, and Reddit discussions in one clean interface. **Designed for local development** to access all features including Reddit sentiment analysis.

## What it does

Search for any stock symbol and get:
- **Live stock prices** with interactive charts (1h, 24h, 7d, 30d views)
- **Recent news articles** with AI-powered summaries
- **Reddit discussions** from investing communities (r/stocks, r/investing, r/wallstreetbets)
- **Sentiment analysis** of social discussions
- **Real-time market data** including volume and price changes

## Screenshots

![Dashboard Overview](assets/Screenshot%202025-07-28%20at%2011.34.17%20PM.png)
*Main dashboard showing stock data, news, and social discussions*

![Detailed View](assets/Screenshot%202025-07-28%20at%2011.34.34%20PM.png)
*Interactive charts with sentiment analysis*

## Local Development Setup

### Prerequisites
- Node.js (18+)
- API keys for:
  - Alpha Vantage (free at alphavantage.co)
  - News API (free at newsapi.org)
  - OpenAI (optional, for AI summaries)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd current
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # Required for local development
   REACT_APP_BACKEND_URL=http://localhost:3001
   
   # Optional: For AI summaries
   OPENAI_API_KEY=your_openai_key_here
   ```
   
   The backend API keys are already configured, but you can add your own in `backend/server.js`:
   ```javascript
   const ALPHA_VANTAGE_API_KEY = 'your_key_here';
   const NEWS_API_KEY = 'your_key_here';
   ```

4. **Start the application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend health: http://localhost:3001/health

## Features

### ✅ Stock Data
- Real-time price charts
- Multiple time ranges (1h, 24h, 7d, 30d)
- Volume and price change data
- Powered by Alpha Vantage API

### ✅ News Integration  
- Recent financial news
- AI-powered article summaries (with OpenAI key)
- Multiple news sources

### ✅ Reddit Social Sentiment
- Live Reddit discussions from investing communities
- Sentiment analysis of posts and comments
- Individual post sentiment scoring
- Overall sentiment metrics with confidence scores

### ✅ Interactive UI
- Real-time data updates
- Responsive design
- Clean, professional interface
- Error handling and loading states

## Architecture

**Frontend**: React + TypeScript + Tailwind CSS + Chart.js + Zustand  
**Backend**: Node.js + Express + Axios  
**APIs**: Alpha Vantage (stocks) + News API + Reddit scraping + OpenAI  
**Environment**: Local development focused

## Why Local Development?

This application is designed to run locally because:
- **Reddit Access**: Cloud servers are often blocked by Reddit, but local development has full access
- **API Flexibility**: No rate limiting from deployment platforms
- **Real-time Performance**: Direct local connections for faster data fetching
- **Full Feature Set**: All sentiment analysis and social features work without restrictions

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running: `curl http://localhost:3001/health`
- Check `.env` file has `REACT_APP_BACKEND_URL=http://localhost:3001`
- Restart both frontend and backend if needed

### Missing Data
- **Stock data**: Verify Alpha Vantage API key in `backend/server.js`
- **News**: Check News API key configuration
- **Reddit**: Should work automatically in local environment

### API Rate Limits
- Alpha Vantage: 5 calls per minute (free tier)
- News API: 1000 calls per day (free tier)
- Reddit: No API key needed, scraping-based

## Development Journey

### What inspired this project
I wanted to create a unified dashboard that combines traditional financial data with modern social sentiment. With Reddit's growing influence on retail trading, it felt important to build a tool that could track both market fundamentals and community discussions in real-time.

### Key challenges solved
- **Reddit Access**: Built robust local Reddit scraping with sentiment analysis
- **API Integration**: Unified different API formats into consistent interfaces  
- **Real-time Updates**: Synchronized multiple data sources efficiently
- **Local Performance**: Optimized for local development with full feature access

### What I learned
- Financial APIs have unique challenges (market hours, rate limits, data gaps)
- Social sentiment adds valuable context to traditional metrics
- Local development provides the best user experience for this type of application
- The importance of clear environment configuration for reliable setup

## Future Improvements

- Enhanced sentiment analysis using advanced NLP models
- Additional social platforms (Twitter, Discord)
- Historical sentiment tracking
- Portfolio management features
- WebSocket real-time data feeds
- Mobile-responsive enhancements