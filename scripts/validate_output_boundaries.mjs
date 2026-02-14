#!/usr/bin/env node
/**
 * PROOF 5: Output Boundary Validator
 *
 * Validates that all picks pass contract boundaries:
 *   - All picks have final_score >= 6.5 (community filter)
 *   - All picks have valid tier (TITANIUM_SMASH, GOLD_STAR, EDGE_LEAN)
 *   - All 4 engine scores present and in range [0, 10]
 *
 * Run: VITE_BOOKIE_API_KEY=xxx node scripts/validate_output_boundaries.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

import { MIN_FINAL_SCORE, TIERS } from '../core/frontend_scoring_contract.js';

const SPORTS = ['NBA', 'NHL', 'NFL', 'MLB', 'NCAAB'];

// Valid tiers for community-facing picks
const VALID_TIERS = new Set([
  TIERS.TITANIUM,
  TIERS.TITANIUM_SMASH,
  TIERS.GOLD_STAR,
  TIERS.EDGE_LEAN,
]);

// Engine score fields that must be present
const ENGINE_FIELDS = ['ai_score', 'research_score', 'esoteric_score', 'jarvis_score'];

// =============================================================================
// HELPERS
// =============================================================================

function getApiKey() {
  const key = process.env.VITE_BOOKIE_API_KEY;
  if (!key) {
    console.error('❌ ERROR: VITE_BOOKIE_API_KEY environment variable is required');
    process.exit(1);
  }
  return key;
}

function getBaseUrl() {
  return process.env.VITE_API_BASE_URL || 'https://web-production-7b2a.up.railway.app';
}

async function fetchBestBets(sport, apiKey) {
  const url = `${getBaseUrl()}/live/best-bets/${sport}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!response.ok) {
      return { error: `HTTP ${response.status}`, picks: [] };
    }
    const data = await response.json();
    const gamePicks = data.game_picks?.picks || [];
    const propPicks = data.props?.picks || [];
    return { picks: [...gamePicks, ...propPicks] };
  } catch (err) {
    return { error: err.message, picks: [] };
  }
}

function validatePick(pick, sport) {
  const violations = [];
  const pickId = pick.pick_id || pick.id || 'unknown';
  const prefix = `${sport}/${pickId}`;

  // 1. Check final_score >= MIN_FINAL_SCORE (community filter)
  const finalScore = pick.final_score;
  if (typeof finalScore !== 'number' || isNaN(finalScore)) {
    violations.push(`${prefix}: final_score is missing or invalid`);
  } else if (finalScore < MIN_FINAL_SCORE) {
    violations.push(`${prefix}: final_score=${finalScore.toFixed(2)} < ${MIN_FINAL_SCORE} (below community threshold)`);
  }

  // 2. Check tier is valid
  const tier = pick.tier;
  if (!tier) {
    violations.push(`${prefix}: tier is missing`);
  } else if (!VALID_TIERS.has(tier)) {
    violations.push(`${prefix}: tier="${tier}" is not a valid community tier`);
  }

  // 3. Check all engine scores present and in range
  for (const field of ENGINE_FIELDS) {
    const score = pick[field] ?? pick.scoring_breakdown?.[field];
    if (typeof score !== 'number' || isNaN(score)) {
      violations.push(`${prefix}: ${field} is missing or invalid`);
    } else if (score < 0 || score > 10) {
      violations.push(`${prefix}: ${field}=${score.toFixed(2)} out of range [0, 10]`);
    }
  }

  return violations;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('============================================');
  console.log('PROOF 5: Output Boundary Validator');
  console.log('============================================\n');

  const apiKey = getApiKey();
  const allViolations = [];
  let totalPicks = 0;
  let validPicks = 0;

  for (const sport of SPORTS) {
    process.stdout.write(`Checking ${sport}... `);

    const { error, picks } = await fetchBestBets(sport, apiKey);

    if (error) {
      console.log(`⚠️  Error: ${error}`);
      continue;
    }

    if (picks.length === 0) {
      console.log('⏭️  No picks');
      continue;
    }

    totalPicks += picks.length;
    let sportViolations = [];

    for (const pick of picks) {
      const violations = validatePick(pick, sport);
      if (violations.length === 0) {
        validPicks++;
      } else {
        sportViolations.push(...violations);
      }
    }

    if (sportViolations.length === 0) {
      console.log(`✅ ${picks.length} picks pass all boundaries`);
    } else {
      console.log(`❌ ${sportViolations.length} violation(s) in ${picks.length} picks`);
      allViolations.push(...sportViolations);
    }
  }

  // Summary
  console.log('\n============================================');

  if (totalPicks === 0) {
    console.log('⚠️  WARNING: No picks found across any sport');
    console.log('   This may be normal during off-season.');
    console.log('============================================');
    process.exit(0);
  }

  if (allViolations.length > 0) {
    console.log(`❌ VALIDATION FAILED: ${allViolations.length} boundary violation(s)\n`);

    // Show first 10 violations to avoid spam
    const showCount = Math.min(allViolations.length, 10);
    for (let i = 0; i < showCount; i++) {
      console.log(`   ${allViolations[i]}`);
    }
    if (allViolations.length > showCount) {
      console.log(`   ... and ${allViolations.length - showCount} more`);
    }

    console.log(`\n   ${validPicks}/${totalPicks} picks passed (${((validPicks/totalPicks)*100).toFixed(1)}%)`);
    console.log('============================================');
    process.exit(1);
  }

  console.log(`✅ ALL PICKS PASS BOUNDARIES`);
  console.log(`   ${validPicks}/${totalPicks} picks validated`);
  console.log('   - All final_score >= ' + MIN_FINAL_SCORE);
  console.log('   - All tiers valid');
  console.log('   - All engine scores in [0, 10]');
  console.log('============================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
