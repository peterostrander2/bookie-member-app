/**
 * Lightweight SVG-based Charts for Performance Dashboard
 * No external dependencies - pure React + SVG
 */

import React from 'react';

// Simple Line Chart
export const LineChart = ({
  data = [],
  width = 600,
  height = 200,
  color = '#00D4FF',
  showDots = true,
  showGrid = true,
  label = '',
  valueKey = 'value',
  labelKey = 'label',
  formatValue = (v) => v.toFixed(1)
}) => {
  if (data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        Not enough data points
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d[valueKey] || 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.1;
  const yMax = maxVal + range * 0.1;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
  const scaleY = (v) => padding.top + chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight;

  const pathData = data.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d[valueKey] || 0);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines }, (_, i) => yMin + (i / (gridLines - 1)) * (yMax - yMin));

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {showGrid && yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={scaleY(tick)}
            x2={width - padding.right}
            y2={scaleY(tick)}
            stroke="#333"
            strokeDasharray="3,3"
          />
          <text
            x={padding.left - 8}
            y={scaleY(tick) + 4}
            fill="#6b7280"
            fontSize="10"
            textAnchor="end"
          >
            {formatValue(tick)}
          </text>
        </g>
      ))}

      {/* Zero line if applicable */}
      {yMin < 0 && yMax > 0 && (
        <line
          x1={padding.left}
          y1={scaleY(0)}
          x2={width - padding.right}
          y2={scaleY(0)}
          stroke="#6b7280"
          strokeWidth="1"
        />
      )}

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area under line */}
      <path
        d={`${pathData} L ${scaleX(data.length - 1)} ${scaleY(yMin)} L ${scaleX(0)} ${scaleY(yMin)} Z`}
        fill={`${color}15`}
      />

      {/* Dots */}
      {showDots && data.map((d, i) => (
        <circle
          key={i}
          cx={scaleX(i)}
          cy={scaleY(d[valueKey] || 0)}
          r="4"
          fill={color}
          stroke="#0a0a0f"
          strokeWidth="2"
        />
      ))}

      {/* X-axis labels (show every few) */}
      {data.map((d, i) => {
        if (data.length <= 7 || i % Math.ceil(data.length / 7) === 0) {
          return (
            <text
              key={i}
              x={scaleX(i)}
              y={height - 10}
              fill="#6b7280"
              fontSize="10"
              textAnchor="middle"
            >
              {d[labelKey] || i + 1}
            </text>
          );
        }
        return null;
      })}

      {/* Label */}
      {label && (
        <text x={padding.left} y={12} fill="#9ca3af" fontSize="11">
          {label}
        </text>
      )}
    </svg>
  );
};

// Area Chart with gradient
export const AreaChart = ({
  data = [],
  width = 600,
  height = 200,
  positiveColor = '#00FF88',
  negativeColor = '#FF4444',
  label = '',
  valueKey = 'value',
  labelKey = 'label'
}) => {
  if (data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        Not enough data points
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d[valueKey] || 0);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 0);
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.1;
  const yMax = maxVal + range * 0.1;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
  const scaleY = (v) => padding.top + chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight;

  const lastValue = values[values.length - 1];
  const mainColor = lastValue >= 0 ? positiveColor : negativeColor;

  const pathData = data.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d[valueKey] || 0);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Zero line */}
      <line
        x1={padding.left}
        y1={scaleY(0)}
        x2={width - padding.right}
        y2={scaleY(0)}
        stroke="#6b7280"
        strokeWidth="1"
        strokeDasharray="4,4"
      />

      {/* Area fill */}
      <path
        d={`${pathData} L ${scaleX(data.length - 1)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={mainColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current value indicator */}
      <circle
        cx={scaleX(data.length - 1)}
        cy={scaleY(lastValue)}
        r="6"
        fill={mainColor}
        stroke="#0a0a0f"
        strokeWidth="2"
      />

      {/* Y-axis labels */}
      {[0, yMax, yMin].filter((v, i, arr) => arr.indexOf(v) === i).map((tick, i) => (
        <text
          key={i}
          x={padding.left - 8}
          y={scaleY(tick) + 4}
          fill="#6b7280"
          fontSize="10"
          textAnchor="end"
        >
          {tick.toFixed(1)}
        </text>
      ))}

      {/* Label */}
      {label && (
        <text x={padding.left} y={12} fill="#9ca3af" fontSize="11">
          {label}
        </text>
      )}

      {/* Final value label */}
      <text
        x={width - padding.right}
        y={12}
        fill={mainColor}
        fontSize="12"
        fontWeight="bold"
        textAnchor="end"
      >
        {lastValue >= 0 ? '+' : ''}{lastValue.toFixed(2)}
      </text>
    </svg>
  );
};

// Bar Chart for win/loss visualization
export const BarChart = ({
  data = [],
  width = 600,
  height = 150,
  positiveColor = '#00FF88',
  negativeColor = '#FF4444',
  neutralColor = '#9ca3af',
  label = ''
}) => {
  if (data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data
      </div>
    );
  }

  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = Math.min((chartWidth / data.length) - 2, 30);
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

  return (
    <svg width={width} height={height}>
      {/* Label */}
      {label && (
        <text x={padding.left} y={12} fill="#9ca3af" fontSize="11">
          {label}
        </text>
      )}

      {data.map((d, i) => {
        const x = padding.left + gap + i * (barWidth + gap);
        const barHeight = chartHeight * 0.8;
        const y = padding.top + (chartHeight - barHeight) / 2;

        const color = d.result === 'WIN' ? positiveColor
          : d.result === 'LOSS' ? negativeColor
          : neutralColor;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="2"
              opacity="0.8"
            />
            <text
              x={x + barWidth / 2}
              y={height - 8}
              fill="#6b7280"
              fontSize="9"
              textAnchor="middle"
            >
              {d.label || i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Mini sparkline for compact displays
export const Sparkline = ({
  data = [],
  width = 100,
  height = 30,
  color = '#00D4FF',
  valueKey = 'value'
}) => {
  if (data.length < 2) return null;

  const values = data.map(d => d[valueKey] || d);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const scaleX = (i) => (i / (values.length - 1)) * width;
  const scaleY = (v) => height - ((v - min) / range) * height;

  const pathData = values.map((v, i) => {
    return `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(v)}`;
  }).join(' ');

  return (
    <svg width={width} height={height}>
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={scaleX(values.length - 1)}
        cy={scaleY(values[values.length - 1])}
        r="2"
        fill={color}
      />
    </svg>
  );
};

// ROI Over Time Chart (specialized)
export const ROIChart = ({ picks = [], width = 600, height = 250 }) => {
  // Build cumulative ROI data
  const roiData = [];
  let cumulative = 0;

  const gradedPicks = picks.filter(p => p.result && p.result !== 'PUSH');

  gradedPicks.forEach((pick, i) => {
    const stake = pick.stake || 1;
    const odds = pick.odds || -110;

    if (pick.result === 'WIN') {
      const profit = odds > 0 ? (odds / 100) * stake : (100 / Math.abs(odds)) * stake;
      cumulative += profit;
    } else if (pick.result === 'LOSS') {
      cumulative -= stake;
    }

    roiData.push({
      label: `#${i + 1}`,
      value: cumulative,
      result: pick.result
    });
  });

  if (roiData.length < 2) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px'
      }}>
        Need more graded picks to show ROI chart
      </div>
    );
  }

  return (
    <AreaChart
      data={roiData}
      width={width}
      height={height}
      label="Cumulative P/L (Units)"
      valueKey="value"
      labelKey="label"
    />
  );
};

// Win Rate Rolling Average Chart
export const WinRateChart = ({ picks = [], window = 10, width = 600, height = 200 }) => {
  const gradedPicks = picks.filter(p => p.result && p.result !== 'PUSH');

  if (gradedPicks.length < window) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px'
      }}>
        Need at least {window} graded picks
      </div>
    );
  }

  const winRateData = [];

  for (let i = window - 1; i < gradedPicks.length; i++) {
    const windowPicks = gradedPicks.slice(i - window + 1, i + 1);
    const wins = windowPicks.filter(p => p.result === 'WIN').length;
    const winRate = (wins / window) * 100;

    winRateData.push({
      label: `#${i + 1}`,
      value: winRate
    });
  }

  return (
    <LineChart
      data={winRateData}
      width={width}
      height={height}
      color="#00D4FF"
      showDots={winRateData.length <= 20}
      label={`${window}-Pick Rolling Win Rate (%)`}
      formatValue={(v) => `${v.toFixed(0)}%`}
    />
  );
};

export default {
  LineChart,
  AreaChart,
  BarChart,
  Sparkline,
  ROIChart,
  WinRateChart
};
