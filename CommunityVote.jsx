/**
 * COMMUNITY VOTE - Man vs Machine
 *
 * Shows AI prediction vs community sentiment.
 * Creates engagement and debate in Discord.
 *
 * "The AI likes Lakers, but 80% of the Community likes Warriors"
 */

import React, { useState, useEffect } from 'react';
import api from './api';

// Generate unique game ID for voting
const getGameVoteId = (game, betType) => {
  const dateStr = new Date(game.commence_time).toISOString().split('T')[0];
  return `${dateStr}_${game.home_team}_${game.away_team}_${betType}`.replace(/\s/g, '_').toLowerCase();
};

// localStorage fallback for votes (until backend is ready)
const getLocalVotes = (gameVoteId) => {
  try {
    const votes = JSON.parse(localStorage.getItem('bookie_community_votes') || '{}');
    return votes[gameVoteId] || { home: 0, away: 0, over: 0, under: 0, userVote: null };
  } catch {
    return { home: 0, away: 0, over: 0, under: 0, userVote: null };
  }
};

const saveLocalVote = (gameVoteId, side) => {
  try {
    const votes = JSON.parse(localStorage.getItem('bookie_community_votes') || '{}');
    if (!votes[gameVoteId]) {
      votes[gameVoteId] = { home: 0, away: 0, over: 0, under: 0, userVote: null };
    }

    // Remove previous vote if exists
    if (votes[gameVoteId].userVote) {
      votes[gameVoteId][votes[gameVoteId].userVote]--;
    }

    // Add new vote
    votes[gameVoteId][side]++;
    votes[gameVoteId].userVote = side;

    localStorage.setItem('bookie_community_votes', JSON.stringify(votes));
    return votes[gameVoteId];
  } catch {
    return { home: 0, away: 0, over: 0, under: 0, userVote: side };
  }
};

const CommunityVote = ({
  game,
  betType = 'spread',
  aiPick, // 'home', 'away', 'over', 'under'
  aiConfidence
}) => {
  const [votes, setVotes] = useState({ home: 0, away: 0, over: 0, under: 0, userVote: null });
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const gameVoteId = getGameVoteId(game, betType);
  const isSpread = betType === 'spread';
  const options = isSpread
    ? [{ key: 'home', label: game.home_team }, { key: 'away', label: game.away_team }]
    : [{ key: 'over', label: 'OVER' }, { key: 'under', label: 'UNDER' }];

  useEffect(() => {
    loadVotes();
  }, [gameVoteId]);

  const loadVotes = async () => {
    // Try backend first, fallback to localStorage
    try {
      const backendVotes = await api.getVotes(gameVoteId).catch(() => null);
      if (backendVotes && backendVotes.total > 0) {
        setVotes(backendVotes);
        setHasVoted(!!backendVotes.userVote);
      } else {
        // Fallback to localStorage
        const localVotes = getLocalVotes(gameVoteId);
        setVotes(localVotes);
        setHasVoted(!!localVotes.userVote);
      }
    } catch {
      const localVotes = getLocalVotes(gameVoteId);
      setVotes(localVotes);
      setHasVoted(!!localVotes.userVote);
    }
  };

  const handleVote = async (side) => {
    if (loading) return;

    setLoading(true);

    // Try backend first
    try {
      const result = await api.submitVote(gameVoteId, side).catch(() => null);
      if (result) {
        setVotes(result);
        setHasVoted(true);
      } else {
        // Fallback to localStorage
        const localResult = saveLocalVote(gameVoteId, side);
        setVotes(localResult);
        setHasVoted(true);
      }
    } catch {
      const localResult = saveLocalVote(gameVoteId, side);
      setVotes(localResult);
      setHasVoted(true);
    }

    setLoading(false);
  };

  // Calculate percentages
  const totalVotes = options.reduce((sum, opt) => sum + (votes[opt.key] || 0), 0);
  const getPercent = (key) => totalVotes > 0 ? Math.round((votes[key] || 0) / totalVotes * 100) : 50;

  // Determine which side is winning
  const communityPick = options.reduce((a, b) => (votes[a.key] || 0) > (votes[b.key] || 0) ? a : b);
  const aiMatchesCommunity = aiPick?.toLowerCase() === communityPick.key;

  return (
    <div style={{
      backgroundColor: '#0a0a0f',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #333'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '14px' }}>🗳️</span>
          <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Man vs Machine
          </span>
        </div>
        {totalVotes > 0 && (
          <span style={{ color: '#6b7280', fontSize: '10px' }}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* AI Pick Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        padding: '8px',
        backgroundColor: '#00D4FF10',
        borderRadius: '6px',
        border: '1px solid #00D4FF30'
      }}>
        <span style={{ fontSize: '16px' }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#00D4FF', fontSize: '11px', fontWeight: 'bold' }}>AI PICK</div>
          <div style={{ color: '#fff', fontSize: '13px' }}>
            {isSpread
              ? (aiPick === 'home' ? game.home_team : game.away_team)
              : aiPick?.toUpperCase()
            }
            <span style={{ color: '#00D4FF', marginLeft: '6px' }}>{aiConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Vote Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '10px'
      }}>
        {options.map((option) => {
          const percent = getPercent(option.key);
          const isAiPick = aiPick?.toLowerCase() === option.key;
          const isUserVote = votes.userVote === option.key;

          return (
            <button
              key={option.key}
              onClick={() => handleVote(option.key)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 8px',
                backgroundColor: isUserVote ? '#8B5CF620' : '#1a1a2e',
                border: isUserVote ? '2px solid #8B5CF6' : '1px solid #333',
                borderRadius: '8px',
                cursor: loading ? 'wait' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              {/* Progress bar background */}
              {hasVoted && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${percent}%`,
                  backgroundColor: isAiPick ? '#00D4FF15' : '#8B5CF615',
                  transition: 'width 0.5s ease'
                }} />
              )}

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  color: isUserVote ? '#8B5CF6' : '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '2px'
                }}>
                  {option.label}
                </div>
                {hasVoted && (
                  <div style={{
                    color: isAiPick ? '#00D4FF' : '#8B5CF6',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {percent}%
                  </div>
                )}
                {!hasVoted && (
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>
                    Tap to vote
                  </div>
                )}
              </div>

              {/* AI indicator */}
              {isAiPick && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '10px'
                }}>
                  🤖
                </div>
              )}

              {/* User vote indicator */}
              {isUserVote && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  fontSize: '10px'
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Summary */}
      {hasVoted && totalVotes >= 3 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '6px',
          backgroundColor: aiMatchesCommunity ? '#00FF8810' : '#FF884410',
          borderRadius: '6px',
          border: `1px solid ${aiMatchesCommunity ? '#00FF8830' : '#FF884430'}`
        }}>
          <span style={{ fontSize: '12px' }}>
            {aiMatchesCommunity ? '🤝' : '⚔️'}
          </span>
          <span style={{
            color: aiMatchesCommunity ? '#00FF88' : '#FF8844',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {aiMatchesCommunity
              ? 'Community agrees with AI!'
              : `Community fading the bot (${getPercent(communityPick.key)}% on ${communityPick.label})`
            }
          </span>
        </div>
      )}

      {/* Teaser for new users */}
      {!hasVoted && (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '10px',
          marginTop: '4px'
        }}>
          👥 Who you got? Vote to see community sentiment
        </div>
      )}
    </div>
  );
};

export default CommunityVote;
