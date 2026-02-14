/**
 * Shared Constants
 *
 * AI Models and Pillars used by both GameSmashList and PropsSmashList
 * for the "Why?" breakdown display.
 */

/**
 * 8 AI Models that make up the ensemble scoring
 */
export const AI_MODELS = [
  { id: 'ensemble', name: 'Ensemble', desc: 'Combined model consensus' },
  { id: 'lstm', name: 'LSTM', desc: 'Time-series neural network' },
  { id: 'xgboost', name: 'XGBoost', desc: 'Gradient boosting' },
  { id: 'random_forest', name: 'Random Forest', desc: 'Decision tree ensemble' },
  { id: 'neural_net', name: 'Neural Net', desc: 'Deep learning model' },
  { id: 'monte_carlo', name: 'Monte Carlo', desc: 'Simulation model' },
  { id: 'bayesian', name: 'Bayesian', desc: 'Probabilistic model' },
  { id: 'regression', name: 'Regression', desc: 'Statistical regression' }
];

/**
 * 8 Pillars of the betting system research score
 */
export const PILLARS = [
  { id: 'sharp_action', name: 'Sharp Action', desc: 'Professional bettor signals' },
  { id: 'reverse_line', name: 'Reverse Line', desc: 'Line moving against public' },
  { id: 'matchup_history', name: 'Matchup History', desc: 'Historical head-to-head' },
  { id: 'recent_form', name: 'Recent Form', desc: 'Last 10 game trends' },
  { id: 'rest_advantage', name: 'Rest Advantage', desc: 'Days off comparison' },
  { id: 'home_away', name: 'Home/Away', desc: 'Venue performance' },
  { id: 'injuries', name: 'Injury Impact', desc: 'Key player status' },
  { id: 'pace_tempo', name: 'Pace/Tempo', desc: 'Game speed matchup' }
];

/**
 * Common stat badge style for pick cards
 */
export const STAT_BADGE_STYLE = {
  backgroundColor: '#0f0f1a',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  color: '#6B7280'
};

/**
 * Stat badge with right margin auto (for bookmaker badges)
 */
export const STAT_BADGE_STYLE_RIGHT = {
  ...STAT_BADGE_STYLE,
  marginLeft: 'auto'
};

/**
 * Inactive/disabled stat badge style
 */
export const STAT_BADGE_STYLE_INACTIVE = {
  ...STAT_BADGE_STYLE,
  backgroundColor: '#1a1a2e',
  color: '#6B7280'
};

// ============================================================================
// PERFORMANCE: Shared style constants (prevents inline object re-creation)
// ============================================================================

/** Muted text color */
export const TEXT_MUTED = { color: '#6B7280' };

/** Secondary text color */
export const TEXT_SECONDARY = { color: '#9CA3AF' };

/** Success/green text */
export const TEXT_SUCCESS = { color: '#10B981' };

/** Flex row with wrap */
export const FLEX_WRAP_GAP_6 = { display: 'flex', flexWrap: 'wrap', gap: '6px' };

/** Flex row with wrap, smaller gap */
export const FLEX_WRAP_GAP_4 = { display: 'flex', flexWrap: 'wrap', gap: '4px' };

/** Flex column with gap */
export const FLEX_COL_GAP_8 = { display: 'flex', flexDirection: 'column', gap: '8px' };

/** Flex row align start */
export const FLEX_START_GAP_8 = { display: 'flex', alignItems: 'flex-start', gap: '8px' };

/** Common margin bottom */
export const MB_8 = { marginBottom: '8px' };
export const MB_16 = { marginBottom: '16px' };

/** Muted small text */
export const TEXT_MUTED_SM = { color: '#6B7280', fontSize: '10px' };
export const TEXT_MUTED_XS = { color: '#6B7280', fontSize: '11px' };

/** Secondary small text */
export const TEXT_SECONDARY_SM = { color: '#9CA3AF', fontSize: '11px' };

/** Success small text */
export const TEXT_SUCCESS_SM = { color: '#10B981', fontSize: '12px' };

/** White body text */
export const TEXT_BODY = { color: '#fff', fontSize: '13px', lineHeight: '1.4' };

/**
 * Get agreeing models from pick data
 * Uses real backend data from pick.agreeing_models
 * Returns empty array if not available (never fakes data)
 */
export const getAgreeingModels = (pick) => {
  if (pick?.agreeing_models && Array.isArray(pick.agreeing_models)) {
    return pick.agreeing_models.map(id => AI_MODELS.find(m => m.id === id)).filter(Boolean);
  }
  return [];
};

/**
 * Get aligning pillars from pick data
 * Uses real backend data from pick.aligning_pillars
 * Returns empty array if not available (never fakes data)
 */
export const getAligningPillars = (pick) => {
  if (pick?.aligning_pillars && Array.isArray(pick.aligning_pillars)) {
    return pick.aligning_pillars.map(id => PILLARS.find(p => p.id === id)).filter(Boolean);
  }
  return [];
};
