/**
 * PWAManager.jsx
 * Handles Progressive Web App features including:
 * - Service worker registration
 * - Add to home screen prompts
 * - Push notification subscription
 * - Offline detection and UI
 * - Cache management
 * - Background sync
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ============================================================================
// PWA Context
// ============================================================================

const PWAContext = createContext(null);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// ============================================================================
// Service Worker Registration
// ============================================================================

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
        scope: '/'
      });

      console.log('ServiceWorker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
};

// ============================================================================
// Push Notification Helpers
// ============================================================================

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// VAPID public key - would be provided by your server
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE';

// ============================================================================
// PWA Provider Component
// ============================================================================

export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker().then(registration => {
      if (registration) {
        setSwRegistration(registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      }
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Service worker message handling
  useEffect(() => {
    const handleMessage = (event) => {
      switch (event.data.type) {
        case 'PICKS_SYNCED':
          window.dispatchEvent(new CustomEvent('picks-synced', { detail: event.data.data }));
          break;
        case 'BANKROLL_SYNCED':
          window.dispatchEvent(new CustomEvent('bankroll-synced'));
          break;
        case 'VOTES_SYNCED':
          window.dispatchEvent(new CustomEvent('votes-synced'));
          break;
        case 'NOTIFICATION_CLICK':
          window.dispatchEvent(new CustomEvent('notification-click', { detail: event.data }));
          break;
        default:
          break;
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Prompt user to install
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setCanInstall(false);

    return { outcome };
  }, [deferredPrompt]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!swRegistration) {
      throw new Error('Service worker not registered');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Push notification permission denied');
    }

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setIsPushEnabled(true);
      localStorage.setItem('pwa_push_enabled', 'true');

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }, [swRegistration]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!swRegistration) return;

    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();

      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
    }

    setIsPushEnabled(false);
    localStorage.removeItem('pwa_push_enabled');
  }, [swRegistration]);

  // Apply update
  const applyUpdate = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));

    setCacheSize(0);
  }, []);

  // Get cache size
  const getCacheSize = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage } = await navigator.storage.estimate();
      setCacheSize(usage || 0);
      return usage || 0;
    }
    return 0;
  }, []);

  // Request background sync
  const requestSync = useCallback(async (tag) => {
    if (swRegistration && 'sync' in swRegistration) {
      await swRegistration.sync.register(tag);
    }
  }, [swRegistration]);

  // Cache specific URLs
  const cacheUrls = useCallback((urls) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  }, []);

  const value = {
    isOnline,
    isInstalled,
    canInstall,
    isPushEnabled,
    updateAvailable,
    cacheSize,
    promptInstall,
    subscribeToPush,
    unsubscribeFromPush,
    applyUpdate,
    clearCache,
    getCacheSize,
    requestSync,
    cacheUrls
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

// ============================================================================
// Offline Banner Component
// ============================================================================

export const OfflineBanner = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  const styles = {
    banner: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: 500
    },
    icon: {
      fontSize: '18px'
    }
  };

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>&#x26A0;</span>
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  );
};

// ============================================================================
// Install Prompt Component
// ============================================================================

export const InstallPrompt = ({ onDismiss }) => {
  const { canInstall, promptInstall, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa_install_dismissed');
    if (wasDismissed) {
      const dismissedDate = new Date(wasDismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      setDismissed(daysSinceDismissed < 7);
    }
  }, []);

  if (!canInstall || isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', new Date().toISOString());
    onDismiss?.();
  };

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      onDismiss?.();
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      bottom: '80px',
      left: '16px',
      right: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      zIndex: 9998,
      border: '1px solid #334155'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    icon: {
      width: '48px',
      height: '48px',
      backgroundColor: '#3b82f6',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f8fafc',
      margin: 0
    },
    subtitle: {
      fontSize: '13px',
      color: '#94a3b8',
      margin: '4px 0 0 0'
    },
    benefits: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    benefit: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#94a3b8'
    },
    checkIcon: {
      color: '#22c55e'
    },
    buttons: {
      display: 'flex',
      gap: '12px'
    },
    installButton: {
      flex: 1,
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    dismissButton: {
      backgroundColor: 'transparent',
      color: '#94a3b8',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon}>&#x1F3C0;</div>
        <div>
          <h3 style={styles.title}>Install Bookie-o-em</h3>
          <p style={styles.subtitle}>Get the full app experience</p>
        </div>
      </div>

      <div style={styles.benefits}>
        <div style={styles.benefit}>
          <span style={styles.checkIcon}>&#x2713;</span>
          <span>Instant access</span>
        </div>
        <div style={styles.benefit}>
          <span style={styles.checkIcon}>&#x2713;</span>
          <span>Works offline</span>
        </div>
        <div style={styles.benefit}>
          <span style={styles.checkIcon}>&#x2713;</span>
          <span>Push alerts</span>
        </div>
        <div style={styles.benefit}>
          <span style={styles.checkIcon}>&#x2713;</span>
          <span>Faster loading</span>
        </div>
      </div>

      <div style={styles.buttons}>
        <button style={styles.dismissButton} onClick={handleDismiss}>
          Not now
        </button>
        <button style={styles.installButton} onClick={handleInstall}>
          Install App
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Update Available Banner
// ============================================================================

export const UpdateBanner = () => {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) return null;

  const styles = {
    banner: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999
    },
    message: {
      fontSize: '14px',
      fontWeight: 500
    },
    button: {
      backgroundColor: 'white',
      color: '#3b82f6',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.banner}>
      <span style={styles.message}>A new version is available!</span>
      <button style={styles.button} onClick={applyUpdate}>
        Update Now
      </button>
    </div>
  );
};

// ============================================================================
// Push Notification Toggle
// ============================================================================

export const PushNotificationToggle = () => {
  const { isPushEnabled, subscribeToPush, unsubscribeFromPush } = usePWA();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isPushEnabled) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '8px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    icon: {
      fontSize: '20px'
    },
    text: {
      fontSize: '14px',
      color: '#f8fafc'
    },
    toggle: {
      width: '48px',
      height: '28px',
      borderRadius: '14px',
      backgroundColor: isPushEnabled ? '#22c55e' : '#475569',
      border: 'none',
      padding: '2px',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1,
      transition: 'background-color 0.2s'
    },
    toggleKnob: {
      width: '24px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: 'white',
      transform: isPushEnabled ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform 0.2s'
    },
    error: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '8px'
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.label}>
          <span style={styles.icon}>&#x1F514;</span>
          <span style={styles.text}>Push Notifications</span>
        </div>
        <button style={styles.toggle} onClick={handleToggle} disabled={loading}>
          <div style={styles.toggleKnob} />
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

// ============================================================================
// Cache Manager Component
// ============================================================================

export const CacheManager = () => {
  const { clearCache, getCacheSize, cacheSize } = usePWA();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCacheSize();
  }, [getCacheSize]);

  const handleClearCache = async () => {
    setLoading(true);
    await clearCache();
    setLoading(false);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const styles = {
    container: {
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '8px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    title: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#f8fafc'
    },
    size: {
      fontSize: '14px',
      color: '#94a3b8'
    },
    bar: {
      height: '8px',
      backgroundColor: '#334155',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    progress: {
      height: '100%',
      backgroundColor: '#3b82f6',
      width: `${Math.min((cacheSize / (50 * 1024 * 1024)) * 100, 100)}%`,
      borderRadius: '4px',
      transition: 'width 0.3s'
    },
    button: {
      width: '100%',
      backgroundColor: '#334155',
      color: '#f8fafc',
      border: 'none',
      borderRadius: '6px',
      padding: '10px',
      fontSize: '13px',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Cached Data</span>
        <span style={styles.size}>{formatBytes(cacheSize)} / 50 MB</span>
      </div>
      <div style={styles.bar}>
        <div style={styles.progress} />
      </div>
      <button style={styles.button} onClick={handleClearCache} disabled={loading}>
        {loading ? 'Clearing...' : 'Clear Cache'}
      </button>
    </div>
  );
};

// ============================================================================
// iOS Install Instructions (iOS doesn't support beforeinstallprompt)
// ============================================================================

export const IOSInstallInstructions = ({ onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if iOS and not already installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const wasDismissed = localStorage.getItem('ios_install_dismissed');

    if (isIOS && !isStandalone && !wasDismissed) {
      // Delay showing to not be intrusive
      setTimeout(() => setShow(true), 5000);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('ios_install_dismissed', 'true');
    onDismiss?.();
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end'
    },
    modal: {
      backgroundColor: '#1e293b',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      padding: '24px',
      width: '100%',
      maxHeight: '70vh'
    },
    handle: {
      width: '40px',
      height: '4px',
      backgroundColor: '#475569',
      borderRadius: '2px',
      margin: '0 auto 20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      textAlign: 'center',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#94a3b8',
      textAlign: 'center',
      marginBottom: '24px'
    },
    steps: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#0f172a',
      borderRadius: '12px'
    },
    stepNumber: {
      width: '32px',
      height: '32px',
      borderRadius: '16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 600,
      flexShrink: 0
    },
    stepText: {
      fontSize: '14px',
      color: '#f8fafc'
    },
    stepIcon: {
      fontSize: '20px',
      marginRight: '4px'
    },
    dismissButton: {
      width: '100%',
      backgroundColor: '#334155',
      color: '#f8fafc',
      border: 'none',
      borderRadius: '10px',
      padding: '14px',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleDismiss}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>Install Bookie-o-em</h2>
        <p style={styles.subtitle}>Add to your home screen for the best experience</p>

        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepText}>
              Tap the <span style={styles.stepIcon}>&#x2B06;&#xFE0F;</span> Share button in Safari
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepText}>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepText}>
              Tap <strong>"Add"</strong> in the top right corner
            </div>
          </div>
        </div>

        <button style={styles.dismissButton} onClick={handleDismiss}>
          Got it!
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Connection Status Hook
// ============================================================================

export const useConnectionStatus = () => {
  const { isOnline } = usePWA();
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      setConnectionType(connection.type || 'unknown');
      setEffectiveType(connection.effectiveType || '4g');

      const handleChange = () => {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || '4g');
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    isOnline,
    connectionType,
    effectiveType,
    isSlow: effectiveType === 'slow-2g' || effectiveType === '2g'
  };
};

// ============================================================================
// Background Sync Hook
// ============================================================================

export const useBackgroundSync = () => {
  const { requestSync } = usePWA();

  const syncPicks = useCallback(() => requestSync('sync-picks'), [requestSync]);
  const syncBankroll = useCallback(() => requestSync('sync-bankroll'), [requestSync]);
  const syncVotes = useCallback(() => requestSync('sync-votes'), [requestSync]);

  return {
    syncPicks,
    syncBankroll,
    syncVotes
  };
};

// ============================================================================
// Offline Data Manager
// ============================================================================

export const useOfflineData = (key, fetchFn, options = {}) => {
  const { isOnline, cacheUrls } = usePWA();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const { maxAge = 5 * 60 * 1000, fallback = null } = options;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cached = localStorage.getItem(`offline_${key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        setData(cachedData);
        setIsStale(age > maxAge);

        if (age <= maxAge || !isOnline) {
          setLoading(false);
          if (!isOnline) return;
        }
      }

      // Fetch fresh data if online
      if (isOnline && fetchFn) {
        try {
          const freshData = await fetchFn();
          setData(freshData);
          setIsStale(false);

          // Cache the fresh data
          localStorage.setItem(`offline_${key}`, JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          }));
        } catch (err) {
          setError(err);
          // Keep showing cached data if available
          if (!cached && fallback) {
            setData(fallback);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, [key, isOnline, fetchFn, maxAge, fallback]);

  const refresh = useCallback(async () => {
    if (!isOnline) return;

    setLoading(true);
    try {
      const freshData = await fetchFn();
      setData(freshData);
      setIsStale(false);

      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }, [key, isOnline, fetchFn]);

  return {
    data,
    loading,
    error,
    isStale,
    isOffline: !isOnline,
    refresh
  };
};

export default {
  PWAProvider,
  usePWA,
  OfflineBanner,
  InstallPrompt,
  UpdateBanner,
  PushNotificationToggle,
  CacheManager,
  IOSInstallInstructions,
  useConnectionStatus,
  useBackgroundSync,
  useOfflineData
};
