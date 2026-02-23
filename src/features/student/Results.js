
import { SUBJECT_LABELS, SUBJECT_ICONS, SUBJECT_COLORS } from '../../engine/questionBank.js';
import { getWeakTopics } from '../../engine/adaptiveEngine.js';
import { BADGE_DEFINITIONS, getProgress } from '../../engine/progressStore.js';
import { spawnConfetti } from '../../components/confetti.js';
import { audio } from '../../engine/audioEngine.js';

export function renderStudentResults(params, query) {
    // We can pass data through session storage or state if dataStr is too big for URL
    // For now, let's assume we might use a global state or simple session storage
    const resultData = JSON.parse(localStorage.getItem('last_quiz_result') || '{}');
    if (!resultData.session) {
        window.router.navigate('#/student/home');
        return '';
    }

    const { session, answers, timings } = resultData;
    const progress = getProgress();
    const colors = SUBJECT_COLORS[session.subject];
    const score = session.score;
    const scoreColor = score >= 80 ? 'var(--c-success)' : score >= 60 ? 'var(--c-accent)' : 'var(--c-danger)';

    return `
<div class="page page-enter student-results">
  <div class="results-hero">
    <div class="results-score-circle" style="background:conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(240,240,255,0.06) 0deg)">
      <div class="results-score-num">${score}%</div>
    </div>
    <h1>Excellent Effort!</h1>
    <p>+${session.xpGained} XP Earned</p>
  </div>

  <div class="results-actions">
    <button class="btn btn-primary" onclick="window.router.navigate('#/student/quiz/${session.subject}')">Try Again</button>
    <button class="btn btn-outline" onclick="window.router.navigate('#/student/home')">Home</button>
  </div>
</div>`;
}

export function mountStudentResults() {
    const resultData = JSON.parse(localStorage.getItem('last_quiz_result') || '{}');
    if (resultData.session && resultData.session.score >= 80) {
        spawnConfetti();
        audio.play('levelUp');
    }
}
