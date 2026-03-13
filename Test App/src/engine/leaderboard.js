
import { database, ref, set, get, onValue } from '../config/firebase.js';
import { getProgress } from './progressStore.js';

export async function reportToLeaderboard() {
    const progress = getProgress();
    if (!progress.studentName) return;
    
    const email = localStorage.getItem('userEmail') || 'guest';
    const safeEmail = email.replace(/[@.]/g, '_');
    
    try {
        const dbRef = ref(database, 'leaderboard/' + safeEmail);
        await set(dbRef, {
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
    try {
        const dbRef = ref(database, 'leaderboard');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data)
                .sort((a, b) => b.xp - a.xp)
                .slice(0, limit);
        }
        return [];
    } catch (err) {
        console.warn('Leaderboard fetch failed', err);
        return [];
    }
}
