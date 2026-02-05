/**
 * FRONTEND SCORING CONTRACT - Single Source of Truth
 * Must match backend: ~/Desktop/ai-betting-backend-main/core/scoring_contract.py
 * 
 * Import these constants - NEVER hardcode them in components
 */

export const ENGINE_WEIGHTS = {
  ai: 0.25,        // 25%
  research: 0.35,  // 35% - LARGEST
  esoteric: 0.20,  // 20%
  jarvis: 0.20,    // 20%
};

// Context is NOT a weighted engine - it's a bounded modifier
export const CONTEXT_MODIFIER_CAP = 0.35;  // ±0.35

// Boost caps (for display/validation)
export const BOOST_CAPS = {
  confluence: 1.5,      // CONFLUENCE_BOOST_CAP
  msrf: 1.0,           // MSRF_BOOST_CAP
  jason_sim: 0.5,      // JASON_SIM_BOOST_CAP (can be negative)
  serp: 0.5,           // SERP_BOOST_CAP_TOTAL
  ensemble: 0.5,       // ENSEMBLE_ADJUSTMENT_STEP
};

export const MONITOR_THRESHOLD = 5.5;
export const MIN_FINAL_SCORE = 6.5;      // Community threshold
export const GOLD_STAR_THRESHOLD = 7.5;
export const TITANIUM_THRESHOLD = 8.0;

export const TITANIUM_RULE = {
  minEnginesGte: 3,
  engineThreshold: 6.5,  // 3/5 engines must be >= this
  threshold: 8.0,
};

export const GOLD_STAR_GATES = {
  ai_score: 6.8,
  research_score: 5.5,
  jarvis_score: 6.5,
  esoteric_score: 4.0,
};

// Tier labels - must match backend exactly
export const TIERS = Object.freeze({
  TITANIUM: "TITANIUM",
  TITANIUM_SMASH: "TITANIUM_SMASH",  // Frontend variant with UI emphasis
  GOLD_STAR: "GOLD_STAR",
  EDGE_LEAN: "EDGE_LEAN",
  MONITOR: "MONITOR",
  PASS: "PASS",
});

// Tier colors for UI
export const TIER_COLORS = Object.freeze({
  TITANIUM: "#E5E4E2",    // Platinum/Silver
  GOLD_STAR: "#FFD700",   // Gold
  EDGE_LEAN: "#4CAF50",   // Green
});

// Export contract for validation
export const FRONTEND_SCORING_CONTRACT = {
  engine_weights: ENGINE_WEIGHTS,
  min_final_score: MIN_FINAL_SCORE,
  gold_star_threshold: GOLD_STAR_THRESHOLD,
  titanium_rule: TITANIUM_RULE,
  gold_star_gates: GOLD_STAR_GATES,
  tiers: TIERS,
  tier_colors: TIER_COLORS,
};
