// Минимальный service worker: нужен, чтобы приложение можно было установить (PWA).
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Пустой обработчик fetch — сеть идёт напрямую, ничего не кэшируем на этом этапе.
self.addEventListener('fetch', () => {});
