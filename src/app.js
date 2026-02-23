// app.js — Main router, navbar, notification system, and app bootstrap

import { renderHome } from './pages/home.js';
import { renderQuiz, mountQuizHandlers } from './pages/quiz.js';
import { renderResults } from './pages/results.js';
import { renderParent } from './pages/parent.js';
import { renderActionPlan } from './pages/actionplan.js';
import { renderAchievements } from './pages/achievements.js';
import { renderSetup } from './pages/setup.js';
import { getProgress, generateDailyReport, generateWeeklyReport, generateMonthlyReport } from './engine/progressStore.js';
import { SUBJECT_LABELS } from './engine/questionBank.js';

// ── Global navigate ───────────────────────────────────────────────────────
export function navigate(page, data) {
  window._currentPage = page;
  window._currentData = data;
  renderPage(page, data);
}
window.navigate = navigate;

// ── Expose report generators globally for parent page ─────────────────────
window._genDaily = generateDailyReport;
window._genWeekly = generateWeeklyReport;
window._genMonthly = generateMonthlyReport;

// ── Render page ───────────────────────────────────────────────────────────
function renderPage(page, data) {
  const root = document.getElementById('page-root');
  if (!root) return;

  let html = '';
  switch (page) {
    case 'home': html = renderHome(); break;
    case 'quiz': html = renderQuiz(data); break;
    case 'results': html = renderResults(data); break;
    case 'parent': html = renderParent(); break;
    case 'action-plan': html = renderActionPlan(); break;
    case 'achievements': html = renderAchievements(); break;
    case 'setup': html = renderSetup(); break;
    default: html = renderHome();
  }

  root.innerHTML = html;
  updateNavbar(page);
  updateMobileTabbar(page);

  // Mount quiz handlers after DOM update
  if (page === 'quiz') {
    requestAnimationFrame(() => mountQuizHandlers(data));
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// ── Navbar ────────────────────────────────────────────────────────────────
function buildNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const p = getProgress();
  const xp = p.xp || 0;
  const gems = p.gems || 0;

  nav.innerHTML = `
    <div class="nav-logo">
      <span class="nav-logo-icon">🎓</span>AcePrep 11+
    </div>
    <button class="nav-btn" id="nav-home" onclick="navigate('home')">🏠 Home</button>
    <button class="nav-btn" id="nav-plan" onclick="navigate('action-plan')">📅 Plan</button>
    <button class="nav-btn" id="nav-achieve" onclick="navigate('achievements')">🏅 Badges</button>
    <button class="nav-btn" id="nav-parent" onclick="navigate('parent')">👨‍👩‍👧 Parents</button>
    <div class="nav-gems">💎 ${gems}</div>
    <div class="nav-xp">⚡ ${xp} XP</div>
  `;
}

function updateNavbar(page) {
  // Refresh XP/gems in navbar
  buildNavbar();
  const map = { home: 'nav-home', 'action-plan': 'nav-plan', achievements: 'nav-achieve', parent: 'nav-parent' };
  const activeId = map[page];
  if (activeId) {
    document.getElementById(activeId)?.classList.add('active');
  }

  // Hide navbar on quiz page for immersion
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.style.display = page === 'quiz' ? 'none' : 'flex';
}

// ── Mobile bottom tabbar ──────────────────────────────────────────────────
function buildMobileTabbar() {
  const bar = document.getElementById('mobile-tabbar');
  if (!bar) return;
  bar.innerHTML = `
    <button class="mobile-tab" id="mtab-home" onclick="navigate('home')">
      <span class="tab-icon">🏠</span>Home
    </button>
    <button class="mobile-tab" id="mtab-plan" onclick="navigate('action-plan')">
      <span class="tab-icon">📅</span>Plan
    </button>
    <button class="mobile-tab" id="mtab-badges" onclick="navigate('achievements')">
      <span class="tab-icon">🏅</span>Badges
    </button>
    <button class="mobile-tab" id="mtab-parent" onclick="navigate('parent')">
      <span class="tab-icon">👪</span>Parents
    </button>
  `;
}

function updateMobileTabbar(page) {
  const map = { home: 'mtab-home', 'action-plan': 'mtab-plan', achievements: 'mtab-badges', parent: 'mtab-parent' };
  document.querySelectorAll('.mobile-tab').forEach(b => b.classList.remove('active'));
  const activeId = map[page];
  if (activeId) document.getElementById(activeId)?.classList.add('active');
  const bar = document.getElementById('mobile-tabbar');
  if (bar) bar.style.display = page === 'quiz' ? 'none' : 'flex';
}

// ── Web Notifications ─────────────────────────────────────────────────────
export async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    scheduleNotifications();
    new Notification('AcePrep 11+ 🎓', {
      body: 'Notifications enabled! We\'ll remind you to practise every day.',
      icon: 'favicon.ico'
    });
  }
}
window.requestNotifPermission = requestNotifPermission;

function scheduleNotifications() {
  // Schedule via setTimeout for local demo (in production, use service workers)
  const now = new Date();
  const target = new Date();
  target.setHours(17, 0, 0, 0); // 5pm daily reminder
  if (target < now) target.setDate(target.getDate() + 1);
  const delay = target - now;

  setTimeout(() => {
    const p = getProgress();
    const todaySessions = (p.sessions || []).filter(s =>
      new Date(s.date).toDateString() === new Date().toDateString()
    );
    if (todaySessions.length === 0 && Notification.permission === 'granted') {
      new Notification('🎓 Time to practise, ' + (p.studentName || 'champ') + '!', {
        body: 'You haven\'t done any 11+ prep today. Keep that streak alive! 🔥',
        icon: 'favicon.ico'
      });
    }
  }, delay);
}

function checkNotifCard() {
  if (!('Notification' in window)) return;
  const card = document.getElementById('notif-card');
  if (card && Notification.permission === 'default') {
    card.style.display = 'flex';
  }
}

// ── CSS for bits not in main.css ──────────────────────────────────────────
const extraCSS = `
  .home-hero {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 20px; flex-wrap: wrap; margin-bottom: 8px;
  }
  .hero-left { flex: 1; min-width: 220px; }
  .hero-right { flex-shrink: 0; }
  .greeting-small { font-size: 15px; color: var(--c-text-muted); margin-bottom: 4px; }
  .level-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.25);
    padding: 6px 14px; border-radius: var(--r-full);
    font-size: 13px; font-weight: 700; color: var(--c-primary-light);
    margin: 10px 0;
  }
  .level-icon { font-size: 16px; }
  .xp-bar-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .xp-bar {
    height: 8px; width: 100%; max-width: 320px;
    background: rgba(255,255,255,0.08); border-radius: var(--r-full); overflow: hidden;
  }
  .xp-fill {
    height: 100%; border-radius: var(--r-full);
    background: linear-gradient(90deg, #6C63FF, #a78bfa, #f59e0b);
    transition: width 1s var(--ease-out);
  }
  .xp-label { font-size: 12px; color: var(--c-text-muted); font-weight: 600; }
  .motivation-quote {
    font-size: 14px; color: var(--c-text-muted); font-style: italic;
    max-width: 400px; line-height: 1.5; margin-top: 4px;
  }
  .target-banner {
    background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.08));
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: var(--r-md); padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
    margin-bottom: 28px;
  }
  .target-school { font-weight: 800; font-size: 15px; margin-bottom: 4px; }
  .target-desc { font-size: 12px; color: var(--c-text-muted); }
  .target-countdown { font-family: var(--font-heading); font-weight: 900; font-size: 22px; color: var(--c-accent); }
  .section-title {
    font-family: var(--font-heading); font-weight: 800; font-size: 18px; margin-bottom: 16px;
  }
  .notif-card {
    margin-top: 20px; padding: 16px 20px;
    background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.25);
    border-radius: var(--r-md); display: flex; align-items: center;
    justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .focus-alert {
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    background: rgba(245,158,11,0.92); color: #000;
    padding: 12px 24px; border-radius: var(--r-full);
    font-weight: 800; font-size: 14px; z-index: 999;
    animation: slideDown 0.3s var(--ease-bounce);
  }
  @keyframes slideDown {
    from { opacity:0; transform:translateX(-50%) translateY(-20px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
`;

// ── Bootstrap ─────────────────────────────────────────────────────────────
function boot() {
  // Inject extra CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = extraCSS;
  document.head.appendChild(styleEl);

  // Build layout
  document.getElementById('app').innerHTML = `
    <div id="navbar"></div>
    <div id="page-root"></div>
    <div id="mobile-tabbar"></div>
  `;

  buildNavbar();
  buildMobileTabbar();

  // Check first run
  const progress = getProgress();
  const startPage = progress.setupDone ? 'home' : 'setup';

  // Splash animation then navigate
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        navigate(startPage);
        requestAnimationFrame(checkNotifCard);
        if (Notification.permission === 'granted') scheduleNotifications();
      }, 600);
    }, 1800);
  } else {
    navigate(startPage);
  }

  // Exam countdown
  setInterval(() => {
    const el = document.getElementById('exam-countdown');
    if (el) {
      const days = Math.ceil((new Date('2026-09-15') - new Date()) / 86400000);
      el.textContent = `${days} days`;
    }
  }, 60000);
}

// Start
window.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
