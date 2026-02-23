
import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../../engine/progressStore.js';
import { getSubjectMastery, getWeakTopics } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS } from '../../engine/questionBank.js';

export function renderParentDashboard() {
  const progress = getProgress();
  const name = progress.studentName || 'Student';
  const sessions = progress.sessions || [];

  const today = sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const week = sessions.filter(s => Date.now() - new Date(s.date) < 7 * 86400000);
  const avgScore = week.length
    ? Math.round(week.reduce((s, x) => s + x.score, 0) / week.length)
    : 0;

  const subLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Mathematics' };
  const subColors = { vr: 'var(--c-vr)', nvr: 'var(--c-nvr)', en: 'var(--c-en)', maths: 'var(--c-maths)' };

  return `
<div class="page page-enter parent-dashboard">
  <h1 class="page-title">📊 Parent Dashboard</h1>
  <p class="page-subtitle">Monitoring ${name}'s 11+ Journey</p>

  <!-- Stats row -->
  <div class="stats-row" style="margin-bottom:28px">
    <div class="stat-card">
      <div class="stat-value" style="color:#a78bfa">${today.length}</div>
      <div class="stat-label">Today's Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#34d399">${progress.streak || 0}🔥</div>
      <div class="stat-label">Day Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#f59e0b">${avgScore}%</div>
      <div class="stat-label">Weekly Avg</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#67e8f9">${progress.xp || 0}</div>
      <div class="stat-label">Total XP</div>
    </div>
  </div>

  <!-- Reports card -->
  <div class="card" style="margin-bottom:24px;border-color:rgba(108,99,255,0.35)">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:12px">📧 Progress Reports</h3>
    <p style="color:var(--c-text-muted);font-size:14px;margin-bottom:16px">Generate a report to review or share with teachers.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('daily')">👁 Daily Report</button>
      <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('weekly')">📅 Weekly Report</button>
      <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('monthly')">📆 Monthly Report</button>
    </div>
  </div>

  <!-- Subject Mastery -->
  <h2 class="section-title">📚 Subject Mastery</h2>
  <div class="subject-grid">
    ${Object.values(SUBJECTS).map(sub => {
    const mastery = getSubjectMastery(sub);
    const color = SUBJECT_COLORS[sub].start;
    const colorEnd = SUBJECT_COLORS[sub].end;
    const weak = getWeakTopics(sub);
    return `
      <div class="card">
        <div style="font-size:28px;margin-bottom:8px">${{ vr: '🔤', nvr: '🔷', en: '📖', maths: '🔢' }[sub]}</div>
        <strong style="font-family:var(--font-heading)">${SUBJECT_LABELS[sub]}</strong>
        <div class="accuracy-bar" style="margin:10px 0">
          <div class="accuracy-fill" style="width:${mastery}%;background:linear-gradient(90deg,${color},${colorEnd})"></div>
        </div>
        <div style="font-size:13px;font-weight:700;color:${colorEnd}">${mastery}% mastery</div>
        ${weak.length ? `<div style="font-size:12px;color:var(--c-text-muted);margin-top:4px">⚠️ Weak: ${weak[0].topic}</div>`
        : `<div style="font-size:12px;color:var(--c-success);margin-top:4px">✅ Progressing well</div>`}
      </div>`;
  }).join('')}
  </div>

  <!-- Recent sessions -->
  <h2 class="section-title" style="margin-top:32px">📋 Recent Sessions</h2>
  <div class="card" style="padding:0;overflow:hidden">
    ${sessions.length === 0
      ? '<div style="padding:24px;text-align:center;color:var(--c-text-muted)">No sessions yet. Encourage ' + name + ' to start practising!</div>'
      : [...sessions].reverse().slice(0, 8).map(s => {
        const d = new Date(s.date);
        const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const scoreC = s.score >= 80 ? 'var(--c-success)' : s.score >= 60 ? 'var(--c-accent)' : 'var(--c-danger)';
        return `
        <div class="report-row" style="padding:14px 20px">
          <div>
            <div style="font-weight:700;font-size:14px">${SUBJECT_LABELS[s.subject] || s.subject}</div>
            <div style="font-size:12px;color:var(--c-text-muted)">${dateStr} · ${s.total} questions</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:900;font-size:17px;color:${scoreC}">${s.score}%</div>
            <div style="font-size:12px;color:var(--c-text-muted)">+${s.xpGained || 0} XP</div>
          </div>
        </div>`;
      }).join('')}
  </div>

  <!-- Go back -->
  <div style="margin-top:32px;text-align:center">
    <button class="btn btn-outline" onclick="window.router.navigate('#/student/home')">← Back to Student View</button>
  </div>
</div>

<!-- Report preview modal -->
<div id="report-modal" class="email-modal hidden">
  <div class="email-box">
    <div class="email-header">
      <h3 id="report-modal-title">Report Preview</h3>
      <button class="close-btn" onclick="document.getElementById('report-modal').classList.add('hidden')">✕</button>
    </div>
    <div class="email-body" id="report-modal-body"></div>
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
}
