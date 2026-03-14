# Optimus Prime Voice Feature - Usage Guide

## For Students

### How to Use Optimus Prime Voice

1. **Open a Reading Passage**
   - Navigate to any reading comprehension quiz
   - The Voice Tutor controls will appear below the passage

2. **Select Optimus Prime Voice**
   - Look for the "Voice Character" section
   - Click the radio button next to "Optimus Prime"
   - The voice will change immediately for the next playback

3. **Play the Passage**
   - Click the "Play" button
   - The passage will be read in Optimus Prime's deep, authoritative voice
   - The text will highlight word-by-word as it's read

4. **Adjust Speed (Optional)**
   - Use the "Playback Speed" controls to adjust how fast Optimus Prime speaks
   - Options: 0.75x (Slow), 1x (Normal), 1.25x (Fast), 1.5x (Very Fast)

5. **Your Choice is Saved**
   - When you close and reopen the app, Optimus Prime will be remembered
   - Your voice preference persists across sessions

### Voice Characteristics

**Optimus Prime Voice:**
- 🎙️ Deep, commanding tone
- 🐢 Slightly slower speech (85% normal speed)
- 💪 Authoritative and powerful
- 🎯 Perfect for focused learning

**Normal Voice:**
- 🎙️ Standard system voice
- ⚡ Normal speech speed
- 📖 Clear and natural
- 🌍 Available in multiple languages

## For Developers

### Adding New Voice Presets

To add a new voice character preset, edit `src/engine/voiceEngine.js`:

```javascript
static VOICE_PRESETS = {
  normal: {
    name: 'Normal',
    pitch: 1,
    rate: 1,
    volume: 1
  },
  optimusPrime: {
    name: 'Optimus Prime',
    pitch: 0.6,
    rate: 0.85,
    volume: 1
  },
  // Add new preset here:
  megatron: {
    name: 'Megatron',
    pitch: 0.5,      // Even deeper
    rate: 0.8,       // Slower and more menacing
    volume: 1
  }
};
```

### Voice Preset Parameters

| Parameter | Range | Effect | Example |
|-----------|-------|--------|---------|
| `pitch` | 0.1 - 2.0 | Controls voice frequency (lower = deeper) | 0.6 = deep voice |
| `rate` | 0.1 - 2.0 | Controls speech speed (lower = slower) | 0.85 = 85% speed |
| `volume` | 0 - 1.0 | Controls loudness | 1 = full volume |

### Recommended Preset Configurations

**Deep & Authoritative (Optimus Prime)**
```javascript
pitch: 0.6,  // Lower pitch
rate: 0.85,  // Slightly slower
volume: 1    // Full volume
```

**Cheerful & Energetic (Bumblebee)**
```javascript
pitch: 1.3,  // Higher pitch
rate: 1.2,   // Faster speech
volume: 1    // Full volume
```

**Professional & Clear (Narrator)**
```javascript
pitch: 0.9,  // Slightly lower
rate: 0.95,  // Slightly slower
volume: 1    // Full volume
```

**Menacing & Aggressive (Megatron)**
```javascript
pitch: 0.5,  // Very deep
rate: 0.8,   // Slower
volume: 1    // Full volume
```

### Using Voice Presets in Code

```javascript
import { VoiceEngine } from './engine/voiceEngine.js';

// Initialize with Optimus Prime voice
const voiceEngine = new VoiceEngine({
  language: 'en',
  voicePreset: 'optimusPrime'
});

// Switch to different preset
voiceEngine.setVoicePreset('normal');

// Get available presets
const presets = VoiceEngine.getAvailablePresets();
console.log(presets);
// Output: [
//   { id: 'normal', name: 'Normal' },
//   { id: 'optimusPrime', name: 'Optimus Prime' }
// ]
```

### Testing Voice Presets

Run the test suite:

```bash
npm run test
```

Specific voice preset tests:

```bash
npm run test -- voiceTutorOptimus
```

## Technical Implementation

### Architecture

```
VoiceEngine
├── VOICE_PRESETS (static)
│   ├── normal
│   └── optimusPrime
├── setVoicePreset(preset)
├── getAvailablePresets()
└── _applyVoicePreset(preset)

VoiceTutor Component
├── renderVoiceTutor()
│   └── Voice Character Control UI
├── mountVoiceTutor()
│   └── Initialize voice engine with preset
└── handleVoiceCharacterChange(preset)
    └── Update engine and save preference
```

### State Management

Voice preset preference is stored in localStorage:

```javascript
// Saved as:
localStorage.setItem('voice_tutor_preferences', JSON.stringify({
  speed: 1,
  language: 'en',
  voicePreset: 'optimusPrime'
}));

// Loaded on mount:
const preferences = JSON.parse(localStorage.getItem('voice_tutor_preferences'));
voiceEngine.setVoicePreset(preferences.voicePreset);
```

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Web Speech API fully supported |
| Safari | ✅ Full | iOS Safari 14.1+ supported |
| Edge | ✅ Full | Chromium-based, full support |
| Firefox | ⚠️ Limited | Web Speech API limited support |
| Opera | ✅ Full | Chromium-based, full support |

## Troubleshooting

### Voice Not Changing

1. **Check browser support**: Ensure you're using a supported browser
2. **Refresh the page**: Sometimes the Web Speech API needs a refresh
3. **Check system voices**: Your system may not have the voice installed
4. **Try different speed**: Adjust playback speed to hear the difference

### Optimus Prime Voice Sounds Normal

- This is expected if your system doesn't have multiple voices installed
- The pitch and rate adjustments will still apply
- Try adjusting the speed control to hear the effect

### Voice Preference Not Saving

1. **Check localStorage**: Ensure localStorage is enabled in your browser
2. **Check privacy settings**: Some browsers block localStorage in private mode
3. **Clear cache**: Try clearing browser cache and cookies
4. **Check console**: Look for any JavaScript errors in the browser console

## Future Enhancements

Planned voice presets for future releases:

- **Megatron** - Menacing, aggressive tone
- **Bumblebee** - Cheerful, energetic tone
- **Narrator** - Professional, clear tone
- **Motivator** - Encouraging, uplifting tone
- **Whisper** - Soft, intimate tone
- **Announcer** - Dramatic, theatrical tone

## Feedback & Suggestions

Have ideas for new voice presets? Found a bug? Let us know!

- 📧 Email: support@aceprep.com
- 💬 Discord: [Join our community]
- 🐛 GitHub Issues: [Report a bug]

---

**Enjoy learning with Optimus Prime! 🤖**
