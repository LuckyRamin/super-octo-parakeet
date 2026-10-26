const CACHE_NAME = 'portfolio-pro-v2';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // عدم کش کردن APIهای قیمت زنده تا همیشه نرخ لحظه‌ای دریافت شود
  const isLiveApi = ['githubusercontent.com', 'workers.dev', 'wallex.ir', 'exir.io', 'nobitex.ir', 'ramzinex.com', 'bitpin.ir', 'allorigins.win', 'codetabs.com', 'yahoo.com', 'gold-api.com'].some((d) => url.hostname.includes(d));
  if (isLiveApi) return;

  // استراتژی Network-First برای فایل‌های برنامه (دریافت آخرین آپدیت گیت‌هاب + اجرای آفلاین در صورت قطع اینترنت)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});
