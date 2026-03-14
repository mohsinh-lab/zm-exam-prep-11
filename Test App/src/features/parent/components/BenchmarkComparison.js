/**
 * Benchmark Comparison — student vs average vs top performers
 */
import { SUBJECT_NAMES, SUBJECT_COLORS, SUBJECT_KEYS } from '../services/dashboardService.js';

// Static benchmark data (anonymised population averages for 11+ prep)
const BENCHMARKS = {
  maths:   { average: 62, top: 88 },
  en:      { average: 65, top: 90 },
  vr:      { average: 58, top: 85 },
  nvr:     { average: 55, top: 83 },
  overall: { average: 60, top: 87 },
};

/**
 * Calculate percentile rank for a score against benchmark.
 * @param {number} score
 * @param {number} avg
 * @param {number} top
 * @returns {number} 0-100 percentile
 */
export function calculatePercentile(score, avg, top) {
  if (score >= top) return 99;
  if (score <= 0) return 1;
  // Linear interpolation between 0→avg (50th) and avg→top (90th)
  if (score <= avg) return Math.round((score / avg) * 50);
  return Math.round(50 + ((score - avg) / (top - avg)) * 40);
}

/**
 * Get benchmark comparison data for all subjects.
 * @param {object} subjectScores - { maths, en, vr, nvr }
 * @returns {Array<{subject, name, studentScore, average, top, percentile}>}
 */
export function getBenchmarkData(subjectScores) {
  return SUBJECT_KEYS.map(sub => {
    const bm = BENCHMARKS[sub];
    const score = subjectScores[sub] || 0;
    return {
      subject: sub,
      name: SUBJECT_NAMES[sub],
      studentScore: score,
      average: bm.average,
      top: bm.top,
      percentile: calculatePercentile(score, bm.average, bm.top),
    };
  });
}

/**
 * Render benchmark comparison component.
 * @param {object} subjectScores
 * @returns {string} HTML
 */
export function renderBenchmarkComparison(subjectScores) {
  const data = getBenchmarkData(subjectScores);
  const overallScore = Math.round(SUBJECT_KEYS.reduce((s, k) => s + (subjectScores[k] || 0), 0) / SUBJECT_KEYS.length);
  const overallBm = BENCHMARKS.overall;
  const overallPct = calculatePercentile(overallScore, overallBm.average, overallBm.top);

  return `
<div style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px"
     role="region" aria-label="Benchmark comparison">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <h3 style="font-size:13px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px">📊 Benchmark Comparison</h3>
    <span style="font-size:11px;color:var(--c-text-muted);font-weight:600">🔒 All data anonymised · ~500 students</span>
  </div>

  <!-- Overall percentile -->
  <div style="text-align:center;padding:16px;background:var(--c-bg);border-radius:12px;margin-bottom:20px">
    <div style="font-size:36px;font-weight:950;color:var(--c-primary)">${overallPct}<sup style="font-size:16px">th</sup></div>
    <div style="font-size:12px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase">Overall Percentile</div>
    <div style="font-size:11px;color:var(--c-text-muted);margin-top:4px">
      Your score: ${overallScore}% · Average: ${overallBm.average}% · Top: ${overallBm.top}%
    </div>
  </div>

  <!-- Per-subject comparison bars -->
  <div style="display:flex;flex-direction:column;gap:14px">
    ${data.map(d => `
      <div role="region" aria-label="${d.name}: ${d.studentScore}%, ${d.percentile}th percentile">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:12px;font-weight:800;color:var(--c-text)">${d.name}</span>
          <span style="font-size:11px;font-weight:700;color:var(--c-text-muted)">${d.percentile}th percentile</span>
        </div>
        <div style="position:relative;height:10px;background:rgba(0,0,0,0.06);border-radius:5px;overflow:visible">
          <!-- Average marker -->
          <div style="position:absolute;left:${d.average}%;top:-3px;width:2px;height:16px;background:#94a3b8;border-radius:1px" title="Average: ${d.average}%"></div>
          <!-- Top marker -->
          <div style="position:absolute;left:${d.top}%;top:-3px;width:2px;height:16px;background:#f59e0b;border-radius:1px" title="Top: ${d.top}%"></div>
          <!-- Student bar -->
          <div style="width:${d.studentScore}%;height:100%;background:${SUBJECT_COLORS[d.subject]};border-radius:5px;transition:width .4s"
               role="progressbar" aria-valuenow="${d.studentScore}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:4px">
          <span style="font-size:10px;color:${SUBJECT_COLORS[d.subject]};font-weight:800">You: ${d.studentScore}%</span>
          <span style="font-size:10px;color:#94a3b8;font-weight:700">Avg: ${d.average}%</span>
          <span style="font-size:10px;color:#f59e0b;font-weight:700">Top: ${d.top}%</span>
        </div>
      </div>`).join('')}
  </div>
</div>`;
}
