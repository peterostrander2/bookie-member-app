/**
 * SMASH SPOTS ENHANCED v2.0
 *
 * Comprehensive pick display with:
 * - Larger cards with expand/collapse
 * - All 17 signals at a glance
 * - Signal breakdown with weights and explanations
 * - Confidence score visualization (circular progress)
 * - Historical performance tracking
 * - Pick comparison feature
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from './api';
import { calculateConfidence, fetchSignalContext, getTierInfo, getRecommendationDisplay, DEFAULT_WEIGHTS } from './signalEngine';
import { recordPick, getAllPicks } from './clvTracker';
import { explainPick, quickExplain } from './pickExplainer';
import { analyzeCorrelation } from './correlationDetector';
import { ConsensusMeter, ConsensusMiniBadge, calculateConsensus } from './ConsensusMeter';
import CommunityVote from './CommunityVote';
import { GameCardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated, LiveBadge, RefreshIntervalSelector } from './LiveIndicators';

// ============================================================================
// SIGNAL DEFINITIONS
// ============================================================================

const SIGNAL_INFO = {
  sharp_money: {
    name: 'Sharp Money',
    category: 'data',
    icon: '🦈',
    description: 'Professional bettor action detected on this side. Sharps typically have a 54-56% long-term win rate.',
    weight: 22
  },
  line_edge: {
    name: 'Line Edge',
    category: 'data',
    icon: '📈',
    description: 'Better odds than market average. Every 0.5 points in line value adds ~2% to expected value.',
    weight: 18
  },
  injury_vacuum: {
    name: 'Injury Impact',
    category: 'data',
    icon: '🏥',
    description: 'Key player absence creates opportunity. Usage vacuum leads to predictable stat redistributions.',
    weight: 16
  },
  game_pace: {
    name: 'Game Pace',
    category: 'ml',
    icon: '⚡',
    description: 'Pace-adjusted projections factoring team tempo. Faster pace = more possessions = higher variance.',
    weight: 15
  },
  travel_fatigue: {
    name: 'Travel Fatigue',
    category: 'data',
    icon: '✈️',
    description: 'Distance traveled and timezone changes. Teams crossing 2+ time zones show measurable decline.',
    weight: 14
  },
  back_to_back: {
    name: 'Back-to-Back',
    category: 'data',
    icon: '😴',
    description: 'Second game in two nights. NBA teams are 2-3% worse ATS on B2B, especially on the road.',
    weight: 13
  },
  defense_vs_position: {
    name: 'Defense Matchup',
    category: 'ml',
    icon: '🛡️',
    description: 'Team defensive efficiency against specific positions. Exploits predictable defensive weaknesses.',
    weight: 12
  },
  public_fade: {
    name: 'Public Fade',
    category: 'data',
    icon: '📊',
    description: 'Going against heavy public betting. When >65% public on one side, fading has been profitable.',
    weight: 11
  },
  steam_moves: {
    name: 'Steam Moves',
    category: 'data',
    icon: '🚂',
    description: 'Rapid line movement from coordinated sharp action. Often signals insider information.',
    weight: 10
  },
  home_court: {
    name: 'Home Court',
    category: 'data',
    icon: '🏟️',
    description: 'Home advantage factor adjusted by sport and venue. NBA ~3pts, NFL ~2.5pts average.',
    weight: 10
  },
  mid_spread_zone: {
    name: 'Mid-Spread Zone',
    category: 'jarvis',
    icon: '🎯',
    description: 'Goldilocks zone (+4 to +9). JARVIS Savant edge: These spreads hit 54.2% historically.',
    weight: 12
  },
  large_spread_trap: {
    name: 'Large Spread Trap',
    category: 'jarvis',
    icon: '⚠️',
    description: 'Warning for spreads >15pts. High variance, garbage time issues. JARVIS avoids these.',
    weight: 10
  },
  nhl_dog_protocol: {
    name: 'NHL Dog Protocol',
    category: 'jarvis',
    icon: '🐕',
    description: 'Puck line underdogs with public fade. NHL-specific JARVIS edge with 56%+ hit rate.',
    weight: 14
  },
  weather: {
    name: 'Weather',
    category: 'data',
    icon: '🌧️',
    description: 'Wind, precipitation, temperature impact. Most significant in outdoor sports (NFL, MLB).',
    weight: 10
  },
  referee: {
    name: 'Referee Tendency',
    category: 'data',
    icon: '🦓',
    description: 'Historical officiating patterns. Some refs consistently call more/fewer fouls.',
    weight: 8
  },
  key_spread: {
    name: 'Key Numbers',
    category: 'data',
    icon: '🔢',
    description: 'NFL: 3, 7 are most common margins. NBA: 5-7 points. Getting the right side of key numbers is crucial.',
    weight: 8
  },
  ensemble_ml: {
    name: 'ML Ensemble',
    category: 'ml',
    icon: '🤖',
    description: 'XGBoost, LightGBM, and CatBoost model consensus. When all agree, confidence increases.',
    weight: 6
  },
  lstm_trend: {
    name: 'LSTM Trend',
    category: 'ml',
    icon: '🧠',
    description: 'Neural network detecting momentum patterns. Identifies streaks and regression candidates.',
    weight: 5
  },
  moon_phase: {
    name: 'Moon Phase',
    category: 'esoteric',
    icon: '🌙',
    description: 'Full/New moon energy. Historical data shows slight correlation with upset frequency.',
    weight: 1
  },
  numerology: {
    name: 'Numerology',
    category: 'esoteric',
    icon: '🔮',
    description: 'Power number days (8, 11, 22, 33). Master numbers correlate with unexpected outcomes.',
    weight: 1
  },
  gematria: {
    name: 'Gematria',
    category: 'esoteric',
    icon: '✡️',
    description: 'Team name value alignment. Sacred numbers (33, 93, 201, 322, 2178) trigger alerts.',
    weight: 1
  },
  sacred_geometry: {
    name: 'Sacred Geometry',
    category: 'esoteric',
    icon: '📐',
    description: 'Fibonacci and golden ratio patterns in stats. When numbers align, energy flows.',
    weight: 1
  },
  zodiac: {
    name: 'Zodiac Energy',
    category: 'esoteric',
    icon: '♈',
    description: 'Planetary alignment influence. Mercury retrograde, Venus transits affect outcomes.',
    weight: 1
  }
};

const SIGNAL_CATEGORIES = {
  data: { name: 'Data-Driven', color: '#00D4FF', description: 'Market data, sharp action, betting trends' },
  ml: { name: 'Machine Learning', color: '#9333EA', description: 'AI models, neural networks, ensemble predictions' },
  jarvis: { name: 'JARVIS Savant', color: '#FFD700', description: '+94.40u YTD proven system edges' },
  esoteric: { name: 'Esoteric Edge', color: '#FF6B6B', description: 'Gematria, numerology, cosmic alignment' }
};

// ============================================================================
// HISTORICAL PERFORMANCE DATABASE (Mock)
// ============================================================================

const getHistoricalPerformance = (signals, confidence, tier) => {
  // In a real app, this would query a database of past picks
  // For demo, generate realistic historical data based on tier
  const tierHitRates = {
    GOLDEN_CONVERGENCE: { hitRate: 73, sampleSize: 124, roi: 18.4 },
    HARMONIC_ALIGNMENT: { hitRate: 68, sampleSize: 287, roi: 12.1 },
    SUPER_SIGNAL: { hitRate: 65, sampleSize: 456, roi: 9.2 },
    STRONG_PLAY: { hitRate: 61, sampleSize: 892, roi: 6.8 },
    SOLID_LEAN: { hitRate: 57, sampleSize: 1203, roi: 3.4 },
    MARGINAL_EDGE: { hitRate: 54, sampleSize: 1567, roi: 1.2 },
    SKIP: { hitRate: 48, sampleSize: 2134, roi: -4.5 }
  };

  const tierData = tierHitRates[tier] || tierHitRates.MARGINAL_EDGE;

  // Generate similar matchup data
  const similarMatchups = [];
  const matchupCount = Math.floor(Math.random() * 5) + 3;

  for (let i = 0; i < matchupCount; i++) {
    const won = Math.random() < tierData.hitRate / 100;
    similarMatchups.push({
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      matchup: `Team ${String.fromCharCode(65 + i)} vs Team ${String.fromCharCode(75 + i)}`,
      confidence: confidence - 5 + Math.floor(Math.random() * 10),
      result: won ? 'WIN' : 'LOSS',
      line: won ? `+${(Math.random() * 3).toFixed(1)}u` : `-1.0u`
    });
  }

  return {
    hitRate: tierData.hitRate,
    sampleSize: tierData.sampleSize,
    roi: tierData.roi,
    similarMatchups,
    trend: Math.random() > 0.3 ? 'up' : 'down',
    lastTenRecord: `${Math.floor(tierData.hitRate / 10)}-${10 - Math.floor(tierData.hitRate / 10)}`
  };
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#0a0a0f',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '20px',
    transition: 'all 0.3s ease'
  },
  cardExpanded: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)'
  },
  cardHeader: {
    padding: '24px',
    cursor: 'pointer'
  },
  cardBody: {
    padding: '0 24px 24px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  confidenceRing: {
    position: 'relative',
    width: '120px',
    height: '120px',
    flexShrink: 0
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  signalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tabActive: {
    backgroundColor: '#00D4FF',
    color: '#000',
    border: 'none',
    fontWeight: 'bold'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00D4FF 0%, #00FF88 100%)',
    color: '#000'
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)'
  }
};

// ============================================================================
// CIRCULAR CONFIDENCE INDICATOR
// ============================================================================

const ConfidenceRing = ({ confidence, tier, size = 120 }) => {
  const tierInfo = getTierInfo(tier);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const getColor = () => {
    if (confidence >= 80) return '#00FF88';
    if (confidence >= 70) return '#00D4FF';
    if (confidence >= 60) return '#FFD700';
    return '#FF6B6B';
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#333"
          strokeWidth="8"
        />
        {/* Animated progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 6px ${getColor()})`
          }}
        />
        {/* Tier indicator dots */}
        {[80, 70, 60].map((threshold, idx) => {
          const angle = (threshold / 100) * 360 - 90;
          const x = size / 2 + radius * Math.cos((angle * Math.PI) / 180);
          const y = size / 2 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <circle
              key={threshold}
              cx={x}
              cy={y}
              r="3"
              fill={confidence >= threshold ? getColor() : '#444'}
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: size > 100 ? '36px' : '24px',
          fontWeight: 'bold',
          color: getColor(),
          lineHeight: 1
        }}>
          {confidence}%
        </div>
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {tierInfo.label}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SIGNAL BREAKDOWN COMPONENT
// ============================================================================

const SignalBreakdown = ({ signals, allSignals, onSignalClick }) => {
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Create a map of all signals with their scores
  const signalMap = useMemo(() => {
    const map = {};
    Object.keys(SIGNAL_INFO).forEach(key => {
      map[key] = { score: 50, active: false };
    });
    (allSignals || signals || []).forEach(s => {
      const key = s.name;
      if (map[key]) {
        map[key] = { score: s.score, active: s.score !== 50 };
      }
    });
    return map;
  }, [signals, allSignals]);

  const handleSignalClick = (signalKey) => {
    setSelectedSignal(selectedSignal === signalKey ? null : signalKey);
    if (onSignalClick) onSignalClick(signalKey);
  };

  const getSignalColor = (score) => {
    if (score >= 70) return '#00FF88';
    if (score >= 55) return '#00D4FF';
    if (score === 50) return '#6b7280';
    return '#FF6B6B';
  };

  const getSignalIndicator = (score) => {
    if (score >= 55) return { icon: '✅', text: 'Supports' };
    if (score <= 45) return { icon: '❌', text: 'Against' };
    return { icon: '➖', text: 'Neutral' };
  };

  // Group signals by category
  const groupedSignals = useMemo(() => {
    const groups = { data: [], ml: [], jarvis: [], esoteric: [] };
    Object.entries(SIGNAL_INFO).forEach(([key, info]) => {
      groups[info.category].push({ key, ...info, ...signalMap[key] });
    });
    return groups;
  }, [signalMap]);

  return (
    <div>
      {Object.entries(SIGNAL_CATEGORIES).map(([catKey, category]) => (
        <div key={catKey} style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '4px',
              height: '20px',
              backgroundColor: category.color,
              borderRadius: '2px'
            }} />
            <div>
              <div style={{ color: category.color, fontWeight: 'bold', fontSize: '14px' }}>
                {category.name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>
                {category.description}
              </div>
            </div>
          </div>

          <div style={styles.signalGrid}>
            {groupedSignals[catKey].map(signal => {
              const indicator = getSignalIndicator(signal.score);
              const isSelected = selectedSignal === signal.key;

              return (
                <div
                  key={signal.key}
                  onClick={() => handleSignalClick(signal.key)}
                  style={{
                    ...styles.signalItem,
                    backgroundColor: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #00D4FF' : '1px solid transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{signal.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '2px'
                    }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                        {signal.name}
                      </span>
                      <span style={{ fontSize: '12px' }}>{indicator.icon}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: getSignalColor(signal.score), fontWeight: 'bold' }}>
                        {signal.score}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        Weight: {signal.weight}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signal Detail Modal */}
          {selectedSignal && SIGNAL_INFO[selectedSignal]?.category === catKey && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: 'rgba(0,212,255,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0,212,255,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{SIGNAL_INFO[selectedSignal].icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    {SIGNAL_INFO[selectedSignal].name}
                  </div>
                  <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
                    {SIGNAL_INFO[selectedSignal].description}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '10px' }}>CURRENT SCORE</div>
                      <div style={{
                        color: getSignalColor(signalMap[selectedSignal].score),
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        {signalMap[selectedSignal].score}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '10px' }}>BASE WEIGHT</div>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                        {SIGNAL_INFO[selectedSignal].weight}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '10px' }}>STATUS</div>
                      <div style={{ color: '#fff', fontSize: '18px' }}>
                        {getSignalIndicator(signalMap[selectedSignal].score).icon} {getSignalIndicator(signalMap[selectedSignal].score).text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// HISTORICAL PERFORMANCE COMPONENT
// ============================================================================

const HistoricalPerformance = ({ historical }) => {
  if (!historical) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(0,255,136,0.05)',
      border: '1px solid rgba(0,255,136,0.2)',
      borderRadius: '12px',
      padding: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>📊</span>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>Historical Performance</span>
      </div>

      {/* Main Stat */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'rgba(0,255,136,0.1)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#00FF88'
          }}>
            {historical.hitRate}%
          </div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>Hit Rate</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            color: '#e5e7eb',
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            Picks like this have hit <span style={{ color: '#00FF88', fontWeight: 'bold' }}>{historical.hitRate}%</span> historically
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: '#9ca3af' }}>
              Sample: <span style={{ color: '#fff' }}>{historical.sampleSize}</span> picks
            </span>
            <span style={{ color: '#9ca3af' }}>
              ROI: <span style={{ color: historical.roi > 0 ? '#00FF88' : '#FF6B6B' }}>
                {historical.roi > 0 ? '+' : ''}{historical.roi}%
              </span>
            </span>
            <span style={{ color: '#9ca3af' }}>
              Last 10: <span style={{ color: '#fff' }}>{historical.lastTenRecord}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Similar Matchups */}
      <div>
        <div style={{
          color: '#9ca3af',
          fontSize: '12px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Similar Matchups
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {historical.similarMatchups.map((match, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <span style={{ color: '#6b7280', width: '80px' }}>{match.date}</span>
              <span style={{ color: '#fff', flex: 1 }}>{match.matchup}</span>
              <span style={{ color: '#9ca3af', width: '50px' }}>{match.confidence}%</span>
              <span style={{
                width: '50px',
                textAlign: 'center',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: match.result === 'WIN' ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)',
                color: match.result === 'WIN' ? '#00FF88' : '#FF6B6B'
              }}>
                {match.result}
              </span>
              <span style={{
                color: match.line.includes('+') ? '#00FF88' : '#FF6B6B',
                width: '50px',
                textAlign: 'right'
              }}>
                {match.line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PICK COMPARISON COMPONENT
// ============================================================================

const PickComparison = ({ picks, onClose }) => {
  const [selectedPicks, setSelectedPicks] = useState([]);

  const togglePick = (pick) => {
    if (selectedPicks.find(p => p.id === pick.id)) {
      setSelectedPicks(selectedPicks.filter(p => p.id !== pick.id));
    } else if (selectedPicks.length < 3) {
      setSelectedPicks([...selectedPicks, pick]);
    }
  };

  const getSignalScore = (pick, signalName) => {
    const analysis = pick.bestPick === 'spread' ? pick.spreadAnalysis : pick.totalAnalysis;
    const signal = (analysis?.signals || []).find(s => s.name === signalName);
    return signal?.score || 50;
  };

  const compareSignals = ['sharp_money', 'line_edge', 'public_fade', 'ensemble_ml', 'injury_vacuum'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Compare Picks (Select up to 3)</h2>
          <button
            onClick={onClose}
            style={{
              ...styles.button,
              ...styles.secondaryButton
            }}
          >
            Close
          </button>
        </div>

        {/* Pick Selection */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}>
          {picks.map(pick => {
            const isSelected = selectedPicks.find(p => p.id === pick.id);
            const mainPick = pick.bestPick === 'spread' ? pick.spreadEdge : pick.totalEdge;
            return (
              <button
                key={pick.id}
                onClick={() => togglePick(pick)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isSelected ? 'rgba(0,212,255,0.2)' : '#1a1a2e',
                  border: isSelected ? '2px solid #00D4FF' : '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {pick.away_team} @ {pick.home_team}
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                  {mainPick.confidence}% • {pick.bestPick.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        {selectedPicks.length >= 2 && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9ca3af', borderBottom: '1px solid #333' }}>
                    Metric
                  </th>
                  {selectedPicks.map(pick => (
                    <th key={pick.id} style={{
                      textAlign: 'center',
                      padding: '12px',
                      color: '#fff',
                      borderBottom: '1px solid #333'
                    }}>
                      {pick.away_team} @ {pick.home_team}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Overall Confidence */}
                <tr>
                  <td style={{ padding: '12px', color: '#9ca3af', borderBottom: '1px solid #222' }}>
                    Overall Confidence
                  </td>
                  {selectedPicks.map(pick => {
                    const mainPick = pick.bestPick === 'spread' ? pick.spreadEdge : pick.totalEdge;
                    const isHighest = mainPick.confidence === Math.max(...selectedPicks.map(p =>
                      (p.bestPick === 'spread' ? p.spreadEdge : p.totalEdge).confidence
                    ));
                    return (
                      <td key={pick.id} style={{
                        textAlign: 'center',
                        padding: '12px',
                        borderBottom: '1px solid #222',
                        color: isHighest ? '#00FF88' : '#fff',
                        fontWeight: isHighest ? 'bold' : 'normal',
                        fontSize: '18px'
                      }}>
                        {mainPick.confidence}%
                        {isHighest && <span style={{ marginLeft: '8px' }}>👑</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* Tier */}
                <tr>
                  <td style={{ padding: '12px', color: '#9ca3af', borderBottom: '1px solid #222' }}>
                    Tier
                  </td>
                  {selectedPicks.map(pick => {
                    const mainPick = pick.bestPick === 'spread' ? pick.spreadEdge : pick.totalEdge;
                    const tierInfo = getTierInfo(mainPick.tier);
                    return (
                      <td key={pick.id} style={{
                        textAlign: 'center',
                        padding: '12px',
                        borderBottom: '1px solid #222'
                      }}>
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: tierInfo.color + '20',
                          color: tierInfo.color,
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {tierInfo.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Key Signals */}
                {compareSignals.map(signalName => {
                  const info = SIGNAL_INFO[signalName];
                  return (
                    <tr key={signalName}>
                      <td style={{ padding: '12px', color: '#9ca3af', borderBottom: '1px solid #222' }}>
                        <span style={{ marginRight: '8px' }}>{info?.icon}</span>
                        {info?.name || signalName}
                      </td>
                      {selectedPicks.map(pick => {
                        const score = getSignalScore(pick, signalName);
                        const isHighest = score === Math.max(...selectedPicks.map(p => getSignalScore(p, signalName)));
                        return (
                          <td key={pick.id} style={{
                            textAlign: 'center',
                            padding: '12px',
                            borderBottom: '1px solid #222',
                            color: score >= 70 ? '#00FF88' : score >= 55 ? '#00D4FF' : score < 45 ? '#FF6B6B' : '#9ca3af',
                            fontWeight: isHighest ? 'bold' : 'normal'
                          }}>
                            {score}
                            {score >= 55 ? ' ✅' : score <= 45 ? ' ❌' : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Expected ROI */}
                <tr>
                  <td style={{ padding: '12px', color: '#9ca3af' }}>
                    Expected ROI
                  </td>
                  {selectedPicks.map(pick => {
                    const mainPick = pick.bestPick === 'spread' ? pick.spreadEdge : pick.totalEdge;
                    const tierInfo = getTierInfo(mainPick.tier);
                    const roi = parseFloat(tierInfo.roi);
                    const isHighest = roi === Math.max(...selectedPicks.map(p => {
                      const mp = p.bestPick === 'spread' ? p.spreadEdge : p.totalEdge;
                      return parseFloat(getTierInfo(mp.tier).roi);
                    }));
                    return (
                      <td key={pick.id} style={{
                        textAlign: 'center',
                        padding: '12px',
                        color: isHighest ? '#00FF88' : '#fff',
                        fontWeight: isHighest ? 'bold' : 'normal'
                      }}>
                        {tierInfo.roi}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedPicks.length < 2 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#9ca3af',
            backgroundColor: '#1a1a2e',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
            <div style={{ fontSize: '16px' }}>Select at least 2 picks to compare</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED PICK CARD
// ============================================================================

const EnhancedPickCard = ({ game, idx, sport, onTrack, isTracked }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('signals');
  const [historical, setHistorical] = useState(null);

  const mainPick = game.bestPick === 'spread' ? game.spreadEdge : game.totalEdge;
  const mainAnalysis = game.bestPick === 'spread' ? game.spreadAnalysis : game.totalAnalysis;
  const confidence = mainPick.confidence;
  const tierInfo = getTierInfo(mainPick.tier);
  const recDisplay = getRecommendationDisplay(mainPick.recommendation);

  const isSpecialTier = ['GOLDEN_CONVERGENCE', 'HARMONIC_ALIGNMENT', 'SUPER_SIGNAL'].includes(mainPick.tier);

  useEffect(() => {
    if (isExpanded && !historical) {
      setHistorical(getHistoricalPerformance(mainAnalysis.signals, confidence, mainPick.tier));
    }
  }, [isExpanded]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatOdds = (odds) => odds > 0 ? `+${odds}` : odds;

  const tabs = [
    { id: 'signals', label: 'All Signals', icon: '📊' },
    { id: 'history', label: 'Historical', icon: '📈' },
    { id: 'explain', label: 'Why This Pick', icon: '💡' }
  ];

  return (
    <div style={isExpanded ? styles.cardExpanded : styles.card}>
      {/* Card Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          ...styles.cardHeader,
          borderLeft: `4px solid ${tierInfo.color}`,
          background: isSpecialTier ? `linear-gradient(135deg, rgba(${tierInfo.color === '#FFD700' ? '255,215,0' : '0,212,255'},0.1) 0%, transparent 100%)` : 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Confidence Ring */}
          <ConfidenceRing confidence={confidence} tier={mainPick.tier} />

          {/* Main Info */}
          <div style={{ flex: 1 }}>
            {/* Game Info */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                  {game.away_team}
                </span>
                <span style={{ color: '#6b7280' }}>@</span>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                  {game.home_team}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LiveBadge gameTime={game.commence_time} size="small" />
                <span style={{ color: '#6b7280', fontSize: '13px' }}>
                  {formatTime(game.commence_time)}
                </span>
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: tierInfo.color + '20',
                  color: tierInfo.color,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {tierInfo.label}
                </span>
              </div>
            </div>

            {/* Pick Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>{recDisplay.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: recDisplay.color, fontWeight: 'bold', fontSize: '16px' }}>
                  {game.bestPick === 'spread' ? (
                    <>
                      {mainPick.side} {mainPick.spread > 0 ? '+' : ''}{mainPick.spread}
                    </>
                  ) : (
                    <>
                      {mainPick.recommendation_side} {mainPick.total}
                    </>
                  )}
                  <span style={{ color: '#9ca3af', fontWeight: 'normal', marginLeft: '8px' }}>
                    ({formatOdds(mainPick.odds || mainPick.overOdds)})
                  </span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                  Expected: {tierInfo.winRate} win rate • {tierInfo.roi} ROI
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTrack(game, game.bestPick);
                }}
                disabled={isTracked(game, game.bestPick)}
                style={{
                  ...styles.button,
                  ...(isTracked(game, game.bestPick) ? styles.secondaryButton : styles.primaryButton),
                  padding: '8px 16px'
                }}
              >
                {isTracked(game, game.bestPick) ? '✓ Tracked' : '+ Track'}
              </button>
            </div>

            {/* Quick Signal Summary */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              flexWrap: 'wrap'
            }}>
              {(mainPick.signals || []).slice(0, 5).map((signal, sIdx) => {
                const info = SIGNAL_INFO[signal.name];
                return (
                  <span
                    key={sIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <span>{info?.icon || '📊'}</span>
                    <span style={{
                      color: signal.score >= 70 ? '#00FF88' : signal.score >= 55 ? '#00D4FF' : '#9ca3af'
                    }}>
                      {signal.score}
                    </span>
                  </span>
                );
              })}
              <span style={{
                color: '#00D4FF',
                fontSize: '12px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}>
                {isExpanded ? '▲ Less' : '▼ +{count} more signals'.replace('{count}', Math.max(0, Object.keys(SIGNAL_INFO).length - 5))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={styles.cardBody}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            paddingTop: '16px'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {})
                }}
              >
                <span style={{ marginRight: '6px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'signals' && (
            <SignalBreakdown
              signals={mainPick.signals}
              allSignals={mainAnalysis.signals}
            />
          )}

          {activeTab === 'history' && (
            <HistoricalPerformance historical={historical} />
          )}

          {activeTab === 'explain' && (() => {
            const explanation = explainPick(game, mainAnalysis, sport);
            return (
              <div>
                <p style={{ color: '#fff', fontSize: '15px', lineHeight: '1.7', marginBottom: '16px' }}>
                  {explanation.summary}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    Key Factors
                  </div>
                  {explanation.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '8px',
                      padding: '10px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: '6px'
                    }}>
                      <span style={{
                        color: bullet.level === 'high' ? '#00FF88' : bullet.level === 'medium' ? '#00D4FF' : '#9ca3af'
                      }}>
                        {bullet.text}
                      </span>
                    </div>
                  ))}
                </div>

                {explanation.risks.length > 0 && (
                  <div>
                    <div style={{
                      color: '#FF8844',
                      fontSize: '12px',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Risk Factors
                    </div>
                    {explanation.risks.map((risk, rIdx) => (
                      <div key={rIdx} style={{
                        fontSize: '14px',
                        color: risk.level === 'high' ? '#FF4444' : risk.level === 'medium' ? '#FF8844' : '#9ca3af',
                        marginBottom: '6px'
                      }}>
                        ⚠️ {risk.text}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '16px' }}>
                  <ConsensusMeter signals={mainAnalysis} showDetails={true} />
                </div>
              </div>
            );
          })()}

          {/* Both Picks Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Spread */}
            <div style={{
              padding: '16px',
              backgroundColor: game.bestPick === 'spread' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: game.bestPick === 'spread' ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Spread
                </span>
                {game.bestPick === 'spread' && (
                  <span style={{ color: '#00D4FF', fontSize: '10px' }}>⭐ BEST PICK</span>
                )}
              </div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                {game.spreadEdge.side} {game.spread > 0 ? '+' : ''}{game.spread}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <ConfidenceRing confidence={game.spreadEdge.confidence} tier={game.spreadEdge.tier} size={50} />
                <button
                  onClick={() => onTrack(game, 'spread')}
                  disabled={isTracked(game, 'spread')}
                  style={{
                    ...styles.button,
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: isTracked(game, 'spread') ? '#333' : 'rgba(0,255,136,0.2)',
                    color: isTracked(game, 'spread') ? '#666' : '#00FF88',
                    border: `1px solid ${isTracked(game, 'spread') ? '#444' : 'rgba(0,255,136,0.4)'}`,
                    cursor: isTracked(game, 'spread') ? 'default' : 'pointer'
                  }}
                >
                  {isTracked(game, 'spread') ? '✓' : '+'}
                </button>
              </div>
            </div>

            {/* Total */}
            <div style={{
              padding: '16px',
              backgroundColor: game.bestPick === 'total' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: game.bestPick === 'total' ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Total
                </span>
                {game.bestPick === 'total' && (
                  <span style={{ color: '#00D4FF', fontSize: '10px' }}>⭐ BEST PICK</span>
                )}
              </div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                {game.totalEdge.recommendation_side} {game.total}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <ConfidenceRing confidence={game.totalEdge.confidence} tier={game.totalEdge.tier} size={50} />
                <button
                  onClick={() => onTrack(game, 'total')}
                  disabled={isTracked(game, 'total')}
                  style={{
                    ...styles.button,
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: isTracked(game, 'total') ? '#333' : 'rgba(0,255,136,0.2)',
                    color: isTracked(game, 'total') ? '#666' : '#00FF88',
                    border: `1px solid ${isTracked(game, 'total') ? '#444' : 'rgba(0,255,136,0.4)'}`,
                    cursor: isTracked(game, 'total') ? 'default' : 'pointer'
                  }}
                >
                  {isTracked(game, 'total') ? '✓' : '+'}
                </button>
              </div>
            </div>
          </div>

          {/* Community Vote */}
          <div style={{ marginTop: '16px' }}>
            <CommunityVote
              game={game}
              betType={game.bestPick}
              aiPick={game.bestPick === 'spread'
                ? (mainPick.side?.toLowerCase() === 'home' ? 'home' : 'away')
                : mainPick.recommendation_side?.toLowerCase()
              }
              aiConfidence={confidence}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SmashSpotsEnhanced = () => {
  const [sport, setSport] = useState('NBA');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signalContext, setSignalContext] = useState(null);
  const [trackedPicks, setTrackedPicks] = useState(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' | 'compact'

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  // Auto-refresh
  const {
    lastUpdated,
    isRefreshing,
    refresh,
    setInterval: setRefreshInterval,
    interval: refreshInterval,
    isPaused,
    togglePause
  } = useAutoRefresh(
    useCallback(() => fetchPicks(), [sport]),
    { interval: 120000, immediate: false, deps: [sport] }
  );

  // Load tracked picks on mount
  useEffect(() => {
    const existingPicks = getAllPicks();
    const trackedIds = new Set(existingPicks.map(p =>
      `${p.game.home_team}-${p.game.away_team}-${p.side}-${p.bet_type}`
    ));
    setTrackedPicks(trackedIds);
  }, []);

  const handleTrackPick = (game, betType) => {
    const isSpread = betType === 'spread';
    const edge = isSpread ? game.spreadEdge : game.totalEdge;

    const pickData = {
      sport,
      home_team: game.home_team,
      away_team: game.away_team,
      commence_time: game.commence_time,
      bet_type: betType,
      side: isSpread ? edge.side : edge.recommendation_side,
      line: isSpread ? game.spread : game.total,
      odds: isSpread ? edge.odds : (edge.recommendation_side === 'OVER' ? edge.overOdds : edge.underOdds),
      book: edge.book,
      confidence: edge.confidence,
      tier: edge.tier,
      signals: edge.signals
    };

    recordPick(pickData);

    const pickId = `${game.home_team}-${game.away_team}-${pickData.side}-${betType}`;
    setTrackedPicks(prev => new Set([...prev, pickId]));
  };

  const isPickTracked = (game, betType) => {
    const edge = betType === 'spread' ? game.spreadEdge : game.totalEdge;
    const side = betType === 'spread' ? edge.side : edge.recommendation_side;
    const pickId = `${game.home_team}-${game.away_team}-${side}-${betType}`;
    return trackedPicks.has(pickId);
  };

  useEffect(() => {
    fetchPicks();
  }, [sport]);

  const fetchPicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const [slateData, context] = await Promise.all([
        api.getSmashSpots(sport),
        fetchSignalContext(sport)
      ]);

      setSignalContext(context);

      if (slateData.slate && slateData.slate.length > 0) {
        const gamePicks = slateData.slate.map((game, idx) => {
          const spreadAnalysis = calculateConfidence(
            { ...game, bet_type: 'spread' },
            sport,
            context
          );

          const totalAnalysis = calculateConfidence(
            { ...game, bet_type: 'total' },
            sport,
            context
          );

          const spreadEdge = {
            confidence: spreadAnalysis.confidence,
            tier: spreadAnalysis.tier,
            recommendation: spreadAnalysis.recommendation,
            signals: spreadAnalysis.topSignals,
            side: game.spread > 0 ? 'HOME' : 'AWAY',
            spread: game.spread,
            odds: game.spread_odds,
            book: game.spread_book
          };

          const totalEdge = {
            confidence: totalAnalysis.confidence,
            tier: totalAnalysis.tier,
            recommendation: totalAnalysis.recommendation,
            signals: totalAnalysis.topSignals,
            recommendation_side: game.over_odds > game.under_odds ? 'OVER' : 'UNDER',
            total: game.total,
            overOdds: game.over_odds,
            underOdds: game.under_odds,
            book: game.over_odds > game.under_odds ? game.over_book : game.under_book
          };

          return {
            id: `${game.home_team}-${game.away_team}-${idx}`,
            ...game,
            spreadEdge,
            totalEdge,
            spreadAnalysis,
            totalAnalysis,
            bestPick: spreadEdge.confidence > totalEdge.confidence ? 'spread' : 'total'
          };
        });

        const filteredPicks = gamePicks
          .filter(g => g.spreadEdge.confidence >= 50 || g.totalEdge.confidence >= 50)
          .sort((a, b) => Math.max(b.spreadEdge.confidence, b.totalEdge.confidence) -
                         Math.max(a.spreadEdge.confidence, a.totalEdge.confidence));

        setPicks(filteredPicks);
      } else {
        setPicks([]);
      }
    } catch (err) {
      console.error('Error fetching picks:', err);
      setError(err.message || 'Failed to fetch picks');
      setPicks([]);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔥 Smash Spots Enhanced
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              {picks.length} plays • All 17 signals analyzed
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowComparison(true)}
              style={{ ...styles.button, ...styles.secondaryButton }}
              disabled={picks.length < 2}
            >
              ⚖️ Compare Picks
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              {viewMode === 'detailed' ? '📋 Compact' : '📊 Detailed'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {Object.entries(SIGNAL_CATEGORIES).map(([key, cat]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: cat.color
              }} />
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <LastUpdated
            timestamp={lastUpdated}
            isRefreshing={isRefreshing || loading}
            onRefresh={refresh}
            isPaused={isPaused}
            onTogglePause={togglePause}
          />
          <RefreshIntervalSelector
            interval={refreshInterval}
            onChange={setRefreshInterval}
          />
        </div>

        {/* Sport Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                ...styles.tab,
                ...(sport === s ? styles.tabActive : {})
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Picks */}
        {loading ? (
          <GameCardSkeleton count={3} />
        ) : error ? (
          <ConnectionError onRetry={fetchPicks} serviceName="picks API" />
        ) : picks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#9ca3af',
            backgroundColor: '#1a1a2e',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No High-Confidence Picks</h3>
            <p>Check back closer to game time for today's {sport} picks.</p>
          </div>
        ) : (
          <div>
            {picks.map((game, idx) => (
              <EnhancedPickCard
                key={game.id}
                game={game}
                idx={idx}
                sport={sport}
                onTrack={handleTrackPick}
                isTracked={isPickTracked}
              />
            ))}
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <PickComparison
            picks={picks}
            onClose={() => setShowComparison(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SmashSpotsEnhanced;
export {
  ConfidenceRing,
  SignalBreakdown,
  HistoricalPerformance,
  PickComparison,
  EnhancedPickCard,
  SIGNAL_INFO,
  SIGNAL_CATEGORIES
};
