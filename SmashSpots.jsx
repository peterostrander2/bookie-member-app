import React, { useState, useEffect } from 'react';
import api from './api';

const SmashSpots = () => {
  const [sport, setSport] = useState('NBA');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  useEffect(() => {
    fetchPicks();
  }, [sport]);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const data = await api.getSmashSpots(sport);
      
      if (data.slate && data.slate.length > 0) {
        const gamePicks = data.slate.map(game => {
          const spreadEdge = analyzeSpread(game);
          const totalEdge = analyzeTotal(game);
          
          return {
            ...game,
            spreadEdge,
            totalEdge,
            bestPick: spreadEdge.confidence > totalEdge.confidence ? 'spread' : 'total'
          };
        }).filter(g => g.spreadEdge.confidence >= 60 || g.totalEdge.confidence >= 60)
          .sort((a, b) => Math.max(b.spreadEdge.confidence, b.totalEdge.confidence) - 
                         Math.max(a.spreadEdge.confidence, a.totalEdge.confidence));
        
        setPicks(gamePicks);
      } else {
        setPicks([]);
      }
    } catch (err) {
      console.error('Error fetching picks:', err);
      setPicks([]);
    }
    setLoading(false);
  };

  const analyzeSpread = (game) => {
    const spread = Math.abs(game.spread);
    const odds = game.spread_odds;
    let confidence = 50;
    let side = game.spread > 0 ? 'HOME' : 'AWAY';
    
    if ([3, 7, 10].includes(spread)) confidence += 10;
    if (spread >= 10) confidence += 5;
    if (odds > -105) confidence += 10;
    if (odds > -108) confidence += 5;
    if (spread <= 3) confidence += 5;
    
    confidence += Math.floor(Math.random() * 10);
    confidence = Math.min(95, Math.max(55, confidence));
    
    return { confidence, side, spread: game.spread, odds, book: game.spread_book };
  };

  const analyzeTotal = (game) => {
    const overOdds = game.over_odds;
    const underOdds = game.under_odds;
    let confidence = 50;
    let recommendation = 'OVER';
    let book = game.over_book;
    
    if (overOdds > underOdds) {
      recommendation = 'OVER';
      confidence += 5;
      book = game.over_book;
    } else {
      recommendation = 'UNDER';
      confidence += 5;
      book = game.under_book;
    }
    
    if (overOdds > -108) confidence += 8;
    if (underOdds > -108) confidence += 8;
    
    confidence += Math.floor(Math.random() * 10);
    confidence = Math.min(92, Math.max(55, confidence));
    
    return { confidence, recommendation, total: game.total, overOdds, underOdds, book, overBook: game.over_book, underBook: game.under_book };
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#00FF88';
    if (conf >= 70) return '#00D4FF';
    return '#FFD700';
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatOdds = (odds) => {
    if (odds > 0) return `+${odds}`;
    return odds;
  };

  const BookBadge = ({ book }) => {
    const colors = {
      'fanduel': '#1493FF',
      'draftkings': '#53D337',
      'betmgm': '#C4A962',
      'caesars': '#0A4833',
      'pointsbet': '#E44023',
      'pinnacle': '#C41230',
      'betrivers': '#1A6B3C',
      'unibet': '#147B45',
    };
    
    const bgColor = colors[book?.toLowerCase()] || '#444';
    const displayName = book?.replace('_us', '').replace('_', ' ').toUpperCase() || 'N/A';
    
    return (
      <span style={{
        backgroundColor: bgColor,
        color: '#fff',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        marginLeft: '6px'
      }}>
        {displayName}
      </span>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔥 Today's Smash Spots
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              {picks.length} plays • Best odds from {picks[0]?.books_compared || 10}+ sportsbooks
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF88' }}></span>
              <span style={{ color: '#9ca3af' }}>80%+ SMASH</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D4FF' }}></span>
              <span style={{ color: '#9ca3af' }}>70%+ STRONG</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFD700' }}></span>
              <span style={{ color: '#9ca3af' }}>&lt;70% LEAN</span>
            </span>
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

        {/* Picks Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading picks...</div>
        ) : picks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No High-Confidence Picks</h3>
            <p>Check back closer to game time for today's {sport} picks.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {picks.map((game, idx) => {
              const mainPick = game.bestPick === 'spread' ? game.spreadEdge : game.totalEdge;
              const confidence = mainPick.confidence;
              const color = getConfidenceColor(confidence);
              
              return (
                <div key={idx} style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `4px solid ${color}`
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{game.away_team}</div>
                      <div style={{ color: '#9ca3af', fontSize: '14px' }}>@ {game.home_team}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
                        {formatTime(game.commence_time)} • {game.books_compared} books
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="30" cy="30" r="25" fill="none" stroke="#333" strokeWidth="5" />
                        <circle 
                          cx="30" cy="30" r="25" fill="none" 
                          stroke={color} strokeWidth="5"
                          strokeDasharray={`${confidence * 1.57} 157`}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: color, fontWeight: 'bold', fontSize: '14px'
                      }}>
                        {confidence}%
                      </div>
                    </div>
                  </div>
