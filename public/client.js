// WebRTC configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// DOM elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallBtn = document.getElementById('startCallBtn');
const hangUpBtn = document.getElementById('hangUpBtn');
const muteBtn = document.getElementById('muteBtn');
const videoToggleBtn = document.getElementById('videoToggleBtn');
const speakerBtn = document.getElementById('speakerBtn');
const aiModeBtn = document.getElementById('aiModeBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const infoBox = document.getElementById('infoBox');
const aiIndicators = document.getElementById('aiIndicators');
const conversationPanel = document.getElementById('conversationPanel');

// State variables
let ws = null;
let peerConnection = null;
let localStream = null;
let isInitiator = false;
let isAudioMuted = false;
let isVideoEnabled = true;
let isSpeakerOn = false;
let peerConnected = false;
let isAIModeActive = false;

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    console.log('Attempting WebSocket connection to:', wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected successfully');
        updateStatus('connected', 'Connected');
        showInfo('Connected to server. Waiting for peer...', 'success');
    };

    ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message.type);

        switch (message.type) {
            case 'connection-status':
                handleConnectionStatus(message);
                break;
            case 'start-call':
                await handleStartCall();
                break;
            case 'offer':
                await handleOffer(message.sdp);
                break;
            case 'answer':
                await handleAnswer(message.sdp);
                break;
            case 'ice-candidate':
                await handleIceCandidate(message.candidate);
                break;
            case 'peer-disconnected':
                handlePeerDisconnected();
                break;
            case 'ai-response':
                if (typeof aiMode !== 'undefined') {
                    aiMode.handleAIResponse(message.message);
                }
                break;
            case 'ai-mode-status':
                handleAIModeStatus(message);
                break;
            case 'ai-error':
                showInfo(message.error, 'error');
                break;
            case 'error':
                showInfo(message.message, 'error');
                break;
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateStatus('disconnected', 'Disconnected');
        showInfo('Disconnected from server. Trying to reconnect...', 'error');
        setTimeout(initWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('Error details:', {
            url: wsUrl,
            readyState: ws.readyState,
            protocol: window.location.protocol
        });
        showInfo('Connection error. Check console for details.', 'error');
    };
}

// Handle connection status updates
function handleConnectionStatus(message) {
    peerConnected = message.ready;

    if (message.ready) {
        updateStatus('connected', 'Peer Connected');
        showInfo('Peer connected! Click "Start Call" to begin.', 'success');
        startCallBtn.disabled = false;
    } else {
        updateStatus('connected', 'Waiting for Peer');
        showInfo('Waiting for peer to connect...', '');
        startCallBtn.disabled = true;
    }
}

// Initialize local media stream
async function initLocalStream() {
    console.log('Attempting to get user media...');
    console.log('Navigator.mediaDevices available:', !!navigator.mediaDevices);
    console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);

    try {
        console.log('Requesting camera and microphone...');
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        localVideo.srcObject = localStream;
        muteBtn.disabled = false;
        videoToggleBtn.disabled = false;

        console.log('Local stream initialized successfully');
        console.log('Stream tracks:', localStream.getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            label: t.label
        })));
        return true;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        let errorMsg = 'Camera/microphone access error: ';
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMsg += 'Permission denied. Please allow camera/microphone access.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMsg += 'No camera/microphone found.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMsg += 'Camera is already in use by another app.';
        } else {
            errorMsg += error.message;
        }

        showInfo(errorMsg, 'error');
        return false;
    }
}

// Create peer connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        if (remoteVideo.srcObject !== event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
            console.log('Remote stream added');
        }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Sending ICE candidate');
            sendMessage({
                type: 'ice-candidate',
                candidate: event.candidate
            });
        }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);

        switch (peerConnection.connectionState) {
            case 'connected':
                updateStatus('in-call', 'In Call');
                showInfo('Call connected successfully!', 'success');
                hangUpBtn.disabled = false;
                startCallBtn.disabled = true;
                speakerBtn.disabled = false;
                break;
            case 'disconnected':
                updateStatus('connected', 'Call Ended');
                showInfo('Call ended.', '');
                break;
            case 'failed':
                showInfo('Connection failed. Please try again.', 'error');
                hangUp();
                break;
        }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);

        if (peerConnection.iceConnectionState === 'failed') {
            showInfo('Connection failed. Check your network.', 'error');
        }
    };

    return peerConnection;
}

// Start call (initiator)
async function startCall() {
    console.log('Starting call as initiator');
    isInitiator = true;

    // Initialize local stream if not already done
    if (!localStream) {
        const success = await initLocalStream();
        if (!success) return;
    }

    // Create peer connection
    createPeerConnection();

    // Send start-call message to peer
    sendMessage({ type: 'start-call' });

    // Create and send offer
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('Sending offer');
        sendMessage({
            type: 'offer',
            sdp: offer
        });

        showInfo('Calling peer...', '');
    } catch (error) {
        console.error('Error creating offer:', error);
        showInfo('Failed to start call. Please try again.', 'error');
    }
}

// Handle start call request (receiver)
async function handleStartCall() {
    console.log('Receiving call');
    console.log('Current state:', {
        hasLocalStream: !!localStream,
        hasPeerConnection: !!peerConnection
    });
    isInitiator = false;

    // Initialize local stream if not already done
    if (!localStream) {
        console.log('No local stream, initializing...');
        const success = await initLocalStream();
        if (!success) {
            console.error('Failed to initialize local stream!');
            showInfo('Cannot start call - camera/microphone access denied.', 'error');
            return;
        }
        console.log('Local stream initialized successfully');
    }

    // Create peer connection
    console.log('Creating peer connection...');
    createPeerConnection();
    console.log('Peer connection created:', !!peerConnection);

    showInfo('Incoming call...', '');
}

// Handle offer (receiver)
async function handleOffer(sdp) {
    console.log('Received offer');

    if (!peerConnection) {
        console.error('No peer connection when receiving offer!');
        showInfo('Connection not ready. Please refresh and try again.', 'error');
        return;
    }

    try {
        console.log('Setting remote description...');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        console.log('Creating answer...');
        const answer = await peerConnection.createAnswer();

        console.log('Setting local description...');
        await peerConnection.setLocalDescription(answer);

        console.log('Sending answer');
        sendMessage({
            type: 'answer',
            sdp: answer
        });
    } catch (error) {
        console.error('Error handling offer:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            hasPeerConnection: !!peerConnection,
            hasLocalStream: !!localStream
        });
        showInfo('Failed to process call. Please try again.', 'error');
    }
}

// Handle answer (initiator)
async function handleAnswer(sdp) {
    console.log('Received answer');

    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (error) {
        console.error('Error handling answer:', error);
        showInfo('Failed to establish connection.', 'error');
    }
}

// Handle ICE candidate
async function handleIceCandidate(candidate) {
    console.log('Received ICE candidate');

    try {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
}

// Handle peer disconnection
function handlePeerDisconnected() {
    console.log('Peer disconnected');
    showInfo('Peer disconnected. Waiting for reconnection...', 'error');
    hangUp();
    peerConnected = false;
    startCallBtn.disabled = true;
}

// Hang up call
function hangUp() {
    console.log('Hanging up');

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
    }

    hangUpBtn.disabled = true;

    if (peerConnected) {
        startCallBtn.disabled = false;
        updateStatus('connected', 'Peer Connected');
        showInfo('Call ended. Click "Start Call" to call again.', '');
    } else {
        startCallBtn.disabled = true;
        updateStatus('connected', 'Waiting for Peer');
        showInfo('Waiting for peer to connect...', '');
    }

    // Notify peer
    sendMessage({ type: 'hang-up' });
}

// Toggle audio mute
function toggleMute() {
    if (!localStream) return;

    isAudioMuted = !isAudioMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioMuted;
    });

    if (isAudioMuted) {
        muteBtn.classList.add('active');
        muteBtn.innerHTML = '<span class="btn-icon">🔇</span>Unmute';
    } else {
        muteBtn.classList.remove('active');
        muteBtn.innerHTML = '<span class="btn-icon">🎤</span>Mute';
    }
}

// Toggle video
function toggleVideo() {
    if (!localStream) return;

    isVideoEnabled = !isVideoEnabled;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
    });

    if (isVideoEnabled) {
        videoToggleBtn.classList.remove('active');
        videoToggleBtn.innerHTML = '<span class="btn-icon">📹</span>Camera Off';
    } else {
        videoToggleBtn.classList.add('active');
        videoToggleBtn.innerHTML = '<span class="btn-icon">📷</span>Camera On';
    }
}

// Toggle speaker mode (loudspeaker vs earpiece)
async function toggleSpeaker() {
    if (!remoteVideo.srcObject) return;

    isSpeakerOn = !isSpeakerOn;

    try {
        // iOS-specific workaround: Control audio routing via video element properties
        // iOS routes audio to loudspeaker when video is playing visibly,
        // and to earpiece when video is hidden or audio-only

        if (isSpeakerOn) {
            // Enable loudspeaker mode
            remoteVideo.muted = false;
            remoteVideo.volume = 1.0;
            remoteVideo.style.visibility = 'visible';

            // Try setSinkId for browsers that support it (Android Chrome)
            if ('setSinkId' in remoteVideo) {
                try {
                    await remoteVideo.setSinkId('');
                    console.log('Audio output set to speaker via setSinkId');
                } catch (e) {
                    console.log('setSinkId not fully supported, using fallback');
                }
            }

            speakerBtn.classList.add('active');
            speakerBtn.innerHTML = '<span class="btn-icon">📱</span>Earpiece';
            showInfo('🔊 Loudspeaker mode ON', 'success');
            console.log('Loudspeaker mode enabled');
        } else {
            // Enable earpiece mode (default)
            remoteVideo.muted = false;
            remoteVideo.volume = 1.0;

            speakerBtn.classList.remove('active');
            speakerBtn.innerHTML = '<span class="btn-icon">🔊</span>Speaker';
            showInfo('📱 Earpiece mode ON', 'success');
            console.log('Earpiece mode enabled');
        }

        // Clear the info message after 2 seconds
        setTimeout(() => {
            if (peerConnection && peerConnection.connectionState === 'connected') {
                showInfo('Call connected successfully!', 'success');
            }
        }, 2000);
    } catch (error) {
        console.error('Error changing audio output:', error);

        // Even if there's an error, toggle the button state
        if (isSpeakerOn) {
            speakerBtn.classList.add('active');
            speakerBtn.innerHTML = '<span class="btn-icon">📱</span>Earpiece';
        } else {
            speakerBtn.classList.remove('active');
            speakerBtn.innerHTML = '<span class="btn-icon">🔊</span>Speaker';
        }

        showInfo('Audio routing may not be fully supported on this device', 'success');
    }
}

// Send WebSocket message
function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// Update status indicator
function updateStatus(state, text) {
    statusIndicator.className = `status-indicator ${state}`;
    statusText.textContent = text;
}

// Show info message
function showInfo(message, type = '') {
    infoBox.textContent = message;
    infoBox.className = `info-box ${type}`;
}

// Toggle AI Mode
function toggleAIMode() {
    if (!isAIModeActive) {
        // Enable AI Mode
        sendMessage({ type: 'ai-mode-enable' });
        console.log('Requesting AI mode enable...');
    } else {
        // Disable AI Mode
        sendMessage({ type: 'ai-mode-disable' });
        if (typeof aiMode !== 'undefined') {
            aiMode.disable();
        }
        isAIModeActive = false;
        aiModeBtn.classList.remove('active');
        aiModeBtn.innerHTML = '<span class="btn-icon">🤖</span>AI Mode';
        aiIndicators.style.display = 'none';
        conversationPanel.style.display = 'none';
        showInfo('AI Mode disabled', '');
    }
}

// Handle AI Mode status updates
function handleAIModeStatus(message) {
    if (message.enabled) {
        isAIModeActive = true;
        aiModeBtn.classList.add('active');
        aiModeBtn.innerHTML = '<span class="btn-icon">🤖</span>Stop AI';
        aiIndicators.style.display = 'flex';
        conversationPanel.style.display = 'block';

        // Enable AI mode in client
        if (typeof aiMode !== 'undefined') {
            const success = aiMode.enable();
            if (success) {
                showInfo('🤖 AI Mode enabled - Phone can now talk to AI agent', 'success');
            } else {
                showInfo('Speech recognition not supported in this browser', 'error');
                toggleAIMode(); // Disable
            }
        }
    } else {
        isAIModeActive = false;
        aiModeBtn.classList.remove('active');
        aiModeBtn.innerHTML = '<span class="btn-icon">🤖</span>AI Mode';
        aiIndicators.style.display = 'none';
        conversationPanel.style.display = 'none';

        if (message.error) {
            showInfo(message.error, 'error');
        }
    }
}

// Check browser compatibility
function checkBrowserCompatibility() {
    if (!window.RTCPeerConnection) {
        showInfo('Your browser does not support WebRTC peer connections.', 'error');
        return false;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showInfo('MediaDevices API not available. Note: Camera/microphone require HTTPS or localhost.', 'error');
        return false;
    }
    return true;
}

// Check if we're on a secure context
function checkSecureContext() {
    const isSecure = window.isSecureContext || window.location.protocol === 'https:' ||
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

    if (!isSecure) {
        console.warn('Not a secure context. Camera access may be restricted.');
        showInfo('⚠️ For security, browsers require HTTPS or localhost for camera access. Connection via IP may not work. Try localhost on PC.', 'error');
        return false;
    }
    return true;
}

// Event listeners
startCallBtn.addEventListener('click', startCall);
aiModeBtn.addEventListener('click', toggleAIMode);
hangUpBtn.addEventListener('click', hangUp);
muteBtn.addEventListener('click', toggleMute);
videoToggleBtn.addEventListener('click', toggleVideo);
speakerBtn.addEventListener('click', toggleSpeaker);

// Initialize on page load
window.addEventListener('load', async () => {
    if (!checkBrowserCompatibility()) return;

    // Check secure context (gives warning but doesn't block)
    const isSecure = checkSecureContext();

    // Try to initialize local stream, but don't block on failure
    if (isSecure) {
        await initLocalStream();
    } else {
        // For insecure contexts, we'll request camera when starting call
        showInfo('⚠️ Insecure context detected. Camera will be requested when call starts. Use localhost for best experience.', 'error');
    }

    // Connect to WebSocket server regardless
    initWebSocket();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    if (ws) {
        ws.close();
    }
});
