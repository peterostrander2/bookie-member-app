/**
 * v12.1 Pick Normalization Utilities
 *
 * COMMUNITY RULES (NON-NEGOTIABLE):
 * 1. Never display picks with score < MIN_FINAL_SCORE
 * 2. TITANIUM is truth-based from backend, NOT inferred from score
 * 3. Today-only guard in ET timezone
 * 4. Score is canonical; tier is only for styling
 */

import {
  MIN_FINAL_SCORE,
  GOLD_STAR_THRESHOLD,
  MONITOR_THRESHOLD,
  TIERS
} from '../../core/frontend_scoring_contract';

// Community threshold - re-export from contract
export const COMMUNITY_THRESHOLD = MIN_FINAL_SCORE;

/**
 * Extract canonical score from pick (0-10 scale)
 * Returns null if score is invalid/missing
 */
export function getPickScore(pick) {
  if (!pick) return null;

  // Try numeric fields in priority order
  const candidates = [
    pick.final_score,
    pick.score,
    pick.finalScore,
    pick.confidence_score,
    pick.confidence
  ];

  for (const val of candidates) {
    if (val === undefined || val === null) continue;

    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) continue;

    // Determine scale and normalize to 0-10
    if (num >= 0 && num <= 1) {
      // 0-1 scale (probability) -> multiply by 10
      return num * 10;
    } else if (num > 10 && num <= 100) {
      // 0-100 scale (percentage) -> divide by 10
      return num / 10;
    } else if (num >= 0 && num <= 10) {
      // Already 0-10 scale
      return num;
    }
    // Unknown scale - skip this candidate
  }

  return null;
}

/**
 * Check if pick is eligible for community display
 * STRICT: score must exist AND be >= MIN_FINAL_SCORE
 */
export function isCommunityEligible(pick) {
  const score = getPickScore(pick);
  return score !== null && score >= COMMUNITY_THRESHOLD;
}

/**
 * Check if pick is TITANIUM (backend truth-based ONLY)
 * DO NOT infer from score - must have explicit backend flag
 */
export function isTitanium(pick) {
  if (!pick) return false;

  return (
    pick.tier === TIERS.TITANIUM_SMASH ||
    pick.titanium_triggered === true ||
    (pick.titanium && pick.titanium.triggered === true)
  );
}

/**
 * Get tier config for styling (NOT for eligibility)
 * TITANIUM is truth-based; other tiers are score-based for styling only
 */
export function getTierForStyling(pick) {
  const score = getPickScore(pick);

  // TITANIUM must be explicit from backend
  if (isTitanium(pick)) {
    return TIERS.TITANIUM_SMASH;
  }

  // Other tiers based on score (for styling only, not eligibility)
  if (score === null) return TIERS.PASS;
  if (score >= GOLD_STAR_THRESHOLD) return TIERS.GOLD_STAR;
  if (score >= MIN_FINAL_SCORE) return TIERS.EDGE_LEAN;
  if (score >= MONITOR_THRESHOLD) return TIERS.MONITOR;
  return TIERS.PASS;
}

/**
 * Parse start time from pick using various field names
 * Returns Date object or null
 */
function parseStartTime(pick) {
  if (!pick) return null;

  const timeFields = [
    pick.start_time,
    pick.startTime,
    pick.commence_time,
    pick.game_time,
    pick.event_time,
    pick.event?.commence_time,
    pick.game?.commence_time
  ];

  for (const val of timeFields) {
    if (!val) continue;

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Get today's date boundaries in ET (America/New_York)
 * Returns { start: Date, end: Date } for today 00:00:00 to 23:59:59 ET
 */
export function getTodayBoundariesET() {
  const now = new Date();

  // Get current date in ET
  const etFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const etDateStr = etFormatter.format(now);
  const [month, day, year] = etDateStr.split('/').map(Number);

  // Create start of day in ET (00:00:00)
  const startET = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00-05:00`);

  // Create end of day in ET (23:59:59)
  const endET = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59-05:00`);

  // Adjust for DST - check if we're in EDT or EST
  const etOffset = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' });
  const isDST = etOffset.includes('EDT');

  if (isDST) {
    // EDT is UTC-4
    startET.setTime(startET.getTime() + 3600000); // Add 1 hour
    endET.setTime(endET.getTime() + 3600000);
  }

  return { start: startET, end: endET };
}

/**
 * Check if pick is for today in ET timezone
 * Returns true if game starts today ET, false otherwise
 */
export function isTodayET(pick, { allowMissingTime = true } = {}) {
  const startTime = parseStartTime(pick);

  // If no start time, allow through by default to avoid hiding live picks
  if (!startTime) {
    if (process.env.NODE_ENV === 'development') {
      const matchup = pick.matchup || pick.game || `${pick.away_team} @ ${pick.home_team}` || 'Unknown';
      const mode = allowMissingTime ? 'allowing' : 'excluding';
      console.warn(`[isTodayET] No start_time for pick: ${matchup} - ${mode}`);
    }
    return allowMissingTime;
  }

  const { start, end } = getTodayBoundariesET();
  const isToday = startTime >= start && startTime <= end;

  if (!isToday && process.env.NODE_ENV === 'development') {
    const matchup = pick.matchup || pick.game || `${pick.away_team} @ ${pick.home_team}` || 'Unknown';
    console.warn(`[isTodayET] Filtered out: ${matchup} | start_time: ${startTime.toISOString()} | today ET: ${start.toISOString()} - ${end.toISOString()}`);
  }

  return isToday;
}

/**
 * Apply all community filters to picks array
 * Returns only picks that pass ALL rules
 */
export function filterCommunityPicks(picks, options = {}) {
  if (!Array.isArray(picks)) return [];

  const {
    requireTodayET = true,
    debug = process.env.NODE_ENV === 'development'
  } = options;

  let filtered = picks;

  // 1. Filter by score eligibility (STRICT)
  filtered = filtered.filter(pick => {
    const eligible = isCommunityEligible(pick);
    if (!eligible && debug) {
      const score = getPickScore(pick);
      const matchup = pick.matchup || pick.game || pick.player || 'Unknown';
      console.warn(`[filterCommunityPicks] Score ineligible: ${matchup} | score: ${score}`);
    }
    return eligible;
  });

  // 2. Filter by today ET if required
  if (requireTodayET) {
    filtered = filtered.filter((pick) => isTodayET(pick, { allowMissingTime: true }));
  }

  return filtered;
}

/**
 * Get book display info from pick
 * Returns { bookName, line, odds, deeplinkUrl, hasDeeplink }
 */
export function getBookInfo(pick) {
  if (!pick) return { bookName: null, line: null, odds: null, deeplinkUrl: null, hasDeeplink: false };

  const bookName = pick.best_book || pick.bookmaker || pick.book || pick.sportsbook || null;
  const line = pick.line ?? pick.point ?? pick.spread ?? null;
  const odds = pick.odds ?? pick.price ?? pick.best_odds_american ?? null;

  // Check for deeplink URL in various fields
  const deeplinkUrl =
    pick.deeplink_url ||
    pick.deep_link ||
    pick.deepLink ||
    pick.book_link ||
    pick.book_links?.[bookName] ||
    null;

  return {
    bookName,
    line,
    odds,
    deeplinkUrl,
    hasDeeplink: !!deeplinkUrl
  };
}

/**
 * Format odds for display (American format)
 */
export function formatOdds(odds) {
  if (odds === null || odds === undefined) return '--';
  const num = typeof odds === 'number' ? odds : parseFloat(odds);
  if (isNaN(num)) return '--';
  return num > 0 ? `+${num}` : num.toString();
}

/**
 * Format line for display
 */
/**
 * Deterministic sort comparator for community picks.
 * Order: Titanium first, then score desc, then start time asc.
 */
export function communitySort(a, b) {
  const aTi = isTitanium(a) ? 1 : 0;
  const bTi = isTitanium(b) ? 1 : 0;
  if (bTi !== aTi) return bTi - aTi;

  const aScore = getPickScore(a) || 0;
  const bScore = getPickScore(b) || 0;
  if (bScore !== aScore) return bScore - aScore;

  const aTime = parseStartTime(a);
  const bTime = parseStartTime(b);
  if (aTime && bTime) return aTime - bTime;
  if (aTime) return -1;
  if (bTime) return 1;
  return 0;
}

export function formatLine(line, side) {
  if (line === null || line === undefined) return '';
  const num = typeof line === 'number' ? line : parseFloat(line);
  if (isNaN(num)) return '';

  // For spreads, add + for positive
  if (side === 'spread' || side === 'SPREAD') {
    return num > 0 ? `+${num}` : num.toString();
  }

  return num.toString();
}
