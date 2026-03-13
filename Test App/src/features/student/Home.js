import { getProgress, getDailyChallenge } from '../../engine/progressStore.js';
import { getSubjectMastery, getCurrentLevel, getWeakTopics, checkBoosterRequired, isWeekend, getRankInfo } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS } from '../../engine/questionBank.js';
import { getRandomWeekendQuote, getMinuteAwareQuote } from '../../engine/quoteBank.js';
import { calculateReadiness } from '../../engine/readinessEngine.js';
import { getReadinessNudge } from '../../engine/notificationEngine.js';

export function renderStudentHome() {
  const progress = getProgress();
  const daily = getDailyChallenge();
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
              <div style="font-size: 64px; margin-bottom: 24px;" aria-hidden="true">🛡️</div>
              <h1 style="font-family: var(--font-heading); font-weight: 900; font-size: 32px; color: #0f172a; margin-bottom: 12px;">Parent Approval Needed</h1>
              <p style="color: #475569; font-weight: 600; line-height: 1.6; margin-bottom: 32px;">Great to have you here, ${name}! To keep your progress safe and synced, please ask a Parent or Guardian to link your account.</p>
              
              <div style="background: #f1f5f9; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 32px; text-align: left;">
                  <label for="link-parent-email" style="display: block; font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase;">Step 1: Enter Parent Email</label>
                  <input type="email" id="link-parent-email" class="input-field" style="background: white; border-width: 2px;" placeholder="parent@gmail.com">
              </div>

              <button class="btn btn-primary" data-testid="student-send-approval-btn" style="width: 100%; border-bottom: 4px solid rgba(0,0,0,0.2);" onclick="window._sendApprovalRequest()" aria-label="Send approval link to parent">📩 SEND APPROVAL LINK</button>
              
              <button class="btn btn-outline" style="margin-top: 24px; border: none; color: #4b5563; font-size: 13px; font-weight: 700;" onclick="window._handleAuthLogout()" aria-label="Logout from account">🚪 Logout & Try Another Account</button>
          </div>
      </div>
      `;
  }

  return `
<div class="page page-enter student-home" id="student-home" style="color: var(--c-text)">

  <!-- PWA Helper for iPad -->
  <div id="pwa-helper" class="glass" style="display:none; color: var(--c-text); padding: 16px; border-radius: var(--r-md); margin-bottom: 24px; font-size: 14px; font-weight: 700; text-align: center; border: 1px solid var(--c-accent) !important;">
    📲 <strong>iPad Tip:</strong> Tap Share <span style="font-size:20px">⎋</span> then "Add to Home Screen" for the full AcePrep experience!
  </div>

  <!-- Hero section -->
  <div class="home-hero hover-lift" style="position: relative; overflow: hidden; background: var(--c-primary-grad); border-radius: var(--r-xl); padding: var(--space-lg); box-shadow: var(--shadow-lg);">
    <!-- Abstract background shapes for premium look -->
    <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; blur: 40px;"></div>
    <div style="position: absolute; bottom: -30px; left: 10%; width: 150px; height: 150px; background: rgba(0,0,0,0.05); border-radius: 50%; blur: 20px;"></div>

    <div class="hero-left" style="position: relative; z-index: 2;">
      <div class="greeting-small" style="color: var(--c-accent); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">${greeting}</div>
      <h1 class="page-title" style="color: white; font-size: clamp(32px, 5vw, 56px); margin-bottom: 12px; font-family: var(--font-heading); font-weight: 900; line-height: 1.1;">Ready to soar, ${name}?</h1>
      
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
        <div class="level-badge glass" style="padding: 8px 16px; border-radius: 99px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.4) !important; color: white;">
          <span class="level-icon">⚡</span>
          <span style="font-weight: 800; font-size: 13px;">LVL ${level} · ${levelName}</span>
        </div>
        <div class="nav-gems glass" style="border: 1px solid rgba(255,255,255,0.4) !important; color: var(--c-accent);">
          <span>💎</span> <strong>${progress.gems || 0}</strong>
        </div>
      </div>

      <div class="xp-bar-wrap" style="max-width: 340px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
           <span style="color: white; font-weight: 800; font-size: 11px; opacity: 0.9;">${xp} XP TOTAL</span>
           <span style="color: white; font-weight: 800; font-size: 11px; opacity: 0.9;">${xpToNext} TO NEXT LEVEL</span>
        </div>
        <div class="xp-bar" style="background: rgba(255,255,255,0.15); height: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
          <div class="xp-fill pulse-glow" style="width:${xpPercent}%; background: var(--c-accent); box-shadow: 0 0 15px var(--c-accent);"></div>
        </div>
      </div>
      
      <p class="motivation-quote" style="color: white; opacity: 0.95; font-weight: 500; font-size: 15px; max-width: 90%; line-height: 1.6; border-left: 3px solid var(--c-accent); padding-left: 16px; margin-top: 24px;">"${motivation}"</p>
    </div>
    
    <!-- Character Companion -->
    <img src="ace-mascot.png" alt="Ace Mascot" class="desktop-only" 
         style="position: absolute; right: 0; bottom: -20px; width: 340px; z-index: 1; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.35)); transition: transform 0.3s ease-out;"
         onmouseover="this.style.transform='scale(1.05) rotate(2deg)'" 
         onmouseout="this.style.transform='scale(1) rotate(0deg)'"
         loading="eager">
    
    <div class="hero-right" style="position: relative; z-index: 2;">
       <div class="profile-main glass" style="border-radius: var(--r-md); padding: 12px 20px;">
          <div class="profile-avatar" style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">${rank.icon}</div>
          <div class="profile-details">
            <div class="profile-name" style="color: white; font-weight: 800; font-size: 16px;">${name}</div>
            <div class="profile-level" style="color: var(--c-accent); font-weight: 900; font-size: 12px; letter-spacing: 1px;">${rank.label.toUpperCase()}</div>
          </div>
       </div>
       <div class="streak-display hover-lift" style="background: white; border: none; padding: 12px 20px; border-radius: var(--r-md); box-shadow: var(--shadow-md); margin-top: 16px;" aria-label="Current streak: ${streak} days">
         <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;" aria-hidden="true">🔥</span>
            <div>
               <div style="font-weight: 900; font-size: 20px; color: var(--c-text);">${streak}</div>
               <div style="font-weight: 700; font-size: 10px; color: var(--c-text-muted); text-transform: uppercase;">Day Streak</div>
            </div>
         </div>
       </div>
    </div>
  </div>

  <!-- Mission Control Overlay -->
  <div style="margin: 0 40px; margin-top: -40px; position: relative; z-index: 10;">
      <div class="card glass hover-lift" style="padding: 24px; border-radius: var(--r-lg); box-shadow: var(--shadow-xl); border-left: 8px solid var(--c-accent) !important;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">🛰️</span>
                  <span style="font-size: 12px; font-weight: 900; color: var(--c-primary); letter-spacing: 0.1em;">MISSION CONTROL</span>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 900; color: var(--c-text);">PREDICTED READINESS: <span style="color: var(--c-primary);">${readiness}%</span></div>
                <div style="font-size: 10px; font-weight: 800; color: var(--c-accent); background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 10px; display: inline-block;">RANK: ${rank.label}</div>
              </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div>
              <p style="font-size: 18px; font-weight: 800; color: var(--c-text); line-height: 1.5; margin: 0 0 16px 0;">"${nudge}"</p>
              <div style="height: 10px; background: rgba(0,0,0,0.05); border-radius: 5px; overflow: hidden;">
                  <div style="width: ${readiness}%; height: 100%; background: var(--c-primary-grad); border-radius: 5px; transition: width 1s var(--ease-out);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 10px; font-weight: 800; color: var(--c-text-muted); text-transform: uppercase;">
                  <span>Beginner</span>
                  <span>Ready for Exam 🎯</span>
              </div>
            </div>

            <!-- Daily Challenge Directive -->
            <div style="background: rgba(var(--rgb-accent), 0.1); border: 1px dashed var(--c-accent); padding: 12px; border-radius: 16px; position: relative;">
               <div style="font-size: 10px; font-weight: 950; color: var(--c-accent); margin-bottom: 8px;">DAILY CHALLENGE</div>
               ${daily.isCompleted 
                 ? `<div style="text-align:center; padding: 4px;">
                      <span style="font-size: 24px;">✅</span>
                      <div style="font-size: 11px; font-weight: 900; color: var(--c-success); margin-top: 4px;">MISSION COMPLETE!</div>
                    </div>`
                 : `
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">${{vr:'🔤', nvr:'🔷', en:'📖', maths:'🔢'}[daily.subject]}</span>
                    <span style="font-weight: 800; font-size: 12px; color: var(--c-text);">${{vr:'Verbal', nvr:'Non-Verbal', en:'English', maths:'Maths'}[daily.subject].toUpperCase()}</span>
                  </div>
                  <button onclick="window._startDaily()" style="width: 100%; background: var(--c-accent); color: white; border: none; padding: 6px; border-radius: 8px; font-size: 10px; font-weight: 900; cursor: pointer;" aria-label="Start daily mission">START +100 XP</button>
                 `
               }
            </div>
          </div>
      </div>
  </div>
      </div>
  </div>

  <div style="margin-top: 48px;">
    <!-- Target banner -->
    <div class="target-banner glass hover-lift" style="display: flex; align-items: center; padding: 24px 32px; border-radius: var(--r-lg); border: 2px dashed var(--c-accent) !important; box-shadow: var(--shadow-md);">
      <div class="target-left" style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
           <span style="font-size: 24px;" aria-hidden="true">🎯</span>
           <div class="target-school" style="font-weight: 900; font-size: 18px; font-family: var(--font-heading);">PRIMARY TARGET: 11+ GL SUCCESS</div>
        </div>
        <div class="target-desc" style="color: var(--c-text-muted); font-size: 13px; font-weight: 600; padding-left: 34px;">MASTERING MATHS, ENGLISH, VR & NVR</div>
      </div>
      <div class="target-countdown" id="exam-countdown" style="background: var(--c-text); color: white; padding: 14px 24px; border-radius: var(--r-md); font-weight: 900; font-size: 16px; letter-spacing: 0.5px;"></div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="stats-row stagger-in" style="margin-top: 32px;">
    <div class="stat-card hover-lift" style="background: white; border-bottom: 6px solid var(--c-vr); bo-shadow: var(--shadow-sm);">
      <div class="stat-value" style="color: var(--c-vr)">${todaySessions}</div>
      <div class="stat-label">TODAY</div>
    </div>
    <div class="stat-card hover-lift" style="background: white; border-bottom: 6px solid var(--c-accent); bo-shadow: var(--shadow-sm);">
      <div class="stat-value" style="color: #d97706">${progress.gems || 0}</div>
      <div class="stat-label">GEMS <span aria-hidden="true">💎</span></div>
    </div>
    <div class="stat-card hover-lift" style="background: white; border-bottom: 6px solid var(--c-nvr); bo-shadow: var(--shadow-sm);">
      <div class="stat-value" style="color: var(--c-nvr)">${progress.badges?.length || 0}</div>
      <div class="stat-label">BADGES</div>
    </div>
    <div class="stat-card hover-lift" style="background: white; border-bottom: 6px solid var(--c-maths); bo-shadow: var(--shadow-sm);">
      <div class="stat-value" style="color: var(--c-maths)">${progress.sessions.length}</div>
      <div class="stat-label">SESSIONS</div>
    </div>
  </div>


  <!-- Mission Center (Booster) -->
  ${renderMissionCenter()}

  <!-- Weekend Wisdom -->
  ${renderWeekendWisdom()}

  <!-- Subject grid -->
  <h2 class="section-title" style="margin-top: 64px; font-size: 24px;">Daily Training</h2>
  <div class="subject-grid stagger-in">
    ${subjects.map(sub => {
    const mastery = getSubjectMastery(sub);
    const subLevel = getCurrentLevel(sub);
    const colors = SUBJECT_COLORS[sub];
    const weakTopics = getWeakTopics(sub);
    const isBehind = readiness < 75 && weakTopics.length > 0;
    const weakLabel = weakTopics.length > 0 ? `⚠️ FOCUS: ${weakTopics[0].topic.toUpperCase()}` : '✅ MASTERED';
    return `
      <button class="subject-card hover-lift" onclick="window.router.navigate('#/student/quiz/${sub}')"
           aria-label="Start ${SUBJECT_LABELS[sub]} training. Current mastery ${mastery}%."
           style="background: white; border: 1px solid var(--c-border); border-radius: var(--r-lg); padding: 24px; box-shadow: var(--shadow-sm); width: 100%; text-align: left; display: block;">
        ${isBehind ? `
          <div class="pulse-glow" style="position: absolute; top: 12px; right: 12px; background: var(--c-accent); color: #000; font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 20px; z-index: 2; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(0,0,0,0.1);">
              <span>⚡</span> BOOST ACTIVE
          </div>
        ` : ''}
        
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
           <div style="font-size: 36px; background: ${colors.start}11; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; color: ${colors.start};">${SUBJECT_ICONS[sub]}</div>
           <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 900; color: var(--c-text);">${mastery}%</div>
              <div style="font-size: 10px; font-weight: 800; color: var(--c-text-muted);">MASTERY</div>
           </div>
        </div>

        <div>
           <h3 style="font-family: var(--font-heading); font-weight: 900; font-size: 18px; margin-bottom: 4px; color: var(--c-text);">${SUBJECT_LABELS[sub].toUpperCase()}</h3>
           <div style="font-size: 11px; font-weight: 700; color: ${colors.start};">LEVEL ${subLevel} ACADEMIC</div>
        </div>

        <div style="margin-top: 20px;">
           <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
             <div style="width:${mastery}%; height: 100%; background:${colors.start}; border-radius: 4px;"></div>
           </div>
           <div style="font-size: 10px; margin-top: 10px; font-weight: 800; color: var(--c-text-muted); display: flex; align-items: center; gap: 6px;">
              ${weakTopics.length > 0 ? '🎯' : '⭐'} ${weakLabel}
           </div>
        </div>
      </button>`;
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
  <button class="card mission-card" onclick="window.router.navigate('#/student/quiz/${booster.subject}')"
       aria-label="Start Booster Mission: ${booster.title}. Reward: ${booster.rewardXP} XP."
       style="background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(6,182,212,0.1));
              border: 2px solid ${colors.start}66; margin-bottom:28px; cursor:pointer;
              animation: missionPulse 2s infinite; width: 100%; text-align: left; display: block;">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-size:48px" aria-hidden="true">🚀</div>
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
  </button>
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
