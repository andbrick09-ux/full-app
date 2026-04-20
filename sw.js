const CACHE_NAME = 'sirender-cache-v4';
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
  './intro.mp4',
  './favicon.svg',
  './icon-512.png',
  // Training
  './training-menu.html',
  './deep-throat-training.html',
  './kegel-training.html',
  './the-5-training.html',
  './anal-plug-training.html',
  './position-training.html',
  // Checklists
  './bdsm-checklist.html',
  './sub-bdsm-checklist.html',
  // Position reference images
  './positions/pos_1_wait.png',
  './positions/pos_2_attention.png',
  './positions/pos_3_wall.png',
  './positions/pos_4_service.png',
  './positions/pos_5_nadu.png',
  './positions/pos_6_collar.png',
  './positions/pos_7_modest.png',
  './positions/pos_8_tower.png',
  './positions/pos_9_humble.png',
  './positions/pos_10_table.png',
  './positions/pos_11_please.png',
  './positions/pos_12_inspection.png'
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
