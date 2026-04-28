// SketchFlow Service Worker — stale-while-revalidate for static assets only
const CACHE_VERSION = 'sketchflow-v1'

const STATIC_PATTERNS = [
  /^\/_next\/static\//,
  /^\/icon(?:\d*)?$/,
  /^\/apple-icon$/,
  /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$/i,
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_VERSION))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) return false
  return STATIC_PATTERNS.some((re) => re.test(url.pathname))
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // /api 패스스루
  if (url.pathname.startsWith('/api/')) return

  if (!isStaticAsset(url)) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION)
      const cached = await cache.match(req)
      const networkPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            cache.put(req, res.clone()).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || networkPromise
    })(),
  )
})
