import { describe, it, expect } from 'vitest';
import {
  GEMATRIA_CIPHERS,
  checkJarvisTrigger,
  getDailyEsotericReading,
  calculateEsotericScore,
  checkCosmicConfluence,
} from '../signalEngine';

// ============================================================================
// GEMATRIA CIPHERS
// ============================================================================

describe('GEMATRIA_CIPHERS', () => {
  describe('ordinal', () => {
    it('calculates A=1, B=2, Z=26', () => {
      expect(GEMATRIA_CIPHERS.ordinal('A')).toBe(1);
      expect(GEMATRIA_CIPHERS.ordinal('Z')).toBe(26);
    });

    it('sums all letters ignoring non-alpha', () => {
      // ABC = 1 + 2 + 3 = 6
      expect(GEMATRIA_CIPHERS.ordinal('ABC')).toBe(6);
    });
  });

  describe('reverseOrdinal', () => {
    it('calculates A=26, Z=1', () => {
      expect(GEMATRIA_CIPHERS.reverseOrdinal('A')).toBe(26);
      expect(GEMATRIA_CIPHERS.reverseOrdinal('Z')).toBe(1);
    });
  });

  describe('reduction', () => {
    it('reduces multi-digit positions to single digit', () => {
      // K = position 11 → 1+1 = 2
      expect(GEMATRIA_CIPHERS.reduction('K')).toBe(2);
    });

    it('handles single-digit positions directly', () => {
      // A = position 1, already single digit
      expect(GEMATRIA_CIPHERS.reduction('A')).toBe(1);
    });
  });

  describe('jewish', () => {
    it('maps A=1, K=10, T=100', () => {
      expect(GEMATRIA_CIPHERS.jewish('A')).toBe(1);
      expect(GEMATRIA_CIPHERS.jewish('K')).toBe(10);
      expect(GEMATRIA_CIPHERS.jewish('T')).toBe(100);
    });
  });

  describe('sumerian', () => {
    it('multiplies position by 6', () => {
      // A = 1 * 6 = 6
      expect(GEMATRIA_CIPHERS.sumerian('A')).toBe(6);
      // B = 2 * 6 = 12
      expect(GEMATRIA_CIPHERS.sumerian('B')).toBe(12);
    });
  });

  it('all ciphers handle empty string', () => {
    expect(GEMATRIA_CIPHERS.ordinal('')).toBe(0);
    expect(GEMATRIA_CIPHERS.reverseOrdinal('')).toBe(0);
    expect(GEMATRIA_CIPHERS.reduction('')).toBe(0);
    expect(GEMATRIA_CIPHERS.jewish('')).toBe(0);
    expect(GEMATRIA_CIPHERS.sumerian('')).toBe(0);
  });
});

// ============================================================================
// JARVIS TRIGGERS
// ============================================================================

describe('checkJarvisTrigger', () => {
  it('detects 2178 as LEGENDARY tier', () => {
    const result = checkJarvisTrigger(2178);
    expect(result.triggered).toBe(true);
    expect(result.tier).toBe('LEGENDARY');
    expect(result.boost).toBe(20);
    expect(result.type).toBe('DIRECT_HIT');
  });

  it('detects 33 as HIGH tier', () => {
    const result = checkJarvisTrigger(33);
    expect(result.triggered).toBe(true);
    expect(result.tier).toBe('HIGH');
    expect(result.boost).toBe(10);
  });

  it('detects 8712 as IMMORTAL_REVERSE', () => {
    const result = checkJarvisTrigger(8712);
    expect(result.triggered).toBe(true);
    expect(result.type).toBe('IMMORTAL_REVERSE');
    expect(result.boost).toBe(15);
  });

  it('detects divisibility by 33 as MEDIUM tier', () => {
    const result = checkJarvisTrigger(66);  // 66 / 33 = 2
    expect(result.triggered).toBe(true);
    expect(result.type).toBe('DIV_33');
    expect(result.tier).toBe('MEDIUM');
  });

  it('detects near-201 values as LOW tier', () => {
    const result = checkJarvisTrigger(199);  // within 5 of 201
    expect(result.triggered).toBe(true);
    expect(result.type).toBe('NEAR_201');
    expect(result.tier).toBe('LOW');
  });

  it('detects Tesla-aligned values (mod 9 = 3, 6, or 0)', () => {
    const result = checkJarvisTrigger(12);  // 12 % 9 = 3
    expect(result.triggered).toBe(true);
    expect(result.type).toBe('TESLA_ALIGNED');
    expect(result.boost).toBe(4);
  });

  it('returns not triggered for non-matching values', () => {
    const result = checkJarvisTrigger(7);  // 7 % 9 = 7, not 3/6/9
    expect(result.triggered).toBe(false);
    expect(result.boost).toBe(0);
  });
});

// ============================================================================
// DAILY ESOTERIC READING
// ============================================================================

describe('getDailyEsotericReading', () => {
  it('returns all expected fields', () => {
    const reading = getDailyEsotericReading(new Date(2026, 0, 15)); // Jan 15, 2026
    expect(reading.date).toBeDefined();
    expect(reading.lifePath).toBeDefined();
    expect(reading.moonPhase).toBeDefined();
    expect(reading.moonEmoji).toBeDefined();
    expect(reading.dayOfWeek).toBeDefined();
    expect(reading.planetaryRuler).toBeDefined();
    expect(reading.teslaNumber).toBeDefined();
    expect(reading.teslaAlignment).toBeDefined();
    expect(reading.luckyNumbers).toHaveLength(4);
    expect(reading.recommendation).toBeDefined();
  });

  it('assigns Saturday to Saturn with discipline energy', () => {
    // Feb 7, 2026 is a Saturday
    const saturday = new Date(2026, 1, 7);
    const reading = getDailyEsotericReading(saturday);
    expect(reading.dayOfWeek).toBe('Saturday');
    expect(reading.planetaryRuler).toBe('Saturn');
    expect(reading.dayEnergy).toBe('discipline');
  });

  it('assigns Thursday to Jupiter with expansion energy', () => {
    // Feb 5, 2026 is a Thursday
    const thursday = new Date(2026, 1, 5);
    const reading = getDailyEsotericReading(thursday);
    expect(reading.dayOfWeek).toBe('Thursday');
    expect(reading.planetaryRuler).toBe('Jupiter');
    expect(reading.dayEnergy).toBe('expansion');
  });

  it('calculates Tesla alignment as STRONG for 3, 6, 9', () => {
    // Find a date where (day * month) % 9 is 3, 6, or 9
    // March 1: (1 * 3) % 9 = 3 → STRONG
    const date = new Date(2026, 2, 1);
    const reading = getDailyEsotericReading(date);
    if ([3, 6, 9].includes(reading.teslaNumber)) {
      expect(reading.teslaAlignment).toBe('STRONG');
    } else {
      expect(reading.teslaAlignment).toBe('moderate');
    }
  });
});

// ============================================================================
// ESOTERIC SCORE CALCULATION
// ============================================================================

describe('calculateEsotericScore', () => {
  const mockGame = {
    home_team: 'Lakers',
    away_team: 'Celtics',
    spread: -3.5,
    total: 220,
  };

  it('returns score in 0-100 range', () => {
    const result = calculateEsotericScore(mockGame);
    expect(result.esotericScore).toBeGreaterThanOrEqual(0);
    expect(result.esotericScore).toBeLessThanOrEqual(100);
  });

  it('assigns an esoteric tier', () => {
    const result = calculateEsotericScore(mockGame);
    const validTiers = ['IMMORTAL_ALIGNMENT', 'COSMIC_ALIGNMENT', 'STARS_FAVOR', 'MILD_ALIGNMENT', 'NEUTRAL'];
    expect(validTiers).toContain(result.esotericTier);
  });
});

// ============================================================================
// COSMIC CONFLUENCE
// ============================================================================

describe('checkCosmicConfluence', () => {
  it('returns IMMORTAL level when legendary + high confidence + same direction', () => {
    const result = checkCosmicConfluence(80, 85, 'home', 'home', true, true);
    expect(result.hasConfluence).toBe(true);
    expect(result.level).toBe('IMMORTAL');
    expect(result.boost).toBe(10);
  });
});
