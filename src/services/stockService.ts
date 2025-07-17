import { StockData } from '../types';

const BACKEND_URL = 'http://localhost:3001';

// Debug logging
console.log('StockService Debug:');
console.log('Backend URL:', BACKEND_URL);
console.log('Using real API data via backend server');

export const stockService = {
  async getStockData(symbol: string, timeRange: string): Promise<StockData[]> {
    try {
      console.log(`Fetching real stock data for symbol: ${symbol}`);
      
      // Ensure symbol is properly formatted
      const formattedSymbol = symbol.trim().toUpperCase();
      console.log(`Formatted symbol: ${formattedSymbol}`);

      // Call the backend API
      const response = await fetch(`${BACKEND_URL}/api/stock/${formattedSymbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const stockData: StockData[] = await response.json();
      console.log(`Received ${stockData.length} real data points for ${formattedSymbol}`);
      
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