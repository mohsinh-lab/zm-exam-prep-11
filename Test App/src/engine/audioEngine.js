// src/engine/audioEngine.js — Minimal audio management for the app

const SOUND_URLS = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    correct: 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3',
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3',
    badge: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
};

class AudioEngine {
    constructor() {
        this.context = null;
        this.buffers = {};
        this.muted = false;
    }

    init() {
        if (this.context) return;
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.loadAll();
    }

    async loadAll() {
        for (const [name, url] of Object.entries(SOUND_URLS)) {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[name] = await this.context.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.warn(`Failed to load sound: ${name}`, e);
            }
        }
    }

    play(name) {
        if (this.muted || !this.context || !this.buffers[name]) return;

        // Resume context if suspended (browser policy)
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const source = this.context.createBufferSource();
        source.buffer = this.buffers[name];
        source.connect(this.context.destination);
        source.start(0);
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

export const audio = new AudioEngine();
