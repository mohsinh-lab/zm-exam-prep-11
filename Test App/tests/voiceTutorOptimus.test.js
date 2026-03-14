/**
 * Voice Tutor - Optimus Prime Voice Feature Tests
 * Tests for voice character presets and Optimus Prime voice functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VoiceEngine } from '../src/engine/voiceEngine.js';

describe('Voice Tutor - Optimus Prime Voice Feature', () => {
  let voiceEngine;

  beforeEach(() => {
    voiceEngine = new VoiceEngine();
  });

  describe('Voice Presets', () => {
    it('should have normal and optimusPrime presets available', () => {
      const presets = VoiceEngine.getAvailablePresets();
      expect(presets).toHaveLength(2);
      expect(presets.map(p => p.id)).toContain('normal');
      expect(presets.map(p => p.id)).toContain('optimusPrime');
    });

    it('should have correct preset names', () => {
      const presets = VoiceEngine.getAvailablePresets();
      const normalPreset = presets.find(p => p.id === 'normal');
      const optimusPreset = presets.find(p => p.id === 'optimusPrime');
      
      expect(normalPreset.name).toBe('Normal');
      expect(optimusPreset.name).toBe('Optimus Prime');
    });
  });

  describe('Optimus Prime Voice Configuration', () => {
    it('should initialize with normal voice by default', () => {
      const engine = new VoiceEngine();
      expect(engine.currentVoicePreset).toBe('normal');
      expect(engine.currentPitch).toBe(1);
      expect(engine.currentRate).toBe(1);
    });

    it('should initialize with Optimus Prime voice when specified', () => {
      const engine = new VoiceEngine({ voicePreset: 'optimusPrime' });
      expect(engine.currentVoicePreset).toBe('optimusPrime');
      expect(engine.currentPitch).toBe(0.6); // Lower pitch for deep voice
      expect(engine.currentRate).toBe(0.85); // Slightly slower
    });

    it('should apply Optimus Prime voice settings correctly', () => {
      voiceEngine.setVoicePreset('optimusPrime');
      expect(voiceEngine.currentVoicePreset).toBe('optimusPrime');
      expect(voiceEngine.currentPitch).toBe(0.6);
      expect(voiceEngine.currentRate).toBe(0.85);
      expect(voiceEngine.currentVolume).toBe(1);
    });

    it('should switch back to normal voice', () => {
      voiceEngine.setVoicePreset('optimusPrime');
      voiceEngine.setVoicePreset('normal');
      expect(voiceEngine.currentVoicePreset).toBe('normal');
      expect(voiceEngine.currentPitch).toBe(1);
      expect(voiceEngine.currentRate).toBe(1);
    });
  });

  describe('Voice Preset Application', () => {
    it('should apply preset settings when voice preset is set', () => {
      voiceEngine.setVoicePreset('optimusPrime');
      
      // Verify the engine has Optimus Prime settings
      expect(voiceEngine.currentPitch).toBe(0.6);
      expect(voiceEngine.currentRate).toBe(0.85);
      expect(voiceEngine.currentVolume).toBe(1);
    });

    it('should maintain preset settings across multiple utterances', () => {
      voiceEngine.setVoicePreset('optimusPrime');
      
      // First utterance
      expect(voiceEngine.currentPitch).toBe(0.6);
      expect(voiceEngine.currentRate).toBe(0.85);
      
      // Settings should persist
      expect(voiceEngine.currentPitch).toBe(0.6);
      expect(voiceEngine.currentRate).toBe(0.85);
    });
  });

  describe('Voice Preset Persistence', () => {
    it('should preserve preset choice in state', () => {
      voiceEngine.setVoicePreset('optimusPrime');
      expect(voiceEngine.currentVoicePreset).toBe('optimusPrime');
      
      // Simulate state persistence
      const savedPreset = voiceEngine.currentVoicePreset;
      const newEngine = new VoiceEngine({ voicePreset: savedPreset });
      
      expect(newEngine.currentVoicePreset).toBe('optimusPrime');
      expect(newEngine.currentPitch).toBe(0.6);
    });
  });

  describe('Voice Preset Characteristics', () => {
    it('Optimus Prime should have lower pitch than normal', () => {
      const normalEngine = new VoiceEngine({ voicePreset: 'normal' });
      const optimusEngine = new VoiceEngine({ voicePreset: 'optimusPrime' });
      
      expect(optimusEngine.currentPitch).toBeLessThan(normalEngine.currentPitch);
    });

    it('Optimus Prime should have slower rate than normal', () => {
      const normalEngine = new VoiceEngine({ voicePreset: 'normal' });
      const optimusEngine = new VoiceEngine({ voicePreset: 'optimusPrime' });
      
      expect(optimusEngine.currentRate).toBeLessThan(normalEngine.currentRate);
    });

    it('Optimus Prime should maintain full volume', () => {
      const optimusEngine = new VoiceEngine({ voicePreset: 'optimusPrime' });
      expect(optimusEngine.currentVolume).toBe(1);
    });
  });

  describe('Invalid Preset Handling', () => {
    it('should ignore invalid preset names', () => {
      const originalPreset = voiceEngine.currentVoicePreset;
      voiceEngine.setVoicePreset('invalidPreset');
      
      // Should remain unchanged
      expect(voiceEngine.currentVoicePreset).toBe(originalPreset);
    });

    it('should handle null preset gracefully', () => {
      expect(() => {
        voiceEngine.setVoicePreset(null);
      }).not.toThrow();
    });
  });
});
