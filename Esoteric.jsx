import React, { useState, useEffect } from 'react';
import {
  getDailyEsotericReading,
  getGematriaAnalysis,
  calculateEsotericScore,
  GEMATRIA_CIPHERS,
  POWER_NUMBERS,
  getEsotericTierInfo
} from './signalEngine';

const Esoteric = () => {
  const [dailyReading, setDailyReading] = useState(null);
  const [awayTeam, setAwayTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [spread, setSpread] = useState('');
  const [total, setTotal] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showCiphers, setShowCiphers] = useState(false);

  useEffect(() => {
    // Load daily reading on mount (frontend calculation)
    const reading = getDailyEsotericReading(new Date());
    setDailyReading(reading);
  }, []);

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

    setAnalysis({
      gematria,
      esoteric,
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
              ✨ Today's Cosmic Reading
              <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'normal' }}>
                {dailyReading.date}
              </span>
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
              <h4 style={{ color: '#00D4FF', fontSize: '14px', margin: '0 0 12px' }}>📊 Today's Insights</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dailyReading.insights.map((insight, i) => (
                  <div key={i} style={{ color: '#d1d5db', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8B5CF6' }}>•</span> {insight}
                  </div>
                ))}
              </div>
            </div>

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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Away Team</label>
              <input
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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Home Team</label>
              <input
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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Game Date</label>
              <input
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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Spread (opt)</label>
              <input
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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Total (opt)</label>
              <input
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
            <div><span style={{ color: '#EC4899', fontWeight: 'bold' }}>Sacred Geometry (15%)</span> - Fibonacci lines, Tesla divisible spreads/totals.</div>
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

        {/* GEMATRIA COMMUNITY SOURCES */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '25px',
          marginTop: '25px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#00D4FF', fontSize: '16px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>𝕏</span> Gematria Research Community
          </h3>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 20px' }}>
            The algo's esoteric layer pulls from multi-ciphers, mod9 roots, and trigger stacks (33/93/201/322)
            inspired by these community researchers. Follow for daily decodes and narrative analysis.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {/* @GematriaClub */}
            <a
              href="https://x.com/GematriaClub"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#FFD70020',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>🏆</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@GematriaClub</div>
                  <div style={{ color: '#FFD700', fontSize: '11px' }}>OG Account</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Classic sports gematria. Heavy on rigged outcomes, triggers, and daily decodes. One of the OGs.
              </div>
            </a>

            {/* @ScriptLeaker */}
            <a
              href="https://x.com/ScriptLeaker"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#8B5CF620',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>📜</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@ScriptLeaker</div>
                  <div style={{ color: '#8B5CF6', fontSize: '11px' }}>Narrative Scripts</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Detailed MLB/NFL picks with gematria. Series scores, player milestones, venue echoes. Direct scripting style.
              </div>
            </a>

            {/* @GematriaEffect */}
            <a
              href="https://x.com/GematriaEffect"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#00FF8820',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>📚</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@GematriaEffect</div>
                  <div style={{ color: '#00FF88', fontSize: '11px' }}>Zach Hubbard</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Foundational researcher. Books and videos on gematria in sports, news, and world events.
              </div>
            </a>

            {/* @psgematria */}
            <a
              href="https://x.com/psgematria"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#00D4FF20',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>🎯</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@psgematria</div>
                  <div style={{ color: '#00D4FF', fontSize: '11px' }}>Pro Sports Gematria</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Professional sports focused decodes. Clean analysis and daily picks.
              </div>
            </a>

            {/* @HitaLickPicks */}
            <a
              href="https://x.com/HitaLickPicks"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#EC489920',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>🔥</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@HitaLickPicks</div>
                  <div style={{ color: '#EC4899', fontSize: '11px' }}>Futures & Daily</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Rigged sports decoding with gematria. Futures plays and daily breakdowns.
              </div>
            </a>

            {/* @GiveMeCloutBets */}
            <a
              href="https://x.com/GiveMeCloutBets"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#F59E0B20',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}>📊</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>@GiveMeCloutBets</div>
                  <div style={{ color: '#F59E0B', fontSize: '11px' }}>Sheets & Stats</div>
                </div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4' }}>
                Exposing rigged games with detailed gematria sheets and statistical breakdowns.
              </div>
            </a>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#00D4FF10',
            borderRadius: '10px',
            border: '1px solid #00D4FF30'
          }}>
            <div style={{ color: '#00D4FF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span>
              <span>
                Our dual engine fuses these community methods probabilistically for EV, not pure rigging claims.
                Use these accounts for deeper dives and narrative context.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Esoteric;
