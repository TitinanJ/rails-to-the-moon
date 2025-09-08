const VERSION = "v1-minimal";
const CACHE_NAME = VERSION;

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(["/"])));
    self.skipWaiting?.();
    });

    self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(names =>
        Promise.all(names.map(n => (n !== CACHE_NAME ? caches.delete(n) : null)))
        )
    );
    self.clients.claim();
});

async function cacheFirst(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
        return res;
    } catch {
        return new Response("Offline", { status: 408, headers: { "Content-Type": "text/plain" } });
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;
    event.respondWith(cacheFirst(request));
});
