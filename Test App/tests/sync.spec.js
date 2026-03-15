import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.hoisted ensures these are available when vi.mock factory runs
const { mockSet, mockGet, mockOnValue, mockRef, mockFb } = vi.hoisted(() => {
    const mockSet = vi.fn();
    const mockGet = vi.fn();
    const mockOnValue = vi.fn(() => () => {});
    const mockRef = vi.fn((db, path) => path);
    const mockFb = { database: {}, ref: mockRef, set: mockSet, get: mockGet, onValue: mockOnValue };
    return { mockSet, mockGet, mockOnValue, mockRef, mockFb };
});

vi.mock('../src/config/firebase.js', () => ({
    initFirebase: vi.fn(),
    getFirebase: vi.fn(() => mockFb),
    awaitFirebase: vi.fn(() => Promise.resolve(mockFb)),
}));

import { syncProgressToCloud, loadProgressFromCloud } from '../src/engine/cloudSync.js';

describe('Live Sync integration tests', () => {
    beforeEach(() => {
        mockSet.mockReset();
        mockGet.mockReset();
        mockOnValue.mockReset();
        mockRef.mockReset();
        mockRef.mockImplementation((db, path) => path);
    });

    it('should dispatch sync events when writing data', async () => {
        mockSet.mockResolvedValueOnce();
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        await syncProgressToCloud({ xp: 100 });

        // After awaiting, sync_state_changed should have been dispatched
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'sync_state_changed' })
        );
        expect(mockSet).toHaveBeenCalled();
        dispatchSpy.mockRestore();
    });

    it('should fetch progress correctly', async () => {
        mockGet.mockResolvedValueOnce({
            exists: () => true,
            val: () => ({ xp: 200 })
        });
        const data = await loadProgressFromCloud();
        expect(data.xp).toBe(200);
        expect(mockGet).toHaveBeenCalled();
    });
});
