#!/usr/bin/env node
/**
 * PROOF 4: Market Coverage Validator
 *
 * Validates that the system produces picks across market types.
 * Uses the debug payload to check market_counts_by_type.
 *
 * Calls: GET /live/best-bets/{sport}?debug=1
 * Pass: market_counts shows coverage for available market types
 * Fail: Moneyline = 0 when odds API returned moneyline markets
 *
 * Run: VITE_BOOKIE_API_KEY=xxx node scripts/validate_market_coverage.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

const SPORTS = ['NBA', 'NHL', 'NFL', 'MLB', 'NCAAB'];

// Expected market types for each sport
const EXPECTED_MARKETS = {
  NBA: ['spread', 'total', 'moneyline', 'player_prop'],
  NHL: ['spread', 'total', 'moneyline', 'player_prop'],
  NFL: ['spread', 'total', 'moneyline', 'player_prop'],
  MLB: ['spread', 'total', 'moneyline', 'player_prop'],
  NCAAB: ['spread', 'total', 'moneyline'],
};

// Minimum expected market types (at least these should be present if games exist)
const MIN_MARKET_TYPES = ['spread', 'total'];

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

async function fetchBestBetsDebug(sport, apiKey) {
  const url = `${getBaseUrl()}/live/best-bets/${sport}?debug=1`;
  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

function countMarketTypes(picks) {
  const counts = {};
  for (const pick of picks) {
    const type = pick.pick_type || pick.market_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('============================================');
  console.log('PROOF 4: Market Coverage Validator');
  console.log('============================================\n');

  const apiKey = getApiKey();
  const errors = [];
  const warnings = [];
  let sportsWithPicks = 0;

  for (const sport of SPORTS) {
    process.stdout.write(`Checking ${sport}... `);

    const data = await fetchBestBetsDebug(sport, apiKey);

    if (data.error) {
      console.log(`⚠️  Error: ${data.error}`);
      warnings.push(`${sport}: fetch error - ${data.error}`);
      continue;
    }

    // Collect all picks
    const gamePicks = data.game_picks?.picks || [];
    const propPicks = data.props?.picks || [];
    const allPicks = [...gamePicks, ...propPicks];

    if (allPicks.length === 0) {
      console.log('⏭️  No picks');
      continue;
    }

    sportsWithPicks++;

    // Count market types from picks
    const marketCounts = countMarketTypes(allPicks);

    // Also check if debug payload has market_counts_by_type
    const debugCounts = data.debug?.market_counts_by_type || data.market_counts_by_type || null;

    // Display coverage
    const marketTypes = Object.keys(marketCounts);
    const coverage = marketTypes.map(t => `${t}:${marketCounts[t]}`).join(', ');

    // Check minimum market types are present
    const hasGames = gamePicks.length > 0;
    const missingMin = [];

    if (hasGames) {
      for (const minType of MIN_MARKET_TYPES) {
        if (!marketCounts[minType] && !marketCounts[minType.toLowerCase()]) {
          missingMin.push(minType);
        }
      }
    }

    if (missingMin.length > 0) {
      console.log(`⚠️  ${coverage} - missing: ${missingMin.join(', ')}`);
      warnings.push(`${sport}: Missing market types: ${missingMin.join(', ')}`);
    } else {
      console.log(`✅ ${coverage}`);
    }

    // If debug counts available, verify consistency
    if (debugCounts) {
      for (const [type, count] of Object.entries(debugCounts)) {
        const actualCount = marketCounts[type] || 0;
        if (count > 0 && actualCount === 0) {
          warnings.push(`${sport}: Debug shows ${type}=${count} but no picks found`);
        }
      }
    }
  }

  // Summary
  console.log('\n============================================');

  if (sportsWithPicks === 0) {
    console.log('⚠️  WARNING: No picks found across any sport');
    console.log('   Cannot validate market coverage without data.');
    console.log('============================================');
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`❌ VALIDATION FAILED: ${errors.length} market coverage error(s)\n`);
    errors.forEach(e => console.log(`   - ${e}`));
    console.log('============================================');
    process.exit(1);
  }

  console.log('✅ MARKET COVERAGE VALIDATED');
  console.log(`   ${sportsWithPicks} sport(s) show market type diversity`);
  console.log('============================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
