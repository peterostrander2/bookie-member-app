/**
 * CONSENSUS METER
 *
 * Visual display showing alignment across all three signal categories:
 * - ML/AI Models (Ensemble, LSTM, etc.)
 * - Sharp Money (Professional bettor action)
 * - Esoteric (Numerology, Moon, Gematria)
 *
 * When all three align = TRIPLE ALIGNMENT = Highest conviction
 */

import React from 'react';

/**
 * Calculate consensus from signal breakdown
 */
export const calculateConsensus = (signals) => {
  if (!signals || !signals.breakdown) {
    return { ml: 50, sharp: 50, esoteric: 50, aligned: false };
  }

  const { dataSignals, mlSignals, esotericSignals } = signals.breakdown;

  // Calculate average score for each category
  const avgScore = (arr) => {
    if (!arr || arr.length === 0) return 50;
    return Math.round(arr.reduce((sum, s) => sum + s.score, 0) / arr.length);
  };

  // Sharp is in dataSignals, ML models in mlSignals
  const sharpSignal = dataSignals?.find(s => s.name === 'sharp_money');
  const sharp = sharpSignal?.score || 50;

  const ml = avgScore(mlSignals);
  const esoteric = avgScore(esotericSignals);

  // Check alignment (all above 60 = aligned)
  const mlAligned = ml >= 60;
  const sharpAligned = sharp >= 60;
  const esotericAligned = esoteric >= 60;

  const alignmentCount = [mlAligned, sharpAligned, esotericAligned].filter(Boolean).length;

  return {
    ml,
    sharp,
    esoteric,
    mlAligned,
    sharpAligned,
    esotericAligned,
    alignmentCount,
    tripleAlignment: alignmentCount === 3,
    doubleAlignment: alignmentCount === 2,
    aligned: alignmentCount >= 2
  };
};

/**
 * Mini Consensus Badge - Compact version for cards
 */
export const ConsensusMiniBadge = ({ signals }) => {
  const consensus = calculateConsensus(signals);

  const getColor = (aligned) => aligned ? '#00FF88' : '#4a4a5a';

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      alignItems: 'center'
    }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: getColor(consensus.mlAligned),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }}
        title={`ML: ${consensus.ml}%`}
      >
        🤖
      </div>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: getColor(consensus.sharpAligned),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }}
        title={`Sharp: ${consensus.sharp}%`}
      >
        💰
      </div>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: getColor(consensus.esotericAligned),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }}
        title={`Esoteric: ${consensus.esoteric}%`}
      >
        🔮
      </div>
      {consensus.tripleAlignment && (
        <span style={{
          marginLeft: '4px',
          fontSize: '12px',
          animation: 'pulse 1s infinite'
        }}>
          🎯
        </span>
      )}
    </div>
  );
};

/**
 * Consensus Gauge - Single category gauge
 */
const ConsensusGauge = ({ label, value, aligned, icon, color }) => {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{
        fontSize: '24px',
        marginBottom: '8px',
        opacity: aligned ? 1 : 0.5
      }}>
        {icon}
      </div>
      <div style={{
        height: '6px',
        backgroundColor: '#1a1a2e',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: aligned ? color : '#4a4a5a',
          borderRadius: '3px',
          transition: 'width 0.5s ease'
        }} />
      </div>
      <div style={{
        color: aligned ? color : '#6b7280',
        fontSize: '12px',
        fontWeight: aligned ? 'bold' : 'normal'
      }}>
        {label}
      </div>
      <div style={{
        color: aligned ? '#fff' : '#6b7280',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {value}%
      </div>
    </div>
  );
};

/**
 * Full Consensus Meter - Detailed view
 */
export const ConsensusMeter = ({ signals, showDetails = true }) => {
  const consensus = calculateConsensus(signals);

  const getAlignmentStatus = () => {
    if (consensus.tripleAlignment) {
      return {
        label: 'TRIPLE ALIGNMENT',
        emoji: '🎯',
        color: '#FFD700',
        description: 'All systems go - ML, Sharp Money, and Esoteric all agree!'
      };
    } else if (consensus.doubleAlignment) {
      return {
        label: 'DOUBLE ALIGNMENT',
        emoji: '⚡',
        color: '#00FF88',
        description: 'Strong signal - 2 of 3 categories aligned'
      };
    } else if (consensus.alignmentCount === 1) {
      return {
        label: 'SINGLE SIGNAL',
        emoji: '📊',
        color: '#00D4FF',
        description: 'One category showing strength'
      };
    }
    return {
      label: 'NO ALIGNMENT',
      emoji: '⚠️',
      color: '#9ca3af',
      description: 'Mixed signals - proceed with caution'
    };
  };

  const status = getAlignmentStatus();

  return (
    <div style={{
      backgroundColor: '#12121f',
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${consensus.tripleAlignment ? '#FFD700' : '#333'}`,
      boxShadow: consensus.tripleAlignment ? '0 0 20px #FFD70030' : 'none'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
          {status.emoji}
        </div>
        <div style={{
          color: status.color,
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '4px'
        }}>
          {status.label}
        </div>
        {showDetails && (
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>
            {status.description}
          </div>
        )}
      </div>

      {/* Gauges */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: showDetails ? '20px' : '0'
      }}>
        <ConsensusGauge
          label="ML/AI"
          value={consensus.ml}
          aligned={consensus.mlAligned}
          icon="🤖"
          color="#00D4FF"
        />
        <ConsensusGauge
          label="Sharp $"
          value={consensus.sharp}
          aligned={consensus.sharpAligned}
          icon="💰"
          color="#00FF88"
        />
        <ConsensusGauge
          label="Esoteric"
          value={consensus.esoteric}
          aligned={consensus.esotericAligned}
          icon="🔮"
          color="#8B5CF6"
        />
      </div>

      {/* Alignment Indicator */}
      {showDetails && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: '40px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i <= consensus.alignmentCount
                  ? (consensus.tripleAlignment ? '#FFD700' : '#00FF88')
                  : '#333'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Consensus Alert - Shows when triple alignment detected
 */
export const ConsensusAlert = ({ signals, pickName }) => {
  const consensus = calculateConsensus(signals);

  if (!consensus.tripleAlignment) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      borderRadius: '12px',
      padding: '3px'
    }}>
      <div style={{
        backgroundColor: '#0a0a0f',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '32px' }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            TRIPLE ALIGNMENT DETECTED
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>
            {pickName || 'This pick'} has consensus across ML ({consensus.ml}%),
            Sharp Money ({consensus.sharp}%), and Esoteric ({consensus.esoteric}%)
          </div>
        </div>
        <div style={{
          backgroundColor: '#FFD700',
          color: '#000',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          SMASH
        </div>
      </div>
    </div>
  );
};

/**
 * Page component for viewing consensus across all picks
 */
const ConsensusMeterPage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#fff', marginBottom: '10px' }}>Consensus Meter</h1>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
          Track alignment across ML models, sharp money, and esoteric signals
        </p>

        {/* Legend */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>
            Understanding Consensus
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>ML/AI</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                Ensemble models, LSTM neural networks, key numbers, injury impact analysis
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>💰</span>
                <span style={{ color: '#00FF88', fontWeight: 'bold' }}>Sharp Money</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                Professional bettor action detected via money% vs ticket% divergence
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🔮</span>
                <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Esoteric</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                Numerology life paths, moon phases, gematria calculations, sacred geometry
              </p>
            </div>
          </div>
        </div>

        {/* Alignment Tiers */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>
            Alignment Tiers
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#FFD70010', borderRadius: '8px', border: '1px solid #FFD70040' }}>
              <span style={{ fontSize: '24px' }}>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontWeight: 'bold' }}>TRIPLE ALIGNMENT</div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>All 3 categories agree - highest conviction plays</div>
              </div>
              <div style={{ color: '#FFD700', fontWeight: 'bold' }}>62-68% WR</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#00FF8810', borderRadius: '8px', border: '1px solid #00FF8840' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#00FF88', fontWeight: 'bold' }}>DOUBLE ALIGNMENT</div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>2 of 3 categories agree - strong plays</div>
              </div>
              <div style={{ color: '#00FF88', fontWeight: 'bold' }}>58-62% WR</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#00D4FF10', borderRadius: '8px', border: '1px solid #00D4FF40' }}>
              <span style={{ fontSize: '24px' }}>📊</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>SINGLE SIGNAL</div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>1 category showing strength - lean plays</div>
              </div>
              <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>54-58% WR</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#33333330', borderRadius: '8px', border: '1px solid #333' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#9ca3af', fontWeight: 'bold' }}>NO ALIGNMENT</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Mixed signals - proceed with caution or pass</div>
              </div>
              <div style={{ color: '#9ca3af', fontWeight: 'bold' }}>50-54% WR</div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, textAlign: 'center' }}>
            💡 Consensus meter integrates automatically with SMASH Spots.
            Each pick shows its alignment status in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsensusMeterPage;
