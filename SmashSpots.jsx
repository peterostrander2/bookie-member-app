import React, { useState, useEffect } from 'react';
import api from './api';
import { calculateConfidence, fetchSignalContext, getTierInfo, getRecommendationDisplay } from './signalEngine';
import { recordPick, getAllPicks } from './clvTracker';
import { explainPick, quickExplain } from './pickExplainer';
import { analyzeCorrelation, checkPickCorrelation } from './correlationDetector';
import { ConsensusMeter, ConsensusMiniBadge, ConsensusAlert, calculateConsensus } from './ConsensusMeter';
import CommunityVote from './CommunityVote';

// Floating Glow Badge for special convergence picks
const ConvergenceGlowBadge = ({ tier }) => {
  const isGolden = tier === 'GOLDEN_CONVERGENCE';
  const isHarmonic = tier === 'HARMONIC_ALIGNMENT' || tier === 'SUPER_SIGNAL';

  if (!isGolden && !isHarmonic) return null;

  const config = isGolden ? {
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 165, 0, 0.4)',
    icon: '🏆',
    label: 'GOLDEN CONVERGENCE',
    subtext: 'ML + Sharp + Esoteric Aligned'
  } : {
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #00D4FF 50%, #00FF88 100%)',
    glow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(0, 212, 255, 0.4)',
    icon: '✨',
    label: 'HARMONIC ALIGNMENT',
    subtext: 'Math + Magic Converge'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      animation: 'pulse 2s infinite'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
            50% { transform: translateX(-50%) scale(1.05); opacity: 0.9; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>
      <div style={{
        background: config.gradient,
        padding: '3px',
        borderRadius: '20px',
        boxShadow: config.glow
      }}>
        <div style={{
          backgroundColor: '#0a0a0f',
          borderRadius: '18px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>{config.icon}</span>
          <div>
            <div style={{
              background: config.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
              fontSize: '11px',
              letterSpacing: '0.5px'
            }}>
              {config.label}
            </div>
            <div style={{ color: '#6b7280', fontSize: '9px' }}>
              {config.subtext}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SmashSpots = () => {
  const [sport, setSport] = useState('NBA');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signalContext, setSignalContext] = useState(null);
  const [trackedPicks, setTrackedPicks] = useState(new Set());
  const [expandedExplanations, setExpandedExplanations] = useState(new Set());
  const [correlationWarning, setCorrelationWarning] = useState(null);

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  // Load already tracked picks on mount and analyze correlation
  useEffect(() => {
    const existingPicks = getAllPicks();
    const trackedIds = new Set(existingPicks.map(p =>
      `${p.game.home_team}-${p.game.away_team}-${p.side}-${p.bet_type}`
    ));
    setTrackedPicks(trackedIds);

    // Analyze correlation of tracked picks
    if (existingPicks.length >= 2) {
      const correlation = analyzeCorrelation(existingPicks);
      if (correlation.hasCorrelation) {
        setCorrelationWarning(correlation);
      }
    }
  }, []);

  // Toggle explanation visibility
  const toggleExplanation = (gameIdx) => {
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      if (next.has(gameIdx)) {
        next.delete(gameIdx);
      } else {
        next.add(gameIdx);
      }
      return next;
    });
  };

  const handleTrackPick = (game, betType) => {
    const isSpread = betType === 'spread';
    const edge = isSpread ? game.spreadEdge : game.totalEdge;

    const pickData = {
      sport,
      home_team: game.home_team,
      away_team: game.away_team,
      commence_time: game.commence_time,
      bet_type: betType,
      side: isSpread ? edge.side : edge.recommendation_side,
      line: isSpread ? game.spread : game.total,
      odds: isSpread ? edge.odds : (edge.recommendation_side === 'OVER' ? edge.overOdds : edge.underOdds),
      book: edge.book,
      confidence: edge.confidence,
      tier: edge.tier,
      signals: edge.signals
    };

    recordPick(pickData);

    // Update tracked set
    const pickId = `${game.home_team}-${game.away_team}-${pickData.side}-${betType}`;
    setTrackedPicks(prev => new Set([...prev, pickId]));

    // Re-analyze correlation with new pick
    const allPicks = getAllPicks();
    if (allPicks.length >= 2) {
      const correlation = analyzeCorrelation(allPicks);
      setCorrelationWarning(correlation.hasCorrelation ? correlation : null);
    }
  };

  const isPickTracked = (game, betType) => {
    const edge = betType === 'spread' ? game.spreadEdge : game.totalEdge;
    const side = betType === 'spread' ? edge.side : edge.recommendation_side;
    const pickId = `${game.home_team}-${game.away_team}-${side}-${betType}`;
    return trackedPicks.has(pickId);
  };

  useEffect(() => {
    fetchPicks();
  }, [sport]);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      // Fetch game data and signal context in parallel
      const [slateData, context] = await Promise.all([
        api.getSmashSpots(sport),
        fetchSignalContext(sport)
      ]);

      setSignalContext(context);

      if (slateData.slate && slateData.slate.length > 0) {
        const gamePicks = slateData.slate.map(game => {
          // Use the signal engine for spread analysis
          const spreadAnalysis = calculateConfidence(
            { ...game, bet_type: 'spread' },
            sport,
            context
          );

          // Use the signal engine for total analysis
          const totalAnalysis = calculateConfidence(
            { ...game, bet_type: 'total' },
            sport,
            context
          );

          // Determine best pick based on signal-derived confidence
          const spreadEdge = {
            confidence: spreadAnalysis.confidence,
            tier: spreadAnalysis.tier,
            recommendation: spreadAnalysis.recommendation,
            signals: spreadAnalysis.topSignals,
            side: game.spread > 0 ? 'HOME' : 'AWAY',
            spread: game.spread,
            odds: game.spread_odds,
            book: game.spread_book
          };

          const totalEdge = {
            confidence: totalAnalysis.confidence,
            tier: totalAnalysis.tier,
            recommendation: totalAnalysis.recommendation,
            signals: totalAnalysis.topSignals,
            recommendation_side: game.over_odds > game.under_odds ? 'OVER' : 'UNDER',
            total: game.total,
            overOdds: game.over_odds,
            underOdds: game.under_odds,
            book: game.over_odds > game.under_odds ? game.over_book : game.under_book,
            overBook: game.over_book,
            underBook: game.under_book
          };

          return {
            ...game,
            spreadEdge,
            totalEdge,
            spreadAnalysis,
            totalAnalysis,
            bestPick: spreadEdge.confidence > totalEdge.confidence ? 'spread' : 'total'
          };
        }).filter(g => g.spreadEdge.confidence >= 55 || g.totalEdge.confidence >= 55)
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

        {/* Correlation Warning */}
        {correlationWarning && correlationWarning.hasCorrelation && (
          <div style={{
            backgroundColor: correlationWarning.recommendation.color + '15',
            border: `1px solid ${correlationWarning.recommendation.color}40`,
            borderRadius: '12px',
            padding: '15px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              fontSize: '28px',
              opacity: 0.9
            }}>
              {correlationWarning.recommendation.status === 'danger' ? '🚨' :
               correlationWarning.recommendation.status === 'warning' ? '⚠️' :
               correlationWarning.recommendation.status === 'caution' ? '💡' : '✅'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                color: correlationWarning.recommendation.color,
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                {correlationWarning.recommendation.message}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                {correlationWarning.recommendation.action}
              </div>
              {correlationWarning.warnings.slice(0, 2).map((w, i) => (
                <div key={i} style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                  • {w.message}
                </div>
              ))}
            </div>
            <div style={{
              backgroundColor: '#0a0a0f',
              padding: '10px 15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>DIVERSIFICATION</div>
              <div style={{
                color: correlationWarning.recommendation.color,
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {correlationWarning.diversificationScore}%
              </div>
            </div>
          </div>
        )}

        {/* Picks Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
            Analyzing signals...
          </div>
        ) : picks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No High-Confidence Picks</h3>
            <p>Check back closer to game time for today's {sport} picks.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {picks.map((game, idx) => {
              const mainPick = game.bestPick === 'spread' ? game.spreadEdge : game.totalEdge;
              const mainAnalysis = game.bestPick === 'spread' ? game.spreadAnalysis : game.totalAnalysis;
              const confidence = mainPick.confidence;
              const color = getConfidenceColor(confidence);
              const tierInfo = getTierInfo(mainPick.tier);
              const recDisplay = getRecommendationDisplay(mainPick.recommendation);

              const isSpecialTier = mainPick.tier === 'GOLDEN_CONVERGENCE' || mainPick.tier === 'HARMONIC_ALIGNMENT' || mainPick.tier === 'SUPER_SIGNAL';

              return (
                <div key={idx} style={{
                  backgroundColor: isSpecialTier ? '#0f0f1a' : '#1a1a2e',
                  borderRadius: '12px',
                  padding: '20px',
                  paddingTop: isSpecialTier ? '30px' : '20px',
                  borderLeft: `4px solid ${color}`,
                  position: 'relative',
                  overflow: 'visible',
                  border: isSpecialTier ? `1px solid ${tierInfo.color}30` : 'none',
                  boxShadow: isSpecialTier ? `0 0 30px ${tierInfo.color}15` : 'none'
                }}>
                  {/* Floating Glow Badge for Golden/Harmonic */}
                  <ConvergenceGlowBadge tier={mainPick.tier} />

                  {/* Tier Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: tierInfo.color + '20',
                    color: tierInfo.color,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: `1px solid ${tierInfo.color}40`
                  }}>
                    {tierInfo.label}
                  </div>

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', paddingRight: '120px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{game.away_team}</div>
                      <div style={{ color: '#9ca3af', fontSize: '14px' }}>@ {game.home_team}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
                        {formatTime(game.commence_time)} • {game.books_compared || 10}+ books
                      </div>
                    </div>
                  </div>

                  {/* Main Pick Display */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    {/* Confidence Ring */}
                    <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                      <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="35" cy="35" r="30" fill="none" stroke="#333" strokeWidth="6" />
                        <circle
                          cx="35" cy="35" r="30" fill="none"
                          stroke={color} strokeWidth="6"
                          strokeDasharray={`${confidence * 1.885} 188.5`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: color, fontWeight: 'bold', fontSize: '18px' }}>{confidence}%</div>
                      </div>
                    </div>

                    {/* Pick Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '20px' }}>{recDisplay.emoji}</span>
                        <span style={{ color: recDisplay.color, fontWeight: 'bold', fontSize: '16px' }}>
                          {recDisplay.label}
                        </span>
                      </div>
                      <div style={{ color: '#fff', fontSize: '14px' }}>
                        {game.bestPick === 'spread' ? (
                          <>
                            <strong>{mainPick.side}</strong> {mainPick.spread > 0 ? '+' : ''}{mainPick.spread}
                            <span style={{ color: '#9ca3af' }}> ({formatOdds(mainPick.odds)})</span>
                          </>
                        ) : (
                          <>
                            <strong>{mainPick.recommendation_side}</strong> {mainPick.total}
                            <span style={{ color: '#9ca3af' }}> ({formatOdds(mainPick.recommendation_side === 'OVER' ? mainPick.overOdds : mainPick.underOdds)})</span>
                          </>
                        )}
                        <BookBadge book={mainPick.book} />
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>
                        Expected: {tierInfo.winRate} win rate • {tierInfo.roi} ROI
                      </div>
                    </div>
                  </div>

                  {/* Signal Breakdown with Consensus */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Top Signals
                      </div>
                      <ConsensusMiniBadge signals={mainAnalysis} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(mainPick.signals || []).slice(0, 3).map((signal, sIdx) => (
                        <div key={sIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: signal.score >= 70 ? '#00FF88' : signal.score >= 55 ? '#00D4FF' : '#9ca3af'
                          }} />
                          <span style={{ color: '#9ca3af', width: '80px', textTransform: 'capitalize' }}>
                            {signal.name.replace(/_/g, ' ')}
                          </span>
                          <span style={{ color: '#fff', flex: 1 }}>{signal.contribution}</span>
                          <span style={{
                            color: signal.score >= 70 ? '#00FF88' : signal.score >= 55 ? '#00D4FF' : '#6b7280',
                            fontWeight: 'bold',
                            minWidth: '35px',
                            textAlign: 'right'
                          }}>
                            {signal.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why This Pick - Expandable */}
                  <button
                    onClick={() => toggleExplanation(idx)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: expandedExplanations.has(idx) ? '#00D4FF15' : 'transparent',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#00D4FF',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '12px'
                    }}
                  >
                    <span>💡</span>
                    {expandedExplanations.has(idx) ? 'Hide Explanation' : 'Why This Pick?'}
                    <span style={{ transform: expandedExplanations.has(idx) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>

                  {/* Expanded Explanation */}
                  {expandedExplanations.has(idx) && (() => {
                    const explanation = explainPick(game, mainAnalysis, sport);
                    return (
                      <div style={{
                        backgroundColor: '#0a0a0f',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '12px',
                        border: '1px solid #333'
                      }}>
                        {/* Summary */}
                        <p style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', margin: '0 0 12px' }}>
                          {explanation.summary}
                        </p>

                        {/* Key Factors */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Key Factors
                          </div>
                          {explanation.bullets.slice(0, 4).map((bullet, bIdx) => (
                            <div key={bIdx} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              marginBottom: '6px',
                              fontSize: '12px'
                            }}>
                              <span style={{
                                color: bullet.level === 'high' ? '#00FF88' : bullet.level === 'medium' ? '#00D4FF' : '#6b7280'
                              }}>
                                {bullet.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Risk Factors */}
                        {explanation.risks.length > 0 && (
                          <div>
                            <div style={{ color: '#FF8844', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase' }}>
                              Risk Factors
                            </div>
                            {explanation.risks.map((risk, rIdx) => (
                              <div key={rIdx} style={{
                                fontSize: '12px',
                                color: risk.level === 'high' ? '#FF4444' : risk.level === 'medium' ? '#FF8844' : '#9ca3af',
                                marginBottom: '4px'
                              }}>
                                ⚠️ {risk.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Consensus Meter */}
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                          <ConsensusMeter signals={mainAnalysis} showDetails={false} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Triple Alignment Alert */}
                  {calculateConsensus(mainAnalysis).tripleAlignment && (
                    <div style={{ marginBottom: '12px' }}>
                      <ConsensusAlert
                        signals={mainAnalysis}
                        pickName={`${game.away_team} @ ${game.home_team}`}
                      />
                    </div>
                  )}

                  {/* Both Picks Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    paddingTop: '12px',
                    borderTop: '1px solid #333'
                  }}>
                    {/* Spread */}
                    <div style={{
                      padding: '10px',
                      backgroundColor: game.bestPick === 'spread' ? '#00D4FF10' : 'transparent',
                      borderRadius: '6px',
                      border: game.bestPick === 'spread' ? '1px solid #00D4FF30' : '1px solid #333'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '10px' }}>SPREAD</span>
                        <button
                          onClick={() => handleTrackPick(game, 'spread')}
                          disabled={isPickTracked(game, 'spread')}
                          style={{
                            padding: '2px 8px',
                            fontSize: '9px',
                            backgroundColor: isPickTracked(game, 'spread') ? '#333' : '#00FF8820',
                            color: isPickTracked(game, 'spread') ? '#666' : '#00FF88',
                            border: `1px solid ${isPickTracked(game, 'spread') ? '#444' : '#00FF8840'}`,
                            borderRadius: '4px',
                            cursor: isPickTracked(game, 'spread') ? 'default' : 'pointer'
                          }}
                        >
                          {isPickTracked(game, 'spread') ? '✓ Tracked' : '+ Track'}
                        </button>
                      </div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                        {game.spreadEdge.side} {game.spread > 0 ? '+' : ''}{game.spread}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                        <span style={{ color: getConfidenceColor(game.spreadEdge.confidence), fontSize: '12px', fontWeight: 'bold' }}>
                          {game.spreadEdge.confidence}%
                        </span>
                        <BookBadge book={game.spreadEdge.book} />
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{
                      padding: '10px',
                      backgroundColor: game.bestPick === 'total' ? '#00D4FF10' : 'transparent',
                      borderRadius: '6px',
                      border: game.bestPick === 'total' ? '1px solid #00D4FF30' : '1px solid #333'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '10px' }}>TOTAL</span>
                        <button
                          onClick={() => handleTrackPick(game, 'total')}
                          disabled={isPickTracked(game, 'total')}
                          style={{
                            padding: '2px 8px',
                            fontSize: '9px',
                            backgroundColor: isPickTracked(game, 'total') ? '#333' : '#00FF8820',
                            color: isPickTracked(game, 'total') ? '#666' : '#00FF88',
                            border: `1px solid ${isPickTracked(game, 'total') ? '#444' : '#00FF8840'}`,
                            borderRadius: '4px',
                            cursor: isPickTracked(game, 'total') ? 'default' : 'pointer'
                          }}
                        >
                          {isPickTracked(game, 'total') ? '✓ Tracked' : '+ Track'}
                        </button>
                      </div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                        {game.totalEdge.recommendation_side} {game.total}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                        <span style={{ color: getConfidenceColor(game.totalEdge.confidence), fontSize: '12px', fontWeight: 'bold' }}>
                          {game.totalEdge.confidence}%
                        </span>
                        <BookBadge book={game.totalEdge.book} />
                      </div>
                    </div>
                  </div>

                  {/* Man vs Machine - Community Vote */}
                  <div style={{ marginTop: '12px' }}>
                    <CommunityVote
                      game={game}
                      betType={game.bestPick}
                      aiPick={game.bestPick === 'spread'
                        ? (mainPick.side?.toLowerCase() === 'home' ? 'home' : 'away')
                        : mainPick.recommendation_side?.toLowerCase()
                      }
                      aiConfidence={confidence}
                    />
                  </div>

                  {/* All Books */}
                  {game.all_books && (
                    <div style={{ marginTop: '10px', fontSize: '10px', color: '#4b5563' }}>
                      Compared: {game.all_books.slice(0, 8).join(', ')}{game.all_books.length > 8 ? ` +${game.all_books.length - 8} more` : ''}
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

export default SmashSpots;
