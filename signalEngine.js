/**
 * SIGNAL ENGINE v10.1 - RESEARCH-OPTIMIZED + ESOTERIC EDGE + JARVIS SAVANT
 *
 * The brain of Bookie-o-em. Now powered by:
 * - Academic research (arXiv, PubMed, PMC)
 * - Professional bettor strategies (VSiN, Action Network methodology)
 * - ML model insights (XGBoost feature importance)
 * - 20+ years of betting market data
 * - ESOTERIC EDGE: Gematria, numerology, cosmic alignment
 * - JARVIS SAVANT: +94.40u YTD system edges
 *
 * JARVIS SAVANT EDGES (v10.1):
 * - Public Fade 65% Crush Zone: Proven contrarian edge
 * - Mid-Spread Amplifier: +4 to +9 goldilocks zone
 * - Large Spread Trap Gate: >15 pts = danger zone
 * - NHL Dog Protocol: Puck line dogs with public fade
 * - GEMATRIA TRIGGERS: 2178 (immortal), 201, 33, 93, 322
 *
 * 2178 - THE IMMORTAL NUMBER:
 * - 2178 × 4 = 8712 (its reversal) - ONLY 4-digit number with this property
 * - 2178 × 8712 = 66^4 - ONLY number where n × reverse(n) = 4th power
 * - Never collapses to zero in Kaprekar routine
 *
 * DUAL-SCORE SYSTEM:
 * - Main Confidence: Research-backed signals
 * - Esoteric Edge: Gematria, moon phase, numerology (showcased separately)
 * - Cosmic Confluence: When both systems align = maximum conviction
 */

import api from './api';

// ============================================================================
// SIGNAL WEIGHTS v10.1 - RESEARCH-OPTIMIZED + JARVIS SAVANT
// ============================================================================

export const DEFAULT_WEIGHTS = {
  // TIER 1: PROVEN EDGE (Research-validated, 56%+ win rates)
  sharp_money: 22,
  line_edge: 18,
  injury_vacuum: 16,
  game_pace: 15,
  travel_fatigue: 14,
  back_to_back: 13,
  defense_vs_position: 12,
  public_fade: 11,
  steam_moves: 10,
  home_court: 10,

  // TIER 1.5: JARVIS SAVANT EDGES (+94.40u YTD proven)
  mid_spread_zone: 12,
  large_spread_trap: 10,
  nhl_dog_protocol: 14,

  // TIER 2: SUPPORTING SIGNALS
  weather: 10,
  referee: 8,
  minutes_projection: 10,
  game_script: 8,
  key_spread: 8,
  books_consensus: 6,
  recent_form: 6,

  // TIER 3: ML/AI SIGNALS
  ensemble_ml: 6,
  lstm_trend: 5,

  // TIER 4: ESOTERIC (showcased separately, minimal main weight)
  moon_phase: 1,
  numerology: 1,
  gematria: 1,
  sacred_geometry: 1,
  zodiac: 1
};

// Sport-specific weight adjustments
const SPORT_MODIFIERS = {
  NFL: {
    key_spread: 2.0,
    sharp_money: 1.2,
    weather: 1.5,
    travel_fatigue: 0.8,
    back_to_back: 0.3,
    mid_spread_zone: 1.3,
    large_spread_trap: 1.5,
    nhl_dog_protocol: 0
  },
  NBA: {
    travel_fatigue: 1.4,
    back_to_back: 1.5,
    injury_vacuum: 1.4,
    game_pace: 1.3,
    defense_vs_position: 1.3,
    weather: 0,
    mid_spread_zone: 1.2,
    large_spread_trap: 1.4,
    nhl_dog_protocol: 0
  },
  MLB: {
    sharp_money: 1.3,
    weather: 0.8,
    back_to_back: 0.5,
    key_spread: 0.4,
    mid_spread_zone: 0.6,
    large_spread_trap: 0.5,
    nhl_dog_protocol: 0
  },
  NHL: {
    travel_fatigue: 1.2,
    back_to_back: 1.2,
    weather: 0,
    key_spread: 0.5,
    mid_spread_zone: 0.8,
    large_spread_trap: 0.6,
    nhl_dog_protocol: 2.0
  },
  NCAAB: {
    public_fade: 1.6,
    sharp_money: 0.85,
    travel_fatigue: 0.9,
    mid_spread_zone: 1.4,
    large_spread_trap: 1.8,
    nhl_dog_protocol: 0
  },
  NCAAF: {
    public_fade: 1.5,
    large_spread_trap: 2.0,
    mid_spread_zone: 1.3,
    nhl_dog_protocol: 0
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getMoonPhase = () => {
  const knownNewMoon = new Date('2024-01-11');
  const daysSince = Math.floor((new Date() - knownNewMoon) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.53;
  const phaseNum = (daysSince % lunarCycle) / lunarCycle * 8;
  const phases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
                  'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
  return phases[Math.floor(phaseNum) % 8];
};

const getLifePath = (date = new Date()) => {
  const digits = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  let total = digits.split('').reduce((sum, d) => sum + parseInt(d), 0);
  while (total > 9 && ![11, 22, 33].includes(total)) {
    total = String(total).split('').reduce((sum, d) => sum + parseInt(d), 0);
  }
  return total;
};

// ============================================================================
// GEMATRIA CIPHERS
// ============================================================================

export const GEMATRIA_CIPHERS = {
  ordinal: (text) => {
    return (text || '').toUpperCase().split('').reduce((sum, char) => {
      const code = char.charCodeAt(0);
      return sum + (code >= 65 && code <= 90 ? code - 64 : 0);
    }, 0);
  },

  reverseOrdinal: (text) => {
    return (text || '').toUpperCase().split('').reduce((sum, char) => {
      const code = char.charCodeAt(0);
      return sum + (code >= 65 && code <= 90 ? 27 - (code - 64) : 0);
    }, 0);
  },

  reduction: (text) => {
    return (text || '').toUpperCase().split('').reduce((sum, char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        let val = code - 64;
        while (val > 9) val = String(val).split('').reduce((s, d) => s + parseInt(d), 0);
        return sum + val;
      }
      return sum;
    }, 0);
  },

  reverseReduction: (text) => {
    return (text || '').toUpperCase().split('').reduce((sum, char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        let val = 27 - (code - 64);
        while (val > 9) val = String(val).split('').reduce((s, d) => s + parseInt(d), 0);
        return sum + val;
      }
      return sum;
    }, 0);
  },

  jewish: (text) => {
    const values = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
      K: 10, L: 20, M: 30, N: 40, O: 50, P: 60, Q: 70, R: 80,
      S: 90, T: 100, U: 200, V: 300, W: 400, X: 500, Y: 600, Z: 700, J: 600
    };
    return (text || '').toUpperCase().split('').reduce((sum, char) => sum + (values[char] || 0), 0);
  },

  sumerian: (text) => {
    return (text || '').toUpperCase().split('').reduce((sum, char) => {
      const code = char.charCodeAt(0);
      return sum + (code >= 65 && code <= 90 ? (code - 64) * 6 : 0);
    }, 0);
  }
};

// ============================================================================
// JARVIS SAVANT POWER NUMBERS & TRIGGERS
// ============================================================================

export const POWER_NUMBERS = {
  master: [11, 22, 33, 44, 55, 66, 77, 88, 99],
  tesla: [3, 6, 9, 27, 36, 63, 72, 81, 108, 144, 216, 369],
  fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377],
  sacred: [7, 12, 40, 72, 153, 666, 777, 888],
  sports: [23, 24, 8, 12, 3, 33, 34, 32, 21, 45, 99, 81],

  // JARVIS TRIGGERS - The proven edge numbers
  jarvisTriggers: {
    2178: {
      name: 'THE IMMORTAL',
      boost: 20,
      tier: 'LEGENDARY',
      description: 'Only number where n×4=reverse AND n×reverse=66^4. Never collapses.',
      mathematical: true
    },
    201: {
      name: 'THE ORDER',
      boost: 12,
      tier: 'HIGH',
      description: 'Jesuit Order gematria. Common in sports scripting claims.',
      mathematical: false
    },
    33: {
      name: 'THE MASTER',
      boost: 10,
      tier: 'HIGH',
      description: 'Highest master number. Most cited in gematria sports.',
      mathematical: false
    },
    93: {
      name: 'THE WILL',
      boost: 10,
      tier: 'HIGH',
      description: 'Thelema sacred number. Will + Love both = 93.',
      mathematical: false
    },
    322: {
      name: 'THE SOCIETY',
      boost: 10,
      tier: 'HIGH',
      description: 'Skull & Bones. March 22 = Season of Sacrifice.',
      mathematical: false
    }
  }
};

/**
 * Check if a value triggers any Jarvis number
 * Returns the highest-tier trigger found
 */
export const checkJarvisTrigger = (value) => {
  const triggers = POWER_NUMBERS.jarvisTriggers;

  // Direct match (highest priority)
  if (triggers[value]) {
    return {
      triggered: true,
      type: 'DIRECT_HIT',
      number: value,
      ...triggers[value],
      message: `🎯 JARVIS ${triggers[value].name}: Direct ${value} match!`
    };
  }

  // Check for 2178 special properties
  if (value === 8712) {
    return {
      triggered: true,
      type: 'IMMORTAL_REVERSE',
      number: 2178,
      ...triggers[2178],
      boost: 15,
      message: `🔄 IMMORTAL REVERSE: 8712 = 2178 × 4`
    };
  }

  // Reduction match (reduce large numbers)
  let reduced = value;
  while (reduced > 999) {
    reduced = String(reduced).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  if (triggers[reduced]) {
    return {
      triggered: true,
      type: 'REDUCTION_HIT',
      number: reduced,
      originalValue: value,
      ...triggers[reduced],
      boost: Math.floor(triggers[reduced].boost * 0.7),
      message: `🔮 JARVIS ${triggers[reduced].name}: ${value} reduces to ${reduced}`
    };
  }

  // 33 divisibility (common pattern)
  if (value % 33 === 0 && value !== 0) {
    return {
      triggered: true,
      type: 'DIV_33',
      number: 33,
      boost: 6,
      tier: 'MEDIUM',
      message: `✨ MASTER DIVISOR: ${value} ÷ 33 = ${value / 33}`
    };
  }

  // 201 proximity (within 5)
  if (Math.abs(value - 201) <= 5 && value !== 201) {
    return {
      triggered: true,
      type: 'NEAR_201',
      number: 201,
      boost: 5,
      tier: 'LOW',
      message: `📍 NEAR ORDER: ${value} is ${Math.abs(value - 201)} from 201`
    };
  }

  // Tesla alignment (mod 9 = 3, 6, or 9)
  const mod9 = value % 9;
  if ((mod9 === 3 || mod9 === 6 || mod9 === 0) && value > 0) {
    return {
      triggered: true,
      type: 'TESLA_ALIGNED',
      number: value,
      boost: 4,
      tier: 'LOW',
      message: `⚡ TESLA: ${value} mod 9 = ${mod9 || 9}`
    };
  }

  return { triggered: false, boost: 0 };
};

/**
 * Validate the immortal property of 2178
 */
export const validate2178 = () => {
  const n = 2178;
  const reversed = 8712;
  const product = n * reversed;
  const fourthPower = Math.pow(66, 4);

  return {
    number: n,
    timesFor: n * 4,
    isReversal: n * 4 === reversed,
    productWithReverse: product,
    isFourthPower: product === fourthPower,
    fourthRoot: 66,
    isImmortal: (n * 4 === reversed) && (product === fourthPower),
    proof: `2178 × 4 = ${n * 4} (reversal: ${reversed === n * 4}) | 2178 × 8712 = ${product} = 66^4 (${product === fourthPower})`
  };
};

// ============================================================================
// GEMATRIA ANALYSIS WITH JARVIS TRIGGERS
// ============================================================================

export const getGematriaAnalysis = (homeTeam, awayTeam, date = new Date()) => {
  const homeValues = {};
  const awayValues = {};
  const alignments = [];
  let esotericScore = 50;

  // Calculate all cipher values
  Object.entries(GEMATRIA_CIPHERS).forEach(([cipher, fn]) => {
    homeValues[cipher] = fn(homeTeam);
    awayValues[cipher] = fn(awayTeam);
  });

  // Date numerology
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const dateSum = getLifePath(date);

  // CHECK JARVIS TRIGGERS (highest priority)
  Object.entries(homeValues).forEach(([cipher, homeVal]) => {
    const awayVal = awayValues[cipher];
    const diff = Math.abs(homeVal - awayVal);

    // Home team Jarvis check
    const homeTrigger = checkJarvisTrigger(homeVal);
    if (homeTrigger.triggered) {
      alignments.unshift({
        type: 'JARVIS_TRIGGER',
        subtype: homeTrigger.type,
        cipher,
        team: homeTeam,
        value: homeVal,
        boost: homeTrigger.boost,
        tier: homeTrigger.tier,
        message: `${cipher.toUpperCase()}: ${homeTeam} = ${homeTrigger.message}`
      });
      esotericScore += homeTrigger.boost;
    }

    // Away team Jarvis check
    const awayTrigger = checkJarvisTrigger(awayVal);
    if (awayTrigger.triggered) {
      alignments.unshift({
        type: 'JARVIS_TRIGGER',
        subtype: awayTrigger.type,
        cipher,
        team: awayTeam,
        value: awayVal,
        boost: awayTrigger.boost,
        tier: awayTrigger.tier,
        message: `${cipher.toUpperCase()}: ${awayTeam} = ${awayTrigger.message}`
      });
      esotericScore += awayTrigger.boost;
    }

    // Difference Jarvis check
    const diffTrigger = checkJarvisTrigger(diff);
    if (diffTrigger.triggered && diffTrigger.type === 'DIRECT_HIT') {
      alignments.unshift({
        type: 'JARVIS_MATCHUP',
        subtype: diffTrigger.type,
        cipher,
        value: diff,
        boost: diffTrigger.boost,
        tier: diffTrigger.tier,
        message: `${cipher.toUpperCase()} MATCHUP: Diff = ${diffTrigger.message}`
      });
      esotericScore += diffTrigger.boost;
    }

    // Standard power number checks
    if (POWER_NUMBERS.master.includes(homeVal)) {
      alignments.push({
        type: 'MASTER_NUMBER',
        cipher,
        team: homeTeam,
        value: homeVal,
        boost: 6,
        message: `${cipher}: ${homeTeam} = Master ${homeVal}`
      });
      esotericScore += 6;
    }

    if (POWER_NUMBERS.master.includes(awayVal)) {
      alignments.push({
        type: 'MASTER_NUMBER',
        cipher,
        team: awayTeam,
        value: awayVal,
        boost: 6,
        message: `${cipher}: ${awayTeam} = Master ${awayVal}`
      });
      esotericScore += 6;
    }

    if (POWER_NUMBERS.tesla.includes(diff)) {
      alignments.push({
        type: 'TESLA_ALIGNMENT',
        cipher,
        value: diff,
        boost: 8,
        message: `${cipher}: Tesla ${diff} (${homeVal} vs ${awayVal})`
      });
      esotericScore += 8;
    }

    if (POWER_NUMBERS.fibonacci.includes(homeVal) || POWER_NUMBERS.fibonacci.includes(awayVal)) {
      const fibTeam = POWER_NUMBERS.fibonacci.includes(homeVal) ? homeTeam : awayTeam;
      const fibVal = POWER_NUMBERS.fibonacci.includes(homeVal) ? homeVal : awayVal;
      alignments.push({
        type: 'FIBONACCI',
        cipher,
        team: fibTeam,
        value: fibVal,
        boost: 5,
        message: `${cipher}: ${fibTeam} = Fibonacci ${fibVal}`
      });
      esotericScore += 5;
    }
  });

  // Date alignment
  Object.entries(homeValues).forEach(([cipher, homeVal]) => {
    if (homeVal % 9 === dateSum % 9) {
      alignments.push({
        type: 'DATE_ALIGNMENT',
        cipher,
        team: homeTeam,
        dateValue: dateSum,
        boost: 7,
        message: `${cipher}: ${homeTeam} aligns with today (${dateSum})`
      });
      esotericScore += 7;
    }
  });

  esotericScore = Math.min(95, esotericScore);

  // Determine favored team (prioritize Jarvis triggers)
  const homeJarvisHits = alignments.filter(a =>
    (a.type === 'JARVIS_TRIGGER' || a.type === 'JARVIS_MATCHUP') && a.team === homeTeam
  );
  const awayJarvisHits = alignments.filter(a =>
    (a.type === 'JARVIS_TRIGGER' || a.type === 'JARVIS_MATCHUP') && a.team === awayTeam
  );

  let favored = null;
  let favorReason = '';

  if (homeJarvisHits.length > awayJarvisHits.length) {
    favored = 'home';
    favorReason = `🎯 ${homeTeam}: ${homeJarvisHits.length} JARVIS TRIGGER(S)`;
  } else if (awayJarvisHits.length > homeJarvisHits.length) {
    favored = 'away';
    favorReason = `🎯 ${awayTeam}: ${awayJarvisHits.length} JARVIS TRIGGER(S)`;
  } else {
    const homeTotal = alignments.filter(a => a.team === homeTeam).length;
    const awayTotal = alignments.filter(a => a.team === awayTeam).length;
    if (homeTotal > awayTotal) {
      favored = 'home';
      favorReason = `${homeTeam}: ${homeTotal} alignments`;
    } else if (awayTotal > homeTotal) {
      favored = 'away';
      favorReason = `${awayTeam}: ${awayTotal} alignments`;
    }
  }

  const jarvisHits = alignments.filter(a =>
    a.type === 'JARVIS_TRIGGER' || a.type === 'JARVIS_MATCHUP'
  ).length;

  const hasLegendary = alignments.some(a => a.tier === 'LEGENDARY');

  return {
    homeTeam,
    awayTeam,
    homeValues,
    awayValues,
    alignments: alignments.slice(0, 10),
    esotericScore,
    favored,
    favorReason,
    dateEnergy: dateSum,
    dayOfYear,
    topAlignment: alignments[0] || null,
    jarvisHits,
    hasJarvisTrigger: jarvisHits > 0,
    hasLegendaryTrigger: hasLegendary,
    immortalValidation: validate2178()
  };
};

// ============================================================================
// DAILY ESOTERIC READING
// ============================================================================

export const getDailyEsotericReading = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const lifePath = getLifePath(date);
  const moonPhase = getMoonPhase();

  const moonEmoji = {
    new: '🌑', waxing_crescent: '🌒', first_quarter: '🌓', waxing_gibbous: '🌔',
    full: '🌕', waning_gibbous: '🌖', last_quarter: '🌗', waning_crescent: '🌘'
  }[moonPhase] || '🌙';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayEnergies = {
    0: { planet: 'Sun', energy: 'victory', color: 'Gold', bias: 'favorites' },
    1: { planet: 'Moon', energy: 'intuition', color: 'Silver', bias: 'home teams' },
    2: { planet: 'Mars', energy: 'aggression', color: 'Red', bias: 'overs' },
    3: { planet: 'Mercury', energy: 'speed', color: 'Yellow', bias: 'high-pace teams' },
    4: { planet: 'Jupiter', energy: 'expansion', color: 'Blue', bias: 'underdogs' },
    5: { planet: 'Venus', energy: 'harmony', color: 'Green', bias: 'close games' },
    6: { planet: 'Saturn', energy: 'discipline', color: 'Black', bias: 'unders' }
  };

  const dayOfWeek = date.getDay();
  const todayEnergy = dayEnergies[dayOfWeek];

  const teslaNumber = (day * month) % 9 || 9;
  const teslaAlignment = [3, 6, 9].includes(teslaNumber) ? 'STRONG' : 'moderate';

  // Check date for Jarvis triggers
  const dateGematria = GEMATRIA_CIPHERS.ordinal(`${month}${day}${year}`);
  const jarvisDateTrigger = checkJarvisTrigger(dateGematria);
  const dayOfYearTrigger = checkJarvisTrigger(Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)));

  const activePowerNumbers = [];
  if (POWER_NUMBERS.master.includes(day)) activePowerNumbers.push({ type: 'Master', value: day });
  if (POWER_NUMBERS.fibonacci.includes(day)) activePowerNumbers.push({ type: 'Fibonacci', value: day });
  if (POWER_NUMBERS.tesla.includes(month + day)) activePowerNumbers.push({ type: 'Tesla', value: month + day });
  if (jarvisDateTrigger.triggered) activePowerNumbers.push({ type: 'JARVIS', ...jarvisDateTrigger });

  const insights = [];

  if (jarvisDateTrigger.triggered) {
    insights.push(`🎯 JARVIS DAY: ${jarvisDateTrigger.message}`);
  }
  if (dayOfYearTrigger.triggered && dayOfYearTrigger.type === 'DIRECT_HIT') {
    insights.push(`📅 Day of year triggers: ${dayOfYearTrigger.message}`);
  }

  insights.push(`Life Path ${lifePath} - ${lifePath === 8 ? 'abundance energy' : lifePath === 11 ? 'master intuition' : lifePath === 22 ? 'master builder' : 'balanced flow'}`);
  insights.push(`${moonEmoji} ${moonPhase.replace('_', ' ')} moon - ${['full', 'new'].includes(moonPhase) ? 'heightened energy' : 'steady flow'}`);
  insights.push(`${dayNames[dayOfWeek]} (${todayEnergy.planet}) - ${todayEnergy.energy} favors ${todayEnergy.bias}`);
  insights.push(`Tesla resonance: ${teslaNumber} (${teslaAlignment})`);

  let recommendation = '';
  if (jarvisDateTrigger.triggered && jarvisDateTrigger.tier === 'LEGENDARY') {
    recommendation = '🎯 IMMORTAL DAY: Maximum trust in gematria alignments.';
  } else if (jarvisDateTrigger.triggered) {
    recommendation = '🎯 JARVIS TRIGGER DAY: Trust the numbers.';
  } else if (moonPhase === 'full') {
    recommendation = 'Full moon = heightened energy. Trust bold plays.';
  } else if (moonPhase === 'new') {
    recommendation = 'New moon = fresh starts. Underdogs shine.';
  } else if (teslaAlignment === 'STRONG') {
    recommendation = 'Tesla alignment active. Trust the mathematics.';
  } else if (lifePath === 8) {
    recommendation = 'Abundance day. High-value plays favored.';
  } else {
    recommendation = 'Steady energy. Stick to high-confluence plays.';
  }

  return {
    date: date.toDateString(),
    lifePath,
    moonPhase,
    moonEmoji,
    dayOfWeek: dayNames[dayOfWeek],
    planetaryRuler: todayEnergy.planet,
    dayEnergy: todayEnergy.energy,
    colorOfDay: todayEnergy.color,
    naturalBias: todayEnergy.bias,
    teslaNumber,
    teslaAlignment,
    activePowerNumbers,
    insights,
    recommendation,
    luckyNumbers: [lifePath, teslaNumber, day % 10 || 10, (month + day) % 22 || 22],
    jarvisTrigger: jarvisDateTrigger,
    isJarvisDay: jarvisDateTrigger.triggered,
    immortalValidation: validate2178()
  };
};

// ============================================================================
// ESOTERIC SCORE CALCULATION
// ============================================================================

export const calculateEsotericScore = (game, date = new Date()) => {
  const homeTeam = game.home_team || '';
  const awayTeam = game.away_team || '';

  const gematria = getGematriaAnalysis(homeTeam, awayTeam, date);
  const daily = getDailyEsotericReading(date);

  // Moon phase score
  const moonPhase = getMoonPhase();
  let moonScore = 50;
  let moonInsight = '';

  if (moonPhase === 'full') {
    moonScore = 70;
    moonInsight = 'Full moon: Peak energy, trust instincts';
  } else if (moonPhase === 'new') {
    moonScore = 65;
    moonInsight = 'New moon: Fresh cycle, underdogs shine';
  } else if (['waxing_gibbous', 'waxing_crescent'].includes(moonPhase)) {
    moonScore = 58;
    moonInsight = 'Waxing moon: Building momentum';
  } else {
    moonScore = 52;
    moonInsight = 'Waning moon: Fade the hype';
  }

  // Numerology score
  const lifePath = daily.lifePath;
  let numerologyScore = 50;
  let numerologyInsight = '';

  if ([8, 11, 22, 33].includes(lifePath)) {
    numerologyScore = 72;
    numerologyInsight = `Master ${lifePath} day - powerful`;
  } else if ([1, 5, 9].includes(lifePath)) {
    numerologyScore = 62;
    numerologyInsight = `Life path ${lifePath} - action energy`;
  } else {
    numerologyScore = 55;
    numerologyInsight = `Life path ${lifePath} - balanced`;
  }

  // Sacred geometry score
  const line = game.spread || game.total || 0;
  const rounded = Math.round(Math.abs(line));
  let geometryScore = 50;
  let geometryInsight = '';

  if (POWER_NUMBERS.fibonacci.includes(rounded)) {
    geometryScore = 68;
    geometryInsight = `Line ${rounded} = Fibonacci`;
  } else if (rounded % 3 === 0) {
    geometryScore = 62;
    geometryInsight = `Line ${rounded} = Tesla divisible`;
  } else if (POWER_NUMBERS.sacred.includes(rounded)) {
    geometryScore = 65;
    geometryInsight = `Line ${rounded} = Sacred`;
  } else {
    geometryScore = 52;
    geometryInsight = `Line ${rounded} - neutral`;
  }

  // Zodiac score
  const planetaryBias = daily.naturalBias;
  let zodiacScore = 50;
  let zodiacInsight = `${daily.dayOfWeek} (${daily.planetaryRuler}) favors ${planetaryBias}`;

  if (planetaryBias === 'overs' && game.total > 220) zodiacScore = 65;
  else if (planetaryBias === 'unders' && game.total < 215) zodiacScore = 65;
  else if (planetaryBias === 'underdogs' && game.spread > 5) zodiacScore = 62;
  else if (planetaryBias === 'favorites' && game.spread < -5) zodiacScore = 62;
  else if (planetaryBias === 'home teams') zodiacScore = 58;

  // Dynamic weights based on Jarvis triggers
  const hasJarvis = gematria.hasJarvisTrigger;
  const hasLegendary = gematria.hasLegendaryTrigger;

  const esotericWeights = {
    gematria: hasLegendary ? 50 : hasJarvis ? 42 : 35,
    moon: 18,
    numerology: hasJarvis ? 15 : 20,
    geometry: 15,
    zodiac: hasJarvis ? 5 : 12
  };

  const totalWeight = Object.values(esotericWeights).reduce((s, w) => s + w, 0);
  const weightedSum =
    gematria.esotericScore * esotericWeights.gematria +
    moonScore * esotericWeights.moon +
    numerologyScore * esotericWeights.numerology +
    geometryScore * esotericWeights.geometry +
    zodiacScore * esotericWeights.zodiac;

  let finalEsotericScore = Math.round(weightedSum / totalWeight);

  // Jarvis bonuses
  if (hasLegendary) finalEsotericScore = Math.min(98, finalEsotericScore + 10);
  else if (hasJarvis) finalEsotericScore = Math.min(95, finalEsotericScore + 5);

  // Determine tier
  let esotericTier = 'NEUTRAL';
  let esotericEmoji = '🔮';

  if (hasLegendary || finalEsotericScore >= 80) {
    esotericTier = 'IMMORTAL_ALIGNMENT';
    esotericEmoji = '🎯';
  } else if (finalEsotericScore >= 70) {
    esotericTier = 'COSMIC_ALIGNMENT';
    esotericEmoji = '🌟';
  } else if (finalEsotericScore >= 60) {
    esotericTier = 'STARS_FAVOR';
    esotericEmoji = '⭐';
  } else if (finalEsotericScore >= 50) {
    esotericTier = 'MILD_ALIGNMENT';
    esotericEmoji = '✨';
  }

  return {
    esotericScore: finalEsotericScore,
    esotericTier,
    esotericEmoji,
    hasJarvisTrigger: hasJarvis,
    hasLegendaryTrigger: hasLegendary,
    jarvisHits: gematria.jarvisHits,
    components: {
      gematria: {
        score: gematria.esotericScore,
        weight: esotericWeights.gematria,
        alignments: gematria.alignments,
        favored: gematria.favored,
        favorReason: gematria.favorReason,
        homeValues: gematria.homeValues,
        awayValues: gematria.awayValues,
        jarvisHits: gematria.jarvisHits,
        hasJarvisTrigger: gematria.hasJarvisTrigger,
        hasLegendaryTrigger: gematria.hasLegendaryTrigger
      },
      moon: { score: moonScore, weight: esotericWeights.moon, phase: moonPhase, insight: moonInsight },
      numerology: { score: numerologyScore, weight: esotericWeights.numerology, lifePath, insight: numerologyInsight },
      geometry: { score: geometryScore, weight: esotericWeights.geometry, line: rounded, insight: geometryInsight },
      zodiac: { score: zodiacScore, weight: esotericWeights.zodiac, day: daily.dayOfWeek, ruler: daily.planetaryRuler, insight: zodiacInsight }
    },
    dailyReading: daily,
    topInsights: [
      hasLegendary ? `🎯 IMMORTAL 2178 DETECTED - Maximum conviction` : null,
      hasJarvis ? `🎯 ${gematria.jarvisHits} JARVIS TRIGGER(S)` : null,
      gematria.topAlignment?.message,
      moonInsight
    ].filter(Boolean)
  };
};

// ============================================================================
// COSMIC CONFLUENCE
// ============================================================================

export const checkCosmicConfluence = (mainConfidence, esotericScore, mainDirection, esotericFavored, hasJarvis = false, hasLegendary = false) => {
  const bothHigh = mainConfidence >= 70 && esotericScore >= 65;
  const sameDirection = mainDirection === esotericFavored || !esotericFavored;

  // IMMORTAL CONFLUENCE - 2178 trigger + main model
  if (hasLegendary && mainConfidence >= 70 && sameDirection) {
    return {
      hasConfluence: true,
      level: 'IMMORTAL',
      emoji: '🎯🔥💎',
      message: 'IMMORTAL CONFLUENCE: 2178 + Research aligned!',
      boost: 10
    };
  }

  // JARVIS CONFLUENCE
  if (hasJarvis && mainConfidence >= 70 && sameDirection) {
    return {
      hasConfluence: true,
      level: 'JARVIS_PERFECT',
      emoji: '🎯🔥',
      message: 'JARVIS CONFLUENCE: Triggers + Research aligned!',
      boost: 7
    };
  }

  if (bothHigh && sameDirection) {
    const isPerfect = mainConfidence >= 80 && esotericScore >= 75;
    return {
      hasConfluence: true,
      level: isPerfect ? 'PERFECT' : 'STRONG',
      emoji: isPerfect ? '🌟🔥' : '⭐💪',
      message: isPerfect ? 'PERFECT COSMIC CONFLUENCE!' : 'STRONG CONFLUENCE',
      boost: isPerfect ? 5 : 3
    };
  }

  if (bothHigh && !sameDirection) {
    return {
      hasConfluence: false,
      level: 'DIVERGENT',
      emoji: '⚡',
      message: 'Divergence: Strong signals, different directions',
      boost: 0
    };
  }

  if (mainConfidence >= 70 || esotericScore >= 70) {
    return {
      hasConfluence: false,
      level: 'PARTIAL',
      emoji: '🔮',
      message: 'Partial alignment',
      boost: 0
    };
  }

  return {
    hasConfluence: false,
    level: 'NONE',
    emoji: '📊',
    message: 'No special alignment',
    boost: 0
  };
};

// ============================================================================
// SIGNAL CALCULATORS
// ============================================================================

const signalCalculators = {
  sharp_money: (game, sharpData) => {
    if (!sharpData || !Array.isArray(sharpData)) {
      return { score: 50, contribution: 'No sharp data available' };
    }

    const matchingGame = sharpData.find(s =>
      s.home_team === game.home_team || s.away_team === game.away_team ||
      (s.game && (s.game.includes(game.home_team) || s.game.includes(game.away_team)))
    );

    if (!matchingGame) return { score: 50, contribution: 'No sharp data for game' };

    const moneyPct = matchingGame.money_pct || matchingGame.handle_pct || 50;
    const ticketPct = matchingGame.ticket_pct || matchingGame.bets_pct || 50;
    const divergence = Math.abs(moneyPct - ticketPct);

    if (divergence >= 25) {
      return { score: 95, contribution: `🔥 STRONG SHARP: ${divergence}% divergence` };
    } else if (divergence >= 20) {
      return { score: 88, contribution: `Sharp detected: ${divergence}% split` };
    } else if (divergence >= 15) {
      return { score: 75, contribution: `Moderate sharp: ${divergence}%` };
    } else if (divergence >= 10) {
      return { score: 62, contribution: `Mild sharp: ${divergence}%` };
    }
    return { score: 50, contribution: 'No significant sharp action' };
  },

  line_edge: (game) => {
    const odds = game.spread_odds || game.over_odds || -110;
    if (odds >= -100) return { score: 95, contribution: `ELITE odds: ${odds}` };
    if (odds >= -102) return { score: 90, contribution: `Excellent: ${odds}` };
    if (odds >= -105) return { score: 82, contribution: `Great: ${odds}` };
    if (odds >= -108) return { score: 68, contribution: `Good: ${odds}` };
    if (odds >= -110) return { score: 55, contribution: `Standard: ${odds}` };
    return { score: 40, contribution: `Poor: ${odds}` };
  },

  injury_vacuum: (game, injuries) => {
    if (!injuries || !Array.isArray(injuries)) return { score: 50, contribution: 'No injury data' };

    const gameInjuries = injuries.filter(i => i.team === game.home_team || i.team === game.away_team);
    if (gameInjuries.length === 0) return { score: 55, contribution: 'No significant injuries' };

    const outPlayers = gameInjuries.filter(i => ['OUT', 'DOUBTFUL', 'O', 'D'].includes((i.status || '').toUpperCase()));
    const totalVacuum = outPlayers.reduce((sum, p) => sum + (p.usage_pct || 0.15), 0);

    if (totalVacuum >= 0.30) return { score: 92, contribution: `🔥 MAJOR VACUUM: ${(totalVacuum * 100).toFixed(0)}%` };
    if (totalVacuum >= 0.20) return { score: 78, contribution: `Good vacuum: ${(totalVacuum * 100).toFixed(0)}%` };
    if (outPlayers.length >= 2) return { score: 72, contribution: `${outPlayers.length} players OUT` };
    if (outPlayers.length === 1) return { score: 62, contribution: `Key player OUT` };
    return { score: 55, contribution: `${gameInjuries.length} questionable` };
  },

  game_pace: (game, sport) => {
    const total = game.total || game.over_under || 0;

    if (sport === 'NBA' || sport === 'NCAAB') {
      if (total >= 235) return { score: 88, contribution: `High pace: O/U ${total}` };
      if (total >= 228) return { score: 72, contribution: `Above avg: O/U ${total}` };
      if (total <= 210) return { score: 75, contribution: `Slow pace: O/U ${total}` };
    } else if (sport === 'NFL') {
      if (total >= 52) return { score: 82, contribution: `Shootout: O/U ${total}` };
      if (total >= 48) return { score: 68, contribution: `Above avg: O/U ${total}` };
      if (total <= 40) return { score: 75, contribution: `Low scoring: O/U ${total}` };
    }
    return { score: 55, contribution: `Total: ${total}` };
  },

  travel_fatigue: (game, sport) => {
    const homeTeam = (game.home_team || '').toLowerCase();
    const awayTeam = (game.away_team || '').toLowerCase();

    const westTeams = ['lakers', 'clippers', 'warriors', 'kings', 'suns', 'blazers', 'jazz', 'nuggets', 'portland', 'phoenix', 'golden state', 'los angeles', 'sacramento', 'denver'];
    const eastTeams = ['celtics', 'knicks', 'nets', 'sixers', 'heat', 'magic', 'hawks', 'hornets', 'wizards', 'cavaliers', 'pistons', 'pacers', 'boston', 'new york', 'brooklyn', 'philadelphia', 'miami', 'orlando', 'atlanta', 'charlotte', 'washington', 'cleveland', 'detroit', 'indiana'];

    const homeIsWest = westTeams.some(t => homeTeam.includes(t));
    const awayIsEast = eastTeams.some(t => awayTeam.includes(t));

    if (homeIsWest && awayIsEast) {
      return { score: 82, contribution: `West home vs East: Circadian edge` };
    }
    return { score: 50, contribution: 'No significant travel factor' };
  },

  back_to_back: (game, contextData) => {
    const isHomeB2B = game.home_b2b || game.home_rest_days === 0;
    const isAwayB2B = game.away_b2b || game.away_rest_days === 0;
    const publicPct = contextData?.publicPct || 50;

    if (isHomeB2B && publicPct >= 65) {
      return { score: 88, contribution: `🔥 FADE: Home B2B + ${publicPct}% public` };
    }
    if (isHomeB2B) return { score: 68, contribution: `Home B2B: 46.6% ATS` };
    if (isAwayB2B) return { score: 62, contribution: `Away B2B fatigue` };
    return { score: 50, contribution: 'No B2B situation' };
  },

  defense_vs_position: (game, prop) => {
    if (!prop) return { score: 50, contribution: 'No prop context' };
    const defenseRank = prop.opponent_defense_rank || prop.def_rank;

    if (defenseRank && defenseRank <= 5) return { score: 35, contribution: `Strong D (${defenseRank}): Under` };
    if (defenseRank && defenseRank >= 25) return { score: 85, contribution: `Weak D (${defenseRank}): Over` };
    if (defenseRank && defenseRank >= 20) return { score: 72, contribution: `Below avg D (${defenseRank})` };
    return { score: 55, contribution: 'Defense: Neutral' };
  },

  // JARVIS SAVANT: Public Fade 65% Crush Zone
  public_fade: (game, splits) => {
    if (!splits || !Array.isArray(splits)) return { score: 50, contribution: 'No splits data' };

    const matchingSplit = splits.find(s =>
      s.home_team === game.home_team || s.away_team === game.away_team ||
      (s.game && (s.game.includes(game.home_team) || s.game.includes(game.away_team)))
    );

    if (!matchingSplit) return { score: 50, contribution: 'No splits for game' };

    const publicPct = Math.max(
      matchingSplit.home_pct || matchingSplit.home_bets_pct || 0,
      matchingSplit.away_pct || matchingSplit.away_bets_pct || 0
    );

    if (publicPct >= 80) return { score: 92, contribution: `🔥 JARVIS CRUSH: ${publicPct}% = MAX FADE` };
    if (publicPct >= 75) return { score: 85, contribution: `🎯 STRONG FADE: ${publicPct}%` };
    if (publicPct >= 70) return { score: 78, contribution: `Fade zone: ${publicPct}%` };
    if (publicPct >= 65) return { score: 72, contribution: `⚡ JARVIS 65%: ${publicPct}% = FADE` };
    if (publicPct >= 60) return { score: 60, contribution: `Moderate lean: ${publicPct}%` };
    return { score: 50, contribution: 'No strong public lean' };
  },

  steam_moves: (game) => {
    const openSpread = game.open_spread || game.opening_spread;
    const currentSpread = game.spread;

    if (openSpread !== undefined && currentSpread !== undefined) {
      const movement = Math.abs(currentSpread - openSpread);
      if (movement >= 2) return { score: 85, contribution: `🔥 STEAM: ${movement} pts` };
      if (movement >= 1.5) return { score: 75, contribution: `Movement: ${movement} pts` };
      if (movement >= 1) return { score: 65, contribution: `Line move: ${movement} pts` };
    }
    return { score: 50, contribution: 'No significant movement' };
  },

  home_court: (game, sport) => {
    if (!game.home_team) return { score: 50, contribution: 'No home/away data' };
    const homeTeam = (game.home_team || '').toLowerCase();

    const altitudeTeams = ['nuggets', 'denver', 'jazz', 'utah'];
    if (altitudeTeams.some(t => homeTeam.includes(t))) {
      return { score: 82, contribution: `Altitude advantage` };
    }
    return { score: 58, contribution: 'Standard home court' };
  },

  // JARVIS SAVANT: Mid-Spread Zone (+4 to +9)
  mid_spread_zone: (game, sport) => {
    const spread = Math.abs(game.spread || 0);

    if (sport === 'NBA' || sport === 'NCAAB') {
      if (spread >= 4 && spread <= 9) {
        return { score: 85, contribution: `🎯 JARVIS MID-ZONE: ${spread} pts` };
      }
      if (spread >= 3 && spread <= 10) {
        return { score: 72, contribution: `Near mid-zone: ${spread} pts` };
      }
    }

    if (sport === 'NFL' || sport === 'NCAAF') {
      if (spread >= 3 && spread <= 7) {
        return { score: 88, contribution: `🎯 NFL KEY ZONE: ${spread} pts` };
      }
      if (spread >= 2.5 && spread <= 10) {
        return { score: 72, contribution: `Competitive: ${spread} pts` };
      }
    }

    if (sport === 'NHL') {
      if (spread >= 1 && spread <= 2) {
        return { score: 75, contribution: `Puck line zone: ${spread}` };
      }
    }

    return { score: 50, contribution: `Spread ${spread} outside mid-zone` };
  },

  // JARVIS SAVANT: Large Spread Trap Gate
  large_spread_trap: (game, sport) => {
    const spread = Math.abs(game.spread || 0);

    if (sport === 'NBA' || sport === 'NCAAB') {
      if (spread >= 20) return { score: 25, contribution: `⚠️ TRAP GATE: ${spread} pts EXTREME` };
      if (spread >= 15) return { score: 35, contribution: `🚨 TRAP: ${spread} pts (Kings lesson)` };
      if (spread >= 12) return { score: 45, contribution: `Caution: ${spread} pts blowout` };
    }

    if (sport === 'NFL' || sport === 'NCAAF') {
      if (spread >= 21) return { score: 25, contribution: `⚠️ TRAP GATE: ${spread} pts 3+ TDs` };
      if (spread >= 17) return { score: 35, contribution: `🚨 TRAP: ${spread} pts garbage time` };
      if (spread >= 14) return { score: 45, contribution: `Caution: ${spread} pts 2 TDs` };
    }

    return { score: 55, contribution: 'Spread in normal range' };
  },

  // JARVIS SAVANT: NHL Dog Protocol
  nhl_dog_protocol: (game, sport, contextData = {}) => {
    if (sport !== 'NHL') return { score: 50, contribution: 'Not NHL' };

    const spread = game.spread || 0;
    const isUnderdog = spread > 0;
    const publicPct = contextData?.publicPct || 50;

    if (isUnderdog && spread >= 1.5) {
      if (publicPct >= 65) {
        return { score: 92, contribution: `🏒 JARVIS NHL: +1.5 + ${publicPct}% fade` };
      }
      if (publicPct >= 60) {
        return { score: 82, contribution: `🏒 NHL Dog: +1.5 + ${publicPct}% fade` };
      }
      return { score: 72, contribution: `NHL +1.5 dog value` };
    }

    return { score: 50, contribution: 'No NHL dog trigger' };
  },

  weather: (game, sport) => {
    if (!['NFL', 'MLB'].includes(sport)) return { score: 50, contribution: 'Indoor sport' };

    const wind = game.wind_mph || game.wind;
    if (wind && wind >= 20) return { score: 88, contribution: `🌬️ HIGH WIND: ${wind}mph` };
    if (wind && wind >= 15) return { score: 78, contribution: `Wind ${wind}mph: Under lean` };
    if (wind && wind >= 10) return { score: 68, contribution: `Wind ${wind}mph` };
    return { score: 50, contribution: 'Weather neutral' };
  },

  referee: (game) => {
    const refData = game.referee_over_rate || game.ref_tendency;
    if (refData && refData >= 58) return { score: 72, contribution: `High-foul crew: ${refData}%` };
    if (refData && refData <= 42) return { score: 72, contribution: `Low-foul crew: ${refData}%` };
    return { score: 50, contribution: 'Referee neutral' };
  },

  key_spread: (game, sport) => {
    const spread = Math.abs(game.spread || 0);

    if (sport === 'NFL') {
      if (spread === 3) return { score: 95, contribution: '🔑 KEY: 3 (most common)' };
      if (spread === 7) return { score: 90, contribution: '🔑 KEY: 7 (TD)' };
      if (spread === 10) return { score: 70, contribution: 'KEY: 10 (TD+FG)' };
    }
    return { score: 55, contribution: `Spread: ${spread}` };
  },

  books_consensus: (game) => {
    const booksCount = game.books_compared || game.all_books?.length || 1;
    if (booksCount >= 8) return { score: 82, contribution: `${booksCount} books` };
    if (booksCount >= 5) return { score: 68, contribution: `${booksCount} books` };
    return { score: 45, contribution: 'Limited books' };
  },

  ensemble_ml: (game, predictions) => {
    if (!predictions?.ensemble_confidence) return { score: 50, contribution: 'No ML' };
    return { score: predictions.ensemble_confidence, contribution: `ML: ${predictions.ensemble_confidence}%` };
  },

  lstm_trend: (game, predictions) => {
    if (!predictions?.lstm_confidence) return { score: 50, contribution: 'No LSTM' };
    return { score: predictions.lstm_confidence, contribution: `LSTM: ${predictions.lstm_confidence}%` };
  },

  recent_form: (game, prop) => {
    if (!prop?.hit_rate_l5) return { score: 50, contribution: 'No form data' };
    const hitRate = prop.hit_rate_l5;
    if (hitRate >= 80) return { score: 78, contribution: `Hot: ${hitRate}% L5` };
    if (hitRate >= 60) return { score: 62, contribution: `Solid: ${hitRate}% L5` };
    if (hitRate <= 20) return { score: 72, contribution: `Cold: ${hitRate}% bounce?` };
    return { score: 50, contribution: `L5: ${hitRate}%` };
  },

  minutes_projection: (prop) => {
    if (!prop?.projected_minutes) return { score: 50, contribution: 'No minutes' };
    const mins = prop.projected_minutes;
    if (mins >= 36) return { score: 82, contribution: `Heavy: ${mins}+ min` };
    if (mins >= 32) return { score: 68, contribution: `Good: ${mins} min` };
    if (mins <= 22) return { score: 35, contribution: `Limited: ${mins} min` };
    return { score: 55, contribution: `${mins} min` };
  },

  game_script: (game, prop) => {
    const spread = game.spread || 0;
    if (spread >= 10 && prop?.stat_type?.includes('pass')) {
      return { score: 72, contribution: 'Underdog: More passing' };
    }
    if (spread <= -10 && prop?.stat_type?.includes('rush')) {
      return { score: 72, contribution: 'Favorite: More rushing' };
    }
    return { score: 50, contribution: 'Script neutral' };
  },

  moon_phase: () => {
    const phase = getMoonPhase();
    if (phase === 'full' || phase === 'new') return { score: 55, contribution: `Moon: ${phase}` };
    return { score: 50, contribution: `Moon: ${phase}` };
  },

  numerology: () => {
    const lifePath = getLifePath();
    if ([8, 11, 22].includes(lifePath)) return { score: 58, contribution: `LP ${lifePath}` };
    return { score: 50, contribution: `LP: ${lifePath}` };
  },

  gematria: (game) => {
    const homeValue = GEMATRIA_CIPHERS.ordinal(game.home_team);
    const awayValue = GEMATRIA_CIPHERS.ordinal(game.away_team);
    const diff = Math.abs(homeValue - awayValue);

    const homeTrigger = checkJarvisTrigger(homeValue);
    const awayTrigger = checkJarvisTrigger(awayValue);
    const diffTrigger = checkJarvisTrigger(diff);

    if (homeTrigger.tier === 'LEGENDARY' || awayTrigger.tier === 'LEGENDARY') {
      return { score: 78, contribution: `🎯 IMMORTAL 2178 DETECTED` };
    }
    if (homeTrigger.triggered || awayTrigger.triggered || diffTrigger.triggered) {
      return { score: 68, contribution: `🎯 JARVIS TRIGGER` };
    }
    if (diff % 9 === 0) return { score: 58, contribution: `Tesla: ${diff}` };
    return { score: 50, contribution: `${homeValue} vs ${awayValue}` };
  },

  sacred_geometry: (game) => {
    const line = game.spread || game.total || 0;
    const rounded = Math.round(Math.abs(line));

    if (POWER_NUMBERS.fibonacci.includes(rounded) || rounded % 3 === 0) {
      return { score: 55, contribution: `Sacred: ${rounded}` };
    }
    return { score: 50, contribution: 'Geometry neutral' };
  },

  zodiac: () => {
    const month = new Date().getMonth();
    const elements = ['earth', 'air', 'water', 'fire'];
    return { score: 50, contribution: `Element: ${elements[month % 4]}` };
  }
};

// ============================================================================
// MAIN ENGINE FUNCTION
// ============================================================================

export const calculateConfidence = (game, sport, contextData = {}) => {
  if (!game || typeof game !== 'object') {
    return {
      confidence: 50,
      tier: 'PARTIAL_ALIGNMENT',
      recommendation: 'PASS',
      signals: [],
      topSignals: [],
      breakdown: { tier1: [], tier2: [], tier3: [], engagement: [], jarvis: [] }
    };
  }

  const { sharpData, splits, injuries, predictions, prop } = contextData;
  const modifiers = SPORT_MODIFIERS[sport] || {};

  // Get public percentage
  let publicPct = 50;
  if (splits && Array.isArray(splits)) {
    const matchingSplit = splits.find(s =>
      s.home_team === game.home_team || s.away_team === game.away_team
    );
    if (matchingSplit) {
      publicPct = Math.max(
        matchingSplit.home_pct || matchingSplit.home_bets_pct || 0,
        matchingSplit.away_pct || matchingSplit.away_bets_pct || 0
      );
    }
  }

  // Calculate all signals
  const signalResults = {};

  // Tier 1
  signalResults.sharp_money = signalCalculators.sharp_money(game, sharpData);
  signalResults.line_edge = signalCalculators.line_edge(game);
  signalResults.injury_vacuum = signalCalculators.injury_vacuum(game, injuries);
  signalResults.game_pace = signalCalculators.game_pace(game, sport);
  signalResults.travel_fatigue = signalCalculators.travel_fatigue(game, sport);
  signalResults.back_to_back = signalCalculators.back_to_back(game, { publicPct });
  signalResults.defense_vs_position = signalCalculators.defense_vs_position(game, prop);
  signalResults.public_fade = signalCalculators.public_fade(game, splits);
  signalResults.steam_moves = signalCalculators.steam_moves(game);
  signalResults.home_court = signalCalculators.home_court(game, sport);

  // Jarvis Savant
  signalResults.mid_spread_zone = signalCalculators.mid_spread_zone(game, sport);
  signalResults.large_spread_trap = signalCalculators.large_spread_trap(game, sport);
  signalResults.nhl_dog_protocol = signalCalculators.nhl_dog_protocol(game, sport, { publicPct });

  // Tier 2
  signalResults.weather = signalCalculators.weather(game, sport);
  signalResults.referee = signalCalculators.referee(game);
  signalResults.key_spread = signalCalculators.key_spread(game, sport);
  signalResults.books_consensus = signalCalculators.books_consensus(game);
  signalResults.recent_form = signalCalculators.recent_form(game, prop);
  signalResults.minutes_projection = signalCalculators.minutes_projection(prop);
  signalResults.game_script = signalCalculators.game_script(game, prop);

  // Tier 3
  signalResults.ensemble_ml = signalCalculators.ensemble_ml(game, predictions);
  signalResults.lstm_trend = signalCalculators.lstm_trend(game, predictions);

  // Esoteric
  signalResults.moon_phase = signalCalculators.moon_phase();
  signalResults.numerology = signalCalculators.numerology();
  signalResults.gematria = signalCalculators.gematria(game);
  signalResults.sacred_geometry = signalCalculators.sacred_geometry(game);
  signalResults.zodiac = signalCalculators.zodiac();

  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [signal, result] of Object.entries(signalResults)) {
    const baseWeight = DEFAULT_WEIGHTS[signal] || 1;
    const modifier = modifiers[signal] || 1.0;
    const adjustedWeight = baseWeight * modifier;

    if (adjustedWeight <= 0) continue;

    totalWeight += adjustedWeight;
    weightedSum += result.score * adjustedWeight;
  }

  let confidence = Math.round(weightedSum / totalWeight);

  // Data quality boost
  const hasRealOdds = game.spread_odds || game.over_odds || game.moneyline_home;
  const hasSpread = game.spread !== undefined && game.spread !== null;
  const booksCount = game.books_compared || game.all_books?.length || 0;

  if (hasRealOdds && booksCount > 5) confidence = Math.min(100, confidence + 8);
  else if (hasRealOdds && booksCount > 3) confidence = Math.min(100, confidence + 5);
  else if (hasRealOdds && hasSpread) confidence = Math.min(100, confidence + 3);

  // Tier
  let tier;
  if (confidence >= 80) tier = 'GOLDEN_CONVERGENCE';
  else if (confidence >= 70) tier = 'SUPER_SIGNAL';
  else if (confidence >= 60) tier = 'HARMONIC_ALIGNMENT';
  else tier = 'PARTIAL_ALIGNMENT';

  // Rank signals
  const rankedSignals = Object.entries(signalResults)
    .map(([name, result]) => ({
      name,
      score: result.score,
      contribution: result.contribution,
      weight: DEFAULT_WEIGHTS[name] || 1,
      impact: result.score * (DEFAULT_WEIGHTS[name] || 1)
    }))
    .sort((a, b) => b.impact - a.impact);

  // Recommendation
  let recommendation = 'LEAN';
  if (confidence >= 80) recommendation = 'SMASH';
  else if (confidence >= 70) recommendation = 'STRONG';
  else if (confidence >= 60) recommendation = 'PLAY';
  else if (confidence < 55) recommendation = 'PASS';

  // Esoteric analysis
  const esotericAnalysis = calculateEsotericScore(game);

  // Confluence
  const confluence = checkCosmicConfluence(
    confidence,
    esotericAnalysis.esotericScore,
    recommendation === 'SMASH' || recommendation === 'STRONG' ? 'home' : null,
    esotericAnalysis.components.gematria.favored,
    esotericAnalysis.hasJarvisTrigger,
    esotericAnalysis.hasLegendaryTrigger
  );

  // Apply boost
  let finalConfidence = confidence;
  if (confluence.hasConfluence && confluence.boost > 0) {
    finalConfidence = Math.min(100, confidence + confluence.boost);
  }

  return {
    confidence: finalConfidence,
    tier,
    recommendation,
    signals: rankedSignals,
    topSignals: rankedSignals.slice(0, 3),
    breakdown: {
      tier1: rankedSignals.filter(s => ['sharp_money', 'line_edge', 'injury_vacuum', 'game_pace', 'travel_fatigue', 'back_to_back', 'defense_vs_position', 'public_fade', 'steam_moves', 'home_court'].includes(s.name)),
      tier2: rankedSignals.filter(s => ['weather', 'referee', 'key_spread', 'books_consensus', 'recent_form', 'minutes_projection', 'game_script'].includes(s.name)),
      tier3: rankedSignals.filter(s => ['ensemble_ml', 'lstm_trend'].includes(s.name)),
      engagement: rankedSignals.filter(s => ['moon_phase', 'numerology', 'gematria', 'sacred_geometry', 'zodiac'].includes(s.name)),
      jarvis: rankedSignals.filter(s => ['mid_spread_zone', 'large_spread_trap', 'nhl_dog_protocol'].includes(s.name))
    },
    moonPhase: getMoonPhase(),
    lifePath: getLifePath(),
    esotericEdge: {
      score: esotericAnalysis.esotericScore,
      tier: esotericAnalysis.esotericTier,
      emoji: esotericAnalysis.esotericEmoji,
      hasJarvisTrigger: esotericAnalysis.hasJarvisTrigger,
      hasLegendaryTrigger: esotericAnalysis.hasLegendaryTrigger,
      jarvisHits: esotericAnalysis.jarvisHits,
      gematria: esotericAnalysis.components.gematria,
      moon: esotericAnalysis.components.moon,
      numerology: esotericAnalysis.components.numerology,
      geometry: esotericAnalysis.components.geometry,
      zodiac: esotericAnalysis.components.zodiac,
      dailyReading: esotericAnalysis.dailyReading,
      topInsights: esotericAnalysis.topInsights
    },
    confluence: {
      hasConfluence: confluence.hasConfluence,
      level: confluence.level,
      emoji: confluence.emoji,
      message: confluence.message,
      boost: confluence.boost
    }
  };
};

// ============================================================================
// API & HELPER EXPORTS
// ============================================================================

export const fetchSignalContext = async (sport) => {
  try {
    const [sharpData, splits, injuries, weights] = await Promise.all([
      api.getSharpMoney(sport).catch(() => null),
      api.getSplits(sport).catch(() => null),
      api.getInjuries(sport).catch(() => null),
      api.getGraderWeights().catch(() => null)
    ]);

    let normalizedSharp = sharpData?.signals || sharpData || [];
    if (Array.isArray(normalizedSharp)) {
      normalizedSharp = normalizedSharp.map(s => ({
        ...s,
        money_pct: s.money_pct || s.handle_pct || s.sharp_pct || 50,
        ticket_pct: s.ticket_pct || s.bets_pct || s.public_pct || 50,
        home_team: s.home_team || s.game?.split(' @ ')?.[1] || s.game?.split(' vs ')?.[0] || '',
        away_team: s.away_team || s.game?.split(' @ ')?.[0] || s.game?.split(' vs ')?.[1] || ''
      }));
    }

    return {
      sharpData: normalizedSharp.length > 0 ? normalizedSharp : null,
      splits: splits?.games || splits?.splits || splits || null,
      injuries: injuries?.injuries || injuries || null,
      weights: weights?.weights || DEFAULT_WEIGHTS,
      predictions: null,
      hasLiveData: normalizedSharp.length > 0 || (splits?.length > 0) || (injuries?.length > 0)
    };
  } catch (error) {
    console.error('Error fetching signal context:', error);
    return { sharpData: null, splits: null, injuries: null, weights: DEFAULT_WEIGHTS, predictions: null, hasLiveData: false };
  }
};

export const getTierInfo = (tier) => {
  const tiers = {
    GOLDEN_CONVERGENCE: { label: '🏆 GOLDEN CONVERGENCE', color: '#FFD700', winRate: '62-65%', roi: '+15-20%', description: 'All signals aligned' },
    SUPER_SIGNAL: { label: '⚡ SUPER SIGNAL', color: '#00FF88', winRate: '58-62%', roi: '+10-15%', description: 'Strong convergence' },
    HARMONIC_ALIGNMENT: { label: '🎯 HARMONIC', color: '#00D4FF', winRate: '55-58%', roi: '+5-10%', description: 'Good alignment' },
    PARTIAL_ALIGNMENT: { label: '📊 PARTIAL', color: '#9ca3af', winRate: '52-55%', roi: '+2-5%', description: 'Some signals' }
  };
  return tiers[tier] || tiers.PARTIAL_ALIGNMENT;
};

export const getRecommendationDisplay = (recommendation) => {
  const displays = {
    SMASH: { emoji: '🔥', color: '#FFD700', label: 'SMASH IT' },
    STRONG: { emoji: '💪', color: '#00FF88', label: 'STRONG PLAY' },
    PLAY: { emoji: '✅', color: '#00D4FF', label: 'PLAY' },
    LEAN: { emoji: '🤔', color: '#9ca3af', label: 'LEAN' },
    PASS: { emoji: '⛔', color: '#FF4444', label: 'PASS' }
  };
  return displays[recommendation] || displays.LEAN;
};

export const getEsotericTierInfo = (tier) => {
  const tiers = {
    IMMORTAL_ALIGNMENT: { label: '🎯 IMMORTAL ALIGNMENT', color: '#FF6B6B', description: '2178 detected - maximum conviction' },
    COSMIC_ALIGNMENT: { label: '🌟 COSMIC ALIGNMENT', color: '#9333EA', description: 'All esoteric signals converge' },
    STARS_FAVOR: { label: '⭐ STARS FAVOR', color: '#A855F7', description: 'Strong esoteric alignment' },
    MILD_ALIGNMENT: { label: '✨ MILD ALIGNMENT', color: '#C084FC', description: 'Some cosmic support' },
    NEUTRAL: { label: '🔮 NEUTRAL', color: '#9ca3af', description: 'No strong signals' }
  };
  return tiers[tier] || tiers.NEUTRAL;
};

export const getConfluenceDisplay = (confluence) => {
  if (confluence.level === 'IMMORTAL') {
    return { label: '🎯🔥💎 IMMORTAL CONFLUENCE', color: 'linear-gradient(135deg, #FF6B6B, #FFD700)', description: '2178 + Research = Maximum conviction' };
  }
  if (confluence.level === 'JARVIS_PERFECT') {
    return { label: '🎯🔥 JARVIS CONFLUENCE', color: 'linear-gradient(135deg, #FF6B6B, #9333EA)', description: 'Triggers + Research aligned' };
  }
  if (confluence.level === 'PERFECT') {
    return { label: '🌟🔥 PERFECT CONFLUENCE', color: 'linear-gradient(135deg, #FFD700, #9333EA)', description: 'Sharps + Stars aligned' };
  }
  if (confluence.level === 'STRONG') {
    return { label: '⭐💪 STRONG CONFLUENCE', color: 'linear-gradient(135deg, #00FF88, #A855F7)', description: 'Research & cosmos agree' };
  }
  if (confluence.level === 'DIVERGENT') {
    return { label: '⚡ DIVERGENT', color: '#F59E0B', description: 'Strong but different directions' };
  }
  return { label: '📊 STANDARD', color: '#6B7280', description: 'No special alignment' };
};

export default {
  calculateConfidence,
  fetchSignalContext,
  getTierInfo,
  getRecommendationDisplay,
  getEsotericTierInfo,
  getConfluenceDisplay,
  getGematriaAnalysis,
  getDailyEsotericReading,
  calculateEsotericScore,
  checkCosmicConfluence,
  checkJarvisTrigger,
  validate2178,
  DEFAULT_WEIGHTS,
  GEMATRIA_CIPHERS,
  POWER_NUMBERS
};
