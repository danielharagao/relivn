const SHELL_CACHE = 'relivn-shell-v5';
const AUDIO_CACHE = 'relivn-audio-v1';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './app-data.js', './transcriptions.js',
  './relivn-config.js', './phase1-core.js', './phase1-data.js', './phase1.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('relivn-shell-') && key !== SHELL_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function rangedAudioResponse(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request.url);
  if (!cached) return fetch(request);
  const range = request.headers.get('range');
  if (!range) return cached;

  const bytes = await cached.arrayBuffer();
  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return new Response(null, { status: 416 });
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
  if (start >= bytes.byteLength || end < start) return new Response(null, { status: 416 });
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg'
    }
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/assets/audio/')) {
    event.respondWith(rangedAudioResponse(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(SHELL_CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
