import axios from 'axios';
import { StockData } from '../types';

const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
const FINNHUB_API_BASE_URL = 'https://finnhub.io/api/v1';

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

      const response = await axios.get(`${FINNHUB_API_BASE_URL}/stock/candle`, {
        params: {
          symbol: symbol.toUpperCase(),
          resolution: resolution,
          from: from,
          to: to,
          token: FINNHUB_API_KEY,
        },
      });

      if (response.data.s !== 'ok') {
        throw new Error('Invalid response from Finnhub API');
      }

      return response.data.t.map((timestamp: number, index: number) => ({
        timestamp,
        price: response.data.c[index],
        volume: response.data.v[index],
      }));
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  },

  // Helper function to get stock symbol from company name
  async getSymbol(query: string): Promise<string> {
    try {
      const response = await axios.get(`${FINNHUB_API_BASE_URL}/search`, {
        params: {
          q: query,
          token: FINNHUB_API_KEY,
        },
      });

      if (!response.data.result?.[0]?.symbol) {
        throw new Error('No symbol found for the given query');
      }

      return response.data.result[0].symbol;
    } catch (error) {
      console.error('Error fetching symbol:', error);
      throw error;
    }
  },
}; 