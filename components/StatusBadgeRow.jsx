import React from 'react';

/**
 * StatusBadgeRow - Displays status indicator badges for pick signals
 *
 * Badge conditions:
 * - MSRF Level (gold): msrf_metadata?.level exists
 * - SERP Active (cyan): serp_boost > 0 && !serp_shadow_mode
 * - SERP Shadow (gray): serp_shadow_mode === true
 * - Jason Block (red): jason_sim_boost < 0
 * - Jason Boost (green): jason_sim_boost > 0
 * - ML Adjust (blue): ensemble_adjustment !== 0
 */

const badgeStyle = (bg, color) => ({
  backgroundColor: bg,
  color: color,
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const MSRF_LEVEL_LABELS = {
  HIGH: 'HIGH RESONANCE',
  MODERATE: 'MOD RESONANCE',
  LOW: 'LOW RESONANCE',
};

const StatusBadgeRow = ({ pick }) => {
  if (!pick) return null;

  const badges = [];

  // MSRF Level Badge (Gold)
  if (pick.msrf_metadata?.level) {
    const label = MSRF_LEVEL_LABELS[pick.msrf_metadata.level] || pick.msrf_metadata.level;
    badges.push(
      <div key="msrf-level" style={badgeStyle('rgba(234, 179, 8, 0.2)', '#EAB308')}>
        {label}
      </div>
    );
  }

  // SERP Active Badge (Cyan)
  if (pick.serp_boost > 0 && !pick.serp_shadow_mode) {
    badges.push(
      <div key="serp-active" style={badgeStyle('rgba(0, 212, 255, 0.2)', '#00D4FF')}>
        SERP INTEL
      </div>
    );
  }

  // SERP Shadow Badge (Gray)
  if (pick.serp_shadow_mode === true) {
    badges.push(
      <div key="serp-shadow" style={badgeStyle('rgba(107, 114, 128, 0.2)', '#6B7280')}>
        SERP (SHADOW)
      </div>
    );
  }

  // Jason Block Badge (Red) - negative jason_sim_boost
  if (pick.jason_sim_boost < 0) {
    badges.push(
      <div key="jason-block" style={badgeStyle('rgba(239, 68, 68, 0.2)', '#EF4444')}>
        JASON BLOCK
      </div>
    );
  }

  // Jason Boost Badge (Green) - positive jason_sim_boost
  if (pick.jason_sim_boost > 0) {
    badges.push(
      <div key="jason-boost" style={badgeStyle('rgba(16, 185, 129, 0.2)', '#10B981')}>
        JASON +
      </div>
    );
  }

  // ML Adjust Badge (Blue) - non-zero ensemble_adjustment
  if (pick.ensemble_adjustment && pick.ensemble_adjustment !== 0) {
    const sign = pick.ensemble_adjustment > 0 ? '+' : '';
    badges.push(
      <div key="ml-adjust" style={badgeStyle('rgba(59, 130, 246, 0.2)', '#3B82F6')}>
        ML {sign}{pick.ensemble_adjustment.toFixed(1)}
      </div>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '6px',
    }}>
      {badges}
    </div>
  );
};

export default StatusBadgeRow;
