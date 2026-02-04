import React from 'react';

/**
 * BoostBreakdownPanel - Collapsible panel showing Option A score breakdown
 *
 * Displays all boost fields from backend:
 * - Base (4-engine weighted average)
 * - Context Modifier (±0.35 cap)
 * - Confluence, MSRF, Jason Sim, SERP, Ensemble, Live Adjustment
 * - Final Score (capped at 10)
 */

const panelStyle = {
  backgroundColor: '#0a0a14',
  borderRadius: '6px',
  padding: '8px 12px',
  marginTop: '4px',
  fontSize: '11px',
  fontFamily: 'monospace',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '2px 0',
};

const getValueColor = (value) => {
  if (value > 0) return '#10B981';  // Green for positive
  if (value < 0) return '#EF4444';  // Red for negative
  return '#6B7280';                  // Gray for zero
};

const formatValue = (value, showPlus = true) => {
  if (value === undefined || value === null) return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  const sign = showPlus && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}`;
};

const BoostBreakdownPanel = ({ pick }) => {
  if (!pick) return null;

  // Only show if we have boost data
  const hasBoostData = pick.base_4_score !== undefined ||
                       pick.confluence_boost !== undefined ||
                       pick.msrf_boost !== undefined ||
                       pick.jason_sim_boost !== undefined;

  if (!hasBoostData) return null;

  const boosts = [
    { label: 'Base (4-engine)', value: pick.base_4_score, showPlus: false },
    { label: 'Context Modifier', value: pick.context_modifier },
    { label: 'Confluence', value: pick.confluence_boost },
    { label: 'MSRF', value: pick.msrf_boost },
    { label: 'Jason Sim', value: pick.jason_sim_boost },
    { label: 'SERP Intel', value: pick.serp_boost },
    { label: 'Ensemble ML', value: pick.ensemble_adjustment },
    { label: 'Live Adj', value: pick.live_adjustment },
  ];

  return (
    <details style={{ marginTop: '8px' }}>
      <summary style={{
        color: '#8B5CF6',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        Score Breakdown
      </summary>
      <div style={panelStyle}>
        {boosts.map(({ label, value, showPlus = true }) => (
          <div key={label} style={rowStyle}>
            <span style={{ color: '#9CA3AF' }}>{label}:</span>
            <span style={{ color: getValueColor(value) }}>
              {formatValue(value, showPlus)}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div style={{
          borderTop: '1px solid #2a2a4a',
          margin: '6px 0',
        }} />

        {/* Final Score */}
        <div style={{
          ...rowStyle,
          fontWeight: 'bold',
        }}>
          <span style={{ color: '#FFD700' }}>FINAL:</span>
          <span style={{ color: '#FFD700' }}>
            {pick.final_score?.toFixed(2) ?? '—'}
          </span>
        </div>
      </div>
    </details>
  );
};

export default BoostBreakdownPanel;
