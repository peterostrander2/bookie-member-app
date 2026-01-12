/**
 * EmptyStates.jsx
 * Comprehensive empty state components with:
 * - Distinct states (no games, loading, error, no picks)
 * - Helpful calls-to-action
 * - Engaging content (tips, trivia, illustrations)
 */

import React, { useState, useEffect, useMemo } from 'react';

// ============================================================================
// BETTING TIPS & TRIVIA
// ============================================================================

const BETTING_TIPS = [
  {
    tip: "Sharp bettors typically risk 1-3% of their bankroll per bet. This protects against variance while allowing for growth.",
    category: "Bankroll"
  },
  {
    tip: "CLV (Closing Line Value) is the best predictor of long-term success. If you consistently beat the closing line, you're likely a winning bettor.",
    category: "Strategy"
  },
  {
    tip: "Line shopping can add 1-2% to your ROI. Even small differences in odds compound significantly over time.",
    category: "Value"
  },
  {
    tip: "Reverse line movement is one of the strongest sharp indicators. When the public bets one way but the line moves the other, follow the line.",
    category: "Sharp"
  },
  {
    tip: "The best time to bet favorites is right when the line opens. The best time to bet underdogs is often closer to game time.",
    category: "Timing"
  },
  {
    tip: "Props often have more exploitable edges than sides and totals because books spend less time on them.",
    category: "Props"
  },
  {
    tip: "Steam moves happen when sharp syndicates hit multiple books simultaneously. These moves are worth tracking.",
    category: "Sharp"
  },
  {
    tip: "Weather matters more than most bettors think. Wind over 15mph significantly impacts passing games and totals.",
    category: "Research"
  },
  {
    tip: "Injuries to backup players are often undervalued by the market, especially for key special teams and depth positions.",
    category: "Injuries"
  },
  {
    tip: "The Kelly Criterion tells you how much to bet, not what to bet on. Even a great edge doesn't mean bet the house.",
    category: "Bankroll"
  },
  {
    tip: "Track your bets meticulously. You can't improve what you don't measure. ROI, CLV, and win rate by sport all matter.",
    category: "Discipline"
  },
  {
    tip: "Market consensus forms quickly after opening lines. The first 30 minutes of line movement are often the most informative.",
    category: "Timing"
  }
];

const BETTING_TRIVIA = [
  {
    question: "What percentage of sports bettors are profitable long-term?",
    answer: "Only about 3-5% of sports bettors consistently profit over the long term.",
    funFact: true
  },
  {
    question: "How much does the average sharp bettor profit annually?",
    answer: "Professional sports bettors typically aim for 2-5% ROI on volume. On $1M in bets, that's $20K-$50K profit.",
    funFact: true
  },
  {
    question: "When was the first legal sports bet in modern US history placed?",
    answer: "June 14, 2018, at Monmouth Park in New Jersey, just weeks after PASPA was overturned.",
    funFact: true
  },
  {
    question: "What's the origin of the term 'vigorish'?",
    answer: "It comes from the Yiddish word 'vyigrysh' meaning 'winnings' or 'profit'. Ironic, given it's the bettor's loss!",
    funFact: true
  },
  {
    question: "How much is bet on the Super Bowl each year?",
    answer: "Over $16 billion is wagered on the Super Bowl annually, making it the biggest single-game betting event.",
    funFact: true
  },
  {
    question: "What sport has the lowest house edge for bettors?",
    answer: "NFL spreads often have the tightest lines due to massive betting volume, sometimes under 2% vig.",
    funFact: true
  },
  {
    question: "What's the biggest payout in sports betting history?",
    answer: "A bettor won $2.4 million on a $85,000 parlay on the 2021 Tampa Bay Buccaneers to win the Super Bowl.",
    funFact: true
  },
  {
    question: "How fast do sportsbooks move lines?",
    answer: "Sharp books like Pinnacle can move lines within seconds of significant sharp action.",
    funFact: true
  }
];

const SPORT_ICONS = {
  NFL: '🏈',
  NBA: '🏀',
  MLB: '⚾',
  NHL: '🏒',
  NCAAF: '🏈',
  NCAAB: '🏀',
  UFC: '🥊',
  Soccer: '⚽',
  Golf: '⛳',
  Tennis: '🎾'
};

// ============================================================================
// SVG ILLUSTRATIONS
// ============================================================================

const CalendarIcon = ({ size = 120, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <rect x="15" y="25" width="90" height="80" rx="8" fill="#1e293b" stroke={color} strokeWidth="3"/>
    <rect x="15" y="25" width="90" height="20" rx="8" fill={color}/>
    <rect x="30" y="15" width="8" height="20" rx="2" fill="#475569"/>
    <rect x="82" y="15" width="8" height="20" rx="2" fill="#475569"/>
    <circle cx="40" cy="65" r="6" fill="#334155"/>
    <circle cx="60" cy="65" r="6" fill="#334155"/>
    <circle cx="80" cy="65" r="6" fill="#334155"/>
    <circle cx="40" cy="85" r="6" fill="#334155"/>
    <circle cx="60" cy="85" r="6" fill={color} opacity="0.5"/>
    <circle cx="80" cy="85" r="6" fill="#334155"/>
  </svg>
);

const SpinnerIcon = ({ size = 80, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="40" cy="40" r="30" fill="none" stroke="#1e293b" strokeWidth="6"/>
    <circle cx="40" cy="40" r="30" fill="none" stroke={color} strokeWidth="6"
      strokeDasharray="47 141" strokeLinecap="round"
      style={{ transformOrigin: 'center' }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);

const ErrorIcon = ({ size = 120, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="45" fill="#1e293b" stroke={color} strokeWidth="3"/>
    <path d="M60 35 L60 65" stroke={color} strokeWidth="6" strokeLinecap="round"/>
    <circle cx="60" cy="80" r="4" fill={color}/>
    <path d="M25 95 L15 105" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
    <path d="M95 95 L105 105" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = ({ size = 120, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <circle cx="50" cy="50" r="30" fill="#1e293b" stroke={color} strokeWidth="3"/>
    <path d="M72 72 L95 95" stroke={color} strokeWidth="6" strokeLinecap="round"/>
    <path d="M35 50 L65 50" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 35 L50 65" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ChartIcon = ({ size = 120, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <rect x="15" y="85" width="15" height="25" rx="2" fill="#334155"/>
    <rect x="35" y="65" width="15" height="45" rx="2" fill="#475569"/>
    <rect x="55" y="45" width="15" height="65" rx="2" fill={color} opacity="0.6"/>
    <rect x="75" y="25" width="15" height="85" rx="2" fill={color}/>
    <rect x="95" y="55" width="15" height="55" rx="2" fill="#475569"/>
    <path d="M20 80 L45 55 L65 40 L85 20" stroke={color} strokeWidth="2" strokeDasharray="4 4"/>
  </svg>
);

const BellIcon = ({ size = 120, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M60 15 C60 15 35 20 35 55 L35 75 L25 85 L95 85 L85 75 L85 55 C85 20 60 15 60 15"
      fill="#1e293b" stroke={color} strokeWidth="3"/>
    <circle cx="60" cy="95" r="10" fill={color}/>
    <circle cx="60" cy="15" r="5" fill={color}/>
    <path d="M45 25 C45 25 30 30 30 35" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
    <path d="M75 25 C75 25 90 30 90 35" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CoffeeIcon = ({ size = 120, color = '#8b5cf6' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M25 40 L35 100 L75 100 L85 40 Z" fill="#1e293b" stroke={color} strokeWidth="3"/>
    <path d="M85 50 L95 50 C105 50 105 70 95 70 L85 70" stroke={color} strokeWidth="3" fill="none"/>
    <path d="M40 25 C40 25 45 15 55 20" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
    <path d="M55 25 C55 25 60 10 70 18" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="55" cy="40" rx="25" ry="5" fill={color} opacity="0.3"/>
  </svg>
);

const RocketIcon = ({ size = 120, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M60 10 C60 10 90 30 90 70 L75 85 L45 85 L30 70 C30 30 60 10 60 10"
      fill="#1e293b" stroke={color} strokeWidth="3"/>
    <circle cx="60" cy="50" r="10" fill={color}/>
    <path d="M45 85 L40 100 L55 90" fill="#f59e0b"/>
    <path d="M75 85 L80 100 L65 90" fill="#f59e0b"/>
    <path d="M55 105 L60 115 L65 105" fill="#ef4444"/>
    <path d="M25 60 L30 70 L35 60" stroke="#475569" strokeWidth="2"/>
    <path d="M85 60 L90 70 L95 60" stroke="#475569" strokeWidth="2"/>
  </svg>
);

const TrophyIcon = ({ size = 120, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M35 20 L85 20 L80 60 C80 75 70 80 60 80 C50 80 40 75 40 60 L35 20"
      fill="#1e293b" stroke={color} strokeWidth="3"/>
    <path d="M35 30 L20 30 C15 30 10 40 20 50 L35 50" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M85 30 L100 30 C105 30 110 40 100 50 L85 50" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="50" y="80" width="20" height="15" fill={color}/>
    <rect x="40" y="95" width="40" height="10" rx="2" fill={color}/>
    <circle cx="60" cy="45" r="8" fill={color} opacity="0.5"/>
  </svg>
);

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

/**
 * Base empty state container
 */
const EmptyStateContainer = ({ children, style = {} }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    minHeight: '400px',
    ...style
  }}>
    {children}
  </div>
);

/**
 * No Games Today
 */
export const NoGamesScheduled = ({ sport, onChangeSport, availableSports = [] }) => {
  const [tip] = useState(() => BETTING_TIPS[Math.floor(Math.random() * BETTING_TIPS.length)]);

  return (
    <EmptyStateContainer>
      <CalendarIcon size={100} />
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
        No Games Scheduled Today
      </h2>
      <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '400px', marginBottom: '24px' }}>
        {sport ? `There are no ${sport} games on the schedule today.` : 'The sports calendar is quiet today.'} Check back tomorrow or explore another sport!
      </p>

      {availableSports.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Try a different sport:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {availableSports.map(s => (
              <button
                key={s}
                onClick={() => onChangeSport?.(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{SPORT_ICONS[s] || '🎯'}</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <TipCard tip={tip.tip} category={tip.category} />
    </EmptyStateContainer>
  );
};

/**
 * Loading State
 */
export const LoadingState = ({ message = 'Loading games...', showTip = true }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!showTip) return;
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % BETTING_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showTip]);

  const tip = BETTING_TIPS[tipIndex];

  return (
    <EmptyStateContainer>
      <SpinnerIcon size={80} />
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
        {message}
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
        Fetching the latest data for you...
      </p>

      {showTip && (
        <div style={{
          padding: '20px',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          maxWidth: '450px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <p style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '8px', fontWeight: 600 }}>
            💡 TIP: {tip.category}
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
            {tip.tip}
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </EmptyStateContainer>
  );
};

/**
 * Connection Error
 */
export const ConnectionError = ({ onRetry, errorMessage }) => (
  <EmptyStateContainer>
    <ErrorIcon size={100} />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      Connection Error
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '400px', marginBottom: '8px' }}>
      We couldn't connect to our servers. Please check your internet connection and try again.
    </p>
    {errorMessage && (
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', fontFamily: 'monospace' }}>
        {errorMessage}
      </p>
    )}

    <button
      onClick={onRetry}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ fontSize: '18px' }}>↻</span>
      Try Again
    </button>

    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '24px' }}>
      Still having issues? <a href="#" style={{ color: '#3b82f6' }}>Contact support</a>
    </p>
  </EmptyStateContainer>
);

/**
 * No Picks Yet
 */
export const NoPicksYet = ({
  onSetAlerts,
  onExploreBacktest,
  gameTime,
  sport
}) => {
  const [trivia] = useState(() => BETTING_TRIVIA[Math.floor(Math.random() * BETTING_TRIVIA.length)]);

  return (
    <EmptyStateContainer>
      <SearchIcon size={100} />
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
        No High-Confidence Picks Yet
      </h2>
      <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '450px', marginBottom: '24px' }}>
        Our AI is still analyzing today's {sport || 'games'}. Check back closer to game time when we have more data and sharper lines.
        {gameTime && (
          <span style={{ display: 'block', marginTop: '8px', color: '#3b82f6' }}>
            First game starts at {gameTime}
          </span>
        )}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <ActionButton icon="🔔" onClick={onSetAlerts}>
          Set Up Alerts
        </ActionButton>
        <ActionButton icon="📊" onClick={onExploreBacktest} variant="secondary">
          Explore Backtesting
        </ActionButton>
      </div>

      <TriviaCard question={trivia.question} answer={trivia.answer} />
    </EmptyStateContainer>
  );
};

/**
 * No Results Found (Search/Filter)
 */
export const NoResultsFound = ({
  query,
  onClearFilters,
  suggestions = []
}) => (
  <EmptyStateContainer>
    <SearchIcon size={100} color="#475569" />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      No Results Found
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '400px', marginBottom: '24px' }}>
      {query
        ? `We couldn't find anything matching "${query}"`
        : "No items match your current filters"
      }
    </p>

    {suggestions.length > 0 && (
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Did you mean:</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {suggestions.map((s, i) => (
            <span key={i} style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    )}

    <button
      onClick={onClearFilters}
      style={{
        padding: '12px 24px',
        backgroundColor: '#334155',
        border: 'none',
        borderRadius: '8px',
        color: '#f8fafc',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      Clear All Filters
    </button>
  </EmptyStateContainer>
);

/**
 * Empty Bankroll
 */
export const EmptyBankroll = ({ onSetup }) => (
  <EmptyStateContainer>
    <ChartIcon size={100} />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      Set Up Your Bankroll
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '450px', marginBottom: '24px' }}>
      Track your bets, manage your money, and watch your bankroll grow.
      Professional bet sizing is the #1 factor in long-term success.
    </p>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '32px',
      maxWidth: '500px'
    }}>
      <FeatureCard icon="📊" title="Track Bets" subtitle="All sports" />
      <FeatureCard icon="🎯" title="Kelly Sizing" subtitle="Optimal bets" />
      <FeatureCard icon="📈" title="ROI Charts" subtitle="Visual growth" />
    </div>

    <ActionButton icon="🚀" onClick={onSetup} size="large">
      Set Up Bankroll
    </ActionButton>
  </EmptyStateContainer>
);

/**
 * No Alerts Set
 */
export const NoAlerts = ({ onSetupAlerts }) => (
  <EmptyStateContainer>
    <BellIcon size={100} />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      No Alerts Set Up
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '450px', marginBottom: '24px' }}>
      Never miss a betting opportunity! Get instant notifications for sharp moves,
      new Smash Spots, injury updates, and line changes.
    </p>

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '32px',
      maxWidth: '350px',
      width: '100%'
    }}>
      <AlertOption icon="🦈" label="Sharp Money Alerts" description="When pros bet big" />
      <AlertOption icon="🎯" label="Smash Spot Alerts" description="High confidence picks" />
      <AlertOption icon="🏥" label="Injury Alerts" description="Real-time updates" />
      <AlertOption icon="📉" label="Line Movement" description="Steam moves & RLM" />
    </div>

    <ActionButton icon="🔔" onClick={onSetupAlerts}>
      Set Up Alerts
    </ActionButton>
  </EmptyStateContainer>
);

/**
 * First Visit / Welcome
 */
export const WelcomeState = ({ onGetStarted, userName }) => (
  <EmptyStateContainer>
    <RocketIcon size={100} />
    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      Welcome{userName ? `, ${userName}` : ''}!
    </h2>
    <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '500px', marginBottom: '32px' }}>
      You've joined the sharpest sports betting platform powered by AI.
      Let's set you up for success.
    </p>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '32px',
      maxWidth: '600px'
    }}>
      <StepCard number={1} title="Choose Your Sports" description="Select which sports you want to track" />
      <StepCard number={2} title="Set Your Bankroll" description="Configure your betting budget" />
      <StepCard number={3} title="Configure Alerts" description="Get notified for opportunities" />
      <StepCard number={4} title="Explore Tools" description="Discover all features available" />
    </div>

    <ActionButton icon="🎯" onClick={onGetStarted} size="large">
      Get Started
    </ActionButton>
  </EmptyStateContainer>
);

/**
 * Coming Soon Feature
 */
export const ComingSoon = ({ feature, expectedDate }) => (
  <EmptyStateContainer>
    <CoffeeIcon size={100} />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      {feature} Coming Soon
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '400px', marginBottom: '8px' }}>
      We're working hard to bring you this feature. Stay tuned!
    </p>
    {expectedDate && (
      <p style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '24px' }}>
        Expected: {expectedDate}
      </p>
    )}

    <div style={{
      padding: '16px 24px',
      backgroundColor: '#1e293b',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '24px' }}>💡</span>
      <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
        Have feature suggestions? We'd love to hear them!
      </p>
    </div>
  </EmptyStateContainer>
);

/**
 * Achievement Unlocked (Gamification)
 */
export const NoAchievements = ({ onViewChallenges }) => (
  <EmptyStateContainer>
    <TrophyIcon size={100} />
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '24px', marginBottom: '8px' }}>
      Start Earning Achievements
    </h2>
    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '450px', marginBottom: '24px' }}>
      Complete challenges, track your progress, and unlock badges.
      Every achievement brings you closer to betting mastery.
    </p>

    <div style={{
      display: 'flex',
      gap: '16px',
      marginBottom: '32px',
      opacity: 0.5
    }}>
      <AchievementBadge icon="🎯" name="First Pick" locked />
      <AchievementBadge icon="🔥" name="Hot Streak" locked />
      <AchievementBadge icon="🧠" name="Sharp Mind" locked />
      <AchievementBadge icon="💰" name="Big Winner" locked />
    </div>

    <ActionButton icon="🏆" onClick={onViewChallenges}>
      View Challenges
    </ActionButton>
  </EmptyStateContainer>
);

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TipCard = ({ tip, category }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    maxWidth: '450px',
    border: '1px solid #1e293b'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '16px' }}>💡</span>
      <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>
        {category} Tip
      </span>
    </div>
    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
      {tip}
    </p>
  </div>
);

const TriviaCard = ({ question, answer }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: '12px',
      maxWidth: '450px',
      border: '1px solid #1e293b',
      cursor: 'pointer'
    }} onClick={() => setRevealed(!revealed)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px' }}>🎲</span>
        <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase' }}>
          Did You Know?
        </span>
      </div>
      <p style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '12px', fontWeight: 500 }}>
        {question}
      </p>
      <div style={{
        overflow: 'hidden',
        maxHeight: revealed ? '200px' : '0',
        transition: 'max-height 0.3s ease',
        opacity: revealed ? 1 : 0
      }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
          {answer}
        </p>
      </div>
      {!revealed && (
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          Click to reveal answer
        </p>
      )}
    </div>
  );
};

const ActionButton = ({ children, icon, onClick, variant = 'primary', size = 'medium' }) => {
  const sizes = {
    small: { padding: '10px 18px', fontSize: '13px' },
    medium: { padding: '14px 24px', fontSize: '15px' },
    large: { padding: '16px 32px', fontSize: '16px' }
  };

  const variants = {
    primary: { bg: '#3b82f6', hoverBg: '#2563eb' },
    secondary: { bg: '#334155', hoverBg: '#475569' }
  };

  const [hovered, setHovered] = useState(false);
  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: s.padding,
        backgroundColor: hovered ? v.hoverBg : v.bg,
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, subtitle }) => (
  <div style={{
    padding: '16px',
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{title}</div>
    <div style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</div>
  </div>
);

const AlertOption = ({ icon, label, description }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>{description}</div>
    </div>
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: '2px solid #475569'
    }} />
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    textAlign: 'left'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
      color: 'white',
      marginBottom: '12px'
    }}>
      {number}
    </div>
    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
      {title}
    </div>
    <div style={{ fontSize: '13px', color: '#64748b' }}>
      {description}
    </div>
  </div>
);

const AchievementBadge = ({ icon, name, locked }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: locked ? '#1e293b' : '#f59e0b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      border: locked ? '2px dashed #334155' : 'none',
      filter: locked ? 'grayscale(100%)' : 'none'
    }}>
      {locked ? '🔒' : icon}
    </div>
    <span style={{ fontSize: '11px', color: '#64748b' }}>{name}</span>
  </div>
);

// ============================================================================
// SMART EMPTY STATE SELECTOR
// ============================================================================

/**
 * Smart component that selects the right empty state based on context
 */
export const SmartEmptyState = ({
  type,
  sport,
  query,
  error,
  loading,
  gameTime,
  availableSports,
  onAction,
  ...props
}) => {
  if (loading) {
    return <LoadingState {...props} />;
  }

  if (error) {
    return <ConnectionError errorMessage={error} onRetry={() => onAction?.('retry')} {...props} />;
  }

  switch (type) {
    case 'no-games':
      return (
        <NoGamesScheduled
          sport={sport}
          availableSports={availableSports}
          onChangeSport={(s) => onAction?.('changeSport', s)}
          {...props}
        />
      );

    case 'no-picks':
      return (
        <NoPicksYet
          sport={sport}
          gameTime={gameTime}
          onSetAlerts={() => onAction?.('setAlerts')}
          onExploreBacktest={() => onAction?.('backtest')}
          {...props}
        />
      );

    case 'no-results':
      return (
        <NoResultsFound
          query={query}
          onClearFilters={() => onAction?.('clearFilters')}
          {...props}
        />
      );

    case 'no-bankroll':
      return (
        <EmptyBankroll
          onSetup={() => onAction?.('setupBankroll')}
          {...props}
        />
      );

    case 'no-alerts':
      return (
        <NoAlerts
          onSetupAlerts={() => onAction?.('setupAlerts')}
          {...props}
        />
      );

    case 'welcome':
      return (
        <WelcomeState
          onGetStarted={() => onAction?.('getStarted')}
          {...props}
        />
      );

    case 'coming-soon':
      return <ComingSoon {...props} />;

    case 'no-achievements':
      return (
        <NoAchievements
          onViewChallenges={() => onAction?.('viewChallenges')}
          {...props}
        />
      );

    default:
      return (
        <EmptyStateContainer>
          <SearchIcon size={80} color="#475569" />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Nothing to show here</p>
        </EmptyStateContainer>
      );
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Main empty states
  NoGamesScheduled,
  LoadingState,
  ConnectionError,
  NoPicksYet,
  NoResultsFound,
  EmptyBankroll,
  NoAlerts,
  WelcomeState,
  ComingSoon,
  NoAchievements,

  // Smart selector
  SmartEmptyState,

  // Icons for custom use
  Icons: {
    CalendarIcon,
    SpinnerIcon,
    ErrorIcon,
    SearchIcon,
    ChartIcon,
    BellIcon,
    CoffeeIcon,
    RocketIcon,
    TrophyIcon
  },

  // Data
  BETTING_TIPS,
  BETTING_TRIVIA,
  SPORT_ICONS
};
