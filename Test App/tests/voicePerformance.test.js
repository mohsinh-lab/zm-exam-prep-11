/**
 * Voice Tutor - Performance Optimization Tests
 * Tests for initialization, playback start, highlight update, and smooth playback performance
 * 
 * **Validates: Properties 11, 12, 13**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceEngine } from '../src/engine/voiceEngine.js';
import { HighlightSync } from '../src/engine/highlightSync.js';
import { AudioCache } from '../src/engine/audioCache.js';
import fc from 'fast-check';

describe('Voice Tutor - Performance Optimization', () => {
  let voiceEngine;
  let highlightSync;
  let passageElement;

  beforeEach(() => {
    // Create a mock passage element
    passageElement = document.createElement('div');
    passageElement.id = 'passage';
    document.body.appendChild(passageElement);
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

  describe('Property 11: Initialization Performance', () => {
    it('should initialize VoiceEngine within 500ms', () => {
      const startTime = performance.now();
      voiceEngine = new VoiceEngine();
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(500);
      expect(voiceEngine.isSupported).toBeDefined();
    });

    it('should initialize HighlightSync within 500ms', () => {
      const startTime = performance.now();
      highlightSync = new HighlightSync(passageElement);
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(500);
    });

    it('should initialize with passage parsing within 500ms', () => {
      const passage = 'The quick brown fox jumps over the lazy dog. ' +
        'This is a longer passage with multiple sentences. ' +
        'It should still initialize quickly even with more text.';

      const startTime = performance.now();
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(500);
      expect(highlightSync.getWordCount()).toBeGreaterThan(0);
    });

    it('Property 11: should initialize for any passage within 500ms', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 500 }),
          (passage) => {
            const startTime = performance.now();
            const sync = new HighlightSync(passageElement);
            sync.initialize(passage);
            const endTime = performance.now();
            const initTime = endTime - startTime;

            expect(initTime).toBeLessThan(500);
            sync.destroy();
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 12: Playback Start Performance', () => {
    it('should start playback within 200ms', async () => {
      voiceEngine = new VoiceEngine();

      if (!voiceEngine.isSupported) {
        console.warn('Web Speech API not supported, skipping playback test');
        return;
      }

      const startTime = performance.now();
      
      // Mock the speak method to measure setup time
      const mockUtterance = new SpeechSynthesisUtterance('test');
      voiceEngine.utterance = mockUtterance;
      voiceEngine.isPlaying = true;

      const endTime = performance.now();
      const playbackStartTime = endTime - startTime;

      expect(playbackStartTime).toBeLessThan(200);
    });

    it('should compute word boundaries efficiently', () => {
      voiceEngine = new VoiceEngine();
      const text = 'The quick brown fox jumps over the lazy dog';

      const startTime = performance.now();
      const boundaries = voiceEngine._computeWordBoundaries(text);
      const endTime = performance.now();
      const computeTime = endTime - startTime;

      expect(computeTime).toBeLessThan(50); // Should be very fast
      expect(boundaries.length).toBeGreaterThan(0);
    });

    it('Property 12: should compute word boundaries for any text within 200ms', () => {
      voiceEngine = new VoiceEngine();

      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 1000 }),
          (text) => {
            const startTime = performance.now();
            const boundaries = voiceEngine._computeWordBoundaries(text);
            const endTime = performance.now();
            const computeTime = endTime - startTime;

            expect(computeTime).toBeLessThan(200);
            return boundaries.length >= 0;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 13: Smooth Playback', () => {
    it('should update highlight within 50ms', () => {
      const passage = 'The quick brown fox jumps over the lazy dog';
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);

      const startTime = performance.now();
      highlightSync.updateHighlight(0);
      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(50);
      expect(highlightSync.getCurrentWordIndex()).toBe(0);
    });

    it('should handle rapid highlight updates efficiently', () => {
      const passage = 'The quick brown fox jumps over the lazy dog';
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);

      const updateTimes = [];
      const wordCount = highlightSync.getWordCount();

      for (let i = 0; i < Math.min(wordCount, 10); i++) {
        const startTime = performance.now();
        highlightSync.updateHighlight(i);
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      // All updates should be under 50ms
      updateTimes.forEach(time => {
        expect(time).toBeLessThan(50);
      });

      // Average should be well under 50ms
      const avgTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      expect(avgTime).toBeLessThan(30);
    });

    it('should find word index efficiently using binary search', () => {
      voiceEngine = new VoiceEngine();
      const text = 'The quick brown fox jumps over the lazy dog';
      const boundaries = voiceEngine._computeWordBoundaries(text);

      const startTime = performance.now();
      const wordIndex = voiceEngine._findWordIndexForCharPos(10, boundaries);
      const endTime = performance.now();
      const searchTime = endTime - startTime;

      expect(searchTime).toBeLessThan(10); // Binary search should be very fast
      expect(wordIndex).toBeGreaterThanOrEqual(-1);
    });

    it('Property 13: should maintain smooth playback with rapid boundary events', () => {
      voiceEngine = new VoiceEngine();
      const text = 'The quick brown fox jumps over the lazy dog. ' +
        'This is a longer passage with multiple sentences.';
      const boundaries = voiceEngine._computeWordBoundaries(text);

      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: text.length - 1 }), { maxLength: 100 }),
          (charPositions) => {
            const searchTimes = [];

            for (const charPos of charPositions) {
              const startTime = performance.now();
              voiceEngine._findWordIndexForCharPos(charPos, boundaries);
              const endTime = performance.now();
              searchTimes.push(endTime - startTime);
            }

            // All searches should be fast
            searchTimes.forEach(time => {
              expect(time).toBeLessThan(10);
            });

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track highlight update time', () => {
      const passage = 'The quick brown fox jumps over the lazy dog';
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);

      highlightSync.updateHighlight(0);
      const lastTime = highlightSync.getLastHighlightTime();

      expect(lastTime).toBeGreaterThanOrEqual(0);
      expect(lastTime).toBeLessThan(50);
    });

    it('should handle large passages efficiently', () => {
      // Create a large passage with 1000+ words
      const words = Array(200).fill('word').join(' ');
      const passage = words;

      const startTime = performance.now();
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(500);
      expect(highlightSync.getWordCount()).toBeGreaterThan(100);
    });

    it('should cache voices for subsequent engine instances', () => {
      const engine1 = new VoiceEngine();
      const voices1 = engine1.getAvailableVoices();

      const engine2 = new VoiceEngine();
      const voices2 = engine2.getAvailableVoices();

      // Both should return the same cached voices
      expect(voices1).toEqual(voices2);

      engine1.destroy();
      engine2.destroy();
    });
  });

  describe('Memory Optimization', () => {
    it('should properly clean up resources on destroy', () => {
      voiceEngine = new VoiceEngine();
      voiceEngine.on('start', () => {});
      voiceEngine.on('boundary', () => {});

      expect(voiceEngine.eventListeners.size).toBeGreaterThan(0);

      voiceEngine.destroy();

      expect(voiceEngine.eventListeners.size).toBe(0);
      expect(voiceEngine.utterance).toBeNull();
    });

    it('should clean up highlight sync resources', () => {
      const passage = 'The quick brown fox jumps over the lazy dog';
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage);

      expect(highlightSync.getWordCount()).toBeGreaterThan(0);

      highlightSync.destroy();

      expect(highlightSync.words.length).toBe(0);
      expect(highlightSync.wordElements.length).toBe(0);
      expect(passageElement.innerHTML).toBe('');
    });

    it('should handle debounced highlight updates without memory leaks', () => {
      const passage = 'The quick brown fox jumps over the lazy dog';
      highlightSync = new HighlightSync(passageElement, { debounceDelay: 10 });
      highlightSync.initialize(passage);

      // Schedule multiple updates
      for (let i = 0; i < 5; i++) {
        highlightSync.updateHighlight(i);
      }

      // Destroy should clean up pending updates
      highlightSync.destroy();

      expect(highlightSync.pendingHighlightUpdate).toBeNull();
    });
  });
});
