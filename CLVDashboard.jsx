/**
 * CLV DASHBOARD
 *
 * The proof that your system works. Shows:
 * - Overall CLV performance
 * - Win rates by tier
 * - Sport breakdown
 * - Recent pick history
 * - Insights and recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  getStats,
  getRecentPicks,
  getCLVInsights,
  getPendingGrades,
  gradePick
} from './clvTracker';
import { getTierInfo } from './signalEngine';

const CLVDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPicks, setRecentPicks] = useState([]);
  const [insights, setInsights] = useState([]);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(getStats());
    setRecentPicks(getRecentPicks(20));
    setInsights(getCLVInsights());
    setPendingGrades(getPendingGrades());
  };

  const handleGrade = (pickId, result) => {
    gradePick(pickId, result);
    loadData();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const StatCard = ({ label, value, subValue, color = '#00D4FF' }) => (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ color: color, fontSize: '28px', fontWeight: 'bold' }}>
        {value}
      </div>
      {subValue && (
        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
          {subValue}
        </div>
      )}
    </div>
  );

  const CLVMeter = ({ value }) => {
    const isPositive = value >= 0;
    const absValue = Math.abs(value);
    const width = Math.min(absValue * 20, 100);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          flex: 1,
          height: '8px',
          backgroundColor: '#333',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: isPositive ? '50%' : `${50 - width / 2}%`,
            width: `${width / 2}%`,
            height: '100%',
            backgroundColor: isPositive ? '#00FF88' : '#FF4444',
            borderRadius: '4px'
          }} />
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#666'
          }} />
        </div>
        <span style={{
          color: isPositive ? '#00FF88' : '#FF4444',
          fontWeight: 'bold',
          minWidth: '60px',
          textAlign: 'right'
        }}>
          {isPositive ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>
    );
  };

  if (!stats) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading CLV data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 CLV Performance
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Closing Line Value - The true measure of betting edge
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {['overview', 'picks', 'insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab ? '#00D4FF' : '#1a1a2e',
                color: activeTab === tab ? '#000' : '#9ca3af',
                border: activeTab === tab ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Main Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <StatCard
                label="Avg CLV"
                value={stats.avgCLV >= 0 ? `+${stats.avgCLV.toFixed(2)}` : stats.avgCLV.toFixed(2)}
                subValue="points"
                color={stats.avgCLV >= 0 ? '#00FF88' : '#FF4444'}
              />
              <StatCard
                label="CLV Win Rate"
                value={`${stats.positiveCLVRate.toFixed(0)}%`}
                subValue="beat closing line"
                color={stats.positiveCLVRate >= 50 ? '#00FF88' : '#FFD700'}
              />
              <StatCard
                label="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                subValue={`${stats.wins}W - ${stats.losses}L`}
                color={stats.winRate >= 52 ? '#00FF88' : '#9ca3af'}
              />
              <StatCard
                label="Total Picks"
                value={stats.totalPicks}
                subValue={`${stats.gradedPicks} graded`}
              />
            </div>

            {/* Tier Performance */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Performance by Tier
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats?.byTier && Object.entries(stats.byTier).map(([tier, tierStats]) => {
                  const tierInfo = getTierInfo(tier);
                  return (
                    <div key={tier} style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr 80px 80px',
                      alignItems: 'center',
                      gap: '15px',
                      padding: '12px',
                      backgroundColor: '#0a0a0f',
                      borderRadius: '8px'
                    }}>
                      <div style={{ color: tierInfo.color, fontWeight: 'bold', fontSize: '12px' }}>
                        {tierInfo.label}
                      </div>
                      <CLVMeter value={tierStats.avgCLV} />
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: tierStats.winRate >= 52 ? '#00FF88' : '#9ca3af' }}>
                          {tierStats.winRate.toFixed(0)}%
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '11px' }}> win</span>
                      </div>
                      <div style={{ textAlign: 'right', color: '#6b7280', fontSize: '12px' }}>
                        {tierStats.total} picks
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sport Performance */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Performance by Sport
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                {stats?.bySport && Object.entries(stats.bySport).map(([sport, sportStats]) => (
                  <div key={sport} style={{
                    padding: '15px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}>
                      {sport}
                    </div>
                    <div style={{
                      color: sportStats.avgCLV >= 0 ? '#00FF88' : '#FF4444',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {sportStats.avgCLV >= 0 ? '+' : ''}{sportStats.avgCLV.toFixed(2)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                      {sportStats.winRate.toFixed(0)}% • {sportStats.total} picks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Picks Tab */}
        {activeTab === 'picks' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Pending Grades Section */}
            {pendingGrades.length > 0 && (
              <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
                <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '15px', fontSize: '14px' }}>
                  ⏳ Needs Grading ({pendingGrades.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingGrades.slice(0, 5).map(pick => (
                    <div key={pick.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#0a0a0f',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: '13px' }}>
                          {pick.game.away_team} @ {pick.game.home_team}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                          {pick.side} {pick.bet_type === 'spread' ? pick.opening_line : ''} • {pick.confidence}%
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleGrade(pick.id, 'WIN')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#00FF8820',
                            color: '#00FF88',
                            border: '1px solid #00FF8840',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          WIN
                        </button>
                        <button
                          onClick={() => handleGrade(pick.id, 'LOSS')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FF444420',
                            color: '#FF4444',
                            border: '1px solid #FF444440',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          LOSS
                        </button>
                        <button
                          onClick={() => handleGrade(pick.id, 'PUSH')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#9ca3af20',
                            color: '#9ca3af',
                            border: '1px solid #9ca3af40',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          PUSH
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Picks */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '14px' }}>
                Recent Picks
              </h3>
              {recentPicks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                  No picks recorded yet. Start tracking from AI Picks!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentPicks.map(pick => {
                    const tierInfo = getTierInfo(pick.tier);
                    return (
                      <div key={pick.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 80px 60px 70px',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#0a0a0f',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        <div style={{ color: '#6b7280' }}>
                          {formatDate(pick.timestamp)}
                        </div>
                        <div>
                          <span style={{ color: '#fff' }}>
                            {pick.game.away_team} @ {pick.game.home_team}
                          </span>
                          <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                            {pick.side} {pick.bet_type === 'spread' ? pick.opening_line : ''}
                          </span>
                        </div>
                        <div style={{ color: tierInfo.color, fontSize: '10px' }}>
                          {pick.tier.replace('_', ' ')}
                        </div>
                        <div style={{
                          color: pick.clv !== null
                            ? (pick.clv >= 0 ? '#00FF88' : '#FF4444')
                            : '#6b7280',
                          textAlign: 'right'
                        }}>
                          {pick.clv !== null ? `${pick.clv >= 0 ? '+' : ''}${pick.clv.toFixed(1)}` : '—'}
                        </div>
                        <div style={{
                          textAlign: 'right',
                          color: pick.result === 'WIN' ? '#00FF88'
                            : pick.result === 'LOSS' ? '#FF4444'
                            : pick.result === 'PUSH' ? '#9ca3af'
                            : '#6b7280'
                        }}>
                          {pick.result || 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {insights.length === 0 ? (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                Need more data for insights. Keep tracking picks!
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `4px solid ${
                    insight.type === 'success' ? '#00FF88'
                    : insight.type === 'warning' ? '#FFD700'
                    : '#00D4FF'
                  }`
                }}>
                  <h4 style={{
                    color: insight.type === 'success' ? '#00FF88'
                      : insight.type === 'warning' ? '#FFD700'
                      : '#00D4FF',
                    margin: '0 0 8px',
                    fontSize: '14px'
                  }}>
                    {insight.title}
                  </h4>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>
                    {insight.message}
                  </p>
                </div>
              ))
            )}

            {/* CLV Explainer */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '10px'
            }}>
              <h4 style={{ color: '#00D4FF', margin: '0 0 12px', fontSize: '14px' }}>
                📚 Understanding CLV
              </h4>
              <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 10px' }}>
                  <strong style={{ color: '#fff' }}>Closing Line Value (CLV)</strong> measures the difference
                  between the line when you bet and the line at game time.
                </p>
                <p style={{ margin: '0 0 10px' }}>
                  <strong style={{ color: '#00FF88' }}>Positive CLV</strong> = You got a better number than the
                  closing line. This is the mark of a winning bettor.
                </p>
                <p style={{ margin: 0 }}>
                  Consistently beating the closing line by even 1-2 points projects to long-term profitability,
                  regardless of short-term results.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CLVDashboard;
