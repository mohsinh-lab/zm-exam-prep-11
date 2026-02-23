// pages/actionplan.js — Year action plan timeline for Dream School

export function renderActionPlan() {
    const today = new Date();

    const milestones = [
        {
            id: 'diagnostic', phase: 'Phase 1', title: '🔍 Diagnostic Assessment',
            dateRange: 'Feb — Mar 2026',
            deadline: new Date('2026-03-31'),
            status: 'active',
            desc: 'Identify baseline strengths and weaknesses across all 4 subjects. No pressure — this is about understanding where to focus.',
            tasks: ['Complete 1 session in each subject', 'Review weak topics in app', 'Set up parent email reports'],
            tip: '🎮 Treat it like finding your starter Pokémon — you\'re discovering your type!'
        },
        {
            id: 'foundation', phase: 'Phase 2', title: '📚 Foundation Practice',
            dateRange: 'Mar — Apr 2026',
            deadline: new Date('2026-04-30'),
            status: 'upcoming',
            desc: 'Build strong fundamentals in all 4 subjects. Focus on understanding — aim for 60%+ accuracy.',
            tasks: ['5+ sessions per week', 'Master easy + medium difficulty questions', 'Complete topic checklists for VR and English'],
            tip: '⛏️ Like building your Minecraft base — lay each block carefully!'
        },
        {
            id: 'intensive', phase: 'Phase 3', title: '🚀 Intensive Training',
            dateRange: 'Apr — Jun 2026',
            deadline: new Date('2026-06-30'),
            status: 'upcoming',
            desc: 'Push up to 75%+ accuracy. Focus on time management — practice answering within 45s per question.',
            tasks: ['Timed practice with 90s per question', 'Focus on NVR patterns & Maths word problems', 'Weekly mock sessions'],
            tip: '💨 Sonic clears levels fast — now it\'s your turn to beat the clock!'
        },
        {
            id: 'mocks', phase: 'Phase 4', title: '📝 Mock Exam Season',
            dateRange: 'Jun — Jul 2026',
            deadline: new Date('2026-07-31'),
            status: 'upcoming',
            desc: 'Full 55-minute timed mock exams. Simulate real exam conditions. Track every paper.',
            tasks: ['1 full mock per week (Paper 1 + Paper 2)', 'Review every wrong answer', 'Visit Ilford County open day if available'],
            tip: '🤖 Optimus Prime prepares before every battle — so do you!'
        },
        {
            id: 'refinement', phase: 'Phase 5', title: '🎯 Final Refinement',
            dateRange: 'Aug 2026',
            deadline: new Date('2026-08-31'),
            status: 'upcoming',
            desc: 'Light consistent practice to maintain sharpness. No cramming — keep confidence high.',
            tasks: ['2–3 sessions per week (maintenance)', 'Focus ONLY on remaining weak topics', 'Rest and eat well!'],
            tip: '🌟 Champions rest before the big match too!'
        },
        {
            id: 'exam', phase: 'EXAM DAY', title: '🏆 Dream School Exam',
            dateRange: 'September 2026',
            deadline: new Date('2026-09-15'),
            status: 'upcoming',
            desc: 'The big day! 2 papers × 55 minutes. Paper 1: English + Verbal Reasoning. Paper 2: Maths + Non-Verbal Reasoning.',
            tasks: ['Bring pencil, rubber, and sharpener', 'Arrive 15 min early', 'Read every question fully before answering', 'Skip and come back to hard questions'],
            tip: '🎓 You\'ve trained hard. Now go show them what you\'ve got!'
        },
    ];

    const daysToExam = Math.ceil((new Date('2026-09-15') - today) / 86400000);
    const weeksToExam = Math.ceil(daysToExam / 7);

    return `
<div class="page page-enter">
  <h1 class="page-title">📅 Exam Action Plan</h1>
  <p class="page-subtitle">Your personalised roadmap to Dream School</p>

  <!-- Countdown banner -->
  <div style="background:linear-gradient(135deg,rgba(108,99,255,0.2),rgba(6,182,212,0.1));border:1px solid rgba(108,99,255,0.3);border-radius:20px;padding:24px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <div>
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text-muted);margin-bottom:6px">Countdown to Exam Day</div>
      <div style="font-family:var(--font-heading);font-size:40px;font-weight:900;line-height:1">
        ${daysToExam} <span style="font-size:18px;color:var(--c-text-muted)">days</span>
      </div>
      <div style="color:var(--c-text-muted);font-size:14px;margin-top:4px">≈ ${weeksToExam} weeks · September 2026</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:13px;color:var(--c-text-muted);margin-bottom:6px">Dream School</div>
      <div style="font-size:14px;font-weight:700">GL Assessment Format</div>
      <div style="font-size:13px;color:var(--c-text-muted)">Paper 1: English + VR (55 min)</div>
      <div style="font-size:13px;color:var(--c-text-muted)">Paper 2: Maths + NVR (55 min)</div>
    </div>
  </div>

  <!-- Timeline -->
  <div class="timeline">
    ${milestones.map((m, i) => {
        const isPast = today > m.deadline;
        const isCurrent = m.status === 'active' || (today <= m.deadline && (i === 0 || today > milestones[i - 1].deadline));
        const statusClass = isPast ? 'completed' : isCurrent ? '' : 'locked';
        const dotIcon = isPast ? '✓' : isCurrent ? '▶' : '○';

        return `
      <div class="timeline-item ${statusClass}">
        <div class="timeline-dot">${dotIcon}</div>
        <div class="timeline-card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <span class="tag tag-vr" style="font-size:11px">${m.phase}</span>
            <span class="timeline-date">📅 ${m.dateRange}</span>
          </div>
          <div class="timeline-title">${m.title}</div>
          <div class="timeline-desc">${m.desc}</div>
          <div class="timeline-tasks">
            ${m.tasks.map(t => `<div class="timeline-task">${t}</div>`).join('')}
          </div>
          <div style="margin-top:12px;padding:10px 14px;background:rgba(245,158,11,0.08);border-radius:10px;font-size:13px;color:var(--c-accent)">
            ${m.tip}
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- Study schedule recommendation -->
  <div class="card" style="margin-top:32px;border-color:rgba(16,185,129,0.3)">
    <h3 style="font-family:var(--font-heading);font-weight:800;margin-bottom:16px">📋 Recommended Weekly Schedule</h3>
    ${renderSchedule()}
  </div>
</div>`;
}

function renderSchedule() {
    const days = [
        { day: 'Monday', subjects: ['Verbal Reasoning'], focus: 'Letter Codes & Series', mins: 25 },
        { day: 'Tuesday', subjects: ['Maths'], focus: 'Number & Fractions', mins: 30 },
        { day: 'Wednesday', subjects: ['English'], focus: 'Comprehension & Vocab', mins: 30 },
        { day: 'Thursday', subjects: ['Non-Verbal Reasoning'], focus: 'Series & Matrix patterns', mins: 25 },
        { day: 'Friday', subjects: ['Verbal Reasoning', 'English'], focus: 'Mixed practice', mins: 30 },
        { day: 'Saturday', subjects: ['Maths', 'NVR'], focus: 'Full Paper 2 practice', mins: 55 },
        { day: 'Sunday', subjects: [], focus: 'Rest & review achievements', mins: 0 },
    ];
    const subColors = { 'Verbal Reasoning': 'var(--c-vr)', 'Maths': 'var(--c-maths)', 'English': 'var(--c-en)', 'Non-Verbal Reasoning': 'var(--c-nvr)', 'NVR': 'var(--c-nvr)' };

    return days.map(d => `
    <div class="report-row">
      <div>
        <div style="font-weight:700;font-size:14px">${d.day}</div>
        <div style="font-size:12px;color:var(--c-text-muted)">${d.focus}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${d.subjects.map(s => `<span class="tag" style="background:${subColors[s]}22;color:${subColors[s]};font-size:11px">${s}</span>`).join('')}
        ${d.mins ? `<span style="font-size:13px;font-weight:700;color:var(--c-text-muted)">${d.mins}m</span>` : '<span style="font-size:13px;color:var(--c-text-muted)">😴 Rest</span>'}
      </div>
    </div>`).join('');
}
