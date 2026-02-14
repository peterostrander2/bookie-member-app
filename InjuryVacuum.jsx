/**
 * INJURY VACUUM DISPLAY
 *
 * When a key player is OUT, their usage/touches/targets
 * have to go somewhere. This creates opportunity.
 *
 * "Hospital Fade" = Fade teams missing key players
 * "Usage Vacuum" = Target players who absorb the usage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const InjuryVacuum = () => {
  const navigate = useNavigate();
  const [sport, setSport] = useState('NBA');
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];

  // Navigate to Smash Spots with search filter
  const viewAffectedPicks = (searchTerm) => {
    navigate(`/smash-spots?search=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    fetchInjuries();
  }, [sport]);

  const fetchInjuries = async () => {
    setLoading(true);
    try {
      const data = await api.getInjuries(sport);

      if (data?.injuries || Array.isArray(data)) {
        const injuryData = data.injuries || data;
        // Group by team and enhance with vacuum analysis
        const enhanced = enhanceWithVacuumAnalysis(injuryData, sport);
        setInjuries(enhanced);
      } else {
        // No injury data available
        setInjuries([]);
      }
    } catch (err) {
      console.error('Error fetching injuries:', err);
      setInjuries([]);
    }
    setLoading(false);
  };

  const enhanceWithVacuumAnalysis = (injuryData, sport) => {
    // Group by team
    const byTeam = {};
    injuryData.forEach(injury => {
      const team = injury.team;
      if (!byTeam[team]) {
        byTeam[team] = {
          team,
          opponent: injury.opponent || 'TBD',
          game_time: injury.game_time || 'TBD',
          injuries: [],
          vacuum: null
        };
      }
      byTeam[team].injuries.push(injury);
    });

    // Add vacuum analysis
    return Object.values(byTeam).map(teamData => {
      const outPlayers = teamData.injuries.filter(i =>
        i.status === 'OUT' || i.status === 'DOUBTFUL'
      );

      const usageLost = outPlayers.reduce((sum, p) => sum + (p.usage || 0), 0);
      const hasHighImpact = outPlayers.some(p => p.impact === 'HIGH' || p.impact === 'CRITICAL');

      teamData.vacuum = {
        total_usage_lost: usageLost,
        beneficiaries: [],
        team_impact: hasHighImpact ? 'SIGNIFICANT' : outPlayers.length > 0 ? 'MODERATE' : 'MINIMAL',
        recommendation: getRecommendation(outPlayers, sport)
      };

      return teamData;
    }).filter(t => t.injuries.length > 0);
  };

  const getRecommendation = (outPlayers, sport) => {
    if (outPlayers.length === 0) return 'No actionable injuries';

    const hasCritical = outPlayers.some(p => p.impact === 'CRITICAL');
    const hasHigh = outPlayers.some(p => p.impact === 'HIGH');

    if (hasCritical) {
      return sport === 'NBA' || sport === 'NHL'
        ? 'STRONG FADE team spread + UNDER'
        : 'FADE team, monitor line movement';
    }

    if (hasHigh) {
      return 'Consider FADE spread, lean UNDER';
    }

    return 'Monitor situation, no strong play';
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'OUT': return '#FF4444';
      case 'DOUBTFUL': return '#FF8844';
      case 'QUESTIONABLE': return '#FFD700';
      case 'PROBABLE': return '#00FF88';
      default: return '#9ca3af';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toUpperCase()) {
      case 'CRITICAL': return '#FF4444';
      case 'HIGH': return '#FF8844';
      case 'MEDIUM': return '#FFD700';
      case 'LOW': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏥 Injury Vacuum
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            When stars go out, opportunity opens up • Usage redistribution analysis
          </p>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#1a1a2e',
          borderRadius: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF4444' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>OUT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF8844' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>DOUBTFUL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>QUESTIONABLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00FF88' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>PROBABLE</span>
          </div>
        </div>

        {/* Sport Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding: '10px 20px',
                backgroundColor: sport === s ? '#00D4FF' : '#1a1a2e',
                color: sport === s ? '#000' : '#9ca3af',
                border: sport === s ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: sport === s ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Injury Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏥</div>
            Scanning injury reports...
          </div>
        ) : injuries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>All Clear</h3>
            <p>No significant injuries reported for {sport} today.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {injuries.map((team, idx) => (
              <div key={idx} style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                overflow: 'hidden',
                borderLeft: `4px solid ${team.vacuum?.team_impact === 'CRITICAL' ? '#FF4444' :
                  team.vacuum?.team_impact === 'SIGNIFICANT' ? '#FF8844' : '#FFD700'}`
              }}>
                {/* Team Header */}
                <div style={{
                  padding: '15px 20px',
                  backgroundColor: '#12121f',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                      {team.team}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      vs {team.opponent} • {team.game_time}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => viewAffectedPicks(team.team)}
                      style={{
                        backgroundColor: '#00D4FF20',
                        color: '#00D4FF',
                        border: '1px solid #00D4FF50',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🎯 View Affected Picks
                    </button>
                    <div style={{
                      backgroundColor: getImpactColor(team.vacuum?.team_impact) + '20',
                      color: getImpactColor(team.vacuum?.team_impact),
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {team.vacuum?.team_impact} IMPACT
                    </div>
                  </div>
                </div>

                {/* Injured Players */}
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>
                      Injured Players
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {team.injuries.map((injury, iIdx) => (
                        <div key={iIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: '#0a0a0f',
                          borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              backgroundColor: getStatusColor(injury.status) + '20',
                              color: getStatusColor(injury.status),
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              minWidth: '80px',
                              textAlign: 'center'
                            }}>
                              {injury.status}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 'bold' }}>{injury.player}</div>
                              <div style={{ color: '#6b7280', fontSize: '12px' }}>{injury.position}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {sport === 'NBA' && injury.usage && (
                              <div style={{ color: '#FF8844', fontSize: '14px', fontWeight: 'bold' }}>
                                {injury.usage}% USG
                              </div>
                            )}
                            {injury.points && (
                              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                {injury.points} PPG
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vacuum Analysis */}
                  {team.vacuum && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: team.vacuum.beneficiaries?.length > 0 ? '1fr 1fr' : '1fr',
                      gap: '15px'
                    }}>
                      {/* Beneficiaries */}
                      {team.vacuum.beneficiaries?.length > 0 && (
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>
                            🎯 Usage Beneficiaries
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {team.vacuum.beneficiaries.map((ben, bIdx) => (
                              <div key={bIdx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: '#00FF8810',
                                borderRadius: '6px',
                                border: '1px solid #00FF8830'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#fff' }}>{ben.player}</span>
                                  <button
                                    onClick={() => viewAffectedPicks(ben.player)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      color: '#8B5CF6',
                                      border: '1px solid #8B5CF650',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Props →
                                  </button>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ color: '#00FF88', fontWeight: 'bold' }}>
                                    {ben.usage_boost}
                                  </span>
                                  {ben.projected_boost && (
                                    <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '8px' }}>
                                      ({ben.projected_boost})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>
                          💡 Recommendation
                        </div>
                        <div style={{
                          padding: '15px',
                          backgroundColor: '#FFD70010',
                          borderRadius: '8px',
                          border: '1px solid #FFD70030'
                        }}>
                          <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px' }}>
                            {team.vacuum.recommendation}
                          </div>
                          {team.vacuum.total_usage_lost > 0 && (
                            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '8px' }}>
                              Total usage void: <span style={{ color: '#FF8844' }}>{team.vacuum.total_usage_lost}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hospital Fade Rule */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '12px'
        }}>
          <h4 style={{ color: '#FF4444', margin: '0 0 12px', fontSize: '14px' }}>
            🏥 The Hospital Fade Rule
          </h4>
          <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: '#fff' }}>Never bet on teams missing key players.</strong> The market
              often doesn't adjust enough for star absences.
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>In NBA: A top-15 player OUT = typically 3-5 point swing</li>
              <li>In NFL: Starting QB OUT = typically 5-7 point swing</li>
              <li>Look for usage vacuum opportunities on player props</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InjuryVacuum;
