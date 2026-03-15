// src/engine/leaderboard.js
// Uses lazy Firebase loading — no static CDN imports at module parse time.
import { awaitFirebase } from '../config/firebase.js';
import { getProgress } from './progressStore.js';

export async function reportToLeaderboard() {
    const progress = getProgress();
    if (!progress.studentName) return;

    const email = localStorage.getItem('userEmail') || 'guest';
    const safeEmail = email.replace(/[@.]/g, '_');

    const fb = await awaitFirebase();
    if (!fb) return;

    try {
        const dbRef = fb.ref(fb.database, 'leaderboard/' + safeEmail);
        await fb.set(dbRef, {
            name: progress.studentName,
            xp: progress.xp || 0,
            level: Math.floor((progress.xp || 0) / 1000) + 1,
            lastActive: Date.now()
        });
    } catch (err) {
        console.warn('Leaderboard report failed', err);
    }
}

export async function getTopLeaderboard(limit = 10) {
    const fb = await awaitFirebase();
    if (!fb) return [];

    try {
        const dbRef = fb.ref(fb.database, 'leaderboard');
        const snapshot = await fb.get(dbRef);
        if (snapshot.exists()) {
            return Object.values(snapshot.val())
                .sort((a, b) => b.xp - a.xp)
                .slice(0, limit);
        }
        return [];
    } catch (err) {
        console.warn('Leaderboard fetch failed', err);
        return [];
    }
}
