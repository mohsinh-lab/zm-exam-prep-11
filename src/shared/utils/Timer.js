
export class Timer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration;
        this.timeLeft = duration;
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.interval = null;
    }

    start() {
        this.stop();
        this.timeLeft = this.duration;
        this.interval = setInterval(() => {
            this.timeLeft--;
            if (this.onTick) this.onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.timeLeft = this.duration;
        if (this.onTick) this.onTick(this.timeLeft);
    }
}
