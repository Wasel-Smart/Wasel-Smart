/// <reference lib="webworker" />

const CACHE_NAME = 'wassel-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Runtime cache configurations
const RUNTIME_CACHE_CONFIG = [
  {
    // Cache Google Fonts
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      },
    },
  },
  {
    // Cache Google Fonts (CSS)
    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-web',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      },
    },
  },
  {
    // Cache images
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
    },
  },
  {
    // Cache API requests
    urlPattern: /\/api\/.*$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
      networkTimeoutSeconds: 10,
    },
  },
  {
    // Cache Supabase requests
    urlPattern: /supabase\.co/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'supabase-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
      networkTimeoutSeconds: 15,
    },
  },
  {
    // Default handler for everything else
    urlPattern: /.*/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'runtime-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for fonts, images, etc.)
  if (url.origin !== location.origin) {
    // Allow specific cross-origin requests
    if (url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname.includes('supabase.co')) {
      // These are allowed
    } else {
      return;
    }
  }
  
  // Find matching cache config
  const matchedConfig = RUNTIME_CACHE_CONFIG.find((config) => 
    config.urlPattern.test(request.url)
  );
  
  if (matchedConfig) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached response if available
          if (cachedResponse) {
            // Fetch in background to update cache
            fetchAndCache(request, matchedConfig);
            return cachedResponse;
          }
          
          // No cache, fetch from network
          return fetchAndCache(request, matchedConfig);
        })
        .catch((error) => {
          console.error('[SW] Fetch failed:', error);
          
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          
          return new Response('Offline', { status: 503 });
        })
    );
  }
});

// Helper function to fetch and cache
async function fetchAndCache(request, config) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(config.options.cacheName);
      
      // Clone response because it can only be consumed once
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  }
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Sync trips when back online
async function syncTrips() {
  console.log('[SW] Syncing trips...');
  
  try {
    // Get pending trips from IndexedDB
    const pendingTrips = await getPendingTrips();
    
    for (const trip of pendingTrips) {
      try {
        await fetch('/api/trips/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trip),
        });
        
        // Remove from pending
        await removePendingTrip(trip.id);
      } catch (error) {
        console.error('[SW] Failed to sync trip:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync trips failed:', error);
  }
}

// Sync messages when back online
async function syncMessages() {
  console.log('[SW] Syncing messages...');
  
  try {
    const pendingMessages = await getPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        await fetch('/api/messages/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        
        await removePendingMessage(message.id);
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync messages failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'Wassel',
    body: 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'default',
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  let url = '/';
  
  // Determine URL based on notification type
  if (data.type === 'trip_update') {
    url = `/?page=live-trip&tripId=${data.tripId}`;
  } else if (data.type === 'message') {
    url = `/?page=messages&conversationId=${data.conversationId}`;
  } else if (data.type === 'payment') {
    url = '/?page=payments';
  } else if (action === 'view') {
    url = data.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url });
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    event.ports[0].postMessage({ type: 'CACHE_SIZE', size: 'calculating...' });
  }
});

// Placeholder functions for IndexedDB operations
async function getPendingTrips() {
  return [];
}

async function removePendingTrip(id) {}

async function getPendingMessages() {
  return [];
}

async function removePendingMessage(id) {}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-location') {
    event.waitUntil(syncLocationUpdates());
  }
});

async function syncLocationUpdates() {
  console.log('[SW] Syncing location updates...');
  // Implementation for background location sync
}
