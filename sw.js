const CACHE_NAME = "fluide-shell-v51";
const APP_SHELL = [
  "./",
  "./index.html",
  "./catalog.html",
  "./all.html",
  "./wardrobe.html",
  "./selection.html",
  "./results.html",
  "./product.html",
  "./fonts.css?v=1",
  "./shared-header.css?v=1",
  "./catalog.css?v=7",
  "./selection.css?v=7",
  "./results.css?v=8",
  "./wardrobe.css?v=18",
  "./product.css?v=5",
  "./pwa.js?v=20",
  "./selection.js?v=5",
  "./results.js?v=11",
  "./wardrobe-engine.js?v=1",
  "./wardrobe.js?v=13",
  "./product.js?v=6",
  "./fragrances.json",
  "./products.json",
  "./images/fragrances/thumbs/129.webp",
  "./images/fragrances/thumbs/029.webp",
  "./images/fragrances/thumbs/195.webp",
  "./images/fragrances/thumbs/087.webp",
  "./images/fragrances/thumbs/041.webp",
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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
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

  const networkFirst = [".css", ".js", ".json", ".webmanifest"].some((extension) => url.pathname.endsWith(extension));
  if (networkFirst) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
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
