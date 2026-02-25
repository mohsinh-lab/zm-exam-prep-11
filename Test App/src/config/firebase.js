// src/config/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { getDatabase, ref, set, get, onValue, update } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';

// Firebase configuration using environment variables for public scalability.
// In dev, Vite uses import.meta.env
const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "dummy-api-key",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
    databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://aceprep-db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy-sender-id",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "dummy-app-id"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Roles are now fetched dynamically from Firebase Realtime Database (/users/{uid}/role)
export {
    auth,
    googleProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    database,
    ref,
    set,
    get,
    onValue,
    update
};
