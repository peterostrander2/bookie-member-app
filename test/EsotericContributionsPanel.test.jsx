import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EsotericContributionsPanel from '../components/EsotericContributionsPanel';

describe('EsotericContributionsPanel', () => {
  it('renders null when no esoteric_contributions', () => {
    const { container } = render(<EsotericContributionsPanel pick={{}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null when all contributions are zero', () => {
    const pick = {
      esoteric_contributions: {
        numerology: 0,
        astro: 0,
        fib_alignment: 0,
        vortex: 0,
        daily_edge: 0,
        glitch: 0,
        biorhythm: 0,
        gann: 0,
        founders_echo: 0,
        phase8: 0,
        harmonic: 0,
        msrf: 0,
      },
    };
    const { container } = render(<EsotericContributionsPanel pick={pick} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders categories with non-zero values', () => {
    const pick = {
      esoteric_contributions: {
        numerology: 0.35,
        astro: 0.2,
        fib_alignment: 0.15,
        vortex: 0,
        daily_edge: 0.1,
        glitch: 0,
        biorhythm: 0,
        gann: 0,
        founders_echo: 0,
        phase8: 0.25,
        harmonic: 0.3,
        msrf: 0,
      },
    };
    render(<EsotericContributionsPanel pick={pick} />);
    expect(screen.getByText('Esoteric Contributions')).toBeDefined();
    expect(screen.getByText('Life Path:')).toBeDefined();
    expect(screen.getByText('+0.35')).toBeDefined();
  });

  it('shows positive values in green and negative in red formatting', () => {
    const pick = {
      esoteric_contributions: {
        numerology: 0.5,
        astro: -0.3,
        fib_alignment: 0,
        vortex: 0,
        daily_edge: 0,
        glitch: 0,
        biorhythm: 0,
        gann: 0,
        founders_echo: 0,
        phase8: 0,
        harmonic: 0,
        msrf: 0,
      },
    };
    render(<EsotericContributionsPanel pick={pick} />);
    expect(screen.getByText('+0.50')).toBeDefined();
    expect(screen.getByText('-0.30')).toBeDefined();
  });
});
