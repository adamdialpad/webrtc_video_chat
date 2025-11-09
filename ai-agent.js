const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

class AIAgent {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set! AI agent will not work.');
      console.warn('Get your API key from: https://console.anthropic.com/');
      console.warn('Then add it to .env file');
      this.enabled = false;
      return;
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.conversationHistory = [];
    this.enabled = true;
    this.agentName = process.env.AI_AGENT_NAME || 'AI Assistant';
    this.personality = process.env.AI_AGENT_PERSONALITY || 'friendly and helpful assistant';

    console.log('✅ AI Agent initialized successfully');
    console.log(`   Agent Name: ${this.agentName}`);
    console.log(`   Personality: ${this.personality}`);
    console.log('   Model: Claude (Anthropic)');
  }

  /**
   * Initialize a new conversation session
   */
  startConversation() {
    if (!this.enabled) {
      throw new Error('AI Agent is not enabled. Please configure ANTHROPIC_API_KEY.');
    }

    this.conversationHistory = [];
    console.log('🎯 New conversation started');
    return true;
  }

  /**
   * Send a message to the AI and get a response
   * @param {string} userMessage - The user's message
   * @returns {Promise<string>} - The AI's response
   */
  async sendMessage(userMessage) {
    if (!this.enabled) {
      return 'AI Agent is not configured. Please set up your Anthropic API key.';
    }

    try {
      console.log(`👤 User: ${userMessage}`);

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Create system prompt
      const systemPrompt = `You are ${this.agentName}, a ${this.personality}.
You are having a voice conversation with someone through a video chat application.
Keep your responses natural, conversational, and concise (2-3 sentences max).
Be engaging and ask follow-up questions when appropriate.
Remember the context of the conversation.`;

      // Call Claude API
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        system: systemPrompt,
        messages: this.conversationHistory
      });

      const aiResponse = response.content[0].text;

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      console.log(`🤖 AI: ${aiResponse}`);

      return aiResponse;
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Handle rate limiting
      if (error.status === 429) {
        return 'I\'m receiving too many requests right now. Please wait a moment and try again.';
      }

      // Handle API errors
      if (error.status === 401) {
        return 'API key issue. Please check your configuration.';
      }

      // Handle other errors
      return 'I\'m having trouble processing that. Could you try rephrasing?';
    }
  }

  /**
   * End the current conversation
   */
  endConversation() {
    this.conversationHistory = [];
    console.log('👋 Conversation ended');
  }

  /**
   * Check if AI agent is enabled and ready
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = AIAgent;
