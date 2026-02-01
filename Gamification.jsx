/**
 * GAMIFICATION PAGE
 *
 * Achievements, badges, streaks, and XP display page.
 * Context and provider are in GamificationContext.jsx for code splitting.
 */

import React from 'react';
import { useGamification, ACHIEVEMENTS, LEVELS } from './GamificationContext';

// Re-export context items for backward compatibility
export {
  useGamification,
  GamificationProvider,
  ACHIEVEMENTS,
  LEVELS,
  AchievementNotification,
  LevelBadge
} from './GamificationContext';

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

// Achievements Page Component
export const GamificationPage = () => {
  const {
    xp,
    unlockedAchievements,
    stats,
    getCurrentLevel,
    getNextLevel,
    getXPProgress
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

// Default export for lazy loading
export default GamificationPage;
