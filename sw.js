/* Service worker SDR Quest Tracker: работа без сети и установка как приложение.
   Страница берётся из сети (всегда свежая версия), кеш служит запасом без интернета.
   Чужие адреса (Supabase, Google) не трогаем. 4.13.0 подставляет build.py. */
const CACHE = "sdr-quest-4.13.0";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  // skipWaiting не вызываем сами: новая версия включается после нажатия «Обновить» в приложении
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r, { cache: "no-cache" }).then(resp => {
      if (resp && resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return resp;
    }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
