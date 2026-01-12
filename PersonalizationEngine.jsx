/**
 * PersonalizationEngine.jsx
 * Comprehensive personalization system including:
 * - User preferences (teams, books, stake, risk)
 * - Betting style profile quiz
 * - AI learning from past bets
 * - Custom drag-and-drop dashboards
 */

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const SPORTS_TEAMS = {
  NFL: ['Chiefs', 'Eagles', 'Bills', '49ers', 'Cowboys', 'Dolphins', 'Lions', 'Ravens', 'Bengals', 'Jets', 'Patriots', 'Packers', 'Vikings', 'Bears', 'Chargers', 'Raiders', 'Broncos', 'Seahawks', 'Rams', 'Cardinals', 'Falcons', 'Saints', 'Buccaneers', 'Panthers', 'Giants', 'Commanders', 'Steelers', 'Browns', 'Titans', 'Colts', 'Jaguars', 'Texans'],
  NBA: ['Celtics', 'Lakers', 'Warriors', 'Bucks', 'Nuggets', 'Heat', 'Suns', '76ers', 'Knicks', 'Nets', 'Mavericks', 'Clippers', 'Grizzlies', 'Kings', 'Pelicans', 'Cavaliers', 'Hawks', 'Bulls', 'Raptors', 'Timberwolves', 'Thunder', 'Rockets', 'Spurs', 'Trail Blazers', 'Jazz', 'Pacers', 'Hornets', 'Wizards', 'Magic', 'Pistons'],
  MLB: ['Yankees', 'Dodgers', 'Astros', 'Braves', 'Mets', 'Padres', 'Phillies', 'Cardinals', 'Blue Jays', 'Mariners', 'Guardians', 'Orioles', 'Rays', 'Twins', 'Rangers', 'Red Sox', 'Cubs', 'Giants', 'Brewers', 'White Sox', 'Angels', 'Diamondbacks', 'Marlins', 'Reds', 'Pirates', 'Royals', 'Tigers', 'Athletics', 'Rockies', 'Nationals'],
  NHL: ['Bruins', 'Panthers', 'Avalanche', 'Golden Knights', 'Oilers', 'Rangers', 'Devils', 'Maple Leafs', 'Lightning', 'Stars', 'Wild', 'Hurricanes', 'Kings', 'Kraken', 'Jets', 'Flames', 'Canucks', 'Senators', 'Islanders', 'Penguins', 'Capitals', 'Flyers', 'Red Wings', 'Blues', 'Predators', 'Blackhawks', 'Sabres', 'Coyotes', 'Ducks', 'Sharks', 'Blue Jackets']
};

const SPORTSBOOKS = [
  { id: 'draftkings', name: 'DraftKings', logo: '🟢' },
  { id: 'fanduel', name: 'FanDuel', logo: '🔵' },
  { id: 'betmgm', name: 'BetMGM', logo: '🟡' },
  { id: 'caesars', name: 'Caesars', logo: '🔴' },
  { id: 'pointsbet', name: 'PointsBet', logo: '⚫' },
  { id: 'barstool', name: 'Barstool', logo: '🟠' },
  { id: 'betrivers', name: 'BetRivers', logo: '🟣' },
  { id: 'unibet', name: 'Unibet', logo: '🟢' },
  { id: 'wynnbet', name: 'WynnBET', logo: '🔶' },
  { id: 'betway', name: 'Betway', logo: '🔷' }
];

const RISK_PROFILES = {
  conservative: {
    name: 'Conservative',
    icon: '🛡️',
    description: 'Low risk, steady growth. Max 1-2% per bet.',
    kelly: 0.25,
    maxConfidence: 85,
    minConfidence: 75
  },
  moderate: {
    name: 'Moderate',
    icon: '⚖️',
    description: 'Balanced approach. 2-4% per bet.',
    kelly: 0.5,
    maxConfidence: 90,
    minConfidence: 70
  },
  aggressive: {
    name: 'Aggressive',
    icon: '🔥',
    description: 'Higher risk, higher reward. 4-6% per bet.',
    kelly: 0.75,
    maxConfidence: 95,
    minConfidence: 65
  },
  degen: {
    name: 'Full Send',
    icon: '🚀',
    description: 'Maximum aggression. Not for the faint of heart.',
    kelly: 1.0,
    maxConfidence: 100,
    minConfidence: 60
  }
};

const BETTING_STYLE_QUIZ = [
  {
    id: 1,
    question: "How do you feel about a 10-game losing streak?",
    options: [
      { text: "I'd take a break and reassess", score: { conservative: 3, moderate: 1 } },
      { text: "It happens, stay the course", score: { moderate: 3, aggressive: 1 } },
      { text: "Double down, regression to mean", score: { aggressive: 3, degen: 2 } },
      { text: "Already recovered by bet 11", score: { degen: 3 } }
    ]
  },
  {
    id: 2,
    question: "Your preferred bet type?",
    options: [
      { text: "Spreads and totals at -110", score: { conservative: 3, moderate: 2 } },
      { text: "Moneylines on slight favorites", score: { moderate: 3 } },
      { text: "Props with +150 to +300 odds", score: { aggressive: 3 } },
      { text: "Long-shot parlays, life-changing money", score: { degen: 3 } }
    ]
  },
  {
    id: 3,
    question: "How much research before placing a bet?",
    options: [
      { text: "Hours of analysis, multiple models", score: { conservative: 3 } },
      { text: "Check key stats and line movement", score: { moderate: 3 } },
      { text: "Quick gut check, trust the system", score: { aggressive: 3 } },
      { text: "Vibes only, chaos is my edge", score: { degen: 3 } }
    ]
  },
  {
    id: 4,
    question: "You hit a 5-game winning streak. Next move?",
    options: [
      { text: "Bank profits, reduce bet sizes", score: { conservative: 3 } },
      { text: "Stay consistent, same unit size", score: { moderate: 3 } },
      { text: "Increase stakes, ride the hot hand", score: { aggressive: 3 } },
      { text: "All-in on the next pick", score: { degen: 3 } }
    ]
  },
  {
    id: 5,
    question: "What's your ideal ROI target?",
    options: [
      { text: "3-5% long term, consistency wins", score: { conservative: 3 } },
      { text: "5-10%, beat the market", score: { moderate: 3 } },
      { text: "15-20%, I'm better than average", score: { aggressive: 3 } },
      { text: "100%+ or bust", score: { degen: 3 } }
    ]
  },
  {
    id: 6,
    question: "How do you handle a bad beat?",
    options: [
      { text: "Log it, analyze what went wrong", score: { conservative: 3 } },
      { text: "Frustrating but part of the game", score: { moderate: 3 } },
      { text: "Immediately look for revenge bet", score: { aggressive: 2, degen: 2 } },
      { text: "Already betting the next game", score: { degen: 3 } }
    ]
  },
  {
    id: 7,
    question: "Your bankroll is down 30%. What do you do?",
    options: [
      { text: "Stop betting, redeposit when ready", score: { conservative: 3 } },
      { text: "Reduce unit size proportionally", score: { moderate: 3 } },
      { text: "Keep same units, trust the process", score: { aggressive: 3 } },
      { text: "Time to get it all back tonight", score: { degen: 3 } }
    ]
  },
  {
    id: 8,
    question: "Pick your spirit animal:",
    options: [
      { text: "Tortoise - slow and steady", score: { conservative: 3 } },
      { text: "Wolf - calculated pack hunter", score: { moderate: 3 } },
      { text: "Shark - aggressive predator", score: { aggressive: 3 } },
      { text: "Honey badger - doesn't care", score: { degen: 3 } }
    ]
  }
];

const DASHBOARD_WIDGETS = [
  { id: 'daily-picks', name: "Today's Picks", icon: '🎯', size: 'large', category: 'picks' },
  { id: 'bankroll', name: 'Bankroll Status', icon: '💰', size: 'medium', category: 'money' },
  { id: 'roi-chart', name: 'ROI Chart', icon: '📈', size: 'large', category: 'stats' },
  { id: 'win-rate', name: 'Win Rate', icon: '🏆', size: 'small', category: 'stats' },
  { id: 'sharp-alerts', name: 'Sharp Alerts', icon: '🦈', size: 'medium', category: 'alerts' },
  { id: 'injuries', name: 'Injury Feed', icon: '🏥', size: 'medium', category: 'news' },
  { id: 'line-moves', name: 'Line Movement', icon: '📉', size: 'medium', category: 'odds' },
  { id: 'best-odds', name: 'Best Odds', icon: '💎', size: 'medium', category: 'odds' },
  { id: 'leaderboard', name: 'Leaderboard', icon: '🏅', size: 'medium', category: 'community' },
  { id: 'recent-bets', name: 'Recent Bets', icon: '📋', size: 'medium', category: 'history' },
  { id: 'clv-tracker', name: 'CLV Tracker', icon: '📊', size: 'small', category: 'stats' },
  { id: 'streak', name: 'Current Streak', icon: '🔥', size: 'small', category: 'stats' },
  { id: 'esoteric', name: 'Daily Energy', icon: '🔮', size: 'small', category: 'esoteric' },
  { id: 'consensus', name: 'Consensus Meter', icon: '👥', size: 'medium', category: 'community' },
  { id: 'favorites', name: 'Favorite Teams', icon: '⭐', size: 'small', category: 'personal' },
  { id: 'calendar', name: 'Upcoming Games', icon: '📅', size: 'medium', category: 'schedule' }
];

// ============================================================================
// PERSONALIZATION CONTEXT
// ============================================================================

const PersonalizationContext = createContext(null);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
};

export const PersonalizationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {
      favoriteTeams: [],
      favoriteSportsbooks: ['draftkings', 'fanduel'],
      defaultStake: 100,
      riskTolerance: 'moderate',
      sports: ['NFL', 'NBA', 'MLB', 'NHL'],
      oddsFormat: 'american',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  });

  const [bettingProfile, setBettingProfile] = useState(() => {
    const saved = localStorage.getItem('betting_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [learningData, setLearningData] = useState(() => {
    const saved = localStorage.getItem('learning_data');
    return saved ? JSON.parse(saved) : {
      betHistory: [],
      insights: [],
      strengths: [],
      weaknesses: [],
      confidenceAdjustments: {}
    };
  });

  const [dashboardLayouts, setDashboardLayouts] = useState(() => {
    const saved = localStorage.getItem('dashboard_layouts');
    return saved ? JSON.parse(saved) : {
      active: 'default',
      layouts: {
        default: {
          name: 'Default',
          widgets: ['daily-picks', 'bankroll', 'sharp-alerts', 'win-rate', 'streak']
        }
      }
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (bettingProfile) {
      localStorage.setItem('betting_profile', JSON.stringify(bettingProfile));
    }
  }, [bettingProfile]);

  useEffect(() => {
    localStorage.setItem('learning_data', JSON.stringify(learningData));
  }, [learningData]);

  useEffect(() => {
    localStorage.setItem('dashboard_layouts', JSON.stringify(dashboardLayouts));
  }, [dashboardLayouts]);

  // Update preferences
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // Add bet to learning history
  const recordBet = useCallback((bet) => {
    setLearningData(prev => ({
      ...prev,
      betHistory: [...prev.betHistory, { ...bet, timestamp: Date.now() }].slice(-500)
    }));
  }, []);

  // Analyze patterns from bet history
  const analyzePatterns = useCallback(() => {
    const history = learningData.betHistory;
    if (history.length < 20) return null;

    const patterns = {
      bySport: {},
      byBetType: {},
      byDayOfWeek: {},
      byConfidence: {},
      byOddsRange: {},
      byTeam: {}
    };

    history.forEach(bet => {
      // By sport
      if (!patterns.bySport[bet.sport]) {
        patterns.bySport[bet.sport] = { wins: 0, losses: 0, profit: 0 };
      }
      patterns.bySport[bet.sport][bet.won ? 'wins' : 'losses']++;
      patterns.bySport[bet.sport].profit += bet.profit || 0;

      // By bet type
      if (!patterns.byBetType[bet.type]) {
        patterns.byBetType[bet.type] = { wins: 0, losses: 0, profit: 0 };
      }
      patterns.byBetType[bet.type][bet.won ? 'wins' : 'losses']++;

      // By day of week
      const day = new Date(bet.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      if (!patterns.byDayOfWeek[day]) {
        patterns.byDayOfWeek[day] = { wins: 0, losses: 0 };
      }
      patterns.byDayOfWeek[day][bet.won ? 'wins' : 'losses']++;

      // By confidence range
      const confRange = Math.floor(bet.confidence / 10) * 10;
      const confKey = `${confRange}-${confRange + 9}%`;
      if (!patterns.byConfidence[confKey]) {
        patterns.byConfidence[confKey] = { wins: 0, losses: 0 };
      }
      patterns.byConfidence[confKey][bet.won ? 'wins' : 'losses']++;
    });

    return patterns;
  }, [learningData.betHistory]);

  // Generate insights
  const generateInsights = useCallback(() => {
    const patterns = analyzePatterns();
    if (!patterns) return [];

    const insights = [];

    // Find best sport
    Object.entries(patterns.bySport).forEach(([sport, data]) => {
      const total = data.wins + data.losses;
      if (total >= 10) {
        const winRate = data.wins / total;
        if (winRate > 0.55) {
          insights.push({
            type: 'strength',
            icon: '💪',
            title: `Strong in ${sport}`,
            description: `You're hitting ${(winRate * 100).toFixed(1)}% in ${sport} (${total} bets)`,
            recommendation: `Consider increasing stake on ${sport} picks`
          });
        } else if (winRate < 0.45) {
          insights.push({
            type: 'weakness',
            icon: '⚠️',
            title: `Struggling in ${sport}`,
            description: `Only ${(winRate * 100).toFixed(1)}% win rate in ${sport}`,
            recommendation: `Consider reducing ${sport} exposure or skipping`
          });
        }
      }
    });

    // Find best day
    let bestDay = null;
    let bestDayRate = 0;
    Object.entries(patterns.byDayOfWeek).forEach(([day, data]) => {
      const total = data.wins + data.losses;
      if (total >= 5) {
        const rate = data.wins / total;
        if (rate > bestDayRate) {
          bestDayRate = rate;
          bestDay = day;
        }
      }
    });
    if (bestDay && bestDayRate > 0.55) {
      insights.push({
        type: 'pattern',
        icon: '📅',
        title: `${bestDay} is your day`,
        description: `${(bestDayRate * 100).toFixed(1)}% win rate on ${bestDay}s`,
        recommendation: `Focus your best bets on ${bestDay}s`
      });
    }

    // Confidence sweet spot
    let bestConfRange = null;
    let bestConfRate = 0;
    Object.entries(patterns.byConfidence).forEach(([range, data]) => {
      const total = data.wins + data.losses;
      if (total >= 10) {
        const rate = data.wins / total;
        if (rate > bestConfRate) {
          bestConfRate = rate;
          bestConfRange = range;
        }
      }
    });
    if (bestConfRange && bestConfRate > 0.55) {
      insights.push({
        type: 'pattern',
        icon: '🎯',
        title: `Sweet spot: ${bestConfRange}`,
        description: `Your best results come from ${bestConfRange} confidence picks`,
        recommendation: `Prioritize picks in this confidence range`
      });
    }

    setLearningData(prev => ({ ...prev, insights }));
    return insights;
  }, [analyzePatterns]);

  const value = {
    preferences,
    updatePreferences,
    bettingProfile,
    setBettingProfile,
    learningData,
    recordBet,
    analyzePatterns,
    generateInsights,
    dashboardLayouts,
    setDashboardLayouts
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

// ============================================================================
// USER PREFERENCES PANEL
// ============================================================================

export const UserPreferencesPanel = () => {
  const { preferences, updatePreferences } = usePersonalization();
  const [activeTab, setActiveTab] = useState('teams');

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px'
    },
    header: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid #334155',
      paddingBottom: '12px'
    },
    tab: (active) => ({
      padding: '10px 20px',
      backgroundColor: active ? '#3b82f6' : 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: active ? 'white' : '#94a3b8',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer'
    }),
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f8fafc',
      marginBottom: '12px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '8px'
    },
    chip: (selected) => ({
      padding: '10px 16px',
      backgroundColor: selected ? '#3b82f6' : '#1e293b',
      border: selected ? 'none' : '1px solid #334155',
      borderRadius: '20px',
      color: selected ? 'white' : '#94a3b8',
      fontSize: '13px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s'
    }),
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '14px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  };

  const toggleTeam = (sport, team) => {
    const current = preferences.favoriteTeams;
    const key = `${sport}:${team}`;
    const updated = current.includes(key)
      ? current.filter(t => t !== key)
      : [...current, key];
    updatePreferences({ favoriteTeams: updated });
  };

  const toggleBook = (bookId) => {
    const current = preferences.favoriteSportsbooks;
    const updated = current.includes(bookId)
      ? current.filter(b => b !== bookId)
      : [...current, bookId];
    updatePreferences({ favoriteSportsbooks: updated });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        <span>⚙️</span> Preferences
      </h2>

      <div style={styles.tabs}>
        {[
          { id: 'teams', label: 'Teams', icon: '🏈' },
          { id: 'books', label: 'Sportsbooks', icon: '📚' },
          { id: 'betting', label: 'Betting', icon: '💰' },
          { id: 'display', label: 'Display', icon: '🎨' }
        ].map(tab => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'teams' && (
        <div>
          {Object.entries(SPORTS_TEAMS).map(([sport, teams]) => (
            <div key={sport} style={styles.section}>
              <h3 style={styles.sectionTitle}>{sport}</h3>
              <div style={styles.grid}>
                {teams.map(team => (
                  <button
                    key={team}
                    style={styles.chip(preferences.favoriteTeams.includes(`${sport}:${team}`))}
                    onClick={() => toggleTeam(sport, team)}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'books' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Select Your Sportsbooks</h3>
          <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {SPORTSBOOKS.map(book => (
              <button
                key={book.id}
                style={styles.chip(preferences.favoriteSportsbooks.includes(book.id))}
                onClick={() => toggleBook(book.id)}
              >
                {book.logo} {book.name}
              </button>
            ))}
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
            Selected books will be highlighted in odds comparison
          </p>
        </div>
      )}

      {activeTab === 'betting' && (
        <div>
          <div style={styles.row}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                Default Stake ($)
              </label>
              <input
                type="number"
                value={preferences.defaultStake}
                onChange={(e) => updatePreferences({ defaultStake: Number(e.target.value) })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                Odds Format
              </label>
              <select
                value={preferences.oddsFormat}
                onChange={(e) => updatePreferences({ oddsFormat: e.target.value })}
                style={styles.input}
              >
                <option value="american">American (+150)</option>
                <option value="decimal">Decimal (2.50)</option>
                <option value="fractional">Fractional (3/2)</option>
              </select>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Risk Tolerance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {Object.entries(RISK_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => updatePreferences({ riskTolerance: key })}
                  style={{
                    padding: '16px',
                    backgroundColor: preferences.riskTolerance === key ? '#1e293b' : 'transparent',
                    border: preferences.riskTolerance === key ? '2px solid #3b82f6' : '1px solid #334155',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{profile.icon}</div>
                  <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '4px' }}>{profile.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{profile.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'display' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Sports to Show</h3>
            <div style={styles.grid}>
              {['NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'UFC', 'Soccer'].map(sport => (
                <button
                  key={sport}
                  style={styles.chip(preferences.sports.includes(sport))}
                  onClick={() => {
                    const updated = preferences.sports.includes(sport)
                      ? preferences.sports.filter(s => s !== sport)
                      : [...preferences.sports, sport];
                    updatePreferences({ sports: updated });
                  }}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.row}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => updatePreferences({ timezone: e.target.value })}
                style={styles.input}
              >
                <option value="America/New_York">Eastern</option>
                <option value="America/Chicago">Central</option>
                <option value="America/Denver">Mountain</option>
                <option value="America/Los_Angeles">Pacific</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BETTING STYLE QUIZ
// ============================================================================

export const BettingStyleQuiz = ({ onComplete }) => {
  const { setBettingProfile } = usePersonalization();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionIndex) => {
    const question = BETTING_STYLE_QUIZ[currentQuestion];
    const option = question.options[optionIndex];

    setAnswers(prev => ({
      ...prev,
      [question.id]: option.score
    }));

    if (currentQuestion < BETTING_STYLE_QUIZ.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const scores = { conservative: 0, moderate: 0, aggressive: 0, degen: 0 };

    Object.values(answers).forEach(answer => {
      Object.entries(answer).forEach(([style, points]) => {
        scores[style] = (scores[style] || 0) + points;
      });
    });

    // Add current answer
    const lastQ = BETTING_STYLE_QUIZ[currentQuestion];
    const lastAnswer = answers[lastQ.id];
    if (lastAnswer) {
      Object.entries(lastAnswer).forEach(([style, points]) => {
        scores[style] += points;
      });
    }

    const sortedStyles = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primaryStyle = sortedStyles[0][0];
    const secondaryStyle = sortedStyles[1][0];

    const profile = {
      primary: primaryStyle,
      secondary: secondaryStyle,
      scores,
      completedAt: Date.now(),
      ...RISK_PROFILES[primaryStyle]
    };

    setBettingProfile(profile);
    setShowResult(true);
    onComplete?.(profile);
  };

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      margin: '0 auto'
    },
    progress: {
      display: 'flex',
      gap: '4px',
      marginBottom: '32px'
    },
    progressDot: (active, completed) => ({
      flex: 1,
      height: '4px',
      borderRadius: '2px',
      backgroundColor: completed ? '#22c55e' : active ? '#3b82f6' : '#334155'
    }),
    question: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '32px',
      lineHeight: 1.4
    },
    options: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    option: {
      padding: '20px',
      backgroundColor: '#1e293b',
      border: '2px solid #334155',
      borderRadius: '12px',
      color: '#f8fafc',
      fontSize: '16px',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    result: {
      textAlign: 'center'
    },
    resultIcon: {
      fontSize: '72px',
      marginBottom: '16px'
    },
    resultTitle: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '8px'
    },
    resultDesc: {
      fontSize: '16px',
      color: '#94a3b8',
      marginBottom: '32px'
    }
  };

  if (showResult) {
    const profile = RISK_PROFILES[Object.entries(answers).reduce((acc, [, score]) => {
      Object.entries(score).forEach(([style, points]) => {
        acc[style] = (acc[style] || 0) + points;
      });
      return acc;
    }, { conservative: 0, moderate: 0, aggressive: 0, degen: 0 })];

    const primaryStyle = Object.entries(
      Object.values(answers).reduce((acc, score) => {
        Object.entries(score).forEach(([style, points]) => {
          acc[style] = (acc[style] || 0) + points;
        });
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';

    const resultProfile = RISK_PROFILES[primaryStyle];

    return (
      <div style={styles.container}>
        <div style={styles.result}>
          <div style={styles.resultIcon}>{resultProfile.icon}</div>
          <h2 style={styles.resultTitle}>You're a {resultProfile.name} Bettor</h2>
          <p style={styles.resultDesc}>{resultProfile.description}</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Kelly Fraction</div>
              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 700 }}>{resultProfile.kelly * 100}%</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Min Confidence</div>
              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 700 }}>{resultProfile.minConfidence}%</div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '14px 32px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  const question = BETTING_STYLE_QUIZ[currentQuestion];

  return (
    <div style={styles.container}>
      <div style={styles.progress}>
        {BETTING_STYLE_QUIZ.map((_, i) => (
          <div key={i} style={styles.progressDot(i === currentQuestion, i < currentQuestion)} />
        ))}
      </div>

      <h2 style={styles.question}>{question.question}</h2>

      <div style={styles.options}>
        {question.options.map((option, i) => (
          <button
            key={i}
            style={styles.option}
            onClick={() => handleAnswer(i)}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.backgroundColor = '#1e3a5f';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.backgroundColor = '#1e293b';
            }}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '24px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
        Question {currentQuestion + 1} of {BETTING_STYLE_QUIZ.length}
      </div>
    </div>
  );
};

// ============================================================================
// AI LEARNING INSIGHTS
// ============================================================================

export const LearningInsights = () => {
  const { learningData, generateInsights, analyzePatterns } = usePersonalization();
  const [insights, setInsights] = useState([]);
  const patterns = useMemo(() => analyzePatterns(), [analyzePatterns]);

  useEffect(() => {
    const newInsights = generateInsights();
    setInsights(newInsights);
  }, [generateInsights]);

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    betCount: {
      padding: '6px 12px',
      backgroundColor: '#1e293b',
      borderRadius: '20px',
      color: '#94a3b8',
      fontSize: '13px'
    },
    insightCard: {
      padding: '20px',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      marginBottom: '12px',
      borderLeft: '4px solid'
    },
    insightHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    insightIcon: {
      fontSize: '24px'
    },
    insightTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f8fafc'
    },
    insightDesc: {
      fontSize: '14px',
      color: '#94a3b8',
      marginBottom: '12px'
    },
    recommendation: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      backgroundColor: '#0f172a',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#3b82f6'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    statCard: {
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '10px'
    },
    statTitle: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '12px',
      textTransform: 'uppercase'
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #334155'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px',
      color: '#64748b'
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'strength': return '#22c55e';
      case 'weakness': return '#ef4444';
      case 'pattern': return '#3b82f6';
      default: return '#64748b';
    }
  };

  if (learningData.betHistory.length < 20) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>
          <span>🧠</span> AI Learning
        </h2>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '8px' }}>
            Not enough data yet
          </div>
          <div style={{ fontSize: '14px' }}>
            Place at least 20 bets to unlock personalized insights.
            <br />
            Currently: {learningData.betHistory.length} bets recorded
          </div>
          <div style={{
            marginTop: '24px',
            height: '8px',
            backgroundColor: '#1e293b',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(learningData.betHistory.length / 20) * 100}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span>🧠</span> AI Learning Insights
        </h2>
        <span style={styles.betCount}>
          {learningData.betHistory.length} bets analyzed
        </span>
      </div>

      {/* Insights */}
      {insights.map((insight, i) => (
        <div
          key={i}
          style={{ ...styles.insightCard, borderLeftColor: getInsightColor(insight.type) }}
        >
          <div style={styles.insightHeader}>
            <span style={styles.insightIcon}>{insight.icon}</span>
            <span style={styles.insightTitle}>{insight.title}</span>
          </div>
          <p style={styles.insightDesc}>{insight.description}</p>
          <div style={styles.recommendation}>
            <span>💡</span>
            {insight.recommendation}
          </div>
        </div>
      ))}

      {/* Pattern Stats */}
      {patterns && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statTitle}>Performance by Sport</div>
            {Object.entries(patterns.bySport).map(([sport, data]) => {
              const total = data.wins + data.losses;
              const winRate = total > 0 ? (data.wins / total * 100).toFixed(1) : 0;
              return (
                <div key={sport} style={styles.statItem}>
                  <span style={{ color: '#f8fafc' }}>{sport}</span>
                  <span style={{ color: winRate > 52 ? '#22c55e' : winRate < 48 ? '#ef4444' : '#94a3b8' }}>
                    {winRate}% ({total})
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTitle}>Performance by Day</div>
            {Object.entries(patterns.byDayOfWeek).slice(0, 5).map(([day, data]) => {
              const total = data.wins + data.losses;
              const winRate = total > 0 ? (data.wins / total * 100).toFixed(1) : 0;
              return (
                <div key={day} style={styles.statItem}>
                  <span style={{ color: '#f8fafc' }}>{day}</span>
                  <span style={{ color: winRate > 52 ? '#22c55e' : '#94a3b8' }}>
                    {winRate}%
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTitle}>By Confidence Range</div>
            {Object.entries(patterns.byConfidence).map(([range, data]) => {
              const total = data.wins + data.losses;
              const winRate = total > 0 ? (data.wins / total * 100).toFixed(1) : 0;
              return (
                <div key={range} style={styles.statItem}>
                  <span style={{ color: '#f8fafc' }}>{range}</span>
                  <span style={{ color: winRate > 52 ? '#22c55e' : '#94a3b8' }}>
                    {winRate}% ({total})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CUSTOM DASHBOARD BUILDER
// ============================================================================

export const CustomDashboard = () => {
  const { dashboardLayouts, setDashboardLayouts, preferences } = usePersonalization();
  const [isEditing, setIsEditing] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(
    dashboardLayouts.layouts[dashboardLayouts.active]?.widgets || []
  );
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const items = [...activeWidgets];
    const draggedItem = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, draggedItem);

    setActiveWidgets(items);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const addWidget = (widgetId) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  const removeWidget = (widgetId) => {
    setActiveWidgets(activeWidgets.filter(w => w !== widgetId));
  };

  const saveLayout = (name) => {
    setDashboardLayouts(prev => ({
      ...prev,
      active: name || prev.active,
      layouts: {
        ...prev.layouts,
        [name || prev.active]: {
          name: name || prev.active,
          widgets: activeWidgets
        }
      }
    }));
    setIsEditing(false);
  };

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    editButton: {
      padding: '10px 20px',
      backgroundColor: isEditing ? '#22c55e' : '#3b82f6',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px'
    },
    widget: (isDragging) => ({
      padding: '20px',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      border: isDragging ? '2px dashed #3b82f6' : '1px solid #334155',
      cursor: isEditing ? 'grab' : 'default',
      opacity: isDragging ? 0.5 : 1,
      transition: 'all 0.2s'
    }),
    widgetHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    widgetTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#f8fafc',
      fontWeight: 600
    },
    widgetContent: {
      color: '#64748b',
      fontSize: '14px'
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '18px'
    },
    availableWidgets: {
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#1e293b',
      borderRadius: '12px'
    },
    widgetChip: (added) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      margin: '4px',
      backgroundColor: added ? '#334155' : '#0f172a',
      border: '1px solid #334155',
      borderRadius: '20px',
      color: added ? '#64748b' : '#f8fafc',
      fontSize: '13px',
      cursor: added ? 'default' : 'pointer'
    }),
    layoutTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    },
    layoutTab: (active) => ({
      padding: '8px 16px',
      backgroundColor: active ? '#3b82f6' : '#1e293b',
      border: 'none',
      borderRadius: '6px',
      color: active ? 'white' : '#94a3b8',
      fontSize: '13px',
      cursor: 'pointer'
    })
  };

  const getWidgetInfo = (widgetId) => DASHBOARD_WIDGETS.find(w => w.id === widgetId);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span>📊</span> Custom Dashboard
        </h2>
        <button
          style={styles.editButton}
          onClick={() => isEditing ? saveLayout() : setIsEditing(true)}
        >
          {isEditing ? '✓ Save Layout' : '✏️ Edit'}
        </button>
      </div>

      {/* Layout Tabs */}
      <div style={styles.layoutTabs}>
        {Object.keys(dashboardLayouts.layouts).map(name => (
          <button
            key={name}
            style={styles.layoutTab(dashboardLayouts.active === name)}
            onClick={() => {
              setDashboardLayouts(prev => ({ ...prev, active: name }));
              setActiveWidgets(dashboardLayouts.layouts[name].widgets);
            }}
          >
            {name}
          </button>
        ))}
        {isEditing && (
          <button
            style={styles.layoutTab(false)}
            onClick={() => {
              const name = prompt('Layout name:');
              if (name) {
                saveLayout(name);
              }
            }}
          >
            + New Layout
          </button>
        )}
      </div>

      {/* Active Widgets Grid */}
      <div style={styles.grid}>
        {activeWidgets.map((widgetId, index) => {
          const widget = getWidgetInfo(widgetId);
          if (!widget) return null;

          return (
            <div
              key={widgetId}
              style={styles.widget(dragItem.current === index)}
              draggable={isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div style={styles.widgetHeader}>
                <div style={styles.widgetTitle}>
                  <span>{widget.icon}</span>
                  {widget.name}
                </div>
                {isEditing && (
                  <button
                    style={styles.removeBtn}
                    onClick={() => removeWidget(widgetId)}
                  >
                    ×
                  </button>
                )}
              </div>
              <div style={styles.widgetContent}>
                {/* Widget content placeholder */}
                <div style={{
                  height: widget.size === 'large' ? '200px' : widget.size === 'medium' ? '120px' : '80px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#334155'
                }}>
                  {isEditing ? '⋮⋮ Drag to reorder' : `${widget.name} Widget`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Widgets (Edit Mode) */}
      {isEditing && (
        <div style={styles.availableWidgets}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
            Add Widgets:
          </div>
          <div>
            {DASHBOARD_WIDGETS.map(widget => {
              const isAdded = activeWidgets.includes(widget.id);
              return (
                <button
                  key={widget.id}
                  style={styles.widgetChip(isAdded)}
                  onClick={() => !isAdded && addWidget(widget.id)}
                  disabled={isAdded}
                >
                  <span>{widget.icon}</span>
                  {widget.name}
                  {isAdded && ' ✓'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SIMILAR USERS RECOMMENDATIONS
// ============================================================================

export const SimilarUsersRecommendations = () => {
  const { preferences, bettingProfile } = usePersonalization();

  // Mock similar users data
  const similarUsers = useMemo(() => [
    {
      id: 1,
      name: 'SharpShooter_Mike',
      similarity: 94,
      winRate: 58.2,
      roi: 12.4,
      recentPick: { team: 'Chiefs -3.5', confidence: 82 },
      style: 'aggressive'
    },
    {
      id: 2,
      name: 'ValueHunter22',
      similarity: 89,
      winRate: 55.8,
      roi: 8.7,
      recentPick: { team: 'Lakers ML', confidence: 76 },
      style: 'moderate'
    },
    {
      id: 3,
      name: 'DataDriven_Pro',
      similarity: 85,
      winRate: 54.1,
      roi: 6.2,
      recentPick: { team: 'Yankees -1.5', confidence: 71 },
      style: 'conservative'
    }
  ], []);

  const popularPicks = useMemo(() => [
    { pick: 'Bills -7', confidence: 78, bettors: 127, winRate: 62 },
    { pick: 'Celtics/Heat O 215', confidence: 74, bettors: 98, winRate: 58 },
    { pick: 'Dodgers ML', confidence: 81, bettors: 156, winRate: 64 }
  ], []);

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px'
    },
    header: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#94a3b8',
      marginBottom: '12px',
      textTransform: 'uppercase'
    },
    userCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '10px',
      marginBottom: '10px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: 'white',
      fontWeight: 700
    },
    userInfo: {
      flex: 1
    },
    userName: {
      color: '#f8fafc',
      fontWeight: 600,
      marginBottom: '4px'
    },
    userStats: {
      display: 'flex',
      gap: '12px',
      fontSize: '12px',
      color: '#64748b'
    },
    similarity: {
      padding: '6px 12px',
      backgroundColor: '#22c55e20',
      borderRadius: '20px',
      color: '#22c55e',
      fontSize: '13px',
      fontWeight: 600
    },
    pickCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px',
      backgroundColor: '#1e293b',
      borderRadius: '10px',
      marginBottom: '8px'
    },
    pickInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    pickName: {
      color: '#f8fafc',
      fontWeight: 600
    },
    pickMeta: {
      fontSize: '12px',
      color: '#64748b'
    },
    confidence: {
      padding: '6px 12px',
      backgroundColor: '#3b82f620',
      borderRadius: '20px',
      color: '#3b82f6',
      fontSize: '14px',
      fontWeight: 600
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        <span>👥</span> Users Like You
      </h2>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Similar Bettors</div>
        {similarUsers.map(user => (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.avatar}>{user.name[0]}</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userStats}>
                <span>{user.winRate}% Win Rate</span>
                <span>•</span>
                <span>+{user.roi}% ROI</span>
                <span>•</span>
                <span>{RISK_PROFILES[user.style]?.icon} {RISK_PROFILES[user.style]?.name}</span>
              </div>
            </div>
            <div style={styles.similarity}>{user.similarity}% Match</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Popular with Similar Users</div>
        {popularPicks.map((pick, i) => (
          <div key={i} style={styles.pickCard}>
            <div style={styles.pickInfo}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <div>
                <div style={styles.pickName}>{pick.pick}</div>
                <div style={styles.pickMeta}>
                  {pick.bettors} bettors • {pick.winRate}% historical
                </div>
              </div>
            </div>
            <div style={styles.confidence}>{pick.confidence}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PERSONALIZATION DASHBOARD
// ============================================================================

export const PersonalizationDashboard = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const { bettingProfile } = usePersonalization();

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'profile', label: 'Betting Style', icon: '🎯' },
    { id: 'learning', label: 'AI Insights', icon: '🧠' },
    { id: 'dashboard', label: 'Custom Dashboard', icon: '📊' },
    { id: 'similar', label: 'Similar Users', icon: '👥' }
  ];

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '15px',
      color: '#94a3b8'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '8px'
    },
    tab: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: active ? '#3b82f6' : '#1e293b',
      border: 'none',
      borderRadius: '10px',
      color: active ? 'white' : '#94a3b8',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Personalization</h1>
        <p style={styles.subtitle}>
          Customize your experience and get personalized recommendations
        </p>
      </div>

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'preferences' && <UserPreferencesPanel />}
      {activeTab === 'profile' && (
        bettingProfile ? (
          <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '64px' }}>{RISK_PROFILES[bettingProfile.primary]?.icon}</div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: '24px', marginBottom: '4px' }}>
                  {RISK_PROFILES[bettingProfile.primary]?.name} Bettor
                </h2>
                <p style={{ color: '#94a3b8' }}>
                  {RISK_PROFILES[bettingProfile.primary]?.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('betting_profile');
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#334155',
                border: 'none',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <BettingStyleQuiz />
        )
      )}
      {activeTab === 'learning' && <LearningInsights />}
      {activeTab === 'dashboard' && <CustomDashboard />}
      {activeTab === 'similar' && <SimilarUsersRecommendations />}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  PersonalizationProvider,
  usePersonalization,
  UserPreferencesPanel,
  BettingStyleQuiz,
  LearningInsights,
  CustomDashboard,
  SimilarUsersRecommendations,
  PersonalizationDashboard,
  SPORTS_TEAMS,
  SPORTSBOOKS,
  RISK_PROFILES,
  DASHBOARD_WIDGETS
};
