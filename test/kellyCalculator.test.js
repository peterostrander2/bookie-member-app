import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  americanToDecimal,
  decimalToImpliedProbability,
  americanToImpliedProbability,
  calculateKelly,
  confidenceToWinProbability,
  calculateBetSize,
  getBankrollSettings,
  saveBankrollSettings,
  recordBet,
  gradeBet,
  calculateRiskOfRuin,
} from '../kellyCalculator';

// ============================================================================
// ODDS CONVERSION
// ============================================================================

describe('americanToDecimal', () => {
  it('converts positive American odds (+150)', () => {
    expect(americanToDecimal(150)).toBe(2.5);
  });

  it('converts negative American odds (-110)', () => {
    expect(americanToDecimal(-110)).toBeCloseTo(1.909, 2);
  });

  it('converts even money (+100)', () => {
    expect(americanToDecimal(100)).toBe(2.0);
  });

  it('converts heavy favorite (-200)', () => {
    expect(americanToDecimal(-200)).toBe(1.5);
  });

  it('converts long shot (+500)', () => {
    expect(americanToDecimal(500)).toBe(6.0);
  });

  it('converts heavy favorite (-500)', () => {
    expect(americanToDecimal(-500)).toBe(1.2);
  });
});

describe('decimalToImpliedProbability', () => {
  it('converts decimal 2.0 to 50%', () => {
    expect(decimalToImpliedProbability(2.0)).toBe(0.5);
  });

  it('returns 0.5 default for invalid zero', () => {
    expect(decimalToImpliedProbability(0)).toBe(0.5);
  });

  it('returns 0.5 default for null', () => {
    expect(decimalToImpliedProbability(null)).toBe(0.5);
  });
});

describe('americanToImpliedProbability', () => {
  it('converts +100 to 50%', () => {
    expect(americanToImpliedProbability(100)).toBe(0.5);
  });

  it('converts -110 to ~52.38%', () => {
    expect(americanToImpliedProbability(-110)).toBeCloseTo(0.5238, 3);
  });

  it('converts +200 to ~33.33%', () => {
    expect(americanToImpliedProbability(200)).toBeCloseTo(0.3333, 3);
  });
});

// ============================================================================
// KELLY CRITERION
// ============================================================================

describe('calculateKelly', () => {
  it('detects positive edge (60% win probability at -110)', () => {
    const result = calculateKelly(0.6, -110, 0.25);
    expect(result.hasEdge).toBe(true);
    expect(result.fullKellyPercent).toBeGreaterThan(0);
  });

  it('detects no edge (40% win probability at -110)', () => {
    const result = calculateKelly(0.4, -110, 0.25);
    expect(result.hasEdge).toBe(false);
  });

  it('returns correct kelly fraction field', () => {
    const result = calculateKelly(0.6, -110, 0.25);
    expect(result.kellyFraction).toBe(0.25);
  });

  it('returns INVALID for zero win probability', () => {
    const result = calculateKelly(0, -110);
    expect(result.recommendation).toBe('INVALID');
    expect(result.error).toBe('Invalid win probability');
  });

  it('returns INVALID for zero odds', () => {
    const result = calculateKelly(0.6, 0);
    expect(result.recommendation).toBe('INVALID');
    expect(result.error).toBe('Invalid odds');
  });

  it('caps fullKellyPercent at 0 minimum', () => {
    const result = calculateKelly(0.3, -200, 0.25);
    expect(result.fullKellyPercent).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// CONFIDENCE MAPPING
// ============================================================================

describe('confidenceToWinProbability', () => {
  it('maps confidence 50 to 0.48', () => {
    expect(confidenceToWinProbability(50)).toBe(0.48);
  });

  it('maps confidence 95+ to 0.68', () => {
    expect(confidenceToWinProbability(95)).toBe(0.68);
    expect(confidenceToWinProbability(100)).toBe(0.68);
  });

  it('interpolates for mid-range confidence', () => {
    const prob = confidenceToWinProbability(72.5);
    expect(prob).toBeGreaterThan(0.48);
    expect(prob).toBeLessThan(0.68);
  });
});

// ============================================================================
// BET SIZE CALCULATION
// ============================================================================

describe('calculateBetSize', () => {
  const testSettings = {
    startingBankroll: 1000,
    currentBankroll: 1000,
    kellyFraction: 0.25,
    maxBetPercent: 5,
    minBetPercent: 0.5,
    unitSize: 50,
    stopLossPercent: 25,
  };

  it('returns bet amount based on bankroll', () => {
    const result = calculateBetSize(85, -110, testSettings);
    expect(result.bankroll).toBe(1000);
    expect(result.betAmount).toBeGreaterThanOrEqual(0);
  });

  it('caps at maxBetPercent', () => {
    const result = calculateBetSize(95, +500, testSettings);
    expect(result.betPercent).toBeLessThanOrEqual(testSettings.maxBetPercent);
  });

  it('floors at minBetPercent when edge exists', () => {
    const result = calculateBetSize(70, -110, testSettings);
    if (result.hasEdge) {
      expect(result.betPercent).toBeGreaterThanOrEqual(testSettings.minBetPercent);
    }
  });

  it('returns zero when no edge', () => {
    const result = calculateBetSize(30, -300, testSettings);
    expect(result.betPercent).toBe(0);
  });
});

// ============================================================================
// BANKROLL SETTINGS
// ============================================================================

describe('getBankrollSettings', () => {
  it('returns defaults when no stored settings', () => {
    localStorage.getItem.mockReturnValue(null);
    const settings = getBankrollSettings();
    expect(settings.startingBankroll).toBe(1000);
    expect(settings.kellyFraction).toBe(0.25);
    expect(settings.maxBetPercent).toBe(5);
  });

  it('returns stored settings when available', () => {
    const stored = { startingBankroll: 2000, currentBankroll: 2000, kellyFraction: 0.5, maxBetPercent: 10, minBetPercent: 1, unitSize: 100, stopLossPercent: 30 };
    localStorage.getItem.mockReturnValue(JSON.stringify(stored));
    const settings = getBankrollSettings();
    expect(settings.startingBankroll).toBe(2000);
    expect(settings.kellyFraction).toBe(0.5);
  });
});

describe('saveBankrollSettings', () => {
  it('saves and returns settings with updated timestamp', () => {
    const settings = { startingBankroll: 1000, currentBankroll: 900 };
    const result = saveBankrollSettings(settings);
    expect(result.lastUpdated).toBeDefined();
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});

// ============================================================================
// BET TRACKING
// ============================================================================

describe('recordBet', () => {
  it('creates a bet with id and timestamp', () => {
    localStorage.getItem.mockReturnValue(null);
    const bet = recordBet({ sport: 'NBA', odds: -110, betAmount: 50 });
    expect(bet.id).toMatch(/^bet_/);
    expect(bet.timestamp).toBeDefined();
    expect(bet.result).toBeNull();
  });

  it('stores bet in localStorage', () => {
    localStorage.getItem.mockReturnValue(null);
    recordBet({ sport: 'NBA', odds: -110, betAmount: 50 });
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});

describe('gradeBet', () => {
  const createStoredBet = (odds = -110, betAmount = 100) => {
    const bet = {
      id: 'bet_test_123',
      timestamp: Date.now(),
      sport: 'NBA',
      odds,
      betAmount,
      result: null,
      pnl: null,
    };
    return bet;
  };

  it('grades a WIN with positive P/L', () => {
    const bet = createStoredBet(-110, 100);
    localStorage.getItem
      .mockReturnValueOnce(JSON.stringify([bet]))  // BET_HISTORY
      .mockReturnValueOnce(null);                    // BANKROLL

    const result = gradeBet('bet_test_123', 'WIN');
    expect(result.result).toBe('WIN');
    expect(result.pnl).toBeGreaterThan(0);
  });

  it('grades a LOSS with negative P/L', () => {
    const bet = createStoredBet(-110, 100);
    localStorage.getItem
      .mockReturnValueOnce(JSON.stringify([bet]))
      .mockReturnValueOnce(null);

    const result = gradeBet('bet_test_123', 'LOSS');
    expect(result.result).toBe('LOSS');
    expect(result.pnl).toBe(-100);
  });

  it('returns null for nonexistent bet', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const result = gradeBet('nonexistent', 'WIN');
    expect(result).toBeNull();
  });
});

// ============================================================================
// RISK ANALYSIS
// ============================================================================

describe('calculateRiskOfRuin', () => {
  it('returns 100% ruin when no edge', () => {
    const result = calculateRiskOfRuin(45, -110);
    expect(result.riskOfRuin).toBe(100);
    expect(result.message).toContain('No edge');
  });
});
