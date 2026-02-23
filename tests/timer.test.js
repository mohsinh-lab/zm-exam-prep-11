
import { describe, it, expect, vi } from 'vitest';
import { Timer } from '../src/shared/utils/Timer.js';

describe('Timer', () => {
    it('should tick every second', () => {
        vi.useFakeTimers();
        const onTick = vi.fn();
        const timer = new Timer(10, onTick);
        timer.start();

        vi.advanceTimersByTime(2000);
        expect(onTick).toHaveBeenCalledTimes(2);
        expect(onTick).toHaveBeenCalledWith(8);

        timer.stop();
        vi.useRealTimers();
    });

    it('should call onComplete when time is up', () => {
        vi.useFakeTimers();
        const onComplete = vi.fn();
        const timer = new Timer(2, null, onComplete);
        timer.start();

        vi.advanceTimersByTime(2000);
        expect(onComplete).toHaveBeenCalled();

        timer.stop();
        vi.useRealTimers();
    });
});
