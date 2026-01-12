/**
 * ERROR BOUNDARY
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the whole app.
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    // Could send to error tracking service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#0a0a0f',
          minHeight: this.props.fullPage ? '100vh' : '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #FF444440'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '25px', fontSize: '14px' }}>
              {this.props.message || "We encountered an unexpected error. Don't worry, your data is safe."}
            </p>

            {/* Error details (collapsible in production) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <summary style={{ color: '#FF4444', cursor: 'pointer', marginBottom: '10px' }}>
                  Error Details
                </summary>
                <pre style={{
                  color: '#FF6B6B',
                  fontSize: '11px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#00D4FF',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1a1a2e',
                  color: '#9ca3af',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export const withErrorBoundary = (Component, props = {}) => {
  return function WrappedComponent(componentProps) {
    return (
      <ErrorBoundary {...props}>
        <Component {...componentProps} />
      </ErrorBoundary>
    );
  };
};

// Simple inline error display for smaller components
export const InlineError = ({ message = 'Failed to load', onRetry }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#FF444415',
    borderRadius: '8px',
    border: '1px solid #FF444440',
    textAlign: 'center'
  }}>
    <div style={{ color: '#FF4444', marginBottom: '10px', fontSize: '14px' }}>
      ⚠️ {message}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '6px 16px',
          backgroundColor: '#FF444430',
          color: '#FF4444',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

// Empty state component
export const EmptyState = ({
  icon = '📭',
  title = 'No data',
  message = 'Nothing to display yet',
  action,
  actionLabel = 'Refresh'
}) => (
  <div style={{
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '18px' }}>{title}</h3>
    <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>{message}</p>
    {action && (
      <button
        onClick={action}
        style={{
          padding: '10px 20px',
          backgroundColor: '#00D4FF20',
          color: '#00D4FF',
          border: '1px solid #00D4FF40',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Offline indicator
export const OfflineIndicator = () => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#FF4444',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 20px rgba(255, 68, 68, 0.3)',
    zIndex: 9999
  }}>
    <span style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      animation: 'pulse 1s infinite'
    }} />
    You're offline
  </div>
);

export default ErrorBoundary;
