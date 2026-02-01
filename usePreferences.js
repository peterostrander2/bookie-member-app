/**
 * USER PREFERENCES HOOK
 *
 * Persists user preferences to localStorage with React state sync.
 * Preferences are also synced to backend if user is logged in.
 */

import { useState, useEffect, useCallback } from 'react';
import api from './api';

const STORAGE_KEY = 'bookie_user_preferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  favoriteSport: 'NBA',
  defaultTab: 'props', // 'props' or 'games' on Smash Spots
  showConfidenceScores: true,
  showEsotericSignals: true,
  betSlipPosition: 'right', // 'left' or 'right'
  notifications: {
    smashAlerts: true,
    sharpMoney: true,
    lineMovement: false,
  },
  display: {
    compactMode: false,
    showOddsAs: 'american', // 'american', 'decimal', 'fractional'
  },
};

// Get preferences from localStorage
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    // Silent fail
  }
  return DEFAULT_PREFERENCES;
}

// Save preferences to localStorage
function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    // Silent fail
  }
}

/**
 * Hook for managing user preferences
 */
export function usePreferences(userId = null) {
  const [prefs, setPrefs] = useState(loadPreferences);
  const [loading, setLoading] = useState(false);

  // Load from backend if userId provided
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    api.getUserPreferences?.(userId)
      .then(backendPrefs => {
        if (backendPrefs && Object.keys(backendPrefs).length > 0) {
          const merged = { ...DEFAULT_PREFERENCES, ...backendPrefs };
          setPrefs(merged);
          savePreferences(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // Update a single preference
  const updatePref = useCallback((key, value) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated);
      if (userId) api.setUserPreferences?.(userId, updated).catch(() => {});
      return updated;
    });
  }, [userId]);

  // Update multiple preferences at once
  const updatePrefs = useCallback((updates) => {
    setPrefs(prev => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);
      if (userId) api.setUserPreferences?.(userId, updated).catch(() => {});
      return updated;
    });
  }, [userId]);

  // Update nested preference (e.g., notifications.smashAlerts)
  const updateNestedPref = useCallback((path, value) => {
    setPrefs(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      savePreferences(updated);
      if (userId) api.setUserPreferences?.(userId, updated).catch(() => {});
      return updated;
    });
  }, [userId]);

  // Reset to defaults
  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
    if (userId) api.setUserPreferences?.(userId, DEFAULT_PREFERENCES).catch(() => {});
  }, [userId]);

  return {
    prefs,
    loading,
    updatePref,
    updatePrefs,
    updateNestedPref,
    reset,
    // Backward compatibility aliases
    preferences: prefs,
    updatePreference: updatePref,
    updatePreferences: updatePrefs,
    updateNestedPreference: updateNestedPref,
    resetPreferences: reset,
    DEFAULT_PREFERENCES,
  };
}

// Quick access hook for favorite sport only
export function useFavoriteSport() {
  const { prefs, updatePref } = usePreferences();

  return {
    favoriteSport: prefs.favoriteSport,
    setFavoriteSport: (sport) => updatePref('favoriteSport', sport),
  };
}

export default usePreferences;
