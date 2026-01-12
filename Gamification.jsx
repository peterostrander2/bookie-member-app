/**
 * GAMIFICATION SYSTEM
 *
 * Achievements, badges, streaks, and XP system
 * to engage users and reward consistent performance.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Getting Started
  first_pick: {
    id: 'first_pick',
    name: 'First Pick',
    description: 'Make your first tracked pick',
    icon: '🎯',
    xp: 10,
    category: 'starter'
  },
  first_win: {
    id: 'first_win',
    name: 'Winner Winner',
    description: 'Win your first bet',
    icon: '✅',
    xp: 25,
    category: 'starter'
  },
  profile_complete: {
    id: 'profile_complete',
    name: 'All Set',
    description: 'Complete your profile setup',
    icon: '👤',
    xp: 15,
    category: 'starter'
  },

  // Consistency
  streak_3: {
    id: 'streak_3',
    name: 'Hot Hand',
    description: 'Win 3 picks in a row',
    icon: '🔥',
    xp: 50,
    category: 'streaks'
  },
  streak_5: {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Win 5 picks in a row',
    icon: '🔥🔥',
    xp: 100,
    category: 'streaks'
  },
  streak_10: {
    id: 'streak_10',
    name: 'Legendary Streak',
    description: 'Win 10 picks in a row',
    icon: '🌟',
    xp: 500,
    category: 'streaks'
  },
  daily_login_7: {
    id: 'daily_login_7',
    name: 'Weekly Regular',
    description: 'Log in 7 days in a row',
    icon: '📅',
    xp: 75,
    category: 'streaks'
  },
  daily_login_30: {
    id: 'daily_login_30',
    name: 'Monthly Devotee',
    description: 'Log in 30 days in a row',
    icon: '🗓️',
    xp: 250,
    category: 'streaks'
  },

  // Volume
  picks_10: {
    id: 'picks_10',
    name: 'Getting Started',
    description: 'Make 10 tracked picks',
    icon: '📊',
    xp: 30,
    category: 'volume'
  },
  picks_50: {
    id: 'picks_50',
    name: 'Active Bettor',
    description: 'Make 50 tracked picks',
    icon: '📈',
    xp: 100,
    category: 'volume'
  },
  picks_100: {
    id: 'picks_100',
    name: 'Century Club',
    description: 'Make 100 tracked picks',
    icon: '💯',
    xp: 250,
    category: 'volume'
  },
  picks_500: {
    id: 'picks_500',
    name: 'High Volume',
    description: 'Make 500 tracked picks',
    icon: '🎰',
    xp: 750,
    category: 'volume'
  },

  // Performance
  win_rate_55: {
    id: 'win_rate_55',
    name: 'Above Average',
    description: 'Maintain 55%+ win rate (50+ picks)',
    icon: '📊',
    xp: 150,
    category: 'performance'
  },
  win_rate_60: {
    id: 'win_rate_60',
    name: 'Sharp Bettor',
    description: 'Maintain 60%+ win rate (50+ picks)',
    icon: '🎯',
    xp: 300,
    category: 'performance'
  },
  positive_roi: {
    id: 'positive_roi',
    name: 'In The Green',
    description: 'Achieve positive ROI (25+ picks)',
    icon: '💰',
    xp: 100,
    category: 'performance'
  },
  roi_10: {
    id: 'roi_10',
    name: 'Double Digits',
    description: 'Achieve 10%+ ROI (50+ picks)',
    icon: '📈',
    xp: 250,
    category: 'performance'
  },
  clv_positive: {
    id: 'clv_positive',
    name: 'Beat the Close',
    description: 'Average positive CLV (25+ picks)',
    icon: '⚡',
    xp: 200,
    category: 'performance'
  },

  // Special
  smash_spot_win: {
    id: 'smash_spot_win',
    name: 'Smash Success',
    description: 'Win on a SMASH tier pick',
    icon: '💥',
    xp: 50,
    category: 'special'
  },
  golden_convergence: {
    id: 'golden_convergence',
    name: 'Golden Touch',
    description: 'Win on a Golden Convergence pick',
    icon: '✨',
    xp: 100,
    category: 'special'
  },
  all_sports: {
    id: 'all_sports',
    name: 'Jack of All Trades',
    description: 'Win picks in NBA, NFL, MLB, and NHL',
    icon: '🏆',
    xp: 200,
    category: 'special'
  },
  esoteric_believer: {
    id: 'esoteric_believer',
    name: 'Esoteric Believer',
    description: 'Win 5 picks with JARVIS triggers',
    icon: '🔮',
    xp: 150,
    category: 'special'
  }
};

// Level thresholds
export const LEVELS = [
  { level: 1, name: 'Rookie', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Beginner', xpRequired: 100, icon: '🌿' },
  { level: 3, name: 'Amateur', xpRequired: 250, icon: '🌲' },
  { level: 4, name: 'Intermediate', xpRequired: 500, icon: '⭐' },
  { level: 5, name: 'Experienced', xpRequired: 1000, icon: '🌟' },
  { level: 6, name: 'Advanced', xpRequired: 1750, icon: '💫' },
  { level: 7, name: 'Expert', xpRequired: 2750, icon: '🔥' },
  { level: 8, name: 'Master', xpRequired: 4000, icon: '👑' },
  { level: 9, name: 'Grandmaster', xpRequired: 5500, icon: '🏆' },
  { level: 10, name: 'Legend', xpRequired: 7500, icon: '💎' }
];

// Storage key
const STORAGE_KEY = 'bookie_gamification';

// Default state
const getDefaultState = () => ({
  xp: 0,
  unlockedAchievements: [],
  stats: {
    totalPicks: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    loginStreak: 0,
    bestLoginStreak: 0,
    lastLoginDate: null,
    sportsWon: [],
    smashWins: 0,
    goldenWins: 0,
    jarvisWins: 0
  },
  newAchievements: [] // Recently unlocked (for notification)
});

// Context
const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...getDefaultState(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading gamification state:', e);
    }
    return getDefaultState();
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Track daily login
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.stats.lastLoginDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = state.stats.lastLoginDate === yesterday.toDateString();

      setState(prev => {
        const newLoginStreak = isConsecutive ? prev.stats.loginStreak + 1 : 1;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            lastLoginDate: today,
            loginStreak: newLoginStreak,
            bestLoginStreak: Math.max(newLoginStreak, prev.stats.bestLoginStreak)
          }
        };
      });
    }
  }, []);

  // Get current level
  const getCurrentLevel = () => {
    const xp = state.xp;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  // Get next level
  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    return LEVELS[nextIndex] || null;
  };

  // Get XP progress to next level
  const getXPProgress = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100; // Max level

    const xpInCurrentLevel = state.xp - current.xpRequired;
    const xpToNextLevel = next.xpRequired - current.xpRequired;
    return (xpInCurrentLevel / xpToNextLevel) * 100;
  };

  // Unlock achievement
  const unlockAchievement = (achievementId) => {
    if (state.unlockedAchievements.includes(achievementId)) return;

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    setState(prev => ({
      ...prev,
      xp: prev.xp + achievement.xp,
      unlockedAchievements: [...prev.unlockedAchievements, achievementId],
      newAchievements: [...prev.newAchievements, achievementId]
    }));
  };

  // Clear new achievement notification
  const clearNewAchievement = (achievementId) => {
    setState(prev => ({
      ...prev,
      newAchievements: prev.newAchievements.filter(id => id !== achievementId)
    }));
  };

  // Record a pick result
  const recordPick = ({ result, tier, sport, hasJarvisTrigger }) => {
    setState(prev => {
      const newStats = { ...prev.stats };
      newStats.totalPicks++;

      if (result === 'WIN') {
        newStats.wins++;
        newStats.currentStreak++;
        newStats.bestStreak = Math.max(newStats.currentStreak, newStats.bestStreak);

        if (sport && !newStats.sportsWon.includes(sport)) {
          newStats.sportsWon = [...newStats.sportsWon, sport];
        }

        if (tier === 'SMASH') newStats.smashWins++;
        if (tier === 'GOLDEN_CONVERGENCE') newStats.goldenWins++;
        if (hasJarvisTrigger) newStats.jarvisWins++;
      } else if (result === 'LOSS') {
        newStats.losses++;
        newStats.currentStreak = 0;
      }

      return { ...prev, stats: newStats };
    });
  };

  // Check and unlock achievements based on current stats
  const checkAchievements = () => {
    const { stats, unlockedAchievements } = state;
    const toUnlock = [];

    // Volume achievements
    if (stats.totalPicks >= 1 && !unlockedAchievements.includes('first_pick')) {
      toUnlock.push('first_pick');
    }
    if (stats.wins >= 1 && !unlockedAchievements.includes('first_win')) {
      toUnlock.push('first_win');
    }
    if (stats.totalPicks >= 10 && !unlockedAchievements.includes('picks_10')) {
      toUnlock.push('picks_10');
    }
    if (stats.totalPicks >= 50 && !unlockedAchievements.includes('picks_50')) {
      toUnlock.push('picks_50');
    }
    if (stats.totalPicks >= 100 && !unlockedAchievements.includes('picks_100')) {
      toUnlock.push('picks_100');
    }
    if (stats.totalPicks >= 500 && !unlockedAchievements.includes('picks_500')) {
      toUnlock.push('picks_500');
    }

    // Streak achievements
    if (stats.bestStreak >= 3 && !unlockedAchievements.includes('streak_3')) {
      toUnlock.push('streak_3');
    }
    if (stats.bestStreak >= 5 && !unlockedAchievements.includes('streak_5')) {
      toUnlock.push('streak_5');
    }
    if (stats.bestStreak >= 10 && !unlockedAchievements.includes('streak_10')) {
      toUnlock.push('streak_10');
    }

    // Login streaks
    if (stats.bestLoginStreak >= 7 && !unlockedAchievements.includes('daily_login_7')) {
      toUnlock.push('daily_login_7');
    }
    if (stats.bestLoginStreak >= 30 && !unlockedAchievements.includes('daily_login_30')) {
      toUnlock.push('daily_login_30');
    }

    // Special achievements
    if (stats.smashWins >= 1 && !unlockedAchievements.includes('smash_spot_win')) {
      toUnlock.push('smash_spot_win');
    }
    if (stats.goldenWins >= 1 && !unlockedAchievements.includes('golden_convergence')) {
      toUnlock.push('golden_convergence');
    }
    if (stats.jarvisWins >= 5 && !unlockedAchievements.includes('esoteric_believer')) {
      toUnlock.push('esoteric_believer');
    }
    if (stats.sportsWon.length >= 4 && !unlockedAchievements.includes('all_sports')) {
      toUnlock.push('all_sports');
    }

    // Unlock all pending
    toUnlock.forEach(id => unlockAchievement(id));
  };

  // Manual XP award
  const awardXP = (amount) => {
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  return (
    <GamificationContext.Provider value={{
      ...state,
      getCurrentLevel,
      getNextLevel,
      getXPProgress,
      unlockAchievement,
      clearNewAchievement,
      recordPick,
      checkAchievements,
      awardXP,
      ACHIEVEMENTS,
      LEVELS
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

// Achievements Page Component
const AchievementsPage = () => {
  const {
    xp,
    unlockedAchievements,
    stats,
    getCurrentLevel,
    getNextLevel,
    getXPProgress,
    ACHIEVEMENTS,
    LEVELS
  } = useGamification();

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getXPProgress();

  const categories = {
    starter: 'Getting Started',
    streaks: 'Streaks',
    volume: 'Volume',
    performance: 'Performance',
    special: 'Special'
  };

  const achievementsByCategory = {};
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    const cat = achievement.category;
    if (!achievementsByCategory[cat]) {
      achievementsByCategory[cat] = [];
    }
    achievementsByCategory[cat].push(achievement);
  });

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏅 Achievements
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Level Card */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#00D4FF15',
                border: '3px solid #00D4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {currentLevel.icon}
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>LEVEL {currentLevel.level}</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{currentLevel.name}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#00D4FF', fontSize: '28px', fontWeight: 'bold' }}>{xp.toLocaleString()}</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>TOTAL XP</div>
            </div>
          </div>

          {nextLevel && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Progress to {nextLevel.name}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {xp} / {nextLevel.xpRequired} XP
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#333',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#00D4FF',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats Quick View */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <StatCard label="Total Picks" value={stats.totalPicks} icon="📝" />
          <StatCard label="Wins" value={stats.wins} icon="✅" color="#00FF88" />
          <StatCard label="Best Streak" value={stats.bestStreak} icon="🔥" color="#FF6B00" />
          <StatCard label="Login Streak" value={stats.loginStreak} icon="📅" color="#00D4FF" />
          <StatCard label="Achievements" value={`${unlockedAchievements.length}/${Object.keys(ACHIEVEMENTS).length}`} icon="🏆" color="#FFD700" />
        </div>

        {/* Achievements by Category */}
        {Object.entries(categories).map(([categoryKey, categoryName]) => (
          <div key={categoryKey} style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '15px' }}>
              {categoryName}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {achievementsByCategory[categoryKey]?.map(achievement => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    style={{
                      backgroundColor: isUnlocked ? '#00FF8815' : '#1a1a2e',
                      borderRadius: '10px',
                      padding: '15px',
                      border: isUnlocked ? '1px solid #00FF8840' : '1px solid #333',
                      opacity: isUnlocked ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                      backgroundColor: isUnlocked ? '#00FF8820' : '#0a0a0f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      filter: isUnlocked ? 'none' : 'grayscale(1)'
                    }}>
                      {isUnlocked ? achievement.icon : '🔒'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isUnlocked ? '#fff' : '#6b7280', fontWeight: 'bold', fontSize: '14px' }}>
                        {achievement.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                        {achievement.description}
                      </div>
                    </div>
                    <div style={{
                      color: isUnlocked ? '#00FF88' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      +{achievement.xp} XP
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

// Small stat card component
const StatCard = ({ label, value, icon, color = '#00D4FF' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>
    <div style={{ color: color, fontSize: '22px', fontWeight: 'bold' }}>{value}</div>
    <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>{label}</div>
  </div>
);

// Achievement notification popup
export const AchievementNotification = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '20px 25px',
      border: '2px solid #FFD700',
      boxShadow: '0 10px 40px rgba(255, 215, 0, 0.3)',
      zIndex: 1000,
      animation: 'slideDown 0.5s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#FFD70020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        {achievement.icon}
      </div>
      <div>
        <div style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>ACHIEVEMENT UNLOCKED!</div>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{achievement.name}</div>
        <div style={{ color: '#9ca3af', fontSize: '12px' }}>{achievement.description}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#00FF88', fontSize: '18px', fontWeight: 'bold' }}>+{achievement.xp}</div>
        <div style={{ color: '#6b7280', fontSize: '11px' }}>XP</div>
      </div>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
    </div>
  );
};

// Level Badge component for display in navbar or profile
export const LevelBadge = () => {
  const { getCurrentLevel, xp } = useGamification();
  const level = getCurrentLevel();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#00D4FF15',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px'
    }}>
      <span>{level.icon}</span>
      <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>Lv.{level.level}</span>
      <span style={{ color: '#6b7280' }}>{xp} XP</span>
    </div>
  );
};

export default AchievementsPage;
