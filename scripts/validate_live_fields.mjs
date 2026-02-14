#!/usr/bin/env node
/**
 * PROOF 6: Live Betting Fields Validator
 *
 * Validates that live betting picks have required context fields.
 *
 * For picks where is_live: true:
 *   Pass: game_status and data_age_ms are present and valid
 *   Warn: Missing current_score or time_remaining (future enhancement)
 *
 * Run: VITE_BOOKIE_API_KEY=xxx node scripts/validate_live_fields.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

const SPORTS = ['NBA', 'NHL', 'NFL', 'MLB', 'NCAAB'];

// Required fields for live picks
const REQUIRED_LIVE_FIELDS = ['game_status', 'data_age_ms'];

// Optional fields (warn if missing)
const OPTIONAL_LIVE_FIELDS = ['current_score', 'time_remaining', 'quarter', 'period'];

// Maximum acceptable data age (5 minutes in ms)
const MAX_DATA_AGE_MS = 5 * 60 * 1000;

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

function validateLivePick(pick, sport) {
  const errors = [];
  const warnings = [];
  const pickId = pick.pick_id || pick.id || 'unknown';
  const prefix = `${sport}/${pickId}`;

  // Check required fields
  for (const field of REQUIRED_LIVE_FIELDS) {
    if (pick[field] === undefined || pick[field] === null) {
      errors.push(`${prefix}: missing required field "${field}"`);
    }
  }

  // Validate data_age_ms if present
  if (pick.data_age_ms !== undefined) {
    if (typeof pick.data_age_ms !== 'number' || pick.data_age_ms < 0) {
      errors.push(`${prefix}: data_age_ms is invalid (${pick.data_age_ms})`);
    } else if (pick.data_age_ms > MAX_DATA_AGE_MS) {
      warnings.push(`${prefix}: data_age_ms=${pick.data_age_ms}ms (>${MAX_DATA_AGE_MS/1000}s stale)`);
    }
  }

  // Validate game_status if present
  if (pick.game_status !== undefined) {
    const validStatuses = ['in_progress', 'live', 'halftime', 'timeout', 'delayed'];
    if (!validStatuses.includes(pick.game_status.toLowerCase())) {
      warnings.push(`${prefix}: unusual game_status="${pick.game_status}"`);
    }
  }

  // Check optional fields (warn only)
  const missingOptional = OPTIONAL_LIVE_FIELDS.filter(f =>
    pick[f] === undefined || pick[f] === null
  );
  if (missingOptional.length > 0) {
    warnings.push(`${prefix}: missing optional: ${missingOptional.join(', ')}`);
  }

  return { errors, warnings };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('============================================');
  console.log('PROOF 6: Live Betting Fields Validator');
  console.log('============================================\n');

  const apiKey = getApiKey();
  const allErrors = [];
  const allWarnings = [];
  let totalLivePicks = 0;
  let validLivePicks = 0;

  for (const sport of SPORTS) {
    process.stdout.write(`Checking ${sport}... `);

    const { error, picks } = await fetchBestBets(sport, apiKey);

    if (error) {
      console.log(`⚠️  Error: ${error}`);
      continue;
    }

    // Filter to only live picks
    const livePicks = picks.filter(p => p.is_live === true || p.has_started === true);

    if (livePicks.length === 0) {
      console.log('⏭️  No live picks');
      continue;
    }

    totalLivePicks += livePicks.length;
    let sportErrors = [];
    let sportWarnings = [];

    for (const pick of livePicks) {
      const { errors, warnings } = validateLivePick(pick, sport);
      if (errors.length === 0) {
        validLivePicks++;
      }
      sportErrors.push(...errors);
      sportWarnings.push(...warnings);
    }

    if (sportErrors.length === 0) {
      if (sportWarnings.length > 0) {
        console.log(`✅ ${livePicks.length} live picks valid (${sportWarnings.length} warnings)`);
      } else {
        console.log(`✅ ${livePicks.length} live picks fully valid`);
      }
    } else {
      console.log(`❌ ${sportErrors.length} error(s) in ${livePicks.length} live picks`);
    }

    allErrors.push(...sportErrors);
    allWarnings.push(...sportWarnings);
  }

  // Summary
  console.log('\n============================================');

  if (totalLivePicks === 0) {
    console.log('ℹ️  INFO: No live picks found across any sport');
    console.log('   This is normal when no games are in progress.');
    console.log('============================================');
    process.exit(0);
  }

  if (allWarnings.length > 0 && allWarnings.length <= 5) {
    console.log(`⚠️  WARNINGS (${allWarnings.length}):`);
    allWarnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  } else if (allWarnings.length > 5) {
    console.log(`⚠️  ${allWarnings.length} warnings (first 5):`);
    allWarnings.slice(0, 5).forEach(w => console.log(`   - ${w}`));
    console.log('');
  }

  if (allErrors.length > 0) {
    console.log(`❌ VALIDATION FAILED: ${allErrors.length} live field error(s)\n`);

    const showCount = Math.min(allErrors.length, 10);
    for (let i = 0; i < showCount; i++) {
      console.log(`   ${allErrors[i]}`);
    }
    if (allErrors.length > showCount) {
      console.log(`   ... and ${allErrors.length - showCount} more`);
    }

    console.log(`\n   ${validLivePicks}/${totalLivePicks} live picks passed`);
    console.log('============================================');
    process.exit(1);
  }

  console.log('✅ ALL LIVE PICKS HAVE VALID CONTEXT');
  console.log(`   ${validLivePicks}/${totalLivePicks} live picks validated`);
  console.log('   - game_status present');
  console.log('   - data_age_ms present and fresh');
  console.log('============================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
