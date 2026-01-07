import React, { useState, useEffect } from 'react';
import api from './api'
const Grading = () => {
  const [tab, setTab] = useState('pending');
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPicks();
  }, [tab]);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const data = await api.getGradedPicks();
      if (data.picks) {
        setPicks(data.picks);
      } else {
        setPicks(MOCK_PICKS);
      }
    } catch (err) {
      setPicks(MOCK_PICKS);
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

  const gradePick = async (pickId, result) => {
    try {
      await api.gradePick({ pick_id: pickId, result });
      fetchPicks();
    } catch (err) {
      console.error(err);
    }
  };

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
                    <span style={{
                      backgroundColor: pick.recommendation?.includes('OVER') ? '#00FF8830' : '#FF444430',
                      color: pick.recommendation?.includes('OVER') ? '#00FF88' : '#FF4444',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {pick.recommendation?.includes('OVER') ? 'OVER' : 'UNDER'} {pick.line}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{pick.stat}</span>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    {pick.team} vs {pick.opponent} • Projection: {pick.projection} • Edge: {pick.edge > 0 ? '+' : ''}{pick.edge}
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
                    {pick.result} ({pick.actual})
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => gradePick(pick.id, 'WIN')}
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
                      onClick={() => gradePick(pick.id, 'LOSS')}
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
                      onClick={() => gradePick(pick.id, 'PUSH')}
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

const MOCK_PICKS = [
  { id: 1, player: 'Jerami Grant', team: 'Portland', opponent: 'Utah', stat: 'points', line: 21.5, projection: 25, edge: 3.5, recommendation: 'OVER', graded: true, result: 'WIN', actual: 28 },
  { id: 2, player: 'Collin Sexton', team: 'Utah', opponent: 'Portland', stat: 'points', line: 17.5, projection: 20.1, edge: 2.6, recommendation: 'OVER', graded: true, result: 'WIN', actual: 22 },
  { id: 3, player: 'Devin Booker', team: 'Phoenix', opponent: 'Houston', stat: 'points', line: 27.5, projection: 25.5, edge: -2, recommendation: 'UNDER', graded: true, result: 'LOSS', actual: 31 },
  { id: 4, player: 'LeBron James', team: 'Lakers', opponent: 'Celtics', stat: 'points', line: 25.5, projection: 28, edge: 2.5, recommendation: 'OVER', graded: false },
  { id: 5, player: 'Jayson Tatum', team: 'Celtics', opponent: 'Lakers', stat: 'rebounds', line: 8.5, projection: 7.2, edge: -1.3, recommendation: 'UNDER', graded: false }
];

export default Grading;
