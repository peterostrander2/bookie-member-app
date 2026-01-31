/**
 * DAILY SUMMARY
 *
 * End-of-day recap showing:
 * - All picks made
 * - Results and P/L
 * - Signal performance
 * - CLV captured
 * - Trends and insights
 */

import React, { useState, useEffect } from 'react';
import { getAllPicks, getStats } from './clvTracker';

const DailySummary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayData();
  }, [selectedDate]);

  const loadDayData = () => {
    setLoading(true);
    const allPicks = getAllPicks();
    const stats = getStats();

    // Filter picks for selected date
    const selectedDateStr = new Date(selectedDate).toDateString();
    const dayPicks = allPicks.filter(p => {
      const pickDate = new Date(p.timestamp).toDateString();
      return pickDate === selectedDateStr;
    });

    // Calculate day stats
    const gradedPicks = dayPicks.filter(p => p.result);
    const wins = gradedPicks.filter(p => p.result === 'WIN').length;
    const losses = gradedPicks.filter(p => p.result === 'LOSS').length;
    const pushes = gradedPicks.filter(p => p.result === 'PUSH').length;

    // CLV stats
    const picksWithCLV = dayPicks.filter(p => p.clv !== undefined && p.clv !== null);
    const avgCLV = picksWithCLV.length > 0
      ? picksWithCLV.reduce((sum, p) => sum + (p.clv || 0), 0) / picksWithCLV.length
      : null;
    const positiveCLV = picksWithCLV.filter(p => p.clv > 0).length;

    // Group by tier
    const tierBreakdown = {};
    dayPicks.forEach(p => {
      const tier = p.tier || 'UNKNOWN';
      if (!tierBreakdown[tier]) {
        tierBreakdown[tier] = { total: 0, wins: 0, losses: 0 };
      }
      tierBreakdown[tier].total++;
      if (p.result === 'WIN') tierBreakdown[tier].wins++;
      if (p.result === 'LOSS') tierBreakdown[tier].losses++;
    });

    // Group by sport
    const sportBreakdown = {};
    dayPicks.forEach(p => {
      const sport = p.sport || 'UNKNOWN';
      if (!sportBreakdown[sport]) {
        sportBreakdown[sport] = { total: 0, wins: 0, losses: 0 };
      }
      sportBreakdown[sport].total++;
      if (p.result === 'WIN') sportBreakdown[sport].wins++;
      if (p.result === 'LOSS') sportBreakdown[sport].losses++;
    });

    setDayData({
      date: selectedDate,
      picks: dayPicks,
      total: dayPicks.length,
      graded: gradedPicks.length,
      pending: dayPicks.length - gradedPicks.length,
      wins,
      losses,
      pushes,
      winRate: gradedPicks.length > 0 ? (wins / (wins + losses)) * 100 : null,
      avgCLV,
      positiveCLV,
      totalCLVPicks: picksWithCLV.length,
      tierBreakdown,
      sportBreakdown,
      overallStats: stats
    });

    setLoading(false);
  };

  const getGradeColor = (result) => {
    if (result === 'WIN') return '#00FF88';
    if (result === 'LOSS') return '#FF4444';
    if (result === 'PUSH') return '#FFD700';
    return '#6b7280';
  };

  const getTierColor = (tier) => {
    const colors = {
      GOLDEN_CONVERGENCE: '#FFD700',
      SUPER_SIGNAL: '#00FF88',
      HARMONIC_ALIGNMENT: '#00D4FF',
      PARTIAL_ALIGNMENT: '#9ca3af'
    };
    return colors[tier] || '#9ca3af';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get available dates
  const getAvailableDates = () => {
    const allPicks = getAllPicks();
    const dates = new Set(allPicks.map(p =>
      new Date(p.timestamp).toISOString().split('T')[0]
    ));
    return Array.from(dates).sort().reverse().slice(0, 30);
  };

  const availableDates = getAvailableDates();

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px' }}>
              Daily Summary
            </h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
              {formatDate(selectedDate)}
            </p>
          </div>

          <select
            id="daily-summary-date"
            name="dailySummaryDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              backgroundColor: '#1a1a2e',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '10px 15px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </option>
            ))}
            {availableDates.length === 0 && (
              <option value={selectedDate}>Today</option>
            )}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            Loading summary...
          </div>
        ) : !dayData || dayData.total === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Picks This Day</h3>
            <p style={{ color: '#9ca3af' }}>
              No tracked picks found for {formatDate(selectedDate)}
            </p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#00D4FF', fontSize: '32px', fontWeight: 'bold' }}>
                  {dayData.total}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Total Picks</div>
              </div>

              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#00FF88', fontSize: '32px', fontWeight: 'bold' }}>
                  {dayData.wins}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Wins</div>
              </div>

              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#FF4444', fontSize: '32px', fontWeight: 'bold' }}>
                  {dayData.losses}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Losses</div>
              </div>

              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <div style={{
                  color: dayData.winRate >= 55 ? '#00FF88' : dayData.winRate >= 50 ? '#FFD700' : '#FF4444',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  {dayData.winRate ? `${dayData.winRate.toFixed(0)}%` : '--'}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Win Rate</div>
              </div>

              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #333'
              }}>
                <div style={{
                  color: dayData.avgCLV > 0 ? '#00FF88' : dayData.avgCLV < 0 ? '#FF4444' : '#9ca3af',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  {dayData.avgCLV !== null ? (dayData.avgCLV > 0 ? '+' : '') + dayData.avgCLV.toFixed(1) : '--'}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Avg CLV</div>
              </div>
            </div>

            {/* Tier Breakdown */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>
                Performance by Tier
              </h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {Object.entries(dayData.tierBreakdown).map(([tier, data]) => (
                  <div key={tier} style={{
                    flex: '1 1 200px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px',
                    padding: '15px',
                    borderLeft: `3px solid ${getTierColor(tier)}`
                  }}>
                    <div style={{ color: getTierColor(tier), fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
                      {tier.replace(/_/g, ' ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '12px' }}>
                      <span>{data.total} picks</span>
                      <span style={{ color: '#00FF88' }}>{data.wins}W</span>
                      <span style={{ color: '#FF4444' }}>{data.losses}L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sport Breakdown */}
            {Object.keys(dayData.sportBreakdown).length > 0 && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>
                  Performance by Sport
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {Object.entries(dayData.sportBreakdown).map(([sport, data]) => (
                    <div key={sport} style={{
                      flex: '1 1 150px',
                      backgroundColor: '#0a0a0f',
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#00D4FF', fontWeight: 'bold', marginBottom: '8px' }}>
                        {sport}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
                        {data.wins}-{data.losses}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>
                        {data.total} picks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Picks */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>
                All Picks ({dayData.picks.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dayData.picks.map((pick, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    borderLeft: `3px solid ${getGradeColor(pick.result)}`
                  }}>
                    {/* Result badge */}
                    <div style={{
                      width: '50px',
                      textAlign: 'center',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: getGradeColor(pick.result) + '20',
                      color: getGradeColor(pick.result)
                    }}>
                      {pick.result || 'PEND'}
                    </div>

                    {/* Pick info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                        {pick.away_team || pick.game?.away_team || 'Away'} @ {pick.home_team || pick.game?.home_team || 'Home'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {pick.side || 'N/A'} {pick.line ?? '--'} ({pick.odds > 0 ? '+' : ''}{pick.odds ?? '--'})
                      </div>
                    </div>

                    {/* Confidence */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: (pick.confidence || 0) >= 80 ? '#FFD700' : (pick.confidence || 0) >= 70 ? '#00FF88' : '#00D4FF',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {pick.confidence ?? '--'}%
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '10px' }}>conf</div>
                    </div>

                    {/* CLV */}
                    {pick.clv !== undefined && pick.clv !== null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: pick.clv > 0 ? '#00FF88' : pick.clv < 0 ? '#FF4444' : '#9ca3af',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {pick.clv > 0 ? '+' : ''}{pick.clv.toFixed(1)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '10px' }}>CLV</div>
                      </div>
                    )}

                    {/* Tier */}
                    <div style={{
                      backgroundColor: getTierColor(pick.tier) + '20',
                      color: getTierColor(pick.tier),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {(pick.tier || 'UNKNOWN').replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CLV Insights */}
            {dayData.totalCLVPicks > 0 && (
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '20px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>
                  CLV Insights
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                    <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                      {dayData.totalCLVPicks}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>Picks w/ CLV Data</div>
                  </div>
                  <div style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                    <div style={{ color: '#00FF88', fontSize: '24px', fontWeight: 'bold' }}>
                      {dayData.positiveCLV}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>Positive CLV</div>
                  </div>
                  <div style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                    <div style={{
                      color: (dayData.positiveCLV / dayData.totalCLVPicks * 100) >= 50 ? '#00FF88' : '#FF4444',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {((dayData.positiveCLV / dayData.totalCLVPicks) * 100).toFixed(0)}%
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>Positive CLV Rate</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailySummary;
