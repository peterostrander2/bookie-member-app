import * as Sentry from '@sentry/react';

// Initialize Sentry for production error monitoring
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize if DSN is configured
  if (!dsn) {
    console.log('Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'development' or 'production'

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Only send errors in production
    enabled: import.meta.env.PROD,

    // Filter out common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      'Load failed',
      'ChunkLoadError',
    ],

    // Add context to errors
    beforeSend(event) {
      // Don't send errors in development
      if (import.meta.env.DEV) {
        console.error('Sentry would send:', event);
        return null;
      }
      return event;
    },
  });
}

// Export Sentry for manual error capture
export { Sentry };

// Helper to capture errors with context
export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper to set user context (after login)
export function setUser(userId, email) {
  Sentry.setUser({ id: userId, email });
}

// Helper to clear user context (on logout)
export function clearUser() {
  Sentry.setUser(null);
}
