import React from 'react';

/**
 * EsotericContributionsPanel - Displays esoteric contributions grouped by category
 *
 * Categories:
 * - Numerology: life path, daily edge, gematria
 * - Astronomical: lunar, mercury, solar
 * - Mathematical: fibonacci, gann, vortex
 */

const panelStyle = {
  backgroundColor: '#0a0a14',
  borderRadius: '6px',
  padding: '10px 12px',
  marginTop: '4px',
  fontSize: '11px',
};

const categoryStyle = {
  backgroundColor: '#12121f',
  borderRadius: '6px',
  padding: '8px 10px',
  marginBottom: '8px',
};

const categoryTitleStyle = {
  color: '#A855F7',
  fontSize: '10px',
  fontWeight: 'bold',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
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

const formatValue = (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  if (num === 0) return null;  // Don't show zeros
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}`;
};

// Field mappings for each category
const CATEGORIES = {
  numerology: {
    title: 'Numerology',
    fields: [
      { key: 'numerology', label: 'Life Path' },
      { key: 'daily_edge', label: 'Daily Edge' },
      { key: 'gematria', label: 'Gematria' },
    ],
  },
  astronomical: {
    title: 'Astronomical',
    fields: [
      { key: 'lunar', label: 'Lunar Phase' },
      { key: 'mercury', label: 'Mercury' },
      { key: 'solar', label: 'Solar Flare' },
      { key: 'astro', label: 'Astro' },
    ],
  },
  mathematical: {
    title: 'Mathematical',
    fields: [
      { key: 'fib_alignment', label: 'Fibonacci' },
      { key: 'fib_retracement', label: 'Fib Retrace' },
      { key: 'gann', label: 'Gann Square' },
      { key: 'vortex', label: 'Vortex' },
    ],
  },
  situational: {
    title: 'Situational',
    fields: [
      { key: 'rivalry', label: 'Rivalry' },
      { key: 'streak', label: 'Streak' },
      { key: 'biorhythms', label: 'Biorhythms' },
      { key: 'founders_echo', label: "Founder's Echo" },
    ],
  },
};

const CategorySection = ({ title, fields, contributions }) => {
  // Filter to only show fields with non-zero values
  const activeFields = fields.filter(f => {
    const val = contributions[f.key];
    return val !== undefined && val !== null && val !== 0;
  });

  if (activeFields.length === 0) return null;

  return (
    <div style={categoryStyle}>
      <div style={categoryTitleStyle}>{title}</div>
      {activeFields.map(({ key, label }) => {
        const value = contributions[key];
        const formatted = formatValue(value);
        if (!formatted) return null;

        return (
          <div key={key} style={rowStyle}>
            <span style={{ color: '#9CA3AF' }}>{label}:</span>
            <span style={{ color: getValueColor(value) }}>{formatted}</span>
          </div>
        );
      })}
    </div>
  );
};

const EsotericContributionsPanel = ({ pick }) => {
  if (!pick?.esoteric_contributions) return null;

  const contributions = pick.esoteric_contributions;

  // Check if we have any contributions to display
  const hasContributions = Object.values(contributions).some(v => v !== 0 && v !== undefined);
  if (!hasContributions) return null;

  return (
    <details style={{ marginTop: '8px' }}>
      <summary style={{
        color: '#FFD700',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        Esoteric Contributions
      </summary>
      <div style={panelStyle}>
        {Object.entries(CATEGORIES).map(([key, { title, fields }]) => (
          <CategorySection
            key={key}
            title={title}
            fields={fields}
            contributions={contributions}
          />
        ))}
      </div>
    </details>
  );
};

export default EsotericContributionsPanel;
