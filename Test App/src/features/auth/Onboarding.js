import { audio } from '../../engine/audioEngine.js';

export function renderOnboarding() {
    return `
    <div class="page page-enter auth-page" style="background: var(--c-bg); display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 20px;">
        <div class="auth-card" style="background: white; border-radius: var(--r-xl); padding: 40px; box-shadow: var(--shadow-lg); max-width: 440px; width: 100%; text-align: center;">
            
            <img src="pokemon-hero.png" alt="Guardian" style="width: 100px; margin-bottom: 20px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));">
            
            <h1 class="auth-title" style="color: var(--c-text); font-family: var(--font-heading); font-weight: 900; font-size: 24px; margin-bottom: 8px;">WELCOME TO ACEPREP</h1>
            <p class="auth-subtitle" style="color: var(--c-text-muted); font-weight: 700; font-size: 14px; margin-bottom: 32px;">WHO IS USING THIS DEVICE?</p>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <button id="btn-role-student" class="btn" data-testid="onboarding-role-student" style="background: var(--c-primary); color: white; padding: 20px; border-radius: 16px; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 12px; transition: transform 0.1s;">
                    🎓 I AM THE STUDENT
                </button>

                <button id="btn-role-parent" class="btn" data-testid="onboarding-role-parent" style="background: white; color: var(--c-text); border: 2px solid #e2e8f0; padding: 20px; border-radius: 16px; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 12px; transition: transform 0.1s;">
                    👨‍👩‍👧 I AM THE PARENT
                </button>
            </div>
            
        </div>
    </div>
    `;
}

export function mountOnboarding() {
    // Attempt to grab partial logged in user
    let userCache = null;
    try {
        const existingData = localStorage.getItem('aceprep_user');
        if (existingData) {
            userCache = JSON.parse(existingData);
        }
    } catch (e) { }

    if (!userCache || !userCache.uid) {
        // If they somehow got here without logging in via Google, bump them to login
        window.router.navigate('#/login');
        return;
    }

    const setRole = async (role) => {
        try { audio.init(); audio.play('click'); } catch (e) { }

        // Write the role to Firebase
        try {
            const { database, ref, set } = await import('../../config/firebase.js');
            const roleRef = ref(database, 'users/' + userCache.uid + '/role');
            await set(roleRef, role);
            console.log(`[Audit] Role assigned during onboarding: ${role} for UID ${userCache.uid}`);

            // Update local storage to have the complete profile
            userCache.role = role;
            localStorage.setItem('aceprep_user', JSON.stringify(userCache));

            // Navigate
            if (role === 'student') {
                window.router.navigate('#/student/home');
            } else {
                window.router.navigate('#/parent/home');
            }

        } catch (err) {
            console.error('Failed to save role to DB', err);
            alert('Cannot save role. Check connection.');
        }
    };

    const studentBtn = document.getElementById('btn-role-student');
    if (studentBtn) {
        studentBtn.addEventListener('click', () => setRole('student'));
    }

    const parentBtn = document.getElementById('btn-role-parent');
    if (parentBtn) {
        parentBtn.addEventListener('click', () => setRole('parent'));
    }
}
