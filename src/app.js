
import { Router } from './core/router.js';
import { renderStudentHome } from './features/student/Home.js';
import { renderStudentQuiz, mountStudentQuiz } from './features/student/Quiz.js';
import { renderParentDashboard, mountParentDashboard } from './features/parent/Dashboard.js';
import { renderStudentResults, mountStudentResults } from './features/student/Results.js';
import { renderActionPlan } from './pages/actionplan.js';
import { renderAchievements } from './pages/achievements.js';
import { renderSetup, mountSetup } from './pages/setup.js';
import { getProgress } from './engine/progressStore.js';

const routes = [
  { path: '#/setup', render: renderSetup, mount: mountSetup },
  { path: '#/student/home', render: renderStudentHome, mount: mountStudentHome },
  { path: '#/student/quiz/:subject', render: renderStudentQuiz, mount: mountStudentQuiz },
  { path: '#/student/plan', render: renderActionPlan },
  { path: '#/student/badges', render: renderAchievements },
  { path: '#/student/results', render: renderStudentResults, mount: mountStudentResults },
  { path: '#/parent/home', render: renderParentDashboard, mount: mountParentDashboard },
];

function boot() {
  const progress = getProgress();

  // Inject global app structure
  document.getElementById('app').innerHTML = `
        <div id="navbar-anchor"></div>
        <main id="router-view" style="padding-top:var(--nav-height)"></main>
        <div id="tabbar-anchor"></div>
    `;

  window.router = new Router(routes, 'router-view');

  // Initial redirect if setup not done
  if (!progress.setupDone && window.location.hash !== '#/setup') {
    window.router.navigate('#/setup');
  }

  renderNav(window.location.hash);
  window.addEventListener('hashchange', () => renderNav(window.location.hash));
}

// Mount function for student home — wires countdown timer & quote refresh
function mountStudentHome() {
  // Countdown timer to exam (September 15, 2026)
  const countdownEl = document.getElementById('exam-countdown');
  if (countdownEl) {
    const examDate = new Date('2026-09-15');
    const daysLeft = Math.ceil((examDate - Date.now()) / 86400000);
    const weeksLeft = Math.ceil(daysLeft / 7);
    countdownEl.innerHTML = `
          <div style="text-align:right">
            <div style="font-family:var(--font-heading);font-size:28px;font-weight:900;line-height:1">${daysLeft}</div>
            <div style="font-size:12px;color:var(--c-text-muted)">days · ${weeksLeft} weeks</div>
          </div>`;
  }

  // Auto-refresh motivation quote every minute
  if (window._quoteInterval) clearInterval(window._quoteInterval);
  window._quoteInterval = null; // will be set fresh
}

function renderNav(hash) {
  const navAnchor = document.getElementById('navbar-anchor');
  const tabAnchor = document.getElementById('tabbar-anchor');

  if (!navAnchor || !tabAnchor) return;

  const isQuiz = hash.includes('/quiz/');
  const isParent = hash.includes('/parent/');
  const isSetup = hash === '#/setup';

  if (isQuiz || isSetup) {
    navAnchor.innerHTML = '';
    tabAnchor.innerHTML = '';
    return;
  }

  const isHome = hash === '#/student/home' || hash === '';
  const isPlan = hash === '#/student/plan';
  const isBadges = hash === '#/student/badges';

  const navBtn = (label, path, active) =>
    `<button class="nav-btn${active ? ' active' : ''}" onclick="window.router.navigate('${path}')">${label}</button>`;

  if (isParent) {
    navAnchor.innerHTML = `
            <nav class="navbar parent-nav">
                <div class="nav-logo">👨‍👩‍👧 Parent Portal</div>
                <button class="btn btn-outline btn-sm" onclick="window.router.navigate('#/student/home')">← Student View</button>
            </nav>
        `;
    tabAnchor.innerHTML = '';
  } else {
    const progress = getProgress();
    navAnchor.innerHTML = `
            <nav class="navbar student-nav">
                <div class="nav-logo">🎓 AcePrep</div>
                <div class="nav-links">
                    ${navBtn('🏠 Home', '#/student/home', isHome)}
                    ${navBtn('📅 Plan', '#/student/plan', isPlan)}
                    ${navBtn('🏅 Badges', '#/student/badges', isBadges)}
                    <button class="nav-btn btn-parent" onclick="window.router.navigate('#/parent/home')">👪 Parents</button>
                </div>
                <div class="nav-xp">⚡ ${progress.xp || 0} XP</div>
                <div class="nav-gems">💎 ${progress.gems || 0}</div>
            </nav>
        `;
    tabAnchor.innerHTML = `
            <div class="mobile-tabbar">
                <button class="mobile-tab${isHome ? ' active' : ''}" onclick="window.router.navigate('#/student/home')">
                    <span class="tab-icon">🏠</span>
                    <span>Home</span>
                </button>
                <button class="mobile-tab${isPlan ? ' active' : ''}" onclick="window.router.navigate('#/student/plan')">
                    <span class="tab-icon">📅</span>
                    <span>Plan</span>
                </button>
                <button class="mobile-tab${isBadges ? ' active' : ''}" onclick="window.router.navigate('#/student/badges')">
                    <span class="tab-icon">🏅</span>
                    <span>Badges</span>
                </button>
                <button class="mobile-tab" onclick="window.router.navigate('#/parent/home')">
                    <span class="tab-icon">👪</span>
                    <span>Parents</span>
                </button>
            </div>
        `;
  }
}

window.addEventListener('DOMContentLoaded', boot);
