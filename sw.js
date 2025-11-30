// Service Worker for Draped Tulle Dress Landing Page
const CACHE_NAME = 'draped-tulle-dress-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/images/product/product-01.jpeg',
  '/images/product/product-02.jpeg',
  '/images/product/product-03.jpeg',
  '/images/product/product-04.jpeg',
  '/images/product/product-05.jpeg',
  '/images/product/product-06.jpeg'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cache images and assets
          if (event.request.url.includes('/images/') ||
              event.request.url.endsWith('.css') ||
              event.request.url.endsWith('.js')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
          }

          return response;
        });
      })
  );
});
