/**
 * FRONTEND SCORING CONTRACT - Single Source of Truth
 * Must match backend: ~/Desktop/ai-betting-backend-main/core/scoring_contract.py
 *
 * Import these constants - NEVER hardcode them in components
 */

export const ENGINE_WEIGHTS = {
  ai: 0.25,        // 25%
  research: 0.35,  // 35% - LARGEST
  esoteric: 0.15,  // 15%
  jarvis: 0.25,    // 25%
};

// Context is NOT a weighted engine - it's a bounded modifier
export const CONTEXT_MODIFIER_CAP = 0.35;  // +-0.35

// Boost caps (for display/validation) — verified against live backend data Feb 2026
export const BOOST_CAPS = {
  confluence: 3.0,      // CONFLUENCE_BOOST_CAP (backend sends up to 3.0)
  msrf: 1.0,           // MSRF_BOOST_CAP
  jason_sim: 1.5,      // JASON_SIM_BOOST_CAP (can be negative, range -1.5 to +0.5)
  serp: 0.55,          // SERP_BOOST_CAP_TOTAL (observed 0.54 from backend)
  ensemble: 0.5,       // ENSEMBLE_ADJUSTMENT_CAP
  phase8: 0.5,         // PHASE8_BOOST (lunar, mercury, rivalry, solar)
  glitch: 0.5,         // GLITCH_ADJUSTMENT
  gematria: 0.5,       // GEMATRIA_BOOST
  harmonic: 0.5,       // HARMONIC_BOOST
};

export const MONITOR_THRESHOLD = 5.5;
export const MIN_FINAL_SCORE = 7.0;      // Matches backend scoring_contract.py
export const GOLD_STAR_THRESHOLD = 7.5;
export const TITANIUM_THRESHOLD = 8.0;

// Titanium requires 3 of 4 weighted engines (ai, research, esoteric, jarvis) >= 8.0
// Context is excluded from titanium engine count
export const TITANIUM_RULE = {
  minEnginesGte: 3,
  engineCount: 4,       // ai, research, esoteric, jarvis (NOT context)
  engineThreshold: 8.0, // each engine must be >= this
  threshold: 8.0,       // final_score must also be >= this
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
