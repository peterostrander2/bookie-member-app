import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BoostBreakdownPanel from '../components/BoostBreakdownPanel';

describe('BoostBreakdownPanel', () => {
  it('renders null when pick is null', () => {
    const { container } = render(<BoostBreakdownPanel pick={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null when no boost data present', () => {
    const pick = { final_score: 7.5 };
    const { container } = render(<BoostBreakdownPanel pick={pick} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders all boost fields when data present', () => {
    const pick = {
      base_4_score: 6.5,
      context_modifier: 0.15,
      confluence_boost: 1.5,
      msrf_boost: 0.25,
      jason_sim_boost: -0.5,
      serp_boost: 0.3,
      ensemble_adjustment: 0.1,
      live_adjustment: 0,
      final_score: 8.3,
    };
    render(<BoostBreakdownPanel pick={pick} />);
    expect(screen.getByText('Score Breakdown')).toBeDefined();
    expect(screen.getByText('Base (4-engine):')).toBeDefined();
    expect(screen.getByText('Context Modifier:')).toBeDefined();
    expect(screen.getByText('Confluence:')).toBeDefined();
    expect(screen.getByText('MSRF:')).toBeDefined();
    expect(screen.getByText('Jason Sim:')).toBeDefined();
    expect(screen.getByText('SERP Intel:')).toBeDefined();
    expect(screen.getByText('Ensemble ML:')).toBeDefined();
    expect(screen.getByText('FINAL:')).toBeDefined();
  });

  it('shows negative jason_sim_boost value with proper formatting', () => {
    const pick = {
      base_4_score: 6.5,
      jason_sim_boost: -1.2,
      final_score: 5.3,
    };
    render(<BoostBreakdownPanel pick={pick} />);
    expect(screen.getByText('-1.20')).toBeDefined();
  });
});
