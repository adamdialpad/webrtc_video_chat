# WebRTC Video Chat - Setup Guide

## The HTTPS Requirement Problem

Modern browsers (Chrome, Safari, Firefox) **require HTTPS** to access camera and microphone, except for `localhost`. This is a security feature.

When you try to access the app via IP address (`http://10.0.0.142:3000`), the browser blocks camera access.

## Solution Options

### Option 1: Use Localhost Tunneling (Recommended for Testing)

This is the simplest solution for local testing.

**On your PC:**

1. Start the server:
   ```bash
   npm start
   ```

2. Open on PC: `http://localhost:3000`

**On your phone:**

Use one of these tools to access localhost from your phone:

#### Using ngrok (Free):
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```
This gives you a public HTTPS URL you can open on your phone.

#### Using localtunnel (Free):
```bash
npm install -g localtunnel
lt --port 3000
```

### Option 2: Enable Chrome Insecure Origins (For Testing Only)

**On Android Chrome:**

1. Open Chrome and go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`

2. Add your PC's URL: `http://10.0.0.142:3000`

3. Change to "Enabled"

4. Restart Chrome

5. Now open `http://10.0.0.142:3000` - it should work!

**On Desktop Chrome (for testing second tab):**

Same steps as above.

### Option 3: Self-Signed HTTPS Certificate (Production-Like)

This requires generating SSL certificates and modifying the server. Let me know if you want to go this route.

### Option 4: Use localhost IP Mapping

**Only works if your phone can resolve .local addresses (most modern phones can):**

On phone, try: `http://your-computer-name.local:3000`

To find your computer name on Mac:
```bash
hostname
```

## Quick Test Setup

**The easiest way to test right now:**

1. Keep server running

2. On **PC**: Open `http://localhost:3000` in one browser tab

3. On **PC**: Open `http://localhost:3000` in a **second browser tab** (or different browser)

4. Click "Start Call" in one tab

5. Both tabs should connect!

This proves the app works - the only issue is accessing it from the phone.

## Recommended: Use ngrok

This is the cleanest solution:

```bash
# Install ngrok from https://ngrok.com/download

# Run it
ngrok http 3000
```

You'll get output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

- **PC**: Open `https://abc123.ngrok.io`
- **Phone**: Open `https://abc123.ngrok.io`
- Both will work with HTTPS!

## Current Server Status

Your server is running and accessible at:
- PC (localhost): `http://localhost:3000` ✅ Works
- PC (IP): `http://10.0.0.142:3000` ❌ Camera blocked by browser
- Phone (IP): `http://10.0.0.142:3000` ❌ Camera blocked by browser

Choose one of the solutions above to make it work on your phone!
