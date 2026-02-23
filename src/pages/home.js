// pages/home.js — Student Home & Subject Hub

import { getProgress } from '../engine/progressStore.js';
import { getSubjectMastery, getCurrentLevel, getWeakTopics, checkBoosterRequired, isWeekend, getRankInfo } from '../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS } from '../engine/questionBank.js';
import { navigate } from '../app.js';
import { audio } from '../engine/audioEngine.js';
import { navigate } from '../app.js';
import { audio } from '../engine/audioEngine.js';
import { getRandomWeekendQuote, getMinuteAwareQuote } from '../engine/quoteBank.js';

export function renderHome() {
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

    // XP level theming
    const levelNames = ['Rookie', 'Explorer', 'Challenger', 'Expert', 'Champion', 'Elite Scholar', 'Ilford Star'];
    const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

    return `
<div class="page page-enter" id="home-page">

  <!-- Hero greeting -->
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
            <div class="profile-name">${greeting}, ${name}!</div>
            <div class="profile-level" style="color:var(--c-accent)">
              ${rank.label} · <span style="color:var(--c-text-muted)">Lv ${Math.floor((progress.xp || 0) / 1000) + 1}</span>
            </div>
          </div>
        </div>
      <div class="streak-display">
        <div>
          <div class="streak-num">🔥 ${streak}</div>
          <div class="streak-label">Day Streak</div>
          <div class="streak-desc">${streak === 0 ? 'Start today!' : streak < 3 ? 'Keep it going!' : streak < 7 ? 'You\'re on fire!' : '🏆 Amazing streak!'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Daily stats -->
  <div class="stats-row" style="margin-top:24px">
    <div class="stat-card">
      <div class="stat-value" style="color:#a78bfa">${todaySessions}</div>
      <div class="stat-label">Sessions Today</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#34d399">${totalSessions}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#f59e0b">${progress.gems || 0} 💎</div>
      <div class="stat-label">Hint Gems</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#67e8f9">${progress.badges?.length || 0}</div>
      <div class="stat-label">Badges Earned</div>
    </div>
  </div>

  <!-- Ilford target banner -->
  <div class="target-banner">
    <div class="target-left">
      <div class="target-school">🎯 Target: Dream School</div>
      <div class="target-desc">GL Assessment · Paper 1: English + VR · Paper 2: Maths + NVR · 55 min each</div>
    </div>
    <div class="target-countdown" id="exam-countdown"></div>
  </div>

  <!-- Subject cards -->
  <!-- Mission Center -->
  ${renderMissionCenter()}

  <!-- Weekend Wisdom -->
  ${renderWeekendWisdom()}

  <h2 class="section-title">Choose Your Subject</h2>
  <div class="subject-grid">
    ${subjects.map(sub => {
        const mastery = getSubjectMastery(sub);
        const level = getCurrentLevel(sub);
        const colors = SUBJECT_COLORS[sub];
        const weakTopics = getWeakTopics(sub);
        const weakLabel = weakTopics.length > 0 ? `⚠️ Focus: ${weakTopics[0].topic}` : '✅ All topics covered';
        return `
      <div class="subject-card" onclick="navigate('quiz','${sub}')"
           style="background: linear-gradient(135deg, ${colors.start}22 0%, ${colors.end}11 100%);
                  border-color: ${colors.start}44">
        <div class="subject-card-glow" style="background: ${colors.start}"></div>
        <div>
          <div class="subject-card-icon">${SUBJECT_ICONS[sub]}</div>
          <div class="subject-card-name">${SUBJECT_LABELS[sub]}</div>
          <div class="subject-card-meta" style="color:${colors.end}">
            ${mastery}% mastery · Level ${level}
          </div>
        </div>
        <div>
          <div class="accuracy-bar" style="margin-top:10px">
            <div class="accuracy-fill" style="width:${mastery}%;background:linear-gradient(90deg,${colors.start},${colors.end})"></div>
          </div>
          <div style="font-size:11px;margin-top:6px;opacity:0.7">${weakLabel}</div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- Recent activity -->
  ${renderRecentActivity(progress)}

  <!-- Daily notification setup -->
  <div class="notif-card" id="notif-card" style="display:none">
    <div>🔔 <strong>Enable Daily Reminders</strong><br>
    <span style="font-size:13px;color:var(--c-text-muted)">Get a daily nudge to keep your streak alive!</span></div>
    <button class="btn btn-primary btn-sm" onclick="requestNotifPermission()">Enable</button>
  </div>

</div>`;
}

function renderRecentActivity(progress) {
    const recent = [...progress.sessions].reverse().slice(0, 5);
    if (recent.length === 0) return '<div class="section-title" style="margin-top:32px">No sessions yet — pick a subject above to start! 🚀</div>';
    const subLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Maths' };
    const subColors = { vr: 'var(--c-vr)', nvr: 'var(--c-nvr)', en: 'var(--c-en)', maths: 'var(--c-maths)' };
    return `
  <h2 class="section-title" style="margin-top:32px">Recent Activity</h2>
  <div class="card" style="padding:0;overflow:hidden">
    ${recent.map(s => {
        const d = new Date(s.date);
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const emoji = s.score >= 80 ? '🌟' : s.score >= 60 ? '📈' : '💪';
        return `<div class="report-row" style="padding:14px 20px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:24px">${emoji}</div>
          <div>
            <div style="font-weight:700;font-size:14px">${subLabels[s.subject] || s.subject}</div>
            <div style="font-size:12px;color:var(--c-text-muted)">${dateStr} · ${timeStr} · ${s.total} Qs</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:900;font-size:17px;color:${subColors[s.subject]}">${s.score}%</div>
          <div style="font-size:12px;color:var(--c-text-muted)">${s.xpGained || 0} XP</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderMissionCenter() {
    const booster = checkBoosterRequired();
    if (!booster) return '';
    const colors = SUBJECT_COLORS[booster.subject];

    return `
  <div class="card mission-card" id="booster-mission" 
       onclick="navigate('quiz', '${booster.subject}')"
       style="background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(6,182,212,0.1));
              border: 2px solid ${colors.start}66; margin-bottom:28px; cursor:pointer;
              animation: missionPulse 2s infinite">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-size:48px">🚀</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--c-accent);margin-bottom:4px">New Booster Unlocked!</div>
        <h3 style="font-family:var(--font-heading);font-size:22px;font-weight:900;margin-bottom:6px">${booster.title}</h3>
        <p style="color:var(--c-text-muted);font-size:14px;line-height:1.5">${booster.desc}</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:900;color:var(--c-success)">+${booster.rewardXP} XP</div>
        <div style="font-size:12px;color:var(--c-text-muted)">Mastery Bonus</div>
      </div>
    </div>
  </div>
  <style>
    @keyframes missionPulse {
      0% { box-shadow: 0 0 0 0 ${colors.start}33; transform: scale(1); }
      50% { box-shadow: 0 0 20px 5px ${colors.start}11; transform: scale(1.01); }
      100% { box-shadow: 0 0 0 0 ${colors.start}33; transform: scale(1); }
    }
  </style>`;
}

function renderWeekendWisdom() {
    if (!isWeekend()) return '';
    const quote = getRandomWeekendQuote();

    return `
  <div class="card wisdom-card" style="margin-bottom:28px; border-left:6px solid #b794f4; background:rgba(183,148,244,0.05)">
    <div style="display:flex; gap:16px; align-items:center">
      <div style="font-size:32px">🕌</div>
      <div style="flex:1">
        <div style="font-size:11px; font-weight:800; color:#b794f4; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px">Weekend Wisdom</div>
        <p style="font-style:italic; font-size:14px; color:var(--c-text); line-height:1.5; margin-bottom:6px">"${quote.text}"</p>
        <div style="font-size:12px; font-weight:700; color:var(--c-text-muted)">— ${quote.source}</div>
      </div>
    </div>
  </div>`;
}

// Add auto-refresh for quotes every minute if on home page
if (!window._quoteInterval) {
    window._quoteInterval = setInterval(() => {
        const quoteEl = document.querySelector('.motivation-quote');
        const homePage = document.getElementById('home-page');
        if (quoteEl && homePage) {
            quoteEl.style.opacity = '0';
            setTimeout(() => {
                quoteEl.textContent = getMinuteAwareQuote();
                quoteEl.style.opacity = '1';
            }, 500);
        }
    }, 60000);
}


