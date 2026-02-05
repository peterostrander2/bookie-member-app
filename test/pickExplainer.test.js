import { describe, it, expect, vi } from 'vitest';

// Mock signalEngine before importing pickExplainer
vi.mock('../signalEngine', () => ({
  getTierInfo: () => ({
    label: '🏆 TEST TIER',
    color: '#FFD700',
    winRate: '60%',
    roi: '+10%',
    description: 'Test tier',
  }),
}));

import { explainPick, quickExplain } from '../pickExplainer';

// ============================================================================
// EXPLAIN PICK
// ============================================================================

describe('explainPick', () => {
  const mockGame = {
    home_team: 'Lakers',
    away_team: 'Celtics',
    spread: -3.5,
    total: 220,
  };

  const makeAnalysis = (overrides = {}) => ({
    confidence: 85,
    tier: 'GOLDEN_CONVERGENCE',
    recommendation: 'SMASH',
    signals: [
      { name: 'sharp_money', score: 80 },
      { name: 'line_value', score: 75 },
      { name: 'key_spread', score: 60 },
      { name: 'moon_phase', score: 45 },
    ],
    ...overrides,
  });

  it('returns object with all expected fields', () => {
    const result = explainPick(mockGame, makeAnalysis(), 'NBA');
    expect(result).toHaveProperty('headline');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('bullets');
    expect(result).toHaveProperty('confidenceBreakdown');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('tierInfo');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('recommendation');
  });

  it('generates SMASH headline for SMASH recommendation', () => {
    const result = explainPick(mockGame, makeAnalysis({ recommendation: 'SMASH' }), 'NBA');
    // SMASH headlines all start with fire emoji
    expect(result.headline).toMatch(/^🔥/);
  });

  it('generates PASS headline for PASS recommendation', () => {
    const result = explainPick(mockGame, makeAnalysis({
      recommendation: 'PASS',
      confidence: 40,
    }), 'NBA');
    // PASS headlines all start with stop emoji
    expect(result.headline).toMatch(/^⛔/);
  });

  it('filters bullets to signals with score >= 55', () => {
    const result = explainPick(mockGame, makeAnalysis(), 'NBA');
    // moon_phase has score 45, should be filtered out
    const bulletScores = result.bullets.map(b => b.score);
    bulletScores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(55);
    });
  });

  it('generates confidence breakdown with data/ml/esoteric categories', () => {
    const result = explainPick(mockGame, makeAnalysis(), 'NBA');
    expect(result.confidenceBreakdown).toHaveProperty('data');
    expect(result.confidenceBreakdown).toHaveProperty('ml');
    expect(result.confidenceBreakdown).toHaveProperty('esoteric');
  });

  it('generates risk factors', () => {
    const result = explainPick(mockGame, makeAnalysis({
      confidence: 57,
      signals: [
        { name: 'sharp_money', score: 30 },
        { name: 'line_value', score: 40 },
        { name: 'key_spread', score: 35 },
      ],
    }), 'NBA');
    expect(result.risks.length).toBeGreaterThan(0);
  });

  it('includes risk for large NFL spread', () => {
    const nflGame = { ...mockGame, spread: -14 };
    const result = explainPick(nflGame, makeAnalysis(), 'NFL');
    const largeSpreadRisk = result.risks.find(r => r.text.includes('blowout'));
    expect(largeSpreadRisk).toBeDefined();
  });
});

// ============================================================================
// QUICK EXPLAIN
// ============================================================================

describe('quickExplain', () => {
  it('returns top signal name with score', () => {
    const analysis = {
      signals: [
        { name: 'sharp_money', score: 80 },
        { name: 'line_value', score: 70 },
      ],
    };
    const result = quickExplain(analysis);
    expect(result).toContain('Sharp money backing');
    expect(result).toContain('80%');
  });

  it('returns fallback for no signals', () => {
    const analysis = { signals: [] };
    const result = quickExplain(analysis);
    expect(result).toBe('No clear edge detected');
  });

  it('maps known signal names to readable labels', () => {
    const analysis = {
      signals: [{ name: 'ensemble', score: 75 }],
    };
    const result = quickExplain(analysis);
    expect(result).toContain('ML models aligned');
  });
});
