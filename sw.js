// Service Worker - Cache des ressources statiques
const CACHE_NAME = 'cebig-sarl-v13';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css?v=13',
    './js/script.js?v=13',
    './offline.html',
    './manifest.json',
    './images/icon.svg',
    './images/expertise-construction.jpg',
    './images/expertise-renovation.jpg',
    './images/expertise-hydraulique.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' || ['style', 'script', 'document'].includes(event.request.destination)) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request).then(cached => {
                return cached || caches.match('./offline.html');
            }))
        );
        return;
    }

    if (event.request.destination === 'video') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
                    return networkResponse;
                }

                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                return networkResponse;
            });
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('./offline.html');
            }
        })
    );
});
