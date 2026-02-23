
import { login } from '../../engine/progressStore.js';

export function renderLogin() {
    return `
    <div class="page page-enter auth-page">
        <div class="auth-card">
            <div class="auth-icon">🔐</div>
            <h1 class="auth-title">Welcome to AcePrep</h1>
            <p class="auth-subtitle">Enter your 4-digit passcode to continue</p>
            
            <div class="passcode-display">
                <div class="dot" id="dot-0"></div>
                <div class="dot" id="dot-1"></div>
                <div class="dot" id="dot-2"></div>
                <div class="dot" id="dot-3"></div>
            </div>

            <div class="keypad">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" onclick="window._pressKey('${n}')">${n}</button>`).join('')}
                <button class="key key-clear" onclick="window._clearKeys()">C</button>
                <button class="key" onclick="window._pressKey('0')">0</button>
                <button class="key key-delete" onclick="window._deleteKey()">⌫</button>
            </div>

            <div id="auth-error" class="auth-error hidden">❌ Invalid passcode. Try again.</div>
            
            <div class="auth-footer">
                <p>Passcodes: 2016 (Student) or 0786 (Parent)</p>
            </div>
        </div>
    </div>
    `;
}

let input = '';

export function mountLogin() {
    input = '';
    updateDots();

    window._pressKey = (key) => {
        if (input.length < 4) {
            input += key;
            updateDots();
            if (input.length === 4) {
                setTimeout(attemptLogin, 300);
            }
        }
    };

    window._clearKeys = () => {
        input = '';
        updateDots();
        hideError();
    };

    window._deleteKey = () => {
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
