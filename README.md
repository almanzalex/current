# Current - Stock Dashboard

A simple stock dashboard that shows real-time price data, news, and social sentiment from Reddit discussions.

## What it does

Search for any stock symbol and get:
- **Live stock prices** with interactive charts (1h, 24h, 7d, 30d views)
- **Recent news articles** about the company
- **Reddit sentiment analysis** from investing communities
- **Basic stock insights** like price changes and volume

## Screenshots

*Screenshots and demo videos will be added to `/assets` folder*

## Live Demo

*Deployed application link coming soon*

## Setup Instructions

### Prerequisites
- Node.js
- API keys for:
  - Alpha Vantage (free at alphavantage.co)
  - News API (free at newsapi.org)
  - OpenAI (optional, for summaries)

### Installation

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd current
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up environment variables**
   Create `.env` file in root:
   ```
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   NEWS_API_KEY=your_news_api_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend  
   npm start
   ```

5. **Open your browser**
   Go to `http://localhost:3000`

## Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repo
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

2. **Add Environment Variables**
   ```
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   NEWS_API_KEY=your_news_api_key
   OPENAI_API_KEY=your_openai_key
   PORT=10000
   ```

3. **Note your backend URL** (e.g., `https://your-app-name.onrender.com`)

### Frontend Deployment 

1. **Set environment variable for frontend**
   - Create `.env` file in root directory:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
   ```

2. **Deploy frontend on Vercel/Netlify**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Add environment variable: `REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com`

### Common Issues

- **Backend sleeping**: Render free tier sleeps after 15 minutes. First request may be slow.
- **CORS errors**: Make sure backend allows your frontend domain.
- **Environment variables**: Double-check all API keys are set correctly.

## Tech Stack

**Frontend:**
- React with TypeScript
- Chart.js for graphs
- Tailwind CSS for styling
- Zustand for state management

**Backend:**
- Node.js with Express
- Axios for API calls
- Reddit scraping for social data

## Learning Journey

### What inspired this project

I wanted to build something that combines different types of financial data in one place. Most stock apps just show prices, but I was curious about how social media sentiment might correlate with stock movements. Reddit has become a huge influence on retail trading, so I thought it would be interesting to track that alongside traditional metrics.

### Potential impact

For retail investors, this could help them:
- **Save time** by seeing news, prices, and sentiment in one dashboard
- **Make more informed decisions** by considering social sentiment alongside traditional data
- **Spot trending discussions** about stocks they're interested in

For the broader community, it shows how social media has become a real factor in modern investing, and tools like this could help people understand that relationship better.

### What I learned

**Alpha Vantage API:** This was my first time working with financial data APIs. I learned how to handle different time series formats and deal with rate limiting. The biggest challenge was figuring out how to generate consistent 1-hour data when markets are closed.

**Reddit scraping:** Since Reddit doesn't have an official finance API, I had to learn how to scrape their JSON endpoints responsibly. This taught me about handling different data structures and implementing basic sentiment analysis.

**Data management:** Managing multiple API calls and keeping data in sync was trickier than expected. I learned about Promise.all() for parallel requests and how to structure state management for complex data flows.

### Why I chose these technologies

- **React + TypeScript:** Wanted type safety for handling financial data
- **Chart.js:** Needed something reliable for time-series charts
- **Express:** Simple backend that could handle multiple API integrations
- **Tailwind:** Wanted to focus on functionality over custom CSS

### Challenges and lessons

**API rate limits:** Alpha Vantage has strict limits, so I had to implement smart caching and data reuse. Learned the importance of reading API docs carefully.

**Data inconsistency:** Different APIs return data in different formats and timezones. Spent a lot of time normalizing everything to work together smoothly.

**Reddit sentiment:** Basic keyword matching isn't perfect for sentiment analysis, but it gives a decent approximation. Made me appreciate how complex natural language processing really is.

**State management:** With multiple data sources updating at different rates, keeping the UI in sync was challenging. Learned a lot about when to fetch new data vs. reuse existing data.

**Error handling:** Financial APIs can fail or return unexpected data. Building robust error handling taught me to always expect the unexpected when dealing with external services.

The biggest lesson was that building something that "just works" requires handling a lot of edge cases you don't think about initially. But seeing it all come together and actually being useful made it worth the effort.

## Future improvements

- Better sentiment analysis (maybe integrate a proper NLP service)
- More social platforms beyond Reddit
- Portfolio tracking features
- Price alerts and notifications
- Mobile-responsive design improvements