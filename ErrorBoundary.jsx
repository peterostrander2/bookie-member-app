import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * and displays a fallback UI instead of crashing
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to a monitoring service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          margin: '20px',
          border: '1px solid #FF444440'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {this.props.icon || '⚠️'}
          </div>
          <h2 style={{ color: '#FF4444', margin: '0 0 12px', fontSize: '20px' }}>
            {this.props.title || 'Something went wrong'}
          </h2>
          <p style={{ color: '#9ca3af', margin: '0 0 20px', fontSize: '14px' }}>
            {this.props.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              backgroundColor: '#12121f',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <summary style={{ color: '#6b7280', cursor: 'pointer', marginBottom: '10px' }}>
                Error Details
              </summary>
              <pre style={{
                color: '#FF6B6B',
                fontSize: '12px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

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
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Message Component
 * Reusable component for displaying errors with retry option
 */
export const ErrorMessage = ({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
  icon = '⚠️',
  retryText = 'Try Again'
}) => (
  <div style={{
    padding: '30px 20px',
    textAlign: 'center',
    backgroundColor: '#FF444410',
    borderRadius: '12px',
    border: '1px solid #FF444430'
  }}>
    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
    <h3 style={{ color: '#FF4444', margin: '0 0 8px', fontSize: '16px' }}>{title}</h3>
    <p style={{ color: '#9ca3af', margin: '0 0 16px', fontSize: '13px' }}>{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FF4444',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px'
        }}
      >
        {retryText}
      </button>
    )}
  </div>
);

/**
 * Connection Error Component
 * Specific component for API connection failures
 */
export const ConnectionError = ({
  onRetry,
  serviceName = 'server'
}) => (
  <div style={{
    padding: '30px 20px',
    textAlign: 'center',
    backgroundColor: '#FF444410',
    borderRadius: '12px',
    border: '1px solid #FF444430'
  }}>
    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📡</div>
    <h3 style={{ color: '#FF4444', margin: '0 0 8px', fontSize: '16px' }}>
      Connection Error
    </h3>
    <p style={{ color: '#9ca3af', margin: '0 0 16px', fontSize: '13px' }}>
      Unable to connect to {serviceName}. Please check your connection and try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '10px 20px',
          backgroundColor: '#00D4FF',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>🔄</span> Retry Connection
      </button>
    )}
  </div>
);

/**
 * Empty State Component
 * For when data loads successfully but is empty
 */
export const EmptyState = ({
  title = 'No Data',
  message = 'No data available at this time',
  icon = '📭',
  action,
  actionText
}) => (
  <div style={{
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    border: '1px solid #333'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>{icon}</div>
    <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '18px' }}>{title}</h3>
    <p style={{ color: '#6b7280', margin: '0 0 16px', fontSize: '14px' }}>{message}</p>
    {action && (
      <button
        onClick={action}
        style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        {actionText || 'Refresh'}
      </button>
    )}
  </div>
);

/**
 * useApiCall Hook
 * Custom hook for API calls with automatic error handling and retry
 */
export const useApiCall = (apiFunction, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;

  const execute = React.useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      console.error('API call failed:', err);

      // Automatic retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          execute(...args);
        }, delay);
      } else {
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retryCount, maxRetries, retryDelay]);

  const retry = React.useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return { data, loading, error, execute, retry };
};

export default ErrorBoundary;
