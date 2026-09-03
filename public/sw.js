/**
 * Ewin service worker.
 *
 * The product's own FAQ promises that cards and practice keep working
 * offline, and the audience is explicitly a mid-range Android on metered
 * mobile data. Until now the PWA was manifest-only: it installed to the home
 * screen and then showed the browser's dinosaur the moment the signal went.
 *
 * Strategy, and why each part is what it is:
 *
 *   · HTML — network first, cache as fallback. A student must never be shown
 *     a stale shell after we ship a fix, but a lost signal mid-lesson must
 *     not lose the lesson either.
 *   · Next's build output — cache first. /_next/static is content-hashed, so
 *     a hit is always correct and re-fetching it on a metered connection is
 *     pure waste.
 *   · Everything the tutor talks to — never cached. A replayed tutor reply
 *     would be a wrong answer served with confidence, which is worse than
 *     no answer. Same for auth and payments.
 *
 * The study data itself already lives in localStorage (see app/lib/sync.ts),
 * so once the shell loads offline, cards and practice genuinely work.
 */

const VERSION = 'ewin-v1'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`

/** Routes worth having available cold, on a phone with no signal. */
const PRECACHE = ['/', '/dashboard', '/cards', '/offline']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // Individually, so one 404 does not fail the whole install.
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

/** Requests that must always hit the network, offline or not. */
function isNeverCached(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.hostname.endsWith('supabase.co') ||
    url.hostname.includes('paystack')
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isNeverCached(url)) return

  // Content-hashed build output: a cache hit can never be stale.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(ASSETS).then((c) => c.put(request, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  // Pages: fresh when we can, cached when we cannot, offline page as the
  // last word rather than a browser error.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(SHELL).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match('/offline'))
            .then((hit) => hit || new Response('Offline', { status: 503 })),
        ),
    )
    return
  }

  // Images, fonts and the rest: cache first, refresh in the background.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(ASSETS).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})
