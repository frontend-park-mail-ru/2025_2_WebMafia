const CACHE_VERSION = 'v1.1';
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
  '/static/css/(.*)',
  '/static/img/(.*)',
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
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
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
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === 'navigate') {
          console.log('[SW] Сеть недоступна, возвращаем index.html для SPA-роутинга');
          return await caches.match('/index.html');
        }
        return null;
      })
  );
});