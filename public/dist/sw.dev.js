"use strict";

var CACHE_NAME = "norby-pwa-cache-v1.0.1";
var STATIC_ASSETS = ["/", "/profile", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png", "/apple-touch-icon.png", "https://js.puter.com/v2/"]; // Install: pre-cache critical app shell files

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log("[norby-sw] Pre-caching core app shell.");
    return cache.addAll(STATIC_ASSETS)["catch"](function (err) {
      console.warn("[norby-sw] App shell pre-cache partial match or offline during installation:", err);
    });
  }));
  self.skipWaiting();
}); // Activate: clean up old cache versions

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.map(function (name) {
      if (name !== CACHE_NAME) {
        console.log("[norby-sw] Deleting old cache version:", name);
        return caches["delete"](name);
      }
    }));
  }));
  self.clients.claim();
}); // Fetch: intercept network requests and apply smart caching

self.addEventListener("fetch", function (event) {
  var req = event.request;
  var url = new URL(req.url); // Skip WebSocket, API, and Puter KV writes

  if (req.method !== "GET" || url.protocol === "ws:" || url.protocol === "wss:" || url.pathname.includes("/api/") || url.href.includes("puter")) {
    return;
  } // Caching Strategy: Stale-While-Revalidate for static resources (JS, CSS, images, fonts, icons)


  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".png") || url.pathname.endsWith(".jpg") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".json") || url.hostname.includes("cartocdn") || // Leaflet Map Tiles
  url.hostname.includes("tile.openstreetmap") || url.hostname.includes("api.dicebear.com") // DiceBear Avatars
  ) {
      event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cachedResponse) {
          var fetchPromise = fetch(req).then(function (networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }

            return networkResponse;
          })["catch"](function () {
            // Fetch failed, return cached response if exists
            return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      }));
      return;
    } // Network-First with Cache-Fallback for Page Document routes (/ and /profile)


  event.respondWith(fetch(req).then(function (networkResponse) {
    if (networkResponse && networkResponse.status === 200) {
      var responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(req, responseClone);
      });
    }

    return networkResponse;
  })["catch"](function () {
    return caches.match(req).then(function (cachedResponse) {
      if (cachedResponse) return cachedResponse; // If offline and no cache, return the cached index "/" page

      return caches.match("/");
    });
  }));
});