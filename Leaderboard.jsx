import React, { useState, useEffect } from 'react';
import api from './api';
import { getStats } from './clvTracker';

// Empty state for leaderboard (no mock data)
const emptyLeaders = {
  monthly: [],
  weekly: [],
  streaks: []
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [leaders, setLeaders] = useState(emptyLeaders);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [userRank, setUserRank] = useState(null);

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await api.getVoteLeaderboard();
        if (data && data.leaders) {
          // Transform API data to match our format
          const transformedLeaders = {
            monthly: data.leaders.monthly?.map((l, i) => ({
              rank: i + 1,
              username: l.username || l.user_id,
              roi: l.roi || 0,
              winRate: l.win_rate || 0,
              picks: l.total_picks || 0,
              streak: l.current_streak || 0
            })) || emptyLeaders.monthly,
            weekly: data.leaders.weekly?.map((l, i) => ({
              rank: i + 1,
              username: l.username || l.user_id,
              roi: l.roi || 0,
              winRate: l.win_rate || 0,
              picks: l.total_picks || 0,
              streak: l.current_streak || 0
            })) || emptyLeaders.weekly,
            streaks: data.leaders.streaks?.map((l, i) => ({
              rank: i + 1,
              username: l.username || l.user_id,
              streak: l.streak || 0,
              lastWin: l.last_win || 'N/A'
            })) || emptyLeaders.streaks
          };
          setLeaders(transformedLeaders);

          // Set user rank if available
          if (data.user_rank) {
            setUserRank(data.user_rank);
          }
        }
      } catch (err) {
        // Keep empty state on error - no mock data
      }
      setLoading(false);
    };

    fetchLeaderboard();

    // Get local user stats
    const stats = getStats();
    if (stats) {
      setUserStats(stats);
    }
  }, []);

  const tabs = [
    { id: 'monthly', label: 'This Month', icon: '📅' },
    { id: 'weekly', label: 'This Week', icon: '📆' },
    { id: 'streaks', label: 'Win Streaks', icon: '🔥' }
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: '#FFD700' };
    if (rank === 2) return { emoji: '🥈', color: '#C0C0C0' };
    if (rank === 3) return { emoji: '🥉', color: '#CD7F32' };
    return { emoji: `#${rank}`, color: '#6b7280' };
  };

  const getRoiColor = (roi) => {
    if (roi >= 20) return '#00FF88';
    if (roi >= 10) return '#00D4FF';
    if (roi >= 0) return '#FFD700';
    return '#FF4444';
  };

  const currentLeaders = leaders[activeTab] || [];

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Top performers in the community
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.id ? '#00D4FF' : '#1a1a2e',
                color: activeTab === tab.id ? '#000' : '#9ca3af',
                border: activeTab === tab.id ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {activeTab !== 'streaks' && currentLeaders.length >= 3 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '20px',
            marginBottom: '30px',
            padding: '20px'
          }}>
            {/* Second Place */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#1a1a2e',
                border: '3px solid #C0C0C0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '32px'
              }}>
                🥈
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{currentLeaders[1]?.username}</div>
              <div style={{ color: '#00FF88', fontSize: '16px', fontWeight: 'bold' }}>+{currentLeaders[1]?.roi}%</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{currentLeaders[1]?.winRate}% WR</div>
            </div>

            {/* First Place */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#1a1a2e',
                border: '4px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '40px',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
              }}>
                🥇
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{currentLeaders[0]?.username}</div>
              <div style={{ color: '#00FF88', fontSize: '20px', fontWeight: 'bold' }}>+{currentLeaders[0]?.roi}%</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{currentLeaders[0]?.winRate}% WR</div>
            </div>

            {/* Third Place */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#1a1a2e',
                border: '3px solid #CD7F32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '28px'
              }}>
                🥉
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{currentLeaders[2]?.username}</div>
              <div style={{ color: '#00FF88', fontSize: '16px', fontWeight: 'bold' }}>+{currentLeaders[2]?.roi}%</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{currentLeaders[2]?.winRate}% WR</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #333'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'streaks' ? '60px 1fr 100px 1fr' : '60px 1fr 100px 100px 80px 80px',
            padding: '15px 20px',
            backgroundColor: '#12121f',
            borderBottom: '1px solid #333',
            color: '#6b7280',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            <span>Rank</span>
            <span>User</span>
            {activeTab === 'streaks' ? (
              <>
                <span>Streak</span>
                <span>Last Win</span>
              </>
            ) : (
              <>
                <span style={{ textAlign: 'right' }}>ROI</span>
                <span style={{ textAlign: 'right' }}>Win Rate</span>
                <span style={{ textAlign: 'right' }}>Picks</span>
                <span style={{ textAlign: 'right' }}>Streak</span>
              </>
            )}
          </div>

          {/* Table Rows */}
          {currentLeaders.map((leader, idx) => {
            const rankBadge = getRankBadge(leader.rank);
            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: activeTab === 'streaks' ? '60px 1fr 100px 1fr' : '60px 1fr 100px 100px 80px 80px',
                  padding: '15px 20px',
                  borderBottom: idx < currentLeaders.length - 1 ? '1px solid #333' : 'none',
                  alignItems: 'center',
                  backgroundColor: leader.rank <= 3 ? `${rankBadge.color}08` : 'transparent'
                }}
              >
                <span style={{
                  color: rankBadge.color,
                  fontWeight: 'bold',
                  fontSize: leader.rank <= 3 ? '20px' : '14px'
                }}>
                  {leader.rank <= 3 ? rankBadge.emoji : rankBadge.emoji}
                </span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{leader.username}</span>
                {activeTab === 'streaks' ? (
                  <>
                    <span style={{
                      color: '#FF6B00',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🔥 {leader.streak}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{leader.lastWin}</span>
                  </>
                ) : (
                  <>
                    <span style={{
                      color: getRoiColor(leader.roi),
                      fontWeight: 'bold',
                      textAlign: 'right'
                    }}>
                      +{leader.roi}%
                    </span>
                    <span style={{ color: '#9ca3af', textAlign: 'right' }}>{leader.winRate}%</span>
                    <span style={{ color: '#9ca3af', textAlign: 'right' }}>{leader.picks}</span>
                    <span style={{
                      textAlign: 'right',
                      color: leader.streak > 0 ? '#FF6B00' : '#6b7280'
                    }}>
                      {leader.streak > 0 ? `🔥${leader.streak}` : '-'}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Your Ranking */}
        <div style={{
          marginTop: '25px',
          backgroundColor: '#00D4FF15',
          border: '1px solid #00D4FF40',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ color: '#00D4FF', fontSize: '12px', marginBottom: '5px' }}>YOUR RANKING</div>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                {userRank ? `#${userRank.rank} of ${userRank.total}` :
                 userStats?.gradedPicks >= 10 ? 'Calculating...' : 'Need 10+ picks'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Win Rate</div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                {userStats?.winRate?.toFixed(1) || 0}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Avg CLV</div>
              <div style={{
                color: (userStats?.avgCLV || 0) >= 0 ? '#00FF88' : '#FF4444',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {(userStats?.avgCLV || 0) >= 0 ? '+' : ''}{userStats?.avgCLV?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Record</div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                {userStats?.wins || 0}-{userStats?.losses || 0}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Picks</div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                {userStats?.gradedPicks || 0}
              </div>
            </div>
          </div>
        </div>

        {/* How Rankings Work */}
        <div style={{
          marginTop: '20px',
          padding: '15px 20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '10px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>HOW RANKINGS WORK</div>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            Rankings are based on ROI (Return on Investment) for tracked picks.
            Only picks made through the platform count. Minimum 10 picks required to appear on leaderboards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
