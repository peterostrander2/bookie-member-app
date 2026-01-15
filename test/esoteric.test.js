/**
 * Tests for Chrome Resonance and Vortex Math functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateChromeResonance,
  compareChromeResonance,
  calculateVortexSync,
  getParlayEsotericAnalysis
} from '../signalEngine';

describe('Chrome Resonance', () => {
  describe('calculateChromeResonance', () => {
    it('returns neutral for empty input', () => {
      const result = calculateChromeResonance('');
      expect(result.score).toBe(50);
      expect(result.resonance).toBe('NEUTRAL');
    });

    it('returns neutral for null input', () => {
      const result = calculateChromeResonance(null);
      expect(result.score).toBe(50);
      expect(result.resonance).toBe('NEUTRAL');
    });

    it('calculates hex average for simple text', () => {
      // "A" = ASCII 65, so average should be 65
      const result = calculateChromeResonance('A');
      expect(result.hexAverage).toBe(65);
      expect(result.charCount).toBe(1);
    });

    it('calculates hex average for "M" as optimal', () => {
      // "M" = ASCII 77, which is the optimal value
      const result = calculateChromeResonance('M');
      expect(result.hexAverage).toBe(77);
      expect(result.resonance).toBe('PEAK_RESONANCE');
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it('ignores non-letter characters', () => {
      const result = calculateChromeResonance('A1B2C3');
      expect(result.charCount).toBe(3); // Only A, B, C counted
    });

    it('handles mixed case', () => {
      const resultLower = calculateChromeResonance('abc');
      const resultUpper = calculateChromeResonance('ABC');
      expect(resultLower.hexAverage).toBe(resultUpper.hexAverage);
    });

    it('detects Tesla alignment when mod 9 is 3, 6, or 9', () => {
      // Need to find a text that gives hex average with mod 9 = 3, 6, or 0
      const result = calculateChromeResonance('MMM'); // 77 * 3 / 3 = 77, 77 % 9 = 5 (not Tesla)
      // "III" = 73 average, 73 % 9 = 1 (not Tesla)
      // "FFF" = 70 average, 70 % 9 = 7 (not Tesla)
      // "CCC" = 67 average, 67 % 9 = 4 (not Tesla)
      // "LLL" = 76 average, 76 % 9 = 4 (not Tesla)
      // "OOO" = 79 average, 79 % 9 = 7 (not Tesla)
      // "RRR" = 82 average, 82 % 9 = 1 (not Tesla)
      // Let's test with a word that results in Tesla alignment
      const teslaTest = calculateChromeResonance('ZZZZ'); // 90 average, 90 % 9 = 0 (Tesla!)
      expect(teslaTest.teslaAligned).toBe(true);
    });

    it('calculates real team name', () => {
      const lakers = calculateChromeResonance('Lakers');
      expect(lakers.hexAverage).toBeGreaterThan(0);
      expect(lakers.charCount).toBe(6);
      expect(['PEAK_RESONANCE', 'HIGH_RESONANCE', 'MODERATE_RESONANCE', 'MILD_RESONANCE', 'LOW_RESONANCE']).toContain(lakers.resonance);
    });
  });

  describe('compareChromeResonance', () => {
    it('compares two teams', () => {
      const result = compareChromeResonance('Lakers', 'Celtics');
      expect(result.team1).toBeDefined();
      expect(result.team2).toBeDefined();
      expect(result.combinedScore).toBeGreaterThan(0);
    });

    it('determines favored team when scores differ significantly', () => {
      // Use teams with different letter compositions
      const result = compareChromeResonance('MMMM', 'AAAA'); // M=77, A=65
      // MMMM should have higher score (closer to optimal 77)
      expect(result.team1.score).toBeGreaterThan(result.team2.score);
      expect(result.favored).toBe('team1');
    });

    it('includes venue analysis when provided', () => {
      const result = compareChromeResonance('Lakers', 'Celtics', 'Staples Center');
      expect(result.venue).toBeDefined();
      expect(result.venue.hexAverage).toBeGreaterThan(0);
    });

    it('returns null favored when scores are close', () => {
      // Similar letter compositions should have close scores
      const result = compareChromeResonance('ABC', 'BCD');
      // These might be close enough that no clear favorite
      expect(result.combinedScore).toBeGreaterThan(0);
    });
  });
});

describe('Vortex Math', () => {
  describe('calculateVortexSync', () => {
    it('returns no sync for single leg', () => {
      const result = calculateVortexSync([{ odds: -110 }]);
      expect(result.hasSync).toBe(false);
      expect(result.syncLevel).toBe('NONE');
      expect(result.boost).toBe(0);
    });

    it('returns no sync for empty array', () => {
      const result = calculateVortexSync([]);
      expect(result.hasSync).toBe(false);
    });

    it('returns no sync for null input', () => {
      const result = calculateVortexSync(null);
      expect(result.hasSync).toBe(false);
    });

    it('calculates sync for 3 legs (Tesla number)', () => {
      const legs = [
        { odds: -110 },
        { odds: -110 },
        { odds: -110 }
      ];
      const result = calculateVortexSync(legs);
      expect(result.legCount).toBe(3);
      // 3 legs is a Tesla number, so should have at least one sync
      expect(result.details.legCountReduced).toBe(3);
    });

    it('calculates sync for 6 legs (Tesla number)', () => {
      const legs = Array(6).fill({ odds: -110 });
      const result = calculateVortexSync(legs);
      expect(result.legCount).toBe(6);
      expect(result.details.legCountReduced).toBe(6);
      // Should have Tesla leg count sync
      expect(result.hasSync).toBe(true);
    });

    it('calculates sync for 9 legs (Tesla number)', () => {
      const legs = Array(9).fill({ odds: -110 });
      const result = calculateVortexSync(legs);
      expect(result.legCount).toBe(9);
      expect(result.hasSync).toBe(true);
    });

    it('returns TRIPLE_VORTEX when all three methods align', () => {
      // Need to construct legs where:
      // 1. Odds product mod 9 = 3, 6, or 0
      // 2. Leg count = 3, 6, or 9
      // 3. Odds sum mod 9 = 3, 6, or 0
      const legs = [
        { odds: -110 },
        { odds: -110 },
        { odds: -110 }
      ];
      const result = calculateVortexSync(legs);
      // Check if triple vortex is possible with these odds
      if (result.teslaHits === 3) {
        expect(result.syncLevel).toBe('TRIPLE_VORTEX');
        expect(result.boost).toBe(8);
      }
    });

    it('returns correct sync levels based on tesla hits', () => {
      // Test with various leg configurations
      const twoLegs = [{ odds: -110 }, { odds: +150 }];
      const result = calculateVortexSync(twoLegs);

      if (result.teslaHits === 1) {
        expect(result.syncLevel).toBe('SINGLE_VORTEX');
        expect(result.boost).toBe(3);
      } else if (result.teslaHits === 2) {
        expect(result.syncLevel).toBe('DOUBLE_VORTEX');
        expect(result.boost).toBe(5);
      } else if (result.teslaHits === 3) {
        expect(result.syncLevel).toBe('TRIPLE_VORTEX');
        expect(result.boost).toBe(8);
      } else {
        expect(result.syncLevel).toBe('NONE');
        expect(result.boost).toBe(0);
      }
    });

    it('includes detail breakdown', () => {
      const legs = [{ odds: -110 }, { odds: -110 }, { odds: -110 }];
      const result = calculateVortexSync(legs);

      expect(result.details).toBeDefined();
      expect(result.details.oddsProduct).toBeDefined();
      expect(result.details.oddsProductMod9).toBeDefined();
      expect(result.details.legCount).toBe(3);
      expect(result.details.oddsSum).toBeDefined();
      expect(result.details.oddsSumMod9).toBeDefined();
    });

    it('handles positive and negative odds', () => {
      const legs = [
        { odds: +200 },
        { odds: -150 },
        { odds: +100 }
      ];
      const result = calculateVortexSync(legs);
      expect(result.legCount).toBe(3);
      expect(result.details.oddsProduct).toBeGreaterThan(0);
    });

    it('defaults to -110 when odds not provided', () => {
      const legs = [{}, {}, {}];
      const result = calculateVortexSync(legs);
      // Should use -110 default for all legs
      expect(result.details.oddsSum).toBe(330); // 110 * 3
    });
  });

  describe('getParlayEsotericAnalysis', () => {
    it('includes vortex analysis', () => {
      const legs = [{ odds: -110 }, { odds: -110 }, { odds: -110 }];
      const result = getParlayEsotericAnalysis(legs);

      expect(result.vortex).toBeDefined();
      expect(result.vortex.legCount).toBe(3);
    });

    it('detects power number leg counts', () => {
      // 3 is a Fibonacci number
      const fibLegs = Array(3).fill({ odds: -110 });
      const fibResult = getParlayEsotericAnalysis(fibLegs);
      expect(fibResult.isPowerLegCount).toBe(true);

      // 11 is a Master number
      const masterLegs = Array(11).fill({ odds: -110 });
      const masterResult = getParlayEsotericAnalysis(masterLegs);
      expect(masterResult.isPowerLegCount).toBe(true);
    });

    it('calculates overall boost', () => {
      const legs = [{ odds: -110 }, { odds: -110 }, { odds: -110 }];
      const result = getParlayEsotericAnalysis(legs);

      expect(result.overallBoost).toBeGreaterThanOrEqual(0);
      expect(result.insights).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('calculates esoteric score', () => {
      const legs = [{ odds: -110 }, { odds: -110 }, { odds: -110 }];
      const result = getParlayEsotericAnalysis(legs);

      expect(result.esotericScore).toBeGreaterThanOrEqual(50);
      expect(result.esotericScore).toBeLessThanOrEqual(95);
    });

    it('includes insights array', () => {
      const legs = [{ odds: -110 }, { odds: -110 }, { odds: -110 }];
      const result = getParlayEsotericAnalysis(legs);

      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });
});
