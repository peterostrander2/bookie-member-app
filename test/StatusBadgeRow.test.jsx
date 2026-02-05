import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadgeRow from '../components/StatusBadgeRow';

describe('StatusBadgeRow', () => {
  it('renders null when pick is null', () => {
    const { container } = render(<StatusBadgeRow pick={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null when no badges apply', () => {
    const pick = {
      msrf_boost: 0,
      serp_boost: 0,
      jason_sim_boost: 0,
      ensemble_adjustment: 0,
    };
    const { container } = render(<StatusBadgeRow pick={pick} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows TURN DATE badge when msrf_boost > 0', () => {
    const pick = { msrf_boost: 0.5 };
    render(<StatusBadgeRow pick={pick} />);
    expect(screen.getByText(/TURN DATE/)).toBeDefined();
    expect(screen.getByText(/\+0\.5/)).toBeDefined();
  });

  it('shows JASON BLOCK badge when jason_sim_boost < 0', () => {
    const pick = { jason_sim_boost: -1.2 };
    render(<StatusBadgeRow pick={pick} />);
    expect(screen.getByText('JASON BLOCK')).toBeDefined();
  });
});
