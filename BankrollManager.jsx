/**
 * BANKROLL MANAGER
 *
 * Professional bankroll management using Kelly Criterion.
 * Track your bets, manage risk, and optimize bet sizing.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  getBankrollSettings,
  saveBankrollSettings,
  getBankrollStats,
  getBetHistory,
  gradeBet,
  calculateBetSize,
  calculateRiskOfRuin,
  simulateBankroll,
  importBets
} from './kellyCalculator';
import { useToast } from './Toast';

const BankrollManager = () => {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [betHistory, setBetHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Export bet history to CSV
  const exportToCSV = () => {
    if (betHistory.length === 0) {
      toast.warning('No bet history to export');
      return;
    }

    const headers = ['Date', 'Sport', 'Game', 'Bet Type', 'Side', 'Line', 'Odds', 'Stake', 'Result', 'P&L', 'Confidence', 'Tier'];
    const rows = betHistory.map(bet => [
      new Date(bet.timestamp).toLocaleDateString(),
      bet.sport || 'N/A',
      bet.game?.away_team && bet.game?.home_team ? `${bet.game.away_team} @ ${bet.game.home_team}` : 'N/A',
      bet.bet_type || 'N/A',
      bet.side || 'N/A',
      bet.line || 'N/A',
      bet.odds || 'N/A',
      bet.stake || settings?.unitSize || 'N/A',
      bet.result || 'PENDING',
      bet.pnl !== undefined ? bet.pnl : 'N/A',
      bet.confidence || 'N/A',
      bet.tier || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookie-bet-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`Exported ${betHistory.length} bets to CSV`);
  };

  // Import bet history from CSV
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result;
        const parsedData = parseCSV(csvContent);

        if (parsedData.length === 0) {
          toast.error('No valid bets found in CSV');
          return;
        }

        setImportPreview(parsedData);
        setShowImportModal(true);
      } catch (err) {
        toast.error('Error parsing CSV file');
        console.error('CSV parse error:', err);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const bets = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/("([^"]*)"|[^,]+)/g)?.map(v => v.replace(/"/g, '').trim()) || [];
      if (values.length < 3) continue;

      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // Map common column names to our format
      const bet = {
        id: `import-${Date.now()}-${i}`,
        timestamp: parseDate(row.date || row.timestamp || row.time) || new Date().toISOString(),
        sport: row.sport?.toUpperCase() || 'NBA',
        game: row.game || row.matchup || row.event || `${row.team || 'Bet'} ${i}`,
        bet_type: row['bet type'] || row.type || row.market || 'spread',
        side: row.side || row.pick || row.selection || '',
        line: parseFloat(row.line || row.spread || 0) || null,
        odds: parseInt(row.odds) || -110,
        stake: parseFloat(row.stake || row.wager || row.amount || row.bet) || settings?.unitSize || 50,
        result: normalizeResult(row.result || row.outcome || row.status),
        pnl: parseFloat(row['p&l'] || row.pnl || row.profit || row.winnings) || null,
        confidence: parseInt(row.confidence) || null,
        tier: row.tier || null
      };

      // Calculate P&L if result exists but P&L doesn't
      if (bet.result && !bet.pnl) {
        if (bet.result === 'WIN') {
          bet.pnl = bet.odds > 0 ? (bet.stake * bet.odds / 100) : (bet.stake * 100 / Math.abs(bet.odds));
        } else if (bet.result === 'LOSS') {
          bet.pnl = -bet.stake;
        } else {
          bet.pnl = 0;
        }
      }

      bets.push(bet);
    }

    return bets;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  const normalizeResult = (result) => {
    if (!result) return null;
    const r = result.toUpperCase().trim();
    if (r.includes('WIN') || r === 'W') return 'WIN';
    if (r.includes('LOSS') || r.includes('LOSE') || r === 'L') return 'LOSS';
    if (r.includes('PUSH') || r === 'P' || r === 'DRAW') return 'PUSH';
    if (r.includes('PENDING') || r.includes('OPEN')) return null;
    return null;
  };

  const confirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;

    try {
      const imported = importBets(importPreview);
      toast.success(`Imported ${imported} bets successfully`);
      setShowImportModal(false);
      setImportPreview(null);
      loadData();
    } catch (err) {
      toast.error('Error importing bets');
      console.error('Import error:', err);
    }
  };

  const cancelImport = () => {
    setShowImportModal(false);
    setImportPreview(null);
  };

  // Calculator state
  const [calcConfidence, setCalcConfidence] = useState(70);
  const [calcOdds, setCalcOdds] = useState(-110);
  const [calcResult, setCalcResult] = useState(null);

  // Simulation state
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (calcConfidence && calcOdds) {
      const result = calculateBetSize(calcConfidence, calcOdds, settings);
      setCalcResult(result);
    }
  }, [calcConfidence, calcOdds, settings]);

  const loadData = () => {
    const s = getBankrollSettings();
    setSettings(s);
    setTempSettings(s);
    setStats(getBankrollStats());
    setBetHistory(getBetHistory(30));
  };

  const handleSaveSettings = () => {
    saveBankrollSettings(tempSettings);
    setSettings(tempSettings);
    setEditingSettings(false);
    loadData();
    toast.success('Bankroll settings saved');
  };

  const handleGradeBet = (betId, result) => {
    gradeBet(betId, result);
    loadData();
  };

  const runSimulation = () => {
    if (!stats || !settings) return;

    const result = simulateBankroll(
      settings.currentBankroll,
      stats.winRate || 52,
      settings.unitSize,
      100, // 100 bets
      -110,
      1000
    );
    setSimResult(result);
  };

  if (!settings || !stats) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading bankroll data...
        </div>
      </div>
    );
  }

  const riskAnalysis = calculateRiskOfRuin(stats.winRate || 52, -110, Math.floor(settings.currentBankroll / settings.unitSize));

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💰 Bankroll Manager
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Kelly Criterion bet sizing • Risk management • Performance tracking
          </p>
        </div>

        {/* Stop Loss Warning */}
        {stats.stopLossTriggered && (
          <div style={{
            backgroundColor: '#FF444420',
            border: '1px solid #FF4444',
            borderRadius: '12px',
            padding: '15px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <div style={{ color: '#FF4444', fontWeight: 'bold' }}>Stop Loss Triggered</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                You've hit {settings.stopLossPercent}% drawdown. Consider taking a break.
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {['overview', 'calculator', 'history', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab ? '#00D4FF' : '#1a1a2e',
                color: activeTab === tab ? '#000' : '#9ca3af',
                border: activeTab === tab ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Main Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px'
            }}>
              <StatCard
                label="Current Bankroll"
                value={`$${stats.currentBankroll.toLocaleString()}`}
                subValue={`Started: $${stats.startingBankroll.toLocaleString()}`}
                color={stats.currentBankroll >= stats.startingBankroll ? '#00FF88' : '#FF4444'}
              />
              <StatCard
                label="Total P/L"
                value={`${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toLocaleString()}`}
                subValue={`${stats.roi >= 0 ? '+' : ''}${stats.roi}% ROI`}
                color={stats.totalPnl >= 0 ? '#00FF88' : '#FF4444'}
              />
              <StatCard
                label="Record"
                value={`${stats.record.wins}-${stats.record.losses}`}
                subValue={`${stats.winRate}% win rate`}
                color={stats.winRate >= 52 ? '#00FF88' : '#9ca3af'}
              />
              <StatCard
                label="Max Drawdown"
                value={`${stats.maxDrawdown}%`}
                subValue={`Current: ${stats.currentDrawdown}%`}
                color={stats.maxDrawdown < 15 ? '#00FF88' : stats.maxDrawdown < 25 ? '#FFD700' : '#FF4444'}
              />
            </div>

            {/* Risk Analysis */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                Risk Analysis
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px' }}>EDGE</div>
                  {stats && stats.totalBets > 0 ? (
                    <div style={{
                      color: riskAnalysis.edge > 0 ? '#00FF88' : '#FF4444',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {riskAnalysis.edge > 0 ? '+' : ''}{riskAnalysis.edge.toFixed(2)}%
                    </div>
                  ) : (
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      N/A
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>Place bets to calculate</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px' }}>RISK OF RUIN</div>
                  <div style={{
                    color: riskAnalysis.riskOfRuin < 5 ? '#00FF88' : riskAnalysis.riskOfRuin < 15 ? '#FFD700' : '#FF4444',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {riskAnalysis.riskOfRuin}%
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px' }}>BANKROLL UNITS</div>
                  <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                    {Math.floor(settings.currentBankroll / settings.unitSize)}
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#0a0a0f', borderRadius: '8px' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px' }}>ASSESSMENT</div>
                  <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                    {riskAnalysis.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
                  100-Bet Simulation
                </h3>
                <button
                  onClick={runSimulation}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#00D4FF',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Run Simulation
                </button>
              </div>

              {simResult ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '10px'
                }}>
                  <SimCard label="Worst Case" value={`$${simResult.worst}`} color="#FF4444" />
                  <SimCard label="5th %ile" value={`$${simResult.p5}`} color="#FF8888" />
                  <SimCard label="25th %ile" value={`$${simResult.p25}`} color="#FFD700" />
                  <SimCard label="Median" value={`$${simResult.median}`} color="#00D4FF" />
                  <SimCard label="75th %ile" value={`$${simResult.p75}`} color="#00FF88" />
                  <SimCard label="Best Case" value={`$${simResult.best}`} color="#00FF88" />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  Click "Run Simulation" to see projected outcomes
                </div>
              )}

              {simResult && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                    Bust Rate: <span style={{ color: simResult.bustRate < 5 ? '#00FF88' : '#FF4444' }}>
                      {simResult.bustRate}%
                    </span>
                    {' '} • Based on {stats.winRate || 52}% win rate at ${ settings.unitSize} per bet
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>

            {/* Input */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
                Bet Size Calculator
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                  Confidence Level: {calcConfidence}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={calcConfidence}
                  onChange={(e) => setCalcConfidence(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                  Odds (American)
                </label>
                <input
                  type="number"
                  value={calcOdds}
                  onChange={(e) => setCalcOdds(parseInt(e.target.value) || -110)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0a0a0f',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '5px' }}>
                  KELLY FRACTION
                </div>
                <div style={{ color: '#fff', fontSize: '14px' }}>
                  {settings.kellyFraction * 100}% Kelly ({settings.kellyFraction === 0.25 ? 'Quarter' : settings.kellyFraction === 0.5 ? 'Half' : 'Custom'})
                </div>
              </div>
            </div>

            {/* Result */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
                Recommended Bet
              </h3>

              {calcResult && (
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '30px',
                    backgroundColor: calcResult.hasEdge ? '#00FF8810' : '#FF444410',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      color: calcResult.recommendation.color,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '5px'
                    }}>
                      {calcResult.recommendation.action}
                    </div>
                    <div style={{
                      color: '#fff',
                      fontSize: '36px',
                      fontWeight: 'bold'
                    }}>
                      ${calcResult.betAmount}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      {calcResult.units} units • {calcResult.betPercent.toFixed(1)}% of bankroll
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af' }}>Your Edge</span>
                      <span style={{ color: calcResult.edge > 0 ? '#00FF88' : '#FF4444', fontWeight: 'bold' }}>
                        {calcResult.edge > 0 ? '+' : ''}{calcResult.edge.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af' }}>Expected Value</span>
                      <span style={{ color: calcResult.expectedValue > 0 ? '#00FF88' : '#FF4444', fontWeight: 'bold' }}>
                        {calcResult.expectedValue > 0 ? '+' : ''}${(calcResult.expectedValue * calcResult.betAmount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af' }}>Win Probability</span>
                      <span style={{ color: '#00D4FF' }}>
                        {calcResult.yourProbability.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af' }}>Break Even</span>
                      <span style={{ color: '#9ca3af' }}>
                        {calcResult.impliedProbability.toFixed(1)}%
                      </span>
                    </div>
                    {calcResult.limitApplied && (
                      <div style={{ padding: '10px', backgroundColor: '#FFD70020', borderRadius: '6px', fontSize: '12px', color: '#FFD700' }}>
                        ⚠️ Bet capped at {settings.maxBetPercent}% max
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
                Bet History ({stats.pendingBets} pending)
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10B98120',
                    color: '#10B981',
                    border: '1px solid #10B98140',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📤 Import CSV
                </button>
                <button
                  onClick={exportToCSV}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#00D4FF20',
                    color: '#00D4FF',
                    border: '1px solid #00D4FF40',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📥 Export CSV
                </button>
              </div>
            </div>

            {betHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                No bets recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {betHistory.map((bet) => (
                  <div key={bet.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 80px 80px 100px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#0a0a0f',
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                      {new Date(bet.timestamp).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>
                      {bet.game || bet.description || 'Bet'}
                    </span>
                    <span style={{ color: '#9ca3af', textAlign: 'right' }}>
                      ${bet.betAmount}
                    </span>
                    <span style={{
                      color: bet.result === 'WIN' ? '#00FF88' : bet.result === 'LOSS' ? '#FF4444' : '#9ca3af',
                      textAlign: 'right',
                      fontWeight: bet.result ? 'bold' : 'normal'
                    }}>
                      {bet.result || 'Pending'}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      {!bet.result ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleGradeBet(bet.id, 'WIN')}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#00FF8820',
                              color: '#00FF88',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            W
                          </button>
                          <button
                            onClick={() => handleGradeBet(bet.id, 'LOSS')}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#FF444420',
                              color: '#FF4444',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            L
                          </button>
                          <button
                            onClick={() => handleGradeBet(bet.id, 'PUSH')}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#33333380',
                              color: '#9ca3af',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            P
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          color: bet.pnl >= 0 ? '#00FF88' : '#FF4444',
                          fontSize: '13px'
                        }}>
                          {bet.pnl >= 0 ? '+' : ''}${bet.pnl}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
                Bankroll Settings
              </h3>
              {!editingSettings ? (
                <button
                  onClick={() => setEditingSettings(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#00D4FF',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Edit Settings
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setTempSettings(settings);
                      setEditingSettings(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#00FF88',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <SettingInput
                label="Starting Bankroll"
                value={tempSettings.startingBankroll}
                onChange={(v) => setTempSettings({ ...tempSettings, startingBankroll: parseFloat(v) || 0 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Current Bankroll"
                value={tempSettings.currentBankroll}
                onChange={(v) => setTempSettings({ ...tempSettings, currentBankroll: parseFloat(v) || 0 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Unit Size"
                value={tempSettings.unitSize}
                onChange={(v) => setTempSettings({ ...tempSettings, unitSize: parseFloat(v) || 50 })}
                disabled={!editingSettings}
                prefix="$"
              />
              <SettingInput
                label="Kelly Fraction"
                value={tempSettings.kellyFraction}
                onChange={(v) => setTempSettings({ ...tempSettings, kellyFraction: parseFloat(v) || 0.25 })}
                disabled={!editingSettings}
                suffix="(0.25 = 1/4 Kelly)"
              />
              <SettingInput
                label="Max Bet %"
                value={tempSettings.maxBetPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, maxBetPercent: parseFloat(v) || 5 })}
                disabled={!editingSettings}
                suffix="%"
              />
              <SettingInput
                label="Min Bet %"
                value={tempSettings.minBetPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, minBetPercent: parseFloat(v) || 0.5 })}
                disabled={!editingSettings}
                suffix="%"
              />
              <SettingInput
                label="Stop Loss"
                value={tempSettings.stopLossPercent}
                onChange={(v) => setTempSettings({ ...tempSettings, stopLossPercent: parseFloat(v) || 25 })}
                disabled={!editingSettings}
                suffix="% drawdown"
              />
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#0a0a0f',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#9ca3af'
            }}>
              <strong style={{ color: '#00D4FF' }}>Kelly Fraction Guide:</strong>
              <br />• 0.25 (Quarter Kelly) - Conservative, recommended for most
              <br />• 0.50 (Half Kelly) - Moderate, for confident bettors
              <br />• 1.00 (Full Kelly) - Aggressive, high variance
            </div>
          </div>
        )}

        {/* Import Preview Modal */}
        {showImportModal && importPreview && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                  📤 Import Preview
                </h3>
                <button
                  onClick={cancelImport}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                backgroundColor: '#10B98120',
                border: '1px solid #10B98140',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <div style={{ color: '#10B981', fontWeight: 'bold' }}>
                    {importPreview.length} bets ready to import
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {importPreview.filter(b => b.result === 'WIN').length} wins,{' '}
                    {importPreview.filter(b => b.result === 'LOSS').length} losses,{' '}
                    {importPreview.filter(b => !b.result).length} pending
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333' }}>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'left', padding: '8px', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'left', padding: '8px', textTransform: 'uppercase' }}>Game</th>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'right', padding: '8px', textTransform: 'uppercase' }}>Stake</th>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'right', padding: '8px', textTransform: 'uppercase' }}>Odds</th>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', padding: '8px', textTransform: 'uppercase' }}>Result</th>
                      <th style={{ color: '#6b7280', fontSize: '11px', textAlign: 'right', padding: '8px', textTransform: 'uppercase' }}>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 10).map((bet, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ color: '#9ca3af', fontSize: '12px', padding: '8px' }}>
                          {new Date(bet.timestamp).toLocaleDateString()}
                        </td>
                        <td style={{ color: '#fff', fontSize: '12px', padding: '8px' }}>
                          {bet.game?.substring(0, 30) || 'N/A'}
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: '12px', padding: '8px', textAlign: 'right' }}>
                          ${bet.stake}
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: '12px', padding: '8px', textAlign: 'right' }}>
                          {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <span style={{
                            color: bet.result === 'WIN' ? '#00FF88' : bet.result === 'LOSS' ? '#FF4444' : '#9ca3af',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {bet.result || 'PENDING'}
                          </span>
                        </td>
                        <td style={{
                          color: bet.pnl >= 0 ? '#00FF88' : '#FF4444',
                          fontSize: '12px',
                          padding: '8px',
                          textAlign: 'right',
                          fontWeight: 'bold'
                        }}>
                          {bet.pnl !== null ? `${bet.pnl >= 0 ? '+' : ''}$${bet.pnl?.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 10 && (
                  <div style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                    ... and {importPreview.length - 10} more bets
                  </div>
                )}
              </div>

              <div style={{
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>
                  EXPECTED CSV FORMAT
                </div>
                <div style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}>
                  Date, Sport, Game, Bet Type, Side, Line, Odds, Stake, Result, P&L
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelImport}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImport}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10B981',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Import {importPreview.length} Bets
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subValue, color = '#00D4FF' }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ color: color, fontSize: '24px', fontWeight: 'bold' }}>
      {value}
    </div>
    {subValue && (
      <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
        {subValue}
      </div>
    )}
  </div>
);

const SimCard = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#0a0a0f', borderRadius: '6px' }}>
    <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>{label}</div>
    <div style={{ color: color, fontWeight: 'bold' }}>{value}</div>
  </div>
);

const SettingInput = ({ label, value, onChange, disabled, prefix, suffix }) => (
  <div>
    <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {prefix && <span style={{ color: '#6b7280' }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px',
          backgroundColor: disabled ? '#1a1a2e' : '#0a0a0f',
          color: disabled ? '#6b7280' : '#fff',
          border: '1px solid #333',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />
      {suffix && <span style={{ color: '#6b7280', fontSize: '12px' }}>{suffix}</span>}
    </div>
  </div>
);

export default BankrollManager;
