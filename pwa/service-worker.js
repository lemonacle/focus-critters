const CACHE_NAME = "focus-critters-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "../index.html",
        "../styles.css",
        "../js/app.js",
        "../js/core/storage.js",
        "../js/core/timer.js",
        "../js/core/nectar.js",
        "../js/data/critters.js",
        "../js/ui/shop.js",
        "../js/ui/collection.js",
        "../js/ui/runlog.js",
        "../js/ui/screens.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});