/**
 * BET HISTORY PAGE
 *
 * Displays user's bet history with WIN/LOSS/PUSH outcomes
 * and performance statistics.
 */

import React, { useState, useEffect } from 'react';
import api from './api';
import { useToast } from './Toast';

const BetHistory = () => {
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, won, lost, push
  const [sport, setSport] = useState('all');
  const toast = useToast();

  const sports = ['all', 'NBA', 'NFL', 'MLB', 'NHL'];

  useEffect(() => {
    loadBetHistory();
  }, []);

  const loadBetHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getBetHistory();
      setBets(data.bets || []);
      setStats(data.stats || {});
    } catch (err) {
      toast.error('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (betId, outcome) => {
    const result = await api.gradeBet(betId, outcome);
    if (result) {
      toast.success(`Bet marked as ${outcome}`);
      loadBetHistory();
    } else {
      toast.error('Failed to grade bet');
    }
  };

  const filteredBets = bets.filter(bet => {
    const statusMatch = filter === 'all' ||
      (filter === 'pending' && !bet.outcome) ||
      (filter === 'won' && bet.outcome === 'WIN') ||
      (filter === 'lost' && bet.outcome === 'LOSS') ||
      (filter === 'push' && bet.outcome === 'PUSH');

    const sportMatch = sport === 'all' || bet.sport?.toUpperCase() === sport;

    return statusMatch && sportMatch;
  });

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'WIN': return '#00FF88';
      case 'LOSS': return '#FF4444';
      case 'PUSH': return '#FFD700';
      default: return '#6b7280';
    }
  };

  const getOutcomeBg = (outcome) => {
    switch (outcome) {
      case 'WIN': return '#00FF8820';
      case 'LOSS': return '#FF444420';
      case 'PUSH': return '#FFD70020';
      default: return '#6b728020';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateProfit = () => {
    return bets.reduce((total, bet) => {
      if (bet.outcome === 'WIN') {
        const odds = bet.odds || -110;
        const stake = bet.stake || 100;
        if (odds > 0) {
          return total + (stake * odds / 100);
        } else {
          return total + (stake * 100 / Math.abs(odds));
        }
      } else if (bet.outcome === 'LOSS') {
        return total - (bet.stake || 100);
      }
      return total;
    }, 0);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          color: '#fff',
          fontSize: '28px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>📊</span> Bet History
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Track your bets and performance over time
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <StatCard
          label="Total Bets"
          value={stats.total || bets.length}
          icon="🎯"
          color="#00D4FF"
        />
        <StatCard
          label="Wins"
          value={stats.wins || bets.filter(b => b.outcome === 'WIN').length}
          icon="✅"
          color="#00FF88"
        />
        <StatCard
          label="Losses"
          value={stats.losses || bets.filter(b => b.outcome === 'LOSS').length}
          icon="❌"
          color="#FF4444"
        />
        <StatCard
          label="Win Rate"
          value={`${(stats.win_rate || calculateWinRate(bets)).toFixed(1)}%`}
          icon="📈"
          color="#FFD700"
        />
        <StatCard
          label="Profit/Loss"
          value={`${calculateProfit() >= 0 ? '+' : ''}$${calculateProfit().toFixed(0)}`}
          icon="💰"
          color={calculateProfit() >= 0 ? '#00FF88' : '#FF4444'}
        />
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {['all', 'pending', 'won', 'lost', 'push'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === f ? '#00D4FF20' : '#1a1a2e',
                color: filter === f ? '#00D4FF' : '#9ca3af',
                border: `1px solid ${filter === f ? '#00D4FF50' : '#333'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: filter === f ? 'bold' : 'normal',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sport Filter */}
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a2e',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {sports.map(s => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Sports' : s}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={loadBetHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a2e',
            color: '#9ca3af',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            marginLeft: 'auto'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Bet List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                height: '100px',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ))}
        </div>
      ) : filteredBets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #333'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No bets found</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {filter !== 'all' || sport !== 'all'
              ? 'Try adjusting your filters'
              : 'Start tracking your bets to see them here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredBets.map((bet, index) => (
            <BetCard
              key={bet.id || index}
              bet={bet}
              onGrade={handleGrade}
              getOutcomeColor={getOutcomeColor}
              getOutcomeBg={getOutcomeBg}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ color: '#6b7280', fontSize: '12px' }}>{label}</span>
    </div>
    <div style={{
      color: color,
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      {value}
    </div>
  </div>
);

// Bet Card Component
const BetCard = ({ bet, onGrade, getOutcomeColor, getOutcomeBg, formatDate }) => {
  const isPending = !bet.outcome;

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '16px 20px',
      border: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '4px'
          }}>
            {bet.player || bet.team || bet.selection || 'Unknown Bet'}
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{bet.bet_type || 'Bet'}</span>
            {bet.line && (
              <>
                <span style={{ color: '#333' }}>•</span>
                <span>{bet.side} {bet.line}</span>
              </>
            )}
          </div>
        </div>

        {/* Outcome Badge */}
        <div style={{
          padding: '6px 12px',
          backgroundColor: getOutcomeBg(bet.outcome),
          color: getOutcomeColor(bet.outcome),
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {bet.outcome || 'PENDING'}
        </div>
      </div>

      {/* Middle Row - Details */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>ODDS</span>
          <div style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '14px' }}>
            {bet.odds > 0 ? '+' : ''}{bet.odds || -110}
          </div>
        </div>
        <div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>STAKE</span>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
            ${bet.stake || 100}
          </div>
        </div>
        <div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>TO WIN</span>
          <div style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '14px' }}>
            ${calculateToWin(bet.odds, bet.stake)}
          </div>
        </div>
        {bet.sport && (
          <div>
            <span style={{ color: '#6b7280', fontSize: '11px' }}>SPORT</span>
            <div style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '14px' }}>
              {bet.sport}
            </div>
          </div>
        )}
        {bet.created_at && (
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ color: '#6b7280', fontSize: '11px' }}>PLACED</span>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>
              {formatDate(bet.created_at)}
            </div>
          </div>
        )}
      </div>

      {/* Grade Buttons (for pending bets) */}
      {isPending && (
        <div style={{
          display: 'flex',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #333'
        }}>
          <span style={{ color: '#6b7280', fontSize: '12px', marginRight: 'auto' }}>
            Grade this bet:
          </span>
          <button
            onClick={() => onGrade(bet.id, 'WIN')}
            style={{
              padding: '6px 16px',
              backgroundColor: '#00FF8820',
              color: '#00FF88',
              border: '1px solid #00FF8850',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            WIN
          </button>
          <button
            onClick={() => onGrade(bet.id, 'LOSS')}
            style={{
              padding: '6px 16px',
              backgroundColor: '#FF444420',
              color: '#FF4444',
              border: '1px solid #FF444450',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            LOSS
          </button>
          <button
            onClick={() => onGrade(bet.id, 'PUSH')}
            style={{
              padding: '6px 16px',
              backgroundColor: '#FFD70020',
              color: '#FFD700',
              border: '1px solid #FFD70050',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            PUSH
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions
const calculateWinRate = (bets) => {
  const graded = bets.filter(b => b.outcome && b.outcome !== 'PUSH');
  if (graded.length === 0) return 0;
  const wins = graded.filter(b => b.outcome === 'WIN').length;
  return (wins / graded.length) * 100;
};

const calculateToWin = (odds, stake = 100) => {
  const o = odds || -110;
  const s = stake || 100;
  if (o > 0) {
    return (s * o / 100).toFixed(0);
  } else {
    return (s * 100 / Math.abs(o)).toFixed(0);
  }
};

export default BetHistory;
