import React, { useState, useEffect, memo, useCallback } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';
import { ShareButton } from './ShareButton';

// Memoized score badge - prevents re-renders when props unchanged
const ScoreBadge = memo(({ score, maxScore, label }) => {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#3B82F6';
    return '#6B7280';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4px 8px',
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      minWidth: '50px'
    }}>
      <span style={{ color: getColor(), fontWeight: 'bold', fontSize: '16px' }}>
        {score.toFixed(1)}
      </span>
      <span style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
});
ScoreBadge.displayName = 'ScoreBadge';

// Memoized tier badge - prevents re-renders when confidence unchanged
const TierBadge = memo(({ confidence }) => {
  const getTierConfig = (conf) => {
    if (conf >= 85) return { label: 'SMASH', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' };
    if (conf >= 75) return { label: 'STRONG', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
    if (conf >= 65) return { label: 'LEAN', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' };
    return { label: 'WATCH', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.2)' };
  };
  const config = getTierConfig(confidence);
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: config.color,
      backgroundColor: config.bg,
      border: `1px solid ${config.color}`,
      letterSpacing: '0.5px'
    }}>
      {config.label}
    </span>
  );
});
TierBadge.displayName = 'TierBadge';

const formatOdds = (odds) => {
  if (!odds) return '--';
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Memoized pick card - only re-renders when pick data changes
const PickCard = memo(({ pick }) => {
  const [expanded, setExpanded] = useState(false);

  const getMarketLabel = useCallback((market) => {
    switch(market) {
      case 'spreads': return 'SPREAD';
      case 'totals': return 'TOTAL';
      case 'h2h': return 'MONEYLINE';
      default: return market?.toUpperCase() || 'BET';
    }
  }, []);

  const getPickDisplay = useCallback(() => {
    const market = pick.market;
    if (market === 'spreads') {
      const line = pick.point > 0 ? `+${pick.point}` : pick.point;
      return `${pick.team} ${line}`;
    }
    if (market === 'totals') return `${pick.side} ${pick.point}`;
    if (market === 'h2h') return pick.team;
    return pick.description || 'N/A';
  }, [pick.market, pick.point, pick.team, pick.side, pick.description]);

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: '1px solid #2a2a4a'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              backgroundColor: '#00D4FF',
              color: '#0a0a0f',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {getMarketLabel(pick.market)}
            </span>
            <TierBadge confidence={pick.confidence} />
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
            {pick.away_team} @ {pick.home_team}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '20px' }}>{pick.confidence}%</div>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>confidence</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{getPickDisplay()}</div>
            <div style={{ color: '#00D4FF', fontSize: '14px', fontWeight: '500' }}>{formatOdds(pick.price)}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pick.ai_score !== undefined && <ScoreBadge score={pick.ai_score} maxScore={8} label="AI" />}
            {pick.pillar_score !== undefined && <ScoreBadge score={pick.pillar_score} maxScore={8} label="Pillars" />}
            {pick.total_score !== undefined && <ScoreBadge score={pick.total_score} maxScore={20} label="Total" />}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {pick.edge && (
            <div>
              <span style={{ color: '#6B7280', fontSize: '11px' }}>Edge: </span>
              <span style={{ color: pick.edge > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold', fontSize: '13px' }}>
                {pick.edge > 0 ? '+' : ''}{(pick.edge * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {pick.bookmaker && (
            <div>
              <span style={{ color: '#6B7280', fontSize: '11px' }}>Book: </span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{pick.bookmaker}</span>
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: 'none',
          border: '1px solid #4B5563',
          color: '#9CA3AF',
          padding: '4px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          {expanded ? 'Less' : 'Why?'}
        </button>
      </div>

      {expanded && (
        <div style={{
          backgroundColor: '#0f0f1a',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          borderLeft: '3px solid #00D4FF'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.6' }}>
            <strong style={{ color: '#00D4FF' }}>AI Models:</strong> {pick.ai_score?.toFixed(1) || '0'}/8 models agree
            <br />
            <strong style={{ color: '#00D4FF' }}>8 Pillars:</strong> {pick.pillar_score?.toFixed(1) || '0'}/8 pillars aligned
            {pick.jarvis_boost > 0 && (
              <>
                <br />
                <strong style={{ color: '#FFD700' }}>JARVIS Boost:</strong> +{pick.jarvis_boost.toFixed(1)} esoteric signal
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ShareButton
          pick={{
            team: pick.side || pick.team,
            bet_type: pick.market,
            selection: pick.side || pick.team,
            spread: pick.point,
            odds: pick.price,
            confidence: pick.confidence,
          }}
          size="small"
        />
        <PlaceBetButton bet={{
          sport: pick.sport,
          home_team: pick.home_team,
          away_team: pick.away_team,
          bet_type: pick.market,
          side: pick.side || pick.team,
          line: pick.point,
          odds: pick.price,
          book: pick.bookmaker
        }} />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if pick data changed
  return prevProps.pick.home_team === nextProps.pick.home_team &&
         prevProps.pick.market === nextProps.pick.market &&
         prevProps.pick.confidence === nextProps.pick.confidence &&
         prevProps.pick.price === nextProps.pick.price &&
         prevProps.pick.point === nextProps.pick.point;
});
PickCard.displayName = 'PickCard';

// Demo game picks when API unavailable
const getDemoGamePicks = (sport) => {
  const demos = {
    NBA: [
      { team: 'Lakers', market: 'spreads', side: 'Lakers', point: -3.5, price: -110, confidence: 82, ai_score: 6.8, pillar_score: 6.4, total_score: 13.2, edge: 0.038, home_team: 'Lakers', away_team: 'Warriors', bookmaker: 'DraftKings', sport: 'NBA', isDemo: true },
      { team: 'Celtics', market: 'totals', side: 'Over', point: 224.5, price: -108, confidence: 79, ai_score: 6.5, pillar_score: 6.2, total_score: 12.7, edge: 0.032, home_team: 'Celtics', away_team: 'Bucks', bookmaker: 'FanDuel', sport: 'NBA', isDemo: true },
      { team: 'Nuggets', market: 'h2h', side: 'Nuggets', point: null, price: -145, confidence: 85, ai_score: 7.1, pillar_score: 6.7, total_score: 13.8, edge: 0.044, home_team: 'Nuggets', away_team: 'Clippers', bookmaker: 'BetMGM', sport: 'NBA', isDemo: true },
      { team: 'Mavericks', market: 'spreads', side: 'Mavericks', point: 2.5, price: -105, confidence: 77, ai_score: 6.3, pillar_score: 6.0, total_score: 12.3, edge: 0.028, home_team: 'Suns', away_team: 'Mavericks', bookmaker: 'Caesars', sport: 'NBA', isDemo: true },
    ],
    NFL: [
      { team: 'Chiefs', market: 'spreads', side: 'Chiefs', point: -4.5, price: -110, confidence: 84, ai_score: 7.0, pillar_score: 6.5, total_score: 13.5, edge: 0.041, home_team: 'Chiefs', away_team: 'Bills', bookmaker: 'DraftKings', sport: 'NFL', isDemo: true },
      { team: 'Bills', market: 'totals', side: 'Over', point: 52.5, price: -112, confidence: 78, ai_score: 6.4, pillar_score: 6.1, total_score: 12.5, edge: 0.030, home_team: 'Chiefs', away_team: 'Bills', bookmaker: 'FanDuel', sport: 'NFL', isDemo: true },
    ],
    MLB: [
      { team: 'Dodgers', market: 'h2h', side: 'Dodgers', point: null, price: -165, confidence: 81, ai_score: 6.7, pillar_score: 6.3, total_score: 13.0, edge: 0.036, home_team: 'Dodgers', away_team: 'Giants', bookmaker: 'DraftKings', sport: 'MLB', isDemo: true },
    ],
    NHL: [
      { team: 'Oilers', market: 'spreads', side: 'Oilers', point: -1.5, price: +125, confidence: 76, ai_score: 6.2, pillar_score: 5.9, total_score: 12.1, edge: 0.025, home_team: 'Oilers', away_team: 'Flames', bookmaker: 'BetMGM', sport: 'NHL', isDemo: true },
    ]
  };
  return demos[sport] || demos.NBA;
};

const getDemoEnergy = () => ({
  flow: 'YANG',
  theme: 'Expansion Day - Favorites & Overs favored',
  isDemo: true
});

const GameSmashList = ({ sport = 'NBA' }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyEnergy, setDailyEnergy] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => { fetchGamePicks(); }, [sport]);

  const fetchGamePicks = async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    try {
      const data = await api.getBestBets(sport);
      let gamePicks = [];
      if (data.game_picks) {
        gamePicks = data.game_picks.picks || [];
        setDailyEnergy(data.daily_energy);
      } else if (data.data) {
        gamePicks = data.data.filter(p => p.market === 'spreads' || p.market === 'totals' || p.market === 'h2h');
      }

      if (gamePicks.length === 0) {
        // Use demo data when no live picks available
        setPicks(getDemoGamePicks(sport));
        setDailyEnergy(getDemoEnergy());
        setIsDemo(true);
      } else {
        setPicks(gamePicks);
      }
    } catch (err) {
      console.error('Error fetching game picks:', err);
      // Use demo data on error
      setPicks(getDemoGamePicks(sport));
      setDailyEnergy(getDemoEnergy());
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

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
            }}>{picks.length}</span>
            {isDemo && (
              <span style={{
                backgroundColor: '#FFD70030', color: '#FFD700', padding: '2px 8px',
                borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
              }}>SAMPLE DATA</span>
            )}
          </h3>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
            {isDemo ? 'Live picks refresh every 2 hours • Showing sample data' : 'Spreads, Totals & Moneylines'}
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

      {picks.length === 0 ? (
        <div style={{
          backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '40px',
          textAlign: 'center', border: '1px solid #2a2a4a'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
          <div style={{ color: '#9CA3AF' }}>No game picks available for {sport}</div>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px' }}>Check back closer to game time</div>
        </div>
      ) : (
        <div>{picks.map((pick, idx) => <PickCard key={`${pick.home_team}-${pick.market}-${idx}`} pick={pick} />)}</div>
      )}
    </div>
  );
};

export default GameSmashList;
