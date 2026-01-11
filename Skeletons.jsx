import React from 'react';

/**
 * Base Skeleton Component
 * Animated placeholder with shimmer effect
 */
const SkeletonBase = ({ width, height, borderRadius = '4px', style = {} }) => (
  <div
    style={{
      width: width || '100%',
      height: height || '16px',
      borderRadius,
      backgroundColor: '#2a2a3e',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        animation: 'shimmer 1.5s infinite'
      }}
    />
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

/**
 * Card Skeleton
 * For dashboard cards and game cards
 */
export const CardSkeleton = ({ count = 1 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333',
          marginBottom: '15px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <SkeletonBase width="120px" height="20px" borderRadius="4px" />
          <SkeletonBase width="60px" height="20px" borderRadius="4px" />
        </div>
        <SkeletonBase width="80%" height="14px" style={{ marginBottom: '10px' }} />
        <SkeletonBase width="60%" height="14px" style={{ marginBottom: '15px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <SkeletonBase width="80px" height="32px" borderRadius="6px" />
          <SkeletonBase width="80px" height="32px" borderRadius="6px" />
          <SkeletonBase width="80px" height="32px" borderRadius="6px" />
        </div>
      </div>
    ))}
  </>
);

/**
 * Game Card Skeleton
 * Specific layout for game/matchup cards
 */
export const GameCardSkeleton = ({ count = 1 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333',
          marginBottom: '15px'
        }}
      >
        {/* Teams */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonBase width="40px" height="40px" borderRadius="50%" />
            <SkeletonBase width="100px" height="18px" />
          </div>
          <SkeletonBase width="40px" height="24px" borderRadius="4px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonBase width="100px" height="18px" />
            <SkeletonBase width="40px" height="40px" borderRadius="50%" />
          </div>
        </div>

        {/* Odds Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '15px' }}>
          <SkeletonBase width="100%" height="45px" borderRadius="8px" />
          <SkeletonBase width="100%" height="45px" borderRadius="8px" />
          <SkeletonBase width="100%" height="45px" borderRadius="8px" />
        </div>

        {/* Confidence bar */}
        <SkeletonBase width="100%" height="8px" borderRadius="4px" style={{ marginBottom: '10px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBase width="80px" height="14px" />
          <SkeletonBase width="100px" height="14px" />
        </div>
      </div>
    ))}
  </>
);

/**
 * Table Skeleton
 * For data tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #333'
  }}>
    {/* Header */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '15px',
      padding: '15px 20px',
      backgroundColor: '#12121f',
      borderBottom: '1px solid #333'
    }}>
      {Array(columns).fill(0).map((_, i) => (
        <SkeletonBase key={i} width="80%" height="14px" />
      ))}
    </div>

    {/* Rows */}
    {Array(rows).fill(0).map((_, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '15px',
          padding: '15px 20px',
          borderBottom: rowIndex < rows - 1 ? '1px solid #333' : 'none'
        }}
      >
        {Array(columns).fill(0).map((_, colIndex) => (
          <SkeletonBase
            key={colIndex}
            width={colIndex === 0 ? '90%' : '60%'}
            height="16px"
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * List Skeleton
 * For simple lists
 */
export const ListSkeleton = ({ items = 5 }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid #333'
  }}>
    {Array(items).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 0',
          borderBottom: i < items - 1 ? '1px solid #333' : 'none'
        }}
      >
        <SkeletonBase width="36px" height="36px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <SkeletonBase width="60%" height="14px" style={{ marginBottom: '6px' }} />
          <SkeletonBase width="40%" height="12px" />
        </div>
        <SkeletonBase width="50px" height="24px" borderRadius="4px" />
      </div>
    ))}
  </div>
);

/**
 * Stats Grid Skeleton
 * For dashboard stat cards
 */
export const StatsGridSkeleton = ({ count = 4 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`,
    gap: '15px'
  }}>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333',
          textAlign: 'center'
        }}
      >
        <SkeletonBase width="40px" height="40px" borderRadius="50%" style={{ margin: '0 auto 12px' }} />
        <SkeletonBase width="60px" height="28px" style={{ margin: '0 auto 8px' }} />
        <SkeletonBase width="80px" height="12px" style={{ margin: '0 auto' }} />
      </div>
    ))}
  </div>
);

/**
 * Prop Card Skeleton
 * For player prop betting cards
 */
export const PropCardSkeleton = ({ count = 3 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333',
          marginBottom: '15px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonBase width="50px" height="50px" borderRadius="50%" />
            <div>
              <SkeletonBase width="120px" height="16px" style={{ marginBottom: '6px' }} />
              <SkeletonBase width="80px" height="12px" />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <SkeletonBase width="60px" height="24px" style={{ marginBottom: '6px' }} />
            <SkeletonBase width="40px" height="14px" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <SkeletonBase width="100%" height="40px" borderRadius="8px" />
          <SkeletonBase width="100%" height="40px" borderRadius="8px" />
        </div>

        <SkeletonBase width="100%" height="6px" borderRadius="3px" />
      </div>
    ))}
  </>
);

/**
 * Page Loading Skeleton
 * Full page loading state
 */
export const PageLoadingSkeleton = () => (
  <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Header */}
    <div style={{ marginBottom: '30px' }}>
      <SkeletonBase width="200px" height="32px" style={{ marginBottom: '10px' }} />
      <SkeletonBase width="300px" height="14px" />
    </div>

    {/* Stats */}
    <StatsGridSkeleton count={4} />

    {/* Main Content */}
    <div style={{ marginTop: '30px' }}>
      <SkeletonBase width="150px" height="20px" style={{ marginBottom: '20px' }} />
      <GameCardSkeleton count={3} />
    </div>
  </div>
);

/**
 * Inline Loading Spinner
 * Small spinner for buttons/inline loading
 */
export const LoadingSpinner = ({ size = 20, color = '#00D4FF' }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block'
    }}
  >
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * Loading Overlay
 * Full overlay with spinner
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <LoadingSpinner size={40} />
    <p style={{ color: '#9ca3af', marginTop: '16px', fontSize: '14px' }}>{message}</p>
  </div>
);

export default {
  CardSkeleton,
  GameCardSkeleton,
  TableSkeleton,
  ListSkeleton,
  StatsGridSkeleton,
  PropCardSkeleton,
  PageLoadingSkeleton,
  LoadingSpinner,
  LoadingOverlay
};
