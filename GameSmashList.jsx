import React, { useState, useEffect } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';

const ScoreBadge = ({ score, maxScore, label }) => {
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
};

const TierBadge = ({ confidence }) => {
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
};

const formatOdds = (odds) => {
  if (!odds) return '--';
  return odds > 0 ? `+${odds}` : odds.toString();
};

const PickCard = ({ pick }) => {
  const [expanded, setExpanded] = useState(false);

  const getMarketLabel = (market) => {
    switch(market) {
      case 'spreads': return 'SPREAD';
      case 'totals': return 'TOTAL';
      case 'h2h': return 'MONEYLINE';
      default: return market?.toUpperCase() || 'BET';
    }
  };

  const getPickDisplay = () => {
    const market = pick.market;
    if (market === 'spreads') {
      const line = pick.point > 0 ? `+${pick.point}` : pick.point;
      return `${pick.team} ${line}`;
    }
    if (market === 'totals') return `${pick.side} ${pick.point}`;
    if (market === 'h2h') return pick.team;
    return pick.description || 'N/A';
  };

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

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
};

const GameSmashList = ({ sport = 'NBA' }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyEnergy, setDailyEnergy] = useState(null);

  useEffect(() => { fetchGamePicks(); }, [sport]);

  const fetchGamePicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBestBets(sport);
      if (data.game_picks) {
        setPicks(data.game_picks.picks || []);
        setDailyEnergy(data.daily_energy);
      } else if (data.data) {
        setPicks(data.data.filter(p => p.market === 'spreads' || p.market === 'totals' || p.market === 'h2h'));
      } else {
        setPicks([]);
      }
    } catch (err) {
      console.error('Error fetching game picks:', err);
      setError('Failed to load game picks');
      toast.error('Failed to load game picks');
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
          </h3>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>Spreads, Totals & Moneylines</div>
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
