// pages/quiz.js — Full Quiz Engine with Time Tracking & Focus Analytics

import { getProgress, recordSession, useHint } from '../engine/progressStore.js';
import { getSessionQuestions, recordAnswer } from '../engine/adaptiveEngine.js';
import { SUBJECT_LABELS, SUBJECT_ICONS, SUBJECT_COLORS } from '../engine/questionBank.js';
import { navigate } from '../app.js';
import { audio } from '../engine/audioEngine.js';

let state = null;

export function renderQuiz(subject) {
  const questions = getSessionQuestions(subject, 10);
  if (!questions.length) {
    navigate('home');
    return '';
  }

  state = {
    subject, questions,
    current: 0,
    selected: null,
    answered: false,
    hintShown: false,
    answers: [],
    sessionStart: Date.now(),
    // Time tracking
    questionStartTime: Date.now(),
    questionReadTime: null,   // time until first interaction
    timings: [],              // per-question timing data
    focusWarnings: 0,
  };

  return buildQuizHTML(state);
}

function buildQuizHTML(s) {
  const q = s.questions[s.current];
  const colors = SUBJECT_COLORS[s.subject];
  const progress = ((s.current) / s.questions.length) * 100;
  const TIMER_SECONDS = 90;

  return `
<div id="quiz-page" style="min-height:100dvh;background:var(--c-bg);padding-top:var(--nav-height)">

  <!-- Quiz Header -->
  <div class="quiz-header">
    <button onclick="navigate('home')" class="btn-outline btn btn-sm" style="flex-shrink:0">✕ Quit</button>
    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" id="q-prog-fill" style="width:${progress}%"></div>
    </div>
    <div class="quiz-counter">${s.current + 1} / ${s.questions.length}</div>
    <div class="quiz-timer-circle" id="timer-wrap">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="5"/>
        <circle id="timer-arc" cx="32" cy="32" r="28" fill="none"
          stroke="${colors.start}" stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray="${2 * Math.PI * 28}"
          stroke-dashoffset="0"/>
      </svg>
      <div class="quiz-timer-text" id="timer-text">${TIMER_SECONDS}</div>
    </div>
  </div>

  <!-- Question body -->
  <div class="quiz-body" id="quiz-body">
    ${renderQuestion(q, s, colors)}
  </div>

  <!-- Study Buddy Bubble -->
  <div id="buddy-container" class="buddy-container">
    <div class="buddy-bubble" id="buddy-bubble">
      ${getInitialBuddySpeech(s.subject)}
    </div>
    <div class="buddy-sprite-wrap">
      <div class="buddy-name-tag">${getBuddyName(s.subject)}</div>
      <div class="buddy-sprite" id="buddy-sprite">${getBuddyEmoji(s.subject)}</div>
    </div>
  </div>

  <!-- Focus tracker (invisible) -->
  <div id="focus-overlay" style="display:none"></div>

</div>

<script>
(function(){
  // ── Timer ──────────────────────────────────────────────────────────
  const SECS = 90;
  let timeLeft = SECS, timerInterval;
  const arc    = document.getElementById('timer-arc');
  const txt    = document.getElementById('timer-text');
  const circ   = 2 * Math.PI * 28;
  let _questionOpenTime = Date.now();

  window._quizRecordReadTime = function() {
    // Called on first option hover — tracks reading time
    if (!window._readTimeRecorded) {
      window._readTimeRecorded = true;
      window._readMs = Date.now() - _questionOpenTime;
    }
  };

  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = SECS;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (txt) txt.textContent = timeLeft;
      const offset = circ * (1 - timeLeft / SECS);
      if (arc) arc.style.strokeDashoffset = offset;
      if (timeLeft <= 10 && arc) arc.style.stroke = '#ef4444';
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!window._quizAnswered) window._autoSubmit();
      }
    }, 1000);
  }

  window._autoSubmit = function() {
    // Time ran out — treat as wrong, move on
    window._recordQuizAnswer(null, false);
  };

  window._quizTimerStart = startTimer;

  // ── Visibility / Focus tracking ────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window._focusLostTime = Date.now();
    } else if (window._focusLostTime) {
      const away = Date.now() - window._focusLostTime;
      if (away > 5000) {
        window._focusWarnings = (window._focusWarnings || 0) + 1;
        showFocusAlert();
      }
    }
  });

  function showFocusAlert() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;
    overlay.innerHTML = '<div class="focus-alert">👀 Welcome back! Stay focused — the exam won\'t wait! 💪</div>';
    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.display = 'none'; }, 3000);
  }

  startTimer();
})();
<\/script>`;
}

function renderQuestion(q, s, colors) {
  const passage = q.passage
    ? `<div class="quiz-passage"><strong>📖 Read carefully:</strong><br><br>${q.passage}</div>` : '';

  const opts = q.options.map((opt, i) => `
    <button class="quiz-option" id="opt-${i}"
      onmouseenter="window._quizRecordReadTime && window._quizRecordReadTime()"
      onclick="window._selectOption && window._selectOption(${i})">
      <span class="option-letter">${String.fromCharCode(65 + i)}</span>
      <span>${opt}</span>
    </button>`).join('');

  return `
    <div class="quiz-type-badge" style="border-color:${colors.start}44;color:${colors.end}">
      ${SUBJECT_ICONS[s.subject]} ${q.type}
    </div>
    ${passage}
    <div class="quiz-question">${q.question}</div>
    <div class="quiz-options" id="options-wrap">${opts}</div>
    <div id="quiz-feedback"></div>
    <div class="quiz-actions">
      <button class="hint-btn" id="hint-btn" onclick="window._showHint && window._showHint()">
        💎 Use Hint (${getProgress().gems || 0} left)
      </button>
      <button id="next-btn" class="btn btn-primary" style="display:none"
        onclick="window._nextQuestion && window._nextQuestion()">
        ${s.current + 1 < s.questions.length ? 'Next Question →' : 'See Results 🏁'}
      </button>
    </div>
  `;
}

// ── Wire up quiz interactivity after render ───────────────────────────────
export function mountQuizHandlers(subject) {
  if (!state) return;
  window._quizAnswered = false;
  window._readTimeRecorded = false;
  window._focusWarnings = 0;
  window._questionStart = Date.now();

  window._quizTimerStart = startTimer;
  window._streak = 0;

  if (window._quizTimerStart) window._quizTimerStart();
  audio.init(); // Initialize audio context on first user interaction 

  window._selectOption = function (index) {
    if (state.answered) return;
    state.selected = index;

    // Highlight selected
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      el.classList.toggle('selected', i === index);
    });

    audio.play('click');

    // Auto-submit after short delay for feel
    setTimeout(() => window._submitAnswer(), 400);
  };

  window._submitAnswer = function () {
    if (state.answered || state.selected === null) return;
    state.answered = true;
    window._quizAnswered = true;

    const q = state.questions[state.current];
    const isCorrect = state.selected === q.answer;
    const timeTaken = (Date.now() - window._questionStart) / 1000;
    const readMs = window._readMs || timeTaken * 400;

    // Time analytics — classify response
    let responseType = 'normal';
    if (timeTaken < 5 && !isCorrect) responseType = 'guessed';        // fast + wrong = guessing
    else if (timeTaken > 60 && !isCorrect) responseType = 'stuck';    // slow + wrong = concept gap
    else if (timeTaken < 8 && isCorrect) responseType = 'confident';  // fast + right = knows it
    else if (timeTaken > 45 && isCorrect) responseType = 'struggled'; // slow + right = needs practice

    // Record timing
    state.timings.push({ qId: q.id, timeTaken, readMs, responseType, isCorrect });

    // Record in engine
    recordAnswer(q, isCorrect);

    // Store answer for results
    state.answers.push({ question: q, isCorrect, selected: state.selected, timeTaken, responseType });

    if (isCorrect) {
      window._streak++;
      audio.play('correct');
    } else {
      window._streak = 0;
      audio.play('wrong');
    }

    updateBuddyFeedback(isCorrect, window._streak, responseType);

    // UI feedback
    const opts = document.querySelectorAll('.quiz-option');
    opts.forEach((el, i) => {
      el.classList.add('disabled');
      if (i === q.answer) el.classList.add('correct');
      else if (i === state.selected && !isCorrect) el.classList.add('wrong');
    });

    const feedbackEl = document.getElementById('quiz-feedback');
    if (feedbackEl) {
      const emoji = isCorrect ? '🌟' : '💡';
      const label = isCorrect ? 'Correct!' : 'Not quite...';
      const typeMsg = {
        guessed: '⚡ That was fast! Make sure to read the question carefully.',
        stuck: '🧠 Take your time — re-read the question and try to eliminate wrong options.',
        confident: '💪 Brilliant! You knew that one.',
        struggled: '📈 Well done for working through it — practice will make this quicker!',
        normal: '',
      }[responseType];

      feedbackEl.innerHTML = `
        <div class="quiz-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}">
          <strong>${emoji} ${label}</strong>
          ${typeMsg ? `<div class="hint-text">${typeMsg}</div>` : ''}
          <div class="hint-text"><strong>Explanation:</strong> ${q.explanation}</div>
        </div>`;
    }

    document.getElementById('hint-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'flex';
  };

  window._showHint = function () {
    const q = state.questions[state.current];
    if (!q.hint) return;
    if (!useHint(q.id)) {
      alert('No hint gems left! Earn more by completing sessions. 💎');
      return;
    }
    const fb = document.getElementById('quiz-feedback');
    if (fb) {
      fb.innerHTML = `<div class="quiz-feedback" style="background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.3)">
        💎 <strong>Hint:</strong> ${q.hint}
      </div>`;
    }
    document.getElementById('hint-btn').style.display = 'none';
  };

  window._nextQuestion = function () {
    state.current++;
    state.answered = false;
    state.selected = null;
    state.hintShown = false;
    window._quizAnswered = false;
    window._readTimeRecorded = false;
    window._readMs = null;
    window._questionStart = Date.now();

    if (state.current >= state.questions.length) {
      // Finish session
      const timeTaken = (Date.now() - state.sessionStart) / 1000;
      const session = recordSession(
        state.subject, state.questions, state.answers, timeTaken
      );
      navigate('results', JSON.stringify({ session, answers: state.answers, timings: state.timings }));
      return;
    }

    // Re-render question area
    const q = state.questions[state.current];
    const colors = SUBJECT_COLORS[state.subject];
    const prog = (state.current / state.questions.length) * 100;

    document.getElementById('q-prog-fill').style.width = prog + '%';
    document.querySelector('.quiz-counter').textContent = `${state.current + 1} / ${state.questions.length}`;
    document.getElementById('quiz-body').innerHTML = renderQuestion(q, state, colors);

    // Reset timer arc
    const arc = document.getElementById('timer-arc');
    if (arc) { arc.style.stroke = colors.start; arc.style.strokeDashoffset = '0'; }

    mountQuizHandlers(state.subject);
  };
}

function getBuddyEmoji(subject) {
  const characters = { vr: '⚡🐿️', nvr: '🟦🤖', en: '📖🦉', maths: '🔢🧠' };
  return characters[subject] || '🎓';
}

function getBuddyName(subject) {
  const names = { vr: 'Pika-Pal', nvr: 'Prime-Bot', en: 'Wise-Owl', maths: 'Turbo-Master' };
  return names[subject] || 'Professor';
}

function getInitialBuddySpeech(subject) {
  const speeches = {
    vr: "I choose you! Word power, transform!",
    nvr: "Transform your thinking! Watch these patterns roll out.",
    en: "Reading is a superpower. Let's find the legendary clues!",
    maths: "Gotta calculate fast! Logic speed, engage!"
  };
  return speeches[subject] || "Ready for another challenge?";
}

function updateBuddyFeedback(isCorrect, streak, responseType) {
  const bubble = document.getElementById('buddy-bubble');
  const sprite = document.getElementById('buddy-sprite');
  if (!bubble || !sprite) return;

  const name = getBuddyName(state.subject);

  let text = '';
  if (isCorrect) {
    sprite.classList.add('buddy-happy');
    if (streak >= 3) text = `🔥 ${streak} STREAK! Evolution complete!`;
    else if (responseType === 'confident') text = "Megatron couldn't stop you! Perfect.";
    else text = "Excellent! Direct hit!";
  } else {
    sprite.classList.add('buddy-sad');
    if (responseType === 'guessed') text = "Wait! Don't rush like a wild Pokémon. Focus!";
    else text = `Don't worry! Even Prime had to rebuild. Let's try again.`;
  }

  bubble.textContent = text;
  setTimeout(() => {
    sprite.classList.remove('buddy-happy', 'buddy-sad');
  }, 1000);
}
