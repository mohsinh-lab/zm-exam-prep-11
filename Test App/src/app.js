
import './styles/main.css';
import { Router } from './core/router.js';
import { renderStudentHome, mountStudentHome } from './features/student/Home.js';
import { renderStudentQuiz, mountStudentQuiz } from './features/student/Quiz.js';
import { renderParentDashboard, mountParentDashboard } from './features/parent/Dashboard.js';
import { renderAnalyticsDashboard, mountAnalyticsDashboard } from './features/parent/AnalyticsDashboard.js';
import { renderStudentResults, mountStudentResults } from './features/student/Results.js';
import { renderActionPlan } from './pages/actionplan.js';
import { renderAchievements } from './pages/achievements.js';
import { renderSkins, mountSkins } from './pages/skins.js';
import { renderExamMode, mountExamMode } from './features/student/ExamMode.js';
import { renderLeaderboard, mountLeaderboard } from './features/student/Leaderboard.js';
import { renderReadingComprehension, mountReadingComprehension } from './features/student/ReadingComprehension.js';
import { renderSetup, mountSetup } from './pages/setup.js';
import { getProgress, getAuth, logout, initLiveSync, getDailyChallenge } from './engine/progressStore.js';
import { renderLogin, mountLogin } from './features/auth/Login.js';
import { renderOnboarding, mountOnboarding } from './features/auth/Onboarding.js';
import { getTranslation, setLanguage, getCurrentLang } from './core/i18n.js';

const routes = [
  { path: '#/setup', render: renderSetup, mount: mountSetup, title: 'Setup' },
  { path: '#/login', render: renderLogin, mount: mountLogin, title: 'Login' },
  { path: '#/onboarding', render: renderOnboarding, mount: mountOnboarding, title: 'Select Role' },
  { path: '#/student/home', render: renderStudentHome, mount: mountStudentHome, title: 'Student Dashboard' },
  { path: '#/student/quiz/:subject', render: renderStudentQuiz, mount: mountStudentQuiz, title: 'Quiz Training' },
  { path: '#/student/plan', render: renderActionPlan, title: 'Study Plan' },
  { path: '#/student/badges', render: renderAchievements, title: 'Achievements' },
  { path: '#/student/leaderboard', render: renderLeaderboard, mount: mountLeaderboard, title: 'Leaderboard' },
  { path: '#/student/skins', render: renderSkins, mount: mountSkins, title: 'Ace Skins' },
  { path: '#/student/exam', render: renderExamMode, mount: mountExamMode, title: 'Mock Exam' },
  { path: '#/student/reading', render: renderReadingComprehension, mount: mountReadingComprehension, title: 'Reading Comprehension' },
  { path: '#/student/reading/:id', render: renderReadingComprehension, mount: mountReadingComprehension, title: 'Reading Comprehension' },
  { path: '#/student/results', render: renderStudentResults, mount: mountStudentResults, title: 'Quiz Results' },
  { path: '#/parent/home', render: renderParentDashboard, mount: mountParentDashboard, title: 'Parent Portal' },
  { path: '#/parent/analytics', render: renderAnalyticsDashboard, mount: mountAnalyticsDashboard, title: 'Analytics Dashboard' },
  { path: '#/parent/analytics/subject/:subject', render: renderAnalyticsDashboard, mount: mountAnalyticsDashboard, title: 'Subject Analytics' },
];

function boot() {
  try {
    const progress = getProgress();

    if ('serviceWorker' in navigator) {
      const swPath = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker.register(swPath)
        .then(reg => console.log('🚀 Service Worker Registered!', reg))
        .catch(err => console.error('❌ Service Worker Registration Failed', err));
    }

    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        if (splash.parentNode) splash.remove();
      }, 700);
    }

    document.getElementById('app').innerHTML = `
        <div id="navbar-anchor"></div>
        <main id="router-view" style="padding-top:var(--nav-height)"></main>
        <div id="tabbar-anchor"></div>
    `;

    window.router = new Router(routes, 'router-view');

    const authInfo = getAuth();

    const hashBase = window.location.hash.split('?')[0];
    const isAuthOrOnboarding = hashBase === '#/login' || hashBase === '#/onboarding';

    if (!authInfo.currentUser && !isAuthOrOnboarding) {
      window.router.navigate('#/login' + (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : ''));
    } else if (!progress.setupDone && hashBase !== '#/setup') {
      window.router.navigate('#/setup');
    }

    renderNav(window.location.hash);

    // Mark app as booted immediately (don't wait for Firebase)
    window.__APP_BOOTED__ = true;
    console.log('✅ AcePrep Boot Successful');
    if (window.__BOOT_TIMEOUT__) {
      clearTimeout(window.__BOOT_TIMEOUT__);
      window.__BOOT_TIMEOUT__ = null;
    }

    // Initialize Firebase auth in background (non-blocking)
    import('./config/firebase.js').then(({ auth, onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const localUser = JSON.parse(localStorage.getItem('aceprep_user') || '{}');
          if (!localUser.uid || localUser.uid !== user.uid) {
            import('./config/firebase.js').then(({ database, ref, get }) => {
              get(ref(database, 'users/' + user.uid + '/role')).then(snap => {
                if (snap.exists()) {
                  localStorage.setItem('aceprep_user', JSON.stringify({
                    email: user.email,
                    uid: user.uid,
                    displayName: user.displayName,
                    role: snap.val()
                  }));
                  initLiveSync();
                  if (window.location.hash === '#/login') window.router.handleRoute();
                }
              });
            });
          } else {
            initLiveSync();
          }
        }
      });
    }).catch(err => console.error('Firebase init error:', err));

    window.addEventListener('hashchange', () => {
      const auth = getAuth();
      if (auth.currentUser) initLiveSync();
      const hashBase = window.location.hash.split('?')[0];
      const isAuthOrOnboarding = hashBase === '#/login' || hashBase === '#/onboarding';

      if (!auth.currentUser && !isAuthOrOnboarding) {
        window.router.navigate('#/login' + (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : ''));
      }
      renderNav(hashBase);
    });

    window.addEventListener('sync_state_changed', (e) => {
      const { connected, syncing } = e.detail;
      const indicator = document.getElementById('sync-indicator');
      if (!indicator) return;
      if (!connected) indicator.innerHTML = '☁️ <span style="color:var(--c-danger)">Offline</span>';
      else if (syncing) indicator.innerHTML = '☁️ <span style="color:var(--c-warning)">Syncing...</span>';
      else indicator.innerHTML = '☁️ <span style="color:var(--c-success)">Synced</span>';
    });
  } catch (error) {
    console.error('CRITICAL BOOT ERROR:', error);
  }
}

function renderNav(hash) {
  const navAnchor = document.getElementById('navbar-anchor');
  const tabAnchor = document.getElementById('tabbar-anchor');
  if (!navAnchor || !tabAnchor) return;

  const hashBase = hash.split('?')[0];
  const isQuiz = hashBase.includes('/quiz/');
  const isParent = hashBase.includes('/parent/');
  const isSetup = hashBase === '#/setup';
  const isLogin = hashBase === '#/login';
  const isOnboarding = hashBase === '#/onboarding';

  if (isQuiz || isSetup || isLogin || isOnboarding) {
    navAnchor.innerHTML = '';
    tabAnchor.innerHTML = '';
    return;
  }

  const isHome = hashBase === '#/student/home' || hashBase === '' || hashBase === '#';
  const isPlan = hashBase === '#/student/plan';
  const isBadges = hashBase === '#/student/badges';
  const isLeaderboard = hashBase === '#/student/leaderboard';

  const navBtn = (label, path, active, aria) =>
    `<button class="nav-btn${active ? ' active' : ''}" onclick="window.router.navigate('${path}')" aria-label="${aria || label}">${label}</button>`;

  window._toggleLang = () => {
    const next = getCurrentLang() === 'en' ? 'ur' : 'en';
    setLanguage(next);
  };

  if (isParent) {
    navAnchor.innerHTML = `
            <nav class="navbar parent-nav">
                <div class="nav-logo">👨‍👩‍👧 Parent Portal</div>
                <div style="flex-grow: 1;"></div>
                <div id="sync-indicator" style="font-size: 12px; font-weight: bold; margin-right: 16px;">☁️ ...</div>
                <button class="btn btn-outline btn-sm" onclick="window.router.navigate('#/student/home')">← Student View</button>
            </nav>
        `;
    tabAnchor.innerHTML = '';
  } else {
    const progress = getProgress();
    const auth = getAuth();
    const isStudent = auth.currentUser === 'student';

    window._handleLogout = () => {
      logout();
      window.router.navigate('#/login');
    };

    navAnchor.innerHTML = `
            <nav class="navbar student-nav" style="${getCurrentLang() === 'ur' ? 'direction:rtl' : ''}">
                <div class="nav-logo">🎓 AcePrep</div>
                <div class="nav-links">
                    ${navBtn(`<span aria-hidden="true" style="margin-right:8px">🔥</span> ${getTranslation('home')}`, '#/student/home', isHome, 'Home')}
                    ${navBtn(`<span aria-hidden="true" style="margin-right:8px">📅</span> ${getTranslation('plan')}`, '#/student/plan', isPlan, 'Study Plan')}
                    ${navBtn(`<span aria-hidden="true" style="margin-right:8px">🏆</span> ${getTranslation('ranks')}`, '#/student/leaderboard', isLeaderboard, 'Leaderboard')}
                    ${navBtn(`<span aria-hidden="true" style="margin-right:8px">🏅</span> ${getTranslation('badges')}`, '#/student/badges', isBadges, 'Achievements')}
                    ${isStudent ? '' : `<button class="nav-btn" onclick="window.router.navigate('#/parent/home')" aria-label="Go to Parents Portal">${getTranslation('parents')}</button>`}
                    <button class="nav-btn" onclick="window._toggleLang()" aria-label="Switch Language">🌐 ${getCurrentLang().toUpperCase()}</button>
                    <button class="nav-btn" onclick="window._handleLogout()" aria-label="Logout">${getTranslation('logout')}</button>
                </div>
                <div class="nav-xp">⚡ ${progress.xp || 0} XP</div>
                <div class="nav-gems">💎 ${progress.gems || 0}</div>
                <div id="sync-indicator" style="margin-left: 12px; font-size: 12px; font-weight: bold;">☁️ ...</div>
            </nav>
        `;
    tabAnchor.innerHTML = `
            <div class="mobile-tabbar">
                <button class="mobile-tab${isHome ? ' active' : ''}" onclick="window.router.navigate('#/student/home')" aria-label="Student Home">
                    <span class="tab-icon" aria-hidden="true">🏠</span>
                    <span>Home</span>
                </button>
                <button class="mobile-tab${isPlan ? ' active' : ''}" onclick="window.router.navigate('#/student/plan')" aria-label="Study Plan">
                    <span class="tab-icon" aria-hidden="true">📅</span>
                    <span>Plan</span>
                </button>
                <button class="mobile-tab${isLeaderboard ? ' active' : ''}" onclick="window.router.navigate('#/student/leaderboard')" aria-label="Global Leaderboard">
                    <span class="tab-icon" aria-hidden="true">🏆</span>
                    <span>Ranks</span>
                </button>
                <button class="mobile-tab${isBadges ? ' active' : ''}" onclick="window.router.navigate('#/student/badges')" aria-label="My Badges">
                    <span class="tab-icon" aria-hidden="true">🏅</span>
                    <span>Badges</span>
                </button>
                ${isStudent ? `
                <button class="mobile-tab" onclick="window._handleLogout()" aria-label="Logout Account">
                    <span class="tab-icon" aria-hidden="true">🚪</span>
                    <span>Logout</span>
                </button>
                ` : `
                <button class="mobile-tab${isParent ? ' active' : ''}" onclick="window.router.navigate('#/parent/home')" aria-label="Parent Portal">
                    <span class="tab-icon" aria-hidden="true">👪</span>
                    <span>Parents</span>
                </button>
                `}
            </div>
        `;
  }
}

window.addEventListener('DOMContentLoaded', boot);
