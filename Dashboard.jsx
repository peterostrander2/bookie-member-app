import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { getAllPicks, getStats } from './clvTracker';
import { analyzeCorrelation } from './correlationDetector';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackedStats, setTrackedStats] = useState(null);
  const [correlationStatus, setCorrelationStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchData();
    loadTrackedStats();
  }, []);

  const loadTrackedStats = () => {
    const picks = getAllPicks();
    const stats = getStats();

    // Calculate today's picks
    const today = new Date().toDateString();
    const todayPicks = picks.filter(p => new Date(p.timestamp).toDateString() === today);

    // Check correlation
    if (picks.length >= 2) {
      const correlation = analyzeCorrelation(picks);
      setCorrelationStatus(correlation);
    }

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

    setAlerts(newAlerts);
    setTrackedStats({
      total: picks.length,
      today: todayPicks.length,
      pendingGrades: pendingGrades.length,
      clv: stats?.averageCLV || null,
      winRate: stats?.winRate || null
    });
  };

  const fetchData = async () => {
    try {
      const [healthData, energyData] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline' })),
        api.getTodayEnergy().catch(() => null)
      ]);
      setHealth(healthData);
      setTodayEnergy(energyData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const quickLinks = [
    { path: '/smash-spots', icon: '🔥', title: 'Smash Spots', desc: "Today's best bets with full breakdown", color: '#00FF88' },
    { path: '/sharp', icon: '💵', title: 'Sharp Money', desc: 'Track where pros are betting', color: '#00FF88' },
    { path: '/odds', icon: '🎯', title: 'Best Odds', desc: 'Find best lines across books', color: '#00D4FF' },
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

        {/* Your Stats */}
        {trackedStats && trackedStats.total > 0 && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #333',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00D4FF', fontSize: '28px', fontWeight: 'bold' }}>
                {trackedStats.total}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Total Tracked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00FF88', fontSize: '28px', fontWeight: 'bold' }}>
                {trackedStats.today}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Today</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: trackedStats.winRate >= 55 ? '#00FF88' : trackedStats.winRate >= 50 ? '#FFD700' : '#FF4444', fontSize: '28px', fontWeight: 'bold' }}>
                {trackedStats.winRate ? `${trackedStats.winRate.toFixed(1)}%` : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Win Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: trackedStats.clv > 0 ? '#00FF88' : trackedStats.clv < 0 ? '#FF4444' : '#9ca3af', fontSize: '28px', fontWeight: 'bold' }}>
                {trackedStats.clv ? (trackedStats.clv > 0 ? '+' : '') + trackedStats.clv.toFixed(1) : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Avg CLV</div>
            </div>
          </div>
        )}

        {/* Cosmic Energy */}
        {todayEnergy && (
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
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textDecoration: 'none',
                border: '1px solid #333',
                transition: 'transform 0.2s, border-color 0.2s',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = link.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#333';
              }}
            >
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
            </Link>
          ))}
        </div>

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
