import React from 'react';

// Toast types and their styles (mirrored from Toast.jsx for Storybook)
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

// Standalone Toast component for Storybook
const Toast = ({ message, type = 'info', onClose }) => {
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
        minWidth: '280px',
        maxWidth: '400px'
      }}
    >
      <span style={{ fontSize: '18px' }} aria-hidden="true">{style.icon}</span>
      <span style={{ flex: 1, color: '#fff' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
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
      )}
    </div>
  );
};

export default {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'The type/severity of the toast notification',
    },
    message: {
      control: 'text',
      description: 'The message to display',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when close button is clicked',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Toast notifications for user feedback. Use ToastProvider in your app to manage toasts.',
      },
    },
  },
};

export const Success = {
  args: {
    message: 'Bet placed successfully!',
    type: 'success',
  },
};

export const Error = {
  args: {
    message: 'Failed to place bet. Please try again.',
    type: 'error',
  },
};

export const Warning = {
  args: {
    message: 'Odds have changed since you added this pick.',
    type: 'warning',
  },
};

export const Info = {
  args: {
    message: 'New SMASH pick available for NBA.',
    type: 'info',
  },
};

export const LongMessage = {
  args: {
    message: 'Your parlay has been submitted. Check your bet history to track results and grade outcomes.',
    type: 'success',
  },
};

export const WithoutCloseButton = {
  render: () => (
    <Toast message="Auto-dismissing notification" type="info" />
  ),
};

// All types comparison
export const AllTypes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Toast message="Success: Bet placed!" type="success" onClose={() => {}} />
      <Toast message="Error: Connection failed" type="error" onClose={() => {}} />
      <Toast message="Warning: Line moved" type="warning" onClose={() => {}} />
      <Toast message="Info: New picks available" type="info" onClose={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'All toast types side by side for comparison.' },
    },
  },
};

// Positioned example
export const PositionedStack = {
  render: () => (
    <div style={{ position: 'relative', height: '200px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <Toast message="First notification" type="info" onClose={() => {}} />
        <Toast message="Second notification" type="success" onClose={() => {}} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Toasts stack vertically in the top-right corner.' },
    },
  },
};
