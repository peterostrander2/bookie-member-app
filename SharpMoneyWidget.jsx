/**
 * SHARP MONEY WIDGET
 *
 * Compact dashboard widget showing top 3 sharp money alerts.
 * Links to full SharpAlerts page for details.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

const SharpMoneyWidget = ({ sport = 'NBA' }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharpAlerts();
  }, [sport]);

  const loadSharpAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getSharpMoney(sport).catch(() => null);

      let sharpPlays = [];

      if (data?.signals) {
        sharpPlays = data.signals;
      } else if (data?.games || Array.isArray(data)) {
        const games = data?.games || data || [];
        sharpPlays = games.map(game => {
          const ticketPct = game.ticket_pct || game.public_pct || 50;
          const moneyPct = game.money_pct || game.sharp_pct || 50;
          const divergence = Math.abs(moneyPct - ticketPct);

          return {
            ...game,
            ticket_pct: ticketPct,
            money_pct: moneyPct,
            divergence,
            has_alert: divergence >= 15
          };
        }).filter(g => g.has_alert);
      }

      // Sort by divergence and take top 3
      sharpPlays.sort((a, b) => (b.divergence || 0) - (a.divergence || 0));
      setAlerts(sharpPlays.slice(0, 3));
    } catch (err) {
      console.error('Failed to load sharp alerts:', err);
      setAlerts([]);
    }
    setLoading(false);
  };

  const getStrengthLabel = (divergence) => {
    if (divergence >= 25) return { label: 'STRONG', color: '#00FF88' };
    if (divergence >= 20) return { label: 'MOD', color: '#00D4FF' };
    return { label: 'MILD', color: '#FFD700' };
  };

  // Don't render if no alerts
  if (!loading && alerts.length === 0) return null;

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      border: '1px solid #333'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🦈</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Sharp Money</span>
          <span style={{
            backgroundColor: '#00FF8820',
            color: '#00FF88',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {sport}
          </span>
        </div>
        <Link to="/sharp" style={{
          color: '#00D4FF',
          fontSize: '12px',
          textDecoration: 'none'
        }}>
          View All →
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          Scanning for sharp action...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alert, idx) => {
            const strength = getStrengthLabel(alert.divergence || 0);
            const isSharpOnUnderdog = (alert.money_pct || 0) < (alert.ticket_pct || 0);

            return (
              <div key={idx} style={{
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                padding: '12px',
                borderLeft: `3px solid ${strength.color}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                      {alert.away_team} @ {alert.home_team}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>
                      {isSharpOnUnderdog ? 'Sharps on underdog' : 'Sharps on favorite'}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: strength.color + '20',
                    color: strength.color,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {strength.label}
                  </span>
                </div>

                {/* Compact divergence bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '4px',
                      backgroundColor: '#333',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${alert.money_pct || 50}%`,
                        backgroundColor: '#00FF88',
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                  <span style={{
                    color: strength.color,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    minWidth: '35px'
                  }}>
                    {alert.divergence || 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SharpMoneyWidget;
