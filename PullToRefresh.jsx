/**
 * PULL TO REFRESH
 *
 * Mobile-friendly pull-to-refresh gesture handler.
 * Works with PWA for native-like refresh behavior.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD = 80; // Pull distance to trigger refresh
const MAX_PULL = 120; // Maximum pull distance

export const PullToRefresh = ({ onRefresh, children, disabled = false }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (disabled || isRefreshing) return;

    // Only start if at top of scroll
    const scrollTop = containerRef.current?.scrollTop || window.scrollY;
    if (scrollTop > 0) return;

    // Guard against edge case where touches array is empty
    if (!e.touches || e.touches.length === 0) return;

    startYRef.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || disabled || isRefreshing) return;

    // Guard against edge case where touches array is empty
    if (!e.touches || e.touches.length === 0) return;

    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;

    if (diff > 0) {
      // Apply resistance to pull
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, MAX_PULL);
      setPullDistance(distance);

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= THRESHOLD && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (e) {
        console.error('Refresh failed:', e);
      }
      setIsRefreshing(false);
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh]);

  // Add touch listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100%',
        touchAction: isPulling ? 'none' : 'auto'
      }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          overflow: 'hidden',
          transition: isPulling ? 'none' : 'height 0.2s ease',
          zIndex: 10
        }}
      >
        {showIndicator && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: progress
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid #333',
              borderTopColor: '#00D4FF',
              borderRadius: '50%',
              animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              transform: `rotate(${progress * 360}deg)`
            }} />
            <span style={{
              color: '#6b7280',
              fontSize: '12px'
            }}>
              {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.2s ease'
      }}>
        {children}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Hook for easier use
export const usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return { isRefreshing, refresh };
};

// Simple refresh button for non-touch devices
export const RefreshButton = ({ onRefresh, isRefreshing = false }) => (
  <button
    onClick={onRefresh}
    disabled={isRefreshing}
    style={{
      padding: '8px 16px',
      backgroundColor: '#00D4FF20',
      color: '#00D4FF',
      border: '1px solid #00D4FF40',
      borderRadius: '8px',
      cursor: isRefreshing ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: isRefreshing ? 0.6 : 1
    }}
  >
    <span style={{
      display: 'inline-block',
      animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
    }}>
      🔄
    </span>
    {isRefreshing ? 'Refreshing...' : 'Refresh'}
  </button>
);

export default PullToRefresh;
