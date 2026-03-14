// Reading Comprehension UI Component
// render + mount pattern following project conventions

import { READING_PASSAGES, READING_QUESTIONS } from '../../engine/questionBank.js';
import { PassageManager, QuestionHandler, HighlightManager } from '../../engine/readingEngine.js';
import passageCache from '../../engine/passageCache.js';
import readingProgress from '../../engine/readingProgress.js';

//  State 
let state = {
  passage: null,
  questions: [],
  currentQ: 0,
  answers: [],
  highlights: null,
  readingStart: null,
  phase: 'reading', // 'reading' | 'questions' | 'results'
  prefs: { fontSize: 16, lineSpacing: 1.5, bg: 'light', voiceEnabled: true, voiceSpeed: 1 },
  error: null
};

const passageManager = new PassageManager(READING_PASSAGES);
const questionHandler = new QuestionHandler(READING_QUESTIONS);

function loadPrefs() {
  try {
    const raw = localStorage.getItem('rc_prefs');
    if (raw) state.prefs = { ...state.prefs, ...JSON.parse(raw) };
  } catch {}
}

function savePrefs() {
  try { localStorage.setItem('rc_prefs', JSON.stringify(state.prefs)); } catch {}
}

//  Render 
export function renderReadingComprehension(params = {}) {
  loadPrefs();
  const passageId = params.id || READING_PASSAGES[0]?.id;
  return `
    <div class="rc-container rc-bg-${state.prefs.bg}" id="rc-root" data-passage-id="${passageId}"
         style="font-size:${state.prefs.fontSize}px; line-height:${state.prefs.lineSpacing}">
      <div class="rc-header">
        <button class="btn-back" id="rc-back" aria-label="Back to home"> Back</button>
        <h1 class="rc-title" id="rc-title">Reading Comprehension</h1>
        <button class="btn-icon" id="rc-prefs-btn" aria-label="Preferences" title="Preferences"></button>
      </div>

      <div id="rc-prefs-panel" class="rc-prefs-panel hidden" role="dialog" aria-label="Reading preferences">
        <label>Font size: <input type="range" id="pref-font" min="14" max="20" value="${state.prefs.fontSize}" aria-label="Font size"></label>
        <label>Line spacing: <input type="range" id="pref-spacing" min="12" max="20" value="${state.prefs.lineSpacing * 10}" aria-label="Line spacing"></label>
        <label>Background:
          <select id="pref-bg" aria-label="Background colour">
            <option value="light" ${state.prefs.bg === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${state.prefs.bg === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="sepia" ${state.prefs.bg === 'sepia' ? 'selected' : ''}>Sepia</option>
          </select>
        </label>
        <label>Voice Tutor:
          <input type="checkbox" id="pref-voice" ${state.prefs.voiceEnabled ? 'checked' : ''} aria-label="Enable Voice Tutor">
        </label>
        <label>Voice speed:
          <select id="pref-speed" aria-label="Voice speed">
            <option value="0.75" ${state.prefs.voiceSpeed === 0.75 ? 'selected' : ''}>0.75x</option>
            <option value="1" ${state.prefs.voiceSpeed === 1 ? 'selected' : ''}>1x</option>
            <option value="1.25" ${state.prefs.voiceSpeed === 1.25 ? 'selected' : ''}>1.25x</option>
            <option value="1.5" ${state.prefs.voiceSpeed === 1.5 ? 'selected' : ''}>1.5x</option>
          </select>
        </label>
      </div>

      <div id="rc-main" class="rc-main">
        <div class="rc-loading" id="rc-loading" aria-live="polite">
          <div class="spinner"></div><p>Loading passage...</p>
        </div>
        <div id="rc-error" class="rc-error hidden" role="alert"></div>
        <div id="rc-passage-area" class="rc-passage-area hidden"></div>
        <div id="rc-question-area" class="rc-question-area hidden"></div>
        <div id="rc-results-area" class="rc-results-area hidden"></div>
      </div>

      <div class="rc-nav" id="rc-nav">
        <button id="rc-prev" class="btn-nav" aria-label="Previous passage" disabled> Previous</button>
        <span id="rc-progress-indicator" class="rc-progress-text" aria-live="polite"></span>
        <button id="rc-next" class="btn-nav" aria-label="Next passage">Next </button>
      </div>
    </div>`;
}

//  Mount 
export async function mountReadingComprehension() {
  const root = document.getElementById('rc-root');
  if (!root) return;

  const passageId = root.dataset.passageId;
  passageManager.setCurrentIndex(passageId);

  // Wire up back button
  document.getElementById('rc-back')?.addEventListener('click', () => {
    if (window.router) window.router.navigate('#/student/home');
  });

  // Wire up prefs panel
  document.getElementById('rc-prefs-btn')?.addEventListener('click', () => {
    document.getElementById('rc-prefs-panel')?.classList.toggle('hidden');
  });
  _bindPrefs();

  // Wire up navigation
  document.getElementById('rc-prev')?.addEventListener('click', () => _navigate('prev'));
  document.getElementById('rc-next')?.addEventListener('click', () => _navigate('next'));

  // Load initial passage
  await _loadPassage(passageId);
}

//  Internal helpers 
async function _loadPassage(passageId) {
  _showLoading(true);
  _hideError();

  try {
    // Try cache first
    let cached = await passageCache.get(passageId);
    let passage, questions;

    if (cached) {
      passage = cached.passage;
      questions = cached.questions;
    } else {
      passage = await passageManager.loadPassage(passageId);
      questions = await questionHandler.loadQuestions(passageId);
      await passageCache.set(passageId, passage, questions);
    }

    state.passage = passage;
    state.questions = questions;
    state.currentQ = 0;
    state.answers = [];
    state.phase = 'reading';
    state.readingStart = Date.now();
    state.highlights = new HighlightManager(passageId);

    _renderPassage(passage);
    _updateNav();
  } catch (err) {
    _showError(err.message || 'Unable to load passage. Please try again.', () => _loadPassage(passageId));
  } finally {
    _showLoading(false);
  }
}

function _renderPassage(passage) {
  const area = document.getElementById('rc-passage-area');
  const qArea = document.getElementById('rc-question-area');
  const rArea = document.getElementById('rc-results-area');
  if (!area) return;

  qArea?.classList.add('hidden');
  rArea?.classList.add('hidden');
  area.classList.remove('hidden');

  const diffLabel = { easy: ' Easy', intermediate: ' Intermediate', hard: ' Hard' }[passage.difficulty] || passage.difficulty;
  const readTime = passage.estimatedReadingTime || passageManager.getEstimatedReadingTime(passage);

  area.innerHTML = `
    <div class="rc-passage-meta">
      <h2 class="rc-passage-title">${passage.title}</h2>
      <div class="rc-meta-row">
        <span class="rc-difficulty" aria-label="Difficulty: ${passage.difficulty}">${diffLabel}</span>
        <span class="rc-read-time" aria-label="Estimated reading time"> ~${readTime} min read</span>
      </div>
    </div>

    <div class="rc-voice-controls" id="rc-voice-controls" aria-label="Voice Tutor controls">
      <button id="rc-voice-play" class="btn-voice" aria-label="Play Voice Tutor"> Play</button>
      <button id="rc-voice-pause" class="btn-voice hidden" aria-label="Pause Voice Tutor"> Pause</button>
      <button id="rc-voice-stop" class="btn-voice" aria-label="Stop Voice Tutor"> Stop</button>
    </div>

    <div class="rc-passage-text" id="rc-passage-text" role="article" aria-label="Reading passage: ${passage.title}">
      ${_wrapWords(passage.text)}
    </div>

    <button class="btn-primary rc-start-questions" id="rc-start-questions" aria-label="Start answering questions">
      Answer Questions 
    </button>`;

  document.getElementById('rc-title').textContent = passage.title;
  document.getElementById('rc-start-questions')?.addEventListener('click', _startQuestions);
  _bindVoiceControls(passage.text);
  _restoreHighlights();
  _bindHighlighting();
}

function _wrapWords(text) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.map(para => {
    const words = para.trim().split(/(\s+)/);
    const wrapped = words.map((w, i) => {
      if (/\s+/.test(w)) return w;
      return `<span class="rc-word" data-idx="${i}">${w}</span>`;
    }).join('');
    return `<p>${wrapped}</p>`;
  }).join('');
}

function _startQuestions() {
  state.phase = 'questions';
  state.currentQ = 0;
  _renderQuestion();
}

function _renderQuestion() {
  const area = document.getElementById('rc-question-area');
  const pArea = document.getElementById('rc-passage-area');
  if (!area) return;

  pArea?.classList.add('hidden');
  area.classList.remove('hidden');

  const q = state.questions[state.currentQ];
  if (!q) { _showResults(); return; }

  const total = state.questions.length;
  const num = state.currentQ + 1;

  let optionsHtml = '';
  if (q.type === 'multiple_choice' || q.type === 'true_false') {
    const opts = q.options || (q.type === 'true_false' ? ['True', 'False'] : []);
    optionsHtml = `<fieldset class="rc-options" role="radiogroup" aria-label="Answer options">
      <legend class="sr-only">Choose your answer</legend>
      ${opts.map((opt, i) => `
        <label class="rc-option" for="opt-${i}">
          <input type="radio" name="rc-answer" id="opt-${i}" value="${opt}" aria-label="${opt}">
          <span>${opt}</span>
        </label>`).join('')}
    </fieldset>`;
  } else {
    optionsHtml = `<div class="rc-short-answer">
      <label for="rc-short-input" class="sr-only">Your answer</label>
      <textarea id="rc-short-input" class="rc-textarea" maxlength="500"
        placeholder="Type your answer here..." aria-label="Short answer input" rows="3"></textarea>
      <small class="rc-char-count" id="rc-char-count">0 / 500</small>
    </div>`;
  }

  area.innerHTML = `
    <div class="rc-q-header">
      <span class="rc-q-progress" aria-label="Question ${num} of ${total}">Question ${num} / ${total}</span>
      <div class="rc-q-progress-bar" role="progressbar" aria-valuenow="${num}" aria-valuemin="1" aria-valuemax="${total}">
        <div class="rc-q-progress-fill" style="width:${(num/total)*100}%"></div>
      </div>
    </div>
    <div class="rc-question-card">
      <p class="rc-question-text" id="rc-q-text">${q.text}</p>
      ${optionsHtml}
      <div id="rc-feedback" class="rc-feedback hidden" aria-live="assertive"></div>
      <div class="rc-q-actions">
        <button id="rc-hint-btn" class="btn-secondary" aria-label="Get a hint"> Hint</button>
        <button id="rc-submit-btn" class="btn-primary" aria-label="Submit answer">Submit</button>
      </div>
    </div>`;

  document.getElementById('rc-hint-btn')?.addEventListener('click', () => {
    const hint = questionHandler.getHints(q);
    const fb = document.getElementById('rc-feedback');
    if (fb) { fb.textContent = ` ${hint}`; fb.className = 'rc-feedback rc-hint'; }
  });

  document.getElementById('rc-submit-btn')?.addEventListener('click', () => _submitAnswer(q));

  // Char counter for short answer
  document.getElementById('rc-short-input')?.addEventListener('input', (e) => {
    const el = document.getElementById('rc-char-count');
    if (el) el.textContent = `${e.target.value.length} / 500`;
  });
}

function _submitAnswer(q) {
  let answer = '';
  if (q.type === 'multiple_choice' || q.type === 'true_false') {
    const sel = document.querySelector('input[name="rc-answer"]:checked');
    if (!sel) return;
    answer = sel.value;
  } else {
    answer = document.getElementById('rc-short-input')?.value?.trim() || '';
    if (!answer) return;
  }

  const responseTime = Date.now() - (state.readingStart || Date.now());
  const attempt = questionHandler.recordAttempt(q, answer, responseTime);
  state.answers.push(attempt);

  const fb = document.getElementById('rc-feedback');
  if (fb) {
    const result = questionHandler.validateAnswer(q, answer);
    fb.textContent = result.isCorrect ? ` ${result.feedback}` : ` ${result.feedback}${result.explanation ? '  ' + result.explanation : ''}`;
    fb.className = `rc-feedback ${result.isCorrect ? 'rc-correct' : 'rc-incorrect'}`;
  }

  // Disable inputs after submit
  document.querySelectorAll('input[name="rc-answer"], #rc-short-input').forEach(el => el.disabled = true);

  const submitBtn = document.getElementById('rc-submit-btn');
  if (submitBtn) {
    submitBtn.textContent = state.currentQ < state.questions.length - 1 ? 'Next Question ' : 'See Results';
    submitBtn.removeEventListener('click', () => _submitAnswer(q));
    submitBtn.addEventListener('click', () => {
      state.currentQ++;
      if (state.currentQ < state.questions.length) _renderQuestion();
      else _showResults();
    });
  }
}

function _showResults() {
  const area = document.getElementById('rc-results-area');
  const qArea = document.getElementById('rc-question-area');
  if (!area) return;

  qArea?.classList.add('hidden');
  area.classList.remove('hidden');

  const scoreData = questionHandler.calculateScore(state.answers);
  const readingTimeMs = Date.now() - (state.readingStart || Date.now());
  const wpm = state.passage ? readingProgress.calculateReadingSpeed(state.passage.wordCount || 200, readingTimeMs) : 0;

  const { xpAwarded } = readingProgress.recordPassageCompletion(
    state.passage?.id, scoreData.score, readingTimeMs, state.answers.length
  );
  readingProgress.updateAdaptiveDifficulty(scoreData.score);

  const emoji = scoreData.score >= 80 ? '' : scoreData.score >= 60 ? '' : '';

  area.innerHTML = `
    <div class="rc-results" role="main" aria-label="Results">
      <div class="rc-results-score">${emoji}</div>
      <h2>Passage Complete!</h2>
      <p class="rc-score-big">${scoreData.score}%</p>
      <p>${scoreData.correctCount} / ${scoreData.totalCount} correct</p>
      ${wpm > 0 ? `<p class="rc-wpm">Reading speed: ${wpm} wpm</p>` : ''}
      <p class="rc-xp-award">+${xpAwarded} XP earned</p>
      <div class="rc-results-actions">
        <button id="rc-try-again" class="btn-secondary" aria-label="Try again">Try Again</button>
        <button id="rc-next-passage" class="btn-primary" aria-label="Next passage">Next Passage </button>
      </div>
    </div>`;

  document.getElementById('rc-try-again')?.addEventListener('click', () => _loadPassage(state.passage.id));
  document.getElementById('rc-next-passage')?.addEventListener('click', () => _navigate('next'));
}

async function _navigate(dir) {
  // Stop voice if playing
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  state.highlights?.clearVoiceHighlight();

  const passage = dir === 'next'
    ? await passageManager.getNextPassage()
    : await passageManager.getPreviousPassage();

  if (passage) {
    await _loadPassage(passage.id);
  } else if (dir === 'next') {
    // All passages done
    if (window.router) window.router.navigate('#/student/home');
  }
}

function _updateNav() {
  const prevBtn = document.getElementById('rc-prev');
  const nextBtn = document.getElementById('rc-next');
  const indicator = document.getElementById('rc-progress-indicator');
  const total = READING_PASSAGES.length;
  const current = passageManager.currentIndex + 1;

  if (prevBtn) prevBtn.disabled = passageManager.currentIndex === 0;
  if (nextBtn) nextBtn.disabled = passageManager.currentIndex >= total - 1;
  if (indicator) indicator.textContent = `${current} / ${total}`;
}

function _bindVoiceControls(text) {
  const playBtn = document.getElementById('rc-voice-play');
  const pauseBtn = document.getElementById('rc-voice-pause');
  const stopBtn = document.getElementById('rc-voice-stop');

  if (!state.prefs.voiceEnabled || !window.speechSynthesis) {
    document.getElementById('rc-voice-controls')?.classList.add('hidden');
    return;
  }

  let utterance = null;
  let wordIdx = 0;

  playBtn?.addEventListener('click', () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = state.prefs.voiceSpeed;
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          state.highlights?.updateVoiceHighlight(wordIdx);
          _applyVoiceHighlight(wordIdx);
          wordIdx++;
        }
      };
      utterance.onend = () => {
        playBtn?.classList.remove('hidden');
        pauseBtn?.classList.add('hidden');
        state.highlights?.clearVoiceHighlight();
        _clearVoiceHighlight();
      };
      window.speechSynthesis.speak(utterance);
    }
    playBtn?.classList.add('hidden');
    pauseBtn?.classList.remove('hidden');
  });

  pauseBtn?.addEventListener('click', () => {
    window.speechSynthesis.pause();
    pauseBtn?.classList.add('hidden');
    playBtn?.classList.remove('hidden');
  });

  stopBtn?.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    playBtn?.classList.remove('hidden');
    pauseBtn?.classList.add('hidden');
    state.highlights?.clearVoiceHighlight();
    _clearVoiceHighlight();
    wordIdx = 0;
  });
}

function _applyVoiceHighlight(idx) {
  document.querySelectorAll('.rc-word.voice-highlight').forEach(el => el.classList.remove('voice-highlight'));
  const word = document.querySelector(`.rc-word[data-idx="${idx}"]`);
  if (word) word.classList.add('voice-highlight');
}

function _clearVoiceHighlight() {
  document.querySelectorAll('.rc-word.voice-highlight').forEach(el => el.classList.remove('voice-highlight'));
}

function _restoreHighlights() {
  if (!state.highlights) return;
  state.highlights.userHighlights.forEach(h => {
    const words = document.querySelectorAll('.rc-word');
    words.forEach((w, i) => {
      if (i >= h.startPos && i <= h.endPos) {
        w.classList.add('user-highlight');
        w.style.backgroundColor = h.color;
      }
    });
  });
}

function _bindHighlighting() {
  const passageText = document.getElementById('rc-passage-text');
  if (!passageText) return;

  passageText.addEventListener('mouseup', () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (!text) return;

    // Find word indices from selection
    const range = sel.getRangeAt(0);
    const startEl = range.startContainer.parentElement;
    const endEl = range.endContainer.parentElement;
    const startIdx = parseInt(startEl.dataset?.idx || 0);
    const endIdx = parseInt(endEl.dataset?.idx || 0);

    if (state.highlights && startIdx <= endIdx) {
      state.highlights.saveHighlight(startIdx, endIdx, text);
      _restoreHighlights();
    }
    sel.removeAllRanges();
  });
}

function _bindPrefs() {
  document.getElementById('pref-font')?.addEventListener('input', (e) => {
    state.prefs.fontSize = parseInt(e.target.value);
    document.getElementById('rc-root').style.fontSize = state.prefs.fontSize + 'px';
    savePrefs();
  });
  document.getElementById('pref-spacing')?.addEventListener('input', (e) => {
    state.prefs.lineSpacing = parseInt(e.target.value) / 10;
    document.getElementById('rc-root').style.lineHeight = state.prefs.lineSpacing;
    savePrefs();
  });
  document.getElementById('pref-bg')?.addEventListener('change', (e) => {
    const root = document.getElementById('rc-root');
    root.className = root.className.replace(/rc-bg-\w+/, `rc-bg-${e.target.value}`);
    state.prefs.bg = e.target.value;
    savePrefs();
  });
  document.getElementById('pref-voice')?.addEventListener('change', (e) => {
    state.prefs.voiceEnabled = e.target.checked;
    savePrefs();
  });
  document.getElementById('pref-speed')?.addEventListener('change', (e) => {
    state.prefs.voiceSpeed = parseFloat(e.target.value);
    savePrefs();
  });
}

function _showLoading(show) {
  const el = document.getElementById('rc-loading');
  if (el) el.classList.toggle('hidden', !show);
}

function _showError(msg, retryFn) {
  const el = document.getElementById('rc-error');
  if (!el) return;
  el.innerHTML = `<p>${msg}</p>${retryFn ? '<button id="rc-retry" class="btn-secondary">Retry</button>' : ''}`;
  el.classList.remove('hidden');
  document.getElementById('rc-retry')?.addEventListener('click', retryFn);
}

function _hideError() {
  document.getElementById('rc-error')?.classList.add('hidden');
}
