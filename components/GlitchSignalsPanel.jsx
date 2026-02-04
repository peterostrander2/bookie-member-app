import React from 'react';

/**
 * GlitchSignalsPanel - Displays GLITCH protocol signals with progress bars
 *
 * Signals:
 * - Chrome Resonance: Player birthday chromatic match (0-1)
 * - Void Moon: Void-of-course penalty (0 = good, >0 = warning)
 * - Noosphere: Search trend velocity (0-1)
 * - Hurst: Line movement regime (H > 0.5 = TRENDING, H < 0.5 = MEAN-REVERTING)
 * - Kp-Index: Geomagnetic activity (< 5 = QUIET, >= 5 = STORM)
 * - Benford: First-digit distribution anomaly (0-1)
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
  width: '50px',
  textAlign: 'right',
  fontSize: '10px',
};

const SIGNAL_TOOLTIPS = {
  chrome_resonance: 'Player birthday + game date chromatic interval',
  void_moon: 'Moon void-of-course (avoid new bets when active)',
  noosphere: 'Search trend velocity between teams',
  hurst: 'Line regime - H > 0.5 means trending, H < 0.5 means mean-reverting',
  kp_index: 'Geomagnetic activity - Kp >= 5 indicates storm',
  benford: 'First-digit distribution anomaly in betting lines',
};

const ProgressBar = ({ value, max = 1, color = '#8B5CF6' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
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

  const getHurstLabel = (h) => {
    if (h === undefined || h === null) return '—';
    return h > 0.5 ? 'TRENDING' : 'MEAN-REVERT';
  };

  const getHurstColor = (h) => {
    if (h === undefined || h === null) return '#6B7280';
    return h > 0.5 ? '#10B981' : '#F59E0B';
  };

  const getKpLabel = (kp) => {
    if (kp === undefined || kp === null) return '—';
    return kp >= 5 ? 'STORM' : 'QUIET';
  };

  const getKpColor = (kp) => {
    if (kp === undefined || kp === null) return '#6B7280';
    return kp >= 5 ? '#EF4444' : '#10B981';
  };

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
        {/* Chrome Resonance */}
        {signals.chrome_resonance !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.chrome_resonance}>
            <span style={labelStyle}>Chrome:</span>
            <ProgressBar value={signals.chrome_resonance} color="#8B5CF6" />
            <span style={valueStyle}>{signals.chrome_resonance.toFixed(2)}</span>
          </div>
        )}

        {/* Void Moon */}
        {signals.void_moon !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.void_moon}>
            <span style={labelStyle}>Void Moon:</span>
            <ProgressBar
              value={signals.void_moon}
              color={signals.void_moon > 0 ? '#EF4444' : '#10B981'}
            />
            <span style={{
              ...valueStyle,
              color: signals.void_moon > 0 ? '#EF4444' : '#10B981'
            }}>
              {signals.void_moon.toFixed(2)}
            </span>
          </div>
        )}

        {/* Noosphere */}
        {signals.noosphere !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.noosphere}>
            <span style={labelStyle}>Noosphere:</span>
            <ProgressBar value={signals.noosphere} color="#00D4FF" />
            <span style={valueStyle}>{signals.noosphere.toFixed(2)}</span>
          </div>
        )}

        {/* Hurst - Text label instead of progress bar */}
        {signals.hurst !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.hurst}>
            <span style={labelStyle}>Hurst (H={signals.hurst.toFixed(2)}):</span>
            <span style={{
              flex: 1,
              textAlign: 'center',
              color: getHurstColor(signals.hurst),
              fontWeight: 'bold',
              fontSize: '10px',
            }}>
              {getHurstLabel(signals.hurst)}
            </span>
            <span style={valueStyle} />
          </div>
        )}

        {/* Kp-Index - Text label */}
        {signals.kp_index !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.kp_index}>
            <span style={labelStyle}>Kp-Index:</span>
            <span style={{
              flex: 1,
              textAlign: 'center',
              color: getKpColor(signals.kp_index),
              fontWeight: 'bold',
              fontSize: '10px',
            }}>
              {signals.kp_index.toFixed(1)} {getKpLabel(signals.kp_index)}
            </span>
            <span style={valueStyle} />
          </div>
        )}

        {/* Benford */}
        {signals.benford !== undefined && (
          <div style={rowStyle} title={SIGNAL_TOOLTIPS.benford}>
            <span style={labelStyle}>Benford:</span>
            <ProgressBar value={signals.benford} color="#F59E0B" />
            <span style={valueStyle}>{signals.benford.toFixed(2)}</span>
          </div>
        )}
      </div>
    </details>
  );
};

export default GlitchSignalsPanel;
