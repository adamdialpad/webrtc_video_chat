// 3D Avatar Animator - Three.js with Ready Player Me GLB
// Syncs avatar animations with AI speech using morph targets

class AvatarAnimator3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isAnimating = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatar = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    // Morph target indices for lip-sync (will be set after model loads)
    this.morphTargets = {
      mouthOpen: null,
      mouthSmile: null,
      viseme_aa: null,
      viseme_E: null,
      viseme_I: null,
      viseme_O: null,
      viseme_U: null
    };

    // Animation state
    this.mouthOpenAmount = 0;
    this.targetMouthOpenAmount = 0;
    this.smileAmount = 0.3; // Default friendly smile
    this.lastUpdateTime = 0;
    this.updateInterval = 100; // Update mouth shape every 100ms

    // Head movement
    this.headRotationX = 0;
    this.headRotationY = 0;
    this.targetHeadRotationX = 0;
    this.targetHeadRotationY = 0;
    this.lastHeadMoveTime = Date.now();

    // Blinking
    this.eyeBlinkAmount = 0;
    this.lastBlinkTime = Date.now();
    this.blinkInterval = 3000 + Math.random() * 2000;

    this.initThreeJS();
    this.loadAvatar();
  }

  initThreeJS() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9fafb);

    // Camera setup - close-up for head and upper shoulders only
    this.camera = new THREE.PerspectiveCamera(
      45, // Wider field of view to capture full head including top
      1, // Will be updated on resize
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 0.65); // Positioned further back to show full head
    this.camera.lookAt(0, 1.5, 0); // Look at center of head

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.updateSize();
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 2, 1);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-1, 0, -1);
    this.scene.add(fillLight);

    // Handle window resize
    window.addEventListener('resize', () => this.updateSize());
  }

  updateSize() {
    const size = Math.min(500, window.innerWidth * 0.8);
    this.renderer.setSize(size, size);
    if (this.camera) {
      this.camera.aspect = 1;
      this.camera.updateProjectionMatrix();
    }
  }

  async loadAvatar() {
    const loader = new THREE.GLTFLoader();

    try {
      console.log('🎭 Loading Ready Player Me avatar...');

      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          'avatar.glb',
          (gltf) => resolve(gltf),
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Loading avatar: ${percent}%`);
          },
          (error) => reject(error)
        );
      });

      this.avatar = gltf.scene;
      this.scene.add(this.avatar);

      // Find the head mesh with morph targets
      this.avatar.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary) {
          console.log('📊 Available morph targets:', Object.keys(child.morphTargetDictionary));

          // Map morph target names to indices
          const dict = child.morphTargetDictionary;
          this.morphTargets.head = child;

          // Common Ready Player Me morph targets
          if ('mouthOpen' in dict) this.morphTargets.mouthOpen = dict.mouthOpen;
          if ('mouthSmile' in dict) this.morphTargets.mouthSmile = dict.mouthSmile;
          if ('viseme_aa' in dict) this.morphTargets.viseme_aa = dict.viseme_aa;
          if ('viseme_E' in dict) this.morphTargets.viseme_E = dict.viseme_E;
          if ('viseme_I' in dict) this.morphTargets.viseme_I = dict.viseme_I;
          if ('viseme_O' in dict) this.morphTargets.viseme_O = dict.viseme_O;
          if ('viseme_U' in dict) this.morphTargets.viseme_U = dict.viseme_U;
          if ('eyeBlinkLeft' in dict) this.morphTargets.eyeBlinkLeft = dict.eyeBlinkLeft;
          if ('eyeBlinkRight' in dict) this.morphTargets.eyeBlinkRight = dict.eyeBlinkRight;
        }

        // Find head bone for rotation
        if (child.isBone && child.name.toLowerCase().includes('head')) {
          this.morphTargets.headBone = child;
        }
      });

      // Setup animation mixer if there are animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.avatar);
        gltf.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          action.play();
        });
      }

      // Set default smile
      if (this.morphTargets.head && this.morphTargets.mouthSmile !== null) {
        this.morphTargets.head.morphTargetInfluences[this.morphTargets.mouthSmile] = 0.3;
      }

      console.log('✅ Avatar loaded successfully');

      // Start rendering
      this.render();

    } catch (error) {
      console.error('❌ Error loading avatar:', error);
    }
  }

  start() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.lastUpdateTime = Date.now();
    console.log('🎭 Avatar animation started');
  }

  stop() {
    this.isAnimating = false;
    this.mouthOpenAmount = 0;
    this.targetMouthOpenAmount = 0;

    // Reset mouth to closed with smile
    if (this.morphTargets.head && this.morphTargets.mouthOpen !== null) {
      this.morphTargets.head.morphTargetInfluences[this.morphTargets.mouthOpen] = 0;
    }

    console.log('🎭 Avatar animation stopped');
  }

  updateMouthShape() {
    // Simulate natural speech pattern
    const rand = Math.random();

    if (rand < 0.15) {
      // Closed (consonants)
      this.targetMouthOpenAmount = 0;
    } else if (rand < 0.4) {
      // Slightly open
      this.targetMouthOpenAmount = 0.3;
    } else if (rand < 0.75) {
      // Half open (most vowels)
      this.targetMouthOpenAmount = 0.6;
    } else {
      // Wide open (emphasis)
      this.targetMouthOpenAmount = 1.0;
    }
  }

  updateBlinking(now) {
    if (now - this.lastBlinkTime > this.blinkInterval) {
      // Start blink
      this.eyeBlinkAmount = 1.0;

      setTimeout(() => {
        // End blink
        this.eyeBlinkAmount = 0;
        this.lastBlinkTime = now;
        this.blinkInterval = 3000 + Math.random() * 2000;
      }, 150);
    }
  }

  updateHeadMovement(now) {
    if (now - this.lastHeadMoveTime > 2000) {
      // Small random head movement
      this.targetHeadRotationX = (Math.random() - 0.5) * 0.1;
      this.targetHeadRotationY = (Math.random() - 0.5) * 0.15;
      this.lastHeadMoveTime = now;
    }
  }

  animate() {
    if (!this.morphTargets.head) return;

    const now = Date.now();
    const head = this.morphTargets.head;

    // Update mouth shape periodically when speaking
    if (this.isAnimating && now - this.lastUpdateTime > this.updateInterval) {
      this.updateMouthShape();
      this.lastUpdateTime = now;
    }

    // Smooth transitions
    this.mouthOpenAmount += (this.targetMouthOpenAmount - this.mouthOpenAmount) * 0.3;
    this.headRotationX += (this.targetHeadRotationX - this.headRotationX) * 0.05;
    this.headRotationY += (this.targetHeadRotationY - this.headRotationY) * 0.05;

    // Apply mouth morph targets
    if (this.morphTargets.mouthOpen !== null) {
      head.morphTargetInfluences[this.morphTargets.mouthOpen] = this.mouthOpenAmount;
    }

    // Keep smile
    if (this.morphTargets.mouthSmile !== null) {
      head.morphTargetInfluences[this.morphTargets.mouthSmile] = this.smileAmount;
    }

    // Apply blinking
    if (this.morphTargets.eyeBlinkLeft !== null) {
      head.morphTargetInfluences[this.morphTargets.eyeBlinkLeft] = this.eyeBlinkAmount;
    }
    if (this.morphTargets.eyeBlinkRight !== null) {
      head.morphTargetInfluences[this.morphTargets.eyeBlinkRight] = this.eyeBlinkAmount;
    }

    // Apply head rotation
    if (this.morphTargets.headBone) {
      this.morphTargets.headBone.rotation.x = this.headRotationX;
      this.morphTargets.headBone.rotation.y = this.headRotationY;
    }

    // Update blinking
    this.updateBlinking(now);

    // Update head movement
    this.updateHeadMovement(now);
  }

  render() {
    requestAnimationFrame(() => this.render());

    // Update animation mixer
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }

    // Update avatar animations
    this.animate();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'flex';
  }
}

// Wait for Three.js to load before creating the avatar
function initAvatarWhenReady() {
  if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
    window.avatarAnimator = new AvatarAnimator3D('avatarContainer');
  } else {
    setTimeout(initAvatarWhenReady, 100);
  }
}

initAvatarWhenReady();
