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

/**
 * GoldenConvergenceBadge - The ultimate indicator
 * When ML + Sharp Money + Esoteric ALL align
 */
export const GoldenConvergenceBadge = ({
  mlConfidence,
  sharpSignal,
  esotericScore,
  direction,
  size = 'normal'
}) => {
  const mlAligned = mlConfidence >= 75;
  const sharpAligned = sharpSignal && sharpSignal.divergence >= 15;
  const esotericAligned = esotericScore >= 3;

  // Check if all three align
  const isGolden = mlAligned && sharpAligned && esotericAligned;

  if (!isGolden) return null;

  const sizes = {
    small: { padding: '6px 12px', fontSize: '11px' },
    normal: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '14px 28px', fontSize: '18px' }
  };

  const s = sizes[size];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
      padding: '3px',
      borderRadius: '16px',
      display: 'inline-block',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{
        backgroundColor: '#0a0a0f',
        borderRadius: '14px',
        padding: s.padding,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>🏆</span>
        <div>
          <div style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: s.fontSize,
            letterSpacing: '1px'
          }}>
            GOLDEN CONVERGENCE
          </div>
          <div style={{ color: '#FFD700', fontSize: '11px', marginTop: '2px' }}>
            ML ({mlConfidence}%) + Sharp ({sharpSignal?.divergence}%) + Magic ({esotericScore}/5)
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TripleAlignmentMeter - Visual meter showing alignment of all 3 signal types
 */
export const TripleAlignmentMeter = ({ mlScore, sharpScore, esotericScore }) => {
  const getColor = (score) => {
    if (score >= 80) return '#00FF88';
    if (score >= 65) return '#00D4FF';
    if (score >= 50) return '#FFD700';
    return '#9ca3af';
  };

  const signals = [
    { label: 'ML', icon: '🧠', score: mlScore, color: getColor(mlScore) },
    { label: 'Sharp', icon: '🦈', score: sharpScore, color: getColor(sharpScore) },
    { label: 'Esoteric', icon: '🔮', score: esotericScore, color: getColor(esotericScore) }
  ];

  const avgScore = Math.round((mlScore + sharpScore + esotericScore) / 3);
  const allAligned = signals.every(s => s.score >= 65);

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#0a0a0f',
      borderRadius: '10px',
      border: allAligned ? '1px solid #FFD70050' : '1px solid #333'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
          Triple Alignment
        </span>
        <span style={{
          color: allAligned ? '#FFD700' : '#9ca3af',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {allAligned ? '🏆 GOLDEN' : `${avgScore}% AVG`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {signals.map((signal, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>{signal.icon}</div>
            <div style={{
              height: '40px',
              backgroundColor: '#1a1a2e',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${signal.score}%`,
                backgroundColor: signal.color,
                opacity: 0.7,
                transition: 'height 0.5s ease'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}>
                {signal.score}
              </div>
            </div>
            <div style={{ color: '#6b7280', fontSize: '9px', marginTop: '4px' }}>
              {signal.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HarmonicBadge;
