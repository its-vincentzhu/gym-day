/* Gym Day service worker: offline-first shell for a static PWA. */
const CACHE = 'gymday-v1'

self.addEventListener('install', (event) => {
  // Cache the app shell relative to the SW scope so it works under /gym-day/.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./'])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    // Network-first for the shell so deploys show up, cache fallback for offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copy))
          return res
        })
        .catch(() => caches.match('./'))
    )
    return
  }

  // Cache-first for hashed assets, populating the cache from the network.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(req, copy))
          }
          return res
        })
    )
  )
})
