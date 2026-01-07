/**
 * PERFORMANCE DASHBOARD
 *
 * The ultimate accountability tool. Shows:
 * - Historical accuracy by tier, sport, and signal
 * - ROI tracking over time
 * - Signal validation - which ones actually work
 * - Trend analysis
 */

import React, { useState, useEffect } from 'react';
import {
  getAllPicks as getCLVPicks,
  getStats as getCLVStats
} from './clvTracker';
import {
  getSignalPerformance,
  getWeeklySummary,
  analyzeSignalCorrelation
} from './backtestStorage';
import { getBankrollStats } from './kellyCalculator';
import { analyzeCorrelation } from './correlationDetector';

const PerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clvStats, setClvStats] = useState(null);
  const [signalPerf, setSignalPerf] = useState(null);
  const [bankrollStats, setBankrollStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [signalCorrelation, setSignalCorrelation] = useState(null);
  const [recentPicks, setRecentPicks] = useState([]);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = () => {
    setClvStats(getCLVStats());
    setSignalPerf(getSignalPerformance());
    setBankrollStats(getBankrollStats());
    setWeeklySummary(getWeeklySummary());
    setSignalCorrelation(analyzeSignalCorrelation());
    setRecentPicks(getCLVPicks().slice(-50));
  };

  // Calculate aggregate metrics
  const getOverallGrade = () => {
    if (!clvStats || !bankrollStats) return { grade: 'N/A', color: '#9ca3af' };

    let score = 0;

    // CLV component (40%)
    if (clvStats.avgCLV > 0.5) score += 40;
    else if (clvStats.avgCLV > 0) score += 30;
    else if (clvStats.avgCLV > -0.5) score += 20;
    else score += 10;

    // Win rate component (30%)
    if (clvStats.winRate >= 55) score += 30;
    else if (clvStats.winRate >= 52) score += 25;
    else if (clvStats.winRate >= 50) score += 15;
    else score += 5;

    // ROI component (30%)
    if (bankrollStats.roi > 10) score += 30;
    else if (bankrollStats.roi > 5) score += 25;
    else if (bankrollStats.roi > 0) score += 15;
    else score += 0;

    if (score >= 85) return { grade: 'A+', color: '#00FF88' };
    if (score >= 75) return { grade: 'A', color: '#00FF88' };
    if (score >= 65) return { grade: 'B+', color: '#00D4FF' };
    if (score >= 55) return { grade: 'B', color: '#00D4FF' };
    if (score >= 45) return { grade: 'C+', color: '#FFD700' };
    if (score >= 35) return { grade: 'C', color: '#FFD700' };
    return { grade: 'D', color: '#FF4444' };
  };

  const grade = getOverallGrade();

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Performance Dashboard
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Track accuracy, ROI, and signal performance over time
            </p>
          </div>

          {/* Overall Grade */}
          <div style={{
            backgroundColor: grade.color + '15',
            border: `2px solid ${grade.color}`,
            borderRadius: '16px',
            padding: '15px 25px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>OVERALL GRADE</div>
            <div style={{ color: grade.color, fontSize: '36px', fontWeight: 'bold' }}>{grade.grade}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {['overview', 'signals', 'tiers', 'sports', 'trends'].map(tab => (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Key Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <MetricCard
                label="Total Picks"
                value={clvStats?.totalPicks || 0}
                subValue={`${clvStats?.gradedPicks || 0} graded`}
                icon="📝"
              />
              <MetricCard
                label="Win Rate"
                value={`${clvStats?.winRate?.toFixed(1) || 0}%`}
                subValue={`${clvStats?.wins || 0}W - ${clvStats?.losses || 0}L`}
                icon="🎯"
                color={clvStats?.winRate >= 52 ? '#00FF88' : '#FFD700'}
              />
              <MetricCard
                label="Avg CLV"
                value={clvStats?.avgCLV >= 0 ? `+${clvStats?.avgCLV?.toFixed(2) || 0}` : clvStats?.avgCLV?.toFixed(2) || 0}
                subValue="points"
                icon="📈"
                color={clvStats?.avgCLV >= 0 ? '#00FF88' : '#FF4444'}
              />
              <MetricCard
                label="ROI"
                value={`${bankrollStats?.roi >= 0 ? '+' : ''}${bankrollStats?.roi?.toFixed(1) || 0}%`}
                subValue={`$${bankrollStats?.totalPnl || 0} P/L`}
                icon="💰"
                color={bankrollStats?.roi >= 0 ? '#00FF88' : '#FF4444'}
              />
              <MetricCard
                label="CLV Win Rate"
                value={`${clvStats?.positiveCLVRate?.toFixed(0) || 0}%`}
                subValue="beat closing line"
                icon="⚡"
                color={clvStats?.positiveCLVRate >= 50 ? '#00FF88' : '#FFD700'}
              />
              <MetricCard
                label="Max Drawdown"
                value={`${bankrollStats?.maxDrawdown?.toFixed(1) || 0}%`}
                subValue="peak to trough"
                icon="📉"
                color={bankrollStats?.maxDrawdown < 15 ? '#00FF88' : '#FF4444'}
              />
            </div>

            {/* Weekly Performance */}
            {weeklySummary && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                  Last 7 Days
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>RECORD</div>
                    <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                      {weeklySummary.wins}-{weeklySummary.losses}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>WIN RATE</div>
                    <div style={{
                      color: parseFloat(weeklySummary.winRate) >= 52 ? '#00FF88' : '#FFD700',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {weeklySummary.winRate}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>AVG CLV</div>
                    <div style={{
                      color: parseFloat(weeklySummary.avgCLV) >= 0 ? '#00FF88' : '#FF4444',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {weeklySummary.avgCLV >= 0 ? '+' : ''}{weeklySummary.avgCLV}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>P/L (UNITS)</div>
                    <div style={{
                      color: parseFloat(weeklySummary.profitLoss) >= 0 ? '#00FF88' : '#FF4444',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {weeklySummary.profitLoss >= 0 ? '+' : ''}{weeklySummary.profitLoss}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                💡 Insights & Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clvStats?.avgCLV > 0.5 && (
                  <InsightCard
                    type="success"
                    message="Strong CLV performance - your timing is excellent. Keep betting at current pace."
                  />
                )}
                {clvStats?.avgCLV < 0 && (
                  <InsightCard
                    type="warning"
                    message="Negative CLV suggests taking worse numbers. Focus on line shopping and earlier betting."
                  />
                )}
                {clvStats?.winRate >= 55 && (
                  <InsightCard
                    type="success"
                    message={`${clvStats.winRate.toFixed(1)}% win rate is excellent. Consider increasing unit size.`}
                  />
                )}
                {bankrollStats?.maxDrawdown >= 20 && (
                  <InsightCard
                    type="warning"
                    message="Significant drawdown detected. Consider reducing bet sizes until recovery."
                  />
                )}
                {clvStats?.totalPicks < 20 && (
                  <InsightCard
                    type="info"
                    message="Small sample size. Need 50+ picks for reliable performance analysis."
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && signalPerf && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Signal Win Rates */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Signal Win Rates
              </h3>

              {Object.keys(signalPerf.signals).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No signal data yet. Start tracking picks to see signal performance.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(signalPerf.signals)
                    .sort((a, b) => parseFloat(b[1].winRate) - parseFloat(a[1].winRate))
                    .map(([signal, data]) => (
                      <SignalRow key={signal} signal={signal} data={data} />
                    ))}
                </div>
              )}
            </div>

            {/* Signal Correlation Analysis */}
            {signalCorrelation && !signalCorrelation.error && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                  Signal Predictive Power
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '15px' }}>
                  Comparing average signal score between wins and losses. Higher difference = more predictive.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {signalCorrelation.signals?.slice(0, 8).map((s, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 140px 1fr 80px',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      backgroundColor: s.predictive ? '#00FF8810' : '#0a0a0f',
                      borderRadius: '6px'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '11px' }}>#{idx + 1}</span>
                      <span style={{ color: '#fff', textTransform: 'capitalize' }}>
                        {s.signal.replace(/_/g, ' ')}
                      </span>
                      <div style={{
                        height: '6px',
                        backgroundColor: '#333',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(Math.abs(parseFloat(s.scoreDiff)) * 5, 100)}%`,
                          height: '100%',
                          backgroundColor: parseFloat(s.scoreDiff) > 0 ? '#00FF88' : '#FF4444',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{
                        color: parseFloat(s.scoreDiff) > 3 ? '#00FF88' : parseFloat(s.scoreDiff) > 0 ? '#FFD700' : '#FF4444',
                        fontWeight: 'bold',
                        textAlign: 'right'
                      }}>
                        {s.scoreDiff > 0 ? '+' : ''}{s.scoreDiff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
              Performance by Tier
            </h3>

            {clvStats?.byTier && Object.keys(clvStats.byTier).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {Object.entries(clvStats.byTier).map(([tier, data]) => (
                  <TierCard key={tier} tier={tier} data={data} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No tier performance data yet.
              </div>
            )}

            {/* Expected vs Actual */}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
              <h4 style={{ color: '#00D4FF', margin: '0 0 10px', fontSize: '14px' }}>
                📊 Expected vs Actual Win Rates
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12px' }}>
                <div style={{ color: '#6b7280' }}>Tier</div>
                <div style={{ color: '#6b7280', textAlign: 'center' }}>Expected</div>
                <div style={{ color: '#6b7280', textAlign: 'center' }}>Actual</div>
                <div style={{ color: '#6b7280', textAlign: 'center' }}>Diff</div>

                {[
                  { tier: 'GOLDEN', expected: '62-65%', key: 'GOLDEN_CONVERGENCE' },
                  { tier: 'SUPER', expected: '58-62%', key: 'SUPER_SIGNAL' },
                  { tier: 'HARMONIC', expected: '55-58%', key: 'HARMONIC_ALIGNMENT' },
                  { tier: 'PARTIAL', expected: '52-55%', key: 'PARTIAL_ALIGNMENT' }
                ].map(t => {
                  const data = clvStats?.byTier?.[t.key];
                  const actual = data?.winRate || 0;
                  const expectedMid = t.tier === 'GOLDEN' ? 63.5 : t.tier === 'SUPER' ? 60 : t.tier === 'HARMONIC' ? 56.5 : 53.5;
                  const diff = actual - expectedMid;
                  return (
                    <React.Fragment key={t.tier}>
                      <div style={{ color: '#fff' }}>{t.tier}</div>
                      <div style={{ color: '#9ca3af', textAlign: 'center' }}>{t.expected}</div>
                      <div style={{ color: '#fff', textAlign: 'center' }}>{actual.toFixed(1)}%</div>
                      <div style={{
                        textAlign: 'center',
                        color: diff >= 0 ? '#00FF88' : '#FF4444'
                      }}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sports Tab */}
        {activeTab === 'sports' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
              Performance by Sport
            </h3>

            {clvStats?.bySport && Object.keys(clvStats.bySport).length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {Object.entries(clvStats.bySport).map(([sport, data]) => (
                  <SportCard key={sport} sport={sport} data={data} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No sport performance data yet.
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Recent Performance Trend
              </h3>

              {recentPicks.length < 5 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Need more picks to show trends.
                </div>
              ) : (
                <div>
                  {/* Simple rolling win rate visualization */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {recentPicks.slice(-30).map((pick, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: pick.result === 'WIN' ? '#00FF88'
                            : pick.result === 'LOSS' ? '#FF4444'
                            : pick.result === 'PUSH' ? '#9ca3af'
                            : '#333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: '#000',
                          fontWeight: 'bold'
                        }}
                        title={`${pick.game?.home_team || 'Unknown'} - ${pick.result || 'Pending'}`}
                      >
                        {pick.result === 'WIN' ? 'W' : pick.result === 'LOSS' ? 'L' : pick.result === 'PUSH' ? 'P' : '?'}
                      </div>
                    ))}
                  </div>

                  <div style={{ color: '#6b7280', fontSize: '12px' }}>
                    Last 30 picks: {recentPicks.filter(p => p.result === 'WIN').length}W -
                    {' '}{recentPicks.filter(p => p.result === 'LOSS').length}L -
                    {' '}{recentPicks.filter(p => p.result === 'PUSH').length}P
                  </div>
                </div>
              )}
            </div>

            {/* Streak Analysis */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Streak Analysis
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px'
              }}>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>CURRENT STREAK</div>
                  <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                    {calculateCurrentStreak(recentPicks)}
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>BEST WIN STREAK</div>
                  <div style={{ color: '#00FF88', fontSize: '24px', fontWeight: 'bold' }}>
                    {calculateBestStreak(recentPicks, 'WIN')}W
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>WORST LOSE STREAK</div>
                  <div style={{ color: '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>
                    {calculateBestStreak(recentPicks, 'LOSS')}L
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ label, value, subValue, icon, color = '#00D4FF' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  }}>
    <div style={{ fontSize: '28px' }}>{icon}</div>
    <div>
      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ color: color, fontSize: '24px', fontWeight: 'bold' }}>
        {value}
      </div>
      {subValue && (
        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
          {subValue}
        </div>
      )}
    </div>
  </div>
);

const InsightCard = ({ type, message }) => {
  const colors = {
    success: { bg: '#00FF8815', border: '#00FF8840', text: '#00FF88' },
    warning: { bg: '#FFD70015', border: '#FFD70040', text: '#FFD700' },
    info: { bg: '#00D4FF15', border: '#00D4FF40', text: '#00D4FF' }
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      padding: '12px 15px',
      backgroundColor: c.bg,
      borderRadius: '8px',
      borderLeft: `3px solid ${c.border}`,
      color: c.text,
      fontSize: '13px'
    }}>
      {message}
    </div>
  );
};

const SignalRow = ({ signal, data }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '150px 1fr 80px 60px',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0a0a0f',
    borderRadius: '8px'
  }}>
    <span style={{ color: '#fff', textTransform: 'capitalize' }}>
      {signal.replace(/_/g, ' ')}
    </span>
    <div style={{
      height: '8px',
      backgroundColor: '#333',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${Math.min(parseFloat(data.winRate), 100)}%`,
        height: '100%',
        backgroundColor: parseFloat(data.winRate) >= 55 ? '#00FF88'
          : parseFloat(data.winRate) >= 50 ? '#FFD700'
          : '#FF4444'
      }} />
    </div>
    <span style={{
      color: parseFloat(data.winRate) >= 55 ? '#00FF88'
        : parseFloat(data.winRate) >= 50 ? '#FFD700'
        : '#FF4444',
      fontWeight: 'bold',
      textAlign: 'right'
    }}>
      {data.winRate}%
    </span>
    <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>
      {data.total}
    </span>
  </div>
);

const TierCard = ({ tier, data }) => {
  const tierColors = {
    GOLDEN_CONVERGENCE: '#FFD700',
    SUPER_SIGNAL: '#00FF88',
    HARMONIC_ALIGNMENT: '#00D4FF',
    PARTIAL_ALIGNMENT: '#9ca3af'
  };

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#0a0a0f',
      borderRadius: '8px',
      borderLeft: `4px solid ${tierColors[tier] || '#9ca3af'}`
    }}>
      <div style={{
        color: tierColors[tier] || '#9ca3af',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        {tier.replace(/_/g, ' ')}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            {data.winRate?.toFixed(1) || 0}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>win rate</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            {data.wins || 0}W - {(data.total || 0) - (data.wins || 0)}L
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>
            CLV: {data.avgCLV >= 0 ? '+' : ''}{data.avgCLV?.toFixed(2) || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

const SportCard = ({ sport, data }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#0a0a0f',
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
      {sport}
    </div>
    <div style={{
      color: data.winRate >= 52 ? '#00FF88' : data.winRate >= 50 ? '#FFD700' : '#FF4444',
      fontSize: '28px',
      fontWeight: 'bold'
    }}>
      {data.winRate?.toFixed(1) || 0}%
    </div>
    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
      {data.wins || 0}W - {(data.total || 0) - (data.wins || 0)}L
    </div>
    <div style={{
      color: data.avgCLV >= 0 ? '#00FF88' : '#FF4444',
      fontSize: '12px',
      marginTop: '5px'
    }}>
      CLV: {data.avgCLV >= 0 ? '+' : ''}{data.avgCLV?.toFixed(2) || 0}
    </div>
  </div>
);

// Helper functions
const calculateCurrentStreak = (picks) => {
  const graded = picks.filter(p => p.result && p.result !== 'PUSH').reverse();
  if (graded.length === 0) return '0';

  const firstResult = graded[0].result;
  let streak = 0;
  for (const pick of graded) {
    if (pick.result === firstResult) streak++;
    else break;
  }

  return `${streak}${firstResult === 'WIN' ? 'W' : 'L'}`;
};

const calculateBestStreak = (picks, type) => {
  const graded = picks.filter(p => p.result && p.result !== 'PUSH');
  let maxStreak = 0;
  let currentStreak = 0;

  for (const pick of graded) {
    if (pick.result === type) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
};

export default PerformanceDashboard;
