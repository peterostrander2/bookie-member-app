#!/usr/bin/env node
/**
 * Backend Integration Verification Script
 *
 * Verifies all API endpoints return expected data structures.
 * Run with: node scripts/verify-backend.js
 *
 * Optional: API_KEY=your-key node scripts/verify-backend.js
 */

const API_BASE = process.env.API_URL || 'https://web-production-7b2a.up.railway.app';
const API_KEY = process.env.API_KEY || process.env.VITE_API_KEY || '';

const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  dim: '\x1b[2m'
};

const log = {
  pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`),
  detail: (msg) => console.log(`  ${colors.dim}${msg}${colors.reset}`)
};

// Fetch helper with auth
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

// Validation helpers
function hasFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return { valid: false, missing: fields };
  const missing = fields.filter(f => !(f in obj));
  return { valid: missing.length === 0, missing };
}

function isArray(val) {
  return Array.isArray(val);
}

function isNumber(val) {
  return typeof val === 'number' && !isNaN(val);
}

function isString(val) {
  return typeof val === 'string';
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log.pass(name);
  } else {
    results.failed++;
    log.fail(name);
  }
  if (details) log.detail(details);
}

// ============================================================================
// ENDPOINT TESTS
// ============================================================================

async function testHealth() {
  log.section('Health Check');

  const { ok, data } = await apiFetch('/health');
  recordTest('GET /health responds', ok);

  if (data) {
    const { valid, missing } = hasFields(data, ['status']);
    recordTest('Health has status field', valid, missing.length ? `Missing: ${missing.join(', ')}` : '');
  }
}

async function testTodayEnergy() {
  log.section('Esoteric - Today Energy');

  const { ok, data } = await apiFetch('/esoteric/today-energy');
  recordTest('GET /esoteric/today-energy responds', ok);

  if (data) {
    const requiredFields = ['betting_outlook', 'overall_energy', 'moon_phase'];
    const { valid, missing } = hasFields(data, requiredFields);
    recordTest('Today energy has required fields', valid, missing.length ? `Missing: ${missing.join(', ')}` : '');

    if (data.betting_outlook) {
      const validOutlooks = ['BULLISH', 'NEUTRAL', 'BEARISH'];
      const isValidOutlook = validOutlooks.includes(data.betting_outlook);
      recordTest('betting_outlook is valid enum', isValidOutlook, `Got: ${data.betting_outlook}`);
    }

    if ('overall_energy' in data) {
      recordTest('overall_energy is a number', isNumber(data.overall_energy), `Got: ${data.overall_energy}`);
    }

    // Nice to have fields
    const niceToHave = ['moon_emoji', 'life_path', 'zodiac', 'recommendation'];
    const presentNice = niceToHave.filter(f => f in data);
    if (presentNice.length < niceToHave.length) {
      log.warn(`Optional fields missing: ${niceToHave.filter(f => !(f in data)).join(', ')}`);
      results.warnings++;
    }
  }
}

async function testBestBets(sport) {
  const { ok, data } = await apiFetch(`/live/best-bets/${sport}`);
  recordTest(`GET /live/best-bets/${sport} responds`, ok);

  if (!ok || !data) return;

  // Check for props
  const hasProps = data.props && data.props.picks;
  recordTest(`${sport} best-bets has props.picks`, hasProps);

  if (hasProps && data.props.picks.length > 0) {
    const pick = data.props.picks[0];
    const propFields = ['player_name', 'stat_type', 'line', 'confidence'];
    const { valid, missing } = hasFields(pick, propFields);
    recordTest(`${sport} prop pick has required fields`, valid, missing.length ? `Missing: ${missing.join(', ')}` : `Sample: ${pick.player_name} ${pick.stat_type}`);
  }

  // Check for game picks
  const hasGamePicks = data.game_picks && data.game_picks.picks;
  recordTest(`${sport} best-bets has game_picks.picks`, hasGamePicks);

  if (hasGamePicks && data.game_picks.picks.length > 0) {
    const pick = data.game_picks.picks[0];
    const gameFields = ['team', 'confidence'];
    const { valid, missing } = hasFields(pick, gameFields);
    recordTest(`${sport} game pick has required fields`, valid, missing.length ? `Missing: ${missing.join(', ')}` : `Sample: ${pick.team}`);
  }

  // Check confidence values
  const allPicks = [...(data.props?.picks || []), ...(data.game_picks?.picks || [])];
  if (allPicks.length > 0) {
    const hasConfidence = allPicks.every(p => 'confidence' in p || 'total_score' in p);
    recordTest(`${sport} picks have confidence/score`, hasConfidence);
  }
}

async function testSharpMoney(sport) {
  const { ok, data } = await apiFetch(`/live/sharp/${sport}`);
  recordTest(`GET /live/sharp/${sport} responds`, ok);

  if (!ok || !data) return;

  // Check for movements array
  const hasMovements = data.movements && isArray(data.movements);
  const isDirectArray = isArray(data);
  recordTest(`${sport} sharp has movements array`, hasMovements || isDirectArray);

  const movements = hasMovements ? data.movements : (isDirectArray ? data : []);
  if (movements.length > 0) {
    const move = movements[0];
    const moveFields = ['line_move'];
    const { valid, missing } = hasFields(move, moveFields);
    recordTest(`${sport} sharp move has line_move`, valid, missing.length ? `Missing: ${missing.join(', ')}` : `Sample move: ${move.line_move}`);

    // Nice to have
    if (!('team' in move) && !('matchup' in move)) {
      log.warn(`${sport} sharp move missing team/matchup identifier`);
      results.warnings++;
    }
  } else {
    log.warn(`${sport} sharp: No movements data (may be no games today)`);
    results.warnings++;
  }
}

async function testInjuries(sport) {
  const { ok, data } = await apiFetch(`/live/injuries/${sport}`);
  recordTest(`GET /live/injuries/${sport} responds`, ok);

  if (!ok || !data) return;

  // Check for injuries array
  const hasInjuries = data.injuries && isArray(data.injuries);
  const isDirectArray = isArray(data);
  recordTest(`${sport} has injuries array`, hasInjuries || isDirectArray);

  const injuries = hasInjuries ? data.injuries : (isDirectArray ? data : []);
  if (injuries.length > 0) {
    const inj = injuries[0];
    const injFields = ['player', 'status'];
    // Also accept 'name' instead of 'player'
    const hasPlayer = 'player' in inj || 'name' in inj;
    const hasStatus = 'status' in inj;
    recordTest(`${sport} injury has player/status`, hasPlayer && hasStatus, `Sample: ${inj.player || inj.name} - ${inj.status}`);

    // Check for impact field (important for filtering)
    if (!('impact' in inj)) {
      log.warn(`${sport} injuries missing 'impact' field (needed for high-impact filtering)`);
      results.warnings++;
    }
  } else {
    log.warn(`${sport}: No injuries data (may be healthy slate)`);
    results.warnings++;
  }
}

async function testSportsbooks() {
  log.section('Sportsbooks');

  const { ok, data } = await apiFetch('/live/sportsbooks');
  recordTest('GET /live/sportsbooks responds', ok);

  if (!ok || !data) return;

  const hasBooks = data.sportsbooks && isArray(data.sportsbooks);
  recordTest('Has sportsbooks array', hasBooks);

  if (hasBooks && data.sportsbooks.length > 0) {
    const book = data.sportsbooks[0];
    const bookFields = ['name'];
    const { valid, missing } = hasFields(book, bookFields);
    recordTest('Sportsbook has name', valid);

    // Nice to have for UI
    const uiFields = ['color', 'logo', 'web_url', 'key'];
    const presentUI = uiFields.filter(f => f in book);
    if (presentUI.length < uiFields.length) {
      log.warn(`Sportsbook missing UI fields: ${uiFields.filter(f => !(f in book)).join(', ')}`);
      results.warnings++;
    }

    log.detail(`Found ${data.sportsbooks.length} sportsbooks: ${data.sportsbooks.map(b => b.name).join(', ')}`);
  }
}

async function testOdds(sport) {
  const { ok, data } = await apiFetch(`/live/odds/${sport}`);
  recordTest(`GET /live/odds/${sport} responds`, ok);

  if (!ok || !data) return;

  const hasGames = data.games && isArray(data.games);
  const hasOdds = data.odds && isArray(data.odds);
  recordTest(`${sport} odds has games/odds arrays`, hasGames || hasOdds, `games: ${data.games?.length || 0}, odds: ${data.odds?.length || 0}`);
}

async function testProps(sport) {
  const { ok, data } = await apiFetch(`/live/props/${sport}`);
  recordTest(`GET /live/props/${sport} responds`, ok);

  if (!ok || !data) return;

  const isArr = isArray(data);
  const hasProps = data.props && isArray(data.props);
  recordTest(`${sport} props returns array`, isArr || hasProps);

  const props = isArr ? data : (hasProps ? data.props : []);
  if (props.length > 0) {
    const prop = props[0];
    const propFields = ['player_name', 'stat_type', 'line'];
    // Accept alternate field names
    const hasPlayer = 'player_name' in prop || 'player' in prop;
    const hasStat = 'stat_type' in prop || 'market' in prop;
    const hasLine = 'line' in prop || 'point' in prop;
    recordTest(`${sport} prop has required fields`, hasPlayer && hasStat && hasLine);
  }
}

async function testBetTracking() {
  log.section('Bet Tracking');

  // Test history endpoint
  const { ok, data } = await apiFetch('/live/bets/history');
  recordTest('GET /live/bets/history responds', ok);

  if (data) {
    const hasBets = 'bets' in data;
    const hasStats = 'stats' in data;
    recordTest('Bet history has bets array', hasBets);
    recordTest('Bet history has stats object', hasStats);
  }
}

async function testParlay() {
  log.section('Parlay Builder');

  // Test parlay history
  const { ok, data } = await apiFetch('/live/parlay/history');
  recordTest('GET /live/parlay/history responds', ok);

  if (data) {
    const hasParlays = 'parlays' in data;
    recordTest('Parlay history has parlays array', hasParlays);
  }
}

async function testLeaderboard() {
  log.section('Community Features');

  const { ok, data } = await apiFetch('/live/leaderboard');
  recordTest('GET /live/leaderboard responds', ok);

  if (data) {
    const hasLeaders = 'leaders' in data || isArray(data);
    recordTest('Leaderboard returns data', hasLeaders);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Backend Integration Verification                  ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nAPI: ${API_BASE}`);
  console.log(`Auth: ${API_KEY ? 'API Key configured' : 'No API key (some endpoints may fail)'}\n`);

  // Core endpoints
  await testHealth();
  await testTodayEnergy();
  await testSportsbooks();

  // Sport-specific endpoints (test with NBA as primary)
  log.section('Best Bets / SMASH Spots');
  for (const sport of SPORTS) {
    await testBestBets(sport);
  }

  log.section('Sharp Money');
  for (const sport of SPORTS) {
    await testSharpMoney(sport);
  }

  log.section('Injuries');
  for (const sport of SPORTS) {
    await testInjuries(sport);
  }

  log.section('Live Odds');
  await testOdds('NBA'); // Just test one sport for odds

  log.section('Player Props');
  await testProps('NBA'); // Just test one sport for props

  // Bet tracking & parlays
  await testBetTracking();
  await testParlay();
  await testLeaderboard();

  // Summary
  console.log(`\n${colors.cyan}━━━ SUMMARY ━━━${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);

  if (results.failed > 0) {
    console.log(`\n${colors.red}⚠ Some tests failed. Check the output above for details.${colors.reset}`);
    console.log(`\nFailed tests:`);
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ${colors.red}✗${colors.reset} ${t.name}${t.details ? ` - ${t.details}` : ''}`);
    });
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✓ All critical tests passed!${colors.reset}`);
    if (results.warnings > 0) {
      console.log(`${colors.yellow}  (${results.warnings} warnings - optional fields missing)${colors.reset}`);
    }
  }
}

main().catch(err => {
  console.error(`\n${colors.red}Script error: ${err.message}${colors.reset}`);
  process.exit(1);
});
