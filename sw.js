const CACHE_NAME = 'icsoft-v1';
const FICHIERS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/licence.js',
    '/jspdf.min.js',
    '/icon.svg',
    '/manifest.json'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(FICHIERS);
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});