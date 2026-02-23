
import { getProgress } from '../../engine/progressStore.js';
import { getSubjectMastery, getCurrentLevel, getWeakTopics, checkBoosterRequired, isWeekend, getRankInfo } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS } from '../../engine/questionBank.js';
import { getRandomWeekendQuote, getMinuteAwareQuote } from '../../engine/quoteBank.js';

export function renderStudentHome() {
    const progress = getProgress();
    const name = progress.studentName || 'Student';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const subjects = Object.values(SUBJECTS);
    const totalSessions = progress.sessions.length;
    const todaySessions = progress.sessions.filter(s =>
        new Date(s.date).toDateString() === new Date().toDateString()
    ).length;
    const streak = progress.streak || 0;

    const rank = getRankInfo(progress.xp || 0);
    const xp = progress.xp || 0;
    const level = Math.floor(xp / 200) + 1;
    const xpToNext = 200 - (xp % 200);

    const motivation = getMinuteAwareQuote();

    const levelNames = ['Rookie', 'Explorer', 'Challenger', 'Expert', 'Champion', 'Elite Scholar', 'Ilford Star'];
    const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

    return `
<div class="page page-enter student-home" id="student-home">
  <div class="home-hero">
    <div class="hero-left">
      <div class="greeting-small">👋 ${greeting}</div>
      <h1 class="page-title">${name}!</h1>
      <div class="level-badge">
        <span class="level-icon">⚡</span>
        <span>Level ${level} — <strong>${levelName}</strong></span>
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar">
          <div class="xp-fill" style="width:${((xp % 200) / 200) * 100}%"></div>
        </div>
        <span class="xp-label">${xp} XP · ${xpToNext} to next level</span>
      </div>
      <p class="motivation-quote">${motivation}</p>
    </div>
    <div class="hero-right">
       <div class="profile-main">
          <div class="profile-avatar">${rank.icon}</div>
          <div class="profile-details">
            <div class="profile-name">${name}</div>
            <div class="profile-level" style="color:var(--c-accent)">${rank.label}</div>
          </div>
        </div>
      <div class="streak-display">
        <div class="streak-num">🔥 ${streak}</div>
        <div class="streak-label">Day Streak</div>
      </div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value" style="color:#a78bfa">${todaySessions}</div>
      <div class="stat-label">Today</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#f59e0b">${progress.gems || 0} 💎</div>
      <div class="stat-label">Gems</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#67e8f9">${progress.badges?.length || 0}</div>
      <div class="stat-label">Badges</div>
    </div>
  </div>

  ${renderMissionCenter()}

  <h2 class="section-title">Start Practice</h2>
  <div class="subject-grid">
    ${subjects.map(sub => {
        const mastery = getSubjectMastery(sub);
        const colors = SUBJECT_COLORS[sub];
        return `
      <div class="subject-card" onclick="window.router.navigate('#/student/quiz/${sub}')"
           style="background: linear-gradient(135deg, ${colors.start}22, ${colors.end}11); border-color: ${colors.start}44">
        <div class="subject-card-icon">${SUBJECT_ICONS[sub]}</div>
        <div class="subject-card-name">${SUBJECT_LABELS[sub]}</div>
        <div class="accuracy-bar"><div class="accuracy-fill" style="width:${mastery}%; background:${colors.start}"></div></div>
      </div>`;
    }).join('')}
  </div>

  <h2 class="section-title" style="margin-top:32px">Recent Activity</h2>
  ${renderRecentActivity(progress)}
</div>`;
}

function renderRecentActivity(progress) {
    const recent = [...progress.sessions].reverse().slice(0, 3);
    if (!recent.length) return '<p>No sessions yet.</p>';
    return `<div class="card">${recent.map(s => `
    <div class="report-row">
      <span>${SUBJECT_LABELS[s.subject]}</span>
      <strong>${s.score}%</strong>
    </div>`).join('')}</div>`;
}

function renderMissionCenter() {
    const booster = checkBoosterRequired();
    if (!booster) return '';
    const colors = SUBJECT_COLORS[booster.subject];
    return `
    <div class="card mission-card" onclick="window.router.navigate('#/student/quiz/${booster.subject}')"
         style="border: 2px solid ${colors.start}">
      <h3>🚀 Mission: ${booster.title}</h3>
      <p>${booster.desc}</p>
    </div>`;
}
