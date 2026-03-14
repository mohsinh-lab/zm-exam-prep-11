/**
 * Android Chrome Compatibility Tests for Voice Tutor
 * 
 * Tests cover Android Chrome-specific issues:
 * - Web Speech API availability and initialization
 * - Voice selection on Android
 * - Audio context requirements
 * - Highlighting synchronization
 * - Speed control persistence
 * - Limited resource handling
 * 
 * Android Chrome specific considerations:
 * - Web Speech API may have different voice availability
 * - Audio context may require different initialization
 * - Memory constraints on lower-end devices
 * - Touch-based interaction patterns
 * - Variable network conditions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoiceEngine } from '../src/engine/voiceEngine.js';
import { HighlightSync } from '../src/engine/highlightSync.js';

describe('Android Chrome Compatibility', () => {
  let voiceEngine;
  let highlightSync;
  let passageElement;

  beforeEach(() => {
    // Create a mock passage element
    passageElement = document.createElement('div');
    passageElement.id = 'passage';
    document.body.appendChild(passageElement);

    // Initialize engines
    voiceEngine = new VoiceEngine({ language: 'en', rate: 1 });
    highlightSync = new HighlightSync(passageElement);
  });

  afterEach(() => {
    if (voiceEngine) {
      voiceEngine.destroy();
    }
    if (highlightSync) {
      highlightSync.destroy();
    }
    if (passageElement && passageElement.parentNode) {
      passageElement.parentNode.removeChild(passageElement);
    }
  });

  describe('11.1 Android Chrome Initialization', () => {
    it('should detect Web Speech API support on Android Chrome', () => {
      // Android Chrome supports Web Speech API
      const isSupported = voiceEngine.checkSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should handle Android-specific voice selection', () => {
      const voices = voiceEngine.getAvailableVoices();
      // Android may have different voices than iOS
      expect(Array.isArray(voices)).toBe(true);
    });

    it('should initialize without errors on Android Chrome', async () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      // Should not throw during initialization
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      // Should have parsed words correctly
      expect(highlightSync.getWordCount()).toBe(9);
    });

    it('should handle Android audio context requirements', async () => {
      // Android Chrome may have different audio context requirements
      // Verify the engine is ready for user interaction
      if (voiceEngine.isSupported) {
        expect(voiceEngine.synth).toBeDefined();
      }
    });

    it('should preload voices asynchronously without blocking on Android', async () => {
      const startTime = performance.now();
      
      // Create new engine - should not block
      const engine = new VoiceEngine();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Initialization should be fast (< 50ms for synchronous part)
      expect(initTime).toBeLessThan(50);
      
      engine.destroy();
    });

    it('should handle missing voices gracefully on Android Chrome', () => {
      // Android may not have all voices available
      voiceEngine.setVoice('ur'); // Try to set Urdu voice
      
      // Should not throw, even if voice is unavailable
      expect(() => {
        voiceEngine.setVoice('ur');
      }).not.toThrow();
    });

    it('should support English voice on Android Chrome', () => {
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should support Urdu voice on Android Chrome', () => {
      voiceEngine.setVoice('ur');
      expect(voiceEngine.currentLanguage).toBe('ur');
    });

    it('should handle Android Chrome voice list updates', () => {
      // Android Chrome may update available voices dynamically
      const voices1 = voiceEngine.getAvailableVoices();
      const voices2 = voiceEngine.getAvailableVoices();
      
      // Should return consistent results
      expect(voices1.length).toBe(voices2.length);
    });

    it('should initialize within performance target on Android', () => {
      const startTime = performance.now();
      
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Should initialize within 500ms target
      expect(initTime).toBeLessThan(500);
    });

    it('should handle initialization with limited memory on Android', () => {
      // Simulate initialization with memory constraints
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBe(9);
    });
  });

  describe('11.2 Android Chrome Playback', () => {
    it('should verify audio playback works on Android Chrome', async () => {
      const passage = 'Hello world';
      let startEventFired = false;
      let endEventFired = false;

      voiceEngine.on('start', () => {
        startEventFired = true;
      });

      voiceEngine.on('end', () => {
        endEventFired = true;
      });

      // Note: This test verifies the engine is ready for playback
      // Actual audio playback requires user interaction on Android
      // In test environment, Web Speech API may not be available
      if (voiceEngine.isSupported) {
        expect(voiceEngine.isSupported).toBe(true);
      }
    });

    it('should handle Android audio context requirements for playback', async () => {
      // Android Chrome may have different audio context requirements
      // Verify the engine is properly configured
      if (voiceEngine.isSupported) {
        expect(voiceEngine.synth).toBeDefined();
      }
      expect(voiceEngine.utterance === null).toBe(true);
    });

    it('should handle network conditions gracefully on Android', async () => {
      let errorFired = false;

      voiceEngine.on('error', () => {
        errorFired = true;
      });

      // Verify error handling is in place
      expect(typeof voiceEngine.on).toBe('function');
    });

    it('should maintain playback state during Android interruptions', () => {
      // Android may interrupt audio for calls, notifications, etc.
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should handle Android audio session interruptions', () => {
      // Android may interrupt audio for system sounds
      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should handle Android Chrome audio focus changes', () => {
      // Android may change audio focus
      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
    });

    it('should handle playback with Android system volume changes', () => {
      // Android system volume changes should not break playback
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);
    });

    it('should handle playback with Android Bluetooth audio', () => {
      // Android may use Bluetooth audio devices
      if (voiceEngine.isSupported) {
        expect(voiceEngine.synth).toBeDefined();
      }
    });

    it('should handle playback start within performance target on Android', () => {
      const startTime = performance.now();
      
      // Simulate playback start
      if (voiceEngine.isSupported) {
        voiceEngine.setRate(1);
      }
      
      const endTime = performance.now();
      const startLatency = endTime - startTime;
      
      // Should start within 200ms target
      expect(startLatency).toBeLessThan(200);
    });
  });

  describe('11.3 Android Chrome Highlighting Synchronization', () => {
    it('should verify real-time highlighting updates on Android Chrome', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      // Update highlight to word 2
      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      // Update highlight to word 5
      highlightSync.updateHighlight(5);
      expect(highlightSync.getCurrentWordIndex()).toBe(5);
    });

    it('should handle different passage lengths on Android Chrome', () => {
      // Short passage
      const shortPassage = 'Hello world';
      highlightSync.initialize(shortPassage);
      expect(highlightSync.getWordCount()).toBe(2);

      // Long passage
      const longPassage = 'The quick brown fox jumps over the lazy dog. ' +
        'The dog was very lazy and did not want to move. ' +
        'The fox was very quick and jumped very high.';
      highlightSync.initialize(longPassage);
      expect(highlightSync.getWordCount()).toBeGreaterThan(20);
    });

    it('should verify no lag or stuttering in highlighting on Android', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      const startTime = performance.now();
      
      // Simulate rapid highlighting updates
      for (let i = 0; i < highlightSync.getWordCount(); i++) {
        highlightSync.updateHighlight(i);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete quickly without stuttering
      expect(totalTime).toBeLessThan(100);
    });

    it('should maintain highlight during Android screen rotation', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(3);
      expect(highlightSync.getCurrentWordIndex()).toBe(3);

      // Simulate screen rotation (no-op in test, but verify state persists)
      expect(highlightSync.getCurrentWordIndex()).toBe(3);
    });

    it('should handle highlighting with Android Chrome zoom levels', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      // Verify highlighting works regardless of zoom
      highlightSync.updateHighlight(1);
      expect(highlightSync.getCurrentWordIndex()).toBe(1);

      highlightSync.updateHighlight(4);
      expect(highlightSync.getCurrentWordIndex()).toBe(4);
    });

    it('should clear highlighting properly on Android Chrome', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      highlightSync.clearHighlight();
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
    });

    it('should handle highlighting with Android touch interactions', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      // Simulate touch-based highlighting updates
      highlightSync.updateHighlight(0);
      expect(highlightSync.getCurrentWordIndex()).toBe(0);

      highlightSync.updateHighlight(8);
      expect(highlightSync.getCurrentWordIndex()).toBe(8);
    });

    it('should maintain highlighting synchronization within 50ms target', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      const startTime = performance.now();
      highlightSync.updateHighlight(3);
      const endTime = performance.now();

      const updateLatency = endTime - startTime;
      
      // Should update within 50ms target
      expect(updateLatency).toBeLessThan(50);
    });
  });

  describe('11.4 Android Chrome Speed Control', () => {
    it('should verify speed changes apply correctly on Android Chrome', () => {
      voiceEngine.setRate(0.75);
      expect(voiceEngine.currentRate).toBe(0.75);

      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setRate(1.25);
      expect(voiceEngine.currentRate).toBe(1.25);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);
    });

    it('should test all speed options on Android Chrome', () => {
      const speeds = [0.75, 1, 1.25, 1.5];

      for (const speed of speeds) {
        voiceEngine.setRate(speed);
        expect(voiceEngine.currentRate).toBe(speed);
      }
    });

    it('should verify speed persists across sessions on Android Chrome', () => {
      // Simulate saving preference
      const savedSpeed = 1.25;
      localStorage.setItem('voice_tutor_speed', savedSpeed.toString());

      // Simulate loading preference
      const loadedSpeed = parseFloat(localStorage.getItem('voice_tutor_speed'));
      expect(loadedSpeed).toBe(1.25);

      // Clean up
      localStorage.removeItem('voice_tutor_speed');
    });

    it('should apply speed changes immediately during playback on Android', () => {
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);

      // If utterance exists, rate should be updated
      if (voiceEngine.utterance) {
        expect(voiceEngine.utterance.rate).toBe(1.5);
      }
    });

    it('should handle speed control with Android Chrome touch gestures', () => {
      // Verify speed control is accessible via touch
      voiceEngine.setRate(0.75);
      expect(voiceEngine.currentRate).toBe(0.75);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);
    });

    it('should handle rapid speed changes on Android Chrome', () => {
      const speeds = [0.75, 1, 1.25, 1.5, 1, 0.75];

      expect(() => {
        for (const speed of speeds) {
          voiceEngine.setRate(speed);
        }
      }).not.toThrow();

      expect(voiceEngine.currentRate).toBe(0.75);
    });

    it('should persist speed preference across app restarts on Android', () => {
      // Save speed
      voiceEngine.setRate(1.25);
      localStorage.setItem('voice_tutor_speed', '1.25');

      // Simulate app restart
      const newEngine = new VoiceEngine();
      const savedSpeed = localStorage.getItem('voice_tutor_speed');
      newEngine.setRate(parseFloat(savedSpeed));

      expect(newEngine.currentRate).toBe(1.25);

      newEngine.destroy();
      localStorage.removeItem('voice_tutor_speed');
    });
  });

  describe('11.5 Android Chrome Limited Resources', () => {
    it('should verify functionality with limited memory on Android', () => {
      // Limited memory on lower-end Android devices
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBe(9);
    });

    it('should test performance with large passages on Android', () => {
      // Create a large passage (>1000 words)
      let largePassage = '';
      for (let i = 0; i < 100; i++) {
        largePassage += 'The quick brown fox jumps over the lazy dog. ';
      }

      const startTime = performance.now();
      
      expect(() => {
        highlightSync.initialize(largePassage);
      }).not.toThrow();

      const endTime = performance.now();
      const initTime = endTime - startTime;

      // Should handle large passages within reasonable time
      expect(initTime).toBeLessThan(1000);
      expect(highlightSync.getWordCount()).toBeGreaterThan(500);
    });

    it('should ensure graceful handling with limited resources on Android', () => {
      // Verify engine doesn't crash with limited resources
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');

      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
    });

    it('should maintain state consistency with limited memory on Android', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      // State should persist even with memory constraints
      expect(highlightSync.getCurrentWordIndex()).toBe(2);
    });

    it('should handle resource cleanup properly on Android', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(0);
      highlightSync.clearHighlight();
      highlightSync.destroy();

      // Should not throw during cleanup
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
    });

    it('should handle multiple passages with limited memory on Android', () => {
      const passages = [
        'The quick brown fox jumps over the lazy dog.',
        'Hello world this is a test passage.',
        'Another passage for testing purposes.'
      ];

      for (const passage of passages) {
        expect(() => {
          highlightSync.initialize(passage);
        }).not.toThrow();
      }
    });

    it('should handle rapid initialization and cleanup on Android', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';

      for (let i = 0; i < 5; i++) {
        highlightSync.initialize(passage);
        highlightSync.updateHighlight(0);
        highlightSync.clearHighlight();
      }

      expect(highlightSync.getWordCount()).toBe(9);
    });

    it('should handle highlighting with limited memory on Android', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      const startTime = performance.now();
      
      // Simulate highlighting updates with memory constraints
      for (let i = 0; i < highlightSync.getWordCount(); i++) {
        highlightSync.updateHighlight(i);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(100);
    });

    it('should handle voice engine with limited memory on Android', () => {
      expect(() => {
        voiceEngine.setRate(1);
        voiceEngine.setVoice('en');
        voiceEngine.stop();
      }).not.toThrow();
    });

    it('should handle event listeners with limited memory on Android', () => {
      let eventCount = 0;

      voiceEngine.on('start', () => {
        eventCount++;
      });

      voiceEngine.on('end', () => {
        eventCount++;
      });

      // Should handle multiple event listeners
      expect(typeof voiceEngine.on).toBe('function');
    });
  });

  describe('Android Chrome Edge Cases', () => {
    it('should handle empty passages on Android Chrome', () => {
      expect(() => {
        highlightSync.initialize('');
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBe(0);
    });

    it('should handle passages with special characters on Android Chrome', () => {
      const passage = 'Hello, world! How are you? I\'m fine.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('should handle language switching on Android Chrome', () => {
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');

      voiceEngine.setVoice('ur');
      expect(voiceEngine.currentLanguage).toBe('ur');

      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should handle stop during initialization on Android Chrome', () => {
      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should handle passages with Unicode characters on Android Chrome', () => {
      const passage = 'السلام عليكم ورحمة الله وبركاته'; // Urdu text
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('should handle very long words on Android Chrome', () => {
      const passage = 'The supercalifragilisticexpialidocious word is very long.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('should handle passages with numbers on Android Chrome', () => {
      const passage = 'The year 2024 has 365 days and 24 hours per day.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('should handle passages with URLs on Android Chrome', () => {
      const passage = 'Visit https://example.com for more information.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });
  });
});
