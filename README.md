# Current - Real-Time News + Social + Stock Sentiment Visualizer

A real-time dashboard that correlates news articles, social media sentiment, and stock market data for any given keyword or company.

## Features

- Real-time news articles from NewsAPI
- Social media sentiment analysis from Twitter/X API
- Stock market data visualization from Finnhub
- Interactive timeline correlation of all data sources
- Sentiment analysis of social media posts
- Beautiful, responsive UI with real-time updates

## Prerequisites

- Node.js and npm installed
- API keys for:
  - NewsAPI
  - Twitter/X API
  - Finnhub API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_NEWS_API_KEY=your_news_api_key
   REACT_APP_TWITTER_API_KEY=your_twitter_api_key
   REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
  ├── components/        # React components
  ├── services/         # API and data services
  ├── store/           # State management
  ├── types/           # TypeScript type definitions
  ├── utils/           # Utility functions
  └── App.tsx          # Root component
```

## Technologies Used

- React with TypeScript
- Chart.js for data visualization
- Tailwind CSS for styling
- Zustand for state management
- Axios for API requests