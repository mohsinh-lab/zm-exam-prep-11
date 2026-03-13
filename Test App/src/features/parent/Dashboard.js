
import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport, forceSyncFromCloud, updateProgress } from '../../engine/progressStore.js';
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
      <button onclick="window._syncCloud()" class="btn btn-primary btn-sm pulse-glow" style="border-radius: 12px;">🔄 LIVE SYNC</button>
      <img src="ace-mascot.png" alt="Mission Control" class="desktop-only" style="width: 100px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));">
    </div>
  </div>

  ${isVerified ? `
  <!-- Readiness Gauge -->
  <div class="card hover-lift" style="margin-bottom: 32px; background: var(--c-primary-grad); border: none; color: white; position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
    <!-- Character Companion -->
    <img src="ace-mascot.png" alt="Ace Mascot" class="desktop-only" 
         style="position: absolute; right: 0; bottom: -40px; width: 380px; z-index: 1; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.35)); transition: transform 0.3s ease-out;"
         onmouseover="this.style.transform='scale(1.05) translateY(-5px)'" 
         onmouseout="this.style.transform='scale(1) translateY(0)'">
    <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; position: relative; z-index: 2;">
      <div>
        <h3 style="font-family: var(--font-heading); font-weight: 900; margin: 0; font-size: 22px; letter-spacing: -0.5px;">PREDICTIVE READINESS</h3>
        <p style="font-size: 13px; opacity: 0.9; font-weight: 700; background: rgba(0,0,0,0.1); display: inline-block; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">Target Exam: ${targetDate}</p>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 40px; font-weight: 900; line-height: 1; text-shadow: 0 4px 10px rgba(0,0,0,0.2);">${readiness}%</div>
        <div style="font-size: 11px; font-weight: 800; opacity: 0.8; text-transform: uppercase; margin-top: 4px;">Confidence Score</div>
      </div>
    </div>
    <div style="background: rgba(0,0,0,0.15); height: 14px; border-radius: 7px; overflow: hidden; margin-bottom: 12px; position: relative; z-index: 2; border: 1px solid rgba(255,255,255,0.1);">
      <div style="width: ${readiness}%; background: var(--c-accent); height: 100%; box-shadow: 0 0 20px var(--c-accent);"></div>
    </div>
    <div style="font-size: 13px; font-weight: 800; text-align: center; background: rgba(255,255,255,0.15); padding: 8px; border-radius: 8px; position: relative; z-index: 2;">
      ${readiness >= 85 ? '🌟 ELITE: Meeting competitive school benchmarks' : readiness >= 65 ? '📈 ON TRACK: Approaching qualifying scores' : '⚠️ BOOST NEEDED: Critical readiness gaps detected'}
    </div>
  </div>

  <!-- Dynamic Action Plan -->
  <div class="card" style="margin-bottom: 32px; background: white; border-left: 8px solid #f59e0b; box-shadow: var(--shadow-md);">
    <h3 style="color: #b45309; font-family: var(--font-heading); font-weight: 900; margin-bottom: 8px;">📅 TANGIBLE ACTION PLAN</h3>
    <p style="color: var(--c-text-muted); font-size: 14px; font-weight: 700; margin-bottom: 16px;">${actionPlan.narrative}</p>
    <div style="display: grid; gap: 10px;">
      ${actionPlan.steps.map(step => `
        <div style="display: flex; gap: 12px; align-items: flex-start; background: #fffbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #fbbf24;">
          <span style="font-size: 18px;">✅</span>
          <span style="font-size: 13px; font-weight: 800; color: #92400e;">${step}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${!isVerified ? `
  <!-- Gated / Unverified State -->
  <div class="card" data-testid="parent-gated-container" style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border: 2px dashed #fecaca; padding: 40px; text-align: center; margin-bottom: 32px;">
    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
    <h2 style="color: #991b1b; font-family: var(--font-heading); font-weight: 900; margin-bottom: 12px;">DASHBOARD PENDING</h2>
    <p style="color: #b91c1c; font-weight: 600; max-width: 400px; margin: 0 auto 24px;">Your analytics, session logs, and mastery charts are locked until a student is linked to your account.</p>
    <div style="display: inline-block; background: white; padding: 12px 20px; border-radius: 12px; border: 1px solid #fecaca; color: #b91c1c; font-size: 14px; font-weight: 800;">
      Step 1: Invite your student below using their Google Email
    </div>
  </div>
  ` : `
  <!-- Stats row -->
  <div class="stats-row" style="margin-bottom:32px">
    <div class="stat-card" style="background: white; border-bottom: 8px solid #818cf8;">
      <div class="stat-value" style="color:#4f46e5">${today.length}</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">TODAY</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #4ade80;">
      <div class="stat-value" style="color:#16a34a">${progress.streak || 0}🔥</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">STREAK</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #fb923c;">
      <div class="stat-value" style="color:#ea580c">${avgScore}%</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">AVG SCORE</div>
    </div>
    <div class="stat-card" style="background: white; border-bottom: 8px solid #22d3ee;">
      <div class="stat-value" style="color:#0891b2">${progress.xp || 0}</div>
      <div class="stat-label" style="font-weight: 800; color: var(--c-text-muted)">XP</div>
    </div>
  </div>

  <!-- Reports card -->
  <div class="card" style="margin-bottom:32px; background: white; border: none; border-left: 8px solid var(--c-primary); box-shadow: var(--shadow-md);">
    <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; margin-bottom:12px">📧 PROGRESS REPORTS</h3>
    <p style="color: var(--c-text-muted); font-size: 14px; font-weight: 600; margin-bottom: 20px;">Send a detailed snapshot of ${name}'s progress to your email.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" style="border-width: 2px;" onclick="window._previewParentReport('daily')">👁 DAILY</button>
      <button class="btn btn-outline btn-sm" style="border-width: 2px;" onclick="window._previewParentReport('weekly')">📅 WEEKLY</button>
      <button class="btn btn-outline btn-sm" style="border-width: 2px;" onclick="window._previewParentReport('monthly')">📆 MONTHLY</button>
    </div>
  </div>

  <!-- Subject Mastery -->
  <h2 class="section-title" style="color: var(--c-text); margin-bottom: 20px; font-family: var(--font-heading);">📚 SUBJECT MASTERY</h2>
  <div class="subject-grid">
    ${Object.values(SUBJECTS).map(sub => {
    const mastery = getSubjectMastery(sub);
    const color = SUBJECT_COLORS[sub].start;
    const weak = getWeakTopics(sub);
    return `
      <div class="card" style="background: white; border: none; border-bottom: 6px solid ${color};">
        <div style="font-size:32px; margin-bottom:12px;">${{ vr: '🔤', nvr: '🔷', en: '📖', maths: '🔢' }[sub]}</div>
        <div style="color: var(--c-text); font-weight: 900; font-family: var(--font-heading);">${SUBJECT_LABELS[sub].toUpperCase()}</div>
        <div class="accuracy-bar" style="margin:12px 0; background: #eee; height: 10px; border-radius: 5px;">
          <div class="accuracy-fill" style="width:${mastery}%; background:${color}; border-radius: 5px;"></div>
        </div>
        <div style="font-size:13px; font-weight: 800; color:${color}">${mastery}% MASTERY</div>
        ${weak.length ? `<div style="font-size:11px; color: var(--c-danger); font-weight: 700; margin-top:6px;">⚠️ WEAK: ${weak[0].topic.toUpperCase()}</div>`
        : `<div style="font-size:11px; color: var(--c-success); font-weight: 700; margin-top:6px;">✅ ON TRACK</div>`}
      </div>`;
  }).join('')}
  </div>

  <!-- Recent sessions -->
  <h2 class="section-title" style="color: var(--c-text); margin-top:40px; margin-bottom: 20px; font-family: var(--font-heading);">📋 LOG BOOK</h2>
  <div class="card" style="padding:0; overflow:hidden; margin-bottom:40px; background: white; border: none; box-shadow: var(--shadow-md);">
    ${sessions.length === 0
      ? '<div style="padding:32px; text-align:center; color: var(--c-text-muted); font-weight: 700;">No sessions recorded yet!</div>'
      : [...sessions].reverse().slice(0, 8).map(s => {
        const d = new Date(s.date);
        const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const scoreC = s.score >= 80 ? 'var(--c-success)' : s.score >= 60 ? 'var(--c-accent)' : 'var(--c-danger)';
        return `
        <div class="report-row" style="padding:16px 24px; border-bottom: 1px solid #f0f0f0;">
          <div>
            <div style="font-weight:900; font-size:14px; color: var(--c-text);">${SUBJECT_LABELS[s.subject]?.toUpperCase() || s.subject.toUpperCase()}</div>
            <div style="font-size:12px; color: var(--c-text-muted); font-weight: 600;">${dateStr} · ${s.total} Qs</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:900; font-size:18px; color:${scoreC}">${s.score}%</div>
            <div style="font-size:12px; color: var(--c-text-muted); font-weight: 700;">+${s.xpGained || 0} XP</div>
          </div>
        </div>`;
      }).join('')}
  </div>
  `}
  <!-- Family Management & Settings -->
  <h2 class="section-title" style="color: var(--c-text); margin-bottom: 20px; font-family: var(--font-heading);">👨‍👩‍👧‍👦 FAMILY & SETTINGS</h2>
  
  <div class="card" style="margin-bottom:24px; background: white; border: none; border-left: 8px solid #8b5cf6; box-shadow: var(--shadow-md);">
    <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; margin-bottom:12px">💌 INVITE A FAMILY MEMBER</h3>
    <p style="color: var(--c-text-muted); font-size: 14px; font-weight: 600; margin-bottom: 20px;">Link a new Student to monitor, or invite a Co-Parent to share this dashboard.</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
      <div class="input-group">
        <label class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">MEMBER'S NAME</label>
        <input type="text" id="invite-name" class="input-field" style="border-width: 2px;" placeholder="e.g. Zayyan">
      </div>
      <div class="input-group">
        <label class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">GOOGLE EMAIL ADDRESS</label>
        <input type="email" id="invite-email" class="input-field" style="border-width: 2px;" placeholder="name@gmail.com">
      </div>
    </div>
    
    <div class="input-group" style="margin-bottom: 20px;">
      <label class="input-label" style="color: var(--c-text); font-weight: 800; font-size: 12px;">ROLE</label>
      <select id="invite-role" class="input-field" style="border-width: 2px; height: 48px; background: white;">
        <option value="student">🎓 Student (I want to monitor their progress)</option>
        <option value="parent">👨‍👩‍👧 Co-Parent (They should see this dashboard)</option>
      </select>
    </div>

    <button class="btn btn-primary" data-testid="parent-invite-btn" style="width: 100%; border-bottom: 4px solid rgba(0,0,0,0.2); background: #8b5cf6;" onclick="window._sendInvite()">📩 GENERATE INVITE LINK</button>
  </div>

  <div class="card" style="margin-bottom:40px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; background: white; border: none; box-shadow: var(--shadow-md);">
    <div style="flex: 1;">
      <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; margin-bottom:12px">⚙️ REPORT SETTINGS</h3>
      <div class="input-group">
        <label class="input-label" style="color: var(--c-text); font-weight: 900;">PRIMARY STUDENT NAME (FOR PDF)</label>
        <input type="text" id="parent-student-name" class="input-field" style="border-width: 2px;" value="${progress.studentName}" placeholder="e.g. Zayyan Mohsin">
      </div>
      <button class="btn btn-primary" style="width: 100%; border-bottom: 4px solid rgba(0,0,0,0.2);" onclick="window._saveProfile()">SAVE PREFERENCES</button>
    </div>
    <div style="flex: 1; border-left: 1px solid #f0f0f0; padding-left: 32px;">
      <h3 style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; margin-bottom:12px">🎯 GOAL SETTINGS</h3>
      <div class="input-group">
        <label class="input-label" style="color: var(--c-text); font-weight: 900;">POSTCODE (FOR CATCHMENT)</label>
        <input type="text" id="parent-postcode" class="input-field" style="border-width: 2px;" value="${progress.goals?.postcode || ''}" placeholder="e.g. B15">
      </div>
      <div class="input-group">
        <label class="input-label" style="color: var(--c-text); font-weight: 900;">EXAM DATE</label>
        <input type="date" id="parent-exam-date" class="input-field" style="border-width: 2px;" value="${progress.goals?.examDate || ''}">
      </div>
      <button class="btn btn-outline" style="width: 100%; border-bottom: 4px solid rgba(0,0,0,0.1);" onclick="window._saveGoals()">UPDATE CATCHMENT GOALS</button>
    </div>
  </div>

  <div style="padding-bottom:100px; text-align:center">
    <button class="btn btn-outline" style="border-color: var(--c-border); color: var(--c-text-muted);" onclick="window._handleAuthLogout()">🚪 SECURE LOGOUT</button>
  </div>
</div>
  <!-- Report preview modal -->
  <div id="report-modal" class="email-modal hidden">
    <div class="email-box">
      <div class="email-header">
        <h3 id="report-modal-title">Report Preview</h3>
        <button class="close-btn" onclick="document.getElementById('report-modal').classList.add('hidden')">✕</button>
      </div>
      <div class="email-body" id="report-modal-body" style="white-space: pre-wrap; font-family: monospace; font-size: 13px; color: #333; height: 300px; overflow-y: auto; padding: 16px; background: #f9f9f9; border-radius: 8px;"></div>
      <div class="email-footer">
        <button class="btn btn-outline btn-sm" onclick="window._copyReport()">📋 Copy Text</button>
        <button class="btn btn-primary btn-sm" onclick="window._mailReport()">📧 Open in Mail</button>
      </div>
    </div>
  </div>
`;
}

export function mountParentDashboard() {
  window._previewParentReport = (type) => {
    const progress = getProgress();
    const name = progress.studentName || 'Student';

    const reports = {
      daily: generateDailyReport(name),
      weekly: generateWeeklyReport(name),
      monthly: generateMonthlyReport(name),
    };
    const titles = { daily: '📧 Daily Report', weekly: '📅 Weekly Report', monthly: '📆 Monthly Report' };

    const titleEl = document.getElementById('report-modal-title');
    const bodyEl = document.getElementById('report-modal-body');
    const modal = document.getElementById('report-modal');

    if (titleEl) titleEl.textContent = titles[type] || 'Report';
    if (bodyEl) bodyEl.textContent = reports[type] || 'No data available yet.';
    if (modal) modal.classList.remove('hidden');

    window._currentReport = reports[type];
    window._currentReportType = type;
  };

  window._copyReport = () => {
    if (window._currentReport) {
      navigator.clipboard.writeText(window._currentReport)
        .then(() => alert('✅ Report copied to clipboard!'))
        .catch(() => alert('Could not copy. Please select and copy manually.'));
    }
  };

  window._mailReport = () => {
    const progress = getProgress();
    const email = progress.parentEmail || '';
    const typeMap = { daily: 'Daily 11+ Progress Update', weekly: 'Weekly 11+ Progress Report', monthly: 'Monthly 11+ Progress Overview' };
    const subject = encodeURIComponent(typeMap[window._currentReportType] || '11+ Progress Report');
    const body = encodeURIComponent(window._currentReport || '');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  window._saveProfile = () => {
    const name = document.getElementById('parent-student-name').value;
    const email = document.getElementById('parent-emails').value;
    const progress = getProgress();

    progress.studentName = name;
    progress.parentEmail = email;

    updateProgress(progress);
    console.log(`[Audit] Parent updated student profile: ${name}`);
    alert('✅ Student profile updated & synced!');
    window.router.handleRoute(); // Refresh
  };

  window._saveGoals = () => {
    const postcode = document.getElementById('parent-postcode').value.trim();
    const examDate = document.getElementById('parent-exam-date').value;
    const progress = getProgress();

    if (!progress.goals) progress.goals = {};
    progress.goals.postcode = postcode;
    progress.goals.examDate = examDate;

    // Trigger immediate refresh of catchment data
    const schools = getCatchmentSchools(postcode);
    progress.goals.targetSchools = schools;

    updateProgress(progress);
    console.log(`[Audit] Parent updated catchment goals: ${postcode}, Exam: ${examDate}`);
    alert('🎯 Goals updated! Catchment schools and readiness scores have been recalibrated.');
    window.router.handleRoute();
  };

  window._syncCloud = async (silent = false) => {
    let btn = null;
    let ogText = '';

    // Only mess with the button if we clicked it manually
    if (!silent && event && event.currentTarget) {
      btn = event.currentTarget;
      ogText = btn.innerText;
      btn.innerText = '🔄 SYNCING...';
    }

    const success = await forceSyncFromCloud();

    if (success) {
      window.router.handleRoute(); // Refresh dashboard with new data
      if (!silent) alert("✅ Dashboard successfully synced with Zayyan's iPad!");
    } else {
      if (!silent) {
        if (btn) btn.innerText = ogText;
        alert("⚠️ No new data found in the cloud or sync failed.");
      }
    }
  };

  window._handleAuthLogout = () => {
    window._handleLogout(); // use the global logout in app.js
  };

  window._sendInvite = async () => {
    const name = document.getElementById('invite-name').value.trim();
    const email = document.getElementById('invite-email').value.trim().toLowerCase();
    const role = document.getElementById('invite-role').value;

    if (!name || !email) {
      alert("Please enter both a name and an email address.");
      return;
    }

    // Try to get current authenticated parent UID
    let parentUid = null;
    let parentName = "Your Parent/Guardian";
    try {
      const user = JSON.parse(localStorage.getItem('aceprep_user'));
      if (user && user.uid) {
        parentUid = user.uid;
        if (user.displayName) parentName = user.displayName;
      }
    } catch (e) { }

    if (!parentUid) {
      alert("Could not verify your Parent identity. Try refreshing or logging in again.");
      return;
    }

    try {
      // 1. Save Intent to Firebase
      const { database, ref, set } = await import('../../config/firebase.js');
      // Format email for DB key safely
      const safeEmail = email.replace(/[.#$[\]]/g, '_');
      const inviteRef = ref(database, 'users/' + parentUid + '/pending_invites/' + safeEmail);

      await set(inviteRef, {
        name: name,
        email: email,
        role: role,
        timestamp: Date.now()
      });
      console.log(`[Audit] Pending invite created for ${email} as ${role}`);

      // 2. Generate mailto: Deep Link
      // Ensure absolute URL if deployed, fallback to local for dev
      const baseUrl = window.location.href.split('#')[0];
      const deepLink = `${baseUrl}#/login?invite=${parentUid}&role=${role}`;

      const roleText = role === 'student' ? 'Student' : 'Co-Parent';
      const subject = encodeURIComponent(`You've been invited to AcePrep 11+ as a ${roleText}!`);
      const bodyText = `Hi ${name},\n\n${parentName} has invited you to join the AcePrep 11+ Dashboard as a ${roleText}.\n\nPlease click the link below to accept the invitation and sign in securely with your Google account:\n\n${deepLink}\n\nHappy studying!`;

      const body = encodeURIComponent(bodyText);

      // Open Mail App
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

      // Clear inputs
      document.getElementById('invite-name').value = '';
      document.getElementById('invite-email').value = '';

    } catch (err) {
      console.error("Failed to generate invite:", err);
      alert("Something went wrong saving the invite to the database. Are you offline?");
    }
  };

  // Perform a silent auto-sync every time the dashboard is loaded
  setTimeout(() => window._syncCloud(true), 500);
}

