import React, { useState } from 'react';

/**
 * ValueWaterfall - Shows the "Bridge" from base average to final projection
 * 
 * Base Average → Adjustments → Final Projection
 * 21.9 + Matchup(+1.2) + Vacuum(+1.9) = 25.0
 */

const ValueWaterfall = ({ 
  base, 
  adjustments = [], 
  final,
  isExpanded: controlledExpanded,
  onToggle,
  showToggle = true
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = onToggle || (() => setInternalExpanded(!internalExpanded));

  const totalAdjustment = adjustments.reduce((sum, adj) => sum + (adj.value || 0), 0);

  // Compact summary view
  if (!isExpanded) {
    return (
      <div 
        onClick={showToggle ? handleToggle : undefined}
        style={{
          backgroundColor: '#12121f',
          borderRadius: '8px',
          padding: '12px 15px',
          cursor: showToggle ? 'pointer' : 'default'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Base</span>
              <div style={{ color: '#9ca3af', fontSize: '16px', fontWeight: '500' }}>
                {base?.toFixed(1) || '—'}
              </div>
            </div>
            
            <div style={{ color: '#6b7280', fontSize: '18px' }}>+</div>
            
            <div>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Context</span>
              <div style={{ 
                color: totalAdjustment >= 0 ? '#00FF88' : '#FF4444', 
                fontSize: '16px', 
                fontWeight: '500' 
              }}>
                {totalAdjustment >= 0 ? '+' : ''}{totalAdjustment.toFixed(1)}
              </div>
            </div>
            
            <div style={{ color: '#6b7280', fontSize: '18px' }}>=</div>
            
            <div>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Final</span>
              <div style={{ color: '#00D4FF', fontSize: '16px', fontWeight: 'bold' }}>
                {final?.toFixed(1) || '—'}
              </div>
            </div>
          </div>
          
          {showToggle && (
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              ▼ Details
            </span>
          )}
        </div>
      </div>
    );
  }

  // Expanded waterfall view
  return (
    <div 
      onClick={showToggle ? handleToggle : undefined}
      style={{
        backgroundColor: '#12121f',
        borderRadius: '10px',
        padding: '15px',
        cursor: showToggle ? 'pointer' : 'default'
      }}
    >
      <div style={{ 
        color: '#6b7280', 
        fontSize: '11px', 
        textTransform: 'uppercase',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Value Breakdown</span>
        {showToggle && <span style={{ fontSize: '10px' }}>▲ Collapse</span>}
      </div>

      {/* Base Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #1a1a2e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>📊</span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Season Average</span>
        </div>
        <span style={{ 
          color: '#fff', 
          fontSize: '15px', 
          fontFamily: 'monospace',
          fontWeight: '500'
        }}>
          {base?.toFixed(1) || '—'}
        </span>
      </div>

      {/* Adjustment Rows */}
      {adjustments.map((adj, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #1a1a2e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>{adj.icon || '➕'}</span>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>{adj.label}</span>
            {adj.reason && (
              <span style={{ 
                color: '#6b7280', 
                fontSize: '11px',
                backgroundColor: '#1a1a2e',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {adj.reason}
              </span>
            )}
          </div>
          <span style={{ 
            color: adj.value >= 0 ? '#00FF88' : '#FF4444', 
            fontSize: '15px', 
            fontFamily: 'monospace',
            fontWeight: '600'
          }}>
            {adj.value >= 0 ? '+' : ''}{adj.value?.toFixed(1) || '0.0'}
          </span>
        </div>
      ))}

      {/* Final Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        marginTop: '5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🎯</span>
          <span style={{ color: '#00D4FF', fontSize: '14px', fontWeight: 'bold' }}>Final Projection</span>
        </div>
        <span style={{ 
          color: '#00D4FF', 
          fontSize: '18px', 
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}>
          {final?.toFixed(1) || '—'}
        </span>
      </div>

      {/* Visual Bar */}
      <div style={{
        marginTop: '15px',
        height: '6px',
        backgroundColor: '#1a1a2e',
        borderRadius: '3px',
        overflow: 'hidden',
        display: 'flex'
      }}>
        <div style={{
          width: `${(base / final) * 100}%`,
          backgroundColor: '#9ca3af',
          transition: 'width 0.3s ease'
        }} />
        <div style={{
          width: `${((final - base) / final) * 100}%`,
          backgroundColor: totalAdjustment >= 0 ? '#00FF88' : '#FF4444',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

/**
 * WaterfallMini - Super compact inline version
 */
export const WaterfallMini = ({ base, final }) => {
  const diff = final - base;
  return (
    <span style={{ 
      color: '#9ca3af', 
      fontSize: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {base?.toFixed(1)} 
      <span style={{ color: diff >= 0 ? '#00FF88' : '#FF4444' }}>
        {diff >= 0 ? '→' : '→'}
      </span>
      <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>
        {final?.toFixed(1)}
      </span>
    </span>
  );
};

export default ValueWaterfall;
