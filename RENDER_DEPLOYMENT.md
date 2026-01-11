# 🚀 Render Deployment Guide

## Step 1: Deploy Backend + Database (Blueprint)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)**
2. Click **New +** → **Blueprint**
3. Connect your repo: `sanjaysunil14/Week-5-Test`
4. Click **Apply**

This will create:
- ✅ PostgreSQL Database (`farmer-buyer-db`)
- ✅ Backend Service (Docker)

**After deployment:** Add these environment variables manually in the backend service:
- `TWILIO_ACCOUNT_SID`: `YOUR_TWILIO_SID`
- `TWILIO_AUTH_TOKEN`: `YOUR_TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`: `YOUR_TWILIO_NUMBER`
- `GEMINI_API_KEY`: `YOUR_GEMINI_API_KEY`
- `DEV_TEST_NUMBER`: `YOUR_PHONE_NUMBER`

---

## Step 2: Deploy Frontend (Manual - 2 Minutes)

1. In Render dashboard, click **New +** → **Static Site**
2. Connect the same repo: `sanjaysunil14/Week-5-Test`
3. Configure:
   - **Name**: `farmer-buyer-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-NAME.onrender.com` (copy from your backend service URL)
5. Click **Create Static Site**

---

## Step 3: Update Backend FRONTEND_URL

After the frontend deploys, copy its URL (e.g., `https://farmer-buyer-frontend.onrender.com`).

Go to your **Backend Service** → **Environment** → Edit `FRONTEND_URL` to match the actual frontend URL.

---

## ✅ Done!

Your app is now live! 🎉

- **Frontend**: https://farmer-buyer-frontend.onrender.com
- **Backend**: https://farmer-buyer-backend.onrender.com
