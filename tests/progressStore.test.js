import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProgress, updateProgress, login, resetProgress, forceSyncFromCloud } from '../src/engine/progressStore.js';
import * as cloudSync from '../src/engine/cloudSync.js';

vi.mock('../src/engine/cloudSync.js', () => ({
    syncProgressToCloud: vi.fn(),
    loadProgressFromCloud: vi.fn(),
    subscribeToProgress: vi.fn(),
    setSyncEmail: vi.fn()
}));

describe('Progress Store', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('should return default progress if empty', () => {
        const progress = getProgress();
        expect(progress.studentName).toBe('Zayyan Mohsin');
        expect(progress.xp).toBe(0);
        expect(progress.gems).toBe(5);
    });

    it('should correctly authenticate student and parent', () => {
        const p = getProgress();
        p.auth.studentPass = '1234';
        p.auth.parentPass = '4321';
        updateProgress(p);

        expect(login('1111')).toBeNull();
        expect(login('1234')).toBe('student');
        expect(login('4321')).toBe('parent');

        expect(sessionStorage.getItem('ace_current_user')).toBe('parent');
    });

    it('should call cloud sync API on update progress', () => {
        const progress = getProgress();
        progress.xp = 100;

        // Mock custom event to prevent unhandled errors/logs
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        updateProgress(progress);

        expect(localStorage.getItem('11plus_progress')).toContain('"xp":100');
        expect(cloudSync.syncProgressToCloud).toHaveBeenCalledWith(progress);
        expect(dispatchSpy).toHaveBeenCalled();

        dispatchSpy.mockRestore();
    });

    it('should load mock cloud data successfully via forceSyncFromCloud', async () => {
        const mockCloudData = { ...getProgress(), xp: 500 };
        cloudSync.loadProgressFromCloud.mockResolvedValueOnce(mockCloudData);

        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        const result = await forceSyncFromCloud();

        expect(result).toBe(true);
        expect(getProgress().xp).toBe(500);
        expect(dispatchSpy).toHaveBeenCalled();

        dispatchSpy.mockRestore();
    });
});
