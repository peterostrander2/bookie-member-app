/**
 * PARLAY BUILDER PAGE
 *
 * Build multi-leg parlays with odds calculation,
 * track parlays, and view history.
 */

import React, { useState, useEffect } from 'react';
import api from './api';
import { useToast } from './Toast';
import { useBetSlip } from './BetSlip';
import { ShareButton } from './ShareButton';

const USER_ID = 'default_user'; // TODO: Replace with actual user auth

const ParlayBuilder = () => {
  const [legs, setLegs] = useState([]);
  const [stake, setStake] = useState(100);
  const [calculatedOdds, setCalculatedOdds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState('builder'); // builder, history
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({});
  const toast = useToast();
  const { selections, clearSlip } = useBetSlip();

  useEffect(() => {
    loadParlay();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  // Recalculate odds when legs change
  useEffect(() => {
    if (legs.length >= 2) {
      calculateOdds();
    } else {
      setCalculatedOdds(null);
    }
  }, [legs, stake]);

  const loadParlay = async () => {
    setLoading(true);
    try {
      const data = await api.getParlay(USER_ID);
      setLegs(data.legs || []);
      if (data.combined_odds) {
        setCalculatedOdds({ combined_odds: data.combined_odds });
      }
    } catch (err) {
      console.error('Failed to load parlay:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getParlayHistory(USER_ID);
      setHistory(data.parlays || []);
      setHistoryStats(data.stats || {});
    } catch (err) {
      toast.error('Failed to load parlay history');
    }
  };

  const calculateOdds = async () => {
    if (legs.length < 2) return;
    try {
      const result = await api.calculateParlay(legs, stake);
      if (result) {
        setCalculatedOdds(result);
      } else {
        // Fallback to local calculation
        setCalculatedOdds(calculateLocalOdds());
      }
    } catch {
      setCalculatedOdds(calculateLocalOdds());
    }
  };

  const calculateLocalOdds = () => {
    let multiplier = 1;
    legs.forEach(leg => {
      const odds = leg.odds || -110;
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      multiplier *= decimal;
    });

    const americanOdds = multiplier >= 2
      ? Math.round((multiplier - 1) * 100)
      : Math.round(-100 / (multiplier - 1));

    const payout = stake * multiplier;

    return {
      combined_odds: americanOdds,
      decimal_odds: multiplier.toFixed(2),
      potential_payout: payout.toFixed(2),
      potential_profit: (payout - stake).toFixed(2)
    };
  };

  const addLeg = async (legData) => {
    const newLeg = {
      id: Date.now(),
      ...legData,
      odds: legData.odds || -110
    };

    // Try API first
    const result = await api.addParlayLeg({ user_id: USER_ID, ...newLeg });
    if (result) {
      setLegs(result.legs || [...legs, newLeg]);
      toast.success('Leg added to parlay');
    } else {
      // Fallback to local
      setLegs([...legs, newLeg]);
      toast.success('Leg added to parlay');
    }
  };

  const removeLeg = (legId) => {
    setLegs(legs.filter(l => l.id !== legId));
    toast.info('Leg removed');
  };

  const importFromBetSlip = () => {
    if (selections.length === 0) {
      toast.info('No selections in bet slip');
      return;
    }

    selections.forEach(pick => {
      addLeg({
        player: pick.player,
        team: pick.team || pick.home_team,
        bet_type: pick.bet_type || 'prop',
        side: pick.side,
        line: pick.line,
        odds: pick.odds || -110,
        sport: pick.sport || 'NBA'
      });
    });

    clearSlip();
    toast.success(`Imported ${selections.length} legs from bet slip`);
  };

  const clearParlay = async () => {
    await api.clearParlay(USER_ID);
    setLegs([]);
    setCalculatedOdds(null);
    toast.info('Parlay cleared');
  };

  const placeParlay = async () => {
    if (legs.length < 2) {
      toast.error('Parlay needs at least 2 legs');
      return;
    }

    setPlacing(true);
    try {
      const result = await api.placeParlay({
        user_id: USER_ID,
        legs,
        stake,
        combined_odds: calculatedOdds?.combined_odds
      });

      if (result) {
        toast.success('Parlay placed and tracked!');
        setLegs([]);
        setCalculatedOdds(null);
        if (activeTab === 'history') {
          loadHistory();
        }
      } else {
        toast.error('Failed to place parlay');
      }
    } catch (err) {
      toast.error('Failed to place parlay');
    } finally {
      setPlacing(false);
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'WIN': return '#00FF88';
      case 'LOSS': return '#FF4444';
      case 'PUSH': return '#FFD700';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          color: '#fff',
          fontSize: '28px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>🎰</span> Parlay Builder
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Build multi-leg parlays and track your performance
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '25px'
      }}>
        <button
          onClick={() => setActiveTab('builder')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'builder' ? '#8B5CF620' : '#1a1a2e',
            color: activeTab === 'builder' ? '#8B5CF6' : '#9ca3af',
            border: `1px solid ${activeTab === 'builder' ? '#8B5CF650' : '#333'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'builder' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔧</span> Builder
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'history' ? '#00D4FF20' : '#1a1a2e',
            color: activeTab === 'history' ? '#00D4FF' : '#9ca3af',
            border: `1px solid ${activeTab === 'history' ? '#00D4FF50' : '#333'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📜</span> History
        </button>
      </div>

      {activeTab === 'builder' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '20px'
        }}>
          {/* Left: Legs List */}
          <div>
            {/* Import from Bet Slip */}
            {selections.length > 0 && (
              <div style={{
                backgroundColor: '#FFD70015',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #FFD70030',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {selections.length} picks in bet slip
                  </span>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0' }}>
                    Import them to your parlay
                  </p>
                </div>
                <button
                  onClick={importFromBetSlip}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Import All
                </button>
              </div>
            )}

            {/* Legs */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              border: '1px solid #333',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                  Parlay Legs ({legs.length})
                </span>
                {legs.length > 0 && (
                  <button
                    onClick={clearParlay}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#FF444420',
                      color: '#FF4444',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Loading...</span>
                </div>
              ) : legs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🎫</span>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Add legs from Smash Spots or use the form below
                  </p>
                </div>
              ) : (
                <div style={{ padding: '15px' }}>
                  {legs.map((leg, index) => (
                    <div
                      key={leg.id || index}
                      style={{
                        backgroundColor: '#0a0a0f',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: index < legs.length - 1 ? '10px' : 0,
                        border: '1px solid #333'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <div style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginBottom: '4px'
                          }}>
                            {leg.player || leg.team || leg.selection}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                            {leg.bet_type} • {leg.side} {leg.line}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            color: '#00D4FF',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {leg.odds > 0 ? '+' : ''}{leg.odds}
                          </span>
                          <button
                            onClick={() => removeLeg(leg.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FF4444',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '4px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Leg Form */}
            <AddLegForm onAdd={addLeg} />
          </div>

          {/* Right: Calculator & Place */}
          <div>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              border: '1px solid #333',
              padding: '20px',
              position: 'sticky',
              top: '80px'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🧮</span> Parlay Calculator
              </h3>

              {/* Odds Display */}
              {legs.length >= 2 && calculatedOdds && (
                <div style={{
                  backgroundColor: '#8B5CF615',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: '1px solid #8B5CF630'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {legs.length}-LEG PARLAY
                    </span>
                    <span style={{
                      color: '#8B5CF6',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {calculatedOdds.combined_odds > 0 ? '+' : ''}
                      {calculatedOdds.combined_odds}
                    </span>
                  </div>
                  {calculatedOdds.decimal_odds && (
                    <div style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      textAlign: 'right'
                    }}>
                      Decimal: {calculatedOdds.decimal_odds}x
                    </div>
                  )}
                </div>
              )}

              {/* Stake Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  STAKE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '12px',
                    backgroundColor: '#0a0a0f',
                    border: '1px solid #333',
                    borderRadius: '8px 0 0 8px',
                    color: '#6b7280'
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#0a0a0f',
                      border: '1px solid #333',
                      borderRadius: '0 8px 8px 0',
                      color: '#fff',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Quick Stakes */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {[25, 50, 100, 250].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: stake === amount ? '#00D4FF20' : '#0a0a0f',
                      color: stake === amount ? '#00D4FF' : '#6b7280',
                      border: `1px solid ${stake === amount ? '#00D4FF50' : '#333'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Payout Info */}
              {legs.length >= 2 && calculatedOdds && (
                <div style={{
                  backgroundColor: '#0a0a0f',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>To Win</span>
                    <span style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '16px' }}>
                      ${calculatedOdds.potential_profit || calculatePayout()}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>Total Payout</span>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                      ${calculatedOdds.potential_payout || (parseFloat(calculatePayout()) + stake).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {legs.length >= 2 && (
                  <ShareButton
                    parlay={legs}
                    combinedOdds={calculatedOdds?.combined_odds}
                    stake={stake}
                    size="medium"
                  />
                )}
                <button
                  onClick={placeParlay}
                  disabled={legs.length < 2 || placing}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: legs.length < 2 ? '#333' : '#8B5CF6',
                    color: legs.length < 2 ? '#6b7280' : '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: legs.length < 2 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  {placing ? 'Placing...' : legs.length < 2 ? 'Add 2+ Legs' : 'Place & Track Parlay'}
                </button>
              </div>

              {legs.length < 2 && (
                <p style={{
                  color: '#6b7280',
                  fontSize: '11px',
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  Parlays require at least 2 legs
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <ParlayHistory
          history={history}
          stats={historyStats}
          getOutcomeColor={getOutcomeColor}
        />
      )}
    </div>
  );

  function calculatePayout() {
    if (!calculatedOdds?.combined_odds) return '0.00';
    const odds = calculatedOdds.combined_odds;
    if (odds > 0) {
      return (stake * odds / 100).toFixed(2);
    } else {
      return (stake * 100 / Math.abs(odds)).toFixed(2);
    }
  }
};

// Add Leg Form Component
const AddLegForm = ({ onAdd }) => {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    player: '',
    team: '',
    bet_type: 'spread',
    side: 'Over',
    line: '',
    odds: -110,
    sport: 'NBA'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.player && !formData.team) return;
    onAdd(formData);
    setFormData({
      player: '',
      team: '',
      bet_type: 'spread',
      side: 'Over',
      line: '',
      odds: -110,
      sport: 'NBA'
    });
    setExpanded(false);
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      border: '1px solid #333',
      marginTop: '15px',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#00D4FF',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>➕</span> Add Leg Manually
        </span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} style={{ padding: '0 20px 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                PLAYER
              </label>
              <input
                type="text"
                value={formData.player}
                onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                placeholder="LeBron James"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                TEAM
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Lakers"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                BET TYPE
              </label>
              <select
                value={formData.bet_type}
                onChange={(e) => setFormData({ ...formData, bet_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              >
                <option value="spread">Spread</option>
                <option value="moneyline">Moneyline</option>
                <option value="total">Total</option>
                <option value="points">Points</option>
                <option value="rebounds">Rebounds</option>
                <option value="assists">Assists</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                SIDE
              </label>
              <select
                value={formData.side}
                onChange={(e) => setFormData({ ...formData, side: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              >
                <option value="Over">Over</option>
                <option value="Under">Under</option>
                <option value="Home">Home</option>
                <option value="Away">Away</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                LINE
              </label>
              <input
                type="text"
                value={formData.line}
                onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                placeholder="25.5"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                ODDS
              </label>
              <input
                type="number"
                value={formData.odds}
                onChange={(e) => setFormData({ ...formData, odds: parseInt(e.target.value) || -110 })}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#00D4FF',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Add Leg
          </button>
        </form>
      )}
    </div>
  );
};

// Parlay History Component
const ParlayHistory = ({ history, stats, getOutcomeColor }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Parlays</div>
          <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
            {stats.total || history.length}
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Wins</div>
          <div style={{ color: '#00FF88', fontSize: '24px', fontWeight: 'bold' }}>
            {stats.wins || history.filter(p => p.outcome === 'WIN').length}
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Win Rate</div>
          <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>
            {stats.win_rate?.toFixed(1) || '0'}%
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Profit</div>
          <div style={{
            color: (stats.profit || 0) >= 0 ? '#00FF88' : '#FF4444',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {(stats.profit || 0) >= 0 ? '+' : ''}${stats.profit?.toFixed(0) || 0}
          </div>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #333'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎰</span>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No parlays yet</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Build and place parlays to see your history here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((parlay, index) => (
            <div
              key={parlay.id || index}
              style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #333'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    backgroundColor: '#8B5CF620',
                    color: '#8B5CF6',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {parlay.legs?.length || 0}-LEG
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    {formatDate(parlay.created_at)}
                  </span>
                </div>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: `${getOutcomeColor(parlay.outcome)}20`,
                  color: getOutcomeColor(parlay.outcome),
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {parlay.outcome || 'PENDING'}
                </span>
              </div>

              {/* Legs Summary */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {(parlay.legs || []).slice(0, 4).map((leg, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#0a0a0f',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}
                  >
                    {leg.player || leg.team} {leg.side} {leg.line}
                  </span>
                ))}
                {(parlay.legs?.length || 0) > 4 && (
                  <span style={{
                    backgroundColor: '#0a0a0f',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    +{parlay.legs.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #333'
              }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>ODDS</span>
                    <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>
                      {parlay.combined_odds > 0 ? '+' : ''}{parlay.combined_odds}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>STAKE</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>${parlay.stake}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>
                    {parlay.outcome === 'WIN' ? 'WON' : 'TO WIN'}
                  </span>
                  <div style={{
                    color: parlay.outcome === 'WIN' ? '#00FF88' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    ${parlay.potential_payout || parlay.to_win || '0'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParlayBuilder;
