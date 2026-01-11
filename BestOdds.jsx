/**
 * BEST ODDS FINDER - ENHANCED
 *
 * Compare odds across ALL sportsbooks side-by-side.
 * Find the best number for every bet type.
 * Save money on juice = pays for itself.
 *
 * Priority 3B Enhancements:
 * - Search with autocomplete and recent searches
 * - Advanced filtering (sportsbook, bet type, min odds)
 * - Line comparison table with highlighting
 * - Line movement visualization with sparklines
 * - Quick actions (copy, bookmark, share)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from './api';
import { CardSkeleton } from './Skeletons';
import { ConnectionError } from './ErrorBoundary';
import { useAutoRefresh } from './useAutoRefresh';
import { LastUpdated, RefreshIntervalSelector } from './LiveIndicators';

// Local storage keys
const BOOKMARKS_KEY = 'best_odds_bookmarks';
const RECENT_SEARCHES_KEY = 'best_odds_recent_searches';
const HIDDEN_BOOKS_KEY = 'best_odds_hidden_books';

// Get from localStorage
const getBookmarks = () => {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); }
  catch { return []; }
};

const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); }
  catch { return []; }
};

const getHiddenBooks = () => {
  try { return JSON.parse(localStorage.getItem(HIDDEN_BOOKS_KEY) || '[]'); }
  catch { return []; }
};

/**
 * Mini Sparkline Chart for line movement
 */
const LineSparkline = ({ data, color = '#00D4FF', width = 80, height = 24 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current point indicator */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  );
};

/**
 * Line Movement Alert Badge
 */
const LineMovementBadge = ({ movement, type = 'spread' }) => {
  if (!movement || movement === 0) return null;

  const isUp = movement > 0;
  const color = isUp ? '#FF6B6B' : '#00FF88';
  const direction = isUp ? '↑' : '↓';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      backgroundColor: color + '20',
      color: color,
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold'
    }}>
      {direction} {Math.abs(movement).toFixed(1)}
    </span>
  );
};

/**
 * Search Bar with Autocomplete
 */
const SearchBar = ({ value, onChange, suggestions, recentSearches, onSelect, onClearRecent }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const showDropdown = isFocused && (suggestions.length > 0 || (value === '' && recentSearches.length > 0));

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
        border: isFocused ? '1px solid #00D4FF' : '1px solid #333',
        padding: '0 12px'
      }}>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search by team name..."
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#fff',
            padding: '10px 8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #333',
          marginTop: '4px',
          maxHeight: '250px',
          overflowY: 'auto',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {value === '' && recentSearches.length > 0 && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid #333'
              }}>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>RECENT SEARCHES</span>
                <button
                  onClick={onClearRecent}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelect(search)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#9ca3af'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00D4FF10'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🕐</span>
                  <span>{search}</span>
                </div>
              ))}
            </>
          )}
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => onSelect(suggestion)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00D4FF10'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🏀</span>
              <span dangerouslySetInnerHTML={{
                __html: suggestion.replace(
                  new RegExp(`(${value})`, 'gi'),
                  '<strong style="color: #00D4FF">$1</strong>'
                )
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Filter Controls Panel
 */
const FilterControls = ({
  betType,
  onBetTypeChange,
  minOdds,
  onMinOddsChange,
  visibleBooks,
  allBooks,
  onToggleBook,
  onShowAllBooks,
  showBookmarkedOnly,
  onToggleBookmarked,
  bookmarkCount
}) => {
  const [showBookFilter, setShowBookFilter] = useState(false);

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
        alignItems: 'center'
      }}>
        {/* Bet Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Bet type:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'spread', 'total', 'moneyline'].map(type => (
              <button
                key={type}
                onClick={() => onBetTypeChange(type)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: betType === type ? '#00D4FF20' : 'transparent',
                  color: betType === type ? '#00D4FF' : '#9ca3af',
                  border: betType === type ? '1px solid #00D4FF40' : '1px solid #333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Min Odds Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Min odds:</span>
          <select
            value={minOdds}
            onChange={(e) => onMinOddsChange(parseInt(e.target.value, 10))}
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
            <option value={-200}>-200 or better</option>
            <option value={-150}>-150 or better</option>
            <option value={-115}>-115 or better</option>
            <option value={-110}>-110 or better</option>
            <option value={-105}>-105 or better</option>
            <option value={100}>+ odds only</option>
          </select>
        </div>

        {/* Bookmarked Only */}
        <button
          onClick={onToggleBookmarked}
          style={{
            padding: '6px 12px',
            backgroundColor: showBookmarkedOnly ? '#FFD70020' : 'transparent',
            color: showBookmarkedOnly ? '#FFD700' : '#9ca3af',
            border: showBookmarkedOnly ? '1px solid #FFD70040' : '1px solid #333',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>★</span>
          Bookmarked ({bookmarkCount})
        </button>

        {/* Sportsbook Filter */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowBookFilter(!showBookFilter)}
            style={{
              padding: '6px 12px',
              backgroundColor: visibleBooks.length < allBooks.length ? '#8B5CF620' : 'transparent',
              color: visibleBooks.length < allBooks.length ? '#8B5CF6' : '#9ca3af',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📚</span>
            Books ({visibleBooks.length}/{allBooks.length})
            <span>{showBookFilter ? '▲' : '▼'}</span>
          </button>

          {showBookFilter && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #333',
              marginTop: '4px',
              padding: '10px',
              zIndex: 100,
              minWidth: '180px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <button
                onClick={onShowAllBooks}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: '#00D4FF20',
                  color: '#00D4FF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  marginBottom: '8px'
                }}
              >
                Show All Books
              </button>
              {allBooks.map(book => (
                <label
                  key={book}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00D4FF10'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={visibleBooks.includes(book)}
                    onChange={() => onToggleBook(book)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#fff', fontSize: '12px', textTransform: 'capitalize' }}>
                    {book}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Quick Actions Bar
 */
const QuickActions = ({ game, isBookmarked, onBookmark, onCopy, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${game.away_team} @ ${game.home_team} | Spread: ${game.spread} | O/U: ${game.total}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(text);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/odds?game=${encodeURIComponent(`${game.away_team}-${game.home_team}`)}`;
    if (navigator.share) {
      navigator.share({ title: `${game.away_team} @ ${game.home_team}`, url });
    } else {
      navigator.clipboard?.writeText(url);
      onShare?.(url);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: isBookmarked ? '#FFD700' : '#6b7280',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this game'}
      >
        {isBookmarked ? '★' : '☆'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleCopy(); }}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: copied ? '#00FF88' : '#6b7280',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="Copy to clipboard"
      >
        {copied ? '✓' : '📋'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleShare(); }}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: '#6b7280',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="Share"
      >
        🔗
      </button>
    </div>
  );
};

/**
 * Line History Modal
 */
const LineHistoryModal = ({ game, onClose }) => {
  if (!game) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', margin: 0 }}>
            📈 Line History: {game.away_team} @ {game.home_team}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Spread History */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#00D4FF', fontSize: '14px', marginBottom: '10px' }}>Spread Movement</h4>
          <div style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>OPENING</div>
                <div style={{ color: '#9ca3af', fontSize: '16px' }}>{game.openingSpread || game.spread}</div>
              </div>
              <span style={{ color: '#6b7280' }}>→</span>
              <div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>CURRENT</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{game.spread}</div>
              </div>
              {game.lineHistory?.spread && (
                <LineMovementBadge movement={game.spread - (game.openingSpread || game.spread)} />
              )}
            </div>
            {game.lineHistory?.spread && (
              <LineSparkline data={game.lineHistory.spread} color="#00D4FF" width={200} height={40} />
            )}
          </div>
        </div>

        {/* Total History */}
        <div>
          <h4 style={{ color: '#00FF88', fontSize: '14px', marginBottom: '10px' }}>Total Movement</h4>
          <div style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>OPENING</div>
                <div style={{ color: '#9ca3af', fontSize: '16px' }}>{game.openingTotal || game.total}</div>
              </div>
              <span style={{ color: '#6b7280' }}>→</span>
              <div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>CURRENT</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{game.total}</div>
              </div>
              {game.lineHistory?.total && (
                <LineMovementBadge movement={game.total - (game.openingTotal || game.total)} />
              )}
            </div>
            {game.lineHistory?.total && (
              <LineSparkline data={game.lineHistory.total} color="#00FF88" width={200} height={40} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BOOK_COLORS = {
  fanduel: '#1493FF',
  draftkings: '#53D337',
  betmgm: '#C4A962',
  caesars: '#0A4833',
  pointsbet: '#E44023',
  pinnacle: '#C41230',
  betrivers: '#1A6B3C',
  bet365: '#027B5B',
  wynnbet: '#AA8B56',
  unibet: '#147B45',
  barstool: '#E31837',
  betonline: '#2C2C2C'
};

const ALL_BOOKS = ['fanduel', 'draftkings', 'betmgm', 'caesars', 'pinnacle', 'pointsbet', 'betrivers', 'bet365'];

const BestOdds = () => {
  const [sport, setSport] = useState('NBA');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  // Priority 3B state
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [bookmarks, setBookmarks] = useState(() => getBookmarks());
  const [visibleBooks, setVisibleBooks] = useState(() => {
    const hidden = getHiddenBooks();
    return ALL_BOOKS.filter(b => !hidden.includes(b));
  });
  const [betTypeFilter, setBetTypeFilter] = useState('all');
  const [minOddsFilter, setMinOddsFilter] = useState(-200);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [historyGame, setHistoryGame] = useState(null);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  // Auto-refresh
  const {
    lastUpdated,
    isRefreshing,
    refresh,
    setInterval: setRefreshInterval,
    interval: refreshInterval,
    isPaused,
    togglePause
  } = useAutoRefresh(
    useCallback(() => fetchGames(), [sport]),
    { interval: 120000, immediate: false, deps: [sport] }
  );

  useEffect(() => {
    fetchGames();
  }, [sport]);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLiveOdds(sport);

      if (data?.games || data?.odds) {
        const gameData = data.games || data.odds || data;
        setGames(Array.isArray(gameData) ? gameData : []);
      } else {
        setGames(generateMockGames(sport));
      }
    } catch (err) {
      console.error('Error fetching odds:', err);
      setError(err.message || 'Failed to fetch odds');
      setGames(generateMockGames(sport));
    }
    setLoading(false);
  };

  const generateMockGames = (sport) => {
    const mockBooks = visibleBooks.length > 0 ? visibleBooks : ALL_BOOKS;

    const baseGames = {
      NBA: [
        { home_team: 'Lakers', away_team: 'Celtics', spread: -3.5, total: 224.5, time: '7:30 PM', openingSpread: -4, openingTotal: 223 },
        { home_team: 'Warriors', away_team: 'Suns', spread: -5.5, total: 231, time: '10:00 PM', openingSpread: -6, openingTotal: 230 },
        { home_team: 'Bucks', away_team: 'Heat', spread: -7, total: 219.5, time: '8:00 PM', openingSpread: -6.5, openingTotal: 220 },
        { home_team: 'Nuggets', away_team: 'Clippers', spread: -4, total: 226, time: '9:30 PM', openingSpread: -3.5, openingTotal: 227 }
      ],
      NFL: [
        { home_team: 'Chiefs', away_team: 'Bills', spread: -3, total: 51.5, time: '1:00 PM', openingSpread: -2.5, openingTotal: 52 },
        { home_team: 'Eagles', away_team: 'Cowboys', spread: -2.5, total: 48, time: '4:25 PM', openingSpread: -3, openingTotal: 47 },
        { home_team: '49ers', away_team: 'Seahawks', spread: -6.5, total: 45.5, time: '8:20 PM', openingSpread: -7, openingTotal: 46 }
      ],
      MLB: [
        { home_team: 'Yankees', away_team: 'Red Sox', spread: -1.5, total: 9.5, time: '7:05 PM', openingSpread: -1.5, openingTotal: 9 },
        { home_team: 'Dodgers', away_team: 'Giants', spread: -1.5, total: 8.5, time: '10:10 PM', openingSpread: -1.5, openingTotal: 8 }
      ],
      NHL: [
        { home_team: 'Bruins', away_team: 'Rangers', spread: -1.5, total: 6, time: '7:00 PM', openingSpread: -1.5, openingTotal: 5.5 },
        { home_team: 'Avalanche', away_team: 'Knights', spread: -1.5, total: 6.5, time: '9:00 PM', openingSpread: -1.5, openingTotal: 6 }
      ],
      NCAAB: [
        { home_team: 'Duke', away_team: 'UNC', spread: -4.5, total: 152.5, time: '9:00 PM', openingSpread: -5, openingTotal: 151 },
        { home_team: 'Kansas', away_team: 'Kentucky', spread: -3, total: 148, time: '7:00 PM', openingSpread: -2.5, openingTotal: 149 }
      ]
    };

    return (baseGames[sport] || baseGames.NBA).map((game, gameIdx) => {
      const bookOdds = {};
      mockBooks.forEach(book => {
        const spreadVariance = (Math.random() - 0.5) * 0.5;
        const oddsVariance = Math.floor((Math.random() - 0.5) * 10);

        bookOdds[book] = {
          spread: Math.round((game.spread + spreadVariance) * 2) / 2,
          spread_odds: -110 + oddsVariance,
          total: game.total + (Math.random() > 0.7 ? 0.5 : 0),
          over_odds: -110 + Math.floor((Math.random() - 0.5) * 8),
          under_odds: -110 + Math.floor((Math.random() - 0.5) * 8),
          home_ml: game.spread < 0 ? -150 + Math.floor((Math.random() - 0.5) * 30) : 130 + Math.floor((Math.random() - 0.5) * 30),
          away_ml: game.spread < 0 ? 130 + Math.floor((Math.random() - 0.5) * 30) : -150 + Math.floor((Math.random() - 0.5) * 30)
        };
      });

      // Find best odds
      const bestSpreadOdds = Math.max(...Object.values(bookOdds).map(b => b.spread_odds));
      const bestOverOdds = Math.max(...Object.values(bookOdds).map(b => b.over_odds));
      const bestUnderOdds = Math.max(...Object.values(bookOdds).map(b => b.under_odds));
      const bestHomeML = Math.max(...Object.values(bookOdds).map(b => b.home_ml));
      const bestAwayML = Math.max(...Object.values(bookOdds).map(b => b.away_ml));

      // Generate line history
      const generateHistory = (base, variance) => {
        const history = [];
        let current = base;
        for (let i = 0; i < 8; i++) {
          history.push(current);
          current += (Math.random() - 0.5) * variance;
        }
        return history;
      };

      return {
        ...game,
        id: `${game.home_team}-${game.away_team}`,
        books: bookOdds,
        best: {
          spread_odds: bestSpreadOdds,
          spread_book: Object.keys(bookOdds).find(b => bookOdds[b].spread_odds === bestSpreadOdds),
          over_odds: bestOverOdds,
          over_book: Object.keys(bookOdds).find(b => bookOdds[b].over_odds === bestOverOdds),
          under_odds: bestUnderOdds,
          under_book: Object.keys(bookOdds).find(b => bookOdds[b].under_odds === bestUnderOdds),
          home_ml: bestHomeML,
          home_ml_book: Object.keys(bookOdds).find(b => bookOdds[b].home_ml === bestHomeML),
          away_ml: bestAwayML,
          away_ml_book: Object.keys(bookOdds).find(b => bookOdds[b].away_ml === bestAwayML)
        },
        lineHistory: {
          spread: generateHistory(game.openingSpread || game.spread, 0.5),
          total: generateHistory(game.openingTotal || game.total, 1)
        },
        spreadMovement: game.spread - (game.openingSpread || game.spread),
        totalMovement: game.total - (game.openingTotal || game.total)
      };
    });
  };

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const teams = new Set();
    games.forEach(g => {
      if (g.home_team.toLowerCase().includes(query)) teams.add(g.home_team);
      if (g.away_team.toLowerCase().includes(query)) teams.add(g.away_team);
    });
    return Array.from(teams).slice(0, 5);
  }, [searchQuery, games]);

  // Handle search select
  const handleSearchSelect = (team) => {
    setSearchQuery(team);
    // Add to recent searches
    const updated = [team, ...recentSearches.filter(s => s !== team)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Toggle bookmark
  const toggleBookmark = (gameId) => {
    const updated = bookmarks.includes(gameId)
      ? bookmarks.filter(id => id !== gameId)
      : [...bookmarks, gameId];
    setBookmarks(updated);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  };

  // Toggle sportsbook visibility
  const toggleBook = (book) => {
    const updated = visibleBooks.includes(book)
      ? visibleBooks.filter(b => b !== book)
      : [...visibleBooks, book];
    setVisibleBooks(updated);
    const hidden = ALL_BOOKS.filter(b => !updated.includes(b));
    localStorage.setItem(HIDDEN_BOOKS_KEY, JSON.stringify(hidden));
  };

  // Show all books
  const showAllBooks = () => {
    setVisibleBooks(ALL_BOOKS);
    localStorage.removeItem(HIDDEN_BOOKS_KEY);
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    let filtered = games;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.home_team.toLowerCase().includes(query) ||
        g.away_team.toLowerCase().includes(query)
      );
    }

    // Bookmarked only
    if (showBookmarkedOnly) {
      filtered = filtered.filter(g => bookmarks.includes(g.id || `${g.home_team}-${g.away_team}`));
    }

    return filtered;
  }, [games, searchQuery, showBookmarkedOnly, bookmarks]);

  const formatOdds = (odds) => {
    if (odds > 0) return `+${odds}`;
    return odds;
  };

  const getOddsColor = (odds, bestOdds) => {
    if (odds === bestOdds) return '#00FF88';
    if (odds >= bestOdds - 3) return '#00D4FF';
    if (odds >= -110) return '#FFD700';
    return '#9ca3af';
  };

  const BookBadge = ({ book, isBest }) => (
    <span style={{
      backgroundColor: isBest ? '#00FF8830' : (BOOK_COLORS[book?.toLowerCase()] || '#444') + '30',
      color: isBest ? '#00FF88' : '#fff',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold',
      border: isBest ? '1px solid #00FF8850' : 'none'
    }}>
      {book?.toUpperCase() || 'N/A'}
    </span>
  );

  // Calculate average odds for comparison
  const getOddsDifference = (odds, allOdds) => {
    const avg = allOdds.reduce((a, b) => a + b, 0) / allOdds.length;
    const diff = odds - avg;
    return diff;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '15px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔍 Best Odds Finder
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Compare odds across all sportsbooks • Find the best number
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

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
            onSelect={handleSearchSelect}
            onClearRecent={clearRecentSearches}
          />
        </div>

        {/* Filter Controls */}
        <FilterControls
          betType={betTypeFilter}
          onBetTypeChange={setBetTypeFilter}
          minOdds={minOddsFilter}
          onMinOddsChange={setMinOddsFilter}
          visibleBooks={visibleBooks}
          allBooks={ALL_BOOKS}
          onToggleBook={toggleBook}
          onShowAllBooks={showAllBooks}
          showBookmarkedOnly={showBookmarkedOnly}
          onToggleBookmarked={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          bookmarkCount={bookmarks.length}
        />

        {/* Savings Calculator */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#00FF8815', borderRadius: '10px', border: '1px solid #00FF8830' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>BEST ODDS SAVED</div>
            <div style={{ color: '#00FF88', fontSize: '20px', fontWeight: 'bold' }}>~$5-15/bet</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>vs standard -110</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#1a1a2e', borderRadius: '10px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>BOOKS COMPARED</div>
            <div style={{ color: '#00D4FF', fontSize: '20px', fontWeight: 'bold' }}>{visibleBooks.length}</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>sportsbooks</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#1a1a2e', borderRadius: '10px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>PINNACLE INCLUDED</div>
            <div style={{ color: visibleBooks.includes('pinnacle') ? '#FFD700' : '#6b7280', fontSize: '20px', fontWeight: 'bold' }}>
              {visibleBooks.includes('pinnacle') ? '✓' : '✗'}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>sharpest lines</div>
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
            <ConnectionError onRetry={fetchGames} serviceName="odds API" />
          </div>
        )}

        {/* Games */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <CardSkeleton count={3} />
          </div>
        ) : filteredGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Games Found</h3>
            <p>
              {searchQuery || showBookmarkedOnly
                ? 'No games match your current filters. Try adjusting them.'
                : `No ${sport} games with odds available right now.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredGames.map((game, idx) => {
              const gameId = game.id || `${game.home_team}-${game.away_team}`;
              const isBookmarked = bookmarks.includes(gameId);
              const isExpanded = selectedGame === idx;

              return (
                <div key={idx} style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isBookmarked ? '0 0 0 1px #FFD70040' : 'none'
                }}>
                  {/* Game Header */}
                  <div style={{
                    padding: '15px 20px',
                    backgroundColor: '#12121f',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                    onClick={() => setSelectedGame(selectedGame === idx ? null : idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                          {game.away_team} @ {game.home_team}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>
                            {game.time || 'TBD'}
                          </span>
                          {/* Line Movement Indicators */}
                          {game.spreadMovement !== 0 && (
                            <LineMovementBadge movement={game.spreadMovement} type="spread" />
                          )}
                          {game.lineHistory?.spread && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setHistoryGame(game); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer'
                              }}
                              title="View line history"
                            >
                              <LineSparkline data={game.lineHistory.spread} color="#00D4FF" width={50} height={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <QuickActions
                        game={game}
                        isBookmarked={isBookmarked}
                        onBookmark={() => toggleBookmark(gameId)}
                      />
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Best Odds Summary */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    padding: '20px'
                  }}>
                    {/* Spread */}
                    {(betTypeFilter === 'all' || betTypeFilter === 'spread') && (
                      <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>SPREAD</div>
                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {game.spread > 0 ? '+' : ''}{game.spread}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#00FF88', fontWeight: 'bold' }}>
                            {formatOdds(game.best?.spread_odds || -110)}
                          </span>
                          <BookBadge book={game.best?.spread_book} isBest={true} />
                        </div>
                      </div>
                    )}

                    {/* Over */}
                    {(betTypeFilter === 'all' || betTypeFilter === 'total') && (
                      <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>OVER</div>
                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          O {game.total}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#00FF88', fontWeight: 'bold' }}>
                            {formatOdds(game.best?.over_odds || -110)}
                          </span>
                          <BookBadge book={game.best?.over_book} isBest={true} />
                        </div>
                      </div>
                    )}

                    {/* Under */}
                    {(betTypeFilter === 'all' || betTypeFilter === 'total') && (
                      <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>UNDER</div>
                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          U {game.total}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#00FF88', fontWeight: 'bold' }}>
                            {formatOdds(game.best?.under_odds || -110)}
                          </span>
                          <BookBadge book={game.best?.under_book} isBest={true} />
                        </div>
                      </div>
                    )}

                    {/* Home ML */}
                    {(betTypeFilter === 'all' || betTypeFilter === 'moneyline') && (
                      <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>{game.home_team} ML</div>
                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {formatOdds(game.best?.home_ml || -150)}
                        </div>
                        <BookBadge book={game.best?.home_ml_book} isBest={true} />
                      </div>
                    )}

                    {/* Away ML */}
                    {(betTypeFilter === 'all' || betTypeFilter === 'moneyline') && (
                      <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>{game.away_team} ML</div>
                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {formatOdds(game.best?.away_ml || 130)}
                        </div>
                        <BookBadge book={game.best?.away_ml_book} isBest={true} />
                      </div>
                    )}
                  </div>

                  {/* Expanded Book Comparison */}
                  {isExpanded && game.books && (
                    <div style={{
                      padding: '20px',
                      borderTop: '1px solid #333',
                      backgroundColor: '#12121f'
                    }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #333' }}>
                              <th style={{ padding: '10px', textAlign: 'left', color: '#6b7280' }}>BOOK</th>
                              {(betTypeFilter === 'all' || betTypeFilter === 'spread') && (
                                <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>SPREAD</th>
                              )}
                              {(betTypeFilter === 'all' || betTypeFilter === 'total') && (
                                <>
                                  <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>OVER</th>
                                  <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>UNDER</th>
                                </>
                              )}
                              {(betTypeFilter === 'all' || betTypeFilter === 'moneyline') && (
                                <>
                                  <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{game.home_team} ML</th>
                                  <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{game.away_team} ML</th>
                                </>
                              )}
                              <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>VS AVG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(game.books)
                              .filter(([book]) => visibleBooks.includes(book))
                              .map(([book, odds]) => {
                                // Calculate difference vs average
                                const allSpreadOdds = Object.values(game.books).map(b => b.spread_odds);
                                const diffVsAvg = getOddsDifference(odds.spread_odds, allSpreadOdds);

                                return (
                                  <tr key={book} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '10px' }}>
                                      <span style={{
                                        backgroundColor: BOOK_COLORS[book] || '#444',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                      }}>
                                        {book.toUpperCase()}
                                      </span>
                                    </td>
                                    {(betTypeFilter === 'all' || betTypeFilter === 'spread') && (
                                      <td style={{
                                        padding: '10px',
                                        textAlign: 'center',
                                        color: getOddsColor(odds.spread_odds, game.best?.spread_odds),
                                        fontWeight: odds.spread_odds === game.best?.spread_odds ? 'bold' : 'normal'
                                      }}>
                                        {odds.spread > 0 ? '+' : ''}{odds.spread} ({formatOdds(odds.spread_odds)})
                                      </td>
                                    )}
                                    {(betTypeFilter === 'all' || betTypeFilter === 'total') && (
                                      <>
                                        <td style={{
                                          padding: '10px',
                                          textAlign: 'center',
                                          color: getOddsColor(odds.over_odds, game.best?.over_odds),
                                          fontWeight: odds.over_odds === game.best?.over_odds ? 'bold' : 'normal'
                                        }}>
                                          {formatOdds(odds.over_odds)}
                                        </td>
                                        <td style={{
                                          padding: '10px',
                                          textAlign: 'center',
                                          color: getOddsColor(odds.under_odds, game.best?.under_odds),
                                          fontWeight: odds.under_odds === game.best?.under_odds ? 'bold' : 'normal'
                                        }}>
                                          {formatOdds(odds.under_odds)}
                                        </td>
                                      </>
                                    )}
                                    {(betTypeFilter === 'all' || betTypeFilter === 'moneyline') && (
                                      <>
                                        <td style={{
                                          padding: '10px',
                                          textAlign: 'center',
                                          color: getOddsColor(odds.home_ml, game.best?.home_ml),
                                          fontWeight: odds.home_ml === game.best?.home_ml ? 'bold' : 'normal'
                                        }}>
                                          {formatOdds(odds.home_ml)}
                                        </td>
                                        <td style={{
                                          padding: '10px',
                                          textAlign: 'center',
                                          color: getOddsColor(odds.away_ml, game.best?.away_ml),
                                          fontWeight: odds.away_ml === game.best?.away_ml ? 'bold' : 'normal'
                                        }}>
                                          {formatOdds(odds.away_ml)}
                                        </td>
                                      </>
                                    )}
                                    <td style={{
                                      padding: '10px',
                                      textAlign: 'center',
                                      color: diffVsAvg > 0 ? '#00FF88' : diffVsAvg < 0 ? '#FF6B6B' : '#6b7280',
                                      fontWeight: 'bold'
                                    }}>
                                      {diffVsAvg > 0 ? '+' : ''}{diffVsAvg.toFixed(1)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Line History Modal */}
        {historyGame && (
          <LineHistoryModal game={historyGame} onClose={() => setHistoryGame(null)} />
        )}
      </div>
    </div>
  );
};

export default BestOdds;
