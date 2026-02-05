import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlitchSignalsPanel from '../components/GlitchSignalsPanel';

describe('GlitchSignalsPanel', () => {
  it('renders null when no glitch_signals', () => {
    const { container } = render(<GlitchSignalsPanel pick={{}} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows ACTIVE for void_moon when is_void is true', () => {
    const pick = {
      glitch_signals: {
        void_moon: { is_void: true, confidence: 0.85, void_end: '18:00 UTC' },
      },
    };
    render(<GlitchSignalsPanel pick={pick} />);
    expect(screen.getByText('GLITCH Protocol')).toBeDefined();
    expect(screen.getByText('ACTIVE')).toBeDefined();
  });

  it('shows CLEAR for void_moon when is_void is false', () => {
    const pick = {
      glitch_signals: {
        void_moon: { is_void: false, confidence: 0.5 },
      },
    };
    render(<GlitchSignalsPanel pick={pick} />);
    expect(screen.getByText('CLEAR')).toBeDefined();
  });

  it('displays kp_index value when present', () => {
    const pick = {
      glitch_signals: {
        kp_index: { kp_value: 3.5, storm_level: 'QUIET' },
      },
    };
    render(<GlitchSignalsPanel pick={pick} />);
    expect(screen.getByText(/3\.5/)).toBeDefined();
    expect(screen.getByText(/QUIET/)).toBeDefined();
  });
});
