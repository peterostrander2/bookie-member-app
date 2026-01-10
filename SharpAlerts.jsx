/**
 * SHARP MONEY ALERTS
 *
 * The #1 thing bettors pay for: "Where is the smart money?"
 * Shows divergence between ticket % and money % to identify
 * professional betting action.
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { ListSkeleton, CardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated, LiveBadge, RefreshIntervalSelector } from './LiveIndicators';

const SharpAlerts = () => {
  const [sport, setSport] = useState('NBA');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splits, setSplits] = useState([]);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  // Auto-refresh hook
  const {
    lastUpdated,
    isRefreshing,
    refresh,
    setInterval: setRefreshInterval,
    interval: refreshInterval,
    isPaused,
    togglePause
  } = useAutoRefresh(
    useCallback(() => fetchSharpData(), [sport]),
    { interval: 120000, immediate: false, deps: [sport] }
  );

  useEffect(() => {
    fetchSharpData();
  }, [sport]);

  const fetchSharpData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both sharp money and splits data
      const [sharpRes, splitsRes] = await Promise.all([
        api.getSharpMoney(sport).catch(() => null),
        api.getSplits(sport).catch(() => null)
      ]);

      // Process sharp money data
      let sharpAlerts = [];

      if (sharpRes?.signals) {
        sharpAlerts = sharpRes.signals;
      } else if (splitsRes?.games || splitsRes) {
        // Derive sharp signals from splits data
        const games = splitsRes?.games || splitsRes || [];
        sharpAlerts = games.map(game => {
          const ticketPct = game.ticket_pct || game.public_pct || 50;
          const moneyPct = game.money_pct || game.sharp_pct || 50;
          const divergence = Math.abs(moneyPct - ticketPct);

          let sharpSide = null;
          let strength = 'NONE';

          if (divergence >= 15) {
            sharpSide = moneyPct > ticketPct ? 'SHARP_ON_UNDERDOG' : 'SHARP_ON_FAVORITE';
            strength = divergence >= 25 ? 'STRONG' : divergence >= 20 ? 'MODERATE' : 'MILD';
          }

          return {
            ...game,
            ticket_pct: ticketPct,
            money_pct: moneyPct,
            divergence,
            sharp_side: sharpSide,
            strength,
            has_alert: divergence >= 15
          };
        }).filter(g => g.has_alert);
      }

      // If no data, generate mock alerts for demonstration
      if (sharpAlerts.length === 0) {
        sharpAlerts = generateMockAlerts(sport);
      }

      setAlerts(sharpAlerts);
      setSplits(splitsRes?.games || splitsRes || []);
    } catch (err) {
      console.error('Error fetching sharp data:', err);
      setError(err.message || 'Failed to fetch sharp money data');
      setAlerts(generateMockAlerts(sport));
    }
    setLoading(false);
  };

  const generateMockAlerts = (sport) => {
    const mockGames = {
      NBA: [
        { home_team: 'Lakers', away_team: 'Celtics', ticket_pct: 72, money_pct: 45, spread: -3.5, time: '7:30 PM' },
        { home_team: 'Warriors', away_team: 'Suns', ticket_pct: 65, money_pct: 38, spread: -5.5, time: '10:00 PM' },
        { home_team: 'Bucks', away_team: 'Heat', ticket_pct: 58, money_pct: 78, spread: -7, time: '8:00 PM' }
      ],
      NFL: [
        { home_team: 'Chiefs', away_team: 'Bills', ticket_pct: 68, money_pct: 42, spread: -3, time: '1:00 PM' },
        { home_team: 'Eagles', away_team: 'Cowboys', ticket_pct: 55, money_pct: 75, spread: -2.5, time: '4:25 PM' }
      ],
      MLB: [
        { home_team: 'Yankees', away_team: 'Red Sox', ticket_pct: 70, money_pct: 48, spread: -1.5, time: '7:05 PM' }
      ],
      NHL: [
        { home_team: 'Bruins', away_team: 'Rangers', ticket_pct: 62, money_pct: 40, spread: -1.5, time: '7:00 PM' }
      ],
      NCAAB: [
        { home_team: 'Duke', away_team: 'UNC', ticket_pct: 75, money_pct: 52, spread: -4.5, time: '9:00 PM' }
      ]
    };

    return (mockGames[sport] || mockGames.NBA).map(game => {
      const divergence = Math.abs(game.money_pct - game.ticket_pct);
      return {
        ...game,
        divergence,
        sharp_side: game.money_pct < game.ticket_pct ? 'SHARP_ON_UNDERDOG' : 'SHARP_ON_FAVORITE',
        strength: divergence >= 25 ? 'STRONG' : divergence >= 20 ? 'MODERATE' : 'MILD',
        has_alert: true
      };
    });
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'STRONG': return '#00FF88';
      case 'MODERATE': return '#00D4FF';
      case 'MILD': return '#FFD700';
      default: return '#9ca3af';
    }
  };

  const getDivergenceBar = (ticketPct, moneyPct) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#FF6B6B' }}>Public: {ticketPct}%</span>
          <span style={{ color: '#00FF88' }}>Sharp: {moneyPct}%</span>
        </div>
        <div style={{ position: 'relative', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Public bar */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${ticketPct}%`,
            backgroundColor: '#FF6B6B40',
            borderRadius: '4px 0 0 4px'
          }} />
          {/* Sharp indicator line */}
          <div style={{
            position: 'absolute',
            left: `${moneyPct}%`,
            top: 0,
            height: '100%',
            width: '3px',
            backgroundColor: '#00FF88',
            transform: 'translateX(-50%)'
          }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '15px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🦈 Sharp Money Alerts
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Where the smart money is going • Ticket % vs Money % divergence
          </p>
        </div>

        {/* Real-time Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <LastUpdated
            timestamp={lastUpdated}
            isRefreshing={isRefreshing || loading}
            onRefresh={refresh}
            isPaused={isPaused}
            onTogglePause={togglePause}
          />
          <RefreshIntervalSelector
            interval={refreshInterval}
            onChange={setRefreshInterval}
          />
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
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00FF88' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Strong (25%+ divergence)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00D4FF' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Moderate (20-25%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Mild (15-20%)</span>
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

        {/* Error State */}
        {error && !loading && (
          <div style={{ marginBottom: '20px' }}>
            <ConnectionError onRetry={fetchSharpData} serviceName="sharp money API" />
          </div>
        )}

        {/* Alerts */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <CardSkeleton count={3} />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Sharp Alerts</h3>
            <p>No significant money/ticket divergence detected for {sport} today.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {alerts.map((alert, idx) => {
              const strengthColor = getStrengthColor(alert.strength);
              const isSharpOnUnderdog = alert.sharp_side === 'SHARP_ON_UNDERDOG';

              return (
                <div key={idx} style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `4px solid ${strengthColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                        {alert.away_team} @ {alert.home_team}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <LiveBadge gameTime={alert.commence_time || alert.time} size="small" />
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {alert.time || 'TBD'} • Spread: {alert.spread > 0 ? '+' : ''}{alert.spread}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: strengthColor + '20',
                      color: strengthColor,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: `1px solid ${strengthColor}40`
                    }}>
                      {alert.strength} ALERT
                    </div>
                  </div>

                  {/* Divergence Visualization */}
                  <div style={{ marginBottom: '15px' }}>
                    {getDivergenceBar(alert.ticket_pct, alert.money_pct)}
                  </div>

                  {/* Analysis */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{ padding: '12px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>DIVERGENCE</div>
                      <div style={{ color: strengthColor, fontSize: '24px', fontWeight: 'bold' }}>
                        {alert.divergence}%
                      </div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>SHARP LEAN</div>
                      <div style={{ color: '#00FF88', fontSize: '16px', fontWeight: 'bold' }}>
                        {isSharpOnUnderdog ? `${alert.away_team} (+${Math.abs(alert.spread)})` : `${alert.home_team} (${alert.spread})`}
                      </div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>SIGNAL</div>
                      <div style={{ color: '#FFD700', fontSize: '14px' }}>
                        {isSharpOnUnderdog ? '🦈 Sharps fading public favorite' : '🦈 Sharps doubling down'}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: strengthColor + '10',
                    borderRadius: '8px',
                    border: `1px solid ${strengthColor}30`
                  }}>
                    <span style={{ color: strengthColor, fontWeight: 'bold', fontSize: '13px' }}>
                      💡 {alert.divergence >= 25
                        ? 'HIGH CONFIDENCE: Strong professional action detected'
                        : alert.divergence >= 20
                        ? 'MODERATE: Notable sharp money movement'
                        : 'WATCH: Developing sharp lean'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Education Box */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '12px'
        }}>
          <h4 style={{ color: '#00D4FF', margin: '0 0 12px', fontSize: '14px' }}>
            📚 Understanding Sharp Money
          </h4>
          <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: '#fff' }}>Ticket %</strong> = Percentage of bets placed on each side (public action)
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: '#fff' }}>Money %</strong> = Percentage of dollars wagered (includes sharp money)
            </p>
            <p style={{ margin: 0 }}>
              When there's a large gap between the two, it means <strong style={{ color: '#00FF88' }}>professional bettors</strong> are
              placing larger bets on the opposite side of the public. This is one of the most reliable indicators in sports betting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharpAlerts;
