import React, { useState, useEffect, useCallback, memo } from 'react';
import PropsSmashList from './PropsSmashList';
import GameSmashList from './GameSmashList';
import { usePreferences } from './usePreferences';
import api from './api';
import { AddToSlipButton } from './BetSlip';

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// v10.4 Tier-based filter options (matches backend tier system)
const TIER_FILTERS = [
  { id: 'gold_star', label: 'GOLD STAR', tier: 'GOLD_STAR', minScore: 7.5, color: '#FFD700', isDefault: true },
  { id: 'edge_lean', label: 'EDGE LEAN+', tier: 'EDGE_LEAN', minScore: 6.5, color: '#10B981' },
  { id: 'monitor', label: 'MONITOR+', tier: 'MONITOR', minScore: 5.5, color: '#F59E0B' },
  { id: 'all', label: 'All Picks', tier: null, minScore: 0, color: '#6B7280' }
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

// v10.4 Tier display configuration (matches backend)
const TIER_CONFIG = {
  GOLD_STAR: { label: 'GOLD STAR', color: '#FFD700', emoji: '🌟', minScore: 7.5, action: 'SMASH' },
  EDGE_LEAN: { label: 'EDGE LEAN', color: '#10B981', emoji: '💚', minScore: 6.5, action: 'PLAY' },
  MONITOR: { label: 'MONITOR', color: '#F59E0B', emoji: '🟡', minScore: 5.5, action: 'WATCH' },
  PASS: { label: 'PASS', color: '#6B7280', emoji: '⚪', minScore: 0, action: 'SKIP' }
};

// Legacy confidence tiers for display (moved outside component)
const CONFIDENCE_TIERS = [
  { label: 'GOLD STAR', color: '#FFD700', range: '≥7.5', tier: 'GOLD_STAR' },
  { label: 'EDGE LEAN', color: '#10B981', range: '6.5-7.4', tier: 'EDGE_LEAN' },
  { label: 'MONITOR', color: '#F59E0B', range: '5.5-6.4', tier: 'MONITOR' },
  { label: 'PASS', color: '#6B7280', range: '<5.5', tier: 'PASS' }
];

// Get tier config from pick (v10.4 schema)
const getTierFromPick = (pick) => {
  // Use tier from API if available (v10.4)
  if (pick.tier && TIER_CONFIG[pick.tier]) {
    return TIER_CONFIG[pick.tier];
  }
  // Fallback: derive from final_score
  const score = pick.final_score || (pick.confidence / 10) || 0;
  if (score >= 7.5) return TIER_CONFIG.GOLD_STAR;
  if (score >= 6.5) return TIER_CONFIG.EDGE_LEAN;
  if (score >= 5.5) return TIER_CONFIG.MONITOR;
  return TIER_CONFIG.PASS;
};

// Unit sizing based on tier (v10.4)
const getUnitSizeFromTier = (pick) => {
  const tier = pick.tier || 'PASS';
  const isSmashSpot = pick.smash_spot === true;

  if (isSmashSpot) return { units: 2, label: '2 Units', emoji: '🔥🔥' };
  if (tier === 'GOLD_STAR') return { units: 1.5, label: '1.5 Units', emoji: '🔥' };
  if (tier === 'EDGE_LEAN') return { units: 1, label: '1 Unit', emoji: '✓' };
  if (tier === 'MONITOR') return { units: 0.5, label: '0.5 Units', emoji: '⚡' };
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

// Today's Best Bets Component - v10.4 schema with smash_spot and tier system
const TodaysBestBets = memo(({ sport, onPickClick }) => {
  const [bestPicks, setBestPicks] = useState([]);
  const [smashSpots, setSmashSpots] = useState([]); // TRUE SmashSpots (rare)
  const [displayTier, setDisplayTier] = useState('GOLD_STAR');
  const [totalActionable, setTotalActionable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestBets = async () => {
      setLoading(true);
      try {
        const data = await api.getBestBets(sport);

        // v10.4: Use response.picks (merged array of top 3 game + top 7 props)
        const allPicks = data?.picks || [];

        // Find TRUE SmashSpots (rare, high-conviction)
        const trueSmashSpots = allPicks.filter(p => p.smash_spot === true);
        setSmashSpots(trueSmashSpots);

        // Count actionable picks (EDGE_LEAN and above)
        const actionablePicks = allPicks.filter(p =>
          p.tier === 'GOLD_STAR' || p.tier === 'EDGE_LEAN' ||
          (p.final_score || 0) >= 6.5
        );
        setTotalActionable(actionablePicks.length);

        // Get top picks by tier priority
        const goldStarPicks = allPicks
          .filter(p => p.tier === 'GOLD_STAR' || (p.final_score || 0) >= 7.5)
          .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
          .slice(0, 3);

        if (goldStarPicks.length > 0) {
          setBestPicks(goldStarPicks);
          setDisplayTier('GOLD_STAR');
        } else {
          // Fallback to EDGE_LEAN
          const edgeLeanPicks = allPicks
            .filter(p => p.tier === 'EDGE_LEAN' || (p.final_score || 0) >= 6.5)
            .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
            .slice(0, 3);

          if (edgeLeanPicks.length > 0) {
            setBestPicks(edgeLeanPicks);
            setDisplayTier('EDGE_LEAN');
          } else {
            setBestPicks([]);
            setDisplayTier('NONE');
          }
        }
      } catch (err) {
        console.error('Error fetching best bets:', err);
        setBestPicks([]);
        setDisplayTier('NONE');
      }
      setLoading(false);
    };

    fetchBestBets();
  }, [sport]);

  // v10.4 tier-based styling
  const tierDisplayConfig = displayTier === 'GOLD_STAR'
    ? { color: '#FFD700', label: 'GOLD STAR', borderColor: '#FFD70040', bgGradient: 'linear-gradient(135deg, #2a2a0a 0%, #3a3a1a 100%)', emoji: '🌟' }
    : displayTier === 'EDGE_LEAN'
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

      {/* SmashSpots Banner - show if any TRUE smash_spot picks */}
      {smashSpots.length > 0 && (
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
            {displayTier === 'EDGE_LEAN' && (
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'normal', marginLeft: '8px' }}>
                (No GOLD STAR picks available)
              </span>
            )}
          </h3>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>
            {tierDisplayConfig.label} tier (score ≥{displayTier === 'GOLD_STAR' ? '7.5' : '6.5'}) • High conviction plays
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
          // v10.4: Use selection field, fallback to constructed display
          const pickDisplay = pick.selection || (isProp
            ? `${pick.player || pick.player_name} ${pick.side || 'Over'} ${pick.line || pick.point}`
            : `${pick.matchup || pick.game} ${pick.line > 0 ? `+${pick.line}` : pick.line || ''}`);
          const pickKey = pick.id || `${pick.player || pick.player_name || pick.matchup}-${pick.market || pick.bet_type}`;
          const isSmashSpot = pick.smash_spot === true;
          const pickTierConfig = getTierFromPick(pick);

          return (
            <div
              key={pickKey}
              style={{
                backgroundColor: isSmashSpot ? 'rgba(255, 100, 50, 0.1)' : 'rgba(10, 26, 21, 0.1)',
                borderRadius: '12px',
                padding: '14px 16px',
                border: isSmashSpot ? '2px solid #FF6432' : `1px solid ${tierDisplayConfig.color}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onClick={() => onPickClick && onPickClick(isProp ? 'props' : 'games')}
            >
              {/* SmashSpot fire badge */}
              {isSmashSpot && (
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
                backgroundColor: isSmashSpot ? '#FF6432' : (idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#000'
              }}>
                {isSmashSpot ? '🔥' : `#${idx + 1}`}
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
                  color: isSmashSpot ? '#FF6432' : pickTierConfig.color,
                  fontWeight: 'bold',
                  fontSize: '20px',
                  lineHeight: '1'
                }}>
                  {pick.final_score?.toFixed(1) || ((pick.confidence || 0) / 10).toFixed(1)}
                </div>
                <div style={{ color: '#6B7280', fontSize: '9px' }}>score</div>
                <div style={{
                  backgroundColor: isSmashSpot ? '#FF643220' : `${pickTierConfig.color}20`,
                  color: isSmashSpot ? '#FF6432' : pickTierConfig.color,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginTop: '4px'
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
  const [sport, setSport] = useState(preferences.favoriteSport || 'NBA');
  const [activeTab, setActiveTab] = useState(preferences.defaultTab || 'props');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState('gold_star'); // Default to GOLD_STAR tier (score >= 7.5)
  const [sortByConfidence, setSortByConfidence] = useState(true);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setLastUpdated(new Date());
    setNextRefresh(AUTO_REFRESH_INTERVAL);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

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
        <TodaysBestBets sport={sport} onPickClick={handleTabChange} />

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
            TIER SYSTEM (v10.4)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {CONFIDENCE_TIERS.map(tier => (
              <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold',
                  color: tier.color, backgroundColor: `${tier.color}20`, border: `1px solid ${tier.color}`
                }}>{tier.label}</span>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>Score {tier.range}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmashSpotsPage;
