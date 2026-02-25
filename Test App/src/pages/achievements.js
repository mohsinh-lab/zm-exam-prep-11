// pages/achievements.js — Badges, XP history, and leaderboard

import { BADGE_DEFINITIONS, getProgress } from '../engine/progressStore.js';
import { getRankInfo } from '../engine/adaptiveEngine.js';

export function renderAchievements() {
    const progress = getProgress();
    const earned = new Set(progress.badges || []);
    const xp = progress.xp || 0;
    const rank = getRankInfo(xp);
    const xpIntoLevel = xp % 200;
    const level = Math.floor(xp / 200) + 1;

    return `
<div class="page page-enter">
  <h1 class="page-title">🏅 Achievements</h1>
  <p class="page-subtitle">Collect badges and level up your rank!</p>

  <!-- Level card -->
  <div class="card" style="margin-bottom:28px;background:linear-gradient(135deg,rgba(108,99,255,0.2),rgba(167,139,250,0.08));border-color:rgba(108,99,255,0.4)">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-size:64px">${rank.icon}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text-muted)">Current Rank</div>
        <div style="font-family:var(--font-heading);font-size:28px;font-weight:900">${rank.label}</div>
        <div class="xp-bar-wrap" style="margin-top:10px">
          <div class="xp-bar"><div class="xp-fill" style="width:${(xpIntoLevel / 200) * 100}%"></div></div>
          <span class="xp-label">${xp} XP total · ${200 - xpIntoLevel} XP to Level ${level + 1}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-heading);font-size:36px;font-weight:900;color:var(--c-accent)">${earned.size}</div>
        <div style="font-size:12px;color:var(--c-text-muted)">of ${BADGE_DEFINITIONS.length} badges</div>
      </div>
    </div>
  </div>

  <!-- Badges grid -->
  <div class="badges-grid">
    ${BADGE_DEFINITIONS.map(b => {
        const isEarned = earned.has(b.id);
        return `
      <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.label}</div>
        <div class="badge-desc">${b.desc}</div>
        ${isEarned ? '<div style="margin-top:8px;font-size:11px;font-weight:700;color:var(--c-success)">✅ EARNED</div>'
                : '<div style="margin-top:8px;font-size:11px;color:var(--c-text-dim)">🔒 Keep practising!</div>'}
      </div>`;
    }).join('')}
  </div>

  <!-- XP Road to Dream School -->
  <div class="card" style="margin-top:28px">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:16px">🗺️ Road to Dream School</h3>
    <div style="position:relative;height:10px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-bottom:10px">
      <div style="position:absolute;inset:0 auto 0 0;width:${Math.min((xp / 2000) * 100, 100)}%;background:linear-gradient(90deg,#6C63FF,#10b981);border-radius:99px;transition:width 1s"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--c-text-muted)">
      <span>🌱 Start</span>
      <span>📚 Foundation<br>(400 XP)</span>
      <span>🚀 Expert<br>(1000 XP)</span>
      <span>🏆 Ready!<br>(2000 XP)</span>
    </div>
    <div style="margin-top:14px;font-size:14px;color:var(--c-text-muted)">
      You have <strong style="color:var(--c-text)">${xp} XP</strong>. 
      ${xp < 400 ? '🌱 Keep going — you\'re building the foundation!' :
            xp < 1000 ? '📚 Great progress! You\'re in the core learning phase.' :
                xp < 2000 ? '🚀 Expert territory! Final push to exam-readiness.' :
                    '🏆 Exam ready! You\'ve put in the work — Dream School, here we come!'}
    </div>
  </div>
</div>`;
}

function levelEmoji(level) {
    const emojis = ['🌱', '🌿', '⚡', '🔥', '💫', '🌟', '👑'];
    return emojis[Math.min(level - 1, emojis.length - 1)];
}
