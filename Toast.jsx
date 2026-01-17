import React, { createContext, useContext, useState, useCallback } from 'react';

// Toast Context
const ToastContext = createContext(null);

// Toast types and their styles
const toastStyles = {
  success: {
    backgroundColor: '#00FF8820',
    borderColor: '#00FF8840',
    color: '#00FF88',
    icon: '✓'
  },
  error: {
    backgroundColor: '#FF444420',
    borderColor: '#FF444440',
    color: '#FF4444',
    icon: '✕'
  },
  warning: {
    backgroundColor: '#FFD70020',
    borderColor: '#FFD70040',
    color: '#FFD700',
    icon: '⚠'
  },
  info: {
    backgroundColor: '#00D4FF20',
    borderColor: '#00D4FF40',
    color: '#00D4FF',
    icon: 'ℹ'
  }
};

// Individual Toast component
const Toast = ({ id, message, type = 'info', onClose }) => {
  const style = toastStyles[type] || toastStyles.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: style.backgroundColor,
        border: `1px solid ${style.borderColor}`,
        borderRadius: '8px',
        color: style.color,
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '280px',
        maxWidth: '400px'
      }}
    >
      <span style={{ fontSize: '18px' }} aria-hidden="true">{style.icon}</span>
      <span style={{ flex: 1, color: '#fff' }}>{message}</span>
      <button
        onClick={() => onClose(id)}
        type="button"
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px'
        }}
      >
        ×
      </button>
    </div>
  );
};

// Toast Container component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience methods
  const toast = {
    show: addToast,
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;
