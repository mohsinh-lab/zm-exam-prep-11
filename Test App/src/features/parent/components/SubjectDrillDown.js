/**
 * Subject Drill-Down View — detailed per-subject analytics
 */
import { getProgress } from '../../../engine/progressStore.js';
import { SUBJECT_NAMES, SUBJECT_COLORS, SUBJECT_KEYS } from '../services/dashboardService.js';

/**
 * Calculate skill category breakdown for a subject.
 * @param {Array} sessions
 * @param {string} subject
 * @returns {Array<{category, accuracy, count}>}
 */
export function getSkillBreakdown(sessions, subject) {
  const subSessions = sessions.filter(s => s.subject === subject);
  const byCategory = {};
  subSessions.forEach(s => {
    const cat = s.category || s.topic || 'General';
    if (!byCategory[cat]) byCategory[cat] = { correct: 0, total: 0 };
    byCategory[cat].total++;
    if (s.score >= 70) byCategory[cat].correct++;
  });
  return Object.entries(byCategory).map(([category, v]) => ({
    category,
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    count: v.total,
  })).sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * Get top strengths and weaknesses for a subject.
 */
export function getStrengthsWeaknesses(sessions, subject) {
  const breakdown = getSkillBreakdown(sessions, subject);
  return {
    strengths: breakdown.filter(b => b.accuracy >= 70).slice(0, 3),
    weaknesses: breakdown.filter(b => b.accuracy < 70).slice(0, 3),
  };
}

/**
 * Render subject drill-down view.
 * @param {string} subject - subject key
 * @returns {string} HTML
 */
export function renderSubjectDrillDown(subject) {
  const progress = getProgress();
  const sessions = progress.sessions || [];
  const subSessions = sessions.filter(s => s.subject === subject);
  const name = SUBJECT_NAMES[subject] || subject;
  const color = SUBJECT_COLORS[subject] || 'var(--c-primary)';

  const totalQ = subSessions.reduce((s, x) => s + (x.total || 1), 0);
  const avgAcc = subSessions.length
    ? Math.round(subSessions.reduce((s, x) => s + x.score, 0) / subSessions.length)
    : 0;
  const avgTime = subSessions.length
    ? Math.round(subSessions.reduce((s, x) => s + (x.time || 0), 0) / subSessions.length / 1000)
    : 0;

  const breakdown = getSkillBreakdown(sessions, subject);
  const { strengths, weaknesses } = getStrengthsWeaknesses(sessions, subject);

  // Simple bar chart SVG
  const barChart = breakdown.length === 0
    ? `<p style="color:var(--c-text-muted);font-size:13px;font-weight:700">No category data yet.</p>`
    : `<div style="display:flex;flex-direction:column;gap:8px">
        ${breakdown.slice(0, 8).map(b => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <span style="font-size:12px;font-weight:700;color:var(--c-text)">${b.category}</span>
              <span style="font-size:12px;font-weight:900;color:${b.accuracy >= 70 ? 'var(--c-success)' : 'var(--c-danger)'}">${b.accuracy}%</span>
            </div>
            <div style="height:6px;background:rgba(0,0,0,0.06);border-radius:3px;overflow:hidden"
                 role="progressbar" aria-valuenow="${b.accuracy}" aria-valuemin="0" aria-valuemax="100"
                 aria-label="${b.category}: ${b.accuracy}%">
              <div style="width:${b.accuracy}%;height:100%;background:${b.accuracy >= 70 ? color : 'var(--c-danger)'};border-radius:3px;transition:width .4s"></div>
            </div>
          </div>`).join('')}
      </div>`;

  return `
<div class="page page-enter" style="color:var(--c-text);max-width:900px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap">
    <button onclick="window.router.navigate('#/parent/analytics')" class="btn btn-outline btn-sm" style="border-radius:10px" aria-label="Back to dashboard">← Back</button>
    <div style="width:12px;height:12px;border-radius:50%;background:${color}"></div>
    <h1 style="font-family:var(--font-heading);font-size:24px;color:var(--c-text)">${name} — Detailed Analysis</h1>
  </div>

  <!-- Summary metrics -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:16px;margin-bottom:28px">
    ${[
      { label: 'Avg Accuracy', value: `${avgAcc}%`, color },
      { label: 'Questions Done', value: totalQ },
      { label: 'Sessions', value: subSessions.length },
      { label: 'Avg Time/Q', value: avgTime ? `${avgTime}s` : 'N/A' },
    ].map(m => `
      <div style="padding:16px;background:white;border:1px solid var(--c-border);border-radius:14px;text-align:center"
           role="region" aria-label="${m.label}: ${m.value}">
        <div style="font-size:22px;font-weight:950;color:${m.color || 'var(--c-text)'}">${m.value}</div>
        <div style="font-size:10px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;margin-top:4px">${m.label}</div>
      </div>`).join('')}
  </div>

  <!-- Skill breakdown -->
  <div style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px;margin-bottom:24px">
    <h3 style="font-size:13px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Accuracy by Skill Category</h3>
    ${barChart}
  </div>

  <!-- Strengths & Weaknesses -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div style="padding:20px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-size:12px;font-weight:800;color:var(--c-success);text-transform:uppercase;margin-bottom:12px">💪 Top Strengths</h3>
      ${strengths.length ? strengths.map(s => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--c-border)">
          <span style="font-size:13px;font-weight:700;color:var(--c-text)">${s.category}</span>
          <span style="font-size:13px;font-weight:900;color:var(--c-success)">${s.accuracy}%</span>
        </div>`).join('') : `<p style="color:var(--c-text-muted);font-size:13px">No data yet.</p>`}
    </div>
    <div style="padding:20px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-size:12px;font-weight:800;color:var(--c-danger);text-transform:uppercase;margin-bottom:12px">🎯 Focus Areas</h3>
      ${weaknesses.length ? weaknesses.map(w => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--c-border)">
          <span style="font-size:13px;font-weight:700;color:var(--c-text)">${w.category}</span>
          <span style="font-size:13px;font-weight:900;color:var(--c-danger)">${w.accuracy}%</span>
        </div>`).join('') : `<p style="color:var(--c-text-muted);font-size:13px">No weak areas found.</p>`}
    </div>
  </div>
</div>`;
}

export function mountSubjectDrillDown() {
  // Back button handled via onclick in render
}
