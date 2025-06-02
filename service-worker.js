// Service Worker para PWA
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('astrologia-indiana-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/styles.css',
                '/js/app.js',
                '/js/auth.js',
                '/js/airtable.js',
                '/js/config.js',
                '/js/utils.js',
                '/js/ui.js',
                '/js/map-queue.js',
                '/js/new-sale.js',
                '/js/clients.js',
                '/js/video-calls.js',
                '/js/financial.js',
                '/js/settings.js',
                '/assets/logo.png',
                '/assets/user-avatar.png',
                '/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
