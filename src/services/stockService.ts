import axios from 'axios';
import { StockData } from '../types';

const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
const FINNHUB_API_BASE_URL = 'https://finnhub.io/api/v1';

// Configure axios defaults for Finnhub
const finnhubClient = axios.create({
  baseURL: FINNHUB_API_BASE_URL,
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY,
  },
});

export const stockService = {
  async getStockData(symbol: string, timeRange: string): Promise<StockData[]> {
    try {
      // Ensure symbol is properly formatted
      const formattedSymbol = symbol.trim().toUpperCase();

      // Get real-time quote first
      const quoteResponse = await finnhubClient.get('/quote', {
        params: {
          symbol: formattedSymbol,
        },
      });

      if (!quoteResponse.data || typeof quoteResponse.data.c !== 'number') {
        throw new Error(`No quote data available for symbol ${formattedSymbol}`);
      }

      // Calculate from and to timestamps for historical data
      const to = Math.floor(Date.now() / 1000);
      let from = to;
      
      switch (timeRange) {
        case '1h':
          from = to - 3600;
          break;
        case '24h':
          from = to - 86400;
          break;
        case '7d':
          from = to - 604800;
          break;
        case '30d':
          from = to - 2592000;
          break;
      }

      const resolution = timeRange === '1h' ? '1' : timeRange === '24h' ? '15' : 'D';

      // Get historical data
      const candleResponse = await finnhubClient.get('/stock/candle', {
        params: {
          symbol: formattedSymbol,
          resolution: resolution,
          from: from,
          to: to,
        },
      });

      if (candleResponse.data.s === 'no_data') {
        // If no historical data, return just the current quote
        return [{
          timestamp: Math.floor(Date.now() / 1000),
          price: quoteResponse.data.c,
          volume: 0,
        }];
      }

      if (candleResponse.data.s !== 'ok') {
        throw new Error(`Invalid response from Finnhub API for symbol ${formattedSymbol}`);
      }

      // Combine historical data with current quote
      const historicalData = candleResponse.data.t.map((timestamp: number, index: number) => ({
        timestamp,
        price: candleResponse.data.c[index],
        volume: candleResponse.data.v[index],
      }));

      // Add current quote if it's newer than the last historical data point
      const lastHistoricalTimestamp = historicalData[historicalData.length - 1]?.timestamp || 0;
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (currentTimestamp > lastHistoricalTimestamp) {
        historicalData.push({
          timestamp: currentTimestamp,
          price: quoteResponse.data.c,
          volume: 0,
        });
      }

      return historicalData;
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.response.status === 403) {
          throw new Error('Invalid API key or unauthorized access.');
        } else if (error.response.status === 426) {
          throw new Error('API upgrade required. Please check your API key and subscription.');
        }
        throw new Error(`API Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('No response received from Finnhub API. Please check your connection.');
      } else {
        throw error;
      }
    }
  },

  async getSymbol(query: string): Promise<string> {
    try {
      const response = await finnhubClient.get('/search', {
        params: {
          q: query.trim(),
        },
      });

      const results = response.data?.result;
      if (!results || !results.length) {
        throw new Error(`No symbol found for query: ${query}`);
      }

      // Find the best match (prefer exact matches and US exchanges)
      const bestMatch = results.find(
        (r: any) => r.symbol.toUpperCase() === query.trim().toUpperCase()
      ) || results[0];

      return bestMatch.symbol;
    } catch (error: any) {
      console.error('Error fetching symbol:', error);
      if (error.response) {
        if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.response.status === 403) {
          throw new Error('Invalid API key or unauthorized access.');
        }
        throw new Error(`API Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('No response received from Finnhub API. Please check your connection.');
      }
      throw error;
    }
  },
}; 