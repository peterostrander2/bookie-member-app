/**
 * AUTO-REFRESH HOOK
 *
 * Provides real-time data refresh functionality with:
 * - Configurable refresh intervals
 * - Automatic pause when tab not visible
 * - Manual refresh trigger
 * - Last updated timestamp tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Default refresh interval: 2 minutes
const DEFAULT_INTERVAL = 2 * 60 * 1000;

/**
 * Hook for auto-refreshing data with visibility detection
 *
 * @param {Function} fetchFunction - The async function to call for fetching data
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Refresh interval in ms (default: 2 minutes)
 * @param {boolean} options.enabled - Whether auto-refresh is enabled (default: true)
 * @param {boolean} options.immediate - Fetch immediately on mount (default: true)
 * @param {Array} options.deps - Dependencies that trigger re-fetch when changed
 *
 * @returns {Object} { lastUpdated, isRefreshing, refresh, setInterval, isPaused, togglePause }
 */
export const useAutoRefresh = (fetchFunction, options = {}) => {
  const {
    interval: initialInterval = DEFAULT_INTERVAL,
    enabled = true,
    immediate = true,
    deps = []
  } = options;

  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [interval, setIntervalState] = useState(initialInterval);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const intervalRef = useRef(null);
  const fetchRef = useRef(fetchFunction);

  // Keep fetch function ref updated
  useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await fetchRef.current();
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Refresh error:', err);
    }
    setIsRefreshing(false);
  }, [isRefreshing]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Set custom interval
  const setInterval = useCallback((newInterval) => {
    setIntervalState(newInterval);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      refresh();
    }
  }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || isPaused || !isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      refresh();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, isPaused, isVisible, interval, refresh]);

  return {
    lastUpdated,
    isRefreshing,
    refresh,
    setInterval,
    interval,
    isPaused,
    togglePause,
    isVisible
  };
};

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Never';

  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculate game status based on start time
 * @param {string|Date} gameTime - Game start time
 * @returns {Object} { status, label, color, animate }
 */
export const getGameStatus = (gameTime) => {
  if (!gameTime) return { status: 'unknown', label: 'TBD', color: '#6b7280', animate: false };

  const now = new Date();
  const start = new Date(gameTime);
  const diff = start - now;
  const minutesUntil = Math.floor(diff / (1000 * 60));
  const hoursUntil = Math.floor(minutesUntil / 60);

  // Game already started (assume 3 hours for typical game)
  if (diff < 0 && diff > -3 * 60 * 60 * 1000) {
    return {
      status: 'live',
      label: 'LIVE',
      color: '#00FF88',
      animate: true
    };
  }

  // Game ended (more than 3 hours ago)
  if (diff < -3 * 60 * 60 * 1000) {
    return {
      status: 'final',
      label: 'FINAL',
      color: '#6b7280',
      animate: false
    };
  }

  // Starting within 1 hour
  if (minutesUntil <= 60 && minutesUntil > 0) {
    return {
      status: 'soon',
      label: minutesUntil <= 15 ? `${minutesUntil}m` : `${minutesUntil}m`,
      color: '#FFD700',
      animate: minutesUntil <= 15
    };
  }

  // Starting later today
  if (hoursUntil < 12) {
    return {
      status: 'today',
      label: start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      color: '#00D4FF',
      animate: false
    };
  }

  // Future game
  return {
    status: 'scheduled',
    label: start.toLocaleDateString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
    color: '#9ca3af',
    animate: false
  };
};

export default useAutoRefresh;
