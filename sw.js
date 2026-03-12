const CACHE = "li-v2";
const ASSETS = [
  "/LinkHelp/",
  "/LinkHelp/index.html",
  "/LinkHelp/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Always go network for API/RSS calls
  if (
    e.request.url.includes("rss2json") ||
    e.request.url.includes("checkmarx") ||
    e.request.url.includes("openai") ||
    e.request.url.includes("anthropic")
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response("Offline")));
    return;
  }
  // Cache first for app assets
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
