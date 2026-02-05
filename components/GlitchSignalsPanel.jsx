import React from 'react';

/**
 * GlitchSignalsPanel - Displays GLITCH protocol signals with progress bars
 *
 * Backend sends nested objects per signal. This component extracts the relevant
 * numeric values from each signal's sub-fields:
 * - void_moon: { is_void, confidence, void_start, void_end, moon_sign, ... }
 * - noosphere: { velocity, direction, confidence, ... }
 * - kp_index: { kp_value, score, storm_level, ... }
 * - benford: { score, deviation, triggered, ... }
 * - chrome_resonance / hurst: not currently sent by backend
 */

const panelStyle = {
  backgroundColor: '#0a0a14',
  borderRadius: '6px',
  padding: '10px 12px',
  marginTop: '4px',
  fontSize: '11px',
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 0',
};

const labelStyle = {
  color: '#9CA3AF',
  flex: '0 0 120px',
};

const progressBarContainer = {
  flex: 1,
  height: '8px',
  backgroundColor: '#1a1a2e',
  borderRadius: '4px',
  marginLeft: '8px',
  marginRight: '8px',
  overflow: 'hidden',
};

const valueStyle = {
  color: '#6B7280',
  width: '80px',
  textAlign: 'right',
  fontSize: '10px',
};

const SIGNAL_TOOLTIPS = {
  void_moon: 'Moon void-of-course (avoid new bets when active)',
  noosphere: 'Search trend velocity between teams',
  kp_index: 'Geomagnetic activity - Kp >= 5 indicates storm',
  benford: 'First-digit distribution anomaly in betting lines',
};

const ProgressBar = ({ value, max = 1, color = '#8B5CF6' }) => {
  const safeVal = typeof value === 'number' ? value : 0;
  const pct = Math.min(100, Math.max(0, (safeVal / max) * 100));
  return (
    <div style={progressBarContainer}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        backgroundColor: color,
        borderRadius: '4px',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
};

const GlitchSignalsPanel = ({ pick }) => {
  if (!pick?.glitch_signals) return null;

  const signals = pick.glitch_signals;

  // Check if we have any signals to display
  const hasSignals = Object.keys(signals).length > 0;
  if (!hasSignals) return null;

  return (
    <details style={{ marginTop: '8px' }}>
      <summary style={{
        color: '#A855F7',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        GLITCH Protocol
      </summary>
      <div style={panelStyle}>
        {/* Void Moon - nested object with is_void, confidence, moon_sign, phase */}
        {signals.void_moon != null && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.void_moon}>
            <span style={labelStyle}>Void Moon:</span>
            <span style={{
              ...valueStyle,
              width: 'auto',
              flex: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              color: signals.void_moon.is_void ? '#EF4444' : '#10B981',
            }}>
              {signals.void_moon.is_void ? 'ACTIVE' : 'CLEAR'}
              {signals.void_moon.moon_sign && (
                <span style={{ fontWeight: 'normal', color: '#6B7280', marginLeft: '6px' }}>
                  ({signals.void_moon.moon_sign} {signals.void_moon.phase || ''})
                </span>
              )}
            </span>
            <span style={valueStyle}>
              {signals.void_moon.is_void && signals.void_moon.void_end
                ? `ends ${signals.void_moon.void_end}`
                : ''}
            </span>
          </div>
        )}

        {/* Noosphere - nested object with velocity, direction, confidence */}
        {signals.noosphere != null && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.noosphere}>
            <span style={labelStyle}>Noosphere:</span>
            {typeof signals.noosphere.velocity === 'number' ? (
              <>
                <ProgressBar value={signals.noosphere.velocity} color="#00D4FF" />
                <span style={valueStyle}>
                  {signals.noosphere.velocity.toFixed(2)} {signals.noosphere.direction || ''}
                </span>
              </>
            ) : (
              <span style={valueStyle}>
                {signals.noosphere.direction || 'NEUTRAL'}
              </span>
            )}
          </div>
        )}

        {/* Kp-Index - nested object with kp_value, score, storm_level */}
        {signals.kp_index != null && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.kp_index}>
            <span style={labelStyle}>Kp-Index:</span>
            <span style={{
              flex: 1,
              textAlign: 'center',
              color: (signals.kp_index.kp_value ?? 0) >= 5 ? '#EF4444' : '#10B981',
              fontWeight: 'bold',
              fontSize: '10px',
            }}>
              {typeof signals.kp_index.kp_value === 'number'
                ? signals.kp_index.kp_value.toFixed(1)
                : '—'}{' '}
              {signals.kp_index.storm_level || 'QUIET'}
            </span>
            <span style={valueStyle} />
          </div>
        )}

        {/* Benford - nested object with score, deviation, triggered */}
        {signals.benford != null && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.benford}>
            <span style={labelStyle}>Benford:</span>
            {typeof signals.benford.score === 'number' ? (
              <>
                <ProgressBar value={signals.benford.score} color="#F59E0B" />
                <span style={valueStyle}>
                  {signals.benford.score.toFixed(2)}
                  {signals.benford.triggered ? ' ANOMALY' : ''}
                </span>
              </>
            ) : (
              <span style={valueStyle}>—</span>
            )}
          </div>
        )}
      </div>
    </details>
  );
};

export default GlitchSignalsPanel;
