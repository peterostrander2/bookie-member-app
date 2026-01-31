/**
 * BACKTEST DASHBOARD
 *
 * The science lab for your betting system.
 * Analyze signal performance, test weight configurations,
 * and prove your edge with data.
 */

import React, { useState, useEffect } from 'react';
import {
  getSignalPerformance,
  getWeeklySummary,
  analyzeSignalCorrelation,
  runBacktest,
  recordWeightTest,
  getWeightTests,
  getAllPredictions
} from './backtestStorage';
import { DEFAULT_WEIGHTS } from './signalEngine';

const BacktestDashboard = () => {
  const [activeTab, setActiveTab] = useState('signals');
  const [signalPerf, setSignalPerf] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [weightTests, setWeightTests] = useState([]);
  const [testWeights, setTestWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [backtestResult, setBacktestResult] = useState(null);
  const [predictionCount, setPredictionCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSignalPerf(getSignalPerformance());
    setWeeklySummary(getWeeklySummary());
    setCorrelation(analyzeSignalCorrelation());
    setWeightTests(getWeightTests());
    setPredictionCount(getAllPredictions().length);
  };

  const handleRunBacktest = () => {
    const result = runBacktest(testWeights);
    setBacktestResult(result);

    if (!result.error) {
      recordWeightTest(testWeights, result);
      setWeightTests(getWeightTests());
    }
  };

  const handleWeightChange = (signal, value) => {
    setTestWeights(prev => ({
      ...prev,
      [signal]: parseInt(value) || 0
    }));
  };

  const resetWeights = () => {
    setTestWeights({ ...DEFAULT_WEIGHTS });
    setBacktestResult(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔬 Backtest Lab
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            {predictionCount} predictions tracked • Analyze and optimize your signals
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {['signals', 'correlation', 'weights', 'history'].map(tab => (
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

        {/* Weekly Summary */}
        {weeklySummary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '25px'
          }}>
            <StatCard label="7-Day Record" value={`${weeklySummary.wins}-${weeklySummary.losses}`} />
            <StatCard
              label="Win Rate"
              value={`${weeklySummary.winRate}%`}
              color={parseFloat(weeklySummary.winRate) >= 52 ? '#00FF88' : '#9ca3af'}
            />
            <StatCard
              label="Avg CLV"
              value={weeklySummary.avgCLV >= 0 ? `+${weeklySummary.avgCLV}` : weeklySummary.avgCLV}
              color={parseFloat(weeklySummary.avgCLV) >= 0 ? '#00FF88' : '#FF4444'}
            />
            <StatCard
              label="P/L (Units)"
              value={weeklySummary.profitLoss >= 0 ? `+${weeklySummary.profitLoss}` : weeklySummary.profitLoss}
              color={parseFloat(weeklySummary.profitLoss) >= 0 ? '#00FF88' : '#FF4444'}
            />
          </div>
        )}

        {/* Signal Performance Tab */}
        {activeTab === 'signals' && signalPerf && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Signal Performance Table */}
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
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
                  No graded predictions yet. Start tracking picks to see signal performance.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(signalPerf.signals)
                    .sort((a, b) => parseFloat(b[1].winRate) - parseFloat(a[1].winRate))
                    .map(([signal, data]) => (
                      <div key={signal} style={{
                        display: 'grid',
                        gridTemplateColumns: '150px 1fr 80px 60px',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        backgroundColor: '#0a0a0f',
                        borderRadius: '6px'
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
                              : '#FF4444',
                            borderRadius: '4px'
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
                          {data.total} picks
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tier Performance */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Tier Performance
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(signalPerf.tiers).map(([tier, data]) => (
                  <div key={tier} style={{
                    padding: '15px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      color: tier === 'GOLDEN_CONVERGENCE' ? '#FFD700'
                        : tier === 'SUPER_SIGNAL' ? '#00FF88'
                        : tier === 'HARMONIC_ALIGNMENT' ? '#00D4FF'
                        : '#9ca3af',
                      fontSize: '12px',
                      marginBottom: '8px'
                    }}>
                      {tier.replace(/_/g, ' ')}
                    </div>
                    <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                      {data.winRate}%
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {data.wins}W - {data.total - data.wins}L • CLV: {data.avgCLV >= 0 ? '+' : ''}{data.avgCLV}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Correlation Tab */}
        {activeTab === 'correlation' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
              Signal Correlation with Winning
            </h3>

            {correlation?.error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
                {correlation.error}
              </div>
            ) : correlation?.signals ? (
              <>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
                  Signals ranked by predictive power (avg score difference between wins and losses)
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {correlation.signals.map((signal) => (
                    <div key={signal.signal} style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 150px 1fr 80px 80px 80px',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      backgroundColor: signal.predictive ? '#00FF8810' : '#0a0a0f',
                      borderRadius: '6px',
                      border: signal.predictive ? '1px solid #00FF8830' : 'none'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        #{signal.rank}
                      </span>
                      <span style={{ color: '#fff', textTransform: 'capitalize' }}>
                        {signal.signal.replace(/_/g, ' ')}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#00FF88', fontSize: '12px' }}>
                          Win: {signal.avgWinScore}
                        </span>
                        <span style={{ color: '#6b7280' }}>→</span>
                        <span style={{ color: '#FF4444', fontSize: '12px' }}>
                          Loss: {signal.avgLossScore}
                        </span>
                      </div>
                      <span style={{
                        color: parseFloat(signal.scoreDiff) > 5 ? '#00FF88'
                          : parseFloat(signal.scoreDiff) > 0 ? '#FFD700'
                          : '#FF4444',
                        fontWeight: 'bold',
                        textAlign: 'right'
                      }}>
                        {signal.scoreDiff > 0 ? '+' : ''}{signal.scoreDiff}
                      </span>
                      <span style={{
                        color: signal.predictive ? '#00FF88' : '#9ca3af',
                        fontSize: '11px',
                        textAlign: 'right'
                      }}>
                        {signal.predictive ? '✓ Predictive' : 'Weak'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading correlation data...
              </div>
            )}
          </div>
        )}

        {/* Weight Testing Tab */}
        {activeTab === 'weights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
                  Test Weight Configuration
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={resetWeights}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={handleRunBacktest}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#00D4FF',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    Run Backtest
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(testWeights).map(([signal, weight]) => (
                  <div key={signal} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '6px'
                  }}>
                    <label htmlFor={`backtest-weight-${signal}`} style={{ color: '#9ca3af', flex: 1, fontSize: '12px', textTransform: 'capitalize' }}>
                      {signal.replace(/_/g, ' ')}
                    </label>
                    <input
                      id={`backtest-weight-${signal}`}
                      name={`backtestWeight-${signal}`}
                      type="number"
                      min="0"
                      max="30"
                      value={weight}
                      onChange={(e) => handleWeightChange(signal, e.target.value)}
                      style={{
                        width: '50px',
                        padding: '5px',
                        backgroundColor: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Backtest Result */}
            {backtestResult && (
              <div style={{
                backgroundColor: backtestResult.error ? '#FF444420' : '#00FF8820',
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${backtestResult.error ? '#FF444440' : '#00FF8840'}`
              }}>
                {backtestResult.error ? (
                  <div style={{ color: '#FF4444' }}>{backtestResult.error}</div>
                ) : (
                  <>
                    <h4 style={{ color: '#00FF88', margin: '0 0 15px' }}>Backtest Results</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>Total Picks</div>
                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                          {backtestResult.totalPicks}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>Record</div>
                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                          {backtestResult.wins}-{backtestResult.losses}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>Win Rate</div>
                        <div style={{
                          color: parseFloat(backtestResult.winRate) >= 52 ? '#00FF88' : '#FFD700',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {backtestResult.winRate}%
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>Avg CLV</div>
                        <div style={{
                          color: parseFloat(backtestResult.avgCLV) >= 0 ? '#00FF88' : '#FF4444',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {backtestResult.avgCLV >= 0 ? '+' : ''}{backtestResult.avgCLV}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>P/L (Units)</div>
                        <div style={{
                          color: parseFloat(backtestResult.profitLoss) >= 0 ? '#00FF88' : '#FF4444',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {backtestResult.profitLoss >= 0 ? '+' : ''}{backtestResult.profitLoss}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
              Weight Test History
            </h3>

            {weightTests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧪</div>
                No weight tests yet. Use the Weights tab to run backtests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {weightTests.slice().reverse().map((test) => (
                  <div key={test.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 80px 80px 80px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                      {new Date(test.timestamp).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {Object.entries(test.weights)
                        .filter(([_, w]) => w > 10)
                        .map(([s, w]) => `${s.slice(0, 5)}:${w}`)
                        .join(', ')}
                    </span>
                    <span style={{ color: '#fff', textAlign: 'right' }}>
                      {test.results.wins}-{test.results.totalPicks - test.results.wins}
                    </span>
                    <span style={{
                      color: parseFloat(test.results.winRate) >= 52 ? '#00FF88' : '#9ca3af',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }}>
                      {test.results.winRate}%
                    </span>
                    <span style={{
                      color: parseFloat(test.results.profitLoss) >= 0 ? '#00FF88' : '#FF4444',
                      textAlign: 'right'
                    }}>
                      {test.results.profitLoss >= 0 ? '+' : ''}{test.results.profitLoss}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = '#00D4FF' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ color: color, fontSize: '22px', fontWeight: 'bold' }}>
      {value}
    </div>
  </div>
);

export default BacktestDashboard;
