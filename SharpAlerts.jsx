/**
 * SHARP MONEY ALERTS - ENHANCED
 *
 * The #1 thing bettors pay for: "Where is the smart money?"
 * Shows divergence between ticket % and money % to identify
 * professional betting action.
 *
 * Priority 3A Enhancements:
 * - Improved visual hierarchy with larger divergence displays
 * - Sorting options (divergence, time, strength)
 * - Filtering (strong alerts, favorites, sports)
 * - Line movement tracking
 * - Notification alerts
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from './api';
import { CardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated, LiveBadge, RefreshIntervalSelector } from './LiveIndicators';

// Local storage keys
const FAVORITES_KEY = 'sharp_alerts_favorites';
const THRESHOLD_KEY = 'sharp_alerts_threshold';

// Get favorites from localStorage
const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
};

// Save favorites to localStorage
const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// Get custom threshold from localStorage
const getThreshold = () => {
  try {
    return parseInt(localStorage.getItem(THRESHOLD_KEY) || '15', 10);
  } catch {
    return 15;
  }
};

/**
 * Enhanced Divergence Gauge - Large circular display
 */
const DivergenceGauge = ({ divergence, strength, size = 'large' }) => {
  const strengthColor = getStrengthColor(strength);
  const radius = size === 'large' ? 45 : 30;
  const stroke = size === 'large' ? 8 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(divergence / 40, 1); // Cap at 40% for visual
  const offset = circumference - (progress * circumference);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size === 'large' ? '120px' : '80px',
      height: size === 'large' ? '120px' : '80px'
    }}>
      <svg
        width={size === 'large' ? 120 : 80}
        height={size === 'large' ? 120 : 80}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size === 'large' ? 60 : 40}
          cy={size === 'large' ? 60 : 40}
          r={radius}
          fill="none"
          stroke="#333"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={size === 'large' ? 60 : 40}
          cy={size === 'large' ? 60 : 40}
          r={radius}
          fill="none"
          stroke={strengthColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 6px ${strengthColor}60)`
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <span style={{
          color: strengthColor,
          fontSize: size === 'large' ? '28px' : '18px',
          fontWeight: 'bold',
          lineHeight: 1
        }}>
          {divergence}%
        </span>
        <span style={{
          color: '#6b7280',
          fontSize: size === 'large' ? '10px' : '8px',
          marginTop: '2px'
        }}>
          DIVERGENCE
        </span>
      </div>
    </div>
  );
};

/**
 * Enhanced Progress Bar with split visualization
 */
const EnhancedDivergenceBar = ({ ticketPct, moneyPct, divergence }) => {
  const strengthColor = divergence >= 25 ? '#00FF88' : divergence >= 20 ? '#00D4FF' : '#FFD700';

  return (
    <div style={{ width: '100%' }}>
      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#FF6B6B'
          }} />
          <span style={{ color: '#FF6B6B', fontSize: '13px', fontWeight: '500' }}>
            Public {ticketPct}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#00FF88', fontSize: '13px', fontWeight: '500' }}>
            Sharp {moneyPct}%
          </span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00FF88'
          }} />
        </div>
      </div>

      {/* Dual progress bar */}
      <div style={{
        position: 'relative',
        height: '12px',
        backgroundColor: '#1f1f2e',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {/* Public bar (from left) */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${ticketPct}%`,
          background: 'linear-gradient(90deg, #FF6B6B 0%, #FF6B6B80 100%)',
          borderRadius: '6px 0 0 6px',
          transition: 'width 0.5s ease'
        }} />

        {/* Sharp bar (from right) */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: `${moneyPct}%`,
          background: 'linear-gradient(270deg, #00FF88 0%, #00FF8880 100%)',
          borderRadius: '0 6px 6px 0',
          transition: 'width 0.5s ease'
        }} />

        {/* Center divider with divergence indicator */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '-2px',
          transform: 'translateX(-50%)',
          width: '2px',
          height: 'calc(100% + 4px)',
          backgroundColor: '#fff'
        }} />
      </div>

      {/* Divergence callout */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '8px'
      }}>
        <div style={{
          backgroundColor: strengthColor + '20',
          color: strengthColor,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          border: `1px solid ${strengthColor}40`
        }}>
          {divergence}% DIVERGENCE
        </div>
      </div>
    </div>
  );
};

/**
 * Line Movement Indicator
 */
const LineMovement = ({ openingLine, currentLine, sport }) => {
  const movement = currentLine - openingLine;
  const hasMovement = movement !== 0;
  const direction = movement > 0 ? 'up' : movement < 0 ? 'down' : 'none';
  const movementPct = openingLine !== 0 ? Math.abs((movement / Math.abs(openingLine)) * 100).toFixed(1) : 0;

  const colors = {
    up: '#FF6B6B',   // Line moved against sharp side (bad)
    down: '#00FF88', // Line moved with sharp side (good - steam)
    none: '#6b7280'
  };

  return (
    <div style={{
      padding: '10px 12px',
      backgroundColor: '#0a0a0f',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>LINE MOVEMENT</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'line-through' }}>
            {openingLine > 0 ? '+' : ''}{openingLine}
          </span>
          <span style={{ color: '#fff', fontSize: '14px' }}>→</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
            {currentLine > 0 ? '+' : ''}{currentLine}
          </span>
        </div>
      </div>
      {hasMovement && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: colors[direction] + '20',
          color: colors[direction],
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          <span style={{ fontSize: '14px' }}>
            {direction === 'up' ? '↑' : '↓'}
          </span>
          {Math.abs(movement).toFixed(1)} pts
        </div>
      )}
    </div>
  );
};

/**
 * Favorite Star Button
 */
const FavoriteButton = ({ gameId, isFavorite, onToggle }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle(gameId);
    }}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '4px',
      color: isFavorite ? '#FFD700' : '#4b5563',
      transition: 'all 0.2s',
      transform: isFavorite ? 'scale(1.1)' : 'scale(1)'
    }}
    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  >
    {isFavorite ? '★' : '☆'}
  </button>
);

/**
 * New Alert Notification Banner
 */
const NewAlertBanner = ({ count, onDismiss }) => {
  if (count === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#00FF8815',
      border: '1px solid #00FF8840',
      borderRadius: '10px',
      padding: '12px 16px',
      marginBottom: '20px',
      animation: 'pulse-live 2s ease-in-out infinite'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>🔔</span>
        <span style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '14px' }}>
          {count} new sharp action{count > 1 ? 's' : ''} detected!
        </span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: '1px solid #00FF8840',
          color: '#00FF88',
          padding: '4px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Dismiss
      </button>
    </div>
  );
};

/**
 * Sorting & Filter Controls
 */
const SortFilterControls = ({
  sortBy,
  onSortChange,
  showStrongOnly,
  onStrongOnlyChange,
  showFavoritesOnly,
  onFavoritesOnlyChange,
  customThreshold,
  onThresholdChange,
  alertCount,
  strongCount,
  favoriteCount
}) => {
  const sortOptions = [
    { value: 'divergence', label: 'Divergence %', icon: '📊' },
    { value: 'time', label: 'Game Time', icon: '⏰' },
    { value: 'strength', label: 'Signal Strength', icon: '💪' }
  ];

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Sort by:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: sortBy === opt.value ? '#00D4FF20' : 'transparent',
                  color: sortBy === opt.value ? '#00D4FF' : '#9ca3af',
                  border: sortBy === opt.value ? '1px solid #00D4FF40' : '1px solid #333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Strong Only Toggle */}
          <button
            onClick={() => onStrongOnlyChange(!showStrongOnly)}
            style={{
              padding: '6px 12px',
              backgroundColor: showStrongOnly ? '#00FF8820' : 'transparent',
              color: showStrongOnly ? '#00FF88' : '#9ca3af',
              border: showStrongOnly ? '1px solid #00FF8840' : '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔥</span>
            Strong Only ({strongCount})
          </button>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => onFavoritesOnlyChange(!showFavoritesOnly)}
            style={{
              padding: '6px 12px',
              backgroundColor: showFavoritesOnly ? '#FFD70020' : 'transparent',
              color: showFavoritesOnly ? '#FFD700' : '#9ca3af',
              border: showFavoritesOnly ? '1px solid #FFD70040' : '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>★</span>
            Favorites ({favoriteCount})
          </button>
        </div>

        {/* Custom Threshold */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Alert threshold:</span>
          <select
            value={customThreshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
            style={{
              backgroundColor: '#0a0a0f',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10%+</option>
            <option value={15}>15%+ (default)</option>
            <option value={20}>20%+</option>
            <option value={25}>25%+</option>
            <option value={30}>30%+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Helper function for strength color
const getStrengthColor = (strength) => {
  switch (strength) {
    case 'STRONG': return '#00FF88';
    case 'MODERATE': return '#00D4FF';
    case 'MILD': return '#FFD700';
    default: return '#9ca3af';
  }
};

// Parse time string to comparable value
const parseTime = (timeStr) => {
  if (!timeStr) return Infinity;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return Infinity;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const SharpAlerts = () => {
  const [sport, setSport] = useState('NBA');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splits, setSplits] = useState([]);

  // New state for Priority 3A features
  const [sortBy, setSortBy] = useState('divergence');
  const [showStrongOnly, setShowStrongOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [customThreshold, setCustomThreshold] = useState(() => getThreshold());
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [previousAlertIds, setPreviousAlertIds] = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());

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

  // Save threshold to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(THRESHOLD_KEY, customThreshold.toString());
  }, [customThreshold]);

  const fetchSharpData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sharpRes, splitsRes] = await Promise.all([
        api.getSharpMoney(sport).catch(() => null),
        api.getSplits(sport).catch(() => null)
      ]);

      let sharpAlerts = [];

      if (sharpRes?.signals) {
        sharpAlerts = sharpRes.signals;
      } else if (splitsRes?.games || splitsRes) {
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
            id: `${game.home_team}-${game.away_team}`,
            ticket_pct: ticketPct,
            money_pct: moneyPct,
            divergence,
            sharp_side: sharpSide,
            strength,
            has_alert: divergence >= 15,
            // Mock line movement data
            opening_line: game.spread,
            current_line: game.spread + (Math.random() > 0.5 ? (Math.random() * 1.5 - 0.75) : 0)
          };
        }).filter(g => g.has_alert);
      }

      if (sharpAlerts.length === 0) {
        sharpAlerts = generateMockAlerts(sport);
      }

      // Check for new alerts
      const currentIds = new Set(sharpAlerts.map(a => a.id || `${a.home_team}-${a.away_team}`));
      const newAlerts = sharpAlerts.filter(a => {
        const id = a.id || `${a.home_team}-${a.away_team}`;
        return !previousAlertIds.has(id);
      });

      if (previousAlertIds.size > 0 && newAlerts.length > 0) {
        setNewAlertCount(newAlerts.length);
      }
      setPreviousAlertIds(currentIds);

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
        { home_team: 'Lakers', away_team: 'Celtics', ticket_pct: 72, money_pct: 45, spread: -3.5, time: '7:30 PM', opening_line: -4 },
        { home_team: 'Warriors', away_team: 'Suns', ticket_pct: 65, money_pct: 38, spread: -5.5, time: '10:00 PM', opening_line: -6 },
        { home_team: 'Bucks', away_team: 'Heat', ticket_pct: 58, money_pct: 78, spread: -7, time: '8:00 PM', opening_line: -6.5 },
        { home_team: 'Nuggets', away_team: 'Clippers', ticket_pct: 45, money_pct: 68, spread: -4, time: '9:30 PM', opening_line: -3.5 }
      ],
      NFL: [
        { home_team: 'Chiefs', away_team: 'Bills', ticket_pct: 68, money_pct: 42, spread: -3, time: '1:00 PM', opening_line: -2.5 },
        { home_team: 'Eagles', away_team: 'Cowboys', ticket_pct: 55, money_pct: 75, spread: -2.5, time: '4:25 PM', opening_line: -3 },
        { home_team: '49ers', away_team: 'Seahawks', ticket_pct: 70, money_pct: 48, spread: -6.5, time: '8:20 PM', opening_line: -7 }
      ],
      MLB: [
        { home_team: 'Yankees', away_team: 'Red Sox', ticket_pct: 70, money_pct: 48, spread: -1.5, time: '7:05 PM', opening_line: -1.5 },
        { home_team: 'Dodgers', away_team: 'Giants', ticket_pct: 62, money_pct: 40, spread: -1.5, time: '10:10 PM', opening_line: -1.5 }
      ],
      NHL: [
        { home_team: 'Bruins', away_team: 'Rangers', ticket_pct: 62, money_pct: 40, spread: -1.5, time: '7:00 PM', opening_line: -1.5 },
        { home_team: 'Avalanche', away_team: 'Knights', ticket_pct: 55, money_pct: 78, spread: -1.5, time: '9:00 PM', opening_line: -1.5 }
      ],
      NCAAB: [
        { home_team: 'Duke', away_team: 'UNC', ticket_pct: 75, money_pct: 52, spread: -4.5, time: '9:00 PM', opening_line: -5 },
        { home_team: 'Kansas', away_team: 'Kentucky', ticket_pct: 60, money_pct: 82, spread: -3, time: '7:00 PM', opening_line: -2.5 }
      ]
    };

    return (mockGames[sport] || mockGames.NBA).map(game => {
      const divergence = Math.abs(game.money_pct - game.ticket_pct);
      return {
        ...game,
        id: `${game.home_team}-${game.away_team}`,
        divergence,
        sharp_side: game.money_pct < game.ticket_pct ? 'SHARP_ON_UNDERDOG' : 'SHARP_ON_FAVORITE',
        strength: divergence >= 25 ? 'STRONG' : divergence >= 20 ? 'MODERATE' : 'MILD',
        has_alert: true,
        current_line: game.spread
      };
    });
  };

  // Toggle favorite
  const toggleFavorite = (gameId) => {
    const newFavorites = favorites.includes(gameId)
      ? favorites.filter(id => id !== gameId)
      : [...favorites, gameId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // Toggle card expansion
  const toggleCardExpand = (gameId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedCards(newExpanded);
  };

  // Filtered and sorted alerts
  const processedAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => alert.divergence >= customThreshold);

    if (showStrongOnly) {
      filtered = filtered.filter(a => a.strength === 'STRONG');
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(a => favorites.includes(a.id || `${a.home_team}-${a.away_team}`));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'divergence':
          return b.divergence - a.divergence;
        case 'time':
          return parseTime(a.time) - parseTime(b.time);
        case 'strength':
          const strengthOrder = { STRONG: 0, MODERATE: 1, MILD: 2, NONE: 3 };
          return (strengthOrder[a.strength] || 3) - (strengthOrder[b.strength] || 3);
        default:
          return 0;
      }
    });

    return filtered;
  }, [alerts, sortBy, showStrongOnly, showFavoritesOnly, favorites, customThreshold]);

  // Stats for filter buttons
  const strongCount = alerts.filter(a => a.strength === 'STRONG').length;
  const favoriteCount = alerts.filter(a => favorites.includes(a.id || `${a.home_team}-${a.away_team}`)).length;

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

        {/* New Alert Banner */}
        <NewAlertBanner
          count={newAlertCount}
          onDismiss={() => setNewAlertCount(0)}
        />

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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              {processedAlerts.length} of {alerts.length} alerts shown
            </span>
          </div>
        </div>

        {/* Sport Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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

        {/* Sort & Filter Controls */}
        <SortFilterControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          showStrongOnly={showStrongOnly}
          onStrongOnlyChange={setShowStrongOnly}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesOnlyChange={setShowFavoritesOnly}
          customThreshold={customThreshold}
          onThresholdChange={setCustomThreshold}
          alertCount={alerts.length}
          strongCount={strongCount}
          favoriteCount={favoriteCount}
        />

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
        ) : processedAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Sharp Alerts</h3>
            <p>
              {showStrongOnly || showFavoritesOnly
                ? 'No alerts match your current filters. Try adjusting them.'
                : `No significant money/ticket divergence detected for ${sport} today.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {processedAlerts.map((alert, idx) => {
              const strengthColor = getStrengthColor(alert.strength);
              const isSharpOnUnderdog = alert.sharp_side === 'SHARP_ON_UNDERDOG';
              const gameId = alert.id || `${alert.home_team}-${alert.away_team}`;
              const isFavorite = favorites.includes(gameId);
              const isExpanded = expandedCards.has(gameId);

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '12px',
                    padding: '20px',
                    borderLeft: `4px solid ${strengthColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isFavorite ? `0 0 0 1px ${strengthColor}40` : 'none'
                  }}
                  onClick={() => toggleCardExpand(gameId)}
                >
                  {/* Main Card Layout - Two Column */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'start'
                  }}>
                    {/* Left Side - Game Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <FavoriteButton
                          gameId={gameId}
                          isFavorite={isFavorite}
                          onToggle={toggleFavorite}
                        />
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
                          border: `1px solid ${strengthColor}40`,
                          marginLeft: 'auto'
                        }}>
                          {alert.strength} ALERT
                        </div>
                      </div>

                      {/* Enhanced Divergence Bar */}
                      <EnhancedDivergenceBar
                        ticketPct={alert.ticket_pct}
                        moneyPct={alert.money_pct}
                        divergence={alert.divergence}
                      />
                    </div>

                    {/* Right Side - Large Gauge */}
                    <DivergenceGauge
                      divergence={alert.divergence}
                      strength={alert.strength}
                      size="large"
                    />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid #333'
                    }}>
                      {/* Analysis Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '15px'
                      }}>
                        {/* Line Movement */}
                        <LineMovement
                          openingLine={alert.opening_line}
                          currentLine={alert.current_line || alert.spread}
                          sport={sport}
                        />

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
                  )}

                  {/* Expand indicator */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    color: '#6b7280',
                    fontSize: '11px'
                  }}>
                    {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
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
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: '#fff' }}>Line Movement</strong> = Shows how the spread has moved since opening. Movement against public action often indicates sharp money.
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
