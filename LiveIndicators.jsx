/**
 * LIVE INDICATORS & TIMESTAMP COMPONENTS
 *
 * Real-time status badges and last updated displays
 */

import React, { useState, useEffect } from 'react';
import { formatRelativeTime, getGameStatus } from './useAutoRefresh';

// CSS keyframes as inline style (injected once)
const pulseKeyframes = `
@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('live-indicator-styles')) {
  const style = document.createElement('style');
  style.id = 'live-indicator-styles';
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

/**
 * Last Updated Timestamp Display
 */
export const LastUpdated = ({
  timestamp,
  isRefreshing,
  onRefresh,
  isPaused,
  onTogglePause,
  showControls = true,
  compact = false
}) => {
  const [displayTime, setDisplayTime] = useState(formatRelativeTime(timestamp));

  // Update display every 10 seconds
  useEffect(() => {
    setDisplayTime(formatRelativeTime(timestamp));
    const interval = setInterval(() => {
      setDisplayTime(formatRelativeTime(timestamp));
    }, 10000);
    return () => clearInterval(interval);
  }, [timestamp]);

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        <span>Updated {displayTime}</span>
        {showControls && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              background: 'none',
              border: 'none',
              color: isRefreshing ? '#4b5563' : '#00D4FF',
              cursor: isRefreshing ? 'default' : 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Refresh now"
          >
            <span style={{
              display: 'inline-block',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              ↻
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      backgroundColor: '#1a1a2e',
      borderRadius: '8px',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
        <span style={{ color: '#6b7280' }}>Last updated:</span>
        <span style={{ color: '#fff' }}>{displayTime}</span>
      </div>

      {showControls && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              style={{
                background: 'none',
                border: '1px solid #333',
                color: isPaused ? '#FFD700' : '#6b7280',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
            >
              {isPaused ? '▶' : '⏸'} {isPaused ? 'Paused' : 'Auto'}
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                background: isRefreshing ? '#1a1a2e' : '#00D4FF20',
                border: '1px solid #00D4FF40',
                color: '#00D4FF',
                cursor: isRefreshing ? 'default' : 'pointer',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isRefreshing ? 0.6 : 1
              }}
              title="Refresh now"
            >
              <span style={{
                display: 'inline-block',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }}>
                ↻
              </span>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Live Game Status Badge
 */
export const LiveBadge = ({ gameTime, size = 'normal' }) => {
  const [status, setStatus] = useState(getGameStatus(gameTime));

  // Update status every 30 seconds
  useEffect(() => {
    setStatus(getGameStatus(gameTime));
    const interval = setInterval(() => {
      setStatus(getGameStatus(gameTime));
    }, 30000);
    return () => clearInterval(interval);
  }, [gameTime]);

  const sizes = {
    small: { padding: '2px 6px', fontSize: '9px', dotSize: '6px' },
    normal: { padding: '3px 8px', fontSize: '10px', dotSize: '8px' },
    large: { padding: '4px 12px', fontSize: '12px', dotSize: '10px' }
  };

  const s = sizes[size] || sizes.normal;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: status.color + '20',
      color: status.color,
      padding: s.padding,
      borderRadius: '12px',
      fontSize: s.fontSize,
      fontWeight: 'bold',
      border: `1px solid ${status.color}40`
    }}>
      {status.status === 'live' && (
        <span style={{
          width: s.dotSize,
          height: s.dotSize,
          backgroundColor: status.color,
          borderRadius: '50%',
          animation: status.animate ? 'pulse-dot 1.5s ease-in-out infinite' : 'none'
        }} />
      )}
      {status.status === 'soon' && '⏰'}
      {status.label}
    </div>
  );
};

/**
 * New Data Indicator (pulses when new data arrives)
 */
export const NewDataIndicator = ({ isNew, children }) => {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (isNew) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div style={{
      position: 'relative',
      animation: showPulse ? 'pulse-live 0.5s ease-in-out 3' : 'none'
    }}>
      {showPulse && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#00FF88',
          borderRadius: '50%',
          animation: 'pulse-dot 1s ease-in-out infinite'
        }} />
      )}
      {children}
    </div>
  );
};

/**
 * Refresh Interval Selector
 */
export const RefreshIntervalSelector = ({ interval, onChange, options }) => {
  const defaultOptions = [
    { value: 60000, label: '1 min' },
    { value: 120000, label: '2 min' },
    { value: 300000, label: '5 min' },
    { value: 600000, label: '10 min' }
  ];

  const opts = options || defaultOptions;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px'
    }}>
      <span style={{ color: '#6b7280' }}>Refresh:</span>
      <select
        value={interval}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          backgroundColor: '#1a1a2e',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        {opts.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Connection Status Indicator
 */
export const ConnectionStatus = ({ isOnline, lastUpdated }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px'
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isOnline ? '#00FF88' : '#FF4444',
        animation: isOnline ? 'none' : 'pulse-dot 1s ease-in-out infinite'
      }} />
      <span style={{ color: isOnline ? '#00FF88' : '#FF4444' }}>
        {isOnline ? 'Connected' : 'Offline'}
      </span>
      {!isOnline && lastUpdated && (
        <span style={{ color: '#6b7280' }}>
          (last sync: {formatRelativeTime(lastUpdated)})
        </span>
      )}
    </div>
  );
};

export default {
  LastUpdated,
  LiveBadge,
  NewDataIndicator,
  RefreshIntervalSelector,
  ConnectionStatus
};
