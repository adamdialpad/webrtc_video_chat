# iOS Speaker Mode Information

## How Speaker Toggle Works on iOS

iOS Safari and Chrome (which uses Safari's WebKit) have **limited control** over audio routing compared to native apps. Here's what to know:

### iOS Audio Routing Behavior:

1. **By Default**: iOS automatically routes audio to the **loudspeaker** when:
   - A video element is playing with visible video
   - The screen is on and the app is in foreground

2. **Earpiece Mode**: iOS routes to earpiece when:
   - It's an audio-only call (no video)
   - The video element is hidden
   - Using voice calls without video

### What the Speaker Button Does:

- **First tap (Speaker ON)**: Ensures video is visible and volume is up → Audio goes to **loudspeaker**
- **Second tap (Earpiece)**: Switches back to default mode

### Important iOS Limitations:

⚠️ **iOS WebRTC does NOT support forcing earpiece mode while video is playing**

This is a Safari/WebKit limitation, not a bug in the app. Native iOS apps have more control over audio routing, but web apps are restricted.

### Workaround for Private Calls on iOS:

If you need a truly private call on iPhone:

1. **Option 1**: Use wired headphones or AirPods
2. **Option 2**: Turn off your camera (Camera Off button) - this may route to earpiece
3. **Option 3**: Lower the volume and hold phone close to ear

### What Works Well:

✅ **Loudspeaker mode** - Works perfectly for hands-free calls
✅ **Bluetooth headsets** - Audio automatically routes to connected Bluetooth devices
✅ **Wired headphones** - Audio automatically routes to plugged-in headphones

### Android vs iOS:

- **Android Chrome**: Better support for `setSinkId()` API, more control
- **iOS Safari/Chrome**: Limited by WebKit, automatic routing based on context

### Best Practice:

For video calls on iPhone, **loudspeaker is the default and recommended mode**. If privacy is needed, use headphones instead of trying to force earpiece mode.

---

**Bottom Line**: The Speaker button on iOS primarily serves as a visual indicator. iOS will automatically use the loudspeaker during video calls, which is the expected behavior for most video chat applications.
