// src/engine/cloudSync.js
// Handles real-time synchronization using Zayyan's email as the unique identifier.

const STUDENT_EMAIL = 'zayyanmohsin16@gmail.com';
const SYNC_ID = STUDENT_EMAIL.replace(/[@.]/g, '_'); // zayyanmohsin16_gmail_com

// TODO: To enable live sync between iPad and Parent Dashboard, you need a free Firebase project.
// Replace this URL with your Firebase Realtime Database URL once created.
const FIREBASE_RTDB_URL = 'https://aceprep-db-default-rtdb.europe-west1.firebasedatabase.app';

export async function syncProgressToCloud(progress) {
    if (FIREBASE_RTDB_URL.includes('YOUR-PROJECT-ID')) {
        console.warn('Cloud Sync disabled: Waiting for Firebase URL configuration.');
        return;
    }

    try {
        // We use PUT instead of POST to overwrite the current state with the latest state
        await fetch(`${FIREBASE_RTDB_URL}/students/${SYNC_ID}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progress)
        });
        console.log('✅ Progress synced to cloud for:', STUDENT_EMAIL);
    } catch (err) {
        console.error('❌ Cloud sync failed:', err);
    }
}

export async function loadProgressFromCloud() {
    if (FIREBASE_RTDB_URL.includes('YOUR-PROJECT-ID')) {
        return null;
    }

    try {
        const response = await fetch(`${FIREBASE_RTDB_URL}/students/${SYNC_ID}.json`);
        if (!response.ok) return null;

        const data = await response.json();
        console.log('✅ Progress loaded from cloud for:', STUDENT_EMAIL);
        return data;
    } catch (err) {
        console.error('❌ Cloud load failed:', err);
        return null;
    }
}
