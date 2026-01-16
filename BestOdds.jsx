/**
 * BEST ODDS FINDER
 *
 * Compare odds across ALL sportsbooks side-by-side.
 * Find the best number for every bet type.
 * Save money on juice = pays for itself.
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from './api';

// Sports options (moved outside component to prevent recreation on every render)
const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

// Sportsbook colors (already outside component - good)
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

// Mock books for generating demo data (moved outside component)
const MOCK_BOOKS = ['fanduel', 'draftkings', 'betmgm', 'caesars', 'pinnacle', 'pointsbet', 'betrivers', 'bet365'];

// Base game data for each sport (moved outside component)
const BASE_GAMES = {
  NBA: [
    { home_team: 'Lakers', away_team: 'Celtics', spread: -3.5, total: 224.5, time: '7:30 PM' },
    { home_team: 'Warriors', away_team: 'Suns', spread: -5.5, total: 231, time: '10:00 PM' },
    { home_team: 'Bucks', away_team: 'Heat', spread: -7, total: 219.5, time: '8:00 PM' }
  ],
  NFL: [
    { home_team: 'Chiefs', away_team: 'Bills', spread: -3, total: 51.5, time: '1:00 PM' },
    { home_team: 'Eagles', away_team: 'Cowboys', spread: -2.5, total: 48, time: '4:25 PM' }
  ],
  MLB: [
    { home_team: 'Yankees', away_team: 'Red Sox', spread: -1.5, total: 9.5, time: '7:05 PM' }
  ],
  NHL: [
    { home_team: 'Bruins', away_team: 'Rangers', spread: -1.5, total: 6, time: '7:00 PM' }
  ],
  NCAAB: [
    { home_team: 'Duke', away_team: 'UNC', spread: -4.5, total: 152.5, time: '9:00 PM' }
  ]
};

// Generate mock games function (moved outside component)
const generateMockGames = (sport) => {
  return (BASE_GAMES[sport] || BASE_GAMES.NBA).map(game => {
    const bookOdds = {};
    MOCK_BOOKS.forEach(book => {
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

    return {
      ...game,
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
      }
    };
  });
};

const BestOdds = () => {
  const [sport, setSport] = useState('NBA');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized fetch function
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLiveOdds(sport);

      if (data?.games || data?.odds) {
        const gameData = data.games || data.odds || data;
        setGames(Array.isArray(gameData) ? gameData : []);
      } else {
        // Generate mock data for demonstration
        setGames(generateMockGames(sport));
      }
    } catch (err) {
      console.error('Error fetching odds:', err);
      setGames(generateMockGames(sport));
    }
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, [sport]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGames();
  }, [fetchGames]);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

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

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔍 Best Odds Finder
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                Compare odds across all sportsbooks • Find the best number
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastUpdated && (
                <div style={{
                  backgroundColor: '#1a1a2e',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>Updated</span>
                  <span style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '12px' }}>{formatTime(lastUpdated)}</span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#9ca3af',
                  cursor: refreshing || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{
                  display: 'inline-block',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}>
                  {refreshing ? '...' : '🔄'}
                </span>
                Refresh
              </button>
            </div>
          </div>
        </div>

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
            <div style={{ color: '#00D4FF', fontSize: '20px', fontWeight: 'bold' }}>8+</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>sportsbooks</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#1a1a2e', borderRadius: '10px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>PINNACLE INCLUDED</div>
            <div style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold' }}>✓</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>sharpest lines</div>
          </div>
        </div>

        {/* Sport Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {SPORTS.map(s => (
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

        {/* Games */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔍</div>
            Scanning sportsbooks...
          </div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Games Found</h3>
            <p>No {sport} games with odds available right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {games.map((game, idx) => {
              const gameKey = `${game.away_team}-${game.home_team}`;
              return (
              <div key={gameKey} style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                overflow: 'hidden'
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
                  <div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                      {game.away_team} @ {game.home_team}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      {game.time || 'TBD'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {selectedGame === idx ? 'Hide details ▲' : 'Show all books ▼'}
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

                  {/* Over */}
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

                  {/* Under */}
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

                  {/* Home ML */}
                  <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>{game.home_team} ML</div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {formatOdds(game.best?.home_ml || -150)}
                    </div>
                    <BookBadge book={game.best?.home_ml_book} isBest={true} />
                  </div>

                  {/* Away ML */}
                  <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>{game.away_team} ML</div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {formatOdds(game.best?.away_ml || 130)}
                    </div>
                    <BookBadge book={game.best?.away_ml_book} isBest={true} />
                  </div>
                </div>

                {/* Expanded Book Comparison */}
                {selectedGame === idx && game.books && (
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
                            <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>SPREAD</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>OVER</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>UNDER</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{game.home_team} ML</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{game.away_team} ML</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(game.books).map(([book, odds]) => (
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
                              <td style={{
                                padding: '10px',
                                textAlign: 'center',
                                color: getOddsColor(odds.spread_odds, game.best?.spread_odds),
                                fontWeight: odds.spread_odds === game.best?.spread_odds ? 'bold' : 'normal'
                              }}>
                                {odds.spread > 0 ? '+' : ''}{odds.spread} ({formatOdds(odds.spread_odds)})
                              </td>
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
                            </tr>
                          ))}
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
      </div>
    </div>
  );
};

export default BestOdds;
