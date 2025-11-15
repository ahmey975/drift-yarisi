const CACHE_NAME = 'ultimate-drift-game-v1';
const urlsToCache = [
    '/index.html',
    '/manifest.json',
    '/service-worker.js',
    '/car-drift-icon-192x192.png',
    '/car-drift-icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js', // THREE.js kütüphanesi
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap' // Google Font (CSS)
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Önbellekleme hatası:', err);
                });
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Önbellekte varsa önbellekten döndür
                }
                return fetch(event.request) // Yoksa ağdan çek
                    .catch(() => {
                        // Hem önbellekte yoksa hem de ağ hatası varsa
                        console.log('Service Worker: Fetch failed and no cache match for ', event.request.url);
                        // Temel HTML dosyasını döndürmeyi deneyebiliriz (offline modda)
                        if (event.request.mode === 'navigate' || event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Yeni olmayan önbellekleri sil
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache: ', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});