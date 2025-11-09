# WebRTC Video Chat

A simple peer-to-peer video chat application using WebRTC that allows video calls between your PC and smartphone on the same WiFi network.

## Features

- **Peer-to-peer video calling** between two devices
- **AI Agent Integration** - Talk to Claude AI instead of a human (optional)
- **Audio and video controls** (mute, camera toggle, speaker mode)
- **Clean, modern UI** optimized for both desktop and mobile
- **Real-time connection status** indicators
- **Automatic reconnection** handling
- **HTTPS support** via localtunnel for remote access

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- PC and smartphone connected to the **same WiFi network**
- Modern web browser (Chrome, Firefox, Safari 11+, or Edge)

## Installation

1. Navigate to the project directory:
   ```bash
   cd webrtc_video_chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### 1. Start the Server

Run the server on your PC:

```bash
npm start
```

You'll see output like this:

```
=================================
WebRTC Video Chat Server Running
=================================

PC: Open http://localhost:3000
Phone: Open http://192.168.1.100:3000

Make sure both devices are on the same WiFi network.
```

### 2. Connect Your Devices

**On your PC:**
- Open your browser and go to `http://localhost:3000`
- Allow camera and microphone permissions when prompted
- Wait for your phone to connect

**On your smartphone:**
- Open your browser and go to `http://[YOUR_PC_IP]:3000`
  - Replace `[YOUR_PC_IP]` with the IP address shown in the server output
  - Example: `http://192.168.1.100:3000`
- Allow camera and microphone permissions when prompted
- You should see "Peer Connected" status on both devices

### 3. Start the Call

- On your **PC**, click the **"Start Call"** button
- The video connection will establish automatically
- You should now see both video feeds on both devices

### 4. During the Call

**Available controls:**
- **Hang Up** - End the call
- **Mute** - Toggle your microphone on/off
- **Camera Off/On** - Toggle your camera on/off

### 5. Stop the Server

Press `Ctrl+C` in the terminal to stop the server.

## Troubleshooting

### Camera/Microphone Not Working

- Make sure you clicked "Allow" when the browser asked for permissions
- Check your browser settings to ensure camera/microphone access is enabled
- On mobile, make sure no other app is using the camera

### Can't Connect from Phone

- Verify both devices are on the same WiFi network
- Make sure your PC's firewall allows connections on port 3000
- Try using the exact IP address shown in the server output
- Some public WiFi networks block device-to-device connections (AP Isolation)

### Connection Fails or Drops

- Check your WiFi signal strength
- Try refreshing both browsers and reconnecting
- Restart the server if needed
- Make sure no VPN is active on either device

### Browser Not Supported

WebRTC requires a modern browser:
- **Chrome** 50+
- **Firefox** 44+
- **Safari** 11+
- **Edge** 79+
- Internet Explorer is **not supported**

## How It Works

1. **Signaling Server**: Node.js WebSocket server handles initial connection setup
2. **WebRTC**: Establishes direct peer-to-peer video connection between devices
3. **Local Network**: All traffic stays on your WiFi network (no external servers)
4. **STUN Server**: Uses Google's public STUN server for NAT traversal

## AI Agent (Optional)

Want to talk to an AI instead of another person? Check out [AI_SETUP_GUIDE.md](AI_SETUP_GUIDE.md) for instructions on enabling the AI mode powered by Anthropic's Claude.

## Project Structure

```
webrtc_video_chat/
├── server.js           # WebSocket signaling server
├── ai-agent.js         # AI agent integration (Claude)
├── package.json        # Project dependencies
├── public/
│   ├── index.html      # Web interface
│   ├── client.js       # WebRTC client logic
│   ├── ai-mode.js      # AI speech recognition/synthesis
│   └── style.css       # UI styling
├── AI_SETUP_GUIDE.md   # AI agent setup instructions
├── QUICK_START.md      # Quick start guide
└── README.md           # This file
```

## Technical Details

- **Backend**: Node.js with Express and WebSocket (ws)
- **Frontend**: Vanilla JavaScript with WebRTC APIs
- **Signaling**: WebSocket for offer/answer/ICE candidate exchange
- **Media**: getUserMedia API for camera/microphone access
- **Connection**: RTCPeerConnection for peer-to-peer video

## Security Notes

- This application is designed for local network use only
- Camera and microphone permissions are required
- All video/audio streams are transmitted peer-to-peer
- For production use over the internet, implement HTTPS and authentication

## License

MIT

## Support

If you encounter any issues, please check:
1. Both devices are on the same WiFi network
2. Camera/microphone permissions are granted
3. Your browser supports WebRTC
4. Firewall isn't blocking port 3000

Enjoy your video chat!
