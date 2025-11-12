# Deployment Guide

This guide will help you deploy the WebRTC Video Chat application to free hosting platforms so your teammates can test it.

## Option 1: Render (Recommended)

Render offers free web service hosting with WebSocket support. Perfect for this application.

### Steps:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Sign up for Render**:
   - Go to https://render.com
   - Sign up with your GitHub account (free)

3. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `webrtc_video_chat` repository

4. **Configure the service**:
   - **Name**: `webrtc-video-chat` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free" (0$/month)

5. **Add Environment Variables**:
   - Click "Advanced" or go to "Environment" tab
   - Add these variables:
     - `ANTHROPIC_API_KEY`: Your Claude API key
     - `AI_AGENT_NAME`: `La Piazza Restaurant Assistant`
     - `AI_AGENT_PERSONALITY`: `professional restaurant reservation agent for La Piazza Italian restaurant`

6. **Deploy**:
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your app will be available at: `https://your-app-name.onrender.com`

### Important Notes:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Perfect for testing and demos

---

## Option 2: Railway

Railway is another great free hosting option with good WebSocket support.

### Steps:

1. **Push your code to GitHub** (if not already done)

2. **Sign up for Railway**:
   - Go to https://railway.app
   - Sign up with your GitHub account (free)

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `webrtc_video_chat` repository

4. **Configure Environment Variables**:
   - Go to your service → "Variables" tab
   - Add:
     - `ANTHROPIC_API_KEY`: Your Claude API key
     - `AI_AGENT_NAME`: `La Piazza Restaurant Assistant`
     - `AI_AGENT_PERSONALITY`: `professional restaurant reservation agent for La Piazza Italian restaurant`

5. **Deploy**:
   - Railway auto-deploys
   - Get your URL from "Settings" → "Domains"
   - Click "Generate Domain"

### Important Notes:
- Free tier: $5 credit/month (usually enough for testing)
- Better performance than Render's free tier
- No sleep mode

---

## Option 3: Fly.io

Fly.io offers free tier with 3 shared VMs.

### Steps:

1. **Install Fly CLI**:
   ```bash
   # macOS
   brew install flyctl

   # Or via curl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and Login**:
   ```bash
   flyctl auth signup
   # Or login if you have an account
   flyctl auth login
   ```

3. **Launch your app**:
   ```bash
   cd /Users/adamwang/Learning/webrtc_video_chat
   flyctl launch
   ```

   Answer the prompts:
   - App name: Choose a name or press Enter for random
   - Region: Choose closest to you
   - PostgreSQL: No
   - Redis: No
   - Deploy now: Yes

4. **Set Environment Variables**:
   ```bash
   flyctl secrets set ANTHROPIC_API_KEY="your-api-key-here"
   flyctl secrets set AI_AGENT_NAME="La Piazza Restaurant Assistant"
   flyctl secrets set AI_AGENT_PERSONALITY="professional restaurant reservation agent for La Piazza Italian restaurant"
   ```

5. **Deploy**:
   ```bash
   flyctl deploy
   ```

---

## Testing Your Deployment

Once deployed, share the URL with your teammates:

1. **Test the WebRTC connection**:
   - Open the URL on two different devices
   - Click "Start Call" on both
   - Video chat should connect

2. **Test AI Mode**:
   - Click "AI Mode" button
   - Speak into your microphone
   - The AI assistant should respond

---

## Keeping Local Tunnel Active

You can still use localtunnel for quick local testing:

```bash
# Terminal 1: Run the server locally
npm start

# Terminal 2: Create tunnel
npx localtunnel --port 3000
```

---

## Troubleshooting

### WebSocket Connection Issues
- Make sure your hosting platform supports WebSockets
- Check if the deployment logs show any errors

### AI Not Working
- Verify `ANTHROPIC_API_KEY` is set correctly in environment variables
- Check deployment logs for API errors

### Camera/Microphone Not Working
- Deployment must use HTTPS (all platforms above provide this)
- Users must grant browser permissions

---

## Cost Comparison

| Platform | Free Tier | Limitations | Best For |
|----------|-----------|-------------|----------|
| **Render** | Yes (750 hrs/month) | Sleeps after 15 min | Simple demos |
| **Railway** | $5 credit/month | Usage-based | Active testing |
| **Fly.io** | 3 shared VMs | 160GB bandwidth | Production-ready |

## Recommendation

For your use case (teammate testing), I recommend **Render** because:
- Completely free
- Easy GitHub integration
- Automatic HTTPS
- WebSocket support
- Good for demos and testing

Would you like me to help you deploy to Render step-by-step?
