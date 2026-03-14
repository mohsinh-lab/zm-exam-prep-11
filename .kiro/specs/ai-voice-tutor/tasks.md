# Implementation Plan: AI Voice Tutor

## Overview

The AI Voice Tutor implementation follows a modular architecture with core engine components (VoiceEngine, HighlightSync, AudioCache) integrated into the existing reading comprehension module. Implementation proceeds from foundational engines through component integration, feature completion, comprehensive testing, and accessibility refinement. Each task builds incrementally with early validation through property-based tests.

---

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create `src/engine/voiceEngine.js` with VoiceEngine class skeleton
  - Create `src/engine/highlightSync.js` with HighlightSync class skeleton
  - Create `src/engine/audioCache.js` with AudioCache class skeleton
  - Create `src/features/student/VoiceTutor.js` with component skeleton
  - Set up test files: `tests/voiceEngine.test.js`, `tests/highlightSync.test.js`, `tests/audioCache.test.js`, `tests/voiceTutor.e2e.spec.js`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Voice Engine core functionality
  - [x] 2.1 Implement VoiceEngine initialization and Web Speech API detection
    - Implement `constructor()` with language and rate options
    - Implement `checkSupport()` to detect Web Speech API availability
    - Implement `getAvailableVoices()` to list system voices
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 7.1_

  - [ ]* 2.2 Write property test for Web Speech API support detection
    - **Property 17: Unsupported browser handling**
    - **Validates: Requirements 10.1**

  - [x] 2.3 Implement VoiceEngine speak method with boundary tracking
    - Implement `speak(text, options)` to initiate speech synthesis
    - Implement word boundary event handling with word index mapping
    - Emit 'start', 'boundary', 'end', 'error' events
    - _Requirements: 1.2, 1.3, 2.1, 2.2_

  - [ ]* 2.4 Write property test for playback initiation
    - **Property 1: Play button initiates playback**
    - **Validates: Requirements 1.2, 1.3**

  - [x] 2.5 Implement VoiceEngine pause, resume, and stop methods
    - Implement `pause()` to pause current utterance
    - Implement `resume()` to resume from paused position
    - Implement `stop()` to stop and reset state
    - Maintain state flags (isPaused, isPlaying)
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 2.6 Write property test for pause and resume continuity
    - **Property 3: Pause and resume continuity**
    - **Validates: Requirements 1.4, 1.5, 2.4, 2.5**

  - [x] 2.7 Implement VoiceEngine rate control
    - Implement `setRate(rate)` to set playback speed (0.75, 1, 1.25, 1.5)
    - Apply rate changes immediately if playback is active
    - Store current rate in state
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.8 Write property test for speed control application
    - **Property 4: Speed control application**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 2.9 Implement VoiceEngine voice selection
    - Implement `setVoice(language)` to select language-specific voice
    - Implement fallback to default voice if unavailable
    - Support English and Urdu voices
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.10 Write property test for language voice selection
    - **Property 2: Language voice selection**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [x] 2.11 Implement VoiceEngine resource cleanup
    - Implement `destroy()` to cancel utterances and remove listeners
    - Implement proper cleanup on navigation
    - _Requirements: 12.5_

  - [x]* 2.12 Write unit tests for VoiceEngine
    - Test all state transitions (play, pause, resume, stop)
    - Test error scenarios and recovery
    - Test voice selection fallback
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Implement Highlight Synchronization engine
  - [x] 3.1 Implement HighlightSync word boundary mapping
    - Implement `initialize(passage)` to parse passage into words
    - Create word-level DOM structure with data attributes
    - Implement `getWordBoundaries()` to map character positions to word indices
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 3.2 Write property test for highlighting synchronization
    - **Property 6: Highlighting synchronization**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 3.3 Implement HighlightSync visual updates
    - Implement `updateHighlight(wordIndex)` with <50ms latency
    - Use CSS classes for efficient DOM updates
    - Handle edge cases (word index out of bounds)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Implement HighlightSync cleanup
    - Implement `clearHighlight()` to remove all highlighting
    - Implement `destroy()` to clean up DOM modifications
    - _Requirements: 2.6_

  - [ ]* 3.5 Write property test for highlighting cleanup
    - **Property 7: Highlighting cleanup**
    - **Validates: Requirements 2.6**

  - [ ]* 3.6 Write unit tests for HighlightSync
    - Test word boundary mapping accuracy
    - Test highlight update performance (<50ms)
    - Test cleanup functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 4. Implement Audio Cache for offline support
  - [x] 4.1 Implement AudioCache IndexedDB initialization
    - Implement `initialize()` to open IndexedDB connection
    - Create object store for audio blobs with metadata
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 4.2 Implement AudioCache storage and retrieval
    - Implement `get(passageId)` to retrieve cached audio
    - Implement `set(passageId, audioBlob, metadata)` to store audio
    - Implement `isAvailable(passageId)` to check cache status
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 4.3 Implement AudioCache eviction and limits
    - Implement `getSize()` to calculate total cache size
    - Implement LRU eviction when cache exceeds 50MB
    - Implement `clear()` to clear all cached audio
    - _Requirements: 5.5_

  - [ ]* 4.4 Write unit tests for AudioCache
    - Test storage and retrieval operations
    - Test LRU eviction logic
    - Test cache size limits
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 5. Implement Voice Tutor component and UI rendering
  - [x] 5.1 Implement VoiceTutor render function
    - Create `renderVoiceTutor(passage)` returning HTML string
    - Include play/pause/stop buttons with ARIA labels
    - Include speed control options (0.75x, 1x, 1.25x, 1.5x)
    - Include status display and error message area
    - _Requirements: 1.1, 1.2, 3.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 5.2 Implement VoiceTutor mount function and event handling
    - Create `mountVoiceTutor(passage)` to initialize interactivity
    - Attach click handlers to play/pause/stop buttons
    - Attach change handlers to speed control
    - Initialize VoiceEngine and HighlightSync
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.3 Implement preference persistence in VoiceTutor
    - Load speed preference from localStorage on mount
    - Load language preference from app settings
    - Save speed preference on change
    - Apply preferences to VoiceEngine
    - _Requirements: 3.6, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 5.4 Write property test for speed preference persistence
    - **Property 5: Speed preference persistence**
    - **Validates: Requirements 3.6, 11.1, 11.3**

  - [ ]* 5.5 Write property test for language preference persistence
    - **Property 20: Language preference persistence**
    - **Validates: Requirements 11.2, 11.4, 11.5**

  - [x] 5.6 Implement offline detection and fallback
    - Monitor online/offline status with event listeners
    - Switch to pre-recorded audio when offline
    - Display offline message when audio unavailable
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 5.7 Write property test for offline audio fallback
    - **Property 8: Offline audio fallback**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 5.8 Write property test for offline unavailability message
    - **Property 9: Offline unavailability message**
    - **Validates: Requirements 5.3**

  - [ ]* 5.9 Write property test for online audio caching
    - **Property 10: Online audio caching**
    - **Validates: Requirements 5.5**

- [x] 6. Implement accessibility features
  - [x] 6.1 Implement keyboard navigation
    - Enable Tab navigation through all controls
    - Implement Enter/Space to activate buttons
    - Implement Arrow keys for speed selection
    - Implement Escape to stop playback
    - _Requirements: 9.3, 9.4_

  - [ ]* 6.2 Write property test for keyboard accessibility
    - **Property 14: Keyboard accessibility**
    - **Validates: Requirements 9.3, 9.4**

  - [x] 6.3 Implement screen reader support
    - Add ARIA labels to all controls
    - Create live region for highlighting updates
    - Use semantic HTML structure
    - Announce state changes (playing, paused, stopped)
    - _Requirements: 9.1, 9.2, 9.6_

  - [ ]* 6.4 Write property test for screen reader announcements
    - **Property 15: Screen reader announcements**
    - **Validates: Requirements 9.1, 9.2, 9.6**

  - [x] 6.5 Implement color contrast compliance
    - Ensure 4.5:1 contrast ratio for text
    - Ensure 3:1 contrast ratio for graphics
    - Test with contrast checker tools
    - _Requirements: 9.5_

  - [ ]* 6.6 Write property test for color contrast compliance
    - **Property 16: Color contrast compliance**
    - **Validates: Requirements 9.5**

- [x] 7. Implement error handling and recovery
  - [x] 7.1 Implement Web Speech API error handling
    - Catch and handle synthesis errors
    - Display user-friendly error messages
    - Provide retry functionality
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [ ]* 7.2 Write property test for playback error recovery
    - **Property 18: Playback error recovery**
    - **Validates: Requirements 10.2, 10.4, 10.5**

  - [x] 7.3 Implement voice unavailability fallback
    - Attempt alternative voice if preferred unavailable
    - Log unavailability for debugging
    - Display message to user
    - _Requirements: 10.3_

  - [ ]* 7.4 Write property test for voice unavailability fallback
    - **Property 19: Voice unavailability fallback**
    - **Validates: Requirements 10.3**

  - [x] 7.5 Implement unsupported browser handling
    - Detect Web Speech API support
    - Display unavailable message for unsupported browsers
    - Ensure passage remains accessible
    - _Requirements: 10.1_

- [-] 8. Implement integration with reading comprehension module
  - [x] 8.1 Implement auto-pause on question answer
    - Listen for question answer events
    - Pause voice tutor when question answered
    - Maintain state for resume capability
    - _Requirements: 12.3_

  - [ ]* 8.2 Write property test for auto-pause on question answer
    - **Property 21: Auto-pause on question answer**
    - **Validates: Requirements 12.3**

  - [x] 8.3 Implement resource cleanup on navigation
    - Stop playback on route change
    - Clean up event listeners
    - Cancel pending utterances
    - _Requirements: 12.5_

  - [ ]* 8.4 Write property test for resource cleanup on navigation
    - **Property 22: Resource cleanup on navigation**
    - **Validates: Requirements 12.5**

  - [x] 8.5 Implement passage text accessibility during playback
    - Ensure text remains readable during highlighting
    - Maintain text selectability
    - Preserve text contrast
    - _Requirements: 12.2_

  - [ ]* 8.6 Write property test for passage text accessibility
    - **Property 23: Passage text accessibility**
    - **Validates: Requirements 12.2**

  - [x] 8.7 Implement optional feature integration
    - Make voice tutor optional (not required for passage access)
    - Ensure graceful degradation if unavailable
    - Maintain passage functionality without voice tutor
    - _Requirements: 12.1, 12.4_

  - [ ]* 8.8 Write property test for optional integration
    - **Property 24: Voice tutor optional integration**
    - **Validates: Requirements 12.1, 12.4**

- [ ] 9. Implement performance optimization
  - [ ] 9.1 Optimize Voice Engine initialization
    - Lazy load voice engine on first use
    - Preload available voices asynchronously
    - Use requestAnimationFrame for non-blocking setup
    - Target: <500ms initialization time
    - _Requirements: 8.1, 8.4_

  - [ ]* 9.2 Write property test for initialization performance
    - **Property 11: Initialization performance**
    - **Validates: Requirements 8.1, 8.4**

  - [ ] 9.3 Optimize playback start latency
    - Cache word boundaries during initialization
    - Minimize DOM queries during playback
    - Target: <200ms playback start time
    - _Requirements: 8.2_

  - [ ]* 9.4 Write property test for playback start performance
    - **Property 12: Playback start performance**
    - **Validates: Requirements 8.2**

  - [ ] 9.5 Optimize highlight update performance
    - Use CSS classes instead of inline styles
    - Debounce highlight updates if needed
    - Target: <50ms highlight latency
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 9.6 Optimize memory usage
    - Properly cancel utterances
    - Remove event listeners on cleanup
    - Implement audio cache eviction
    - _Requirements: 5.5_

  - [ ]* 9.7 Write property test for smooth playback
    - **Property 13: Smooth playback**
    - **Validates: Requirements 8.3**

- [ ] 10. Implement iOS Safari compatibility
  - [ ] 10.1 Test and fix iOS Safari initialization
    - Verify Web Speech API availability on iOS Safari 14.1+
    - Handle iOS-specific voice selection
    - Test on actual iOS devices (iPhone, iPad)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 10.2 Test and fix iOS Safari playback
    - Verify audio playback works on iOS Safari
    - Handle iOS audio context requirements
    - Test with various network conditions
    - _Requirements: 6.2, 6.3_

  - [ ] 10.3 Test iOS Safari highlighting synchronization
    - Verify highlighting updates in real-time
    - Test with different passage lengths
    - Verify no lag or stuttering
    - _Requirements: 6.3_

  - [ ] 10.4 Test iOS Safari speed control
    - Verify speed changes apply correctly
    - Test all speed options (0.75x, 1x, 1.25x, 1.5x)
    - Verify speed persists across sessions
    - _Requirements: 6.4_

  - [ ] 10.5 Test iOS Safari low-power mode
    - Verify functionality in low-power mode
    - Test performance degradation if any
    - Ensure graceful handling
    - _Requirements: 6.5_

- [ ] 11. Implement Android Chrome compatibility
  - [ ] 11.1 Test and fix Android Chrome initialization
    - Verify Web Speech API availability on Android Chrome
    - Handle Android-specific voice selection
    - Test on actual Android devices (phones, tablets)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 11.2 Test and fix Android Chrome playback
    - Verify audio playback works on Android Chrome
    - Handle Android audio context requirements
    - Test with various network conditions
    - _Requirements: 7.2, 7.3_

  - [ ] 11.3 Test Android Chrome highlighting synchronization
    - Verify highlighting updates in real-time
    - Test with different passage lengths
    - Verify no lag or stuttering
    - _Requirements: 7.3_

  - [ ] 11.4 Test Android Chrome speed control
    - Verify speed changes apply correctly
    - Test all speed options (0.75x, 1x, 1.25x, 1.5x)
    - Verify speed persists across sessions
    - _Requirements: 7.4_

  - [ ] 11.5 Test Android Chrome limited resources
    - Verify functionality with limited memory
    - Test performance with large passages
    - Ensure graceful handling
    - _Requirements: 7.5_

- [ ] 12. Checkpoint - Ensure all core functionality tests pass
  - Run all unit tests for VoiceEngine, HighlightSync, AudioCache
  - Run all property-based tests for correctness properties
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [ ] 13. Write comprehensive E2E tests
  - [ ] 13.1 Write E2E test for complete playback flow
    - Test play → pause → resume → stop sequence
    - Verify highlighting synchronization throughout
    - Verify state persistence
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3_

  - [ ] 13.2 Write E2E test for speed control flow
    - Test speed selection and application
    - Test speed changes during playback
    - Verify speed persistence across sessions
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 13.3 Write E2E test for language switching
    - Test language preference changes
    - Verify voice updates on language change
    - Test playback with different languages
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 13.4 Write E2E test for offline functionality
    - Test offline detection and fallback
    - Test pre-recorded audio playback
    - Test offline message display
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 13.5 Write E2E test for accessibility features
    - Test keyboard navigation
    - Test screen reader announcements
    - Test focus indicators
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 13.6 Write E2E test for error scenarios
    - Test unsupported browser message
    - Test playback error recovery
    - Test voice unavailability fallback
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 13.7 Write E2E test for reading comprehension integration
    - Test auto-pause on question answer
    - Test resource cleanup on navigation
    - Test optional feature integration
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 14. Checkpoint - Ensure all E2E tests pass
  - Run all E2E tests on iOS Safari (actual device or simulator)
  - Run all E2E tests on Android Chrome (actual device or emulator)
  - Verify no test failures or flakiness
  - Ask the user if questions arise

- [ ] 15. Performance testing and optimization
  - [ ] 15.1 Measure and optimize initialization time
    - Profile initialization with DevTools
    - Target: <500ms initialization
    - Optimize bottlenecks identified
    - _Requirements: 8.1, 8.4_

  - [ ] 15.2 Measure and optimize playback start latency
    - Profile playback start with DevTools
    - Target: <200ms playback start
    - Optimize bottlenecks identified
    - _Requirements: 8.2_

  - [ ] 15.3 Measure and optimize highlight update latency
    - Profile highlight updates with DevTools
    - Target: <50ms highlight latency
    - Optimize bottlenecks identified
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 15.4 Test with large passages
    - Test with passages >1000 words
    - Verify performance remains acceptable
    - Optimize if needed
    - _Requirements: 8.3_

  - [ ] 15.5 Monitor memory usage
    - Profile memory during playback
    - Verify no memory leaks
    - Test cache eviction under pressure
    - _Requirements: 5.5_

- [ ] 16. Accessibility audit and refinement
  - [ ] 16.1 Conduct WCAG 2.1 Level AA audit
    - Use automated accessibility checker (axe, Lighthouse)
    - Manually test with screen readers (NVDA, JAWS, VoiceOver)
    - Manually test keyboard navigation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 16.2 Fix any accessibility issues found
    - Address contrast issues
    - Fix missing ARIA labels
    - Improve keyboard navigation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 16.3 Test with assistive technologies
    - Test with screen readers on multiple browsers
    - Test with keyboard-only navigation
    - Test with high contrast mode
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 17. Documentation and code quality
  - [ ] 17.1 Add JSDoc comments to all public methods
    - Document VoiceEngine methods
    - Document HighlightSync methods
    - Document AudioCache methods
    - Document VoiceTutor component functions
    - _Requirements: All_

  - [ ] 17.2 Add inline comments for complex logic
    - Document word boundary mapping algorithm
    - Document LRU eviction logic
    - Document offline detection logic
    - _Requirements: All_

  - [ ] 17.3 Create implementation guide
    - Document architecture overview
    - Document integration points
    - Document configuration options
    - _Requirements: All_

- [ ] 18. Final checkpoint - Ensure all tests pass and quality gates met
  - Run full test suite (unit, property-based, E2E)
  - Verify all accessibility requirements met
  - Verify all performance targets met
  - Verify code documentation complete
  - Ask the user if questions arise

- [ ] 19. Prepare for deployment
  - [ ] 19.1 Create deployment checklist
    - Verify all tests passing
    - Verify no console errors
    - Verify performance targets met
    - Verify accessibility compliance
    - _Requirements: All_

  - [ ] 19.2 Create rollback plan
    - Document rollback procedure
    - Identify rollback triggers
    - Test rollback process
    - _Requirements: All_

  - [ ] 19.3 Prepare monitoring and logging
    - Set up error logging
    - Set up performance monitoring
    - Set up usage analytics
    - _Requirements: All_

---

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP, but are strongly recommended for production quality
- Each task references specific requirements for traceability
- Performance targets (500ms init, 200ms playback, <50ms highlight) are critical for user experience
- Accessibility compliance (WCAG 2.1 Level AA) is mandatory and must not be skipped
- Cross-platform testing (iOS Safari, Android Chrome) is essential before release
- Property-based tests validate universal correctness properties and should be implemented alongside implementation tasks
- Checkpoints at tasks 12, 14, and 18 provide validation gates before proceeding to next phases

---

## Task Dependencies

```
1. Setup
  ├── 2. Voice Engine Implementation
  │   ├── 5. VoiceTutor Component
  │   │   ├── 8. Reading Comprehension Integration
  │   │   ├── 9. Performance Optimization
  │   │   ├── 10. iOS Safari Compatibility
  │   │   └── 11. Android Chrome Compatibility
  │   │       ├── 12. Checkpoint
  │   │       ├── 13. E2E Tests
  │   │       ├── 14. Checkpoint
  │   │       ├── 15. Performance Testing
  │   │       ├── 16. Accessibility Audit
  │   │       ├── 17. Documentation
  │   │       ├── 18. Final Checkpoint
  │   │       └── 19. Deployment Prep
  │   └── 3. Highlight Sync Implementation
  │       └── 5. VoiceTutor Component
  └── 4. Audio Cache Implementation
      └── 5. VoiceTutor Component
```

---

## Testing Strategy Summary

**Unit Tests (Vitest)**:
- VoiceEngine: 15+ tests covering initialization, playback, rate control, voice selection, error handling
- HighlightSync: 8+ tests covering word mapping, highlight updates, cleanup, performance
- AudioCache: 6+ tests covering storage, retrieval, eviction, size limits
- VoiceTutor: 10+ tests covering rendering, mounting, preference persistence, offline detection

**Property-Based Tests (Vitest + fast-check)**:
- 24 properties covering all correctness requirements
- Each property tested with 100+ random inputs
- Properties validate universal behaviors across all valid inputs

**E2E Tests (Playwright)**:
- 7 test suites covering complete user flows
- iOS Safari tests on actual devices
- Android Chrome tests on actual devices
- Accessibility testing with screen readers

**Performance Tests**:
- Initialization time: <500ms
- Playback start: <200ms
- Highlight latency: <50ms
- Memory profiling and leak detection

---

## Accessibility Requirements

All tasks must maintain WCAG 2.1 Level AA compliance:
- Keyboard navigation for all controls
- Screen reader support with ARIA labels
- Color contrast ratios (4.5:1 text, 3:1 graphics)
- Focus indicators on interactive elements
- No time-dependent interactions
- Alternative text for visual elements

---

## Performance Targets

- **Initialization**: <500ms (Property 11)
- **Playback Start**: <200ms (Property 12)
- **Highlight Latency**: <50ms (Property 6)
- **Memory**: No leaks, cache <50MB
- **Smooth Playback**: No stuttering (Property 13)

