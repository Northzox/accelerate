# 🚀 Deployment Guide for Vercel

This guide will help you deploy the ValandWaffen application to Vercel (frontend) and a hosting service for your backend.

## 📋 Prerequisites

- GitHub repository with the code
- MongoDB database (MongoDB Atlas recommended)
- Vercel account (free)
- Backend hosting service (Railway, Render, or Heroku)

## 🎯 Step 1: Frontend Deployment (Vercel)

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 1.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `frontend`
5. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (we'll set this later)

### 1.3 Vercel Configuration
The project includes `vercel.json` for optimal deployment settings.

## 🖥️ Step 2: Backend Deployment Options

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/valandwaffen
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Deploy!

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create "Web Service"
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add same environment variables as Railway

### Option C: Heroku
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy with Git

## 🔧 Step 3: Connect Frontend to Backend

### 3.1 Update Frontend Environment
In Vercel dashboard:
1. Go to your project settings
2. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.railway.app`

### 3.2 Redeploy Frontend
1. Push a small change to trigger redeploy
2. Or manually redeploy in Vercel dashboard

## 📊 Step 4: Database Setup

### MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Create database user
4. Get connection string
5. Add to backend environment variables

## 🌐 Step 5: Final Configuration

### Update CORS Settings
Make sure your backend `.env` has:
```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Test Everything
1. Visit your Vercel app
2. Try registering/login
3. Test forum, chat, and tickets
4. Check browser console for errors

## 🔍 Troubleshooting

### Common Issues

**CORS Errors:**
- Check `FRONTEND_URL` in backend
- Ensure `NEXT_PUBLIC_API_URL` is correct in frontend

**API Connection Issues:**
- Verify backend is deployed and running
- Check environment variables
- Look at Vercel function logs

**Database Connection:**
- Verify MongoDB URI is correct
- Check database user permissions
- Ensure IP whitelist includes your backend host

**Build Failures:**
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## 📱 Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend (Railway/Render)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/valandwaffen
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=5000
```

## 🚀 Going Live

Once everything is working:

1. **Custom Domain** (optional):
   - Add custom domain in Vercel
   - Update CORS settings if needed

2. **SSL Certificates**:
   - Vercel provides automatic SSL
   - Backend hosts usually provide SSL too

3. **Monitoring**:
   - Set up error monitoring (Sentry)
   - Monitor database usage
   - Check API response times

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check backend service logs
3. Verify all environment variables
4. Test API endpoints directly
5. Check MongoDB connection

Your ValandWaffen application should now be live and accessible to users! 🎉
