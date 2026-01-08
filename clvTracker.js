/**
 * CLV TRACKER v1.0
 *
 * Closing Line Value is the gold standard for measuring betting edge.
 * If you consistently get better numbers than the closing line,
 * you have proven, sustainable edge.
 *
 * CLV = (Closing Line - Your Line) for spreads
 * CLV = (Your Odds - Closing Odds) converted to implied probability for MLs
 */

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PICKS: 'bookie_clv_picks',
  STATS: 'bookie_clv_stats',
  SETTINGS: 'bookie_clv_settings'
};

// ============================================================================
// PICK STRUCTURE
// ============================================================================

/**
 * Pick object structure:
 * {
 *   id: string,              // Unique identifier
 *   timestamp: number,       // When pick was made
 *   sport: string,           // NBA, NFL, etc.
 *   game: {
 *     home_team: string,
 *     away_team: string,
 *     commence_time: string
 *   },
 *   bet_type: string,        // 'spread', 'total', 'moneyline'
 *   side: string,            // 'HOME', 'AWAY', 'OVER', 'UNDER'
 *   opening_line: number,    // Line when pick was made
 *   opening_odds: number,    // Odds when pick was made
 *   opening_book: string,    // Sportsbook used
 *   closing_line: number,    // Line at game time (null until closed)
 *   closing_odds: number,    // Odds at game time (null until closed)
 *   clv: number,             // Calculated CLV (null until closed)
 *   clv_cents: number,       // CLV in cents of juice
 *   result: string,          // 'WIN', 'LOSS', 'PUSH', null
 *   confidence: number,      // Signal engine confidence
 *   tier: string,            // GOLDEN_CONVERGENCE, etc.
 *   signals: array           // Top signals at time of pick
 * }
 */

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate unique pick ID
 */
const generatePickId = () => {
  return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all picks from storage
 */
export const getAllPicks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PICKS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading picks:', error);
    return [];
  }
};

/**
 * Save picks to storage
 */
const savePicks = (picks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PICKS, JSON.stringify(picks));
  } catch (error) {
    console.error('Error saving picks:', error);
  }
};

/**
 * Record a new pick (captures opening line)
 */
export const recordPick = (pickData) => {
  const pick = {
    id: generatePickId(),
    timestamp: Date.now(),
    sport: pickData.sport,
    game: {
      home_team: pickData.home_team,
      away_team: pickData.away_team,
      commence_time: pickData.commence_time
    },
    bet_type: pickData.bet_type,
    side: pickData.side,
    opening_line: pickData.line,
    opening_odds: pickData.odds,
    opening_book: pickData.book,
    closing_line: null,
    closing_odds: null,
    clv: null,
    clv_cents: null,
    result: null,
    confidence: pickData.confidence,
    tier: pickData.tier,
    signals: pickData.signals || []
  };

  const picks = getAllPicks();
  picks.push(pick);
  savePicks(picks);

  return pick;
};

/**
 * Update pick with closing line
 */
export const recordClosingLine = (pickId, closingLine, closingOdds) => {
  const picks = getAllPicks();
  const pickIndex = picks.findIndex(p => p.id === pickId);

  if (pickIndex === -1) {
    console.error('Pick not found:', pickId);
    return null;
  }

  const pick = picks[pickIndex];
  pick.closing_line = closingLine;
  pick.closing_odds = closingOdds;

  // Calculate CLV based on bet type
  if (pick.bet_type === 'spread' || pick.bet_type === 'total') {
    pick.clv = calculateSpreadCLV(pick);
  } else if (pick.bet_type === 'moneyline') {
    pick.clv = calculateMoneylineCLV(pick);
  }

  // Calculate CLV in cents of juice
  pick.clv_cents = calculateCLVCents(pick);

  picks[pickIndex] = pick;
  savePicks(picks);

  return pick;
};

/**
 * Grade a pick with result
 */
export const gradePick = (pickId, result) => {
  const picks = getAllPicks();
  const pickIndex = picks.findIndex(p => p.id === pickId);

  if (pickIndex === -1) {
    console.error('Pick not found:', pickId);
    return null;
  }

  picks[pickIndex].result = result;
  savePicks(picks);

  // Update aggregate stats
  updateStats();

  return picks[pickIndex];
};

// ============================================================================
// CLV CALCULATION
// ============================================================================

/**
 * Calculate CLV for spread/total bets
 * Positive CLV = you got a better number than closing
 */
const calculateSpreadCLV = (pick) => {
  if (pick.closing_line === null || pick.opening_line === null) return null;

  // For spreads: if you took HOME -3 and it closed at -4, you got +1 CLV
  // For totals: if you took OVER 210 and it closed at 212, you got +2 CLV
  if (pick.side === 'HOME' || pick.side === 'UNDER') {
    return pick.closing_line - pick.opening_line;
  } else {
    return pick.opening_line - pick.closing_line;
  }
};

/**
 * Calculate CLV for moneyline bets
 * Convert odds to implied probability and compare
 */
const calculateMoneylineCLV = (pick) => {
  if (pick.closing_odds === null || pick.opening_odds === null) return null;

  const openingProb = oddsToImpliedProbability(pick.opening_odds);
  const closingProb = oddsToImpliedProbability(pick.closing_odds);

  // Positive CLV = you got better odds (lower implied prob for favorites, higher for dogs)
  return (closingProb - openingProb) * 100;
};

/**
 * Convert American odds to implied probability
 */
const oddsToImpliedProbability = (odds) => {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
};

/**
 * Calculate CLV in "cents" of juice
 * Industry standard measurement
 */
const calculateCLVCents = (pick) => {
  if (pick.clv === null) return null;

  // For spreads, each half point is roughly worth 3 cents of juice
  if (pick.bet_type === 'spread' || pick.bet_type === 'total') {
    return pick.clv * 6; // ~6 cents per point
  }

  // For MLs, already in probability percentage
  return pick.clv * 2; // ~2 cents per 1% edge
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Calculate and store aggregate statistics
 */
const updateStats = () => {
  const picks = getAllPicks();
  const closedPicks = picks.filter(p => p.clv !== null);
  const gradedPicks = picks.filter(p => p.result !== null);

  const stats = {
    totalPicks: picks.length,
    closedPicks: closedPicks.length,
    gradedPicks: gradedPicks.length,

    // CLV Stats
    avgCLV: closedPicks.length > 0
      ? closedPicks.reduce((sum, p) => sum + (p.clv || 0), 0) / closedPicks.length
      : 0,
    avgCLVCents: closedPicks.length > 0
      ? closedPicks.reduce((sum, p) => sum + (p.clv_cents || 0), 0) / closedPicks.length
      : 0,
    positiveCLVRate: closedPicks.length > 0
      ? closedPicks.filter(p => p.clv > 0).length / closedPicks.length * 100
      : 0,

    // Win/Loss Stats
    wins: gradedPicks.filter(p => p.result === 'WIN').length,
    losses: gradedPicks.filter(p => p.result === 'LOSS').length,
    pushes: gradedPicks.filter(p => p.result === 'PUSH').length,
    winRate: gradedPicks.filter(p => p.result !== 'PUSH').length > 0
      ? gradedPicks.filter(p => p.result === 'WIN').length /
        gradedPicks.filter(p => p.result !== 'PUSH').length * 100
      : 0,

    // By Tier
    byTier: {},
    bySport: {},

    lastUpdated: Date.now()
  };

  // Stats by tier
  const tiers = ['GOLDEN_CONVERGENCE', 'SUPER_SIGNAL', 'HARMONIC_ALIGNMENT', 'PARTIAL_ALIGNMENT'];
  tiers.forEach(tier => {
    const tierPicks = gradedPicks.filter(p => p.tier === tier);
    const tierClosed = closedPicks.filter(p => p.tier === tier);
    stats.byTier[tier] = {
      total: tierPicks.length,
      wins: tierPicks.filter(p => p.result === 'WIN').length,
      winRate: tierPicks.filter(p => p.result !== 'PUSH').length > 0
        ? tierPicks.filter(p => p.result === 'WIN').length /
          tierPicks.filter(p => p.result !== 'PUSH').length * 100
        : 0,
      avgCLV: tierClosed.length > 0
        ? tierClosed.reduce((sum, p) => sum + (p.clv || 0), 0) / tierClosed.length
        : 0
    };
  });

  // Stats by sport
  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];
  sports.forEach(sport => {
    const sportPicks = gradedPicks.filter(p => p.sport === sport);
    const sportClosed = closedPicks.filter(p => p.sport === sport);
    stats.bySport[sport] = {
      total: sportPicks.length,
      wins: sportPicks.filter(p => p.result === 'WIN').length,
      winRate: sportPicks.filter(p => p.result !== 'PUSH').length > 0
        ? sportPicks.filter(p => p.result === 'WIN').length /
          sportPicks.filter(p => p.result !== 'PUSH').length * 100
        : 0,
      avgCLV: sportClosed.length > 0
        ? sportClosed.reduce((sum, p) => sum + (p.clv || 0), 0) / sportClosed.length
        : 0
    };
  });

  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  return stats;
};

/**
 * Get current statistics
 */
export const getStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      return JSON.parse(stored);
    }
    return updateStats();
  } catch (error) {
    console.error('Error reading stats:', error);
    return updateStats();
  }
};

/**
 * Get picks that need closing lines recorded
 */
export const getPendingClosingLines = () => {
  const picks = getAllPicks();
  const now = Date.now();

  return picks.filter(pick => {
    // No closing line yet
    if (pick.closing_line !== null) return false;

    // Game should have started (check commence_time)
    const gameTime = new Date(pick.game.commence_time).getTime();
    return now >= gameTime;
  });
};

/**
 * Get picks that need grading
 */
export const getPendingGrades = () => {
  const picks = getAllPicks();
  const now = Date.now();

  return picks.filter(pick => {
    // Not graded yet
    if (pick.result !== null) return false;

    // Game should be over (3 hours after start for most sports)
    const gameTime = new Date(pick.game.commence_time).getTime();
    const threeHours = 3 * 60 * 60 * 1000;
    return now >= gameTime + threeHours;
  });
};

/**
 * Get recent picks for display
 */
export const getRecentPicks = (limit = 20) => {
  const picks = getAllPicks();
  return picks
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

/**
 * Clear all CLV data (for testing)
 */
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PICKS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};

// ============================================================================
// CLV INSIGHTS
// ============================================================================

/**
 * Analyze CLV trends and generate insights
 */
export const getCLVInsights = () => {
  const stats = getStats();
  const picks = getAllPicks();

  // Validate stats object
  if (!stats || typeof stats !== 'object') {
    return [];
  }

  const closedPicks = picks.filter(p => p.clv !== null);
  const insights = [];

  // Overall CLV health
  if (stats.avgCLV != null && stats.avgCLV > 0.5) {
    insights.push({
      type: 'success',
      title: 'Strong CLV Performance',
      message: `Averaging +${stats.avgCLV.toFixed(2)} points CLV. You're beating the market.`
    });
  } else if (stats.avgCLV != null && stats.avgCLV < -0.5) {
    insights.push({
      type: 'warning',
      title: 'Negative CLV Trend',
      message: `Averaging ${stats.avgCLV.toFixed(2)} points CLV. Consider waiting for better numbers.`
    });
  }

  // Positive CLV rate
  if (stats.positiveCLVRate != null && stats.positiveCLVRate >= 55) {
    insights.push({
      type: 'success',
      title: 'Consistent Line Beating',
      message: `${stats.positiveCLVRate.toFixed(0)}% of picks beat the closing line.`
    });
  }

  // Tier performance
  if (stats.byTier?.GOLDEN_CONVERGENCE?.total >= 5) {
    const tierStats = stats.byTier.GOLDEN_CONVERGENCE;
    if (tierStats.winRate >= 60) {
      insights.push({
        type: 'success',
        title: 'Golden Convergence Validated',
        message: `${tierStats.winRate.toFixed(0)}% win rate on top-tier picks (${tierStats.total} picks).`
      });
    }
  }

  // Sport-specific insights
  if (stats.bySport && typeof stats.bySport === 'object') {
    Object.entries(stats.bySport).forEach(([sport, sportStats]) => {
      if (sportStats?.total >= 10) {
        if (sportStats.avgCLV > 1) {
          insights.push({
            type: 'success',
            title: `${sport} Edge Detected`,
            message: `Strong +${sportStats.avgCLV.toFixed(2)} CLV in ${sport} (${sportStats.total} picks).`
          });
        } else if (sportStats.avgCLV < -1) {
          insights.push({
            type: 'warning',
            title: `${sport} Underperformance`,
            message: `Negative ${sportStats.avgCLV.toFixed(2)} CLV in ${sport}. Consider reducing exposure.`
          });
        }
      }
    });
  }

  return insights;
};

export default {
  recordPick,
  recordClosingLine,
  gradePick,
  getAllPicks,
  getStats,
  getPendingClosingLines,
  getPendingGrades,
  getRecentPicks,
  getCLVInsights,
  clearAllData
};
