/**
 * Shared FilterControls component for SmashList pages
 * v12.1 - Supports both game and props modes
 *
 * INVARIANT 8: This component must stay in sync between game and props modes.
 * Any tier-related changes must update both mode paths.
 */
import React, { memo } from 'react';
import { TIERS } from '../core/frontend_scoring_contract';

// Shared tier options and labels
const TIER_OPTIONS = ['ALL', TIERS.TITANIUM_SMASH, TIERS.GOLD_STAR, TIERS.EDGE_LEAN, TIERS.MONITOR];
const TIER_LABELS = {
  ALL: 'ALL',
  [TIERS.TITANIUM_SMASH]: 'TITANIUM',
  [TIERS.GOLD_STAR]: 'GOLD',
  [TIERS.EDGE_LEAN]: 'EDGE',
  [TIERS.MONITOR]: 'MONITOR'
};

// Game mode options
const MARKET_OPTIONS = ['ALL', 'SPREAD', 'TOTAL', 'ML'];
const GAME_SORT_OPTIONS = [
  { value: 'confidence', label: 'Confidence' },
  { value: 'edge', label: 'Edge' }
];

// Props mode options
const PROP_TYPE_OPTIONS = ['ALL', 'POINTS', 'REBOUNDS', 'ASSISTS', '3PT', 'OTHER'];
const PROPS_SORT_OPTIONS = [
  { value: 'score', label: 'Score (High→Low)' },
  { value: 'edge', label: 'Edge (High→Low)' },
  { value: 'odds', label: 'Best Odds' }
];

// Shared styles
const CONTAINER_STYLE = {
  backgroundColor: '#12121f',
  borderRadius: '10px',
  padding: '12px 16px',
  marginBottom: '16px',
  border: '1px solid #2a2a4a'
};

const FLEX_ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  alignItems: 'center'
};

const LABEL_STYLE = {
  color: '#6B7280',
  fontSize: '11px',
  marginRight: '8px'
};

const SELECT_STYLE = {
  backgroundColor: '#1a1a2e',
  color: '#fff',
  border: '1px solid #4B5563',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer'
};

const getButtonStyle = (isActive, tier, mode) => ({
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: isActive
    ? (tier === TIERS.TITANIUM_SMASH ? '#00FFFF' : (mode === 'props' ? '#8B5CF6' : '#00D4FF'))
    : '#1a1a2e',
  color: isActive
    ? (tier === TIERS.TITANIUM_SMASH || mode === 'game' ? '#0a0a0f' : '#fff')
    : '#9CA3AF'
});

/**
 * FilterControls - Shared filter UI for game and props SmashLists
 *
 * @param {string} mode - "game" or "props"
 * @param {Object} filters - Current filter state { tier, market?, propType? }
 * @param {Function} setFilters - Filter state setter
 * @param {string} sortBy - Current sort value
 * @param {Function} setSortBy - Sort state setter
 */
const FilterControls = memo(({ mode, filters, setFilters, sortBy, setSortBy }) => {
  const isGameMode = mode === 'game';
  const sortOptions = isGameMode ? GAME_SORT_OPTIONS : PROPS_SORT_OPTIONS;
  const selectId = isGameMode ? 'game-smash-sort' : 'props-smash-sort';
  const selectName = isGameMode ? 'gameSmashSort' : 'propsSmashSort';

  return (
    <div style={CONTAINER_STYLE}>
      <div style={FLEX_ROW_STYLE}>
        {/* Tier Filter - same for both modes */}
        <div>
          <span style={LABEL_STYLE}>TIER:</span>
          <div style={{ display: 'inline-flex', gap: '4px' }}>
            {TIER_OPTIONS.map(tier => (
              <button
                key={tier}
                onClick={() => setFilters({ ...filters, tier })}
                style={getButtonStyle(filters.tier === tier, tier, mode)}
              >
                {TIER_LABELS[tier]}
              </button>
            ))}
          </div>
        </div>

        {/* Second filter - different per mode */}
        <div>
          <span style={LABEL_STYLE}>TYPE:</span>
          {isGameMode ? (
            // Game mode: Market buttons
            <div style={{ display: 'inline-flex', gap: '4px' }}>
              {MARKET_OPTIONS.map(market => (
                <button
                  key={market}
                  onClick={() => setFilters({ ...filters, market })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: filters.market === market ? '#00D4FF' : '#1a1a2e',
                    color: filters.market === market ? '#0a0a0f' : '#9CA3AF'
                  }}
                >
                  {market}
                </button>
              ))}
            </div>
          ) : (
            // Props mode: Prop type dropdown
            <select
              id="props-smash-type"
              name="propsSmashType"
              value={filters.propType}
              onChange={(e) => setFilters({ ...filters, propType: e.target.value })}
              style={SELECT_STYLE}
            >
              {PROP_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>

        {/* Sort dropdown - same structure, different options */}
        <div style={{ marginLeft: 'auto' }}>
          <span style={LABEL_STYLE}>SORT:</span>
          <select
            id={selectId}
            name={selectName}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={SELECT_STYLE}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});

FilterControls.displayName = 'FilterControls';

export default FilterControls;
