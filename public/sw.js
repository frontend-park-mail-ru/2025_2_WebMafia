const CACHE_VERSION = 'v1.3';
const CACHE_NAME = `wave-music-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/static/js/eye.js',
  '/static/js/parsers.js',
  '/static/js/playerOnlyOnPlay.js',
  '/static/js/playerTrackBtn.js',
  '/static/js/routing.js',
  '/static/js/scrollbar.js',
  '/static/js/setPlayButtonsOnAuth.js',
  '/static/js/validation.js',
  '/static/js/slider.js',
  '/static/css/header.css',
  '/static/css/index.css',
  '/static/css/mainpage.css',
  '/static/css/now_play_slider.css',
  '/static/css/player.css',
  '/static/css/sidebar.css',
  '/static/img/default-album.png',
  '/static/img/default-artist.png',
  '/static/img/default-playlist.png',
  '/static/img/liked_tracks.png',
  '/static/img/logo.png',
  '/static/img/wave.png',
  'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.runtime.min.js',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кэширование оболочки');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Активация');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        if (networkResponse) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        } else {
          return networkResponse;
        }
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === 'navigate') {
          return await caches.match('/index.html');
        }
        return null;
      })
  );
});
