import { audio } from '../../engine/audioEngine.js';

export function renderLogin() {
    return `
    <div class="page page-enter auth-page" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); display: flex; align-items: center; justify-content: center; min-height: 100dvh; padding: 20px; font-family: var(--font-body), sans-serif;">
        
        <div class="auth-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 32px; padding: 48px 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); max-width: 440px; width: 100%; text-align: center; position: relative; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.2);">
            
            <!-- Decorative blobs -->
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(99, 102, 241, 0.2); border-radius: 50%; opacity: 0.8; filter: blur(20px);"></div>
            <div style="position: absolute; bottom: -50px; left: -50px; width: 100px; height: 100px; background: rgba(56, 189, 248, 0.2); border-radius: 50%; opacity: 0.8; filter: blur(20px);"></div>
            
            <div style="position: relative; z-index: 1;">
                <img src="pokemon-hero.png" alt="Hero" style="width: 140px; margin-bottom: 24px; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.15)); border-radius: 24px;">
                
                <h1 class="auth-title" style="color: #0f172a; font-family: var(--font-heading); font-weight: 900; font-size: 36px; margin-bottom: 8px; letter-spacing: -1px;">AcePrep 11+</h1>
                <p class="auth-subtitle" style="color: #475569; font-weight: 600; font-size: 16px; margin-bottom: 40px; line-height: 1.5;">Your intelligent companion for the GL Assessment.<br>Unlock your Dream School journey.</p>
                
                <button id="btn-google-signin" class="btn" data-testid="login-google-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; background: white; color: #334155; border: 2px solid #e2e8f0; font-size: 16px; font-weight: 800; padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.05)'">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 24px; height: 24px;">
                    Continue with Google
                </button>
                
                <div class="auth-footer" style="margin-top: 32px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="font-size: 16px;">☁️</span>
                    <p style="color: #94a3b8; font-size: 12px; font-weight: 700;">Secure, fast, and fully synced.</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function mountLogin() {
    // Check Firebase Auth instance mapping
    const googleBtn = document.getElementById('btn-google-signin');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                // Ensure audio context is unlocked
                try { audio.init(); audio.play('click'); } catch (e) { }

                // Parse potential deep link invites: #/login?invite=XYZ&role=student
                let inviteUid = null;
                let inviteRole = null;
                try {
                    const hashParts = window.location.hash.split('?');
                    if (hashParts.length > 1) {
                        const params = new URLSearchParams(hashParts[1]);
                        inviteUid = params.get('invite');
                        inviteRole = params.get('role');
                    }
                } catch (e) { }

                // We use dynamic import for firebase to not break the fallback if firebase isn't configured
                const { auth, googleProvider, signInWithPopup, database, ref, get, set, update } = await import('../../config/firebase.js');

                signInWithPopup(auth, googleProvider).then(async (result) => {
                    const user = result.user;
                    console.log('Google Sign-In Success:', user.email);

                    // Determine Role via dynamically via Firebase DB
                    const email = user.email.toLowerCase();
                    const uid = user.uid;
                    let expectedRole = null;

                    try {
                        const roleRef = ref(database, 'users/' + uid + '/role');
                        const roleSnap = await get(roleRef);

                        if (roleSnap.exists()) {
                            expectedRole = roleSnap.val();
                        } else {
                            // NEW USER! Check if they arrived via Invite Link
                            if (inviteUid && inviteRole) {
                                expectedRole = inviteRole;
                                // Save their new role
                                await set(roleRef, expectedRole);

                                // Build Graph Relationship in DB
                                const updates = {};
                                // 1. Map them to the parent's graph
                                const safeEmail = email.replace(/[.#$[\]]/g, '_');
                                updates['users/' + inviteUid + '/linked_students/' + safeEmail] = uid;
                                // 2. Map parent to student's graph for bi-directional gate
                                updates['users/' + uid + '/linked_parents/' + inviteUid] = true;
                                // 3. Remove the pending invite
                                updates['users/' + inviteUid + '/pending_invites/' + safeEmail] = null;

                                await update(ref(database), updates);
                                console.log(`[Audit] Invite accepted! Bi-directional link created between ${email} and Parent ${inviteUid}`);
                            }
                            // Fallback for legacy Zayyan account
                            else if (email === 'zayyanmohsin16@gmail.com') {
                                expectedRole = 'student';
                                await set(roleRef, expectedRole);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to get/set role from DB', err);
                        if (email === 'zayyanmohsin16@gmail.com') expectedRole = 'student';
                    }

                    // Set local current_user info
                    localStorage.setItem('aceprep_user', JSON.stringify({
                        email: email,
                        uid: user.uid,
                        displayName: user.displayName,
                        role: expectedRole // Might be null if new + not invited
                    }));

                    // Clean up URL so refresh doesn't hold params
                    window.location.hash = '#/login';

                    if (expectedRole === 'student') {
                        window.router.navigate('#/student/home');
                    } else if (expectedRole === 'parent') {
                        window.router.navigate('#/parent/home');
                    } else {
                        // New user without role
                        window.router.navigate('#/onboarding');
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
}
