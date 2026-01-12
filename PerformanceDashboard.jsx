/**
 * PERFORMANCE DASHBOARD - ENHANCED v2.0
 *
 * The ultimate accountability tool. Shows:
 * - Comprehensive statistics panel with detailed metrics
 * - SVG-based charts (line, bar, pie)
 * - Breakdowns by sport, bet type, confidence level
 * - Advanced filtering (date range, sport, tier)
 * - AI-powered performance insights
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated } from './LiveIndicators';

// ========== SVG CHART COMPONENTS ==========

/**
 * Line Chart - Win Rate Over Time
 */
const LineChart = ({ data, width = 400, height = 200, color = '#00D4FF', label = 'Win Rate %' }) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        Not enough data for chart
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) - 5;
  const maxVal = Math.max(...values) + 5;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Grid lines
  const gridLines = [0, 25, 50, 75, 100].filter(v => v >= minVal && v <= maxVal);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#0a0a0f" rx="4" />

      {/* Grid lines */}
      {gridLines.map(v => {
        const y = padding.top + chartHeight - ((v - minVal) / range) * chartHeight;
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="#333" strokeDasharray="2,2" />
            <text x={padding.left - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end">{v}%</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={`${color}15`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
          <circle cx={p.x} cy={p.y} r="6" fill="transparent" stroke={color} strokeWidth="1" opacity="0.5" />
        </g>
      ))}

      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={height - 5} fill="#6b7280" fontSize="9" textAnchor="middle">
          {p.label}
        </text>
      ))}

      {/* Label */}
      <text x={width / 2} y={12} fill="#9ca3af" fontSize="11" textAnchor="middle">{label}</text>
    </svg>
  );
};

/**
 * Bar Chart - Monthly P&L or ROI by Bet Type
 */
const BarChart = ({ data, width = 400, height = 200, color = '#00FF88', label = 'Units' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 0);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const barWidth = Math.min((chartWidth / data.length) * 0.7, 40);
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

  // Zero line position
  const zeroY = padding.top + chartHeight - ((0 - minVal) / range) * chartHeight;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#0a0a0f" rx="4" />

      {/* Zero line */}
      <line x1={padding.left} y1={zeroY} x2={padding.left + chartWidth} y2={zeroY} stroke="#666" strokeWidth="1" />

      {/* Y-axis labels */}
      {[minVal, minVal + range / 2, maxVal].map((v, i) => {
        const y = padding.top + chartHeight - ((v - minVal) / range) * chartHeight;
        return (
          <text key={i} x={padding.left - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end">
            {v >= 0 ? '+' : ''}{v.toFixed(1)}
          </text>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + gap + i * (barWidth + gap);
        const barHeight = Math.abs(d.value / range) * chartHeight;
        const y = d.value >= 0 ? zeroY - barHeight : zeroY;
        const barColor = d.value >= 0 ? '#00FF88' : '#FF4444';

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx="2"
              opacity="0.8"
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={d.value >= 0 ? y - 4 : y + barHeight + 12}
              fill={barColor}
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              {d.value >= 0 ? '+' : ''}{d.value.toFixed(1)}
            </text>
            {/* X-axis label */}
            <text
              x={x + barWidth / 2}
              y={height - 8}
              fill="#9ca3af"
              fontSize="9"
              textAnchor="middle"
              transform={data.length > 6 ? `rotate(-45, ${x + barWidth / 2}, ${height - 8})` : ''}
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Label */}
      <text x={width / 2} y={12} fill="#9ca3af" fontSize="11" textAnchor="middle">{label}</text>
    </svg>
  );
};

/**
 * Pie/Donut Chart - Sport Distribution
 */
const PieChart = ({ data, width = 200, height = 200, showLegend = true }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  const innerRadius = radius * 0.55;

  const colors = ['#00D4FF', '#00FF88', '#FFD700', '#FF6B6B', '#A855F7', '#F97316', '#EC4899'];

  let currentAngle = -Math.PI / 2;

  const segments = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const ix1 = centerX + innerRadius * Math.cos(startAngle);
    const iy1 = centerY + innerRadius * Math.sin(startAngle);
    const ix2 = centerX + innerRadius * Math.cos(endAngle);
    const iy2 = centerY + innerRadius * Math.sin(endAngle);

    const pathD = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}
      Z
    `;

    const midAngle = startAngle + angle / 2;
    const labelRadius = radius + 15;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY + labelRadius * Math.sin(midAngle);

    return {
      path: pathD,
      color: colors[i % colors.length],
      label: d.label,
      value: d.value,
      percentage: ((d.value / total) * 100).toFixed(1),
      labelX,
      labelY
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <svg width={width} height={height}>
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.color} stroke="#0a0a0f" strokeWidth="2" />
        ))}
        {/* Center text */}
        <text x={centerX} y={centerY - 5} fill="#fff" fontSize="18" textAnchor="middle" fontWeight="bold">
          {total}
        </text>
        <text x={centerX} y={centerY + 12} fill="#6b7280" fontSize="10" textAnchor="middle">
          total bets
        </text>
      </svg>

      {showLegend && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: seg.color }} />
              <span style={{ color: '#9ca3af', minWidth: '50px' }}>{seg.label}</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{seg.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Horizontal Bar Chart - ROI by Category
 */
const HorizontalBarChart = ({ data, width = 350, height = 180, label = 'ROI %' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 50, bottom: 10, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values.map(Math.abs), 10);

  const barHeight = Math.min((chartHeight / data.length) * 0.7, 25);
  const gap = (chartHeight - barHeight * data.length) / (data.length + 1);

  return (
    <svg width={width} height={height}>
      <text x={width / 2} y={12} fill="#9ca3af" fontSize="11" textAnchor="middle">{label}</text>

      {/* Zero line */}
      <line
        x1={padding.left + chartWidth / 2}
        y1={padding.top}
        x2={padding.left + chartWidth / 2}
        y2={padding.top + chartHeight}
        stroke="#666"
        strokeDasharray="2,2"
      />

      {data.map((d, i) => {
        const y = padding.top + gap + i * (barHeight + gap);
        const barWidth = (Math.abs(d.value) / maxVal) * (chartWidth / 2);
        const x = d.value >= 0 ? padding.left + chartWidth / 2 : padding.left + chartWidth / 2 - barWidth;
        const barColor = d.value >= 0 ? '#00FF88' : '#FF4444';

        return (
          <g key={i}>
            {/* Label */}
            <text
              x={padding.left - 5}
              y={y + barHeight / 2 + 4}
              fill="#9ca3af"
              fontSize="10"
              textAnchor="end"
            >
              {d.label}
            </text>

            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx="2"
              opacity="0.8"
            />

            {/* Value */}
            <text
              x={d.value >= 0 ? x + barWidth + 5 : x - 5}
              y={y + barHeight / 2 + 4}
              fill={barColor}
              fontSize="10"
              textAnchor={d.value >= 0 ? 'start' : 'end'}
              fontWeight="bold"
            >
              {d.value >= 0 ? '+' : ''}{d.value.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Mini Sparkline for inline stats
 */
const Sparkline = ({ data, width = 60, height = 20, color = '#00D4FF' }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastVal = data[data.length - 1];
  const firstVal = data[0];
  const trend = lastVal >= firstVal ? '#00FF88' : '#FF4444';

  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={trend}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={height - ((lastVal - min) / range) * height} r="2" fill={trend} />
    </svg>
  );
};

// ========== FILTER COMPONENTS ==========

/**
 * Date Range Filter
 */
const DateRangeFilter = ({ value, onChange }) => {
  const ranges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {ranges.map(r => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          style={{
            padding: '6px 12px',
            backgroundColor: value === r.value ? '#00D4FF' : '#1a1a2e',
            color: value === r.value ? '#000' : '#9ca3af',
            border: value === r.value ? 'none' : '1px solid #333',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: value === r.value ? 'bold' : 'normal'
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Multi-Select Filter for Sports/Tiers
 */
const MultiSelectFilter = ({ label, options, selected, onChange }) => {
  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#6b7280', fontSize: '11px' }}>{label}:</span>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggleOption(opt)}
            style={{
              padding: '4px 10px',
              backgroundColor: selected.includes(opt) ? '#00D4FF30' : '#0a0a0f',
              color: selected.includes(opt) ? '#00D4FF' : '#6b7280',
              border: `1px solid ${selected.includes(opt) ? '#00D4FF50' : '#333'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '10px',
              textTransform: 'uppercase'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Filter Panel
 */
const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '15px 20px',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>📊 Filters</span>
        <button
          onClick={() => onFilterChange({
            dateRange: 'all',
            sports: [],
            tiers: [],
            betTypes: []
          })}
          style={{
            background: 'none',
            border: 'none',
            color: '#00D4FF',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Reset All
        </button>
      </div>

      <DateRangeFilter value={filters.dateRange} onChange={(v) => onFilterChange({ ...filters, dateRange: v })} />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <MultiSelectFilter
          label="Sports"
          options={['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF']}
          selected={filters.sports}
          onChange={(v) => onFilterChange({ ...filters, sports: v })}
        />
        <MultiSelectFilter
          label="Tiers"
          options={['Golden', 'Super', 'Harmonic', 'Partial']}
          selected={filters.tiers}
          onChange={(v) => onFilterChange({ ...filters, tiers: v })}
        />
        <MultiSelectFilter
          label="Bet Type"
          options={['Spread', 'Total', 'ML', 'Prop']}
          selected={filters.betTypes}
          onChange={(v) => onFilterChange({ ...filters, betTypes: v })}
        />
      </div>
    </div>
  );
};

// ========== STATS COMPONENTS ==========

/**
 * Comprehensive Statistics Panel
 */
const ComprehensiveStatsPanel = ({ stats, bankroll }) => {
  const winStreak = stats?.currentWinStreak || 0;
  const loseStreak = stats?.currentLoseStreak || 0;
  const currentStreak = winStreak > 0 ? `${winStreak}W` : loseStreak > 0 ? `${loseStreak}L` : '0';
  const streakColor = winStreak > 0 ? '#00FF88' : loseStreak > 0 ? '#FF4444' : '#6b7280';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px'
    }}>
      {/* Win Rate by Tier */}
      <StatCard
        icon="🎯"
        label="Overall Win Rate"
        value={`${stats?.winRate?.toFixed(1) || 0}%`}
        subValue={`${stats?.wins || 0}W - ${stats?.losses || 0}L`}
        color={stats?.winRate >= 52 ? '#00FF88' : stats?.winRate >= 50 ? '#FFD700' : '#FF4444'}
        trend={stats?.winRateTrend}
      />

      <StatCard
        icon="💰"
        label="ROI"
        value={`${bankroll?.roi >= 0 ? '+' : ''}${bankroll?.roi?.toFixed(1) || 0}%`}
        subValue={`$${bankroll?.totalPnl?.toFixed(0) || 0} total`}
        color={bankroll?.roi >= 0 ? '#00FF88' : '#FF4444'}
        trend={bankroll?.roiTrend}
      />

      <StatCard
        icon="📊"
        label="Units Won/Lost"
        value={`${bankroll?.totalUnits >= 0 ? '+' : ''}${bankroll?.totalUnits?.toFixed(2) || 0}`}
        subValue="units"
        color={bankroll?.totalUnits >= 0 ? '#00FF88' : '#FF4444'}
      />

      <StatCard
        icon="📈"
        label="Avg CLV"
        value={`${stats?.avgCLV >= 0 ? '+' : ''}${stats?.avgCLV?.toFixed(2) || 0}`}
        subValue={`${stats?.positiveCLVRate?.toFixed(0) || 0}% positive`}
        color={stats?.avgCLV >= 0 ? '#00FF88' : '#FF4444'}
      />

      <StatCard
        icon="🎲"
        label="Average Odds"
        value={stats?.avgOdds >= 0 ? `+${stats?.avgOdds}` : `${stats?.avgOdds || '-110'}`}
        subValue="avg line"
        color="#00D4FF"
      />

      <StatCard
        icon="💵"
        label="Average Stake"
        value={`${bankroll?.avgStake?.toFixed(1) || 1.0}u`}
        subValue={`$${bankroll?.avgBetSize?.toFixed(0) || 0} per bet`}
        color="#00D4FF"
      />

      <StatCard
        icon="🔥"
        label="Current Streak"
        value={currentStreak}
        subValue={winStreak > 3 ? 'Hot streak!' : loseStreak > 3 ? 'Cold streak' : 'Normal'}
        color={streakColor}
      />

      <StatCard
        icon="⚡"
        label="Best Win Streak"
        value={`${stats?.bestWinStreak || 0}W`}
        subValue={`Worst: ${stats?.worstLoseStreak || 0}L`}
        color="#FFD700"
      />
    </div>
  );
};

/**
 * Individual Stat Card
 */
const StatCard = ({ icon, label, value, subValue, color = '#00D4FF', trend }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  }}>
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color, fontSize: '20px', fontWeight: 'bold' }}>{value}</span>
        {trend && <Sparkline data={trend} />}
      </div>
      {subValue && (
        <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
          {subValue}
        </div>
      )}
    </div>
  </div>
);

/**
 * Performance Insights Panel
 */
const PerformanceInsights = ({ stats, bankroll, sportData, betTypeData }) => {
  const insights = useMemo(() => {
    const result = [];

    // Find best sport
    if (sportData && Object.keys(sportData).length > 0) {
      const bestSport = Object.entries(sportData)
        .filter(([_, d]) => (d.total || 0) >= 10)
        .sort((a, b) => (b[1].winRate || 0) - (a[1].winRate || 0))[0];

      if (bestSport && bestSport[1].winRate > 52) {
        result.push({
          type: 'success',
          icon: '🏆',
          title: `Your best sport is ${bestSport[0]}`,
          message: `${bestSport[1].winRate?.toFixed(1)}% win rate with +${(bestSport[1].avgCLV || 0).toFixed(2)} CLV. Consider increasing action here.`
        });
      }

      // Find worst sport
      const worstSport = Object.entries(sportData)
        .filter(([_, d]) => (d.total || 0) >= 10)
        .sort((a, b) => (a[1].winRate || 0) - (b[1].winRate || 0))[0];

      if (worstSport && worstSport[1].winRate < 48) {
        result.push({
          type: 'warning',
          icon: '⚠️',
          title: `${worstSport[0]} needs attention`,
          message: `Only ${worstSport[1].winRate?.toFixed(1)}% win rate. Consider reducing action or reviewing your approach.`
        });
      }
    }

    // CLV insight
    if (stats?.avgCLV > 0.5) {
      result.push({
        type: 'success',
        icon: '⚡',
        title: 'Excellent line timing',
        message: `+${stats.avgCLV.toFixed(2)} average CLV means you're consistently beating closing lines. Keep it up!`
      });
    } else if (stats?.avgCLV < -0.5) {
      result.push({
        type: 'warning',
        icon: '⏰',
        title: 'Consider betting earlier',
        message: 'Negative CLV suggests you might be taking worse numbers. Try betting earlier or shopping more.'
      });
    }

    // ROI insight
    if (bankroll?.roi > 10) {
      result.push({
        type: 'success',
        icon: '💎',
        title: 'Strong ROI performance',
        message: `${bankroll.roi.toFixed(1)}% ROI is excellent. Your bankroll management is working well.`
      });
    } else if (bankroll?.roi < -10) {
      result.push({
        type: 'danger',
        icon: '🔴',
        title: 'Review bet sizing',
        message: 'Significant negative ROI. Consider reducing stake sizes until performance improves.'
      });
    }

    // Streak insight
    if (stats?.currentWinStreak >= 5) {
      result.push({
        type: 'info',
        icon: '🔥',
        title: 'Hot streak alert',
        message: `${stats.currentWinStreak} wins in a row! Stay disciplined and don't increase stakes just because you're winning.`
      });
    } else if (stats?.currentLoseStreak >= 5) {
      result.push({
        type: 'warning',
        icon: '❄️',
        title: 'Cold streak - stay patient',
        message: `${stats.currentLoseStreak} losses. This happens to everyone. Don't chase - stick to your system.`
      });
    }

    // Sample size insight
    if (stats?.totalPicks < 50) {
      result.push({
        type: 'info',
        icon: '📊',
        title: 'Building your sample',
        message: `Only ${stats.totalPicks} picks tracked. Need 50+ for reliable performance analysis.`
      });
    }

    // Best bet type
    if (betTypeData && Object.keys(betTypeData).length > 0) {
      const bestType = Object.entries(betTypeData)
        .filter(([_, d]) => (d.total || 0) >= 5)
        .sort((a, b) => (b[1].roi || 0) - (a[1].roi || 0))[0];

      if (bestType && bestType[1].roi > 5) {
        result.push({
          type: 'success',
          icon: '🎯',
          title: `${bestType[0]}s are your strength`,
          message: `${bestType[1].roi?.toFixed(1)}% ROI on ${bestType[0].toLowerCase()} bets. Focus more on this bet type.`
        });
      }
    }

    return result;
  }, [stats, bankroll, sportData, betTypeData]);

  if (insights.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Track more picks to unlock personalized insights
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {insights.map((insight, i) => (
        <InsightCard key={i} {...insight} />
      ))}
    </div>
  );
};

/**
 * Insight Card Component
 */
const InsightCard = ({ type, icon, title, message }) => {
  const colors = {
    success: { bg: '#00FF8810', border: '#00FF88', text: '#00FF88' },
    warning: { bg: '#FFD70010', border: '#FFD700', text: '#FFD700' },
    danger: { bg: '#FF444410', border: '#FF4444', text: '#FF4444' },
    info: { bg: '#00D4FF10', border: '#00D4FF', text: '#00D4FF' }
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      backgroundColor: c.bg,
      borderLeft: `3px solid ${c.border}`,
      borderRadius: '8px',
      padding: '12px 15px',
      display: 'flex',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div>
        <div style={{ color: c.text, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
          {message}
        </div>
      </div>
    </div>
  );
};

// ========== BREAKDOWN COMPONENTS ==========

/**
 * Breakdown by Category
 */
const BreakdownTable = ({ data, title, columns = ['Category', 'Record', 'Win %', 'ROI', 'CLV'] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  return (
    <div>
      <h4 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>{title}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{
                  padding: '10px 8px',
                  color: '#6b7280',
                  textAlign: i === 0 ? 'left' : 'center',
                  borderBottom: '1px solid #333',
                  fontWeight: 'normal',
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#0a0a0f' : 'transparent' }}>
                <td style={{ padding: '10px 8px', color: '#fff', fontWeight: 'bold' }}>
                  {row.label}
                </td>
                <td style={{ padding: '10px 8px', color: '#9ca3af', textAlign: 'center' }}>
                  {row.wins}W - {row.losses}L
                </td>
                <td style={{
                  padding: '10px 8px',
                  color: row.winRate >= 55 ? '#00FF88' : row.winRate >= 50 ? '#FFD700' : '#FF4444',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {row.winRate?.toFixed(1)}%
                </td>
                <td style={{
                  padding: '10px 8px',
                  color: row.roi >= 0 ? '#00FF88' : '#FF4444',
                  textAlign: 'center'
                }}>
                  {row.roi >= 0 ? '+' : ''}{row.roi?.toFixed(1)}%
                </td>
                <td style={{
                  padding: '10px 8px',
                  color: row.avgCLV >= 0 ? '#00FF88' : '#FF4444',
                  textAlign: 'center'
                }}>
                  {row.avgCLV >= 0 ? '+' : ''}{row.avgCLV?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========

const PerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clvStats, setClvStats] = useState(null);
  const [signalPerf, setSignalPerf] = useState(null);
  const [bankrollStats, setBankrollStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [signalCorrelation, setSignalCorrelation] = useState(null);
  const [recentPicks, setRecentPicks] = useState([]);

  const [filters, setFilters] = useState({
    dateRange: 'all',
    sports: [],
    tiers: [],
    betTypes: []
  });

  const loadData = useCallback(() => {
    setClvStats(getCLVStats());
    setSignalPerf(getSignalPerformance());
    setBankrollStats(getBankrollStats());
    setWeeklySummary(getWeeklySummary());
    setSignalCorrelation(analyzeSignalCorrelation());
    setRecentPicks(getCLVPicks().slice(-100));
  }, []);

  const {
    lastUpdated,
    isRefreshing,
    refresh
  } = useAutoRefresh(loadData, {
    interval: 5 * 60 * 1000, // 5 minutes
    immediate: true
  });

  // Filter picks based on current filters
  const filteredPicks = useMemo(() => {
    let picks = recentPicks;

    // Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoff;
      switch (filters.dateRange) {
        case '7d': cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
        case '30d': cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
        case '90d': cutoff = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
        case 'ytd': cutoff = new Date(now.getFullYear(), 0, 1); break;
        default: cutoff = null;
      }
      if (cutoff) {
        picks = picks.filter(p => new Date(p.timestamp) >= cutoff);
      }
    }

    // Sport filter
    if (filters.sports.length > 0) {
      picks = picks.filter(p => filters.sports.includes(p.sport || p.game?.sport));
    }

    // Tier filter
    if (filters.tiers.length > 0) {
      picks = picks.filter(p => {
        const tier = (p.tier || '').toLowerCase();
        return filters.tiers.some(t => tier.includes(t.toLowerCase()));
      });
    }

    return picks;
  }, [recentPicks, filters]);

  // Calculate filtered statistics
  const filteredStats = useMemo(() => {
    const graded = filteredPicks.filter(p => p.result && p.result !== 'PUSH');
    const wins = graded.filter(p => p.result === 'WIN').length;
    const losses = graded.filter(p => p.result === 'LOSS').length;
    const total = wins + losses;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    // Calculate streaks
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let bestWinStreak = 0;
    let worstLoseStreak = 0;
    let tempWin = 0;
    let tempLose = 0;

    const sorted = [...graded].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const pick of sorted) {
      if (pick.result === 'WIN') {
        tempWin++;
        tempLose = 0;
        bestWinStreak = Math.max(bestWinStreak, tempWin);
      } else {
        tempLose++;
        tempWin = 0;
        worstLoseStreak = Math.max(worstLoseStreak, tempLose);
      }
    }

    // Current streak from end
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (i === sorted.length - 1) {
        if (sorted[i].result === 'WIN') currentWinStreak = 1;
        else currentLoseStreak = 1;
      } else {
        if (sorted[i].result === 'WIN' && currentWinStreak > 0) currentWinStreak++;
        else if (sorted[i].result === 'LOSS' && currentLoseStreak > 0) currentLoseStreak++;
        else break;
      }
    }

    // Calculate average CLV
    const clvPicks = filteredPicks.filter(p => p.clv !== undefined && p.clv !== null);
    const avgCLV = clvPicks.length > 0 ? clvPicks.reduce((sum, p) => sum + p.clv, 0) / clvPicks.length : 0;
    const positiveCLVRate = clvPicks.length > 0 ? (clvPicks.filter(p => p.clv > 0).length / clvPicks.length) * 100 : 0;

    return {
      totalPicks: filteredPicks.length,
      gradedPicks: total,
      wins,
      losses,
      winRate,
      avgCLV,
      positiveCLVRate,
      currentWinStreak,
      currentLoseStreak,
      bestWinStreak,
      worstLoseStreak
    };
  }, [filteredPicks]);

  // Generate chart data
  const winRateOverTime = useMemo(() => {
    const graded = filteredPicks.filter(p => p.result && p.result !== 'PUSH');
    if (graded.length < 5) return [];

    const sorted = [...graded].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const result = [];
    let wins = 0;
    let total = 0;

    sorted.forEach((pick, i) => {
      total++;
      if (pick.result === 'WIN') wins++;

      // Sample every 5 picks or at key points
      if (i % 5 === 4 || i === sorted.length - 1) {
        result.push({
          label: `${total}`,
          value: (wins / total) * 100
        });
      }
    });

    return result;
  }, [filteredPicks]);

  const monthlyPnL = useMemo(() => {
    const graded = filteredPicks.filter(p => p.result && p.result !== 'PUSH' && p.pnl !== undefined);
    if (graded.length === 0) return [];

    const byMonth = {};
    graded.forEach(pick => {
      const date = new Date(pick.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = 0;
      byMonth[key] += pick.pnl || 0;
    });

    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, pnl]) => ({
        label: month.split('-')[1],
        value: pnl
      }));
  }, [filteredPicks]);

  const sportDistribution = useMemo(() => {
    const bySport = {};
    filteredPicks.forEach(pick => {
      const sport = pick.sport || pick.game?.sport || 'Unknown';
      if (!bySport[sport]) bySport[sport] = 0;
      bySport[sport]++;
    });

    return Object.entries(bySport)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([sport, count]) => ({
        label: sport,
        value: count
      }));
  }, [filteredPicks]);

  const roiByBetType = useMemo(() => {
    const byType = {};
    filteredPicks.forEach(pick => {
      const type = pick.betType || 'Unknown';
      if (!byType[type]) byType[type] = { wins: 0, losses: 0, pnl: 0, total: 0 };
      byType[type].total++;
      if (pick.result === 'WIN') byType[type].wins++;
      if (pick.result === 'LOSS') byType[type].losses++;
      byType[type].pnl += pick.pnl || 0;
    });

    return Object.entries(byType)
      .filter(([_, d]) => d.total >= 3)
      .map(([type, data]) => ({
        label: type,
        value: data.total > 0 ? (data.pnl / data.total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredPicks]);

  // Breakdown data
  const sportBreakdown = useMemo(() => {
    const bySport = {};
    filteredPicks.forEach(pick => {
      const sport = pick.sport || pick.game?.sport || 'Unknown';
      if (!bySport[sport]) bySport[sport] = { wins: 0, losses: 0, clvSum: 0, clvCount: 0, pnl: 0 };
      if (pick.result === 'WIN') bySport[sport].wins++;
      if (pick.result === 'LOSS') bySport[sport].losses++;
      if (pick.clv !== undefined) {
        bySport[sport].clvSum += pick.clv;
        bySport[sport].clvCount++;
      }
      bySport[sport].pnl += pick.pnl || 0;
    });

    return Object.entries(bySport)
      .map(([sport, data]) => {
        const total = data.wins + data.losses;
        return {
          label: sport,
          wins: data.wins,
          losses: data.losses,
          winRate: total > 0 ? (data.wins / total) * 100 : 0,
          avgCLV: data.clvCount > 0 ? data.clvSum / data.clvCount : 0,
          roi: total > 0 ? (data.pnl / total) * 100 : 0
        };
      })
      .filter(d => d.wins + d.losses >= 3)
      .sort((a, b) => b.winRate - a.winRate);
  }, [filteredPicks]);

  const betTypeBreakdown = useMemo(() => {
    const byType = {};
    filteredPicks.forEach(pick => {
      const type = pick.betType || 'Unknown';
      if (!byType[type]) byType[type] = { wins: 0, losses: 0, clvSum: 0, clvCount: 0, pnl: 0 };
      if (pick.result === 'WIN') byType[type].wins++;
      if (pick.result === 'LOSS') byType[type].losses++;
      if (pick.clv !== undefined) {
        byType[type].clvSum += pick.clv;
        byType[type].clvCount++;
      }
      byType[type].pnl += pick.pnl || 0;
    });

    return Object.entries(byType)
      .map(([type, data]) => {
        const total = data.wins + data.losses;
        return {
          label: type,
          wins: data.wins,
          losses: data.losses,
          winRate: total > 0 ? (data.wins / total) * 100 : 0,
          avgCLV: data.clvCount > 0 ? data.clvSum / data.clvCount : 0,
          roi: total > 0 ? (data.pnl / total) * 100 : 0
        };
      })
      .filter(d => d.wins + d.losses >= 3)
      .sort((a, b) => b.winRate - a.winRate);
  }, [filteredPicks]);

  const tierBreakdown = useMemo(() => {
    const byTier = {};
    filteredPicks.forEach(pick => {
      const tier = pick.tier || 'Unknown';
      if (!byTier[tier]) byTier[tier] = { wins: 0, losses: 0, clvSum: 0, clvCount: 0, pnl: 0 };
      if (pick.result === 'WIN') byTier[tier].wins++;
      if (pick.result === 'LOSS') byTier[tier].losses++;
      if (pick.clv !== undefined) {
        byTier[tier].clvSum += pick.clv;
        byTier[tier].clvCount++;
      }
      byTier[tier].pnl += pick.pnl || 0;
    });

    return Object.entries(byTier)
      .map(([tier, data]) => {
        const total = data.wins + data.losses;
        return {
          label: tier.replace(/_/g, ' '),
          wins: data.wins,
          losses: data.losses,
          winRate: total > 0 ? (data.wins / total) * 100 : 0,
          avgCLV: data.clvCount > 0 ? data.clvSum / data.clvCount : 0,
          roi: total > 0 ? (data.pnl / total) * 100 : 0
        };
      })
      .filter(d => d.wins + d.losses >= 2)
      .sort((a, b) => b.winRate - a.winRate);
  }, [filteredPicks]);

  // Home/Away breakdown
  const homeAwayBreakdown = useMemo(() => {
    const data = { Home: { wins: 0, losses: 0, clvSum: 0, clvCount: 0, pnl: 0 },
                   Away: { wins: 0, losses: 0, clvSum: 0, clvCount: 0, pnl: 0 } };

    filteredPicks.forEach(pick => {
      const side = pick.isHome ? 'Home' : 'Away';
      if (pick.result === 'WIN') data[side].wins++;
      if (pick.result === 'LOSS') data[side].losses++;
      if (pick.clv !== undefined) {
        data[side].clvSum += pick.clv;
        data[side].clvCount++;
      }
      data[side].pnl += pick.pnl || 0;
    });

    return Object.entries(data)
      .map(([side, d]) => {
        const total = d.wins + d.losses;
        return {
          label: side,
          wins: d.wins,
          losses: d.losses,
          winRate: total > 0 ? (d.wins / total) * 100 : 0,
          avgCLV: d.clvCount > 0 ? d.clvSum / d.clvCount : 0,
          roi: total > 0 ? (d.pnl / total) * 100 : 0
        };
      })
      .filter(d => d.wins + d.losses > 0);
  }, [filteredPicks]);

  // Calculate overall grade
  const getOverallGrade = () => {
    if (!filteredStats || !bankrollStats) return { grade: 'N/A', color: '#9ca3af' };

    let score = 0;

    // CLV component (40%)
    if (filteredStats.avgCLV > 0.5) score += 40;
    else if (filteredStats.avgCLV > 0) score += 30;
    else if (filteredStats.avgCLV > -0.5) score += 20;
    else score += 10;

    // Win rate component (30%)
    if (filteredStats.winRate >= 55) score += 30;
    else if (filteredStats.winRate >= 52) score += 25;
    else if (filteredStats.winRate >= 50) score += 15;
    else score += 5;

    // ROI component (30%)
    if (bankrollStats?.roi > 10) score += 30;
    else if (bankrollStats?.roi > 5) score += 25;
    else if (bankrollStats?.roi > 0) score += 15;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Performance Dashboard
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Comprehensive tracking with charts, breakdowns, and AI insights
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Last Updated */}
            <LastUpdated
              timestamp={lastUpdated}
              isRefreshing={isRefreshing}
              onRefresh={refresh}
              compact
            />

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
        </div>

        {/* Filter Panel */}
        <FilterPanel filters={filters} onFilterChange={setFilters} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {['overview', 'charts', 'breakdowns', 'signals', 'insights'].map(tab => (
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
              {tab === 'charts' ? '📈 Charts' :
               tab === 'breakdowns' ? '📋 Breakdowns' :
               tab === 'insights' ? '💡 Insights' :
               tab === 'signals' ? '⚡ Signals' :
               '📊 Overview'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Comprehensive Stats */}
            <ComprehensiveStatsPanel stats={filteredStats} bankroll={bankrollStats} />

            {/* Quick Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Win Rate Trend</h3>
                <LineChart data={winRateOverTime} width={350} height={180} label="Win Rate % Over Picks" />
              </div>
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Sport Distribution</h3>
                <PieChart data={sportDistribution} width={180} height={180} />
              </div>
            </div>

            {/* Weekly Summary */}
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
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Win Rate Over Time */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📈 Win Rate Over Time</h3>
              <LineChart data={winRateOverTime} width={Math.min(800, window.innerWidth - 100)} height={250} label="Cumulative Win Rate %" />
            </div>

            {/* Monthly P&L */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📊 Monthly P&L (Units)</h3>
              <BarChart data={monthlyPnL} width={Math.min(800, window.innerWidth - 100)} height={250} label="Monthly Profit/Loss in Units" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              {/* Sport Distribution */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>🥧 Bet Distribution by Sport</h3>
                <PieChart data={sportDistribution} width={180} height={180} />
              </div>

              {/* ROI by Bet Type */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '16px' }}>📊 ROI by Bet Type</h3>
                <HorizontalBarChart data={roiByBetType} width={350} height={200} label="Return on Investment %" />
              </div>
            </div>
          </div>
        )}

        {/* Breakdowns Tab */}
        {activeTab === 'breakdowns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
              {/* By Sport */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <BreakdownTable data={sportBreakdown} title="🏀 Performance by Sport" />
              </div>

              {/* By Bet Type */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <BreakdownTable data={betTypeBreakdown} title="🎯 Performance by Bet Type" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
              {/* By Tier */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <BreakdownTable data={tierBreakdown} title="⭐ Performance by Confidence Tier" />
              </div>

              {/* Home/Away */}
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <BreakdownTable data={homeAwayBreakdown} title="🏠 Home vs Away" />
              </div>
            </div>

            {/* Recent Picks Heatmap */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                📅 Recent Results (Last 50 Picks)
              </h3>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {filteredPicks.slice(-50).map((pick, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '3px',
                      backgroundColor: pick.result === 'WIN' ? '#00FF88'
                        : pick.result === 'LOSS' ? '#FF4444'
                        : pick.result === 'PUSH' ? '#6b7280'
                        : '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      color: '#000',
                      fontWeight: 'bold'
                    }}
                    title={`${pick.game?.home_team || 'Unknown'} - ${pick.result || 'Pending'}`}
                  >
                    {pick.result === 'WIN' ? 'W' : pick.result === 'LOSS' ? 'L' : pick.result === 'PUSH' ? 'P' : '?'}
                  </div>
                ))}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>
                Recent: {filteredPicks.filter(p => p.result === 'WIN').length}W -
                {' '}{filteredPicks.filter(p => p.result === 'LOSS').length}L -
                {' '}{filteredPicks.filter(p => p.result === 'PUSH').length}P
              </div>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && signalPerf && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                ⚡ Signal Win Rates
              </h3>

              {!signalPerf?.signals || Object.keys(signalPerf.signals).length === 0 ? (
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

            {/* Signal Correlation */}
            {signalCorrelation && !signalCorrelation.error && (
              <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                  🔮 Signal Predictive Power
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

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 AI-Powered Performance Insights
              </h3>
              <PerformanceInsights
                stats={filteredStats}
                bankroll={bankrollStats}
                sportData={clvStats?.bySport}
                betTypeData={signalPerf?.byBetType}
              />
            </div>

            {/* Recommendations */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                🎯 Quick Recommendations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {filteredStats?.winRate >= 52 && (
                  <RecommendationCard
                    title="Stay the Course"
                    description="Your win rate is solid. Maintain your current strategy and don't over-adjust."
                    icon="✅"
                    color="#00FF88"
                  />
                )}
                {filteredStats?.avgCLV > 0 && (
                  <RecommendationCard
                    title="Great Line Timing"
                    description="Positive CLV shows you're getting value. Keep betting when you see edges."
                    icon="⚡"
                    color="#00D4FF"
                  />
                )}
                {bankrollStats?.maxDrawdown > 20 && (
                  <RecommendationCard
                    title="Manage Risk"
                    description="High drawdown detected. Consider reducing unit sizes until you recover."
                    icon="⚠️"
                    color="#FFD700"
                  />
                )}
                {filteredStats?.totalPicks < 100 && (
                  <RecommendationCard
                    title="Build Your Sample"
                    description="More data = better insights. Keep tracking all your plays consistently."
                    icon="📊"
                    color="#9ca3af"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Additional Helper Components

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

const RecommendationCard = ({ title, description, icon, color }) => (
  <div style={{
    backgroundColor: `${color}10`,
    border: `1px solid ${color}30`,
    borderRadius: '10px',
    padding: '15px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ color, fontWeight: 'bold', fontSize: '13px' }}>{title}</span>
    </div>
    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
      {description}
    </p>
  </div>
);

export default PerformanceDashboard;
