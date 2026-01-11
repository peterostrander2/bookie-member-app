/**
 * AdvancedAnalytics.jsx
 * Comprehensive analytics suite including:
 * - Bet Simulator (strategy backtesting)
 * - Parlays Optimizer (correlation analysis)
 * - Hedge Calculator (profit/loss scenarios)
 * - Arbitrage Finder (cross-book scanning)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert American odds to decimal
 */
const americanToDecimal = (american) => {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
};

/**
 * Convert decimal odds to American
 */
const decimalToAmerican = (decimal) => {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
};

/**
 * Calculate implied probability from American odds
 */
const impliedProbability = (american) => {
  if (american > 0) {
    return 100 / (american + 100);
  } else {
    return Math.abs(american) / (Math.abs(american) + 100);
  }
};

/**
 * Calculate Kelly Criterion bet size
 */
const kellyBetSize = (probability, odds, bankroll, fraction = 1) => {
  const decimal = americanToDecimal(odds);
  const b = decimal - 1;
  const p = probability;
  const q = 1 - p;
  const kelly = (b * p - q) / b;
  return Math.max(0, kelly * fraction * bankroll);
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format percentage
 */
const formatPercent = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format odds display
 */
const formatOdds = (american) => {
  return american > 0 ? `+${american}` : `${american}`;
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateHistoricalPicks = (count = 500) => {
  const sports = ['NFL', 'NBA', 'MLB', 'NHL'];
  const picks = [];

  for (let i = 0; i < count; i++) {
    const confidence = 50 + Math.random() * 50;
    const odds = Math.random() > 0.5
      ? Math.floor(Math.random() * 200) + 100
      : -Math.floor(Math.random() * 200) - 100;

    // Higher confidence = higher win rate (with variance)
    const baseWinRate = 0.4 + (confidence / 100) * 0.3;
    const won = Math.random() < baseWinRate;

    picks.push({
      id: i + 1,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      sport: sports[Math.floor(Math.random() * sports.length)],
      confidence,
      odds,
      won,
      sharpAlignment: Math.random() > 0.3,
      esotericScore: Math.random() * 100
    });
  }

  return picks.sort((a, b) => a.date - b.date);
};

const generateArbitrageOpportunities = () => {
  const books = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet', 'Barstool'];
  const opportunities = [];

  // Generate 3-8 arb opportunities
  const count = 3 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    const book1 = books[Math.floor(Math.random() * books.length)];
    let book2 = books[Math.floor(Math.random() * books.length)];
    while (book2 === book1) {
      book2 = books[Math.floor(Math.random() * books.length)];
    }

    const baseOdds = Math.random() > 0.5 ? 150 : -150;
    const spread = 15 + Math.floor(Math.random() * 30);

    opportunities.push({
      id: i + 1,
      event: `Team ${String.fromCharCode(65 + i)} vs Team ${String.fromCharCode(66 + i)}`,
      sport: ['NFL', 'NBA', 'MLB'][Math.floor(Math.random() * 3)],
      side1: {
        book: book1,
        odds: baseOdds + spread,
        team: `Team ${String.fromCharCode(65 + i)}`
      },
      side2: {
        book: book2,
        odds: -(baseOdds - spread + 20),
        team: `Team ${String.fromCharCode(66 + i)}`
      },
      profitPercent: (Math.random() * 3 + 0.5).toFixed(2),
      expiresIn: Math.floor(Math.random() * 30) + 5
    });
  }

  return opportunities;
};

// ============================================================================
// BET SIMULATOR
// ============================================================================

const STAKE_METHODS = {
  flat: {
    name: 'Flat Betting',
    description: 'Same amount on every bet',
    calculate: (bankroll, unitSize) => unitSize
  },
  kelly: {
    name: 'Full Kelly',
    description: 'Optimal growth, high variance',
    calculate: (bankroll, _, confidence, odds) =>
      kellyBetSize(confidence / 100, odds, bankroll, 1)
  },
  halfKelly: {
    name: 'Half Kelly',
    description: 'Balanced growth and risk',
    calculate: (bankroll, _, confidence, odds) =>
      kellyBetSize(confidence / 100, odds, bankroll, 0.5)
  },
  quarterKelly: {
    name: 'Quarter Kelly',
    description: 'Conservative growth',
    calculate: (bankroll, _, confidence, odds) =>
      kellyBetSize(confidence / 100, odds, bankroll, 0.25)
  },
  percentage: {
    name: 'Percentage',
    description: 'Fixed % of current bankroll',
    calculate: (bankroll, percent) => bankroll * (percent / 100)
  },
  confidence: {
    name: 'Confidence-Based',
    description: 'Stake scales with confidence',
    calculate: (bankroll, baseUnit, confidence) =>
      baseUnit * (confidence / 70) // 70% = 1 unit, 100% = 1.43 units
  }
};

const STRATEGY_FILTERS = {
  minConfidence: { label: 'Min Confidence', type: 'number', default: 70, min: 50, max: 100 },
  maxConfidence: { label: 'Max Confidence', type: 'number', default: 100, min: 50, max: 100 },
  sharpOnly: { label: 'Sharp Alignment Only', type: 'boolean', default: false },
  sports: { label: 'Sports', type: 'multi', options: ['NFL', 'NBA', 'MLB', 'NHL'], default: ['NFL', 'NBA', 'MLB', 'NHL'] },
  minOdds: { label: 'Min Odds', type: 'number', default: -200, min: -500, max: 500 },
  maxOdds: { label: 'Max Odds', type: 'number', default: 200, min: -500, max: 500 },
  esotericMin: { label: 'Min Esoteric Score', type: 'number', default: 0, min: 0, max: 100 }
};

export const BetSimulator = () => {
  const [historicalData] = useState(() => generateHistoricalPicks(500));
  const [strategies, setStrategies] = useState([
    {
      id: 1,
      name: 'Conservative Sharp',
      filters: { minConfidence: 80, sharpOnly: true, sports: ['NFL', 'NBA', 'MLB', 'NHL'] },
      stakeMethod: 'halfKelly',
      unitSize: 100
    }
  ]);
  const [bankroll, setBankroll] = useState(10000);
  const [activeStrategy, setActiveStrategy] = useState(0);
  const [showAddStrategy, setShowAddStrategy] = useState(false);

  // Run simulation for a strategy
  const runSimulation = useCallback((strategy, initialBankroll, picks) => {
    let currentBankroll = initialBankroll;
    let maxBankroll = initialBankroll;
    let maxDrawdown = 0;
    let wins = 0;
    let losses = 0;
    const history = [{ date: picks[0]?.date || new Date(), bankroll: initialBankroll }];

    // Filter picks based on strategy
    const filteredPicks = picks.filter(pick => {
      const f = strategy.filters;
      if (pick.confidence < (f.minConfidence || 0)) return false;
      if (pick.confidence > (f.maxConfidence || 100)) return false;
      if (f.sharpOnly && !pick.sharpAlignment) return false;
      if (f.sports && !f.sports.includes(pick.sport)) return false;
      if (pick.odds < (f.minOdds || -500)) return false;
      if (pick.odds > (f.maxOdds || 500)) return false;
      if (pick.esotericScore < (f.esotericMin || 0)) return false;
      return true;
    });

    // Simulate each bet
    filteredPicks.forEach(pick => {
      const stakeMethod = STAKE_METHODS[strategy.stakeMethod];
      const stake = Math.min(
        stakeMethod.calculate(currentBankroll, strategy.unitSize, pick.confidence, pick.odds),
        currentBankroll * 0.25 // Max 25% of bankroll per bet
      );

      if (stake <= 0 || currentBankroll <= 0) return;

      if (pick.won) {
        const decimal = americanToDecimal(pick.odds);
        const profit = stake * (decimal - 1);
        currentBankroll += profit;
        wins++;
      } else {
        currentBankroll -= stake;
        losses++;
      }

      // Track max drawdown
      if (currentBankroll > maxBankroll) {
        maxBankroll = currentBankroll;
      }
      const drawdown = (maxBankroll - currentBankroll) / maxBankroll;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      history.push({ date: pick.date, bankroll: currentBankroll });
    });

    const totalBets = wins + losses;
    const roi = totalBets > 0 ? (currentBankroll - initialBankroll) / (strategy.unitSize * totalBets) : 0;

    return {
      finalBankroll: currentBankroll,
      profit: currentBankroll - initialBankroll,
      roi,
      winRate: totalBets > 0 ? wins / totalBets : 0,
      maxDrawdown,
      totalBets,
      wins,
      losses,
      history
    };
  }, []);

  // Calculate results for all strategies
  const results = useMemo(() => {
    return strategies.map(strategy => ({
      strategy,
      ...runSimulation(strategy, bankroll, historicalData)
    }));
  }, [strategies, bankroll, historicalData, runSimulation]);

  const addStrategy = (newStrategy) => {
    setStrategies(prev => [...prev, { ...newStrategy, id: Date.now() }]);
    setShowAddStrategy(false);
  };

  const removeStrategy = (id) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    bankrollInput: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: '#1e293b',
      borderRadius: '8px'
    },
    input: {
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      padding: '8px 12px',
      color: '#f8fafc',
      fontSize: '14px',
      width: '120px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    strategyCard: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid transparent'
    },
    strategyCardActive: {
      border: '2px solid #3b82f6'
    },
    strategyName: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f8fafc',
      marginBottom: '12px'
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    stat: {
      padding: '12px',
      backgroundColor: '#0f172a',
      borderRadius: '8px'
    },
    statLabel: {
      fontSize: '11px',
      color: '#64748b',
      textTransform: 'uppercase',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: 700
    },
    chartContainer: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '24px'
    },
    addButton: {
      padding: '12px 20px',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span>🎰</span> Bet Simulator
        </h2>
        <div style={styles.bankrollInput}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Starting Bankroll:</span>
          <input
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.grid}>
        {results.map((result, index) => (
          <div
            key={result.strategy.id}
            style={{
              ...styles.strategyCard,
              ...(activeStrategy === index ? styles.strategyCardActive : {})
            }}
            onClick={() => setActiveStrategy(index)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={styles.strategyName}>{result.strategy.name}</div>
              {strategies.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeStrategy(result.strategy.id); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              {STAKE_METHODS[result.strategy.stakeMethod].name} •
              Min {result.strategy.filters.minConfidence}% confidence
              {result.strategy.filters.sharpOnly && ' • Sharp only'}
            </div>

            <div style={styles.statGrid}>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Final Bankroll</div>
                <div style={{
                  ...styles.statValue,
                  color: result.profit >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatCurrency(result.finalBankroll)}
                </div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>ROI</div>
                <div style={{
                  ...styles.statValue,
                  color: result.roi >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatPercent(result.roi)}
                </div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Win Rate</div>
                <div style={{ ...styles.statValue, color: '#f8fafc' }}>
                  {formatPercent(result.winRate)}
                </div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Max Drawdown</div>
                <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                  {formatPercent(result.maxDrawdown)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
              {result.totalBets} bets • {result.wins}W / {result.losses}L
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowAddStrategy(true)}
          style={{
            ...styles.strategyCard,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #334155',
            cursor: 'pointer',
            minHeight: '200px'
          }}
        >
          <span style={{ fontSize: '32px', marginBottom: '8px' }}>+</span>
          <span style={{ color: '#94a3b8' }}>Add Strategy</span>
        </button>
      </div>

      {/* Bankroll Chart */}
      <div style={styles.chartContainer}>
        <h3 style={{ color: '#f8fafc', marginBottom: '16px', fontSize: '16px' }}>
          Bankroll Growth Comparison
        </h3>
        <BankrollChart results={results} initialBankroll={bankroll} />
      </div>

      {/* Strategy Builder Modal */}
      {showAddStrategy && (
        <StrategyBuilder
          onSave={addStrategy}
          onClose={() => setShowAddStrategy(false)}
        />
      )}
    </div>
  );
};

const BankrollChart = ({ results, initialBankroll }) => {
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
  const maxPoints = 50;

  // Normalize all histories to same number of points
  const normalizedData = results.map((result, idx) => {
    const history = result.history;
    const step = Math.max(1, Math.floor(history.length / maxPoints));
    const points = history.filter((_, i) => i % step === 0 || i === history.length - 1);
    return {
      name: result.strategy.name,
      color: colors[idx % colors.length],
      points
    };
  });

  // Find min/max for scaling
  const allValues = normalizedData.flatMap(d => d.points.map(p => p.bankroll));
  const minValue = Math.min(...allValues, initialBankroll * 0.5);
  const maxValue = Math.max(...allValues, initialBankroll * 1.5);
  const range = maxValue - minValue;

  const width = 800;
  const height = 200;
  const padding = 40;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height + 40}`} style={{ width: '100%', maxWidth: '800px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + (1 - ratio) * (height - padding * 2);
          const value = minValue + ratio * range;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#334155"
                strokeDasharray="4"
              />
              <text x={padding - 5} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* Initial bankroll line */}
        <line
          x1={padding}
          y1={padding + ((maxValue - initialBankroll) / range) * (height - padding * 2)}
          x2={width - padding}
          y2={padding + ((maxValue - initialBankroll) / range) * (height - padding * 2)}
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="8"
        />

        {/* Lines for each strategy */}
        {normalizedData.map((data, idx) => {
          const pathData = data.points.map((point, i) => {
            const x = padding + (i / (data.points.length - 1)) * (width - padding * 2);
            const y = padding + ((maxValue - point.bankroll) / range) * (height - padding * 2);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ');

          return (
            <path
              key={idx}
              d={pathData}
              fill="none"
              stroke={data.color}
              strokeWidth="2"
            />
          );
        })}

        {/* Legend */}
        {normalizedData.map((data, idx) => (
          <g key={idx} transform={`translate(${padding + idx * 150}, ${height + 20})`}>
            <rect width="12" height="12" fill={data.color} rx="2" />
            <text x="18" y="10" fill="#94a3b8" fontSize="11">{data.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const StrategyBuilder = ({ onSave, onClose }) => {
  const [name, setName] = useState('New Strategy');
  const [filters, setFilters] = useState({
    minConfidence: 70,
    maxConfidence: 100,
    sharpOnly: false,
    sports: ['NFL', 'NBA', 'MLB', 'NHL'],
    minOdds: -200,
    maxOdds: 200,
    esotericMin: 0
  });
  const [stakeMethod, setStakeMethod] = useState('halfKelly');
  const [unitSize, setUnitSize] = useState(100);

  const handleSave = () => {
    onSave({ name, filters, stakeMethod, unitSize });
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc'
    },
    section: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      color: '#94a3b8',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '14px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
    },
    sportTags: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    sportTag: (active) => ({
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: active ? '#3b82f6' : '#0f172a',
      color: active ? 'white' : '#94a3b8',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px'
    }),
    buttons: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    saveButton: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    cancelButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#94a3b8',
      fontSize: '14px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Build Strategy</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Strategy Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Confidence Range</label>
          <div style={styles.row}>
            <input
              type="number"
              value={filters.minConfidence}
              onChange={e => setFilters(f => ({ ...f, minConfidence: Number(e.target.value) }))}
              placeholder="Min %"
              style={styles.input}
            />
            <input
              type="number"
              value={filters.maxConfidence}
              onChange={e => setFilters(f => ({ ...f, maxConfidence: Number(e.target.value) }))}
              placeholder="Max %"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Odds Range</label>
          <div style={styles.row}>
            <input
              type="number"
              value={filters.minOdds}
              onChange={e => setFilters(f => ({ ...f, minOdds: Number(e.target.value) }))}
              placeholder="Min"
              style={styles.input}
            />
            <input
              type="number"
              value={filters.maxOdds}
              onChange={e => setFilters(f => ({ ...f, maxOdds: Number(e.target.value) }))}
              placeholder="Max"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Sports</label>
          <div style={styles.sportTags}>
            {['NFL', 'NBA', 'MLB', 'NHL'].map(sport => (
              <button
                key={sport}
                onClick={() => setFilters(f => ({
                  ...f,
                  sports: f.sports.includes(sport)
                    ? f.sports.filter(s => s !== sport)
                    : [...f.sports, sport]
                }))}
                style={styles.sportTag(filters.sports.includes(sport))}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={filters.sharpOnly}
              onChange={e => setFilters(f => ({ ...f, sharpOnly: e.target.checked }))}
            />
            <span style={{ color: '#f8fafc', fontSize: '14px' }}>Sharp Alignment Only</span>
          </label>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Stake Method</label>
          <select
            value={stakeMethod}
            onChange={e => setStakeMethod(e.target.value)}
            style={styles.input}
          >
            {Object.entries(STAKE_METHODS).map(([key, method]) => (
              <option key={key} value={key}>{method.name} - {method.description}</option>
            ))}
          </select>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Unit Size ($)</label>
          <input
            type="number"
            value={unitSize}
            onChange={e => setUnitSize(Number(e.target.value))}
            style={styles.input}
          />
        </div>

        <div style={styles.buttons}>
          <button style={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button style={styles.saveButton} onClick={handleSave}>Add Strategy</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PARLAYS OPTIMIZER
// ============================================================================

const CORRELATION_MATRIX = {
  // Same game correlations
  'same_game': 0.85,
  // Same team correlations
  'same_team_spread_total': 0.65,
  'same_team_ml_spread': 0.90,
  // Cross-sport (independent)
  'cross_sport': 0.0,
  // Same sport, different games
  'same_sport_diff_game': 0.15,
  // Weather-affected
  'weather_correlation': 0.40
};

export const ParlaysOptimizer = () => {
  const [legs, setLegs] = useState([
    { id: 1, team: 'Chiefs', type: 'spread', line: '-3.5', odds: -110, sport: 'NFL', gameId: 'nfl1' },
    { id: 2, team: 'Lakers', type: 'ml', line: '', odds: -150, sport: 'NBA', gameId: 'nba1' },
    { id: 3, team: 'Over', type: 'total', line: '48.5', odds: -110, sport: 'NFL', gameId: 'nfl1' }
  ]);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [showAddLeg, setShowAddLeg] = useState(false);

  // Calculate parlay odds and EV
  const parlayCalcs = useMemo(() => {
    if (legs.length < 2) return null;

    // Calculate combined decimal odds
    const decimalOdds = legs.reduce((acc, leg) => {
      return acc * americanToDecimal(leg.odds);
    }, 1);

    // Calculate implied probability (no-vig)
    const impliedProb = legs.reduce((acc, leg) => {
      return acc * impliedProbability(leg.odds);
    }, 1);

    // Detect correlations
    const correlations = [];
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const leg1 = legs[i];
        const leg2 = legs[j];

        if (leg1.gameId === leg2.gameId) {
          correlations.push({
            legs: [leg1, leg2],
            type: 'Same Game',
            correlation: CORRELATION_MATRIX.same_game,
            severity: 'high'
          });
        } else if (leg1.sport === leg2.sport) {
          correlations.push({
            legs: [leg1, leg2],
            type: 'Same Sport',
            correlation: CORRELATION_MATRIX.same_sport_diff_game,
            severity: 'low'
          });
        }
      }
    }

    // Adjust probability for correlations
    let adjustedProb = impliedProb;
    correlations.forEach(corr => {
      if (corr.severity === 'high') {
        adjustedProb *= 0.85; // Reduce expected hit rate for correlated legs
      }
    });

    const payout = stakeAmount * decimalOdds;
    const expectedValue = (adjustedProb * payout) - stakeAmount;
    const evPercent = expectedValue / stakeAmount;

    return {
      decimalOdds,
      americanOdds: decimalToAmerican(decimalOdds),
      impliedProb,
      adjustedProb,
      payout,
      profit: payout - stakeAmount,
      expectedValue,
      evPercent,
      correlations,
      hasCorrelation: correlations.some(c => c.severity === 'high')
    };
  }, [legs, stakeAmount]);

  const addLeg = (newLeg) => {
    setLegs(prev => [...prev, { ...newLeg, id: Date.now() }]);
    setShowAddLeg(false);
  };

  const removeLeg = (id) => {
    setLegs(prev => prev.filter(l => l.id !== id));
  };

  // Suggest optimal parlays based on current legs
  const suggestions = useMemo(() => {
    if (legs.length < 2) return [];

    const suggestions = [];

    // Suggest removing correlated legs
    if (parlayCalcs?.hasCorrelation) {
      const nonCorrelated = legs.filter((leg, i) => {
        return !parlayCalcs.correlations.some(c =>
          c.severity === 'high' && c.legs.some(l => l.id === leg.id)
        );
      });

      if (nonCorrelated.length >= 2) {
        suggestions.push({
          type: 'Remove Correlation',
          description: 'Remove same-game legs for better odds',
          action: 'remove_correlated'
        });
      }
    }

    // Suggest 2-leg parlay if >3 legs
    if (legs.length > 3) {
      suggestions.push({
        type: 'Reduce Legs',
        description: '2-3 leg parlays hit more often',
        action: 'reduce_legs'
      });
    }

    return suggestions;
  }, [legs, parlayCalcs]);

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    legsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px'
    },
    leg: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '10px'
    },
    legInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    legSport: {
      padding: '4px 8px',
      backgroundColor: '#334155',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      color: '#94a3b8'
    },
    legTeam: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#f8fafc'
    },
    legLine: {
      fontSize: '14px',
      color: '#94a3b8'
    },
    legOdds: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#3b82f6'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px'
    },
    summaryCard: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '16px'
    },
    stat: {
      textAlign: 'center'
    },
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 700
    },
    warningBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '10px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      marginBottom: '20px'
    },
    warningIcon: {
      fontSize: '24px'
    },
    warningText: {
      flex: 1,
      fontSize: '14px',
      color: '#f8fafc'
    },
    addLegButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#1e293b',
      border: '2px dashed #334155',
      borderRadius: '10px',
      color: '#94a3b8',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span>🎯</span> Parlays Optimizer
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Stake:</span>
          <input
            type="number"
            value={stakeAmount}
            onChange={e => setStakeAmount(Number(e.target.value))}
            style={{
              width: '100px',
              padding: '8px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Correlation Warning */}
      {parlayCalcs?.hasCorrelation && (
        <div style={styles.warningBox}>
          <span style={styles.warningIcon}>⚠️</span>
          <div style={styles.warningText}>
            <strong>Correlated Legs Detected!</strong> Same-game parlays reduce your expected value.
            {parlayCalcs.correlations.filter(c => c.severity === 'high').map((c, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {c.legs[0].team} & {c.legs[1].team} are in the same game
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parlay Legs */}
      <div style={styles.legsList}>
        {legs.map((leg, index) => (
          <div key={leg.id} style={styles.leg}>
            <div style={styles.legInfo}>
              <span style={{ color: '#64748b', fontSize: '14px', width: '20px' }}>{index + 1}.</span>
              <span style={styles.legSport}>{leg.sport}</span>
              <div>
                <div style={styles.legTeam}>{leg.team}</div>
                <div style={styles.legLine}>
                  {leg.type === 'spread' && `Spread ${leg.line}`}
                  {leg.type === 'ml' && 'Moneyline'}
                  {leg.type === 'total' && `Total ${leg.line}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={styles.legOdds}>{formatOdds(leg.odds)}</span>
              <button style={styles.removeButton} onClick={() => removeLeg(leg.id)}>×</button>
            </div>
          </div>
        ))}

        <button style={styles.addLegButton} onClick={() => setShowAddLeg(true)}>
          <span>+</span> Add Leg
        </button>
      </div>

      {/* Parlay Summary */}
      {parlayCalcs && (
        <div style={styles.summaryCard}>
          <div style={styles.summaryGrid}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Parlay Odds</div>
              <div style={{ ...styles.statValue, color: '#3b82f6' }}>
                {formatOdds(parlayCalcs.americanOdds)}
              </div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>To Win</div>
              <div style={{ ...styles.statValue, color: '#22c55e' }}>
                {formatCurrency(parlayCalcs.profit)}
              </div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Total Payout</div>
              <div style={{ ...styles.statValue, color: '#f8fafc' }}>
                {formatCurrency(parlayCalcs.payout)}
              </div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Win Probability</div>
              <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                {formatPercent(parlayCalcs.adjustedProb)}
              </div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Expected Value</div>
              <div style={{
                ...styles.statValue,
                color: parlayCalcs.expectedValue >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {parlayCalcs.expectedValue >= 0 ? '+' : ''}{formatCurrency(parlayCalcs.expectedValue)}
              </div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>EV %</div>
              <div style={{
                ...styles.statValue,
                color: parlayCalcs.evPercent >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {parlayCalcs.evPercent >= 0 ? '+' : ''}{formatPercent(parlayCalcs.evPercent)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Leg Modal */}
      {showAddLeg && (
        <AddLegModal onAdd={addLeg} onClose={() => setShowAddLeg(false)} />
      )}
    </div>
  );
};

const AddLegModal = ({ onAdd, onClose }) => {
  const [leg, setLeg] = useState({
    team: '',
    type: 'spread',
    line: '',
    odds: -110,
    sport: 'NFL',
    gameId: `game_${Date.now()}`
  });

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '14px',
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      color: '#94a3b8',
      marginBottom: '8px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    addButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '16px'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#f8fafc', marginBottom: '20px' }}>Add Parlay Leg</h3>

        <label style={styles.label}>Team/Selection</label>
        <input
          type="text"
          value={leg.team}
          onChange={e => setLeg(l => ({ ...l, team: e.target.value }))}
          placeholder="e.g., Chiefs, Over, Lakers"
          style={styles.input}
        />

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Sport</label>
            <select
              value={leg.sport}
              onChange={e => setLeg(l => ({ ...l, sport: e.target.value }))}
              style={styles.input}
            >
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="MLB">MLB</option>
              <option value="NHL">NHL</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Bet Type</label>
            <select
              value={leg.type}
              onChange={e => setLeg(l => ({ ...l, type: e.target.value }))}
              style={styles.input}
            >
              <option value="spread">Spread</option>
              <option value="ml">Moneyline</option>
              <option value="total">Total</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Line (if applicable)</label>
            <input
              type="text"
              value={leg.line}
              onChange={e => setLeg(l => ({ ...l, line: e.target.value }))}
              placeholder="-3.5 or 48.5"
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Odds</label>
            <input
              type="number"
              value={leg.odds}
              onChange={e => setLeg(l => ({ ...l, odds: Number(e.target.value) }))}
              style={styles.input}
            />
          </div>
        </div>

        <button style={styles.addButton} onClick={() => onAdd(leg)}>
          Add to Parlay
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// HEDGE CALCULATOR
// ============================================================================

export const HedgeCalculator = () => {
  const [originalBet, setOriginalBet] = useState({
    stake: 100,
    odds: 200,
    team: 'Team A'
  });
  const [hedgeBet, setHedgeBet] = useState({
    odds: -150,
    team: 'Team B'
  });
  const [hedgeGoal, setHedgeGoal] = useState('guarantee'); // 'guarantee' or 'minimize'

  // Calculate hedge scenarios
  const calculations = useMemo(() => {
    const originalDecimal = americanToDecimal(originalBet.odds);
    const hedgeDecimal = americanToDecimal(hedgeBet.odds);

    const originalPayout = originalBet.stake * originalDecimal;
    const originalProfit = originalPayout - originalBet.stake;

    // Guarantee profit hedge (equal profit regardless of outcome)
    const guaranteeHedgeStake = (originalPayout) / hedgeDecimal;
    const guaranteeProfit = originalPayout - originalBet.stake - guaranteeHedgeStake;

    // Minimize loss hedge (break even if hedge wins)
    const minimizeLossStake = originalBet.stake / (hedgeDecimal - 1);
    const minimizeLossProfit = originalProfit - minimizeLossStake;

    // No hedge scenarios
    const noHedgeWin = originalProfit;
    const noHedgeLoss = -originalBet.stake;

    return {
      originalPayout,
      originalProfit,
      guarantee: {
        hedgeStake: guaranteeHedgeStake,
        profitIfOriginalWins: guaranteeProfit,
        profitIfHedgeWins: guaranteeProfit,
        hedgePayout: guaranteeHedgeStake * hedgeDecimal
      },
      minimize: {
        hedgeStake: minimizeLossStake,
        profitIfOriginalWins: minimizeLossProfit,
        profitIfHedgeWins: 0,
        hedgePayout: minimizeLossStake * hedgeDecimal
      },
      noHedge: {
        profitIfWin: noHedgeWin,
        lossIfLose: noHedgeLoss
      }
    };
  }, [originalBet, hedgeBet]);

  const activeCalc = hedgeGoal === 'guarantee' ? calculations.guarantee : calculations.minimize;

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#94a3b8',
      marginBottom: '16px',
      textTransform: 'uppercase'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '14px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    goalToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px'
    },
    goalButton: (active) => ({
      flex: 1,
      padding: '14px',
      backgroundColor: active ? '#3b82f6' : '#1e293b',
      border: active ? 'none' : '1px solid #334155',
      borderRadius: '8px',
      color: active ? 'white' : '#94a3b8',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer'
    }),
    resultCard: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center'
    },
    resultTitle: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '8px'
    },
    resultValue: {
      fontSize: '36px',
      fontWeight: 700,
      color: '#3b82f6'
    },
    scenarioGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '24px'
    },
    scenario: {
      padding: '16px',
      backgroundColor: '#0f172a',
      borderRadius: '8px',
      textAlign: 'center'
    },
    scenarioLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '8px'
    },
    scenarioValue: {
      fontSize: '18px',
      fontWeight: 700
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        <span>🛡️</span> Hedge Calculator
      </h2>

      <div style={styles.grid}>
        {/* Original Bet */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Original Bet</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Team/Selection</label>
            <input
              type="text"
              value={originalBet.team}
              onChange={e => setOriginalBet(b => ({ ...b, team: e.target.value }))}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Stake ($)</label>
              <input
                type="number"
                value={originalBet.stake}
                onChange={e => setOriginalBet(b => ({ ...b, stake: Number(e.target.value) }))}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Odds</label>
              <input
                type="number"
                value={originalBet.odds}
                onChange={e => setOriginalBet(b => ({ ...b, odds: Number(e.target.value) }))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Potential Payout</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
              {formatCurrency(calculations.originalPayout)}
            </div>
          </div>
        </div>

        {/* Hedge Bet */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Hedge Bet</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Team/Selection</label>
            <input
              type="text"
              value={hedgeBet.team}
              onChange={e => setHedgeBet(b => ({ ...b, team: e.target.value }))}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Odds</label>
            <input
              type="number"
              value={hedgeBet.odds}
              onChange={e => setHedgeBet(b => ({ ...b, odds: Number(e.target.value) }))}
              style={styles.input}
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Implied Win Probability</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
              {formatPercent(impliedProbability(hedgeBet.odds))}
            </div>
          </div>
        </div>
      </div>

      {/* Hedge Goal Toggle */}
      <div style={styles.goalToggle}>
        <button
          style={styles.goalButton(hedgeGoal === 'guarantee')}
          onClick={() => setHedgeGoal('guarantee')}
        >
          🔒 Guarantee Profit
        </button>
        <button
          style={styles.goalButton(hedgeGoal === 'minimize')}
          onClick={() => setHedgeGoal('minimize')}
        >
          📉 Minimize Loss
        </button>
      </div>

      {/* Result */}
      <div style={styles.resultCard}>
        <div style={styles.resultTitle}>Recommended Hedge Stake</div>
        <div style={styles.resultValue}>
          {formatCurrency(activeCalc.hedgeStake)}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
          on {hedgeBet.team} at {formatOdds(hedgeBet.odds)}
        </div>

        {/* Scenario Comparison */}
        <div style={styles.scenarioGrid}>
          <div style={styles.scenario}>
            <div style={styles.scenarioLabel}>If {originalBet.team} Wins</div>
            <div style={{
              ...styles.scenarioValue,
              color: activeCalc.profitIfOriginalWins >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {activeCalc.profitIfOriginalWins >= 0 ? '+' : ''}{formatCurrency(activeCalc.profitIfOriginalWins)}
            </div>
          </div>
          <div style={styles.scenario}>
            <div style={styles.scenarioLabel}>If {hedgeBet.team} Wins</div>
            <div style={{
              ...styles.scenarioValue,
              color: activeCalc.profitIfHedgeWins >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {activeCalc.profitIfHedgeWins >= 0 ? '+' : ''}{formatCurrency(activeCalc.profitIfHedgeWins)}
            </div>
          </div>
          <div style={styles.scenario}>
            <div style={styles.scenarioLabel}>Without Hedge (Win/Loss)</div>
            <div style={styles.scenarioValue}>
              <span style={{ color: '#22c55e' }}>+{formatCurrency(calculations.noHedge.profitIfWin)}</span>
              {' / '}
              <span style={{ color: '#ef4444' }}>{formatCurrency(calculations.noHedge.lossIfLose)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Profit/Loss Chart */}
      <HedgeVisualization
        originalBet={originalBet}
        hedgeBet={hedgeBet}
        calculations={calculations}
        activeGoal={hedgeGoal}
      />
    </div>
  );
};

const HedgeVisualization = ({ originalBet, hedgeBet, calculations, activeGoal }) => {
  const scenarios = [
    {
      label: 'No Hedge',
      win: calculations.noHedge.profitIfWin,
      loss: calculations.noHedge.lossIfLose
    },
    {
      label: 'Guarantee Profit',
      win: calculations.guarantee.profitIfOriginalWins,
      loss: calculations.guarantee.profitIfHedgeWins
    },
    {
      label: 'Minimize Loss',
      win: calculations.minimize.profitIfOriginalWins,
      loss: calculations.minimize.profitIfHedgeWins
    }
  ];

  const maxProfit = Math.max(...scenarios.map(s => Math.max(s.win, s.loss)));
  const maxLoss = Math.min(...scenarios.map(s => Math.min(s.win, s.loss)));
  const range = maxProfit - maxLoss;

  const styles = {
    container: {
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#1e293b',
      borderRadius: '12px'
    },
    title: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#f8fafc',
      marginBottom: '20px'
    },
    chart: {
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-end',
      height: '200px',
      padding: '0 20px'
    },
    barGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    bars: {
      display: 'flex',
      gap: '4px',
      height: '160px',
      alignItems: 'flex-end'
    },
    bar: (value, isActive) => ({
      width: '40px',
      height: `${Math.abs(value / range) * 100}%`,
      minHeight: '4px',
      backgroundColor: value >= 0 ? '#22c55e' : '#ef4444',
      borderRadius: '4px 4px 0 0',
      opacity: isActive ? 1 : 0.4,
      position: 'relative'
    }),
    barLabel: {
      position: 'absolute',
      top: '-24px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    },
    scenarioLabel: {
      marginTop: '12px',
      fontSize: '12px',
      color: '#94a3b8',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Profit/Loss Comparison by Scenario</div>
      <div style={styles.chart}>
        {scenarios.map((scenario, i) => {
          const isActive = (activeGoal === 'guarantee' && i === 1) ||
                          (activeGoal === 'minimize' && i === 2) ||
                          i === 0;
          return (
            <div key={i} style={styles.barGroup}>
              <div style={styles.bars}>
                <div style={styles.bar(scenario.win, isActive)}>
                  <span style={{ ...styles.barLabel, color: '#22c55e' }}>
                    +{formatCurrency(scenario.win)}
                  </span>
                </div>
                {scenario.loss !== scenario.win && (
                  <div style={styles.bar(scenario.loss, isActive)}>
                    <span style={{ ...styles.barLabel, color: scenario.loss >= 0 ? '#22c55e' : '#ef4444' }}>
                      {scenario.loss >= 0 ? '+' : ''}{formatCurrency(scenario.loss)}
                    </span>
                  </div>
                )}
              </div>
              <div style={styles.scenarioLabel}>{scenario.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
        Green bar = {originalBet.team} wins • Red bar = {hedgeBet.team} wins
      </div>
    </div>
  );
};

// ============================================================================
// ARBITRAGE FINDER
// ============================================================================

export const ArbitrageFinder = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [minProfit, setMinProfit] = useState(0.5);

  const scanForArbitrage = useCallback(() => {
    setIsScanning(true);
    // Simulate API call
    setTimeout(() => {
      const newOpps = generateArbitrageOpportunities();
      setOpportunities(newOpps.filter(o => parseFloat(o.profitPercent) >= minProfit));
      setLastScan(new Date());
      setIsScanning(false);
    }, 1500);
  }, [minProfit]);

  // Auto-scan on mount
  useEffect(() => {
    scanForArbitrage();
  }, []);

  // Calculate stake distribution for an opportunity
  const calculateStakes = (opp) => {
    const decimal1 = americanToDecimal(opp.side1.odds);
    const decimal2 = americanToDecimal(opp.side2.odds);

    const totalImplied = (1 / decimal1) + (1 / decimal2);
    const arbExists = totalImplied < 1;

    if (!arbExists) return null;

    const stake1 = stakeAmount * (1 / decimal1) / totalImplied;
    const stake2 = stakeAmount * (1 / decimal2) / totalImplied;

    const payout1 = stake1 * decimal1;
    const payout2 = stake2 * decimal2;

    const guaranteedPayout = Math.min(payout1, payout2);
    const profit = guaranteedPayout - stakeAmount;

    return {
      stake1: stake1.toFixed(2),
      stake2: stake2.toFixed(2),
      payout1: payout1.toFixed(2),
      payout2: payout2.toFixed(2),
      guaranteedProfit: profit.toFixed(2),
      profitPercent: ((profit / stakeAmount) * 100).toFixed(2)
    };
  };

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    input: {
      padding: '8px 12px',
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: '#f8fafc',
      fontSize: '14px',
      width: '100px'
    },
    scanButton: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    opportunityCard: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #334155'
    },
    oppHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '16px'
    },
    oppEvent: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#f8fafc'
    },
    oppSport: {
      padding: '4px 8px',
      backgroundColor: '#334155',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#94a3b8'
    },
    profitBadge: {
      padding: '6px 12px',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderRadius: '20px',
      color: '#22c55e',
      fontSize: '14px',
      fontWeight: 700
    },
    sidesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: '16px',
      alignItems: 'center'
    },
    side: {
      padding: '16px',
      backgroundColor: '#0f172a',
      borderRadius: '8px'
    },
    sideBook: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    sideTeam: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#f8fafc',
      marginBottom: '8px'
    },
    sideOdds: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#3b82f6'
    },
    vsCircle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: 600
    },
    stakeRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '16px',
      padding: '12px 16px',
      backgroundColor: '#0f172a',
      borderRadius: '8px'
    },
    stakeItem: {
      textAlign: 'center'
    },
    stakeLabel: {
      fontSize: '11px',
      color: '#64748b',
      marginBottom: '4px'
    },
    stakeValue: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#f8fafc'
    },
    expiryBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#f59e0b'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px',
      color: '#64748b'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span>💰</span> Arbitrage Finder
        </h2>
        <div style={styles.controls}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Stake:</span>
            <input
              type="number"
              value={stakeAmount}
              onChange={e => setStakeAmount(Number(e.target.value))}
              style={styles.input}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Min %:</span>
            <input
              type="number"
              value={minProfit}
              onChange={e => setMinProfit(Number(e.target.value))}
              step="0.1"
              style={{ ...styles.input, width: '70px' }}
            />
          </div>
          <button
            style={styles.scanButton}
            onClick={scanForArbitrage}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                Scanning...
              </>
            ) : (
              <>
                <span>🔍</span>
                Scan Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: opportunities.length > 0 ? '#22c55e' : '#64748b' }}>●</span>
          <span style={{ color: '#f8fafc', fontSize: '14px' }}>
            {opportunities.length} Opportunities Found
          </span>
        </div>
        {lastScan && (
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            Last scan: {lastScan.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Opportunities */}
      {opportunities.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '8px' }}>
            No Arbitrage Opportunities Found
          </div>
          <div style={{ fontSize: '14px' }}>
            Try lowering the minimum profit % or check back later
          </div>
        </div>
      ) : (
        opportunities.map(opp => {
          const stakes = calculateStakes(opp);
          return (
            <div key={opp.id} style={styles.opportunityCard}>
              <div style={styles.oppHeader}>
                <div>
                  <div style={styles.oppEvent}>{opp.event}</div>
                  <span style={styles.oppSport}>{opp.sport}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={styles.expiryBadge}>
                    <span>⏱</span>
                    {opp.expiresIn}m left
                  </div>
                  <div style={styles.profitBadge}>
                    +{opp.profitPercent}% Profit
                  </div>
                </div>
              </div>

              <div style={styles.sidesGrid}>
                <div style={styles.side}>
                  <div style={styles.sideBook}>{opp.side1.book}</div>
                  <div style={styles.sideTeam}>{opp.side1.team}</div>
                  <div style={styles.sideOdds}>{formatOdds(opp.side1.odds)}</div>
                  {stakes && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#22c55e' }}>
                      Bet: {formatCurrency(stakes.stake1)}
                    </div>
                  )}
                </div>

                <div style={styles.vsCircle}>VS</div>

                <div style={styles.side}>
                  <div style={styles.sideBook}>{opp.side2.book}</div>
                  <div style={styles.sideTeam}>{opp.side2.team}</div>
                  <div style={styles.sideOdds}>{formatOdds(opp.side2.odds)}</div>
                  {stakes && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#22c55e' }}>
                      Bet: {formatCurrency(stakes.stake2)}
                    </div>
                  )}
                </div>
              </div>

              {stakes && (
                <div style={styles.stakeRow}>
                  <div style={styles.stakeItem}>
                    <div style={styles.stakeLabel}>Total Investment</div>
                    <div style={styles.stakeValue}>{formatCurrency(stakeAmount)}</div>
                  </div>
                  <div style={styles.stakeItem}>
                    <div style={styles.stakeLabel}>Guaranteed Return</div>
                    <div style={{ ...styles.stakeValue, color: '#22c55e' }}>
                      {formatCurrency(parseFloat(stakes.guaranteedProfit) + stakeAmount)}
                    </div>
                  </div>
                  <div style={styles.stakeItem}>
                    <div style={styles.stakeLabel}>Guaranteed Profit</div>
                    <div style={{ ...styles.stakeValue, color: '#22c55e' }}>
                      +{formatCurrency(stakes.guaranteedProfit)}
                    </div>
                  </div>
                  <div style={styles.stakeItem}>
                    <div style={styles.stakeLabel}>ROI</div>
                    <div style={{ ...styles.stakeValue, color: '#3b82f6' }}>
                      {stakes.profitPercent}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN ANALYTICS DASHBOARD
// ============================================================================

export const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('simulator');

  const tabs = [
    { id: 'simulator', label: 'Bet Simulator', icon: '🎰' },
    { id: 'parlays', label: 'Parlays Optimizer', icon: '🎯' },
    { id: 'hedge', label: 'Hedge Calculator', icon: '🛡️' },
    { id: 'arbitrage', label: 'Arbitrage Finder', icon: '💰' }
  ];

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '15px',
      color: '#94a3b8'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '8px'
    },
    tab: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: active ? '#3b82f6' : '#1e293b',
      border: 'none',
      borderRadius: '10px',
      color: active ? 'white' : '#94a3b8',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Advanced Analytics Suite</h1>
        <p style={styles.subtitle}>
          Powerful tools to optimize your betting strategy
        </p>
      </div>

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'simulator' && <BetSimulator />}
      {activeTab === 'parlays' && <ParlaysOptimizer />}
      {activeTab === 'hedge' && <HedgeCalculator />}
      {activeTab === 'arbitrage' && <ArbitrageFinder />}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  AdvancedAnalyticsDashboard,
  BetSimulator,
  ParlaysOptimizer,
  HedgeCalculator,
  ArbitrageFinder,
  // Utilities
  americanToDecimal,
  decimalToAmerican,
  impliedProbability,
  kellyBetSize,
  formatCurrency,
  formatPercent,
  formatOdds
};
