/**
 * Analytics Dashboard — Advanced parent analytics view
 */
import { getProgress, updateProgress } from '../../engine/progressStore.js';
import {
  calculateDashboardMetrics, getPerformanceTrends, getTrendDirection,
  generateAlerts, getPrediction, getRecommendedFocus,
  SUBJECT_KEYS, SUBJECT_NAMES, SUBJECT_COLORS
} from './services/dashboardService.js';
import { dataCache } from './services/dataCache.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function trendIcon(dir) {
  return dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
}

function trendColor(dir) {
  return dir === 'up' ? 'var(--c-success)' : dir === 'down' ? 'var(--c-danger)' : 'var(--c-text-muted)';
}

function readinessColor(score) {
  if (score >= 75) return 'var(--c-success)';
  if (score >= 50) return '#f59e0b';
  return 'var(--c-danger)';
}

function fmtDate(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── SVG Charts ────────────────────────────────────────────────────────────────

function renderRadarChart(subjectScores) {
  const cx = 110, cy = 110, r = 80;
  const subjects = [
    { key: 'en',    angle: -90 },
    { key: 'maths', angle:   0 },
    { key: 'vr',    angle:  90 },
    { key: 'nvr',   angle: 180 },
  ];

  const toXY = (angle, pct) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * (pct / 100) * Math.cos(rad), y: cy + r * (pct / 100) * Math.sin(rad) };
  };

  const axisEnd = subjects.map(s => toXY(s.angle, 100));
  const dataPoints = subjects.map(s => toXY(s.angle, subjectScores[s.key] || 5));
  const poly = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const labelPos = subjects.map(s => {
    const p = toXY(s.angle, 115);
    return { ...p, name: SUBJECT_NAMES[s.key], key: s.key };
  });

  return `
    <svg viewBox="0 0 220 220" width="220" height="220" role="img"
         aria-label="Skill radar chart: Maths ${subjectScores.maths}%, English ${subjectScores.en}%, VR ${subjectScores.vr}%, NVR ${subjectScores.nvr}%"
         style="overflow:visible">
      <!-- Grid rings -->
      ${[30, 60, 100].map(pct => `<circle cx="${cx}" cy="${cy}" r="${r * pct / 100}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
      <!-- Axes -->
      ${axisEnd.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
      <!-- Data polygon -->
      <polygon points="${poly}" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Data points -->
      ${dataPoints.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${SUBJECT_COLORS[subjects[i].key]}" stroke="white" stroke-width="2"/>`).join('')}
      <!-- Labels -->
      ${labelPos.map(l => `<text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="800" fill="var(--c-text-muted)" style="text-transform:uppercase;letter-spacing:.5px">${l.name.split(' ')[0]}</text>`).join('')}
    </svg>`;
}

function renderTrendChart(trends, activePeriod) {
  const filtered = trends.slice(-activePeriod);
  const hasData = filtered.some(d => d.overall !== null);

  if (!hasData) {
    return `<div style="height:160px;display:flex;align-items:center;justify-content:center;color:var(--c-text-muted);font-weight:700;font-size:13px">No data for this period yet</div>`;
  }

  const w = 480, h = 140, padL = 28, padR = 8, padT = 10, padB = 24;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const step = chartW / Math.max(filtered.length - 1, 1);

  const toSVGX = i => padL + i * step;
  const toSVGY = v => padT + chartH - (v / 100) * chartH;

  // Grid lines
  const gridLines = [0, 25, 50, 75, 100].map(v => `
    <line x1="${padL}" y1="${toSVGY(v)}" x2="${w - padR}" y2="${toSVGY(v)}" stroke="#f1f5f9" stroke-width="1"/>
    <text x="${padL - 4}" y="${toSVGY(v)}" text-anchor="end" dominant-baseline="middle" font-size="8" fill="#94a3b8">${v}</text>
  `).join('');

  // Subject lines
  const subjectLines = SUBJECT_KEYS.map(sub => {
    const pts = filtered.map((d, i) => d[sub] !== null ? `${toSVGX(i)},${toSVGY(d[sub])}` : null).filter(Boolean);
    if (pts.length < 2) return '';
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${SUBJECT_COLORS[sub]}" stroke-width="2" stroke-linejoin="round" opacity="0.8"/>`;
  }).join('');

  // X-axis labels (show ~5 evenly spaced)
  const labelStep = Math.max(1, Math.floor(filtered.length / 5));
  const xLabels = filtered.map((d, i) => {
    if (i % labelStep !== 0 && i !== filtered.length - 1) return '';
    return `<text x="${toSVGX(i)}" y="${h - 4}" text-anchor="middle" font-size="8" fill="#94a3b8">${d.label}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" aria-label="Performance trend chart">
      ${gridLines}
      ${subjectLines}
      ${xLabels}
    </svg>`;
}

function renderReadinessGauge(score, prediction) {
  const color = readinessColor(score);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - score / 100);

  return `
    <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
      <div style="position:relative;width:120px;height:120px;flex-shrink:0">
        <svg viewBox="0 0 100 100" width="120" height="120" role="img" aria-label="Exam readiness: ${score}%">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 50 50)"
            style="transition:stroke-dashoffset .6s ease"/>
          <text x="50" y="46" text-anchor="middle" font-size="20" font-weight="900" fill="${color}">${score}</text>
          <text x="50" y="60" text-anchor="middle" font-size="9" fill="#94a3b8">/ 100</text>
        </svg>
      </div>
      <div style="flex:1;min-width:160px">
        <div style="font-size:13px;font-weight:800;color:var(--c-text);margin-bottom:6px">
          Predicted Score: <span style="color:${color}">${prediction.lower}–${prediction.upper}</span>
        </div>
        <div style="font-size:12px;color:var(--c-text-muted);font-weight:700;margin-bottom:8px">
          ${prediction.confidence}% confidence
        </div>
        <div style="font-size:11px;color:var(--c-text-muted);font-weight:600;font-style:italic">
          Based on recent performance trends. Predictions improve with more practice data.
        </div>
      </div>
    </div>`;
}

function renderGoals(goals) {
  if (!goals || goals.length === 0) {
    return `<p style="color:var(--c-text-muted);font-size:13px;font-weight:700;padding:16px 0">No active goals. Add one below.</p>`;
  }
  return goals.map(g => {
    const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
    const color = pct >= 100 ? 'var(--c-success)' : pct >= 60 ? '#f59e0b' : 'var(--c-danger)';
    const daysLeft = g.targetDate ? Math.max(0, Math.ceil((new Date(g.targetDate) - Date.now()) / 86400000)) : null;
    return `
      <div style="margin-bottom:16px;padding:16px;background:var(--c-bg);border-radius:12px;border:1px solid var(--c-border)"
           role="region" aria-label="Goal: ${g.subject ? SUBJECT_NAMES[g.subject] || g.subject : 'Overall'} ${g.type}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div>
            <span style="font-size:12px;font-weight:900;color:${SUBJECT_COLORS[g.subject] || 'var(--c-primary)'};text-transform:uppercase">
              ${g.subject ? SUBJECT_NAMES[g.subject] || g.subject : 'Overall'}
            </span>
            <span style="font-size:12px;font-weight:700;color:var(--c-text);margin-left:8px">
              ${g.type === 'accuracy' ? `${g.target}% accuracy` : g.type === 'sessions' ? `${g.target} sessions` : `${g.target} XP`}
            </span>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            ${daysLeft !== null ? `<span style="font-size:11px;font-weight:700;color:var(--c-text-muted)">${daysLeft}d left</span>` : ''}
            <button onclick="window._deleteGoal('${g.id}')" style="background:none;border:none;cursor:pointer;color:var(--c-text-muted);font-size:14px;padding:2px 6px" aria-label="Delete goal">✕</button>
          </div>
        </div>
        <div style="height:8px;background:rgba(0,0,0,0.06);border-radius:4px;overflow:hidden" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${pct}% complete">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width .4s ease"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-muted)">${g.progress} / ${g.target}</span>
          <span style="font-size:11px;font-weight:800;color:${color}">${pct}%</span>
        </div>
      </div>`;
  }).join('');
}

function renderAlerts(alerts, dismissed) {
  const visible = alerts.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return `<p style="color:var(--c-text-muted);font-size:13px;font-weight:700;padding:8px 0">No active alerts.</p>`;

  const icons = { warning: '⚠️', success: '🎉', info: 'ℹ️' };
  const bgColors = { warning: '#fef3c7', success: '#d1fae5', info: '#e0f2fe' };
  const borderColors = { warning: '#f59e0b', success: '#10b981', info: '#0ea5e9' };

  return visible.map(a => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:${bgColors[a.severity] || '#f8fafc'};border-left:4px solid ${borderColors[a.severity] || '#94a3b8'};border-radius:8px;margin-bottom:10px"
         role="alert">
      <span style="font-size:16px;flex-shrink:0">${icons[a.severity] || 'ℹ️'}</span>
      <span style="font-size:13px;font-weight:700;color:var(--c-text);flex:1">${a.message}</span>
      <button onclick="window._dismissAlert('${a.id}')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:14px;padding:0 4px;flex-shrink:0" aria-label="Dismiss alert">✕</button>
    </div>`).join('');
}

// ── Main Render ───────────────────────────────────────────────────────────────

export function renderAnalyticsDashboard() {
  const progress = getProgress();
  const metrics = calculateDashboardMetrics(progress);
  const prediction = getPrediction(progress);
  const alerts = generateAlerts(progress);
  const focus = getRecommendedFocus(progress);
  const dismissed = JSON.parse(localStorage.getItem('aad_dismissed_alerts') || '[]');
  const goals = progress.analyticsGoals || [];
  const activePeriod = parseInt(localStorage.getItem('aad_trend_period') || '30');

  // Cache metrics for offline use
  dataCache.set('metrics', metrics);

  const isOnline = navigator.onLine;
  const cacheEntry = dataCache.getWithMeta('metrics');
  const lastSync = cacheEntry ? new Date(cacheEntry.savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null;

  const trendData = getPerformanceTrends(progress, 90);
  const trends = {};
  for (const sub of SUBJECT_KEYS) {
    trends[sub] = getTrendDirection(progress, sub);
  }

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  return `
<div class="page page-enter" style="color:var(--c-text);max-width:1100px;margin:0 auto">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
    <div>
      <h1 style="font-family:var(--font-heading);font-size:28px;margin-bottom:4px;color:var(--c-text)">📊 Analytics Dashboard</h1>
      <p style="color:var(--c-text-muted);font-size:13px;font-weight:700">
        ${isOnline ? `<span style="color:var(--c-success)">● Live</span>` : `<span style="color:var(--c-danger)">● Offline</span>`}
        ${lastSync ? ` · Last sync ${lastSync}` : ''}
      </p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button onclick="window.router.navigate('#/parent/home')" class="btn btn-outline btn-sm" style="border-radius:10px">← Parent Portal</button>
      <button onclick="window._exportCSV()" class="btn btn-outline btn-sm" style="border-radius:10px" ${!isOnline ? 'disabled' : ''}>📥 Export CSV</button>
    </div>
  </div>

  ${visibleAlerts.length > 0 ? `
  <!-- Alerts Banner -->
  <div style="margin-bottom:24px">
    ${renderAlerts(alerts, dismissed)}
  </div>` : ''}

  <!-- Key Metrics Grid -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:32px">
    ${[
      { label: 'Readiness Score', value: `${metrics.examReadinessScore}%`, color: readinessColor(metrics.examReadinessScore), icon: '🎯' },
      { label: 'Avg Accuracy', value: `${metrics.averageAccuracy}%`, color: 'var(--c-primary)', icon: '🎯' },
      { label: 'Total XP', value: metrics.totalXP.toLocaleString(), color: 'var(--c-accent)', icon: '⚡' },
      { label: 'Questions Done', value: metrics.totalQuestionsCompleted.toLocaleString(), color: 'var(--c-success)', icon: '✅' },
      { label: 'Days to Exam', value: metrics.daysUntilExam, color: metrics.daysUntilExam < 60 ? 'var(--c-danger)' : 'var(--c-text)', icon: '📅' },
      { label: 'Last Active', value: metrics.daysSinceActivity !== null ? `${metrics.daysSinceActivity}d ago` : 'Never', color: metrics.daysSinceActivity > 3 ? 'var(--c-danger)' : 'var(--c-success)', icon: '🕐' },
    ].map(m => `
      <div class="card" style="padding:16px;background:white;border:1px solid var(--c-border);border-radius:14px;text-align:center"
           role="region" aria-label="${m.label}: ${m.value}">
        <div style="font-size:20px;margin-bottom:6px">${m.icon}</div>
        <div style="font-size:22px;font-weight:950;color:${m.color};line-height:1">${m.value}</div>
        <div style="font-size:10px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;margin-top:4px;letter-spacing:.5px">${m.label}</div>
      </div>`).join('')}
  </div>

  <!-- Charts Row -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px" class="analytics-charts-row">

    <!-- Radar Chart -->
    <div class="card" style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-family:var(--font-heading);font-size:13px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">⚔️ Skill Breakdown</h3>
      <div style="display:flex;justify-content:center;margin-bottom:16px">
        ${renderRadarChart(metrics.subjectScores)}
      </div>
      <!-- Subject scores list -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${SUBJECT_KEYS.map(sub => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--c-bg);border-radius:8px"
               role="button" tabindex="0" onclick="window._drillDown('${sub}')" style="cursor:pointer"
               aria-label="${SUBJECT_NAMES[sub]}: ${metrics.subjectScores[sub]}%, trend ${trends[sub]}">
            <div style="width:10px;height:10px;border-radius:50%;background:${SUBJECT_COLORS[sub]};flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:10px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${SUBJECT_NAMES[sub].split(' ')[0]}</div>
              <div style="font-size:14px;font-weight:950;color:var(--c-text)">${metrics.subjectScores[sub]}%</div>
            </div>
            <span style="font-size:14px;font-weight:900;color:${trendColor(trends[sub])}" aria-hidden="true">${trendIcon(trends[sub])}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- Readiness Gauge + Prediction -->
    <div class="card" style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-family:var(--font-heading);font-size:13px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🎯 Exam Readiness</h3>
      ${renderReadinessGauge(metrics.examReadinessScore, prediction)}
      <hr style="border:none;border-top:1px solid var(--c-border);margin:20px 0">
      <h4 style="font-size:12px;font-weight:800;color:var(--c-text-muted);text-transform:uppercase;margin-bottom:10px">🔍 Focus Areas</h4>
      ${focus.map(f => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:8px;height:8px;border-radius:50%;background:${SUBJECT_COLORS[f.subject]};flex-shrink:0"></div>
          <span style="font-size:13px;font-weight:700;color:var(--c-text);flex:1">${f.name}</span>
          <span style="font-size:13px;font-weight:900;color:var(--c-danger)">${f.score}%</span>
        </div>`).join('')}
    </div>
  </div>

  <!-- Performance Trend Chart -->
  <div class="card" style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px;margin-bottom:32px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <h3 style="font-family:var(--font-heading);font-size:13px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px">📈 Performance Trend</h3>
      <div style="display:flex;gap:6px" role="group" aria-label="Time period filter">
        ${[7, 14, 30, 90].map(d => `
          <button onclick="window._setTrendPeriod(${d})" class="btn btn-sm"
            style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;
                   background:${activePeriod === d ? 'var(--c-primary)' : 'var(--c-bg)'};
                   color:${activePeriod === d ? 'white' : 'var(--c-text-muted)'};
                   border:1px solid ${activePeriod === d ? 'var(--c-primary)' : 'var(--c-border)'}"
            aria-pressed="${activePeriod === d}">${d}d</button>`).join('')}
      </div>
    </div>
    <!-- Legend -->
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">
      ${SUBJECT_KEYS.map(sub => `
        <div style="display:flex;align-items:center;gap:5px">
          <div style="width:16px;height:3px;background:${SUBJECT_COLORS[sub]};border-radius:2px"></div>
          <span style="font-size:10px;font-weight:700;color:var(--c-text-muted)">${SUBJECT_NAMES[sub].split(' ')[0]}</span>
        </div>`).join('')}
    </div>
    <div style="overflow-x:auto">
      ${renderTrendChart(trendData, activePeriod)}
    </div>
  </div>

  <!-- Goals + Alerts Row -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px" class="analytics-bottom-row">

    <!-- Goal Tracker -->
    <div class="card" style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-family:var(--font-heading);font-size:13px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🏆 Goals</h3>
      <div id="aad-goals-list">
        ${renderGoals(goals)}
      </div>
      <!-- Add Goal Form -->
      <details style="margin-top:12px">
        <summary style="font-size:12px;font-weight:800;color:var(--c-primary);cursor:pointer;padding:8px 0">+ Add Goal</summary>
        <div style="padding:12px 0;display:flex;flex-direction:column;gap:10px">
          <select id="aad-goal-type" class="input-field" style="height:40px;font-size:13px" aria-label="Goal type">
            <option value="accuracy">Accuracy %</option>
            <option value="sessions">Sessions count</option>
            <option value="xp">XP earned</option>
          </select>
          <select id="aad-goal-subject" class="input-field" style="height:40px;font-size:13px" aria-label="Subject">
            <option value="">All subjects</option>
            ${SUBJECT_KEYS.map(s => `<option value="${s}">${SUBJECT_NAMES[s]}</option>`).join('')}
          </select>
          <input type="number" id="aad-goal-target" class="input-field" placeholder="Target value (e.g. 80)" style="height:40px;font-size:13px" aria-label="Target value">
          <input type="date" id="aad-goal-date" class="input-field" style="height:40px;font-size:13px" aria-label="Target date">
          <button onclick="window._addGoal()" class="btn btn-primary btn-sm" style="border-radius:10px">Save Goal</button>
        </div>
      </details>
    </div>

    <!-- Alert Center -->
    <div class="card" style="padding:24px;background:white;border:1px solid var(--c-border);border-radius:16px">
      <h3 style="font-family:var(--font-heading);font-size:13px;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🔔 Alerts</h3>
      <div id="aad-alerts-list">
        ${renderAlerts(alerts, dismissed)}
      </div>
    </div>
  </div>

</div>`;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function mountAnalyticsDashboard() {
  // Trend period filter
  window._setTrendPeriod = (days) => {
    localStorage.setItem('aad_trend_period', String(days));
    window.router.navigate('#/parent/analytics'); // re-render
  };

  // Dismiss alert
  window._dismissAlert = (id) => {
    const dismissed = JSON.parse(localStorage.getItem('aad_dismissed_alerts') || '[]');
    if (!dismissed.includes(id)) dismissed.push(id);
    localStorage.setItem('aad_dismissed_alerts', JSON.stringify(dismissed));
    const list = document.getElementById('aad-alerts-list');
    if (list) {
      const progress = getProgress();
      const alerts = generateAlerts(progress);
      list.innerHTML = renderAlerts(alerts, dismissed);
    }
    // Also update banner if present
    window.router.navigate('#/parent/analytics');
  };

  // Add goal
  window._addGoal = () => {
    const type = document.getElementById('aad-goal-type')?.value;
    const subject = document.getElementById('aad-goal-subject')?.value;
    const target = parseFloat(document.getElementById('aad-goal-target')?.value);
    const targetDate = document.getElementById('aad-goal-date')?.value;

    if (!type || isNaN(target) || target <= 0) {
      alert('Please enter a valid target value.');
      return;
    }

    const progress = getProgress();
    const goals = progress.analyticsGoals || [];
    const currentValue = type === 'accuracy'
      ? (progress.sessions || []).filter(s => !subject || s.subject === subject).slice(-5).reduce((s, x, _, a) => s + x.score / a.length, 0)
      : type === 'sessions' ? (progress.sessions || []).filter(s => !subject || s.subject === subject).length
      : progress.xp || 0;

    goals.push({
      id: `goal_${Date.now()}`,
      type,
      subject: subject || null,
      target,
      targetDate: targetDate || null,
      createdAt: new Date().toISOString(),
      progress: Math.round(currentValue),
      status: 'active',
    });

    progress.analyticsGoals = goals;
    updateProgress(progress);
    window.router.navigate('#/parent/analytics');
  };

  // Delete goal
  window._deleteGoal = (id) => {
    if (!confirm('Delete this goal?')) return;
    const progress = getProgress();
    progress.analyticsGoals = (progress.analyticsGoals || []).filter(g => g.id !== id);
    updateProgress(progress);
    window.router.navigate('#/parent/analytics');
  };

  // Drill-down (navigate to subject detail — shows parent dashboard filtered)
  window._drillDown = (subject) => {
    window.router.navigate(`#/parent/analytics/subject/${subject}`);
  };

  // Export CSV
  window._exportCSV = () => {
    const progress = getProgress();
    const sessions = progress.sessions || [];
    if (sessions.length === 0) { alert('No session data to export.'); return; }

    const headers = ['Date', 'Subject', 'Score (%)', 'Total Questions', 'Time (ms)'];
    const rows = sessions.map(s => [
      new Date(s.date).toLocaleDateString('en-GB'),
      s.subject,
      s.score,
      s.total || '',
      s.time || '',
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aceprep-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update goal progress from current data
  const progress = getProgress();
  const goals = progress.analyticsGoals || [];
  let updated = false;
  goals.forEach(g => {
    const newProgress = g.type === 'accuracy'
      ? Math.round((progress.sessions || []).filter(s => !g.subject || s.subject === g.subject).slice(-5).reduce((s, x, _, a) => s + x.score / a.length, 0))
      : g.type === 'sessions' ? (progress.sessions || []).filter(s => !g.subject || s.subject === g.subject).length
      : progress.xp || 0;
    if (newProgress !== g.progress) { g.progress = newProgress; updated = true; }
    if (g.status !== 'achieved' && g.progress >= g.target) { g.status = 'achieved'; updated = true; }
  });
  if (updated) {
    progress.analyticsGoals = goals;
    updateProgress(progress);
  }
}
