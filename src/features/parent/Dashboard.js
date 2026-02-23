
import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../../engine/progressStore.js';
import { getSubjectMastery, getWeakTopics } from '../../engine/adaptiveEngine.js';
import { SUBJECTS, SUBJECT_LABELS, SUBJECT_COLORS } from '../../engine/questionBank.js';

export function renderParentDashboard() {
    const progress = getProgress();
    const name = progress.studentName || 'Student';

    return `
<div class="page page-enter parent-dashboard">
  <h1 class="page-title">📊 Parent Dashboard</h1>
  <p class="page-subtitle">Monitoring ${name}'s 11+ Journey</p>

  <div class="card" style="margin-bottom:24px">
    <h3>📧 Reports</h3>
    <p>Generate a summary to share via email.</p>
    <div style="display:flex; gap:10px; margin-top:10px">
        <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('daily')">Daily</button>
        <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('weekly')">Weekly</button>
        <button class="btn btn-outline btn-sm" onclick="window._previewParentReport('monthly')">Monthly</button>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">${progress.streak || 0}🔥</div>
      <div class="stat-label">Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${progress.xp || 0}</div>
      <div class="stat-label">Total XP</div>
    </div>
  </div>

  <h2 class="section-title">Subject Mastery</h2>
  <div class="subject-grid">
    ${Object.values(SUBJECTS).map(sub => {
        const mastery = getSubjectMastery(sub);
        const color = SUBJECT_COLORS[sub].start;
        return `
      <div class="card">
        <strong>${SUBJECT_LABELS[sub]}</strong>
        <div class="accuracy-bar"><div class="accuracy-fill" style="width:${mastery}%; background:${color}"></div></div>
        <div style="font-size:12px; margin-top:5px">${mastery}% Mastery</div>
      </div>`;
    }).join('')}
  </div>
</div>`;
}

export function mountParentDashboard() {
    window._previewParentReport = (type) => {
        const progress = getProgress();
        const name = progress.studentName || 'Student';
        let report = '';
        if (type === 'daily') report = generateDailyReport(name);
        if (type === 'weekly') report = generateWeeklyReport(name);
        if (type === 'monthly') report = generateMonthlyReport(name);
        alert(report);
    };
}
