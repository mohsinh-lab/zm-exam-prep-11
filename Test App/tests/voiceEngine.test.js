/**
 * Unit tests for VoiceEngine
 * 
 * Tests cover:
 * - Web Speech API initialization and support detection
 * - Speech synthesis and playback control (play, pause, resume, stop)
 * - Rate control and voice selection
 * - Event emission and handling
 * - Error scenarios and recovery
 * - Resource cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceEngine } from '../src/engine/voiceEngine.js';

describe('VoiceEngine', () => {
  let voiceEngine;

  beforeEach(() => {
    // Mock Web Speech API
    global.SpeechSynthesisUtterance = vi.fn(function(text) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onboundary = null;
    });

    global.speechSynthesis = {
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [
        { lang: 'en-US', name: 'Google US English' },
        { lang: 'ur-PK', name: 'Urdu Voice' }
      ])
    };

    window.speechSynthesis = global.speechSynthesis;
    window.SpeechSynthesisUtterance = global.SpeechSynthesisUtterance;

    voiceEngine = new VoiceEngine();
  });

  afterEach(() => {
    if (voiceEngine) {
      voiceEngine.destroy();
    }
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create a VoiceEngine instance with default options', () => {
      expect(voiceEngine).toBeDefined();
      expect(voiceEngine.currentRate).toBe(1);
      expect(voiceEngine.currentLanguage).toBe('en');
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should create a VoiceEngine instance with custom options', () => {
      const engine = new VoiceEngine({ language: 'ur', rate: 1.5 });
      expect(engine.currentLanguage).toBe('ur');
      expect(engine.currentRate).toBe(1.5);
    });

    it('should detect Web Speech API support', () => {
      expect(voiceEngine.checkSupport()).toBe(true);
    });

    it('should handle unsupported browsers gracefully', () => {
      const originalSynth = window.speechSynthesis;
      window.speechSynthesis = undefined;
      const engine = new VoiceEngine();
      expect(engine.checkSupport()).toBe(false);
      window.speechSynthesis = originalSynth;
    });
  });

  describe('Voice Selection', () => {
    it('should get available voices from the system', () => {
      const voices = voiceEngine.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should select English voice', () => {
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should select Urdu voice', () => {
      voiceEngine.setVoice('ur');
      expect(voiceEngine.currentLanguage).toBe('ur');
    });

    it('should fall back to default voice if preferred unavailable', () => {
      window.speechSynthesis.getVoices = vi.fn(() => [
        { lang: 'fr-FR', name: 'French Voice' }
      ]);
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });
  });

  describe('Speech Synthesis', () => {
    it('should initiate speech synthesis', async () => {
      const text = 'Hello world';
      await voiceEngine.speak(text);
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should emit start event when playback begins', async () => {
      const startCallback = vi.fn();
      voiceEngine.on('start', startCallback);
      
      await voiceEngine.speak('Hello world');
      
      // Trigger the onstart callback
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onstart();
      
      expect(startCallback).toHaveBeenCalled();
    });

    it('should emit boundary events for word boundaries', async () => {
      const boundaryCallback = vi.fn();
      voiceEngine.on('boundary', boundaryCallback);
      
      await voiceEngine.speak('Hello world');
      
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onboundary({ charIndex: 6 });
      
      expect(boundaryCallback).toHaveBeenCalled();
      expect(boundaryCallback.mock.calls[0][0]).toHaveProperty('wordIndex');
    });

    it('should emit end event when playback completes', async () => {
      const endCallback = vi.fn();
      voiceEngine.on('end', endCallback);
      
      await voiceEngine.speak('Hello world');
      
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onend();
      
      expect(endCallback).toHaveBeenCalled();
    });

    it('should emit error event on synthesis failure', async () => {
      const errorCallback = vi.fn();
      voiceEngine.on('error', errorCallback);
      
      await voiceEngine.speak('Hello world');
      
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onerror({ error: 'network' });
      
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Playback Control', () => {
    it('should pause active playback', async () => {
      await voiceEngine.speak('Hello world');
      voiceEngine.isPlaying = true;
      
      voiceEngine.pause();
      
      expect(window.speechSynthesis.pause).toHaveBeenCalled();
      expect(voiceEngine.isPaused).toBe(true);
    });

    it('should resume from paused position', async () => {
      voiceEngine.isPaused = true;
      
      voiceEngine.resume();
      
      expect(window.speechSynthesis.resume).toHaveBeenCalled();
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should stop playback and reset state', async () => {
      await voiceEngine.speak('Hello world');
      voiceEngine.isPlaying = true;
      
      voiceEngine.stop();
      
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
    });

    it('should maintain state flags correctly', async () => {
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.isPaused).toBe(false);
      
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onstart();
      
      expect(voiceEngine.isPlaying).toBe(true);
      expect(voiceEngine.isPaused).toBe(false);
    });
  });

  describe('Rate Control', () => {
    it('should set playback rate to 0.75x', () => {
      voiceEngine.setRate(0.75);
      expect(voiceEngine.currentRate).toBe(0.75);
    });

    it('should set playback rate to 1x', () => {
      voiceEngine.setRate(1);
      expect(voiceEngine.currentRate).toBe(1);
    });

    it('should set playback rate to 1.25x', () => {
      voiceEngine.setRate(1.25);
      expect(voiceEngine.currentRate).toBe(1.25);
    });

    it('should set playback rate to 1.5x', () => {
      voiceEngine.setRate(1.5);
      expect(voiceEngine.currentRate).toBe(1.5);
    });

    it('should apply rate changes immediately during playback', async () => {
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      
      voiceEngine.setRate(1.5);
      
      expect(utterance.rate).toBe(1.5);
    });
  });

  describe('Event Handling', () => {
    it('should register event listeners', () => {
      const callback = vi.fn();
      voiceEngine.on('start', callback);
      
      expect(voiceEngine.eventListeners.has('start')).toBe(true);
    });

    it('should unregister event listeners', () => {
      const callback = vi.fn();
      voiceEngine.on('start', callback);
      voiceEngine.off('start', callback);
      
      expect(voiceEngine.eventListeners.get('start').length).toBe(0);
    });

    it('should call registered callbacks on events', async () => {
      const callback = vi.fn();
      voiceEngine.on('start', callback);
      
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onstart();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle multiple listeners for same event', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      voiceEngine.on('start', callback1);
      voiceEngine.on('start', callback2);
      
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onstart();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Resource Cleanup', () => {
    it('should cancel pending utterances on destroy', async () => {
      await voiceEngine.speak('Hello world');
      voiceEngine.destroy();
      
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should remove event listeners on destroy', () => {
      const callback = vi.fn();
      voiceEngine.on('start', callback);
      voiceEngine.destroy();
      
      expect(voiceEngine.eventListeners.size).toBe(0);
    });

    it('should reset state on destroy', async () => {
      await voiceEngine.speak('Hello world');
      voiceEngine.isPlaying = true;
      voiceEngine.destroy();
      
      expect(voiceEngine.isPlaying).toBe(false);
      expect(voiceEngine.utterance).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle synthesis errors gracefully', async () => {
      const errorCallback = vi.fn();
      voiceEngine.on('error', errorCallback);
      
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onerror({ error: 'network' });
      
      expect(errorCallback).toHaveBeenCalled();
      expect(voiceEngine.isPlaying).toBe(false);
    });

    it('should handle voice unavailability', () => {
      window.speechSynthesis.getVoices = vi.fn(() => []);
      voiceEngine.setVoice('en');
      expect(voiceEngine.currentLanguage).toBe('en');
    });

    it('should provide error details in error events', async () => {
      const errorCallback = vi.fn();
      voiceEngine.on('error', errorCallback);
      
      await voiceEngine.speak('Hello world');
      const utterance = window.speechSynthesis.speak.mock.calls[0][0];
      utterance.onerror({ error: 'network' });
      
      expect(errorCallback.mock.calls[0][0]).toHaveProperty('error');
    });
  });
});
