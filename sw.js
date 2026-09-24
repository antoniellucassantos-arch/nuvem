// Service worker: guarda os arquivos do jogo para abrir sem internet (quando publicado, ex.: GitHub Pages).
const CACHE = 'inforeal-v1';
const FILES = ['./', './index.html', './css/style.css', './manifest.json', './icon.svg', './js/batch1.js', './js/core.js', './js/data.js', './js/dev-data.js', './js/dev.js', './js/documentary.js', './js/draw.js', './js/events.js', './js/extras.js', './js/franchise.js', './js/future.js', './js/game.js', './js/hackers.js', './js/lab-data.js', './js/lab.js', './js/missions.js', './js/pack1.js', './js/pack2.js', './js/releases.js', './js/rescue.js', './js/retro-ui.js', './js/retro.js', './js/seasons.js', './js/settings.js', './js/sim-modes.js', './js/sim.js', './js/skills.js', './js/tutorial.js'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
// Rede primeiro (pega a versão nova), cache se estiver offline.
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).then(r => {
  const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
}).catch(() => caches.match(e.request))));
