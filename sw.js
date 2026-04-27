// Bumpear la versión cada vez que cambies HTML/JS para forzar actualización en iPhone
const CACHE = 'finanzas-v5';
const PRECACHE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navegación → siempre devolver index.html cacheado (fallback offline)
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(cached => {
        if (cached) {
          // Actualizar en segundo plano
          fetch(req).then(res => {
            if (res && res.ok) caches.open(CACHE).then(c => c.put('./index.html', res.clone()));
          }).catch(() => {});
          return cached;
        }
        return fetch(req).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Resto: cache-first con runtime caching (incluye CDN como SheetJS)
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
