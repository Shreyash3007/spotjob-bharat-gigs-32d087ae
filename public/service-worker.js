// Service Worker for SpotJob PWA

// Cache version
const CACHE_VERSION = 'v1';
const CACHE_NAME = `spotjob-cache-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add other important assets here
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets');
      // Use addAll with catch to handle missing assets gracefully
      return cache.addAll(ASSETS_TO_CACHE).catch(error => {
        console.warn('Some assets failed to cache:', error);
        // Continue with installation even if some assets fail to cache
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.includes('spotjob-cache')) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of all clients as soon as it's activated
  return self.clients.claim();
});

// Fetch event - network first, then cache fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching and for the browser
        const responseToCache = response.clone();
        
        // Only cache valid responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(async () => {
        // If network fails, try to serve from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If nothing in cache, show fallback (if it's an HTML request)
        const accept = event.request.headers.get('accept');
        if (accept && accept.includes('text/html')) {
          try {
            return await caches.match('/offline.html');
          } catch (error) {
            // If offline.html is not in cache, return a simple text response
            return new Response('You are offline. Please check your internet connection.', {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            });
          }
        }
        
        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New notification from SpotJob',
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        ...data.data
      },
      actions: data.actions || [
        {
          action: 'open',
          title: 'View'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SpotJob Notification', options)
    );
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
});

// Notification click event - handle user clicking on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Extract URL from notification data
  const url = event.notification.data?.url || '/';
  
  // Focus on existing window if available, otherwise open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
}); 