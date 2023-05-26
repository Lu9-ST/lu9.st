var cacheName = 'donald-alves';
var filesToCache = [
  '/donald/',
  '/donald/index.html',
  '/donald/index.swf',
  '/donald/galeria.php/index.html',
  '/donald/main.js',
  '/donald/quemsou.swf',
  '/donald/repertorio.swf',
  '/donald/parceiros.swf',
  '/donald/agenda.swf',
  '/donald/contato.swf',
  '/donald/textos/release.txt',
  '/donald/textos/parceiros.txt',
  '/donald/textos/agenda.php',
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
