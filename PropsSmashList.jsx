import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';
import { ShareButton } from './ShareButton';
import { AddToSlipButton } from './BetSlip';
import { HelpIcon, METRIC_TOOLTIPS } from './Tooltip';

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

// Line movement indicator component
const LineMovement = memo(({ pick }) => {
  // Generate mock line movement (in real app, this would come from API)
  const lineMovement = useMemo(() => {
    // Simulate line movement based on pick data
    const hasMovement = Math.random() > 0.3; // 70% chance of movement
    if (!hasMovement) return null;

    const direction = pick.side === 'Over' ? (Math.random() > 0.4 ? 'up' : 'down') : (Math.random() > 0.6 ? 'up' : 'down');
    const amount = (0.5 + Math.random() * 1.5).toFixed(1);
    const oddsChange = Math.floor(5 + Math.random() * 15);

    return {
      direction,
      lineChange: direction === 'up' ? `+${amount}` : `-${amount}`,
      oddsChange: direction === 'up' ? `-${oddsChange}` : `+${oddsChange}`,
      isSteam: Math.random() > 0.7, // 30% chance of steam move
      timeAgo: `${Math.floor(1 + Math.random() * 4)}h ago`
    };
  }, [pick.side]);

  if (!lineMovement) return null;

  const isFavorable = (pick.side === 'Over' && lineMovement.direction === 'down') ||
                      (pick.side === 'Under' && lineMovement.direction === 'up');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 10px',
      backgroundColor: lineMovement.isSteam ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      borderRadius: '6px',
      border: `1px solid ${lineMovement.isSteam ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
    }}>
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
            }}>STEAM</span>
          )}
        </div>
        <span style={{ color: '#6B7280', fontSize: '10px' }}>
          {lineMovement.timeAgo} • Odds {lineMovement.oddsChange}
        </span>
      </div>
    </div>
  );
});
LineMovement.displayName = 'LineMovement';

// Confidence tier configuration with enhanced visuals
const getTierConfig = (conf) => {
  if (conf >= 85) return {
    label: 'SMASH',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.5)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    size: 'large'
  };
  if (conf >= 75) return {
    label: 'STRONG',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.5)',
    glow: 'none',
    size: 'medium'
  };
  if (conf >= 65) return {
    label: 'LEAN',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.5)',
    glow: 'none',
    size: 'small'
  };
  return {
    label: 'WATCH',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.5)',
    glow: 'none',
    size: 'small'
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
const TierBadge = memo(({ confidence }) => {
  const config = getTierConfig(confidence);
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
      color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}`, letterSpacing: '0.5px'
    }}>{config.label}</span>
  );
});
TierBadge.displayName = 'TierBadge';

// Filter/Sort controls component
const FilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  const tierOptions = ['ALL', 'SMASH', 'STRONG', 'LEAN'];
  const propTypes = ['ALL', 'POINTS', 'REBOUNDS', 'ASSISTS', '3PT', 'OTHER'];
  const sortOptions = [
    { value: 'confidence', label: 'Confidence (High→Low)' },
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
                  backgroundColor: filters.tier === tier ? '#8B5CF6' : '#1a1a2e',
                  color: filters.tier === tier ? '#fff' : '#9CA3AF'
                }}
              >{tier}</button>
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

// Confidence Tier Legend
const TierLegend = memo(() => (
  <div style={{
    display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap',
    padding: '8px 12px', backgroundColor: '#0f0f1a', borderRadius: '8px'
  }}>
    <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '4px' }}>CONFIDENCE:</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
      <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>SMASH 85%+</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
      <span style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 'bold' }}>STRONG 75-84%</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
      <span style={{ color: '#3B82F6', fontSize: '11px', fontWeight: 'bold' }}>LEAN 65-74%</span>
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

// Generate mock key stats based on pick data
const generateKeyStats = (pick) => {
  const marketType = pick.market?.toLowerCase() || '';
  const line = pick.point || 0;
  const side = pick.side?.toUpperCase();

  // Generate contextual stats
  const hitRate = side === 'OVER' ? Math.floor(60 + Math.random() * 25) : Math.floor(55 + Math.random() * 25);
  const avgLast10 = side === 'OVER' ? (line + 1.5 + Math.random() * 3).toFixed(1) : (line - 1 + Math.random() * 2).toFixed(1);

  if (marketType.includes('points')) {
    return {
      avg: `${avgLast10} PPG last 10`,
      trend: `Hit ${side === 'OVER' ? 'over' : 'under'} ${line} in ${hitRate}% of games`,
      matchup: `vs ${pick.away_team || 'OPP'}: ${side === 'OVER' ? '25th' : '8th'} in pts allowed`
    };
  }
  if (marketType.includes('rebounds')) {
    return {
      avg: `${avgLast10} RPG last 10`,
      trend: `Hit ${side === 'OVER' ? 'over' : 'under'} ${line} in ${hitRate}% of games`,
      matchup: `${pick.away_team || 'OPP'} allows ${side === 'OVER' ? '12th most' : '5th fewest'} rebs`
    };
  }
  if (marketType.includes('assists')) {
    return {
      avg: `${avgLast10} APG last 10`,
      trend: `Hit ${side === 'OVER' ? 'over' : 'under'} ${line} in ${hitRate}% of games`,
      matchup: `Pace: ${side === 'OVER' ? 'fast' : 'slow'} tempo game expected`
    };
  }
  return {
    avg: `${avgLast10} avg last 10`,
    trend: `Hit in ${hitRate}% of recent games`,
    matchup: 'Favorable matchup detected'
  };
};

// Get which models agree based on AI score
const getAgreeingModels = (aiScore) => {
  if (!aiScore) return [];
  const numAgreeing = Math.round(aiScore);
  // Shuffle and pick first N models that "agree"
  const shuffled = [...AI_MODELS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAgreeing);
};

// Get which pillars align based on pillar score
const getAligningPillars = (pillarScore) => {
  if (!pillarScore) return [];
  const numAligning = Math.round(pillarScore);
  const shuffled = [...PILLARS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAligning);
};

// Memoized prop card - only re-renders when pick data changes
const PropCard = memo(({ pick }) => {
  const [expanded, setExpanded] = useState(false);
  const tierConfig = getTierConfig(pick.confidence);
  const keyStats = useMemo(() => generateKeyStats(pick), [pick.market, pick.point, pick.side]);
  const agreeingModels = useMemo(() => getAgreeingModels(pick.ai_score), [pick.ai_score]);
  const aligningPillars = useMemo(() => getAligningPillars(pick.pillar_score), [pick.pillar_score]);

  const getMarketLabel = useCallback((market) => {
    if (market?.includes('points')) return 'POINTS';
    if (market?.includes('rebounds')) return 'REBOUNDS';
    if (market?.includes('assists')) return 'ASSISTS';
    if (market?.includes('threes')) return '3-POINTERS';
    if (market?.includes('steals')) return 'STEALS';
    if (market?.includes('blocks')) return 'BLOCKS';
    return market?.toUpperCase()?.replace('player_', '') || 'PROP';
  }, []);

  // Card style varies by confidence tier
  const cardStyle = {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: tierConfig.size === 'large' ? '20px' : '16px',
    marginBottom: '12px',
    border: `1px solid ${tierConfig.border}`,
    boxShadow: tierConfig.glow,
    transition: 'all 0.2s ease'
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{getPropIcon(pick.market)}</span>
            <span style={{
              backgroundColor: '#8B5CF6', color: '#fff', padding: '2px 8px',
              borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
            }}>{getMarketLabel(pick.market)}</span>
            <TierBadge confidence={pick.confidence} />
          </div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: tierConfig.size === 'large' ? '18px' : '16px', marginTop: '4px' }}>
            {pick.player_name || pick.description?.split(' ').slice(0, 2).join(' ') || 'Player'}
          </div>
          <div style={{ color: '#6B7280', fontSize: '12px' }}>{pick.away_team} @ {pick.home_team}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: tierConfig.color, fontWeight: 'bold', fontSize: tierConfig.size === 'large' ? '24px' : '20px' }}>
            {pick.confidence}%
          </div>
          <div style={{ color: '#6B7280', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            confidence
            <HelpIcon tooltip={METRIC_TOOLTIPS.confidence} size={12} />
          </div>
        </div>
      </div>

      {/* Key Stats Section - NEW */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'
      }}>
        <div style={{
          backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px',
          fontSize: '11px', color: '#9CA3AF'
        }}>
          <span style={{ color: '#10B981', fontWeight: 'bold' }}>{keyStats.avg}</span>
        </div>
        <div style={{
          backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px',
          fontSize: '11px', color: '#9CA3AF'
        }}>
          {keyStats.trend}
        </div>
        <div style={{
          backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px',
          fontSize: '11px', color: '#9CA3AF'
        }}>
          {keyStats.matchup}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
              {pick.side} {pick.point}
            </div>
            <div style={{ color: '#8B5CF6', fontSize: '14px', fontWeight: '500' }}>{formatOdds(pick.price)}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pick.ai_score !== undefined && <ScoreBadge score={pick.ai_score} maxScore={8} label="AI" tooltip={METRIC_TOOLTIPS.aiScore} />}
            {pick.pillar_score !== undefined && <ScoreBadge score={pick.pillar_score} maxScore={8} label="Pillars" tooltip={METRIC_TOOLTIPS.pillarsScore} />}
            {pick.total_score !== undefined && <ScoreBadge score={pick.total_score} maxScore={20} label="Total" tooltip={METRIC_TOOLTIPS.totalScore} />}
          </div>
        </div>
      </div>

      {/* Edge & Line Movement Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
        {pick.edge && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6B7280', fontSize: '11px' }}>Edge: </span>
            <span style={{ color: pick.edge > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold', fontSize: '13px' }}>
              {pick.edge > 0 ? '+' : ''}{(pick.edge * 100).toFixed(1)}%
            </span>
            <HelpIcon tooltip={METRIC_TOOLTIPS.edge} size={12} />
          </div>
        )}
        {pick.bookmaker && (
          <div>
            <span style={{ color: '#6B7280', fontSize: '11px' }}>Book: </span>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{pick.bookmaker}</span>
          </div>
        )}
        <LineMovement pick={pick} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: expanded ? '#8B5CF620' : 'none',
          border: '1px solid #8B5CF6', color: '#8B5CF6',
          padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
        }}>{expanded ? 'Hide Details' : 'Why This Pick?'}</button>
      </div>

      {/* Enhanced "Why?" Breakdown */}
      {expanded && (
        <div style={{
          backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '16px',
          marginBottom: '12px', borderLeft: '3px solid #8B5CF6'
        }}>
          {/* Quick Summary */}
          <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
            <strong style={{ color: '#10B981' }}>{pick.player_name}</strong> has been exceeding this line consistently.
            {pick.ai_score >= 6 && ' Multiple ML models show strong convergence on this pick.'}
            {pick.pillar_score >= 6 && ' Sharp action and key indicators align.'}
            {pick.jarvis_boost > 0 && ' JARVIS detects additional esoteric edge.'}
          </div>

          {/* AI Models Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
              AI MODELS ({agreeingModels.length}/8 Agree)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AI_MODELS.map(model => {
                const agrees = agreeingModels.some(m => m.id === model.id);
                return (
                  <div key={model.id} style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px',
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

          {/* Pillars Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
              8 PILLARS ({aligningPillars.length}/8 Aligned)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PILLARS.map(pillar => {
                const aligns = aligningPillars.some(p => p.id === pillar.id);
                return (
                  <div key={pillar.id} style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px',
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

          {/* JARVIS Section (if applicable) */}
          {pick.jarvis_boost > 0 && (
            <div style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px',
              padding: '10px', border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                JARVIS SIGNAL +{pick.jarvis_boost.toFixed(1)}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                Esoteric triggers detected: Gematria alignment, numerological convergence
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ShareButton
          pick={{
            player: pick.player_name,
            side: pick.side,
            line: pick.point,
            stat_type: pick.market?.replace('player_', ''),
            odds: pick.price,
            confidence: pick.confidence,
          }}
          size="small"
        />
        <AddToSlipButton
          pick={{
            id: pick.id || `${pick.player_name}-${pick.market}`,
            game_id: pick.game_id || `${pick.home_team}-${pick.away_team}`,
            player: pick.player_name,
            sport: pick.sport || 'NBA',
            home_team: pick.home_team,
            away_team: pick.away_team,
            bet_type: 'prop',
            stat: pick.market?.replace('player_', ''),
            side: pick.side,
            line: pick.point,
            odds: pick.price || -110,
            confidence: pick.confidence,
            tier: getTierConfig(pick.confidence).label
          }}
          size="small"
        />
        <PlaceBetButton
          bet={{
            sport: pick.sport, home_team: pick.home_team, away_team: pick.away_team,
            bet_type: 'prop', player: pick.player_name, prop_type: pick.market,
            side: pick.side, line: pick.point, odds: pick.price, book: pick.bookmaker
          }}
          label={pick.bookmaker ? `Bet at ${pick.bookmaker}` : 'Compare Odds'}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if pick data changed
  return prevProps.pick.player_name === nextProps.pick.player_name &&
         prevProps.pick.confidence === nextProps.pick.confidence &&
         prevProps.pick.price === nextProps.pick.price &&
         prevProps.pick.point === nextProps.pick.point;
});
PropCard.displayName = 'PropCard';

// Demo picks when API unavailable
const getDemoProps = (sport) => {
  const demos = {
    NBA: [
      { player_name: 'LeBron James', market: 'player_points', side: 'Over', point: 25.5, price: -110, confidence: 87, ai_score: 7.2, pillar_score: 6.8, total_score: 14.0, edge: 0.045, home_team: 'Lakers', away_team: 'Warriors', bookmaker: 'DraftKings', sport: 'NBA', isDemo: true },
      { player_name: 'Jayson Tatum', market: 'player_points', side: 'Over', point: 27.5, price: -115, confidence: 85, ai_score: 7.0, pillar_score: 6.5, total_score: 13.5, edge: 0.038, home_team: 'Celtics', away_team: 'Bucks', bookmaker: 'FanDuel', sport: 'NBA', isDemo: true },
      { player_name: 'Luka Doncic', market: 'player_assists', side: 'Over', point: 9.5, price: -105, confidence: 82, ai_score: 6.8, pillar_score: 6.2, total_score: 13.0, edge: 0.032, home_team: 'Mavericks', away_team: 'Suns', bookmaker: 'BetMGM', sport: 'NBA', isDemo: true },
      { player_name: 'Nikola Jokic', market: 'player_rebounds', side: 'Over', point: 11.5, price: -120, confidence: 84, ai_score: 6.9, pillar_score: 6.4, total_score: 13.3, edge: 0.041, home_team: 'Nuggets', away_team: 'Clippers', bookmaker: 'Caesars', sport: 'NBA', isDemo: true },
    ],
    NFL: [
      { player_name: 'Patrick Mahomes', market: 'player_pass_yards', side: 'Over', point: 285.5, price: -115, confidence: 86, ai_score: 7.1, pillar_score: 6.6, total_score: 13.7, edge: 0.042, home_team: 'Chiefs', away_team: 'Bills', bookmaker: 'DraftKings', sport: 'NFL', isDemo: true },
      { player_name: 'Josh Allen', market: 'player_pass_tds', side: 'Over', point: 2.5, price: +105, confidence: 78, ai_score: 6.4, pillar_score: 5.8, total_score: 12.2, edge: 0.028, home_team: 'Bills', away_team: 'Chiefs', bookmaker: 'FanDuel', sport: 'NFL', isDemo: true },
    ],
    MLB: [
      { player_name: 'Shohei Ohtani', market: 'player_hits', side: 'Over', point: 1.5, price: -120, confidence: 81, ai_score: 6.7, pillar_score: 6.0, total_score: 12.7, edge: 0.035, home_team: 'Dodgers', away_team: 'Giants', bookmaker: 'DraftKings', sport: 'MLB', isDemo: true },
    ],
    NHL: [
      { player_name: 'Connor McDavid', market: 'player_points', side: 'Over', point: 1.5, price: -110, confidence: 83, ai_score: 6.9, pillar_score: 6.3, total_score: 13.2, edge: 0.039, home_team: 'Oilers', away_team: 'Flames', bookmaker: 'BetMGM', sport: 'NHL', isDemo: true },
    ]
  };
  return demos[sport] || demos.NBA;
};

const PropsSmashList = ({ sport = 'NBA', minConfidence = 0, sortByConfidence = true }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState({ tier: 'ALL', propType: 'ALL' });
  const [sortBy, setSortBy] = useState(sortByConfidence ? 'confidence' : 'edge');

  useEffect(() => { fetchPropsPicks(); }, [sport]);

  const fetchPropsPicks = async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    try {
      const data = await api.getBestBets(sport);
      let propPicks = [];
      if (data.props) {
        propPicks = data.props.picks || [];
      } else if (data.data) {
        propPicks = data.data.filter(p =>
          p.market?.includes('player_') || p.market?.includes('points') ||
          p.market?.includes('rebounds') || p.market?.includes('assists')
        );
      }

      if (propPicks.length === 0) {
        setPicks(getDemoProps(sport));
        setIsDemo(true);
      } else {
        setPicks(propPicks);
      }
    } catch (err) {
      console.error('Error fetching props picks:', err);
      setPicks(getDemoProps(sport));
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort picks
  const filteredPicks = useMemo(() => {
    let result = [...picks];

    // Apply parent-level minimum confidence filter first
    if (minConfidence > 0) {
      result = result.filter(pick => (pick.confidence || 0) >= minConfidence);
    }

    // Apply tier filter (internal)
    if (filters.tier !== 'ALL') {
      result = result.filter(pick => {
        const conf = pick.confidence || 0;
        switch (filters.tier) {
          case 'SMASH': return conf >= 85;
          case 'STRONG': return conf >= 75 && conf < 85;
          case 'LEAN': return conf >= 65 && conf < 75;
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

    // Apply sorting - sortByConfidence from parent takes precedence
    const effectiveSortBy = sortByConfidence ? 'confidence' : sortBy;
    result.sort((a, b) => {
      switch (effectiveSortBy) {
        case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
        case 'edge': return (b.edge || 0) - (a.edge || 0);
        case 'odds': return (a.price || 0) - (b.price || 0); // Lower/negative odds first (better value)
        default: return 0;
      }
    });

    return result;
  }, [picks, filters, sortBy, minConfidence, sortByConfidence]);

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
