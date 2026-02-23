// pages/results.js — Session Results with Time Analytics & Adaptive Feedback

import { SUBJECT_LABELS, SUBJECT_ICONS, SUBJECT_COLORS } from '../engine/questionBank.js';
import { getWeakTopics } from '../engine/adaptiveEngine.js';
import { BADGE_DEFINITIONS, getProgress } from '../engine/progressStore.js';
import { navigate } from '../app.js';
import { spawnConfetti } from '../components/confetti.js';
import { audio } from '../engine/audioEngine.js';

export function renderResults(dataStr) {
  let session, answers, timings;
  try {
    const parsed = JSON.parse(dataStr);
    session = parsed.session;
    answers = parsed.answers;
    timings = parsed.timings || [];
  } catch {
    navigate('home');
    return '';
  }

  const progress = getProgress();
  const colors = SUBJECT_COLORS[session.subject];
  const score = session.score;
  const scoreColor = score >= 80 ? 'var(--c-success)' : score >= 60 ? 'var(--c-accent)' : 'var(--c-danger)';
  const scoreEmoji = score >= 80 ? '🌟' : score >= 60 ? '📈' : '💪';
  const label = score >= 80 ? 'Excellent!' : score >= 60 ? 'Good effort!' : 'Keep practising!';

  // Time analytics summary
  const avgTime = timings.length ? Math.round(timings.reduce((s, t) => s + t.timeTaken, 0) / timings.length) : 0;
  const guessed = timings.filter(t => t.responseType === 'guessed').length;
  const stuck = timings.filter(t => t.responseType === 'stuck').length;
  const confident = timings.filter(t => t.responseType === 'confident').length;

  // Adaptive recommendation
  let recommendation = '';
  if (guessed >= 3) recommendation = '⚡ You answered several questions very quickly without getting them right. Try reading each question fully before selecting — rushing costs marks!';
  else if (stuck >= 3) recommendation = '🧠 You spent a long time on several hard questions. Practice elimination strategies: cross out clearly wrong options, then choose between the remaining ones.';
  else if (score >= 80 && confident >= 3) recommendation = '🚀 You\'re flying! Ready to tackle harder difficulty questions next session.';
  else if (score >= 60) recommendation = '📚 Solid performance! Focus on the specific topics you got wrong below.';
  else recommendation = '💪 Every Pokémon trainer loses battles before winning! Come back tomorrow and those questions will feel easier.';

  // New badges earned this session
  const allBadgeIds = BADGE_DEFINITIONS.map(b => b.id);
  const earnedBadges = progress.badges || [];
  const newBadges = BADGE_DEFINITIONS.filter(b => earnedBadges.includes(b.id)).slice(-2);

  // Weak topics
  const weakTopics = getWeakTopics(session.subject).slice(0, 3);

  return `
<div class="page page-enter" style="max-width:760px;margin:0 auto">

  <!-- Score hero -->
  <div class="results-hero">
    <div class="results-score-circle"
         style="background:conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg);
                box-shadow: 0 0 40px ${scoreColor}44">
      <div class="results-score-num">${score}</div>
      <div class="results-score-pct">%</div>
    </div>
    <h1 style="font-family:var(--font-heading);font-size:28px;font-weight:900;margin-bottom:6px">
      ${scoreEmoji} ${label}
    </h1>
    <p style="color:var(--c-text-muted)">${session.correct} / ${session.total} correct · +${session.xpGained} XP earned</p>
  </div>

  <!-- Time analytics -->
  <div class="card" style="margin-bottom:20px">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:16px">⏱️ Your Time Analytics</h3>
    <div class="results-grid">
      <div class="stat-card">
        <div class="stat-value" style="color:var(--c-primary-light)">${avgTime}s</div>
        <div class="stat-label">Avg per Question</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#ef4444">${guessed}</div>
        <div class="stat-label">⚡ Rushed Answers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#f59e0b">${stuck}</div>
        <div class="stat-label">🤔 Stuck Questions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#10b981">${confident}</div>
        <div class="stat-label">✅ Confident</div>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:rgba(108,99,255,0.08);border-radius:12px;font-size:14px;line-height:1.6;border-left:4px solid var(--c-primary)">
      ${recommendation}
    </div>
  </div>

  <!-- Weak topics to focus -->
  ${weakTopics.length ? `
  <div class="card" style="margin-bottom:20px;border-color:rgba(245,158,11,0.3)">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:12px">🎯 Focus Areas for Next Time</h3>
    ${weakTopics.map(t => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--c-border)">
        <span style="font-weight:600">${t.topic}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="accuracy-bar" style="width:100px">
            <div class="accuracy-fill" style="width:${t.mastery}%;background:var(--c-danger)"></div>
          </div>
          <span style="font-size:13px;font-weight:700;color:var(--c-danger)">${t.mastery}%</span>
        </div>
      </div>`).join('')}
  </div>` : ''}

  <!-- Question review -->
  <div class="card" style="margin-bottom:20px">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:16px">📋 Question Review</h3>
    ${answers.map((a, i) => {
    const q = a.question;
    const timing = timings[i] || {};
    const typeIcon = { guessed: '⚡', stuck: '🤔', confident: '✅', struggled: '📈', normal: '⏱' }[timing.responseType] || '⏱';
    return `
      <div class="review-item ${a.isCorrect ? 'correct-item' : 'wrong-item'}" style="margin-bottom:10px">
        <div class="review-icon">${a.isCorrect ? '✅' : '❌'}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${q.type}</div>
          <div style="font-size:13px;color:var(--c-text-muted);white-space:pre-line;line-height:1.5">${q.question.slice(0, 120)}${q.question.length > 120 ? '…' : ''}</div>
          ${!a.isCorrect ? `<div style="font-size:12px;color:var(--c-success);margin-top:4px">✓ Correct: ${q.options[q.answer]}</div>` : ''}
          <div style="font-size:11px;color:var(--c-text-dim);margin-top:4px">${typeIcon} ${Math.round(timing.timeTaken || 0)}s · ${timing.responseType || ''}</div>
        </div>
      </div>`;
  }).join('')}
  </div>

  <!-- Actions -->
  <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:40px">
    <button class="btn btn-primary btn-lg" onclick="navigate('quiz','${session.subject}')">
      🔄 Practice Again
    </button>
    <button class="btn btn-outline" onclick="navigate('home')">🏠 Home</button>
    <button class="btn btn-outline" onclick="navigate('achievements')">🏅 Badges</button>
  </div>

</div>
${newBadges.length ? renderBadgePopup(newBadges[newBadges.length - 1]) : ''}
`;
}

export function mountResults(score, badgeEarned) {
  // Initialise audio if not already
  audio.init();

  if (badgeEarned) {
    audio.play('badge');
  } else if (score >= 80) {
    audio.play('levelUp');
  }

  if (score >= 80 && typeof spawnConfetti === "function") {
    spawnConfetti();
  }

  // Auto-close badge popup
  const popup = document.getElementById('badge-popup');
  if (popup) setTimeout(() => popup.style.display = 'none', 4000);
}

function renderBadgePopup(badge) {
  return `
  <div class="badge-overlay" id="badge-popup" onclick="this.style.display='none'">
    <div class="badge-pop">
      <div class="badge-pop-icon">${badge.icon}</div>
      <h2>Badge Unlocked!</h2>
      <p><strong>${badge.label}</strong><br>${badge.desc}</p>
      <button class="btn btn-primary" onclick="document.getElementById('badge-popup').style.display='none'">
        Awesome! 🎉
      </button>
    </div>
  </div>`;
}
