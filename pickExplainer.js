/**
 * PICK EXPLAINER
 *
 * Translates signal data into plain English explanations.
 * Users should understand WHY a pick is recommended, not just what.
 *
 * "The best picks are the ones you understand."
 */

import { getTierInfo } from './signalEngine';

/**
 * Generate a full explanation for a pick
 *
 * @param {Object} game - Game data
 * @param {Object} analysis - Signal analysis from signalEngine
 * @param {string} sport - Sport code
 * @returns {Object} Full explanation with summary, bullets, and confidence breakdown
 */
export const explainPick = (game, analysis, sport) => {
  // Guard against null/undefined analysis
  if (!analysis) {
    return {
      headline: 'Analysis not available',
      summary: 'No analysis data available for this pick.',
      bullets: [],
      confidenceBreakdown: [],
      risks: [],
      tierInfo: getTierInfo('UNKNOWN'),
      confidence: 0,
      recommendation: 'WAIT'
    };
  }

  const { confidence = 0, tier, signals = [], recommendation = 'WAIT' } = analysis;
  const tierInfo = getTierInfo(tier);

  // Generate headline
  const headline = generateHeadline(recommendation, confidence, game);

  // Generate bullet points from top signals (guard against non-array signals)
  const safeSignals = Array.isArray(signals) ? signals : [];
  const bullets = safeSignals
    .filter(s => s.score >= 55)
    .slice(0, 5)
    .map(s => generateBullet(s, sport));

  // Generate confidence breakdown
  const confidenceBreakdown = generateConfidenceBreakdown(safeSignals);

  // Generate risk factors
  const risks = generateRisks(analysis, game, sport);

  // Generate the "Why This Pick" summary
  const summary = generateSummary(analysis, game, sport);

  return {
    headline,
    summary,
    bullets,
    confidenceBreakdown,
    risks,
    tierInfo,
    confidence,
    recommendation
  };
};

/**
 * Generate a headline for the pick
 */
const generateHeadline = (recommendation, confidence, game) => {
  const headlines = {
    SMASH: [
      `🔥 SMASH ${confidence}%: Multiple edges converging`,
      `🔥 HIGH CONVICTION: ${confidence}% across all signals`,
      `🔥 TOP PLAY: Strong edge detected at ${confidence}%`
    ],
    STRONG: [
      `💪 STRONG PLAY: ${confidence}% confidence`,
      `💪 SOLID EDGE: Signals align at ${confidence}%`,
      `💪 QUALITY SPOT: ${confidence}% with good value`
    ],
    PLAY: [
      `✅ PLAYABLE: ${confidence}% with positive edge`,
      `✅ VALUE PRESENT: ${confidence}% confidence`,
      `✅ MEETS CRITERIA: ${confidence}% threshold`
    ],
    LEAN: [
      `🤔 LEAN: ${confidence}% - marginal edge`,
      `🤔 WATCH: ${confidence}% - monitor for movement`,
      `🤔 BORDERLINE: ${confidence}% - consider reducing size`
    ],
    PASS: [
      `⛔ PASS: ${confidence}% - no edge detected`,
      `⛔ NO PLAY: Signals don't support at ${confidence}%`,
      `⛔ SKIP: ${confidence}% below threshold`
    ]
  };

  const options = headlines[recommendation] || headlines.LEAN;
  // Use deterministic selection based on confidence (no randomness)
  const index = confidence % options.length;
  return options[index];
};

/**
 * Generate a bullet point explanation for a signal
 */
const generateBullet = (signal, sport) => {
  const templates = {
    sharp_money: {
      high: '🦈 Sharp money heavily favoring this side - pros are betting big',
      medium: '🦈 Moderate sharp action detected - smart money leaning this way',
      low: '🦈 Some professional interest on this side'
    },
    line_value: {
      high: '💰 Excellent odds value - significantly better than market average',
      medium: '💰 Good odds available - beating the standard -110',
      low: '💰 Acceptable odds - near market average'
    },
    key_spread: {
      high: sport === 'NFL'
        ? '🔢 KEY NUMBER: Landing on 3 or 7 - most common NFL margins'
        : '🔢 Key number territory - historically significant spread',
      medium: '🔢 Near key number - favorable spread positioning',
      low: '🔢 Spread is reasonable but not at a key number'
    },
    injury_impact: {
      high: '🏥 Major injury creating significant usage vacuum',
      medium: '🏥 Notable injury affecting team dynamics',
      low: '🏥 Minor injury impact factored in'
    },
    rest_fatigue: {
      high: '😴 Significant rest advantage - opponent on back-to-back or travel',
      medium: '😴 Rest advantage detected - favorable scheduling spot',
      low: '😴 Slight rest edge'
    },
    public_fade: {
      high: '📊 Heavy public action on other side - classic fade opportunity',
      medium: '📊 Public leaning opposite - contrarian value',
      low: '📊 Some public/sharp divergence'
    },
    ensemble: {
      high: '🤖 ML ensemble strongly agrees - XGBoost, LightGBM aligned',
      medium: '🤖 Machine learning models leaning this direction',
      low: '🤖 ML models show slight preference'
    },
    lstm_brain: {
      high: '🧠 LSTM neural network highly confident in trend',
      medium: '🧠 Neural network detecting favorable pattern',
      low: '🧠 LSTM shows mild signal'
    },
    moon_phase: {
      high: '🌙 Full/New moon - historically significant for upsets',
      medium: '🌙 Moon phase alignment detected',
      low: '🌙 Minor lunar influence'
    },
    numerology: {
      high: '🔢 Power number day (8, 11, or 22) - heightened energy',
      medium: '🔢 Favorable numerology alignment',
      low: '🔢 Neutral numerology'
    },
    gematria: {
      high: '✡️ Strong gematria alignment between teams',
      medium: '✡️ Gematria suggests energy flow',
      low: '✡️ Minor gematria factor'
    }
  };

  const signalName = signal.name;
  const level = signal.score >= 75 ? 'high' : signal.score >= 60 ? 'medium' : 'low';

  if (templates[signalName]) {
    return {
      text: templates[signalName][level],
      score: signal.score,
      level
    };
  }

  return {
    text: signal.contribution || `${signalName.replace(/_/g, ' ')}: ${signal.score}`,
    score: signal.score,
    level
  };
};

/**
 * Generate confidence breakdown by category
 */
const generateConfidenceBreakdown = (signals) => {
  const categories = {
    data: { signals: ['sharp_money', 'line_value', 'public_fade'], score: 0, count: 0 },
    ml: { signals: ['ensemble', 'lstm_brain', 'key_spread', 'injury_impact', 'rest_fatigue'], score: 0, count: 0 },
    esoteric: { signals: ['moon_phase', 'numerology', 'gematria', 'sacred_geometry', 'zodiac'], score: 0, count: 0 }
  };

  // Guard against null/undefined signals
  const safeSignals = Array.isArray(signals) ? signals : [];
  safeSignals.forEach(signal => {
    Object.entries(categories).forEach(([cat, data]) => {
      if (data.signals.includes(signal.name)) {
        data.score += signal.score;
        data.count++;
      }
    });
  });

  return {
    data: categories.data.count > 0 ? Math.round(categories.data.score / categories.data.count) : 50,
    ml: categories.ml.count > 0 ? Math.round(categories.ml.score / categories.ml.count) : 50,
    esoteric: categories.esoteric.count > 0 ? Math.round(categories.esoteric.score / categories.esoteric.count) : 50
  };
};

/**
 * Generate risk factors
 */
const generateRisks = (analysis, game, sport) => {
  const risks = [];

  // Guard against null/undefined analysis or signals
  const signals = Array.isArray(analysis?.signals) ? analysis.signals : [];

  // Check for weak signals
  const weakSignals = signals.filter(s => s.score < 50);
  if (weakSignals.length >= 3) {
    risks.push({
      level: 'medium',
      text: `${weakSignals.length} signals below average - mixed picture`
    });
  }

  // Check if confidence is borderline
  if (analysis.confidence >= 55 && analysis.confidence < 60) {
    risks.push({
      level: 'medium',
      text: 'Borderline confidence - consider smaller bet size'
    });
  }

  // Sport-specific risks
  if (sport === 'NFL' && game.spread && Math.abs(game.spread) >= 10) {
    risks.push({
      level: 'low',
      text: 'Large spread - blowout/garbage time risk'
    });
  }

  if (sport === 'NBA' && game.total && game.total >= 240) {
    risks.push({
      level: 'low',
      text: 'Very high total - pace variance risk'
    });
  }

  // Check for lack of sharp data
  const sharpSignal = analysis.signals.find(s => s.name === 'sharp_money');
  if (!sharpSignal || sharpSignal.score === 50) {
    risks.push({
      level: 'low',
      text: 'No sharp money data available - relying on other signals'
    });
  }

  return risks;
};

/**
 * Generate plain English summary
 */
const generateSummary = (analysis, game, sport) => {
  const { confidence, tier, signals, recommendation } = analysis;
  const topSignals = signals.filter(s => s.score >= 65).slice(0, 3);

  let summary = '';

  // Opening based on tier
  if (tier === 'GOLDEN_CONVERGENCE') {
    summary = `This is a top-tier play with ${confidence}% confidence. `;
  } else if (tier === 'SUPER_SIGNAL') {
    summary = `Strong signals align at ${confidence}% confidence. `;
  } else if (tier === 'HARMONIC_ALIGNMENT') {
    summary = `Multiple factors support this at ${confidence}%. `;
  } else {
    summary = `This shows a modest edge at ${confidence}%. `;
  }

  // Add top signal explanations
  if (topSignals.length > 0) {
    const signalDescriptions = topSignals.map(s => {
      if (s.name === 'sharp_money') return 'professional money';
      if (s.name === 'line_value') return 'odds value';
      if (s.name === 'key_spread') return 'key number positioning';
      if (s.name === 'injury_impact') return 'injury factors';
      if (s.name === 'public_fade') return 'contrarian angle';
      if (s.name === 'ensemble') return 'ML models';
      return s.name.replace(/_/g, ' ');
    });

    if (signalDescriptions.length === 1) {
      summary += `The main edge comes from ${signalDescriptions[0]}. `;
    } else if (signalDescriptions.length === 2) {
      summary += `The edge is driven by ${signalDescriptions[0]} and ${signalDescriptions[1]}. `;
    } else {
      const last = signalDescriptions.pop();
      summary += `Key factors include ${signalDescriptions.join(', ')}, and ${last}. `;
    }
  }

  // Closing recommendation
  if (recommendation === 'SMASH') {
    summary += 'This meets all criteria for a max play.';
  } else if (recommendation === 'STRONG') {
    summary += 'Solid play worth standard sizing.';
  } else if (recommendation === 'PLAY') {
    summary += 'Meets criteria for a smaller position.';
  } else if (recommendation === 'LEAN') {
    summary += 'Consider waiting for better value or reducing size.';
  } else {
    summary += 'Recommend passing on this one.';
  }

  return summary;
};

/**
 * Generate a quick one-liner explanation
 */
export const quickExplain = (analysis) => {
  const topSignal = analysis.signals[0];
  if (!topSignal) return 'No clear edge detected';

  const signalNames = {
    sharp_money: 'Sharp money backing',
    line_value: 'Best odds available',
    key_spread: 'Key number value',
    injury_impact: 'Injury opportunity',
    rest_fatigue: 'Rest advantage',
    public_fade: 'Fading public money',
    ensemble: 'ML models aligned',
    lstm_brain: 'Trend detected',
    moon_phase: 'Lunar alignment',
    numerology: 'Power number day',
    gematria: 'Name energy aligned'
  };

  const name = signalNames[topSignal.name] || topSignal.name.replace(/_/g, ' ');
  return `${name} at ${topSignal.score}%`;
};

export default {
  explainPick,
  quickExplain
};
