// BíbliaLearn — cache offline do app (shell, arte e áudios já tocados)
const CACHE = "biblialearn-v4";
const SHELL = [
  "./", "index.html", "style.css", "app.js", "features.js", "characters.js", "data.js",
  "manifest.webmanifest", "sfx-data.js", "sfx.js", "hub.js", "stories.js", "icons.js", "screens.js", "scenes.js", "scenes2.js", "scene-engine.js",
  "chars/jesus.jpg", "chars/moises.jpg", "chars/davi.jpg", "chars/ester.jpg", "chars/noe.jpg",
  "chars/maria.jpg", "chars/pedro.jpg", "chars/isaias.jpg", "chars/hero.jpg", "chars/promo.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro para o próprio app (atualizações), cache primeiro para arte e áudio
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const isAsset = /\/(chars|audio)\//.test(url.pathname);
  if (isAsset) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match("index.html")))
  );
});
