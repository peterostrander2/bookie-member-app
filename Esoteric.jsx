import React, { useState, useEffect } from 'react';
import api from './api';
import {
  getDailyEsotericReading,
  getGematriaAnalysis,
  calculateEsotericScore,
  compareChromeResonance,
  GEMATRIA_CIPHERS,
  POWER_NUMBERS,
  getEsotericTierInfo
} from './signalEngine';

const Esoteric = () => {
  const [dailyReading, setDailyReading] = useState(null);
  const [backendEnergy, setBackendEnergy] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [awayTeam, setAwayTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [spread, setSpread] = useState('');
  const [total, setTotal] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showCiphers, setShowCiphers] = useState(false);

  useEffect(() => {
    // Load daily reading on mount (frontend calculation as fallback)
    const reading = getDailyEsotericReading(new Date());
    setDailyReading(reading);

    // Also fetch from backend for historical accuracy data
    fetchBackendEnergy();
  }, []);

  const fetchBackendEnergy = async () => {
    setLoadingBackend(true);
    try {
      const data = await api.getTodayEnergy();
      if (data) {
        setBackendEnergy(data);
      }
    } catch (err) {
      console.error('Error fetching backend energy:', err);
    }
    setLoadingBackend(false);
  };

  const analyzeMatchup = () => {
    if (!awayTeam || !homeTeam) return;

    const gameData = {
      home_team: homeTeam,
      away_team: awayTeam,
      spread: spread ? parseFloat(spread) : null,
      total: total ? parseFloat(total) : null
    };

    const date = new Date(gameDate);
    const gematria = getGematriaAnalysis(homeTeam, awayTeam, date);
    const esoteric = calculateEsotericScore(gameData, date);
    const chrome = compareChromeResonance(awayTeam, homeTeam);

    setAnalysis({
      gematria,
      esoteric,
      chrome,
      tierInfo: getEsotericTierInfo(esoteric.esotericTier)
    });
  };

  const getMoonIcon = (phase) => {
    const icons = {
      new: '🌑', waxing_crescent: '🌒', first_quarter: '🌓', waxing_gibbous: '🌔',
      full: '🌕', waning_gibbous: '🌖', last_quarter: '🌗', waning_crescent: '🌘'
    };
    return icons[phase] || '🌙';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            color: '#FFD700',
            fontSize: '28px',
            margin: '0 0 5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🔮</span> Esoteric Edge
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Gematria • Numerology • Sacred Geometry • Cosmic Alignment
          </p>
        </div>

        {/* v20.5: VOID MOON WARNING — reads from today-energy void_of_course field */}
        {backendEnergy?.void_of_course?.is_void && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>Warning</span>
              <h3 style={{ color: '#EF4444', margin: 0, fontSize: '16px' }}>
                VOID MOON ACTIVE
              </h3>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '8px 0 0' }}>
              Traditional wisdom advises against initiating new bets during void-of-course.
            </p>
          </div>
        )}

        {/* TODAY'S COSMIC READING */}
        {dailyReading && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '25px',
            border: '1px solid #8B5CF640'
          }}>
            <h2 style={{ color: '#FFD700', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Today's Cosmic Reading
              <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'normal' }}>
                {dailyReading.date}
              </span>
              {/* v20.5: Sample data indicator — show when backend returns default/fallback data */}
              {(!backendEnergy || backendEnergy?.betting_outlook === 'NEUTRAL' && backendEnergy?.overall_energy === 5.0) && (
                <span style={{ fontSize: '10px', color: '#F59E0B', marginLeft: '8px' }}>
                  (estimated)
                </span>
              )}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
              {/* Moon Phase */}
              <div style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                  {dailyReading.moonEmoji}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {dailyReading.moonPhase.replace('_', ' ')}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  Moon Phase
                </div>
                {/* Historical accuracy from backend */}
                {backendEnergy?.moon_phase_accuracy && (
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: backendEnergy.moon_phase_accuracy.historical_edge > 0 ? '#00FF8820' : '#FF444420',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: backendEnergy.moon_phase_accuracy.historical_edge > 0 ? '#00FF88' : '#FF4444'
                  }}>
                    {backendEnergy.moon_phase_accuracy.historical_edge > 0 ? '+' : ''}
                    {backendEnergy.moon_phase_accuracy.historical_edge.toFixed(1)}% edge
                    <div style={{ color: '#6b7280', fontSize: '9px' }}>
                      ({backendEnergy.moon_phase_accuracy.sample_size} samples)
                    </div>
                  </div>
                )}
              </div>

              {/* Life Path */}
              <div style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: [8, 11, 22, 33].includes(dailyReading.lifePath) ? '#FFD700' : '#00D4FF',
                  marginBottom: '8px'
                }}>
                  {dailyReading.lifePath}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  Life Path
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {[8, 11, 22, 33].includes(dailyReading.lifePath) ? 'Master Number!' : 'Numerology'}
                </div>
                {/* Historical accuracy from backend */}
                {backendEnergy?.life_path_accuracy && (
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: backendEnergy.life_path_accuracy.historical_edge > 0 ? '#00FF8820' : '#FF444420',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: backendEnergy.life_path_accuracy.historical_edge > 0 ? '#00FF88' : '#FF4444'
                  }}>
                    {backendEnergy.life_path_accuracy.historical_edge > 0 ? '+' : ''}
                    {backendEnergy.life_path_accuracy.historical_edge.toFixed(1)}% edge
                    <div style={{ color: '#6b7280', fontSize: '9px' }}>
                      ({backendEnergy.life_path_accuracy.sample_size} samples)
                    </div>
                  </div>
                )}
              </div>

              {/* Planetary Ruler */}
              <div style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                  {dailyReading.planetaryRuler === 'Sun' ? '☀️' :
                   dailyReading.planetaryRuler === 'Moon' ? '🌙' :
                   dailyReading.planetaryRuler === 'Mars' ? '♂️' :
                   dailyReading.planetaryRuler === 'Mercury' ? '☿️' :
                   dailyReading.planetaryRuler === 'Jupiter' ? '♃' :
                   dailyReading.planetaryRuler === 'Venus' ? '♀️' : '♄'}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {dailyReading.planetaryRuler}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {dailyReading.dayOfWeek}
                </div>
              </div>

              {/* Tesla Number */}
              <div style={{
                backgroundColor: dailyReading.teslaAlignment === 'STRONG' ? '#8B5CF620' : '#12121f',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: dailyReading.teslaAlignment === 'STRONG' ? '1px solid #8B5CF6' : 'none'
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: dailyReading.teslaAlignment === 'STRONG' ? '#8B5CF6' : '#fff',
                  marginBottom: '8px'
                }}>
                  {dailyReading.teslaNumber}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  Tesla 3-6-9
                </div>
                <div style={{ color: dailyReading.teslaAlignment === 'STRONG' ? '#8B5CF6' : '#9ca3af', fontSize: '12px' }}>
                  {dailyReading.teslaAlignment === 'STRONG' ? '⚡ Active!' : 'Moderate'}
                </div>
              </div>
            </div>

            {/* Daily Insights */}
            <div style={{
              backgroundColor: '#12121f',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '15px'
            }}>
              <h4 style={{ color: '#00D4FF', fontSize: '14px', margin: '0 0 12px' }}>Today's Insights</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dailyReading.insights.map((insight, i) => (
                  <div key={i} style={{ color: '#d1d5db', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8B5CF6' }}>-</span> {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* v20.5: GLITCH signals are per-pick only (shown in GlitchSignalsPanel on pick cards) */}

            {/* v20.5: Phase 8 indicators — rivalry, streak, solar are per-pick only (shown on pick cards) */}
            {/* Mercury Retrograde status is not yet available from today-energy endpoint */}

            {/* Historical Accuracy — not yet available from today-energy endpoint */}
            {false && backendEnergy?.signal_accuracy && (
              <div style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                border: '1px solid #00FF8840'
              }}>
                <h4 style={{ color: '#00FF88', fontSize: '14px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Historical Accuracy
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>
                    (Last 30 days)
                  </span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.entries(backendEnergy.signal_accuracy).map(([signal, data]) => (
                    <div key={signal} style={{
                      backgroundColor: '#0a0a0f',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' }}>
                          {signal.replace(/_/g, ' ')}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          {data.description || `When ${signal} is active`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          color: data.edge > 0 ? '#00FF88' : data.edge < 0 ? '#FF4444' : '#9ca3af',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {data.edge > 0 ? '+' : ''}{data.edge?.toFixed(1) || '0.0'}%
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '10px' }}>
                          {data.win_rate?.toFixed(0) || 50}% win ({data.sample_size || 0})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Natural Bias & Recommendation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{
                backgroundColor: '#00D4FF15',
                borderRadius: '10px',
                padding: '15px',
                border: '1px solid #00D4FF30'
              }}>
                <div style={{ color: '#00D4FF', fontSize: '12px', marginBottom: '4px' }}>Natural Bias Today</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {dailyReading.naturalBias}
                </div>
              </div>
              <div style={{
                backgroundColor: '#FFD70015',
                borderRadius: '10px',
                padding: '15px',
                border: '1px solid #FFD70030'
              }}>
                <div style={{ color: '#FFD700', fontSize: '12px', marginBottom: '4px' }}>Recommendation</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>
                  {dailyReading.recommendation}
                </div>
              </div>
            </div>

            {/* Lucky Numbers */}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Lucky Numbers: </span>
              {dailyReading.luckyNumbers.map((num, i) => (
                <span key={i} style={{
                  backgroundColor: '#8B5CF620',
                  color: '#8B5CF6',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ANALYZE MATCHUP FORM */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{ color: '#00D4FF', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚔️ Analyze Matchup Gematria
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label htmlFor="esoteric-away-team" style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Away Team</label>
              <input
                id="esoteric-away-team"
                name="esotericAwayTeam"
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="e.g., Lakers"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="esoteric-home-team" style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Home Team</label>
              <input
                id="esoteric-home-team"
                name="esotericHomeTeam"
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="e.g., Celtics"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="esoteric-game-date" style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Game Date</label>
              <input
                id="esoteric-game-date"
                name="esotericGameDate"
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="esoteric-spread" style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Spread (opt)</label>
              <input
                id="esoteric-spread"
                name="esotericSpread"
                type="number"
                value={spread}
                onChange={(e) => setSpread(e.target.value)}
                placeholder="-3.5"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="esoteric-total" style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Total (opt)</label>
              <input
                id="esoteric-total"
                name="esotericTotal"
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="224.5"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            onClick={analyzeMatchup}
            disabled={!awayTeam || !homeTeam}
            style={{
              padding: '14px 28px',
              backgroundColor: (!awayTeam || !homeTeam) ? '#333' : '#8B5CF6',
              color: (!awayTeam || !homeTeam) ? '#666' : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: (!awayTeam || !homeTeam) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔮 Calculate Esoteric Edge
          </button>
        </div>

        {/* ANALYSIS RESULTS */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Esoteric Score Summary */}
            <div style={{
              background: `linear-gradient(135deg, ${analysis.tierInfo.color}20 0%, #1a1a2e 100%)`,
              borderRadius: '16px',
              padding: '25px',
              border: `1px solid ${analysis.tierInfo.color}40`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '10px' }}>
                {analysis.esoteric.esotericEmoji}
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: analysis.tierInfo.color,
                marginBottom: '5px'
              }}>
                {analysis.esoteric.esotericScore}%
              </div>
              <div style={{
                color: analysis.tierInfo.color,
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                {analysis.tierInfo.label}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                {analysis.tierInfo.description}
              </div>

              {analysis.gematria.favored && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#00FF8820',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  display: 'inline-block'
                }}>
                  <span style={{ color: '#00FF88', fontWeight: 'bold' }}>
                    Stars Favor: {analysis.gematria.favored === 'home' ? homeTeam : awayTeam}
                  </span>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                    {analysis.gematria.favorReason}
                  </div>
                </div>
              )}
            </div>

            {/* Gematria Breakdown */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '25px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#00D4FF', fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔢 Gematria Analysis
                </h3>
                <button
                  onClick={() => setShowCiphers(!showCiphers)}
                  style={{
                    backgroundColor: '#12121f',
                    border: '1px solid #333',
                    color: '#9ca3af',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {showCiphers ? 'Hide All Ciphers' : 'Show All Ciphers'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
                {/* Away Team */}
                <div>
                  <div style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {awayTeam} (Away)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: showCiphers ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.ordinal}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Ordinal</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.reduction}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Reduction</div>
                    </div>
                    {showCiphers && (
                      <>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.reverseOrdinal}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Reverse</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.jewish}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Jewish</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.sumerian}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Sumerian</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.awayValues.reverseReduction}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Rev. Red.</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Home Team */}
                <div>
                  <div style={{ color: '#4ECDC4', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {homeTeam} (Home)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: showCiphers ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.ordinal}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Ordinal</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.reduction}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Reduction</div>
                    </div>
                    {showCiphers && (
                      <>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.reverseOrdinal}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Reverse</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.jewish}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Jewish</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.sumerian}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Sumerian</div>
                        </div>
                        <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria.homeValues.reverseReduction}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Rev. Red.</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Alignments Found */}
              {analysis.gematria.alignments.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#FFD700', fontSize: '14px', margin: '0 0 12px' }}>⚡ Alignments Found</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {analysis.gematria.alignments.slice(0, 6).map((alignment, i) => (
                      <div key={i} style={{
                        backgroundColor: alignment.type === 'TESLA_ALIGNMENT' ? '#8B5CF620' :
                                        alignment.type === 'MASTER_NUMBER' ? '#FFD70020' :
                                        alignment.type === 'FIBONACCI' ? '#00FF8820' : '#00D4FF20',
                        border: `1px solid ${
                          alignment.type === 'TESLA_ALIGNMENT' ? '#8B5CF6' :
                          alignment.type === 'MASTER_NUMBER' ? '#FFD700' :
                          alignment.type === 'FIBONACCI' ? '#00FF88' : '#00D4FF'
                        }40`,
                        padding: '10px 15px',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}>
                        <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '2px' }}>
                          {alignment.type.replace('_', ' ')}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                          {alignment.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chrome Resonance Analysis */}
            {analysis.chrome && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '16px',
                padding: '25px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#EC4899', fontSize: '18px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📡 Chrome Resonance
                  <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'normal' }}>
                    ASCII Hex-Code Analysis
                  </span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  {/* Away Team Chrome */}
                  <div style={{
                    backgroundColor: analysis.chrome.favored === 'team1' ? '#EC489920' : '#12121f',
                    borderRadius: '12px',
                    padding: '20px',
                    border: analysis.chrome.favored === 'team1' ? '1px solid #EC4899' : '1px solid #333'
                  }}>
                    <div style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
                      {awayTeam} (Away)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Hex Average</span>
                      <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {analysis.chrome.team1.hexAverage}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Score</span>
                      <span style={{ color: '#EC4899', fontSize: '16px', fontWeight: 'bold' }}>
                        {analysis.chrome.team1.score}
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: '#0a0a0f',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginTop: '10px'
                    }}>
                      <div style={{ color: '#D8B4FE', fontSize: '11px' }}>
                        {analysis.chrome.team1.resonance.replace('_', ' ')}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                        {analysis.chrome.team1.insight}
                      </div>
                    </div>
                  </div>

                  {/* Home Team Chrome */}
                  <div style={{
                    backgroundColor: analysis.chrome.favored === 'team2' ? '#EC489920' : '#12121f',
                    borderRadius: '12px',
                    padding: '20px',
                    border: analysis.chrome.favored === 'team2' ? '1px solid #EC4899' : '1px solid #333'
                  }}>
                    <div style={{ color: '#4ECDC4', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
                      {homeTeam} (Home)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Hex Average</span>
                      <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {analysis.chrome.team2.hexAverage}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Score</span>
                      <span style={{ color: '#EC4899', fontSize: '16px', fontWeight: 'bold' }}>
                        {analysis.chrome.team2.score}
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: '#0a0a0f',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginTop: '10px'
                    }}>
                      <div style={{ color: '#D8B4FE', fontSize: '11px' }}>
                        {analysis.chrome.team2.resonance.replace('_', ' ')}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                        {analysis.chrome.team2.insight}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chrome Favored */}
                {analysis.chrome.favored && (
                  <div style={{
                    backgroundColor: '#EC489920',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #EC489940',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '13px' }}>
                      📡 Chrome Favors: {analysis.chrome.favored === 'team1' ? awayTeam : homeTeam}
                    </span>
                    <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>
                      {analysis.chrome.favorReason}
                    </div>
                  </div>
                )}

                {/* Optimal Reference */}
                <div style={{ marginTop: '15px', textAlign: 'center', color: '#6b7280', fontSize: '11px' }}>
                  Optimal resonance: 77 (M = middle letter) • Range: 65-90 (A-Z)
                </div>
              </div>
            )}

            {/* Component Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
              {/* Gematria */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔢</div>
                <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                  {analysis.esoteric.components.gematria.score}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Gematria</div>
                <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                  Weight: {analysis.esoteric.components.gematria.weight}%
                </div>
              </div>

              {/* Moon */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {getMoonIcon(analysis.esoteric.components.moon.phase)}
                </div>
                <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>
                  {analysis.esoteric.components.moon.score}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Moon</div>
                <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                  {analysis.esoteric.components.moon.phase.replace('_', ' ')}
                </div>
              </div>

              {/* Numerology */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔮</div>
                <div style={{ color: '#8B5CF6', fontSize: '24px', fontWeight: 'bold' }}>
                  {analysis.esoteric.components.numerology.score}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Numerology</div>
                <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                  Life Path {analysis.esoteric.components.numerology.lifePath}
                </div>
              </div>

              {/* Geometry */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
                <div style={{ color: '#EC4899', fontSize: '24px', fontWeight: 'bold' }}>
                  {analysis.esoteric.components.geometry.score}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Geometry</div>
                <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                  Line: {analysis.esoteric.components.geometry.line || 'N/A'}
                </div>
              </div>

              {/* Zodiac */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>♈</div>
                <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: 'bold' }}>
                  {analysis.esoteric.components.zodiac.score}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Zodiac</div>
                <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                  {analysis.esoteric.components.zodiac.ruler}
                </div>
              </div>
            </div>

            {/* Top Insights */}
            {analysis.esoteric.topInsights.length > 0 && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: '#FFD700', fontSize: '14px', margin: '0 0 12px' }}>💡 Key Insights</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.esoteric.topInsights.map((insight, i) => (
                    <div key={i} style={{ color: '#d1d5db', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#8B5CF6' }}>✦</span> {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT SECTION */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '25px',
          marginTop: '25px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#FFD700', fontSize: '16px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📚 About Esoteric Edge
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#9ca3af', fontSize: '14px' }}>
            <div><span style={{ color: '#00D4FF', fontWeight: 'bold' }}>Gematria (35%)</span> - 6 cipher methods: Ordinal, Reverse, Reduction, Jewish, Sumerian. Finds Tesla 3-6-9, Master Numbers, Fibonacci alignments.</div>
            <div><span style={{ color: '#FFD700', fontWeight: 'bold' }}>Moon Phase (20%)</span> - Full moons bring chaos. New moons favor underdogs. Waxing = momentum.</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Numerology (20%)</span> - Daily life path number. Master numbers (11, 22, 33) = powerful days.</div>
            <div><span style={{ color: '#EC4899', fontWeight: 'bold' }}>Chrome Resonance</span> - ASCII hex-code analysis. Optimal at 77 (middle letter). Tesla bonus when mod 9 = 3/6/9.</div>
            <div><span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Zodiac (10%)</span> - Planetary rulers influence daily energy. Mars = aggression, Saturn = discipline.</div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#8B5CF620',
            borderRadius: '10px',
            border: '1px solid #8B5CF640'
          }}>
            <div style={{ color: '#D8B4FE', fontSize: '13px' }}>
              <strong>🌟 Cosmic Confluence:</strong> When Esoteric Edge aligns with our research-backed signals (sharp money, RLM, pace),
              you get maximum conviction. Use esoteric as <em>additional confluence</em>, not the sole factor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Esoteric;
