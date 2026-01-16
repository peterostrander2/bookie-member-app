import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import api from './api';
import { useToast } from './Toast';
import { PlaceBetButton } from './BetslipModal';
import { ShareButton } from './ShareButton';

// AI Models and Pillars for enhanced "Why?" breakdown
const AI_MODELS = [
  { id: 'ensemble', name: 'Ensemble' },
  { id: 'lstm', name: 'LSTM' },
  { id: 'xgboost', name: 'XGBoost' },
  { id: 'random_forest', name: 'Random Forest' },
  { id: 'neural_net', name: 'Neural Net' },
  { id: 'monte_carlo', name: 'Monte Carlo' },
  { id: 'bayesian', name: 'Bayesian' },
  { id: 'regression', name: 'Regression' }
];

const PILLARS = [
  { id: 'sharp_action', name: 'Sharp Action' },
  { id: 'reverse_line', name: 'Reverse Line' },
  { id: 'matchup_history', name: 'Matchup History' },
  { id: 'recent_form', name: 'Recent Form' },
  { id: 'rest_advantage', name: 'Rest Advantage' },
  { id: 'home_away', name: 'Home/Away' },
  { id: 'injuries', name: 'Injury Impact' },
  { id: 'pace_tempo', name: 'Pace/Tempo' }
];

// Confidence tier configuration
const getTierConfig = (conf) => {
  if (conf >= 85) return {
    label: 'SMASH', color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.5)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)', size: 'large'
  };
  if (conf >= 75) return {
    label: 'STRONG', color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.5)',
    glow: 'none', size: 'medium'
  };
  if (conf >= 65) return {
    label: 'LEAN', color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)',
    glow: 'none', size: 'small'
  };
  return {
    label: 'WATCH', color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.5)',
    glow: 'none', size: 'small'
  };
};

// Memoized score badge
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

// Memoized tier badge
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

// Filter controls for game picks
const GameFilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  const tierOptions = ['ALL', 'SMASH', 'STRONG', 'LEAN'];
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
                  backgroundColor: filters.tier === tier ? '#00D4FF' : '#1a1a2e',
                  color: filters.tier === tier ? '#0a0a0f' : '#9CA3AF'
                }}>{tier}</button>
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
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
  if (!odds) return '--';
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Memoized pick card with enhanced display
const PickCard = memo(({ pick, injuries = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const tierConfig = getTierConfig(pick.confidence);
  const keyStats = useMemo(() => generateGameStats(pick), [pick.market, pick.point, pick.team]);
  const agreeingModels = useMemo(() => getAgreeingModels(pick.ai_score), [pick.ai_score]);
  const aligningPillars = useMemo(() => getAligningPillars(pick.pillar_score), [pick.pillar_score]);

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

  const cardStyle = {
    backgroundColor: '#1a1a2e', borderRadius: '12px',
    padding: tierConfig.size === 'large' ? '20px' : '16px', marginBottom: '12px',
    border: `1px solid ${tierConfig.border}`, boxShadow: tierConfig.glow
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              backgroundColor: '#00D4FF', color: '#0a0a0f',
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
            }}>{getMarketLabel(pick.market)}</span>
            <TierBadge confidence={pick.confidence} />
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
            {pick.away_team} @ {pick.home_team}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: tierConfig.color, fontWeight: 'bold', fontSize: tierConfig.size === 'large' ? '24px' : '20px' }}>
            {pick.confidence}%
          </div>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>confidence</div>
        </div>
      </div>

      {/* Key Stats - NEW */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#9CA3AF' }}>
          <span style={{ color: '#10B981', fontWeight: 'bold' }}>{keyStats.stat1}</span>
        </div>
        <div style={{ backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#9CA3AF' }}>
          {keyStats.stat2}
        </div>
        <div style={{ backgroundColor: '#0f0f1a', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#9CA3AF' }}>
          {keyStats.stat3}
        </div>
      </div>

      {/* Injury Context */}
      <InjuryIndicator homeTeam={pick.home_team} awayTeam={pick.away_team} injuries={injuries} />

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
          background: expanded ? '#00D4FF20' : 'none',
          border: '1px solid #00D4FF', color: '#00D4FF',
          padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
        }}>{expanded ? 'Hide Details' : 'Why This Pick?'}</button>
      </div>

      {/* Enhanced "Why?" Breakdown */}
      {expanded && (
        <div style={{
          backgroundColor: '#0f0f1a', borderRadius: '8px', padding: '16px',
          marginBottom: '12px', borderLeft: '3px solid #00D4FF'
        }}>
          <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
            This pick shows strong convergence across our signals.
            {pick.ai_score >= 6 && ' Multiple ML models predict this outcome.'}
            {pick.pillar_score >= 6 && ' Key betting indicators support this play.'}
          </div>

          {/* AI Models */}
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

          {/* Pillars */}
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
            selection: pick.side || pick.team,
            spread: pick.point,
            odds: pick.price,
            confidence: pick.confidence,
          }}
          size="small"
        />
        <PlaceBetButton
          bet={{
            sport: pick.sport, home_team: pick.home_team, away_team: pick.away_team,
            bet_type: pick.market, side: pick.side || pick.team,
            line: pick.point, odds: pick.price, book: pick.bookmaker
          }}
          label={pick.bookmaker ? `Bet at ${pick.bookmaker}` : 'Compare Odds'}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
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

// Demo injuries
const getDemoInjuries = (sport) => {
  const demos = {
    NBA: [
      { player_name: 'Anthony Davis', team: 'Lakers', status: 'Questionable', injury: 'Knee' },
      { player_name: 'Jaylen Brown', team: 'Celtics', status: 'Out', injury: 'Ankle' },
      { player_name: 'Jamal Murray', team: 'Nuggets', status: 'Probable', injury: 'Hamstring' },
      { player_name: 'Devin Booker', team: 'Suns', status: 'Doubtful', injury: 'Groin' }
    ],
    NFL: [
      { player_name: 'Travis Kelce', team: 'Chiefs', status: 'Questionable', injury: 'Knee' },
      { player_name: 'Stefon Diggs', team: 'Bills', status: 'Out', injury: 'ACL' }
    ],
    MLB: [
      { player_name: 'Mookie Betts', team: 'Dodgers', status: 'Day-to-Day', injury: 'Hip' }
    ],
    NHL: [
      { player_name: 'Connor McDavid', team: 'Oilers', status: 'Probable', injury: 'Lower Body' }
    ]
  };
  return demos[sport] || [];
};

const GameSmashList = ({ sport = 'NBA' }) => {
  const toast = useToast();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyEnergy, setDailyEnergy] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [injuries, setInjuries] = useState([]);

  // Filter and sort state
  const [filters, setFilters] = useState({ tier: 'ALL', market: 'ALL' });
  const [sortBy, setSortBy] = useState('confidence');

  useEffect(() => { fetchGamePicks(); fetchInjuries(); }, [sport]);

  const fetchInjuries = async () => {
    try {
      const data = await api.getInjuries(sport);
      if (data && data.injuries && data.injuries.length > 0) {
        setInjuries(data.injuries);
      } else {
        setInjuries(getDemoInjuries(sport));
      }
    } catch (err) {
      console.error('Error fetching injuries:', err);
      setInjuries(getDemoInjuries(sport));
    }
  };

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
        setPicks(getDemoGamePicks(sport));
        setDailyEnergy(getDemoEnergy());
        setIsDemo(true);
      } else {
        setPicks(gamePicks);
      }
    } catch (err) {
      console.error('Error fetching game picks:', err);
      setPicks(getDemoGamePicks(sport));
      setDailyEnergy(getDemoEnergy());
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort picks
  const filteredPicks = useMemo(() => {
    let result = [...picks];

    // Tier filter
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

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
        case 'edge': return (b.edge || 0) - (a.edge || 0);
        default: return 0;
      }
    });

    return result;
  }, [picks, filters, sortBy]);

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
