
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

    it('should reset timer properly', () => {
        vi.useFakeTimers();
        const onTick = vi.fn();
        const timer = new Timer(10, onTick);
        timer.start();

        vi.advanceTimersByTime(2000);
        expect(timer.timeLeft).toBe(8);

        timer.reset();
        expect(timer.timeLeft).toBe(10);
        expect(onTick).toHaveBeenCalledWith(10);

        timer.stop();
        vi.useRealTimers();
    });

    it('should stop timer and not tick', () => {
        vi.useFakeTimers();
        const onTick = vi.fn();
        const timer = new Timer(10, onTick);
        timer.start();

        timer.stop();
        vi.advanceTimersByTime(5000);

        expect(onTick).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
});
