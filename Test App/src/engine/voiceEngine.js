/**
 * VoiceEngine - Manages Web Speech API interactions and text-to-speech synthesis
 * 
 * Responsibility: Handle speech synthesis, playback control, rate adjustment,
 * and voice selection with fallback to pre-recorded audio.
 */

export class VoiceEngine {
  /**
   * Voice presets for different character voices
   * @static
   */
  static VOICE_PRESETS = {
    normal: {
      name: 'Normal',
      pitch: 1,
      rate: 1,
      volume: 1
    },
    optimusPrime: {
      name: 'Optimus Prime',
      pitch: 0.6,      // Lower pitch for deep voice
      rate: 0.85,      // Slightly slower for authoritative tone
      volume: 1
    }
  };

  /**
   * Initialize VoiceEngine with configuration options
   * @param {Object} options - Configuration options
   * @param {string} options.language - Language code ('en' or 'ur')
   * @param {number} options.rate - Playback rate (0.75, 1, 1.25, 1.5)
   * @param {number} options.pitch - Pitch level (0.5 - 2)
   * @param {number} options.volume - Volume level (0 - 1)
   * @param {string} options.voicePreset - Voice preset ('normal', 'optimusPrime')
   */
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPaused = false;
    this.isPlaying = false;
    this.currentRate = options.rate || 1;
    this.currentLanguage = options.language || 'en';
    this.currentPitch = options.pitch || 1;
    this.currentVolume = options.volume || 1;
    this.currentVoicePreset = options.voicePreset || 'normal';
    this.isSupported = this.checkSupport();
    this.eventListeners = new Map();
    
    // Apply voice preset if specified
    if (this.currentVoicePreset !== 'normal' && VoiceEngine.VOICE_PRESETS[this.currentVoicePreset]) {
      this._applyVoicePreset(this.currentVoicePreset);
    }
  }

  /**
   * Check if Web Speech API is available in the browser
   * @returns {boolean} True if Web Speech API is supported
   */
  checkSupport() {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  /**
   * Get list of available voices from the system
   * @returns {Array<SpeechSynthesisVoice>} Array of available voices
   */
  getAvailableVoices() {
    if (!this.isSupported) {
      return [];
    }
    return this.synth.getVoices();
  }

  /**
   * Initiate speech synthesis for the given text
   * @param {string} text - Text to synthesize
   * @param {Object} options - Synthesis options
   * @returns {Promise<void>} Promise that resolves when synthesis completes
   * 
   * Emits events:
   * - 'start': Playback begins
   * - 'boundary': Word boundary reached (includes wordIndex)
   * - 'end': Playback completes
   * - 'error': Error occurred (includes error details)
   */
  async speak(text, options = {}) {
    if (!this.isSupported) {
      this._emit('error', { error: 'Web Speech API not supported' });
      return;
    }

    // Cancel any existing utterance
    this.stop();

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = this.currentRate;
    this.utterance.pitch = this.currentPitch;
    this.utterance.volume = this.currentVolume;

    // Set voice if available
    const voices = this.getAvailableVoices();
    if (voices.length > 0) {
      const selectedVoice = this._findVoiceForLanguage(this.currentLanguage, voices);
      if (selectedVoice) {
        this.utterance.voice = selectedVoice;
      } else {
        // Log unavailability for debugging
        console.warn(`Voice not available for language: ${this.currentLanguage}. Using default voice.`);
      }
    }

    // Parse text into words for boundary tracking
    const words = text.split(/\s+/).filter(w => w.length > 0);
    let charIndex = 0;
    const wordBoundaries = [];
    
    for (const word of words) {
      const pos = text.indexOf(word, charIndex);
      if (pos !== -1) {
        wordBoundaries.push({ word, charPos: pos, wordIndex: wordBoundaries.length });
        charIndex = pos + word.length;
      }
    }

    // Handle start event
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this._emit('start', {});
    };

    // Handle boundary event with word index mapping
    this.utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        // Find which word this character position corresponds to
        let wordIndex = -1;
        for (let i = 0; i < wordBoundaries.length; i++) {
          if (wordBoundaries[i].charPos <= event.charIndex) {
            wordIndex = i;
          } else {
            break;
          }
        }
        this._emit('boundary', { charIndex: event.charIndex, wordIndex });
      }
    };

    // Handle end event
    this.utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this._emit('end', {});
    };

    // Handle error event with detailed error handling
    this.utterance.onerror = (event) => {
      this.isPlaying = false;
      this.isPaused = false;
      
      // Map error codes to user-friendly messages
      let errorMessage = event.error;
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'synthesis-unavailable':
          errorMessage = 'Speech synthesis is temporarily unavailable.';
          break;
        case 'invalid-argument':
          errorMessage = 'Invalid audio settings. Please try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Audio playback not allowed. Please check permissions.';
          break;
        default:
          errorMessage = `Audio error: ${event.error}`;
      }
      
      this._emit('error', { error: errorMessage, originalError: event.error });
    };

    // Start synthesis
    try {
      this.synth.speak(this.utterance);
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      this._emit('error', { error: 'Failed to start audio playback', originalError: error.message });
    }
  }

  /**
   * Pause current speech playback
   */
  pause() {
    if (this.isPlaying && !this.isPaused && this.synth) {
      this.synth.pause();
      this.isPaused = true;
      this._emit('pause', {});
    }
  }

  /**
   * Resume paused speech playback
   */
  resume() {
    if (this.isPaused && this.synth) {
      this.synth.resume();
      this.isPaused = false;
      this._emit('resume', {});
    }
  }

  /**
   * Stop speech playback and reset state
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.utterance = null;
  }

  /**
   * Set voice preset (e.g., 'optimusPrime')
   * @param {string} preset - Voice preset name
   */
  setVoicePreset(preset) {
    if (VoiceEngine.VOICE_PRESETS[preset]) {
      this.currentVoicePreset = preset;
      this._applyVoicePreset(preset);
    }
  }

  /**
   * Get available voice presets
   * @returns {Array<Object>} Array of available presets with name and description
   */
  static getAvailablePresets() {
    return Object.entries(VoiceEngine.VOICE_PRESETS).map(([key, preset]) => ({
      id: key,
      name: preset.name
    }));
  }

  /**
   * Internal method to apply voice preset settings
   * @private
   */
  _applyVoicePreset(preset) {
    const presetConfig = VoiceEngine.VOICE_PRESETS[preset];
    if (presetConfig) {
      this.currentPitch = presetConfig.pitch;
      this.currentRate = presetConfig.rate;
      this.currentVolume = presetConfig.volume;
      
      // Apply to current utterance if speaking
      if (this.utterance) {
        this.utterance.pitch = this.currentPitch;
        this.utterance.rate = this.currentRate;
        this.utterance.volume = this.currentVolume;
      }
    }
  }

  /**
   * Set playback rate (speed)
   * @param {number} rate - Playback rate (0.75, 1, 1.25, 1.5)
   */
  setRate(rate) {
    this.currentRate = rate;
    if (this.utterance) {
      this.utterance.rate = rate;
    }
  }

  /**
   * Select voice for a specific language
   * @param {string} language - Language code ('en' or 'ur')
   */
  setVoice(language) {
    this.currentLanguage = language;
    if (this.utterance) {
      const voices = this.getAvailableVoices();
      const selectedVoice = this._findVoiceForLanguage(language, voices);
      if (selectedVoice) {
        this.utterance.voice = selectedVoice;
      }
    }
  }

  /**
   * Register event listener for voice engine events
   * @param {string} eventName - Event name ('start', 'boundary', 'end', 'error', 'pause', 'resume')
   * @param {Function} callback - Callback function
   */
  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
  }

  /**
   * Unregister event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  off(eventName, callback) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Clean up resources and cancel pending utterances
   */
  destroy() {
    this.stop();
    this.eventListeners.clear();
    this.utterance = null;
  }

  /**
   * Internal method to emit events
   * @private
   */
  _emit(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      for (const callback of listeners) {
        callback(data);
      }
    }
  }

  /**
   * Internal method to find voice for a language
   * @private
   */
  _findVoiceForLanguage(language, voices) {
    // Map language codes to voice language patterns
    const languagePatterns = {
      'en': ['en-', 'en_'],
      'ur': ['ur-', 'ur_', 'Urdu']
    };

    const patterns = languagePatterns[language] || [];
    
    // Try to find exact match
    for (const voice of voices) {
      for (const pattern of patterns) {
        if (voice.lang.includes(pattern) || voice.name.includes(pattern)) {
          return voice;
        }
      }
    }

    // Fall back to first available voice
    return voices.length > 0 ? voices[0] : null;
  }
}
