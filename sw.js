const CACHE_NAME = 'sirender-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './home.html',
  './scene_menu.html',
  './public%20play%20menu.html',
  './Predicament%20Bondage%20Menu.html',
  './public-game.html',
  './styles.css',
  './manifest.json',
  './intro.mp4'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Instantly activate the new service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches (like v1)
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages immediately 
  );
});

self.addEventListener('fetch', event => {
  // Network-first strategy: Always try to get the newest file from the server
  // If the network is unavailable (offline), fallback to the cache.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
