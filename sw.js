const CACHE_NAME = 'juchu-app-v3';
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
  const req = event.request;
  // 自分のサイトの読み込み（GET）以外には手を出さない
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then((res) => {
      // 正常に取れたものだけ保存する（一時的なエラー画面をオフライン用に残さないため）
      if (res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
      }
      return res;
    }).catch(() =>
      // URL末尾の「?v=…」等が違っても保存済みの画面を出す
      caches.match(req, { ignoreSearch: true })
    )
  );
});
