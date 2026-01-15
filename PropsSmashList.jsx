import React, { useState, useEffect, memo, useCallback } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';

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
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', minWidth: '50px'
    }}>
      <span style={{ color: getColor(), fontWeight: 'bold', fontSize: '16px' }}>{score.toFixed(1)}</span>
      <span style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase' }}>{label}</span>
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
      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
      color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}`, letterSpacing: '0.5px'
    }}>{config.label}</span>
  );
});
TierBadge.displayName = 'TierBadge';

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

// Memoized prop card - only re-renders when pick data changes
const PropCard = memo(({ pick }) => {
  const [expanded, setExpanded] = useState(false);

  const getMarketLabel = useCallback((market) => {
    if (market?.includes('points')) return 'POINTS';
    if (market?.includes('rebounds')) return 'REBOUNDS';
    if (market?.includes('assists')) return 'ASSISTS';
    if (market?.includes('threes')) return '3-POINTERS';
    if (market?.includes('steals')) return 'STEALS';
    if (market?.includes('blocks')) return 'BLOCKS';
    return market?.toUpperCase()?.replace('player_', '') || 'PROP';
  }, []);

  return (
    <div style={{
      backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '16px',
      marginBottom: '12px', border: '1px solid #2a2a4a'
    }}>
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
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginTop: '4px' }}>
            {pick.player_name || pick.description?.split(' ').slice(0, 2).join(' ') || 'Player'}
          </div>
          <div style={{ color: '#6B7280', fontSize: '12px' }}>{pick.away_team} @ {pick.home_team}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '20px' }}>{pick.confidence}%</div>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>confidence</div>
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
          background: 'none', border: '1px solid #4B5563', color: '#9CA3AF',
          padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
        }}>{expanded ? 'Less' : 'Why?'}</button>
      </div>

      {expanded && (
        <div style={{
          backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '12px',
          marginBottom: '12px', borderLeft: '3px solid #8B5CF6'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.6' }}>
            <strong style={{ color: '#8B5CF6' }}>AI Models:</strong> {pick.ai_score?.toFixed(1) || '0'}/8 models agree
            <br />
            <strong style={{ color: '#8B5CF6' }}>8 Pillars:</strong> {pick.pillar_score?.toFixed(1) || '0'}/8 pillars aligned
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
          sport: pick.sport, home_team: pick.home_team, away_team: pick.away_team,
          bet_type: 'prop', player: pick.player_name, prop_type: pick.market,
          side: pick.side, line: pick.point, odds: pick.price, book: pick.bookmaker
        }} />
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

const PropsSmashList = ({ sport = 'NBA' }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchPropsPicks(); }, [sport]);

  const fetchPropsPicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBestBets(sport);
      if (data.props) {
        setPicks(data.props.picks || []);
      } else if (data.data) {
        setPicks(data.data.filter(p =>
          p.market?.includes('player_') || p.market?.includes('points') ||
          p.market?.includes('rebounds') || p.market?.includes('assists')
        ));
      } else {
        setPicks([]);
      }
    } catch (err) {
      console.error('Error fetching props picks:', err);
      setError('Failed to load props picks');
      toast.error('Failed to load props picks');
    } finally {
      setLoading(false);
    }
  };

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
            }}>{picks.length}</span>
          </h3>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>Points, Rebounds, Assists & More</div>
        </div>
        <button onClick={fetchPropsPicks} style={{
          background: 'none', border: '1px solid #4B5563', color: '#9CA3AF',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
        }}>Refresh</button>
      </div>

      {picks.length === 0 ? (
        <div style={{
          backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '40px',
          textAlign: 'center', border: '1px solid #2a2a4a'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏀</div>
          <div style={{ color: '#9CA3AF' }}>No player props available for {sport}</div>
          <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px' }}>Props typically available closer to game time</div>
        </div>
      ) : (
        <div>{picks.map((pick, idx) => <PropCard key={`${pick.player_name || pick.description}-${idx}`} pick={pick} />)}</div>
      )}
    </div>
  );
};

export default PropsSmashList;
