/**
 * COMMUNITY SERVICE v1.0
 *
 * Backend service for community features:
 * - Leaderboard rankings (ROI, win rate, units)
 * - Community consensus voting
 * - Follow/unfollow system
 * - Discussion threads with comments
 * - Social sharing utilities
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  USER_PROFILE: 'bookie_user_profile',
  LEADERBOARD: 'bookie_leaderboard',
  CONSENSUS: 'bookie_consensus_votes',
  FOLLOWING: 'bookie_following',
  DISCUSSIONS: 'bookie_discussions',
  REFERRALS: 'bookie_referrals'
};

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Get current user profile
 */
export const getUserProfile = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading user profile:', error);
  }

  // Default profile
  return {
    id: `user_${Date.now()}`,
    username: 'Anonymous',
    avatar: getDefaultAvatar(),
    isPublic: false,
    showOnLeaderboard: false,
    allowFollowers: true,
    showPicksToFollowers: true,
    joinedAt: Date.now(),
    bio: ''
  };
};

/**
 * Save user profile
 */
export const saveUserProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

/**
 * Get default avatar based on user ID
 */
const getDefaultAvatar = () => {
  const avatars = ['🎯', '🏀', '🏈', '⚾', '🏒', '💰', '📊', '🔥', '⚡', '🌟'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Get leaderboard data
 */
export const getLeaderboard = (sortBy = 'roi', timeframe = 'all') => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    let leaderboard = stored ? JSON.parse(stored) : generateMockLeaderboard();

    // Filter by timeframe
    if (timeframe !== 'all') {
      const cutoff = getCutoffDate(timeframe);
      leaderboard = leaderboard.filter(u => new Date(u.lastActive) > cutoff);
    }

    // Filter to only users with 50+ bets
    leaderboard = leaderboard.filter(u => u.totalBets >= 50);

    // Sort
    switch (sortBy) {
      case 'roi':
        leaderboard.sort((a, b) => b.roi - a.roi);
        break;
      case 'winRate':
        leaderboard.sort((a, b) => b.winRate - a.winRate);
        break;
      case 'units':
        leaderboard.sort((a, b) => b.unitsWon - a.unitsWon);
        break;
      case 'streak':
        leaderboard.sort((a, b) => b.currentStreak - a.currentStreak);
        break;
      default:
        leaderboard.sort((a, b) => b.roi - a.roi);
    }

    return leaderboard.slice(0, 100);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Get user rank on leaderboard
 */
export const getUserRank = (userId, sortBy = 'roi') => {
  const leaderboard = getLeaderboard(sortBy);
  const index = leaderboard.findIndex(u => u.id === userId);
  return index >= 0 ? index + 1 : null;
};

/**
 * Update user on leaderboard
 */
export const updateLeaderboardEntry = (userData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    let leaderboard = stored ? JSON.parse(stored) : [];

    const existingIndex = leaderboard.findIndex(u => u.id === userData.id);
    if (existingIndex >= 0) {
      leaderboard[existingIndex] = { ...leaderboard[existingIndex], ...userData };
    } else {
      leaderboard.push(userData);
    }

    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    return true;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return false;
  }
};

/**
 * Generate mock leaderboard for demo
 */
const generateMockLeaderboard = () => {
  const names = [
    'SharpShooter', 'BetKing', 'LineHunter', 'ValueMaster', 'EdgeFinder',
    'ProfitPro', 'WiseGuy', 'SmartMoney', 'CLVChaser', 'PicksGuru',
    'BetWhisperer', 'OddsMaster', 'SteamMover', 'FadeKing', 'UnitPrinter',
    'LineMover', 'PublicFader', 'SharpsOnly', 'ActionJack', 'LocksLoaded'
  ];

  const avatars = ['🎯', '🏀', '🏈', '⚾', '🏒', '💰', '📊', '🔥', '⚡', '🌟'];

  return names.map((name, i) => ({
    id: `user_${i}`,
    username: name,
    avatar: avatars[i % avatars.length],
    roi: Math.round((20 - i * 0.8 + Math.random() * 5) * 10) / 10,
    winRate: Math.round((58 - i * 0.3 + Math.random() * 3) * 10) / 10,
    unitsWon: Math.round((50 - i * 2 + Math.random() * 10) * 10) / 10,
    totalBets: Math.floor(100 + Math.random() * 200),
    wins: Math.floor(60 + Math.random() * 50),
    losses: Math.floor(40 + Math.random() * 30),
    currentStreak: Math.floor(Math.random() * 8),
    bestStreak: Math.floor(5 + Math.random() * 10),
    followers: Math.floor(Math.random() * 500),
    isPublic: true,
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const getCutoffDate = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case 'week': return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case 'month': return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case 'season': return new Date(now - 90 * 24 * 60 * 60 * 1000);
    default: return new Date(0);
  }
};

// ============================================================================
// COMMUNITY CONSENSUS
// ============================================================================

/**
 * Get consensus for a game
 */
export const getGameConsensus = (gameId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONSENSUS);
    const consensus = stored ? JSON.parse(stored) : {};
    return consensus[gameId] || {
      gameId,
      spreadVotes: { home: 0, away: 0 },
      totalVotes: { home: 0, away: 0 },
      mlVotes: { home: 0, away: 0 },
      userVotes: {}
    };
  } catch (error) {
    console.error('Error getting consensus:', error);
    return null;
  }
};

/**
 * Submit vote for a game
 */
export const submitConsensusVote = (gameId, betType, side, userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONSENSUS);
    const consensus = stored ? JSON.parse(stored) : {};

    if (!consensus[gameId]) {
      consensus[gameId] = {
        gameId,
        spreadVotes: { home: 0, away: 0 },
        totalVotes: { home: 0, away: 0 },
        mlVotes: { home: 0, away: 0 },
        userVotes: {}
      };
    }

    const voteKey = `${betType}Votes`;
    const userVoteKey = `${userId}_${betType}`;

    // Remove previous vote if exists
    if (consensus[gameId].userVotes[userVoteKey]) {
      const prevSide = consensus[gameId].userVotes[userVoteKey];
      consensus[gameId][voteKey][prevSide]--;
    }

    // Add new vote
    consensus[gameId][voteKey][side]++;
    consensus[gameId].userVotes[userVoteKey] = side;

    localStorage.setItem(STORAGE_KEYS.CONSENSUS, JSON.stringify(consensus));

    return consensus[gameId];
  } catch (error) {
    console.error('Error submitting vote:', error);
    return null;
  }
};

/**
 * Get most popular pick for a game
 */
export const getMostPopularPick = (gameId) => {
  const consensus = getGameConsensus(gameId);
  if (!consensus) return null;

  const spreadTotal = consensus.spreadVotes.home + consensus.spreadVotes.away;
  if (spreadTotal < 5) return null;

  const homePercent = (consensus.spreadVotes.home / spreadTotal) * 100;
  const awayPercent = (consensus.spreadVotes.away / spreadTotal) * 100;

  if (homePercent >= 65) return { side: 'home', percent: Math.round(homePercent) };
  if (awayPercent >= 65) return { side: 'away', percent: Math.round(awayPercent) };
  return null;
};

/**
 * Get all consensus data for dashboard
 */
export const getAllConsensusData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONSENSUS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting all consensus:', error);
    return {};
  }
};

// ============================================================================
// FOLLOW SYSTEM
// ============================================================================

/**
 * Get following list
 */
export const getFollowing = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
    return stored ? JSON.parse(stored) : { following: [], followers: [] };
  } catch (error) {
    console.error('Error getting following:', error);
    return { following: [], followers: [] };
  }
};

/**
 * Follow a user
 */
export const followUser = (userId, userInfo) => {
  try {
    const data = getFollowing();

    if (data.following.some(f => f.id === userId)) {
      return false; // Already following
    }

    data.following.push({
      id: userId,
      username: userInfo.username,
      avatar: userInfo.avatar,
      followedAt: Date.now()
    });

    localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(data));

    // Dispatch event for notifications
    window.dispatchEvent(new CustomEvent('user-followed', {
      detail: { userId, userInfo }
    }));

    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = (userId) => {
  try {
    const data = getFollowing();
    data.following = data.following.filter(f => f.id !== userId);
    localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

/**
 * Check if following a user
 */
export const isFollowing = (userId) => {
  const data = getFollowing();
  return data.following.some(f => f.id === userId);
};

/**
 * Get following count
 */
export const getFollowingCount = () => {
  const data = getFollowing();
  return {
    following: data.following.length,
    followers: data.followers.length
  };
};

/**
 * Get recent picks from followed users
 */
export const getFollowedUsersPicks = () => {
  // In a real app, this would fetch from backend
  // For now, generate mock data
  const data = getFollowing();
  const mockPicks = [];

  data.following.forEach(user => {
    const pickCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < pickCount; i++) {
      mockPicks.push({
        id: `pick_${user.id}_${i}`,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        game: `Team A vs Team B`,
        pick: Math.random() > 0.5 ? 'Team A -3.5' : 'Team B +3.5',
        confidence: Math.floor(70 + Math.random() * 20),
        timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        result: Math.random() > 0.6 ? 'WIN' : Math.random() > 0.3 ? 'LOSS' : null
      });
    }
  });

  return mockPicks.sort((a, b) => b.timestamp - a.timestamp);
};

// ============================================================================
// DISCUSSION THREADS
// ============================================================================

/**
 * Get discussions for a pick/game
 */
export const getDiscussions = (targetId, targetType = 'game') => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    return discussions[key] || {
      targetId,
      targetType,
      comments: [],
      pinnedComments: []
    };
  } catch (error) {
    console.error('Error getting discussions:', error);
    return { comments: [], pinnedComments: [] };
  }
};

/**
 * Add a comment
 */
export const addComment = (targetId, targetType, commentData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    if (!discussions[key]) {
      discussions[key] = {
        targetId,
        targetType,
        comments: [],
        pinnedComments: []
      };
    }

    const profile = getUserProfile();
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: profile.id,
      username: profile.username,
      avatar: profile.avatar,
      content: commentData.content,
      timestamp: Date.now(),
      upvotes: 0,
      downvotes: 0,
      votes: {},
      replies: [],
      isPinned: false,
      isHidden: false,
      reports: []
    };

    discussions[key].comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));

    window.dispatchEvent(new CustomEvent('comment-added', {
      detail: { targetId, targetType, comment: newComment }
    }));

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

/**
 * Vote on a comment
 */
export const voteOnComment = (targetId, targetType, commentId, voteType, userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    if (!discussions[key]) return null;

    const comment = discussions[key].comments.find(c => c.id === commentId);
    if (!comment) return null;

    // Remove previous vote
    if (comment.votes[userId]) {
      if (comment.votes[userId] === 'up') comment.upvotes--;
      else comment.downvotes--;
    }

    // Add new vote
    if (voteType !== 'none') {
      comment.votes[userId] = voteType;
      if (voteType === 'up') comment.upvotes++;
      else comment.downvotes++;
    } else {
      delete comment.votes[userId];
    }

    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    return comment;
  } catch (error) {
    console.error('Error voting on comment:', error);
    return null;
  }
};

/**
 * Report a comment
 */
export const reportComment = (targetId, targetType, commentId, reason, userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    if (!discussions[key]) return false;

    const comment = discussions[key].comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.reports.push({
      userId,
      reason,
      timestamp: Date.now()
    });

    // Auto-hide if 3+ reports
    if (comment.reports.length >= 3) {
      comment.isHidden = true;
    }

    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    return true;
  } catch (error) {
    console.error('Error reporting comment:', error);
    return false;
  }
};

/**
 * Pin/unpin a comment (moderator)
 */
export const togglePinComment = (targetId, targetType, commentId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    if (!discussions[key]) return false;

    const comment = discussions[key].comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.isPinned = !comment.isPinned;
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    return true;
  } catch (error) {
    console.error('Error pinning comment:', error);
    return false;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = (targetId, targetType, commentId, userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    const discussions = stored ? JSON.parse(stored) : {};
    const key = `${targetType}_${targetId}`;

    if (!discussions[key]) return false;

    const commentIndex = discussions[key].comments.findIndex(c =>
      c.id === commentId && c.userId === userId
    );

    if (commentIndex === -1) return false;

    discussions[key].comments.splice(commentIndex, 1);
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// ============================================================================
// SOCIAL SHARING
// ============================================================================

/**
 * Generate Twitter share URL
 */
export const getTwitterShareUrl = (text, url = '') => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url || window.location.href);
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
};

/**
 * Generate Discord share message
 */
export const getDiscordShareMessage = (pickData) => {
  const { game, pick, confidence, odds, result } = pickData;

  let message = `**${pick}** on ${game}\n`;
  message += `📊 Confidence: ${confidence}%\n`;
  if (odds) message += `💰 Odds: ${odds > 0 ? '+' : ''}${odds}\n`;
  if (result) message += `${result === 'WIN' ? '✅' : '❌'} Result: ${result}\n`;
  message += `\n*Powered by Bookie-o-em*`;

  return message;
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
};

/**
 * Generate shareable pick image
 */
export const generateShareableImage = (pickData, canvasRef) => {
  const canvas = canvasRef;
  const ctx = canvas.getContext('2d');

  canvas.width = 600;
  canvas.height = 350;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 350);
  gradient.addColorStop(0, '#0a0a0f');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 350);

  // Border
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 580, 330);

  // Header
  ctx.fillStyle = '#00D4FF';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('🎯 BOOKIE-O-EM PICK', 30, 50);

  // Game
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(pickData.game || 'Game', 30, 100);

  // Pick
  ctx.fillStyle = '#00FF88';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(pickData.pick || 'Pick', 30, 160);

  // Stats row
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Arial';

  if (pickData.confidence) {
    ctx.fillText(`Confidence: ${pickData.confidence}%`, 30, 210);
  }

  if (pickData.odds) {
    ctx.fillText(`Odds: ${pickData.odds > 0 ? '+' : ''}${pickData.odds}`, 250, 210);
  }

  // Result if available
  if (pickData.result) {
    ctx.fillStyle = pickData.result === 'WIN' ? '#00FF88' : '#FF4444';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${pickData.result === 'WIN' ? '✅' : '❌'} ${pickData.result}`, 30, 260);
  }

  // Footer
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 300, 600, 50);

  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.fillText(new Date().toLocaleDateString(), 30, 330);
  ctx.fillText('bookie-o-em.com', 480, 330);

  return canvas.toDataURL('image/png');
};

/**
 * Track referral
 */
export const trackReferral = (referralCode) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    const referrals = stored ? JSON.parse(stored) : { myCode: null, referredBy: null, referredUsers: [] };

    if (referralCode && !referrals.referredBy) {
      referrals.referredBy = {
        code: referralCode,
        timestamp: Date.now()
      };
    }

    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    return true;
  } catch (error) {
    console.error('Error tracking referral:', error);
    return false;
  }
};

/**
 * Generate referral code
 */
export const generateReferralCode = () => {
  const profile = getUserProfile();
  return `REF_${profile.username}_${Date.now().toString(36)}`.toUpperCase();
};

/**
 * Get referral stats
 */
export const getReferralStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    return stored ? JSON.parse(stored) : { myCode: null, referredBy: null, referredUsers: [] };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { myCode: null, referredBy: null, referredUsers: [] };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Profile
  getUserProfile,
  saveUserProfile,

  // Leaderboard
  getLeaderboard,
  getUserRank,
  updateLeaderboardEntry,

  // Consensus
  getGameConsensus,
  submitConsensusVote,
  getMostPopularPick,
  getAllConsensusData,

  // Following
  getFollowing,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowingCount,
  getFollowedUsersPicks,

  // Discussions
  getDiscussions,
  addComment,
  voteOnComment,
  reportComment,
  togglePinComment,
  deleteComment,

  // Social
  getTwitterShareUrl,
  getDiscordShareMessage,
  copyToClipboard,
  generateShareableImage,
  trackReferral,
  generateReferralCode,
  getReferralStats
};
