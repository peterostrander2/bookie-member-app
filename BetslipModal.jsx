/**
 * BETSLIP MODAL
 *
 * Click-to-bet sportsbook integration.
 * Shows odds comparison across books and links to place bets.
 */

import React, { useState, useEffect } from 'react';
import api from './api';
import { useToast } from './Toast';

// Sportsbook logos/colors for branding
const SPORTSBOOK_STYLES = {
  draftkings: { color: '#53D337', bgColor: '#0D1B0D', name: 'DraftKings', icon: '👑' },
  fanduel: { color: '#1493FF', bgColor: '#0A1929', name: 'FanDuel', icon: '🎯' },
  betmgm: { color: '#B8860B', bgColor: '#1A1A0D', name: 'BetMGM', icon: '🦁' },
  caesars: { color: '#C5A572', bgColor: '#1A1510', name: 'Caesars', icon: '🏛️' },
  pointsbet: { color: '#ED1C24', bgColor: '#1A0D0D', name: 'PointsBet', icon: '📍' },
  williamhill: { color: '#00533F', bgColor: '#0D1A15', name: 'William Hill', icon: '🎰' },
  barstool: { color: '#CE0E2D', bgColor: '#1A0D10', name: 'Barstool', icon: '🍺' },
  betrivers: { color: '#1B365D', bgColor: '#0D1219', name: 'BetRivers', icon: '🌊' }
};

export const BetslipModal = ({ isOpen, onClose, bet, sport }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [sportsbooks, setSportsbooks] = useState([]);
  const [betslipData, setBetslipData] = useState(null);

  useEffect(() => {
    if (isOpen && bet) {
      fetchBetslipData();
    }
  }, [isOpen, bet]);

  const fetchBetslipData = async () => {
    setLoading(true);
    try {
      // Call the backend to generate betslip links
      const data = await api.generateBetslip({
        game_id: bet.game_id,
        bet_type: bet.bet_type || 'spread',
        team: bet.team,
        side: bet.side,
        line: bet.line,
        sport: sport
      });

      if (data && data.sportsbooks) {
        setBetslipData(data);
        setSportsbooks(data.sportsbooks);
      } else {
        // Fallback: fetch available sportsbooks with placeholder odds
        const books = await api.getSportsbooks();
        setSportsbooks(books.length > 0 ? books : generateFallbackBooks(bet));
      }
    } catch (err) {
      console.error('Error fetching betslip:', err);
      // Use fallback data
      setSportsbooks(generateFallbackBooks(bet));
    }
    setLoading(false);
  };

  const generateFallbackBooks = (bet) => {
    // Generate placeholder sportsbook data when API unavailable
    const books = Object.keys(SPORTSBOOK_STYLES);
    return books.map(bookId => ({
      id: bookId,
      name: SPORTSBOOK_STYLES[bookId].name,
      odds: bet.odds || -110,
      line: bet.line,
      available: true,
      link: null // No deep link available
    }));
  };

  const handleBookClick = (book) => {
    if (book.link) {
      // Open sportsbook with prefilled betslip
      window.open(book.link, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${book.name}...`);
    } else {
      // No deep link, open main sportsbook page
      const fallbackUrls = {
        draftkings: 'https://sportsbook.draftkings.com',
        fanduel: 'https://sportsbook.fanduel.com',
        betmgm: 'https://sports.betmgm.com',
        caesars: 'https://www.caesars.com/sportsbook',
        pointsbet: 'https://www.pointsbet.com',
        williamhill: 'https://www.williamhill.com',
        barstool: 'https://www.barstoolsportsbook.com',
        betrivers: 'https://www.betrivers.com'
      };
      window.open(fallbackUrls[book.id] || '#', '_blank', 'noopener,noreferrer');
      toast.info(`Opening ${book.name} - manually add your bet`);
    }
    onClose();
  };

  const formatOdds = (odds) => {
    if (!odds) return '-110';
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getBestOdds = () => {
    if (!sportsbooks.length) return null;
    return sportsbooks.reduce((best, book) => {
      if (!best || book.odds > best.odds) return book;
      return best;
    }, null);
  };

  if (!isOpen) return null;

  const bestBook = getBestOdds();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #333'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px' }}>
                Place Your Bet
              </h2>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                {bet?.team || bet?.player} - {bet?.side} {bet?.line}
              </div>
              {bet?.game && (
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                  {bet.game}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          {/* Bet Details */}
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#0a0a0f',
            borderBottom: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  {bet?.bet_type || 'Spread'}
                </div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                  {bet?.side} {bet?.line}
                </div>
              </div>
              {bestBook && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>BEST ODDS</div>
                  <div style={{ color: '#00FF88', fontSize: '18px', fontWeight: 'bold' }}>
                    {formatOdds(bestBook.odds)}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>
                    at {bestBook.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sportsbooks Grid */}
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px' }}>
              SELECT SPORTSBOOK
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading sportsbooks...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {sportsbooks.map((book) => {
                  const style = SPORTSBOOK_STYLES[book.id] || {
                    color: '#00D4FF',
                    bgColor: '#0D1520',
                    name: book.name,
                    icon: '🎲'
                  };
                  const isBest = bestBook && book.odds === bestBook.odds;

                  return (
                    <button
                      key={book.id}
                      onClick={() => handleBookClick(book)}
                      disabled={!book.available}
                      style={{
                        backgroundColor: style.bgColor,
                        border: isBest ? `2px solid ${style.color}` : '1px solid #333',
                        borderRadius: '12px',
                        padding: '15px',
                        cursor: book.available ? 'pointer' : 'not-allowed',
                        opacity: book.available ? 1 : 0.5,
                        textAlign: 'left',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => {
                        if (book.available) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${style.color}30`;
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isBest && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '10px',
                          backgroundColor: '#00FF88',
                          color: '#000',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          BEST
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{style.icon}</span>
                        <span style={{ color: style.color, fontWeight: 'bold', fontSize: '13px' }}>
                          {style.name}
                        </span>
                      </div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                        {formatOdds(book.odds)}
                      </div>
                      {book.line && book.line !== bet?.line && (
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          Line: {book.line}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #333',
            backgroundColor: '#12121f'
          }}>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, textAlign: 'center' }}>
              Clicking a sportsbook will open their site. Must be 21+ and in a legal state.
              Please gamble responsibly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Simple button to trigger the modal
export const PlaceBetButton = ({ bet, sport, size = 'normal', label }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const buttonStyles = {
    small: {
      padding: '5px 10px',
      fontSize: '11px'
    },
    normal: {
      padding: '8px 16px',
      fontSize: '13px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '14px'
    }
  };

  // Default label based on context
  const buttonLabel = label || (bet?.book ? `Bet at ${bet.book}` : 'Place Bet');

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title={bet?.book ? `Open bet at ${bet.book}` : 'Compare odds across sportsbooks'}
        style={{
          ...buttonStyles[size],
          backgroundColor: '#00FF8820',
          color: '#00FF88',
          border: '1px solid #00FF8840',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#00FF8830';
          e.currentTarget.style.borderColor = '#00FF8860';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#00FF8820';
          e.currentTarget.style.borderColor = '#00FF8840';
        }}
      >
        <span>💰</span>
        <span>{buttonLabel}</span>
      </button>
      <BetslipModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bet={bet}
        sport={sport}
      />
    </>
  );
};

export default BetslipModal;
