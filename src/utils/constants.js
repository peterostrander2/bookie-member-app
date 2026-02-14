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
