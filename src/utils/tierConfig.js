/**
 * Tier Configuration Utilities
 *
 * Shared tier styling and helper functions used by both
 * GameSmashList.jsx and PropsSmashList.jsx.
 *
 * INVARIANT 8: Both SmashList components must use this shared config.
 */

import {
  MIN_FINAL_SCORE,
  GOLD_STAR_THRESHOLD,
  MONITOR_THRESHOLD,
  TIERS
} from '../../core/frontend_scoring_contract';
import { getPickScore, isTitanium } from './pickNormalize';

/**
 * v10.87 Tier configuration based on API tier field
 * Matches backend tiering.py
 */
export const TIER_CONFIGS = {
  [TIERS.TITANIUM_SMASH]: {
    tier: TIERS.TITANIUM_SMASH,
    label: 'TITANIUM SMASH',
    color: '#00FFFF',
    bg: 'rgba(0, 255, 255, 0.15)',
    border: 'rgba(0, 255, 255, 0.5)',
    glow: '0 0 30px rgba(0, 255, 255, 0.4)',
    size: 'large',
    historicalWinRate: 92,
    isProfitable: true,
    action: 'SMASH',
    units: 2.5
  },
  [TIERS.GOLD_STAR]: {
    tier: TIERS.GOLD_STAR,
    label: 'GOLD STAR',
    color: '#FFD700',
    bg: 'rgba(255, 215, 0, 0.15)',
    border: 'rgba(255, 215, 0, 0.5)',
    glow: '0 0 20px rgba(255, 215, 0, 0.3)',
    size: 'large',
    historicalWinRate: 87,
    isProfitable: true,
    action: 'SMASH',
    units: 2.0
  },
  [TIERS.EDGE_LEAN]: {
    tier: TIERS.EDGE_LEAN,
    label: 'EDGE LEAN',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.5)',
    glow: 'none',
    size: 'medium',
    historicalWinRate: 72,
    isProfitable: true,
    action: 'PLAY',
    units: 1.0
  },
  [TIERS.MONITOR]: {
    tier: TIERS.MONITOR,
    label: 'MONITOR',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 58,
    isProfitable: true,
    action: 'WATCH',
    units: 0.0
  },
  [TIERS.PASS]: {
    tier: TIERS.PASS,
    label: 'PASS',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.5)',
    glow: 'none',
    size: 'small',
    historicalWinRate: 48,
    isProfitable: false,
    action: 'SKIP',
    units: 0.0,
    warning: 'Below break-even at standard odds'
  }
};

/**
 * Get tier config from pick object
 * v12.1 - TITANIUM is truth-based ONLY from backend
 *
 * @param {Object} pick - Pick object from API
 * @returns {Object} Tier configuration for styling
 */
export function getTierConfigFromPick(pick) {
  // TITANIUM: ONLY when backend explicitly indicates it
  if (isTitanium(pick)) {
    return TIER_CONFIGS[TIERS.TITANIUM_SMASH];
  }

  // Use tier from API (non-titanium)
  if (pick.tier && TIER_CONFIGS[pick.tier] && pick.tier !== TIERS.TITANIUM_SMASH) {
    return TIER_CONFIGS[pick.tier];
  }

  // Fallback: derive from score (NOT for titanium)
  const score = getPickScore(pick);
  if (score === null) return TIER_CONFIGS[TIERS.PASS];
  if (score >= GOLD_STAR_THRESHOLD) return TIER_CONFIGS[TIERS.GOLD_STAR];
  if (score >= MIN_FINAL_SCORE) return TIER_CONFIGS[TIERS.EDGE_LEAN];
  if (score >= MONITOR_THRESHOLD) return TIER_CONFIGS[TIERS.MONITOR];
  return TIER_CONFIGS[TIERS.PASS];
}

/**
 * Legacy: Confidence tier configuration
 * For backwards compatibility with confidence-based displays
 *
 * @param {number} conf - Confidence value (0-100)
 * @returns {Object} Tier configuration for styling
 */
export function getTierConfig(conf) {
  if (conf >= 85) return TIER_CONFIGS[TIERS.GOLD_STAR];
  if (conf >= 75) return TIER_CONFIGS[TIERS.EDGE_LEAN];
  if (conf >= 65) return TIER_CONFIGS[TIERS.MONITOR];
  return TIER_CONFIGS[TIERS.PASS];
}
