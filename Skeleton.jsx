/**
 * LOADING SKELETONS
 *
 * Reusable skeleton components for loading states.
 * Provides better UX than spinners by showing content shape.
 */

import React from 'react';

// Base skeleton with shimmer animation
const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

const baseSkeletonStyle = {
  background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '6px'
};

// Basic skeleton box
export const Skeleton = ({ width = '100%', height = '20px', style = {}, className = '' }) => (
  <div
    className={className}
    style={{
      ...baseSkeletonStyle,
      width,
      height,
      ...style
    }}
  />
);

// Text line skeleton
export const SkeletonText = ({ lines = 1, width = '100%', gap = '8px' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 && lines > 1 ? '70%' : width}
        height="14px"
      />
    ))}
  </div>
);

// Circle skeleton (for avatars, icons)
export const SkeletonCircle = ({ size = '40px' }) => (
  <div
    style={{
      ...baseSkeletonStyle,
      width: size,
      height: size,
      borderRadius: '50%'
    }}
  />
);

// Card skeleton
export const SkeletonCard = ({ height = '150px' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <Skeleton width="60%" height="18px" />
      <Skeleton width="60px" height="18px" />
    </div>
    <Skeleton width="100%" height="40px" style={{ marginBottom: '12px' }} />
    <div style={{ display: 'flex', gap: '10px' }}>
      <Skeleton width="80px" height="24px" />
      <Skeleton width="80px" height="24px" />
    </div>
  </div>
);

// Smash spot card skeleton
export const SmashSpotSkeleton = () => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid #333'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div>
        <Skeleton width="180px" height="18px" style={{ marginBottom: '8px' }} />
        <Skeleton width="120px" height="14px" />
      </div>
      <Skeleton width="70px" height="28px" style={{ borderRadius: '14px' }} />
    </div>
    <div style={{
      backgroundColor: '#0a0a0f',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="100px" height="24px" />
        <Skeleton width="60px" height="24px" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <Skeleton width="60px" height="22px" style={{ borderRadius: '4px' }} />
      <Skeleton width="60px" height="22px" style={{ borderRadius: '4px' }} />
      <Skeleton width="60px" height="22px" style={{ borderRadius: '4px' }} />
    </div>
  </div>
);

// Props card skeleton
export const PropsSkeleton = () => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid #333'
  }}>
    <div style={{ marginBottom: '12px' }}>
      <Skeleton width="150px" height="18px" style={{ marginBottom: '6px' }} />
      <Skeleton width="100px" height="12px" />
    </div>
    <div style={{
      backgroundColor: '#0a0a0f',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Skeleton width="80px" height="12px" />
        <Skeleton width="50px" height="18px" style={{ borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="100px" height="22px" />
        <Skeleton width="50px" height="22px" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="80px" height="12px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton width="30px" height="26px" />
        <Skeleton width="60px" height="26px" />
      </div>
    </div>
  </div>
);

// Leaderboard row skeleton
export const LeaderboardRowSkeleton = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '60px 1fr 100px 100px 80px 80px',
    padding: '15px 20px',
    borderBottom: '1px solid #333',
    alignItems: 'center'
  }}>
    <Skeleton width="30px" height="20px" />
    <Skeleton width="120px" height="16px" />
    <Skeleton width="60px" height="16px" style={{ marginLeft: 'auto' }} />
    <Skeleton width="50px" height="16px" style={{ marginLeft: 'auto' }} />
    <Skeleton width="40px" height="16px" style={{ marginLeft: 'auto' }} />
    <Skeleton width="40px" height="16px" style={{ marginLeft: 'auto' }} />
  </div>
);

// Metric card skeleton
export const MetricCardSkeleton = () => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  }}>
    <SkeletonCircle size="50px" />
    <div>
      <Skeleton width="60px" height="12px" style={{ marginBottom: '8px' }} />
      <Skeleton width="80px" height="24px" style={{ marginBottom: '4px' }} />
      <Skeleton width="50px" height="12px" />
    </div>
  </div>
);

// Table skeleton
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
      padding: '15px 20px',
      backgroundColor: '#12121f',
      borderBottom: '1px solid #333',
      gap: '20px'
    }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width="60px" height="12px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          padding: '15px 20px',
          borderBottom: rowIdx < rows - 1 ? '1px solid #333' : 'none',
          gap: '20px'
        }}
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} width={colIdx === 0 ? '100px' : '60px'} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

// Dashboard grid skeleton
export const DashboardSkeleton = () => (
  <div>
    {/* Metrics row */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '25px'
    }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>

    {/* Cards grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '15px'
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SmashSpotSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = '200px' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    height
  }}>
    <Skeleton width="150px" height="16px" style={{ marginBottom: '20px' }} />
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: 'calc(100% - 50px)' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={`${30 + Math.random() * 60}%`}
          style={{ flex: 1 }}
        />
      ))}
    </div>
  </div>
);

// Full page loading skeleton
export const PageSkeleton = ({ title = true }) => (
  <div style={{ padding: '20px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {title && (
        <div style={{ marginBottom: '25px' }}>
          <Skeleton width="200px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="300px" height="14px" />
        </div>
      )}
      <DashboardSkeleton />
    </div>
  </div>
);

export default {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SmashSpotSkeleton,
  PropsSkeleton,
  LeaderboardRowSkeleton,
  MetricCardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
  PageSkeleton
};
