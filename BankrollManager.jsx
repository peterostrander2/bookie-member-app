/**
 * BANKROLL MANAGER - ENHANCED v2.0
 *
 * Complete bankroll management suite featuring:
 * - Comprehensive bet history with sorting, pagination, expandable rows
 * - Quick bet entry with auto-populate
 * - Enhanced Kelly Calculator (Full/Half/Quarter)
 * - Risk management with exposure tracking
 * - Export (CSV, PDF, Share Image)
 * - SVG charts for bankroll tracking
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getBankrollSettings,
  saveBankrollSettings,
  getBankrollStats,
  getBetHistory,
  recordBet,
  gradeBet,
  calculateBetSize,
  calculateRiskOfRuin,
  simulateBankroll,
  calculateKelly,
  americanToDecimal,
  confidenceToWinProbability
} from './kellyCalculator';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated } from './LiveIndicators';

// ========== SVG CHART COMPONENTS ==========

/**
 * Bankroll Growth Line Chart
 */
const BankrollChart = ({ data, width = 500, height = 200 }) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        Not enough data for chart
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;

  const startVal = data[0].value;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Starting line
  const startY = padding.top + chartHeight - ((startVal - minVal) / range) * chartHeight;

  const currentVal = data[data.length - 1].value;
  const isProfit = currentVal >= startVal;

  return (
    <svg width={width} height={height}>
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#0a0a0f" rx="4" />

      {/* Starting bankroll line */}
      <line
        x1={padding.left}
        y1={startY}
        x2={padding.left + chartWidth}
        y2={startY}
        stroke="#666"
        strokeDasharray="4,4"
        strokeWidth="1"
      />

      {/* Area fill */}
      <path d={areaD} fill={isProfit ? '#00FF8815' : '#FF444415'} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={isProfit ? '#00FF88' : '#FF4444'} strokeWidth="2" />

      {/* Data points (sparse) */}
      {points.filter((_, i) => i % Math.ceil(points.length / 10) === 0 || i === points.length - 1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={isProfit ? '#00FF88' : '#FF4444'} />
      ))}

      {/* Y-axis labels */}
      {[minVal, (minVal + maxVal) / 2, maxVal].map((v, i) => {
        const y = padding.top + chartHeight - ((v - minVal) / range) * chartHeight;
        return (
          <text key={i} x={padding.left - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end">
            ${v.toFixed(0)}
          </text>
        );
      })}

      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0 || i === points.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={height - 5} fill="#6b7280" fontSize="9" textAnchor="middle">
          {p.label}
        </text>
      ))}

      {/* Current value annotation */}
      <text x={width - 10} y={20} fill={isProfit ? '#00FF88' : '#FF4444'} fontSize="12" textAnchor="end" fontWeight="bold">
        ${currentVal.toFixed(0)}
      </text>
    </svg>
  );
};

/**
 * Win/Loss Distribution Histogram
 */
const WinLossHistogram = ({ data, width = 300, height = 150 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const padding = { top: 15, right: 10, bottom: 25, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map(d => d.count));
  const barWidth = (chartWidth / data.length) * 0.8;
  const gap = (chartWidth / data.length) * 0.2;

  return (
    <svg width={width} height={height}>
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#0a0a0f" rx="4" />

      {data.map((d, i) => {
        const barHeight = (d.count / maxCount) * chartHeight;
        const x = padding.left + i * (barWidth + gap) + gap / 2;
        const y = padding.top + chartHeight - barHeight;
        const color = d.label === 'Wins' ? '#00FF88' : d.label === 'Losses' ? '#FF4444' : '#6b7280';

        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="2" />
            <text x={x + barWidth / 2} y={y - 4} fill={color} fontSize="10" textAnchor="middle" fontWeight="bold">
              {d.count}
            </text>
            <text x={x + barWidth / 2} y={height - 5} fill="#6b7280" fontSize="9" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Units by Month Bar Chart
 */
const MonthlyUnitsChart = ({ data, width = 400, height = 180 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 15, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.units);
  const maxAbs = Math.max(Math.abs(Math.min(...values, 0)), Math.abs(Math.max(...values, 0)), 1);

  const barWidth = Math.min((chartWidth / data.length) * 0.7, 35);
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

  const zeroY = padding.top + chartHeight / 2;

  return (
    <svg width={width} height={height}>
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#0a0a0f" rx="4" />

      {/* Zero line */}
      <line x1={padding.left} y1={zeroY} x2={padding.left + chartWidth} y2={zeroY} stroke="#666" strokeWidth="1" />

      {data.map((d, i) => {
        const x = padding.left + gap + i * (barWidth + gap);
        const barHeight = Math.abs(d.units / maxAbs) * (chartHeight / 2);
        const y = d.units >= 0 ? zeroY - barHeight : zeroY;
        const color = d.units >= 0 ? '#00FF88' : '#FF4444';

        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="2" opacity="0.8" />
            <text
              x={x + barWidth / 2}
              y={d.units >= 0 ? y - 4 : y + barHeight + 12}
              fill={color}
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              {d.units >= 0 ? '+' : ''}{d.units.toFixed(1)}
            </text>
            <text x={x + barWidth / 2} y={height - 8} fill="#9ca3af" fontSize="8" textAnchor="middle">
              {d.month}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      <text x={padding.left - 8} y={padding.top + 10} fill="#6b7280" fontSize="9" textAnchor="end">+{maxAbs.toFixed(0)}</text>
      <text x={padding.left - 8} y={zeroY + 4} fill="#6b7280" fontSize="9" textAnchor="end">0</text>
      <text x={padding.left - 8} y={padding.top + chartHeight - 2} fill="#6b7280" fontSize="9" textAnchor="end">-{maxAbs.toFixed(0)}</text>
    </svg>
  );
};

// ========== BET ENTRY FORM ==========

const BetEntryForm = ({ onSubmit, onClose, autoFillData = null }) => {
  const [formData, setFormData] = useState({
    game: autoFillData?.game || '',
    pick: autoFillData?.pick || '',
    sport: autoFillData?.sport || 'NBA',
    odds: autoFillData?.odds || -110,
    stake: autoFillData?.stake || 50,
    confidence: autoFillData?.confidence || 70,
    notes: ''
  });

  const [calculatedBet, setCalculatedBet] = useState(null);

  useEffect(() => {
    if (formData.confidence && formData.odds) {
      const result = calculateBetSize(formData.confidence, formData.odds);
      setCalculatedBet(result);
    }
  }, [formData.confidence, formData.odds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const betData = {
      ...formData,
      betAmount: formData.stake,
      timestamp: Date.now()
    };
    onSubmit(betData);
  };

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF', 'Soccer', 'Tennis', 'Other'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '25px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', margin: 0 }}>Add New Bet</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px' }}>
            {/* Sport Selection */}
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Game */}
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Game</label>
              <input
                type="text"
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                placeholder="e.g., Lakers vs Celtics"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Pick */}
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Pick</label>
              <input
                type="text"
                value={formData.pick}
                onChange={(e) => setFormData({ ...formData, pick: e.target.value })}
                placeholder="e.g., Lakers -3.5"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Odds & Confidence Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Odds (American)</label>
                <input
                  type="number"
                  value={formData.odds}
                  onChange={(e) => setFormData({ ...formData, odds: parseInt(e.target.value) || -110 })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#0a0a0f',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>
                  Confidence: {formData.confidence}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Stake with Kelly Suggestion */}
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>
                Stake ($)
                {calculatedBet && calculatedBet.hasEdge && (
                  <span style={{ color: '#00D4FF', marginLeft: '10px' }}>
                    Kelly suggests: ${calculatedBet.betAmount}
                  </span>
                )}
              </label>
              <input
                type="number"
                value={formData.stake}
                onChange={(e) => setFormData({ ...formData, stake: parseFloat(e.target.value) || 0 })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {calculatedBet && calculatedBet.hasEdge && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stake: calculatedBet.betAmount })}
                  style={{
                    marginTop: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#00D4FF20',
                    color: '#00D4FF',
                    border: '1px solid #00D4FF50',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Use Kelly Size
                </button>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Stake Warning */}
            {formData.stake > 0 && calculatedBet && formData.stake > calculatedBet.bankroll * 0.05 && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#FFD70020',
                border: '1px solid #FFD70050',
                borderRadius: '8px',
                color: '#FFD700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                <span>Stake exceeds 5% of bankroll! Consider reducing.</span>
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#00D4FF',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Add Bet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========== BET HISTORY TABLE ==========

const BetHistoryTable = ({ bets, onGrade, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filterResult, setFilterResult] = useState('all');

  const itemsPerPage = 20;

  const toggleExpand = (betId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(betId)) {
      newExpanded.delete(betId);
    } else {
      newExpanded.add(betId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedBets = useMemo(() => {
    let filtered = bets;
    if (filterResult !== 'all') {
      filtered = bets.filter(b =>
        filterResult === 'pending' ? !b.result : b.result === filterResult
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'pnl') {
        aVal = a.pnl || 0;
        bVal = b.pnl || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bets, sortConfig, filterResult]);

  const paginatedBets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBets.slice(start, start + itemsPerPage);
  }, [sortedBets, currentPage]);

  const totalPages = Math.ceil(sortedBets.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortHeader = ({ label, sortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      style={{
        padding: '12px 8px',
        color: '#6b7280',
        fontSize: '10px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderBottom: '1px solid #333',
        textAlign: 'left',
        userSelect: 'none'
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span style={{ marginLeft: '4px' }}>
          {sortConfig.direction === 'desc' ? '↓' : '↑'}
        </span>
      )}
    </th>
  );

  return (
    <div>
      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'WIN', 'LOSS', 'PUSH'].map(filter => (
          <button
            key={filter}
            onClick={() => { setFilterResult(filter); setCurrentPage(1); }}
            style={{
              padding: '6px 12px',
              backgroundColor: filterResult === filter ? '#00D4FF' : '#0a0a0f',
              color: filterResult === filter ? '#000' : '#9ca3af',
              border: filterResult === filter ? 'none' : '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'capitalize'
            }}
          >
            {filter === 'all' ? 'All Bets' : filter}
          </button>
        ))}
        <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: 'auto', alignSelf: 'center' }}>
          {sortedBets.length} bets
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0a0a0f' }}>
              <th style={{ width: '30px', padding: '12px 8px', borderBottom: '1px solid #333' }}></th>
              <SortHeader label="Date" sortKey="timestamp" />
              <SortHeader label="Sport" sortKey="sport" />
              <SortHeader label="Game" sortKey="game" />
              <SortHeader label="Pick" sortKey="pick" />
              <SortHeader label="Odds" sortKey="odds" />
              <SortHeader label="Stake" sortKey="betAmount" />
              <SortHeader label="Result" sortKey="result" />
              <SortHeader label="P/L" sortKey="pnl" />
              <th style={{ padding: '12px 8px', borderBottom: '1px solid #333', width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedBets.map((bet, idx) => (
              <React.Fragment key={bet.id}>
                <tr style={{ backgroundColor: idx % 2 === 0 ? '#1a1a2e' : '#151520' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <button
                      onClick={() => toggleExpand(bet.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {expandedRows.has(bet.id) ? '▼' : '▶'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#9ca3af' }}>
                    {new Date(bet.timestamp).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#00D4FF' }}>
                    {bet.sport || '-'}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#fff', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bet.game || bet.description || '-'}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#fff', fontWeight: 'bold' }}>
                    {bet.pick || '-'}
                  </td>
                  <td style={{ padding: '10px 8px', color: bet.odds > 0 ? '#00FF88' : '#fff' }}>
                    {bet.odds > 0 ? '+' : ''}{bet.odds}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#fff' }}>
                    ${bet.betAmount?.toFixed(0)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: bet.result === 'WIN' ? '#00FF8820' : bet.result === 'LOSS' ? '#FF444420' : bet.result === 'PUSH' ? '#6b728020' : '#FFD70020',
                      color: bet.result === 'WIN' ? '#00FF88' : bet.result === 'LOSS' ? '#FF4444' : bet.result === 'PUSH' ? '#6b7280' : '#FFD700'
                    }}>
                      {bet.result || 'PENDING'}
                    </span>
                  </td>
                  <td style={{
                    padding: '10px 8px',
                    color: bet.pnl > 0 ? '#00FF88' : bet.pnl < 0 ? '#FF4444' : '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    {bet.pnl !== null ? `${bet.pnl >= 0 ? '+' : ''}$${bet.pnl?.toFixed(0)}` : '-'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {!bet.result && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => onGrade(bet.id, 'WIN')} style={gradeButtonStyle('#00FF88')}>W</button>
                        <button onClick={() => onGrade(bet.id, 'LOSS')} style={gradeButtonStyle('#FF4444')}>L</button>
                        <button onClick={() => onGrade(bet.id, 'PUSH')} style={gradeButtonStyle('#6b7280')}>P</button>
                      </div>
                    )}
                  </td>
                </tr>
                {/* Expanded Row */}
                {expandedRows.has(bet.id) && (
                  <tr style={{ backgroundColor: '#0a0a0f' }}>
                    <td colSpan={10} style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>CONFIDENCE</div>
                          <div style={{ color: '#fff' }}>{bet.confidence || '-'}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>DECIMAL ODDS</div>
                          <div style={{ color: '#fff' }}>{americanToDecimal(bet.odds).toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>POTENTIAL WIN</div>
                          <div style={{ color: '#00FF88' }}>
                            ${(bet.betAmount * (americanToDecimal(bet.odds) - 1)).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>PLACED</div>
                          <div style={{ color: '#9ca3af' }}>{new Date(bet.timestamp).toLocaleString()}</div>
                        </div>
                        {bet.notes && (
                          <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>NOTES</div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>{bet.notes}</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={paginationButtonStyle(currentPage === 1)}
          >
            ← Prev
          </button>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={paginationButtonStyle(currentPage === totalPages)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

const gradeButtonStyle = (color) => ({
  padding: '4px 8px',
  backgroundColor: `${color}20`,
  color: color,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '10px',
  fontWeight: 'bold'
});

const paginationButtonStyle = (disabled) => ({
  padding: '8px 16px',
  backgroundColor: disabled ? '#1a1a2e' : '#00D4FF20',
  color: disabled ? '#333' : '#00D4FF',
  border: disabled ? '1px solid #333' : '1px solid #00D4FF50',
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '12px'
});

// ========== KELLY CALCULATOR ENHANCED ==========

const KellyCalculatorEnhanced = ({ settings }) => {
  const [confidence, setConfidence] = useState(70);
  const [odds, setOdds] = useState(-110);
  const [kellyType, setKellyType] = useState('quarter'); // full, half, quarter
  const [showTooltip, setShowTooltip] = useState(false);

  const kellyFractions = { full: 1, half: 0.5, quarter: 0.25 };

  const result = useMemo(() => {
    const winProb = confidenceToWinProbability(confidence);
    return calculateKelly(winProb, odds, kellyFractions[kellyType]);
  }, [confidence, odds, kellyType]);

  const betAmount = useMemo(() => {
    if (!result.hasEdge || !settings) return 0;
    let pct = result.fractionalKellyPercent;
    pct = Math.min(pct, settings.maxBetPercent || 5);
    return (pct / 100) * (settings.currentBankroll || 1000);
  }, [result, settings]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Input Panel */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>Kelly Calculator</h3>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ?
          </button>
        </div>

        {/* Educational Tooltip */}
        {showTooltip && (
          <div style={{
            backgroundColor: '#0a0a0f',
            border: '1px solid #00D4FF50',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <strong style={{ color: '#00D4FF' }}>What is Kelly Criterion?</strong>
            <p style={{ margin: '10px 0' }}>
              The Kelly Criterion calculates the optimal bet size to maximize long-term growth while managing risk.
            </p>
            <strong style={{ color: '#00D4FF' }}>Formula: f* = (bp - q) / b</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>f* = fraction of bankroll to bet</li>
              <li>b = odds received (decimal - 1)</li>
              <li>p = probability of winning</li>
              <li>q = probability of losing (1 - p)</li>
            </ul>
            <strong style={{ color: '#FFD700' }}>Important:</strong> Full Kelly is aggressive. Most pros use 1/4 to 1/2 Kelly for smoother growth.
          </div>
        )}

        {/* Kelly Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
            Kelly Fraction
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'quarter', label: 'Quarter (25%)', desc: 'Conservative' },
              { key: 'half', label: 'Half (50%)', desc: 'Moderate' },
              { key: 'full', label: 'Full (100%)', desc: 'Aggressive' }
            ].map(k => (
              <button
                key={k.key}
                onClick={() => setKellyType(k.key)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  backgroundColor: kellyType === k.key ? '#00D4FF' : '#0a0a0f',
                  color: kellyType === k.key ? '#000' : '#9ca3af',
                  border: kellyType === k.key ? 'none' : '1px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{k.label.split(' ')[0]}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{k.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Confidence Slider */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
            Your Confidence: <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>{confidence}%</span>
          </label>
          <input
            type="range"
            min="50"
            max="95"
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280' }}>
            <span>50% (Coin flip)</span>
            <span>95% (Very confident)</span>
          </div>
        </div>

        {/* Odds Input */}
        <div>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
            American Odds
          </label>
          <input
            type="number"
            value={odds}
            onChange={(e) => setOdds(parseInt(e.target.value) || -110)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0a0a0f',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              fontSize: '18px',
              textAlign: 'center'
            }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            {[-110, -105, 100, 150, 200].map(o => (
              <button
                key={o}
                onClick={() => setOdds(o)}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: odds === o ? '#333' : '#0a0a0f',
                  color: '#9ca3af',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {o > 0 ? '+' : ''}{o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '16px' }}>Recommended Bet</h3>

        {/* Main Recommendation */}
        <div style={{
          textAlign: 'center',
          padding: '25px',
          backgroundColor: result.hasEdge ? '#00FF8815' : '#FF444415',
          borderRadius: '12px',
          marginBottom: '20px',
          border: `1px solid ${result.hasEdge ? '#00FF8830' : '#FF444430'}`
        }}>
          <div style={{
            color: result.recommendation?.color || '#9ca3af',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            {result.recommendation?.action || 'CALCULATING'}
          </div>
          <div style={{ color: '#fff', fontSize: '42px', fontWeight: 'bold' }}>
            ${betAmount.toFixed(0)}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '5px' }}>
            {(betAmount / (settings?.currentBankroll || 1000) * 100).toFixed(1)}% of bankroll
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatBox
            label="Your Edge"
            value={`${result.edge > 0 ? '+' : ''}${result.edge?.toFixed(1) || 0}%`}
            color={result.edge > 0 ? '#00FF88' : '#FF4444'}
          />
          <StatBox
            label="Win Probability"
            value={`${result.yourProbability?.toFixed(1) || 50}%`}
            color="#00D4FF"
          />
          <StatBox
            label="Break Even"
            value={`${result.impliedProbability?.toFixed(1) || 50}%`}
            color="#9ca3af"
          />
          <StatBox
            label="Expected Value"
            value={`${result.expectedValue > 0 ? '+' : ''}$${((result.expectedValue || 0) * betAmount / 100).toFixed(2)}`}
            color={result.expectedValue > 0 ? '#00FF88' : '#FF4444'}
          />
        </div>

        {/* Comparison */}
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#0a0a0f',
          borderRadius: '8px',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#6b7280' }}>Full Kelly ({kellyFractions.full * 100}%)</span>
            <span style={{ color: '#9ca3af' }}>${((result.fullKellyPercent / 100) * (settings?.currentBankroll || 1000)).toFixed(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#6b7280' }}>Half Kelly (50%)</span>
            <span style={{ color: '#9ca3af' }}>${((result.fullKellyPercent * 0.5 / 100) * (settings?.currentBankroll || 1000)).toFixed(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Quarter Kelly (25%)</span>
            <span style={{ color: '#9ca3af' }}>${((result.fullKellyPercent * 0.25 / 100) * (settings?.currentBankroll || 1000)).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div style={{
    padding: '12px',
    backgroundColor: '#0a0a0f',
    borderRadius: '6px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>{label}</div>
    <div style={{ color, fontWeight: 'bold', fontSize: '14px' }}>{value}</div>
  </div>
);

// ========== RISK MANAGEMENT PANEL ==========

const RiskManagementPanel = ({ stats, settings, betHistory }) => {
  const pendingBets = betHistory.filter(b => !b.result);
  const todayBets = betHistory.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.timestamp).toDateString() === today;
  });

  const pendingExposure = pendingBets.reduce((sum, b) => sum + (b.betAmount || 0), 0);
  const todayWagered = todayBets.reduce((sum, b) => sum + (b.betAmount || 0), 0);
  const dailyLimit = (settings?.currentBankroll || 1000) * 0.1; // 10% daily limit

  const exposurePct = (pendingExposure / (settings?.currentBankroll || 1000)) * 100;
  const dailyPct = (todayWagered / dailyLimit) * 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {/* Daily Bet Tracker */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>📅 Daily Bet Tracker</h4>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Today's Wagers</span>
            <span style={{ color: dailyPct > 100 ? '#FF4444' : '#00FF88', fontWeight: 'bold' }}>
              ${todayWagered.toFixed(0)} / ${dailyLimit.toFixed(0)}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#0a0a0f', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(dailyPct, 100)}%`,
              height: '100%',
              backgroundColor: dailyPct > 100 ? '#FF4444' : dailyPct > 75 ? '#FFD700' : '#00FF88',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '5px' }}>
            {todayBets.length} bets placed today
          </div>
        </div>

        {dailyPct > 100 && (
          <div style={{
            padding: '10px',
            backgroundColor: '#FF444420',
            border: '1px solid #FF444450',
            borderRadius: '6px',
            color: '#FF4444',
            fontSize: '11px'
          }}>
            ⚠️ You've exceeded your daily limit. Consider taking a break.
          </div>
        )}
      </div>

      {/* Pending Exposure */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>💼 Max Exposure</h4>

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: exposurePct > 20 ? '#FF4444' : exposurePct > 10 ? '#FFD700' : '#00FF88'
          }}>
            ${pendingExposure.toFixed(0)}
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>
            {exposurePct.toFixed(1)}% of bankroll at risk
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '11px'
        }}>
          <div style={{ padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ color: '#6b7280' }}>Pending Bets</div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>{pendingBets.length}</div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ color: '#6b7280' }}>Potential Win</div>
            <div style={{ color: '#00FF88', fontWeight: 'bold' }}>
              ${pendingBets.reduce((sum, b) => sum + b.betAmount * (americanToDecimal(b.odds) - 1), 0).toFixed(0)}
            </div>
          </div>
        </div>

        {exposurePct > 15 && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#FFD70020',
            border: '1px solid #FFD70050',
            borderRadius: '6px',
            color: '#FFD700',
            fontSize: '11px'
          }}>
            ⚠️ High exposure - consider waiting for results before placing more bets.
          </div>
        )}
      </div>

      {/* Suggested Bet Sizes */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>🎯 Suggested Bet Sizes</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { tier: 'Golden', confidence: 85, color: '#FFD700' },
            { tier: 'Super', confidence: 75, color: '#00FF88' },
            { tier: 'Harmonic', confidence: 65, color: '#00D4FF' },
            { tier: 'Partial', confidence: 55, color: '#9ca3af' }
          ].map(t => {
            const result = calculateBetSize(t.confidence, -110, settings);
            return (
              <div key={t.tier} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#0a0a0f',
                borderRadius: '6px',
                borderLeft: `3px solid ${t.color}`
              }}>
                <div>
                  <div style={{ color: t.color, fontWeight: 'bold', fontSize: '12px' }}>{t.tier}</div>
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>{t.confidence}% confidence</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>${result.betAmount}</div>
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>{result.units}u</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ========== EXPORT FUNCTIONALITY ==========

const ExportPanel = ({ betHistory, stats, settings }) => {
  const canvasRef = useRef(null);

  const exportCSV = () => {
    const headers = ['Date', 'Sport', 'Game', 'Pick', 'Odds', 'Stake', 'Result', 'P/L', 'Notes'];
    const rows = betHistory.map(b => [
      new Date(b.timestamp).toLocaleDateString(),
      b.sport || '',
      b.game || b.description || '',
      b.pick || '',
      b.odds,
      b.betAmount,
      b.result || 'Pending',
      b.pnl || 0,
      b.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betting_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateShareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 600, 400);

    // Header
    ctx.fillStyle = '#00D4FF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('My Betting Stats', 30, 50);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Record: ${stats.record.wins}-${stats.record.losses}`, 30, 100);
    ctx.fillText(`Win Rate: ${stats.winRate}%`, 30, 130);
    ctx.fillText(`ROI: ${stats.roi >= 0 ? '+' : ''}${stats.roi}%`, 30, 160);
    ctx.fillText(`Total P/L: ${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl}`, 30, 190);

    // Bankroll
    ctx.fillStyle = stats.totalPnl >= 0 ? '#00FF88' : '#FF4444';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`$${stats.currentBankroll}`, 30, 260);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Current Bankroll', 30, 285);

    // Footer
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 350, 600, 50);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()} • Powered by Bookie-o-em`, 30, 380);

    // Download
    const link = document.createElement('a');
    link.download = `betting_stats_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const generatePDFReport = () => {
    // Create a simple HTML report and open print dialog
    const report = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Betting Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #00D4FF; }
          .stat { margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
          .win { color: green; }
          .loss { color: red; }
        </style>
      </head>
      <body>
        <h1>Betting Performance Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>

        <h2>Summary</h2>
        <div class="stat">Record: ${stats.record.wins}-${stats.record.losses}-${stats.record.pushes}</div>
        <div class="stat">Win Rate: ${stats.winRate}%</div>
        <div class="stat">ROI: ${stats.roi >= 0 ? '+' : ''}${stats.roi}%</div>
        <div class="stat">Total P/L: ${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl}</div>
        <div class="stat">Current Bankroll: $${stats.currentBankroll}</div>
        <div class="stat">Max Drawdown: ${stats.maxDrawdown}%</div>

        <h2>Recent Bets (Last 50)</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Game</th>
            <th>Pick</th>
            <th>Odds</th>
            <th>Stake</th>
            <th>Result</th>
            <th>P/L</th>
          </tr>
          ${betHistory.slice(0, 50).map(b => `
            <tr>
              <td>${new Date(b.timestamp).toLocaleDateString()}</td>
              <td>${b.game || b.description || '-'}</td>
              <td>${b.pick || '-'}</td>
              <td>${b.odds > 0 ? '+' : ''}${b.odds}</td>
              <td>$${b.betAmount}</td>
              <td class="${b.result === 'WIN' ? 'win' : b.result === 'LOSS' ? 'loss' : ''}">${b.result || 'Pending'}</td>
              <td class="${b.pnl > 0 ? 'win' : b.pnl < 0 ? 'loss' : ''}">${b.pnl !== null ? `$${b.pnl}` : '-'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(report);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '16px' }}>📤 Export & Share</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        <button
          onClick={exportCSV}
          style={{
            padding: '20px',
            backgroundColor: '#0a0a0f',
            border: '1px solid #333',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>Export CSV</div>
          <div style={{ color: '#6b7280', fontSize: '10px' }}>All bet history</div>
        </button>

        <button
          onClick={generatePDFReport}
          style={{
            padding: '20px',
            backgroundColor: '#0a0a0f',
            border: '1px solid #333',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>PDF Report</div>
          <div style={{ color: '#6b7280', fontSize: '10px' }}>Printable summary</div>
        </button>

        <button
          onClick={generateShareImage}
          style={{
            padding: '20px',
            backgroundColor: '#0a0a0f',
            border: '1px solid #333',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>Share Image</div>
          <div style={{ color: '#6b7280', fontSize: '10px' }}>Social media ready</div>
        </button>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

// ========== MAIN COMPONENT ==========

const BankrollManager = () => {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [betHistory, setBetHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBetForm, setShowBetForm] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({});

  const loadData = useCallback(() => {
    const s = getBankrollSettings();
    setSettings(s);
    setTempSettings(s);
    setStats(getBankrollStats());
    setBetHistory(getBetHistory(500));
  }, []);

  const { lastUpdated, isRefreshing, refresh } = useAutoRefresh(loadData, {
    interval: 30000,
    immediate: true
  });

  const handleAddBet = (betData) => {
    recordBet(betData);
    loadData();
    setShowBetForm(false);
  };

  const handleGradeBet = (betId, result) => {
    gradeBet(betId, result);
    loadData();
  };

  const handleSaveSettings = () => {
    saveBankrollSettings(tempSettings);
    setSettings(tempSettings);
    setEditingSettings(false);
    loadData();
  };

  // Chart data
  const bankrollChartData = useMemo(() => {
    if (!betHistory || betHistory.length === 0) return [];

    const sorted = [...betHistory].filter(b => b.result).reverse();
    let running = settings?.startingBankroll || 1000;

    const data = [{ label: 'Start', value: running }];

    sorted.forEach((bet, i) => {
      running += bet.pnl || 0;
      if (i % 3 === 0 || i === sorted.length - 1) {
        data.push({
          label: `${i + 1}`,
          value: running
        });
      }
    });

    return data;
  }, [betHistory, settings]);

  const winLossData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Wins', count: stats.record.wins },
      { label: 'Losses', count: stats.record.losses },
      { label: 'Pushes', count: stats.record.pushes }
    ];
  }, [stats]);

  const monthlyUnitsData = useMemo(() => {
    const byMonth = {};
    betHistory.filter(b => b.result).forEach(bet => {
      const date = new Date(bet.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = 0;
      byMonth[key] += (bet.pnl || 0) / (settings?.unitSize || 50);
    });

    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([month, units]) => ({
        month: month.split('-')[1],
        units
      }));
  }, [betHistory, settings]);

  if (!settings || !stats) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading bankroll data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💰 Bankroll Manager
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Complete bet tracking, Kelly sizing, and risk management
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LastUpdated timestamp={lastUpdated} isRefreshing={isRefreshing} onRefresh={refresh} compact />
            <button
              onClick={() => setShowBetForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00D4FF',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              + Add Bet
            </button>
          </div>
        </div>

        {/* Stop Loss Warning */}
        {stats.stopLossTriggered && (
          <div style={{
            backgroundColor: '#FF444420',
            border: '1px solid #FF4444',
            borderRadius: '12px',
            padding: '15px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <div style={{ color: '#FF4444', fontWeight: 'bold' }}>Stop Loss Triggered</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                You've hit {settings.stopLossPercent}% drawdown. Consider taking a break.
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'history', label: '📝 Bet History' },
            { key: 'calculator', label: '🧮 Kelly Calculator' },
            { key: 'risk', label: '⚠️ Risk Management' },
            { key: 'charts', label: '📈 Charts' },
            { key: 'export', label: '📤 Export' },
            { key: 'settings', label: '⚙️ Settings' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.key ? '#00D4FF' : '#1a1a2e',
                color: activeTab === tab.key ? '#000' : '#9ca3af',
                border: activeTab === tab.key ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px'
            }}>
              <StatCard
                label="Current Bankroll"
                value={`$${stats.currentBankroll.toLocaleString()}`}
                subValue={`Started: $${stats.startingBankroll.toLocaleString()}`}
                color={stats.currentBankroll >= stats.startingBankroll ? '#00FF88' : '#FF4444'}
              />
              <StatCard
                label="Total P/L"
                value={`${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toLocaleString()}`}
                subValue={`${stats.roi >= 0 ? '+' : ''}${stats.roi}% ROI`}
                color={stats.totalPnl >= 0 ? '#00FF88' : '#FF4444'}
              />
              <StatCard
                label="Record"
                value={`${stats.record.wins}-${stats.record.losses}`}
                subValue={`${stats.winRate}% win rate`}
                color={stats.winRate >= 52 ? '#00FF88' : '#9ca3af'}
              />
              <StatCard
                label="Pending Bets"
                value={stats.pendingBets}
                subValue={`${betHistory.filter(b => !b.result).reduce((s, b) => s + b.betAmount, 0).toFixed(0)} at risk`}
                color="#FFD700"
              />
              <StatCard
                label="Max Drawdown"
                value={`${stats.maxDrawdown}%`}
                subValue={`Current: ${stats.currentDrawdown}%`}
                color={stats.maxDrawdown < 15 ? '#00FF88' : stats.maxDrawdown < 25 ? '#FFD700' : '#FF4444'}
              />
              <StatCard
                label="Avg Bet Size"
                value={`$${stats.avgBetSize}`}
                subValue={`${(stats.avgBetSize / settings.unitSize).toFixed(1)} units`}
                color="#00D4FF"
              />
            </div>

            {/* Quick Chart */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>Bankroll Growth</h3>
              <BankrollChart data={bankrollChartData} width={Math.min(800, window.innerWidth - 100)} height={200} />
            </div>
          </div>
        )}

        {/* Bet History Tab */}
        {activeTab === 'history' && (
          <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
            <BetHistoryTable
              bets={betHistory}
              onGrade={handleGradeBet}
            />
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <KellyCalculatorEnhanced settings={settings} />
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk' && (
          <RiskManagementPanel stats={stats} settings={settings} betHistory={betHistory} />
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📈 Bankroll Over Time</h3>
              <BankrollChart data={bankrollChartData} width={Math.min(900, window.innerWidth - 100)} height={250} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📊 Win/Loss Distribution</h3>
                <WinLossHistogram data={winLossData} width={300} height={150} />
              </div>

              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📅 Units by Month</h3>
                <MonthlyUnitsChart data={monthlyUnitsData} width={400} height={180} />
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <ExportPanel betHistory={betHistory} stats={stats} settings={settings} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>Bankroll Settings</h3>
              {!editingSettings ? (
                <button
                  onClick={() => setEditingSettings(true)}
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
                  Edit Settings
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setTempSettings(settings); setEditingSettings(false); }}
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
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#00FF88',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <SettingInput
                label="Starting Bankroll"
                value={tempSettings.startingBankroll}
                onChange={(v) => setTempSettings({ ...tempSettings, startingBankroll: parseFloat(v) || 0 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Current Bankroll"
                value={tempSettings.currentBankroll}
                onChange={(v) => setTempSettings({ ...tempSettings, currentBankroll: parseFloat(v) || 0 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Unit Size"
                value={tempSettings.unitSize}
                onChange={(v) => setTempSettings({ ...tempSettings, unitSize: parseFloat(v) || 50 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Kelly Fraction"
                value={tempSettings.kellyFraction}
                onChange={(v) => setTempSettings({ ...tempSettings, kellyFraction: parseFloat(v) || 0.25 })}
                disabled={!editingSettings}
                suffix="(0.25 = 1/4 Kelly)"
              />
              <SettingInput
                label="Max Bet %"
                value={tempSettings.maxBetPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, maxBetPercent: parseFloat(v) || 5 })}
                disabled={!editingSettings}
                suffix="%"
              />
              <SettingInput
                label="Min Bet %"
                value={tempSettings.minBetPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, minBetPercent: parseFloat(v) || 0.5 })}
                disabled={!editingSettings}
                suffix="%"
              />
              <SettingInput
                label="Stop Loss"
                value={tempSettings.stopLossPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, stopLossPercent: parseFloat(v) || 25 })}
                disabled={!editingSettings}
                suffix="% drawdown"
              />
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#0a0a0f',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#9ca3af'
            }}>
              <strong style={{ color: '#00D4FF' }}>Kelly Fraction Guide:</strong>
              <br />• 0.25 (Quarter Kelly) - Conservative, recommended for most bettors
              <br />• 0.50 (Half Kelly) - Moderate risk, for confident bettors
              <br />• 1.00 (Full Kelly) - Maximum growth but high variance
            </div>
          </div>
        )}

        {/* Bet Entry Modal */}
        {showBetForm && (
          <BetEntryForm
            onSubmit={handleAddBet}
            onClose={() => setShowBetForm(false)}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components

const StatCard = ({ label, value, subValue, color = '#00D4FF' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ color: color, fontSize: '24px', fontWeight: 'bold' }}>
      {value}
    </div>
    {subValue && (
      <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
        {subValue}
      </div>
    )}
  </div>
);

const SettingInput = ({ label, value, onChange, disabled, prefix, suffix }) => (
  <div>
    <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {prefix && <span style={{ color: '#6b7280' }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px',
          backgroundColor: disabled ? '#1a1a2e' : '#0a0a0f',
          color: disabled ? '#6b7280' : '#fff',
          border: '1px solid #333',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />
      {suffix && <span style={{ color: '#6b7280', fontSize: '12px' }}>{suffix}</span>}
    </div>
  </div>
);

export default BankrollManager;
