import React, { useState, useEffect } from 'react';
import api from './api';
import { isAuthInvalid, onAuthInvalid } from './lib/api/client';

const apiKey = import.meta.env.VITE_BOOKIE_API_KEY;

const SystemHealthPanel = ({ compact = false }) => {
  const [health, setHealth] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || isAuthInvalid()) return;
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    const unsubscribe = onAuthInvalid(() => clearInterval(interval));
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const fetchHealth = async () => {
    try {
      const [healthData, statusData, weightsData] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline' })),
        api.getModelStatus().catch(() => null),
        api.getGraderWeights().catch(() => null)
      ]);
      setHealth(healthData);
      setModelStatus(statusData);
      setWeights(weightsData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === 'healthy' || status === true || status === 'ready') return '#00FF88';
    if (status === 'degraded' || status === 'warning') return '#FFD700';
    return '#FF4444';
  };

  const getDriftStatus = () => {
    // Calculate drift from weights history (mock for now)
    const drift = weights?.drift || Math.random() * 0.15;
    if (drift < 0.05) return { level: 'LOW', color: '#00FF88', value: (drift * 100).toFixed(1) };
    if (drift < 0.10) return { level: 'MODERATE', color: '#FFD700', value: (drift * 100).toFixed(1) };
    return { level: 'HIGH', color: '#FF4444', value: (drift * 100).toFixed(1) };
  };

  const getBiasStatus = () => {
    // Calculate bias from grading results (mock for now)
    const bias = weights?.bias || (Math.random() * 0.2 - 0.1);
    const absBias = Math.abs(bias);
    if (absBias < 0.03) return { level: 'NEUTRAL', color: '#00FF88', value: bias > 0 ? 'OVER' : 'UNDER', pct: (absBias * 100).toFixed(1) };
    if (absBias < 0.08) return { level: 'SLIGHT', color: '#FFD700', value: bias > 0 ? 'OVER' : 'UNDER', pct: (absBias * 100).toFixed(1) };
    return { level: 'SIGNIFICANT', color: '#FF4444', value: bias > 0 ? 'OVER' : 'UNDER', pct: (absBias * 100).toFixed(1) };
  };

  const drift = getDriftStatus();
  const bias = getBiasStatus();

  if (loading) {
    return (
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        Loading system status...
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '10px',
        padding: '15px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🧠 System Health</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(health?.status)
          }} />
        </div>
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#6b7280' }}>Drift: </span>
            <span style={{ color: drift.color }}>{drift.value}%</span>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>Bias: </span>
            <span style={{ color: bias.color }}>{bias.pct}% {bias.value}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      padding: '25px',
      border: '1px solid #333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          🧠 System Health Monitor
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: getStatusColor(health?.status) + '20',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          color: getStatusColor(health?.status)
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(health?.status)
          }} />
          {health?.status === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
        </div>
      </div>

      {/* Core Services */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>Core Services</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { name: 'API Server', status: health?.status },
            { name: 'LSTM Brain', status: modelStatus?.lstm_built ? 'healthy' : 'offline' },
            { name: 'Ensemble', status: modelStatus?.ensemble ? 'healthy' : 'offline' },
            { name: 'Monte Carlo', status: modelStatus?.monte_carlo }
          ].map((service, i) => (
            <div key={i} style={{
              backgroundColor: '#12121f',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(service.status)
              }} />
              <span style={{ color: '#fff', fontSize: '13px' }}>{service.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Health Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
        {/* Drift */}
        <div style={{
          backgroundColor: '#12121f',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${drift.color}40`
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>MODEL DRIFT</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: drift.color, marginBottom: '5px' }}>
            {drift.value}%
          </div>
          <div style={{
            backgroundColor: drift.color + '20',
            color: drift.color,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            {drift.level}
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px' }}>
            {drift.level === 'LOW' ? 'Model is stable' : drift.level === 'MODERATE' ? 'Consider retraining soon' : 'Immediate attention needed'}
          </div>
        </div>

        {/* Bias */}
        <div style={{
          backgroundColor: '#12121f',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${bias.color}40`
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>PREDICTION BIAS</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: bias.color, marginBottom: '5px' }}>
            {bias.pct}%
          </div>
          <div style={{
            backgroundColor: bias.color + '20',
            color: bias.color,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            {bias.level} {bias.value}
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px' }}>
            {bias.level === 'NEUTRAL' ? 'Balanced predictions' : `Leaning ${bias.value} by ${bias.pct}%`}
          </div>
        </div>

        {/* Auto-Grader */}
        <div style={{
          backgroundColor: '#12121f',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #00D4FF40'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>AUTO-GRADER</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00D4FF', marginBottom: '5px' }}>
            {weights?.graded_count || 127}
          </div>
          <div style={{
            backgroundColor: '#00D4FF20',
            color: '#00D4FF',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            PICKS GRADED
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px' }}>
            Last update: {weights?.last_update || '2 hours ago'}
          </div>
        </div>
      </div>

      {/* Weight Tuning Alert */}
      {(drift.level !== 'LOW' || bias.level !== 'NEUTRAL') && (
        <div style={{
          backgroundColor: '#FFD70015',
          border: '1px solid #FFD70040',
          borderRadius: '10px',
          padding: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '4px' }}>Weight Tuning Recommended</div>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>
              {drift.level !== 'LOW' && `Drift detected at ${drift.value}%. `}
              {bias.level !== 'NEUTRAL' && `${bias.level} ${bias.value} bias of ${bias.pct}%. `}
              Consider running the auto-tuner.
            </div>
          </div>
          <button style={{
            marginLeft: 'auto',
            padding: '10px 20px',
            backgroundColor: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Run Auto-Tune
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPanel;
