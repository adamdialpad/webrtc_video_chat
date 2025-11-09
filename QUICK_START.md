# Quick Start Guide

## Your WebRTC Video Chat is Working! 🎉

### To Start a Video Call:

1. **Start the servers** (in project directory):
   ```bash
   # Terminal 1: Start Node.js server
   npm start

   # Terminal 2: Start localtunnel for phone access
   lt --port 3000
   ```

2. **Copy the localtunnel URL** from Terminal 2 output:
   ```
   your url is: https://[random-name].loca.lt
   ```

3. **Connect your devices:**
   - **PC**: Open the localtunnel URL in your browser
   - **Phone**: Open the same localtunnel URL in Chrome/Safari
   - Click through the localtunnel security page if shown
   - **Allow camera/microphone** permissions on both devices

4. **Make the call:**
   - Wait for "Peer Connected" status on both devices
   - Click **"Start Call"** button on PC
   - Enjoy your video chat!

### Available Controls:

- **Start Call** - Initiates the video call (PC only)
- **Hang Up** - Ends the call
- **Mute/Unmute** - Toggle microphone
- **Camera On/Off** - Toggle video
- **Speaker/Earpiece** - Toggle between loudspeaker and earpiece (mobile)

### Features:

✅ Peer-to-peer video calling
✅ Works on PC and smartphone
✅ Real-time audio and video
✅ Connection status indicators
✅ Mute and camera toggle
✅ Speaker/Earpiece toggle for mobile
✅ Mobile-optimized responsive design
✅ Automatic error handling

### Important Notes:

- Both devices must use the **same localtunnel URL**
- The URL changes each time you restart localtunnel
- Camera/microphone permissions must be allowed on both devices
- Maximum 2 connected clients at a time
- All video/audio is peer-to-peer (private)

### Troubleshooting:

**"Camera access denied"**
- Enable camera/microphone permissions in browser settings
- On iPhone: Settings → Chrome/Safari → Allow Camera & Microphone

**"Calling peer..." stuck**
- Make sure phone has camera permissions enabled
- Refresh both browsers and try again

**Connection issues**
- Check that both devices are using the same localtunnel URL
- Try refreshing the page
- Restart the servers if needed

### Local Network Testing:

For testing on the same PC (without phone):
1. Start server: `npm start`
2. Open `http://localhost:3000` in **two browser tabs**
3. Click "Start Call" in one tab

Enjoy your video chat! 📹🎤
