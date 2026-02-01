/**
 * CENTRALIZED API CLIENT - Single Source of Truth for Backend Requests
 *
 * ALL backend requests MUST go through this client.
 * DO NOT use fetch() directly or hardcode URLs elsewhere.
 *
 * Configuration comes from core/integration_contract.js
 */

import { ENV, DEFAULTS } from '../../core/integration_contract.js';
import { rateLimitedFetch, RateLimitError } from '../../rateLimit.js';

// =============================================================================
// AUTH STATE (fail-fast on missing/invalid API key)
// =============================================================================

let authInvalid = false;
const authListeners = new Set();

export const isAuthInvalid = () => authInvalid;

export const onAuthInvalid = (callback) => {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
};

const setAuthInvalid = () => {
  if (authInvalid) return; // Already flagged
  authInvalid = true;
  authListeners.forEach(cb => cb());
};

// =============================================================================
// CONFIGURATION (from contract)
// =============================================================================

/**
 * Get the API base URL from environment or contract default.
 * NEVER hardcode URLs - always use this function.
 */
export const getBaseUrl = () => {
  return import.meta.env[ENV.API_BASE] || DEFAULTS.API_BASE;
};

/**
 * Get the API key from environment.
 */
export const getApiKey = () => {
  return import.meta.env[ENV.API_KEY] || '';
};

// =============================================================================
// FETCH HELPERS
// =============================================================================

/**
 * Core fetch wrapper with optional rate limiting.
 * Rate limiting disabled when VITE_RATE_LIMIT=false
 */
export const apiFetch = async (url, options = {}) => {
  const rateLimitEnabled = import.meta.env.VITE_RATE_LIMIT !== 'false';
  if (rateLimitEnabled) {
    return rateLimitedFetch(url, options);
  }
  return fetch(url, options);
};

/**
 * Authenticated GET request.
 * Automatically adds X-API-Key header if configured.
 */
export const authFetch = async (url) => {
  const apiKey = getApiKey();
  const hasApiKey = Boolean(apiKey);
  if (!hasApiKey) {
    const missingText = `Missing ${ENV.API_KEY}`;
    console.error("[API] authFetch blocked - missing API key", { url });
    setAuthInvalid();
    return new Response(missingText, { status: 400 });
  }

  const headers = { 'X-API-Key': apiKey };

  console.info("[API] authFetch", { url, hasApiKey });

  // Fail-fast if auth already invalid
  if (authInvalid) {
    return new Response('Auth invalid', { status: 403 });
  }

  const response = await apiFetch(url, { headers });
  if (!response.ok) {
    const text = await response.clone().text();
    console.error("[API] response error", {
      url,
      status: response.status,
      body: text.slice(0, 200),
    });
    // Flag auth invalid on 400/401/403 - stop all future requests
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      setAuthInvalid();
    }
  }
  return response;
};

/**
 * Get headers for authenticated POST/PUT requests.
 */
export const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error(`Missing ${ENV.API_KEY}`);
    error.status = 400;
    setAuthInvalid();
    throw error;
  }
  headers['X-API-Key'] = apiKey;
  return headers;
};

// =============================================================================
// URL BUILDERS
// =============================================================================

/**
 * Build a full API URL from a path.
 * @param {string} path - API path (e.g., '/health', '/live/best-bets/nba')
 * @returns {string} Full URL
 */
export const buildUrl = (path) => {
  const base = getBaseUrl();
  // Ensure no double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

/**
 * Build URL with query parameters.
 * @param {string} path - API path
 * @param {Record<string, string>} params - Query parameters
 * @returns {string} Full URL with query string
 */
export const buildUrlWithParams = (path, params = {}) => {
  const url = buildUrl(path);
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// =============================================================================
// REQUEST METHODS
// =============================================================================

/**
 * GET request (public endpoint).
 */
export const get = async (path) => {
  const url = buildUrl(path);
  const response = await apiFetch(url);
  return response.json();
};

/**
 * GET request (authenticated endpoint).
 */
export const authGet = async (path) => {
  const url = buildUrl(path);
  const response = await authFetch(url);
  return response.json();
};

/**
 * POST request (authenticated).
 */
export const authPost = async (path, body) => {
  const url = buildUrl(path);
  const response = await apiFetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.clone().text();
    console.error("[API] response error", {
      url,
      status: response.status,
      body: text.slice(0, 200),
    });
  }
  return response.json();
};

/**
 * DELETE request (authenticated).
 */
export const authDelete = async (path) => {
  const url = buildUrl(path);
  const response = await apiFetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const text = await response.clone().text();
    console.error("[API] response error", {
      url,
      status: response.status,
      body: text.slice(0, 200),
    });
  }
  return response.json();
};

// =============================================================================
// EXPORTS
// =============================================================================

export { RateLimitError };

// Default export for convenience
export default {
  getBaseUrl,
  getApiKey,
  apiFetch,
  authFetch,
  getAuthHeaders,
  buildUrl,
  buildUrlWithParams,
  get,
  authGet,
  authPost,
  authDelete,
  RateLimitError,
  isAuthInvalid,
  onAuthInvalid,
};
