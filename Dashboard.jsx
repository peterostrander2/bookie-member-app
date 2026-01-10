import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { getAllPicks, getStats } from './clvTracker';
import { analyzeCorrelation } from './correlationDetector';
import SharpMoneyWidget from './SharpMoneyWidget';
import { StatsGridSkeleton, CardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated, ConnectionStatus } from './LiveIndicators';

// What's New items - update this when adding features
const WHATS_NEW = [
  { date: '2025-01-10', title: 'Error Handling', desc: 'Added retry buttons for failed API calls', type: 'improvement' },
  { date: '2025-01-09', title: 'Skeleton Loaders', desc: 'Smoother loading experience across all pages', type: 'improvement' },
  { date: '2025-01-08', title: 'Gematria Community', desc: 'Added X research accounts to Esoteric Edge', type: 'feature' }
];

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackedStats, setTrackedStats] = useState(null);
  const [correlationStatus, setCorrelationStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeSport, setActiveSport] = useState('NBA');
  const [recentPicks, setRecentPicks] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [showWhatsNew, setShowWhatsNew] = useState(true);
  const [nextGameCountdown, setNextGameCountdown] = useState(null);

  // Auto-refresh hook for dashboard data
  const {
    lastUpdated,
    isRefreshing,
    refresh,
    isPaused,
    togglePause
  } = useAutoRefresh(
    useCallback(() => {
      fetchData();
      loadTrackedStats();
    }, []),
    { interval: 120000, immediate: false }
  );

  useEffect(() => {
    fetchData();
    loadTrackedStats();

    // Update countdown every minute
    const countdownInterval = setInterval(() => {
      updateNextGameCountdown();
    }, 60000);

    return () => clearInterval(countdownInterval);
  }, []);

  const updateNextGameCountdown = () => {
    // Simulated next game time - in production this would come from API
    const now = new Date();
    const nextGame = new Date();
    nextGame.setHours(19, 30, 0, 0); // 7:30 PM today
    if (now > nextGame) {
      nextGame.setDate(nextGame.getDate() + 1);
    }
    const diff = nextGame - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setNextGameCountdown({ hours, minutes, gameTime: nextGame.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  };

  const calculateStreak = (picks) => {
    if (!picks || picks.length === 0) return { current: 0, type: null, best: 0, bestType: null };

    const gradedPicks = picks.filter(p => p.result === 'win' || p.result === 'loss').reverse();
    if (gradedPicks.length === 0) return { current: 0, type: null, best: 0, bestType: null };

    // Current streak
    let currentStreak = 0;
    const currentType = gradedPicks[0]?.result;
    for (const pick of gradedPicks) {
      if (pick.result === currentType) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Best streak (wins only)
    let bestStreak = 0;
    let tempStreak = 0;
    for (const pick of gradedPicks) {
      if (pick.result === 'win') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calendar data (last 30 days)
    const calendar = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayPicks = picks.filter(p => new Date(p.timestamp).toDateString() === dateStr);
      const wins = dayPicks.filter(p => p.result === 'win').length;
      const losses = dayPicks.filter(p => p.result === 'loss').length;
      calendar.push({
        date: date.getDate(),
        wins,
        losses,
        total: dayPicks.length,
        dayOfWeek: date.getDay()
      });
    }

    return {
      current: currentStreak,
      type: currentType,
      best: bestStreak,
      bestType: 'win',
      calendar
    };
  };

  const loadTrackedStats = () => {
    const picks = getAllPicks();
    const stats = getStats();

    // Calculate today's picks
    const today = new Date().toDateString();
    const todayPicks = picks.filter(p => new Date(p.timestamp).toDateString() === today);

    // This month's picks
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthPicks = picks.filter(p => {
      const d = new Date(p.timestamp);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // Check correlation
    if (picks.length >= 2) {
      const correlation = analyzeCorrelation(picks);
      setCorrelationStatus(correlation);
    }

    // Calculate ROI
    const gradedPicks = picks.filter(p => p.result === 'win' || p.result === 'loss');
    const totalWagered = gradedPicks.length * 100; // Assume $100 per bet
    const wins = gradedPicks.filter(p => p.result === 'win').length;
    const roi = totalWagered > 0 ? ((wins * 91 - gradedPicks.length * 100) / totalWagered * 100) : 0; // -110 juice assumed

    // Recent picks (last 5 with results)
    const recent = picks
      .filter(p => p.result)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    setRecentPicks(recent);

    // Streak data
    const streak = calculateStreak(picks);
    setStreakData(streak);

    // Daily summary
    setDailySummary({
      gamesTotal: 12, // Would come from API
      sportsActive: ['NBA', 'NHL', 'NCAAB'],
      highConfidencePicks: todayPicks.filter(p => p.tier === 'GOLDEN_CONVERGENCE' || p.confidence >= 80).length || 3
    });

    updateNextGameCountdown();

    // Generate alerts
    const newAlerts = [];

    // High conviction picks alert
    const goldenPicks = picks.filter(p => p.tier === 'GOLDEN_CONVERGENCE');
    if (goldenPicks.length > 0) {
      newAlerts.push({
        type: 'golden',
        icon: '🏆',
        color: '#FFD700',
        title: `${goldenPicks.length} Golden Convergence Pick${goldenPicks.length > 1 ? 's' : ''}`,
        message: 'Highest conviction plays detected'
      });
    }

    // CLV tracking reminder
    const pendingGrades = picks.filter(p => !p.result && p.closing_line);
    if (pendingGrades.length > 0) {
      newAlerts.push({
        type: 'grade',
        icon: '📝',
        color: '#00D4FF',
        title: `${pendingGrades.length} Pick${pendingGrades.length > 1 ? 's' : ''} Ready to Grade`,
        message: 'Record results to track accuracy'
      });
    }

    // Correlation warning
    if (correlationStatus?.diversificationScore < 60) {
      newAlerts.push({
        type: 'correlation',
        icon: '⚠️',
        color: '#FF8844',
        title: 'Portfolio Correlation Warning',
        message: correlationStatus.recommendation?.action || 'Consider diversifying'
      });
    }

    // Hot streak alert
    if (streak.current >= 5 && streak.type === 'win') {
      newAlerts.push({
        type: 'streak',
        icon: '🔥',
        color: '#00FF88',
        title: `${streak.current} Game Win Streak!`,
        message: 'You\'re on fire - keep the momentum'
      });
    }

    setAlerts(newAlerts);
    setTrackedStats({
      total: picks.length,
      thisMonth: monthPicks.length,
      today: todayPicks.length,
      pendingGrades: pendingGrades.length,
      clv: stats?.averageCLV || null,
      winRate: stats?.winRate || null,
      roi: roi
    });
  };

  const fetchData = async () => {
    setError(null);
    try {
      const [healthData, energyData] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline' })),
        api.getTodayEnergy().catch(() => null)
      ]);
      setHealth(healthData);
      setTodayEnergy(energyData);
      if (healthData?.status === 'offline') {
        setError('Unable to connect to server');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  };

  const quickLinks = [
    { path: '/smash-spots', icon: '🔥', title: 'Smash Spots', desc: "Today's best bets with full breakdown", color: '#00FF88' },
    { path: '/sharp', icon: '💵', title: 'Sharp Money', desc: 'Track where pros are betting', color: '#00FF88' },
    { path: '/odds', icon: '🔍', title: 'Best Odds Finder', desc: 'Compare lines across 8+ sportsbooks', color: '#00D4FF', badge: '8+ BOOKS', featured: true },
    { path: '/injuries', icon: '🏥', title: 'Injuries', desc: 'Usage vacuum & beneficiaries', color: '#FF6B6B' },
    { path: '/performance', icon: '📈', title: 'Performance', desc: 'Win rate, CLV, accuracy tracking', color: '#4ECDC4' },
    { path: '/bankroll', icon: '💰', title: 'Bankroll', desc: 'Kelly sizing & bet tracking', color: '#FFD700' }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px' }}>Member Dashboard</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              AI picks using 17 signals: 8 ML models + 4 esoteric + 5 external data
            </p>
          </div>
          
          <div style={{
            backgroundColor: health?.status === 'healthy' ? '#00FF8820' : '#FF444420',
            color: health?.status === 'healthy' ? '#00FF88' : '#FF4444',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: health?.status === 'healthy' ? '#00FF88' : '#FF4444'
            }} />
            {loading ? 'Checking...' : health?.status === 'healthy' ? 'Systems Online' : 'Systems Offline'}
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div style={{ marginBottom: '20px' }}>
          <LastUpdated
            timestamp={lastUpdated}
            isRefreshing={isRefreshing || loading}
            onRefresh={refresh}
            isPaused={isPaused}
            onTogglePause={togglePause}
            compact={false}
          />
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((alert, idx) => (
              <div key={idx} style={{
                backgroundColor: alert.color + '15',
                border: `1px solid ${alert.color}40`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: alert.color, fontWeight: 'bold', fontSize: '14px' }}>{alert.title}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>{alert.message}</div>
                </div>
                {alert.type === 'grade' && (
                  <Link to="/clv" style={{
                    backgroundColor: alert.color,
                    color: '#000',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}>
                    Grade Now
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Connection Error */}
        {error && !loading && (
          <div style={{ marginBottom: '20px' }}>
            <ConnectionError onRetry={fetchData} serviceName="dashboard API" />
          </div>
        )}

        {/* Sport Selector + Sharp Money Widget */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'].map(sport => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: activeSport === sport ? '#00D4FF' : '#1a1a2e',
                  color: activeSport === sport ? '#000' : '#6b7280',
                  border: activeSport === sport ? 'none' : '1px solid #333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activeSport === sport ? 'bold' : 'normal'
                }}
              >
                {sport}
              </button>
            ))}
          </div>
          <SharpMoneyWidget sport={activeSport} />
        </div>

        {/* ENHANCED QUICK STATS PANEL */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Your Stats</h3>
            {streakData && streakData.current > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: streakData.type === 'win' ? '#00FF8820' : '#FF444420',
                color: streakData.type === 'win' ? '#00FF88' : '#FF4444',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {streakData.type === 'win' ? '🔥' : '❄️'} {streakData.current} {streakData.type === 'win' ? 'W' : 'L'} Streak
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                {trackedStats?.total || 0}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>Lifetime</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8B5CF6', fontSize: '24px', fontWeight: 'bold' }}>
                {trackedStats?.thisMonth || 0}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>This Month</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: trackedStats?.winRate >= 55 ? '#00FF88' : trackedStats?.winRate >= 50 ? '#FFD700' : '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>
                {trackedStats?.winRate ? `${trackedStats.winRate.toFixed(1)}%` : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>Win Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: trackedStats?.roi > 0 ? '#00FF88' : trackedStats?.roi < 0 ? '#FF4444' : '#9ca3af', fontSize: '24px', fontWeight: 'bold' }}>
                {trackedStats?.roi ? (trackedStats.roi > 0 ? '+' : '') + trackedStats.roi.toFixed(1) + '%' : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>ROI</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: trackedStats?.clv > 0 ? '#00FF88' : trackedStats?.clv < 0 ? '#FF4444' : '#9ca3af', fontSize: '24px', fontWeight: 'bold' }}>
                {trackedStats?.clv ? (trackedStats.clv > 0 ? '+' : '') + trackedStats.clv.toFixed(1) : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>Avg CLV</div>
            </div>
          </div>
        </div>

        {/* DAILY SUMMARY + RECENT ACTIVITY ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          {/* Daily Summary Card */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', fontSize: '14px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 Today's Action
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>Games Today</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{dailySummary?.gamesTotal || 12} across {dailySummary?.sportsActive?.length || 3} sports</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>High Confidence Picks</span>
                <span style={{ color: '#00FF88', fontWeight: 'bold' }}>{dailySummary?.highConfidencePicks || 0} available</span>
              </div>
              {nextGameCountdown && (
                <div style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#00D4FF10',
                  borderRadius: '8px',
                  border: '1px solid #00D4FF30'
                }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>NEXT GAME IN</div>
                  <div style={{ color: '#00D4FF', fontSize: '20px', fontWeight: 'bold' }}>
                    {nextGameCountdown.hours}h {nextGameCountdown.minutes}m
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>@ {nextGameCountdown.gameTime}</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', fontSize: '14px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Recent Results
            </h3>
            {recentPicks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentPicks.map((pick, idx) => (
                  <Link
                    key={idx}
                    to="/performance"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      backgroundColor: pick.result === 'win' ? '#00FF8810' : pick.result === 'loss' ? '#FF444410' : '#FFD70010',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      borderLeft: `3px solid ${pick.result === 'win' ? '#00FF88' : pick.result === 'loss' ? '#FF4444' : '#FFD700'}`
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                        {pick.pick || pick.team || 'Pick'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '10px' }}>
                        {pick.sport} • {new Date(pick.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      color: pick.result === 'win' ? '#00FF88' : pick.result === 'loss' ? '#FF4444' : '#FFD700',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {pick.result?.toUpperCase() || 'PENDING'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                No graded picks yet. Track your first pick to see results here.
              </div>
            )}
          </div>
        </div>

        {/* STREAK TRACKER WITH HEATMAP */}
        {streakData && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#fff', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏆 Streak Tracker
              </h3>
              {streakData.best > 0 && (
                <div style={{
                  backgroundColor: '#FFD70020',
                  color: '#FFD700',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🥇 Best: {streakData.best}W
                </div>
              )}
            </div>

            {/* Calendar Heatmap */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>Last 30 Days</div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {streakData.calendar?.map((day, idx) => {
                  const intensity = day.total === 0 ? 0 : day.wins / day.total;
                  const bgColor = day.total === 0
                    ? '#1f1f2e'
                    : intensity >= 0.7 ? '#00FF88'
                    : intensity >= 0.5 ? '#00FF8880'
                    : intensity > 0 ? '#FFD700'
                    : '#FF444480';
                  return (
                    <div
                      key={idx}
                      title={`${day.date}: ${day.wins}W - ${day.losses}L`}
                      style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: bgColor,
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: day.total > 0 ? '#000' : '#333',
                        fontWeight: 'bold',
                        cursor: 'default'
                      }}
                    >
                      {day.total > 0 ? day.total : ''}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px' }}>
                <span style={{ color: '#6b7280' }}>Legend:</span>
                <span style={{ color: '#00FF88' }}>● 70%+ wins</span>
                <span style={{ color: '#FFD700' }}>● 50% wins</span>
                <span style={{ color: '#FF4444' }}>● Losing day</span>
                <span style={{ color: '#1f1f2e' }}>● No picks</span>
              </div>
            </div>
          </div>
        )}

        {/* Cosmic Energy */}
        {loading ? (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '25px',
            border: '1px solid #8B5CF640'
          }}>
            <StatsGridSkeleton count={3} />
          </div>
        ) : todayEnergy && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '25px',
            border: '1px solid #8B5CF640',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '5px' }}>🌙</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{todayEnergy.moon_phase || 'Full Moon'}</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{todayEnergy.moon_meaning || 'Normal energy'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: '#00D4FF', fontWeight: 'bold', marginBottom: '5px' }}>{todayEnergy.life_path || 7}</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Life Path</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{todayEnergy.life_path_meaning || 'Underdogs favored'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#D4A574', color: '#000', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block', marginBottom: '5px' }}>
                {todayEnergy.zodiac || 'Capricorn'}
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Earth Sign</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{todayEnergy.zodiac_meaning || 'Lean UNDERS'}</div>
            </div>
          </div>
        )}

        {/* Quick Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              style={{
                backgroundColor: link.featured ? '#0a1a2a' : '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textDecoration: 'none',
                border: link.featured ? `2px solid ${link.color}50` : '1px solid #333',
                transition: 'transform 0.2s, border-color 0.2s',
                display: 'block',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = link.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = link.featured ? `${link.color}50` : '#333';
              }}
            >
              {link.badge && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: link.color + '25',
                  color: link.color,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: `1px solid ${link.color}40`
                }}>
                  {link.badge}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '32px' }}>{link.icon}</div>
                <div>
                  <div style={{ color: link.color, fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    {link.title}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                    {link.desc}
                  </div>
                </div>
              </div>
              {link.featured && (
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: `radial-gradient(circle, ${link.color}15 0%, transparent 70%)`,
                  borderRadius: '50%'
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* WHAT'S NEW PANEL */}
        {showWhatsNew && WHATS_NEW.length > 0 && (
          <div style={{
            backgroundColor: '#0a1a2a',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '25px',
            border: '1px solid #00D4FF30',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowWhatsNew(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px'
              }}
            >
              ×
            </button>
            <h3 style={{ color: '#00D4FF', fontSize: '14px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✨ What's New
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {WHATS_NEW.slice(0, 3).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    backgroundColor: item.type === 'feature' ? '#00FF8820' : '#8B5CF620',
                    color: item.type === 'feature' ? '#00FF88' : '#8B5CF6',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {item.type === 'feature' ? 'NEW' : 'FIX'}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{item.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>{item.desc}</div>
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Summary */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '25px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>Getting Started</h3>
          <div style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 10px' }}>
              <span style={{ color: '#00FF88' }}>1.</span> Check <Link to="/smash-spots" style={{ color: '#00D4FF' }}>Smash Spots</Link> for today's top picks with confidence scores
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <span style={{ color: '#00FF88' }}>2.</span> View <Link to="/splits" style={{ color: '#00D4FF' }}>Betting Splits</Link> to see where sharp money is going
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <span style={{ color: '#00FF88' }}>3.</span> Use <Link to="/esoteric" style={{ color: '#00D4FF' }}>Esoteric Edge</Link> to analyze any matchup with gematria/numerology
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#00FF88' }}>4.</span> Track your results in <Link to="/grading" style={{ color: '#00D4FF' }}>Grade Picks</Link> to measure performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
