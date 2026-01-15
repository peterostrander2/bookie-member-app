/**
 * API RATE LIMITING
 *
 * Frontend throttling to prevent hitting backend rate limits.
 * Uses token bucket algorithm with request queuing.
 */

// Rate limit configuration per endpoint category
const RATE_LIMITS = {
  default: { maxRequests: 30, windowMs: 60000 }, // 30 req/min
  live: { maxRequests: 20, windowMs: 60000 },    // 20 req/min for /live/*
  heavy: { maxRequests: 5, windowMs: 60000 },    // 5 req/min for expensive ops
};

// Track requests per category
const requestCounts = new Map();
const requestQueues = new Map();

// Get category for an endpoint
function getCategory(url) {
  if (url.includes('/live/parlay/calculate') || url.includes('/live/betslip/generate')) {
    return 'heavy';
  }
  if (url.includes('/live/')) {
    return 'live';
  }
  return 'default';
}

// Get current request count for category
function getRequestCount(category) {
  const now = Date.now();
  const limit = RATE_LIMITS[category];
  const key = category;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }

  // Remove expired timestamps
  const timestamps = requestCounts.get(key).filter(t => now - t < limit.windowMs);
  requestCounts.set(key, timestamps);

  return timestamps.length;
}

// Record a request
function recordRequest(category) {
  const key = category;
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  requestCounts.get(key).push(Date.now());
}

// Check if request is allowed
function isAllowed(category) {
  const limit = RATE_LIMITS[category];
  const count = getRequestCount(category);
  return count < limit.maxRequests;
}

// Get time until next slot is available
function getWaitTime(category) {
  const limit = RATE_LIMITS[category];
  const timestamps = requestCounts.get(category) || [];

  if (timestamps.length < limit.maxRequests) {
    return 0;
  }

  const oldestRequest = Math.min(...timestamps);
  const waitTime = limit.windowMs - (Date.now() - oldestRequest);
  return Math.max(0, waitTime);
}

/**
 * Rate-limited fetch wrapper
 *
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {object} rateLimitOptions - Rate limit options
 * @param {boolean} rateLimitOptions.queue - Whether to queue if rate limited (default: true)
 * @param {number} rateLimitOptions.maxWait - Max time to wait in queue (default: 10000ms)
 * @returns {Promise<Response>}
 */
export async function rateLimitedFetch(url, options = {}, rateLimitOptions = {}) {
  const { queue = true, maxWait = 10000 } = rateLimitOptions;
  const category = getCategory(url);

  // If allowed, execute immediately
  if (isAllowed(category)) {
    recordRequest(category);
    return fetch(url, options);
  }

  // If queuing is disabled, throw error
  if (!queue) {
    const waitTime = getWaitTime(category);
    throw new RateLimitError(
      `Rate limit exceeded for ${category}. Try again in ${Math.ceil(waitTime / 1000)}s`,
      waitTime
    );
  }

  // Queue the request
  const waitTime = getWaitTime(category);

  if (waitTime > maxWait) {
    throw new RateLimitError(
      `Rate limit exceeded. Would need to wait ${Math.ceil(waitTime / 1000)}s`,
      waitTime
    );
  }

  // Wait and retry
  await sleep(waitTime);
  recordRequest(category);
  return fetch(url, options);
}

// Custom error for rate limiting
export class RateLimitError extends Error {
  constructor(message, waitTimeMs) {
    super(message);
    this.name = 'RateLimitError';
    this.waitTimeMs = waitTimeMs;
    this.retryAfter = Math.ceil(waitTimeMs / 1000);
  }
}

// Helper sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function for rapid user actions
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for continuous actions
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus() {
  const status = {};
  for (const category of Object.keys(RATE_LIMITS)) {
    const limit = RATE_LIMITS[category];
    const count = getRequestCount(category);
    status[category] = {
      used: count,
      limit: limit.maxRequests,
      remaining: limit.maxRequests - count,
      windowMs: limit.windowMs,
    };
  }
  return status;
}

/**
 * Reset rate limit counters (for testing)
 */
export function resetRateLimits() {
  requestCounts.clear();
  requestQueues.clear();
}

export default {
  rateLimitedFetch,
  RateLimitError,
  debounce,
  throttle,
  getRateLimitStatus,
  resetRateLimits,
};
