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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button
            onClick={loadBetHistory}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a1a2e',
              color: '#9ca3af',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🔄 Refresh
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <ExportDropdown bets={filteredBets} stats={stats} />
          </div>
        </div>
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

// Export Dropdown Component
const ExportDropdown = ({ bets, stats }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#10B98120',
          color: '#10B981',
          border: '1px solid #10B98150',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        📥 Export
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 100,
          minWidth: '200px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <button
            onClick={() => {
              exportToCSV(bets, stats);
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#12121f'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            <span>📊</span>
            <div>
              <div>Export to CSV</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>Bet history with P/L</div>
            </div>
          </button>

          <button
            onClick={() => {
              exportForTax(bets);
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: 'none',
              borderTop: '1px solid #333',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#12121f'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            <span>📋</span>
            <div>
              <div>Tax Report</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>Formatted for tax purposes</div>
            </div>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
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

// CSV Export functionality
const exportToCSV = (bets, stats) => {
  // CSV headers
  const headers = [
    'Date',
    'Sport',
    'Selection',
    'Bet Type',
    'Side',
    'Line',
    'Odds',
    'Stake',
    'To Win',
    'Outcome',
    'Profit/Loss'
  ];

  // Convert bets to CSV rows
  const rows = bets.map(bet => {
    const odds = bet.odds || -110;
    const stake = bet.stake || 100;
    const toWin = parseFloat(calculateToWin(odds, stake));
    let profitLoss = '';

    if (bet.outcome === 'WIN') {
      profitLoss = `+${toWin.toFixed(2)}`;
    } else if (bet.outcome === 'LOSS') {
      profitLoss = `-${stake.toFixed(2)}`;
    } else if (bet.outcome === 'PUSH') {
      profitLoss = '0.00';
    }

    return [
      bet.created_at ? new Date(bet.created_at).toLocaleDateString() : '',
      bet.sport || '',
      bet.player || bet.team || bet.selection || '',
      bet.bet_type || '',
      bet.side || '',
      bet.line || '',
      odds > 0 ? `+${odds}` : odds,
      stake.toFixed(2),
      toWin.toFixed(2),
      bet.outcome || 'PENDING',
      profitLoss
    ];
  });

  // Add summary rows
  rows.push([]);
  rows.push(['--- SUMMARY ---']);
  rows.push(['Total Bets', bets.length]);
  rows.push(['Wins', stats.wins || bets.filter(b => b.outcome === 'WIN').length]);
  rows.push(['Losses', stats.losses || bets.filter(b => b.outcome === 'LOSS').length]);
  rows.push(['Pushes', bets.filter(b => b.outcome === 'PUSH').length]);
  rows.push(['Win Rate', `${(stats.win_rate || calculateWinRate(bets)).toFixed(1)}%`]);

  const totalProfit = bets.reduce((total, bet) => {
    const odds = bet.odds || -110;
    const stake = bet.stake || 100;
    if (bet.outcome === 'WIN') {
      if (odds > 0) {
        return total + (stake * odds / 100);
      } else {
        return total + (stake * 100 / Math.abs(odds));
      }
    } else if (bet.outcome === 'LOSS') {
      return total - stake;
    }
    return total;
  }, 0);
  rows.push(['Total Profit/Loss', `$${totalProfit.toFixed(2)}`]);

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `bet_history_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export for tax purposes (more detailed)
const exportForTax = (bets) => {
  const taxYear = new Date().getFullYear();

  const headers = [
    'Tax Year',
    'Date',
    'Sportsbook',
    'Sport',
    'Event',
    'Bet Description',
    'Wager Amount',
    'Winnings',
    'Net Profit/Loss',
    'Outcome'
  ];

  const rows = bets
    .filter(bet => bet.outcome && bet.outcome !== 'PENDING')
    .map(bet => {
      const odds = bet.odds || -110;
      const stake = bet.stake || 100;
      const toWin = parseFloat(calculateToWin(odds, stake));

      let winnings = 0;
      let netPL = 0;

      if (bet.outcome === 'WIN') {
        winnings = stake + toWin;
        netPL = toWin;
      } else if (bet.outcome === 'LOSS') {
        winnings = 0;
        netPL = -stake;
      } else if (bet.outcome === 'PUSH') {
        winnings = stake;
        netPL = 0;
      }

      const betDate = bet.created_at ? new Date(bet.created_at) : new Date();
      const betDescription = [
        bet.player || bet.team || bet.selection || 'Bet',
        bet.side,
        bet.line
      ].filter(Boolean).join(' ');

      return [
        betDate.getFullYear(),
        betDate.toLocaleDateString(),
        bet.sportsbook || 'N/A',
        bet.sport || 'N/A',
        `${bet.away_team || ''} vs ${bet.home_team || ''}`.trim() || 'N/A',
        betDescription,
        stake.toFixed(2),
        winnings.toFixed(2),
        netPL.toFixed(2),
        bet.outcome
      ];
    });

  // Summary for tax
  const totalWagered = bets.reduce((sum, b) => sum + (b.stake || 100), 0);
  const totalWinnings = rows.reduce((sum, row) => sum + parseFloat(row[7] || 0), 0);
  const totalNetPL = rows.reduce((sum, row) => sum + parseFloat(row[8] || 0), 0);

  rows.push([]);
  rows.push(['--- TAX SUMMARY ---']);
  rows.push(['Total Amount Wagered', '', '', '', '', '', totalWagered.toFixed(2)]);
  rows.push(['Total Winnings Received', '', '', '', '', '', '', totalWinnings.toFixed(2)]);
  rows.push(['Net Gambling Income', '', '', '', '', '', '', '', totalNetPL.toFixed(2)]);
  rows.push([]);
  rows.push(['Note: Consult a tax professional for proper reporting requirements']);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `gambling_tax_report_${taxYear}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export { exportToCSV, exportForTax };
export default BetHistory;
