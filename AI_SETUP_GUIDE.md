# AI Agent Setup Guide

## Overview

Your WebRTC video chat now has an AI agent powered by Anthropic's Claude! Phone users can have natural voice conversations with the AI instead of talking to a human.

## Quick Setup (5 minutes)

### Step 1: Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create Key"**
5. Copy the API key (starts with `sk-ant-...`)

### Step 2: Configure the API Key

1. Open the `.env` file in your project directory
2. Replace `your_anthropic_api_key_here` with your actual API key:

```env
ANTHROPIC_API_KEY=sk-ant-...your_actual_key_here
```

3. Save the file

### Step 3: Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

You should see:
```
✅ AI Agent initialized successfully
   Agent Name: AI Assistant
   Personality: friendly and helpful assistant
   Model: Claude (Anthropic)
```

## How to Use AI Mode

### On Your PC:

1. Start the server: `npm start`
2. Start localtunnel: `lt --port 3000`
3. Open the localtunnel URL in your PC browser
4. Click the **🤖 AI Mode** button

### On Your Phone:

1. Open the same localtunnel URL
2. Allow microphone permissions
3. Start talking! The AI will:
   - Listen to your speech
   - Process it with Claude
   - Respond in natural voice

### Features:

✅ **Natural conversation** - Talk naturally, AI understands context
✅ **Voice-to-voice** - Speak and hear responses
✅ **Live transcript** - See the conversation on PC screen
✅ **No PC user needed** - AI agent replaces the human entirely
✅ **Claude 3.5 Sonnet** - Latest and most capable Claude model

## Conversation Flow

1. Phone user speaks → **Browser captures speech**
2. Speech → Text → **Sent to Claude API**
3. Claude responds → **Text converted to speech**
4. AI speaks back → **Phone hears response**

## Customization

Edit `.env` to customize the AI:

```env
AI_AGENT_NAME=My Custom Assistant
AI_AGENT_PERSONALITY=professional and knowledgeable tech expert
```

Examples:
- `friendly customer service representative`
- `knowledgeable teacher who explains things simply`
- `casual friend who likes to joke around`

## Troubleshooting

### "AI Agent not configured" Error

**Problem**: API key not set or invalid

**Solution**:
1. Check `.env` file has correct `ANTHROPIC_API_KEY`
2. Make sure no extra spaces or quotes
3. Restart server after editing `.env`

### Speech Recognition Not Working

**Problem**: Browser doesn't support speech recognition

**Solution**:
- Use **Chrome** or **Edge** (best support)
- Safari has limited support
- Make sure using HTTPS (localtunnel provides this)

### AI Not Responding

**Problem**: Rate limit or API issue

**Solutions**:
1. Wait a few seconds and try again
2. Check Anthropic API quotas at [console.anthropic.com](https://console.anthropic.com)
3. Check your API key is valid and has credits

### No Sound from AI

**Problem**: Text-to-speech not working

**Solution**:
- Check phone volume is up
- Try refreshing the page
- Check browser console for errors

## Anthropic API Pricing

Anthropic Claude API uses pay-as-you-go pricing:

- **Claude 3.5 Sonnet**: $3 per million input tokens, $15 per million output tokens
- **New accounts**: Often receive free credits to get started
- **Very affordable**: Typical conversation costs less than $0.01

Check your usage and credits at [console.anthropic.com](https://console.anthropic.com)

## Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Speech Recognition | ✅ | ✅ | ⚠️ Limited | ❌ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| WebRTC | ✅ | ✅ | ✅ | ✅ |

**Recommendation**: Use Chrome on both PC and phone for best experience.

## Privacy & Security

- All conversations go through Anthropic's Claude API
- Conversation history stored only in browser session (not saved)
- No video/audio recorded or stored on server
- API key should be kept private (don't commit to GitHub)
- Anthropic's privacy policy: [anthropic.com/privacy](https://www.anthropic.com/privacy)

## Advanced Configuration

### Change AI Model

Edit `ai-agent.js` line 70:

```javascript
// Default: claude-3-5-sonnet-20241022 (most capable)
model: 'claude-3-5-sonnet-20241022'

// Or use: claude-3-haiku-20240307 (faster, cheaper)
model: 'claude-3-haiku-20240307'
```

### Adjust Response Length

Edit `ai-agent.js` line 71:

```javascript
max_tokens: 150, // Increase for longer responses (default: 150)
```

## Why Claude?

- **More conversational**: Claude excels at natural dialogue
- **Better context**: Maintains conversation flow excellently
- **Concise responses**: Perfect for voice conversations
- **Reliable**: Excellent uptime and consistent performance

## Next Steps

- Try different personalities in `.env`
- Experiment with conversation topics
- Share the localtunnel URL with friends!

## Need Help?

1. Check server console for error messages
2. Check browser console (F12) for client errors
3. Verify API key at [console.anthropic.com](https://console.anthropic.com)

Enjoy chatting with your AI agent! 🤖🎉
