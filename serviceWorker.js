/**
 * Service Worker for Bookie-o-em PWA
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_NAME = 'bookie-v1';
const STATIC_CACHE = 'bookie-static-v1';
const DYNAMIC_CACHE = 'bookie-dynamic-v1';
const DATA_CACHE = 'bookie-data-v1';

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.jsx',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// API endpoints that should be cached with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/picks/,
  /\/api\/injuries/,
  /\/api\/sharp/,
  /\/api\/odds/,
  /\/api\/signals/
];

// Data that should be cached for offline access
const OFFLINE_DATA_KEYS = [
  'smash_spots_cache',
  'injury_data_cache',
  'sharp_money_cache',
  'bankroll_data',
  'user_preferences',
  'notification_settings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('bookie-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== DATA_CACHE;
            })
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, fall back to cache
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Dynamic content - stale while revalidate
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Network first strategy - try network, fall back to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        offline: true,
        message: 'You are offline. Data may be outdated.',
        cachedAt: null
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
}

// Cache first strategy - try cache, fall back to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Cache and network failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate - return cache immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || networkPromise || new Response('Offline', { status: 503 });
}

// Check if request is for static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');

  let data = {
    title: 'Bookie-o-em Alert',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'bookie-notification',
    data: {}
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
    data: data.data,
    vibrate: [100, 50, 100],
    actions: getNotificationActions(data.type),
    requireInteraction: data.priority === 'high'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'smash_spot':
      return [
        { action: 'view', title: 'View Pick', icon: '/icons/action-view.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/action-dismiss.png' }
      ];
    case 'injury':
      return [
        { action: 'view', title: 'See Impact', icon: '/icons/action-view.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/action-dismiss.png' }
      ];
    case 'sharp':
      return [
        { action: 'view', title: 'View Alert', icon: '/icons/action-view.png' },
        { action: 'track', title: 'Track', icon: '/icons/action-track.png' }
      ];
    case 'line_move':
      return [
        { action: 'view', title: 'View Odds', icon: '/icons/action-view.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/action-dismiss.png' }
      ];
    default:
      return [
        { action: 'view', title: 'View', icon: '/icons/action-view.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/action-dismiss.png' }
      ];
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: event.action,
              data: event.notification.data
            });
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync handler
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-picks') {
    event.waitUntil(syncPicks());
  }

  if (event.tag === 'sync-bankroll') {
    event.waitUntil(syncBankroll());
  }

  if (event.tag === 'sync-votes') {
    event.waitUntil(syncVotes());
  }
});

// Sync picks data when back online
async function syncPicks() {
  try {
    const response = await fetch('/api/picks/latest');
    if (response.ok) {
      const data = await response.json();
      const cache = await caches.open(DATA_CACHE);
      await cache.put('/api/picks/latest', new Response(JSON.stringify(data)));

      // Notify clients of updated data
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'PICKS_SYNCED',
          data
        });
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync picks failed:', error);
  }
}

// Sync bankroll data
async function syncBankroll() {
  try {
    // Get pending bankroll updates from IndexedDB
    const pendingUpdates = await getPendingBankrollUpdates();

    for (const update of pendingUpdates) {
      await fetch('/api/bankroll/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
    }

    // Clear pending updates
    await clearPendingBankrollUpdates();

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BANKROLL_SYNCED' });
    });
  } catch (error) {
    console.error('[ServiceWorker] Sync bankroll failed:', error);
  }
}

// Sync community votes
async function syncVotes() {
  try {
    const pendingVotes = await getPendingVotes();

    for (const vote of pendingVotes) {
      await fetch('/api/community/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote)
      });
    }

    await clearPendingVotes();

    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'VOTES_SYNCED' });
    });
  } catch (error) {
    console.error('[ServiceWorker] Sync votes failed:', error);
  }
}

// IndexedDB helpers for pending data
async function getPendingBankrollUpdates() {
  // Implementation would use IndexedDB
  return [];
}

async function clearPendingBankrollUpdates() {
  // Implementation would use IndexedDB
}

async function getPendingVotes() {
  // Implementation would use IndexedDB
  return [];
}

async function clearPendingVotes() {
  // Implementation would use IndexedDB
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.urls))
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names =>
        Promise.all(names.map(name => caches.delete(name)))
      )
    );
  }

  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-picks') {
    event.waitUntil(syncPicks());
  }
});

console.log('[ServiceWorker] Loaded');
