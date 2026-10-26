const CACHE_NAME = 'portfolio-pro-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// لیست دامنه APIهای قیمت که نباید کش شوند (همیشه نرخ زنده)
const API_KEYWORDS = [
  'githubusercontent.com', 'workers.dev', 'wallex.ir', 'exir.io',
  'nobitex.ir', 'ramzinex.com', 'bitpin.ir', 'allorigins.win',
  'codetabs.com', 'gold-api.com', 'yahoo.com'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // ۱. درخواست‌های دریافت قیمت همیشه مستقیم از شبکه خوانده شوند
  if (API_KEYWORDS.some((kw) => url.includes(kw))) return;

  // ۲. سایر فایل‌های برنامه: اول شبکه، در صورت قطعی اینترنت از کش (اجرای آفلاین)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
