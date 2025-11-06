# 🚀 Deployment Guide - Smart Healthcare System

## Overview
Deploy your Smart Healthcare System with separate deployments for backend and frontend using free hosting services.

## 📋 Deployment Options

### Backend Deployment Options:
1. **Render** (Recommended - Free tier available)
2. **Railway** (Free tier available)
3. **Heroku** (Paid)
4. **Vercel** (Serverless functions)

### Frontend Deployment Options:
1. **Netlify** (Recommended - Free tier)
2. **Vercel** (Free tier)
3. **GitHub Pages** (Free, but limited)
4. **Surge.sh** (Free)

---

## 🔧 Method 1: Render (Backend) + Netlify (Frontend)

### Step 1: Deploy Backend on Render

1. **Create Render Account**
   - Go to: https://render.com
   - Sign up with GitHub account

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `Smart-Healthcare-System`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Configure Environment Variables**
   ```
   MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
   GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
   JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-app-name.onrender.com`

### Step 2: Deploy Frontend on Netlify

1. **Create Netlify Account**
   - Go to: https://netlify.com
   - Sign up with GitHub account

2. **Deploy from GitHub**
   - Click "New site from Git"
   - Choose GitHub → Select `Smart-Healthcare-System`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

3. **Configure Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment (3-5 minutes)
   - Note your frontend URL: `https://your-app-name.netlify.app`

---

## 🔧 Method 2: Railway (Backend) + Vercel (Frontend)

### Step 1: Deploy Backend on Railway

1. **Create Railway Account**
   - Go to: https://railway.app
   - Sign up with GitHub account

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `Smart-Healthcare-System`
   - Choose "backend" folder

3. **Configure Environment Variables**
   - Go to Variables tab
   - Add all environment variables (same as above)

4. **Configure Port**
   - Railway automatically assigns PORT
   - Your app will be available at: `https://your-app.railway.app`

### Step 2: Deploy Frontend on Vercel

1. **Create Vercel Account**
   - Go to: https://vercel.com
   - Sign up with GitHub account

2. **Import Project**
   - Click "New Project"
   - Import `Smart-Healthcare-System`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`

3. **Configure Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at: `https://your-app.vercel.app`

---

## 🔧 Method 3: GitHub Pages (Frontend Only)

**Note**: GitHub Pages only supports static sites, so you'll need a separate backend hosting.

### Step 1: Prepare Frontend for GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add to `frontend/package.json`:
   ```json
   {
     "homepage": "https://NematSachdeva.github.io/Smart-Healthcare-System",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy to GitHub Pages**
   ```bash
   cd frontend
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to Pages section
   - Source: Deploy from branch
   - Branch: gh-pages
   - Folder: / (root)

---

## 📝 Step-by-Step Instructions

### Quick Deployment (Recommended)

#### Backend on Render:

1. **Sign up**: https://render.com (use GitHub)
2. **New Web Service** → Connect GitHub → Select repository
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (see above)
5. **Deploy** → Copy backend URL

#### Frontend on Netlify:

1. **Sign up**: https://netlify.com (use GitHub)
2. **New site from Git** → GitHub → Select repository
3. **Configure**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
4. **Add Environment Variable**:
   - `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`
5. **Deploy** → Your app is live!

---

## 🔐 Environment Variables Reference

### Backend Variables
```env
MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
NODE_ENV=production
PORT=10000
```

### Frontend Variables
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. CORS Errors**
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

**2. API Not Found**
- Ensure backend URL ends with `/api`
- Check environment variables are set correctly
- Verify backend is running and accessible

**3. Build Failures**
- Check all dependencies are in `package.json`
- Ensure no syntax errors
- Check build logs for specific errors

**4. Environment Variables Not Loading**
- Verify variable names (no typos)
- Redeploy after adding variables
- Use `REACT_APP_` prefix for frontend variables

### Testing Deployment

**Test Backend**:
```bash
curl https://your-backend-url.onrender.com/health
```

**Test Frontend**:
- Visit your frontend URL
- Try login/register
- Check browser console for errors

---

## 📊 Free Tier Limits

### Render (Backend)
- **Free Tier**: 750 hours/month
- **Sleep**: Apps sleep after 15 minutes of inactivity
- **Memory**: 512 MB RAM
- **Build Time**: 500 minutes/month

### Netlify (Frontend)
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 300 minutes/month
- **Sites**: Unlimited
- **Forms**: 100 submissions/month

### Railway (Backend)
- **Free Tier**: $5 credit/month
- **Usage-based**: Pay for what you use
- **No sleep**: Apps stay awake

---

## 🔄 Continuous Deployment

Both platforms support automatic deployment:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
# Platforms automatically redeploy
```

---

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Database connection working
- [ ] AI service (Gemini) working
- [ ] Authentication working
- [ ] All features tested
- [ ] Custom domain configured (optional)

---

## 🌐 Custom Domain (Optional)

### Netlify Custom Domain
1. **Buy Domain** (Namecheap, GoDaddy, etc.)
2. **Netlify Dashboard** → **Domain Settings**
3. **Add Custom Domain** → Follow DNS instructions

### Render Custom Domain
1. **Render Dashboard** → **Settings** → **Custom Domains**
2. **Add Domain** → Configure DNS records

---

## 📞 Support Links

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs

---

## 🚀 Quick Commands

```bash
# Test locally first
cd backend && npm start
cd frontend && npm start

# Deploy to GitHub (triggers auto-deployment)
git add .
git commit -m "Deploy to production"
git push origin main
```

Your Smart Healthcare System will be live and accessible worldwide! 🌍

## 🎉 Expected Results

After deployment:
- **Backend API**: `https://your-app.onrender.com`
- **Frontend App**: `https://your-app.netlify.app`
- **Features**: All working (login, appointments, AI prescriptions)
- **Mobile**: Responsive on all devices
- **Secure**: HTTPS enabled automatically

Ready to deploy? Start with Method 1 (Render + Netlify) for the best free experience! 🚀