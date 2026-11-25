/* 自動生成: tools/make-sw.mjs — 直接編集しない */
const CACHE = 'todai04-duel-pad-c7545e2f8015'
const ASSETS = [
  "./apple-touch-icon.png",
  "./assets/KodeMono-Bold-latin-T7NjCwOZ.woff2",
  "./assets/MPLUS1Code-Bold-subset-BRf7I25K.woff",
  "./assets/index-CP8eJBrs.js",
  "./assets/style-tMfyaG2B.css",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // cache: 'reload' でHTTPキャッシュを迂回し、必ず最新を取り込む
      await cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      // ignoreVary を付けないと、Vary ヘッダのせいで同じURLでもキャッシュに当たらないことがある。
      // これを外すと、JS を要求したのに index.html が返って
      // 「Expected a JavaScript module but got text/html」で起動しなくなる。
      const opts = { ignoreSearch: true, ignoreVary: true }

      // 画面遷移（リロード含む）は必ずアプリ本体を返す。オフラインでも起動する。
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html', opts)
        if (shell) return shell
      }

      const hit = await cache.match(req, opts)
      if (hit) return hit

      try {
        const res = await fetch(req)
        if (res && res.ok && res.type === 'basic') cache.put(req, res.clone())
        return res
      } catch (e) {
        // 画面遷移以外（JS/CSS/画像）でアプリ本体を返してはいけない。
        // MIMEタイプが合わず、かえって起動不能になる。
        if (req.mode === 'navigate') {
          const shell = await cache.match('./index.html', opts)
          if (shell) return shell
        }
        throw e
      }
    })(),
  )
})
