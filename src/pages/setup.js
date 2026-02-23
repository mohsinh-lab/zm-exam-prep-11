// pages/setup.js — First-run setup for student name & parent email

import { setStudentName, setParentEmail, getProgress } from '../engine/progressStore.js';


export function renderSetup() {
  return `
<div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(ellipse at 50% 30%,#1a1060,#0f0f1a)">
  <div class="setup-screen">
    <div class="setup-icon">🎓</div>
    <h1 style="font-family:var(--font-heading);font-size:30px;font-weight:900;margin-bottom:8px">Welcome to AcePrep 11+</h1>
    <p style="color:var(--c-text-muted);margin-bottom:28px;font-size:15px">Smart preparation for Dream School<br>Let's get you set up in 30 seconds!</p>

    <div class="input-group">
      <label class="input-label">Student's First Name</label>
      <input type="text" class="input-field" id="setup-name" placeholder="e.g. Adam" maxlength="30" autofocus />
    </div>
    <div class="input-group">
      <label class="input-label">Parent Email (for progress reports)</label>
      <input type="email" class="input-field" id="setup-email" placeholder="parent@example.com" />
    </div>

    <button class="btn btn-primary btn-lg" style="width:100%;margin-top:8px" onclick="window._setupSubmit()">
      🚀 Let's Start Preparing!
    </button>

    <div style="margin-top:20px;font-size:12px;color:var(--c-text-dim)">
      🔒 All data stays on this device. No account required.
    </div>
  </div>
</div>`;
}

export function mountSetup() {
  const nameInput = document.getElementById('setup-name');
  const emailInput = document.getElementById('setup-email');

  window._setupSubmit = function () {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name) { nameInput.focus(); return; }

    const p = JSON.parse(localStorage.getItem('11plus_progress') || '{}');
    p.studentName = name;
    p.parentEmail = email;
    p.setupDone = true;
    localStorage.setItem('11plus_progress', JSON.stringify(p));

    window.router.navigate('#/student/home');
  };

  nameInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') emailInput?.focus();
  });
}
