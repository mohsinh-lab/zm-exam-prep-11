import { login } from '../../engine/progressStore.js';
import { audio } from '../../engine/audioEngine.js';

export function renderLogin() {
    return `
    <div class="page page-enter auth-page" style="background: var(--c-bg); display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 20px;">
        <div class="auth-card" style="background: white; border-radius: var(--r-xl); padding: 40px; box-shadow: var(--shadow-lg); max-width: 400px; width: 100%; text-align: center; position: relative;">
            
            <img src="pokemon-hero.png" alt="Guardian" style="width: 120px; margin-bottom: 20px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));">
            
            <h1 class="auth-title" style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; font-size: 28px; margin-bottom: 8px;">ACEPREP</h1>
            <p class="auth-subtitle" style="color: var(--c-text-muted); font-weight: 700; font-size: 14px; margin-bottom: 32px;">ENTER PASSCODE TO START STUDYING</p>
            
            <div class="passcode-display" style="display: flex; gap: 16px; justify-content: center; margin-bottom: 40px;">
                <div class="dot" id="dot-0" style="width: 20px; height: 20px; border: 3px solid #eee; border-radius: 50%;"></div>
                <div class="dot" id="dot-1" style="width: 20px; height: 20px; border: 3px solid #eee; border-radius: 50%;"></div>
                <div class="dot" id="dot-2" style="width: 20px; height: 20px; border: 3px solid #eee; border-radius: 50%;"></div>
                <div class="dot" id="dot-3" style="width: 20px; height: 20px; border: 3px solid #eee; border-radius: 50%;"></div>
            </div>

            <div class="keypad" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" style="background: #f8fafc; color: var(--c-text); font-weight: 900; font-size: 20px; padding: 16px; border-radius: 16px; border-bottom: 4px solid #e2e8f0; transition: all 0.1s;" onclick="window._pressKey('${n}')">${n}</button>`).join('')}
                <button class="key key-clear" style="background: #fee2e2; color: #ef4444;" onclick="window._clearKeys()">C</button>
                <button class="key" style="background: #f8fafc; color: var(--c-text);" onclick="window._pressKey('0')">0</button>
                <button class="key key-delete" style="background: #f1f5f9; color: var(--c-text-muted);" onclick="window._deleteKey()">⌫</button>
            </div>

            <div id="auth-error" class="auth-error hidden" style="color: var(--c-danger); font-weight: 800; margin-top: 24px; font-size: 14px;">❌ WRONG PASSCODE</div>

            <div class="div-line" style="margin: 32px 0; border-top: 1px solid #f1f5f9; position: relative;">
                <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; color: var(--c-text-muted); font-size: 12px; font-weight: 700;">OR</span>
            </div>

            <button id="btn-google-signin" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; background: white; color: var(--c-text); border: 2px solid #e2e8f0; box-shadow: none;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 20px; height: 20px;">
                Sign in with Google
            </button>
            
            <div class="auth-footer" style="margin-top: 24px;">
                <p style="color: var(--c-text-muted); font-size: 12px; font-weight: 700;">HINT: 2016 (STUDENT) · 0786 (PARENT)</p>
            </div>
        </div>
    </div>
    `;
}

let input = '';

export function mountLogin() {
    input = '';
    updateDots();

    // Check Firebase Auth instance mapping
    const googleBtn = document.getElementById('btn-google-signin');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                // Ensure audio context is unlocked
                try { audio.init(); audio.play('click'); } catch (e) { }

                // We use dynamic import for firebase to not break the fallback if firebase isn't configured
                const { auth, googleProvider, signInWithPopup, TEST_ACCOUNTS } = await import('../../config/firebase.js');

                signInWithPopup(auth, googleProvider).then((result) => {
                    const user = result.user;
                    console.log('Google Sign-In Success:', user.email);

                    // Determine Role via email
                    const email = user.email.toLowerCase();
                    const expectedRole = TEST_ACCOUNTS[email] || 'parent'; // default to parent onboarding
                    // Set local current_user info
                    localStorage.setItem('aceprep_user', JSON.stringify({
                        email: email,
                        uid: user.uid,
                        displayName: user.displayName,
                        role: expectedRole
                    }));

                    if (expectedRole === 'student') {
                        window.router.navigate('#/student/home');
                    } else {
                        window.router.navigate('#/parent/home');
                    }
                }).catch((error) => {
                    console.error('SSO Error:', error);
                    alert('Google Sign-In failed or was cancelled.');
                });

            } catch (err) {
                console.error("Firebase module couldn't be loaded:", err);
                alert('Sign-In requires Firebase to be configured properly in src/config/firebase.js');
            }
        });
    }

    // Attempt to parse auto-login if they had previous successful signIn
    try {
        const existingData = localStorage.getItem('aceprep_user');
        if (existingData) {
            const parsed = JSON.parse(existingData);
            if (parsed.role === 'student' || parsed.role === 'parent') {
                console.log("Auto-restoring session for", parsed.email);
            }
        }
    } catch (e) { }

    window._pressKey = (key) => {
        try { audio.init(); audio.play('click'); } catch (e) { }
        if (input.length < 4) {
            input += key;
            updateDots();
            if (input.length === 4) {
                setTimeout(attemptLogin, 300);
            }
        }
    };

    window._clearKeys = () => {
        try { audio.init(); audio.play('click'); } catch (e) { }
        input = '';
        updateDots();
        hideError();
    };

    window._deleteKey = () => {
        try { audio.init(); audio.play('click'); } catch (e) { }
        input = input.slice(0, -1);
        updateDots();
        hideError();
    };

    function updateDots() {
        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) {
                dot.classList.toggle('filled', i < input.length);
            }
        }
    }

    function attemptLogin() {
        const userType = login(input);
        if (userType) {
            // For the passcode fallback, we assume Zayyan's identity
            const email = userType === 'student' ? 'zayyanmohsin16@gmail.com' : 'mohsin.haji@gmail.com';
            localStorage.setItem('aceprep_user', JSON.stringify({
                email: email,
                uid: 'legacy-pin-' + userType,
                role: userType
            }));

            if (userType === 'student') {
                window.router.navigate('#/student/home');
            } else {
                window.router.navigate('#/parent/home');
            }
        } else {
            showError();
            input = '';
            setTimeout(updateDots, 300);
        }
    }

    function showError() {
        const err = document.getElementById('auth-error');
        if (err) err.classList.remove('hidden');
    }

    function hideError() {
        const err = document.getElementById('auth-error');
        if (err) err.classList.add('hidden');
    }
}
