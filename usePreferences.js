/**
 * USER PREFERENCES HOOK
 *
 * Persists user preferences to localStorage with React state sync.
 * Preferences are also synced to backend if user is logged in.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

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
      // Merge with defaults to handle new preference keys
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e);
  }
  return DEFAULT_PREFERENCES;
}

// Save preferences to localStorage
function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

/**
 * Hook for managing user preferences
 *
 * @param {string} userId - Optional user ID for backend sync
 * @returns {Object} - { preferences, updatePreference, updatePreferences, resetPreferences }
 */
export function usePreferences(userId = null) {
  const [preferences, setPreferences] = useState(loadPreferences);

  // Load from backend if userId provided
  useEffect(() => {
    if (userId) {
      api.getUserPreferences(userId).then(backendPrefs => {
        if (Object.keys(backendPrefs).length > 0) {
          const merged = { ...DEFAULT_PREFERENCES, ...backendPrefs };
          setPreferences(merged);
          savePreferences(merged);
        }
      }).catch(() => {
        // Silently fail - use local preferences
      });
    }
  }, [userId]);

  // Update a single preference
  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated);

      // Sync to backend if user logged in
      if (userId) {
        api.setUserPreferences(userId, updated).catch(() => {});
      }

      return updated;
    });
  }, [userId]);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);

      if (userId) {
        api.setUserPreferences(userId, updated).catch(() => {});
      }

      return updated;
    });
  }, [userId]);

  // Update nested preference (e.g., notifications.smashAlerts)
  const updateNestedPreference = useCallback((path, value) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      savePreferences(updated);

      if (userId) {
        api.setUserPreferences(userId, updated).catch(() => {});
      }

      return updated;
    });
  }, [userId]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);

    if (userId) {
      api.setUserPreferences(userId, DEFAULT_PREFERENCES).catch(() => {});
    }
  }, [userId]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    updateNestedPreference,
    resetPreferences,
    DEFAULT_PREFERENCES,
  };
}

// Quick access hook for favorite sport only
export function useFavoriteSport() {
  const { preferences, updatePreference } = usePreferences();

  return {
    favoriteSport: preferences.favoriteSport,
    setFavoriteSport: (sport) => updatePreference('favoriteSport', sport),
  };
}

export default usePreferences;
