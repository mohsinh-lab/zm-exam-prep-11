const CACHE_NAME = 'aceprep-v3';
const STATIC_ASSETS = [
    './manifest.json',
    './ace-mascot.png',
    './pokemon-hero.png',
    './pokemon-quiz.png',
    './transformer-plan.png',
    './transformer-speed.png',
    './thinking-pokemon.png',
    './icon-192.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
    const url = new URL(event.request.url);

    // Network-first for HTML and JS/CSS assets — ensures new deploys always load fresh code
    if (
        event.request.mode === 'navigate' ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.includes('/assets/')
    ) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache a copy for offline fallback
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for static image assets
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
        self.registration.showNotification('🚀 AcePrep Ready!', {
            body: "Reminders set! I'll nudge you when it's time to study.",
            icon: '/icon-192.png',
            badge: '/icon-192.png'
        });
    }
});
