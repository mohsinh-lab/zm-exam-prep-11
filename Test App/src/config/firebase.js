// src/config/firebase.js
// Firebase is loaded lazily via dynamic import to prevent boot failures
// when gstatic.com CDN is slow or unavailable.
// Call initFirebase() once at app startup; all other modules await getFirebase().

const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "dummy-api-key",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
    databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://aceprep-db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy-sender-id",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "dummy-app-id"
};

let _promise = null;
let _fb = null;

export function initFirebase() {
    if (_promise) return _promise;
    _promise = Promise.all([
        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js'),
    ]).then(([appMod, authMod, dbMod]) => {
        const app = appMod.initializeApp(firebaseConfig);
        _fb = {
            auth: authMod.getAuth(app),
            googleProvider: new authMod.GoogleAuthProvider(),
            signInWithPopup: authMod.signInWithPopup,
            signOut: authMod.signOut,
            onAuthStateChanged: authMod.onAuthStateChanged,
            database: dbMod.getDatabase(app),
            ref: dbMod.ref,
            set: dbMod.set,
            get: dbMod.get,
            onValue: dbMod.onValue,
            update: dbMod.update,
        };
        return _fb;
    }).catch(err => {
        console.warn('Firebase failed to load:', err);
        _promise = null; // allow retry
        return null;
    });
    return _promise;
}

// Returns the cached Firebase modules, or null if not yet loaded
export function getFirebase() {
    return _fb;
}

// Await Firebase — resolves when ready (or null on failure)
export function awaitFirebase() {
    return _promise ? _promise : initFirebase();
}
