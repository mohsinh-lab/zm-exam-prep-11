/**
 * Unit tests for HighlightSync
 * 
 * Tests cover:
 * - Word boundary mapping and calculation
 * - Highlight update performance (<50ms)
 * - Visual highlighting and cleanup
 * - DOM structure creation and manipulation
 * - Edge cases (empty passages, single word, large passages)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightSync } from '../src/engine/highlightSync.js';

describe('HighlightSync', () => {
  let highlightSync;
  let passageElement;

  beforeEach(() => {
    passageElement = document.createElement('div');
    passageElement.id = 'passage';
    document.body.appendChild(passageElement);
    highlightSync = new HighlightSync(passageElement);
  });

  afterEach(() => {
    if (passageElement && passageElement.parentNode) {
      passageElement.parentNode.removeChild(passageElement);
    }
  });

  describe('Initialization', () => {
    it('should create a HighlightSync instance', () => {
      expect(highlightSync).toBeDefined();
      expect(highlightSync.passageElement).toBe(passageElement);
    });

    it('should initialize with a passage element', () => {
      expect(highlightSync.words).toEqual([]);
      expect(highlightSync.wordElements).toEqual([]);
      expect(highlightSync.wordBoundaries).toEqual([]);
    });

    it('should parse passage into words', () => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toEqual(['The', 'quick', 'brown', 'fox']);
    });

    it('should create word-level DOM structure', () => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
      const wordSpans = passageElement.querySelectorAll('.word');
      expect(wordSpans.length).toBe(4);
      expect(wordSpans[0].textContent).toBe('The');
      expect(wordSpans[1].textContent).toBe('quick');
    });
  });

  describe('Word Boundary Mapping', () => {
    it('should calculate word boundaries correctly', () => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
      const boundaries = highlightSync.getWordBoundaries();
      expect(boundaries).toEqual([0, 4, 10, 16]);
    });

    it('should map character positions to word indices', () => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
      const boundaries = highlightSync.getWordBoundaries();
      expect(boundaries[0]).toBe(0); // 'The' starts at 0
      expect(boundaries[1]).toBe(4); // 'quick' starts at 4
      expect(boundaries[2]).toBe(10); // 'brown' starts at 10
      expect(boundaries[3]).toBe(16); // 'fox' starts at 16
    });

    it('should handle passages with punctuation', () => {
      const passage = 'Hello, world! How are you?';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toEqual(['Hello,', 'world!', 'How', 'are', 'you?']);
    });

    it('should handle passages with multiple spaces', () => {
      const passage = 'The  quick   brown fox';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toEqual(['The', 'quick', 'brown', 'fox']);
    });

    it('should handle single-word passages', () => {
      const passage = 'Hello';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toEqual(['Hello']);
      expect(highlightSync.getWordBoundaries()).toEqual([0]);
    });

    it('should handle large passages (>1000 words)', () => {
      const words = Array(1001).fill('word');
      const passage = words.join(' ');
      highlightSync.initialize(passage);
      expect(highlightSync.getWordCount()).toBe(1001);
    });
  });

  describe('Highlight Updates', () => {
    beforeEach(() => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
    });

    it('should highlight the first word', () => {
      highlightSync.updateHighlight(0);
      const firstWord = passageElement.querySelector('[data-word-index="0"]');
      expect(firstWord.classList.contains('voice-highlight')).toBe(true);
    });

    it('should move highlight to next word', () => {
      highlightSync.updateHighlight(0);
      highlightSync.updateHighlight(1);
      const firstWord = passageElement.querySelector('[data-word-index="0"]');
      const secondWord = passageElement.querySelector('[data-word-index="1"]');
      expect(firstWord.classList.contains('voice-highlight')).toBe(false);
      expect(secondWord.classList.contains('voice-highlight')).toBe(true);
    });

    it('should remove previous highlight when updating', () => {
      highlightSync.updateHighlight(0);
      expect(highlightSync.getCurrentWordIndex()).toBe(0);
      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);
      const firstWord = passageElement.querySelector('[data-word-index="0"]');
      expect(firstWord.classList.contains('voice-highlight')).toBe(false);
    });

    it('should handle highlight at end of passage', () => {
      highlightSync.updateHighlight(3);
      const lastWord = passageElement.querySelector('[data-word-index="3"]');
      expect(lastWord.classList.contains('voice-highlight')).toBe(true);
    });

    it('should handle invalid word indices gracefully', () => {
      highlightSync.updateHighlight(-1);
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
      highlightSync.updateHighlight(100);
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
    });

    it('should update highlight with <50ms latency', () => {
      const startTime = performance.now();
      highlightSync.updateHighlight(0);
      highlightSync.updateHighlight(1);
      highlightSync.updateHighlight(2);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Highlight Cleanup', () => {
    beforeEach(() => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
    });

    it('should clear all highlighting', () => {
      highlightSync.updateHighlight(1);
      highlightSync.clearHighlight();
      const secondWord = passageElement.querySelector('[data-word-index="1"]');
      expect(secondWord.classList.contains('voice-highlight')).toBe(false);
    });

    it('should remove highlight class from all words', () => {
      highlightSync.updateHighlight(0);
      highlightSync.clearHighlight();
      const allWords = passageElement.querySelectorAll('.word');
      allWords.forEach(word => {
        expect(word.classList.contains('voice-highlight')).toBe(false);
      });
    });

    it('should reset current word index', () => {
      highlightSync.updateHighlight(2);
      highlightSync.clearHighlight();
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
    });

    it('should track current word index', () => {
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
      highlightSync.updateHighlight(1);
      expect(highlightSync.getCurrentWordIndex()).toBe(1);
    });

    it('should return word count', () => {
      expect(highlightSync.getWordCount()).toBe(4);
    });

    it('should return current highlighted word index', () => {
      highlightSync.updateHighlight(2);
      expect(highlightSync.getCurrentWordIndex()).toBe(2);
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      const passage = 'The quick brown fox';
      highlightSync.initialize(passage);
    });

    it('should clean up DOM modifications on destroy', () => {
      highlightSync.updateHighlight(1);
      highlightSync.destroy();
      const wordSpans = passageElement.querySelectorAll('.word');
      expect(wordSpans.length).toBe(0);
    });

    it('should remove event listeners on destroy', () => {
      highlightSync.destroy();
      expect(highlightSync.words).toEqual([]);
      expect(highlightSync.wordElements).toEqual([]);
    });

    it('should reset state on destroy', () => {
      highlightSync.updateHighlight(1);
      highlightSync.destroy();
      expect(highlightSync.getCurrentWordIndex()).toBe(-1);
      expect(highlightSync.getWordCount()).toBe(0);
      expect(highlightSync.getWordBoundaries()).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty passage', () => {
      highlightSync.initialize('');
      expect(highlightSync.getWordCount()).toBe(0);
      expect(highlightSync.getWordBoundaries()).toEqual([]);
    });

    it('should handle passage with only whitespace', () => {
      highlightSync.initialize('   \t\n  ');
      expect(highlightSync.getWordCount()).toBe(0);
      expect(highlightSync.getWordBoundaries()).toEqual([]);
    });

    it('should handle passage with special characters', () => {
      const passage = 'Hello! @#$% World?';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toContain('Hello!');
      expect(highlightSync.words).toContain('@#$%');
      expect(highlightSync.words).toContain('World?');
    });

    it('should handle passage with numbers', () => {
      const passage = 'The year 2024 is here';
      highlightSync.initialize(passage);
      expect(highlightSync.words).toContain('2024');
      expect(highlightSync.getWordCount()).toBe(5);
    });
  });
});
