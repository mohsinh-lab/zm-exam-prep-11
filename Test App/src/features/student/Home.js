
import { getProgress } from '../../engine/progressStore.js';
import { getSubjectMastery, getCurrentLevel, getWeakTopics, checkBoosterRequired, isWeekend, getRankInfo } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS } from '../../engine/questionBank.js';
import { getRandomWeekendQuote, getMinuteAwareQuote } from '../../engine/quoteBank.js';
import { calculateReadiness } from '../../engine/readinessEngine.js';
import { getReadinessNudge } from '../../engine/notificationEngine.js';

export function renderStudentHome() {
  const progress = getProgress();
  const name = progress.studentName || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const subjects = Object.values(SUBJECTS);
  const todaySessions = progress.sessions.filter(s =>
    new Date(s.date).toDateString() === new Date().toDateString()
  ).length;
  const streak = progress.streak || 0;

  const rank = getRankInfo(progress.xp || 0);
  const xp = progress.xp || 0;
  const level = Math.floor(xp / 200) + 1;
  const xpToNext = 200 - (xp % 200);
  const xpPercent = ((xp % 200) / 200) * 100;

  const motivation = getMinuteAwareQuote();
  const readiness = calculateReadiness(progress);
  const nudge = getReadinessNudge(progress);

  const levelNames = ['Rookie', 'Explorer', 'Challenger', 'Expert', 'Champion', 'Elite Scholar', 'Ilford Star'];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

  // Gating Logic
  let hasParent = false;
  let userEmail = '';
  try {
    const userData = JSON.parse(localStorage.getItem('aceprep_user') || '{}');
    hasParent = userData.hasParent;
    userEmail = userData.email || '';
  } catch (e) { }

  const isVerified = hasParent || userEmail === 'zayyanmohsin16@gmail.com';

  if (!isVerified) {
    return `
      <div class="page page-enter student-verification-gate" data-testid="student-gated-container" style="min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #f8fafc;">
          <div class="card" style="max-width: 480px; width: 100%; background: white; border-radius: 32px; padding: 48px 40px; text-align: center; box-shadow: var(--shadow-xl); border: 2px solid #e2e8f0;">
              <div style="font-size: 64px; margin-bottom: 24px;">🛡️</div>
              <h1 style="font-family: var(--font-heading); font-weight: 900; font-size: 32px; color: #0f172a; margin-bottom: 12px;">Parent Approval Needed</h1>
              <p style="color: #475569; font-weight: 600; line-height: 1.6; margin-bottom: 32px;">Great to have you here, ${name}! To keep your progress safe and synced, please ask a Parent or Guardian to link your account.</p>
              
              <div style="background: #f1f5f9; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 32px; text-align: left;">
                  <label style="display: block; font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase;">Step 1: Enter Parent Email</label>
                  <input type="email" id="link-parent-email" class="input-field" style="background: white; border-width: 2px;" placeholder="parent@gmail.com">
              </div>

              <button class="btn btn-primary" data-testid="student-send-approval-btn" style="width: 100%; border-bottom: 4px solid rgba(0,0,0,0.2);" onclick="window._sendApprovalRequest()">📩 SEND APPROVAL LINK</button>
              
              <button class="btn btn-outline" style="margin-top: 24px; border: none; color: #94a3b8; font-size: 13px;" onclick="window._handleAuthLogout()">🚪 Logout & Try Another Account</button>
          </div>
      </div>
      `;
  }

  return `
<div class="page page-enter student-home" id="student-home" style="color: var(--c-text)">

  <!-- PWA Helper for iPad -->
  <div id="pwa-helper" style="display:none; background: var(--c-accent); color: #000; padding: 14px; border-radius: 18px; margin-bottom: 24px; font-size: 14px; font-weight: 800; text-align: center; border: 3px solid #000;">
    📲 iPad Prep: Tap Share <span style="font-size:20px">⎋</span> then "Add to Home Screen" for the full app experience!
  </div>

  <!-- Hero section -->
  <div class="home-hero" style="position: relative; overflow: hidden; background: linear-gradient(135deg, var(--c-primary), var(--c-vr)); border-radius: var(--r-xl); padding: var(--space-lg); border-bottom: 8px solid rgba(0,0,0,0.2);">
    <div class="hero-left" style="position: relative; z-index: 2;">
      <div class="greeting-small" style="color: var(--c-accent); font-weight: 900; letter-spacing: 0.05em;">👋 ${greeting.toUpperCase()}</div>
      <h1 class="page-title" style="color: white; font-size: 48px; margin-bottom: 8px; font-family: var(--font-heading); text-shadow: 0 4px 0 rgba(0,0,0,0.2);">${name}!</h1>
      <div class="level-badge" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 99px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.3);">
        <span class="level-icon">⚡</span>
        <span style="font-weight: 800; font-size: 14px;">LEVEL ${level} — <strong>${levelName.toUpperCase()}</strong></span>
      </div>
      <div class="xp-bar-wrap" style="max-width: 300px; margin-bottom: 20px;">
        <div class="xp-bar" style="background: rgba(255,255,255,0.15); height: 14px; border-radius: 7px;">
          <div class="xp-fill" style="width:${xpPercent}%; background: var(--c-accent)"></div>
        </div>
        <span class="xp-label" style="color: white; font-weight: 700; font-size: 12px; margin-top: 8px; display: block; opacity: 0.9;">${xp} XP · ${xpToNext} TO NEXT LEVEL</span>
      </div>
      
      <button id="noti-btn" onclick="window._setupNotifications()" 
              style="background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 12px; cursor: pointer;">
        🔔 ENABLE STUDY NUDGES
      </button>

      <p class="motivation-quote" style="color: white; opacity: 0.9; font-style: italic; max-width: 80%; line-height: 1.4; margin-top: 20px;">${motivation}</p>
    </div>
    
    <!-- Character Companion -->
    <img src="pokemon-hero.png" alt="Hero Pokemon" class="desktop-only" 
         style="position: absolute; right: 0; bottom: -10px; width: 320px; z-index: 1; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));">
    
    <div class="hero-right" style="position: relative; z-index: 2;">
      <div class="profile-main" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
        <div class="profile-avatar" style="background: var(--c-accent); color: #000; font-size: 28px;">${rank.icon}</div>
        <div class="profile-details">
          <div class="profile-name" style="color: white; font-weight: 800;">${name}</div>
          <div class="profile-level" style="color: var(--c-accent); letter-spacing: 0.5px;">${rank.label}</div>
        </div>
      </div>
      <div class="streak-display" style="background: var(--c-accent); border: 2px solid white; color: #000; border-radius: var(--r-md);">
        <div class="streak-num" style="color: #000;">🔥 ${streak}</div>
        <div class="streak-label" style="color: #000; opacity: 0.7; font-weight: 800;">DAY STREAK</div>
        <div class="streak-desc" style="color: #000; font-weight: 900;">${streak === 0 ? 'START TODAY!' : streak < 3 ? 'KEEP GOING!' : streak < 7 ? "ON FIRE!" : '🏆 AMAZING!'}</div>
      </div>
    </div>
    </div>

    <!-- Readiness Nudge Overlay -->
    <div class="card" style="margin: 0 24px; margin-top: -32px; background: white; border: none; border-left: 8px solid var(--c-primary); box-shadow: var(--shadow-xl); position: relative; z-index: 10;">
        <div style="padding: 20px;">
           <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
               <span style="font-size: 11px; font-weight: 800; color: var(--c-primary); letter-spacing: 0.1em;">MISSION CONTROL NUDGE</span>
               <span style="font-size: 11px; font-weight: 900; color: var(--c-text-muted);">${readiness}% READINESS</span>
           </div>
           <p style="font-size: 18px; font-weight: 800; color: var(--c-text); line-height: 1.4; margin: 0;">"${nudge}"</p>
           <div style="margin-top: 12px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
               <div style="width: ${readiness}%; height: 100%; background: var(--c-primary); border-radius: 3px;"></div>
           </div>
        </div>
    </div>
  </div>

  <!-- Target banner -->
  <div class="target-banner" style="display: flex; align-items: center; background: #fff; color: var(--c-text); border: 6px solid var(--c-accent); padding: 24px; border-radius: var(--r-lg); margin-top: 32px; box-shadow: var(--shadow-md); position: relative;">
    <div class="target-left" style="flex: 1;">
      <div class="target-school" style="color: var(--c-text); font-weight: 900; font-size: 20px; font-family: var(--font-heading);">🎯 TARGET: DREAM SCHOOL</div>
      <div class="target-desc" style="color: var(--c-text-muted); font-size: 14px; font-weight: 600;">GL ASSESSMENT · PAPER 1 & 2 · 55 MINS</div>
    </div>
    <div class="target-countdown" id="exam-countdown" style="background: var(--c-text); color: white; padding: 12px 20px; border-radius: var(--r-md); font-weight: 900;"></div>
    
    <!-- Transformer Companion -->
    <img src="transformer-plan.png" alt="Optimus" 
         style="width: 140px; margin-left: 20px; border-radius: var(--r-md); box-shadow: var(--shadow-sm);">
  </div>

  <!-- Stats row -->
  <div class="stats-row" style="margin-top: 32px;">
    <div class="stat-card" style="background: white; border-bottom: 8px solid #818cf8; border-radius: var(--r-md);">
      <div class="stat-value" style="color:#4f46e5">${todaySessions}</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">TODAY</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #fb923c; border-radius: var(--r-md);">
      <div class="stat-value" style="color:#ea580c">${progress.gems || 0} 💎</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">GEMS</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #22d3ee; border-radius: var(--r-md);">
      <div class="stat-value" style="color:#0891b2">${progress.badges?.length || 0}</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">BADGES</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #4ade80; border-radius: var(--r-md);">
      <div class="stat-value" style="color:#16a34a">${progress.sessions.length}</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">TOTAL</div>
    </div>
  </div>

  <!-- Mission Center (Booster) -->
  ${renderMissionCenter()}

  <!-- Weekend Wisdom -->
  ${renderWeekendWisdom()}

  <!-- Subject grid -->
  <h2 class="section-title" style="color: var(--c-text); margin-top: 48px; font-family: var(--font-heading); font-size: 28px;">Start Practice</h2>
  <div class="subject-grid">
    ${subjects.map(sub => {
    const mastery = getSubjectMastery(sub);
    const subLevel = getCurrentLevel(sub);
    const colors = SUBJECT_COLORS[sub];
    const weakTopics = getWeakTopics(sub);
    const isBehind = readiness < 75 && weakTopics.length > 0;
    const weakLabel = weakTopics.length > 0 ? `⚠️ FOCUS: ${weakTopics[0].topic.toUpperCase()}` : '✅ MASTERED';
    return `
      <div class="subject-card" onclick="window.router.navigate('#/student/quiz/${sub}')"
           style="background: white; border: none; border-bottom: 8px solid ${colors.start}; border-radius: var(--r-lg); position: relative;">
        ${isBehind ? `
          <div style="position: absolute; top: 12px; right: 12px; background: #f59e0b; color: white; font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 20px; box-shadow: var(--shadow-sm); z-index: 2; display: flex; align-items: center; gap: 4px;">
              <span>⚡</span> GOAL ACCELERATOR
          </div>
        ` : ''}
        <div class="subject-card-glow" style="background:${colors.start}11"></div>
        <div>
          <div class="subject-card-icon" style="background: ${colors.start}11; color: ${colors.start}; border-radius: 12px; padding: 10px;">${SUBJECT_ICONS[sub]}</div>
          <div class="subject-card-name" style="color: var(--c-text); font-weight: 900;">${SUBJECT_LABELS[sub].toUpperCase()}</div>
          <div class="subject-card-meta" style="color:${colors.start}; font-weight: 700; font-size: 11px;">${mastery}% MASTERY · LVL ${subLevel}</div>
        </div>
        <div>
          <div class="accuracy-bar" style="margin-top:14px; background: #eee; height: 10px; border-radius: 5px;">
            <div class="accuracy-fill" style="width:${mastery}%; background:${colors.start}; border-radius: 5px;"></div>
          </div>
          <div style="font-size:10px; margin-top:8px; font-weight: 800; color: var(--c-text-muted);">${weakLabel}</div>
        </div>
      </div>`;
  }).join('')}
  </div>

  <!-- Recent activity -->
  ${renderRecentActivity(progress)}

</div>`;
}

function renderRecentActivity(progress) {
  const recent = [...progress.sessions].reverse().slice(0, 5);
  if (!recent.length) {
    return '<div class="section-title" style="margin-top:32px;color:var(--c-text-muted)">No sessions yet — pick a subject above to start! 🚀</div>';
  }
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
            <div style="font-weight:700;font-size:14px">${SUBJECT_LABELS[s.subject] || s.subject}</div>
            <div style="font-size:12px;color:var(--c-text-muted)">${dateStr} · ${timeStr} · ${s.total} Qs</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:900;font-size:17px;color:${subColors[s.subject]}">${s.score}%</div>
          <div style="font-size:12px;color:var(--c-text-muted)">+${s.xpGained || 0} XP</div>
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
  <div class="card mission-card" onclick="window.router.navigate('#/student/quiz/${booster.subject}')"
       style="background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(6,182,212,0.1));
              border: 2px solid ${colors.start}66; margin-bottom:28px; cursor:pointer;
              animation: missionPulse 2s infinite">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-size:48px">🚀</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--c-accent);margin-bottom:4px">New Booster Unlocked!</div>
        <h3 style="font-family:var(--font-heading);font-size:20px;font-weight:900;margin-bottom:6px">${booster.title}</h3>
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

export function mountStudentHome() {
  // PWA helper logic
  const pwaHelper = document.getElementById('pwa-helper');
  if (pwaHelper && (navigator.userAgent.match(/iPad|iPhone|iPod/g)) && !window.navigator.standalone) {
    pwaHelper.style.display = 'block';
  }

  window._sendApprovalRequest = () => {
    const emailInput = document.getElementById('link-parent-email');
    if (!emailInput) return;
    const email = emailInput.value.trim().toLowerCase();
    if (!email) { alert("Please enter your parent's email."); return; }

    console.log(`[Audit] Student ${studentUid} requesting parent link for email: ${email}`);

    const userData = JSON.parse(localStorage.getItem('aceprep_user') || '{}');
    const studentUid = userData.uid;
    const studentName = userData.displayName || 'Your Student';

    const baseUrl = window.location.href.split('#')[0];
    const deepLink = `${baseUrl}#/login?invite=${studentUid}&role=parent`;

    const subject = encodeURIComponent(`${studentName} wants to link their AcePrep 11+ account!`);
    const bodyText = `Hi,\n\n${studentName} has started using AcePrep 11+ and needs you to approve their account to enable cloud syncing and reports.\n\nPlease click the link below to accept and link as a Parent:\n\n${deepLink}\n\nHappy studying!`;

    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  window._handleAuthLogout = () => {
    if (window._handleLogout) {
      window._handleLogout();
    } else {
      localStorage.removeItem('aceprep_user');
      window.location.reload();
    }
  };
}
