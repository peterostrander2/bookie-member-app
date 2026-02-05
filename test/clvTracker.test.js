import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllPicks,
  recordPick,
  recordClosingLine,
  gradePick,
  getRecentPicks,
  getPendingClosingLines,
  getPendingGrades,
  getStats,
  clearAllData,
} from '../clvTracker';

// ============================================================================
// PICK CRUD
// ============================================================================

describe('getAllPicks', () => {
  it('returns empty array when no picks stored', () => {
    localStorage.getItem.mockReturnValue(null);
    expect(getAllPicks()).toEqual([]);
  });

  it('returns stored picks', () => {
    const picks = [{ id: 'pick_1', sport: 'NBA' }];
    localStorage.getItem.mockReturnValue(JSON.stringify(picks));
    expect(getAllPicks()).toEqual(picks);
  });

  it('returns empty array on parse error', () => {
    localStorage.getItem.mockReturnValue('invalid json{');
    expect(getAllPicks()).toEqual([]);
  });
});

describe('recordPick', () => {
  it('creates a pick with generated id', () => {
    localStorage.getItem.mockReturnValue(null);
    const pick = recordPick({
      sport: 'NBA',
      home_team: 'Lakers',
      away_team: 'Celtics',
      commence_time: '2026-02-05T00:00:00Z',
      bet_type: 'spread',
      side: 'HOME',
      line: -3.5,
      odds: -110,
      book: 'DraftKings',
      confidence: 85,
      tier: 'GOLD_STAR',
    });

    expect(pick.id).toMatch(/^pick_/);
    expect(pick.timestamp).toBeDefined();
    expect(pick.sport).toBe('NBA');
    expect(pick.opening_line).toBe(-3.5);
    expect(pick.closing_line).toBeNull();
    expect(pick.result).toBeNull();
  });

  it('saves pick to localStorage', () => {
    localStorage.getItem.mockReturnValue(null);
    recordPick({
      sport: 'NBA',
      home_team: 'Lakers',
      away_team: 'Celtics',
      commence_time: '2026-02-05T00:00:00Z',
      bet_type: 'spread',
      side: 'HOME',
      line: -3.5,
      odds: -110,
    });
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});

describe('getRecentPicks', () => {
  it('returns picks sorted by timestamp descending', () => {
    const picks = [
      { id: 'pick_1', timestamp: 100 },
      { id: 'pick_3', timestamp: 300 },
      { id: 'pick_2', timestamp: 200 },
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(picks));
    const recent = getRecentPicks(10);
    expect(recent[0].id).toBe('pick_3');
    expect(recent[1].id).toBe('pick_2');
    expect(recent[2].id).toBe('pick_1');
  });

  it('respects limit parameter', () => {
    const picks = [
      { id: 'pick_1', timestamp: 100 },
      { id: 'pick_2', timestamp: 200 },
      { id: 'pick_3', timestamp: 300 },
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(picks));
    const recent = getRecentPicks(2);
    expect(recent.length).toBe(2);
  });
});

// ============================================================================
// CLOSING LINE
// ============================================================================

describe('recordClosingLine', () => {
  const basePick = {
    id: 'pick_test_1',
    sport: 'NBA',
    bet_type: 'spread',
    side: 'HOME',
    opening_line: -3.5,
    opening_odds: -110,
    closing_line: null,
    closing_odds: null,
    clv: null,
    clv_cents: null,
    result: null,
  };

  it('records closing line and calculates spread CLV', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([{ ...basePick }]));
    const result = recordClosingLine('pick_test_1', -4.5, -110);
    expect(result).not.toBeNull();
    expect(result.closing_line).toBe(-4.5);
    expect(result.clv).toBeDefined();
  });

  it('calculates positive CLV when line moves in your favor (HOME spread)', () => {
    // Took HOME -3.5, closed at -4.5 → got better number
    localStorage.getItem.mockReturnValue(JSON.stringify([{ ...basePick }]));
    const result = recordClosingLine('pick_test_1', -4.5, -110);
    expect(result.clv).toBe(-4.5 - (-3.5));  // -1 (closing - opening for HOME)
  });

  it('calculates negative CLV when line moves against (HOME spread)', () => {
    // Took HOME -3.5, closed at -2.5 → got worse number
    localStorage.getItem.mockReturnValue(JSON.stringify([{ ...basePick }]));
    const result = recordClosingLine('pick_test_1', -2.5, -110);
    expect(result.clv).toBe(-2.5 - (-3.5));  // 1 (line moved away)
  });

  it('calculates moneyline CLV in probability points', () => {
    const mlPick = {
      ...basePick,
      id: 'pick_ml_1',
      bet_type: 'moneyline',
      opening_odds: +150,
      closing_odds: null,
    };
    localStorage.getItem.mockReturnValue(JSON.stringify([mlPick]));
    const result = recordClosingLine('pick_ml_1', null, +130);
    expect(result.clv).toBeDefined();
  });

  it('returns null for nonexistent pick', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const result = recordClosingLine('nonexistent', -4.5, -110);
    expect(result).toBeNull();
  });
});

// ============================================================================
// GRADING
// ============================================================================

describe('gradePick', () => {
  it('sets result on pick', () => {
    const pick = { id: 'pick_1', result: null, clv: 1.5, clv_cents: 9 };
    localStorage.getItem
      .mockReturnValueOnce(JSON.stringify([pick]))  // first call for getAllPicks
      .mockReturnValueOnce(JSON.stringify([{ ...pick, result: 'WIN' }]))  // for updateStats->getAllPicks
      .mockReturnValueOnce(null);  // for stats storage

    const result = gradePick('pick_1', 'WIN');
    expect(result.result).toBe('WIN');
  });

  it('returns null for nonexistent pick', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const result = gradePick('nonexistent', 'WIN');
    expect(result).toBeNull();
  });
});

// ============================================================================
// PENDING QUERIES
// ============================================================================

describe('getPendingClosingLines', () => {
  it('returns picks where game started but no closing line', () => {
    const picks = [
      {
        id: 'pick_1',
        closing_line: null,
        game: { commence_time: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      },
      {
        id: 'pick_2',
        closing_line: -4.5,
        game: { commence_time: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      },
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(picks));
    const pending = getPendingClosingLines();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('pick_1');
  });
});

describe('getPendingGrades', () => {
  it('returns picks where game is over but not graded', () => {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const picks = [
      {
        id: 'pick_1',
        result: null,
        game: { commence_time: fourHoursAgo },
      },
      {
        id: 'pick_2',
        result: 'WIN',
        game: { commence_time: fourHoursAgo },
      },
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(picks));
    const pending = getPendingGrades();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('pick_1');
  });
});

// ============================================================================
// STATISTICS
// ============================================================================

describe('getStats', () => {
  it('returns stats with winRate', () => {
    const picks = [
      { id: '1', result: 'WIN', clv: 1, clv_cents: 6, tier: 'GOLD_STAR', sport: 'NBA' },
      { id: '2', result: 'WIN', clv: 0.5, clv_cents: 3, tier: 'GOLD_STAR', sport: 'NBA' },
      { id: '3', result: 'LOSS', clv: -0.5, clv_cents: -3, tier: 'EDGE_LEAN', sport: 'NFL' },
    ];
    localStorage.getItem
      .mockReturnValueOnce(null)  // STATS - not cached
      .mockReturnValueOnce(JSON.stringify(picks));  // PICKS for updateStats

    const stats = getStats();
    expect(stats.winRate).toBeCloseTo(66.7, 0);
  });

  it('calculates avgCLV across closed picks', () => {
    const picks = [
      { id: '1', result: 'WIN', clv: 2.0, clv_cents: 12, tier: 'GOLD_STAR', sport: 'NBA' },
      { id: '2', result: 'LOSS', clv: -1.0, clv_cents: -6, tier: 'GOLD_STAR', sport: 'NBA' },
    ];
    localStorage.getItem
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(JSON.stringify(picks));

    const stats = getStats();
    expect(stats.avgCLV).toBe(0.5);
  });

  it('calculates by-tier stats', () => {
    const picks = [
      { id: '1', result: 'WIN', clv: 1, clv_cents: 6, tier: 'GOLDEN_CONVERGENCE', sport: 'NBA' },
      { id: '2', result: 'WIN', clv: 0.5, clv_cents: 3, tier: 'GOLDEN_CONVERGENCE', sport: 'NBA' },
    ];
    localStorage.getItem
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(JSON.stringify(picks));

    const stats = getStats();
    expect(stats.byTier.GOLDEN_CONVERGENCE.total).toBe(2);
    expect(stats.byTier.GOLDEN_CONVERGENCE.winRate).toBe(100);
  });
});

describe('clearAllData', () => {
  it('removes all storage keys', () => {
    clearAllData();
    expect(localStorage.removeItem).toHaveBeenCalledTimes(3);
  });
});
