// @ts-nocheck

// to check serwist files
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// to check serwist files
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});


// to fetch the method
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(fetch(event.request));
});
