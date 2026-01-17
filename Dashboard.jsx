import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { getAllPicks, getStats } from './clvTracker';
import { analyzeCorrelation } from './correlationDetector';
import SharpMoneyWidget from './SharpMoneyWidget';
import { Skeleton } from './Skeleton';
import SearchBar from './SearchBar';
import { useFavoriteSport } from './usePreferences';

// Tier win rate stats (historical averages)
const TIER_WIN_RATES = {
  SMASH: { rate: 87, label: 'SMASH tier hits 87% historically', profitable: true },
  STRONG: { rate: 72, label: 'STRONG tier hits 72% historically', profitable: true },
  LEAN: { rate: 58, label: 'LEAN tier hits 58% historically', profitable: true },
  WATCH: { rate: 48, label: 'WATCH tier hits 48% historically', profitable: false }
};

// Minimum confidence required to be featured as "Top Pick"
const MIN_FEATURED_CONFIDENCE = 65;

// Check if user has visited before (for progressive disclosure)
const hasVisitedBefore = () => localStorage.getItem('dashboard_visited') === 'true';
const markAsVisited = () => localStorage.setItem('dashboard_visited', 'true');

// Demo picks (moved outside component to prevent recreation on every render)
const DEMO_PICKS = [
  { player: 'LeBron James', side: 'Over', line: 25.5, stat_type: 'points', odds: -110, confidence: 87, sport: 'NBA' },
  { player: 'Jayson Tatum', side: 'Over', line: 27.5, stat_type: 'points', odds: -115, confidence: 85, sport: 'NBA' },
  { player: 'Luka Doncic', side: 'Over', line: 9.5, stat_type: 'assists', odds: -105, confidence: 82, sport: 'NBA' },
  { team: 'Lakers', side: '-3.5', line: -3.5, bet_type: 'spread', odds: -110, confidence: 79, sport: 'NBA' },
  { player: 'Nikola Jokic', side: 'Over', line: 11.5, stat_type: 'rebounds', odds: -120, confidence: 84, sport: 'NBA' }
];

// Quick links config (moved outside component to prevent recreation on every render)
const QUICK_LINKS = [
  { path: '/smash-spots', icon: '🔥', title: 'SMASH Spots', desc: "Today's highest conviction picks", color: '#10B981' },
  { path: '/sharp', icon: '🦈', title: 'Sharp Money', desc: 'Track where pros are betting', color: '#10B981' },
  { path: '/odds', icon: '📊', title: 'Best Odds Finder', desc: 'Compare lines across 8+ sportsbooks', color: '#00D4FF', badge: '8+ BOOKS', featured: true },
  { path: '/injuries', icon: '🏥', title: 'Injuries', desc: 'Usage vacuum & beneficiaries', color: '#EF4444' },
  { path: '/performance', icon: '📈', title: 'Performance', desc: 'Win rate, CLV, accuracy tracking', color: '#00D4FF' },
  { path: '/bankroll', icon: '💵', title: 'Bankroll', desc: 'Kelly sizing & bet tracking', color: '#F59E0B' }
];

// Sports options (moved outside component)
const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackedStats, setTrackedStats] = useState(null);
  const [correlationStatus, setCorrelationStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const { favoriteSport: activeSport, setFavoriteSport: setActiveSport } = useFavoriteSport();
  const [topPick, setTopPick] = useState(null);
  const [topPickLoading, setTopPickLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [yesterdayPick, setYesterdayPick] = useState(null);
  const [sharpAlert, setSharpAlert] = useState(null);
  const [significantInjuries, setSignificantInjuries] = useState([]);
  const [recentWins, setRecentWins] = useState([]);

  // Progressive disclosure state
  const [showGettingStarted, setShowGettingStarted] = useState(!hasVisitedBefore());
  const [showEsoteric, setShowEsoteric] = useState(true);

  useEffect(() => {
    fetchData();
    loadTrackedStats();
    // Mark as visited after first load
    markAsVisited();
  }, []);

  // Load yesterday's graded pick from tracked history
  const loadYesterdayPick = useCallback(() => {
    try {
      const picks = getAllPicks();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      // Find yesterday's graded picks with results
      const yesterdayPicks = picks.filter(p => {
        const pickDate = new Date(p.timestamp).toDateString();
        return pickDate === yesterdayStr && p.result;
      });

      if (yesterdayPicks.length > 0) {
        // Get the highest confidence pick from yesterday
        const sorted = [...yesterdayPicks].sort((a, b) =>
          (b.confidence || b.tier_score || 0) - (a.confidence || a.tier_score || 0)
        );
        const best = sorted[0];

        // Calculate recent track record (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPicks = picks.filter(p =>
          new Date(p.timestamp) >= thirtyDaysAgo && p.result
        );
        const wins = recentPicks.filter(p => p.result === 'WIN').length;
        const total = recentPicks.length;

        setYesterdayPick({
          ...best,
          trackRecord: { wins, total }
        });
      }
    } catch (err) {
      console.error('Error loading yesterday pick:', err);
    }
  }, []);

  // Fetch sharp money alert as fallback
  const fetchSharpAlert = useCallback(async () => {
    try {
      const data = await api.getSharpMoney(activeSport);
      if (data && data.movements && data.movements.length > 0) {
        // Get the most significant sharp move
        const sorted = [...data.movements].sort((a, b) =>
          Math.abs(b.line_move || 0) - Math.abs(a.line_move || 0)
        );
        setSharpAlert(sorted[0]);
      } else if (data && Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort((a, b) =>
          Math.abs(b.line_move || 0) - Math.abs(a.line_move || 0)
        );
        setSharpAlert(sorted[0]);
      }
    } catch (err) {
      console.error('Error fetching sharp alert:', err);
    }
  }, [activeSport]);

  // Memoized fetch function to prevent recreation
  const fetchTopPick = useCallback(async () => {
    setTopPickLoading(true);
    try {
      // Also load fallback data
      loadYesterdayPick();
      fetchSharpAlert();

      // Fetch best bets from user's favorite sport
      const data = await api.getBestBets(activeSport);
      let allPicks = [];

      // Collect picks from different response formats
      if (data && data.picks && data.picks.length > 0) {
        allPicks = data.picks;
      } else if (data && data.prop_picks && data.prop_picks.picks) {
        allPicks = [...(data.prop_picks.picks || []), ...(data.game_picks?.picks || [])];
      } else if (data && data.data) {
        allPicks = data.data;
      }

      if (allPicks.length > 0) {
        // Filter to only include picks above minimum confidence threshold
        // We don't want to feature WATCH tier (48% historical win rate) as "Top Pick"
        const qualifyingPicks = allPicks.filter(p =>
          (p.confidence || p.score || 0) >= MIN_FEATURED_CONFIDENCE
        );

        if (qualifyingPicks.length > 0) {
          // Find highest confidence pick from qualifying picks
          const sortedPicks = [...qualifyingPicks].sort((a, b) =>
            (b.confidence || b.score || 0) - (a.confidence || a.score || 0)
          );
          const bestPick = sortedPicks[0];
          setTopPick({ ...bestPick, sport: activeSport });
        } else {
          // No picks meet minimum threshold - show message instead of low-quality pick
          setTopPick({
            noQualifyingPicks: true,
            totalPicks: allPicks.length,
            sport: activeSport
          });
        }
      } else {
        // Use demo pick when no live data available
        const sportDemo = DEMO_PICKS.find(p => p.sport === activeSport) || DEMO_PICKS[0];
        setTopPick({ ...sportDemo, isDemo: true });
      }
    } catch (err) {
      console.error('Error fetching top pick:', err);
      // Use demo pick on error
      const sportDemo = DEMO_PICKS.find(p => p.sport === activeSport) || DEMO_PICKS[0];
      setTopPick({ ...sportDemo, isDemo: true });
    }
    setTopPickLoading(false);
  }, [activeSport, loadYesterdayPick, fetchSharpAlert]);

  // Refetch top pick when favorite sport changes
  useEffect(() => {
    fetchTopPick();
  }, [fetchTopPick]);

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
      const [healthData, energyData, injuryData] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline' })),
        api.getTodayEnergy().catch(() => null),
        api.getInjuries(activeSport).catch(() => null)
      ]);
      setHealth(healthData);
      setTodayEnergy(energyData);
      setLastUpdated(new Date());

      // Process significant injuries (high impact only)
      if (injuryData && Array.isArray(injuryData)) {
        const significant = injuryData
          .filter(inj => inj.impact === 'high' || inj.status === 'Out' || inj.status === 'Doubtful')
          .slice(0, 3);
        setSignificantInjuries(significant);
      } else if (injuryData?.injuries) {
        const significant = injuryData.injuries
          .filter(inj => inj.impact === 'high' || inj.status === 'Out' || inj.status === 'Doubtful')
          .slice(0, 3);
        setSignificantInjuries(significant);
      }

      // Load recent wins from tracked picks
      const picks = getAllPicks();
      const todayStr = new Date().toDateString();
      const recentWinPicks = picks
        .filter(p => p.result === 'WIN' && new Date(p.timestamp).toDateString() === todayStr)
        .slice(0, 5);
      setRecentWins(recentWinPicks);
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


  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header with search */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px' }}>Member Dashboard</h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                SMASH picks powered by 17 signals: 8 ML models + 4 esoteric + 5 external data
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastUpdated && (
                <div style={{
                  backgroundColor: '#1a1a2e',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>Data as of</span>
                  <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>{formatTime(lastUpdated)}</span>
                </div>
              )}
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
          </div>

          {/* Search Bar */}
          <SearchBar placeholder="Search players, teams, games..." />
        </div>

        {/* Value Proposition Banner - Today's Edge */}
        {trackedStats && trackedStats.total > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#10B98115',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            border: '1px solid #10B98130',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>📈</span>
              <div>
                <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '15px' }}>
                  Your Edge This Month
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {trackedStats.total} picks tracked • {trackedStats.today} today
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {trackedStats.winRate !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: trackedStats.winRate >= 55 ? '#00FF88' : trackedStats.winRate >= 52.4 ? '#FFD700' : '#FF4444',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {trackedStats.winRate.toFixed(1)}%
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Win Rate</div>
                </div>
              )}
              {trackedStats.clv !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: trackedStats.clv > 0 ? '#00FF88' : trackedStats.clv < 0 ? '#FF4444' : '#9ca3af',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {trackedStats.clv > 0 ? '+' : ''}{trackedStats.clv.toFixed(1)}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Avg CLV</div>
                </div>
              )}
              <Link
                to="/analytics"
                style={{
                  backgroundColor: '#10B981',
                  color: '#000',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View Stats →
              </Link>
            </div>
          </div>
        )}

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
          ) : topPick?.noQualifyingPicks ? (
            // No high-conviction picks - show yesterday's result or sharp alert instead
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
              {yesterdayPick ? (
                // Show yesterday's result
                <>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: yesterdayPick.result === 'WIN' ? '#00FF8820' : yesterdayPick.result === 'LOSS' ? '#FF444420' : '#FFD70020',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${yesterdayPick.result === 'WIN' ? '#00FF8850' : yesterdayPick.result === 'LOSS' ? '#FF444450' : '#FFD70050'}`
                  }}>
                    <span style={{ fontSize: '28px' }}>{yesterdayPick.result === 'WIN' ? '✅' : yesterdayPick.result === 'LOSS' ? '❌' : '➖'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Yesterday's Pick
                    </div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {yesterdayPick.player || yesterdayPick.team || yesterdayPick.matchup}
                      {yesterdayPick.side && <span style={{ color: '#00D4FF' }}> {yesterdayPick.side}</span>}
                      {yesterdayPick.line && <span> {yesterdayPick.line}</span>}
                      <span style={{
                        marginLeft: '8px',
                        color: yesterdayPick.result === 'WIN' ? '#00FF88' : yesterdayPick.result === 'LOSS' ? '#FF4444' : '#FFD700',
                        fontWeight: 'bold'
                      }}>
                        {yesterdayPick.result === 'WIN' ? 'WON!' : yesterdayPick.result === 'LOSS' ? 'LOST' : 'PUSH'}
                      </span>
                    </div>
                    {yesterdayPick.trackRecord && yesterdayPick.trackRecord.total > 0 && (
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        <span style={{ color: '#00FF88' }}>{yesterdayPick.trackRecord.wins}-{yesterdayPick.trackRecord.total - yesterdayPick.trackRecord.wins}</span>
                        {' '}last 30 days ({((yesterdayPick.trackRecord.wins / yesterdayPick.trackRecord.total) * 100).toFixed(0)}% win rate)
                      </div>
                    )}
                  </div>
                </>
              ) : sharpAlert ? (
                // Show sharp money alert as fallback
                <>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#00D4FF20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #00D4FF50'
                  }}>
                    <span style={{ fontSize: '28px' }}>🦈</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        backgroundColor: '#00D4FF25',
                        color: '#00D4FF',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>SHARP ALERT</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {sharpAlert.team || sharpAlert.matchup || 'Sharp Move Detected'}
                      {sharpAlert.side && <span style={{ color: '#00D4FF' }}> {sharpAlert.side}</span>}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                      Line moved {sharpAlert.line_move > 0 ? '+' : ''}{sharpAlert.line_move} pts
                      {sharpAlert.sharp_percentage && <span> • {sharpAlert.sharp_percentage}% sharp money</span>}
                    </div>
                  </div>
                </>
              ) : (
                // Default fallback
                <>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #4B5563'
                  }}>
                    <span style={{ fontSize: '28px' }}>🔍</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                      Scanning for High-Conviction Plays
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>
                      {topPick.totalPicks} picks being analyzed. Check back when games get closer.
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      We only feature 65%+ confidence picks to protect your bankroll.
                    </div>
                  </div>
                </>
              )}
              <Link to={yesterdayPick ? "/analytics" : sharpAlert ? "/sharp" : "/smash-spots"} style={{
                backgroundColor: yesterdayPick ? '#00FF88' : sharpAlert ? '#00D4FF' : '#4B5563',
                color: '#000',
                padding: '14px 24px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {yesterdayPick ? 'View Stats' : sharpAlert ? 'Sharp Alerts' : 'Browse Picks'}
                <span>→</span>
              </Link>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: getConfidenceColor(topPick.confidence || topPick.score || 75) + '25',
                    color: getConfidenceColor(topPick.confidence || topPick.score || 75),
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {getConfidenceLabel(topPick.confidence || topPick.score || 75)}
                  </div>
                  {/* Tier win rate badge */}
                  <div style={{
                    backgroundColor: '#ffffff10',
                    color: '#9ca3af',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {TIER_WIN_RATES[getConfidenceLabel(topPick.confidence || topPick.score || 75)]?.label || 'Track record pending'}
                  </div>
                </div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {topPick.player || topPick.team || topPick.matchup || 'Top Pick'}
                  {topPick.side && <span style={{ color: '#00D4FF' }}> {topPick.side}</span>}
                  {topPick.line && <span> {topPick.line}</span>}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {topPick.stat_type || topPick.market || topPick.bet_type || 'Player Prop'}
                  {topPick.odds && <span style={{ color: '#00D4FF', marginLeft: '8px' }}>{topPick.odds > 0 ? '+' : ''}{topPick.odds}</span>}
                  {topPick.edge && <span style={{ color: '#00FF88', marginLeft: '8px' }}>+{(topPick.edge * 100).toFixed(1)}% edge</span>}
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
            {alerts.map((alert) => (
              <div key={alert.type} style={{
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

        {/* Injury Alert Banner */}
        {significantInjuries.length > 0 && (
          <Link to="/injuries" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#EF444415',
            border: '1px solid #EF444440',
            borderRadius: '10px',
            marginBottom: '20px',
            textDecoration: 'none'
          }}>
            <span style={{ fontSize: '20px' }}>🏥</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '13px' }}>
                {significantInjuries.length} Significant Injur{significantInjuries.length === 1 ? 'y' : 'ies'} Today
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                {significantInjuries.slice(0, 2).map(inj => inj.player || inj.name).join(', ')}
                {significantInjuries.length > 2 && ` +${significantInjuries.length - 2} more`}
              </div>
            </div>
            <span style={{ color: '#EF4444', fontSize: '12px' }}>View Affected Picks →</span>
          </Link>
        )}

        {/* Quick Wins Ticker */}
        {recentWins.length > 0 && (
          <div style={{
            backgroundColor: '#00FF8810',
            border: '1px solid #00FF8830',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: 'ticker 20s linear infinite'
            }}>
              <span style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}>
                🔥 TODAY'S WINS:
              </span>
              {recentWins.map((win, i) => (
                <span key={i} style={{ color: '#fff', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {win.player || win.team} {win.side} {win.line} ✅
                  {i < recentWins.length - 1 && <span style={{ color: '#333', margin: '0 8px' }}>|</span>}
                </span>
              ))}
            </div>
            <style>{`
              @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        )}

        {/* Sharp Money Alert - when significant divergence */}
        {sharpAlert && sharpAlert.line_move && Math.abs(sharpAlert.line_move) >= 1 && (
          <Link to="/sharp" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#00D4FF15',
            border: '1px solid #00D4FF40',
            borderRadius: '10px',
            marginBottom: '20px',
            textDecoration: 'none'
          }}>
            <span style={{ fontSize: '20px' }}>🦈</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '13px' }}>
                Sharp Money Alert
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                {sharpAlert.team || sharpAlert.matchup}: Line moved {sharpAlert.line_move > 0 ? '+' : ''}{sharpAlert.line_move} pts
              </div>
            </div>
            <span style={{ color: '#00D4FF', fontSize: '12px' }}>See All Sharp Moves →</span>
          </Link>
        )}

        {/* Sport Selector + Sharp Money Widget */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {SPORTS.map(sport => (
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

        {/* Cosmic Energy / Esoteric Section - Collapsible */}
        {todayEnergy && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '16px',
            marginBottom: '25px',
            border: '1px solid #8B5CF640',
            overflow: 'hidden'
          }}>
            {/* Collapsible Header */}
            <button
              onClick={() => setShowEsoteric(!showEsoteric)}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: showEsoteric ? '1px solid #8B5CF630' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                <div>
                  <span style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '14px' }}>
                    Hidden Edge
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '8px' }}>
                    Cosmic confirmation signals
                  </span>
                </div>
                {/* Info tooltip */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span
                    title="HOW TO USE: When SMASH picks align with favorable cosmic conditions (moon phase, numerology), confidence increases. Example: A STRONG pick during a Bullish moon phase becomes even more compelling. Use these to CONFIRM picks, not as standalone signals."
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#8B5CF630',
                      color: '#8B5CF6',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'help'
                    }}
                  >
                    ?
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Energy indicator badge */}
                <div style={{
                  backgroundColor: todayEnergy.betting_outlook === 'BULLISH' ? '#00FF8825' :
                                   todayEnergy.betting_outlook === 'BEARISH' ? '#FF444425' : '#FFD70025',
                  color: todayEnergy.betting_outlook === 'BULLISH' ? '#00FF88' :
                         todayEnergy.betting_outlook === 'BEARISH' ? '#FF4444' : '#FFD700',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {todayEnergy.betting_outlook || 'NEUTRAL'}
                </div>
                {/* Expand/Collapse arrow */}
                <span style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  transform: showEsoteric ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              </div>
            </button>

            {/* Collapsible Content */}
            {showEsoteric && (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '5px' }}>{todayEnergy.moon_emoji || '🌙'}</div>
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

                {/* How to use section */}
                <div style={{
                  gridColumn: '1 / -1',
                  backgroundColor: '#8B5CF610',
                  borderRadius: '8px',
                  padding: '14px',
                  marginTop: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>💡</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                        HOW TO USE THIS
                      </div>
                      {todayEnergy.betting_outlook === 'BULLISH' ? (
                        <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.5' }}>
                          <span style={{ color: '#00FF88' }}>Favorable conditions today.</span> SMASH picks with 75%+ confidence
                          get extra confirmation. Look for underdogs and overs.
                        </div>
                      ) : todayEnergy.betting_outlook === 'BEARISH' ? (
                        <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.5' }}>
                          <span style={{ color: '#FF4444' }}>Challenging energy today.</span> Only play SMASH tier (85%+) picks.
                          Favor favorites and unders. Consider smaller unit sizes.
                        </div>
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.5' }}>
                          <span style={{ color: '#FFD700' }}>Neutral conditions.</span> Stick to standard SMASH picks.
                          {todayEnergy.recommendation || ' No special adjustments needed.'}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/esoteric"
                      style={{
                        backgroundColor: '#8B5CF620',
                        color: '#8B5CF6',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
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

        {/* Getting Started - Only shown for new users */}
        {showGettingStarted && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '25px',
            border: '1px solid #00D4FF40',
            position: 'relative'
          }}>
            {/* Dismiss button */}
            <button
              onClick={() => setShowGettingStarted(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                lineHeight: 1
              }}
              title="Dismiss"
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '20px' }}>🚀</span>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Quick Start Guide</h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              <Link to="/smash-spots" style={{
                backgroundColor: '#00FF8815',
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #00FF8830'
              }}>
                <span style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '16px' }}>1</span>
                <div>
                  <div style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '13px' }}>SMASH Spots</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>Today's hot picks</div>
                </div>
              </Link>

              <Link to="/sharp" style={{
                backgroundColor: '#00D4FF15',
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #00D4FF30'
              }}>
                <span style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '16px' }}>2</span>
                <div>
                  <div style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '13px' }}>Sharp Money</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>Where pros bet</div>
                </div>
              </Link>

              <Link to="/odds" style={{
                backgroundColor: '#FFD70015',
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #FFD70030'
              }}>
                <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>3</span>
                <div>
                  <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '13px' }}>Best Odds</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>Compare 8+ books</div>
                </div>
              </Link>

              <Link to="/history" style={{
                backgroundColor: '#8B5CF615',
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #8B5CF630'
              }}>
                <span style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '16px' }}>4</span>
                <div>
                  <div style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '13px' }}>Track Bets</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>Grade your picks</div>
                </div>
              </Link>
            </div>

            <div style={{
              marginTop: '12px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '11px'
            }}>
              Click × to dismiss this guide
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
