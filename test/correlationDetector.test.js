import { describe, it, expect } from 'vitest';
import {
  analyzeCorrelation,
  checkPickCorrelation,
  getAdjustedSizing,
} from '../correlationDetector';

// ============================================================================
// ANALYZE CORRELATION
// ============================================================================

describe('analyzeCorrelation', () => {
  it('returns no correlation for empty picks', () => {
    const result = analyzeCorrelation([]);
    expect(result.hasCorrelation).toBe(false);
    expect(result.correlationScore).toBe(0);
    expect(result.diversificationScore).toBe(100);
  });

  it('returns no correlation for single pick', () => {
    const result = analyzeCorrelation([{ home_team: 'Lakers', away_team: 'Celtics' }]);
    expect(result.hasCorrelation).toBe(false);
  });

  it('detects same-game correlation', () => {
    const picks = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'total', side: 'OVER' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.hasCorrelation).toBe(true);
    expect(result.warnings.some(w => w.type === 'same_game')).toBe(true);
  });

  it('detects same-team correlation', () => {
    const picks = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
      { home_team: 'Lakers', away_team: 'Warriors', bet_type: 'spread', side: 'HOME' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.hasCorrelation).toBe(true);
    expect(result.warnings.some(w => w.type === 'same_team')).toBe(true);
  });

  it('detects directional bias for all favorites', () => {
    const picks = [
      { bet_type: 'spread', side: 'HOME', line: -3, home_team: 'A', away_team: 'B' },
      { bet_type: 'spread', side: 'HOME', line: -5, home_team: 'C', away_team: 'D' },
      { bet_type: 'spread', side: 'HOME', line: -7, home_team: 'E', away_team: 'F' },
      { bet_type: 'spread', side: 'HOME', line: -2, home_team: 'G', away_team: 'H' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.warnings.some(w => w.type === 'directional')).toBe(true);
  });

  it('detects spread clustering with big spreads', () => {
    const picks = [
      { bet_type: 'spread', line: -8, home_team: 'A', away_team: 'B' },
      { bet_type: 'spread', line: 9, home_team: 'C', away_team: 'D' },
      { bet_type: 'spread', line: -10, home_team: 'E', away_team: 'F' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.warnings.some(w => w.type === 'spread_cluster')).toBe(true);
  });

  it('detects total clustering when variance is low', () => {
    const picks = [
      { bet_type: 'total', line: 220, home_team: 'A', away_team: 'B' },
      { bet_type: 'total', line: 221, home_team: 'C', away_team: 'D' },
      { bet_type: 'total', line: 219, home_team: 'E', away_team: 'F' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.warnings.some(w => w.type === 'total_cluster')).toBe(true);
  });

  it('calculates diversification score inversely to correlation', () => {
    const picks = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'total', side: 'OVER' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.diversificationScore).toBeLessThan(100);
  });

  it('generates recommendation for well-diversified portfolio', () => {
    const picks = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
      { home_team: 'Warriors', away_team: 'Bulls', bet_type: 'total', side: 'OVER' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.recommendation).toBeDefined();
    expect(result.recommendation.status).toBeDefined();
  });

  it('provides recommendation for correlated portfolio', () => {
    const picks = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'total', side: 'OVER' },
    ];
    const result = analyzeCorrelation(picks);
    expect(result.recommendation).toBeDefined();
  });

  it('handles null picks gracefully', () => {
    const result = analyzeCorrelation(null);
    expect(result.hasCorrelation).toBe(false);
  });
});

// ============================================================================
// CHECK PICK CORRELATION
// ============================================================================

describe('checkPickCorrelation', () => {
  it('returns no issues for unrelated picks', () => {
    const newPick = { home_team: 'Warriors', away_team: 'Suns' };
    const existing = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
    ];
    const result = checkPickCorrelation(newPick, existing);
    expect(result.hasIssues).toBe(false);
    expect(result.canProceed).toBe(true);
  });

  it('flags same-game as high severity', () => {
    const newPick = { home_team: 'Lakers', away_team: 'Celtics' };
    const existing = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
    ];
    const result = checkPickCorrelation(newPick, existing);
    expect(result.hasIssues).toBe(true);
    expect(result.issues[0].severity).toBe('high');
  });

  it('sets canProceed to false for high severity issues', () => {
    const newPick = { home_team: 'Lakers', away_team: 'Celtics' };
    const existing = [
      { home_team: 'Lakers', away_team: 'Celtics', bet_type: 'spread', side: 'HOME' },
    ];
    const result = checkPickCorrelation(newPick, existing);
    expect(result.canProceed).toBe(false);
  });
});

// ============================================================================
// ADJUSTED SIZING
// ============================================================================

describe('getAdjustedSizing', () => {
  it('returns multiplier 1 for high diversification (>= 80)', () => {
    const result = getAdjustedSizing(100, { diversificationScore: 90 });
    expect(result.multiplier).toBe(1);
    expect(result.adjustedSize).toBe(100);
  });

  it('reduces sizing for low diversification (< 40)', () => {
    const result = getAdjustedSizing(100, { diversificationScore: 30 });
    expect(result.multiplier).toBe(0.5);
    expect(result.adjustedSize).toBe(50);
  });
});
