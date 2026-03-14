/**
 * VoiceTutor - Component for orchestrating voice tutor UI and coordinating engine components
 * 
 * Responsibility: Render voice tutor UI, manage component lifecycle,
 * coordinate VoiceEngine and HighlightSync, and handle user interactions.
 */

import { VoiceEngine } from '../../engine/voiceEngine.js';
import { HighlightSync } from '../../engine/highlightSync.js';
import { AudioCache } from '../../engine/audioCache.js';

/**
 * Voice Tutor state structure
 * @typedef {Object} VoiceTutorState
 * @property {Object} passage - Current passage object
 * @property {boolean} isPlaying - Whether audio is currently playing
 * @property {boolean} isPaused - Whether audio is paused
 * @property {number} currentRate - Current playback rate (0.75, 1, 1.25, 1.5)
 * @property {string} currentLanguage - Current language ('en' or 'ur')
 * @property {number} currentWordIndex - Index of currently highlighted word
 * @property {string|null} error - Current error message if any
 * @property {boolean} isOffline - Whether device is offline
 * @property {boolean} usePreRecorded - Whether using pre-recorded audio
 */

let voiceTutorState = {
  passage: null,
  isPlaying: false,
  isPaused: false,
  currentRate: 1,
  currentLanguage: 'en',
  currentVoicePreset: 'normal',
  currentWordIndex: -1,
  error: null,
  isOffline: false,
  usePreRecorded: false
};

let voiceEngine = null;
let highlightSync = null;
let audioCache = null;

/**
 * Render the Voice Tutor UI component
 * Returns HTML string with play/pause/stop buttons, speed control, and status display
 * 
 * @param {Object} passage - Passage object containing text and metadata
 * @param {string} passage.id - Unique passage identifier
 * @param {string} passage.text - Passage text content
 * @param {string} passage.language - Passage language ('en' or 'ur')
 * @returns {string} HTML string for the voice tutor component
 */
export function renderVoiceTutor(passage) {
  if (!passage || !passage.text) {
    return '';
  }

  const speedOptions = [0.75, 1, 1.25, 1.5];
  const currentSpeed = voiceTutorState.currentRate;
  const voicePresets = VoiceEngine.getAvailablePresets();
  const currentPreset = voiceTutorState.currentVoicePreset;

  return `
    <div class="voice-tutor-container" role="region" aria-label="Voice Tutor Controls - Optional Feature">
      <!-- Control Buttons -->
      <div class="voice-controls">
        <button 
          id="voice-play" 
          class="voice-button voice-button-play"
          aria-label="Play passage audio"
          aria-pressed="false"
          title="Play"
        >
          ▶ Play
        </button>
        
        <button 
          id="voice-pause" 
          class="voice-button voice-button-pause"
          aria-label="Pause passage audio"
          aria-pressed="false"
          title="Pause"
          disabled
        >
          ⏸ Pause
        </button>
        
        <button 
          id="voice-stop" 
          class="voice-button voice-button-stop"
          aria-label="Stop passage audio and reset"
          title="Stop"
          disabled
        >
          ⏹ Stop
        </button>
      </div>

      <!-- Voice Character Selection -->
      <div class="voice-character-control">
        <fieldset>
          <legend>Voice Character</legend>
          <div class="character-options">
            ${voicePresets.map(preset => `
              <label class="character-label">
                <input 
                  type="radio" 
                  name="voice-character" 
                  value="${preset.id}"
                  ${preset.id === currentPreset ? 'checked' : ''}
                  class="character-radio"
                />
                <span class="character-label-text">${preset.name}</span>
              </label>
            `).join('')}
          </div>
        </fieldset>
      </div>

      <!-- Speed Control -->
      <div class="voice-speed-control">
        <fieldset>
          <legend>Playback Speed</legend>
          <div class="speed-options">
            ${speedOptions.map(speed => `
              <label class="speed-label">
                <input 
                  type="radio" 
                  name="voice-speed" 
                  value="${speed}"
                  ${speed === currentSpeed ? 'checked' : ''}
                  class="speed-radio"
                />
                <span class="speed-label-text">${speed}x</span>
              </label>
            `).join('')}
          </div>
        </fieldset>
      </div>

      <!-- Status Display -->
      <div class="voice-status" aria-live="polite" aria-atomic="true" id="voice-status">
        <span class="status-text">Ready</span>
      </div>

      <!-- Error Message Area -->
      <div class="voice-error" role="alert" id="voice-error" style="display: none;">
        <span class="error-text"></span>
      </div>

      <!-- Live Region for Screen Reader Announcements -->
      <div 
        aria-live="polite" 
        aria-atomic="true"
        class="sr-only"
        id="voice-announcements"
      ></div>
      
      <!-- Optional feature note for accessibility -->
      <div class="sr-only">
        Voice tutor is an optional feature. You can read the passage without using audio.
      </div>
    </div>
  `;
}

/**
 * Mount the Voice Tutor component and initialize interactivity
 * Attaches event listeners, initializes engines, and restores user preferences
 * 
 * @param {Object} passage - Passage object containing text and metadata
 * @param {string} passage.id - Unique passage identifier
 * @param {string} passage.text - Passage text content
 * @param {string} passage.language - Passage language ('en' or 'ur')
 * @returns {Promise<void>} Promise that resolves when mounting completes
 */
export async function mountVoiceTutor(passage) {
  if (!passage || !passage.text) {
    return;
  }

  voiceTutorState.passage = passage;

  // Load user preferences
  loadPreferences();

  // Initialize engines
  try {
    // Initialize VoiceEngine
    voiceEngine = new VoiceEngine({
      language: voiceTutorState.currentLanguage,
      rate: voiceTutorState.currentRate,
      voicePreset: voiceTutorState.currentVoicePreset
    });

    // Initialize HighlightSync
    const passageElement = document.querySelector('.passage-text');
    if (passageElement) {
      highlightSync = new HighlightSync(passageElement);
      highlightSync.initialize(passage.text);
    }

    // Initialize AudioCache
    audioCache = new AudioCache();
    await audioCache.initialize();

    // Attach event listeners to buttons
    const playBtn = document.getElementById('voice-play');
    const pauseBtn = document.getElementById('voice-pause');
    const stopBtn = document.getElementById('voice-stop');
    const speedRadios = document.querySelectorAll('input[name="voice-speed"]');
    const characterRadios = document.querySelectorAll('input[name="voice-character"]');

    if (playBtn) playBtn.addEventListener('click', handlePlayClick);
    if (pauseBtn) pauseBtn.addEventListener('click', handlePauseClick);
    if (stopBtn) stopBtn.addEventListener('click', handleStopClick);
    speedRadios.forEach(radio => {
      radio.addEventListener('change', (e) => handleSpeedChange(parseFloat(e.target.value)));
    });
    characterRadios.forEach(radio => {
      radio.addEventListener('change', (e) => handleVoiceCharacterChange(e.target.value));
    });

    // Set up keyboard navigation
    const voiceTutorContainer = document.querySelector('.voice-tutor-container');
    if (voiceTutorContainer) {
      voiceTutorContainer.addEventListener('keydown', handleKeyboardNavigation);
    }

    // Set up voice engine event listeners
    voiceEngine.on('start', handleStartEvent);
    voiceEngine.on('boundary', handleBoundaryEvent);
    voiceEngine.on('end', handleEndEvent);
    voiceEngine.on('error', handleErrorEvent);
    voiceEngine.on('pause', handlePauseEvent);
    voiceEngine.on('resume', handleResumeEvent);

    // Set up online/offline detection
    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);
    detectOnlineStatus();

    // Listen for language changes
    window.addEventListener('lang_changed', handleLanguageChange);

    // Listen for question answer events (integration with reading comprehension)
    window.addEventListener('question_answered', handleQuestionAnswered);

    // Listen for route changes to clean up resources
    window.addEventListener('route_changed', handleRouteChanged);

  } catch (error) {
    console.error('Failed to mount VoiceTutor:', error);
    displayError('Failed to initialize voice tutor');
  }
}

/**
 * Handle play button click
 * Initiates speech synthesis or pre-recorded audio playback
 * @private
 */
function handlePlayClick() {
  if (!voiceTutorState.passage) return;

  clearError();
  voiceEngine.speak(voiceTutorState.passage.text);
}

/**
 * Handle pause button click
 * Pauses current playback
 * @private
 */
function handlePauseClick() {
  voiceEngine.pause();
}

/**
 * Handle resume button click
 * Resumes paused playback
 * @private
 */
function handleResumeClick() {
  voiceEngine.resume();
}

/**
 * Handle stop button click
 * Stops playback and resets to beginning
 * @private
 */
function handleStopClick() {
  voiceEngine.stop();
  if (highlightSync) {
    highlightSync.clearHighlight();
  }
  voiceTutorState.isPlaying = false;
  voiceTutorState.isPaused = false;
  updateUI();
}

/**
 * Handle keyboard navigation for voice tutor controls
 * - Tab: Move focus between controls
 * - Enter/Space: Activate buttons
 * - Arrow Left/Right: Previous/next speed option
 * - Escape: Stop playback
 * @param {KeyboardEvent} event - Keyboard event
 * @private
 */
function handleKeyboardNavigation(event) {
  const speedRadios = Array.from(document.querySelectorAll('input[name="voice-speed"]'));
  const currentRadio = document.querySelector('input[name="voice-speed"]:checked');
  const currentIndex = speedRadios.indexOf(currentRadio);

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        speedRadios[currentIndex - 1].checked = true;
        speedRadios[currentIndex - 1].focus();
        handleSpeedChange(parseFloat(speedRadios[currentIndex - 1].value));
      }
      break;

    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < speedRadios.length - 1) {
        speedRadios[currentIndex + 1].checked = true;
        speedRadios[currentIndex + 1].focus();
        handleSpeedChange(parseFloat(speedRadios[currentIndex + 1].value));
      }
      break;

    case 'Escape':
      event.preventDefault();
      if (voiceTutorState.isPlaying || voiceTutorState.isPaused) {
        handleStopClick();
        announceToScreenReader('Playback stopped');
      }
      break;
  }
}

/**
 * Handle speed control change
 * @param {number} speed - Selected speed (0.75, 1, 1.25, 1.5)
 * @private
 */
function handleSpeedChange(speed) {
  voiceTutorState.currentRate = speed;
  voiceEngine.setRate(speed);
  savePreferences();
  updateUI();
}

/**
 * Handle voice character change
 * @param {string} preset - Voice preset ID ('normal', 'optimusPrime')
 * @private
 */
function handleVoiceCharacterChange(preset) {
  voiceTutorState.currentVoicePreset = preset;
  voiceEngine.setVoicePreset(preset);
  savePreferences();
  announceToScreenReader(`Voice changed to ${preset === 'optimusPrime' ? 'Optimus Prime' : 'Normal'}`);
}

/**
 * Handle language preference change
 * @param {Object} event - Language change event
 * @private
 */
function handleLanguageChange(event) {
  const newLanguage = event.detail || 'en';
  voiceTutorState.currentLanguage = newLanguage;
  voiceEngine.setVoice(newLanguage);
  savePreferences();
}

/**
 * Handle question answer event (auto-pause on question answered)
 * @param {Object} event - Question answered event
 * @private
 */
function handleQuestionAnswered(event) {
  // Auto-pause voice tutor when question is answered
  if (voiceTutorState.isPlaying && !voiceTutorState.isPaused) {
    voiceEngine.pause();
    announceToScreenReader('Playback paused. Question answered.');
  }
}

/**
 * Handle route change event (cleanup on navigation)
 * @param {Object} event - Route changed event
 * @private
 */
function handleRouteChanged(event) {
  // Clean up voice tutor when navigating away
  unmountVoiceTutor();
}

/**
 * Handle voice engine start event
 * @private
 */
function handleStartEvent() {
  voiceTutorState.isPlaying = true;
  voiceTutorState.isPaused = false;
  updateUI();
  announceToScreenReader('Playback started');
}

/**
 * Handle voice engine boundary event (word boundary reached)
 * @param {Object} event - Boundary event from voice engine
 * @param {number} event.wordIndex - Index of current word
 * @private
 */
function handleBoundaryEvent(event) {
  if (highlightSync && event.wordIndex >= 0) {
    highlightSync.updateHighlight(event.wordIndex);
    
    // Announce word change to screen readers periodically (every 5 words to avoid spam)
    if (event.wordIndex % 5 === 0) {
      const words = voiceTutorState.passage.text.split(/\s+/).filter(w => w.length > 0);
      if (words[event.wordIndex]) {
        announceToScreenReader(`Reading: ${words[event.wordIndex]}`);
      }
    }
  }
}

/**
 * Handle voice engine pause event
 * @private
 */
function handlePauseEvent() {
  voiceTutorState.isPaused = true;
  updateUI();
  announceToScreenReader('Playback paused');
}

/**
 * Handle voice engine resume event
 * @private
 */
function handleResumeEvent() {
  voiceTutorState.isPaused = false;
  updateUI();
  announceToScreenReader('Playback resumed');
}

/**
 * Handle voice engine end event (playback completed)
 * @private
 */
function handleEndEvent() {
  voiceTutorState.isPlaying = false;
  voiceTutorState.isPaused = false;
  if (highlightSync) {
    highlightSync.clearHighlight();
  }
  updateUI();
  announceToScreenReader('Playback completed');
}

/**
 * Handle voice engine error event
 * @param {Object} event - Error event from voice engine
 * @param {string} event.error - Error message
 * @private
 */
function handleErrorEvent(event) {
  voiceTutorState.isPlaying = false;
  voiceTutorState.isPaused = false;
  voiceTutorState.error = event.error;
  updateUI();
  displayError(`Error: ${event.error}`);
  announceToScreenReader(`Error: ${event.error}`);
}

/**
 * Handle online event
 * @private
 */
function handleOnlineEvent() {
  voiceTutorState.isOffline = false;
  voiceTutorState.usePreRecorded = false;
  clearError();
  updateUI();
  announceToScreenReader('Connection restored');
}

/**
 * Handle offline event
 * @private
 */
function handleOfflineEvent() {
  voiceTutorState.isOffline = true;
  if (voiceTutorState.isPlaying) {
    voiceEngine.stop();
    voiceTutorState.isPlaying = false;
    voiceTutorState.isPaused = false;
  }
  updateUI();
  announceToScreenReader('Connection lost. Offline mode activated');
}

/**
 * Update UI to reflect current state
 * @private
 */
function updateUI() {
  const playBtn = document.getElementById('voice-play');
  const pauseBtn = document.getElementById('voice-pause');
  const stopBtn = document.getElementById('voice-stop');
  const statusDiv = document.getElementById('voice-status');

  if (!playBtn || !pauseBtn || !stopBtn || !statusDiv) return;

  // Update button states
  if (voiceTutorState.isPlaying) {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    playBtn.classList.add('playing');
    pauseBtn.classList.remove('paused');
  } else if (voiceTutorState.isPaused) {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
    playBtn.classList.remove('playing');
    pauseBtn.classList.add('paused');
  } else {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    playBtn.classList.remove('playing');
    pauseBtn.classList.remove('paused');
  }

  // Update status text
  let statusText = 'Ready';
  if (voiceTutorState.isOffline) {
    statusText = 'Offline Mode';
  } else if (voiceTutorState.isPlaying) {
    statusText = `Playing (${voiceTutorState.currentRate}x)`;
  } else if (voiceTutorState.isPaused) {
    statusText = `Paused (${voiceTutorState.currentRate}x)`;
  }

  statusDiv.querySelector('.status-text').textContent = statusText;
}

/**
 * Display error message to user with retry option
 * @param {string} message - Error message to display
 * @private
 */
function displayError(message) {
  const errorDiv = document.getElementById('voice-error');
  if (errorDiv) {
    const errorText = errorDiv.querySelector('.error-text');
    errorText.textContent = message;
    
    // Add retry button if not already present
    if (!errorDiv.querySelector('.error-retry-btn')) {
      const retryBtn = document.createElement('button');
      retryBtn.className = 'error-retry-btn';
      retryBtn.textContent = 'Retry';
      retryBtn.setAttribute('aria-label', 'Retry audio playback');
      retryBtn.addEventListener('click', () => {
        clearError();
        handlePlayClick();
      });
      errorDiv.appendChild(retryBtn);
    }
    
    errorDiv.style.display = 'block';
  }
}

/**
 * Clear error message from UI
 * @private
 */
function clearError() {
  const errorDiv = document.getElementById('voice-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.querySelector('.error-text').textContent = '';
  }
  voiceTutorState.error = null;
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @private
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('voice-announcements');
  if (announcer) {
    announcer.textContent = message;
  }
}

/**
 * Save user preferences to localStorage
 * @private
 */
function savePreferences() {
  const preferences = {
    speed: voiceTutorState.currentRate,
    language: voiceTutorState.currentLanguage,
    voicePreset: voiceTutorState.currentVoicePreset
  };
  localStorage.setItem('voice_tutor_preferences', JSON.stringify(preferences));
}

/**
 * Load user preferences from localStorage
 * @private
 */
function loadPreferences() {
  const saved = localStorage.getItem('voice_tutor_preferences');
  if (saved) {
    try {
      const preferences = JSON.parse(saved);
      voiceTutorState.currentRate = preferences.speed || 1;
      voiceTutorState.currentLanguage = preferences.language || 'en';
      voiceTutorState.currentVoicePreset = preferences.voicePreset || 'normal';
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }
}

/**
 * Detect online/offline status and update state
 * @private
 */
function detectOnlineStatus() {
  voiceTutorState.isOffline = !navigator.onLine;
  updateUI();
}

/**
 * Clean up resources and event listeners
 * Called when navigating away from the passage
 */
export function unmountVoiceTutor() {
  // Stop playback
  if (voiceEngine) {
    voiceEngine.stop();
    voiceEngine.destroy();
    voiceEngine = null;
  }

  // Destroy highlight sync
  if (highlightSync) {
    highlightSync.destroy();
    highlightSync = null;
  }

  // Close audio cache
  if (audioCache) {
    audioCache.close();
    audioCache = null;
  }

  // Remove event listeners
  const playBtn = document.getElementById('voice-play');
  const pauseBtn = document.getElementById('voice-pause');
  const stopBtn = document.getElementById('voice-stop');
  const speedRadios = document.querySelectorAll('input[name="voice-speed"]');
  const characterRadios = document.querySelectorAll('input[name="voice-character"]');
  const voiceTutorContainer = document.querySelector('.voice-tutor-container');

  if (playBtn) playBtn.removeEventListener('click', handlePlayClick);
  if (pauseBtn) pauseBtn.removeEventListener('click', handlePauseClick);
  if (stopBtn) stopBtn.removeEventListener('click', handleStopClick);
  if (voiceTutorContainer) voiceTutorContainer.removeEventListener('keydown', handleKeyboardNavigation);
  speedRadios.forEach(radio => {
    radio.removeEventListener('change', (e) => handleSpeedChange(parseFloat(e.target.value)));
  });
  characterRadios.forEach(radio => {
    radio.removeEventListener('change', (e) => handleVoiceCharacterChange(e.target.value));
  });

  // Remove global event listeners
  window.removeEventListener('online', handleOnlineEvent);
  window.removeEventListener('offline', handleOfflineEvent);
  window.removeEventListener('lang_changed', handleLanguageChange);
  window.removeEventListener('question_answered', handleQuestionAnswered);
  window.removeEventListener('route_changed', handleRouteChanged);

  // Clear state
  voiceTutorState = {
    passage: null,
    isPlaying: false,
    isPaused: false,
    currentRate: 1,
    currentLanguage: 'en',
    currentVoicePreset: 'normal',
    currentWordIndex: -1,
    error: null,
    isOffline: false,
    usePreRecorded: false
  };
}
