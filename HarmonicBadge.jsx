import React from 'react';

/**
 * HarmonicBadge - Shows when Math (ML) and Magic (Esoteric) align
 * 
 * The "Harmonic Convergence" is when:
 * - ML models agree (confidence > 75%)
 * - Esoteric signals align (3+ factors agree)
 * - Both point same direction (OVER or UNDER)
 */

const HarmonicBadge = ({ 
  mlConfidence, 
  esotericScore, 
  direction,
  showDetails = false,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  // Check if we have harmonic convergence
  const mlAligned = mlConfidence >= 75;
  const esotericAligned = esotericScore >= 3;
  const isHarmonic = mlAligned && esotericAligned;

  if (!isHarmonic) return null;

  const sizes = {
    small: { padding: '4px 10px', fontSize: '11px', iconSize: '14px' },
    normal: { padding: '8px 16px', fontSize: '13px', iconSize: '18px' },
    large: { padding: '12px 24px', fontSize: '16px', iconSize: '24px' }
  };

  const s = sizes[size];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #8B5CF6 0%, #00D4FF 50%, #00FF88 100%)',
      padding: '2px',
      borderRadius: '12px',
      display: 'inline-block'
    }}>
      <div style={{
        backgroundColor: '#0a0a0f',
        borderRadius: '10px',
        padding: s.padding,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: s.iconSize }}>✨</span>
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #8B5CF6, #00D4FF, #00FF88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: s.fontSize
          }}>
            HARMONIC CONVERGENCE
          </div>
          {showDetails && (
            <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
              Math ({mlConfidence}%) + Magic ({esotericScore}/5) → {direction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * HarmonicBanner - Full-width banner for top of cards
 */
export const HarmonicBanner = ({ mlConfidence, esotericScore, direction }) => {
  const mlAligned = mlConfidence >= 75;
  const esotericAligned = esotericScore >= 3;
  const isHarmonic = mlAligned && esotericAligned;

  if (!isHarmonic) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #8B5CF620 0%, #00D4FF20 50%, #00FF8820 100%)',
      borderBottom: '1px solid',
      borderImage: 'linear-gradient(90deg, #8B5CF6, #00D4FF, #00FF88) 1',
      padding: '10px 15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }}>
      <span style={{ fontSize: '16px' }}>✨</span>
      <span style={{
        background: 'linear-gradient(90deg, #8B5CF6, #00D4FF, #00FF88)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        fontSize: '13px'
      }}>
        HARMONIC CONVERGENCE: Math + Magic Align on {direction}
      </span>
      <span style={{ fontSize: '16px' }}>✨</span>
    </div>
  );
};

/**
 * ConvergenceIndicator - Compact indicator showing alignment level
 */
export const ConvergenceIndicator = ({ mlConfidence, esotericScore }) => {
  // Calculate alignment strength
  const mlStrength = mlConfidence >= 80 ? 2 : mlConfidence >= 70 ? 1 : 0;
  const esotericStrength = esotericScore >= 4 ? 2 : esotericScore >= 3 ? 1 : 0;
  const totalStrength = mlStrength + esotericStrength;

  const getLabel = () => {
    if (totalStrength >= 4) return { text: 'PERFECT', color: '#00FF88' };
    if (totalStrength >= 3) return { text: 'STRONG', color: '#00D4FF' };
    if (totalStrength >= 2) return { text: 'ALIGNED', color: '#8B5CF6' };
    if (totalStrength >= 1) return { text: 'PARTIAL', color: '#FFD700' };
    return { text: 'DIVERGENT', color: '#FF4444' };
  };

  const label = getLabel();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      {/* Math indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span style={{ fontSize: '14px' }}>🧮</span>
        <div style={{
          display: 'flex',
          gap: '2px'
        }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: i < mlStrength ? '#00D4FF' : '#333'
            }} />
          ))}
        </div>
      </div>

      {/* Connection line */}
      <div style={{
        width: '20px',
        height: '2px',
        background: totalStrength >= 2 
          ? 'linear-gradient(90deg, #00D4FF, #8B5CF6)' 
          : '#333'
      }} />

      {/* Magic indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{
          display: 'flex',
          gap: '2px'
        }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: i < esotericStrength ? '#8B5CF6' : '#333'
            }} />
          ))}
        </div>
        <span style={{ fontSize: '14px' }}>🔮</span>
      </div>

      {/* Label */}
      <span style={{
        color: label.color,
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '5px'
      }}>
        {label.text}
      </span>
    </div>
  );
};

export default HarmonicBadge;
