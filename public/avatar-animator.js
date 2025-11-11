// Avatar Animator - Canvas-based lip-sync animation
// Syncs mouth shapes with AI speech using audio analysis
// Inspired by TalkingHead for realistic human-like appearance

class AvatarAnimator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.isAnimating = false;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationFrameId = null;

    // Mouth shapes based on audio amplitude (viseme-inspired)
    // 0: closed, 1: slightly open, 2: half open, 3: wide open
    this.mouthShape = 0;
    this.targetMouthShape = 0;

    // Animation timing
    this.lastUpdateTime = 0;
    this.updateInterval = 100; // Update mouth shape every 100ms

    // Blinking animation
    this.eyeOpenness = 1.0; // 0 = closed, 1 = fully open
    this.targetEyeOpenness = 1.0;
    this.lastBlinkTime = Date.now();
    this.blinkInterval = 3000 + Math.random() * 2000; // Random 3-5 seconds

    // Head movement (subtle idle animation)
    this.headTiltX = 0;
    this.headTiltY = 0;
    this.targetHeadTiltX = 0;
    this.targetHeadTiltY = 0;
    this.lastHeadMoveTime = Date.now();

    // Mood/Expression
    this.mood = 'friendly'; // neutral, happy, friendly
    this.smileAmount = 0.3; // 0 = neutral, 1 = full smile

    // Setup canvas size
    this.setupCanvas();
  }

  setupCanvas() {
    // Set canvas size (responsive)
    const size = Math.min(300, window.innerWidth * 0.8);
    this.canvas.width = size;
    this.canvas.height = size;
  }

  // Initialize audio analysis (called once when AI starts speaking)
  initAudioAnalysis(utterance) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    // Note: We can't directly access Web Speech API audio output
    // So we'll use time-based animation with random variations
    // This simulates talking without actual audio analysis
  }

  // Start animation
  start() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.mouthShape = 0;
    this.lastUpdateTime = Date.now();

    console.log('🎭 Avatar animation started');
    this.animate();
  }

  // Stop animation
  stop() {
    this.isAnimating = false;
    this.mouthShape = 0;
    this.targetMouthShape = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Draw final closed mouth
    this.drawAvatar();
    console.log('🎭 Avatar animation stopped');
  }

  // Animation loop
  animate() {
    if (!this.isAnimating) return;

    const now = Date.now();

    // Update mouth shape periodically
    if (now - this.lastUpdateTime > this.updateInterval) {
      this.updateMouthShape();
      this.lastUpdateTime = now;
    }

    // Update blinking
    this.updateBlinking(now);

    // Update head movement
    this.updateHeadMovement(now);

    // Smooth transitions
    this.mouthShape += (this.targetMouthShape - this.mouthShape) * 0.3;
    this.eyeOpenness += (this.targetEyeOpenness - this.eyeOpenness) * 0.4;
    this.headTiltX += (this.targetHeadTiltX - this.headTiltX) * 0.05;
    this.headTiltY += (this.targetHeadTiltY - this.headTiltY) * 0.05;

    // Draw avatar
    this.drawAvatar();

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  // Update blinking animation
  updateBlinking(now) {
    if (now - this.lastBlinkTime > this.blinkInterval) {
      // Start blink
      this.targetEyeOpenness = 0;
      setTimeout(() => {
        // End blink
        this.targetEyeOpenness = 1.0;
        this.lastBlinkTime = now;
        this.blinkInterval = 3000 + Math.random() * 2000;
      }, 150); // Blink duration
    }
  }

  // Update subtle head movement
  updateHeadMovement(now) {
    if (now - this.lastHeadMoveTime > 2000) {
      // Small random head tilt
      this.targetHeadTiltX = (Math.random() - 0.5) * 0.02;
      this.targetHeadTiltY = (Math.random() - 0.5) * 0.02;
      this.lastHeadMoveTime = now;
    }
  }

  // Update target mouth shape based on simulated speech pattern
  updateMouthShape() {
    // Simulate natural speech pattern
    // Random variation between shapes with weighted probability
    const rand = Math.random();

    if (rand < 0.15) {
      // Closed (15% - consonants like P, B, M)
      this.targetMouthShape = 0;
    } else if (rand < 0.4) {
      // Slightly open (25% - consonants and short vowels)
      this.targetMouthShape = 1;
    } else if (rand < 0.75) {
      // Half open (35% - most vowels)
      this.targetMouthShape = 2;
    } else {
      // Wide open (25% - emphasis, A vowels)
      this.targetMouthShape = 3;
    }
  }

  // Draw the avatar with current mouth shape (realistic human-like)
  drawAvatar() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Apply subtle head tilt
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.headTiltX);
    ctx.translate(-centerX, -centerY);

    // Draw neck with gradient
    const neckWidth = w * 0.28;
    const neckHeight = h * 0.15;
    const neckGradient = ctx.createLinearGradient(
      centerX - neckWidth/2, centerY + h * 0.3,
      centerX + neckWidth/2, centerY + h * 0.3
    );
    neckGradient.addColorStop(0, '#d4a574');
    neckGradient.addColorStop(0.5, '#e8b896');
    neckGradient.addColorStop(1, '#d4a574');
    ctx.fillStyle = neckGradient;
    ctx.fillRect(centerX - neckWidth/2, centerY + h * 0.28, neckWidth, neckHeight);

    // Draw face shape (feminine - softer oval, narrower chin)
    const faceWidth = w * 0.35;
    const faceHeight = h * 0.46;

    // Create heart-shaped face
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - h * 0.02, faceWidth, faceHeight * 0.9, 0, 0, Math.PI * 2);

    // Face gradient for depth (lighter, more delicate skin tone)
    const faceGradient = ctx.createRadialGradient(
      centerX, centerY - h * 0.12, 0,
      centerX, centerY, faceHeight
    );
    faceGradient.addColorStop(0, '#fef5ed');
    faceGradient.addColorStop(0.5, '#fce4d6');
    faceGradient.addColorStop(0.75, '#f5d5b8');
    faceGradient.addColorStop(1, '#e8c4a8');
    ctx.fillStyle = faceGradient;
    ctx.fill();

    // Draw hair
    this.drawHair(ctx, centerX, centerY, faceWidth, faceHeight);

    // Draw rosy cheeks for friendly expression (higher, more youthful placement)
    if (this.mood === 'friendly') {
      ctx.fillStyle = 'rgba(255, 180, 190, 0.28)';

      // Left cheek (higher, on cheekbones)
      ctx.beginPath();
      ctx.ellipse(centerX - faceWidth * 0.55, centerY + h * 0.02,
                  faceWidth * 0.22, faceHeight * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right cheek (higher, on cheekbones)
      ctx.beginPath();
      ctx.ellipse(centerX + faceWidth * 0.55, centerY + h * 0.02,
                  faceWidth * 0.22, faceHeight * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw ears
    this.drawEars(ctx, centerX, centerY, faceWidth, faceHeight);

    // Draw eyebrows
    this.drawEyebrows(ctx, centerX, centerY - h * 0.08, w * 0.12);

    // Draw eyes with blinking
    this.drawEyes(ctx, centerX, centerY - h * 0.05, w * 0.12);

    // Draw nose
    this.drawNose(ctx, centerX, centerY + h * 0.05);

    // Draw mouth based on current shape
    this.drawMouth(centerX, centerY + h * 0.18, w * 0.15, this.mouthShape);

    ctx.restore();
  }

  // Draw realistic hair (feminine style - long wavy hair)
  drawHair(ctx, x, y, faceW, faceH) {
    // Hair color - dark brown with highlights
    const hairColor = '#3d2817';
    const highlightColor = '#5a3f2a';

    // Main hair top (fuller coverage)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(x, y - faceH * 0.55, faceW * 1.2, faceH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair sides (longer, flowing)
    ctx.beginPath();
    ctx.ellipse(x - faceW * 0.85, y - faceH * 0.15, faceW * 0.42, faceH * 0.65, -0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + faceW * 0.85, y - faceH * 0.15, faceW * 0.42, faceH * 0.65, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Long hair flowing down (left side)
    ctx.beginPath();
    ctx.ellipse(x - faceW * 0.95, y + faceH * 0.3, faceW * 0.35, faceH * 0.5, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Long hair flowing down (right side)
    ctx.beginPath();
    ctx.ellipse(x + faceW * 0.95, y + faceH * 0.3, faceW * 0.35, faceH * 0.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Hair highlights for depth
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 0.4;

    // Left highlight
    ctx.beginPath();
    ctx.ellipse(x - faceW * 0.4, y - faceH * 0.45, faceW * 0.2, faceH * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right highlight
    ctx.beginPath();
    ctx.ellipse(x + faceW * 0.4, y - faceH * 0.45, faceW * 0.2, faceH * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;

    // Bangs/fringe
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(x, y - faceH * 0.7, faceW * 0.6, faceH * 0.15, 0, 0, Math.PI);
    ctx.fill();
  }

  // Draw ears
  drawEars(ctx, x, y, faceW, faceH) {
    const earWidth = faceW * 0.2;
    const earHeight = faceH * 0.25;

    // Left ear
    ctx.fillStyle = '#e8b896';
    ctx.beginPath();
    ctx.ellipse(x - faceW - earWidth * 0.3, y, earWidth, earHeight, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.ellipse(x + faceW + earWidth * 0.3, y, earWidth, earHeight, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear detail
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(x - faceW - earWidth * 0.3, y, earWidth * 0.5, earHeight * 0.6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + faceW + earWidth * 0.3, y, earWidth * 0.5, earHeight * 0.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw eyebrows with expression (feminine - thinner, more arched)
  drawEyebrows(ctx, x, y, spacing) {
    ctx.strokeStyle = '#3d2817';
    ctx.lineWidth = 2.5; // Thinner for feminine look
    ctx.lineCap = 'round';

    // Friendly expression: slightly raised eyebrows
    const expressionLift = this.mood === 'friendly' ? 3 : 0;

    // Left eyebrow (more arched, elegant curve)
    ctx.beginPath();
    ctx.moveTo(x - spacing - 18, y + 3 - expressionLift);
    ctx.quadraticCurveTo(x - spacing - 3, y - 8 - expressionLift, x - spacing + 12, y + 1 - expressionLift);
    ctx.stroke();

    // Right eyebrow (more arched, elegant curve)
    ctx.beginPath();
    ctx.moveTo(x + spacing - 12, y + 1 - expressionLift);
    ctx.quadraticCurveTo(x + spacing + 3, y - 8 - expressionLift, x + spacing + 18, y + 3 - expressionLift);
    ctx.stroke();
  }

  // Draw eyes with realistic blinking (feminine - larger, expressive)
  drawEyes(ctx, x, y, spacing) {
    const eyeWidth = 22; // Larger eyes for feminine look
    const eyeHeight = 15 * this.eyeOpenness;

    // Friendly expression: slightly narrowed happy eyes
    const happySquint = this.mood === 'friendly' ? 0.92 : 1.0;

    // Subtle eyeshadow (makeup)
    ctx.fillStyle = 'rgba(180, 140, 150, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x - spacing, y - 2, eyeWidth * 1.1, eyeHeight * 1.3, 0, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + spacing, y - 2, eyeWidth * 1.1, eyeHeight * 1.3, 0, 0, Math.PI);
    ctx.fill();

    // Left eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - spacing, y, eyeWidth, eyeHeight * happySquint, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left iris (warmer, lighter brown)
    ctx.fillStyle = '#8b6f47';
    ctx.beginPath();
    ctx.arc(x - spacing, y, 9 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Left pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - spacing, y, 4.5 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Left eye highlights (larger, brighter for sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - spacing + 3, y - 3, 3 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - spacing - 2, y + 2, 1.5 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Right eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + spacing, y, eyeWidth, eyeHeight * happySquint, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right iris (warmer, lighter brown)
    ctx.fillStyle = '#8b6f47';
    ctx.beginPath();
    ctx.arc(x + spacing, y, 9 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Right pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + spacing, y, 4.5 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Right eye highlights (larger, brighter for sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + spacing + 3, y - 3, 3 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + spacing - 2, y + 2, 1.5 * this.eyeOpenness * happySquint, 0, Math.PI * 2);
    ctx.fill();

    // Longer, more defined eyelashes
    if (this.eyeOpenness > 0.7) {
      ctx.strokeStyle = '#2a1810';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Left upper lashes
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        const lashX = x - spacing + i * 4;
        const lashAngle = i * 0.15;
        ctx.moveTo(lashX, y - eyeHeight * happySquint);
        ctx.lineTo(lashX + Math.sin(lashAngle) * 8, y - eyeHeight * happySquint - Math.cos(lashAngle) * 8);
        ctx.stroke();
      }

      // Right upper lashes
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        const lashX = x + spacing + i * 4;
        const lashAngle = i * 0.15;
        ctx.moveTo(lashX, y - eyeHeight * happySquint);
        ctx.lineTo(lashX + Math.sin(lashAngle) * 8, y - eyeHeight * happySquint - Math.cos(lashAngle) * 8);
        ctx.stroke();
      }
    }

    // Eyelids (upper)
    if (this.eyeOpenness < 0.9) {
      ctx.strokeStyle = '#fce4d6';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.ellipse(x - spacing, y, eyeWidth, eyeHeight, 0, Math.PI, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(x + spacing, y, eyeWidth, eyeHeight, 0, Math.PI, 0);
      ctx.stroke();
    }
  }

  // Draw realistic nose (feminine - smaller, more delicate)
  drawNose(ctx, x, y) {
    // Subtle nose bridge shadow (lighter, more delicate)
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 3);
    ctx.stroke();

    // Small, delicate nose tip
    ctx.fillStyle = '#f5d5b8';
    ctx.beginPath();
    ctx.arc(x, y + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Subtle, smaller nostrils
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x - 4, y + 5, 2, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + 4, y + 5, 2, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw mouth with different shapes (realistic)
  drawMouth(x, y, width, shape) {
    const ctx = this.ctx;

    if (shape < 0.5) {
      // Shape 0: Closed mouth with friendly smile
      const smileAmount = this.smileAmount || 0;
      const smileCurve = smileAmount * 8; // How much the smile curves up

      ctx.strokeStyle = '#c98865';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      // Smiling mouth line
      ctx.beginPath();
      ctx.moveTo(x - width, y + 2);
      ctx.quadraticCurveTo(x, y - smileCurve, x + width, y + 2);
      ctx.stroke();

      // Upper lip (curved for smile, fuller with natural pink tone)
      ctx.fillStyle = '#e8a598';
      ctx.beginPath();
      ctx.ellipse(x, y - smileCurve/2, width * 0.9, 5, 0, 0, Math.PI);
      ctx.fill();

      // Lower lip (curved for smile, fuller and slightly lighter)
      ctx.fillStyle = '#f5b8a8';
      ctx.beginPath();
      ctx.ellipse(x, y + 3 - smileCurve/2, width * 0.9, 6, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Lip gloss highlight (subtle shine on lower lip)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y + 1 - smileCurve/2, width * 0.5, 3, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Smile lines (dimples) for friendly expression
      if (smileAmount > 0.2) {
        ctx.strokeStyle = 'rgba(212, 165, 116, 0.3)';
        ctx.lineWidth = 1;

        // Left smile line
        ctx.beginPath();
        ctx.moveTo(x - width - 5, y);
        ctx.quadraticCurveTo(x - width - 3, y - smileCurve, x - width, y - smileCurve - 2);
        ctx.stroke();

        // Right smile line
        ctx.beginPath();
        ctx.moveTo(x + width + 5, y);
        ctx.quadraticCurveTo(x + width + 3, y - smileCurve, x + width, y - smileCurve - 2);
        ctx.stroke();
      }

    } else if (shape < 1.5) {
      // Shape 1: Slightly open (small O)
      const height = width * 0.35;

      // Outer lips
      ctx.fillStyle = '#d4917a';
      ctx.beginPath();
      ctx.ellipse(x, y, width * 1.1, height * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner mouth
      ctx.fillStyle = '#4a1a1a';
      ctx.beginPath();
      ctx.ellipse(x, y, width * 0.85, height, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth hint
      ctx.fillStyle = '#fffef8';
      ctx.beginPath();
      ctx.ellipse(x, y - height * 0.3, width * 0.7, height * 0.4, 0, Math.PI, Math.PI * 2);
      ctx.fill();

    } else if (shape < 2.5) {
      // Shape 2: Half open (medium)
      const height = width * 0.65;

      // Outer lips
      ctx.fillStyle = '#d4917a';
      ctx.beginPath();
      ctx.ellipse(x, y, width * 1.15, height * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner mouth cavity
      ctx.fillStyle = '#3a0f0f';
      ctx.beginPath();
      ctx.ellipse(x, y, width * 0.95, height * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Upper teeth
      ctx.fillStyle = '#fffef8';
      ctx.beginPath();
      ctx.ellipse(x, y - height * 0.4, width * 0.8, height * 0.35, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Tongue
      ctx.fillStyle = '#dc6b6b';
      ctx.beginPath();
      ctx.ellipse(x, y + height * 0.4, width * 0.7, height * 0.4, 0, 0, Math.PI);
      ctx.fill();

      // Tongue detail
      ctx.strokeStyle = '#c95858';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + height * 0.1);
      ctx.lineTo(x, y + height * 0.5);
      ctx.stroke();

    } else {
      // Shape 3: Wide open
      const height = width * 0.95;

      // Outer lips
      ctx.fillStyle = '#d4917a';
      ctx.beginPath();
      ctx.ellipse(x, y, width * 1.2, height * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner mouth cavity
      ctx.fillStyle = '#2a0808';
      ctx.beginPath();
      ctx.ellipse(x, y, width, height * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Upper teeth
      ctx.fillStyle = '#fffef8';
      ctx.beginPath();
      ctx.rect(x - width * 0.85, y - height * 0.6, width * 1.7, height * 0.3);
      ctx.fill();

      // Individual teeth lines
      ctx.strokeStyle = '#e8e8d8';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * width * 0.25, y - height * 0.6);
        ctx.lineTo(x + i * width * 0.25, y - height * 0.3);
        ctx.stroke();
      }

      // Lower teeth hint
      ctx.fillStyle = '#f5f5e8';
      ctx.beginPath();
      ctx.rect(x - width * 0.7, y + height * 0.5, width * 1.4, height * 0.25);
      ctx.fill();

      // Tongue
      ctx.fillStyle = '#dc6b6b';
      ctx.beginPath();
      ctx.ellipse(x, y + height * 0.3, width * 0.75, height * 0.5, 0, 0, Math.PI);
      ctx.fill();

      // Tongue center line
      ctx.strokeStyle = '#c95858';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + height * 0.5);
      ctx.stroke();
    }
  }

  // Hide avatar canvas
  hide() {
    this.canvas.style.display = 'none';
  }

  // Show avatar canvas
  show() {
    this.canvas.style.display = 'block';
    // Draw initial closed mouth
    this.drawAvatar();
  }
}

// Create global avatar animator instance
const avatarAnimator = new AvatarAnimator('avatarCanvas');
