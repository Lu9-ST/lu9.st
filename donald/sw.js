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
  '/donald/ruffle/ruffle.js',
  '/donald/ruffle/ruffle.map',
  '/donald/ruffle/package.json',
  '/donald/ruffle/core.ruffle.ee5716355123d2025211.js',
  '/donald/ruffle/core.ruffle.ee5716355123d2025211.js.map',
  '/donald/ruffle/core.ruffle.80c0ab95c861f22ecc26.js',
  '/donald/ruffle/core.ruffle.80c0ab95c861f22ecc26.js.map',
  '/donald/ruffle/64e0de8d3a9d45f537bb.wasm',
  '/donald/ruffle/9e915ba30f800906e3ac.wasm'
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
