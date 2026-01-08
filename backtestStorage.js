/**
 * BACKTEST STORAGE v1.0
 *
 * Stores historical signal data to validate and improve the prediction system.
 * This is the scientific foundation - without backtesting, you're gambling on your model.
 *
 * Key Features:
 * - Store every prediction with all signal values
 * - Track outcomes for win rate calculation
 * - Analyze which signals actually correlate with wins
 * - Test different weight configurations
 * - Generate performance reports
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PREDICTIONS: 'bookie_backtest_predictions',
  SIGNAL_PERFORMANCE: 'bookie_backtest_signal_perf',
  WEIGHT_TESTS: 'bookie_backtest_weight_tests',
  DAILY_SUMMARIES: 'bookie_backtest_daily'
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/**
 * Prediction Record:
 * {
 *   id: string,
 *   timestamp: number,
 *   date: string,           // YYYY-MM-DD
 *   sport: string,
 *   game: {
 *     home_team: string,
 *     away_team: string,
 *     commence_time: string
 *   },
 *   bet_type: string,       // spread, total, moneyline
 *   side: string,           // HOME, AWAY, OVER, UNDER
 *   line: number,
 *   odds: number,
 *   signals: {              // All signal values at time of prediction
 *     sharp_money: { score: number, raw_data: any },
 *     line_value: { score: number, raw_data: any },
 *     key_spread: { score: number, raw_data: any },
 *     // ... all 17 signals
 *   },
 *   confidence: number,     // Final weighted confidence
 *   tier: string,           // GOLDEN_CONVERGENCE, etc.
 *   weights_used: object,   // Weight configuration used
 *   outcome: {
 *     result: string,       // WIN, LOSS, PUSH
 *     closing_line: number,
 *     clv: number,
 *     graded_at: number
 *   }
 * }
 */

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate unique prediction ID
 */
const generateId = () => {
  return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get today's date string
 */
const getDateString = (timestamp = Date.now()) => {
  return new Date(timestamp).toISOString().split('T')[0];
};

/**
 * Get all predictions from storage
 */
export const getAllPredictions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading predictions:', error);
    return [];
  }
};

/**
 * Save predictions to storage
 */
const savePredictions = (predictions) => {
  try {
    // Keep last 1000 predictions to manage storage
    const trimmed = predictions.slice(-1000);
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving predictions:', error);
  }
};

/**
 * Record a prediction for backtesting
 */
export const recordPrediction = (predictionData) => {
  const prediction = {
    id: generateId(),
    timestamp: Date.now(),
    date: getDateString(),
    sport: predictionData.sport,
    game: {
      home_team: predictionData.home_team,
      away_team: predictionData.away_team,
      commence_time: predictionData.commence_time
    },
    bet_type: predictionData.bet_type,
    side: predictionData.side,
    line: predictionData.line,
    odds: predictionData.odds,
    signals: predictionData.signals || {},
    confidence: predictionData.confidence,
    tier: predictionData.tier,
    weights_used: predictionData.weights_used || {},
    outcome: null
  };

  const predictions = getAllPredictions();
  predictions.push(prediction);
  savePredictions(predictions);

  return prediction;
};

/**
 * Record outcome for a prediction
 */
export const recordOutcome = (predictionId, outcomeData) => {
  const predictions = getAllPredictions();
  const index = predictions.findIndex(p => p.id === predictionId);

  if (index === -1) {
    console.error('Prediction not found:', predictionId);
    return null;
  }

  predictions[index].outcome = {
    result: outcomeData.result,
    closing_line: outcomeData.closing_line,
    clv: outcomeData.clv,
    graded_at: Date.now()
  };

  savePredictions(predictions);
  updateSignalPerformance(predictions[index]);

  return predictions[index];
};

// ============================================================================
// SIGNAL PERFORMANCE ANALYSIS
// ============================================================================

/**
 * Update signal performance metrics when a prediction is graded
 */
const updateSignalPerformance = (prediction) => {
  if (!prediction || !prediction.outcome || prediction.outcome.result === 'PUSH') return;

  const isWin = prediction.outcome.result === 'WIN';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SIGNAL_PERFORMANCE);
    const perf = stored ? JSON.parse(stored) : {};

    // Update each signal's performance (validate signals object exists)
    if (prediction.signals && typeof prediction.signals === 'object') {
      Object.entries(prediction.signals).forEach(([signalName, signalData]) => {
        if (!perf[signalName]) {
          perf[signalName] = {
            total: 0,
            wins: 0,
            byScore: {}  // Track performance by score buckets
          };
        }

        perf[signalName].total++;
        if (isWin) perf[signalName].wins++;

        // Track by score bucket (50-60, 60-70, 70-80, 80-90, 90+)
        const score = signalData?.score || 50;
        const bucket = Math.floor(score / 10) * 10;
        const bucketKey = `${bucket}-${bucket + 10}`;

        if (!perf[signalName].byScore[bucketKey]) {
          perf[signalName].byScore[bucketKey] = { total: 0, wins: 0 };
        }
        perf[signalName].byScore[bucketKey].total++;
        if (isWin) perf[signalName].byScore[bucketKey].wins++;
      });
    }

    // Update tier performance
    const tier = prediction.tier;
    if (!perf._tiers) perf._tiers = {};
    if (!perf._tiers[tier]) {
      perf._tiers[tier] = { total: 0, wins: 0, clvSum: 0 };
    }
    perf._tiers[tier].total++;
    if (isWin) perf._tiers[tier].wins++;
    if (prediction.outcome.clv) {
      perf._tiers[tier].clvSum += prediction.outcome.clv;
    }

    // Update sport performance
    const sport = prediction.sport;
    if (!perf._sports) perf._sports = {};
    if (!perf._sports[sport]) {
      perf._sports[sport] = { total: 0, wins: 0 };
    }
    perf._sports[sport].total++;
    if (isWin) perf._sports[sport].wins++;

    localStorage.setItem(STORAGE_KEYS.SIGNAL_PERFORMANCE, JSON.stringify(perf));
  } catch (error) {
    console.error('Error updating signal performance:', error);
  }
};

/**
 * Get signal performance report
 */
export const getSignalPerformance = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SIGNAL_PERFORMANCE);
    const perf = stored ? JSON.parse(stored) : {};

    // Calculate win rates
    const signalReport = {};
    Object.entries(perf).forEach(([signal, data]) => {
      if (signal.startsWith('_')) return; // Skip meta keys

      signalReport[signal] = {
        total: data.total,
        wins: data.wins,
        winRate: data.total > 0 ? (data.wins / data.total * 100).toFixed(1) : 0,
        byScore: {}
      };

      // Win rate by score bucket
      Object.entries(data.byScore || {}).forEach(([bucket, bucketData]) => {
        signalReport[signal].byScore[bucket] = {
          total: bucketData.total,
          wins: bucketData.wins,
          winRate: bucketData.total > 0 ? (bucketData.wins / bucketData.total * 100).toFixed(1) : 0
        };
      });
    });

    // Tier performance
    const tierReport = {};
    Object.entries(perf._tiers || {}).forEach(([tier, data]) => {
      tierReport[tier] = {
        total: data.total,
        wins: data.wins,
        winRate: data.total > 0 ? (data.wins / data.total * 100).toFixed(1) : 0,
        avgCLV: data.total > 0 ? (data.clvSum / data.total).toFixed(2) : 0
      };
    });

    // Sport performance
    const sportReport = {};
    Object.entries(perf._sports || {}).forEach(([sport, data]) => {
      sportReport[sport] = {
        total: data.total,
        wins: data.wins,
        winRate: data.total > 0 ? (data.wins / data.total * 100).toFixed(1) : 0
      };
    });

    return {
      signals: signalReport,
      tiers: tierReport,
      sports: sportReport
    };
  } catch (error) {
    console.error('Error getting signal performance:', error);
    return { signals: {}, tiers: {}, sports: {} };
  }
};

// ============================================================================
// WEIGHT TESTING
// ============================================================================

/**
 * Store a weight configuration test result
 */
export const recordWeightTest = (weights, results) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WEIGHT_TESTS);
    const tests = stored ? JSON.parse(stored) : [];

    tests.push({
      id: generateId(),
      timestamp: Date.now(),
      weights,
      results: {
        totalPicks: results.totalPicks,
        wins: results.wins,
        winRate: results.winRate,
        avgCLV: results.avgCLV,
        profitLoss: results.profitLoss
      }
    });

    // Keep last 50 tests
    const trimmed = tests.slice(-50);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_TESTS, JSON.stringify(trimmed));

    return tests[tests.length - 1];
  } catch (error) {
    console.error('Error recording weight test:', error);
    return null;
  }
};

/**
 * Get all weight test results
 */
export const getWeightTests = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WEIGHT_TESTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting weight tests:', error);
    return [];
  }
};

/**
 * Run a backtest with different weights
 */
export const runBacktest = (testWeights) => {
  const predictions = getAllPredictions();
  const gradedPredictions = predictions.filter(p => p.outcome && p.outcome.result !== 'PUSH');

  if (gradedPredictions.length === 0) {
    return { error: 'No graded predictions to backtest' };
  }

  // Recalculate confidence with new weights
  const results = gradedPredictions.map(pred => {
    let totalWeight = 0;
    let weightedSum = 0;

    Object.entries(pred.signals).forEach(([signal, data]) => {
      const weight = testWeights[signal] || 5;
      totalWeight += weight;
      weightedSum += (data.score || 50) * weight;
    });

    const newConfidence = totalWeight > 0 ? weightedSum / totalWeight : 50;
    const wouldBet = newConfidence >= 60; // Threshold for betting

    return {
      ...pred,
      testConfidence: newConfidence,
      wouldBet,
      wasCorrect: pred.outcome.result === 'WIN'
    };
  });

  // Calculate results for picks that would have been made
  const bettablePicks = results.filter(r => r.wouldBet);
  const wins = bettablePicks.filter(r => r.wasCorrect).length;

  return {
    totalPicks: bettablePicks.length,
    wins,
    losses: bettablePicks.length - wins,
    winRate: bettablePicks.length > 0 ? (wins / bettablePicks.length * 100).toFixed(1) : 0,
    avgCLV: bettablePicks.length > 0
      ? (bettablePicks.reduce((sum, p) => sum + (p.outcome.clv || 0), 0) / bettablePicks.length).toFixed(2)
      : 0,
    // Assuming flat betting at -110
    profitLoss: (wins * 100 - (bettablePicks.length - wins) * 110).toFixed(0)
  };
};

// ============================================================================
// DAILY SUMMARIES
// ============================================================================

/**
 * Get or create daily summary
 */
export const getDailySummary = (date = getDateString()) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES);
    const summaries = stored ? JSON.parse(stored) : {};

    if (!summaries[date]) {
      // Calculate from predictions
      const predictions = getAllPredictions().filter(p => p.date === date);
      const graded = predictions.filter(p => p.outcome);

      summaries[date] = {
        date,
        totalPicks: predictions.length,
        graded: graded.length,
        wins: graded.filter(p => p.outcome.result === 'WIN').length,
        losses: graded.filter(p => p.outcome.result === 'LOSS').length,
        pushes: graded.filter(p => p.outcome.result === 'PUSH').length,
        avgConfidence: predictions.length > 0
          ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
          : 0,
        avgCLV: graded.filter(p => p.outcome.clv).length > 0
          ? graded.reduce((sum, p) => sum + (p.outcome.clv || 0), 0) /
            graded.filter(p => p.outcome.clv).length
          : 0,
        bySport: {},
        byTier: {}
      };

      localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(summaries));
    }

    return summaries[date];
  } catch (error) {
    console.error('Error getting daily summary:', error);
    return null;
  }
};

/**
 * Get weekly performance summary
 */
export const getWeeklySummary = () => {
  const predictions = getAllPredictions();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const weekPredictions = predictions.filter(p => p.timestamp >= oneWeekAgo);
  const graded = weekPredictions.filter(p => p.outcome && p.outcome.result !== 'PUSH');

  return {
    period: '7 days',
    totalPicks: weekPredictions.length,
    graded: graded.length,
    wins: graded.filter(p => p.outcome.result === 'WIN').length,
    losses: graded.filter(p => p.outcome.result === 'LOSS').length,
    winRate: graded.length > 0
      ? (graded.filter(p => p.outcome.result === 'WIN').length / graded.length * 100).toFixed(1)
      : 0,
    avgCLV: graded.filter(p => p.outcome?.clv).length > 0
      ? (graded.reduce((sum, p) => sum + (p.outcome?.clv || 0), 0) /
         graded.filter(p => p.outcome?.clv).length).toFixed(2)
      : 0,
    // Flat betting P/L
    profitLoss: graded.length > 0
      ? (graded.filter(p => p.outcome.result === 'WIN').length * 100 -
         graded.filter(p => p.outcome.result === 'LOSS').length * 110).toFixed(0)
      : 0
  };
};

// ============================================================================
// SIGNAL CORRELATION ANALYSIS
// ============================================================================

/**
 * Analyze which signals best predict wins
 */
export const analyzeSignalCorrelation = () => {
  const predictions = getAllPredictions();
  const graded = predictions.filter(p => p.outcome && p.outcome.result !== 'PUSH');

  if (graded.length < 20) {
    return { error: 'Need at least 20 graded predictions for correlation analysis' };
  }

  const signalWinCorrelation = {};

  // For each signal, calculate correlation with winning
  const signals = Object.keys(graded[0]?.signals || {});

  signals.forEach(signal => {
    const dataPoints = graded.map(p => ({
      score: p.signals[signal]?.score || 50,
      won: p.outcome.result === 'WIN' ? 1 : 0
    }));

    // Simple correlation: average score for wins vs losses
    const wins = dataPoints.filter(d => d.won === 1);
    const losses = dataPoints.filter(d => d.won === 0);

    const avgWinScore = wins.length > 0
      ? wins.reduce((sum, d) => sum + d.score, 0) / wins.length
      : 50;
    const avgLossScore = losses.length > 0
      ? losses.reduce((sum, d) => sum + d.score, 0) / losses.length
      : 50;

    signalWinCorrelation[signal] = {
      avgWinScore: avgWinScore.toFixed(1),
      avgLossScore: avgLossScore.toFixed(1),
      scoreDiff: (avgWinScore - avgLossScore).toFixed(1),
      predictive: avgWinScore > avgLossScore + 3 // 3+ point diff = predictive
    };
  });

  // Rank signals by predictiveness
  const ranked = Object.entries(signalWinCorrelation)
    .sort((a, b) => parseFloat(b[1].scoreDiff) - parseFloat(a[1].scoreDiff))
    .map(([signal, data], index) => ({
      rank: index + 1,
      signal,
      ...data
    }));

  return {
    sampleSize: graded.length,
    signals: ranked,
    topPredictors: ranked.filter(s => s.predictive).slice(0, 5),
    weakSignals: ranked.filter(s => !s.predictive)
  };
};

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

/**
 * Export all backtest data as JSON
 */
export const exportData = () => {
  return {
    predictions: getAllPredictions(),
    signalPerformance: JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGNAL_PERFORMANCE) || '{}'),
    weightTests: getWeightTests(),
    dailySummaries: JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES) || '{}'),
    exportedAt: Date.now()
  };
};

/**
 * Import backtest data from JSON
 */
export const importData = (data) => {
  try {
    if (data.predictions) {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(data.predictions));
    }
    if (data.signalPerformance) {
      localStorage.setItem(STORAGE_KEYS.SIGNAL_PERFORMANCE, JSON.stringify(data.signalPerformance));
    }
    if (data.weightTests) {
      localStorage.setItem(STORAGE_KEYS.WEIGHT_TESTS, JSON.stringify(data.weightTests));
    }
    if (data.dailySummaries) {
      localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(data.dailySummaries));
    }
    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all backtest data
 */
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PREDICTIONS);
  localStorage.removeItem(STORAGE_KEYS.SIGNAL_PERFORMANCE);
  localStorage.removeItem(STORAGE_KEYS.WEIGHT_TESTS);
  localStorage.removeItem(STORAGE_KEYS.DAILY_SUMMARIES);
};

export default {
  recordPrediction,
  recordOutcome,
  getAllPredictions,
  getSignalPerformance,
  recordWeightTest,
  getWeightTests,
  runBacktest,
  getDailySummary,
  getWeeklySummary,
  analyzeSignalCorrelation,
  exportData,
  importData,
  clearAllData
};
