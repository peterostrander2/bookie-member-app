/**
 * PUSH NOTIFICATIONS
 *
 * Web Push Notifications for SMASH alerts.
 * Handles subscription, permission management, and notification display.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from './Toast';

// VAPID public key (would come from environment in production)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const API_BASE = import.meta.env.VITE_API_URL || 'https://web-production-7b2a.up.railway.app';

// Push notification context
const PushContext = createContext({
  isSupported: false,
  permission: 'default',
  isSubscribed: false,
  subscribe: () => {},
  unsubscribe: () => {},
  preferences: {}
});

export const usePush = () => useContext(PushContext);

// Check if push notifications are supported
const isPushSupported = () => {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window;
};

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
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
}

// Push Notification Provider
export const PushProvider = ({ children }) => {
  const [isSupported] = useState(isPushSupported());
  const [permission, setPermission] = useState(
    isSupported ? Notification.permission : 'denied'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('pushPreferences');
    return saved ? JSON.parse(saved) : {
      smashAlerts: true,
      sharpMoney: true,
      dailySummary: false,
      resultNotifications: true,
      quietHoursStart: null,
      quietHoursEnd: null
    };
  });

  // Check subscription status on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription();
      setIsSubscribed(!!sub);
      setSubscription(sub);
    });
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Push notifications not supported');
    }

    // Request permission
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined
    });

    setSubscription(sub);
    setIsSubscribed(true);

    // Send subscription to backend
    await sendSubscriptionToServer(sub);

    return sub;
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) return;

    await subscription.unsubscribe();

    // Notify backend
    await removeSubscriptionFromServer(subscription);

    setSubscription(null);
    setIsSubscribed(false);
  };

  // Update notification preferences
  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('pushPreferences', JSON.stringify(updated));

    // Sync with backend if subscribed
    if (isSubscribed && subscription) {
      syncPreferencesWithServer(subscription, updated);
    }
  };

  return (
    <PushContext.Provider value={{
      isSupported,
      permission,
      isSubscribed,
      subscription,
      subscribe,
      unsubscribe,
      preferences,
      updatePreferences
    }}>
      {children}
    </PushContext.Provider>
  );
};

// Send subscription to server
async function sendSubscriptionToServer(subscription) {
  try {
    await fetch(`${API_BASE}/live/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY || ''
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: JSON.parse(localStorage.getItem('pushPreferences') || '{}')
      })
    });
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
  }
}

// Remove subscription from server
async function removeSubscriptionFromServer(subscription) {
  try {
    await fetch(`${API_BASE}/live/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY || ''
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
  }
}

// Sync preferences with server
async function syncPreferencesWithServer(subscription, preferences) {
  try {
    await fetch(`${API_BASE}/live/push/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY || ''
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        preferences
      })
    });
  } catch (error) {
    console.error('Failed to sync preferences with server:', error);
  }
}

// Push Notification Settings Component
export const PushNotificationSettings = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    preferences,
    updatePreferences
  } = usePush();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleSubscription = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Push notifications disabled');
      } else {
        await subscribe();
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    if (!isSupported || permission !== 'granted') return;

    new Notification('Bookie-o-em Test', {
      body: 'Push notifications are working!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification'
    });
  };

  if (!isSupported) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>
          Push Notifications
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #333'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🔔</span> Push Notifications
      </h3>

      {/* Main Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#0a0a0f',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>
            Enable Notifications
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>
            {permission === 'denied'
              ? 'Notifications blocked in browser settings'
              : isSubscribed
                ? 'Currently receiving notifications'
                : 'Get alerts for SMASH picks'}
          </div>
        </div>

        <button
          onClick={handleToggleSubscription}
          disabled={loading || permission === 'denied'}
          style={{
            padding: '8px 20px',
            backgroundColor: isSubscribed ? '#FF444420' : '#00FF8820',
            color: isSubscribed ? '#FF4444' : '#00FF88',
            border: `1px solid ${isSubscribed ? '#FF444450' : '#00FF8850'}`,
            borderRadius: '8px',
            cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Notification Types */}
      {isSubscribed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Notification Types
          </h4>

          <ToggleOption
            label="SMASH Alerts"
            description="High-conviction picks (85%+ confidence)"
            checked={preferences.smashAlerts}
            onChange={(v) => updatePreferences({ smashAlerts: v })}
            highlight
          />

          <ToggleOption
            label="Sharp Money Alerts"
            description="Significant sharp money movement"
            checked={preferences.sharpMoney}
            onChange={(v) => updatePreferences({ sharpMoney: v })}
          />

          <ToggleOption
            label="Daily Summary"
            description="Morning digest of today's top picks"
            checked={preferences.dailySummary}
            onChange={(v) => updatePreferences({ dailySummary: v })}
          />

          <ToggleOption
            label="Bet Results"
            description="Notifications when your bets settle"
            checked={preferences.resultNotifications}
            onChange={(v) => updatePreferences({ resultNotifications: v })}
          />

          {/* Test Button */}
          <button
            onClick={handleTestNotification}
            style={{
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#00D4FF',
              border: '1px solid #00D4FF50',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              marginTop: '8px'
            }}
          >
            Send Test Notification
          </button>
        </div>
      )}

      {/* Permission Denied Message */}
      {permission === 'denied' && (
        <div style={{
          padding: '12px',
          backgroundColor: '#FF444420',
          borderRadius: '8px',
          marginTop: '12px'
        }}>
          <p style={{ color: '#FF4444', fontSize: '13px', margin: 0 }}>
            Notifications are blocked. Please enable them in your browser settings and refresh the page.
          </p>
        </div>
      )}
    </div>
  );
};

// Toggle Option Component
const ToggleOption = ({ label, description, checked, onChange, highlight = false }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: highlight && checked ? '#00FF8810' : '#0a0a0f',
    borderRadius: '8px',
    border: highlight && checked ? '1px solid #00FF8830' : '1px solid transparent'
  }}>
    <div>
      <div style={{ color: '#fff', fontSize: '14px', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: '#6b7280', fontSize: '11px' }}>{description}</div>
    </div>

    <label style={{
      position: 'relative',
      width: '44px',
      height: '24px',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#00FF88' : '#333',
        borderRadius: '24px',
        transition: 'background-color 0.2s'
      }} />
      <span style={{
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px',
        height: '20px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s'
      }} />
    </label>
  </div>
);

// SMASH Alert Bell (mini component for navbar)
export const SmashAlertBell = () => {
  const { isSupported, isSubscribed, subscribe } = usePush();
  const toast = useToast();
  const [animate, setAnimate] = useState(false);

  const handleClick = async () => {
    if (!isSupported) {
      toast.info('Push notifications not supported');
      return;
    }

    if (isSubscribed) {
      toast.info('SMASH alerts enabled');
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    } else {
      try {
        await subscribe();
        toast.success('SMASH alerts enabled!');
      } catch (error) {
        if (error.message.includes('denied')) {
          toast.error('Please enable notifications in browser settings');
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      title={isSubscribed ? 'SMASH alerts enabled' : 'Enable SMASH alerts'}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid #333',
        backgroundColor: isSubscribed ? '#00FF8815' : '#1a1a2e',
        color: isSubscribed ? '#00FF88' : '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        transition: 'all 0.2s',
        animation: animate ? 'ring 0.5s ease-in-out' : 'none'
      }}
    >
      {isSubscribed ? '🔔' : '🔕'}
      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          20%, 60% { transform: rotate(15deg); }
          40%, 80% { transform: rotate(-15deg); }
        }
      `}</style>
    </button>
  );
};

// Local notification helper (for in-app alerts)
export const showLocalNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'local-notification',
    ...options
  });

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
};

// Trigger SMASH notification (called when new SMASH pick detected)
export const triggerSmashNotification = (pick) => {
  const preferences = JSON.parse(localStorage.getItem('pushPreferences') || '{}');

  if (!preferences.smashAlerts) return;

  const confidence = pick.confidence >= 85 ? 'SMASH' : 'HIGH';
  const title = `${confidence} Alert: ${pick.player || pick.team}`;
  const body = pick.player
    ? `${pick.player} ${pick.side} ${pick.line} ${pick.stat_type} (${pick.confidence}%)`
    : `${pick.team} ${pick.bet_type} (${pick.confidence}%)`;

  showLocalNotification(title, {
    body,
    tag: `smash-${pick.id || Date.now()}`,
    data: { url: '/smash-spots', pickId: pick.id },
    requireInteraction: confidence === 'SMASH',
    actions: [
      { action: 'view-pick', title: 'View Pick' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
};

export default {
  PushProvider,
  PushNotificationSettings,
  SmashAlertBell,
  usePush,
  showLocalNotification,
  triggerSmashNotification
};
