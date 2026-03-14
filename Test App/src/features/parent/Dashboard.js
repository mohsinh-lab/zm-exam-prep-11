
import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport, forceSyncFromCloud, updateProgress, setParentGoal } from '../../engine/progressStore.js';
import { getSubjectMastery, getWeakTopics } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS } from '../../engine/questionBank.js';
import { calculateReadiness, generateActionPlan, getCatchmentSchools } from '../../engine/readinessEngine.js';

export function renderParentDashboard() {
  const progress = getProgress();
  const name = progress.studentName || 'Student';
  const sessions = progress.sessions || [];

  const today = sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const week = sessions.filter(s => Date.now() - new Date(s.date) < 7 * 86400000);
  const avgScore = week.length
    ? Math.round(week.reduce((s, x) => s + x.score, 0) / week.length)
    : 0;

  const readiness = calculateReadiness(progress);
  const actionPlan = generateActionPlan(progress);
  const targetDate = progress.goals?.examDate || 'Not Set';

  const subLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Mathematics' };
  const subColors = { vr: 'var(--c-vr)', nvr: 'var(--c-nvr)', en: 'var(--c-en)', maths: 'var(--c-maths)' };

  const isVerified = sessions.length > 0 || progress.xp > 0;

  return `
<div class="page page-enter parent-dashboard" style="color: var(--c-text)">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
    <div>
      <h1 class="page-title" style="color: var(--c-text); font-family: var(--font-heading); font-size: 36px; margin-bottom: 4px;">📊 Parent Portal</h1>
      <p class="page-subtitle" style="color: var(--c-primary); font-weight: 700;">${isVerified ? `Monitoring ${name}'s 11+ Journey` : 'Waiting for Student Link'}</p>
    </div>
    <div style="display:flex; gap:12px; align-items:center">
      <button onclick="window.print()" class="btn btn-outline btn-sm" style="border-radius: 12px; border: 2px solid #ddd;">📄 PDF REPORT</button>
      <button onclick="window.router.navigate('#/parent/analytics')" class="btn btn-outline btn-sm" style="border-radius: 12px; border: 2px solid var(--c-primary); color: var(--c-primary);">📊 ANALYTICS</button>
      <button onclick="window._syncCloud()" class="btn btn-primary btn-sm pulse-glow" style="border-radius: 12px;" aria-label="Refresh Data">🔄 LIVE SYNC</button>
      <img src="ace-mascot.png" alt="Mission Control" class="desktop-only" style="width: 100px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));" loading="lazy">
    </div>
  </div>

  ${isVerified ? `
  <!-- Readiness Gauge -->
  <div class="card hover-lift" style="margin-bottom: 32px; background: var(--c-primary-grad); border: none; color: white; position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
    <!-- Character Companion -->
    <img src="ace-mascot.png" alt="Ace Mascot" class="desktop-only" 
         style="position: absolute; right: 0; bottom: -40px; width: 380px; z-index: 1; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.35)); transition: transform 0.3s ease-out;"
         onmouseover="this.style.transform='scale(1.05) translateY(-5px)'" 
         onmouseout="this.style.transform='scale(1) translateY(0)'"
         loading="eager">
    <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; position: relative; z-index: 2;">
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 14px; text-transform: uppercase; margin-bottom: 8px; font-weight: 800; letter-spacing: 1px;">Predictive Readiness</h3>
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 64px; font-weight: 950; line-height: 1;">${readiness.level}%</span>
          <span style="font-size: 16px; font-weight: 700; opacity: 0.9;">Target Score</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; font-weight: 800; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(4px);">
          EXAM: ${targetDate}
        </div>
      </div>
    </div>
    
    <div style="position: relative; z-index: 2;">
      <div style="height: 10px; background: rgba(255,255,255,0.15); border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
        <div style="width: ${readiness.level}%; height: 100%; background: white; box-shadow: 0 0 15px white;"></div>
      </div>
      <p style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.95); max-width: 60%; line-height: 1.4;">
        ${readiness.status === 'READY' ? '🔥 Academic readiness achieved. Switch to full timed mock papers!' : 
          readiness.status === 'ALMOST' ? '⚡ Significant progress made. Focus on Non-Verbal patterns to bridge the final gap.' : 
          '🚀 Foundation stage. Target "Booster Missions" to increase consistency across all subjects.'}
      </p>
    </div>
  </div>

  <div class="directives-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px;">
    <!-- Mission Plan -->
    <div class="card glass stagger-in" style="border: 1px solid var(--c-border); display: flex; flex-direction: column; justify-content: space-between; padding: 24px; border-radius: var(--r-xl);">
      <div>
        <h3 style="color: var(--c-primary); font-family: var(--font-heading); font-size: 14px; letter-spacing: 1px; margin-bottom: 16px;">🎯 TARGET DIRECTIVES</h3>
        <ul style="list-style: none; padding: 0;">
          ${actionPlan.slice(0, 3).map(p => `
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
              <span style="background: var(--c-primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; margin-top: 2px;">✔</span>
              <span style="font-weight: 700; font-size: 13px; color: var(--c-text); opacity: 0.9;">${p}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <!-- Subject Mastery -->
    <div class="card glass stagger-in" style="border: 1px solid var(--c-border); padding: 24px; border-radius: var(--r-xl);">
      <h3 style="color: var(--c-primary); font-family: var(--font-heading); font-size: 14px; letter-spacing: 1px; margin-bottom: 16px;">⚔️ SUBJECT LEVELS</h3>
      ${['vr', 'nvr', 'en', 'maths'].map(sub => {
        const mastery = getSubjectMastery(progress, sub);
        const color = SUBJECT_COLORS[sub]?.start || '#ccc';
        return `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; color: var(--c-text-muted);">
            <span>${SUBJECT_LABELS[sub] || sub}</span>
            <span>LEVEL ${Math.floor(mastery / 100)}</span>
          </div>
          <div style="height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden;">
            <div style="width: ${Math.min(100, (mastery % 100) || 5)}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Recent Milestones -->
    <div class="card glass stagger-in" style="border: 1px solid var(--c-border); padding: 24px; border-radius: var(--r-xl);">
      <h3 style="color: var(--c-primary); font-family: var(--font-heading); font-size: 14px; letter-spacing: 1px; margin-bottom: 16px;">🏆 RECENT BADGES</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${progress.badges?.length > 0 
          ? progress.badges.slice(-4).map(b => `
            <div class="badge-mini hover-lift" title="${b}" style="background: white; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: var(--shadow-sm); border: 1px solid var(--c-border);">
              ${{ first_session: '🌟', streak_3: '🔥', perfect_score: '💯', maths_master: '🔢' }[b] || '🏅'}
            </div>
          `).join('')
          : '<p style="color: var(--c-text-muted); font-size: 12px; font-weight: 700;">No badges earned yet.</p>'}
      </div>
    </div>
  </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; margin-bottom: 48px;" class="desktop-only">
      <div>
        <h2 class="section-title" style="color: var(--c-text); margin-bottom: 24px; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;" aria-hidden="true">📊</span> SKILLS ANALYSIS
        </h2>
        <div class="card shadow-sm" style="background: white; border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: 24px; display: flex; align-items: center; justify-content: center; height: 320px;">
          ${renderRadarChart(progress)}
        </div>
      </div>
      <div>
        <h2 class="section-title" style="color: var(--c-text); margin-bottom: 24px; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;" aria-hidden="true">🎯</span> PRIORITY TOPICS
        </h2>
        <div class="card shadow-sm" style="background: white; border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: 0; min-height: 320px;">
          ${renderWeakTopicInsights(progress)}
        </div>
      </div>
    </div>

    <div>
      <h2 class="section-title" style="color: var(--c-text); margin-bottom: 24px; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;" aria-hidden="true">📈</span> PERFORMANCE TREND
      </h2>
      ${renderProgressChart(sessions)}
    </div>

    <div>
      <h2 class="section-title" style="color: var(--c-text); margin-bottom: 24px; font-family: var(--font-heading); display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;" aria-hidden="true">📋</span> RECENT LOG BOOK
      </h2>
      <div class="card shadow-sm" style="padding:0; overflow:hidden; background: white; border: 1px solid var(--c-border); border-radius: var(--r-xl);">
        ${sessions.length === 0
          ? '<div style="padding:48px; text-align:center; color: var(--c-text-muted); font-weight: 700;">No sessions recorded yet!</div>'
          : [...sessions].reverse().slice(0, 5).map(s => {
            const d = new Date(s.date);
            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const scoreC = s.score >= 80 ? 'var(--c-success)' : s.score >= 60 ? 'var(--c-accent)' : 'var(--c-danger)';
            return `
            <div class="report-row hover-lift" style="padding:16px 24px; border-bottom: 1px solid rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 20px;">${{ vr: '🔤', nvr: '🔷', en: '📖', maths: '🔢' }[s.subject] || '📝'}</div>
                <div>
                  <div style="font-weight:900; font-size:14px; color: var(--c-text);">${SUBJECT_LABELS[s.subject]?.toUpperCase() || s.subject.toUpperCase()}</div>
                  <div style="font-size:11px; color: var(--c-text-muted); font-weight: 700; opacity: 0.7;">${dateStr} · ${s.total} Qs</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:900; font-size:16px; color:${scoreC}">${s.score}%</div>
              </div>
            </div>`;
          }).join('')}
          ${sessions.length > 5 ? `
            <div style="padding: 12px; text-align: center; background: var(--c-bg);">
              <span style="font-size: 11px; font-weight: 800; color: var(--c-text-muted);">Showing last 5 of ${sessions.length} sessions</span>
            </div>
          ` : ''}
      </div>
    </div>
  </div>

  ` : `
  <!-- Placeholder for Not Linked -->
  <div class="card" style="padding: 60px 40px; text-align: center; background: white; border: 2px dashed var(--c-border); border-radius: var(--r-xl);">
     <img src="ace-mascot.png" alt="Link Needed" style="width: 160px; filter: grayscale(1); margin-bottom: 24px;">
     <h2 style="color: var(--c-text); font-family: var(--font-heading); margin-bottom:12px;">Waiting for Connection...</h2>
     <p style="color: var(--c-text-muted); font-weight: 600; margin-bottom: 32px;">Invite Zayyan using his student account email to start monitoring stats in real-time.</p>
  </div>
  `}

  <!-- Family Management & Settings -->
  <h2 class="section-title" style="color: var(--c-text); margin-bottom: 20px; font-family: var(--font-heading);">👨‍👩‍👧‍👦 FAMILY & SETTINGS</h2>
  
  <div class="card" style="margin-bottom:48px; background: white; border: none; border-left: 8px solid var(--c-accent); box-shadow: var(--shadow-md); border-radius: var(--r-xl);">
    <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 950; margin-bottom:12px">💌 INVITE A FAMILY MEMBER</h3>
    <p style="color: var(--c-text-muted); font-size: 14px; font-weight: 600; margin-bottom: 20px;">Link a new Student to monitor, or invite a Co-Parent to share this dashboard.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div class="input-group">
        <label for="invite-name" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">MEMBER'S NAME</label>
        <input type="text" id="invite-name" class="input-field" style="border-width: 2px;" placeholder="e.g. Zayyan">
      </div>
      <div class="input-group">
        <label for="invite-email" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">GOOGLE EMAIL ADDRESS</label>
        <input type="email" id="invite-email" class="input-field" style="border-width: 2px;" placeholder="name@gmail.com">
      </div>
    </div>
    
    <div class="input-group" style="margin-bottom: 24px;">
      <label for="invite-role" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">ROLE</label>
      <select id="invite-role" class="input-field" style="border-width: 2px; height: 48px; background: white;">
        <option value="student">Student Account (Zayyan)</option>
        <option value="parent">Co-Parent (Full Access)</option>
      </select>
    </div>
    
    <button onclick="window._sendInvite()" class="btn btn-accent pulse-glow" style="padding: 14px 28px; border-radius: 12px; font-weight: 900;">SEND ENCRYPTED INVITATION</button>
  </div>

  <!-- Parent Special Challenge -->
  ${isVerified ? `
  <div class="card" style="margin-bottom:48px; background: white; border: none; border-left: 8px solid var(--c-primary); box-shadow: var(--shadow-md); border-radius: var(--r-xl);">
    <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 950; margin-bottom:12px">🎯 SET A SPECIAL CHALLENGE</h3>
    <p style="color: var(--c-text-muted); font-size: 14px; font-weight: 600; margin-bottom: 20px;">Motivate ${name} with a personalized mission and a Gem reward.</p>
    
    ${progress.parentGoal ? `
      <div style="background: var(--c-bg); padding: 20px; border-radius: 16px; border: 1px solid var(--c-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: 800; font-size: 14px; color: var(--c-primary);">ACTIVE CHALLENGE</span>
          <span style="font-size: 11px; font-weight: 700; color: var(--c-text-muted);">${new Date(progress.parentGoal.createdAt).toLocaleDateString()}</span>
        </div>
        <p style="font-weight: 700; color: var(--c-text); margin-bottom: 12px;">
          Goal: ${progress.parentGoal.type === 'sessions' ? `Complete ${progress.parentGoal.target} sessions` : 
                 progress.parentGoal.type === 'xp' ? `Earn ${progress.parentGoal.target} XP` : 
                 `Achieve ${progress.parentGoal.target}% score`}
        </p>
        <div style="height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${Math.min(100, (progress.parentGoal.progress / progress.parentGoal.target) * 100)}%; height: 100%; background: var(--c-primary); border-radius: 4px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
          <span style="color: var(--c-text-muted);">${progress.parentGoal.progress} / ${progress.parentGoal.target} progress</span>
          <span style="color: var(--c-accent);">💎 ${progress.parentGoal.reward} GEMS REWARD</span>
        </div>
        <button onclick="window._cancelGoal()" class="btn btn-sm" style="margin-top: 16px; color: var(--c-danger); border: 1px solid var(--c-danger); background: transparent;">CANCEL CHALLENGE</button>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
        <div class="input-group">
          <label for="goal-type" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">CHALLENGE TYPE</label>
          <select id="goal-type" class="input-field" style="border-width: 2px; height: 48px; background: white;">
            <option value="sessions">Practice Sessions (Count)</option>
            <option value="xp">Total XP Gained</option>
            <option value="percent">Minimum % Score</option>
          </select>
        </div>
        <div class="input-group">
          <label for="goal-target" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">TARGET VALUE</label>
          <input type="number" id="goal-target" class="input-field" style="border-width: 2px;" placeholder="e.g. 5">
        </div>
        <div class="input-group">
          <label for="goal-reward" class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">GEM REWARD</label>
          <input type="number" id="goal-reward" class="input-field" style="border-width: 2px;" value="10">
        </div>
      </div>
      <button onclick="window._setGoal()" class="btn btn-primary" style="padding: 14px 28px; border-radius: 12px; font-weight: 900;">ACTIVATE CHALLENGE</button>
    `}
  </div>
  ` : ''}

  <div style="text-align: center; margin-bottom: 40px; opacity: 0.6;">
    <p style="font-size: 12px; font-weight: 800; color: var(--c-text-muted); line-height: 1.6;">
      ACEPREP 11+ VERSION 2.5.0 (PREMIUM)<br>
      ALL TRANSFERS SECURED BY FIREBASE REALTIME SYNC
    </p>
  </div>
</div>
`;
}

function renderProgressChart(sessions) {
  if (sessions.length === 0) {
    return `
      <div class="card glass" style="height: 240px; display: flex; align-items: center; justify-content: center; border-radius: var(--r-lg);">
        <p style="color: var(--c-text-muted); font-weight: 800;">Waiting for data to generate trends...</p>
      </div>
    `;
  }

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const daySessions = sessions.filter(s => new Date(s.date).toDateString() === dateStr);
    const avgScore = daySessions.length ? Math.round(daySessions.reduce((s, x) => s + x.score, 0) / daySessions.length) : 0;
    last7Days.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short' }), score: avgScore, count: daySessions.length });
  }

  return `
    <div class="card shadow-sm" style="background: white; border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: 32px; height: 240px; display: flex; flex-direction: column; justify-content: flex-end;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 100%; gap: 12px;">
        ${last7Days.map(day => `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="position: relative; width: 100%; display: flex; flex-direction: column; align-items: center;">
              ${day.score > 0 ? `<span style="font-size: 10px; font-weight: 900; color: var(--c-primary); margin-bottom: 4px;">${day.score}%</span>` : ''}
              <div style="width: 100%; max-width: 32px; height: ${Math.max(4, (day.score / 100) * 140)}px; background: ${day.score >= 80 ? 'var(--c-maths-grad)' : day.score >= 50 ? 'var(--c-primary-grad)' : 'var(--c-surface2)'}; border-radius: 8px 8px 4px 4px; transition: height 1s var(--ease-out); position: relative;" 
                   class="${day.score > 0 ? 'hover-lift' : ''}">
                ${day.count > 1 ? `<div style="position: absolute; top: -8px; right: -8px; background: var(--c-accent); color: #000; font-size: 9px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white;">${day.count}</div>` : ''}
              </div>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: var(--c-text-muted); text-transform: uppercase;">${day.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRadarChart(progress) {
  const mastery = {
    vr: Math.min(100, (getSubjectMastery(progress, 'vr') % 100) || 30),
    nvr: Math.min(100, (getSubjectMastery(progress, 'nvr') % 100) || 30),
    en: Math.min(100, (getSubjectMastery(progress, 'en') % 100) || 30),
    maths: Math.min(100, (getSubjectMastery(progress, 'maths') % 100) || 30)
  };

  const center = 110;
  const radius = 80;
  const points = [
    { x: center, y: center - radius * (mastery.en / 100), label: 'English', lx: center, ly: center - radius - 15 },
    { x: center + radius * (mastery.maths / 100), y: center, label: 'Maths', lx: center + radius + 25, ly: center + 5 },
    { x: center, y: center + radius * (mastery.vr / 100), label: 'VR', lx: center, ly: center + radius + 15 },
    { x: center - radius * (mastery.nvr / 100), y: center, label: 'NVR', lx: center - radius - 25, ly: center + 5 }
  ];

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return `
    <svg width="260" height="260" viewBox="0 0 220 220" style="overflow:visible">
      <!-- Grid -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="1" />
      <circle cx="${center}" cy="${center}" r="${radius * 0.6}" fill="none" stroke="#e2e8f0" stroke-width="1" />
      <circle cx="${center}" cy="${center}" r="${radius * 0.3}" fill="none" stroke="#e2e8f0" stroke-width="1" />
      <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#e2e8f0" stroke-width="1" />
      <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#e2e8f0" stroke-width="1" />
      
      <!-- Data -->
      <polygon points="${polyPoints}" fill="rgba(108,99,255,0.2)" stroke="var(--c-primary)" stroke-width="3" stroke-linejoin="round" />
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--c-primary)" stroke="white" stroke-width="2" />`).join('')}
      
      <!-- Labels -->
      ${points.map(p => `<text x="${p.lx}" y="${p.ly}" text-anchor="middle" font-size="10" font-weight="950" fill="var(--c-text-muted)" style="text-transform:uppercase;letter-spacing:1px">${p.label}</text>`).join('')}
    </svg>
  `;
}

function renderWeakTopicInsights(progress) {
  const allWeak = [];
  ['vr', 'nvr', 'en', 'maths'].forEach(sub => {
    getWeakTopics(sub).forEach(t => allWeak.push({ ...t, subject: sub }));
  });

  const sorted = allWeak.sort((a, b) => a.mastery - b.mastery).slice(0, 4);

  if (sorted.length === 0) {
    return `<div style="padding:40px;text-align:center;color:var(--c-text-muted);font-weight:700">No priority topics identified yet. Keep practicing!</div>`;
  }

  return sorted.map(t => {
    const color = SUBJECT_COLORS[t.subject]?.start || 'var(--c-primary)';
    return `
      <div style="padding:16px 24px;border-bottom:1px solid rgba(0,0,0,0.03);display:flex;align-items:center;justify-content:space-between">
        <div>
           <div style="font-size:11px;font-weight:900;color:${color};text-transform:uppercase;margin-bottom:4px">${SUBJECT_LABELS[t.subject]}</div>
           <div style="font-weight:800;font-size:14px;color:var(--c-text)">${t.topic}</div>
        </div>
        <div style="text-align:right">
           <div style="font-weight:950;font-size:16px;color:var(--c-danger)">${t.mastery}%</div>
           <div style="font-size:10px;font-weight:800;color:var(--c-text-muted)">ACCURACY</div>
        </div>
      </div>
    `;
  }).join('');
}

export function mountParentDashboard() {
  window._syncCloud = async () => {
    const btn = event?.target;
    if (btn) btn.innerHTML = '🔄 SYNCING...';
    try {
      const success = await forceSyncFromCloud();
      if (btn) {
        btn.innerHTML = success ? '✅ SYNCED' : '❌ FAILED';
        setTimeout(() => { btn.innerHTML = '🔄 LIVE SYNC'; }, 2000);
      }
    } catch (err) {
      if (btn) btn.innerHTML = '❌ ERROR';
    }
  };

  window._sendInvite = () => {
    const name = document.getElementById('invite-name')?.value;
    const email = document.getElementById('invite-email')?.value;
    const role = document.getElementById('invite-role')?.value;
    if (!name || !email) return alert("Enter name and email for the new member.");

    import('../../config/firebase.js').then(({ auth, database, ref, set }) => {
      const user = auth.currentUser;
      if (!user) return alert("Please login again to send invitations.");
      const inviteId = btoa(email.toLowerCase()).replace(/=/g, '');
      set(ref(database, 'invites/' + inviteId), {
        from: user.uid,
        fromEmail: user.email,
        toName: name,
        toEmail: email.toLowerCase(),
        role: role,
        timestamp: Date.now()
      }).then(() => {
        const baseUrl = window.location.href.split('#')[0];
        const deepLink = `${baseUrl}#/login?invite=${user.uid}&role=${role}`;
        alert("Invitation Mission Sent!\n\nLink for " + name + ":\n" + deepLink + "\n\n(Share this link with them)");
        document.getElementById('invite-name').value = '';
        document.getElementById('invite-email').value = '';
      }).catch(err => {
        alert("Failed to secure connection. Try again.");
      });
    });
  };

  window._setGoal = () => {
    const type = document.getElementById('goal-type').value;
    const target = document.getElementById('goal-target').value;
    const reward = document.getElementById('goal-reward').value;
    if (!target || !reward) return alert("Please specify target and reward.");
    setParentGoal(type, target, reward);
    alert("Mission Broadcasted! " + (type === 'sessions' ? `Target: ${target} sessions` : ''));
  };

  window._cancelGoal = () => {
    if (confirm("Cancel this challenge? Progress will be lost.")) {
      const progress = getProgress();
      progress.parentGoal = null;
      updateProgress(progress);
    }
  };
}
