// pages/parent.js — Parent Dashboard with daily/weekly/monthly reports & notification setup

import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport, setParentEmail } from '../engine/progressStore.js';
import { getSubjectMastery, getWeakTopics } from '../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS } from '../engine/questionBank.js';

let activeTab = 'daily';

export function renderParent() {
  const progress = getProgress();
  const name = progress.studentName || 'Student';

  return `
<div class="page page-enter">
  <h1 class="page-title">📊 Parent Dashboard</h1>
  <p class="page-subtitle">Track ${name}'s 11+ preparation for Dream School</p>

  <!-- Email setup -->
  <div class="card" style="margin-bottom:24px;border-color:rgba(108,99,255,0.35)">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:12px">📧 Parent Email Reports</h3>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
      <div class="input-group" style="flex:1;min-width:240px;margin-bottom:0">
        <label class="input-label">Parent Email Address</label>
        <input type="email" class="input-field" id="parent-email-input"
          placeholder="parent@example.com"
          value="${progress.parentEmail || ''}" />
      </div>
      <button class="btn btn-primary" onclick="saveParentEmail()">Save Email</button>
    </div>
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="previewReport('daily')">👁 Preview Daily</button>
      <button class="btn btn-outline btn-sm" onclick="previewReport('weekly')">📅 Preview Weekly</button>
      <button class="btn btn-outline btn-sm" onclick="previewReport('monthly')">📆 Preview Monthly</button>
    </div>
    <div style="margin-top:10px;font-size:13px;color:var(--c-text-muted)">
      💡 Reports are professionally drafted and sent via your email client when you tap Preview → Copy.
    </div>
  </div>

  <!-- Overview stats -->
  <div class="stats-row" style="margin-bottom:24px">
    ${renderParentStats(progress)}
  </div>

  <!-- Tab bar -->
  <div class="tab-bar">
    <button class="tab-btn ${activeTab === 'daily' ? 'active' : ''}" onclick="switchParentTab('daily')">Daily</button>
    <button class="tab-btn ${activeTab === 'weekly' ? 'active' : ''}" onclick="switchParentTab('weekly')">Weekly</button>
    <button class="tab-btn ${activeTab === 'monthly' ? 'active' : ''}" onclick="switchParentTab('monthly')">Monthly</button>
  </div>

  <div id="parent-tab-content">
    ${renderParentTab(activeTab, progress)}
  </div>

  <!-- Subject deep-dive -->
  <h2 class="section-title" style="margin-top:32px">📚 Subject Performance</h2>
  ${renderSubjectBreakdown(progress)}

  <!-- Focus & Time analytics -->
  <h2 class="section-title" style="margin-top:32px">🧠 Learning Behaviour Analytics</h2>
  ${renderBehaviourAnalytics(progress)}

</div>

<!-- Email preview modal -->
<div class="email-modal hidden" id="email-modal">
  <div class="email-box">
    <div class="email-header">
      <h3 id="email-modal-title">Report Preview</h3>
      <button class="close-btn" onclick="document.getElementById('email-modal').classList.add('hidden')">✕</button>
    </div>
    <div class="email-body" id="email-modal-body"></div>
    <div class="email-footer">
      <button class="btn btn-outline btn-sm" onclick="copyReport()">📋 Copy to Clipboard</button>
      <button class="btn btn-primary btn-sm" onclick="mailReport()">📧 Open in Mail</button>
    </div>
    </div>
</div>`;
}

export function mountParent() {
  window.switchParentTab = function (tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    const progress = JSON.parse(localStorage.getItem('11plus_progress') || '{}');
    const root = document.getElementById('parent-tab-content');
    if (root) root.innerHTML = renderParentTab(tab, progress);
  };

  window.saveParentEmail = function () {
    const email = document.getElementById('parent-email-input').value;
    const p = JSON.parse(localStorage.getItem('11plus_progress') || '{}');
    p.parentEmail = email;
    localStorage.setItem('11plus_progress', JSON.stringify(p));
    alert('✅ Email saved! You can now preview reports.');
  };

  window.previewReport = function (type) {
    const p = JSON.parse(localStorage.getItem('11plus_progress') || '{}');
    const name = p.studentName || 'Student';
    const titles = { daily: 'Daily Report', weekly: 'Weekly Report', monthly: 'Monthly Report' };
    const modalTitle = document.getElementById('email-modal-title');
    if (modalTitle) modalTitle.textContent = '📧 ' + titles[type];

    const reports = {
      daily: window._genDaily ? window._genDaily(name) : 'No data yet.',
      weekly: window._genWeekly ? window._genWeekly(name) : 'No data yet.',
      monthly: window._genMonthly ? window._genMonthly(name) : 'No data yet.',
    };
    const modalBody = document.getElementById('email-modal-body');
    if (modalBody) modalBody.textContent = reports[type];

    const modal = document.getElementById('email-modal');
    if (modal) modal.classList.remove('hidden');

    window._currentReportText = reports[type];
    window._currentReportType = type;
  };

  window.copyReport = function () {
    if (window._currentReportText) navigator.clipboard.writeText(window._currentReportText);
    alert('✅ Report copied to clipboard!');
  };

  window.mailReport = function () {
    const p = JSON.parse(localStorage.getItem('11plus_progress') || '{}');
    const email = p.parentEmail || '';
    const titles = { daily: 'Daily 11+ Progress Update', weekly: 'Weekly 11+ Progress Report', monthly: 'Monthly 11+ Progress Overview' };
    const subject = encodeURIComponent(titles[window._currentReportType] || '11+ Progress Report');
    const body = encodeURIComponent(window._currentReportText || '');
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  };
}


function renderParentStats(p) {
  const sessions = p.sessions || [];
  const today = sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const week = sessions.filter(s => Date.now() - new Date(s.date) < 7 * 86400000);
  const avgScore = week.length
    ? Math.round(week.reduce((s, x) => s + x.score, 0) / week.length)
    : 0;
  return `
    <div class="stat-card"><div class="stat-value" style="color:#a78bfa">${today.length}</div><div class="stat-label">Today's Sessions</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#34d399">${p.streak || 0}🔥</div><div class="stat-label">Day Streak</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#f59e0b">${avgScore}%</div><div class="stat-label">Weekly Avg Score</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#67e8f9">${p.xp || 0}</div><div class="stat-label">Total XP</div></div>
  `;
}

function renderParentTab(tab, p) {
  const sessions = p.sessions || [];
  const now = Date.now();
  const rangeMs = tab === 'daily' ? 86400000 : tab === 'weekly' ? 7 * 86400000 : 30 * 86400000;
  const filtered = sessions.filter(s => now - new Date(s.date) < rangeMs);

  if (!filtered.length) {
    return `<div class="card" style="text-align:center;padding:40px;color:var(--c-text-muted)">
      No sessions recorded in this period yet. Encourage ${p.studentName || 'the student'} to start practising!
    </div>`;
  }

  const totalQ = filtered.reduce((s, x) => s + x.total, 0);
  const correct = filtered.reduce((s, x) => s + x.correct, 0);
  const avgScore = Math.round((correct / totalQ) * 100);
  const subjects = [...new Set(filtered.map(s => s.subject))];
  const subLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Mathematics' };

  return `
  <div class="report-card">
    <div class="report-row"><span class="report-label">Sessions</span><span class="report-value">${filtered.length}</span></div>
    <div class="report-row"><span class="report-label">Questions Answered</span><span class="report-value">${totalQ}</span></div>
    <div class="report-row"><span class="report-label">Overall Accuracy</span><span class="report-value" style="color:${avgScore >= 75 ? 'var(--c-success)' : avgScore >= 55 ? 'var(--c-accent)' : 'var(--c-danger)'}">${avgScore}%</span></div>
    <div class="report-row"><span class="report-label">Subjects Covered</span><span class="report-value">${subjects.map(s => subLabels[s] || s).join(', ')}</span></div>
    <div style="margin-top:12px">
      <div class="accuracy-bar"><div class="accuracy-fill" style="width:${avgScore}%;background:${avgScore >= 75 ? 'var(--c-success)' : avgScore >= 55 ? '#f59e0b' : 'var(--c-danger)'}"></div></div>
    </div>
    ${avgScore < 60 ? '<div style="margin-top:12px;padding:12px;background:rgba(239,68,68,0.08);border-radius:10px;font-size:13px;border-left:3px solid var(--c-danger)">⚠️ Accuracy below 60% — consider sitting with your child for a session to identify specific sticking points.</div>' : ''}
  </div>`;
}

function renderSubjectBreakdown(p) {
  return `<div class="subject-grid">${Object.values(SUBJECTS).map(sub => {
    const mastery = getSubjectMastery(sub);
    const weak = getWeakTopics(sub);
    const c = SUBJECT_COLORS[sub];
    return `
    <div class="card">
      <div style="font-size:28px;margin-bottom:8px">${{ vr: '🔤', nvr: '🔷', en: '📖', maths: '🔢' }[sub]}</div>
      <div style="font-weight:800;font-family:var(--font-heading);margin-bottom:4px">${SUBJECT_LABELS[sub]}</div>
      <div class="accuracy-bar" style="margin:10px 0">
        <div class="accuracy-fill" style="width:${mastery}%;background:linear-gradient(90deg,${c.start},${c.end})"></div>
      </div>
      <div style="font-weight:700;color:${c.end}">${mastery}% mastery</div>
      ${weak.length ? `<div style="font-size:12px;color:var(--c-text-muted);margin-top:6px">⚠️ Weak: ${weak[0].topic} (${weak[0].mastery}%)</div>` : '<div style="font-size:12px;color:var(--c-success);margin-top:6px">✅ All topics progressing</div>'}
    </div>`;
  }).join('')}</div>`;
}

function renderBehaviourAnalytics(p) {
  const sessions = p.sessions || [];
  if (!sessions.length) return '<div class="card" style="color:var(--c-text-muted);text-align:center;padding:30px">Complete some sessions to see learning behaviour data.</div>';

  const avgTime = Math.round(sessions.reduce((s, x) => s + (x.timeTaken || 0), 0) / sessions.length / 10);
  const subSess = { vr: 0, nvr: 0, en: 0, maths: 0 };
  sessions.forEach(s => { if (subSess[s.subject] !== undefined) subSess[s.subject]++; });
  const preferred = Object.entries(subSess).sort((a, b) => b[1] - a[1])[0]?.[0];
  const avoided = Object.entries(subSess).sort((a, b) => a[1] - b[1])[0]?.[0];
  const subLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Mathematics' };

  return `
  <div class="card">
    <div class="report-row"><span class="report-label">Avg Session Length</span><span class="report-value">${avgTime} min</span></div>
    <div class="report-row"><span class="report-label">Most Practised Subject</span><span class="report-value" style="color:var(--c-success)">${subLabels[preferred] || '—'}</span></div>
    <div class="report-row"><span class="report-label">Least Practised Subject</span><span class="report-value" style="color:var(--c-danger)">${subLabels[avoided] || '—'}</span></div>
    <div class="report-row"><span class="report-label">Focus Issues (tab-away events)</span><span class="report-value">${p.focusWarnings || 0}</span></div>
    ${(subSess[avoided] || 0) < 2 ? `
    <div style="margin-top:12px;padding:12px;background:rgba(245,158,11,0.08);border-radius:10px;font-size:13px;border-left:3px solid var(--c-accent)">
      💡 ${subLabels[avoided]} has low practice — encourage at least one session in this subject this week. Ilford County tests all 4 subjects equally!
    </div>` : ''}
  </div>`;
}
