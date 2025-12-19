const CACHE_VERSION = 'v1.3';
const CACHE_NAME = `wave-music-${CACHE_VERSION}`;
const IMAGE_CACHE = 'wave-images';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/static/js/eye.js',
  '/static/js/parsers.js',
  '/static/js/playerOnlyOnPlay.js',
  '/static/js/playTrackBtn.js',
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
  'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.runtime.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll(APP_SHELL_URLS);
    const assetsModule = await fetch('/assets.js').then((r) => r.text());
    const matches = assetsModule.match(/"\/assets\/[^"]+\.(png|jpg|jpeg|webp|svg)"/g) || [];

    const imageUrls = matches.map((s) => s.replace(/"/g, ''));

    await cache.addAll(imageUrls);
  });
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => ![CACHE_NAME, IMAGE_CACHE].includes(name)).map((name) => caches.delete(name))
        )
      )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  if (event.request.destination === 'image' && !event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      })
    );
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
        return networkResponse;
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
