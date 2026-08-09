/* Subteen Service Worker
 *
 * Scope: same-origin only. Convex, Firebase and other third-party/cross-origin
 * requests (all live CMS, auth and API traffic) are NEVER intercepted here.
 *
 * Caches:
 *   subteen-shell-*   app shell + manifest + icons, precached at install
 *   subteen-pages-*   public pages a user has actually visited (offline readable)
 *   subteen-static-*  immutable hashed build assets + same-origin images
 *
 * Update flow: a new service worker waits until the user confirms via the
 * "NEW VERSION AVAILABLE" prompt (SKIP_WAITING message) so active sessions and
 * in-progress article edits are never interrupted abruptly.
 */
const VERSION = '2026-08-09';
const SHELL_CACHE = `subteen-shell-${VERSION}`;
const PAGES_CACHE = `subteen-pages-${VERSION}`;
const STATIC_CACHE = `subteen-static-${VERSION}`;
const ACTIVE_CACHES = [SHELL_CACHE, PAGES_CACHE, STATIC_CACHE];

const SHELL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
];

const isSameOrigin = (url) => url.origin === self.location.origin;
const isPrivatePath = (pathname) => pathname.startsWith('/admin') || pathname.startsWith('/editor');
const isNavigation = (request) => request.mode === 'navigate' || request.destination === 'document';
const isImmutableAsset = (url) => /\/assets\/.+\.(?:js|css|woff2?)$/.test(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !ACTIVE_CACHES.includes(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function cacheThenPut(cacheName, request, response) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, copy));
  }
  return response;
}

async function handleNavigation(request) {
  const url = new URL(request.url);
  // Admin/CMS must require network — never surface the app shell offline.
  if (isPrivatePath(url.pathname)) {
    try {
      return await fetch(request);
    } catch {
      return caches.match('/offline.html');
    }
  }

  // Public pages: network-first. Offline, fall back to the exact page the user
  // previously visited (so cached content stays readable), otherwise show the
  // branded offline page.
  try {
    const response = await fetch(request);
    return cacheThenPut(PAGES_CACHE, request, response);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    return offline || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheThenPut(STATIC_CACHE, request, await fetch(request));
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => cacheThenPut(STATIC_CACHE, request, response))
      .catch(() => {});
    return cached;
  }
  try {
    return await cacheThenPut(STATIC_CACHE, request, await fetch(request));
  } catch {
    return Response.error();
  }
}

async function networkFirst(request) {
  try {
    return await cacheThenPut(STATIC_CACHE, request, await fetch(request));
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (isNavigation(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (
    isImmutableAsset(url) ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});
