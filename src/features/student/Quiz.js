
import { getProgress, recordSession, useHint } from '../../engine/progressStore.js';
import { getSessionQuestions, recordAnswer, getRankInfo } from '../../engine/adaptiveEngine.js';
import { SUBJECT_LABELS, SUBJECT_ICONS, SUBJECT_COLORS } from '../../engine/questionBank.js';
import { audio } from '../../engine/audioEngine.js';
import { Timer } from '../../shared/utils/Timer.js';

let state = null;
let quizTimer = null;

export function renderStudentQuiz(params) {
  const subject = params.subject;
  const questions = getSessionQuestions(subject, 10);
  if (!questions.length) {
    window.router.navigate('#/student/home');
    return '';
  }

  state = {
    subject, questions,
    current: 0,
    selected: null,
    answered: false,
    answers: [],
    sessionStart: Date.now(),
    timings: [],
    questionStart: Date.now(),
    focusWarnings: 0,
  };

  return buildQuizHTML(state);
}

function buildQuizHTML(s) {
  const q = s.questions[s.current];
  const colors = SUBJECT_COLORS[s.subject];
  const progress = ((s.current) / s.questions.length) * 100;
  const TIMER_SECONDS = 90;
  const circ = 2 * Math.PI * 28;

  return `
<div id="quiz-page" style="min-height:100dvh;background:var(--c-bg);padding-top:var(--nav-height)">
  <div class="quiz-header">
    <button onclick="window.router.navigate('#/student/home')" class="btn-outline btn btn-sm">✕ Quit</button>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" id="q-prog-fill" style="width:${progress}%"></div></div>
    <div class="quiz-counter">${s.current + 1} / ${s.questions.length}</div>
    <div class="quiz-timer-circle" id="timer-wrap">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="5"/>
        <circle id="timer-arc" cx="32" cy="32" r="28" fill="none"
          stroke="${colors.start}" stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray="${circ}"
          stroke-dashoffset="0"/>
      </svg>
      <div class="quiz-timer-text" id="timer-text">${TIMER_SECONDS}</div>
    </div>
  </div>

  <div class="quiz-body" id="quiz-body">
    ${renderQuestion(q, s, colors)}
  </div>

  <div id="buddy-container" class="buddy-container">
    <div class="buddy-bubble" id="buddy-bubble">${getBuddySpeech(s.subject)}</div>
    <div class="buddy-sprite-wrap">
      <div class="buddy-name-tag">${getBuddyName(s.subject)}</div>
      <div class="buddy-sprite" id="buddy-sprite">${getBuddyEmoji(s.subject)}</div>
    </div>
  </div>
</div>`;
}

function renderQuestion(q, s, colors) {
  const passage = q.passage
    ? `<div class="quiz-passage"><strong>📖 Read carefully:</strong><br><br>${q.passage}</div>` : '';

  const opts = q.options.map((opt, i) => `
      <button class="quiz-option" id="opt-${i}"
        onclick="window._selectOption && window._selectOption(${i})">
        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
        <span>${opt}</span>
      </button>`).join('');

  const progress = getProgress();
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
        💎 Use Hint (${progress.gems || 0} left)
      </button>
      <button id="next-btn" class="btn btn-primary" style="display:none"
        onclick="window._nextQuestion && window._nextQuestion()">
        ${s.current + 1 < s.questions.length ? 'Next Question →' : 'See Results 🏁'}
      </button>
    </div>
  `;
}

export function mountStudentQuiz() {
  if (!state) return;

  let currentStreak = 0;
  const SECS = 90;
  const circ = 2 * Math.PI * 28;

  // Reset question timer
  state.questionStart = Date.now();

  // Timer setup
  const arc = document.getElementById('timer-arc');
  const updateTimerUI = (timeLeft) => {
    const txt = document.getElementById('timer-text');
    if (txt) txt.textContent = timeLeft;
    if (arc) {
      const offset = circ * (1 - timeLeft / SECS);
      arc.style.strokeDashoffset = offset;
      if (timeLeft <= 10) arc.style.stroke = '#ef4444';
    }
  };

  const onTimeUp = () => {
    if (!state.answered) window._autoTimeUp();
  };

  quizTimer = new Timer(SECS, updateTimerUI, onTimeUp);
  quizTimer.start();

  // Auto time-up handler (separate so _submitAnswer guard isn't triggered)
  window._autoTimeUp = () => {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.current];
    const timeTaken = (Date.now() - state.questionStart) / 1000;
    state.answers.push({ qId: q.id, isCorrect: false, index: null });
    recordAnswer(q, false);

    const opts = document.querySelectorAll('.quiz-option');
    opts.forEach((el, i) => {
      el.classList.add('disabled');
      if (i === q.answer) el.classList.add('correct');
    });

    const feedbackEl = document.getElementById('quiz-feedback');
    if (feedbackEl) {
      feedbackEl.innerHTML = `
              <div class="quiz-feedback wrong-fb">
                <strong>⏰ Time's up!</strong>
                <div class="hint-text"><strong>Correct answer:</strong> ${q.options[q.answer]}</div>
                <div class="hint-text"><strong>Explanation:</strong> ${q.explanation || ''}</div>
              </div>`;
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'flex';

    const bubble = document.getElementById('buddy-bubble');
    if (bubble) bubble.textContent = '⏰ Time ran out! Let\'s keep going!';
    currentStreak = 0;
  };

  window._selectOption = (index) => {
    if (state.answered) return;
    state.selected = index;
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      el.classList.toggle('selected', i === index);
    });
    setTimeout(() => window._submitAnswer(index), 300);
  };

  window._submitAnswer = (index) => {
    if (state.answered) return;
    state.answered = true;
    quizTimer.stop();

    const q = state.questions[state.current];
    const isCorrect = index === q.answer;
    const timeTaken = (Date.now() - state.questionStart) / 1000;

    // Classify response
    let responseType = 'normal';
    if (timeTaken < 5 && !isCorrect) responseType = 'guessed';
    else if (timeTaken > 60 && !isCorrect) responseType = 'stuck';
    else if (timeTaken < 8 && isCorrect) responseType = 'confident';
    else if (timeTaken > 45 && isCorrect) responseType = 'struggled';

    state.answers.push({ qId: q.id, isCorrect, index });
    state.timings.push({ qId: q.id, timeTaken, responseType, isCorrect });

    recordAnswer(q, isCorrect);

    // UI feedback
    const opts = document.querySelectorAll('.quiz-option');
    opts.forEach((el, i) => {
      el.classList.add('disabled');
      if (i === q.answer) el.classList.add('correct');
      else if (i === index && !isCorrect) el.classList.add('wrong');
    });

    if (isCorrect) currentStreak++;
    else currentStreak = 0;

    const feedbackEl = document.getElementById('quiz-feedback');
    if (feedbackEl) {
      const emoji = isCorrect ? '🌟' : '💡';
      const label = isCorrect ? 'Correct!' : 'Not quite...';
      const typeMsg = {
        guessed: '⚡ That was fast! Make sure to read the question carefully.',
        stuck: '🧠 Take your time — re-read and eliminate wrong options.',
        confident: '💪 Brilliant! You knew that one.',
        struggled: '📈 Well done for working through it!',
        normal: '',
      }[responseType];

      feedbackEl.innerHTML = `
              <div class="quiz-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}">
                <strong>${emoji} ${label}</strong>
                ${typeMsg ? `<div class="hint-text">${typeMsg}</div>` : ''}
                <div class="hint-text"><strong>Explanation:</strong> ${q.explanation || 'See next question.'}</div>
              </div>`;
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'flex';

    // Buddy feedback
    const bubble = document.getElementById('buddy-bubble');
    if (bubble) {
      if (isCorrect) {
        bubble.textContent = currentStreak >= 3
          ? `🔥 ${currentStreak} STREAK! You're unstoppable!`
          : '🌟 Brilliant! Direct hit!';
      } else {
        bubble.textContent = responseType === 'guessed'
          ? "Don't rush! Read carefully."
          : "Don't worry — let's try the next one!";
      }
    }
  };

  window._showHint = () => {
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
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
  };

  window._nextQuestion = () => {
    state.current++;

    if (state.current >= state.questions.length) {
      const timeTaken = (Date.now() - state.sessionStart) / 1000;
      const session = recordSession(state.subject, state.questions, state.answers, timeTaken);
      localStorage.setItem('last_quiz_result', JSON.stringify({
        session,
        answers: state.answers,
        timings: state.timings
      }));
      window.router.navigate('#/student/results');
      return;
    }

    state.answered = false;
    state.selected = null;
    state.questionStart = Date.now();

    const q = state.questions[state.current];
    const colors = SUBJECT_COLORS[state.subject];
    document.getElementById('quiz-body').innerHTML = renderQuestion(q, state, colors);
    document.getElementById('q-prog-fill').style.width = ((state.current) / state.questions.length) * 100 + '%';

    const counter = document.querySelector('.quiz-counter');
    if (counter) counter.textContent = `${state.current + 1} / ${state.questions.length}`;

    // Reset timer arc
    const arcEl = document.getElementById('timer-arc');
    if (arcEl) { arcEl.style.stroke = colors.start; arcEl.style.strokeDashoffset = '0'; }

    // Restart timer
    quizTimer = new Timer(SECS, updateTimerUI, onTimeUp);
    quizTimer.start();
  };
}

function getBuddyEmoji(subject) {
  const map = { vr: '⚡🐿️', nvr: '🟦🤖', en: '📖🦉', maths: '🔢🧠' };
  return map[subject] || '🎓';
}

function getBuddyName(subject) {
  const map = { vr: 'Pika-Pal', nvr: 'Prime-Bot', en: 'Wise-Owl', maths: 'Turbo-Master' };
  return map[subject] || 'Professor';
}

function getBuddySpeech(subject) {
  const map = {
    vr: "I choose you! Word power, transform!",
    nvr: "Transform your thinking! Watch these patterns.",
    en: "Reading is a superpower — let's find the clues!",
    maths: "Gotta calculate fast! Logic speed, engage!"
  };
  return map[subject] || "Ready for another challenge?";
}
