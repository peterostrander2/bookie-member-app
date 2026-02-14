/**
 * Shared Badge Components
 *
 * ScoreBadge and TierBadge used by both GameSmashList and PropsSmashList.
 * Extracted to reduce code duplication (INVARIANT 8).
 */

import React, { memo } from 'react';
import { HelpIcon } from '../Tooltip';
import { getTierConfig } from '../src/utils/tierConfig';

/**
 * ScoreBadge - Displays a score with color coding based on percentage
 * @param {number} score - The score value to display
 * @param {number} maxScore - Maximum possible score (for percentage calc)
 * @param {string} label - Label text below the score
 * @param {string} tooltip - Optional tooltip text
 */
export const ScoreBadge = memo(({ score, maxScore, label, tooltip }) => {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#3B82F6';
    return '#6B7280';
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', minWidth: '50px'
    }}>
      <span style={{ color: getColor(), fontWeight: 'bold', fontSize: '16px' }}>{score.toFixed(1)}</span>
      <span style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
        {label}
        {tooltip && <HelpIcon tooltip={tooltip} size={12} />}
      </span>
    </div>
  );
});
ScoreBadge.displayName = 'ScoreBadge';

/**
 * TierBadge - Displays tier label with optional win rate and warning
 * @param {number} confidence - Confidence value to determine tier
 * @param {boolean} showWinRate - Whether to show historical win rate
 */
export const TierBadge = memo(({ confidence, showWinRate = false }) => {
  const config = getTierConfig(confidence);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
        color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}`, letterSpacing: '0.5px'
      }}>{config.label}</span>
      {showWinRate && (
        <span style={{
          padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold',
          backgroundColor: config.isProfitable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: config.isProfitable ? '#10B981' : '#EF4444',
          border: `1px solid ${config.isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {config.historicalWinRate}% hist.
        </span>
      )}
      {!config.isProfitable && (
        <span title={config.warning} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444',
          fontSize: '10px', fontWeight: 'bold', cursor: 'help'
        }}>!</span>
      )}
    </div>
  );
});
TierBadge.displayName = 'TierBadge';
