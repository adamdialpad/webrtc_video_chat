const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const AIAgent = require('./ai-agent');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Initialize AI Agent
const aiAgent = new AIAgent();

// Serve static files from public directory
app.use(express.static('public'));

// Store connected clients (max 2 for peer-to-peer)
const clients = new Set();

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log('New client connected from:', clientIP);
  console.log('Total clients:', clients.size + 1);

  // Reject if already 2 clients connected
  if (clients.size >= 2) {
    console.log('Rejecting client - room full');
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room is full. Maximum 2 clients allowed.'
    }));
    ws.close();
    return;
  }

  clients.add(ws);

  // Notify all clients about connection status
  broadcastConnectionStatus();

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type);

      // Handle AI messages
      if (data.type === 'ai-message') {
        await handleAIMessage(ws, data.message);
        return;
      }

      // Handle AI mode enable/disable
      if (data.type === 'ai-mode-enable') {
        if (aiAgent.isEnabled()) {
          aiAgent.startConversation();
          ws.send(JSON.stringify({
            type: 'ai-mode-status',
            enabled: true
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'ai-mode-status',
            enabled: false,
            error: 'AI Agent not configured. Please set ANTHROPIC_API_KEY in .env file.'
          }));
        }
        return;
      }

      if (data.type === 'ai-mode-disable') {
        aiAgent.endConversation();
        ws.send(JSON.stringify({
          type: 'ai-mode-status',
          enabled: false
        }));
        return;
      }

      // Broadcast message to all other clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', clients.size - 1);
    clients.delete(ws);

    // Notify remaining clients about disconnection
    broadcastConnectionStatus();

    // Tell other peer to reset
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'peer-disconnected'
        }));
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastConnectionStatus() {
  const status = {
    type: 'connection-status',
    clientCount: clients.size,
    ready: clients.size === 2
  };

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(status));
    }
  });
}

async function handleAIMessage(ws, userMessage) {
  try {
    // Get AI response
    const aiResponse = await aiAgent.sendMessage(userMessage);

    // Send response back to client
    ws.send(JSON.stringify({
      type: 'ai-response',
      message: aiResponse
    }));
  } catch (error) {
    console.error('Error handling AI message:', error);
    ws.send(JSON.stringify({
      type: 'ai-error',
      error: 'Failed to get AI response. Please try again.'
    }));
  }
}

server.listen(PORT, () => {
  const localIP = getLocalIPAddress();
  console.log('\n=================================');
  console.log('WebRTC Video Chat Server Running');
  console.log('=================================');
  console.log(`\nPC: Open http://localhost:${PORT}`);
  console.log(`Phone: Open http://${localIP}:${PORT}`);
  console.log('\nMake sure both devices are on the same WiFi network.\n');
});
