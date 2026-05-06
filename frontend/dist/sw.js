const CACHE = 'noteapp-v1';
const PRECACHE = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.pathname.startsWith('/api/')) { e.respondWith(networkFirstAPI(e.request)); return; }
    e.respondWith(cacheFirstStatic(e.request));
});

async function networkFirstAPI(req) {
    try {
        const res = await fetch(req.clone());
        if (res.ok && req.method === 'GET') { const c = await caches.open(CACHE); c.put(req, res.clone()); }
        return res;
    } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true, notes: [] }), { headers: { 'Content-Type': 'application/json' } });
    }
}

async function cacheFirstStatic(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
        return res;
    } catch {
        if (req.mode === 'navigate') { const fb = await caches.match('/index.html'); if (fb) return fb; }
        return new Response('Offline', { status: 503 });
    }
}

self.addEventListener('sync', e => {
    if (e.tag === 'sync-notes') {
        e.waitUntil(self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ type: 'TRIGGER_SYNC' }))));
    }
});
