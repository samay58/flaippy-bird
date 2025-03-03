// Flaippy Bird - Service Worker
const CACHE_NAME = 'flaippy-bird-v1';

// Assets to cache for offline play
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css',
  '/favicon.ico',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Nunito:wght@400;700&family=Press+Start+2P&display=swap&font-display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Error during service worker install:', error);
      })
  );
  
  // Force service worker activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  
  // Ensure service worker takes control of clients immediately
  return self.clients.claim();
});

// Simple fetch handler that always goes to network first
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(error => {
        console.error('Fetch failed:', error);
        return caches.match('/index.html');
      })
  );
});