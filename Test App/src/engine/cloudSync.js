// src/engine/cloudSync.js
// Handles real-time synchronization using Zayyan's email as the unique identifier.
import { database, ref, set, get, onValue } from '../config/firebase.js';

let STUDENT_EMAIL = 'zayyanmohsin16@gmail.com';
let SYNC_ID = STUDENT_EMAIL.replace(/[@.]/g, '_'); // zayyanmohsin16_gmail_com

// Allow dynamically changing the sync ID if other users log in
export function setSyncEmail(email) {
    STUDENT_EMAIL = email;
    SYNC_ID = email.replace(/[@.]/g, '_');
}

let isConnected = false;
let pendingWrites = 0;

// Listen for Firebase connection state
try {
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
        isConnected = snap.val() === true;
        window.dispatchEvent(new CustomEvent('sync_state_changed', { detail: { connected: isConnected, syncing: pendingWrites > 0 } }));
    });
} catch (e) { /* Ignore if firebase is mock/disabled */ }

export async function syncProgressToCloud(progress) {
    pendingWrites++;
    window.dispatchEvent(new CustomEvent('sync_state_changed', { detail: { connected: isConnected, syncing: true } }));
    try {
        const dbRef = ref(database, 'students/' + SYNC_ID);
        await set(dbRef, progress);
        console.log('✅ Progress synced to cloud for:', STUDENT_EMAIL);
    } catch (err) {
        console.warn('❌ Cloud sync failed:', err);
    } finally {
        pendingWrites--;
        if (pendingWrites <= 0) {
            pendingWrites = 0;
            window.dispatchEvent(new CustomEvent('sync_state_changed', { detail: { connected: isConnected, syncing: false } }));
        }
    }
}

export async function loadProgressFromCloud() {
    try {
        const dbRef = ref(database, 'students/' + SYNC_ID);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            console.log('✅ Progress loaded from cloud for:', STUDENT_EMAIL);
            return snapshot.val();
        } else {
            return null;
        }
    } catch (err) {
        console.warn('❌ Cloud load failed:', err);
        return null;
    }
}

// Live Sync capabilities
let unsubscribe = null;
export function subscribeToProgress(onUpdateCallback) {
    if (unsubscribe) unsubscribe();
    try {
        const dbRef = ref(database, 'students/' + SYNC_ID);
        unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                onUpdateCallback(snapshot.val());
            }
        });
        return unsubscribe;
    } catch (err) {
        console.warn('Live sync subscribe failed', err);
        return () => { }; // dummy unsubscribe
    }
}
