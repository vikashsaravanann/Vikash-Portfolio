const CACHE_PREFIX = "vikash-portfolio-";
const CACHE_NAME = `${CACHE_PREFIX}v10`;
const SCOPE_URL = new URL(self.registration.scope);
const HOME_URL = new URL("index.html", SCOPE_URL).href;
const CORE_URLS = [
  "index.html",
  "voiceshield.html",
  "logic-voice.html",
  "business-ai.html",
  "css/portfolio.css",
  "js/portfolio.js",
  "js/register-sw.js",
  "assets/fonts/manrope-latin.woff2",
  "assets/profile/hero-portrait-v2.webp",
  "assets/icons/monogram.svg",
  "manifest.json",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
].map((path) => new URL(path, SCOPE_URL).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(
        CORE_URLS.map((url) => new Request(url, { cache: "reload" })),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, navigation) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    // Never retain redirects, opaque responses, or HTTP errors.
    if (response.ok && response.type === "basic" && !response.redirected) {
      try {
        await cache.put(request, response.clone());
      } catch {
        // A full or unavailable cache must not interrupt a working page.
      }
    }
    return response;
  } catch {
    const saved = await cache.match(request);
    if (saved) return saved;
    if (navigation) {
      const home = await cache.match(HOME_URL);
      if (home) return home;
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== SCOPE_URL.origin ||
    !url.pathname.startsWith(SCOPE_URL.pathname)
  )
    return;

  const relativePath = url.pathname.slice(SCOPE_URL.pathname.length);
  if (relativePath === "api" || relativePath.startsWith("api/")) return;

  const navigation = request.mode === "navigate";
  const staticAsset =
    /^(?:assets|css|js)\//.test(relativePath) ||
    relativePath === "manifest.json";
  if (!navigation && !staticAsset) return;

  event.respondWith(networkFirst(request, navigation));
});
