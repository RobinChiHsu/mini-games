const CACHE_NAME = 'mini-games-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/icons.js',
  '/js/main.js',
  '/js/i18n.js',
  '/js/storage.js',
  '/js/audio.js',
  '/js/input.js',
  '/js/character.js',
  '/js/games/downstairs.js',
  '/js/games/doodle-jump.js',
  '/js/games/upstairs.js',
  '/js/games/minesweeper.js',
  '/js/games/tetris.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
