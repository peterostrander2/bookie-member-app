import React, { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { getBaseUrl } from '../lib/api/client';

/**
 * StreamingUpdater - SSE client for real-time updates
 *
 * Connects to /live/stream/status for server-sent events.
 * Provides real-time updates for:
 * - Pick score changes
 * - Line movement alerts
 * - Live game updates
 * - SMASH spot triggers
 *
 * Falls back to polling if SSE is not available.
 */

const API_BASE_URL = getBaseUrl();
const SSE_ENDPOINT = `${API_BASE_URL}/live/stream/status`;
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

// SSE Event Types from backend
const EVENT_TYPES = {
  PICK_UPDATE: 'pick_update',
  LINE_MOVEMENT: 'line_movement',
  LIVE_SCORE: 'live_score',
  SMASH_ALERT: 'smash_alert',
  STATUS: 'status',
  HEARTBEAT: 'heartbeat',
};

// Context
const StreamingContext = createContext(null);

export const useStreaming = () => {
  const context = useContext(StreamingContext);
  if (!context) {
    return {
      isConnected: false,
      isSupported: false,
      lastEvent: null,
      events: [],
      connect: () => {},
      disconnect: () => {},
    };
  }
  return context;
};

// Streaming status badge component
export const StreamingStatusBadge = () => {
  const { isConnected, isSupported } = useStreaming();

  if (!isSupported) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgba(107, 114, 128, 0.15)',
        fontSize: '9px',
        color: '#6B7280',
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#6B7280',
        }} />
        Polling
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
      fontSize: '9px',
      color: isConnected ? '#10B981' : '#F59E0B',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: isConnected ? '#10B981' : '#F59E0B',
        animation: isConnected ? 'pulse 2s infinite' : 'none',
      }} />
      {isConnected ? 'Live' : 'Connecting...'}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Live update indicator for pick cards
export const LiveUpdateIndicator = ({ pickId, lastUpdate }) => {
  const { events } = useStreaming();

  // Check if this pick has recent updates
  const recentUpdate = events.find(e =>
    e.type === EVENT_TYPES.PICK_UPDATE &&
    e.data?.pick_id === pickId &&
    Date.now() - e.timestamp < 60000 // Within last minute
  );

  if (!recentUpdate) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
      fontSize: '9px',
      color: '#00D4FF',
      animation: 'fadeIn 0.3s ease-in',
    }}>
      <span style={{ fontSize: '8px' }}>⚡</span>
      Updated
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Provider component
export const StreamingProvider = ({ children, enabled = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Check if SSE is supported
  useEffect(() => {
    setIsSupported(typeof EventSource !== 'undefined');
  }, []);

  // Clean up events older than 5 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - 5 * 60 * 1000;
      setEvents(prev => prev.filter(e => e.timestamp > cutoff));
    }, 60000);
    return () => clearInterval(cleanup);
  }, []);

  const handleEvent = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      const eventObj = {
        type: event.type || data.type || EVENT_TYPES.STATUS,
        data,
        timestamp: Date.now(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setLastEvent(eventObj);
      setEvents(prev => [...prev.slice(-99), eventObj]); // Keep last 100 events

      // Log significant events in development
      if (import.meta.env.DEV) {
        if (eventObj.type !== EVENT_TYPES.HEARTBEAT) {
          console.log('[SSE]', eventObj.type, eventObj.data);
        }
      }
    } catch (err) {
      console.error('[SSE] Failed to parse event:', err);
    }
  }, []);

  const connect = useCallback(() => {
    if (!isSupported || !enabled) return;
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const apiKey = import.meta.env.VITE_BOOKIE_API_KEY;
      const url = apiKey ? `${SSE_ENDPOINT}?api_key=${apiKey}` : SSE_ENDPOINT;

      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionAttempts(0);
        if (import.meta.env.DEV) {
          console.log('[SSE] Connected to streaming endpoint');
        }
      };

      eventSourceRef.current.onmessage = handleEvent;

      // Listen for specific event types
      Object.values(EVENT_TYPES).forEach(eventType => {
        eventSourceRef.current.addEventListener(eventType, handleEvent);
      });

      eventSourceRef.current.onerror = (err) => {
        console.error('[SSE] Connection error:', err);
        setIsConnected(false);

        // Attempt reconnection with backoff
        if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, connectionAttempts);
          if (import.meta.env.DEV) {
            console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${connectionAttempts + 1})`);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else {
          if (import.meta.env.DEV) {
            console.log('[SSE] Max reconnection attempts reached, falling back to polling');
          }
        }
      };
    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err);
      setIsSupported(false);
    }
  }, [isSupported, enabled, handleEvent, connectionAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && isSupported) {
      connect();
    }
    return disconnect;
  }, [enabled, isSupported, connect, disconnect]);

  // Disconnect when page is hidden, reconnect when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnect();
      } else if (enabled && isSupported) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, isSupported, connect, disconnect]);

  const value = {
    isConnected,
    isSupported,
    lastEvent,
    events,
    connect,
    disconnect,
  };

  return (
    <StreamingContext.Provider value={value}>
      {children}
    </StreamingContext.Provider>
  );
};

// Hook for subscribing to specific event types
export const useStreamingEvents = (eventType, callback) => {
  const { events } = useStreaming();
  const callbackRef = useRef(callback);
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const newEvents = events.filter(e =>
      e.type === eventType &&
      e.timestamp > lastProcessedRef.current
    );

    if (newEvents.length > 0) {
      newEvents.forEach(event => callbackRef.current(event));
      lastProcessedRef.current = newEvents[newEvents.length - 1].timestamp;
    }
  }, [events, eventType]);
};

// Hook for getting picks with live updates
export const usePicksWithLiveUpdates = (picks) => {
  const { events } = useStreaming();
  const [updatedPicks, setUpdatedPicks] = useState(picks);

  useEffect(() => {
    setUpdatedPicks(picks);
  }, [picks]);

  useEffect(() => {
    const pickUpdates = events.filter(e =>
      e.type === EVENT_TYPES.PICK_UPDATE &&
      Date.now() - e.timestamp < 60000
    );

    if (pickUpdates.length === 0) return;

    setUpdatedPicks(currentPicks => {
      let updated = false;
      const newPicks = currentPicks.map(pick => {
        const updateEvent = pickUpdates.find(e =>
          e.data?.pick_id === pick.pick_id ||
          e.data?.pick_id === pick.id
        );

        if (updateEvent) {
          updated = true;
          return {
            ...pick,
            ...updateEvent.data,
            _lastUpdate: updateEvent.timestamp,
          };
        }
        return pick;
      });

      return updated ? newPicks : currentPicks;
    });
  }, [events]);

  return updatedPicks;
};

export default StreamingProvider;
