# AI Voice Tutor - Design Document

## Overview

The AI Voice Tutor is a Phase 2 feature that enhances reading comprehension learning through real-time audio narration of passages with synchronized visual highlighting. The feature leverages the Web Speech API to provide text-to-speech functionality with playback controls, speed adjustment, multi-language support, and offline fallback capabilities.

### Key Design Goals

1. **Seamless Integration**: Integrate naturally with existing reading comprehension module without disrupting text access
2. **Cross-Platform Compatibility**: Support iOS Safari and Android Chrome with consistent behavior
3. **Performance**: Initialize within 500ms and start playback within 200ms
4. **Accessibility**: Full WCAG 2.1 Level AA compliance with keyboard navigation and screen reader support
5. **Offline Capability**: Provide pre-recorded audio fallback when offline
6. **User Preferences**: Persist speed and language preferences across sessions

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Reading Comprehension Module              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Passage Display Component               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Passage Text with Word-Level Highlighting    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Voice Tutor Control Panel                     │  │   │
│  │  │  [Play] [Pause] [Stop] [Speed: 1x] [Settings] │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                   │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼──────────┐
        │  Voice Engine  │      │  Preference    │
        │                │      │  Store         │
        │ • Web Speech   │      │                │
        │   API          │      │ • Speed (1x)   │
        │ • Highlighting │      │ • Language     │
        │   Sync         │      │ • Voice        │
        │ • Speed        │      └────────────────┘
        │   Control      │
        └────────┬───────┘
                 │
        ┌────────▼──────────┐
        │  Audio Cache      │
        │  (IndexedDB)      │
        │                   │
        │ • Pre-recorded    │
        │   audio files     │
        │ • Generated audio │
        │   cache           │
        └───────────────────┘
```

### Component Architecture

The Voice Tutor is implemented as a modular system with clear separation of concerns:

```
src/engine/voiceEngine.js
├── VoiceEngine class
│   ├── initialize()
│   ├── speak(text, options)
│   ├── pause()
│   ├── resume()
│   ├── stop()
│   ├── setRate(rate)
│   ├── setVoice(language)
│   └── destroy()
│
src/engine/highlightSync.js
├── HighlightSync class
│   ├── initialize(passage)
│   ├── updateHighlight(wordIndex)
│   ├── clearHighlight()
│   └── destroy()
│
src/engine/audioCache.js
├── AudioCache class
│   ├── get(passageId)
│   ├── set(passageId, audioBlob)
│   ├── clear()
│   └── isAvailable()
│
src/features/student/VoiceTutor.js
├── renderVoiceTutor(passage)
├── mountVoiceTutor(passage)
└── [Internal state management]
```

---

## Components and Interfaces

### 1. Voice Engine (`src/engine/voiceEngine.js`)

**Responsibility**: Manage Web Speech API interactions and fallback to pre-recorded audio.

```javascript
class VoiceEngine {
  constructor(options = {}) {
    // options: { language: 'en', rate: 1, volume: 1 }
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPaused = false;
    this.currentRate = options.rate || 1;
    this.currentLanguage = options.language || 'en';
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    // Returns true if Web Speech API is available
  }

  async speak(text, options = {}) {
    // Initiates speech synthesis
    // Returns: Promise<void>
    // Emits: 'start', 'boundary', 'end', 'error' events
  }

  pause() {
    // Pauses current speech
  }

  resume() {
    // Resumes paused speech
  }

  stop() {
    // Stops speech and resets state
  }

  setRate(rate) {
    // Sets playback rate (0.75, 1, 1.25, 1.5)
    // Applies immediately if speaking
  }

  setVoice(language) {
    // Selects voice for language (en, ur)
    // Falls back to default if unavailable
  }

  getAvailableVoices() {
    // Returns array of available voices
  }

  destroy() {
    // Cleans up resources
  }
}
```

**Key Methods**:
- `speak(text, options)`: Initiates speech synthesis with word boundary tracking
- `pause()`: Pauses current utterance
- `resume()`: Resumes from paused position
- `stop()`: Stops and resets
- `setRate(rate)`: Changes playback speed immediately
- `setVoice(language)`: Selects language-specific voice

**Events Emitted**:
- `start`: Playback begins
- `boundary`: Word boundary reached (includes word index)
- `end`: Playback completes
- `error`: Error occurred (includes error details)
- `pause`: Playback paused
- `resume`: Playback resumed

---

### 2. Highlight Synchronization (`src/engine/highlightSync.js`)

**Responsibility**: Synchronize visual highlighting with audio playback at word level.

```javascript
class HighlightSync {
  constructor(passageElement) {
    this.passageElement = passageElement;
    this.words = [];
    this.currentWordIndex = -1;
  }

  initialize(passage) {
    // Parses passage into words and creates word-level DOM structure
    // Returns: Array of word elements
  }

  updateHighlight(wordIndex) {
    // Moves highlight to specified word
    // Handles: removing previous highlight, adding new highlight
    // Performance: <50ms per update
  }

  clearHighlight() {
    // Removes all highlighting
  }

  getWordBoundaries() {
    // Returns array of character positions for word boundaries
    // Used for Web Speech API boundary event mapping
  }

  destroy() {
    // Cleans up DOM modifications
  }
}
```

**Algorithm: Word Boundary Mapping**

The Web Speech API provides character position boundaries. We map these to word indices:

```
Passage: "The quick brown fox"
Words: ["The", "quick", "brown", "fox"]
Char positions: [0, 4, 10, 16]

Boundary event at char 4 → Word index 1 ("quick")
Boundary event at char 10 → Word index 2 ("brown")
```

---

### 3. Audio Cache (`src/engine/audioCache.js`)

**Responsibility**: Cache generated audio for offline use.

```javascript
class AudioCache {
  constructor() {
    this.db = null; // IndexedDB instance
    this.STORE_NAME = 'voiceTutorCache';
  }

  async initialize() {
    // Opens IndexedDB connection
  }

  async get(passageId) {
    // Retrieves cached audio blob
    // Returns: Blob | null
  }

  async set(passageId, audioBlob, metadata = {}) {
    // Stores audio blob with metadata
    // metadata: { language, rate, timestamp }
  }

  async clear() {
    // Clears all cached audio
  }

  async isAvailable(passageId) {
    // Checks if audio is cached
    // Returns: boolean
  }

  async getSize() {
    // Returns total cache size in bytes
  }
}
```

**Storage Strategy**:
- Use IndexedDB for reliable offline storage
- Store audio blobs with passage ID, language, and rate
- Implement LRU eviction when cache exceeds 50MB
- Metadata includes timestamp for cache invalidation

---

### 4. Voice Tutor Component (`src/features/student/VoiceTutor.js`)

**Responsibility**: Orchestrate voice tutor UI and coordinate engine components.

```javascript
// State structure
const voiceTutorState = {
  passage: null,
  isPlaying: false,
  isPaused: false,
  currentRate: 1,
  currentLanguage: 'en',
  currentWordIndex: -1,
  error: null,
  isOffline: false,
  usePreRecorded: false
};

export function renderVoiceTutor(passage) {
  // Returns HTML string with:
  // - Play/Pause/Stop buttons
  // - Speed control (0.75x, 1x, 1.25x, 1.5x)
  // - Status display
  // - Error messages
  // - Accessibility features (ARIA labels, live regions)
}

export function mountVoiceTutor(passage) {
  // Initializes voice engine
  // Attaches event listeners
  // Restores user preferences
  // Sets up offline detection
}
```

---

## Data Models

### Passage Structure

```javascript
{
  id: "passage_001",
  text: "The quick brown fox jumps over the lazy dog.",
  subject: "English",
  difficulty: "intermediate",
  language: "en"
}
```

### Voice Preference

```javascript
{
  speed: 1,           // 0.75, 1, 1.25, 1.5
  language: "en",     // en, ur
  voice: "Google UK English Female", // Specific voice name
  timestamp: 1234567890
}
```

### Audio Cache Entry

```javascript
{
  passageId: "passage_001",
  language: "en",
  rate: 1,
  audioBlob: Blob,
  timestamp: 1234567890,
  size: 45000 // bytes
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Play Button Initiates Playback

*For any* passage and any supported browser, clicking the play button should initiate Web Speech API synthesis or pre-recorded audio playback.

**Validates: Requirements 1.2, 1.3**

### Property 2: Language Voice Selection

*For any* language preference (English or Urdu), the voice engine should select a voice matching that language, or fall back to the default system voice if unavailable.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 3: Pause and Resume Continuity

*For any* active playback, pausing and then resuming should continue from the paused position without losing synchronization with highlighting.

**Validates: Requirements 1.4, 1.5, 2.4, 2.5**

### Property 4: Speed Control Application

*For any* speed setting (0.75x, 1x, 1.25x, 1.5x), applying that speed should result in the utterance rate being set to that value, and the change should apply immediately if playback is active.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

### Property 5: Speed Preference Persistence

*For any* speed selection, closing and reopening the passage should restore the previously selected speed from localStorage.

**Validates: Requirements 3.6, 11.1, 11.3**

### Property 6: Highlighting Synchronization

*For any* passage during playback, the highlighted word should correspond to the word currently being spoken, with no perceptible delay (<50ms) between audio boundary events and visual updates.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 7: Highlighting Cleanup

*For any* completed or stopped playback, all word highlighting should be removed from the passage.

**Validates: Requirements 2.6**

### Property 8: Offline Audio Fallback

*For any* offline state with available pre-recorded audio, the voice tutor should play pre-recorded audio instead of attempting Web Speech API synthesis.

**Validates: Requirements 5.1, 5.2**

### Property 9: Offline Unavailability Message

*For any* offline state without available pre-recorded audio, attempting to use the voice tutor should display a clear message indicating audio is unavailable offline.

**Validates: Requirements 5.3**

### Property 10: Online Audio Caching

*For any* passage played online, the generated audio should be cached for offline use in subsequent sessions.

**Validates: Requirements 5.5**

### Property 11: Initialization Performance

*For any* passage, initializing the voice tutor should complete within 500 milliseconds.

**Validates: Requirements 8.1, 8.4**

### Property 12: Playback Start Performance

*For any* play button click, audio playback should begin within 200 milliseconds.

**Validates: Requirements 8.2**

### Property 13: Smooth Playback

*For any* active playback, audio should continue without stuttering or interruptions, maintaining consistent word boundary events.

**Validates: Requirements 8.3**

### Property 14: Keyboard Accessibility

*For any* voice tutor control, keyboard navigation should allow full access to play, pause, stop, and speed adjustment functions with visible focus indicators.

**Validates: Requirements 9.3, 9.4**

### Property 15: Screen Reader Announcements

*For any* screen reader active, all controls should have ARIA labels, and highlighting changes should trigger live region updates.

**Validates: Requirements 9.1, 9.2, 9.6**

### Property 16: Color Contrast Compliance

*For any* voice tutor UI element, text and control colors should maintain WCAG 2.1 Level AA contrast ratios (4.5:1 for text, 3:1 for graphics).

**Validates: Requirements 9.5**

### Property 17: Unsupported Browser Handling

*For any* browser without Web Speech API support, the voice tutor should display a message indicating the feature is unavailable and not prevent passage access.

**Validates: Requirements 10.1**

### Property 18: Playback Error Recovery

*For any* playback error, the voice tutor should display a clear error message and provide a retry option without blocking passage access.

**Validates: Requirements 10.2, 10.4, 10.5**

### Property 19: Voice Unavailability Fallback

*For any* unavailable voice, the voice engine should attempt to use an alternative voice and log the issue.

**Validates: Requirements 10.3**

### Property 20: Language Preference Persistence

*For any* language preference change, the voice tutor should update the saved voice preference and apply it to subsequent playbacks.

**Validates: Requirements 11.2, 11.4, 11.5**

### Property 21: Auto-Pause on Question Answer

*For any* active playback when a question is answered, the voice tutor should automatically pause without requiring user action.

**Validates: Requirements 12.3**

### Property 22: Resource Cleanup on Navigation

*For any* navigation away from the passage, the voice tutor should stop playback and clean up resources (stop synthesis, clear timers, remove event listeners).

**Validates: Requirements 12.5**

### Property 23: Passage Text Accessibility

*For any* active voice tutor playback, the passage text should remain fully readable and selectable without interference.

**Validates: Requirements 12.2**

### Property 24: Voice Tutor Optional Integration

*For any* reading comprehension passage, the voice tutor should be available as an optional feature that does not interfere with normal passage reading.

**Validates: Requirements 12.1, 12.4**

---

## Error Handling

### Error Scenarios and Recovery

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Detection                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌──────────┐  ┌──────────┐
   │ API    │  │ Voice    │  │ Network  │
   │ Not    │  │ Not      │  │ Error    │
   │Support │  │Available │  │          │
   └────┬───┘  └────┬─────┘  └────┬─────┘
        │           │             │
        ▼           ▼             ▼
   ┌────────────────────────────────────┐
   │  Display Error Message             │
   │  - Clear explanation               │
   │  - Suggested next steps            │
   │  - Retry option (if applicable)    │
   └────────────────────────────────────┘
        │
        ▼
   ┌────────────────────────────────────┐
   │  Log Error                         │
   │  - Error type                      │
   │  - Browser/device info             │
   │  - Timestamp                       │
   └────────────────────────────────────┘
```

### Error Messages

| Error | Message | Recovery |
|-------|---------|----------|
| Web Speech API not supported | "Voice tutor is not available on your browser. Please use Chrome, Safari, or Edge." | Show text-only passage |
| Voice not available | "Your preferred voice is not available. Using system default voice." | Use fallback voice |
| Playback failed | "Audio playback failed. Please try again." | Retry button |
| Offline without cache | "Audio is not available offline. Please connect to the internet." | Show offline message |
| Network error | "Connection lost. Using cached audio if available." | Attempt cache fallback |

---

## Testing Strategy

### Unit Testing (Vitest)

**Voice Engine Tests**:
- Test Web Speech API initialization
- Test speak/pause/resume/stop state transitions
- Test rate changes during playback
- Test voice selection and fallback
- Test boundary event handling
- Test error scenarios

**Highlight Sync Tests**:
- Test word boundary mapping
- Test highlight updates
- Test highlight cleanup
- Test performance (<50ms per update)

**Audio Cache Tests**:
- Test cache storage and retrieval
- Test LRU eviction
- Test cache size limits
- Test offline availability checks

**Component Tests**:
- Test preference persistence
- Test UI rendering
- Test event handling
- Test accessibility attributes

### Property-Based Testing (Vitest with fast-check)

Each correctness property should be tested with property-based testing:

```javascript
// Example: Property 4 - Speed Control Application
describe('Voice Tutor - Speed Control', () => {
  it('Property 4: Speed control applies immediately', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(0.75, 1, 1.25, 1.5),
        (speed) => {
          const engine = new VoiceEngine();
          engine.setRate(speed);
          expect(engine.utterance.rate).toBe(speed);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Tag Format**: `Feature: ai-voice-tutor, Property {number}: {property_text}`

### E2E Testing (Playwright)

**iOS Safari Tests**:
- Test initialization on iOS Safari
- Test playback on iOS Safari
- Test highlighting synchronization
- Test speed control
- Test low-power mode behavior

**Android Chrome Tests**:
- Test initialization on Android Chrome
- Test playback on Android Chrome
- Test highlighting synchronization
- Test speed control
- Test limited resource behavior

**Integration Tests**:
- Test voice tutor with reading comprehension module
- Test auto-pause on question answer
- Test navigation cleanup
- Test preference persistence across sessions

### Performance Testing

- Measure initialization time (<500ms target)
- Measure playback start time (<200ms target)
- Measure highlight update latency (<50ms target)
- Monitor memory usage during playback
- Test with large passages (>1000 words)

---

## Performance Optimization

### Initialization Optimization

1. **Lazy Load Voice Engine**: Initialize only when voice tutor is first used
2. **Preload Voices**: Cache available voices on app startup
3. **Async Initialization**: Use requestAnimationFrame for non-blocking setup

### Playback Optimization

1. **Word Boundary Caching**: Pre-compute word boundaries during initialization
2. **Efficient DOM Updates**: Use CSS classes instead of inline styles for highlighting
3. **Debounce Highlight Updates**: Batch multiple boundary events if needed

### Memory Optimization

1. **Resource Cleanup**: Properly cancel utterances and remove event listeners
2. **Audio Cache Limits**: Implement LRU eviction at 50MB
3. **Passage Parsing**: Use efficient string splitting and indexing

### Network Optimization

1. **Audio Caching**: Cache generated audio for offline use
2. **Lazy Loading**: Load pre-recorded audio only when needed
3. **Compression**: Store audio in compressed format (MP3/AAC)

---

## Accessibility Implementation

### WCAG 2.1 Level AA Compliance

**Keyboard Navigation**:
- All controls accessible via Tab key
- Enter/Space to activate buttons
- Arrow keys for speed selection
- Escape to stop playback

**Screen Reader Support**:
- ARIA labels on all controls
- Live region for highlighting updates
- Semantic HTML structure
- Alternative text for visual indicators

**Visual Design**:
- Minimum 4.5:1 contrast ratio for text
- Minimum 3:1 contrast ratio for graphics
- Focus indicators on all interactive elements
- No color-only information

**Motor Control**:
- Large touch targets (minimum 44x44px)
- Adequate spacing between controls
- No time-dependent interactions

### Implementation Details

```html
<!-- Play button with ARIA labels -->
<button 
  id="voice-play" 
  aria-label="Play passage audio"
  aria-pressed="false"
  class="voice-control"
>
  ▶ Play
</button>

<!-- Live region for highlighting updates -->
<div 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
  id="voice-status"
>
  Currently reading: word
</div>

<!-- Speed control with semantic structure -->
<fieldset>
  <legend>Playback Speed</legend>
  <label>
    <input type="radio" name="speed" value="0.75" />
    0.75x (Slow)
  </label>
  <label>
    <input type="radio" name="speed" value="1" checked />
    1x (Normal)
  </label>
  <!-- ... -->
</fieldset>
```

---

## Integration Points

### With Reading Comprehension Module

1. **Passage Injection**: Voice tutor receives passage text from Quiz component
2. **Auto-Pause**: Voice tutor pauses when question is answered
3. **Resource Cleanup**: Voice tutor stops and cleans up on navigation
4. **Preference Sync**: Voice tutor respects app language preference

### With Progress Store

1. **Preference Persistence**: Speed and language preferences stored in localStorage
2. **Usage Tracking**: Optional tracking of voice tutor usage for analytics
3. **Offline State**: Check online status from progress store

### With i18n Module

1. **Language Sync**: Voice tutor updates voice when language preference changes
2. **UI Translations**: Voice tutor UI labels translated via i18n
3. **RTL Support**: Voice tutor UI adapts to RTL layout for Urdu

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Full support | Web Speech API fully supported |
| Safari | 14.1+ | ✅ Full support | iOS Safari 14.1+ supported |
| Edge | 90+ | ✅ Full support | Chromium-based, full support |
| Firefox | 88+ | ⚠️ Limited | Web Speech API limited support |
| Opera | 76+ | ✅ Full support | Chromium-based, full support |

### Fallback Strategy

```
Browser Support Check
├── Web Speech API Available?
│   ├── Yes → Use Web Speech API
│   └── No → Check for pre-recorded audio
│       ├── Available → Play pre-recorded
│       └── Not available → Show unavailable message
```

---

## Offline Support

### Offline Detection

```javascript
// Monitor online/offline status
window.addEventListener('online', () => {
  voiceEngine.setOfflineMode(false);
  // Resume using Web Speech API
});

window.addEventListener('offline', () => {
  voiceEngine.setOfflineMode(true);
  // Switch to pre-recorded audio if available
});
```

### Pre-Recorded Audio Strategy

1. **Initial Load**: Download pre-recorded audio for common passages
2. **On-Demand**: Generate and cache audio when played online
3. **Expiration**: Invalidate cache after 30 days
4. **Size Limits**: Cap cache at 50MB with LRU eviction

---

## Future Enhancements

1. **Custom Voice Selection**: Allow users to choose from multiple voices per language
2. **Playback History**: Track which passages have been listened to
3. **Speed Presets**: Save custom speed profiles
4. **Audio Visualization**: Display waveform or frequency visualization during playback
5. **Pronunciation Guide**: Highlight difficult words with pronunciation tips
6. **Comprehension Checks**: Pause at intervals for comprehension questions
7. **Adjustable Highlighting**: Allow users to customize highlight color/style
8. **Bookmarking**: Save playback position for later resumption

---

## Implementation Roadmap

### Phase 1: Core Functionality
- [ ] Voice Engine implementation
- [ ] Highlight Synchronization
- [ ] Basic UI controls
- [ ] Speed control

### Phase 2: Offline & Persistence
- [ ] Audio Cache implementation
- [ ] Preference persistence
- [ ] Offline detection

### Phase 3: Accessibility & Polish
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Error handling refinement

### Phase 4: Testing & Optimization
- [ ] Unit test coverage
- [ ] Property-based tests
- [ ] E2E tests (iOS/Android)
- [ ] Performance optimization

---

## Configuration

### Voice Engine Options

```javascript
const voiceEngineConfig = {
  language: 'en',           // en, ur
  rate: 1,                  // 0.75, 1, 1.25, 1.5
  pitch: 1,                 // 0.5 - 2
  volume: 1,                // 0 - 1
  voiceIndex: 0,            // Index of available voices
  usePreRecorded: false,    // Force pre-recorded audio
  cacheAudio: true,         // Cache generated audio
  maxCacheSize: 52428800    // 50MB in bytes
};
```

### Highlight Sync Options

```javascript
const highlightSyncConfig = {
  highlightClass: 'voice-highlight',
  highlightColor: '#FFD700',
  transitionDuration: 100,  // ms
  debounceDelay: 0          // ms
};
```

---

## Monitoring & Logging

### Key Metrics

- Initialization time
- Playback start latency
- Highlight update latency
- Error rate
- Cache hit rate
- Offline usage percentage

### Logging Events

```javascript
// Log voice tutor usage
logEvent('voice_tutor_started', {
  passage_id: 'passage_001',
  language: 'en',
  speed: 1,
  timestamp: Date.now()
});

logEvent('voice_tutor_error', {
  error_type: 'voice_not_available',
  browser: 'Safari',
  timestamp: Date.now()
});
```

---

## Conclusion

The AI Voice Tutor design provides a robust, accessible, and performant solution for enhancing reading comprehension learning through audio narration. By leveraging the Web Speech API with intelligent fallbacks, comprehensive error handling, and offline support, the feature delivers a seamless experience across iOS Safari and Android Chrome while maintaining WCAG 2.1 Level AA accessibility compliance.
