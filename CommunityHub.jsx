/**
 * COMMUNITY HUB v1.0
 *
 * Community features UI:
 * - Public leaderboard with rankings
 * - Community consensus voting
 * - Follow system
 * - Discussion threads
 * - Social sharing
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  getLeaderboard,
  getUserRank,
  getGameConsensus,
  submitConsensusVote,
  getMostPopularPick,
  getFollowing,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowingCount,
  getFollowedUsersPicks,
  getDiscussions,
  addComment,
  voteOnComment,
  reportComment,
  deleteComment,
  getTwitterShareUrl,
  getDiscordShareMessage,
  copyToClipboard,
  generateShareableImage,
  generateReferralCode,
  getReferralStats
} from './communityService';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #333',
    marginBottom: '24px'
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#00D4FF',
    borderBottomColor: '#00D4FF'
  },
  card: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
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
  dangerButton: {
    background: 'rgba(255,68,68,0.2)',
    color: '#FF4444',
    border: '1px solid rgba(255,68,68,0.3)'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px'
  },
  select: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  goldBadge: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000'
  },
  silverBadge: {
    background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
    color: '#000'
  },
  bronzeBadge: {
    background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
    color: '#000'
  },
  tooltip: {
    position: 'relative',
    display: 'inline-block'
  }
};

// ============================================================================
// LEADERBOARD COMPONENT
// ============================================================================

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [sortBy, setSortBy] = useState('roi');
  const [timeframe, setTimeframe] = useState('all');
  const [userProfile, setUserProfile] = useState(getUserProfile());

  useEffect(() => {
    setLeaderboard(getLeaderboard(sortBy, timeframe));
  }, [sortBy, timeframe]);

  const handleFollowToggle = (user) => {
    if (isFollowing(user.id)) {
      unfollowUser(user.id);
    } else {
      followUser(user.id, { username: user.username, avatar: user.avatar });
    }
    setLeaderboard([...leaderboard]); // Trigger re-render
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <span style={{ ...styles.badge, ...styles.goldBadge }}>🥇 #1</span>;
    if (rank === 2) return <span style={{ ...styles.badge, ...styles.silverBadge }}>🥈 #2</span>;
    if (rank === 3) return <span style={{ ...styles.badge, ...styles.bronzeBadge }}>🥉 #3</span>;
    return <span style={{ color: '#9ca3af' }}>#{rank}</span>;
  };

  const getStreakDisplay = (streak) => {
    if (streak >= 5) return <span style={{ color: '#FF4444' }}>🔥 {streak}W</span>;
    if (streak >= 3) return <span style={{ color: '#FFA500' }}>{streak}W</span>;
    return <span style={{ color: '#9ca3af' }}>{streak}W</span>;
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.select}
        >
          <option value="roi">Sort by ROI %</option>
          <option value="winRate">Sort by Win Rate</option>
          <option value="units">Sort by Units Won</option>
          <option value="streak">Sort by Win Streak</option>
        </select>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Time</option>
          <option value="season">This Season</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>

        <div style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '13px' }}>
          Minimum 50 bets required
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>User</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>ROI %</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>Win Rate</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>Units</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>W-L</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>Streak</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#9ca3af', fontWeight: '500' }}>Follow</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: index < 3 ? 'rgba(0,212,255,0.05)' : 'transparent'
                }}
              >
                <td style={{ padding: '12px 8px' }}>{getRankBadge(index + 1)}</td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{user.avatar}</span>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '500' }}>{user.username}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{user.followers} followers</div>
                    </div>
                  </div>
                </td>
                <td style={{
                  padding: '12px 8px',
                  textAlign: 'right',
                  color: user.roi >= 0 ? '#00FF88' : '#FF4444',
                  fontWeight: 'bold'
                }}>
                  {user.roi >= 0 ? '+' : ''}{user.roi}%
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>
                  {user.winRate}%
                </td>
                <td style={{
                  padding: '12px 8px',
                  textAlign: 'right',
                  color: user.unitsWon >= 0 ? '#00FF88' : '#FF4444',
                  fontWeight: 'bold'
                }}>
                  {user.unitsWon >= 0 ? '+' : ''}{user.unitsWon}u
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#9ca3af' }}>
                  {user.wins}-{user.losses}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  {getStreakDisplay(user.currentStreak)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  {user.id !== userProfile.id && (
                    <button
                      onClick={() => handleFollowToggle(user)}
                      style={{
                        ...styles.button,
                        ...(isFollowing(user.id) ? styles.secondaryButton : styles.primaryButton),
                        padding: '6px 12px',
                        fontSize: '12px'
                      }}
                    >
                      {isFollowing(user.id) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Your Rank Card */}
      <div style={{ ...styles.card, marginTop: '20px' }}>
        <div style={styles.cardTitle}>Your Position</div>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '32px' }}>{userProfile.avatar}</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>{userProfile.username}</div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              {userProfile.showOnLeaderboard
                ? `Ranked #${getUserRank(userProfile.id, sortBy) || '--'} by ${sortBy.toUpperCase()}`
                : 'Not visible on leaderboard (opt-in to show)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONSENSUS COMPONENT
// ============================================================================

const ConsensusPanel = ({ gameId, homeTeam, awayTeam }) => {
  const [consensus, setConsensus] = useState(null);
  const [userProfile] = useState(getUserProfile());
  const [popularPick, setPopularPick] = useState(null);

  useEffect(() => {
    if (gameId) {
      setConsensus(getGameConsensus(gameId));
      setPopularPick(getMostPopularPick(gameId));
    }
  }, [gameId]);

  const handleVote = (betType, side) => {
    const updated = submitConsensusVote(gameId, betType, side, userProfile.id);
    setConsensus(updated);
    setPopularPick(getMostPopularPick(gameId));
  };

  if (!consensus) return null;

  const spreadTotal = consensus.spreadVotes.home + consensus.spreadVotes.away;
  const totalTotal = consensus.totalVotes.home + consensus.totalVotes.away;
  const homeSpreadPercent = spreadTotal > 0 ? Math.round((consensus.spreadVotes.home / spreadTotal) * 100) : 50;
  const awaySpreadPercent = spreadTotal > 0 ? Math.round((consensus.spreadVotes.away / spreadTotal) * 100) : 50;
  const overPercent = totalTotal > 0 ? Math.round((consensus.totalVotes.home / totalTotal) * 100) : 50;
  const underPercent = totalTotal > 0 ? Math.round((consensus.totalVotes.away / totalTotal) * 100) : 50;

  const userSpreadVote = consensus.userVotes[`${userProfile.id}_spread`];
  const userTotalVote = consensus.userVotes[`${userProfile.id}_total`];

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>Community Consensus</div>
        {popularPick && (
          <span style={{
            ...styles.badge,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000'
          }}>
            🔥 Most Popular Pick
          </span>
        )}
      </div>

      {/* Spread Votes */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#fff', fontWeight: '500' }}>{awayTeam || 'Away'}</span>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{spreadTotal} votes</span>
          <span style={{ color: '#fff', fontWeight: '500' }}>{homeTeam || 'Home'}</span>
        </div>

        {/* Bar Chart */}
        <div style={{
          display: 'flex',
          height: '32px',
          borderRadius: '6px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div
            style={{
              width: `${awaySpreadPercent}%`,
              background: 'linear-gradient(90deg, #FF4444, #FF6B6B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'width 0.3s ease'
            }}
          >
            {awaySpreadPercent}%
          </div>
          <div
            style={{
              width: `${homeSpreadPercent}%`,
              background: 'linear-gradient(90deg, #00D4FF, #00FF88)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'width 0.3s ease'
            }}
          >
            {homeSpreadPercent}%
          </div>
        </div>

        {/* Vote Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => handleVote('spread', 'away')}
            style={{
              ...styles.button,
              flex: 1,
              background: userSpreadVote === 'away' ? 'rgba(255,68,68,0.3)' : 'rgba(255,255,255,0.05)',
              border: userSpreadVote === 'away' ? '2px solid #FF4444' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            {awayTeam || 'Away'} {userSpreadVote === 'away' && '✓'}
          </button>
          <button
            onClick={() => handleVote('spread', 'home')}
            style={{
              ...styles.button,
              flex: 1,
              background: userSpreadVote === 'home' ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)',
              border: userSpreadVote === 'home' ? '2px solid #00D4FF' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            {homeTeam || 'Home'} {userSpreadVote === 'home' && '✓'}
          </button>
        </div>
      </div>

      {/* Total Votes */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#fff', fontWeight: '500' }}>Over</span>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{totalTotal} votes</span>
          <span style={{ color: '#fff', fontWeight: '500' }}>Under</span>
        </div>

        <div style={{
          display: 'flex',
          height: '32px',
          borderRadius: '6px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div
            style={{
              width: `${overPercent}%`,
              background: 'linear-gradient(90deg, #9333EA, #C084FC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'width 0.3s ease'
            }}
          >
            {overPercent}%
          </div>
          <div
            style={{
              width: `${underPercent}%`,
              background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'width 0.3s ease'
            }}
          >
            {underPercent}%
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => handleVote('total', 'home')}
            style={{
              ...styles.button,
              flex: 1,
              background: userTotalVote === 'home' ? 'rgba(147,51,234,0.3)' : 'rgba(255,255,255,0.05)',
              border: userTotalVote === 'home' ? '2px solid #9333EA' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            Over {userTotalVote === 'home' && '✓'}
          </button>
          <button
            onClick={() => handleVote('total', 'away')}
            style={{
              ...styles.button,
              flex: 1,
              background: userTotalVote === 'away' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)',
              border: userTotalVote === 'away' ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            Under {userTotalVote === 'away' && '✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FOLLOWING COMPONENT
// ============================================================================

const Following = () => {
  const [followingData, setFollowingData] = useState({ following: [], followers: [] });
  const [followedPicks, setFollowedPicks] = useState([]);
  const [activeTab, setActiveTab] = useState('following');

  useEffect(() => {
    setFollowingData(getFollowing());
    setFollowedPicks(getFollowedUsersPicks());
  }, []);

  const handleUnfollow = (userId) => {
    unfollowUser(userId);
    setFollowingData(getFollowing());
    setFollowedPicks(getFollowedUsersPicks());
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ ...styles.card, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00D4FF' }}>
            {followingData.following.length}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>Following</div>
        </div>
        <div style={{ ...styles.card, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00FF88' }}>
            {followingData.followers.length}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>Followers</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('following')}
          style={{ ...styles.tab, ...(activeTab === 'following' ? styles.tabActive : {}) }}
        >
          Following ({followingData.following.length})
        </button>
        <button
          onClick={() => setActiveTab('picks')}
          style={{ ...styles.tab, ...(activeTab === 'picks' ? styles.tabActive : {}) }}
        >
          Their Picks
        </button>
      </div>

      {activeTab === 'following' && (
        <div>
          {followingData.following.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>Not following anyone yet</div>
              <div style={{ fontSize: '14px' }}>Follow top performers from the leaderboard!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {followingData.following.map(user => (
                <div
                  key={user.id}
                  style={{
                    ...styles.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{user.avatar}</span>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '500' }}>{user.username}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        Followed {formatTime(user.followedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    style={{ ...styles.button, ...styles.secondaryButton }}
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'picks' && (
        <div>
          {followedPicks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '16px' }}>No picks from followed users yet</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {followedPicks.map(pick => (
                <div key={pick.id} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{pick.avatar}</span>
                    <span style={{ color: '#00D4FF', fontWeight: '500' }}>{pick.username}</span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{formatTime(pick.timestamp)}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#9ca3af', fontSize: '13px' }}>{pick.game}</div>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{pick.pick}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      📊 {pick.confidence}% confidence
                    </span>
                    {pick.result && (
                      <span style={{
                        ...styles.badge,
                        background: pick.result === 'WIN' ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)',
                        color: pick.result === 'WIN' ? '#00FF88' : '#FF4444'
                      }}>
                        {pick.result === 'WIN' ? '✅' : '❌'} {pick.result}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DISCUSSION THREAD COMPONENT
// ============================================================================

const DiscussionThread = ({ targetId, targetType = 'game' }) => {
  const [discussions, setDiscussions] = useState({ comments: [], pinnedComments: [] });
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [reportingComment, setReportingComment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const userProfile = getUserProfile();

  useEffect(() => {
    if (targetId) {
      setDiscussions(getDiscussions(targetId, targetType));
    }
  }, [targetId, targetType]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(targetId, targetType, { content: newComment });
    setNewComment('');
    setDiscussions(getDiscussions(targetId, targetType));
  };

  const handleVote = (commentId, voteType) => {
    const currentVote = discussions.comments.find(c => c.id === commentId)?.votes[userProfile.id];
    const newVote = currentVote === voteType ? 'none' : voteType;
    voteOnComment(targetId, targetType, commentId, newVote, userProfile.id);
    setDiscussions(getDiscussions(targetId, targetType));
  };

  const handleReport = (commentId) => {
    if (!reportReason.trim()) return;
    reportComment(targetId, targetType, commentId, reportReason, userProfile.id);
    setReportingComment(null);
    setReportReason('');
    setDiscussions(getDiscussions(targetId, targetType));
  };

  const handleDelete = (commentId) => {
    deleteComment(targetId, targetType, commentId, userProfile.id);
    setDiscussions(getDiscussions(targetId, targetType));
  };

  const sortedComments = useMemo(() => {
    const comments = [...discussions.comments].filter(c => !c.isHidden);

    switch (sortBy) {
      case 'newest':
        return comments.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return comments.sort((a, b) => a.timestamp - b.timestamp);
      case 'top':
        return comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      default:
        return comments;
    }
  }, [discussions.comments, sortBy]);

  const pinnedComments = discussions.comments.filter(c => c.isPinned && !c.isHidden);

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>Discussion ({discussions.comments.length})</div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.select}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="top">Top Rated</option>
        </select>
      </div>

      {/* Comment Input */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          style={{
            ...styles.input,
            minHeight: '80px',
            resize: 'vertical',
            marginBottom: '8px'
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: newComment.trim() ? 1 : 0.5
          }}
        >
          Post Comment
        </button>
      </div>

      {/* Pinned Comments */}
      {pinnedComments.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {pinnedComments.map(comment => (
            <div
              key={comment.id}
              style={{
                padding: '12px',
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#00D4FF' }}>📌 PINNED</span>
                <span style={{ fontSize: '18px' }}>{comment.avatar}</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{comment.username}</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>{formatTime(comment.timestamp)}</span>
              </div>
              <div style={{ color: '#e5e7eb' }}>{comment.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedComments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          sortedComments.map(comment => (
            <div
              key={comment.id}
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{comment.avatar}</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{comment.username}</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>{formatTime(comment.timestamp)}</span>
              </div>

              <div style={{ color: '#e5e7eb', marginBottom: '12px' }}>{comment.content}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Upvote */}
                <button
                  onClick={() => handleVote(comment.id, 'up')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: comment.votes[userProfile.id] === 'up' ? '#00FF88' : '#9ca3af'
                  }}
                >
                  ▲ {comment.upvotes}
                </button>

                {/* Downvote */}
                <button
                  onClick={() => handleVote(comment.id, 'down')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: comment.votes[userProfile.id] === 'down' ? '#FF4444' : '#9ca3af'
                  }}
                >
                  ▼ {comment.downvotes}
                </button>

                {/* Report */}
                {comment.userId !== userProfile.id && (
                  <button
                    onClick={() => setReportingComment(comment.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '12px'
                    }}
                  >
                    🚩 Report
                  </button>
                )}

                {/* Delete (own comments) */}
                {comment.userId === userProfile.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#FF4444',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Report Modal */}
              {reportingComment === comment.id && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(255,68,68,0.1)',
                  borderRadius: '8px'
                }}>
                  <div style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Report this comment</div>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ ...styles.select, width: '100%', marginBottom: '8px' }}
                  >
                    <option value="">Select reason...</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="other">Other</option>
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleReport(comment.id)}
                      disabled={!reportReason}
                      style={{ ...styles.button, ...styles.dangerButton }}
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => {
                        setReportingComment(null);
                        setReportReason('');
                      }}
                      style={{ ...styles.button, ...styles.secondaryButton }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SOCIAL SHARING COMPONENT
// ============================================================================

const SocialSharing = ({ pickData }) => {
  const [copied, setCopied] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const canvasRef = useRef(null);

  const defaultPickData = pickData || {
    game: 'Lakers vs Celtics',
    pick: 'Lakers -3.5',
    confidence: 85,
    odds: -110,
    result: null
  };

  const twitterText = `🎯 My pick: ${defaultPickData.pick}\n📊 Confidence: ${defaultPickData.confidence}%\n\n#SportsBetting #Bookie`;
  const discordMessage = getDiscordShareMessage(defaultPickData);

  const handleTwitterShare = () => {
    const url = getTwitterShareUrl(twitterText);
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyDiscord = async () => {
    await copyToClipboard(discordMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = () => {
    if (canvasRef.current) {
      generateShareableImage(defaultPickData, canvasRef.current);
      setShowImagePreview(true);
    }
  };

  const handleDownloadImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `bookie-pick-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Share Pick</div>

      {/* Pick Preview */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>{defaultPickData.game}</div>
        <div style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>{defaultPickData.pick}</div>
        <div style={{ display: 'flex', gap: '16px', color: '#9ca3af', fontSize: '13px' }}>
          <span>📊 {defaultPickData.confidence}%</span>
          {defaultPickData.odds && <span>💰 {defaultPickData.odds > 0 ? '+' : ''}{defaultPickData.odds}</span>}
          {defaultPickData.result && (
            <span style={{ color: defaultPickData.result === 'WIN' ? '#00FF88' : '#FF4444' }}>
              {defaultPickData.result === 'WIN' ? '✅' : '❌'} {defaultPickData.result}
            </span>
          )}
        </div>
      </div>

      {/* Share Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <button
          onClick={handleTwitterShare}
          style={{
            ...styles.button,
            background: '#1DA1F2',
            color: '#fff',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>🐦</span> Twitter
        </button>

        <button
          onClick={handleCopyDiscord}
          style={{
            ...styles.button,
            background: '#5865F2',
            color: '#fff',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>{copied ? '✅' : '💬'}</span>
          {copied ? 'Copied!' : 'Discord'}
        </button>

        <button
          onClick={handleGenerateImage}
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>🖼️</span> Generate Image
        </button>

        <button
          onClick={async () => {
            await copyToClipboard(window.location.href);
            alert('Link copied!');
          }}
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>🔗</span> Copy Link
        </button>
      </div>

      {/* Hidden Canvas for Image Generation */}
      <canvas ref={canvasRef} style={{ display: showImagePreview ? 'block' : 'none', marginTop: '16px', borderRadius: '8px', maxWidth: '100%' }} />

      {showImagePreview && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={handleDownloadImage}
            style={{ ...styles.button, ...styles.primaryButton, flex: 1 }}
          >
            Download Image
          </button>
          <button
            onClick={() => setShowImagePreview(false)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// REFERRAL COMPONENT
// ============================================================================

const Referrals = () => {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({ myCode: null, referredBy: null, referredUsers: [] });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const existingStats = getReferralStats();
    if (!existingStats.myCode) {
      const newCode = generateReferralCode();
      existingStats.myCode = newCode;
      localStorage.setItem('bookie_referrals', JSON.stringify(existingStats));
    }
    setStats(existingStats);
    setReferralCode(existingStats.myCode);
  }, []);

  const handleCopy = async () => {
    const shareText = `Join me on Bookie-o-em! Use my referral code: ${referralCode}`;
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Referral Program</div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Your Referral Code</div>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '8px',
            color: '#00D4FF',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {referralCode}
          </div>
          <button
            onClick={handleCopy}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '20px'
      }}>
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00FF88' }}>
            {stats.referredUsers.length}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Users Referred</div>
        </div>
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFD700' }}>
            {stats.referredUsers.length * 10}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Bonus Points</div>
        </div>
      </div>

      <div style={{ marginTop: '16px', color: '#6b7280', fontSize: '13px' }}>
        Share your code with friends. Earn 10 bonus points for each new user who joins!
      </div>
    </div>
  );
};

// ============================================================================
// PROFILE SETTINGS COMPONENT
// ============================================================================

const ProfileSettings = () => {
  const [profile, setProfile] = useState(getUserProfile());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveUserProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatars = ['🎯', '🏀', '🏈', '⚾', '🏒', '💰', '📊', '🔥', '⚡', '🌟', '🦁', '🐯', '🦅', '🐺', '🦈'];

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Profile Settings</div>

      <div style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
        {/* Avatar Selection */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Avatar</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {avatars.map(avatar => (
              <button
                key={avatar}
                onClick={() => setProfile({ ...profile, avatar })}
                style={{
                  width: '44px',
                  height: '44px',
                  fontSize: '24px',
                  background: profile.avatar === avatar ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: profile.avatar === avatar ? '2px solid #00D4FF' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Username */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Username</div>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            style={styles.input}
            maxLength={20}
          />
        </div>

        {/* Bio */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Bio (optional)</div>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
            placeholder="Tell others about yourself..."
            maxLength={150}
          />
        </div>

        {/* Privacy Settings */}
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#fff', fontWeight: '500', marginBottom: '12px' }}>Privacy Settings</div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.showOnLeaderboard}
              onChange={(e) => setProfile({ ...profile, showOnLeaderboard: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ color: '#e5e7eb' }}>Show on public leaderboard</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.isPublic}
              onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ color: '#e5e7eb' }}>Public profile</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.allowFollowers}
              onChange={(e) => setProfile({ ...profile, allowFollowers: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ color: '#e5e7eb' }}>Allow others to follow me</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.showPicksToFollowers}
              onChange={(e) => setProfile({ ...profile, showPicksToFollowers: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ color: '#e5e7eb' }}>Show my picks to followers</span>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{ ...styles.button, ...styles.primaryButton, padding: '12px' }}
        >
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMMUNITY HUB COMPONENT
// ============================================================================

const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: '🏆 Leaderboard' },
    { id: 'following', label: '👥 Following' },
    { id: 'discussions', label: '💬 Discussions' },
    { id: 'share', label: '📤 Share' },
    { id: 'profile', label: '⚙️ Profile' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Community Hub</h1>
        <p style={styles.subtitle}>Connect with fellow bettors, share picks, and climb the leaderboard</p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'leaderboard' && <Leaderboard />}
      {activeTab === 'following' && <Following />}
      {activeTab === 'discussions' && (
        <div>
          <ConsensusPanel
            gameId="demo_game_1"
            homeTeam="Lakers"
            awayTeam="Celtics"
          />
          <DiscussionThread
            targetId="demo_game_1"
            targetType="game"
          />
        </div>
      )}
      {activeTab === 'share' && (
        <div style={styles.grid}>
          <SocialSharing />
          <Referrals />
        </div>
      )}
      {activeTab === 'profile' && <ProfileSettings />}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default CommunityHub;
export {
  Leaderboard,
  ConsensusPanel,
  Following,
  DiscussionThread,
  SocialSharing,
  Referrals,
  ProfileSettings
};
