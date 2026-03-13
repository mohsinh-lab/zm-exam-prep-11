
import './styles/main.css';
import { Router } from './core/router.js';
import { renderStudentHome } from './features/student/Home.js';
import { renderStudentQuiz, mountStudentQuiz } from './features/student/Quiz.js';
import { renderParentDashboard, mountParentDashboard } from './features/parent/Dashboard.js';
import { renderStudentResults, mountStudentResults } from './features/student/Results.js';
import { renderActionPlan } from './pages/actionplan.js';
import { renderAchievements } from './pages/achievements.js';
import { renderSetup, mountSetup } from './pages/setup.js';
import { getProgress, getAuth, logout, initLiveSync, getDailyChallenge } from './engine/progressStore.js';
import { renderLogin, mountLogin } from './features/auth/Login.js';
import { renderOnboarding, mountOnboarding } from './features/auth/Onboarding.js';

const routes = [
  { path: '#/setup', render: renderSetup, mount: mountSetup },
  { path: '#/login', render: renderLogin, mount: mountLogin },
  { path: '#/onboarding', render: renderOnboarding, mount: mountOnboarding },
  { path: '#/student/home', render: renderStudentHome, mount: mountStudentHome },
  { path: '#/student/quiz/:subject', render: renderStudentQuiz, mount: mountStudentQuiz },
  { path: '#/student/plan', render: renderActionPlan },
  { path: '#/student/badges', render: renderAchievements },
  { path: '#/student/results', render: renderStudentResults, mount: mountStudentResults },
  { path: '#/parent/home', render: renderParentDashboard, mount: mountParentDashboard },
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
    });

    const hashBase = window.location.hash.split('?')[0];
    const isAuthOrOnboarding = hashBase === '#/login' || hashBase === '#/onboarding';

    if (!authInfo.currentUser && !isAuthOrOnboarding) {
      window.router.navigate('#/login' + (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : ''));
    } else if (!progress.setupDone && hashBase !== '#/setup') {
      window.router.navigate('#/setup');
    }

    renderNav(window.location.hash);

    window.__APP_BOOTED__ = true;
    if (window.__BOOT_TIMEOUT__) clearTimeout(window.__BOOT_TIMEOUT__);

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

function mountStudentHome() {
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

  window._startDaily = () => {
    const challenge = getDailyChallenge();
    if (challenge && !challenge.isCompleted) {
      window.router.navigate(`#/student/quiz/${challenge.subject}?daily=true`);
    } else {
      alert("Mission already complete! Check back tomorrow.");
    }
  };
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

  const navBtn = (label, path, active) =>
    `<button class="nav-btn${active ? ' active' : ''}" onclick="window.router.navigate('${path}')">${label}</button>`;

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
            <nav class="navbar student-nav">
                <div class="nav-logo">🎓 AcePrep</div>
                <div class="nav-links">
                    ${navBtn('🏠 Home', '#/student/home', isHome)}
                    ${navBtn('📅 Plan', '#/student/plan', isPlan)}
                    ${navBtn('🏅 Badges', '#/student/badges', isBadges)}
                    ${isStudent ? '' : `<button class="nav-btn" onclick="window.router.navigate('#/parent/home')">👪 Parents</button>`}
                    <button class="nav-btn" onclick="window._handleLogout()">🚪 Logout</button>
                </div>
                <div class="nav-xp">⚡ ${progress.xp || 0} XP</div>
                <div class="nav-gems">💎 ${progress.gems || 0}</div>
                <div id="sync-indicator" style="margin-left: 12px; font-size: 12px; font-weight: bold;">☁️ ...</div>
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
                ${isStudent ? `
                <button class="mobile-tab" onclick="window._handleLogout()">
                    <span class="tab-icon">🚪</span>
                    <span>Logout</span>
                </button>
                ` : `
                <button class="mobile-tab${isParent ? ' active' : ''}" onclick="window.router.navigate('#/parent/home')">
                    <span class="tab-icon">👪</span>
                    <span>Parents</span>
                </button>
                `}
            </div>
        `;
  }
}

window.addEventListener('DOMContentLoaded', boot);
