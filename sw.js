const CACHE_NAME = 'juchu-app-v2';
const ASSETS = [
  './受注表_スマホ版_オフライン版.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワークが使える時は常に最新版を取りに行き、取れた分をキャッシュに保存する。
// 電波が無い時だけ、直近にキャッシュした版を表示する（オフラインでも起動できるようにするため）。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
