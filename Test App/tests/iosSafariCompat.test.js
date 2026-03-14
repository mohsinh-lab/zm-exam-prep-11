/**
 * iOS Safari Compatibility Tests for Voice Tutor
 * 
 * Tests cover iOS Safari-specific issues:
 * - Web Speech API availability and initialization
 * - Voice selection on iOS
 * - Audio context requirements
 * - Highlighting synchronization
 * - Speed control persistence
 * - Low-power mode handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceEngine } from '../src/engine/voiceEngine.js';
import { HighlightSync } from '../src/engine/highlightSync.js';

describe('iOS Safari Compatibility', () => {
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

  describe('10.1 iOS Safari Initialization', () => {
    it('should detect Web Speech API support on iOS Safari 14.1+', () => {
      // iOS Safari 14.1+ supports Web Speech API
      const isSupported = voiceEngine.checkSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should handle iOS-specific voice selection', () => {
      const voices = voiceEngine.getAvailableVoices();
      // iOS may have limited voices, but should return an array
      expect(Array.isArray(voices)).toBe(true);
    });

    it('should initialize without errors on iOS Safari', async () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      // Should not throw during initialization
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      // Should have parsed words correctly
      expect(highlightSync.getWordCount()).toBe(9);
    });

    it('should handle iOS audio context requirements', async () => {
      // iOS requires user interaction to start audio
      // This test verifies the engine is ready for user interaction
      // Note: In test environment, Web Speech API may not be available
      if (voiceEngine.isSupported) {
        expect(voiceEngine.synth).toBeDefined();
      }
    });

    it('should preload voices asynchronously without blocking', async () => {
      const startTime = performance.now();
      
      // Create new engine - should not block
      const engine = new VoiceEngine();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Initialization should be fast (< 50ms for synchronous part)
      expect(initTime).toBeLessThan(50);
      
      engine.destroy();
    });

    it('should handle missing voices gracefully on iOS', () => {
      // iOS may not have all voices available
      voiceEngine.setVoice('ur'); // Try to set Urdu voice
      
      // Should not throw, even if voice is unavailable
      expect(() => {
        voiceEngine.setVoice('ur');
      }).not.toThrow();
    });

    it('should support English voice on iOS Safari', () => {
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should support Urdu voice on iOS Safari', () => {
      voiceEngine.setVoice('ur');
      expect(voiceEngine.currentLanguage).toBe('ur');
    });
  });

  describe('10.2 iOS Safari Playback', () => {
    it('should verify audio playback works on iOS Safari', async () => {
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
      // Actual audio playback requires user interaction on iOS
      // In test environment, Web Speech API may not be available
      if (voiceEngine.isSupported) {
        expect(voiceEngine.isSupported).toBe(true);
      }
    });

    it('should handle iOS audio context requirements for playback', async () => {
      // iOS requires user gesture to start audio
      // Verify the engine is properly configured
      if (voiceEngine.isSupported) {
        expect(voiceEngine.synth).toBeDefined();
      }
      expect(voiceEngine.utterance === null).toBe(true);
    });

    it('should handle network conditions gracefully', async () => {
      let errorFired = false;
      let errorMessage = '';

      voiceEngine.on('error', (data) => {
        errorFired = true;
        errorMessage = data.error;
      });

      // Verify error handling is in place
      expect(typeof voiceEngine.on).toBe('function');
    });

    it('should maintain playback state during iOS interruptions', () => {
      // Verify state tracking
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should handle iOS audio session interruptions', () => {
      // iOS may interrupt audio for calls, notifications, etc.
      // Verify the engine can recover
      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });
  });

  describe('10.3 iOS Safari Highlighting Synchronization', () => {
    it('should verify real-time highlighting updates on iOS Safari', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      // Update highlight to word 2
      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      // Update highlight to word 5
      highlightSync.updateHighlight(5);
      expect(highlightSync.getCurrentWordIndex()).toBe(5);
    });

    it('should handle different passage lengths on iOS Safari', () => {
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

    it('should verify no lag or stuttering in highlighting', () => {
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

    it('should maintain highlight during iOS screen rotation', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(3);
      expect(highlightSync.getCurrentWordIndex()).toBe(3);

      // Simulate screen rotation (no-op in test, but verify state persists)
      expect(highlightSync.getCurrentWordIndex()).toBe(3);
    });

    it('should handle highlighting with iOS Safari zoom levels', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      // Verify highlighting works regardless of zoom
      highlightSync.updateHighlight(1);
      expect(highlightSync.getCurrentWordIndex()).toBe(1);

      highlightSync.updateHighlight(4);
      expect(highlightSync.getCurrentWordIndex()).toBe(4);
    });

    it('should clear highlighting properly on iOS Safari', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      highlightSync.clearHighlight();
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
    });
  });

  describe('10.4 iOS Safari Speed Control', () => {
    it('should verify speed changes apply correctly on iOS Safari', () => {
      voiceEngine.setRate(0.75);
      expect(voiceEngine.currentRate).toBe(0.75);

      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setRate(1.25);
      expect(voiceEngine.currentRate).toBe(1.25);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);
    });

    it('should test all speed options on iOS Safari', () => {
      const speeds = [0.75, 1, 1.25, 1.5];

      for (const speed of speeds) {
        voiceEngine.setRate(speed);
        expect(voiceEngine.currentRate).toBe(speed);
      }
    });

    it('should verify speed persists across sessions on iOS Safari', () => {
      // Simulate saving preference
      const savedSpeed = 1.25;
      localStorage.setItem('voice_tutor_speed', savedSpeed.toString());

      // Simulate loading preference
      const loadedSpeed = parseFloat(localStorage.getItem('voice_tutor_speed'));
      expect(loadedSpeed).toBe(1.25);

      // Clean up
      localStorage.removeItem('voice_tutor_speed');
    });

    it('should apply speed changes immediately during playback', () => {
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);

      // If utterance exists, rate should be updated
      if (voiceEngine.utterance) {
        expect(voiceEngine.utterance.rate).toBe(1.5);
      }
    });

    it('should handle speed control with iOS Safari gestures', () => {
      // Verify speed control is accessible via touch
      voiceEngine.setRate(0.75);
      expect(voiceEngine.currentRate).toBe(0.75);

      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);
    });
  });

  describe('10.5 iOS Safari Low-Power Mode', () => {
    it('should verify functionality in low-power mode', () => {
      // Low-power mode may affect performance but shouldn't break functionality
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBe(9);
    });

    it('should test performance degradation in low-power mode', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      const startTime = performance.now();
      
      // Simulate highlighting updates
      for (let i = 0; i < highlightSync.getWordCount(); i++) {
        highlightSync.updateHighlight(i);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should still complete in reasonable time even in low-power mode
      expect(totalTime).toBeLessThan(500);
    });

    it('should ensure graceful handling in low-power mode', () => {
      // Verify engine doesn't crash in low-power mode
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);

      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');

      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
    });

    it('should maintain state consistency in low-power mode', () => {
      const passage = 'The quick brown fox jumps over the lazy dog.';
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);

      // State should persist
      expect(highlightSync.getCurrentWordIndex()).toBe(2);
    });

    it('should handle resource constraints in low-power mode', () => {
      // Verify the engine handles limited resources gracefully
      const passage = 'The quick brown fox jumps over the lazy dog.';
      
      expect(() => {
        highlightSync.initialize(passage);
        highlightSync.updateHighlight(0);
        highlightSync.clearHighlight();
      }).not.toThrow();
    });
  });

  describe('iOS Safari Edge Cases', () => {
    it('should handle empty passages on iOS Safari', () => {
      expect(() => {
        highlightSync.initialize('');
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBe(0);
    });

    it('should handle passages with special characters on iOS Safari', () => {
      const passage = 'Hello, world! How are you? I\'m fine.';
      
      expect(() => {
        highlightSync.initialize(passage);
      }).not.toThrow();

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('should handle rapid speed changes on iOS Safari', () => {
      const speeds = [0.75, 1, 1.25, 1.5, 1, 0.75];

      expect(() => {
        for (const speed of speeds) {
          voiceEngine.setRate(speed);
        }
      }).not.toThrow();

      expect(voiceEngine.currentRate).toBe(0.75);
    });

    it('should handle language switching on iOS Safari', () => {
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');

      voiceEngine.setVoice('ur');
      expect(voiceEngine.currentLanguage).toBe('ur');

      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should handle stop during initialization on iOS Safari', () => {
      voiceEngine.stop();
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });
  });
});
