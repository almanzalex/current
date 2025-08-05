# Deployment Guide

## Backend Deployment on Render

### 1. Prerequisites
- GitHub account
- Render account (free tier available)
- Your API keys ready

### 2. Deploy Backend to Render

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

2. **Create Render Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `your-app-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`

3. **Set Environment Variables** in Render dashboard:
   ```
   ALPHA_VANTAGE_API_KEY=9HDHBOMPEKMCCPZ0
   NEWS_API_KEY=0d1612bb8edc4f2393e69b566f80a3aa
   OPENAI_API_KEY=your_openai_key_here
   NODE_ENV=production
   ```

### 3. Update Frontend Configuration

Once backend is deployed, you'll get a URL like: `https://your-backend-name.onrender.com`

**For local development** - create `.env` file in project root:
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

**For production deployment** - update to:
```
REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
```

### 4. Deploy Frontend to Render

1. **Create another Render Web Service** for frontend:
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
     ```

### 5. Test Deployment

Visit your frontend URL and test:
- Stock data loading
- News articles
- Reddit discussions
- All API endpoints working

## Notes

- Render free tier may have cold starts (takes ~30 seconds to wake up)
- API keys are already configured for basic functionality
- OpenAI API is optional - app works without it
- Backend handles CORS for frontend domains automatically 