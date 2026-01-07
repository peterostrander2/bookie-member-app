import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Esoteric = () => {
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [awayTeam, setAwayTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [predictedTotal, setPredictedTotal] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEnergy, setLoadingEnergy] = useState(true);

  useEffect(() => {
    fetchTodayEnergy();
  }, []);

  const fetchTodayEnergy = async () => {
    setLoadingEnergy(true);
    try {
      const data = await api.getTodayEnergy();
      setTodayEnergy(data);
    } catch (err) {
      setTodayEnergy(MOCK_ENERGY);
    }
    setLoadingEnergy(false);
  };

  const analyzeMatchup = async () => {
    if (!awayTeam || !homeTeam) return;
    
    setLoading(true);
    try {
      const data = await api.analyzeEsoteric({
        away_team: awayTeam,
        home_team: homeTeam,
        game_date: gameDate,
        predicted_total: predictedTotal ? parseFloat(predictedTotal) : null
      });
      setAnalysis(data);
    } catch (err) {
      setAnalysis(MOCK_ANALYSIS);
    }
    setLoading(false);
  };

  const getMoonIcon = (phase) => {
    if (phase?.toLowerCase().includes('full')) return '🌕';
    if (phase?.toLowerCase().includes('new')) return '🌑';
    if (phase?.toLowerCase().includes('waxing')) return '🌓';
    if (phase?.toLowerCase().includes('waning')) return '🌗';
    return '🌙';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#FFD700', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🔮</span> Esoteric Edge
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Gematria • Numerology • Sacred Geometry • Astrology
          </p>
        </div>

        {/* Today's Cosmic Energy */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #8B5CF640'
        }}>
          <h2 style={{ color: '#FFD700', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ Today's Cosmic Energy
          </h2>
          
          {loadingEnergy ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                  {getMoonIcon(todayEnergy?.moon_phase)}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                  {todayEnergy?.moon_phase || 'Full Moon'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {todayEnergy?.moon_meaning || 'Normal Energy'}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#00D4FF', fontWeight: 'bold', marginBottom: '8px' }}>
                  {todayEnergy?.life_path || 7}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                  Life Path Number
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {todayEnergy?.life_path_meaning || 'Underdogs, unexpected'}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  backgroundColor: '#D4A574',
                  color: '#000',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {todayEnergy?.zodiac || 'Capricorn'}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                  Earth Sign
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {todayEnergy?.zodiac_meaning || 'Lean UNDERS'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analyze Matchup Form */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{ color: '#00D4FF', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚔️ Analyze Matchup
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Away Team</label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="e.g., Baltimore Ravens"
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
                placeholder="e.g., Pittsburgh Steelers"
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
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Predicted Total (optional)</label>
              <input
                type="number"
                value={predictedTotal}
                onChange={(e) => setPredictedTotal(e.target.value)}
                placeholder="e.g., 44.5"
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
            disabled={loading || !awayTeam || !homeTeam}
            style={{
              padding: '14px 28px',
              backgroundColor: loading ? '#333' : '#00D4FF',
              color: loading ? '#666' : '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔮 {loading ? 'Analyzing...' : 'Analyze Esoteric Edge'}
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Gematria */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '25px',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#00D4FF', fontSize: '18px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔢 Gematria Analysis
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: '#FF6B6B', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {analysis.gematria?.away_team || awayTeam.toLowerCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.away_simple || 79}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Simple</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.away_pythagorean || 7}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Pythagorean</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.away_reduced || 7}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Reduced</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div style={{ color: '#4ECDC4', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {analysis.gematria?.home_team || homeTeam.toLowerCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.home_simple || 103}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Simple</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.home_pythagorean || 4}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Pythagorean</div>
                    </div>
                    <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{analysis.gematria?.home_reduced || 4}</div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Reduced</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#00D4FF20',
                borderRadius: '8px',
                padding: '12px 20px',
                textAlign: 'center'
              }}>
                <span style={{ color: '#9ca3af' }}>Gematria Difference: </span>
                <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>
                  {analysis.gematria?.difference > 0 ? '+' : ''}{analysis.gematria?.difference || '+24'}
                </span>
                <span style={{ color: '#9ca3af' }}> (favors {analysis.gematria?.favors || 'Home'})</span>
              </div>
            </div>

            {/* Moon Phase & Numerology */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '16px',
                padding: '25px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#FFD700', fontSize: '18px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌙 Moon Phase
                </h3>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                  {analysis.moon?.phase || 'Full Moon'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Position: {analysis.moon?.position || '57.1%'}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '16px',
                padding: '25px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#8B5CF6', fontSize: '18px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔢 Numerology
                </h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '5px' }}>
                  {analysis.numerology?.life_path || 7}
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  {analysis.numerology?.meaning || 'Spirituality'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '10px' }}>
                  {analysis.numerology?.implication || 'Underdogs, unexpected'}
                </div>
                {analysis.numerology?.upset_energy && (
                  <div style={{
                    backgroundColor: '#8B5CF620',
                    color: '#8B5CF6',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🔄 Upset Energy Present
                  </div>
                )}
              </div>
            </div>

            {/* Sacred Geometry */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '25px',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#8B5CF6', fontSize: '18px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📐 Sacred Geometry (Tesla 3-6-9)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ backgroundColor: '#12121f', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {analysis.sacred_geometry?.predicted_total || 45}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Predicted Total</div>
                </div>
                
                <div style={{
                  backgroundColor: analysis.sacred_geometry?.is_tesla_369 ? '#8B5CF630' : '#12121f',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: analysis.sacred_geometry?.is_tesla_369 ? '1px solid #8B5CF6' : 'none'
                }}>
                  <div style={{ color: analysis.sacred_geometry?.is_tesla_369 ? '#8B5CF6' : '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {analysis.sacred_geometry?.digital_root || 9}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Digital Root</div>
                  {analysis.sacred_geometry?.is_tesla_369 && (
                    <div style={{ color: '#8B5CF6', fontSize: '11px', marginTop: '5px' }}>Tesla 3-6-9! ⚡</div>
                  )}
                </div>
                
                <div style={{ backgroundColor: '#12121f', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {analysis.sacred_geometry?.nearest_fibonacci || 55}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Nearest Fibonacci</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
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
            <div><span style={{ color: '#00D4FF', fontWeight: 'bold' }}>Gematria</span> - Assigns numerical values to team names. Higher values = more energy.</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Numerology</span> - Life path numbers reveal the energy of game dates. Power days (8, 11, 22) favor favorites.</div>
            <div><span style={{ color: '#FFD700', fontWeight: 'bold' }}>Moon Phases</span> - Full moons bring chaos and upsets. New moons favor underdogs.</div>
            <div><span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Sacred Geometry</span> - Tesla's 3-6-9 pattern and Fibonacci alignment reveal hidden patterns.</div>
            <div><span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>Zodiac Elements</span> - Fire = high scoring, Earth = defense, Air = upsets, Water = home teams.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MOCK_ENERGY = {
  moon_phase: 'Full Moon',
  moon_meaning: 'Normal Energy',
  life_path: 7,
  life_path_meaning: 'Underdogs, unexpected',
  zodiac: 'Capricorn',
  zodiac_meaning: 'Lean UNDERS'
};

const MOCK_ANALYSIS = {
  gematria: {
    away_team: 'ravens',
    home_team: 'steelers',
    away_simple: 79,
    away_pythagorean: 7,
    away_reduced: 7,
    home_simple: 103,
    home_pythagorean: 4,
    home_reduced: 4,
    difference: 24,
    favors: 'Home'
  },
  moon: {
    phase: 'Full Moon',
    position: '57.1%'
  },
  numerology: {
    life_path: 7,
    meaning: 'Spirituality',
    implication: 'Underdogs, unexpected',
    upset_energy: true
  },
  sacred_geometry: {
    predicted_total: 45,
    digital_root: 9,
    is_tesla_369: true,
    nearest_fibonacci: 55
  }
};

export default Esoteric;
