const CACHE_NAME = "fluide-shell-v28";
const APP_SHELL = [
  "./",
  "./index.html",
  "./catalog.html",
  "./all.html",
  "./selection.html",
  "./results.html",
  "./product.html",
  "./fonts.css?v=1",
  "./catalog.css?v=7",
  "./selection.css?v=4",
  "./results.css?v=6",
  "./product.css?v=4",
  "./pwa.js?v=2",
  "./selection.js?v=4",
  "./results.js?v=9",
  "./product.js?v=5",
  "./fragrances.json",
  "./products.json",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./app-icon-192.png",
  "./app-icon-512.png",
  "./MazzardH-Light.woff2",
  "./MazzardH-Regular.woff2",
  "./MazzardH-Medium.woff2",
  "./MazzardH-SemiBold.woff2",
  "./MazzardH-Bold.woff2",
  "./логотип FLUIDE сниний.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.headers.has("range") || url.pathname.endsWith(".mp4")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fresh;
    })
  );
});
