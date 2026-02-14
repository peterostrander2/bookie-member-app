/**
 * PROOF 7: Daily Report Card (Grader Display)
 *
 * Displays the daily grading report from the backend:
 * - Picks graded count
 * - Win rate by tier (TITANIUM, GOLD_STAR, EDGE_LEAN)
 * - Overall win rate
 * - CLV metrics
 *
 * Shows "Report not available yet" before 6 AM ET.
 */

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { TIERS } from '../../core/frontend_scoring_contract';

// Tier colors matching the rest of the app
const TIER_COLORS = {
  [TIERS.TITANIUM]: '#00FFFF',
  [TIERS.TITANIUM_SMASH]: '#00FFFF',
  [TIERS.GOLD_STAR]: '#FFD700',
  [TIERS.EDGE_LEAN]: '#10B981',
};

/**
 * Check if it's before 6 AM ET
 */
function isBeforeReportTime() {
  const now = new Date();
  // Convert to ET (UTC-5 or UTC-4 depending on DST)
  const etOffset = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
  const etHour = parseInt(etOffset, 10);
  return etHour < 6;
}

/**
 * Format date for display
 */
function formatReportDate(dateStr) {
  if (!dateStr) return 'Today';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const DailyReportCard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [beforeReportTime, setBeforeReportTime] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      // Check if before 6 AM ET
      if (isBeforeReportTime()) {
        setBeforeReportTime(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch daily report from grader endpoint
        const data = await api.getDailyGraderReport();

        if (cancelled) return;

        if (!data || data.error) {
          setError(data?.error || 'Report not available');
        } else {
          setReport(data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load report');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReport();
    return () => { cancelled = true; };
  }, []);

  // Before 6 AM state
  if (beforeReportTime) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Daily Grading Report
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '30px',
          color: '#6b7280',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌙</div>
          <div style={{ fontSize: '14px' }}>Report not available yet</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Daily report generates at 6:00 AM ET
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
          📊 Daily Grading Report
        </h3>
        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
          Loading report...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
          📊 Daily Grading Report
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#F59E0B',
          fontSize: '13px',
        }}>
          {error}
        </div>
      </div>
    );
  }

  // No report data
  if (!report) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
          📊 Daily Grading Report
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280',
          fontSize: '13px',
        }}>
          No grading data available for today
        </div>
      </div>
    );
  }

  // Extract data from report
  const {
    date,
    total_picks = 0,
    graded_picks = 0,
    overall_win_rate = 0,
    tier_performance = {},
    clv_metrics = {},
    sports_breakdown = {},
  } = report;

  // Calculate pending picks
  const pendingPicks = total_picks - graded_picks;

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Daily Grading Report
        </h3>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>
          {formatReportDate(date)}
        </span>
      </div>

      {/* Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* Graded Picks */}
        <div style={{
          backgroundColor: '#0a0a0f',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
            Graded
          </div>
          <div style={{ color: '#00D4FF', fontSize: '20px', fontWeight: 'bold' }}>
            {graded_picks}
          </div>
          {pendingPicks > 0 && (
            <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
              +{pendingPicks} pending
            </div>
          )}
        </div>

        {/* Overall Win Rate */}
        <div style={{
          backgroundColor: '#0a0a0f',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
            Win Rate
          </div>
          <div style={{
            color: overall_win_rate >= 55 ? '#00FF88' : overall_win_rate >= 50 ? '#FFD700' : '#FF4444',
            fontSize: '20px',
            fontWeight: 'bold',
          }}>
            {overall_win_rate.toFixed(1)}%
          </div>
        </div>

        {/* CLV */}
        {clv_metrics.avg_clv !== undefined && (
          <div style={{
            backgroundColor: '#0a0a0f',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
              Avg CLV
            </div>
            <div style={{
              color: clv_metrics.avg_clv >= 0 ? '#00FF88' : '#FF4444',
              fontSize: '20px',
              fontWeight: 'bold',
            }}>
              {clv_metrics.avg_clv >= 0 ? '+' : ''}{clv_metrics.avg_clv.toFixed(2)}
            </div>
          </div>
        )}

        {/* Positive CLV Rate */}
        {clv_metrics.positive_clv_rate !== undefined && (
          <div style={{
            backgroundColor: '#0a0a0f',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
              CLV+ Rate
            </div>
            <div style={{
              color: clv_metrics.positive_clv_rate >= 50 ? '#00FF88' : '#FFD700',
              fontSize: '20px',
              fontWeight: 'bold',
            }}>
              {clv_metrics.positive_clv_rate.toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Tier Performance */}
      {Object.keys(tier_performance).length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>
            Performance by Tier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(tier_performance).map(([tier, data]) => (
              <div
                key={tier}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#0a0a0f',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${TIER_COLORS[tier] || '#6b7280'}`,
                }}
              >
                <span style={{
                  color: TIER_COLORS[tier] || '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100px',
                }}>
                  {tier.replace(/_/g, ' ')}
                </span>
                <div style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: '#333',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(data.win_rate || 0, 100)}%`,
                    height: '100%',
                    backgroundColor: TIER_COLORS[tier] || '#6b7280',
                    borderRadius: '3px',
                  }} />
                </div>
                <span style={{
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '50px',
                  textAlign: 'right',
                }}>
                  {(data.win_rate || 0).toFixed(1)}%
                </span>
                <span style={{ color: '#6b7280', fontSize: '11px', width: '50px' }}>
                  ({data.count || 0})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sports Breakdown (if available) */}
      {Object.keys(sports_breakdown).length > 0 && (
        <div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>
            By Sport
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            {Object.entries(sports_breakdown).map(([sport, data]) => (
              <div
                key={sport}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0a0a0f',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{sport}</span>
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                  {data.wins || 0}W-{data.losses || 0}L
                </span>
                <span style={{
                  marginLeft: '8px',
                  color: (data.win_rate || 0) >= 50 ? '#00FF88' : '#FF4444',
                }}>
                  ({(data.win_rate || 0).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportCard;
