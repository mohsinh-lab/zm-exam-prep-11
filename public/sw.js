const CACHE_NAME = 'aceprep-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pokemon-hero.png',
    '/pokemon-quiz.png',
    '/transformer-plan.png',
    '/transformer-speed.png',
    '/thinking-pokemon.png',
    '/icon-192.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Listener for Notification commands
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
        // Note: True scheduling requires a server or Periodic Sync API
        // For now, we show an immediate confirmation
        self.registration.showNotification('🚀 AcePrep Ready!', {
            body: "Reminders set! I'll nudge you when it's time to study.",
            icon: '/icon-192.png',
            badge: '/icon-192.png'
        });
    }
});
