// Bookie-o-em Service Worker v2
// Enhanced offline support with API caching

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `bookie-static-${CACHE_VERSION}`;
const API_CACHE = `bookie-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `bookie-images-${CACHE_VERSION}`;
const SW_DEBUG = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

function swLog(...args) {
  if (SW_DEBUG) console.log(...args);
}

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// API endpoints to cache with their TTL (in ms)
const API_CACHE_CONFIG = {
  '/live/best-bets/': { ttl: 2 * 60 * 1000, staleWhileRevalidate: true }, // 2 min
  '/live/props/': { ttl: 2 * 60 * 1000, staleWhileRevalidate: true },
  '/live/sharp/': { ttl: 5 * 60 * 1000, staleWhileRevalidate: true }, // 5 min
  '/live/splits/': { ttl: 5 * 60 * 1000, staleWhileRevalidate: true },
  '/live/sportsbooks': { ttl: 30 * 60 * 1000, staleWhileRevalidate: true }, // 30 min
  '/esoteric/today-energy': { ttl: 60 * 60 * 1000, staleWhileRevalidate: true }, // 1 hour
  '/live/bets/history': { ttl: 1 * 60 * 1000, staleWhileRevalidate: true }, // 1 min
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      swLog('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, API_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            swLog('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Get cache config for URL
function getCacheConfig(url) {
  for (const [pattern, config] of Object.entries(API_CACHE_CONFIG)) {
    if (url.includes(pattern)) {
      return config;
    }
  }
  return null;
}

// Check if cached response is still fresh
function isCacheFresh(response, ttl) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  return (Date.now() - parseInt(cachedAt, 10)) < ttl;
}

// Clone response with cache timestamp
async function addCacheTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());

  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isHttpRequest(request) {
  try {
    const url = new URL(request.url);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') return;
  // Skip non-http(s) schemes (e.g., chrome-extension)
  if (!isHttpRequest(request)) return;

  // Never cache API responses (live/ops/health/esoteric)
  if (
    url.includes('railway.app') ||
    url.includes('/live/') ||
    url.includes('/ops/') ||
    url.includes('/health') ||
    url.includes('/internal/') ||
    url.includes('/esoteric/')
  ) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Handle static assets and app shell
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with stale-while-revalidate
async function handleApiRequest(request) {
  const config = getCacheConfig(request.url);
  const cache = await caches.open(API_CACHE);

  // Try to get cached response
  const cachedResponse = await cache.match(request);

  // If we have a fresh cached response, return it
  if (cachedResponse && config && isCacheFresh(cachedResponse, config.ttl)) {
    swLog('[SW] Returning fresh cached API response:', request.url);
    return cachedResponse;
  }

  // If stale-while-revalidate and we have a stale cache, return it while fetching
  if (cachedResponse && config?.staleWhileRevalidate) {
    swLog('[SW] Returning stale cache while revalidating:', request.url);

    // Revalidate in background
    fetchAndCache(request, cache).catch(console.error);

    return cachedResponse;
  }

  // Try network request
  try {
    const response = await fetchAndCache(request, cache);
    return response;
  } catch (error) {
    swLog('[SW] Network failed, checking cache:', request.url);

    // Return stale cache if available (better than nothing)
    if (cachedResponse) {
      swLog('[SW] Returning stale cached response:', request.url);
      return cachedResponse;
    }

    // Return offline response for API
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. Please check your connection.',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Fetch and cache helper
async function fetchAndCache(request, cache) {
  const response = await fetch(request);

  if (response.ok) {
    const timestampedResponse = await addCacheTimestamp(response.clone());
    cache.put(request, timestampedResponse);
    swLog('[SW] Cached API response:', request.url);
  }

  return response;
}

// Handle static requests
async function handleStaticRequest(request) {
  // Navigation/documents: network-first to avoid stale HTML/asset hashes
  if (request.mode === 'navigate' || request.destination === 'document') {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) return offlineResponse;
      throw error;
    }
  }

  // Try cache first for static assets
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Try network
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) return offlineResponse;
    }

    throw error;
  }
}

// Background sync for offline bet tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bets') {
    event.waitUntil(syncOfflineBets());
  }
});

// Sync offline bets when back online
async function syncOfflineBets() {
  swLog('[SW] Syncing offline bets...');

  // Get pending bets from IndexedDB
  const pendingBets = await getFromIndexedDB('pendingBets');

  if (!pendingBets || pendingBets.length === 0) {
    swLog('[SW] No pending bets to sync');
    return;
  }

  for (const bet of pendingBets) {
    try {
      const response = await fetch(bet.url, {
        method: bet.method,
        headers: bet.headers,
        body: bet.body
      });

      if (response.ok) {
        await removeFromIndexedDB('pendingBets', bet.id);
        swLog('[SW] Synced bet:', bet.id);
      }
    } catch (error) {
      console.error('[SW] Failed to sync bet:', bet.id, error);
    }
  }

  // Notify clients that sync is complete
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-bets' });
  });
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BookieOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingBets')) {
        db.createObjectStore('pendingBets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedPicks')) {
        db.createObjectStore('cachedPicks', { keyPath: 'id' });
      }
    };
  });
}

async function getFromIndexedDB(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeFromIndexedDB(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'bookie-notification',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  let urlToOpen = data.url || '/';

  // Handle action buttons
  if (action === 'view-pick') {
    urlToOpen = '/smash-spots';
  } else if (action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_PICKS':
      cachePicksData(payload);
      break;

    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.source.postMessage({ type: 'CACHE_STATUS', status });
      });
      break;

    case 'CLEAR_API_CACHE':
      caches.delete(API_CACHE).then(() => {
        event.source.postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
  }
});

// Cache picks data for offline viewing
async function cachePicksData(picks) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(picks), {
    headers: {
      'Content-Type': 'application/json',
      'sw-cached-at': Date.now().toString()
    }
  });
  await cache.put('/offline/picks', response);
  swLog('[SW] Cached picks data for offline viewing');
}

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {
    caches: cacheNames,
    apiCacheEntries: 0,
    staticCacheEntries: 0
  };

  if (await caches.has(API_CACHE)) {
    const apiCache = await caches.open(API_CACHE);
    const apiKeys = await apiCache.keys();
    status.apiCacheEntries = apiKeys.length;
  }

  if (await caches.has(STATIC_CACHE)) {
    const staticCache = await caches.open(STATIC_CACHE);
    const staticKeys = await staticCache.keys();
    status.staticCacheEntries = staticKeys.length;
  }

  return status;
}

swLog('[SW] Service Worker loaded - v2 with offline support');
