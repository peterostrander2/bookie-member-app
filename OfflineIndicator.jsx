/**
 * OFFLINE INDICATOR
 *
 * Shows user when they're offline and displays cached data status.
 * Provides UI for service worker updates.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';

// Create context for offline status
const OfflineContext = createContext({
  isOnline: true,
  isServiceWorkerReady: false,
  pendingSyncCount: 0,
  cacheStatus: null
});

export const useOffline = () => useContext(OfflineContext);

// Offline Provider
export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setIsServiceWorkerReady(true);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, status } = event.data || {};

        if (type === 'CACHE_STATUS') {
          setCacheStatus(status);
        } else if (type === 'SYNC_COMPLETE') {
          setPendingSyncCount(0);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request cache status periodically when online
  useEffect(() => {
    if (!isServiceWorkerReady) return;

    const requestCacheStatus = () => {
      navigator.serviceWorker.controller?.postMessage({ type: 'GET_CACHE_STATUS' });
    };

    requestCacheStatus();
    const interval = setInterval(requestCacheStatus, 30000); // Every 30s

    return () => clearInterval(interval);
  }, [isServiceWorkerReady]);

  // Update service worker
  const updateServiceWorker = () => {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  // Clear API cache
  const clearCache = () => {
    navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_API_CACHE' });
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isServiceWorkerReady,
      pendingSyncCount,
      cacheStatus,
      updateAvailable,
      updateServiceWorker,
      clearCache
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

// Offline Banner Component
export const OfflineBanner = () => {
  const { isOnline, pendingSyncCount } = useOffline();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when coming back online
  useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: 0,
      right: 0,
      backgroundColor: '#FF9500',
      color: '#000',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      fontSize: '14px',
      fontWeight: '500'
    }}>
      <span style={{ fontSize: '18px' }}>📡</span>
      <span>
        You're offline. Showing cached data.
        {pendingSyncCount > 0 && ` (${pendingSyncCount} pending sync)`}
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#000',
          cursor: 'pointer',
          padding: '4px 8px',
          marginLeft: 'auto',
          fontSize: '16px',
          opacity: 0.7
        }}
      >
        ✕
      </button>
    </div>
  );
};

// Update Available Banner
export const UpdateBanner = () => {
  const { updateAvailable, updateServiceWorker } = useOffline();

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#00D4FF',
      color: '#000',
      padding: '12px 20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)'
    }}>
      <span style={{ fontSize: '16px' }}>🔄</span>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>
        A new version is available
      </span>
      <button
        onClick={updateServiceWorker}
        style={{
          backgroundColor: '#000',
          color: '#00D4FF',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px'
        }}
      >
        Update Now
      </button>
    </div>
  );
};

// Connection Status Indicator (small dot)
export const ConnectionIndicator = ({ showLabel = false }) => {
  const { isOnline, isServiceWorkerReady } = useOffline();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isOnline ? '#00FF88' : '#FF9500',
        boxShadow: isOnline ? '0 0 6px #00FF88' : '0 0 6px #FF9500'
      }} />
      {showLabel && (
        <span style={{
          fontSize: '12px',
          color: isOnline ? '#00FF88' : '#FF9500'
        }}>
          {isOnline ? (isServiceWorkerReady ? 'Online' : 'Connecting...') : 'Offline'}
        </span>
      )}
    </div>
  );
};

// Cache Status Display
export const CacheStatusDisplay = () => {
  const { cacheStatus, clearCache, isServiceWorkerReady } = useOffline();

  if (!isServiceWorkerReady || !cacheStatus) return null;

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #333'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ color: '#fff', margin: 0, fontSize: '14px' }}>Offline Cache</h4>
        <button
          onClick={clearCache}
          style={{
            backgroundColor: '#FF444420',
            color: '#FF4444',
            border: '1px solid #FF444450',
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear Cache
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
        <div>
          <span style={{ color: '#6b7280' }}>API Cache: </span>
          <span style={{ color: '#00D4FF' }}>{cacheStatus.apiCacheEntries} entries</span>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Static Cache: </span>
          <span style={{ color: '#00D4FF' }}>{cacheStatus.staticCacheEntries} entries</span>
        </div>
      </div>
    </div>
  );
};

// Offline-aware data wrapper
export const OfflineDataIndicator = ({ isCached = false, cachedAt = null }) => {
  if (!isCached) return null;

  const timeAgo = cachedAt ? getTimeAgo(new Date(cachedAt)) : 'earlier';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#FF950020',
      color: '#FF9500',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px'
    }}>
      <span>📦</span>
      <span>Cached {timeAgo}</span>
    </div>
  );
};

// Helper function
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Hook for offline-first data fetching
export function useOfflineFirst(fetchFn, cacheKey, deps = []) {
  const { isOnline } = useOffline();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cached = localStorage.getItem(`offline_${cacheKey}`);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          setData(cachedData);
          setIsCached(true);

          // If offline, just use cached data
          if (!isOnline) {
            setLoading(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      // If online, fetch fresh data
      if (isOnline) {
        try {
          const freshData = await fetchFn();
          setData(freshData);
          setIsCached(false);

          // Cache the fresh data
          localStorage.setItem(`offline_${cacheKey}`, JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          }));
        } catch (err) {
          // If fetch fails but we have cached data, use it
          if (data) {
            setIsCached(true);
          } else {
            setError(err.message || 'Failed to load data');
          }
        }
      } else if (!data) {
        setError('No cached data available');
      }

      setLoading(false);
    };

    loadData();
  }, [isOnline, ...deps]);

  return { data, loading, error, isCached, isOnline };
}

export default {
  OfflineProvider,
  OfflineBanner,
  UpdateBanner,
  ConnectionIndicator,
  CacheStatusDisplay,
  OfflineDataIndicator,
  useOffline,
  useOfflineFirst
};
