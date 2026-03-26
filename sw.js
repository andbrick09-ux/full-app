const CACHE_NAME = 'sirender-cache-v1';
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
