import React, { useState, useEffect, useCallback } from 'react';
import PropsSmashList from './PropsSmashList';
import GameSmashList from './GameSmashList';
import { usePreferences } from './usePreferences';
import api from './api';
import { AddToSlipButton } from './BetSlip';

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Confidence filter options
const CONFIDENCE_FILTERS = [
  { id: 'all', label: 'All Picks', minConfidence: 0, color: '#6B7280' },
  { id: 'strong', label: '75%+', minConfidence: 75, color: '#F59E0B' },
  { id: 'smash', label: '85%+', minConfidence: 85, color: '#10B981' }
];

// Unit sizing based on confidence tier
const getUnitSize = (confidence) => {
  if (confidence >= 90) return { units: 2, label: '2 Units', emoji: '🔥🔥' };
  if (confidence >= 85) return { units: 1.5, label: '1.5 Units', emoji: '🔥' };
  if (confidence >= 75) return { units: 1, label: '1 Unit', emoji: '✓' };
  if (confidence >= 65) return { units: 0.5, label: '0.5 Units', emoji: '⚡' };
  return { units: 0, label: 'Pass', emoji: '⚠️' };
};

// Today's Best Bets Component - Shows top SMASH tier picks
const TodaysBestBets = ({ sport, onPickClick }) => {
  const [bestPicks, setBestPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestBets = async () => {
      setLoading(true);
      try {
        const data = await api.getBestBets(sport);
        let allPicks = [];

        // Collect picks from all sources
        if (data?.props?.picks) allPicks.push(...data.props.picks);
        if (data?.games?.picks) allPicks.push(...data.games.picks);
        if (data?.picks) allPicks.push(...data.picks);
        if (data?.data) allPicks.push(...data.data);

        // Filter to SMASH tier only (85%+) and sort by confidence
        const smashPicks = allPicks
          .filter(p => (p.confidence || p.score || 0) >= 85)
          .sort((a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0))
          .slice(0, 3);

        setBestPicks(smashPicks);
      } catch (err) {
        console.error('Error fetching best bets:', err);
        setBestPicks([]);
      }
      setLoading(false);
    };

    fetchBestBets();
  }, [sport]);

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

  if (bestPicks.length === 0) {
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
        <div style={{ color: '#F59E0B', fontWeight: 'bold', marginBottom: '4px' }}>
          No SMASH Picks Right Now
        </div>
        <div style={{ color: '#6B7280', fontSize: '13px' }}>
          Check back soon — we only feature 85%+ confidence plays here.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a2a1a 0%, #1a3a2a 100%)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: '2px solid #10B98140',
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
        background: 'radial-gradient(circle, #10B98120 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🎯</span>
        <div>
          <h3 style={{ color: '#10B981', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Today's Best Bets
          </h3>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>
            SMASH tier only (85%+ confidence) • Max conviction plays
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          backgroundColor: '#10B98120',
          color: '#10B981',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          border: '1px solid #10B98140'
        }}>
          {bestPicks.length} SMASH {bestPicks.length === 1 ? 'PICK' : 'PICKS'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
        {bestPicks.map((pick, idx) => {
          const unitSize = getUnitSize(pick.confidence || pick.score || 85);
          const isProp = pick.player_name || pick.market?.includes('player');
          const pickDisplay = isProp
            ? `${pick.player_name} ${pick.side} ${pick.point}`
            : `${pick.team || pick.description} ${pick.point > 0 ? `+${pick.point}` : pick.point || ''}`;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#0a1a1510',
                borderRadius: '12px',
                padding: '14px 16px',
                border: '1px solid #10B98130',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onPickClick && onPickClick(isProp ? 'props' : 'games')}
            >
              {/* Rank badge */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#000'
              }}>
                #{idx + 1}
              </div>

              {/* Pick details */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>
                  {pickDisplay}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {pick.market?.replace('player_', '').replace(/_/g, ' ') || pick.bet_type || 'spread'}
                  {pick.price && <span style={{ color: '#00D4FF', marginLeft: '8px' }}>
                    {pick.price > 0 ? `+${pick.price}` : pick.price}
                  </span>}
                </div>
              </div>

              {/* Confidence + Unit size */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: '#10B981',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  lineHeight: '1'
                }}>
                  {pick.confidence || pick.score || 85}%
                </div>
                <div style={{
                  backgroundColor: '#10B98120',
                  color: '#10B981',
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
                  id: pick.id || `${pick.player_name || pick.team}-${pick.market || pick.bet_type}`,
                  game_id: pick.game_id || `${pick.home_team}-${pick.away_team}`,
                  player: pick.player_name,
                  team: pick.team,
                  sport: sport,
                  home_team: pick.home_team,
                  away_team: pick.away_team,
                  bet_type: isProp ? 'prop' : (pick.market || 'spread'),
                  stat: pick.market?.replace('player_', ''),
                  side: pick.side,
                  line: pick.point,
                  odds: pick.price || -110,
                  confidence: pick.confidence || pick.score || 85,
                  tier: 'SMASH'
                }}
                size="small"
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
};

const SmashSpotsPage = () => {
  const { preferences, updatePreference } = usePreferences();
  const [sport, setSport] = useState(preferences.favoriteSport || 'NBA');
  const [activeTab, setActiveTab] = useState(preferences.defaultTab || 'props');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState('all');
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

  // Sports with matching icons
  const sports = [
    { id: 'NBA', label: 'NBA', icon: '🏀' },
    { id: 'NFL', label: 'NFL', icon: '🏈' },
    { id: 'MLB', label: 'MLB', icon: '⚾' },
    { id: 'NHL', label: 'NHL', icon: '🏒' },
    { id: 'NCAAB', label: 'NCAAB', icon: '🏀' }
  ];

  const tabs = [
    { id: 'props', label: 'Player Props', icon: '👤', color: '#8B5CF6' },
    { id: 'games', label: 'Game Picks', icon: '🎯', color: '#00D4FF' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            color: '#fff', margin: 0, fontSize: '28px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            AI Picks
          </h1>
          <p style={{ color: '#6B7280', margin: '8px 0 0', fontSize: '14px' }}>
            8 ML Models + 8 Pillars • Updated Every 2 Hours
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

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button
              key={s.id}
              onClick={() => handleSportChange(s.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: sport === s.id ? '2px solid #10B981' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                backgroundColor: sport === s.id ? '#10B98120' : '#1a1a2e',
                color: sport === s.id ? '#10B981' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: '80px',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', backgroundColor: '#12121f', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
          {tabs.map(tab => (
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

        {/* Confidence Filter Controls */}
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
            <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: '500' }}>Filter:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {CONFIDENCE_FILTERS.map(filter => (
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
            Sort by Confidence
          </button>
        </div>

        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {activeTab === 'props'
            ? <PropsSmashList
                key={`props-${refreshKey}`}
                sport={sport}
                minConfidence={CONFIDENCE_FILTERS.find(f => f.id === confidenceFilter)?.minConfidence || 0}
                sortByConfidence={sortByConfidence}
              />
            : <GameSmashList
                key={`games-${refreshKey}`}
                sport={sport}
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
            CONFIDENCE TIERS
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'SMASH', color: '#10B981', range: '85%+' },
              { label: 'STRONG', color: '#F59E0B', range: '75-84%' },
              { label: 'LEAN', color: '#3B82F6', range: '65-74%' },
              { label: 'WATCH', color: '#6B7280', range: '<65%' }
            ].map(tier => (
              <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold',
                  color: tier.color, backgroundColor: `${tier.color}20`, border: `1px solid ${tier.color}`
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
