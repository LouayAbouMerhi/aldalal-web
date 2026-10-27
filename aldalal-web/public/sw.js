/* ALDALAL price list — offline support.
   Bump CACHE_VERSION after a big change to clear old files from customers' phones. */
const CACHE_VERSION = "aldalal-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = "/offline";
const SHELL = ["/", "/products", "/favorites", OFFLINE_URL, "/logo.png", "/icon-192.png", "/manifest.webmanifest"];
const MAX_PAGES = 80;
const MAX_ASSETS = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

/** Pages: network first, fall back to the saved copy, then to the offline page. */
async function handlePage(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(PAGE_CACHE);
    cache.put(request, response.clone());
    trim(PAGE_CACHE, MAX_PAGES);
    return response;
  } catch {
    const cached = (await caches.match(request)) || (await caches.match(OFFLINE_URL));
    return cached || Response.error();
  }
}

/** Photos, scripts, styles and fonts: use the saved copy first, refresh in the background. */
async function handleAsset(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trim(cacheName, max);
      }
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handlePage(request));
    return;
  }

  if (url.pathname.startsWith("/products/") || url.pathname.endsWith(".webp") || url.pathname.endsWith(".png")) {
    event.respondWith(handleAsset(request, ASSET_CACHE, MAX_ASSETS));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(?:js|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(handleAsset(request, SHELL_CACHE, 200));
  }
});
