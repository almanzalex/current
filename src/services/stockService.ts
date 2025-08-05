import { StockData } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Add a global test function for debugging
(window as any).testStockAPI = async () => {
  console.log('=== Stock API Test ===');
  console.log('Backend URL:', BACKEND_URL);
  
  const url = `${BACKEND_URL}/api/stock/AAPL?timeRange=7d`;
  console.log('Test URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Could not parse error response' }));
      console.log('Error response:', errorData);
      return { error: errorData };
    }
    
    const data = await response.json();
    console.log('Success! Data:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch error:', error);
    return { error: error.message };
  }
};

export const stockService = {
  async getStockData(symbol: string, timeRange: string): Promise<StockData[]> {
    try {
      // clean up symbol format
      const formattedSymbol = symbol.trim().toUpperCase();
      const url = `${BACKEND_URL}/api/stock/${formattedSymbol}?timeRange=${timeRange}`;
      
      console.log('Stock Service: Making request to:', url);

      // call backend with time range
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Stock Service: Response status:', response.status, response.statusText);
      console.log('Stock Service: Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log('Stock Service: Error data:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const stockData: StockData[] = await response.json();
      console.log('Stock Service: Received data:', stockData);
      console.log('Stock Service: Data length:', stockData.length);
      
      return stockData;
    } catch (error: any) {
      console.error('Stock Service: Error caught:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Backend server is not running. Please start the backend server on port 3001.');
      }
      
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
  },
}; 