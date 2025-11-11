// AI Mode client-side functionality
// Handles speech recognition, AI communication, and text-to-speech

class AIMode {
  constructor() {
    this.isEnabled = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.conversationHistory = [];

    // Check browser support
    this.checkSupport();
  }

  checkSupport() {
    // Check for Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      this.recognitionSupported = false;
    } else {
      this.recognitionSupported = true;
      this.setupSpeechRecognition();
    }

    // Check for Speech Synthesis
    if (!this.synthesis) {
      console.error('Speech Synthesis not supported');
      this.synthesisSupported = false;
    } else {
      this.synthesisSupported = true;
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false;  // Changed to false to prevent auto-restart
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.isListening = true;
      this.updateUIListening(true);
    };

    this.recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.isListening = false;
      this.updateUIListening(false);

      // Only restart if AI mode is enabled AND not speaking
      // Longer delay to prevent picking up tail of speech
      if (this.isEnabled && !this.isSpeaking) {
        setTimeout(() => {
          if (this.isEnabled && !this.isSpeaking) {
            this.startListening();
          }
        }, 500);
      }
    };

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;

      console.log('👤 User said:', transcript);
      this.handleUserSpeech(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors, they're common
        return;
      }
      showInfo(`Speech recognition error: ${event.error}`, 'error');
    };
  }

  async handleUserSpeech(transcript) {
    // Add to conversation history
    this.addToConversation('user', transcript);

    // Stop listening while AI responds
    this.stopListening();

    // Send to AI via WebSocket
    this.sendToAI(transcript);
  }

  async sendToAI(message) {
    // Send message to server via existing WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ai-message',
        message: message
      }));
    } else {
      console.error('WebSocket not connected');
      showInfo('Cannot connect to AI. Please try again.', 'error');
      this.startListening();
    }
  }

  handleAIResponse(responseText) {
    console.log('🤖 AI Response:', responseText);

    // Add to conversation history
    this.addToConversation('ai', responseText);

    // Speak the response
    this.speak(responseText);
  }

  speak(text) {
    if (!this.synthesisSupported) {
      console.error('Speech synthesis not supported');
      return;
    }

    // CRITICAL: Stop listening immediately to prevent feedback loop
    this.stopListening();

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select a voice (prefer female voice for variety)
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateUISpeaking(true);
      // Start avatar animation
      if (typeof avatarAnimator !== 'undefined') {
        avatarAnimator.start();
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateUISpeaking(false);

      // Stop avatar animation
      if (typeof avatarAnimator !== 'undefined') {
        avatarAnimator.stop();
      }

      // Resume listening after AI finishes speaking
      // Longer delay to ensure audio output has fully stopped
      if (this.isEnabled) {
        setTimeout(() => {
          this.startListening();
        }, 1000);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.updateUISpeaking(false);
      // Stop avatar animation on error
      if (typeof avatarAnimator !== 'undefined') {
        avatarAnimator.stop();
      }
      if (this.isEnabled) {
        this.startListening();
      }
    };

    this.synthesis.speak(utterance);
  }

  startListening() {
    if (!this.recognitionSupported || this.isListening || this.isSpeaking) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  enable() {
    if (!this.recognitionSupported || !this.synthesisSupported) {
      showInfo('Speech recognition/synthesis not supported in this browser', 'error');
      return false;
    }

    this.isEnabled = true;
    this.conversationHistory = [];
    console.log('🤖 AI Mode enabled');

    // Show avatar
    if (typeof avatarAnimator !== 'undefined') {
      avatarAnimator.show();
    }

    // Send initial greeting trigger
    // AI will greet when user first speaks
    setTimeout(() => {
      this.sendToAI('start');
    }, 500);

    // Start listening after greeting
    setTimeout(() => {
      this.startListening();
    }, 2000);

    return true;
  }

  disable() {
    this.isEnabled = false;
    this.stopListening();
    this.synthesis.cancel();

    // Hide avatar and stop animation
    if (typeof avatarAnimator !== 'undefined') {
      avatarAnimator.stop();
      avatarAnimator.hide();
    }

    console.log('🤖 AI Mode disabled');
  }

  addToConversation(role, text) {
    this.conversationHistory.push({ role, text, timestamp: new Date() });
    this.updateConversationDisplay();
  }

  updateConversationDisplay() {
    const conversationDiv = document.getElementById('conversationHistory');
    if (!conversationDiv) return;

    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
    if (!lastMessage) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${lastMessage.role}`;
    messageDiv.innerHTML = `
      <strong>${lastMessage.role === 'user' ? 'User' : 'AI'}:</strong>
      ${lastMessage.text}
    `;

    conversationDiv.appendChild(messageDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  updateUIListening(isListening) {
    const indicator = document.getElementById('listeningIndicator');
    if (indicator) {
      indicator.style.display = isListening ? 'block' : 'none';
    }
  }

  updateUISpeaking(isSpeaking) {
    const indicator = document.getElementById('speakingIndicator');
    if (indicator) {
      indicator.style.display = isSpeaking ? 'block' : 'none';
    }
  }
}

// Create global AI mode instance
const aiMode = new AIMode();
