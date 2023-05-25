var cacheName = 'donald-alves';
var filesToCache = [
  '/',
  '/index.html',
  '/index.swf',
  '/galeria.php/index.html',
  '/main.js',
  'https://unpkg.com/@ruffle-rs/ruffle'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
