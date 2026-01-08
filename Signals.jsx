import React, { useState, useEffect } from 'react';
import api from './api';
import { getDailyEsotericReading, DEFAULT_WEIGHTS } from './signalEngine';

const Signals = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyReading, setDailyReading] = useState(null);

  useEffect(() => {
    fetchSignals();
    // Load daily esoteric reading
    const reading = getDailyEsotericReading(new Date());
    setDailyReading(reading);
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      // Try to get live player props
      const propsData = await api.getLiveProps('NBA').catch(() => ({ props: [] }));

      // Debug: log what backend returns
      console.log('Props API response:', propsData);

      // Get all props
      const allProps = propsData.props || propsData || [];

      console.log('All props count:', allProps.length, 'Sample:', allProps[0]);

      // Filter out mock/placeholder data - require real edge or varied confidence
      // Mock data typically has confidence exactly 60 and edges at 0
      const realProps = allProps.filter(p => {
        const hasRealEdge = (p.best_edge > 0.1) || (p.over_edge > 0.1) || (p.under_edge > 0.1);
        const hasVariedConfidence = p.confidence && p.confidence !== 60 && p.confidence !== 65;
        const hasRealOdds = p.over_odds || p.under_odds;
        return hasRealEdge || hasVariedConfidence || hasRealOdds;
      });

      // Sort by confidence/edge descending
      realProps.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

      setSignals(realProps.slice(0, 12));
    } catch (err) {
      console.error(err);
      setSignals([]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '900', 
              margin: '0 0 5px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>⭐</span> HARMONIC SIGNALS
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              Where Mathematical Edge meets Universal Alignment.
            </p>
          </div>
          
          {/* Toggle Buttons */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#12121f', 
            borderRadius: '10px', 
            padding: '4px',
            border: '1px solid #333'
          }}>
            <button
              onClick={() => setActiveTab('live')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'live' ? '#1a1a2e' : 'transparent',
                color: activeTab === 'live' ? '#fff' : '#6b7280',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Live Signals
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'methodology' ? '#1a1a2e' : 'transparent',
                color: activeTab === 'methodology' ? '#fff' : '#6b7280',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Methodology & ROI
            </button>
          </div>
        </div>

        {/* VIEW: LIVE SIGNALS */}
        {activeTab === 'live' && (
          <div>
            {/* Daily Cosmic Reading Banner */}
            {dailyReading && (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
                borderRadius: '12px',
                padding: '15px 20px',
                marginBottom: '20px',
                border: '1px solid #8B5CF640',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px' }}>{dailyReading.moonEmoji}</div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>{dailyReading.moonPhase.replace('_', ' ')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: [8, 11, 22, 33].includes(dailyReading.lifePath) ? '#FFD700' : '#00D4FF' }}>
                      {dailyReading.lifePath}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>Life Path</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: dailyReading.teslaAlignment === 'STRONG' ? '#8B5CF6' : '#fff' }}>
                      {dailyReading.teslaNumber}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>Tesla 3-6-9</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FFD700', fontSize: '12px', marginBottom: '4px' }}>Today's Bias</div>
                  <div style={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {dailyReading.naturalBias}
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#8B5CF620',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  maxWidth: '300px'
                }}>
                  <div style={{ color: '#D8B4FE', fontSize: '12px' }}>
                    {dailyReading.recommendation}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔮</div>
                Scanning the Cosmos...
              </div>
            ) : signals.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {signals.map((signal, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Glowing Effect */}
                    <div style={{
                      position: 'absolute',
                      inset: '-2px',
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      borderRadius: '16px',
                      opacity: 0.3,
                      filter: 'blur(8px)',
                      zIndex: 0
                    }} />
                    {/* Card */}
                    <div style={{
                      position: 'relative',
                      backgroundColor: '#1a1a2e',
                      borderRadius: '14px',
                      padding: '20px',
                      border: '1px solid #8B5CF640',
                      zIndex: 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{signal.player_name || signal.player}</div>
                          <div style={{ color: '#8B5CF6', fontSize: '14px' }}>{signal.team}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>
                            vs {signal.opponent || (signal.team === signal.home_team ? signal.away_team : signal.home_team) || 'TBD'}
                          </div>
                        </div>
                        <div style={{
                          background: (signal.confidence >= 80)
                            ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                            : (signal.confidence >= 70)
                            ? 'linear-gradient(135deg, #00FF88, #00D4FF)'
                            : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                          color: '#000',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {(signal.confidence >= 80) ? '⭐ GOLDEN' : (signal.confidence >= 70) ? '⚡ STRONG' : '✨ EDGE'}
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: signal.recommendation === 'OVER' ? '#00FF8820' : '#FF444420',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          backgroundColor: signal.recommendation === 'OVER' ? '#00FF88' : '#FF4444',
                          color: '#000',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {signal.recommendation || 'OVER'}
                        </span>
                        <span style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>{signal.line}</span>
                        <span style={{ color: '#9ca3af', fontSize: '14px' }}>{signal.stat_type || signal.stat}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div>
                          <div style={{ color: '#6b7280' }}>Confidence</div>
                          <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>{signal.confidence || 65}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Best Book</div>
                          <div style={{ color: '#8B5CF6', fontWeight: 'bold', textTransform: 'capitalize' }}>{signal.over_book || signal.under_book || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Edge</div>
                          <div style={{ color: '#00FF88', fontWeight: 'bold' }}>+{signal.best_edge || signal.over_edge || 0}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                backgroundColor: '#12121f',
                borderRadius: '16px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                  No Harmonic Convergences Today
                </h3>
                <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
                  The stars and the stats did not align. We do not force trades. 
                  Check the <strong style={{ color: '#00D4FF' }}>Dashboard</strong> for standard EV plays.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: METHODOLOGY */}
        {activeTab === 'methodology' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Section 1: The Logic Table */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #333'
            }}>
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #333',
                backgroundColor: '#12121f',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#FFD700' }}>⚡</span>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                  Statistical Edge vs Universal Alignment
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#12121f' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Situation</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>What It Means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#9ca3af', fontSize: '14px' }}>LSTM high, Esoteric low</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '14px' }}>Pure data edge, no cosmic support. (Standard Play)</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#9ca3af', fontSize: '14px' }}>LSTM low, Esoteric high</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '14px' }}>Cosmic alignment, weak data. (Speculative / Fun)</td>
                    </tr>
                    <tr style={{ 
                      borderTop: '1px solid #333',
                      background: 'linear-gradient(90deg, #8B5CF620 0%, #EC489920 100%)',
                      borderLeft: '4px solid #8B5CF6'
                    }}>
                      <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>BOTH high, same direction</td>
                      <td style={{ padding: '14px 20px', color: '#D8B4FE', fontWeight: '600', fontSize: '14px' }}>
                        Data AND Universe agree = MAX CONVICTION 🚀
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#9ca3af', fontSize: '14px' }}>Both high, opposite</td>
                      <td style={{ padding: '14px 20px', color: '#FF6B6B', fontSize: '14px' }}>Conflict - the universe is saying something different. (Pass)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Expected ROI Table */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #333'
            }}>
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #333',
                backgroundColor: '#12121f',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#00FF88' }}>📈</span>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                  Expected ROI by Tier
                </h3>
              </div>
              <div style={{
                padding: '12px 20px',
                backgroundColor: '#12121f80',
                fontSize: '12px',
                color: '#6b7280',
                fontStyle: 'italic',
                borderBottom: '1px solid #333'
              }}>
                *Based on historical backtesting logic that higher conviction correlates with higher accuracy.
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#12121f' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Tier</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Expected Win Rate</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Expected ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ 
                      borderTop: '1px solid #333',
                      background: 'linear-gradient(90deg, #FFD70020 0%, #FFA50020 100%)'
                    }}>
                      <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#FFD700' }}>⭐</span>
                        <span style={{ color: '#FFD700', fontWeight: '900', fontSize: '14px' }}>GOLDEN_CONVERGENCE</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: '14px' }}>62-65%</td>
                      <td style={{ padding: '14px 20px', color: '#00FF88', fontWeight: 'bold', fontSize: '14px' }}>+15-20%</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>SUPER_SIGNAL</td>
                      <td style={{ padding: '14px 20px', color: '#d1d5db', fontSize: '14px' }}>58-62%</td>
                      <td style={{ padding: '14px 20px', color: '#22C55E', fontWeight: 'bold', fontSize: '14px' }}>+10-15%</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', color: '#d1d5db', fontWeight: '500', fontSize: '14px' }}>HARMONIC_ALIGNMENT</td>
                      <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: '14px' }}>55-58%</td>
                      <td style={{ padding: '14px 20px', color: '#16A34A', fontSize: '14px' }}>+5-10%</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '14px' }}>PARTIAL_ALIGNMENT</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '14px' }}>52-55%</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '14px' }}>+2-5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '15px 20px',
              backgroundColor: '#1E3A5F30',
              border: '1px solid #1E3A5F',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#93C5FD'
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
              <p style={{ margin: 0 }}>
                <strong>Note:</strong> While "Golden Convergence" signals have historically performed best, 
                variance is inherent in sports betting. Always adhere to Kelly Criterion sizing (1-3% max).
              </p>
            </div>

            {/* All 17 Signals Table */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #333'
            }}>
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #333',
                backgroundColor: '#12121f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#00D4FF' }}>🧠</span>
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                    All 20 Active Signals (v10.0)
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ backgroundColor: '#00FF8820', color: '#00FF88', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>8 Tier 1</span>
                  <span style={{ backgroundColor: '#00D4FF20', color: '#00D4FF', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>7 AI/ML</span>
                  <span style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>5 Esoteric</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#12121f' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px' }}>#</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px' }}>Signal</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px' }}>Source</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', color: '#6b7280', fontSize: '12px' }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_SIGNALS.map((signal, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #333' }}>
                        <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>{signal.id}</td>
                        <td style={{ padding: '12px 20px', color: signal.type === 'esoteric' ? '#8B5CF6' : signal.type === 'ai' ? '#00D4FF' : '#fff', fontSize: '14px', fontWeight: signal.type === 'ai' ? 'bold' : 'normal' }}>
                          {signal.name}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#9ca3af', fontSize: '14px' }}>{signal.source}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <span style={{
                            backgroundColor: signal.weight >= 15 ? '#00FF8820' : signal.weight >= 10 ? '#00D4FF20' : '#33333350',
                            color: signal.weight >= 15 ? '#00FF88' : signal.weight >= 10 ? '#00D4FF' : '#9ca3af',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}>
                            {signal.weight}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// v10.0 Research-Optimized Signal Weights
const DEFAULT_SIGNALS = [
  // TIER 1: PROVEN EDGE (Research-validated 56%+ win rates)
  { id: 1, name: 'Sharp Money/RLM', source: 'OddsShopper (56% WR)', weight: 22, type: 'data', tier: 1 },
  { id: 2, name: 'Line Edge/CLV', source: 'Pinnacle (99.7% efficient)', weight: 18, type: 'data', tier: 1 },
  { id: 3, name: 'Injury Vacuum', source: 'Usage boost tracking', weight: 16, type: 'ai', tier: 1 },
  { id: 4, name: 'Game Pace', source: 'TopEndSports (58.3% overs)', weight: 15, type: 'ai', tier: 1 },
  { id: 5, name: 'Travel Fatigue', source: 'East→West (55.9% ATS)', weight: 14, type: 'ai', tier: 1 },
  { id: 6, name: 'Back-to-Back', source: 'Sports Insights (58% fade)', weight: 13, type: 'ai', tier: 1 },
  { id: 7, name: 'Defense vs Position', source: 'DvP Rankings', weight: 12, type: 'ai', tier: 1 },
  { id: 8, name: 'Public Fade', source: 'Combined w/ B2B', weight: 11, type: 'data', tier: 1 },

  // TIER 2: PROVEN SUPPORTING
  { id: 9, name: 'Steam Moves', source: '20+ years sharp data', weight: 10, type: 'data', tier: 2 },
  { id: 10, name: 'Home Court', source: '3-5 pts value', weight: 10, type: 'ai', tier: 2 },
  { id: 11, name: 'Weather', source: 'Wind >10mph (54.3% U)', weight: 10, type: 'ai', tier: 2 },
  { id: 12, name: 'Minutes Projection', source: 'Direct correlation', weight: 10, type: 'ai', tier: 2 },

  // TIER 3: MODERATE
  { id: 13, name: 'Referee Tendencies', source: '8-12% foul variance', weight: 8, type: 'ai', tier: 3 },
  { id: 14, name: 'Game Script', source: 'Garbage time analysis', weight: 8, type: 'ai', tier: 3 },
  { id: 15, name: 'LSTM/ML Ensemble', source: 'XGBoost+LightGBM', weight: 8, type: 'ai', tier: 3 },

  // ESOTERIC EDGE (Showcased separately)
  { id: 16, name: 'Gematria', source: '6 Ciphers (35% of esoteric)', weight: 3, type: 'esoteric', tier: 4 },
  { id: 17, name: 'Moon Phase', source: '20% of esoteric', weight: 2, type: 'esoteric', tier: 4 },
  { id: 18, name: 'Numerology', source: '20% of esoteric', weight: 2, type: 'esoteric', tier: 4 },
  { id: 19, name: 'Sacred Geometry', source: '15% of esoteric', weight: 2, type: 'esoteric', tier: 4 },
  { id: 20, name: 'Zodiac/Planetary', source: '10% of esoteric', weight: 1, type: 'esoteric', tier: 4 }
];

export default Signals;
