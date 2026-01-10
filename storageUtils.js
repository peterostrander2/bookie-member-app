/**
 * STORAGE UTILS
 *
 * Safe localStorage operations with quota handling and error recovery.
 */

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {*} Parsed value or default
 */
export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage with quota handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const safeSetItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn(`localStorage quota exceeded for key "${key}". Attempting cleanup...`);

      // Try to free up space
      if (attemptStorageCleanup(key)) {
        // Retry after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error(`Still unable to save "${key}" after cleanup:`, retryError);
          return false;
        }
      }
    }

    console.error(`Error saving to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Check if error is a quota exceeded error
 */
const isQuotaExceededError = (error) => {
  return (
    error instanceof DOMException &&
    (error.code === 22 || // Legacy
     error.code === 1014 || // Firefox
     error.name === 'QuotaExceededError' ||
     error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
};

/**
 * Attempt to free up localStorage space
 * @param {string} priorityKey - Key that needs space (won't be deleted)
 * @returns {boolean} Whether cleanup was successful
 */
const attemptStorageCleanup = (priorityKey) => {
  const keysToTrim = [
    'bookie_backtest_predictions',
    'bookie_bet_history',
    'bookie_clv_picks'
  ];

  let freedSpace = false;

  keysToTrim.forEach(key => {
    if (key === priorityKey) return;

    try {
      const data = safeGetItem(key, []);
      if (Array.isArray(data) && data.length > 100) {
        // Keep only last 100 items
        const trimmed = data.slice(-100);
        localStorage.setItem(key, JSON.stringify(trimmed));
        freedSpace = true;
        console.log(`Trimmed ${key} from ${data.length} to 100 items`);
      }
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  return freedSpace;
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Get current localStorage usage
 * @returns {Object} Usage statistics
 */
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    const breakdown = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      totalSize += size;
      breakdown[key] = size;
    }

    // Estimate max (usually 5-10MB)
    const estimatedMax = 5 * 1024 * 1024; // 5MB conservative estimate
    const percentUsed = (totalSize / estimatedMax) * 100;

    return {
      totalBytes: totalSize,
      totalMB: (totalSize / (1024 * 1024)).toFixed(2),
      percentUsed: percentUsed.toFixed(1),
      breakdown,
      warning: percentUsed > 80
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { totalBytes: 0, totalMB: '0', percentUsed: '0', breakdown: {}, warning: false };
  }
};

/**
 * Clear all Bookie-o-em data from localStorage
 * @returns {boolean} Success status
 */
export const clearAllBookieData = () => {
  const bookieKeys = [
    'bookie_clv_picks',
    'bookie_backtest_predictions',
    'bookie_signal_performance',
    'bookie_bankroll_settings',
    'bookie_bet_history',
    'bookie_notification_settings'
  ];

  try {
    bookieKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing Bookie data:', error);
    return false;
  }
};

export default {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  getStorageUsage,
  clearAllBookieData
};
