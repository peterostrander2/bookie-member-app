/**
 * INJURY VACUUM ENHANCED v2.0
 *
 * Comprehensive injury analysis with:
 * - Player headshots and profiles
 * - Severity indicators (OUT, DOUBTFUL, QUESTIONABLE, PROBABLE)
 * - Estimated return dates
 * - Usage vacuum flowchart visualization
 * - Impact scoring (Critical, High, Medium, Low)
 * - Historical context and betting implications
 * - Injury alerts system (push notifications, email)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from './api';
import { CardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { sendNotification, notificationService } from './notifications';

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const INJURY_STATUS = {
  OUT: { color: '#FF4444', bgColor: 'rgba(255,68,68,0.15)', label: 'OUT', priority: 1 },
  DOUBTFUL: { color: '#FF8844', bgColor: 'rgba(255,136,68,0.15)', label: 'DOUBTFUL', priority: 2 },
  QUESTIONABLE: { color: '#FFD700', bgColor: 'rgba(255,215,0,0.15)', label: 'QUESTIONABLE', priority: 3 },
  PROBABLE: { color: '#00FF88', bgColor: 'rgba(0,255,136,0.15)', label: 'PROBABLE', priority: 4 },
  GTD: { color: '#9333EA', bgColor: 'rgba(147,51,234,0.15)', label: 'GAME-TIME', priority: 2 }
};

const IMPACT_LEVELS = {
  CRITICAL: { color: '#FF4444', icon: '🔴', label: 'Critical Impact', description: 'Franchise player, team identity changes' },
  HIGH: { color: '#FF8844', icon: '🟠', label: 'High Impact', description: 'Star player, significant drop-off' },
  MEDIUM: { color: '#FFD700', icon: '🟡', label: 'Medium Impact', description: 'Rotation player, depth concern' },
  LOW: { color: '#9ca3af', icon: '⚪', label: 'Low Impact', description: 'Bench player, minimal effect' }
};

// Player avatar generator (would be real API in production)
const getPlayerAvatar = (playerName, team) => {
  // Generate a consistent color based on player name
  const hash = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return {
    type: 'initials',
    initials: playerName.split(' ').map(n => n[0]).join('').slice(0, 2),
    bgColor: `hsl(${hue}, 70%, 40%)`,
    // In production, this would be a real URL
    imageUrl: null
  };
};

// Mock enhanced injury data
const generateEnhancedMockData = (sport) => {
  const mockData = {
    NBA: [
      {
        team: 'Lakers',
        teamLogo: '🟡',
        opponent: 'Celtics',
        opponentLogo: '🟢',
        game_time: '7:30 PM',
        game_date: 'Tonight',
        injuries: [
          {
            id: 'lal-ad',
            player: 'Anthony Davis',
            status: 'OUT',
            position: 'PF/C',
            injury: 'Left knee soreness',
            impact: 'CRITICAL',
            usage: 28.5,
            points: 24.1,
            rebounds: 12.4,
            assists: 3.5,
            estimatedReturn: '2-3 games',
            lastUpdate: '2 hours ago',
            gamesOut: 0,
            daysOnReport: 1
          },
          {
            id: 'lal-ar',
            player: 'Austin Reaves',
            status: 'QUESTIONABLE',
            position: 'SG',
            injury: 'Right ankle sprain',
            impact: 'MEDIUM',
            usage: 21.2,
            points: 15.8,
            rebounds: 4.2,
            assists: 5.1,
            estimatedReturn: 'Game-time decision',
            lastUpdate: '30 min ago',
            gamesOut: 0,
            daysOnReport: 3
          }
        ],
        vacuum: {
          total_usage_lost: 28.5,
          beneficiaries: [
            { player: 'Rui Hachimura', position: 'SF/PF', usage_boost: '+8%', usage_before: 18.2, usage_after: 26.2, projected_boost: '+6.5 pts', confidence: 85 },
            { player: 'Jaxson Hayes', position: 'C', usage_boost: '+5%', usage_before: 12.4, usage_after: 17.4, projected_boost: '+4.2 pts', confidence: 72 },
            { player: "D'Angelo Russell", position: 'PG', usage_boost: '+4%', usage_before: 24.8, usage_after: 28.8, projected_boost: '+3.1 pts', confidence: 78 }
          ],
          team_impact: 'CRITICAL',
          recommendation: 'FADE Lakers spread, heavy lean UNDER'
        },
        historical: {
          record_without: { wins: 3, losses: 7, ats: '3-7' },
          avg_margin_without: -8.5,
          over_under_without: '4-6 U',
          last_5_without: ['L', 'L', 'W', 'L', 'L'],
          betting_trend: 'Team is 3-7 ATS without Anthony Davis this season',
          key_insight: 'Lakers offense drops 12.3 PPG without AD, defense allows +8.2 PPG'
        }
      },
      {
        team: 'Warriors',
        teamLogo: '🔵',
        opponent: 'Suns',
        opponentLogo: '🟠',
        game_time: '10:00 PM',
        game_date: 'Tonight',
        injuries: [
          {
            id: 'gsw-sc',
            player: 'Stephen Curry',
            status: 'OUT',
            position: 'PG',
            injury: 'Right ankle sprain',
            impact: 'CRITICAL',
            usage: 31.2,
            points: 29.4,
            rebounds: 4.5,
            assists: 6.1,
            estimatedReturn: '1-2 weeks',
            lastUpdate: '4 hours ago',
            gamesOut: 2,
            daysOnReport: 5
          }
        ],
        vacuum: {
          total_usage_lost: 31.2,
          beneficiaries: [
            { player: 'Klay Thompson', position: 'SG', usage_boost: '+10%', usage_before: 22.4, usage_after: 32.4, projected_boost: '+8.2 pts', confidence: 82 },
            { player: 'Brandin Podziemski', position: 'SG', usage_boost: '+7%', usage_before: 15.8, usage_after: 22.8, projected_boost: '+5.5 pts', confidence: 76 },
            { player: 'Jonathan Kuminga', position: 'SF', usage_boost: '+6%', usage_before: 19.2, usage_after: 25.2, projected_boost: '+4.8 pts', confidence: 70 }
          ],
          team_impact: 'CRITICAL',
          recommendation: 'STRONG FADE Warriors, heavy UNDER play'
        },
        historical: {
          record_without: { wins: 5, losses: 12, ats: '6-11' },
          avg_margin_without: -6.2,
          over_under_without: '7-10 U',
          last_5_without: ['L', 'W', 'L', 'L', 'W'],
          betting_trend: 'Warriors are 6-11 ATS without Stephen Curry',
          key_insight: 'Warriors lose identity without Curry, offense drops 15.8 PPG'
        }
      },
      {
        team: 'Bucks',
        teamLogo: '🟢',
        opponent: 'Heat',
        opponentLogo: '🔴',
        game_time: '8:00 PM',
        game_date: 'Tonight',
        injuries: [
          {
            id: 'mil-giannis',
            player: 'Giannis Antetokounmpo',
            status: 'DOUBTFUL',
            position: 'PF',
            injury: 'Left calf strain',
            impact: 'CRITICAL',
            usage: 35.2,
            points: 31.2,
            rebounds: 11.8,
            assists: 5.9,
            estimatedReturn: 'Day-to-day',
            lastUpdate: '1 hour ago',
            gamesOut: 0,
            daysOnReport: 2
          },
          {
            id: 'mil-dame',
            player: 'Damian Lillard',
            status: 'PROBABLE',
            position: 'PG',
            injury: 'Right hamstring tightness',
            impact: 'HIGH',
            usage: 29.8,
            points: 26.4,
            rebounds: 4.2,
            assists: 7.1,
            estimatedReturn: 'Expected to play',
            lastUpdate: '3 hours ago',
            gamesOut: 0,
            daysOnReport: 1
          }
        ],
        vacuum: {
          total_usage_lost: 35.2,
          beneficiaries: [
            { player: 'Khris Middleton', position: 'SF', usage_boost: '+12%', usage_before: 22.1, usage_after: 34.1, projected_boost: '+9.8 pts', confidence: 80 },
            { player: 'Bobby Portis', position: 'PF/C', usage_boost: '+8%', usage_before: 18.5, usage_after: 26.5, projected_boost: '+6.2 pts', confidence: 74 }
          ],
          team_impact: 'CRITICAL',
          recommendation: 'FADE Bucks if Giannis ruled out'
        },
        historical: {
          record_without: { wins: 2, losses: 5, ats: '2-5' },
          avg_margin_without: -4.8,
          over_under_without: '3-4 U',
          last_5_without: ['L', 'W', 'L', 'L', 'W'],
          betting_trend: 'Bucks are 2-5 ATS without Giannis this season',
          key_insight: 'Bucks become one-dimensional without Giannis, rely heavily on 3PT'
        }
      }
    ],
    NFL: [
      {
        team: 'Chiefs',
        teamLogo: '🔴',
        opponent: 'Bills',
        opponentLogo: '🔵',
        game_time: '1:00 PM',
        game_date: 'Sunday',
        injuries: [
          {
            id: 'kc-kelce',
            player: 'Travis Kelce',
            status: 'QUESTIONABLE',
            position: 'TE',
            injury: 'Right knee (MCL)',
            impact: 'HIGH',
            targets: 9.2,
            yards: 85.4,
            tds: 0.6,
            estimatedReturn: 'Game-time decision',
            lastUpdate: '1 hour ago',
            gamesOut: 0,
            daysOnReport: 4
          },
          {
            id: 'kc-jt',
            player: 'JuJu Smith-Schuster',
            status: 'OUT',
            position: 'WR',
            injury: 'Hamstring',
            impact: 'MEDIUM',
            targets: 5.4,
            yards: 42.1,
            tds: 0.3,
            estimatedReturn: '2-3 weeks',
            lastUpdate: '2 days ago',
            gamesOut: 1,
            daysOnReport: 10
          }
        ],
        vacuum: {
          total_usage_lost: 0,
          beneficiaries: [
            { player: 'Noah Gray', position: 'TE', usage_boost: '+4 targets', projected_boost: '+35 yards', confidence: 78 },
            { player: 'Rashee Rice', position: 'WR', usage_boost: '+3 targets', projected_boost: '+28 yards', confidence: 82 }
          ],
          team_impact: 'MODERATE',
          recommendation: 'Monitor pregame, fade spread if Kelce OUT'
        },
        historical: {
          record_without: { wins: 2, losses: 1, ats: '2-1' },
          avg_margin_without: 3.2,
          over_under_without: '2-1 O',
          last_5_without: ['W', 'W', 'L', null, null],
          betting_trend: 'Chiefs are 2-1 ATS without Kelce',
          key_insight: 'Mahomes spreads ball more without Kelce, pace stays similar'
        }
      }
    ],
    MLB: [
      {
        team: 'Yankees',
        teamLogo: '🔵',
        opponent: 'Red Sox',
        opponentLogo: '🔴',
        game_time: '7:05 PM',
        game_date: 'Tonight',
        injuries: [
          {
            id: 'nyy-judge',
            player: 'Aaron Judge',
            status: 'OUT',
            position: 'RF',
            injury: 'Toe contusion',
            impact: 'CRITICAL',
            avg: '.310',
            hr: 42,
            rbi: 98,
            ops: 1.052,
            estimatedReturn: '3-5 days',
            lastUpdate: '5 hours ago',
            gamesOut: 1,
            daysOnReport: 2
          }
        ],
        vacuum: {
          total_usage_lost: 0,
          beneficiaries: [],
          team_impact: 'SIGNIFICANT',
          recommendation: 'FADE Yankees run line, consider UNDER'
        },
        historical: {
          record_without: { wins: 4, losses: 8, ats: 'N/A' },
          avg_margin_without: -1.8,
          over_under_without: '5-7 U',
          last_5_without: ['L', 'L', 'W', 'L', 'W'],
          betting_trend: 'Yankees are 4-8 straight up without Judge',
          key_insight: 'Yankees lineup protection disappears without Judge'
        }
      }
    ],
    NHL: [
      {
        team: 'Bruins',
        teamLogo: '🟡',
        opponent: 'Rangers',
        opponentLogo: '🔵',
        game_time: '7:00 PM',
        game_date: 'Tonight',
        injuries: [
          {
            id: 'bos-pasta',
            player: 'David Pastrnak',
            status: 'OUT',
            position: 'RW',
            injury: 'Upper body',
            impact: 'HIGH',
            goals: 28,
            assists: 35,
            plusMinus: '+18',
            estimatedReturn: '1-2 weeks',
            lastUpdate: '6 hours ago',
            gamesOut: 3,
            daysOnReport: 8
          }
        ],
        vacuum: {
          total_usage_lost: 0,
          beneficiaries: [
            { player: 'Pavel Zacha', position: 'C', usage_boost: '+PP time', projected_boost: '+0.3 pts/game', confidence: 68 }
          ],
          team_impact: 'SIGNIFICANT',
          recommendation: 'FADE Bruins puck line, lean UNDER'
        },
        historical: {
          record_without: { wins: 3, losses: 4, ats: 'N/A' },
          avg_margin_without: -0.5,
          over_under_without: '3-4 U',
          last_5_without: ['L', 'W', 'L', 'W', 'L'],
          betting_trend: 'Bruins are 3-4 without Pastrnak',
          key_insight: 'Power play efficiency drops 8% without Pastrnak'
        }
      }
    ]
  };

  return mockData[sport] || mockData.NBA;
};

// ============================================================================
// INJURY ALERT SERVICE
// ============================================================================

const ALERT_STORAGE_KEY = 'bookie_injury_alerts';

const getAlertSettings = () => {
  try {
    const stored = localStorage.getItem(ALERT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
      email: '',
      alertTypes: {
        lateScratches: true,
        statusChanges: true,
        newInjuries: true,
        returnUpdates: true
      },
      impactFilter: 'HIGH', // CRITICAL, HIGH, MEDIUM, LOW, ALL
      teams: [], // Empty = all teams
      lastChecked: null
    };
  } catch (error) {
    console.error('Error reading alert settings:', error);
    return { enabled: false };
  }
};

const saveAlertSettings = (settings) => {
  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving alert settings:', error);
    return false;
  }
};

const sendInjuryAlert = async (injury, alertType) => {
  const settings = getAlertSettings();
  if (!settings.enabled) return;

  const alertMessages = {
    lateScratches: `LATE SCRATCH: ${injury.player} (${injury.team}) ruled OUT`,
    statusChanges: `STATUS CHANGE: ${injury.player} now ${injury.status}`,
    newInjuries: `NEW INJURY: ${injury.player} added to injury report`,
    returnUpdates: `RETURN UPDATE: ${injury.player} - ${injury.estimatedReturn}`
  };

  const message = alertMessages[alertType] || `Injury Update: ${injury.player}`;

  // Check impact filter
  const impactPriority = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4, ALL: 5 };
  if (impactPriority[injury.impact] > impactPriority[settings.impactFilter]) {
    return; // Don't alert for lower impact than filter
  }

  // Push notification
  if (settings.pushEnabled && settings.alertTypes[alertType]) {
    try {
      sendNotification('INJURY_UPDATE', {
        title: message,
        body: `${injury.injury} - Est. return: ${injury.estimatedReturn}`,
        data: { playerId: injury.id, team: injury.team }
      });
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  // Email notification (would integrate with backend in production)
  if (settings.emailEnabled && settings.email && settings.alertTypes[alertType]) {
    console.log(`Would send email to ${settings.email}: ${message}`);
    // In production: await api.sendInjuryEmail(settings.email, injury, alertType);
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#0a0a0f',
    minHeight: '100vh'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    marginBottom: '12px'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0
  },
  flowchart: {
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '12px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00D4FF 0%, #00FF88 100%)',
    color: '#000'
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tabActive: {
    backgroundColor: '#00D4FF',
    color: '#000',
    border: 'none',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px'
  }
};

// ============================================================================
// PLAYER AVATAR COMPONENT
// ============================================================================

const PlayerAvatar = ({ player, team, status, size = 60 }) => {
  const avatar = getPlayerAvatar(player, team);
  const statusInfo = INJURY_STATUS[status] || INJURY_STATUS.QUESTIONABLE;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        ...styles.avatar,
        width: size,
        height: size,
        backgroundColor: avatar.bgColor,
        fontSize: size * 0.33
      }}>
        {avatar.imageUrl ? (
          <img
            src={avatar.imageUrl}
            alt={player}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          avatar.initials
        )}
      </div>
      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: '50%',
        backgroundColor: statusInfo.color,
        border: '2px solid #1a1a2e'
      }} />
    </div>
  );
};

// ============================================================================
// INJURY SEVERITY BADGE
// ============================================================================

const SeverityBadge = ({ status, showLabel = true }) => {
  const statusInfo = INJURY_STATUS[status] || INJURY_STATUS.QUESTIONABLE;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      backgroundColor: statusInfo.bgColor,
      border: `1px solid ${statusInfo.color}40`,
      borderRadius: '8px',
      gap: '6px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: statusInfo.color,
        animation: status === 'OUT' ? 'pulse 2s infinite' : 'none'
      }} />
      <style>
        {`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}
      </style>
      {showLabel && (
        <span style={{
          color: statusInfo.color,
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          {statusInfo.label}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// IMPACT SCORE BADGE
// ============================================================================

const ImpactBadge = ({ impact }) => {
  const impactInfo = IMPACT_LEVELS[impact] || IMPACT_LEVELS.MEDIUM;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      backgroundColor: `${impactInfo.color}20`,
      borderRadius: '6px'
    }}>
      <span style={{ fontSize: '12px' }}>{impactInfo.icon}</span>
      <span style={{ color: impactInfo.color, fontSize: '11px', fontWeight: '600' }}>
        {impactInfo.label}
      </span>
    </div>
  );
};

// ============================================================================
// USAGE VACUUM FLOWCHART
// ============================================================================

const UsageVacuumFlowchart = ({ injuredPlayer, beneficiaries, totalUsageLost }) => {
  if (!beneficiaries || beneficiaries.length === 0) return null;

  return (
    <div style={styles.flowchart}>
      <div style={{
        color: '#6b7280',
        fontSize: '11px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📊</span> Usage Redistribution
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Injured Player (Source) */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: 'rgba(255,68,68,0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255,68,68,0.3)',
          minWidth: '120px'
        }}>
          <div style={{ color: '#FF4444', fontWeight: 'bold', marginBottom: '4px' }}>
            {injuredPlayer}
          </div>
          <div style={{ color: '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>
            -{totalUsageLost}%
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px' }}>Usage Lost</div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, #FF4444, #00FF88)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-8px',
              top: '-4px',
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid #00FF88'
            }} />
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>
            REDISTRIBUTED TO
          </div>
        </div>

        {/* Beneficiaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {beneficiaries.map((ben, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'rgba(0,255,136,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(0,255,136,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#00FF88'
                }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: '500' }}>{ben.player}</div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>{ben.position}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Usage Change Bar */}
                {ben.usage_before && ben.usage_after && (
                  <div style={{ width: '100px' }}>
                    <div style={{
                      display: 'flex',
                      height: '6px',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <div style={{
                        width: `${ben.usage_before}%`,
                        backgroundColor: '#6b7280'
                      }} />
                      <div style={{
                        width: `${ben.usage_after - ben.usage_before}%`,
                        backgroundColor: '#00FF88'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '9px',
                      color: '#6b7280',
                      marginTop: '2px'
                    }}>
                      <span>{ben.usage_before}%</span>
                      <span style={{ color: '#00FF88' }}>{ben.usage_after}%</span>
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ color: '#00FF88', fontWeight: 'bold' }}>{ben.usage_boost}</div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>{ben.projected_boost}</div>
                </div>

                {/* Confidence */}
                {ben.confidence && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                      {ben.confidence}%
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '9px' }}>conf</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORICAL CONTEXT COMPONENT
// ============================================================================

const HistoricalContext = ({ historical, teamName, playerName }) => {
  if (!historical) return null;

  const { record_without, avg_margin_without, over_under_without, last_5_without, betting_trend, key_insight } = historical;

  return (
    <div style={{
      backgroundColor: 'rgba(147,51,234,0.1)',
      border: '1px solid rgba(147,51,234,0.3)',
      borderRadius: '12px',
      padding: '16px'
    }}>
      <div style={{
        color: '#9333EA',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📜</span> Historical Context
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Record Without */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>
            RECORD WITHOUT
          </div>
          <div style={{
            color: record_without.wins > record_without.losses ? '#00FF88' : '#FF4444',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {record_without.wins}-{record_without.losses}
          </div>
          {record_without.ats && (
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>
              {record_without.ats} ATS
            </div>
          )}
        </div>

        {/* Avg Margin */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>
            AVG MARGIN
          </div>
          <div style={{
            color: avg_margin_without >= 0 ? '#00FF88' : '#FF4444',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {avg_margin_without >= 0 ? '+' : ''}{avg_margin_without}
          </div>
        </div>

        {/* O/U Record */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>
            OVER/UNDER
          </div>
          <div style={{
            color: '#FFD700',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {over_under_without}
          </div>
        </div>

        {/* Last 5 */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>
            LAST 5 WITHOUT
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {last_5_without.filter(Boolean).map((result, idx) => (
              <div
                key={idx}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: result === 'W' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)',
                  color: result === 'W' ? '#00FF88' : '#FF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Betting Trend */}
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(255,215,0,0.1)',
        borderRadius: '8px',
        marginBottom: '8px'
      }}>
        <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: '500' }}>
          📈 {betting_trend}
        </div>
      </div>

      {/* Key Insight */}
      {key_insight && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,212,255,0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#00D4FF', fontSize: '13px' }}>
            💡 {key_insight}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INJURY ALERTS SETTINGS
// ============================================================================

const InjuryAlertsSettings = ({ onClose }) => {
  const [settings, setSettings] = useState(getAlertSettings());
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleSave = () => {
    saveAlertSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestAlert = async () => {
    await sendInjuryAlert({
      id: 'test',
      player: 'Test Player',
      team: 'Test Team',
      status: 'OUT',
      injury: 'Test injury',
      impact: 'HIGH',
      estimatedReturn: 'Day-to-day'
    }, 'lateScratches');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings({ ...settings, pushEnabled: true });
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#fff', margin: 0 }}>🔔 Injury Alert Settings</h2>
          <button onClick={onClose} style={{ ...styles.button, ...styles.secondaryButton }}>
            Close
          </button>
        </div>

        <div style={styles.card}>
          <div style={{ padding: '20px' }}>
            {/* Master Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid #333'
            }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>Enable Injury Alerts</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Get notified about important injury updates
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.enabled ? '#00D4FF' : '#333',
                  borderRadius: '26px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '20px',
                    width: '20px',
                    left: settings.enabled ? '27px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
            </div>

            {settings.enabled && (
              <>
                {/* Notification Channels */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Notification Channels
                  </div>

                  {/* Push Notifications */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📱</span>
                      <div>
                        <div style={{ color: '#fff' }}>Push Notifications</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          {Notification.permission === 'granted' ? 'Enabled' : 'Click to enable'}
                        </div>
                      </div>
                    </div>
                    {Notification.permission !== 'granted' ? (
                      <button
                        onClick={requestNotificationPermission}
                        style={{ ...styles.button, ...styles.primaryButton, padding: '6px 12px', fontSize: '12px' }}
                      >
                        Enable
                      </button>
                    ) : (
                      <input
                        type="checkbox"
                        checked={settings.pushEnabled}
                        onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                    )}
                  </div>

                  {/* Email */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: settings.emailEnabled ? '12px' : 0
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📧</span>
                        <div>
                          <div style={{ color: '#fff' }}>Email Notifications</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>Morning updates & late scratches</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailEnabled}
                        onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </div>
                    {settings.emailEnabled && (
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        style={styles.input}
                      />
                    )}
                  </div>
                </div>

                {/* Alert Types */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Alert Types
                  </div>
                  {[
                    { key: 'lateScratches', label: 'Late Scratches', desc: 'Players ruled out close to game time', icon: '🚨' },
                    { key: 'statusChanges', label: 'Status Changes', desc: 'OUT → QUESTIONABLE, etc.', icon: '🔄' },
                    { key: 'newInjuries', label: 'New Injuries', desc: 'Players added to injury report', icon: '🆕' },
                    { key: 'returnUpdates', label: 'Return Updates', desc: 'Estimated return date changes', icon: '📅' }
                  ].map(type => (
                    <label
                      key={type.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{type.icon}</span>
                        <div>
                          <div style={{ color: '#fff', fontSize: '13px' }}>{type.label}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>{type.desc}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alertTypes[type.key]}
                        onChange={(e) => setSettings({
                          ...settings,
                          alertTypes: { ...settings.alertTypes, [type.key]: e.target.checked }
                        })}
                        style={{ width: '16px', height: '16px' }}
                      />
                    </label>
                  ))}
                </div>

                {/* Impact Filter */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Minimum Impact Level
                  </div>
                  <select
                    value={settings.impactFilter}
                    onChange={(e) => setSettings({ ...settings, impactFilter: e.target.value })}
                    style={{
                      ...styles.input,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="CRITICAL">Critical Only (Franchise Players)</option>
                    <option value="HIGH">High & Above (Stars)</option>
                    <option value="MEDIUM">Medium & Above (Rotation)</option>
                    <option value="LOW">All Injuries</option>
                  </select>
                </div>

                {/* Test & Save */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleTestAlert}
                    style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                  >
                    {testSent ? '✓ Test Sent!' : 'Send Test Alert'}
                  </button>
                  <button
                    onClick={handleSave}
                    style={{ ...styles.button, ...styles.primaryButton, flex: 1 }}
                  >
                    {saved ? '✓ Saved!' : 'Save Settings'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED INJURY CARD
// ============================================================================

const EnhancedInjuryCard = ({ teamData, sport }) => {
  const [expanded, setExpanded] = useState(false);
  const { team, teamLogo, opponent, opponentLogo, game_time, game_date, injuries, vacuum, historical } = teamData;

  const impactInfo = IMPACT_LEVELS[vacuum?.team_impact] || IMPACT_LEVELS.MEDIUM;
  const primaryInjury = injuries.find(i => i.impact === 'CRITICAL') || injuries[0];

  return (
    <div style={{
      ...styles.card,
      borderLeft: `4px solid ${impactInfo.color}`
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>{teamLogo}</span>
            <div>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{team}</div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>
                vs {opponent} {opponentLogo} • {game_date} {game_time}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ImpactBadge impact={vacuum?.team_impact} />
            <span style={{
              color: '#6b7280',
              fontSize: '20px',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* Quick Summary */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
          flexWrap: 'wrap'
        }}>
          {injuries.slice(0, 3).map((injury, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px'
              }}
            >
              <SeverityBadge status={injury.status} showLabel={false} />
              <span style={{ color: '#fff', fontSize: '13px' }}>{injury.player}</span>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>({injury.position})</span>
            </div>
          ))}
          {injuries.length > 3 && (
            <span style={{ color: '#6b7280', fontSize: '12px', alignSelf: 'center' }}>
              +{injuries.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 20px 20px' }}>
          {/* Injured Players Detail */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              color: '#9ca3af',
              fontSize: '11px',
              textTransform: 'uppercase',
              marginBottom: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #333'
            }}>
              Injured Players
            </div>

            {injuries.map((injury, idx) => (
              <div key={idx} style={styles.playerCard}>
                <PlayerAvatar
                  player={injury.player}
                  team={team}
                  status={injury.status}
                  size={60}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                      {injury.player}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>
                      {injury.position}
                    </span>
                    <ImpactBadge impact={injury.impact} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <SeverityBadge status={injury.status} />
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {injury.injury}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>
                      Est. Return: <span style={{ color: '#FFD700' }}>{injury.estimatedReturn}</span>
                    </span>
                    <span style={{ color: '#6b7280' }}>
                      Updated: <span style={{ color: '#9ca3af' }}>{injury.lastUpdate}</span>
                    </span>
                    {injury.gamesOut > 0 && (
                      <span style={{ color: '#6b7280' }}>
                        Games missed: <span style={{ color: '#FF4444' }}>{injury.gamesOut}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  {sport === 'NBA' && (
                    <>
                      {injury.usage && (
                        <div>
                          <div style={{ color: '#FF8844', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.usage}%
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>USG</div>
                        </div>
                      )}
                      {injury.points && (
                        <div>
                          <div style={{ color: '#00D4FF', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.points}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>PPG</div>
                        </div>
                      )}
                      {injury.rebounds && (
                        <div>
                          <div style={{ color: '#9333EA', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.rebounds}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>RPG</div>
                        </div>
                      )}
                    </>
                  )}
                  {sport === 'NFL' && (
                    <>
                      {injury.targets && (
                        <div>
                          <div style={{ color: '#FF8844', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.targets}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>TGT/G</div>
                        </div>
                      )}
                      {injury.yards && (
                        <div>
                          <div style={{ color: '#00D4FF', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.yards}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>YDS/G</div>
                        </div>
                      )}
                    </>
                  )}
                  {sport === 'MLB' && (
                    <>
                      {injury.avg && (
                        <div>
                          <div style={{ color: '#FF8844', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.avg}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>AVG</div>
                        </div>
                      )}
                      {injury.hr && (
                        <div>
                          <div style={{ color: '#00D4FF', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.hr}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>HR</div>
                        </div>
                      )}
                    </>
                  )}
                  {sport === 'NHL' && (
                    <>
                      {injury.goals && (
                        <div>
                          <div style={{ color: '#FF8844', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.goals}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>G</div>
                        </div>
                      )}
                      {injury.assists && (
                        <div>
                          <div style={{ color: '#00D4FF', fontSize: '16px', fontWeight: 'bold' }}>
                            {injury.assists}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>A</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Usage Vacuum Flowchart */}
          {vacuum?.beneficiaries?.length > 0 && primaryInjury && (
            <UsageVacuumFlowchart
              injuredPlayer={primaryInjury.player}
              beneficiaries={vacuum.beneficiaries}
              totalUsageLost={vacuum.total_usage_lost}
            />
          )}

          {/* Historical Context */}
          {historical && primaryInjury && (
            <div style={{ marginTop: '20px' }}>
              <HistoricalContext
                historical={historical}
                teamName={team}
                playerName={primaryInjury.player}
              />
            </div>
          )}

          {/* Betting Recommendation */}
          {vacuum?.recommendation && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>💡</span>
                <div>
                  <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>
                    Recommendation
                  </div>
                  <div style={{ color: '#e5e7eb', fontSize: '14px', marginTop: '4px' }}>
                    {vacuum.recommendation}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InjuryVacuumEnhanced = () => {
  const [sport, setSport] = useState('NBA');
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterImpact, setFilterImpact] = useState('ALL');

  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];

  useEffect(() => {
    fetchInjuries();
  }, [sport]);

  const fetchInjuries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInjuries(sport);
      if (data?.injuries || Array.isArray(data)) {
        // In production, enhance real API data
        setInjuries(generateEnhancedMockData(sport));
      } else {
        setInjuries(generateEnhancedMockData(sport));
      }
    } catch (err) {
      console.error('Error fetching injuries:', err);
      setError(err.message || 'Failed to fetch injury data');
      setInjuries(generateEnhancedMockData(sport));
    }
    setLoading(false);
  };

  // Filter injuries
  const filteredInjuries = useMemo(() => {
    return injuries.filter(team => {
      // Filter by status
      if (filterStatus !== 'ALL') {
        const hasStatus = team.injuries.some(i => i.status === filterStatus);
        if (!hasStatus) return false;
      }

      // Filter by impact
      if (filterImpact !== 'ALL') {
        const hasImpact = team.injuries.some(i => i.impact === filterImpact);
        if (!hasImpact) return false;
      }

      return true;
    });
  }, [injuries, filterStatus, filterImpact]);

  // Count injuries by status
  const statusCounts = useMemo(() => {
    const counts = { OUT: 0, DOUBTFUL: 0, QUESTIONABLE: 0, PROBABLE: 0 };
    injuries.forEach(team => {
      team.injuries.forEach(injury => {
        if (counts[injury.status] !== undefined) {
          counts[injury.status]++;
        }
      });
    });
    return counts;
  }, [injuries]);

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🏥 Injury Vacuum Enhanced
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Usage redistribution analysis • Historical impact • Betting implications
            </p>
          </div>
          <button
            onClick={() => setShowAlertSettings(true)}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            🔔 Alert Settings
          </button>
        </div>

        {/* Status Summary */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {Object.entries(INJURY_STATUS).slice(0, 4).map(([status, info]) => (
            <div
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: filterStatus === status ? info.bgColor : '#1a1a2e',
                border: `1px solid ${filterStatus === status ? info.color : '#333'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: info.color
              }} />
              <span style={{ color: info.color, fontWeight: 'bold' }}>{statusCounts[status]}</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{status}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Sport Tabs */}
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                ...styles.tab,
                ...(sport === s ? styles.tabActive : {})
              }}
            >
              {s}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Impact Filter */}
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            style={{
              ...styles.input,
              width: 'auto',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Impacts</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High & Above</option>
            <option value="MEDIUM">Medium & Above</option>
          </select>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div style={{ marginBottom: '20px' }}>
            <ConnectionError onRetry={fetchInjuries} serviceName="injuries API" />
          </div>
        )}

        {/* Injury Cards */}
        {loading ? (
          <CardSkeleton count={3} />
        ) : filteredInjuries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#9ca3af',
            backgroundColor: '#1a1a2e',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>All Clear</h3>
            <p>No significant injuries matching your filters for {sport} today.</p>
          </div>
        ) : (
          <div>
            {filteredInjuries.map((team, idx) => (
              <EnhancedInjuryCard key={idx} teamData={team} sport={sport} />
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

        {/* Alert Settings Modal */}
        {showAlertSettings && (
          <InjuryAlertsSettings onClose={() => setShowAlertSettings(false)} />
        )}
      </div>
    </div>
  );
};

export default InjuryVacuumEnhanced;
export {
  PlayerAvatar,
  SeverityBadge,
  ImpactBadge,
  UsageVacuumFlowchart,
  HistoricalContext,
  InjuryAlertsSettings,
  EnhancedInjuryCard,
  sendInjuryAlert,
  getAlertSettings,
  saveAlertSettings
};
