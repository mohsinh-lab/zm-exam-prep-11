
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
        focusWarnings: 0,
    };

    return buildQuizHTML(state);
}

function buildQuizHTML(s) {
    const q = s.questions[s.current];
    const colors = SUBJECT_COLORS[s.subject];
    const progress = ((s.current) / s.questions.length) * 100;

    return `
<div id="quiz-page" style="min-height:100dvh;background:var(--c-bg);padding-top:var(--nav-height)">
  <div class="quiz-header">
    <button onclick="window.router.navigate('#/student/home')" class="btn-outline btn btn-sm">✕ Quit</button>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" id="q-prog-fill" style="width:${progress}%"></div></div>
    <div class="quiz-timer-circle" id="timer-wrap">
      <div class="quiz-timer-text" id="timer-text">90</div>
    </div>
  </div>

  <div class="quiz-body" id="quiz-body">
    ${renderQuestion(q, s, colors)}
  </div>

  <div id="buddy-container" class="buddy-container">
    <div class="buddy-bubble" id="buddy-bubble">Ready? Let's go!</div>
    <div class="buddy-sprite" id="buddy-sprite">🐿️</div>
  </div>
</div>`;
}

function renderQuestion(q, s, colors) {
    return `
    <div class="quiz-question">${q.question}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" onclick="window._selectOption(${i})">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
        </button>`).join('')}
    </div>
    <div id="quiz-feedback"></div>
    <div class="quiz-actions">
      <button id="next-btn" class="btn btn-primary" style="display:none" onclick="window._nextQuestion()">Next Question →</button>
    </div>
  `;
}

export function mountStudentQuiz() {
    if (!state) return;

    const updateTimerUI = (timeLeft) => {
        const txt = document.getElementById('timer-text');
        if (txt) txt.textContent = timeLeft;
        if (timeLeft <= 10) {
            const wrap = document.getElementById('timer-wrap');
            if (wrap) wrap.style.color = '#ef4444';
        }
    };

    const onTimeUp = () => {
        if (!state.answered) window._submitAnswer(null);
    };

    quizTimer = new Timer(90, updateTimerUI, onTimeUp);
    quizTimer.start();

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

        // UI feedback
        const opts = document.querySelectorAll('.quiz-option');
        opts.forEach((el, i) => {
            el.classList.add('disabled');
            if (i === q.answer) el.classList.add('correct');
            else if (i === index && !isCorrect) el.classList.add('wrong');
        });

        state.answers.push({ qId: q.id, isCorrect, index });
        document.getElementById('next-btn').style.display = 'block';

        const bubble = document.getElementById('buddy-bubble');
        if (bubble) bubble.textContent = isCorrect ? '🌟 Brilliant!' : '💡 Keep going!';
    };

    window._nextQuestion = () => {
        state.current++;
        if (state.current >= state.questions.length) {
            const timeTaken = (Date.now() - state.sessionStart) / 1000;
            const session = recordSession(state.subject, state.questions, state.answers, timeTaken);
            localStorage.setItem('last_quiz_result', JSON.stringify({ session, answers: state.answers, timings: state.timings }));
            window.router.navigate('#/student/results');
            return;
        }
        state.answered = false;
        state.selected = null;

        const q = state.questions[state.current];
        const colors = SUBJECT_COLORS[state.subject];
        document.getElementById('quiz-body').innerHTML = renderQuestion(q, state, colors);
        document.getElementById('q-prog-fill').style.width = ((state.current) / state.questions.length) * 100 + '%';

        quizTimer.start();
    };
}
