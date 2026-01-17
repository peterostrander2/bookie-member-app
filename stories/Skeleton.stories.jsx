import React from 'react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SmashSpotSkeleton,
  PropsSkeleton,
  LeaderboardRowSkeleton,
  MetricCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  PageSkeleton,
} from '../Skeleton';

export default {
  title: 'Components/Skeleton',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Loading skeleton components for better UX. Shows content shape while data loads.',
      },
    },
  },
};

// Base Skeleton
export const Base = {
  render: () => <Skeleton width="200px" height="20px" />,
  parameters: {
    docs: {
      description: { story: 'Basic skeleton with customizable width and height.' },
    },
  },
};

export const CustomDimensions = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton width="100%" height="16px" />
      <Skeleton width="80%" height="16px" />
      <Skeleton width="60%" height="16px" />
    </div>
  ),
};

// Text Skeleton
export const Text = {
  render: () => <SkeletonText lines={3} />,
  parameters: {
    docs: {
      description: { story: 'Multi-line text skeleton. Last line is shorter for natural look.' },
    },
  },
};

export const TextSingleLine = {
  render: () => <SkeletonText lines={1} width="150px" />,
};

// Circle Skeleton
export const Circle = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <SkeletonCircle size="32px" />
      <SkeletonCircle size="48px" />
      <SkeletonCircle size="64px" />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Circular skeleton for avatars and icons.' },
    },
  },
};

// Card Skeleton
export const Card = {
  render: () => <SkeletonCard />,
  parameters: {
    docs: {
      description: { story: 'Generic card skeleton layout.' },
    },
  },
};

// Domain-specific Skeletons
export const SmashSpot = {
  render: () => <SmashSpotSkeleton />,
  parameters: {
    docs: {
      description: { story: 'Skeleton for SmashSpots pick cards.' },
    },
  },
};

export const Props = {
  render: () => <PropsSkeleton />,
  parameters: {
    docs: {
      description: { story: 'Skeleton for player props cards.' },
    },
  },
};

export const LeaderboardRow = {
  render: () => (
    <div style={{ backgroundColor: '#1a1a2e', borderRadius: '8px' }}>
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Skeleton for leaderboard table rows.' },
    },
  },
};

export const MetricCard = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '500px' }}>
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Skeleton for metric/stat cards with icon.' },
    },
  },
};

export const Table = {
  render: () => <TableSkeleton rows={5} columns={4} />,
  parameters: {
    docs: {
      description: { story: 'Table skeleton with configurable rows and columns.' },
    },
  },
};

export const Chart = {
  render: () => <ChartSkeleton height="250px" />,
  parameters: {
    docs: {
      description: { story: 'Chart/graph skeleton with bar placeholders.' },
    },
  },
};

export const FullPage = {
  render: () => <PageSkeleton />,
  parameters: {
    docs: {
      description: { story: 'Full page loading skeleton with metrics and cards.' },
    },
  },
};

// Loading states comparison
export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <section>
        <h3 style={{ color: '#9ca3af', marginBottom: '12px' }}>Basic Elements</h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>Box</p>
            <Skeleton width="120px" height="40px" />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>Text</p>
            <SkeletonText lines={2} width="150px" />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>Circle</p>
            <SkeletonCircle size="48px" />
          </div>
        </div>
      </section>

      <section>
        <h3 style={{ color: '#9ca3af', marginBottom: '12px' }}>Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '700px' }}>
          <SmashSpotSkeleton />
          <PropsSkeleton />
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Overview of all skeleton variants.' },
    },
  },
};
