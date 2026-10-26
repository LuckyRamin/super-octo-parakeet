const CACHE_NAME = 'portfolio-pwa-v3';
const SHELL = ['./', './index.html', './manifest.json'];

async function makeVirtualPng(size) {
  if (typeof OffscreenCanvas === 'undefined') return new Response('', { status: 404 });
  const c = new OffscreenCanvas(size, size); const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, size, size); g.addColorStop(0, '#0284c7'); g.addColorStop(1, '#020617');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = size * 0.06; ctx.strokeRect(size * 0.2, size * 0.26, size * 0.6, size * 0.48);
  ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(size * 0.64, size * 0.5, size * 0.065, 0, Math.PI * 2); ctx.fill();
  const blob = await c.convertToBlob({ type: 'image/png' });
  return new Response(blob, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
}

self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL).catch(() => {}))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => k !== CACHE_NAME ? caches.delete(k) : null))).then(() => self.clients.claim())); });

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('icon-192.png') || url.pathname.endsWith('icon-512.png')) {
    const sz = url.pathname.endsWith('192.png') ? 192 : 512;
    e.respondWith(fetch(e.request).then((r) => (r && r.ok) ? r : makeVirtualPng(sz)).catch(() => makeVirtualPng(sz)));
    return;
  }
  const isApi = ['githubusercontent.com', 'workers.dev', 'wallex.ir', 'exir.io', 'nobitex.ir', 'ramzinex.com', 'bitpin.ir', 'allorigins.win', 'codetabs.com', 'yahoo.com', 'gold-api.com'].some((d) => url.hostname.includes(d));
  if (isApi) return;
  e.respondWith(fetch(e.request).then((res) => { if (res && res.status === 200) { const cp = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, cp)); } return res; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./'))));
});
