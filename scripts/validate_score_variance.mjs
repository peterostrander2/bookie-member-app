#!/usr/bin/env node
/**
 * PROOF 3: Non-Degeneracy Validator (AI Constant Detection)
 *
 * Validates that AI scores have sufficient variance across picks.
 * Catches regression where AI model returns constant scores.
 *
 * Pass conditions (for >= 5 picks):
 *   - unique(ai_score) >= 4
 *   - stddev(ai_score) >= 0.15
 *
 * Run: VITE_BOOKIE_API_KEY=xxx node scripts/validate_score_variance.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

const SPORTS = ['NBA', 'NHL', 'NFL', 'MLB', 'NCAAB'];
const MIN_PICKS_FOR_VALIDATION = 5;
const MIN_UNIQUE_SCORES = 4;
const MIN_STDDEV = 0.15;

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

    // Combine game picks and props
    const gamePicks = data.game_picks?.picks || [];
    const propPicks = data.props?.picks || [];
    return { picks: [...gamePicks, ...propPicks] };
  } catch (err) {
    return { error: err.message, picks: [] };
  }
}

function calculateStdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

function getUniqueCount(values) {
  // Round to 2 decimal places before counting unique
  const rounded = values.map(v => Math.round(v * 100) / 100);
  return new Set(rounded).size;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('============================================');
  console.log('PROOF 3: Non-Degeneracy Validator');
  console.log('(AI Constant Detection)');
  console.log('============================================\n');

  const apiKey = getApiKey();
  const errors = [];
  const warnings = [];
  let sportsTested = 0;

  for (const sport of SPORTS) {
    process.stdout.write(`Checking ${sport}... `);

    const { error, picks } = await fetchBestBets(sport, apiKey);

    if (error) {
      console.log(`⚠️  Error: ${error}`);
      warnings.push(`${sport}: fetch error - ${error}`);
      continue;
    }

    if (picks.length === 0) {
      console.log('⏭️  No picks available');
      continue;
    }

    // Extract AI scores
    const aiScores = picks
      .map(p => p.ai_score ?? p.scoring_breakdown?.ai_score)
      .filter(s => typeof s === 'number' && !isNaN(s));

    if (aiScores.length < MIN_PICKS_FOR_VALIDATION) {
      console.log(`⏭️  Only ${aiScores.length} picks (need ${MIN_PICKS_FOR_VALIDATION}+)`);
      continue;
    }

    sportsTested++;
    const uniqueCount = getUniqueCount(aiScores);
    const stddev = calculateStdDev(aiScores);

    // Check pass conditions
    const passUnique = uniqueCount >= MIN_UNIQUE_SCORES;
    const passStdDev = stddev >= MIN_STDDEV;

    if (passUnique && passStdDev) {
      console.log(`✅ ${aiScores.length} picks, ${uniqueCount} unique, stddev=${stddev.toFixed(3)}`);
    } else {
      const reasons = [];
      if (!passUnique) reasons.push(`unique=${uniqueCount} (need ${MIN_UNIQUE_SCORES}+)`);
      if (!passStdDev) reasons.push(`stddev=${stddev.toFixed(3)} (need ${MIN_STDDEV}+)`);

      console.log(`❌ FAIL: ${reasons.join(', ')}`);
      errors.push(`${sport}: AI scores appear constant - ${reasons.join(', ')}`);
    }
  }

  // Summary
  console.log('\n============================================');

  if (sportsTested === 0) {
    console.log('⚠️  WARNING: No sports had enough picks to validate');
    console.log('   This may be normal during off-season.');
    console.log('============================================');
    process.exit(0); // Not a failure, just no data
  }

  if (errors.length > 0) {
    console.log(`❌ VALIDATION FAILED: ${errors.length} sport(s) with constant AI scores\n`);
    errors.forEach(e => console.log(`   ${e}`));
    console.log('\n   This indicates AI model regression - scores should vary.');
    console.log('============================================');
    process.exit(1);
  }

  console.log(`✅ ALL CHECKS PASSED (${sportsTested} sport(s) validated)`);
  console.log('   AI scores show healthy variance across picks.');
  console.log('============================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
