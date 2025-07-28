import { StockData } from '../types';

const BACKEND_URL = 'http://localhost:3001';



export const stockService = {
  async getStockData(symbol: string, timeRange: string): Promise<StockData[]> {
    try {
      // clean up symbol format
      const formattedSymbol = symbol.trim().toUpperCase();

      // call backend with time range
      const response = await fetch(`${BACKEND_URL}/api/stock/${formattedSymbol}?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const stockData: StockData[] = await response.json();
      return stockData;
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
  },
}; 