/**
 * BET SLIP COMPONENT
 *
 * Allows users to add picks to a bet slip,
 * calculate parlays, and track their selections.
 */

import React, { useState, createContext, useContext, useEffect } from 'react';
import { recordPick } from './clvTracker';
import { useToast } from './Toast';

const STORAGE_KEY = 'bookie_bet_slip';

// Context for bet slip
const BetSlipContext = createContext();

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within BetSlipProvider');
  }
  return context;
};

export const BetSlipProvider = ({ children }) => {
  const [selections, setSelections] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  }, [selections]);

  // Add selection to slip
  const addSelection = (pick) => {
    const id = `${pick.game_id || pick.id}_${pick.bet_type}_${pick.side}`;
    if (selections.find(s => s.id === id)) {
      return false; // Already exists
    }
    setSelections(prev => [...prev, { ...pick, id, stake: 100 }]);
    return true;
  };

  // Remove selection from slip
  const removeSelection = (id) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  };

  // Update stake for a selection
  const updateStake = (id, stake) => {
    setSelections(prev => prev.map(s =>
      s.id === id ? { ...s, stake: parseFloat(stake) || 0 } : s
    ));
  };

  // Clear all selections
  const clearSlip = () => {
    setSelections([]);
  };

  // Check if a pick is in the slip
  const isInSlip = (gameId, betType, side) => {
    const id = `${gameId}_${betType}_${side}`;
    return selections.some(s => s.id === id);
  };

  // Calculate parlay odds
  const calculateParlayOdds = () => {
    if (selections.length < 2) return null;

    let combinedMultiplier = 1;
    selections.forEach(s => {
      const odds = s.odds || -110;
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      combinedMultiplier *= decimal;
    });

    // Convert back to American odds
    if (combinedMultiplier >= 2) {
      return Math.round((combinedMultiplier - 1) * 100);
    } else {
      return Math.round(-100 / (combinedMultiplier - 1));
    }
  };

  // Calculate total potential payout
  const calculatePayout = (stake = 100) => {
    if (selections.length === 0) return 0;

    if (selections.length === 1) {
      const odds = selections[0].odds || -110;
      if (odds > 0) {
        return stake + (stake * odds / 100);
      } else {
        return stake + (stake * 100 / Math.abs(odds));
      }
    }

    // Parlay
    const parlayOdds = calculateParlayOdds();
    if (parlayOdds > 0) {
      return stake + (stake * parlayOdds / 100);
    } else {
      return stake + (stake * 100 / Math.abs(parlayOdds));
    }
  };

  return (
    <BetSlipContext.Provider value={{
      selections,
      addSelection,
      removeSelection,
      updateStake,
      clearSlip,
      isInSlip,
      calculateParlayOdds,
      calculatePayout,
      isOpen,
      setIsOpen
    }}>
      {children}
    </BetSlipContext.Provider>
  );
};

// Floating bet slip component
export const FloatingBetSlip = () => {
  const {
    selections,
    removeSelection,
    updateStake,
    clearSlip,
    calculateParlayOdds,
    calculatePayout,
    isOpen,
    setIsOpen
  } = useBetSlip();
  const toast = useToast();
  const [totalStake, setTotalStake] = useState(100);

  if (selections.length === 0 && !isOpen) return null;

  const parlayOdds = calculateParlayOdds();
  const payout = calculatePayout(totalStake);

  const handleTrackPicks = () => {
    selections.forEach(pick => {
      recordPick({
        sport: pick.sport || 'NBA',
        home_team: pick.home_team || pick.team,
        away_team: pick.away_team || 'Opponent',
        commence_time: pick.commence_time || new Date().toISOString(),
        bet_type: pick.bet_type || 'prop',
        side: pick.side,
        line: pick.line,
        odds: pick.odds || -110,
        book: 'Manual',
        confidence: pick.confidence || 0,
        tier: pick.tier || 'STANDARD',
        signals: []
      });
    });

    toast.success(`${selections.length} pick(s) added to tracker!`);
    clearSlip();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating button when closed */}
      {!isOpen && selections.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#00D4FF',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 999
          }}
        >
          🎫
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#FF4444',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {selections.length}
          </span>
        </button>
      )}

      {/* Expanded bet slip */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          maxHeight: '500px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #333',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#12121f',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎫</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Bet Slip</span>
              <span style={{
                backgroundColor: '#00D4FF30',
                color: '#00D4FF',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selections.length}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ×
            </button>
          </div>

          {/* Selections */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {selections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                No selections yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selections.map((pick, i) => (
                  <div
                    key={pick.id}
                    style={{
                      backgroundColor: '#0a0a0f',
                      borderRadius: '10px',
                      padding: '12px',
                      border: '1px solid #333'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                        {pick.player || pick.team || pick.home_team}
                      </span>
                      <button
                        onClick={() => removeSelection(pick.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FF4444',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {pick.side} {pick.line} • {pick.stat || pick.bet_type}
                      </span>
                      <span style={{
                        color: '#00D4FF',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        {pick.odds > 0 ? '+' : ''}{pick.odds || -110}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with totals */}
          {selections.length > 0 && (
            <div style={{
              padding: '15px 20px',
              backgroundColor: '#12121f',
              borderTop: '1px solid #333'
            }}>
              {/* Parlay odds if applicable */}
              {selections.length > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#FFD70015',
                  borderRadius: '8px',
                  border: '1px solid #FFD70030'
                }}>
                  <span style={{ color: '#FFD700', fontSize: '12px' }}>
                    {selections.length}-Leg Parlay
                  </span>
                  <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {parlayOdds > 0 ? '+' : ''}{parlayOdds}
                  </span>
                </div>
              )}

              {/* Stake input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Stake $</span>
                <input
                  type="number"
                  value={totalStake}
                  onChange={(e) => setTotalStake(parseFloat(e.target.value) || 0)}
                  style={{
                    flex: 1,
                    backgroundColor: '#0a0a0f',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>TO WIN</div>
                  <div style={{ color: '#00FF88', fontWeight: 'bold' }}>
                    ${(payout - totalStake).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={clearSlip}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#FF444430',
                    color: '#FF4444',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleTrackPicks}
                  style={{
                    flex: 2,
                    padding: '10px',
                    backgroundColor: '#00D4FF',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Track Picks
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Add to slip button component
export const AddToSlipButton = ({ pick, size = 'normal' }) => {
  const { addSelection, isInSlip, removeSelection } = useBetSlip();
  const toast = useToast();

  const id = `${pick.game_id || pick.id}_${pick.bet_type}_${pick.side}`;
  const inSlip = isInSlip(pick.game_id || pick.id, pick.bet_type, pick.side);

  const handleClick = (e) => {
    e.stopPropagation();
    if (inSlip) {
      removeSelection(id);
      toast.info('Removed from bet slip');
    } else {
      if (addSelection(pick)) {
        toast.success('Added to bet slip!');
      }
    }
  };

  const buttonStyle = size === 'small' ? {
    padding: '4px 8px',
    fontSize: '11px'
  } : {
    padding: '6px 12px',
    fontSize: '12px'
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...buttonStyle,
        backgroundColor: inSlip ? '#00FF8830' : '#00D4FF20',
        color: inSlip ? '#00FF88' : '#00D4FF',
        border: `1px solid ${inSlip ? '#00FF8850' : '#00D4FF50'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {inSlip ? '✓' : '+'} {inSlip ? 'In Slip' : 'Add'}
    </button>
  );
};

export default BetSlipProvider;
