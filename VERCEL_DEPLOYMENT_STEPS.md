# 🚀 Deploy to Vercel - Complete Guide

## Overview
Deploy both your Smart Healthcare System backend and frontend on Vercel using two separate projects for better management.

## 📋 Prerequisites
- ✅ Code is on GitHub: https://github.com/NematSachdeva/Smart-Healthcare-System
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Environment variables ready

---

## 🔧 Method 1: Separate Deployments (Recommended)

### Step 1: Deploy Backend API

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub account

2. **Create New Project**
   - Click "New Project"
   - Click "Import" next to `Smart-Healthcare-System`

3. **Configure Backend Project**
   - **Project Name**: `smart-healthcare-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install` (leave default)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install` (leave default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
   GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
   JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
   NODE_ENV=production
   ```

5. **Deploy Backend**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - **Copy your backend URL**: `https://smart-healthcare-backend.vercel.app`

### Step 2: Deploy Frontend App

1. **Create Another New Project**
   - Go back to Vercel Dashboard
   - Click "New Project" again
   - Click "Import" next to `Smart-Healthcare-System` (same repo)

2. **Configure Frontend Project**
   - **Project Name**: `smart-healthcare-frontend`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=https://smart-healthcare-backend.vercel.app/api
   ```
   *(Replace with your actual backend URL from Step 1)*

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - **Your app is live**: `https://smart-healthcare-frontend.vercel.app`

---

## 🔧 Method 2: Monorepo Deployment (Single Project)

### Step 1: Deploy Full Stack Project

1. **Create New Project**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import `Smart-Healthcare-System`

2. **Configure Monorepo**
   - **Project Name**: `smart-healthcare-system`
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm install`

3. **Add All Environment Variables**
   ```
   # Backend Variables
   MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
   GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
   JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
   NODE_ENV=production
   
   # Frontend Variables
   REACT_APP_API_URL=https://your-project-name.vercel.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Both frontend and backend will be available at same URL
   - Frontend: `https://your-project-name.vercel.app`
   - Backend API: `https://your-project-name.vercel.app/api`

---

## 📝 Detailed Step-by-Step Instructions

### Option A: Separate Deployments (Easier Management)

#### Deploy Backend First:

1. **Vercel Dashboard** → **New Project**
2. **Import Repository** → Select `Smart-Healthcare-System`
3. **Project Settings**:
   ```
   Project Name: smart-healthcare-backend
   Framework: Other
   Root Directory: backend
   Build Command: (leave default)
   Output Directory: (leave empty)
   ```

4. **Environment Variables** → **Add**:
   ```
   MONGO_URI → mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
   GEMINI_API_KEY → AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
   JWT_SECRET → 1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
   NODE_ENV → production
   ```

5. **Deploy** → **Copy Backend URL**

#### Deploy Frontend Second:

1. **Vercel Dashboard** → **New Project**
2. **Import Repository** → Select `Smart-Healthcare-System` (same repo)
3. **Project Settings**:
   ```
   Project Name: smart-healthcare-frontend
   Framework: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```

4. **Environment Variables** → **Add**:
   ```
   REACT_APP_API_URL → https://your-backend-url.vercel.app/api
   ```

5. **Deploy** → **Your App is Live!**

---

## 🔐 Environment Variables Reference

### Backend Environment Variables
```env
MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
NODE_ENV=production
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

---

## 🧪 Testing Your Deployment

### Test Backend API
```bash
# Health check
curl https://your-backend-url.vercel.app/health

# API info
curl https://your-backend-url.vercel.app/api
```

### Test Frontend
1. Visit your frontend URL
2. Try registering as a patient
3. Try logging in
4. Check browser console for errors

### Test Full Integration
1. Register as patient and doctor
2. Book an appointment
3. Generate AI prescription
4. View prescriptions

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

**1. "Function Exceeded Maximum Duration"**
- Vercel free tier has 10-second timeout
- Optimize database queries
- Consider upgrading to Pro plan

**2. CORS Errors**
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

**3. API Routes Not Working**
- Ensure routes start with `/api`
- Check `vercel.json` configuration
- Verify environment variables

**4. Build Failures**
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Fix any TypeScript/ESLint errors

**5. Environment Variables Not Loading**
- Check variable names (no typos)
- Redeploy after adding variables
- Use `REACT_APP_` prefix for frontend

---

## 📊 Vercel Free Tier Limits

- **Serverless Functions**: 10-second execution limit
- **Bandwidth**: 100GB/month
- **Build Execution**: 6000 minutes/month
- **Edge Requests**: 1M/month
- **Source Files**: 32MB max per deployment

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically redeploys both projects
```

---

## 🎯 Deployment Checklist

### Before Deployment:
- [ ] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] MongoDB Atlas accessible
- [ ] Gemini API key valid

### After Backend Deployment:
- [ ] Backend URL accessible
- [ ] Health endpoint works: `/health`
- [ ] API endpoints work: `/api`
- [ ] Database connection successful
- [ ] Gemini AI service working

### After Frontend Deployment:
- [ ] Frontend loads correctly
- [ ] API calls work (check Network tab)
- [ ] Authentication works
- [ ] All pages accessible
- [ ] Mobile responsive

### Full System Test:
- [ ] Patient registration works
- [ ] Doctor registration works
- [ ] Appointment booking works
- [ ] AI prescription generation works
- [ ] Admin panel accessible

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel:

1. **Buy Domain** (Namecheap, GoDaddy, etc.)
2. **Vercel Project** → **Settings** → **Domains**
3. **Add Domain** → Follow DNS instructions
4. **Update Environment Variables** with new domain

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Issues**: Create issue in your repository

---

## 🚀 Quick Commands Summary

```bash
# 1. Ensure code is pushed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main

# 2. Go to Vercel Dashboard
# https://vercel.com/dashboard

# 3. Deploy Backend
# New Project → Import → Configure → Add Env Vars → Deploy

# 4. Deploy Frontend  
# New Project → Import → Configure → Add API URL → Deploy

# 5. Test everything!
```

---

## 🎉 Expected Results

After successful deployment:

- **Backend API**: `https://smart-healthcare-backend.vercel.app`
- **Frontend App**: `https://smart-healthcare-frontend.vercel.app`
- **Features**: All working (auth, appointments, AI prescriptions)
- **Performance**: Fast loading with CDN
- **Security**: HTTPS enabled automatically
- **Monitoring**: Built-in analytics and logs

Your Smart Healthcare System will be live and accessible worldwide! 🌍

---

**Ready to deploy?** Start with Method 1 (Separate Deployments) for easier management and debugging! 🚀