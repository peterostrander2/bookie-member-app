import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';

// ============================================================================
// MULTI-SPORT OPTIMIZATION - Priority 7E
// Sport-specific features, insights, and analysis tools
// ============================================================================

// ============================================================================
// SPORT CONFIGURATIONS
// ============================================================================

const SPORTS_CONFIG = {
  NFL: {
    id: 'NFL',
    name: 'NFL Football',
    icon: '🏈',
    color: '#22c55e',
    season: { start: 9, end: 2 }, // Sept - Feb
    features: ['weather', 'overUnder', 'homeDog', 'divisionRivalry', 'primetime'],
    positions: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'],
    defaultSpread: -3,
    defaultTotal: 44.5
  },
  NBA: {
    id: 'NBA',
    name: 'NBA Basketball',
    icon: '🏀',
    color: '#f97316',
    season: { start: 10, end: 6 }, // Oct - June
    features: ['backToBack', 'restAdvantage', 'pace', 'threePoint', 'altitude'],
    positions: ['PG', 'SG', 'SF', 'PF', 'C'],
    defaultSpread: -4,
    defaultTotal: 224.5
  },
  MLB: {
    id: 'MLB',
    name: 'MLB Baseball',
    icon: '⚾',
    color: '#ef4444',
    season: { start: 4, end: 10 }, // April - Oct
    features: ['pitcher', 'bullpen', 'weather', 'ballpark', 'umpire'],
    positions: ['SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'],
    defaultSpread: -1.5,
    defaultTotal: 8.5
  },
  NHL: {
    id: 'NHL',
    name: 'NHL Hockey',
    icon: '🏒',
    color: '#60a5fa',
    season: { start: 10, end: 6 }, // Oct - June
    features: ['goalie', 'homeIce', 'backToBack', 'roadTrip', 'divisional'],
    positions: ['G', 'D', 'C', 'LW', 'RW'],
    defaultSpread: -1.5,
    defaultTotal: 6
  },
  NCAAB: {
    id: 'NCAAB',
    name: 'College Basketball',
    icon: '🎓',
    color: '#a855f7',
    season: { start: 11, end: 4 }, // Nov - April
    features: ['tournament', 'conference', 'homeCourt', 'revenge', 'travel'],
    positions: ['G', 'F', 'C'],
    defaultSpread: -5,
    defaultTotal: 140
  },
  NCAAF: {
    id: 'NCAAF',
    name: 'College Football',
    icon: '🏟️',
    color: '#eab308',
    season: { start: 8, end: 1 }, // Aug - Jan
    features: ['homeField', 'weather', 'rivalry', 'letdown', 'lookahead'],
    positions: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'],
    defaultSpread: -7,
    defaultTotal: 52
  }
};

// ============================================================================
// NFL-SPECIFIC DATA & INSIGHTS
// ============================================================================

const NFL_INSIGHTS = {
  weather: {
    title: 'Weather Impact',
    icon: '🌧️',
    data: [
      { condition: 'Snow Games', record: '58-42', roi: 12.3, note: 'Unders 61% hit rate' },
      { condition: 'Wind >15mph', record: '124-96', roi: 8.7, note: 'Under hits 59%' },
      { condition: 'Rain Games', record: '89-71', roi: 6.2, note: 'Home teams +4%' },
      { condition: 'Dome Teams Outdoors', record: '42-58', roi: -14.2, note: 'Fade in cold weather' },
      { condition: 'Cold (<32°F)', record: '167-133', roi: 7.8, note: 'Home dogs +5.2%' }
    ]
  },
  situational: {
    title: 'Situational Spots',
    icon: '📍',
    data: [
      { spot: 'Road Favorites >7', record: '89-111', roi: -18.4, note: 'Fade big road faves' },
      { spot: 'Home Dogs +7 or more', record: '156-124', roi: 11.2, note: 'Live dog territory' },
      { spot: 'Thursday Night Dogs', record: '67-53', roi: 9.8, note: 'Short week chaos' },
      { spot: 'Post-Bye Favorites', record: '142-118', roi: 6.3, note: 'Rest advantage' },
      { spot: 'Revenge Games', record: '78-62', roi: 8.1, note: 'Previous season losses' },
      { spot: 'Division Underdogs', record: '234-196', roi: 7.4, note: 'Familiarity factor' }
    ]
  },
  totals: {
    title: 'Over/Under Trends',
    icon: '📊',
    data: [
      { trend: 'Primetime Unders', record: '89-71', roi: 8.4, note: 'Defenses show up' },
      { trend: 'High Total >50', record: '45-55', roi: -9.2, note: 'Fade high totals' },
      { trend: 'Low Total <40', record: '52-48', roi: 4.1, note: 'Slight over lean' },
      { trend: 'Divisional Unders', record: '156-144', roi: 3.8, note: 'Familiar defenses' }
    ]
  }
};

const NFL_WEATHER_CONDITIONS = [
  { id: 'clear', label: 'Clear', icon: '☀️', impact: 0 },
  { id: 'cloudy', label: 'Cloudy', icon: '☁️', impact: 0 },
  { id: 'rain', label: 'Rain', icon: '🌧️', impact: -2.5 },
  { id: 'snow', label: 'Snow', icon: '❄️', impact: -4.5 },
  { id: 'wind', label: 'High Wind', icon: '💨', impact: -3.0 },
  { id: 'dome', label: 'Dome/Roof', icon: '🏟️', impact: 1.5 }
];

// ============================================================================
// MLB-SPECIFIC DATA & INSIGHTS
// ============================================================================

const MLB_INSIGHTS = {
  pitching: {
    title: 'Pitching Trends',
    icon: '⚾',
    data: [
      { trend: 'Ace vs Ace (ERA <3.00)', record: '89-111', roi: -9.8, note: 'Unders 58% hit' },
      { trend: 'Bullpen ERA >4.50', record: '67-83', roi: -10.7, note: 'Fade tired pens' },
      { trend: 'Rookie SP (<10 starts)', record: '45-55', roi: -8.2, note: 'Fade first-timers' },
      { trend: 'Returning from IL', record: '38-62', roi: -18.4, note: 'Rust factor' },
      { trend: 'SP 3rd time thru order', record: '78-62', roi: 7.3, note: 'Quick hooks win' }
    ]
  },
  situational: {
    title: 'Situational Spots',
    icon: '📍',
    data: [
      { spot: 'Day After Night Game', record: '234-266', roi: -6.2, note: 'Tired bats' },
      { spot: 'Travel <500 miles', record: '189-171', roi: 4.8, note: 'Regional advantage' },
      { spot: 'Getaway Day', record: '145-155', roi: -3.4, note: 'Players distracted' },
      { spot: 'Umpire Strike Zone >10%', record: '89-71', roi: 8.7, note: 'Pitchers paradise' },
      { spot: 'Hot Streak (5+ wins)', record: '167-133', roi: 9.2, note: 'Momentum real' }
    ]
  },
  ballpark: {
    title: 'Ballpark Factors',
    icon: '🏟️',
    data: [
      { park: 'Coors Field', factor: 1.28, note: 'Overs paradise, pitchers fade' },
      { park: 'Oracle Park', factor: 0.85, note: 'Pitcher friendly, fade lefties' },
      { park: 'Yankee Stadium', factor: 1.12, note: 'Short porch, RH power' },
      { park: 'Fenway Park', factor: 1.08, note: 'Green Monster, doubles city' },
      { park: 'Petco Park', factor: 0.89, note: 'Marine layer kills fly balls' }
    ]
  }
};

const PITCHER_STATS = {
  categories: ['ERA', 'WHIP', 'K/9', 'BB/9', 'HR/9', 'FIP', 'xFIP', 'SIERA'],
  elite: { ERA: 2.80, WHIP: 1.05, 'K/9': 10.0, 'BB/9': 2.0 },
  average: { ERA: 4.20, WHIP: 1.30, 'K/9': 8.0, 'BB/9': 3.0 },
  poor: { ERA: 5.50, WHIP: 1.50, 'K/9': 6.0, 'BB/9': 4.0 }
};

// ============================================================================
// NHL-SPECIFIC DATA & INSIGHTS
// ============================================================================

const NHL_INSIGHTS = {
  goalie: {
    title: 'Goalie Impact',
    icon: '🥅',
    data: [
      { trend: 'Backup Starting', record: '234-266', roi: -6.8, note: 'Fade backups on road' },
      { trend: 'Elite Goalie (Sv% >.920)', record: '178-142', roi: 8.4, note: 'Trust the starters' },
      { trend: 'Cold Goalie (<.900 L5)', record: '67-83', roi: -9.2, note: 'Ride cold streaks' },
      { trend: 'Goalie revenge game', record: '45-35', roi: 11.2, note: 'Extra motivation' }
    ]
  },
  situational: {
    title: 'Situational Spots',
    icon: '📍',
    data: [
      { spot: 'Back-to-Back Home', record: '189-171', roi: 5.3, note: 'Home ice helps' },
      { spot: 'Back-to-Back Road', record: '134-166', roi: -10.7, note: 'Travel fatigue' },
      { spot: '3rd Game in 4 Nights', record: '89-111', roi: -11.2, note: 'Exhaustion sets in' },
      { spot: 'Road Trip Game 4+', record: '78-102', roi: -12.4, note: 'Miss home cooking' },
      { spot: 'Divisional Rivals', record: '267-233', roi: 6.1, note: 'Playoff intensity' }
    ]
  },
  totals: {
    title: 'Totals Trends',
    icon: '📊',
    data: [
      { trend: 'Both Goalies >.915 Sv%', record: '78-62', roi: 8.7, note: 'Under hits 58%' },
      { trend: 'Total Set at 6.5+', record: '134-166', roi: -9.8, note: 'Market adjusts' },
      { trend: 'Afternoon Games', record: '89-71', roi: 7.4, note: 'Overs hit 56%' }
    ]
  }
};

const GOALIE_RATINGS = {
  elite: { sv_pct: 0.920, gaa: 2.20, wins: 35 },
  good: { sv_pct: 0.910, gaa: 2.60, wins: 25 },
  average: { sv_pct: 0.905, gaa: 2.90, wins: 18 },
  below: { sv_pct: 0.895, gaa: 3.20, wins: 12 }
};

// ============================================================================
// NCAAB-SPECIFIC DATA & INSIGHTS
// ============================================================================

const NCAAB_INSIGHTS = {
  tournament: {
    title: 'March Madness',
    icon: '🏆',
    data: [
      { trend: '12 vs 5 Seed', record: '47-33', roi: 14.2, note: '35% upset rate historically' },
      { trend: '11 vs 6 Seed', record: '52-28', roi: 18.7, note: 'First Four winners fire' },
      { trend: '1 Seeds vs 16 Seeds', record: '143-1', roi: -42.0, note: 'UMBC never forget' },
      { trend: 'Double-Digit Seeds Sweet 16', record: '67-133', roi: -8.4, note: 'Cinderella fades' },
      { trend: 'Conference Champ Auto-Bids', record: '89-71', roi: 7.8, note: 'Hot at right time' }
    ]
  },
  situational: {
    title: 'Regular Season',
    icon: '📍',
    data: [
      { spot: 'Revenge Game', record: '178-142', roi: 9.2, note: 'Lost to them earlier' },
      { spot: 'Conference Opener', record: '156-144', roi: 4.1, note: 'Fresh start energy' },
      { spot: 'Travel >500 miles', record: '134-166', roi: -9.7, note: 'Road trip fatigue' },
      { spot: 'True Road Underdogs', record: '267-233', roi: 6.8, note: 'Hostile environments' },
      { spot: 'Buy Games (FCS vs FBS)', record: '23-77', roi: -54.0, note: 'Never bet cupcakes' }
    ]
  },
  totals: {
    title: 'Tempo Trends',
    icon: '📊',
    data: [
      { trend: 'Both Teams Top 50 Tempo', record: '89-71', roi: 8.4, note: 'Overs print' },
      { trend: 'Both Teams Bottom 50 Tempo', record: '78-62', roi: 9.1, note: 'Unders hit 56%' },
      { trend: 'Mismatch Tempo (>30 diff)', record: '67-53', roi: 7.2, note: 'Adjust for pace' }
    ]
  }
};

const TOURNAMENT_SEEDS = {
  1: { avgRecord: '28-4', advanceRate: 99, sweetSixteen: 85, finalFour: 51, title: 22 },
  2: { avgRecord: '26-6', advanceRate: 94, sweetSixteen: 62, finalFour: 31, title: 11 },
  3: { avgRecord: '24-7', advanceRate: 85, sweetSixteen: 47, finalFour: 17, title: 5 },
  4: { avgRecord: '23-8', advanceRate: 79, sweetSixteen: 39, finalFour: 12, title: 3 },
  5: { avgRecord: '22-9', advanceRate: 65, sweetSixteen: 28, finalFour: 7, title: 1 },
  6: { avgRecord: '21-10', advanceRate: 63, sweetSixteen: 24, finalFour: 6, title: 1 },
  7: { avgRecord: '20-11', advanceRate: 61, sweetSixteen: 18, finalFour: 4, title: 1 },
  8: { avgRecord: '19-12', advanceRate: 50, sweetSixteen: 12, finalFour: 2, title: 0 }
};

// ============================================================================
// CONTEXT
// ============================================================================

const MultiSportContext = createContext(null);

export const useMultiSport = () => {
  const ctx = useContext(MultiSportContext);
  if (!ctx) throw new Error('useMultiSport must be used within MultiSportProvider');
  return ctx;
};

export const MultiSportProvider = ({ children }) => {
  const [activeSport, setActiveSport] = useState('NFL');
  const [preferences, setPreferences] = useState({});

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookie_sport_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load sport preferences:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bookie_sport_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const value = {
    activeSport,
    setActiveSport,
    sportConfig: SPORTS_CONFIG[activeSport],
    allSports: SPORTS_CONFIG,
    preferences,
    setPreferences
  };

  return (
    <MultiSportContext.Provider value={value}>
      {children}
    </MultiSportContext.Provider>
  );
};

// ============================================================================
// SPORT SELECTOR COMPONENT
// ============================================================================

export const SportSelector = ({ selected, onChange, showAll = false }) => {
  const sports = showAll
    ? Object.values(SPORTS_CONFIG)
    : Object.values(SPORTS_CONFIG).filter(s => ['NFL', 'NBA', 'MLB', 'NHL', 'NCAAB'].includes(s.id));

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }}>
      {sports.map(sport => (
        <button
          key={sport.id}
          onClick={() => onChange(sport.id)}
          style={{
            padding: '10px 18px',
            background: selected === sport.id
              ? `${sport.color}22`
              : 'rgba(51, 65, 85, 0.5)',
            border: `2px solid ${selected === sport.id ? sport.color : 'transparent'}`,
            borderRadius: 10,
            color: selected === sport.id ? sport.color : '#94a3b8',
            fontWeight: selected === sport.id ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 18 }}>{sport.icon}</span>
          <span>{sport.id}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// NFL WEATHER ANALYZER
// ============================================================================

export const NFLWeatherAnalyzer = ({ game }) => {
  const [weather, setWeather] = useState({
    temp: 55,
    wind: 8,
    condition: 'clear',
    precipitation: 0
  });

  const weatherImpact = useMemo(() => {
    let totalImpact = 0;
    let insights = [];

    // Temperature impact
    if (weather.temp < 32) {
      totalImpact -= 3;
      insights.push({ icon: '🥶', text: 'Cold game: Under bias +5%', type: 'under' });
    } else if (weather.temp > 85) {
      totalImpact -= 1.5;
      insights.push({ icon: '🥵', text: 'Hot game: Pace may slow', type: 'under' });
    }

    // Wind impact
    if (weather.wind > 20) {
      totalImpact -= 5;
      insights.push({ icon: '💨', text: 'High wind: Unders hit 62%', type: 'under' });
      insights.push({ icon: '🎯', text: 'Passing game affected', type: 'neutral' });
    } else if (weather.wind > 15) {
      totalImpact -= 2.5;
      insights.push({ icon: '💨', text: 'Moderate wind: FG range reduced', type: 'under' });
    }

    // Condition impact
    const conditionData = NFL_WEATHER_CONDITIONS.find(c => c.id === weather.condition);
    if (conditionData) {
      totalImpact += conditionData.impact;
      if (weather.condition === 'snow') {
        insights.push({ icon: '❄️', text: 'Snow game: Unders 61% historical', type: 'under' });
      } else if (weather.condition === 'rain') {
        insights.push({ icon: '🌧️', text: 'Rain: Ball security concerns', type: 'neutral' });
      } else if (weather.condition === 'dome') {
        insights.push({ icon: '🏟️', text: 'Dome game: Pace typically faster', type: 'over' });
      }
    }

    // Precipitation
    if (weather.precipitation > 50) {
      totalImpact -= 2;
      insights.push({ icon: '☔', text: 'High precip chance: Ground game favored', type: 'under' });
    }

    return {
      totalImpact,
      insights,
      recommendation: totalImpact < -3 ? 'Strong Under Lean'
        : totalImpact < 0 ? 'Slight Under Lean'
        : totalImpact > 3 ? 'Over Lean'
        : 'Neutral'
    };
  }, [weather]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🌤️</span>
        NFL Weather Analyzer
      </h3>

      {/* Weather Inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Temperature (°F)
          </label>
          <input
            type="number"
            value={weather.temp}
            onChange={(e) => setWeather(prev => ({ ...prev, temp: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 10,
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: 16
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Wind (mph)
          </label>
          <input
            type="number"
            value={weather.wind}
            onChange={(e) => setWeather(prev => ({ ...prev, wind: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 10,
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: 16
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Condition
          </label>
          <select
            value={weather.condition}
            onChange={(e) => setWeather(prev => ({ ...prev, condition: e.target.value }))}
            style={{
              width: '100%',
              padding: 10,
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: 14
            }}
          >
            {NFL_WEATHER_CONDITIONS.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Precip Chance (%)
          </label>
          <input
            type="number"
            value={weather.precipitation}
            onChange={(e) => setWeather(prev => ({ ...prev, precipitation: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 10,
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: 16
            }}
          />
        </div>
      </div>

      {/* Impact Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: 16,
        background: weatherImpact.totalImpact < -2
          ? 'rgba(96, 165, 250, 0.15)'
          : weatherImpact.totalImpact > 2
          ? 'rgba(34, 197, 94, 0.15)'
          : 'rgba(251, 191, 36, 0.15)',
        borderRadius: 12,
        marginBottom: 20
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: weatherImpact.totalImpact < -2
            ? '#60a5fa'
            : weatherImpact.totalImpact > 2
            ? '#22c55e'
            : '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: '#0f172a'
        }}>
          {weatherImpact.totalImpact > 0 ? '+' : ''}{weatherImpact.totalImpact.toFixed(1)}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc' }}>
            {weatherImpact.recommendation}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Weather impact on total
          </div>
        </div>
      </div>

      {/* Insights */}
      {weatherImpact.insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {weatherImpact.insights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                background: insight.type === 'under'
                  ? 'rgba(96, 165, 250, 0.1)'
                  : insight.type === 'over'
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(251, 191, 36, 0.1)',
                borderRadius: 8
              }}
            >
              <span style={{ fontSize: 20 }}>{insight.icon}</span>
              <span style={{ color: '#e2e8f0' }}>{insight.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MLB PITCHING MATCHUP
// ============================================================================

export const MLBPitchingMatchup = ({ homeTeam, awayTeam }) => {
  const [homePitcher, setHomePitcher] = useState({
    name: '',
    era: 3.50,
    whip: 1.15,
    k9: 9.0,
    bb9: 2.5,
    hr9: 1.0,
    record: '10-5'
  });

  const [awayPitcher, setAwayPitcher] = useState({
    name: '',
    era: 4.00,
    whip: 1.25,
    k9: 8.5,
    bb9: 3.0,
    hr9: 1.2,
    record: '8-7'
  });

  const analysis = useMemo(() => {
    const homeFIP = (13 * homePitcher.hr9 + 3 * homePitcher.bb9 - 2 * homePitcher.k9) / 9 + 3.2;
    const awayFIP = (13 * awayPitcher.hr9 + 3 * awayPitcher.bb9 - 2 * awayPitcher.k9) / 9 + 3.2;

    const homeRating = (100 - (homePitcher.era * 10) - (homePitcher.whip * 15) + (homePitcher.k9 * 3)) / 10;
    const awayRating = (100 - (awayPitcher.era * 10) - (awayPitcher.whip * 15) + (awayPitcher.k9 * 3)) / 10;

    const edge = homeRating - awayRating;
    const totalLean = (homePitcher.era + awayPitcher.era) / 2 < 3.5 ? 'under'
      : (homePitcher.era + awayPitcher.era) / 2 > 4.5 ? 'over' : 'neutral';

    return {
      homeFIP,
      awayFIP,
      homeRating,
      awayRating,
      edge,
      totalLean,
      edgeTeam: edge > 1 ? 'home' : edge < -1 ? 'away' : 'neutral'
    };
  }, [homePitcher, awayPitcher]);

  const renderPitcherCard = (pitcher, setPitcher, label, rating) => (
    <div style={{
      flex: 1,
      background: 'rgba(51, 65, 85, 0.3)',
      borderRadius: 12,
      padding: 16
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
        <input
          type="text"
          value={pitcher.name}
          onChange={(e) => setPitcher(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Pitcher Name"
          style={{
            width: '100%',
            padding: 8,
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: 6,
            color: '#f1f5f9',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600
          }}
        />
        <div style={{
          marginTop: 8,
          fontSize: 24,
          fontWeight: 700,
          color: rating >= 7 ? '#22c55e' : rating >= 5 ? '#fbbf24' : '#ef4444'
        }}>
          {rating.toFixed(1)}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Rating</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { key: 'era', label: 'ERA', step: 0.1 },
          { key: 'whip', label: 'WHIP', step: 0.01 },
          { key: 'k9', label: 'K/9', step: 0.1 },
          { key: 'bb9', label: 'BB/9', step: 0.1 },
          { key: 'hr9', label: 'HR/9', step: 0.1 }
        ].map(stat => (
          <div key={stat.key}>
            <label style={{ fontSize: 10, color: '#64748b' }}>{stat.label}</label>
            <input
              type="number"
              step={stat.step}
              value={pitcher[stat.key]}
              onChange={(e) => setPitcher(prev => ({ ...prev, [stat.key]: parseFloat(e.target.value) || 0 }))}
              style={{
                width: '100%',
                padding: 6,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: 4,
                color: '#f1f5f9',
                fontSize: 14
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚾</span>
        MLB Pitching Matchup
      </h3>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {renderPitcherCard(awayPitcher, setAwayPitcher, 'Away Starter', analysis.awayRating)}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: '#64748b'
        }}>
          VS
        </div>
        {renderPitcherCard(homePitcher, setHomePitcher, 'Home Starter', analysis.homeRating)}
      </div>

      {/* Analysis Results */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16
      }}>
        <div style={{
          padding: 16,
          background: analysis.edgeTeam === 'home'
            ? 'rgba(34, 197, 94, 0.15)'
            : analysis.edgeTeam === 'away'
            ? 'rgba(239, 68, 68, 0.15)'
            : 'rgba(251, 191, 36, 0.15)',
          borderRadius: 12,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
            {analysis.edge > 0 ? '+' : ''}{analysis.edge.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Pitching Edge</div>
          <div style={{
            marginTop: 8,
            fontSize: 13,
            color: analysis.edgeTeam === 'home' ? '#4ade80' : analysis.edgeTeam === 'away' ? '#f87171' : '#fbbf24'
          }}>
            {analysis.edgeTeam === 'home' ? '→ Home' : analysis.edgeTeam === 'away' ? '→ Away' : 'Even'}
          </div>
        </div>

        <div style={{
          padding: 16,
          background: analysis.totalLean === 'under'
            ? 'rgba(96, 165, 250, 0.15)'
            : analysis.totalLean === 'over'
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(251, 191, 36, 0.15)',
          borderRadius: 12,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
            {((homePitcher.era + awayPitcher.era) / 2).toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Combined ERA</div>
          <div style={{
            marginTop: 8,
            fontSize: 13,
            color: analysis.totalLean === 'under' ? '#60a5fa' : analysis.totalLean === 'over' ? '#4ade80' : '#fbbf24'
          }}>
            {analysis.totalLean === 'under' ? '↓ Under Lean' : analysis.totalLean === 'over' ? '↑ Over Lean' : 'Neutral'}
          </div>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(168, 85, 247, 0.15)',
          borderRadius: 12,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>
            {((analysis.homeFIP + analysis.awayFIP) / 2).toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Combined FIP</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#a855f7' }}>
            ERA Independent
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NHL GOALIE ANALYZER
// ============================================================================

export const NHLGoalieAnalyzer = () => {
  const [homeGoalie, setHomeGoalie] = useState({
    name: '',
    svPct: 0.912,
    gaa: 2.65,
    wins: 22,
    record: '22-15-3',
    lastFive: 0.918
  });

  const [awayGoalie, setAwayGoalie] = useState({
    name: '',
    svPct: 0.908,
    gaa: 2.85,
    wins: 18,
    record: '18-17-5',
    lastFive: 0.901
  });

  const analysis = useMemo(() => {
    // Rating calculation
    const rateGoalie = (g) => {
      let rating = 50;
      if (g.svPct >= 0.920) rating += 25;
      else if (g.svPct >= 0.910) rating += 15;
      else if (g.svPct >= 0.900) rating += 5;
      else rating -= 10;

      if (g.gaa <= 2.20) rating += 20;
      else if (g.gaa <= 2.60) rating += 10;
      else if (g.gaa <= 3.00) rating += 0;
      else rating -= 10;

      // Recent form bonus/penalty
      if (g.lastFive >= 0.920) rating += 10;
      else if (g.lastFive < 0.895) rating -= 15;

      return Math.min(100, Math.max(0, rating));
    };

    const homeRating = rateGoalie(homeGoalie);
    const awayRating = rateGoalie(awayGoalie);

    // Total lean based on combined save %
    const combinedSvPct = (homeGoalie.svPct + awayGoalie.svPct) / 2;
    const totalLean = combinedSvPct >= 0.915 ? 'under'
      : combinedSvPct < 0.900 ? 'over' : 'neutral';

    return {
      homeRating,
      awayRating,
      edge: homeRating - awayRating,
      totalLean,
      homeForm: homeGoalie.lastFive >= 0.910 ? 'hot' : homeGoalie.lastFive < 0.895 ? 'cold' : 'neutral',
      awayForm: awayGoalie.lastFive >= 0.910 ? 'hot' : awayGoalie.lastFive < 0.895 ? 'cold' : 'neutral'
    };
  }, [homeGoalie, awayGoalie]);

  const renderGoalieCard = (goalie, setGoalie, label, rating, form) => (
    <div style={{
      flex: 1,
      background: 'rgba(51, 65, 85, 0.3)',
      borderRadius: 12,
      padding: 16
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
        <input
          type="text"
          value={goalie.name}
          onChange={(e) => setGoalie(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Goalie Name"
          style={{
            width: '100%',
            padding: 8,
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: 6,
            color: '#f1f5f9',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: rating >= 70 ? '#22c55e' : rating >= 50 ? '#fbbf24' : '#ef4444'
            }}>
              {rating}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Rating</div>
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: form === 'hot' ? 'rgba(34, 197, 94, 0.2)'
              : form === 'cold' ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(251, 191, 36, 0.2)',
            color: form === 'hot' ? '#4ade80'
              : form === 'cold' ? '#f87171'
              : '#fbbf24',
            fontSize: 12,
            alignSelf: 'center'
          }}>
            {form === 'hot' ? '🔥 Hot' : form === 'cold' ? '❄️ Cold' : '➖ Neutral'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ fontSize: 10, color: '#64748b' }}>Save %</label>
          <input
            type="number"
            step={0.001}
            value={goalie.svPct}
            onChange={(e) => setGoalie(prev => ({ ...prev, svPct: parseFloat(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 6,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              color: '#f1f5f9',
              fontSize: 14
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, color: '#64748b' }}>GAA</label>
          <input
            type="number"
            step={0.01}
            value={goalie.gaa}
            onChange={(e) => setGoalie(prev => ({ ...prev, gaa: parseFloat(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 6,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              color: '#f1f5f9',
              fontSize: 14
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, color: '#64748b' }}>Last 5 Sv%</label>
          <input
            type="number"
            step={0.001}
            value={goalie.lastFive}
            onChange={(e) => setGoalie(prev => ({ ...prev, lastFive: parseFloat(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 6,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              color: '#f1f5f9',
              fontSize: 14
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, color: '#64748b' }}>Wins</label>
          <input
            type="number"
            value={goalie.wins}
            onChange={(e) => setGoalie(prev => ({ ...prev, wins: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100%',
              padding: 6,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 4,
              color: '#f1f5f9',
              fontSize: 14
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🥅</span>
        NHL Goalie Analyzer
      </h3>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {renderGoalieCard(awayGoalie, setAwayGoalie, 'Away Goalie', analysis.awayRating, analysis.awayForm)}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: '#64748b'
        }}>
          VS
        </div>
        {renderGoalieCard(homeGoalie, setHomeGoalie, 'Home Goalie', analysis.homeRating, analysis.homeForm)}
      </div>

      {/* Analysis Summary */}
      <div style={{
        padding: 16,
        background: analysis.totalLean === 'under'
          ? 'rgba(96, 165, 250, 0.15)'
          : analysis.totalLean === 'over'
          ? 'rgba(34, 197, 94, 0.15)'
          : 'rgba(251, 191, 36, 0.15)',
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Edge</div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: analysis.edge > 10 ? '#4ade80' : analysis.edge < -10 ? '#f87171' : '#fbbf24'
          }}>
            {analysis.edge > 0 ? 'Home +' : 'Away +'}{Math.abs(analysis.edge).toFixed(0)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Total Lean</div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: analysis.totalLean === 'under' ? '#60a5fa'
              : analysis.totalLean === 'over' ? '#4ade80' : '#fbbf24'
          }}>
            {analysis.totalLean === 'under' ? '↓ Under'
              : analysis.totalLean === 'over' ? '↑ Over' : '➖ Neutral'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Combined Sv%</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>
            {((homeGoalie.svPct + awayGoalie.svPct) / 2 * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NCAAB TOURNAMENT TOOLS
// ============================================================================

export const NCAABTournamentTools = () => {
  const [matchup, setMatchup] = useState({
    highSeed: 1,
    lowSeed: 16,
    round: 'first'
  });

  const [bracketPicks, setBracketPicks] = useState([]);

  const seedAnalysis = useMemo(() => {
    const high = TOURNAMENT_SEEDS[matchup.highSeed];
    const low = TOURNAMENT_SEEDS[matchup.lowSeed];

    if (!high || !low) return null;

    const upsetRate = 100 - high.advanceRate;
    const historical = {
      '1v16': { upsets: 1, games: 144, note: 'UMBC over Virginia (2018)' },
      '2v15': { upsets: 9, games: 144, note: '6.3% upset rate' },
      '3v14': { upsets: 21, games: 144, note: '14.6% upset rate' },
      '4v13': { upsets: 29, games: 144, note: '20.1% upset rate' },
      '5v12': { upsets: 51, games: 144, note: '35.4% upset rate - BEST VALUE' },
      '6v11': { upsets: 52, games: 144, note: '36.1% upset rate' },
      '7v10': { upsets: 58, games: 144, note: '40.3% upset rate' },
      '8v9': { upsets: 71, games: 144, note: '49.3% - Coin flip' }
    };

    const matchupKey = `${matchup.highSeed}v${matchup.lowSeed}`;

    return {
      highSeed: high,
      lowSeed: low,
      upsetRate,
      historical: historical[matchupKey] || null,
      recommendation: upsetRate >= 35 ? 'upset_value' : upsetRate >= 15 ? 'monitor' : 'chalk'
    };
  }, [matchup]);

  const rounds = [
    { id: 'first', label: 'First Round' },
    { id: 'second', label: 'Second Round' },
    { id: 'sweet16', label: 'Sweet 16' },
    { id: 'elite8', label: 'Elite 8' },
    { id: 'final4', label: 'Final Four' },
    { id: 'championship', label: 'Championship' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🏆</span>
        March Madness Tools
      </h3>

      {/* Seed Matchup Analyzer */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 15 }}>
          Seed Matchup Analyzer
        </h4>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Higher Seed
            </label>
            <select
              value={matchup.highSeed}
              onChange={(e) => setMatchup(prev => ({ ...prev, highSeed: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: 10,
                background: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 16
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(seed => (
                <option key={seed} value={seed}>#{seed} Seed</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 10px 10px', color: '#64748b' }}>
            vs
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Lower Seed
            </label>
            <select
              value={matchup.lowSeed}
              onChange={(e) => setMatchup(prev => ({ ...prev, lowSeed: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: 10,
                background: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 16
              }}
            >
              {[16, 15, 14, 13, 12, 11, 10, 9].map(seed => (
                <option key={seed} value={seed}>#{seed} Seed</option>
              ))}
            </select>
          </div>
        </div>

        {/* Analysis Results */}
        {seedAnalysis && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              padding: 16,
              background: seedAnalysis.recommendation === 'upset_value'
                ? 'rgba(34, 197, 94, 0.15)'
                : seedAnalysis.recommendation === 'monitor'
                ? 'rgba(251, 191, 36, 0.15)'
                : 'rgba(96, 165, 250, 0.15)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc' }}>
                {seedAnalysis.upsetRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Historical Upset Rate</div>
            </div>

            <div style={{
              padding: 16,
              background: 'rgba(168, 85, 247, 0.15)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a855f7' }}>
                {seedAnalysis.highSeed.advanceRate}%
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>#{matchup.highSeed} Advance Rate</div>
            </div>

            <div style={{
              padding: 16,
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f87171' }}>
                {seedAnalysis.highSeed.title}%
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>#{matchup.highSeed} Title Rate</div>
            </div>
          </div>
        )}

        {/* Historical Note */}
        {seedAnalysis?.historical && (
          <div style={{
            padding: 14,
            background: seedAnalysis.upsetRate >= 35
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(251, 191, 36, 0.1)',
            borderRadius: 10,
            borderLeft: `3px solid ${seedAnalysis.upsetRate >= 35 ? '#22c55e' : '#fbbf24'}`
          }}>
            <div style={{ fontWeight: 600, color: seedAnalysis.upsetRate >= 35 ? '#4ade80' : '#fbbf24' }}>
              📊 Historical: {seedAnalysis.historical.upsets}/{seedAnalysis.historical.games} upsets
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {seedAnalysis.historical.note}
            </div>
          </div>
        )}
      </div>

      {/* Seed Advancement Table */}
      <div>
        <h4 style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 15 }}>
          Seed Advancement Rates
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8
        }}>
          {Object.entries(TOURNAMENT_SEEDS).map(([seed, data]) => (
            <div
              key={seed}
              style={{
                padding: 12,
                background: 'rgba(51, 65, 85, 0.3)',
                borderRadius: 8,
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: parseInt(seed) <= 2 ? '#22c55e'
                  : parseInt(seed) <= 4 ? '#60a5fa'
                  : parseInt(seed) <= 6 ? '#fbbf24'
                  : '#f87171'
              }}>
                #{seed}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                R32: {data.advanceRate}%
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                S16: {data.sweetSixteen}%
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                F4: {data.finalFour}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SPORT-SPECIFIC INSIGHTS PANEL
// ============================================================================

export const SportInsightsPanel = ({ sport }) => {
  const insights = useMemo(() => {
    switch (sport) {
      case 'NFL': return NFL_INSIGHTS;
      case 'MLB': return MLB_INSIGHTS;
      case 'NHL': return NHL_INSIGHTS;
      case 'NCAAB': return NCAAB_INSIGHTS;
      default: return null;
    }
  }, [sport]);

  if (!insights) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        color: '#64748b'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div>Select a sport to see insights</div>
      </div>
    );
  }

  const sportConfig = SPORTS_CONFIG[sport];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{
        color: sportConfig.color,
        margin: '0 0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span style={{ fontSize: 28 }}>{sportConfig.icon}</span>
        {sport} Betting Insights
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.entries(insights).map(([key, category]) => (
          <div key={key}>
            <h4 style={{
              color: '#e2e8f0',
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{category.icon}</span>
              {category.title}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {category.data.map((item, idx) => {
                const isPositive = item.roi > 0;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      background: isPositive
                        ? 'rgba(34, 197, 94, 0.08)'
                        : 'rgba(239, 68, 68, 0.08)',
                      borderRadius: 8,
                      borderLeft: `3px solid ${isPositive ? '#22c55e' : '#ef4444'}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>
                        {item.spot || item.trend || item.condition || item.park}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                        {item.note}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                        {item.record || (item.factor && `${item.factor}x`)}
                      </div>
                      {item.roi !== undefined && (
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isPositive ? '#4ade80' : '#f87171'
                        }}>
                          {isPositive ? '+' : ''}{item.roi}% ROI
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MULTI-SPORT DASHBOARD
// ============================================================================

export const MultiSportDashboard = () => {
  const [activeSport, setActiveSport] = useState('NFL');
  const [activeTab, setActiveTab] = useState('insights');

  const sportConfig = SPORTS_CONFIG[activeSport];

  const tabs = {
    NFL: [
      { id: 'insights', label: 'Insights', icon: '📊' },
      { id: 'weather', label: 'Weather', icon: '🌤️' }
    ],
    MLB: [
      { id: 'insights', label: 'Insights', icon: '📊' },
      { id: 'pitching', label: 'Pitching', icon: '⚾' }
    ],
    NHL: [
      { id: 'insights', label: 'Insights', icon: '📊' },
      { id: 'goalie', label: 'Goalies', icon: '🥅' }
    ],
    NCAAB: [
      { id: 'insights', label: 'Insights', icon: '📊' },
      { id: 'tournament', label: 'Tournament', icon: '🏆' }
    ],
    NBA: [
      { id: 'insights', label: 'Insights', icon: '📊' }
    ]
  };

  const currentTabs = tabs[activeSport] || tabs.NBA;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      padding: 20
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sport-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 32,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${sportConfig.color}, #a855f7)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px'
        }}>
          {sportConfig.icon} Multi-Sport Optimizer
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Sport-specific tools, insights, and analysis
        </p>
      </div>

      {/* Sport Selector */}
      <div style={{ marginBottom: 24 }}>
        <SportSelector selected={activeSport} onChange={(sport) => {
          setActiveSport(sport);
          setActiveTab('insights');
        }} />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        background: 'rgba(30, 41, 59, 0.5)',
        padding: 8,
        borderRadius: 12
      }}>
        {currentTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === tab.id ? `${sportConfig.color}22` : 'transparent',
              border: 'none',
              borderRadius: 8,
              color: activeTab === tab.id ? sportConfig.color : '#94a3b8',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {activeTab === 'insights' && <SportInsightsPanel sport={activeSport} />}
        {activeTab === 'weather' && activeSport === 'NFL' && <NFLWeatherAnalyzer />}
        {activeTab === 'pitching' && activeSport === 'MLB' && <MLBPitchingMatchup />}
        {activeTab === 'goalie' && activeSport === 'NHL' && <NHLGoalieAnalyzer />}
        {activeTab === 'tournament' && activeSport === 'NCAAB' && <NCAABTournamentTools />}
      </div>

      {/* Quick Reference Footer */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
          <strong style={{ color: '#f1f5f9' }}>Quick Tips:</strong>
          {activeSport === 'NFL' && ' Weather impacts totals more than sides • Fade road favorites >7 • Division dogs have value'}
          {activeSport === 'MLB' && ' Pitching matchups drive outcomes • Ballpark factors matter • Day games after night = tired bats'}
          {activeSport === 'NHL' && ' Goalie is 70% of the bet • Back-to-back road = fade • Divisional games are tighter'}
          {activeSport === 'NCAAB' && ' 12-seeds upset 35% of the time • Tempo mismatches create value • Conference tourney winners are hot'}
          {activeSport === 'NBA' && ' Rest advantage is real • Back-to-backs on road = fade • Altitude matters in Denver'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SPORTS_CONFIG,
  NFL_INSIGHTS,
  MLB_INSIGHTS,
  NHL_INSIGHTS,
  NCAAB_INSIGHTS,
  NFL_WEATHER_CONDITIONS,
  PITCHER_STATS,
  GOALIE_RATINGS,
  TOURNAMENT_SEEDS
};

export default MultiSportDashboard;
