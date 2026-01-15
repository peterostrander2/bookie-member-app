import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { getAllPicks, getStats } from './clvTracker';
import { analyzeCorrelation } from './correlationDetector';
import SharpMoneyWidget from './SharpMoneyWidget';
import { Skeleton } from './Skeleton';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackedStats, setTrackedStats] = useState(null);
  const [correlationStatus, setCorrelationStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeSport, setActiveSport] = useState('NBA');
  const [topPick, setTopPick] = useState(null);
  const [topPickLoading, setTopPickLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
    loadTrackedStats();
    fetchTopPick();
  }, []);

  // Demo picks to show when API is unavailable
  const demoPicks = [
    { player: 'LeBron James', side: 'Over', line: 25.5, stat_type: 'points', odds: -110, confidence: 87, sport: 'NBA' },
    { player: 'Jayson Tatum', side: 'Over', line: 27.5, stat_type: 'points', odds: -115, confidence: 85, sport: 'NBA' },
    { player: 'Luka Doncic', side: 'Over', line: 9.5, stat_type: 'assists', odds: -105, confidence: 82, sport: 'NBA' },
    { team: 'Lakers', side: '-3.5', line: -3.5, bet_type: 'spread', odds: -110, confidence: 79, sport: 'NBA' },
    { player: 'Nikola Jokic', side: 'Over', line: 11.5, stat_type: 'rebounds', odds: -120, confidence: 84, sport: 'NBA' }
  ];

  const fetchTopPick = async () => {
    setTopPickLoading(true);
    try {
      // Fetch best bets from NBA (most popular sport)
      const data = await api.getBestBets('NBA');
      if (data && data.picks && data.picks.length > 0) {
        // Find highest confidence pick
        const sortedPicks = [...data.picks].sort((a, b) =>
          (b.confidence || b.score || 0) - (a.confidence || a.score || 0)
        );
        setTopPick(sortedPicks[0]);
      } else {
        // Use demo pick when no live data available
        setTopPick({ ...demoPicks[0], isDemo: true });
      }
    } catch (err) {
      console.error('Error fetching top pick:', err);
      // Use demo pick on error
      setTopPick({ ...demoPicks[0], isDemo: true });
    }
    setTopPickLoading(false);
  };

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
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return '#00FF88';
    if (confidence >= 75) return '#FFD700';
    if (confidence >= 65) return '#00D4FF';
    return '#9ca3af';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 85) return 'SMASH';
    if (confidence >= 75) return 'STRONG';
    if (confidence >= 65) return 'LEAN';
    return 'WATCH';
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

        {/* Today's Top Pick CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #0a2a1a 0%, #1a3a2a 50%, #0a2a1a 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '25px',
          border: '2px solid #00FF8850',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, #00FF8820 0%, transparent 70%)',
            borderRadius: '50%'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>🎯</span>
              <div>
                <h2 style={{ color: '#00FF88', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>
                  Today's Top Pick
                  {topPick?.isDemo && (
                    <span style={{
                      marginLeft: '10px',
                      backgroundColor: '#FFD70030',
                      color: '#FFD700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      verticalAlign: 'middle'
                    }}>SAMPLE</span>
                  )}
                </h2>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {topPick?.isDemo ? 'Live picks refresh every 2 hours' : 'Highest confidence AI signal'}
                </div>
              </div>
            </div>
            {lastUpdated && (
              <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'right' }}>
                Updated {formatTime(lastUpdated)}
              </div>
            )}
          </div>

          {topPickLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Skeleton width={60} height={60} />
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height={24} style={{ marginBottom: '8px' }} />
                <Skeleton width="50%" height={16} />
              </div>
              <Skeleton width={100} height={40} />
            </div>
          ) : topPick ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
              {/* Confidence Circle */}
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: `conic-gradient(${getConfidenceColor(topPick.confidence || topPick.score || 75)} ${(topPick.confidence || topPick.score || 75)}%, #1a1a2e ${(topPick.confidence || topPick.score || 75)}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: '#0a2a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: getConfidenceColor(topPick.confidence || topPick.score || 75), fontSize: '18px', fontWeight: 'bold' }}>
                    {topPick.confidence || topPick.score || 75}%
                  </span>
                </div>
              </div>

              {/* Pick Details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: getConfidenceColor(topPick.confidence || topPick.score || 75) + '25',
                  color: getConfidenceColor(topPick.confidence || topPick.score || 75),
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '6px'
                }}>
                  {getConfidenceLabel(topPick.confidence || topPick.score || 75)}
                </div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {topPick.player || topPick.team || topPick.matchup || 'Top Pick'}
                  {topPick.side && <span style={{ color: '#00D4FF' }}> {topPick.side}</span>}
                  {topPick.line && <span> {topPick.line}</span>}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {topPick.stat_type || topPick.market || topPick.bet_type || 'Player Prop'}
                  {topPick.odds && <span style={{ color: '#00D4FF', marginLeft: '8px' }}>{topPick.odds > 0 ? '+' : ''}{topPick.odds}</span>}
                </div>
              </div>

              {/* CTA Button */}
              <Link to="/smash-spots" style={{
                backgroundColor: '#00FF88',
                color: '#000',
                padding: '14px 24px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 255, 136, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
              }}>
                View All Picks
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No picks available. Check back soon!
            </div>
          )}
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
