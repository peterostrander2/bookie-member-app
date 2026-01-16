/**
 * KELLY CALCULATOR v1.0
 *
 * The Kelly Criterion is the mathematically optimal strategy for sizing bets
 * to maximize long-term bankroll growth while minimizing risk of ruin.
 *
 * Formula: f* = (bp - q) / b
 *   Where:
 *   - f* = fraction of bankroll to bet
 *   - b = net odds (decimal odds - 1)
 *   - p = probability of winning
 *   - q = probability of losing (1 - p)
 *
 * IMPORTANT: Full Kelly is aggressive. Most pros use 1/4 to 1/2 Kelly.
 */

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEYS = {
  BANKROLL: 'bookie_bankroll_settings',
  BET_HISTORY: 'bookie_bet_history'
};

// ============================================================================
// ODDS CONVERSION
// ============================================================================

/**
 * Convert American odds to decimal odds
 */
export const americanToDecimal = (americanOdds) => {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
};

/**
 * Convert decimal odds to implied probability
 */
export const decimalToImpliedProbability = (decimalOdds) => {
  if (!decimalOdds || decimalOdds <= 0) {
    console.warn('Invalid decimal odds:', decimalOdds);
    return 0.5; // Safe default
  }
  return 1 / decimalOdds;
};

/**
 * Convert American odds to implied probability
 */
export const americanToImpliedProbability = (americanOdds) => {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  } else {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
  }
};

/**
 * Calculate break-even probability for given odds
 */
export const breakEvenProbability = (americanOdds) => {
  // Account for vig - what probability you need to break even
  return americanToImpliedProbability(americanOdds);
};

// ============================================================================
// KELLY CRITERION
// ============================================================================

/**
 * Calculate Kelly bet size
 *
 * @param {number} winProbability - Your estimated true win probability (0-1)
 * @param {number} americanOdds - American odds (e.g., -110, +150)
 * @param {number} kellyFraction - Kelly multiplier (0.25 = quarter Kelly, default)
 * @returns {object} Kelly calculation result
 */
export const calculateKelly = (winProbability, americanOdds, kellyFraction = 0.25) => {
  // Validate inputs
  if (!winProbability || winProbability <= 0 || winProbability >= 1) {
    return {
      fullKellyPercent: 0,
      recommendedPercent: 0,
      edge: 0,
      edgePercent: 0,
      hasEdge: false,
      recommendation: 'INVALID',
      error: 'Invalid win probability'
    };
  }

  if (!americanOdds || americanOdds === 0) {
    return {
      fullKellyPercent: 0,
      recommendedPercent: 0,
      edge: 0,
      edgePercent: 0,
      hasEdge: false,
      recommendation: 'INVALID',
      error: 'Invalid odds'
    };
  }

  const decimalOdds = americanToDecimal(americanOdds);
  const netOdds = decimalOdds - 1; // b in the formula

  // Guard against division by zero (even money = decimal 2.0, net = 1.0, so this is rare)
  if (netOdds <= 0) {
    return {
      fullKellyPercent: 0,
      recommendedPercent: 0,
      edge: 0,
      edgePercent: 0,
      hasEdge: false,
      recommendation: 'INVALID',
      error: 'Invalid net odds'
    };
  }

  const p = winProbability;
  const q = 1 - p;

  // Full Kelly: f* = (bp - q) / b
  const fullKelly = (netOdds * p - q) / netOdds;

  // Apply Kelly fraction (most use 1/4 to 1/2 Kelly)
  const fractionalKelly = fullKelly * kellyFraction;

  // Calculate edge
  const impliedProb = americanToImpliedProbability(americanOdds);
  const edge = p - impliedProb;
  const edgePercent = edge * 100;

  // Determine if bet is +EV
  const hasEdge = edge > 0;

  return {
    fullKellyPercent: Math.max(0, fullKelly * 100),
    fractionalKellyPercent: Math.max(0, fractionalKelly * 100),
    kellyFraction,
    edge: edgePercent,
    hasEdge,
    impliedProbability: impliedProb * 100,
    yourProbability: p * 100,
    decimalOdds,
    expectedValue: hasEdge ? (p * netOdds - q) * 100 : 0, // EV per $100 bet
    recommendation: getRecommendation(fractionalKelly * 100, edgePercent)
  };
};

/**
 * Get betting recommendation based on Kelly and edge
 */
const getRecommendation = (kellyPercent, edgePercent) => {
  if (kellyPercent <= 0 || edgePercent <= 0) {
    return {
      action: 'PASS',
      reason: 'No edge detected',
      color: '#FF4444'
    };
  } else if (edgePercent < 2) {
    return {
      action: 'LEAN',
      reason: 'Marginal edge (<2%)',
      color: '#9ca3af'
    };
  } else if (edgePercent < 5) {
    return {
      action: 'SMALL',
      reason: 'Moderate edge (2-5%)',
      color: '#FFD700'
    };
  } else if (edgePercent < 10) {
    return {
      action: 'STANDARD',
      reason: 'Good edge (5-10%)',
      color: '#00D4FF'
    };
  } else {
    return {
      action: 'MAX',
      reason: 'Strong edge (10%+)',
      color: '#00FF88'
    };
  }
};

/**
 * Convert confidence percentage to win probability
 * This maps our signal engine confidence to a realistic win probability
 *
 * Calibration based on historical tier performance:
 * - 50% confidence → ~50% win prob (coin flip)
 * - 60% confidence → ~52% win prob
 * - 70% confidence → ~55% win prob
 * - 80% confidence → ~60% win prob
 * - 90% confidence → ~65% win prob
 */
export const confidenceToWinProbability = (confidence) => {
  // Linear interpolation with dampening
  // Don't let confidence translate directly to probability
  // Real world is humbling
  if (confidence <= 50) return 0.48;
  if (confidence >= 95) return 0.68;

  // Map 50-95 confidence to 48-68% win probability
  const minConf = 50;
  const maxConf = 95;
  const minProb = 0.48;
  const maxProb = 0.68;

  return minProb + (confidence - minConf) / (maxConf - minConf) * (maxProb - minProb);
};

// ============================================================================
// BANKROLL MANAGEMENT
// ============================================================================

/**
 * Get bankroll settings
 */
export const getBankrollSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BANKROLL);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading bankroll settings:', error);
  }

  // Default settings
  return {
    startingBankroll: 1000,
    currentBankroll: 1000,
    kellyFraction: 0.25, // Quarter Kelly (conservative)
    maxBetPercent: 5,    // Never bet more than 5% of bankroll
    minBetPercent: 0.5,  // Minimum bet size
    unitSize: 50,        // Standard unit in dollars
    stopLossPercent: 25, // Stop at 25% drawdown
    created: Date.now(),
    lastUpdated: Date.now()
  };
};

/**
 * Save bankroll settings
 */
export const saveBankrollSettings = (settings) => {
  try {
    settings.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEYS.BANKROLL, JSON.stringify(settings));
    return settings;
  } catch (error) {
    console.error('Error saving bankroll settings:', error);
    return null;
  }
};

/**
 * Calculate bet size in dollars
 */
export const calculateBetSize = (confidence, americanOdds, bankrollSettings = null) => {
  const settings = bankrollSettings || getBankrollSettings();
  const winProb = confidenceToWinProbability(confidence);
  const kelly = calculateKelly(winProb, americanOdds, settings.kellyFraction);

  // Calculate raw bet size
  let betPercent = kelly.fractionalKellyPercent;

  // Apply limits
  betPercent = Math.max(betPercent, 0);
  betPercent = Math.min(betPercent, settings.maxBetPercent);

  // If below minimum, don't bet
  if (betPercent < settings.minBetPercent && kelly.hasEdge) {
    betPercent = settings.minBetPercent;
  } else if (!kelly.hasEdge) {
    betPercent = 0;
  }

  const betAmount = (betPercent / 100) * settings.currentBankroll;
  const units = betAmount / settings.unitSize;

  return {
    ...kelly,
    betPercent,
    betAmount: Math.round(betAmount * 100) / 100,
    units: Math.round(units * 10) / 10,
    bankroll: settings.currentBankroll,
    limitApplied: kelly.fractionalKellyPercent > settings.maxBetPercent
  };
};

// ============================================================================
// BET TRACKING
// ============================================================================

/**
 * Record a bet
 */
export const recordBet = (betData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BET_HISTORY);
    const history = stored ? JSON.parse(stored) : [];

    const bet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...betData,
      result: null,
      pnl: null
    };

    history.push(bet);

    // Keep last 500 bets
    const trimmed = history.slice(-500);
    localStorage.setItem(STORAGE_KEYS.BET_HISTORY, JSON.stringify(trimmed));

    return bet;
  } catch (error) {
    console.error('Error recording bet:', error);
    return null;
  }
};

/**
 * Update bet result and adjust bankroll
 */
export const gradeBet = (betId, result) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BET_HISTORY);
    const history = stored ? JSON.parse(stored) : [];
    const settings = getBankrollSettings();

    const betIndex = history.findIndex(b => b.id === betId);
    if (betIndex === -1) return null;

    const bet = history[betIndex];

    // Calculate P/L
    let pnl = 0;
    if (result === 'WIN') {
      const decimalOdds = americanToDecimal(bet.odds);
      pnl = bet.betAmount * (decimalOdds - 1);
    } else if (result === 'LOSS') {
      pnl = -bet.betAmount;
    }
    // PUSH = 0 P/L

    bet.result = result;
    bet.pnl = Math.round(pnl * 100) / 100;
    bet.gradedAt = Date.now();

    history[betIndex] = bet;
    localStorage.setItem(STORAGE_KEYS.BET_HISTORY, JSON.stringify(history));

    // Update bankroll
    settings.currentBankroll = Math.round((settings.currentBankroll + pnl) * 100) / 100;
    saveBankrollSettings(settings);

    return bet;
  } catch (error) {
    console.error('Error grading bet:', error);
    return null;
  }
};

/**
 * Import bets from external source (CSV, etc.)
 * Used by Bankroll Manager to import bet history
 */
export const importBets = (bets) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BET_HISTORY);
    const history = stored ? JSON.parse(stored) : [];
    const settings = getBankrollSettings();

    let importedCount = 0;
    let totalPnlAdjustment = 0;

    bets.forEach(bet => {
      // Generate unique ID if not provided
      const normalizedBet = {
        id: bet.id || `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: bet.timestamp || Date.now(),
        sport: bet.sport || 'N/A',
        game: bet.game || bet.description || 'Imported Bet',
        bet_type: bet.bet_type || bet.betType || 'unknown',
        side: bet.side || '',
        line: bet.line || null,
        odds: bet.odds || -110,
        betAmount: bet.stake || bet.betAmount || settings.unitSize,
        confidence: bet.confidence || null,
        tier: bet.tier || null,
        result: bet.result || null,
        pnl: bet.pnl || null,
        imported: true,
        importedAt: Date.now()
      };

      // Calculate P&L if result exists but P&L doesn't
      if (normalizedBet.result && normalizedBet.pnl === null) {
        const decimalOdds = americanToDecimal(normalizedBet.odds);
        if (normalizedBet.result === 'WIN') {
          normalizedBet.pnl = Math.round(normalizedBet.betAmount * (decimalOdds - 1) * 100) / 100;
        } else if (normalizedBet.result === 'LOSS') {
          normalizedBet.pnl = -normalizedBet.betAmount;
        } else {
          normalizedBet.pnl = 0;
        }
      }

      // Track total P&L adjustment for bankroll update
      if (normalizedBet.pnl !== null) {
        totalPnlAdjustment += normalizedBet.pnl;
      }

      history.push(normalizedBet);
      importedCount++;
    });

    // Sort by timestamp
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Keep last 1000 bets (expanded for imports)
    const trimmed = history.slice(-1000);
    localStorage.setItem(STORAGE_KEYS.BET_HISTORY, JSON.stringify(trimmed));

    // Optionally update bankroll based on imported P&L
    // Only if there are graded bets with P&L
    if (totalPnlAdjustment !== 0) {
      settings.currentBankroll = Math.round((settings.currentBankroll + totalPnlAdjustment) * 100) / 100;
      saveBankrollSettings(settings);
    }

    return importedCount;
  } catch (error) {
    console.error('Error importing bets:', error);
    throw error;
  }
};

/**
 * Get bet history
 */
export const getBetHistory = (limit = 50) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BET_HISTORY);
    const history = stored ? JSON.parse(stored) : [];
    return history.slice(-limit).reverse();
  } catch (error) {
    console.error('Error getting bet history:', error);
    return [];
  }
};

/**
 * Calculate bankroll statistics
 */
export const getBankrollStats = () => {
  const settings = getBankrollSettings();
  const history = getBetHistory(500);
  const gradedBets = history.filter(b => b.result);

  const wins = gradedBets.filter(b => b.result === 'WIN').length;
  const losses = gradedBets.filter(b => b.result === 'LOSS').length;
  const pushes = gradedBets.filter(b => b.result === 'PUSH').length;

  const totalPnl = gradedBets.reduce((sum, b) => sum + (b.pnl || 0), 0);
  const totalWagered = gradedBets.reduce((sum, b) => sum + b.betAmount, 0);

  const roi = totalWagered > 0 ? (totalPnl / totalWagered * 100) : 0;

  // Calculate drawdown
  let peak = settings.startingBankroll;
  let maxDrawdown = 0;
  let runningBankroll = settings.startingBankroll;

  gradedBets.slice().reverse().forEach(bet => {
    runningBankroll += bet.pnl || 0;
    peak = Math.max(peak, runningBankroll);
    const drawdown = (peak - runningBankroll) / peak * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  const currentDrawdown = settings.startingBankroll > 0
    ? (1 - settings.currentBankroll / settings.startingBankroll) * 100
    : 0;

  return {
    startingBankroll: settings.startingBankroll,
    currentBankroll: settings.currentBankroll,
    totalPnl: Math.round(totalPnl * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    record: { wins, losses, pushes },
    winRate: wins + losses > 0 ? Math.round(wins / (wins + losses) * 1000) / 10 : 0,
    totalBets: gradedBets.length,
    pendingBets: history.filter(b => !b.result).length,
    avgBetSize: gradedBets.length > 0 ? Math.round(totalWagered / gradedBets.length * 100) / 100 : 0,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    currentDrawdown: Math.round(currentDrawdown * 100) / 100,
    stopLossTriggered: currentDrawdown >= settings.stopLossPercent
  };
};

// ============================================================================
// RISK ANALYSIS
// ============================================================================

/**
 * Calculate risk of ruin
 * Simplified formula - assumes infinite number of bets
 */
export const calculateRiskOfRuin = (winRate, avgOdds = -110, bankrollUnits = 20) => {
  const p = winRate / 100;
  const q = 1 - p;
  const decimalOdds = americanToDecimal(avgOdds);
  const b = decimalOdds - 1;

  // Edge
  const edge = p - (1 / decimalOdds);

  if (edge <= 0) {
    return { riskOfRuin: 100, edge: edge * 100, message: 'No edge - guaranteed ruin over time' };
  }

  // Simplified RoR formula: RoR = ((1-edge)/edge)^bankrollUnits
  // This is a rough approximation
  const ror = Math.pow((1 - edge) / (1 + edge), bankrollUnits);

  return {
    riskOfRuin: Math.round(ror * 10000) / 100,
    edge: Math.round(edge * 10000) / 100,
    message: ror < 0.01 ? 'Very low risk' :
             ror < 0.05 ? 'Low risk' :
             ror < 0.10 ? 'Moderate risk' :
             'High risk - consider smaller bet sizes'
  };
};

/**
 * Simulate bankroll trajectory
 * Monte Carlo style - returns percentile outcomes
 */
export const simulateBankroll = (
  startingBankroll,
  winRate,
  avgBetSize,
  numBets,
  avgOdds = -110,
  simulations = 1000
) => {
  const results = [];
  const p = winRate / 100;
  const decimalOdds = americanToDecimal(avgOdds);

  for (let sim = 0; sim < simulations; sim++) {
    let bankroll = startingBankroll;

    for (let bet = 0; bet < numBets; bet++) {
      const betAmount = Math.min(avgBetSize, bankroll);
      if (betAmount <= 0) break;

      const won = Math.random() < p;
      if (won) {
        bankroll += betAmount * (decimalOdds - 1);
      } else {
        bankroll -= betAmount;
      }
    }

    results.push(bankroll);
  }

  // Sort for percentiles
  results.sort((a, b) => a - b);

  return {
    worst: Math.round(results[0]),
    p5: Math.round(results[Math.floor(simulations * 0.05)]),
    p25: Math.round(results[Math.floor(simulations * 0.25)]),
    median: Math.round(results[Math.floor(simulations * 0.50)]),
    p75: Math.round(results[Math.floor(simulations * 0.75)]),
    p95: Math.round(results[Math.floor(simulations * 0.95)]),
    best: Math.round(results[simulations - 1]),
    bustRate: Math.round(results.filter(r => r <= 0).length / simulations * 100)
  };
};

export default {
  calculateKelly,
  calculateBetSize,
  confidenceToWinProbability,
  americanToDecimal,
  americanToImpliedProbability,
  getBankrollSettings,
  saveBankrollSettings,
  recordBet,
  gradeBet,
  importBets,
  getBetHistory,
  getBankrollStats,
  calculateRiskOfRuin,
  simulateBankroll
};
