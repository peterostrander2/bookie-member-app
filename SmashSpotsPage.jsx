import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import PropsSmashList from './PropsSmashList';
import GameSmashList from './GameSmashList';
import { usePreferences } from './usePreferences';
import api from './api';
import { AddToSlipButton } from './BetSlip';
import { useToast } from './Toast';
import {
  getPickScore,
  isCommunityEligible,
  isTitanium,
  getTierForStyling,
  filterCommunityPicks,
  communitySort,
  COMMUNITY_THRESHOLD
} from './src/utils/pickNormalize';
import {
  MIN_FINAL_SCORE,
  GOLD_STAR_THRESHOLD,
  TITANIUM_THRESHOLD,
  MONITOR_THRESHOLD,
  TITANIUM_RULE,
  TIERS
} from './core/frontend_scoring_contract';

// v12.1: 60 second polling for live data
const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 seconds for live experience

// v12.0 Tier-based filter options (matches backend tiering.py)
// Community threshold enforced - no MONITOR or below shown
const TIER_FILTERS = [
  { id: 'titanium_smash', label: 'TITANIUM', tier: TIERS.TITANIUM_SMASH, minScore: TITANIUM_THRESHOLD, color: '#00FFFF' },
  { id: 'gold_star', label: 'GOLD STAR+', tier: TIERS.GOLD_STAR, minScore: GOLD_STAR_THRESHOLD, color: '#FFD700' },
  { id: 'edge_lean', label: 'ALL PLAYABLE', tier: TIERS.EDGE_LEAN, minScore: MIN_FINAL_SCORE, color: '#10B981', isDefault: true }
  // NOTE: MONITOR and PASS filtered out by community threshold
];

// Legacy confidence filter mapping (for backwards compatibility)
const CONFIDENCE_FILTERS = [
  { id: 'lean', label: '65%+ (Profitable)', minConfidence: 65, color: '#3B82F6', isDefault: true },
  { id: 'strong', label: '75%+', minConfidence: 75, color: '#F59E0B' },
  { id: 'smash', label: '85%+', minConfidence: 85, color: '#10B981' },
  { id: 'all', label: 'All Picks', minConfidence: 0, color: '#6B7280' }
];

// Sports options (moved outside component to prevent recreation on every render)
const SPORTS = [
  { id: 'NBA', label: 'NBA', icon: '🏀' },
  { id: 'NFL', label: 'NFL', icon: '🏈' },
  { id: 'MLB', label: 'MLB', icon: '⚾' },
  { id: 'NHL', label: 'NHL', icon: '🏒' },
  { id: 'NCAAB', label: 'NCAAB', icon: '🏀' }
];

// Tab options (moved outside component to prevent recreation on every render)
const TABS = [
  { id: 'props', label: 'Player Props', icon: '👤', color: '#8B5CF6' },
  { id: 'games', label: 'Game Picks', icon: '🎯', color: '#00D4FF' }
];

// v12.0 Tier display configuration (matches backend tiering.py)
// TITANIUM requires: final_score >= TITANIUM_THRESHOLD AND 3/4 engines >= engineThreshold
const TIER_CONFIG = {
  [TIERS.TITANIUM_SMASH]: {
    label: 'TITANIUM SMASH',
    color: '#00FFFF',
    emoji: '💎',
    minScore: TITANIUM_THRESHOLD,
    action: 'SMASH',
    units: 2.5,
    glow: '0 0 20px #00FFFF, 0 0 40px #00FFFF50',
    gradient: 'linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)'
  },
  [TIERS.GOLD_STAR]: { label: 'GOLD STAR', color: '#FFD700', emoji: '🌟', minScore: GOLD_STAR_THRESHOLD, action: 'SMASH', units: 2.0 },
  [TIERS.EDGE_LEAN]: { label: 'EDGE LEAN', color: '#10B981', emoji: '💚', minScore: MIN_FINAL_SCORE, action: 'PLAY', units: 1.0 },
  [TIERS.MONITOR]: { label: 'MONITOR', color: '#F59E0B', emoji: '🟡', minScore: MONITOR_THRESHOLD, action: 'WATCH', units: 0.0 },
  [TIERS.PASS]: { label: 'PASS', color: '#6B7280', emoji: '⚪', minScore: 0, action: 'SKIP', units: 0.0 }
};

// v12.0 Tier display for legend (TITANIUM is visually dominant)
// Only show tiers at community threshold
const CONFIDENCE_TIERS = [
  { label: 'TITANIUM', color: '#00FFFF', range: `≥${TITANIUM_THRESHOLD} + 3/4 modules, backend-verified`, tier: TIERS.TITANIUM_SMASH, prominent: true },
  { label: 'GOLD STAR', color: '#FFD700', range: `≥${GOLD_STAR_THRESHOLD}`, tier: TIERS.GOLD_STAR },
  { label: 'EDGE LEAN', color: '#10B981', range: `≥${MIN_FINAL_SCORE}`, tier: TIERS.EDGE_LEAN }
];

// Get tier config from pick (v12.1 - TITANIUM is truth-based ONLY)
const getTierFromPick = (pick) => {
  // TITANIUM: ONLY when backend explicitly indicates it (truth-based)
  // DO NOT infer from score >= TITANIUM_THRESHOLD
  if (isTitanium(pick)) {
    return TIER_CONFIG[TIERS.TITANIUM_SMASH];
  }

  // Use tier from API if available and NOT titanium
  if (pick.tier && TIER_CONFIG[pick.tier] && pick.tier !== TIERS.TITANIUM_SMASH) {
    return TIER_CONFIG[pick.tier];
  }

  // Fallback: derive from score (for styling only, NOT for titanium)
  const score = getPickScore(pick);
  if (score === null) return TIER_CONFIG[TIERS.PASS];
  if (score >= GOLD_STAR_THRESHOLD) return TIER_CONFIG[TIERS.GOLD_STAR];
  if (score >= MIN_FINAL_SCORE) return TIER_CONFIG[TIERS.EDGE_LEAN];
  if (score >= MONITOR_THRESHOLD) return TIER_CONFIG[TIERS.MONITOR];
  return TIER_CONFIG[TIERS.PASS];
};

// Unit sizing based on tier (v10.87 - uses backend units field when available)
const getUnitSizeFromTier = (pick) => {
  // v10.87: Use units from backend if available
  if (pick.units !== undefined && pick.units !== null) {
    const units = pick.units;
    if (units >= 2.5) return { units, label: `${units} Units`, emoji: '💎🔥' };
    if (units >= 2.0) return { units, label: `${units} Units`, emoji: '🔥🔥' };
    if (units >= 1.5) return { units, label: `${units} Units`, emoji: '🔥' };
    if (units >= 1.0) return { units, label: `${units} Unit${units > 1 ? 's' : ''}`, emoji: '✓' };
    if (units > 0) return { units, label: `${units} Units`, emoji: '⚡' };
    return { units: 0, label: 'Pass', emoji: '⚠️' };
  }

  // Fallback: derive from tier
  const tier = pick.tier || TIERS.PASS;
  const isSmashSpot = pick.smash_spot === true;

  if (tier === TIERS.TITANIUM_SMASH) return { units: 2.5, label: '2.5 Units', emoji: '💎🔥' };
  if (isSmashSpot) return { units: 2, label: '2 Units', emoji: '🔥🔥' };
  if (tier === TIERS.GOLD_STAR) return { units: 2, label: '2 Units', emoji: '🔥🔥' };
  if (tier === TIERS.EDGE_LEAN) return { units: 1, label: '1 Unit', emoji: '✓' };
  if (tier === TIERS.MONITOR) return { units: 0, label: 'Watch', emoji: '⚡' };
  return { units: 0, label: 'Pass', emoji: '⚠️' };
};

// Legacy unit sizing based on confidence (backwards compat)
const getUnitSize = (confidence) => {
  if (confidence >= 90) return { units: 2, label: '2 Units', emoji: '🔥🔥' };
  if (confidence >= 85) return { units: 1.5, label: '1.5 Units', emoji: '🔥' };
  if (confidence >= 75) return { units: 1, label: '1 Unit', emoji: '✓' };
  if (confidence >= 65) return { units: 0.5, label: '0.5 Units', emoji: '⚡' };
  return { units: 0, label: 'Pass', emoji: '⚠️' };
};

// ============================================================================
// STYLE CONSTANTS - Moved outside components to avoid recreation on each render
// ============================================================================

// Base style for sport buttons (shared properties)
const SPORT_BUTTON_BASE = {
  padding: '10px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  minWidth: '80px',
  justifyContent: 'center'
};

// Get sport button style based on active state
const getSportButtonStyle = (isActive) => ({
  ...SPORT_BUTTON_BASE,
  border: isActive ? '2px solid #10B981' : '2px solid transparent',
  backgroundColor: isActive ? '#10B98120' : '#1a1a2e',
  color: isActive ? '#10B981' : '#9CA3AF'
});

// Container styles
const SPORT_BUTTONS_CONTAINER = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const TAB_CONTAINER = {
  display: 'flex',
  backgroundColor: '#12121f',
  borderRadius: '12px',
  padding: '4px',
  marginBottom: '16px'
};

const FILTER_CONTAINER = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  padding: '12px 16px',
  backgroundColor: '#12121f',
  borderRadius: '10px'
};

// ============================================================================

// Today's Best Bets Component - v12.1 with strict filtering
const TodaysBestBets = memo(({ sport, onPickClick, onError }) => {
  const [bestPicks, setBestPicks] = useState([]);
  const [titaniumPicks, setTitaniumPicks] = useState([]); // TITANIUM picks (backend truth-based)
  const [smashSpots, setSmashSpots] = useState([]); // TRUE SmashSpots (rare)
  const [displayTier, setDisplayTier] = useState(TIERS.GOLD_STAR);
  const [totalActionable, setTotalActionable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestBets = async () => {
      setLoading(true);
      try {
        const data = await api.getBestBets(sport);
        if (data?.error) {
          onError?.(data.error);
          setBestPicks([]);
          setDisplayTier('NONE');
        } else {
          onError?.(null);

        // v12.1: STRICT filtering - score >= MIN_FINAL_SCORE AND today ET
        // NO tier-based bypass - score is canonical
          const allPicks = filterCommunityPicks(data?.picks || [], { requireTodayET: true });

        // Find TITANIUM picks (backend truth-based ONLY)
          const titanium = allPicks.filter(isTitanium);
          setTitaniumPicks(titanium);

        // Find TRUE SmashSpots (rare, high-conviction)
          const trueSmashSpots = allPicks.filter(p => p.smash_spot === true);
          setSmashSpots(trueSmashSpots);

        // Count actionable picks (community threshold)
          setTotalActionable(allPicks.length);

        // Get top picks by deterministic sort (Titanium first, score desc, time asc)
          const goldStarPicks = allPicks
            .filter(p => {
              const score = getPickScore(p);
              return score !== null && score >= GOLD_STAR_THRESHOLD;
            })
            .sort(communitySort)
            .slice(0, 3);

          if (goldStarPicks.length > 0) {
            setBestPicks(goldStarPicks);
            setDisplayTier(TIERS.GOLD_STAR);
          } else {
            // Fallback to EDGE_LEAN (>= MIN_FINAL_SCORE)
            const edgeLeanPicks = allPicks
              .sort(communitySort)
              .slice(0, 3);

            if (edgeLeanPicks.length > 0) {
              setBestPicks(edgeLeanPicks);
              setDisplayTier(TIERS.EDGE_LEAN);
            } else {
              setBestPicks([]);
              setDisplayTier('NONE');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching best bets:', err);
        onError?.({ status: 'FETCH_ERROR', text: err?.message || 'Unknown error' });
        setBestPicks([]);
        setDisplayTier('NONE');
      }
      setLoading(false);
    };

    fetchBestBets();
  }, [sport]);

  // v10.4 tier-based styling
  const tierDisplayConfig = displayTier === TIERS.GOLD_STAR
    ? { color: '#FFD700', label: 'GOLD STAR', borderColor: '#FFD70040', bgGradient: 'linear-gradient(135deg, #2a2a0a 0%, #3a3a1a 100%)', emoji: '🌟' }
    : displayTier === TIERS.EDGE_LEAN
    ? { color: '#10B981', label: 'EDGE LEAN', borderColor: '#10B98140', bgGradient: 'linear-gradient(135deg, #0a2a1a 0%, #1a3a2a 100%)', emoji: '💚' }
    : { color: '#F59E0B', label: 'MONITOR', borderColor: '#F59E0B40', bgGradient: 'linear-gradient(135deg, #2a1a0a 0%, #3a2a1a 100%)', emoji: '🟡' };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0a2a1a 0%, #1a3a2a 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '2px solid #10B98140'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10B981' }}>
          <span style={{ animation: 'pulse 1.5s infinite' }}>🎯</span>
          Loading Best Bets...
        </div>
      </div>
    );
  }

  // No actionable picks at all
  if (bestPicks.length === 0 && totalActionable === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #4B556340',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
        <div style={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}>
          No Picks Available Right Now
        </div>
        <div style={{ color: '#6B7280', fontSize: '13px' }}>
          Check back soon — new SMASH picks drop every 2 hours.
        </div>
      </div>
    );
  }

  // No featured picks but actionable picks exist - show quick action
  if (bestPicks.length === 0 && totalActionable > 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #3B82F640'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>📊</span>
              <span style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '16px' }}>
                No SMASH/STRONG Picks Right Now
              </span>
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '13px' }}>
              {totalActionable} actionable picks at LEAN tier (65%+) available below
            </div>
          </div>
          <button
            onClick={() => onPickClick && onPickClick('props')}
            style={{
              backgroundColor: '#3B82F6',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            View {totalActionable} LEAN+ Picks →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: tierDisplayConfig.bgGradient,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: `2px solid ${tierDisplayConfig.borderColor}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        right: '-5%',
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${tierDisplayConfig.color}20 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* TITANIUM Banner - Most prominent, shows when TITANIUM picks exist */}
      {titaniumPicks.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)',
          border: '2px solid #00FFFF',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1)',
          animation: 'titaniumPulse 2s infinite'
        }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px #00FFFF)' }}>💎</span>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#00FFFF',
              fontWeight: 'bold',
              fontSize: '18px',
              textShadow: '0 0 10px #00FFFF50',
              letterSpacing: '1px'
            }}>
              {titaniumPicks.length} TITANIUM {titaniumPicks.length === 1 ? 'PICK' : 'PICKS'} DETECTED
            </div>
            <div style={{ color: '#7dd3fc', fontSize: '12px', marginTop: '2px' }}>
              Ultra-rare: Score ≥{TITANIUM_THRESHOLD} + {TITANIUM_RULE.minEnginesGte}/4 engines at meaningful level (≥{TITANIUM_RULE.engineThreshold})
            </div>
          </div>
          <div style={{
            backgroundColor: '#00FFFF',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            2.5 UNITS
          </div>
        </div>
      )}
      <style>{`
        @keyframes titaniumPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 40px rgba(0, 255, 255, 0.15); }
        }
      `}</style>

      {/* SmashSpots Banner - show if any TRUE smash_spot picks */}
      {smashSpots.length > 0 && titaniumPicks.length === 0 && (
        <div style={{
          backgroundColor: 'rgba(255, 100, 50, 0.15)',
          border: '2px solid #FF6432',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🔥</span>
          <div>
            <div style={{ color: '#FF6432', fontWeight: 'bold', fontSize: '14px' }}>
              {smashSpots.length} TRUE SMASH {smashSpots.length === 1 ? 'SPOT' : 'SPOTS'} DETECTED
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
              Rare confluence: Research + Esoteric + JARVIS aligned
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{tierDisplayConfig.emoji}</span>
        <div>
          <h3 style={{ color: tierDisplayConfig.color, margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Today's Best Bets
            {displayTier === TIERS.EDGE_LEAN && (
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'normal', marginLeft: '8px' }}>
                (No GOLD STAR picks available)
              </span>
            )}
          </h3>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>
            {tierDisplayConfig.label} tier (score ≥{displayTier === TIERS.GOLD_STAR ? GOLD_STAR_THRESHOLD : MIN_FINAL_SCORE}) • High conviction plays
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          backgroundColor: `${tierDisplayConfig.color}20`,
          color: tierDisplayConfig.color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          border: `1px solid ${tierDisplayConfig.borderColor}`
        }}>
          {bestPicks.length} {tierDisplayConfig.label} {bestPicks.length === 1 ? 'PICK' : 'PICKS'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
        {bestPicks.map((pick, idx) => {
          const unitSize = getUnitSizeFromTier(pick);
          const isProp = pick.player || pick.player_name || pick.market?.includes('player');
          // v12.1: Use selection field, fallback to constructed display
          const pickDisplay = pick.selection || (isProp
            ? `${pick.player || pick.player_name} ${pick.side || 'Over'} ${pick.line || pick.point}`
            : `${pick.matchup || pick.game} ${pick.line > 0 ? `+${pick.line}` : pick.line || ''}`);
          const pickKey = pick.id || `${pick.player || pick.player_name || pick.matchup}-${pick.market || pick.bet_type}`;
          const isSmashSpot = pick.smash_spot === true;
          // v12.1: TITANIUM is truth-based ONLY - use imported helper
          const pickIsTitanium = isTitanium(pick);
          const pickTierConfig = getTierFromPick(pick);
          const pickScore = getPickScore(pick);

          return (
            <div
              key={pickKey}
              style={{
                backgroundColor: pickIsTitanium
                  ? 'rgba(0, 40, 60, 0.9)'
                  : isSmashSpot
                    ? 'rgba(255, 100, 50, 0.1)'
                    : 'rgba(10, 26, 21, 0.1)',
                borderRadius: '12px',
                padding: '14px 16px',
                border: pickIsTitanium
                  ? '2px solid #00FFFF'
                  : isSmashSpot
                    ? '2px solid #FF6432'
                    : `1px solid ${tierDisplayConfig.color}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: pickIsTitanium ? '0 0 15px rgba(0, 255, 255, 0.3)' : 'none'
              }}
              onClick={() => onPickClick && onPickClick(isProp ? 'props' : 'games')}
            >
              {/* TITANIUM badge - most prominent */}
              {pickIsTitanium && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #00FFFF, #0088aa)',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                }}>
                  💎 TITANIUM
                </div>
              )}
              {/* SmashSpot fire badge */}
              {isSmashSpot && !pickIsTitanium && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '10px',
                  backgroundColor: '#FF6432',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🔥 SMASH SPOT
                </div>
              )}

              {/* Rank badge */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: pickIsTitanium
                  ? '#00FFFF'
                  : isSmashSpot
                    ? '#FF6432'
                    : (idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#000',
                boxShadow: pickIsTitanium ? '0 0 10px #00FFFF' : 'none'
              }}>
                {pickIsTitanium ? '💎' : isSmashSpot ? '🔥' : `#${idx + 1}`}
              </div>

              {/* Pick details */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>
                  {pickDisplay}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{pick.matchup || pick.game || `${pick.away_team} @ ${pick.home_team}`}</span>
                  {pick.odds && <span style={{ color: '#00D4FF' }}>
                    {pick.odds > 0 ? `+${pick.odds}` : pick.odds}
                  </span>}
                  {pick.confluence_level && (
                    <span style={{
                      backgroundColor: pick.confluence_level === 'IMMORTAL' ? '#8B5CF620' : '#10B98120',
                      color: pick.confluence_level === 'IMMORTAL' ? '#8B5CF6' : '#10B981',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      {pick.confluence_level}
                    </span>
                  )}
                </div>
                {/* Badges row */}
                {pick.badges && pick.badges.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {pick.badges.slice(0, 3).map((badge, i) => (
                      <span key={i} style={{
                        backgroundColor: '#1a1a2e',
                        color: '#9CA3AF',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontSize: '9px'
                      }}>
                        {badge.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Score + Unit size */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: pickIsTitanium ? '#00FFFF' : isSmashSpot ? '#FF6432' : pickTierConfig.color,
                  fontWeight: 'bold',
                  fontSize: '20px',
                  lineHeight: '1',
                  textShadow: pickIsTitanium ? '0 0 10px #00FFFF50' : 'none'
                }}>
                  {pickScore !== null ? pickScore.toFixed(1) : '--'}
                </div>
                <div style={{ color: '#6B7280', fontSize: '9px' }}>score</div>
                <div style={{
                  backgroundColor: pickIsTitanium
                    ? '#00FFFF20'
                    : isSmashSpot
                      ? '#FF643220'
                      : `${pickTierConfig.color}20`,
                  color: pickIsTitanium ? '#00FFFF' : isSmashSpot ? '#FF6432' : pickTierConfig.color,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginTop: '4px',
                  border: pickIsTitanium ? '1px solid #00FFFF50' : 'none'
                }}>
                  {unitSize.emoji} {unitSize.label}
                </div>
              </div>

              {/* Quick add button */}
              <AddToSlipButton
                pick={{
                  id: pick.id || pickKey,
                  game_id: pick.game_id || `${pick.home_team}-${pick.away_team}`,
                  player: pick.player || pick.player_name,
                  team: pick.team,
                  sport: sport,
                  home_team: pick.home_team,
                  away_team: pick.away_team,
                  bet_type: isProp ? 'prop' : (pick.market || 'spread'),
                  stat: pick.market?.replace('player_', ''),
                  side: pick.side,
                  line: pick.line || pick.point,
                  odds: pick.odds || pick.price || -110,
                  confidence: pick.confidence || Math.round((pick.final_score || 0) * 10),
                  tier: pick.tier || displayTier,
                  smash_spot: isSmashSpot
                }}
                size="medium"
                prominent
              />
            </div>
          );
        })}
      </div>

      {/* Action hint */}
      <div style={{
        marginTop: '12px',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '11px'
      }}>
        Click any pick to view full analysis • Add to betslip with ➕
      </div>
    </div>
  );
});

const SmashSpotsPage = () => {
  const { preferences, updatePreference } = usePreferences();
  const { showToast } = useToast();
  const [sport, setSport] = useState(preferences.favoriteSport || 'NBA');
  const [activeTab, setActiveTab] = useState(preferences.defaultTab || 'props');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // v12.0: Default to EDGE_LEAN (community threshold >= MIN_FINAL_SCORE)
  const [confidenceFilter, setConfidenceFilter] = useState('edge_lean');
  const [sortByConfidence, setSortByConfidence] = useState(true);
  const [newPickCount, setNewPickCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const previousPicksRef = useRef(new Set());

  // Manual refresh function with toast notifications for new picks
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setLastUpdated(new Date());
    setNextRefresh(AUTO_REFRESH_INTERVAL);

    // Check for new picks and notify
    try {
      const data = await api.getBestBets(sport);
      if (data?.error) {
        setApiError(data.error);
        setIsRefreshing(false);
        return;
      }
      setApiError(null);
      const picks = data?.picks || [];

      // v12.1: STRICT filtering - score >= MIN_FINAL_SCORE AND today ET only
      // NO tier-based bypass - score is canonical
      const communityPicks = filterCommunityPicks(picks, { requireTodayET: true });

      // Detect new picks
      const currentIds = new Set(communityPicks.map(p => p.id || `${p.player || p.matchup}-${p.market}`));
      const newPicks = communityPicks.filter(p => {
        const pickId = p.id || `${p.player || p.matchup}-${p.market}`;
        return !previousPicksRef.current.has(pickId);
      });

      // Show toast for new TITANIUM or GOLD_STAR picks
      // TITANIUM: truth-based only (not inferred from score)
      if (previousPicksRef.current.size > 0) {
        const titaniumPicks = newPicks.filter(isTitanium);
        const goldStarPicks = newPicks.filter(p => {
          const score = getPickScore(p);
          return score !== null && score >= GOLD_STAR_THRESHOLD && !isTitanium(p);
        });

        if (titaniumPicks.length > 0) {
          showToast(`💎 ${titaniumPicks.length} NEW TITANIUM ${titaniumPicks.length === 1 ? 'PICK' : 'PICKS'}!`, 'success');
        } else if (goldStarPicks.length > 0) {
          showToast(`🌟 ${goldStarPicks.length} new GOLD STAR ${goldStarPicks.length === 1 ? 'pick' : 'picks'}`, 'info');
        } else if (newPicks.length > 0) {
          setNewPickCount(newPicks.length);
        }
      }

      previousPicksRef.current = currentIds;
    } catch (err) {
      console.error('Refresh error:', err);
      setApiError({ status: 'FETCH_ERROR', text: err?.message || 'Unknown error' });
    }

    setTimeout(() => setIsRefreshing(false), 1000);
  }, [sport, showToast]);

  // Auto-refresh timer
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    // Countdown timer for UI
    const countdownTimer = setInterval(() => {
      setNextRefresh(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [handleRefresh]);

  // Reset timer when sport changes
  useEffect(() => {
    setLastUpdated(new Date());
    setNextRefresh(AUTO_REFRESH_INTERVAL);
  }, [sport]);

  // Persist sport selection
  const handleSportChange = (newSport) => {
    setSport(newSport);
    updatePreference('favoriteSport', newSport);
  };

  // Persist tab selection
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    updatePreference('defaultTab', newTab);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatCountdown = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            color: '#fff', margin: 0, fontSize: '28px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>🔥</span>
            SMASH Spots
          </h1>
          <p style={{ color: '#6B7280', margin: '8px 0 0', fontSize: '14px' }}>
            Highest conviction picks • 8 ML Models + 8 Pillars
          </p>
        </div>

        {apiError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            color: '#FCA5A5',
            fontSize: '13px',
          }}>
            <strong style={{ color: '#F87171' }}>Backend Error</strong>
            <div>HTTP: {apiError.status}</div>
            <div>Body: {(apiError.text || '').slice(0, 200)}</div>
          </div>
        )}

        {/* Last Updated & Auto-Refresh Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          padding: '10px 12px',
          backgroundColor: '#12121f',
          borderRadius: '12px',
          border: '1px solid #2a2a4a',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '12px' }}>Last updated:</span>
            <span style={{ color: '#00D4FF', fontSize: '12px', fontWeight: 'bold' }}>
              {formatTime(lastUpdated)}
            </span>
          </div>
          <div style={{ width: '1px', height: '16px', backgroundColor: '#333' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '12px' }}>Next refresh:</span>
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
              {formatCountdown(nextRefresh)}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '6px 12px',
              backgroundColor: isRefreshing ? '#333' : '#10B981',
              color: isRefreshing ? '#666' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              display: 'inline-block',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}>🔄</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>

        <div style={SPORT_BUTTONS_CONTAINER}>
          {SPORTS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSportChange(s.id)}
              style={getSportButtonStyle(sport === s.id)}
            >
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div style={TAB_CONTAINER}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? (tab.id === 'props' ? '#fff' : '#0a0a0f') : '#6B7280'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Today's Best Bets - Top SMASH picks with quick action */}
        <TodaysBestBets
          sport={sport}
          onPickClick={handleTabChange}
          onError={setApiError}
        />

        {/* v10.4 Tier Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: '#12121f',
          borderRadius: '10px',
          border: '1px solid #2a2a4a',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: '500' }}>Tier:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TIER_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setConfidenceFilter(filter.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: confidenceFilter === filter.id ? `1px solid ${filter.color}` : '1px solid #333',
                    backgroundColor: confidenceFilter === filter.id ? `${filter.color}20` : 'transparent',
                    color: confidenceFilter === filter.id ? filter.color : '#6B7280',
                    fontSize: '12px',
                    fontWeight: confidenceFilter === filter.id ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSortByConfidence(!sortByConfidence)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: sortByConfidence ? '#00D4FF20' : 'transparent',
              color: sortByConfidence ? '#00D4FF' : '#6B7280',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span>{sortByConfidence ? '↓' : '↕'}</span>
            Sort by Score
          </button>
        </div>

        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {activeTab === 'props'
            ? <PropsSmashList
                key={`props-${refreshKey}`}
                sport={sport}
                minScore={TIER_FILTERS.find(f => f.id === confidenceFilter)?.minScore || 0}
                minConfidence={CONFIDENCE_FILTERS.find(f => f.id === confidenceFilter)?.minConfidence || 0}
                sortByConfidence={sortByConfidence}
              />
            : <GameSmashList
                key={`games-${refreshKey}`}
                sport={sport}
                minScore={TIER_FILTERS.find(f => f.id === confidenceFilter)?.minScore || 0}
                minConfidence={CONFIDENCE_FILTERS.find(f => f.id === confidenceFilter)?.minConfidence || 0}
                sortByConfidence={sortByConfidence}
              />
          }
        </div>

        <div style={{
          marginTop: '24px', padding: '16px', backgroundColor: '#12121f',
          borderRadius: '12px', border: '1px solid #2a2a4a'
        }}>
          <div style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center', marginBottom: '12px' }}>
            TIER SYSTEM v12.0 • Community Threshold: ≥{MIN_FINAL_SCORE}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {CONFIDENCE_TIERS.map(tier => (
              <div key={tier.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: tier.prominent ? '4px 8px' : '0',
                backgroundColor: tier.prominent ? '#00FFFF10' : 'transparent',
                borderRadius: tier.prominent ? '8px' : '0',
                border: tier.prominent ? '1px solid #00FFFF30' : 'none'
              }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: tier.prominent ? '11px' : '10px',
                  fontWeight: 'bold',
                  color: tier.color,
                  backgroundColor: `${tier.color}20`,
                  border: `1px solid ${tier.color}`,
                  boxShadow: tier.prominent ? `0 0 8px ${tier.color}40` : 'none'
                }}>{tier.label}</span>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>{tier.range}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmashSpotsPage;
