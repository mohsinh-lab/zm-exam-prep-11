import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuth, logout } from '../src/engine/progressStore.js';

vi.mock('../src/config/firebase.js', () => ({
    auth: { signOut: vi.fn().mockResolvedValue() }
}));

describe('Auth integration tests', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('should fall back to null if no auth state exists', () => {
        const auth = getAuth();
        expect(auth.currentUser).toBeNull();
    });

    it('should prioritize sessionStorage for PIN logins', () => {
        sessionStorage.setItem('ace_current_user', 'student');
        localStorage.setItem('aceprep_user', JSON.stringify({ role: 'parent' }));
        const auth = getAuth();
        expect(auth.currentUser).toBe('student');
    });

    it('should read Google SSO role from localStorage if no session exists', () => {
        localStorage.setItem('aceprep_user', JSON.stringify({ role: 'parent', email: 'test@gmail.com' }));
        const auth = getAuth();
        expect(auth.currentUser).toBe('parent');
    });

    it('logout should clear both storages', async () => {
        sessionStorage.setItem('ace_current_user', 'student');
        localStorage.setItem('aceprep_user', JSON.stringify({ role: 'student' }));

        logout();

        expect(sessionStorage.getItem('ace_current_user')).toBeNull();
        expect(localStorage.getItem('aceprep_user')).toBeNull();
    });
});
