/**
 * HISTORICAL CHARTS PAGE
 *
 * Comprehensive performance visualization over time.
 * Shows win rate trends, P/L, sport breakdowns, and streaks.
 */

import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import { LineChart, AreaChart, BarChart, Sparkline } from './Charts';

const HistoricalCharts = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 7d, 30d, 90d, all
  const [chartType, setChartType] = useState('profit'); // profit, winrate, volume

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBetHistory();
      setBets(data.bets || []);
      setError(null);
    } catch (err) {
      setError('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  // Filter bets by time range
  const filteredBets = useMemo(() => {
    if (timeRange === 'all') return bets;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return bets.filter(bet => {
      const betDate = new Date(bet.created_at || bet.date);
      return betDate >= cutoff;
    });
  }, [bets, timeRange]);

  // Get graded bets only
  const gradedBets = useMemo(() => {
    return filteredBets.filter(b => b.outcome && b.outcome !== 'PUSH');
  }, [filteredBets]);

  // Calculate cumulative profit data
  const profitData = useMemo(() => {
    const data = [];
    let cumulative = 0;

    gradedBets.forEach((bet, i) => {
      const stake = bet.stake || 100;
      const odds = bet.odds || -110;

      if (bet.outcome === 'WIN') {
        const profit = odds > 0 ? (stake * odds / 100) : (stake * 100 / Math.abs(odds));
        cumulative += profit;
      } else if (bet.outcome === 'LOSS') {
        cumulative -= stake;
      }

      const date = new Date(bet.created_at || bet.date);
      data.push({
        value: cumulative,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        result: bet.outcome
      });
    });

    return data;
  }, [gradedBets]);

  // Calculate rolling win rate data
  const winRateData = useMemo(() => {
    const windowSize = Math.min(10, Math.floor(gradedBets.length / 2)) || 5;
    if (gradedBets.length < windowSize) return [];

    const data = [];
    for (let i = windowSize - 1; i < gradedBets.length; i++) {
      const windowBets = gradedBets.slice(i - windowSize + 1, i + 1);
      const wins = windowBets.filter(b => b.outcome === 'WIN').length;
      const winRate = (wins / windowSize) * 100;

      const date = new Date(gradedBets[i].created_at || gradedBets[i].date);
      data.push({
        value: winRate,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return data;
  }, [gradedBets]);

  // Calculate daily volume data
  const volumeData = useMemo(() => {
    const dailyMap = new Map();

    filteredBets.forEach(bet => {
      const date = new Date(bet.created_at || bet.date);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { bets: 0, wins: 0, losses: 0 });
      }

      const day = dailyMap.get(dateKey);
      day.bets++;
      if (bet.outcome === 'WIN') day.wins++;
      if (bet.outcome === 'LOSS') day.losses++;
    });

    return Array.from(dailyMap.entries()).map(([label, data]) => ({
      label,
      value: data.bets,
      wins: data.wins,
      losses: data.losses
    }));
  }, [filteredBets]);

  // Sport breakdown
  const sportBreakdown = useMemo(() => {
    const sports = {};

    gradedBets.forEach(bet => {
      const sport = (bet.sport || 'Unknown').toUpperCase();
      if (!sports[sport]) {
        sports[sport] = { wins: 0, losses: 0, profit: 0 };
      }

      const stake = bet.stake || 100;
      const odds = bet.odds || -110;

      if (bet.outcome === 'WIN') {
        sports[sport].wins++;
        sports[sport].profit += odds > 0 ? (stake * odds / 100) : (stake * 100 / Math.abs(odds));
      } else {
        sports[sport].losses++;
        sports[sport].profit -= stake;
      }
    });

    return Object.entries(sports).map(([sport, data]) => ({
      sport,
      ...data,
      total: data.wins + data.losses,
      winRate: data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  }, [gradedBets]);

  // Bet type breakdown
  const betTypeBreakdown = useMemo(() => {
    const types = {};

    gradedBets.forEach(bet => {
      const type = bet.bet_type || (bet.player ? 'Player Prop' : 'Game');
      if (!types[type]) {
        types[type] = { wins: 0, losses: 0 };
      }

      if (bet.outcome === 'WIN') {
        types[type].wins++;
      } else {
        types[type].losses++;
      }
    });

    return Object.entries(types).map(([type, data]) => ({
      type,
      ...data,
      total: data.wins + data.losses,
      winRate: (data.wins / (data.wins + data.losses)) * 100
    })).sort((a, b) => b.total - a.total);
  }, [gradedBets]);

  // Current streak
  const currentStreak = useMemo(() => {
    if (gradedBets.length === 0) return { type: null, count: 0 };

    const reversed = [...gradedBets].reverse();
    const firstResult = reversed[0].outcome;
    let count = 0;

    for (const bet of reversed) {
      if (bet.outcome === firstResult) {
        count++;
      } else {
        break;
      }
    }

    return { type: firstResult, count };
  }, [gradedBets]);

  // Best/worst streaks
  const streakStats = useMemo(() => {
    let bestWin = 0, worstLoss = 0, currentWin = 0, currentLoss = 0;

    gradedBets.forEach(bet => {
      if (bet.outcome === 'WIN') {
        currentWin++;
        currentLoss = 0;
        bestWin = Math.max(bestWin, currentWin);
      } else {
        currentLoss++;
        currentWin = 0;
        worstLoss = Math.max(worstLoss, currentLoss);
      }
    });

    return { bestWin, worstLoss };
  }, [gradedBets]);

  // Overall stats
  const overallStats = useMemo(() => {
    const wins = gradedBets.filter(b => b.outcome === 'WIN').length;
    const losses = gradedBets.filter(b => b.outcome === 'LOSS').length;
    const total = wins + losses;

    let totalProfit = 0;
    gradedBets.forEach(bet => {
      const stake = bet.stake || 100;
      const odds = bet.odds || -110;
      if (bet.outcome === 'WIN') {
        totalProfit += odds > 0 ? (stake * odds / 100) : (stake * 100 / Math.abs(odds));
      } else {
        totalProfit -= stake;
      }
    });

    const totalStaked = gradedBets.reduce((sum, b) => sum + (b.stake || 100), 0);
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    return {
      wins,
      losses,
      total,
      winRate: total > 0 ? (wins / total) * 100 : 0,
      profit: totalProfit,
      roi
    };
  }, [gradedBets]);

  // Calendar heatmap data (last 30 days)
  const calendarData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayBets = bets.filter(bet => {
        const betDate = new Date(bet.created_at || bet.date);
        return betDate.toISOString().split('T')[0] === dateStr;
      });

      const wins = dayBets.filter(b => b.outcome === 'WIN').length;
      const losses = dayBets.filter(b => b.outcome === 'LOSS').length;

      days.push({
        date: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        wins,
        losses,
        total: dayBets.length,
        net: wins - losses
      });
    }

    return days;
  }, [bets]);

  const getChartData = () => {
    switch (chartType) {
      case 'profit': return profitData;
      case 'winrate': return winRateData;
      case 'volume': return volumeData;
      default: return profitData;
    }
  };

  const getChartColor = () => {
    switch (chartType) {
      case 'profit': return overallStats.profit >= 0 ? '#00FF88' : '#FF4444';
      case 'winrate': return '#00D4FF';
      case 'volume': return '#FFD700';
      default: return '#00D4FF';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#6b7280'
        }}>
          Loading historical data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #FF444450'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⚠️</span>
          <h3 style={{ color: '#FF4444', marginBottom: '8px' }}>{error}</h3>
          <button
            onClick={loadData}
            style={{
              padding: '10px 24px',
              backgroundColor: '#00D4FF20',
              color: '#00D4FF',
              border: '1px solid #00D4FF50',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>📈</span> Performance Analytics
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Track your betting performance over time
        </p>
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <StatCard label="Win Rate" value={`${overallStats.winRate.toFixed(1)}%`} color="#00D4FF" />
        <StatCard label="Record" value={`${overallStats.wins}-${overallStats.losses}`} color="#9ca3af" />
        <StatCard
          label="Profit/Loss"
          value={`${overallStats.profit >= 0 ? '+' : ''}$${overallStats.profit.toFixed(0)}`}
          color={overallStats.profit >= 0 ? '#00FF88' : '#FF4444'}
        />
        <StatCard label="ROI" value={`${overallStats.roi >= 0 ? '+' : ''}${overallStats.roi.toFixed(1)}%`} color={overallStats.roi >= 0 ? '#00FF88' : '#FF4444'} />
        <StatCard
          label="Current Streak"
          value={currentStreak.count > 0 ? `${currentStreak.count} ${currentStreak.type === 'WIN' ? 'W' : 'L'}` : '-'}
          color={currentStreak.type === 'WIN' ? '#00FF88' : '#FF4444'}
        />
        <StatCard label="Best Win Streak" value={`${streakStats.bestWin} W`} color="#00FF88" />
      </div>

      {/* Time Range & Chart Type Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: 'all', label: 'All Time' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              style={{
                padding: '8px 16px',
                backgroundColor: timeRange === key ? '#00D4FF20' : '#1a1a2e',
                color: timeRange === key ? '#00D4FF' : '#9ca3af',
                border: `1px solid ${timeRange === key ? '#00D4FF50' : '#333'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: timeRange === key ? 'bold' : 'normal'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'profit', label: 'P/L' },
            { key: 'winrate', label: 'Win Rate' },
            { key: 'volume', label: 'Volume' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChartType(key)}
              style={{
                padding: '8px 16px',
                backgroundColor: chartType === key ? '#1a1a2e' : 'transparent',
                color: chartType === key ? '#fff' : '#6b7280',
                border: `1px solid ${chartType === key ? '#333' : 'transparent'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #333',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>
          {chartType === 'profit' && 'Cumulative Profit/Loss'}
          {chartType === 'winrate' && 'Rolling Win Rate (10-bet window)'}
          {chartType === 'volume' && 'Daily Betting Volume'}
        </h3>

        {getChartData().length >= 2 ? (
          chartType === 'profit' ? (
            <AreaChart
              data={getChartData()}
              width={Math.min(window.innerWidth - 80, 1100)}
              height={280}
              positiveColor="#00FF88"
              negativeColor="#FF4444"
              label="Cumulative P/L (Units)"
            />
          ) : (
            <LineChart
              data={getChartData()}
              width={Math.min(window.innerWidth - 80, 1100)}
              height={280}
              color={getChartColor()}
              showDots={getChartData().length <= 30}
              label={chartType === 'winrate' ? 'Win Rate (%)' : 'Bets Per Day'}
              formatValue={chartType === 'winrate' ? (v) => `${v.toFixed(0)}%` : (v) => v.toFixed(0)}
            />
          )
        ) : (
          <div style={{
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            Not enough data to display chart. Place more bets and grade them to see trends.
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Sport Breakdown */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Performance by Sport
          </h3>

          {sportBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sportBreakdown.map(({ sport, wins, losses, winRate, profit }) => (
                <div key={sport} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#0a0a0f',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{sport}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{wins}W - {losses}L</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>{winRate.toFixed(0)}%</div>
                    <div style={{
                      color: profit >= 0 ? '#00FF88' : '#FF4444',
                      fontSize: '12px'
                    }}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
                    </div>
                  </div>
                  <div style={{ width: '80px', marginLeft: '12px' }}>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#333',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${winRate}%`,
                        height: '100%',
                        backgroundColor: winRate >= 55 ? '#00FF88' : winRate >= 50 ? '#FFD700' : '#FF4444',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No sport data available
            </div>
          )}
        </div>

        {/* Bet Type Breakdown */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Performance by Bet Type
          </h3>

          {betTypeBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {betTypeBreakdown.map(({ type, wins, losses, winRate }) => (
                <div key={type} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#0a0a0f',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{type}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{wins}W - {losses}L</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: winRate >= 55 ? '#00FF88' : winRate >= 50 ? '#FFD700' : '#FF4444',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {winRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No bet type data available
            </div>
          )}
        </div>
      </div>

      {/* 30-Day Activity Calendar */}
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #333',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
          Last 30 Days Activity
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
          gap: '4px'
        }}>
          {calendarData.map((day, i) => {
            const intensity = day.total === 0 ? 0
              : day.net > 0 ? Math.min(1, day.net / 3)
              : Math.min(1, Math.abs(day.net) / 3);

            const bgColor = day.total === 0 ? '#1a1a2e'
              : day.net > 0 ? `rgba(0, 255, 136, ${0.2 + intensity * 0.6})`
              : day.net < 0 ? `rgba(255, 68, 68, ${0.2 + intensity * 0.6})`
              : 'rgba(255, 215, 0, 0.3)';

            return (
              <div
                key={i}
                title={`${day.date}: ${day.wins}W ${day.losses}L (${day.total} bets)`}
                style={{
                  aspectRatio: '1',
                  backgroundColor: bgColor,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: day.total > 0 ? '#fff' : '#333',
                  cursor: 'default',
                  border: '1px solid #333'
                }}
              >
                {day.day}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '16px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#00FF8860', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>Winning Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#FF444460', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>Losing Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#FFD70050', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>Break Even</span>
          </div>
        </div>
      </div>

      {/* Recent Results Strip */}
      {gradedBets.length > 0 && (
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
            Recent Results (Last 20)
          </h3>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {gradedBets.slice(-20).map((bet, i) => (
              <div
                key={i}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: bet.outcome === 'WIN' ? '#00FF8830' : '#FF444430',
                  color: bet.outcome === 'WIN' ? '#00FF88' : '#FF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                {bet.outcome === 'WIN' ? 'W' : 'L'}
              </div>
            ))}
          </div>

          {profitData.length >= 5 && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>P/L Trend:</span>
              <Sparkline
                data={profitData.slice(-20)}
                width={200}
                height={40}
                color={overallStats.profit >= 0 ? '#00FF88' : '#FF4444'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Stat Card Component (memoized to prevent re-renders)
const StatCard = React.memo(({ label, value, color }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ color, fontSize: '22px', fontWeight: 'bold' }}>
      {value}
    </div>
  </div>
));

export default HistoricalCharts;
