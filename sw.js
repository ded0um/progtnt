const CACHE_NAME = 'progtnt-v1';

const ASSETS = [
  '/progtnt/',
  '/progtnt/index.html',
  '/progtnt/manifest.json',
  '/progtnt/icon.svg'
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches lors de la mise à jour
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('progtnt-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (e) => {
  // Ignorer les requêtes non-GET et les extensions Chrome
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  // Ne pas mettre en cache les API externes
  if (
    e.request.url.includes('script.google.com') ||
    e.request.url.includes('api.open-meteo.com')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
