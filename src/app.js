
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
  { path: '#/student/home', render: renderStudentHome },
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
        <main id="router-view"></main>
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

function renderNav(hash) {
  const navAnchor = document.getElementById('navbar-anchor');
  const tabAnchor = document.getElementById('tabbar-anchor');

  const isQuiz = hash.includes('/quiz/');
  const isParent = hash.includes('/parent/');
  const isSetup = hash === '#/setup';

  if (isQuiz || isSetup) {
    navAnchor.innerHTML = '';
    tabAnchor.innerHTML = '';
    return;
  }

  if (isParent) {
    navAnchor.innerHTML = `
            <nav class="navbar parent-nav">
                <div class="nav-logo">👨‍👩‍👧 Parent Portal</div>
                <button class="btn btn-outline btn-sm" onclick="window.router.navigate('#/student/home')">Back to Student</button>
            </nav>
        `;
    tabAnchor.innerHTML = '';
  } else {
    navAnchor.innerHTML = `
            <nav class="navbar student-nav">
                <div class="nav-logo">🎓 AcePrep</div>
                <div class="nav-links">
                    <button onclick="window.router.navigate('#/student/home')">Home</button>
                    <button onclick="window.router.navigate('#/student/plan')">Plan</button>
                    <button onclick="window.router.navigate('#/student/badges')">Badges</button>
                    <button onclick="window.router.navigate('#/parent/home')" class="btn-parent">Parents</button>
                </div>
            </nav>
        `;
    tabAnchor.innerHTML = `
            <div class="mobile-tabbar">
                <button onclick="window.router.navigate('#/student/home')">🏠</button>
                <button onclick="window.router.navigate('#/student/plan')">📅</button>
                <button onclick="window.router.navigate('#/student/badges')">🏅</button>
                <button onclick="window.router.navigate('#/parent/home')">👪</button>
            </div>
        `;
  }
}

window.addEventListener('DOMContentLoaded', boot);
