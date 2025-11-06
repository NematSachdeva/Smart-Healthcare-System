# 🚀 Vercel Deployment - Quick Steps

## ✅ Ready to Deploy!

Your repository now has all Vercel configuration files. Follow these simple steps:

### Step 1: Deploy Backend (5 minutes)

1. **Go to Vercel**: https://vercel.com/dashboard
2. **New Project** → Import `Smart-Healthcare-System`
3. **Configure**:
   - Project Name: `smart-healthcare-backend`
   - Framework: Other
   - Root Directory: `backend`
4. **Add Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://nematsachdevacollege0009_db_user:JaiGauriShankar@healthcarecluster.1ofmwtq.mongodb.net/?appName=HealthcareCluster
   GEMINI_API_KEY=AIzaSyCnpP_GiBSrW0pZ2pGEg24dRuBoy22NMEw
   JWT_SECRET=1542361a6e72144279d56e661586ea18a12910201453eeea49411fe3eb1ebdbe
   NODE_ENV=production
   ```
5. **Deploy** → Copy backend URL

### Step 2: Deploy Frontend (3 minutes)

1. **New Project** → Import `Smart-Healthcare-System` (same repo)
2. **Configure**:
   - Project Name: `smart-healthcare-frontend`
   - Framework: Create React App
   - Root Directory: `frontend`
3. **Add Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```
4. **Deploy** → Your app is live!

### Step 3: Test (2 minutes)

- Visit your frontend URL
- Try login/register
- Test AI prescription generation

## 🎯 Expected URLs

- **Backend**: `https://smart-healthcare-backend.vercel.app`
- **Frontend**: `https://smart-healthcare-frontend.vercel.app`

## 📚 Complete Guide

For detailed instructions, see: `VERCEL_DEPLOYMENT_STEPS.md`

---

**Total Time**: ~10 minutes to go live! 🚀