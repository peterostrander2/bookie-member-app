import React from 'react';

/**
 * DBSyncIndicator - Shows database sync status
 *
 * Usage:
 * <DBSyncIndicator
 *   databaseAvailable={true}
 *   picksSaved={15}
 *   signalsSaved={42}
 * />
 *
 * Or with data object:
 * <DBSyncIndicator data={apiResponse} />
 */

const DBSyncIndicator = ({
  databaseAvailable,
  picksSaved,
  signalsSaved,
  data,
  size = 'medium',
  showDetails = false,
  style = {}
}) => {
  // Support both direct props and data object
  const dbAvailable = databaseAvailable ?? data?.database_available ?? false;
  const picks = picksSaved ?? data?.picks_saved ?? 0;
  const signals = signalsSaved ?? data?.signals_saved ?? 0;

  const isHealthy = dbAvailable && (picks > 0 || signals > 0);
  const isPartial = dbAvailable && picks === 0 && signals === 0;

  // Size configurations
  const sizes = {
    small: { dot: 6, font: 10, padding: '4px 8px', gap: 4 },
    medium: { dot: 8, font: 12, padding: '6px 12px', gap: 6 },
    large: { dot: 10, font: 14, padding: '8px 16px', gap: 8 }
  };
  const s = sizes[size] || sizes.medium;

  // Status styling
  const getStatusStyle = () => {
    if (isHealthy) return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Synced' };
    if (isPartial) return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Partial' };
    return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Offline' };
  };

  const status = getStatusStyle();

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${s.gap}px`,
    backgroundColor: status.bg,
    padding: s.padding,
    borderRadius: '20px',
    fontSize: `${s.font}px`,
    color: status.color,
    fontWeight: 500,
    ...style
  };

  const dotStyle = {
    width: `${s.dot}px`,
    height: `${s.dot}px`,
    borderRadius: '50%',
    backgroundColor: status.color,
    animation: isHealthy ? 'pulse 2s ease-in-out infinite' : 'none'
  };

  const tooltipText = `Database: ${dbAvailable ? 'Connected' : 'Offline'}\nPicks saved: ${picks}\nSignals saved: ${signals}`;

  return (
    <>
      <div style={containerStyle} title={tooltipText}>
        <span style={dotStyle} />
        <span>DB {status.label}</span>
        {showDetails && (
          <span style={{ opacity: 0.8, marginLeft: '4px' }}>
            ({picks}P / {signals}S)
          </span>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

/**
 * DBSyncBadge - Compact badge version for tight spaces
 */
export const DBSyncBadge = ({
  databaseAvailable,
  data,
  style = {}
}) => {
  const dbAvailable = databaseAvailable ?? data?.database_available ?? false;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: dbAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
    color: dbAvailable ? '#10B981' : '#EF4444',
    fontSize: '10px',
    cursor: 'help',
    ...style
  };

  return (
    <div
      style={badgeStyle}
      title={dbAvailable ? 'Database connected' : 'Database offline'}
    >
      {dbAvailable ? '✓' : '!'}
    </div>
  );
};

/**
 * DBSyncCard - Detailed card view for dashboards
 */
export const DBSyncCard = ({
  databaseAvailable,
  picksSaved,
  signalsSaved,
  data,
  timestamp,
  style = {}
}) => {
  const dbAvailable = databaseAvailable ?? data?.database_available ?? false;
  const picks = picksSaved ?? data?.picks_saved ?? 0;
  const signals = signalsSaved ?? data?.signals_saved ?? 0;
  const ts = timestamp ?? data?.timestamp;

  const cardStyle = {
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '16px',
    ...style
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  };

  const titleStyle = {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #333'
  };

  const labelStyle = {
    color: '#9ca3af',
    fontSize: '13px'
  };

  const valueStyle = {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 500
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span>🗄️</span>
          <span>Database Sync</span>
        </div>
        <DBSyncIndicator
          databaseAvailable={dbAvailable}
          picksSaved={picks}
          signalsSaved={signals}
          size="small"
        />
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Connection</span>
        <span style={{ ...valueStyle, color: dbAvailable ? '#10B981' : '#EF4444' }}>
          {dbAvailable ? 'Connected' : 'Offline'}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Picks Saved</span>
        <span style={valueStyle}>{picks}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Signals Saved</span>
        <span style={valueStyle}>{signals}</span>
      </div>

      {ts && (
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={labelStyle}>Last Update</span>
          <span style={{ ...valueStyle, fontSize: '11px', color: '#6b7280' }}>
            {new Date(ts).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * useDBSyncStatus - Hook for consuming DB sync state
 */
export const useDBSyncStatus = (apiResponse) => {
  const databaseAvailable = apiResponse?.database_available ?? false;
  const picksSaved = apiResponse?.picks_saved ?? 0;
  const signalsSaved = apiResponse?.signals_saved ?? 0;

  const isHealthy = databaseAvailable && (picksSaved > 0 || signalsSaved > 0);
  const isPartial = databaseAvailable && picksSaved === 0 && signalsSaved === 0;
  const isOffline = !databaseAvailable;

  return {
    databaseAvailable,
    picksSaved,
    signalsSaved,
    isHealthy,
    isPartial,
    isOffline,
    status: isHealthy ? 'healthy' : isPartial ? 'partial' : 'offline'
  };
};

export default DBSyncIndicator;
