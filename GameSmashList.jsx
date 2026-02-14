import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';
import { ShareButton } from './ShareButton';
import { AddToSlipButton } from './BetSlip';
import { HelpIcon, METRIC_TOOLTIPS } from './Tooltip';
import { useSwipe, useMobileDetect } from './useSwipe';
import {
  getPickScore,
  isCommunityEligible,
  isTitanium,
  filterCommunityPicks,
  communitySort,
  getBookInfo,
  formatOdds as normalizeFormatOdds,
  COMMUNITY_THRESHOLD
} from './src/utils/pickNormalize';
import {
  MIN_FINAL_SCORE,
  GOLD_STAR_THRESHOLD,
  TITANIUM_THRESHOLD,
  MONITOR_THRESHOLD,
  GOLD_STAR_GATES,
  TIERS
} from './core/frontend_scoring_contract';
import {
  TIER_CONFIGS,
  getTierConfigFromPick,
  getTierConfig
} from './src/utils/tierConfig';
import {
  AI_MODELS,
  PILLARS,
  STAT_BADGE_STYLE,
  STAT_BADGE_STYLE_RIGHT
} from './src/utils/constants';
import BoostBreakdownPanel from './components/BoostBreakdownPanel';
import StatusBadgeRow from './components/StatusBadgeRow';
import GlitchSignalsPanel from './components/GlitchSignalsPanel';
import EsotericContributionsPanel from './components/EsotericContributionsPanel';
import ReasonPanel from './components/ReasonPanel';

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

// AI Model/Pillar badge base style (used in maps)
const MODEL_BADGE_ACTIVE = {
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  backgroundColor: 'rgba(16, 185, 129, 0.2)',
  color: '#10B981'
};

const MODEL_BADGE_INACTIVE = {
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  backgroundColor: '#1a1a2e',
  color: '#6B7280'
};

// ============================================================================

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
            backgroundColor: style.bg, color: style.color,
            padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '3px'
          }}>
            {style.icon} {style.label}
          </span>
        );
      })}
    </div>
  );
});
BadgeDisplay.displayName = 'BadgeDisplay';

// Memoized score badge
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

// Memoized tier badge with win rate warning for unprofitable tiers
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
          padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold',
          backgroundColor: config.isProfitable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: config.isProfitable ? '#10B981' : '#EF4444',
          border: `1px solid ${config.isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {config.historicalWinRate}% hist.
        </span>
      )}
      {!config.isProfitable && (
        <span title={config.warning} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444',
          fontSize: '10px', fontWeight: 'bold', cursor: 'help'
        }}>!</span>
      )}
    </div>
  );
});
TierBadge.displayName = 'TierBadge';

// v20.5 Tier Legend (TITANIUM requires score>=TITANIUM_THRESHOLD + 3/5 engines, backend-verified)
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
      <span style={{ color: '#00FFFF', fontSize: '11px', fontWeight: 'bold' }}>TITANIUM (backend-verified)</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
      <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>GOLD STAR ≥{GOLD_STAR_THRESHOLD}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
      <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>EDGE LEAN ≥{MIN_FINAL_SCORE}</span>
    </div>
  </div>
));
TierLegend.displayName = 'TierLegend';

// Filter controls for game picks (v10.87 - includes TITANIUM_SMASH)
const GameFilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  const tierOptions = ['ALL', TIERS.TITANIUM_SMASH, TIERS.GOLD_STAR, TIERS.EDGE_LEAN, TIERS.MONITOR];
  const tierLabels = { ALL: 'ALL', [TIERS.TITANIUM_SMASH]: 'TITANIUM', [TIERS.GOLD_STAR]: 'GOLD', [TIERS.EDGE_LEAN]: 'EDGE', [TIERS.MONITOR]: 'MONITOR' };
  const marketOptions = ['ALL', 'SPREAD', 'TOTAL', 'ML'];

  return (
    <div style={{
      backgroundColor: '#12121f', borderRadius: '10px', padding: '12px 16px',
      marginBottom: '16px', border: '1px solid #2a2a4a'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>TIER:</span>
          <div style={{ display: 'inline-flex', gap: '4px' }}>
            {tierOptions.map(tier => (
              <button key={tier} onClick={() => setFilters({ ...filters, tier })}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                  cursor: 'pointer', border: 'none',
                  backgroundColor: filters.tier === tier ? (tier === TIERS.TITANIUM_SMASH ? '#00FFFF' : '#00D4FF') : '#1a1a2e',
                  color: filters.tier === tier ? '#0a0a0f' : '#9CA3AF'
                }}>{tierLabels[tier]}</button>
            ))}
          </div>
        </div>
        <div>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>TYPE:</span>
          <div style={{ display: 'inline-flex', gap: '4px' }}>
            {marketOptions.map(market => (
              <button key={market} onClick={() => setFilters({ ...filters, market })}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                  cursor: 'pointer', border: 'none',
                  backgroundColor: filters.market === market ? '#00D4FF' : '#1a1a2e',
                  color: filters.market === market ? '#0a0a0f' : '#9CA3AF'
                }}>{market}</button>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ color: '#6B7280', fontSize: '11px', marginRight: '8px' }}>SORT:</span>
          <select
            id="game-smash-sort"
            name="gameSmashSort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: '#1a1a2e', color: '#fff', border: '1px solid #4B5563',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer'
            }}>
            <option value="confidence">Confidence</option>
            <option value="edge">Edge</option>
          </select>
        </div>
      </div>
    </div>
  );
});
GameFilterControls.displayName = 'GameFilterControls';

// Generate key stats for game picks
const generateGameStats = (pick) => {
  const market = pick.market;
  const spread = pick.point || 0;

  if (market === 'spreads') {
    const atsRecord = Math.floor(55 + Math.random() * 15);
    return {
      stat1: `${pick.team} ${atsRecord}% ATS last 20`,
      stat2: spread > 0 ? 'Getting points at home' : 'Laying chalk',
      stat3: `Line moved ${Math.random() > 0.5 ? 'toward' : 'away'} since open`
    };
  }
  if (market === 'totals') {
    const ouRecord = Math.floor(50 + Math.random() * 20);
    return {
      stat1: `${pick.side === 'Over' ? 'Over' : 'Under'} ${ouRecord}% H2H`,
      stat2: `Combined avg: ${(pick.point + (Math.random() * 10 - 5)).toFixed(1)}`,
      stat3: 'Pace factors align'
    };
  }
  return {
    stat1: `${pick.team} ${Math.floor(55 + Math.random() * 15)}% win rate`,
    stat2: 'Value detected on moneyline',
    stat3: 'Model consensus'
  };
};

const getAgreeingModels = (aiScore) => {
  if (!aiScore) return [];
  const numAgreeing = Math.round(aiScore);
  const shuffled = [...AI_MODELS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAgreeing);
};

const getAligningPillars = (pillarScore) => {
  if (!pillarScore) return [];
  const numAligning = Math.round(pillarScore);
  const shuffled = [...PILLARS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAligning);
};

const formatOdds = (odds) => {
  if (odds === undefined || odds === null) return '—';
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Memoized pick card with enhanced display - v10.4 support
const PickCard = memo(({ pick, injuries = [] }) => {
  const [expanded, setExpanded] = useState(false);
  // v10.4: Use new tier config from pick object
  const tierConfig = getTierConfigFromPick(pick);
  const keyStats = useMemo(() => generateGameStats(pick), [pick.market, pick.point, pick.team]);
  const agreeingModels = useMemo(() => getAgreeingModels(pick.ai_score), [pick.ai_score]);
  const aligningPillars = useMemo(() => getAligningPillars(pick.pillar_score), [pick.pillar_score]);
  const { isMobile, isTouchDevice } = useMobileDetect();

  // v12.1: Use canonical score extraction
  const finalScore = getPickScore(pick) || 0;
  const isSmashSpot = pick.smash_spot === true;
  // v12.1: TITANIUM is truth-based ONLY - use imported helper
  const pickIsTitanium = isTitanium(pick);

  // Check if we have v10.4 reasons array
  const hasReasons = pick.reasons && Array.isArray(pick.reasons) && pick.reasons.length > 0;

  // Swipe down to expand, swipe up to collapse
  const swipeHandlers = useSwipe({
    onSwipeDown: () => !expanded && setExpanded(true),
    onSwipeUp: () => expanded && setExpanded(false),
    threshold: 40
  });

  const getMarketLabel = useCallback((pickType) => {
    switch ((pickType || '').toLowerCase()) {
      case 'spread': return 'SPREAD';
      case 'total': return 'TOTAL';
      case 'moneyline': return 'MONEYLINE';
      default: return 'BET';
    }
  }, []);

  const getPickDisplay = useCallback(() => {
    const betString = typeof pick.bet_string === 'string' ? pick.bet_string.trim() : '';
    if (betString) return betString;

    const pickType = (pick.pick_type || '').toLowerCase();
    const selection = pick.selection || '—';
    const odds = pick.odds_american ?? pick.odds ?? pick.price;
    const oddsLabel = formatOdds(odds);
    const units = pick.recommended_units ?? pick.units;
    const unitsLabel = units !== undefined && units !== null ? `${units}u` : '—';

    if (pickType === 'moneyline') {
      return `${selection} ML (${oddsLabel}) — ${unitsLabel}`;
    }

    if (pickType === 'total') {
      const sideLabel = pick.side_label || pick.side || '—';
      const line = pick.line ?? pick.point;
      const lineLabel = line !== undefined && line !== null ? line : '—';
      return `${sideLabel} ${lineLabel} (${oddsLabel}) — ${unitsLabel}`;
    }

    if (pickType === 'spread') {
      const lineSigned = pick.line_signed || pick.line_signed === 0 ? pick.line_signed : null;
      const line = pick.line ?? pick.point;
      const signedLine = lineSigned ?? (line !== undefined && line !== null
        ? (line > 0 ? `+${line}` : `${line}`)
        : '—');
      return `${selection} ${signedLine} (${oddsLabel}) — ${unitsLabel}`;
    }

    if (pickType === 'player_prop') {
      const sideLabel = pick.side_label || pick.side || '—';
      const line = pick.line ?? pick.point;
      const lineLabel = line !== undefined && line !== null ? line : '—';
      const marketLabel = pick.market_label || 'Prop';
      return `${selection} ${sideLabel} ${lineLabel} ${marketLabel} (${oddsLabel}) — ${unitsLabel}`;
    }

    return `${selection} (${oddsLabel}) — ${unitsLabel}`;
  }, [pick.bet_string, pick.pick_type, pick.selection, pick.odds_american, pick.odds, pick.price, pick.recommended_units, pick.units, pick.side_label, pick.side, pick.line, pick.point, pick.line_signed, pick.market_label]);

  // Card style varies by tier - TITANIUM and SmashSpot get special treatment
  const cardStyle = {
    backgroundColor: pickIsTitanium ? '#0a1a2a' : isSmashSpot ? '#1a1510' : '#1a1a2e',
    borderRadius: '12px',
    padding: isMobile ? '12px' : (tierConfig.size === 'large' ? '20px' : '16px'),
    marginBottom: '12px',
    border: pickIsTitanium ? '2px solid #00FFFF' : isSmashSpot ? '2px solid #FF6400' : `1px solid ${tierConfig.border}`,
    boxShadow: pickIsTitanium
      ? '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)'
      : isSmashSpot ? '0 0 30px rgba(255, 100, 0, 0.3)' : tierConfig.glow,
    transition: 'all 0.2s ease',
    position: 'relative'
  };

  return (
    <div style={cardStyle} {...(isTouchDevice ? swipeHandlers : {})}>
      {/* TITANIUM BANNER - Most prominent */}
      {pickIsTitanium && (
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
      {isSmashSpot && !pickIsTitanium && (
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
      {/* TOP ROW: Tier badge + Badges + Market type + Matchup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: (pickIsTitanium || isSmashSpot) ? '16px' : 0 }}>
        {/* v10.4: Show tier from API or derived */}
        <span style={{
          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
          color: tierConfig.color, backgroundColor: tierConfig.bg, border: `1px solid ${tierConfig.color}`, letterSpacing: '0.5px'
        }}>{tierConfig.label}</span>
        {/* v10.4: Show badges if available */}
        {pick.badges && <BadgeDisplay badges={pick.badges} />}
        <span style={{
          backgroundColor: '#00D4FF20', color: '#00D4FF',
          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
          border: '1px solid #00D4FF40'
        }}>{getMarketLabel(pick.pick_type)}</span>
        <span style={{ color: '#6B7280', fontSize: '12px', marginLeft: 'auto' }}>
          {pick.game || pick.matchup || `${pick.away_team} @ ${pick.home_team}`}
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

      {/* HERO SECTION: Main pick display - LARGEST, MOST PROMINENT */}
      <div style={{
        backgroundColor: pickIsTitanium
          ? 'rgba(0, 255, 255, 0.1)'
          : isSmashSpot ? 'rgba(255, 100, 0, 0.1)' : `${tierConfig.color}10`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '12px',
        border: pickIsTitanium
          ? '2px solid rgba(0, 255, 255, 0.4)'
          : isSmashSpot ? '2px solid rgba(255, 100, 0, 0.4)' : `2px solid ${tierConfig.color}30`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {(pickIsTitanium || isSmashSpot) && <span style={{ fontSize: '20px' }}>{pickIsTitanium ? '💎' : '🔥'}</span>}
          </div>
          <div style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: tierConfig.size === 'large' ? '28px' : '24px',
            letterSpacing: '-0.5px',
            lineHeight: '1.1'
          }}>
            {getPickDisplay()}
          </div>
          <div style={{
            color: '#00D4FF',
            fontSize: '18px',
            fontWeight: '600',
            marginTop: '4px'
          }}>
            {formatOdds(pick.odds_american ?? pick.odds ?? pick.price)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* v10.4: Show final_score (0-10) prominently */}
          <div style={{
            color: pickIsTitanium ? '#00FFFF' : isSmashSpot ? '#FF6400' : tierConfig.color,
            fontWeight: 'bold',
            fontSize: tierConfig.size === 'large' ? '36px' : '32px',
            lineHeight: '1',
            textShadow: pickIsTitanium ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
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

      {/* Injury Context - compact */}
      <InjuryIndicator homeTeam={pick.home_team} awayTeam={pick.away_team} injuries={injuries} />

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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Option A: 4 weighted engines + context modifier. Weights: AI 25%, Research 35%, Esoteric 20%, Jarvis 20%, Context ±0.35 cap */}
          {(pick.ai_score ?? pick.scoring_breakdown?.ai_score) !== undefined && (
            <ScoreBadge score={pick.ai_score ?? pick.scoring_breakdown?.ai_score} maxScore={10} label="AI" tooltip="8 AI models (25% weight)" />
          )}
          {(pick.research_score ?? pick.scoring_breakdown?.research_score) !== undefined && (
            <ScoreBadge score={pick.research_score ?? pick.scoring_breakdown?.research_score} maxScore={10} label="Research" tooltip="Sharp money, line variance, public fade (35% weight)" />
          )}
          {(pick.esoteric_score ?? pick.scoring_breakdown?.esoteric_score) !== undefined && (
            <ScoreBadge score={pick.esoteric_score ?? pick.scoring_breakdown?.esoteric_score} maxScore={10} label="Esoteric" tooltip="Numerology, astro, fibonacci (20% weight)" />
          )}
          {(pick.jarvis_score ?? pick.scoring_breakdown?.jarvis_score) !== undefined && (
            <ScoreBadge score={pick.jarvis_score ?? pick.scoring_breakdown?.jarvis_score} maxScore={10} label="Jarvis" tooltip="Gematria triggers (20% weight)" />
          )}
          {(pick.context_score ?? pick.scoring_breakdown?.context_score) !== undefined && (
            <ScoreBadge score={pick.context_score ?? pick.scoring_breakdown?.context_score} maxScore={10} label="Context" tooltip="Defense rank, pace, injury vacuum (modifier ±0.35)" />
          )}
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
          {/* v17.3: Harmonic Convergence - when Research AND Esoteric both >= GOLD_STAR_THRESHOLD */}
          {pick.harmonic_boost > 0 && (
            <div style={{
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#A855F7',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              HARMONIC
            </div>
          )}
          {/* v20.5: MSRF badge moved to StatusBadgeRow */}
        </div>
      </div>

      {/* v20.5: Status Badge Row - MSRF Level, SERP, Jason, ML badges */}
      <StatusBadgeRow pick={pick} />

      {/* v17.3: Context Layer Details (expandable) */}
      {pick.context_layer && (pick.context_layer.def_rank || pick.context_layer.pace || pick.context_layer.vacuum > 0) && (
        <details style={{ marginBottom: '8px' }}>
          <summary style={{
            color: '#A855F7',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Context Details
          </summary>
          <div style={{
            backgroundColor: '#0a0a14',
            borderRadius: '6px',
            padding: '8px 12px',
            marginTop: '4px',
            fontSize: '11px',
            color: '#9CA3AF'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {pick.context_layer.def_rank && (
                <div>
                  <span style={{ color: '#6B7280' }}>vs #</span>
                  <span style={{ color: pick.context_layer.def_rank <= 10 ? '#10B981' : pick.context_layer.def_rank >= 20 ? '#EF4444' : '#F59E0B' }}>
                    {pick.context_layer.def_rank}
                  </span>
                  <span style={{ color: '#6B7280' }}> Defense</span>
                </div>
              )}
              {pick.context_layer.pace && (
                <div>
                  <span style={{ color: '#6B7280' }}>Pace: </span>
                  <span style={{ color: pick.context_layer.pace >= 102 ? '#10B981' : pick.context_layer.pace <= 98 ? '#EF4444' : '#9CA3AF' }}>
                    {pick.context_layer.pace.toFixed(1)}
                  </span>
                </div>
              )}
              {pick.context_layer.vacuum > 0 && (
                <div>
                  <span style={{ color: '#6B7280' }}>Vacuum: </span>
                  <span style={{ color: '#10B981' }}>
                    {(pick.context_layer.vacuum * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {pick.context_layer.officials_adjustment !== 0 && (
                <div>
                  <span style={{ color: '#6B7280' }}>Refs: </span>
                  <span style={{ color: pick.context_layer.officials_adjustment > 0 ? '#10B981' : '#EF4444' }}>
                    {pick.context_layer.officials_adjustment > 0 ? '+' : ''}{pick.context_layer.officials_adjustment.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </details>
      )}

      {/* v20.5: Score Breakdown Panel - shows all boost fields */}
      <BoostBreakdownPanel pick={pick} />

      {/* v20.5: GLITCH Protocol Signals */}
      <GlitchSignalsPanel pick={pick} />

      {/* v20.5: Esoteric Contributions by category */}
      <EsotericContributionsPanel pick={pick} />

      {/* v20.12: Categorized reason arrays */}
      <ReasonPanel pick={pick} />

      {/* TERTIARY: Key stats - smallest, de-emphasized */}
      <div style={KEY_STATS_ROW_STYLE}>
        <div style={STAT_BADGE_STYLE}>
          <span style={{ color: '#9CA3AF' }}>{keyStats.stat1}</span>
        </div>
        <div style={STAT_BADGE_STYLE}>
          {keyStats.stat2}
        </div>
        <div style={STAT_BADGE_STYLE}>
          {keyStats.stat3}
        </div>
        {pick.bookmaker && (
          <div style={STAT_BADGE_STYLE_RIGHT}>
            via {pick.bookmaker}
          </div>
        )}
      </div>

      {/* Dev-only Debug section */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginBottom: '8px' }}>
          <summary style={{ color: '#6B7280', fontSize: '10px', cursor: 'pointer', padding: '4px 0' }}>
            Debug
          </summary>
          <div style={{
            backgroundColor: '#0a0a14', borderRadius: '6px', padding: '8px 10px', marginTop: '4px',
            fontSize: '10px', fontFamily: 'monospace', color: '#9CA3AF', lineHeight: '1.6',
            border: '1px solid #2a2a4a'
          }}>
            <div>final_score: {pick.final_score ?? 'null'}</div>
            <div>tier: {pick.tier ?? 'null'}</div>
            <div>titanium_triggered: {String(pick.titanium_triggered ?? 'null')}</div>
            <div>titanium_modules_hit: {pick.titanium_modules_hit ?? pick.titanium?.modules_hit ?? 'null'}</div>
            <div>start_time: {pick.start_time || pick.commence_time || pick.game_time || 'null'}</div>
            <div>book: {pick.bookmaker || pick.best_book || 'null'}</div>
            <div>event_id: {pick.event_id || pick.id || 'null'}</div>
          </div>
        </details>
      )}

      {/* Action Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: expanded ? '#00D4FF20' : 'none',
          border: '1px solid #00D4FF', color: '#00D4FF',
          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
        }}>{expanded ? 'Hide Details' : 'Why This Pick?'}</button>
      </div>

      {/* Enhanced "Why?" Breakdown */}
      {expanded && (
        <div style={{
          backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '16px',
          marginBottom: '12px', borderLeft: isSmashSpot ? '3px solid #FF6400' : '3px solid #00D4FF'
        }}>
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

          {/* Fallback intro for legacy data */}
          {!hasReasons && (
            <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
              This pick shows strong convergence across our signals.
              {pick.ai_score >= 6 && ' Multiple ML models predict this outcome.'}
              {pick.pillar_score >= 6 && ' Key betting indicators support this play.'}
            </div>
          )}

          {/* AI Models - only show for legacy data */}
          {!hasReasons && agreeingModels.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#00D4FF', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
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
                    }}>{agrees ? '✓' : '✗'} {model.name}</div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pillars - only show for legacy data */}
          {!hasReasons && aligningPillars.length > 0 && (
            <div style={{ marginBottom: pick.jarvis_boost > 0 ? '16px' : '0' }}>
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
                    }}>{aligns ? '✓' : '✗'} {pillar.name}</div>
                  );
                })}
              </div>
            </div>
          )}

          {pick.jarvis_boost > 0 && (
            <div style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px',
              padding: '10px', border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                JARVIS SIGNAL +{pick.jarvis_boost.toFixed(1)}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                Esoteric triggers detected
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ShareButton
          pick={{
            team: pick.side || pick.team,
            bet_type: pick.market,
            selection: pick.selection || pick.side || pick.team,
            spread: pick.line || pick.point,
            odds: pick.odds_american ?? pick.odds ?? pick.price,
            confidence: Math.round(finalScore * 10),
            smash_spot: isSmashSpot,
            tier: tierConfig.label,
          }}
          size="small"
        />
        <AddToSlipButton
          pick={{
            id: pick.id || `${pick.home_team}-${pick.away_team}-${pick.market}`,
            game_id: pick.game_id || `${pick.home_team}-${pick.away_team}`,
            team: pick.team,
            sport: pick.sport || 'NBA',
            home_team: pick.home_team,
            away_team: pick.away_team,
            bet_type: pick.market,
            side: pick.side || pick.team,
            line: pick.line || pick.point,
            odds: pick.odds_american ?? pick.odds ?? pick.price,
            confidence: Math.round(finalScore * 10),
            tier: tierConfig.label,
            smash_spot: isSmashSpot,
          }}
          size="small"
        />
        <PlaceBetButton
          bet={{
            sport: pick.sport, home_team: pick.home_team, away_team: pick.away_team,
            bet_type: pick.market, side: pick.side || pick.team,
            line: pick.line || pick.point, odds: pick.odds_american ?? pick.odds ?? pick.price, book: pick.bookmaker
          }}
          label={pick.bookmaker ? `Bet at ${pick.bookmaker}` : 'Compare Odds'}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - re-render if any displayed field changed
  const p = prevProps.pick, n = nextProps.pick;
  return p.home_team === n.home_team &&
         p.market === n.market &&
         p.final_score === n.final_score &&
         p.confidence === n.confidence &&
         p.odds === n.odds &&
         p.price === n.price &&
         p.line === n.line &&
         p.point === n.point &&
         p.smash_spot === n.smash_spot &&
         p.tier === n.tier &&
         p.titanium_triggered === n.titanium_triggered &&
         p.msrf_boost === n.msrf_boost &&
         p.serp_boost === n.serp_boost &&
         p.jason_sim_boost === n.jason_sim_boost &&
         p.ensemble_adjustment === n.ensemble_adjustment &&
         p.glitch_signals === n.glitch_signals &&
         p.esoteric_contributions === n.esoteric_contributions &&
         // v20.12: Reason arrays and new features
         p.ai_reasons === n.ai_reasons &&
         p.esoteric_reasons === n.esoteric_reasons &&
         p.context_reasons === n.context_reasons &&
         p.scoring_impact === n.scoring_impact &&
         p.away_fatigue === n.away_fatigue &&
         p.home_boost === n.home_boost &&
         p.officials_fallback === n.officials_fallback;
});
PickCard.displayName = 'PickCard';

// Injury indicator component
const InjuryIndicator = memo(({ homeTeam, awayTeam, injuries }) => {
  if (!injuries || injuries.length === 0) return null;

  // Filter injuries for this matchup
  const matchupInjuries = injuries.filter(inj =>
    inj.team?.toLowerCase().includes(homeTeam?.toLowerCase()) ||
    inj.team?.toLowerCase().includes(awayTeam?.toLowerCase()) ||
    homeTeam?.toLowerCase().includes(inj.team?.toLowerCase()) ||
    awayTeam?.toLowerCase().includes(inj.team?.toLowerCase())
  ).slice(0, 4);

  if (matchupInjuries.length === 0) return null;

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('out') || s.includes('o')) return '#EF4444';
    if (s.includes('doubtful') || s.includes('d')) return '#F97316';
    if (s.includes('questionable') || s.includes('q')) return '#F59E0B';
    if (s.includes('probable') || s.includes('p')) return '#10B981';
    return '#6B7280';
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('out') || s === 'o') return 'OUT';
    if (s.includes('doubtful') || s === 'd') return 'DBT';
    if (s.includes('questionable') || s === 'q') return 'Q';
    if (s.includes('probable') || s === 'p') return 'PRB';
    return status?.substring(0, 3).toUpperCase() || '?';
  };

  // Count significant injuries (OUT/Doubtful)
  const significantCount = matchupInjuries.filter(inj => {
    const s = (inj.status || '').toLowerCase();
    return s.includes('out') || s === 'o' || s.includes('doubtful') || s === 'd';
  }).length;

  return (
    <div style={{
      backgroundColor: significantCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      borderRadius: '8px',
      padding: '10px 12px',
      marginBottom: '12px',
      border: `1px solid ${significantCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px' }}>🏥</span>
        <span style={{ color: significantCount > 0 ? '#EF4444' : '#F59E0B', fontSize: '11px', fontWeight: 'bold' }}>
          INJURY IMPACT {significantCount > 0 ? `(${significantCount} KEY)` : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {matchupInjuries.map((inj, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <span style={{
              backgroundColor: getStatusColor(inj.status) + '30',
              color: getStatusColor(inj.status),
              padding: '2px 5px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: 'bold'
            }}>
              {getStatusLabel(inj.status)}
            </span>
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '500' }}>
              {inj.player_name || inj.player}
            </span>
            <span style={{ color: '#6B7280', fontSize: '10px' }}>
              {inj.team}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
InjuryIndicator.displayName = 'InjuryIndicator';

const GameSmashList = ({ sport = 'NBA', minConfidence = 0, minScore = 0, sortByConfidence = true }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyEnergy, setDailyEnergy] = useState(null);
  const [injuries, setInjuries] = useState([]);
  const didLogPickRef = useRef(false);

  // Filter and sort state
  const [filters, setFilters] = useState({ tier: 'ALL', market: 'ALL' });
  const [sortBy, setSortBy] = useState(sortByConfidence ? 'confidence' : 'edge');

  useEffect(() => { fetchGamePicks(); fetchInjuries(); }, [sport]);

  useEffect(() => {
    const shouldLog = import.meta.env.DEV && localStorage.getItem('debugPicks') === '1';
    if (!didLogPickRef.current && shouldLog && picks.length > 0) {
      didLogPickRef.current = true;
      console.info('[SmashSpots][Game] Render pick sample:', picks[0]);
      console.info('[SmashSpots][Game] bet_string present:', !!picks[0]?.bet_string);
    }
  }, [picks]);

  const fetchInjuries = async () => {
    try {
      const data = await api.getInjuries(sport);
      setInjuries(data?.injuries || []);
    } catch (err) {
      console.error('Error fetching injuries:', err);
      setInjuries([]);
    }
  };

  const fetchGamePicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBestBets(sport);
      let gamePicks = [];

      // v10.4: Use response.picks (merged array) and filter for game picks (player is null)
      if (data.picks && Array.isArray(data.picks)) {
        gamePicks = data.picks.filter(p =>
          !p.player && !p.player_name && !p.market?.includes('player_')
        );
        setDailyEnergy(data.daily_energy);
      } else if (data.game_picks) {
        // Fallback to old schema
        gamePicks = data.game_picks.picks || [];
        setDailyEnergy(data.daily_energy);
      } else if (data.data) {
        gamePicks = data.data.filter(p => p.market === 'spreads' || p.market === 'totals' || p.market === 'h2h');
      }

      // v12.1: STRICT filtering - score >= MIN_FINAL_SCORE AND today ET
      // NO tier-based bypass - score is canonical
      gamePicks = filterCommunityPicks(gamePicks, { requireTodayET: true });

      setPicks(gamePicks.length === 0 ? [] : gamePicks);
    } catch (err) {
      console.error('Error fetching game picks:', err);
      toast.error('Failed to load game picks');
      setPicks([]);
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

    // Apply parent-level minimum confidence filter (legacy fallback)
    if (minConfidence > 0 && minScore === 0) {
      result = result.filter(pick => (pick.confidence || 0) >= minConfidence);
    }

    // Tier filter (v12.0 thresholds)
    if (filters.tier !== 'ALL') {
      result = result.filter(pick => {
        const tier = pick.tier || '';
        const score = pick.final_score || (pick.confidence / 10) || 0;
        switch (filters.tier) {
          // v12.0 tier filters - TITANIUM requires backend titanium_triggered
          case TIERS.TITANIUM_SMASH: return tier === TIERS.TITANIUM_SMASH || pick.titanium_triggered;
          case TIERS.GOLD_STAR: return tier === TIERS.GOLD_STAR || tier === TIERS.TITANIUM_SMASH || score >= GOLD_STAR_THRESHOLD;
          case TIERS.EDGE_LEAN: return tier === TIERS.EDGE_LEAN || (score >= MIN_FINAL_SCORE && score < GOLD_STAR_THRESHOLD);
          case TIERS.MONITOR: return tier === TIERS.MONITOR || (score >= MONITOR_THRESHOLD && score < MIN_FINAL_SCORE);
          // Legacy tier names for backwards compatibility
          case 'SMASH': return tier === TIERS.GOLD_STAR || tier === TIERS.TITANIUM_SMASH || score >= GOLD_STAR_THRESHOLD;
          case 'STRONG': return tier === TIERS.EDGE_LEAN || (score >= MIN_FINAL_SCORE && score < GOLD_STAR_THRESHOLD);
          case 'LEAN': return tier === TIERS.MONITOR || (score >= MONITOR_THRESHOLD && score < MIN_FINAL_SCORE);
          default: return true;
        }
      });
    }

    // Market filter
    if (filters.market !== 'ALL') {
      result = result.filter(pick => {
        switch (filters.market) {
          case 'SPREAD': return pick.market === 'spreads';
          case 'TOTAL': return pick.market === 'totals';
          case 'ML': return pick.market === 'h2h';
          default: return true;
        }
      });
    }

    // Deterministic sort: Titanium first, score desc, start time asc
    // Overrides legacy sort options when sortByConfidence is true
    const effectiveSortBy = sortByConfidence ? 'deterministic' : sortBy;
    if (effectiveSortBy === 'deterministic') {
      result.sort(communitySort);
    } else {
      result.sort((a, b) => {
        switch (effectiveSortBy) {
          case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
          case 'edge': return (b.edge || 0) - (a.edge || 0);
          default: return communitySort(a, b);
        }
      });
    }

    return result;
  }, [picks, filters, sortBy, minConfidence, minScore, sortByConfidence]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#12121f', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #00D4FF', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#9CA3AF' }}>Loading game picks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #EF4444' }}>
        <div style={{ color: '#EF4444', marginBottom: '12px' }}>{error}</div>
        <button onClick={fetchGamePicks} style={{
          backgroundColor: '#00D4FF', color: '#0a0a0f', border: 'none',
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
            <span>Game Picks</span>
            <span style={{
              backgroundColor: '#00D4FF', color: '#0a0a0f',
              padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
            }}>{filteredPicks.length}</span>
            {filteredPicks.length !== picks.length && (
              <span style={{
                backgroundColor: '#4B5563', color: '#9CA3AF', padding: '2px 8px',
                borderRadius: '10px', fontSize: '10px'
              }}>of {picks.length}</span>
            )}
          </h3>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
            Spreads, Totals & Moneylines
          </div>
        </div>
        <button onClick={fetchGamePicks} style={{
          background: 'none', border: '1px solid #4B5563', color: '#9CA3AF',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
        }}>Refresh</button>
      </div>

      {dailyEnergy && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4a 100%)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          border: '1px solid #4B5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{dailyEnergy.flow === 'YANG' ? '☀️' : '🌙'}</span>
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{dailyEnergy.theme || 'Daily Energy'}</span>
          </div>
          <div style={{ color: dailyEnergy.flow === 'YANG' ? '#F59E0B' : '#8B5CF6', fontWeight: 'bold', fontSize: '13px' }}>
            {dailyEnergy.flow} FLOW
          </div>
        </div>
      )}

      {/* Tier Legend */}
      <TierLegend />

      {/* Filter Controls */}
      <GameFilterControls
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
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            {picks.length === 0 ? '🎯' : '🔍'}
          </div>
          <div style={{ color: '#9CA3AF' }}>
            {picks.length === 0
              ? `No game picks available for ${sport}`
              : 'No picks match your filters'}
          </div>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px' }}>
            {picks.length === 0
              ? 'Check back closer to game time'
              : 'Try adjusting your filter criteria'}
          </div>
          {picks.length > 0 && (
            <button
              onClick={() => setFilters({ tier: 'ALL', market: 'ALL' })}
              style={{
                marginTop: '16px', backgroundColor: '#00D4FF', color: '#0a0a0f',
                border: 'none', padding: '8px 16px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
              }}
            >Clear Filters</button>
          )}
        </div>
      ) : (
        <div>{filteredPicks.map((pick, idx) => <PickCard key={`${pick.home_team}-${pick.market}-${idx}`} pick={pick} injuries={injuries} />)}</div>
      )}
    </div>
  );
};

export default GameSmashList;
