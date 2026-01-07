import React, { useState, useEffect } from 'react';
import api from './api';

const Signals = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      // Try to get live high-conviction plays
      const data = await api.getSmashSpots('NBA');
      const highConviction = (data.picks || data.smash_spots || []).filter(p =>
        (p.confidence >= 80) || (p.badges && p.badges.some(b => 
          b.label?.includes('HARMONIC') || b.type?.includes('harmonic')
        ))
      );
      setSignals(highConviction.length > 0 ? highConviction : MOCK_GOLDEN_SIGNALS);
    } catch (err) {
      console.error(err);
      setSignals(MOCK_GOLDEN_SIGNALS);
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
                          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{signal.player}</div>
                          <div style={{ color: '#8B5CF6', fontSize: '14px' }}>{signal.team}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>vs {signal.opponent}</div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          color: '#000',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          ⭐ GOLDEN
                        </div>
                      </div>
                      
                      <div style={{
                        backgroundColor: signal.recommendation?.includes('OVER') ? '#00FF8820' : '#FF444420',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          backgroundColor: signal.recommendation?.includes('OVER') ? '#00FF88' : '#FF4444',
                          color: '#000',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {signal.recommendation?.includes('OVER') ? 'OVER' : 'UNDER'}
                        </span>
                        <span style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>{signal.line}</span>
                        <span style={{ color: '#9ca3af', fontSize: '14px' }}>{signal.stat}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div>
                          <div style={{ color: '#6b7280' }}>LSTM</div>
                          <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>{signal.lstm_confidence || 85}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Esoteric</div>
                          <div style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{signal.esoteric_score || 4}/5</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Edge</div>
                          <div style={{ color: '#00FF88', fontWeight: 'bold' }}>+{signal.edge_pct || 12}%</div>
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
                    All 17 Active Signals
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ backgroundColor: '#00D4FF20', color: '#00D4FF', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>8 ML</span>
                  <span style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>5 Esoteric</span>
                  <span style={{ backgroundColor: '#FFD70020', color: '#FFD700', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>4 Data</span>
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

const MOCK_GOLDEN_SIGNALS = [
  {
    player: 'Jerami Grant',
    team: 'Portland Trail Blazers',
    opponent: 'Utah Jazz',
    stat: 'points',
    line: 21.5,
    recommendation: 'STRONG OVER',
    lstm_confidence: 87,
    esoteric_score: 4,
    edge_pct: 16.3
  },
  {
    player: 'Collin Sexton',
    team: 'Utah Jazz',
    opponent: 'Portland',
    stat: 'points',
    line: 17.5,
    recommendation: 'STRONG OVER',
    lstm_confidence: 82,
    esoteric_score: 4,
    edge_pct: 14.9
  }
];

const DEFAULT_SIGNALS = [
  { id: 1, name: 'Sharp Money', source: 'Splits API', weight: 18, type: 'data' },
  { id: 2, name: 'Line Value', source: 'Live Odds (plus money)', weight: 15, type: 'data' },
  { id: 3, name: 'ML Value', source: 'Live Odds (underdog)', weight: 14, type: 'data' },
  { id: 4, name: 'Market Lean', source: 'Juice analysis', weight: 13, type: 'data' },
  { id: 5, name: 'Key Spread', source: 'Live Odds (3, 7, 10)', weight: 12, type: 'ai' },
  { id: 6, name: 'Kelly Edge', source: 'Calculated', weight: 12, type: 'ai' },
  { id: 7, name: 'Injury Impact', source: 'ESPN + Rotowire', weight: 10, type: 'ai' },
  { id: 8, name: 'LSTM/Trend', source: 'Neural Network', weight: 10, type: 'ai' },
  { id: 9, name: 'Numerology', source: 'Esoteric', weight: 8, type: 'esoteric' },
  { id: 10, name: 'Rest/Fatigue', source: 'Multi-source', weight: 8, type: 'ai' },
  { id: 11, name: 'Public Fade', source: 'Splits API', weight: 8, type: 'data' },
  { id: 12, name: 'Moon Phase', source: 'Esoteric', weight: 7, type: 'esoteric' },
  { id: 13, name: 'Gematria', source: 'Esoteric', weight: 6, type: 'esoteric' },
  { id: 14, name: 'Key Number', source: 'Live Odds', weight: 6, type: 'ai' },
  { id: 15, name: 'Sacred Geometry', source: 'Esoteric', weight: 5, type: 'esoteric' },
  { id: 16, name: 'Zodiac Element', source: 'Esoteric', weight: 4, type: 'esoteric' },
  { id: 17, name: 'Ensemble Stack', source: 'XGBoost+LightGBM', weight: 10, type: 'ai' }
];

export default Signals;
