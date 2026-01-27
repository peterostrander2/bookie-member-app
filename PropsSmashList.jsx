import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';
import { ShareButton } from './ShareButton';
import { AddToSlipButton } from './BetSlip';
import { HelpIcon, METRIC_TOOLTIPS } from './Tooltip';
import { useSwipe, useMobileDetect } from './useSwipe';

// Helper to format time ago from ISO timestamp
const formatTimeAgo = (isoTimestamp) => {
  if (!isoTimestamp) return null;
  const now = new Date();
  const then = new Date(isoTimestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// AI Models that make up the ensemble
const AI_MODELS = [
  { id: 'ensemble', name: 'Ensemble', desc: 'Combined model consensus' },
  { id: 'lstm', name: 'LSTM', desc: 'Time-series neural network' },
  { id: 'xgboost', name: 'XGBoost', desc: 'Gradient boosting' },
  { id: 'random_forest', name: 'Random Forest', desc: 'Decision tree ensemble' },
  { id: 'neural_net', name: 'Neural Net', desc: 'Deep learning model' },
  { id: 'monte_carlo', name: 'Monte Carlo', desc: 'Simulation model' },
  { id: 'bayesian', name: 'Bayesian', desc: 'Probabilistic model' },
  { id: 'regression', name: 'Regression', desc: 'Statistical regression' }
];

// 8 Pillars of the betting system
const PILLARS = [
  { id: 'sharp_action', name: 'Sharp Action', desc: 'Professional bettor signals' },
  { id: 'reverse_line', name: 'Reverse Line', desc: 'Line moving against public' },
  { id: 'matchup_history', name: 'Matchup History', desc: 'Historical head-to-head' },
  { id: 'recent_form', name: 'Recent Form', desc: 'Last 10 game trends' },
  { id: 'rest_advantage', name: 'Rest Advantage', desc: 'Days off comparison' },
  { id: 'home_away', name: 'Home/Away', desc: 'Venue performance' },
  { id: 'injuries', name: 'Injury Impact', desc: 'Key player status' },
  { id: 'pace_tempo', name: 'Pace/Tempo', desc: 'Game speed matchup' }
];

// ============================================================================
// STYLE CONSTANTS - Moved outside components to avoid recreation on each render
// These are static styles used repeatedly in list items (high performance impact)
// ============================================================================

// Badge style for key stats (used 4+ times per card in map)
const STAT_BADGE_STYLE = {
  backgroundColor: '#0f0f1a',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  color: '#6B7280'
};

// Badge style with auto margin for bookmaker badge
const STAT_BADGE_STYLE_RIGHT = {
  ...STAT_BADGE_STYLE,
  marginLeft: 'auto'
};

// Container for expanded breakdown section
const BREAKDOWN_CONTAINER_STYLE = {
  backgroundColor: '#0f0f1a',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  borderLeft: '3px solid #8B5CF6'
};

// Key stats row container
const KEY_STATS_ROW_STYLE = {
  display: 'flex',
  gap: '6px',
  marginBottom: '10px',
  flexWrap: 'wrap'
};

// Filter button base style
const FILTER_BUTTON_STYLE = {
  backgroundColor: '#1a1a2e',
  color: '#fff',
  border: '1px solid #4B5563',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer'
};

// ============================================================================

// Line movement indicator component with explanatory tooltips
// Uses REAL data from API - pick.line_movement object
const LineMovement = memo(({ pick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Use real line movement data from API (no mocks)
  const lineMovement = useMemo(() => {
    // Only show if backend provides line_movement data
    if (!pick.line_movement) return null;

    const lm = pick.line_movement;
    const change = lm.current_line - lm.opening_line;
    const direction = change > 0 ? 'up' : 'down';
    const oddsChange = (lm.current_odds || 0) - (lm.opening_odds || 0);

    return {
      direction,
      lineChange: change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1),
      oddsChange: oddsChange > 0 ? `+${oddsChange}` : oddsChange.toString(),
      isSteam: lm.is_steam || false,
      timeAgo: lm.movement_time ? formatTimeAgo(lm.movement_time) : null,
      openingLine: lm.opening_line,
      currentLine: lm.current_line
    };
  }, [pick.line_movement]);

  // Don't render if no real line movement data from backend
  if (!lineMovement) return null;

  const isFavorable = (pick.side === 'Over' && lineMovement.direction === 'down') ||
                      (pick.side === 'Under' && lineMovement.direction === 'up');

  // Explanatory tooltip content
  const tooltipContent = lineMovement.isSteam
    ? `STEAM MOVE: Sharp/professional bettors are heavily backing this side, causing rapid line movement. The line moved ${lineMovement.lineChange} points${lineMovement.timeAgo ? ` in just ${lineMovement.timeAgo}` : ''} with odds shifting ${lineMovement.oddsChange}. This is a strong signal.`
    : `LINE MOVEMENT: The line has moved ${lineMovement.lineChange} points since opening (${lineMovement.openingLine} → ${lineMovement.currentLine}). ${isFavorable ? 'This movement is favorable for your bet — you\'re getting better value.' : 'The line moved against this side, but the pick still meets our criteria.'}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        backgroundColor: lineMovement.isSteam ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        borderRadius: '6px',
        border: `1px solid ${lineMovement.isSteam ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        cursor: 'help',
        position: 'relative'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span style={{ fontSize: '14px' }}>
        {lineMovement.direction === 'up' ? '📈' : '📉'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            color: isFavorable ? '#10B981' : '#EF4444',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            Line {lineMovement.lineChange}
          </span>
          {lineMovement.isSteam && (
            <span style={{
              backgroundColor: '#EF444430',
              color: '#EF4444',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: 'bold'
            }}>STEAM 🔥</span>
          )}
        </div>
        <span style={{ color: '#6B7280', fontSize: '10px' }}>
          {lineMovement.timeAgo && `${lineMovement.timeAgo} • `}Odds {lineMovement.oddsChange}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          width: '280px',
          padding: '12px',
          backgroundColor: '#1a1a2e',
          border: `1px solid ${lineMovement.isSteam ? '#EF4444' : '#3B82F6'}`,
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          zIndex: 100
        }}>
          <div style={{
            color: lineMovement.isSteam ? '#EF4444' : '#3B82F6',
            fontSize: '11px',
            fontWeight: 'bold',
            marginBottom: '6px'
          }}>
            {lineMovement.isSteam ? '🔥 STEAM MOVE DETECTED' : '📊 LINE MOVEMENT'}
          </div>
          <div style={{ color: '#fff', fontSize: '12px', lineHeight: '1.5' }}>
            {tooltipContent}
          </div>
          {lineMovement.isSteam && (
            <div style={{
              marginTop: '8px',
              padding: '6px 8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
              color: '#EF4444',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              💡 Steam moves indicate professional action — follow the sharps!
            </div>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${lineMovement.isSteam ? '#EF4444' : '#3B82F6'}`
          }} />
        </div>
      )}
    </div>
  );
});
LineMovement.displayName = 'LineMovement';

// v10.87 Tier configuration based on API tier field (matches backend tiering.py)
const TIER_CONFIGS = {
  TITANIUM_SMASH: {
    label: 'TITANIUM SMASH',
    color: '#00FFFF',
    bg: 'rgba(0, 255, 255, 0.15)',
    border: 'rgba(0, 255, 255, 0.5)',
    glow: '0 0 30px rgba(0, 255, 255, 0.4)',
    size: 'large',
    historicalWinRate: 92,
    isProfitable: true,
    action: 'SMASH',
    units: 2.5
  },
  GOLD_STAR: {
    label: 'GOLD STAR',
    color: '#FFD700',
    bg: 'rgba(255, 215, 0, 0.15)',
    border: 'rgba(255, 215, 0, 0.5)',
    glow: '0 0 20px rgba(255, 215, 0, 0.3)',
    size: 'large',
    historicalWinRate: 87,
    isProfitable: true,
    action: 'SMASH',
    units: 2.0
  },
  EDGE_LEAN: {
    label: 'EDGE LEAN',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.5)',
    glow: 'none',
    size: 'medium',
    historicalWinRate: 72,
    isProfitable: true,
    action: 'PLAY',
    units: 1.0
  },
  MONITOR: {
    label: 'MONITOR',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 58,
    isProfitable: true,
    action: 'WATCH',
    units: 0.0
  },
  PASS: {
    label: 'PASS',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 48,
    isProfitable: false,
    warning: 'Below break-even at standard odds',
    action: 'SKIP',
    units: 0.0
  }
};

// Get tier config from pick object (v10.87 schema)
const getTierConfigFromPick = (pick) => {
  // Use tier from API if available (v10.87+) - backend is source of truth
  if (pick.tier && TIER_CONFIGS[pick.tier]) {
    return TIER_CONFIGS[pick.tier];
  }
  // Fallback: derive from final_score (v12.0 thresholds)
  const score = pick.final_score || (pick.confidence / 10) || 0;
  // TITANIUM requires backend's titanium_triggered (score >= 8.0 + 3/4 engines >= 6.5)
  // Frontend cannot verify engine rule, so only use titanium_triggered field
  if (pick.titanium_triggered) return TIER_CONFIGS.TITANIUM_SMASH;
  if (score >= 7.5) return TIER_CONFIGS.GOLD_STAR;
  if (score >= 6.5) return TIER_CONFIGS.EDGE_LEAN;
  if (score >= 5.5) return TIER_CONFIGS.MONITOR;
  return TIER_CONFIGS.PASS;
};

// Legacy: Confidence tier configuration with enhanced visuals
const getTierConfig = (conf) => {
  if (conf >= 85) return {
    label: 'GOLD STAR',
    color: '#FFD700',
    bg: 'rgba(255, 215, 0, 0.15)',
    border: 'rgba(255, 215, 0, 0.5)',
    glow: '0 0 20px rgba(255, 215, 0, 0.3)',
    size: 'large',
    historicalWinRate: 87,
    isProfitable: true
  };
  if (conf >= 75) return {
    label: 'EDGE LEAN',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.5)',
    glow: 'none',
    size: 'medium',
    historicalWinRate: 72,
    isProfitable: true
  };
  if (conf >= 65) return {
    label: 'MONITOR',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 58,
    isProfitable: true
  };
  return {
    label: 'PASS',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 48,
    isProfitable: false,
    warning: 'Below break-even at standard odds'
  };
};

// Memoized score badge - prevents re-renders when props unchanged
const ScoreBadge = memo(({ score, maxScore, label, tooltip }) => {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#3B82F6';
    return '#6B7280';
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', minWidth: '50px'
    }}>
      <span style={{ color: getColor(), fontWeight: 'bold', fontSize: '16px' }}>{score.toFixed(1)}</span>
      <span style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
        {label}
        {tooltip && <HelpIcon tooltip={tooltip} size={12} />}
      </span>
    </div>
  );
});
ScoreBadge.displayName = 'ScoreBadge';

// Memoized tier badge - prevents re-renders when confidence unchanged
const TierBadge = memo(({ confidence, showWinRate = false }) => {
  const config = getTierConfig(confidence);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
        color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}`, letterSpacing: '0.5px'
      }}>{config.label}</span>
      {showWinRate && (
        <span style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: 'bold',
          backgroundColor: config.isProfitable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: config.isProfitable ? '#10B981' : '#EF4444',
          border: `1px solid ${config.isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {config.historicalWinRate}% hist.
        </span>
      )}
      {!config.isProfitable && (
        <span
          title={config.warning}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'help'
          }}
        >!</span>
      )}
    </div>
  );
});
TierBadge.displayName = 'TierBadge';

// Filter/Sort controls component (v10.87 tier names)
const FilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  const tierOptions = ['ALL', 'TITANIUM_SMASH', 'GOLD_STAR', 'EDGE_LEAN', 'MONITOR'];
  const tierLabels = { ALL: 'ALL', TITANIUM_SMASH: 'TITANIUM', GOLD_STAR: 'GOLD', EDGE_LEAN: 'EDGE', MONITOR: 'MONITOR' };
  const propTypes = ['ALL', 'POINTS', 'REBOUNDS', 'ASSISTS', '3PT', 'OTHER'];
  const sortOptions = [
    { value: 'score', label: 'Score (High→Low)' },
    { value: 'edge', label: 'Edge (High→Low)' },
    { value: 'odds', label: 'Best Odds' }
  ];

  return (
    <div style={{
      backgroundColor: '#12121f', borderRadius: '10px', padding: '12px 16px',
      marginBottom: '16px', border: '1px solid #2a2a4a'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        {/* Tier Filter */}
        <div>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>TIER:</span>
          <div style={{ display: 'inline-flex', gap: '4px' }}>
            {tierOptions.map(tier => (
              <button
                key={tier}
                onClick={() => setFilters({ ...filters, tier })}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                  cursor: 'pointer', border: 'none',
                  backgroundColor: filters.tier === tier ? (tier === 'TITANIUM_SMASH' ? '#00FFFF' : '#8B5CF6') : '#1a1a2e',
                  color: filters.tier === tier ? (tier === 'TITANIUM_SMASH' ? '#000' : '#fff') : '#9CA3AF'
                }}
              >{tierLabels[tier]}</button>
            ))}
          </div>
        </div>

        {/* Prop Type Filter */}
        <div>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>TYPE:</span>
          <select
            value={filters.propType}
            onChange={(e) => setFilters({ ...filters, propType: e.target.value })}
            style={{
              backgroundColor: '#1a1a2e', color: '#fff', border: '1px solid #4B5563',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer'
            }}
          >
            {propTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: '#1a1a2e', color: '#fff', border: '1px solid #4B5563',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer'
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});
FilterControls.displayName = 'FilterControls';

// v12.0 Community Threshold - only show picks >= 6.5
const COMMUNITY_THRESHOLD = 6.5;

// v12.0 Tier Legend (TITANIUM requires score≥8.0 + 3/4 engines≥6.5)
const TierLegend = memo(() => (
  <div style={{
    display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap',
    padding: '8px 12px', backgroundColor: '#0f0f1a', borderRadius: '8px'
  }}>
    <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '4px' }}>v12.0 TIERS:</span>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '2px 6px', backgroundColor: '#00FFFF10', borderRadius: '4px', border: '1px solid #00FFFF30'
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FFFF', boxShadow: '0 0 6px #00FFFF' }} />
      <span style={{ color: '#00FFFF', fontSize: '11px', fontWeight: 'bold' }}>TITANIUM ≥8.0+3/4</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
      <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>GOLD STAR ≥7.5</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
      <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>EDGE LEAN ≥6.5</span>
    </div>
  </div>
));
TierLegend.displayName = 'TierLegend';

const formatOdds = (odds) => !odds ? '--' : odds > 0 ? `+${odds}` : odds.toString();

const getPropIcon = (market) => {
  if (market?.includes('points')) return '🏀';
  if (market?.includes('rebounds')) return '📊';
  if (market?.includes('assists')) return '🎯';
  if (market?.includes('threes')) return '🎱';
  if (market?.includes('steals')) return '🖐️';
  if (market?.includes('blocks')) return '🛡️';
  return '📈';
};

// Get key stats from REAL API data only (no mocks)
// Returns null if backend doesn't provide key_stats
const getKeyStats = (pick) => {
  if (!pick.key_stats) return null;

  return {
    avg: pick.key_stats.last_10_avg != null ? `${pick.key_stats.last_10_avg} avg last 10` : null,
    trend: pick.key_stats.hit_rate != null ? `Hit this line in ${pick.key_stats.hit_rate}% of recent games` : null,
    matchup: pick.key_stats.matchup_note || null
  };
};

// Get which models agree - uses REAL data from pick.agreeing_models
// Falls back to deriving from ai_score if backend provides the score
const getAgreeingModels = (pick) => {
  // Use real data if backend provides it
  if (pick.agreeing_models && Array.isArray(pick.agreeing_models)) {
    return pick.agreeing_models.map(id => AI_MODELS.find(m => m.id === id)).filter(Boolean);
  }
  // No real data available
  return [];
};

// Get which pillars align - uses REAL data from pick.aligning_pillars
const getAligningPillars = (pick) => {
  // Use real data if backend provides it
  if (pick.aligning_pillars && Array.isArray(pick.aligning_pillars)) {
    return pick.aligning_pillars.map(id => PILLARS.find(p => p.id === id)).filter(Boolean);
  }
  // No real data available
  return [];
};

// v10.4 Badge display component
const BadgeDisplay = memo(({ badges }) => {
  if (!badges || badges.length === 0) return null;

  const BADGE_STYLES = {
    SMASH_SPOT: { bg: 'rgba(255, 100, 0, 0.2)', color: '#FF6400', icon: '🔥', label: 'SMASH SPOT' },
    SHARP_MONEY: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981', icon: '💰', label: 'SHARP' },
    JARVIS_TRIGGER: { bg: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', icon: '⚡', label: 'JARVIS' },
    REVERSE_LINE: { bg: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6', icon: '↩️', label: 'REVERSE' },
    PRIME_TIME: { bg: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', icon: '📺', label: 'PRIME' }
  };

  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {badges.map((badge, idx) => {
        const style = BADGE_STYLES[badge] || { bg: 'rgba(107, 114, 128, 0.2)', color: '#6B7280', icon: '•', label: badge };
        return (
          <span key={idx} style={{
            backgroundColor: style.bg,
            color: style.color,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '9px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            {style.icon} {style.label}
          </span>
        );
      })}
    </div>
  );
});
BadgeDisplay.displayName = 'BadgeDisplay';

// Memoized prop card - only re-renders when pick data changes
const PropCard = memo(({ pick }) => {
  const [expanded, setExpanded] = useState(false);
  // v10.4: Use new tier config from pick object
  const tierConfig = getTierConfigFromPick(pick);
  // Use REAL data from API - returns null if not available
  const keyStats = useMemo(() => getKeyStats(pick), [pick.key_stats]);
  const agreeingModels = useMemo(() => getAgreeingModels(pick), [pick.agreeing_models]);
  const aligningPillars = useMemo(() => getAligningPillars(pick), [pick.aligning_pillars]);
  const { isMobile, isTouchDevice } = useMobileDetect();

  // v12.0: Get final_score (0-10 scale) or derive from confidence
  const finalScore = pick.final_score || (pick.confidence / 10) || 0;
  const isSmashSpot = pick.smash_spot === true;
  const isTitanium = pick.titanium_triggered || pick.tier === 'TITANIUM_SMASH';

  // Check if we have v10.4 reasons array
  const hasReasons = pick.reasons && Array.isArray(pick.reasons) && pick.reasons.length > 0;

  // Check if we have enough real data to show the "Why This Pick" section
  const hasKeyStats = keyStats && (keyStats.avg || keyStats.trend || keyStats.matchup);
  const hasModelData = agreeingModels.length > 0 || aligningPillars.length > 0;

  // Swipe down to expand, swipe up to collapse
  const swipeHandlers = useSwipe({
    onSwipeDown: () => !expanded && setExpanded(true),
    onSwipeUp: () => expanded && setExpanded(false),
    threshold: 40
  });

  const getMarketLabel = useCallback((market) => {
    if (market?.includes('points')) return 'POINTS';
    if (market?.includes('rebounds')) return 'REBOUNDS';
    if (market?.includes('assists')) return 'ASSISTS';
    if (market?.includes('threes')) return '3-POINTERS';
    if (market?.includes('steals')) return 'STEALS';
    if (market?.includes('blocks')) return 'BLOCKS';
    return market?.toUpperCase()?.replace('player_', '') || 'PROP';
  }, []);

  // Card style varies by tier - TITANIUM and SmashSpot get special treatment
  const cardStyle = {
    backgroundColor: isTitanium ? '#0a1a2a' : isSmashSpot ? '#1a1510' : '#1a1a2e',
    borderRadius: '12px',
    padding: isMobile ? '12px' : (tierConfig.size === 'large' ? '20px' : '16px'),
    marginBottom: '12px',
    border: isTitanium ? '2px solid #00FFFF' : isSmashSpot ? '2px solid #FF6400' : `1px solid ${tierConfig.border}`,
    boxShadow: isTitanium
      ? '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)'
      : isSmashSpot
        ? '0 0 30px rgba(255, 100, 0, 0.3)'
        : tierConfig.glow,
    transition: 'all 0.2s ease',
    cursor: isTouchDevice ? 'default' : 'pointer',
    position: 'relative'
  };

  return (
    <div style={cardStyle} {...(isTouchDevice ? swipeHandlers : {})}>
      {/* TITANIUM BANNER - Most prominent */}
      {isTitanium && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #00FFFF, #0088aa)',
          color: '#000',
          padding: '4px 20px',
          borderRadius: '0 0 10px 10px',
          fontSize: '11px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '1px',
          boxShadow: '0 4px 15px rgba(0, 255, 255, 0.4)'
        }}>
          💎 TITANIUM SMASH 💎
        </div>
      )}
      {/* TRUE SMASH SPOT BANNER */}
      {isSmashSpot && !isTitanium && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FF6400',
          color: '#000',
          padding: '4px 16px',
          borderRadius: '0 0 8px 8px',
          fontSize: '10px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          letterSpacing: '1px'
        }}>
          🔥 TRUE SMASH SPOT 🔥
        </div>
      )}

      {/* TOP ROW: Tier badge + Badges + Prop type + Game */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: (isTitanium || isSmashSpot) ? '16px' : 0 }}>
        {/* v10.4: Show tier from API or derived */}
        <span style={{
          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
          color: tierConfig.color, backgroundColor: tierConfig.bg, border: `1px solid ${tierConfig.color}`, letterSpacing: '0.5px'
        }}>{tierConfig.label}</span>
        {/* v10.4: Show badges if available */}
        {pick.badges && <BadgeDisplay badges={pick.badges} />}
        <span style={{
          backgroundColor: '#8B5CF620', color: '#8B5CF6',
          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
          border: '1px solid #8B5CF640'
        }}>{getMarketLabel(pick.market)}</span>
        <span style={{ color: '#6B7280', fontSize: '12px', marginLeft: 'auto' }}>
          {pick.game || `${pick.away_team} @ ${pick.home_team}`}
        </span>
      </div>

      {/* Warning banner for unprofitable tiers */}
      {!tierConfig.isProfitable && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#EF4444', fontSize: '14px' }}>⚠️</span>
          <span style={{ color: '#EF4444', fontSize: '11px' }}>
            <strong>Low Conviction:</strong> This tier historically hits {tierConfig.historicalWinRate}% — below the ~52.4% needed to profit at -110 odds. Consider passing or reducing stake.
          </span>
        </div>
      )}

      {/* HERO SECTION: Player + Pick - LARGEST, MOST PROMINENT */}
      <div style={{
        backgroundColor: isTitanium
          ? 'rgba(0, 255, 255, 0.1)'
          : isSmashSpot
            ? 'rgba(255, 100, 0, 0.1)'
            : `${tierConfig.color}10`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '12px',
        border: isTitanium
          ? '2px solid rgba(0, 255, 255, 0.4)'
          : isSmashSpot
            ? '2px solid rgba(255, 100, 0, 0.4)'
            : `2px solid ${tierConfig.color}30`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>{isTitanium ? '💎' : isSmashSpot ? '🔥' : getPropIcon(pick.market)}</span>
            <span style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: tierConfig.size === 'large' ? '22px' : '18px'
            }}>
              {pick.player || pick.player_name || pick.description?.split(' ').slice(0, 2).join(' ') || 'Player'}
            </span>
          </div>
          <div style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: tierConfig.size === 'large' ? '28px' : '24px',
            letterSpacing: '-0.5px',
            marginTop: '4px'
          }}>
            {pick.selection || `${pick.side} ${pick.point || pick.line}`}
          </div>
          <div style={{
            color: '#8B5CF6',
            fontSize: '18px',
            fontWeight: '600',
            marginTop: '4px'
          }}>
            {formatOdds(pick.odds || pick.price)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* v12.0: Show final_score (0-10) prominently */}
          <div style={{
            color: isTitanium ? '#00FFFF' : isSmashSpot ? '#FF6400' : tierConfig.color,
            fontWeight: 'bold',
            fontSize: tierConfig.size === 'large' ? '36px' : '32px',
            lineHeight: '1',
            textShadow: isTitanium ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
          }}>
            {finalScore.toFixed(1)}
          </div>
          <div style={{ color: '#6B7280', fontSize: '10px', marginTop: '2px' }}>
            score / 10
          </div>
          {/* Confluence level if available */}
          {pick.confluence_level && (
            <div style={{
              marginTop: '8px',
              backgroundColor: pick.confluence_level.includes('JARVIS') ? 'rgba(255, 215, 0, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '9px',
              color: pick.confluence_level.includes('JARVIS') ? '#FFD700' : '#8B5CF6',
              fontWeight: 'bold'
            }}>
              {pick.confluence_level.replace('_', ' ')}
            </div>
          )}
          {/* Alignment percentage if available */}
          {pick.alignment_pct && (
            <div style={{
              marginTop: '4px',
              fontSize: '10px',
              color: pick.alignment_pct >= 80 ? '#10B981' : '#6B7280'
            }}>
              {pick.alignment_pct.toFixed(0)}% aligned
            </div>
          )}
        </div>
      </div>

      {/* SECONDARY ROW: v10.4 Scoring breakdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f0f1a',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* v10.4: Show Research and Esoteric scores from scoring_breakdown */}
          {pick.scoring_breakdown?.research_score !== undefined && (
            <ScoreBadge score={pick.scoring_breakdown.research_score} maxScore={10} label="Research" tooltip="Score from statistical analysis and sharp signals" />
          )}
          {pick.scoring_breakdown?.esoteric_score !== undefined && (
            <ScoreBadge score={pick.scoring_breakdown.esoteric_score} maxScore={10} label="Esoteric" tooltip="Score from JARVIS triggers and numerological patterns" />
          )}
          {/* Fallback to legacy scores if v10.4 breakdown not available */}
          {!pick.scoring_breakdown && pick.ai_score !== undefined && <ScoreBadge score={pick.ai_score} maxScore={8} label="AI" tooltip={METRIC_TOOLTIPS.aiScore} />}
          {!pick.scoring_breakdown && pick.pillar_score !== undefined && <ScoreBadge score={pick.pillar_score} maxScore={8} label="Pillars" tooltip={METRIC_TOOLTIPS.pillarsScore} />}
          {!pick.scoring_breakdown && pick.total_score !== undefined && <ScoreBadge score={pick.total_score} maxScore={20} label="Total" tooltip={METRIC_TOOLTIPS.totalScore} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {pick.edge && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#6B7280', fontSize: '10px' }}>Edge</span>
              <span style={{ color: pick.edge > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold', fontSize: '13px', marginLeft: '4px' }}>
                {pick.edge > 0 ? '+' : ''}{(pick.edge * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {/* v10.4: Show jarvis_active status */}
          {pick.jarvis_active && (
            <div style={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#FFD700',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⚡ JARVIS
            </div>
          )}
          <LineMovement pick={pick} />
        </div>
      </div>

      {/* TERTIARY: Key stats - only show if backend provides real data */}
      {hasKeyStats && (
        <div style={KEY_STATS_ROW_STYLE}>
          {keyStats.avg && (
            <div style={STAT_BADGE_STYLE}>
              <span style={{ color: '#9CA3AF' }}>{keyStats.avg}</span>
            </div>
          )}
          {keyStats.trend && (
            <div style={STAT_BADGE_STYLE}>
              {keyStats.trend}
            </div>
          )}
          {keyStats.matchup && (
            <div style={STAT_BADGE_STYLE}>
              {keyStats.matchup}
            </div>
          )}
          {pick.bookmaker && (
            <div style={STAT_BADGE_STYLE_RIGHT}>
              via {pick.bookmaker}
            </div>
          )}
        </div>
      )}

      {/* Action Row - only show "Why This Pick" if we have real data to show */}
      {(hasReasons || hasKeyStats || hasModelData || pick.jarvis_boost > 0) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setExpanded(!expanded)} style={{
            background: expanded ? '#8B5CF620' : 'none',
            border: '1px solid #8B5CF6', color: '#8B5CF6',
            padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
          }}>{expanded ? 'Hide Details' : 'Why This Pick?'}</button>
        </div>
      )}

      {/* Enhanced "Why?" Breakdown - Only shows REAL data from backend */}
      {expanded && (hasReasons || hasKeyStats || hasModelData || pick.jarvis_boost > 0) && (
        <div style={BREAKDOWN_CONTAINER_STYLE}>
          {/* v10.4: Show reasons[] array from API - primary explanation */}
          {hasReasons && (
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> WHY THIS PICK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pick.reasons.map((reason, idx) => {
                  // Parse reason category and content (format: "CATEGORY: Content +score")
                  const isResearch = reason.includes('RESEARCH:');
                  const isEsoteric = reason.includes('ESOTERIC:');
                  const isConfluence = reason.includes('CONFLUENCE:');
                  const color = isEsoteric ? '#FFD700' : isConfluence ? '#10B981' : '#3B82F6';
                  const icon = isEsoteric ? '⚡' : isConfluence ? '🎯' : '📊';

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color, fontSize: '12px' }}>{icon}</span>
                      <span style={{ color: '#fff', fontSize: '12px', lineHeight: '1.4' }}>
                        {reason}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* KEY FACTORS - Only show if backend provides key_stats */}
          {hasKeyStats && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ color: '#10B981', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📊</span> KEY FACTORS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Recent performance - only if avg provided */}
                {keyStats.avg && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                      <strong>{pick.player_name}</strong> is averaging <strong style={{ color: '#00D4FF' }}>{keyStats.avg.split(' ')[0]}</strong> in the last 10 games
                      {pick.side === 'Over' ? ' — trending above this line' : ' — defense limiting production'}
                    </span>
                  </div>
                )}
                {/* Hit rate - only if trend provided */}
                {keyStats.trend && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                      {keyStats.trend}
                    </span>
                  </div>
                )}
                {/* Matchup - only if matchup provided */}
                {keyStats.matchup && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                      {keyStats.matchup}
                    </span>
                  </div>
                )}
                {/* AI consensus - only if we have real model data */}
                {agreeingModels.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                      <strong style={{ color: '#8B5CF6' }}>{agreeingModels.length}/8 AI models</strong> agree on this pick (strong consensus)
                    </span>
                  </div>
                )}
                {/* Sharp action - only if we have real pillar data */}
                {aligningPillars.length > 0 && aligningPillars.some(p => p.id === 'sharp_action') && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>✓</span>
                    <span style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                      <strong style={{ color: '#F59E0B' }}>Sharp money detected</strong> — professional bettors are on this side
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unit Size Recommendation - v10.87 uses backend units field */}
          <div style={{
            backgroundColor: isSmashSpot ? 'rgba(255, 100, 0, 0.1)' : tierConfig.label === 'TITANIUM SMASH' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 212, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            border: `1px solid ${isSmashSpot ? 'rgba(255, 100, 0, 0.3)' : tierConfig.label === 'TITANIUM SMASH' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 212, 255, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ color: isSmashSpot ? '#FF6400' : tierConfig.label === 'TITANIUM SMASH' ? '#00FFFF' : '#00D4FF', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
                RECOMMENDED STAKE
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                Based on {finalScore.toFixed(1)}/10 score {isSmashSpot && '(TRUE SMASH)'} {tierConfig.label === 'TITANIUM SMASH' && '(TITANIUM)'}
              </div>
            </div>
            <div style={{
              backgroundColor: isSmashSpot ? '#FF640020' : tierConfig.label === 'TITANIUM SMASH' ? '#00FFFF20' : '#00D4FF20',
              color: isSmashSpot ? '#FF6400' : tierConfig.label === 'TITANIUM SMASH' ? '#00FFFF' : '#00D4FF',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {/* v10.87: Use backend units field when available, else derive from tier */}
              {pick.units !== undefined ? (
                pick.units >= 2.5 ? `${pick.units} Units 💎🔥` :
                pick.units >= 2.0 ? `${pick.units} Units 🔥🔥` :
                pick.units >= 1.0 ? `${pick.units} Unit${pick.units > 1 ? 's' : ''} ✓` :
                pick.units > 0 ? `${pick.units} Units ⚡` : 'Pass ⚠️'
              ) : (
                tierConfig.label === 'TITANIUM SMASH' ? '2.5 Units 💎🔥' :
                isSmashSpot ? '2 Units 🔥🔥' :
                finalScore >= 7.5 ? '2 Units 🔥🔥' :
                finalScore >= 6.5 ? '1 Unit ✓' :
                finalScore >= 5.5 ? 'Watch ⚡' : 'Pass ⚠️'
              )}
            </div>
          </div>

          {/* Expandable Technical Details - only show if we have real model/pillar data */}
          {hasModelData && (
            <details style={{ cursor: 'pointer' }}>
              <summary style={{
                color: '#6B7280',
                fontSize: '11px',
                padding: '8px 0',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ transition: 'transform 0.2s' }}>▶</span>
                Advanced Stats (for nerds 🤓)
              </summary>
              <div style={{ paddingTop: '12px' }}>
                {/* AI Models Section - only if we have agreeing models data */}
                {agreeingModels.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#8B5CF6', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                      AI MODELS ({agreeingModels.length}/8 Agree)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {AI_MODELS.map(model => {
                        const agrees = agreeingModels.some(m => m.id === model.id);
                        return (
                          <div key={model.id} style={{
                            padding: '3px 6px', borderRadius: '4px', fontSize: '9px',
                            backgroundColor: agrees ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                            color: agrees ? '#10B981' : '#4B5563',
                            border: `1px solid ${agrees ? '#10B981' : '#333'}`
                          }}>
                            {agrees ? '✓' : '✗'} {model.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pillars Section - only if we have aligning pillars data */}
                {aligningPillars.length > 0 && (
                  <div>
                    <div style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                      8 PILLARS ({aligningPillars.length}/8 Aligned)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {PILLARS.map(pillar => {
                        const aligns = aligningPillars.some(p => p.id === pillar.id);
                        return (
                          <div key={pillar.id} style={{
                            padding: '3px 6px', borderRadius: '4px', fontSize: '9px',
                            backgroundColor: aligns ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                            color: aligns ? '#F59E0B' : '#4B5563',
                            border: `1px solid ${aligns ? '#F59E0B' : '#333'}`
                          }}>
                            {aligns ? '✓' : '✗'} {pillar.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* JARVIS Section (if applicable) */}
          {pick.jarvis_boost > 0 && (
            <div style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px',
              padding: '10px', border: '1px solid rgba(255, 215, 0, 0.3)',
              marginTop: '12px'
            }}>
              <div style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                JARVIS SIGNAL +{pick.jarvis_boost.toFixed(1)}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                Esoteric edge detected: Numerological patterns align favorably
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ShareButton
          pick={{
            player: pick.player || pick.player_name,
            side: pick.side,
            line: pick.line || pick.point,
            stat_type: pick.market?.replace('player_', ''),
            odds: pick.odds || pick.price,
            confidence: Math.round(finalScore * 10), // Convert 0-10 to 0-100 for share
            smash_spot: isSmashSpot,
            tier: tierConfig.label,
          }}
          size="small"
        />
        <AddToSlipButton
          pick={{
            id: pick.id || `${pick.player || pick.player_name}-${pick.market}`,
            game_id: pick.game_id || `${pick.home_team}-${pick.away_team}`,
            player: pick.player || pick.player_name,
            sport: pick.sport || 'NBA',
            home_team: pick.home_team,
            away_team: pick.away_team,
            bet_type: 'prop',
            stat: pick.market?.replace('player_', ''),
            side: pick.side,
            line: pick.line || pick.point,
            odds: pick.odds || pick.price || -110,
            confidence: Math.round(finalScore * 10),
            tier: tierConfig.label,
            smash_spot: isSmashSpot,
          }}
          size="small"
        />
        <PlaceBetButton
          bet={{
            sport: pick.sport, home_team: pick.home_team, away_team: pick.away_team,
            bet_type: 'prop', player: pick.player || pick.player_name, prop_type: pick.market,
            side: pick.side, line: pick.line || pick.point, odds: pick.odds || pick.price, book: pick.bookmaker
          }}
          label={pick.bookmaker ? `Bet at ${pick.bookmaker}` : 'Compare Odds'}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if pick data changed (v10.4 fields)
  return prevProps.pick.player === nextProps.pick.player &&
         prevProps.pick.player_name === nextProps.pick.player_name &&
         prevProps.pick.final_score === nextProps.pick.final_score &&
         prevProps.pick.confidence === nextProps.pick.confidence &&
         prevProps.pick.odds === nextProps.pick.odds &&
         prevProps.pick.price === nextProps.pick.price &&
         prevProps.pick.line === nextProps.pick.line &&
         prevProps.pick.point === nextProps.pick.point &&
         prevProps.pick.smash_spot === nextProps.pick.smash_spot;
});
PropCard.displayName = 'PropCard';

// Demo picks when API unavailable - v10.4 schema
const getDemoProps = (sport) => {
  const demos = {
    NBA: [
      // TRUE SMASH SPOT - highest conviction
      {
        player: 'LeBron James', player_name: 'LeBron James', market: 'player_points',
        selection: 'LeBron James Over 25.5', side: 'Over', line: 25.5, point: 25.5, odds: -110, price: -110,
        tier: 'GOLD_STAR', final_score: 8.2, smash_spot: true, jarvis_active: true,
        confluence_level: 'JARVIS_PERFECT', alignment_pct: 88.5,
        scoring_breakdown: { research_score: 8.5, esoteric_score: 7.8, base_score: 6.2, pillar_boost: 1.5, confluence_boost: 0.5 },
        badges: ['SMASH_SPOT', 'SHARP_MONEY', 'JARVIS_TRIGGER'],
        reasons: ['RESEARCH: Sharp Split +1.2', 'RESEARCH: Prime Time Boost +0.3', 'ESOTERIC: Jarvis Trigger 201 +0.5', 'CONFLUENCE: JARVIS PERFECT +0.5'],
        game: 'Lakers @ Warriors', home_team: 'Warriors', away_team: 'Lakers', bookmaker: 'DraftKings', sport: 'NBA', isDemo: true
      },
      // GOLD_STAR but not SmashSpot
      {
        player: 'Jayson Tatum', player_name: 'Jayson Tatum', market: 'player_points',
        selection: 'Jayson Tatum Over 27.5', side: 'Over', line: 27.5, point: 27.5, odds: -115, price: -115,
        tier: 'GOLD_STAR', final_score: 7.8, smash_spot: false, jarvis_active: false,
        confluence_level: 'PERFECT', alignment_pct: 82.0,
        scoring_breakdown: { research_score: 8.1, esoteric_score: 7.2, base_score: 5.8 },
        badges: ['SHARP_MONEY', 'REVERSE_LINE'],
        reasons: ['RESEARCH: Sharp Split +1.0', 'RESEARCH: Rest Advantage +0.4', 'CONFLUENCE: PERFECT +0.3'],
        game: 'Celtics @ Bucks', home_team: 'Bucks', away_team: 'Celtics', bookmaker: 'FanDuel', sport: 'NBA', isDemo: true
      },
      // EDGE_LEAN tier
      {
        player: 'Luka Doncic', player_name: 'Luka Doncic', market: 'player_assists',
        selection: 'Luka Doncic Over 9.5 assists', side: 'Over', line: 9.5, point: 9.5, odds: -105, price: -105,
        tier: 'EDGE_LEAN', final_score: 6.8, smash_spot: false, jarvis_active: true,
        confluence_level: 'MODERATE', alignment_pct: 68.0,
        scoring_breakdown: { research_score: 7.2, esoteric_score: 6.1, base_score: 5.5 },
        badges: ['JARVIS_TRIGGER'],
        reasons: ['RESEARCH: Matchup History +0.6', 'ESOTERIC: Jarvis Trigger 33 +0.3'],
        game: 'Mavericks @ Suns', home_team: 'Suns', away_team: 'Mavericks', bookmaker: 'BetMGM', sport: 'NBA', isDemo: true
      },
      // MONITOR tier
      {
        player: 'Nikola Jokic', player_name: 'Nikola Jokic', market: 'player_rebounds',
        selection: 'Nikola Jokic Over 11.5 rebounds', side: 'Over', line: 11.5, point: 11.5, odds: -120, price: -120,
        tier: 'MONITOR', final_score: 5.9, smash_spot: false, jarvis_active: false,
        confluence_level: 'DIVERGENT', alignment_pct: 52.0,
        scoring_breakdown: { research_score: 6.5, esoteric_score: 5.0, base_score: 5.2 },
        badges: [],
        reasons: ['RESEARCH: Recent Form +0.4', 'ESOTERIC: Divergent signals -0.2'],
        game: 'Nuggets @ Clippers', home_team: 'Clippers', away_team: 'Nuggets', bookmaker: 'Caesars', sport: 'NBA', isDemo: true
      },
    ],
    NFL: [
      {
        player: 'Patrick Mahomes', player_name: 'Patrick Mahomes', market: 'player_pass_yards',
        selection: 'Patrick Mahomes Over 285.5 yards', side: 'Over', line: 285.5, point: 285.5, odds: -115, price: -115,
        tier: 'GOLD_STAR', final_score: 7.6, smash_spot: false, jarvis_active: true,
        confluence_level: 'JARVIS_PERFECT', alignment_pct: 85.0,
        scoring_breakdown: { research_score: 7.8, esoteric_score: 7.2 },
        badges: ['SHARP_MONEY', 'PRIME_TIME', 'JARVIS_TRIGGER'],
        reasons: ['RESEARCH: Prime Time +0.5', 'ESOTERIC: Jarvis Trigger 93 +0.4'],
        game: 'Chiefs @ Bills', home_team: 'Bills', away_team: 'Chiefs', bookmaker: 'DraftKings', sport: 'NFL', isDemo: true
      },
    ],
    MLB: [
      {
        player: 'Shohei Ohtani', player_name: 'Shohei Ohtani', market: 'player_hits',
        selection: 'Shohei Ohtani Over 1.5 hits', side: 'Over', line: 1.5, point: 1.5, odds: -120, price: -120,
        tier: 'EDGE_LEAN', final_score: 6.7, smash_spot: false,
        confluence_level: 'MODERATE', alignment_pct: 65.0,
        scoring_breakdown: { research_score: 7.0, esoteric_score: 6.2 },
        badges: [],
        reasons: ['RESEARCH: Hot Streak +0.6'],
        game: 'Dodgers @ Giants', home_team: 'Giants', away_team: 'Dodgers', bookmaker: 'DraftKings', sport: 'MLB', isDemo: true
      },
    ],
    NHL: [
      {
        player: 'Connor McDavid', player_name: 'Connor McDavid', market: 'player_points',
        selection: 'Connor McDavid Over 1.5 points', side: 'Over', line: 1.5, point: 1.5, odds: -110, price: -110,
        tier: 'GOLD_STAR', final_score: 7.9, smash_spot: true, jarvis_active: true,
        confluence_level: 'IMMORTAL', alignment_pct: 92.0,
        scoring_breakdown: { research_score: 8.2, esoteric_score: 7.5 },
        badges: ['SMASH_SPOT', 'JARVIS_TRIGGER'],
        reasons: ['RESEARCH: Elite Form +0.8', 'ESOTERIC: Jarvis 2178 Immortal +1.0', 'CONFLUENCE: IMMORTAL +0.8'],
        game: 'Oilers @ Flames', home_team: 'Flames', away_team: 'Oilers', bookmaker: 'BetMGM', sport: 'NHL', isDemo: true
      },
    ]
  };
  return demos[sport] || demos.NBA;
};

const PropsSmashList = ({ sport = 'NBA', minConfidence = 0, minScore = 0, sortByConfidence = true }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState({ tier: 'ALL', propType: 'ALL' });
  const [sortBy, setSortBy] = useState(sortByConfidence ? 'score' : 'edge');

  useEffect(() => { fetchPropsPicks(); }, [sport]);

  const fetchPropsPicks = async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    try {
      const data = await api.getBestBets(sport);
      let propPicks = [];

      // v10.4: Use response.picks (merged array) and filter for props (player not null)
      if (data.picks && Array.isArray(data.picks)) {
        propPicks = data.picks.filter(p =>
          p.player || p.player_name || p.market?.includes('player_')
        );
      } else if (data.props?.picks) {
        // Fallback to old schema
        propPicks = data.props.picks;
      } else if (data.data) {
        propPicks = data.data.filter(p =>
          p.market?.includes('player_') || p.market?.includes('points') ||
          p.market?.includes('rebounds') || p.market?.includes('assists')
        );
      }

      // v12.0: Enforce community threshold (>= 6.5)
      propPicks = propPicks.filter(p => {
        const score = p.final_score || (p.confidence / 10) || 0;
        return score >= COMMUNITY_THRESHOLD ||
               p.tier === 'GOLD_STAR' ||
               p.tier === 'EDGE_LEAN' ||
               p.tier === 'TITANIUM_SMASH' ||
               p.titanium_triggered;
      });

      if (propPicks.length === 0) {
        // Demo data also respects community threshold
        const demoPicks = getDemoProps(sport).filter(p => (p.final_score || 0) >= COMMUNITY_THRESHOLD);
        setPicks(demoPicks);
        setIsDemo(true);
      } else {
        setPicks(propPicks);
      }
    } catch (err) {
      console.error('Error fetching props picks:', err);
      const demoPicks = getDemoProps(sport).filter(p => (p.final_score || 0) >= COMMUNITY_THRESHOLD);
      setPicks(demoPicks);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort picks
  const filteredPicks = useMemo(() => {
    let result = [...picks];

    // Apply parent-level minimum score filter (v10.4)
    if (minScore > 0) {
      result = result.filter(pick => (pick.final_score || (pick.confidence / 10) || 0) >= minScore);
    }

    // Apply parent-level minimum confidence filter (legacy)
    if (minConfidence > 0 && minScore === 0) {
      result = result.filter(pick => (pick.confidence || 0) >= minConfidence);
    }

    // Apply tier filter (v12.0 thresholds)
    if (filters.tier !== 'ALL') {
      result = result.filter(pick => {
        const tier = pick.tier || '';
        const score = pick.final_score || (pick.confidence / 10) || 0;
        switch (filters.tier) {
          // v12.0: TITANIUM requires backend titanium_triggered field
          case 'TITANIUM_SMASH': return tier === 'TITANIUM_SMASH' || pick.titanium_triggered;
          case 'GOLD_STAR': return tier === 'GOLD_STAR' || tier === 'TITANIUM_SMASH' || score >= 7.5;
          case 'EDGE_LEAN': return tier === 'EDGE_LEAN' || (score >= 6.5 && score < 7.5);
          case 'MONITOR': return tier === 'MONITOR' || (score >= 5.5 && score < 6.5);
          default: return true;
        }
      });
    }

    // Apply prop type filter
    if (filters.propType !== 'ALL') {
      result = result.filter(pick => {
        const market = pick.market?.toLowerCase() || '';
        switch (filters.propType) {
          case 'POINTS': return market.includes('points');
          case 'REBOUNDS': return market.includes('rebounds');
          case 'ASSISTS': return market.includes('assists');
          case '3PT': return market.includes('three') || market.includes('3pt');
          case 'OTHER': return !market.includes('points') && !market.includes('rebounds') &&
                               !market.includes('assists') && !market.includes('three');
          default: return true;
        }
      });
    }

    // Apply sorting - sortByConfidence from parent means sort by score (v10.4)
    const effectiveSortBy = sortByConfidence ? 'score' : sortBy;
    result.sort((a, b) => {
      switch (effectiveSortBy) {
        case 'score': return (b.final_score || (b.confidence / 10) || 0) - (a.final_score || (a.confidence / 10) || 0);
        case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
        case 'edge': return (b.edge || 0) - (a.edge || 0);
        case 'odds': return (a.price || a.odds || 0) - (b.price || b.odds || 0);
        default: return 0;
      }
    });

    return result;
  }, [picks, filters, sortBy, minConfidence, minScore, sortByConfidence]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#12121f', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #8B5CF6', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#9CA3AF' }}>Loading player props...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #EF4444' }}>
        <div style={{ color: '#EF4444', marginBottom: '12px' }}>{error}</div>
        <button onClick={fetchPropsPicks} style={{
          backgroundColor: '#8B5CF6', color: '#fff', border: 'none',
          padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
        }}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Player Props</span>
            <span style={{
              backgroundColor: '#8B5CF6', color: '#fff', padding: '2px 8px',
              borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
            }}>{filteredPicks.length}</span>
            {filteredPicks.length !== picks.length && (
              <span style={{
                backgroundColor: '#4B5563', color: '#9CA3AF', padding: '2px 8px',
                borderRadius: '10px', fontSize: '10px'
              }}>of {picks.length}</span>
            )}
            {isDemo && (
              <span style={{
                backgroundColor: '#FFD70030', color: '#FFD700', padding: '2px 8px',
                borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
              }}>SAMPLE DATA</span>
            )}
          </h3>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
            {isDemo ? 'Live picks refresh every 2 hours • Showing sample data' : 'Points, Rebounds, Assists & More'}
          </div>
        </div>
        <button onClick={fetchPropsPicks} style={{
          background: 'none', border: '1px solid #4B5563', color: '#9CA3AF',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
        }}>Refresh</button>
      </div>

      {/* Confidence Tier Legend */}
      <TierLegend />

      {/* Filter/Sort Controls */}
      <FilterControls
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {filteredPicks.length === 0 ? (
        <div style={{
          backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '40px',
          textAlign: 'center', border: '1px solid #2a2a4a'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ color: '#9CA3AF' }}>
            {picks.length === 0
              ? `No player props available for ${sport}`
              : 'No picks match your filters'}
          </div>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px' }}>
            {picks.length === 0
              ? 'Props typically available closer to game time'
              : 'Try adjusting your filter criteria'}
          </div>
          {picks.length > 0 && (
            <button
              onClick={() => setFilters({ tier: 'ALL', propType: 'ALL' })}
              style={{
                marginTop: '16px', backgroundColor: '#8B5CF6', color: '#fff',
                border: 'none', padding: '8px 16px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '12px'
              }}
            >Clear Filters</button>
          )}
        </div>
      ) : (
        <div>{filteredPicks.map((pick, idx) => <PropCard key={`${pick.player_name || pick.description}-${idx}`} pick={pick} />)}</div>
      )}
    </div>
  );
};

export default PropsSmashList;
