import React, { useState, useEffect } from 'react';
import api from './api';
import { useGamification, ACHIEVEMENTS } from './GamificationContext';
import { useToast } from './Toast';

const Grading = () => {
  const { recordPick, checkAchievements, newAchievements, clearNewAchievement } = useGamification();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const data = await api.getGradedPicks();
      setPicks(data.picks || []);
    } catch {
      setPicks([]);
    }
    setLoading(false);
  };

  const pendingPicks = picks.filter(p => !p.graded);
  const gradedPicks = picks.filter(p => p.graded);
  const displayPicks = tab === 'pending' ? pendingPicks : gradedPicks;

  const stats = {
    total: gradedPicks.length,
    wins: gradedPicks.filter(p => p.result === 'WIN').length,
    losses: gradedPicks.filter(p => p.result === 'LOSS').length,
    pushes: gradedPicks.filter(p => p.result === 'PUSH').length
  };
  stats.winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;

  const gradePick = async (pickId, result, pick) => {
    try {
      await api.gradePick({ pick_id: pickId, result });

      // Record in gamification system
      recordPick({
        result,
        tier: pick?.tier || 'STANDARD',
        sport: pick?.sport || 'NBA',
        hasJarvisTrigger: pick?.hasJarvisTrigger || false
      });

      // Check for new achievements
      setTimeout(() => {
        checkAchievements();
      }, 100);

      // Show result toast
      if (result === 'WIN') {
        toast.success(`Pick graded as WIN!`);
      } else if (result === 'LOSS') {
        toast.error(`Pick graded as LOSS`);
      } else {
        toast.info(`Pick graded as PUSH`);
      }

      fetchPicks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to grade pick');
    }
  };

  // Show achievement notifications
  useEffect(() => {
    if (newAchievements && newAchievements.length > 0) {
      newAchievements.forEach(achievementId => {
        const achievement = ACHIEVEMENTS[achievementId];
        if (achievement) {
          toast.success(`Achievement Unlocked: ${achievement.name}! +${achievement.xp} XP`);
          clearNewAchievement(achievementId);
        }
      });
    }
  }, [newAchievements]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📝</span> Grade Picks
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Track and grade your picks to measure performance
          </p>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{ backgroundColor: '#1a1a2e', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #333' }}>
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Total</div>
          </div>
          <div style={{ backgroundColor: '#00FF8820', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #00FF8840' }}>
            <div style={{ color: '#00FF88', fontSize: '24px', fontWeight: 'bold' }}>{stats.wins}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Wins</div>
          </div>
          <div style={{ backgroundColor: '#FF444420', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #FF444440' }}>
            <div style={{ color: '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>{stats.losses}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Losses</div>
          </div>
          <div style={{ backgroundColor: '#FFD70020', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #FFD70040' }}>
            <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>{stats.pushes}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Pushes</div>
          </div>
          <div style={{ backgroundColor: '#00D4FF20', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #00D4FF40' }}>
            <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>{stats.winRate}%</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Win Rate</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setTab('pending')}
            style={{
              padding: '12px 24px',
              backgroundColor: tab === 'pending' ? '#00D4FF' : '#1a1a2e',
              color: tab === 'pending' ? '#000' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Pending ({pendingPicks.length})
          </button>
          <button
            onClick={() => setTab('graded')}
            style={{
              padding: '12px 24px',
              backgroundColor: tab === 'graded' ? '#00D4FF' : '#1a1a2e',
              color: tab === 'graded' ? '#000' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Graded ({gradedPicks.length})
          </button>
        </div>

        {/* Picks List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading picks...</div>
        ) : displayPicks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            {tab === 'pending' ? 'No pending picks to grade' : 'No graded picks yet'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayPicks.map((pick, i) => (
              <div key={i} style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '10px',
                padding: '16px 20px',
                border: pick.result === 'WIN' ? '1px solid #00FF8840' : pick.result === 'LOSS' ? '1px solid #FF444440' : '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{pick.player}</span>
                    {pick.recommendation && (
                      <span style={{
                        backgroundColor: pick.recommendation.includes('OVER') ? '#00FF8830' : pick.recommendation.includes('UNDER') ? '#FF444430' : '#00D4FF30',
                        color: pick.recommendation.includes('OVER') ? '#00FF88' : pick.recommendation.includes('UNDER') ? '#FF4444' : '#00D4FF',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {pick.recommendation} {pick.line != null ? pick.line : ''}
                      </span>
                    )}
                    {pick.stat && <span style={{ color: '#9ca3af', fontSize: '13px' }}>{pick.stat}</span>}
                    {pick.sport && <span style={{ color: '#6b728099', fontSize: '11px', textTransform: 'uppercase' }}>{pick.sport}</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    {pick.matchup || (pick.team && pick.opponent ? `${pick.team} vs ${pick.opponent}` : pick.team || '')}
                    {pick.final_score != null && ` • Score: ${pick.final_score}`}
                    {pick.tier && pick.tier !== 'STANDARD' && ` • ${pick.tier}`}
                  </div>
                </div>
                
                {pick.graded ? (
                  <div style={{
                    backgroundColor: pick.result === 'WIN' ? '#00FF8830' : pick.result === 'LOSS' ? '#FF444430' : '#FFD70030',
                    color: pick.result === 'WIN' ? '#00FF88' : pick.result === 'LOSS' ? '#FF4444' : '#FFD700',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {pick.result}{pick.actual != null ? ` (${pick.actual})` : ''}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => gradePick(pick.pick_id || pick.id, 'WIN', pick)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#00FF8830',
                        color: '#00FF88',
                        border: '1px solid #00FF8850',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      WIN
                    </button>
                    <button
                      onClick={() => gradePick(pick.pick_id || pick.id, 'LOSS', pick)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FF444430',
                        color: '#FF4444',
                        border: '1px solid #FF444450',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      LOSS
                    </button>
                    <button
                      onClick={() => gradePick(pick.pick_id || pick.id, 'PUSH', pick)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FFD70030',
                        color: '#FFD700',
                        border: '1px solid #FFD70050',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      PUSH
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grading;
