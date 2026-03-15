// src/engine/cloudSync.js
// Firebase is loaded lazily — app boots immediately, sync starts after Firebase loads.
import { awaitFirebase } from '../config/firebase.js';

let STUDENT_EMAIL = 'zayyanmohsin16@gmail.com';
let SYNC_ID = STUDENT_EMAIL.replace(/[@.]/g, '_');

export function setSyncEmail(email) {
    STUDENT_EMAIL = email;
    SYNC_ID = email.replace(/[@.]/g, '_');
}

let isConnected = false;
let pendingWrites = 0;

// Wire up the connection-state listener once Firebase is ready
awaitFirebase().then(fb => {
    if (!fb) return;
    try {
        const connectedRef = fb.ref(fb.database, '.info/connected');
        fb.onValue(connectedRef, (snap) => {
            isConnected = snap.val() === true;
            window.dispatchEvent(new CustomEvent('sync_state_changed', {
                detail: { connected: isConnected, syncing: pendingWrites > 0 }
            }));
        });
    } catch (e) { /* ignore */ }
});

export async function syncProgressToCloud(progress) {
    const fb = await awaitFirebase();
    if (!fb) return;
    pendingWrites++;
    window.dispatchEvent(new CustomEvent('sync_state_changed', { detail: { connected: isConnected, syncing: true } }));
    try {
        const dbRef = fb.ref(fb.database, 'students/' + SYNC_ID);
        await fb.set(dbRef, progress);
        const { reportToLeaderboard } = await import('./leaderboard.js');
        await reportToLeaderboard();
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
    const fb = await awaitFirebase();
    if (!fb) return null;
    try {
        const dbRef = fb.ref(fb.database, 'students/' + SYNC_ID);
        const snapshot = await fb.get(dbRef);
        if (snapshot.exists()) {
            console.log('✅ Progress loaded from cloud for:', STUDENT_EMAIL);
            return snapshot.val();
        }
        return null;
    } catch (err) {
        console.warn('❌ Cloud load failed:', err);
        return null;
    }
}

let unsubscribe = null;
export async function subscribeToProgress(onUpdateCallback) {
    if (unsubscribe) unsubscribe();
    const fb = await awaitFirebase();
    if (!fb) return () => {};
    try {
        const dbRef = fb.ref(fb.database, 'students/' + SYNC_ID);
        unsubscribe = fb.onValue(dbRef, (snapshot) => {
            onUpdateCallback(snapshot.exists() ? snapshot.val() : null);
        });
        return unsubscribe;
    } catch (err) {
        console.warn('Live sync subscribe failed', err);
        return () => {};
    }
}

let multiUnsubscribes = [];
let parentStudentsMapUnsub = null;

export async function subscribeToLinkedStudents(parentUid, onUpdateCallback) {
    if (parentStudentsMapUnsub) parentStudentsMapUnsub();
    console.log(`[Audit] Parent ${parentUid} subscribing to linked students graph...`);
    multiUnsubscribes.forEach(u => u());
    multiUnsubscribes = [];

    const fb = await awaitFirebase();
    if (!fb) return () => {};

    let aggregatedData = {};
    try {
        const linkedRef = fb.ref(fb.database, 'users/' + parentUid + '/linked_students');
        parentStudentsMapUnsub = fb.onValue(linkedRef, (snapshot) => {
            multiUnsubscribes.forEach(u => u());
            multiUnsubscribes = [];
            aggregatedData = {};

            if (!snapshot.exists()) { onUpdateCallback({}); return; }
            const safeEmails = Object.keys(snapshot.val() || {});
            if (safeEmails.length === 0) { onUpdateCallback({}); return; }

            safeEmails.forEach(safeEmail => {
                const studentRef = fb.ref(fb.database, 'students/' + safeEmail);
                const unsub = fb.onValue(studentRef, (progSnap) => {
                    aggregatedData[safeEmail] = progSnap.exists() ? progSnap.val() : null;
                    onUpdateCallback(aggregatedData);
                });
                multiUnsubscribes.push(unsub);
            });
        });
        return () => {
            if (parentStudentsMapUnsub) parentStudentsMapUnsub();
            multiUnsubscribes.forEach(u => u());
        };
    } catch (err) {
        console.warn('Parent Live sync subscribe failed', err);
        return () => {};
    }
}

let studentParentLinkUnsub = null;
export async function subscribeToParentLink(studentUid, onLinkCallback) {
    if (studentParentLinkUnsub) studentParentLinkUnsub();
    const fb = await awaitFirebase();
    if (!fb) return () => {};
    try {
        const linkRef = fb.ref(fb.database, 'users/' + studentUid + '/linked_parents');
        studentParentLinkUnsub = fb.onValue(linkRef, (snapshot) => {
            const hasParent = snapshot.exists() && Object.keys(snapshot.val()).length > 0;
            console.log(`[Audit] Parent link status for ${studentUid}: ${hasParent ? 'VERIFIED' : 'PENDING'}`);
            onLinkCallback(hasParent);
        });
        return studentParentLinkUnsub;
    } catch (err) {
        console.warn('Subscription to parent link failed', err);
        return () => {};
    }
}
