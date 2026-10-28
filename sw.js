// Sillage — fonctionnement hors connexion du site publié.
// Réseau d'abord (pour voir les morceaux ajoutés), copie locale si le téléphone est hors ligne.
const CACHE = 'sillage-mvsbu6bl';
const SHELL = ['./', 'index.html', 'library.json', 'manifest.webmanifest', 'icon-192.png', 'model/model.json', 'model/weights.wasm'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const keep = u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  e.respondWith(
    fetch(e.request).then(r => {
      if (keep && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
