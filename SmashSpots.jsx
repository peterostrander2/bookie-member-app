import React, { useState, useEffect } from 'react';
import api from './api'
// Confidence Meter Component
const ConfidenceMeter = ({ confidence, size = 70 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (confidence / 100) * circumference;
  const offset = circumference - progress;
  
  const getColor = (conf) => {
    if (conf >= 80) return '#00FF88';
    if (conf >= 70) return '#00D4FF';
    return '#FFD700';
  };
  
  const color = getColor(confidence);
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#ffffff10" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>#{confidence >= 80 ? '1' : confidence >= 70 ? '2' : '3'}</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color }}>{confidence}%</div>
      </div>
    </div>
  );
};

// Smash Spot Card Component
const SmashSpotCard = ({ pick, rank }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getGlow = (conf) => {
    if (conf >= 80) return '0 0 20px #00FF8840';
    if (conf >= 70) return '0 0 20px #00D4FF40';
    return '0 0 20px #FFD70040';
  };
  
  const getBorderColor = (conf) => {
    if (conf >= 80) return '#00FF88';
    if (conf >= 70) return '#00D4FF';
    return '#FFD700';
  };
  
  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        boxShadow: getGlow(pick.confidence),
        borderLeft: `4px solid ${getBorderColor(pick.confidence)}`,
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{pick.player}</div>
          <div style={{ color: '#00D4FF', fontSize: '14px' }}>{pick.team}</div>
          <div style={{ color: '#6b7280', fontSize: '13px' }}>vs {pick.opponent}</div>
        </div>
        <ConfidenceMeter confidence={pick.confidence} />
      </div>
      
      <div style={{
        backgroundColor: pick.recommendation?.includes('OVER') ? '#00FF8820' : '#FF444420',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{
          backgroundColor: pick.recommendation?.includes('OVER') ? '#00FF88' : '#FF4444',
          color: '#000',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {pick.recommendation?.includes('OVER') ? 'OVER' : 'UNDER'}
        </span>
        <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{pick.line}</span>
        <span style={{ color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase' }}>{pick.stat}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>PROJECTION</div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{pick.projection}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#6b7280', fontSize: '18px' }}>→</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>EDGE</div>
          <div style={{ color: '#00FF88', fontSize: '20px', fontWeight: 'bold' }}>
            {pick.edge > 0 ? '+' : ''}{pick.edge} ({pick.edge_pct > 0 ? '+' : ''}{pick.edge_pct}%)
          </div>
        </div>
      </div>
      
      {pick.badges && pick.badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          {pick.badges.map((badge, i) => (
            <span key={i} style={{
              backgroundColor: badge.type === 'injury_boost' ? '#FF444420' : badge.type === 'weak_defense' ? '#FFD70020' : '#00D4FF20',
              color: badge.type === 'injury_boost' ? '#FF4444' : badge.type === 'weak_defense' ? '#FFD700' : '#00D4FF',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              border: `1px solid ${badge.type === 'injury_boost' ? '#FF444440' : badge.type === 'weak_defense' ? '#FFD70040' : '#00D4FF40'}`
            }}>
              {badge.label}
            </span>
          ))}
        </div>
      )}
      
      <div style={{
        backgroundColor: '#12121f',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '10px'
      }}>
        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>VALUE BREAKDOWN</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '14px' }}>
          <span>{pick.base_avg || pick.season_avg}</span>
          <span style={{ color: '#00FF88' }}>+{(pick.projection - (pick.base_avg || pick.season_avg || pick.projection - pick.edge)).toFixed(1)}</span>
          <span>=</span>
          <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>{pick.projection}</span>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
        {expanded ? '▲ Collapse' : '▼ See breakdown'}
      </div>
      
      {expanded && pick.adjustments && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
          {pick.adjustments.map((adj, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#9ca3af', fontSize: '13px' }}>
              <span>{adj.icon} {adj.label}</span>
              <span style={{ color: adj.value >= 0 ? '#00FF88' : '#FF4444' }}>
                {adj.value >= 0 ? '+' : ''}{adj.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main SmashSpots Page
const SmashSpots = () => {
  const [sport, setSport] = useState('NBA');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  useEffect(() => {
    fetchPicks();
  }, [sport]);

  const fetchPicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSmashSpots(sport);
      if (data.picks || data.smash_spots) {
        setPicks(data.picks || data.smash_spots || []);
      } else if (Array.isArray(data)) {
        setPicks(data);
      } else {
        setPicks(MOCK_PICKS);
      }
    } catch (err) {
      console.error('Error fetching picks:', err);
      setPicks(MOCK_PICKS);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🔥</span> Today's Smash Spots
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
              <span style={{ color: '#00FF88' }}>● 80%+ SMASH</span>
              <span style={{ color: '#00D4FF' }}>● 70%+ STRONG</span>
              <span style={{ color: '#FFD700' }}>● &lt;70% LEAN</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding: '10px 20px',
                backgroundColor: sport === s ? '#00D4FF' : '#1a1a2e',
                color: sport === s ? '#000' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: sport === s ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            Loading picks...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#FF4444' }}>
            {error}
          </div>
        ) : picks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            No picks available for {sport} right now. Check back closer to game time.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {picks.map((pick, i) => (
              <SmashSpotCard key={i} pick={pick} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock picks for when API is unavailable
const MOCK_PICKS = [
  {
    player: 'Jerami Grant',
    team: 'Portland Trail Blazers',
    opponent: 'Utah Jazz',
    stat: 'points',
    line: 21.5,
    projection: 25.0,
    edge: 3.5,
    edge_pct: 16.3,
    confidence: 85,
    recommendation: 'STRONG OVER',
    base_avg: 21.9,
    badges: [
      { type: 'weak_defense', label: '#25 vs Wings' },
      { type: 'injury_boost', label: '32 pts vacuum' }
    ],
    adjustments: [
      { icon: '🎯', label: 'Matchup', value: 1.2 },
      { icon: '🚀', label: 'Vacuum', value: 1.9 }
    ]
  },
  {
    player: 'Collin Sexton',
    team: 'Utah Jazz',
    opponent: 'Portland Trail Blazers',
    stat: 'points',
    line: 17.5,
    projection: 20.1,
    edge: 2.6,
    edge_pct: 14.9,
    confidence: 85,
    recommendation: 'STRONG OVER',
    base_avg: 17.9,
    badges: [
      { type: 'weak_defense', label: '#26 vs Guards' },
      { type: 'pace', label: 'Pace +2' }
    ],
    adjustments: [
      { icon: '🎯', label: 'Matchup', value: 1.4 },
      { icon: '⚡', label: 'Pace', value: 0.8 }
    ]
  },
  {
    player: 'Devin Booker',
    team: 'Phoenix Suns',
    opponent: 'Houston Rockets',
    stat: 'points',
    line: 27.5,
    projection: 25.5,
    edge: -2,
    edge_pct: -7.3,
    confidence: 75,
    recommendation: 'LEAN UNDER',
    base_avg: 27.1,
    badges: [
      { type: 'elite_defense', label: '#8 vs Guards' },
      { type: 'blowout', label: '+8.5 dog' }
    ],
    adjustments: [
      { icon: '🛡️', label: 'Defense', value: -0.8 },
      { icon: '⚠️', label: 'Blowout Risk', value: -0.8 }
    ]
  }
];

export default SmashSpots;
