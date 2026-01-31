/**
 * INTEGRATION CONTRACT - Frontend API Configuration
 * Defines backend endpoints, env vars, and expected responses
 */

export const ENV = Object.freeze({
  API_BASE: "VITE_API_BASE_URL",
  API_KEY: "VITE_BOOKIE_API_KEY",
});

export const DEFAULTS = Object.freeze({
  API_BASE: "https://web-production-7b2a.up.railway.app",
});

// Required backend endpoints
export const ENDPOINTS = Object.freeze([
  { key: "health", method: "GET", path: "/health", required: true },
  { key: "integrations", method: "GET", path: "/live/debug/integrations", required: true },
  { key: "scheduler", method: "GET", path: "/live/scheduler/status", required: true },
  { key: "best_bets_nba", method: "GET", path: "/live/best-bets/nba", required: true },
  { key: "best_bets_nhl", method: "GET", path: "/live/best-bets/nhl", required: false },
  { key: "best_bets_nfl", method: "GET", path: "/live/best-bets/nfl", required: false },
  { key: "best_bets_mlb", method: "GET", path: "/live/best-bets/mlb", required: false },
  { key: "grader_status", method: "GET", path: "/live/grader/status", required: true },
  { key: "storage_health", method: "GET", path: "/internal/storage/health", required: true },
]);

export const INTEGRATION_CONTRACT = {
  env: ENV,
  defaults: DEFAULTS,
  endpoints: ENDPOINTS,
};
