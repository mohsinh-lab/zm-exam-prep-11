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
   * Cached available voices (lazy loaded)
   * @static
   */
  static _cachedVoices = null;
  static _voicesLoadingPromise = null;

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
    this._initializationTime = 0;
    
    // iOS Safari specific flags
    this.isIOSSafari = this._detectIOSSafari();
    this.audioContextInitialized = false;
    this.pendingUtterance = null;
    
    // Android Chrome specific flags
    this.isAndroidChrome = this._detectAndroidChrome();
    this.androidAudioContextInitialized = false;
    
    // Apply voice preset if specified (synchronously)
    if (this.currentVoicePreset !== 'normal' && VoiceEngine.VOICE_PRESETS[this.currentVoicePreset]) {
      this._applyVoicePreset(this.currentVoicePreset);
    }

    // Preload voices asynchronously without blocking initialization
    this._preloadVoicesAsync();
    
    // Initialize audio context for iOS Safari
    if (this.isIOSSafari) {
      this._initializeIOSAudioContext();
    }
    
    // Initialize audio context for Android Chrome
    if (this.isAndroidChrome) {
      this._initializeAndroidAudioContext();
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
   * Detect if running on iOS Safari
   * @returns {boolean} True if iOS Safari is detected
   * @private
   */
  _detectIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    return isIOS && isSafari;
  }

  /**
   * Detect if running on Android Chrome
   * @returns {boolean} True if Android Chrome is detected
   * @private
   */
  _detectAndroidChrome() {
    const ua = navigator.userAgent;
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
    return isAndroid && isChrome;
  }

  /**
   * Initialize audio context for iOS Safari
   * iOS requires specific setup for audio playback
   * @private
   */
  _initializeIOSAudioContext() {
    // iOS Safari requires user interaction to initialize audio
    // We set up event listeners to handle the first user interaction
    const initializeAudio = () => {
      if (!this.audioContextInitialized && this.synth) {
        // Trigger a dummy utterance to initialize audio context
        try {
          const dummy = new SpeechSynthesisUtterance('');
          dummy.volume = 0; // Silent
          this.synth.speak(dummy);
          this.synth.cancel();
          this.audioContextInitialized = true;
        } catch (error) {
          console.warn('Failed to initialize iOS audio context:', error);
        }
      }
      // Remove listeners after initialization
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('click', initializeAudio);
    };

    // Listen for first user interaction
    document.addEventListener('touchstart', initializeAudio, { once: true });
    document.addEventListener('click', initializeAudio, { once: true });
  }

  /**
   * Initialize audio context for Android Chrome
   * Android Chrome requires specific setup for audio playback
   * @private
   */
  _initializeAndroidAudioContext() {
    // Android Chrome requires user interaction to initialize audio
    // We set up event listeners to handle the first user interaction
    const initializeAudio = () => {
      if (!this.androidAudioContextInitialized && this.synth) {
        // Trigger a dummy utterance to initialize audio context
        try {
          const dummy = new SpeechSynthesisUtterance('');
          dummy.volume = 0; // Silent
          this.synth.speak(dummy);
          this.synth.cancel();
          this.androidAudioContextInitialized = true;
        } catch (error) {
          console.warn('Failed to initialize Android audio context:', error);
        }
      }
      // Remove listeners after initialization
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('click', initializeAudio);
    };

    // Listen for first user interaction
    document.addEventListener('touchstart', initializeAudio, { once: true });
    document.addEventListener('click', initializeAudio, { once: true });
  }
  _preloadVoicesAsync() {
    if (!this.isSupported) {
      return;
    }

    // If voices are already cached, skip preloading
    if (VoiceEngine._cachedVoices !== null) {
      return;
    }

    // If voices are already being loaded, skip
    if (VoiceEngine._voicesLoadingPromise !== null) {
      return;
    }

    // Use requestAnimationFrame to defer voice loading to next frame
    VoiceEngine._voicesLoadingPromise = new Promise((resolve) => {
      requestAnimationFrame(() => {
        try {
          const voices = this.synth.getVoices();
          if (voices.length > 0) {
            VoiceEngine._cachedVoices = voices;
            resolve(voices);
          } else {
            // Voices may not be loaded yet, listen for voiceschanged event
            const handleVoicesChanged = () => {
              const loadedVoices = this.synth.getVoices();
              if (loadedVoices.length > 0) {
                VoiceEngine._cachedVoices = loadedVoices;
                this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
                resolve(loadedVoices);
              }
            };
            this.synth.addEventListener('voiceschanged', handleVoicesChanged);
            
            // Timeout after 2 seconds to avoid hanging
            setTimeout(() => {
              this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
              VoiceEngine._cachedVoices = this.synth.getVoices();
              resolve(VoiceEngine._cachedVoices);
            }, 2000);
          }
        } catch (error) {
          console.warn('Error preloading voices:', error);
          resolve([]);
        }
      });
    });
  }

  /**
   * Get list of available voices from the system (uses cached voices for performance)
   * @returns {Array<SpeechSynthesisVoice>} Array of available voices
   */
  getAvailableVoices() {
    if (!this.isSupported) {
      return [];
    }

    // Return cached voices if available
    if (VoiceEngine._cachedVoices !== null) {
      return VoiceEngine._cachedVoices;
    }

    // Fall back to direct call (may be empty if voices not loaded yet)
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      VoiceEngine._cachedVoices = voices;
    }
    return voices;
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

    // Set voice if available (use cached voices for performance)
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

    // Cache word boundaries for efficient boundary event mapping
    // Pre-compute boundaries to avoid repeated string operations during playback
    const wordBoundaries = this._computeWordBoundaries(text);

    // Handle start event
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this._emit('start', {});
    };

    // Handle boundary event with word index mapping (optimized with cached boundaries)
    this.utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        // Use binary search for efficient word index lookup
        const wordIndex = this._findWordIndexForCharPos(event.charIndex, wordBoundaries);
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

    // Start synthesis with iOS Safari and Android Chrome compatibility
    try {
      // iOS Safari may need a small delay before speaking
      if (this.isIOSSafari) {
        // Ensure audio context is initialized
        if (!this.audioContextInitialized) {
          this.audioContextInitialized = true;
        }
        
        // Use a small timeout to ensure iOS is ready
        setTimeout(() => {
          if (this.utterance && this.synth) {
            this.synth.speak(this.utterance);
          }
        }, 10);
      } 
      // Android Chrome may need a small delay and audio context initialization
      else if (this.isAndroidChrome) {
        // Ensure audio context is initialized
        if (!this.androidAudioContextInitialized) {
          this.androidAudioContextInitialized = true;
        }
        
        // Use a small timeout to ensure Android is ready
        setTimeout(() => {
          if (this.utterance && this.synth) {
            this.synth.speak(this.utterance);
          }
        }, 10);
      } 
      else {
        this.synth.speak(this.utterance);
      }
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
      try {
        this.synth.pause();
        this.isPaused = true;
        this._emit('pause', {});
      } catch (error) {
        console.warn('Failed to pause speech synthesis:', error);
        // iOS Safari and Android Chrome may not support pause, try stop instead
        if (this.isIOSSafari || this.isAndroidChrome) {
          this.stop();
        }
      }
    }
  }

  /**
   * Resume paused speech playback
   */
  resume() {
    if (this.isPaused && this.synth) {
      try {
        this.synth.resume();
        this.isPaused = false;
        this._emit('resume', {});
      } catch (error) {
        console.warn('Failed to resume speech synthesis:', error);
        // iOS Safari may not support resume, restart playback
        if (this.isIOSSafari && this.utterance) {
          this.synth.speak(this.utterance);
          this.isPaused = false;
        }
      }
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
   * Properly removes all event listeners and clears memory
   */
  destroy() {
    // Cancel any ongoing speech synthesis
    if (this.synth) {
      this.synth.cancel();
    }

    // Clear utterance reference
    if (this.utterance) {
      // Remove all event listeners from utterance
      this.utterance.onstart = null;
      this.utterance.onboundary = null;
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }

    // Clear all event listeners
    this.eventListeners.clear();

    // Reset state
    this.isPlaying = false;
    this.isPaused = false;
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

  /**
   * Compute word boundaries for efficient boundary event mapping
   * Pre-computes character positions for each word to avoid repeated string operations
   * @param {string} text - Text to analyze
   * @returns {Array<Object>} Array of word boundary objects with charPos and wordIndex
   * @private
   */
  _computeWordBoundaries(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    let charIndex = 0;
    const wordBoundaries = [];
    
    for (const word of words) {
      const pos = text.indexOf(word, charIndex);
      if (pos !== -1) {
        wordBoundaries.push({ charPos: pos, wordIndex: wordBoundaries.length });
        charIndex = pos + word.length;
      }
    }
    
    return wordBoundaries;
  }

  /**
   * Find word index for a character position using binary search
   * Optimized for fast lookup during boundary events
   * @param {number} charPos - Character position
   * @param {Array<Object>} wordBoundaries - Pre-computed word boundaries
   * @returns {number} Word index or -1 if not found
   * @private
   */
  _findWordIndexForCharPos(charPos, wordBoundaries) {
    if (wordBoundaries.length === 0) {
      return -1;
    }

    // Binary search for efficiency
    let left = 0;
    let right = wordBoundaries.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (wordBoundaries[mid].charPos <= charPos) {
        result = wordBoundaries[mid].wordIndex;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }
}
