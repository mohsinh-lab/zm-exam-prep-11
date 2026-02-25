import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncProgressToCloud, loadProgressFromCloud } from '../src/engine/cloudSync.js';
import * as firebase from '../src/config/firebase.js';

vi.mock('../src/config/firebase.js', () => ({
    database: {},
    ref: vi.fn((db, path) => path),
    set: vi.fn(),
    get: vi.fn(),
    onValue: vi.fn()
}));

describe('Live Sync integration tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should dispatch sync events when writing data', async () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        firebase.set.mockResolvedValueOnce();

        const promise = syncProgressToCloud({ xp: 100 });

        // Before resolving, it should have dispatched an event
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'sync_state_changed' })
        );

        await promise;

        // After resolving, sync should be called
        expect(firebase.set).toHaveBeenCalled();
        dispatchSpy.mockRestore();
    });

    it('should fetch progress correctly', async () => {
        firebase.get.mockResolvedValueOnce({
            exists: () => true,
            val: () => ({ xp: 200 })
        });
        const data = await loadProgressFromCloud();
        expect(data.xp).toBe(200);
        expect(firebase.get).toHaveBeenCalled();
    });
});
