# AI Voice Tutor - Implementation Guide

## Overview

The AI Voice Tutor is a comprehensive text-to-speech feature that enables students to hear reading comprehension passages read aloud with synchronized visual highlighting. This guide provides developers with the information needed to understand, maintain, and extend the voice tutor system.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Voice Tutor System                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  VoiceTutor Component (UI Layer)                 │  │
│  │  • Renders controls (play, pause, stop)          │  │
│  │  • Manages user interactions                     │  │
│  │  • Persists preferences                          │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▲                             │
│                           │                             │
│  ┌────────────────────────┴────────────────────────┐   │
│  │                                                 │   │
│  ▼                                                 ▼   │
│ ┌──────────────────┐                  ┌──────────────┐ │
│ │  VoiceEngine     │                  │HighlightSync │ │
│ │                  │                  │              │ │
│ │ • Web Speech API │                  │ • Word-level │ │
│ │ • Playback ctrl  │                  │   highlighting
│ │ • Rate control   │                  │ • DOM updates│ │
│ │ • Voice select   │                  │ • Cleanup    │ │
│ └──────────────────┘                  └──────────────┘ │
│         ▲                                      ▲        │
│         │                                      │        │
│         └──────────────────┬───────────────────┘        │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │  AudioCache    │                   │
│                    │                │                   │
│                    │ • IndexedDB    │                   │
│                    │ • Offline      │                   │
│                    │ • LRU eviction │                   │
│                    └────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Play)
    ↓
VoiceTutor Component
    ↓
VoiceEngine.speak()
    ├─→ Create SpeechSynthesisUtterance
    ├─→ Set rate, pitch, volume
    ├─→ Compute word boundaries
    └─→ Start synthesis
    ↓
Word Boundary Event
    ↓
HighlightSync.updateHighlight()
    ├─→ Find word index
    ├─→ Update DOM class
    └─→ Announce to screen reader
    ↓
Playback Complete
    ↓
VoiceEngine emits 'end' event
    ↓
VoiceTutor updates UI
```

---

## Core Components

### 1. VoiceEngine (`src/engine/voiceEngine.js`)

**Purpose**: Manage Web Speech API interactions and text-to-speech synthesis.

#### Key Methods

```javascript
// Initialization
constructor(options)
  - Initialize with language, rate, pitch, volume
  - Detect browser capabilities (iOS Safari, Android Chrome)
  - Preload available voices asynchronously

checkSupport()
  - Returns true if Web Speech API is available
  - Used to determine feature availability

// Playback Control
async speak(text, options)
  - Initiate speech synthesis
  - Emit 'start', 'boundary', 'end', 'error' events
  - Handle word boundary tracking

pause()
  - Pause current utterance
  - Set isPaused flag

resume()
  - Resume from paused position
  - Clear isPaused flag

stop()
  - Stop speech and reset state
  - Cancel pending utterance

// Configuration
setRate(rate)
  - Set playback speed (0.75, 1, 1.25, 1.5)
  - Apply immediately if playing

setVoice(language)
  - Select language-specific voice
  - Fall back to default if unavailable

setVoicePreset(preset)
  - Apply voice preset ('normal', 'optimusPrime')
  - Adjust pitch, rate, volume

// Event Management
on(eventName, callback)
  - Register event listener
  - Supported events: 'start', 'boundary', 'end', 'error', 'pause', 'resume'

off(eventName, callback)
  - Unregister event listener

// Cleanup
destroy()
  - Cancel utterance
  - Remove all event listeners
  - Clear references
```

#### Events Emitted

```javascript
// Start event
engine.on('start', () => {
  // Playback started
});

// Boundary event (word boundary)
engine.on('boundary', (data) => {
  // data.wordIndex: Index of current word
  // data.charPosition: Character position in text
});

// End event
engine.on('end', () => {
  // Playback completed
});

// Error event
engine.on('error', (error) => {
  // error.message: Error description
});

// Pause event
engine.on('pause', () => {
  // Playback paused
});

// Resume event
engine.on('resume', () => {
  // Playback resumed
});
```

#### Voice Presets

```javascript
VoiceEngine.VOICE_PRESETS = {
  normal: {
    name: 'Normal',
    pitch: 1,
    rate: 1,
    volume: 1
  },
  optimusPrime: {
    name: 'Optimus Prime',
    pitch: 0.6,      // Deep voice
    rate: 0.85,      // Authoritative tone
    volume: 1
  }
};

// Usage
engine.setVoicePreset('optimusPrime');
```

---

### 2. HighlightSync (`src/engine/highlightSync.js`)

**Purpose**: Synchronize visual highlighting with audio playback at word level.

#### Key Methods

```javascript
// Initialization
constructor(passageElement, options)
  - Initialize with passage DOM element
  - Set up configuration (highlight class, color, etc.)

initialize(passage)
  - Parse passage into words
  - Create word-level DOM structure
  - Compute word boundaries
  - Return array of word elements

// Highlighting
updateHighlight(wordIndex)
  - Move highlight to specified word
  - Remove previous highlight
  - Add new highlight
  - Performance: <50ms

clearHighlight()
  - Remove all highlighting
  - Reset current word index

// Utilities
getWordBoundaries()
  - Return array of character positions for word boundaries
  - Used for Web Speech API boundary event mapping

getWordCount()
  - Return total number of words in passage

getCurrentWordIndex()
  - Return index of currently highlighted word

getLastHighlightTime()
  - Return time of last highlight update

// Cleanup
destroy()
  - Remove all word elements from DOM
  - Clear internal state
  - Remove event listeners
```

#### Word Boundary Mapping Algorithm

```javascript
// Example: Map character positions to word indices
Passage: "The quick brown fox"
Words: ["The", "quick", "brown", "fox"]
Char positions: [0, 4, 10, 16]

// When Web Speech API emits boundary at char 4:
// Binary search finds word index 1 ("quick")
// updateHighlight(1) highlights "quick"
```

#### Configuration Options

```javascript
const options = {
  highlightClass: 'voice-highlight',  // CSS class for highlighting
  highlightColor: '#FFD700',           // Highlight color (gold)
  transitionDuration: 100,             // CSS transition duration (ms)
  debounceDelay: 0                     // Debounce highlight updates (ms)
};

const sync = new HighlightSync(element, options);
```

---

### 3. AudioCache (`src/engine/audioCache.js`)

**Purpose**: Cache generated audio for offline use.

#### Key Methods

```javascript
// Initialization
async initialize()
  - Open IndexedDB connection
  - Create object store for audio blobs
  - Set up metadata storage

// Storage
async get(passageId)
  - Retrieve cached audio blob
  - Return null if not found

async set(passageId, audioBlob, metadata)
  - Store audio blob with metadata
  - metadata: { language, rate, timestamp }
  - Implement LRU eviction if needed

async clear()
  - Clear all cached audio
  - Reset cache size

// Utilities
async isAvailable(passageId)
  - Check if audio is cached
  - Return boolean

async getSize()
  - Return total cache size in bytes

async getCacheStats()
  - Return cache statistics
  - { totalSize, entryCount, oldestEntry, newestEntry }
```

#### Storage Strategy

```javascript
// IndexedDB Schema
Database: 'voiceTutorCache'
Store: 'audioBlobs'

Entry Structure:
{
  passageId: 'passage_001',
  language: 'en',
  rate: 1,
  audioBlob: Blob,
  timestamp: 1234567890,
  size: 45000
}

// LRU Eviction
- Max cache size: 50MB
- When exceeded: Remove oldest entries
- Eviction triggered: On set() if cache > 50MB
```

---

### 4. VoiceTutor Component (`src/features/student/VoiceTutor.js`)

**Purpose**: Orchestrate voice tutor UI and coordinate engine components.

#### Key Functions

```javascript
// Rendering
export function renderVoiceTutor(passage)
  - Return HTML string with:
    • Play/Pause/Stop buttons
    • Speed control (0.75x, 1x, 1.25x, 1.5x)
    • Voice character selector
    • Status display
    • Error message area
    • ARIA labels and live regions

// Mounting
export function mountVoiceTutor(passage)
  - Initialize VoiceEngine
  - Initialize HighlightSync
  - Initialize AudioCache
  - Attach event listeners
  - Restore user preferences
  - Set up offline detection
```

#### State Management

```javascript
const voiceTutorState = {
  passage: null,              // Current passage object
  isPlaying: false,           // Playback status
  isPaused: false,            // Pause status
  currentRate: 1,             // Playback rate
  currentLanguage: 'en',      // Language preference
  currentVoicePreset: 'normal', // Voice preset
  currentWordIndex: -1,       // Currently highlighted word
  error: null,                // Error message
  isOffline: false,           // Offline status
  usePreRecorded: false       // Using pre-recorded audio
};
```

#### Preference Persistence

```javascript
// Speed preference
localStorage.setItem('voice_tutor_speed', JSON.stringify({
  speed: 1,
  timestamp: Date.now()
}));

// Language preference
localStorage.setItem('voice_tutor_language', JSON.stringify({
  language: 'en',
  timestamp: Date.now()
}));

// Voice preset preference
localStorage.setItem('voice_tutor_preset', JSON.stringify({
  preset: 'optimusPrime',
  timestamp: Date.now()
}));
```

---

## Integration Points

### With Reading Comprehension Module

```javascript
// 1. Passage Injection
const passage = {
  id: 'passage_001',
  text: 'The quick brown fox...',
  subject: 'English',
  difficulty: 'intermediate'
};

// 2. Auto-Pause on Question Answer
window.addEventListener('question-answered', () => {
  voiceEngine.pause();
});

// 3. Resource Cleanup on Navigation
window.addEventListener('route-change', () => {
  voiceEngine.stop();
  voiceEngine.destroy();
});
```

### With i18n Module

```javascript
// Language preference sync
i18n.on('language-changed', (language) => {
  voiceEngine.setVoice(language);
  localStorage.setItem('voice_tutor_language', language);
});
```

### With Progress Store

```javascript
// Check online status
const isOnline = progressStore.isOnline();
if (!isOnline) {
  voiceEngine.setOfflineMode(true);
}
```

---

## Performance Optimization

### Initialization (<500ms target)

```javascript
// 1. Lazy Load Voice Engine
// Initialize only when first used, not on page load

// 2. Preload Voices Asynchronously
VoiceEngine._preloadVoicesAsync();
// Doesn't block initialization

// 3. Use RequestAnimationFrame
requestAnimationFrame(() => {
  // Non-blocking DOM updates
});
```

### Playback Start (<200ms target)

```javascript
// 1. Word Boundary Caching
// Pre-compute during initialization
const boundaries = engine._computeWordBoundaries(text);

// 2. Efficient DOM Updates
// Use CSS classes instead of inline styles
element.classList.add('voice-highlight');

// 3. Binary Search
// O(log n) word index lookup
const wordIndex = engine._findWordIndexForCharPos(charPos, boundaries);
```

### Highlight Latency (<50ms target)

```javascript
// 1. CSS Class Updates
// Single class toggle per update
element.classList.toggle('voice-highlight');

// 2. Cached References
// Store word element references
const wordElements = highlightSync.wordElements;

// 3. Minimal Reflows
// Batch DOM updates
requestAnimationFrame(() => {
  // Update multiple elements
});
```

---

## Error Handling

### Error Scenarios

```javascript
// Web Speech API not supported
if (!voiceEngine.isSupported) {
  displayMessage('Voice tutor is not available on your browser');
}

// Voice not available
engine.on('error', (error) => {
  if (error.message.includes('voice')) {
    // Try fallback voice
    engine.setVoice('en');
  }
});

// Playback failed
engine.on('error', (error) => {
  displayMessage('Audio playback failed. Please try again.');
  // Provide retry button
});

// Offline without cache
if (isOffline && !audioCache.isAvailable(passageId)) {
  displayMessage('Audio is not available offline');
}
```

### Recovery Strategies

```javascript
// 1. Fallback Voice
try {
  engine.setVoice('en');
} catch (e) {
  engine.setVoice('default');
}

// 2. Retry Mechanism
async function retryPlayback(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await engine.speak(text);
      return;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// 3. Graceful Degradation
if (!voiceEngine.isSupported) {
  // Show text-only passage
  // Disable voice tutor controls
}
```

---

## Testing

### Unit Tests

```javascript
// VoiceEngine tests
- Initialization and support detection
- Playback control (play, pause, resume, stop)
- Rate and voice changes
- Event emission
- Error handling

// HighlightSync tests
- Word boundary mapping
- Highlight updates
- Performance (<50ms)
- Cleanup

// AudioCache tests
- Storage and retrieval
- LRU eviction
- Cache size limits

// VoiceTutor tests
- Preference persistence
- UI rendering
- Event handling
- Accessibility
```

### Property-Based Tests

```javascript
// 24 properties covering all correctness requirements
// Each property tested with 50-100 random inputs
// Properties validate universal behaviors

// Example: Property 4 - Speed Control Application
fc.property(
  fc.constantFrom(0.75, 1, 1.25, 1.5),
  (speed) => {
    engine.setRate(speed);
    expect(engine.utterance.rate).toBe(speed);
  }
);
```

### E2E Tests

```javascript
// Complete playback flow
// Speed control flow
// Language switching
// Offline functionality
// Accessibility features
// Error scenarios
// Reading comprehension integration
```

---

## Accessibility

### WCAG 2.1 Level AA Compliance

```javascript
// Keyboard Navigation
- Tab: Move to next control
- Shift+Tab: Move to previous control
- Enter/Space: Activate buttons
- Arrow keys: Change radio selections
- Escape: Stop playback

// Screen Reader Support
- ARIA labels on all controls
- Live region for status updates
- Semantic HTML structure
- Alternative text for visual elements

// Visual Accessibility
- 4.5:1 contrast ratio for text
- 3:1 contrast ratio for graphics
- Visible focus indicators
- No color-only information

// Motor Control
- 44x44px minimum touch targets
- Adequate spacing between controls
- No time-dependent interactions
```

---

## Configuration

### Voice Engine Options

```javascript
const options = {
  language: 'en',           // en, ur
  rate: 1,                  // 0.75, 1, 1.25, 1.5
  pitch: 1,                 // 0.5 - 2
  volume: 1,                // 0 - 1
  voicePreset: 'normal',    // normal, optimusPrime
  usePreRecorded: false,    // Force pre-recorded audio
  cacheAudio: true,         // Cache generated audio
  maxCacheSize: 52428800    // 50MB in bytes
};

const engine = new VoiceEngine(options);
```

### Highlight Sync Options

```javascript
const options = {
  highlightClass: 'voice-highlight',
  highlightColor: '#FFD700',
  transitionDuration: 100,
  debounceDelay: 0
};

const sync = new HighlightSync(element, options);
```

---

## Monitoring & Logging

### Key Metrics

```javascript
// Performance
- Initialization time
- Playback start latency
- Highlight update latency
- Memory usage

// Usage
- Voice tutor usage count
- Average session duration
- Speed preference distribution
- Language preference distribution

// Errors
- Error rate
- Error types
- Browser/device breakdown
- Recovery success rate
```

### Logging Events

```javascript
// Usage tracking
logEvent('voice_tutor_started', {
  passage_id: 'passage_001',
  language: 'en',
  speed: 1,
  preset: 'normal',
  timestamp: Date.now()
});

// Error tracking
logEvent('voice_tutor_error', {
  error_type: 'voice_not_available',
  browser: 'Safari',
  device: 'iPhone',
  timestamp: Date.now()
});

// Performance tracking
logEvent('voice_tutor_performance', {
  init_time: 45,
  playback_start_time: 8,
  highlight_latency: 3,
  timestamp: Date.now()
});
```

---

## Extending the Voice Tutor

### Adding New Voice Presets

```javascript
// 1. Add preset to VoiceEngine.VOICE_PRESETS
VoiceEngine.VOICE_PRESETS.megatron = {
  name: 'Megatron',
  pitch: 0.4,      // Very deep
  rate: 0.8,       // Slow and menacing
  volume: 1
};

// 2. Update UI to include new preset
// Add radio button option in VoiceTutor component

// 3. Test with property-based tests
// Verify preset applies correctly
```

### Adding New Languages

```javascript
// 1. Add language support to VoiceEngine
engine.setVoice('fr');  // French

// 2. Update i18n module
i18n.addLanguage('fr', translations);

// 3. Test voice selection
// Verify correct voice is selected
```

### Adding Audio Visualization

```javascript
// 1. Create AudioVisualizer component
class AudioVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.audioContext = new AudioContext();
  }
  
  visualize(audioBuffer) {
    // Draw waveform or frequency visualization
  }
}

// 2. Integrate with VoiceEngine
engine.on('boundary', (data) => {
  visualizer.update(data);
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Voice tutor not working on iOS Safari
```javascript
// Solution: Check iOS audio context initialization
if (engine.isIOSSafari && !engine.audioContextInitialized) {
  engine._initializeIOSAudioContext();
}
```

**Issue**: Highlighting out of sync with audio
```javascript
// Solution: Verify word boundary computation
const boundaries = engine._computeWordBoundaries(text);
console.log('Word boundaries:', boundaries);
```

**Issue**: Memory leak after destroy
```javascript
// Solution: Ensure all event listeners are removed
engine.destroy();
console.log('Event listeners:', engine.eventListeners.size); // Should be 0
```

**Issue**: Offline audio not playing
```javascript
// Solution: Check cache availability
const available = await audioCache.isAvailable(passageId);
console.log('Audio cached:', available);
```

---

## Best Practices

1. **Always call destroy()** when component unmounts
2. **Use event listeners** instead of polling for state changes
3. **Cache word boundaries** during initialization
4. **Test with screen readers** before deployment
5. **Monitor performance metrics** in production
6. **Provide clear error messages** to users
7. **Handle offline gracefully** with pre-recorded audio
8. **Persist user preferences** to localStorage
9. **Use CSS classes** for highlighting instead of inline styles
10. **Implement proper cleanup** to prevent memory leaks

---

## Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Production Ready

</content>
</invoke>