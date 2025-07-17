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
      // Calculate from and to timestamps
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

      // Ensure symbol is properly formatted
      const formattedSymbol = symbol.trim().toUpperCase();

      const response = await finnhubClient.get('/stock/candle', {
        params: {
          symbol: formattedSymbol,
          resolution: resolution,
          from: from,
          to: to,
        },
      });

      if (response.data.s === 'no_data') {
        throw new Error(`No data available for symbol ${formattedSymbol}`);
      }

      if (response.data.s !== 'ok') {
        throw new Error(`Invalid response from Finnhub API for symbol ${formattedSymbol}`);
      }

      return response.data.t.map((timestamp: number, index: number) => ({
        timestamp,
        price: response.data.c[index],
        volume: response.data.v[index],
      }));
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.response.status === 403) {
          throw new Error('Invalid API key or unauthorized access.');
        }
        throw new Error(`API Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from Finnhub API. Please check your connection.');
      }
      throw error;
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