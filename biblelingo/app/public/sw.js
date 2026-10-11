// BíbliaLearn (React) — cache offline: shell na rede primeiro, mídia no cache primeiro
const CACHE = "biblialearn-react-v3";
// Pré-cache versionado: sprite dos efeitos sonoros v2 (SFX_SPEC 5.1). O .m4a serve ao Safari (sem Vorbis);
// sfx-v2.m4a.json só existe quando o AAC precisa de offsets próprios. Um arquivo ausente não impede a instalação.
const PRECACHE = ["audio/sfx/sfx-v2.json", "audio/sfx/sfx-v2.ogg", "audio/sfx/sfx-v2.m4a", "audio/sfx/sfx-v2.m4a.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})))));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith("biblialearn-react")).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== "GET") return;
  // Mapas de áudio (.json) mudam a cada geração: sempre rede primeiro. O sprite de efeitos (audio/sfx/) também: o nome
  // sfx-v2 se mantém entre gerações e o áudio precisa acompanhar os offsets do mapa novo (o pré-cache cobre o offline)
  const media = /\/(chars|audio|icons|fonts)\//.test(url.pathname) && !/\.json$/.test(url.pathname) && !/\/audio\/sfx\//.test(url.pathname);
  const hashed = /\/assets\//.test(url.pathname);
  if (media || hashed) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); }
        return res;
      }))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
