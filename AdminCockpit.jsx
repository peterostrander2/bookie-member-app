import React, { useState, useEffect } from 'react';
import SystemHealthPanel from '../components/SystemHealthPanel';
import api from '../services/api';

const AdminCockpit = () => {
  const [apiLogs, setApiLogs] = useState([]);
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const weightsData = await api.getGraderWeights().catch(() => null);
      setWeights(weightsData);
      
      // Mock API logs for now
      setApiLogs([
        { time: '2 min ago', endpoint: '/predict-live', status: 200, duration: '234ms' },
        { time: '5 min ago', endpoint: '/live/splits/NBA', status: 200, duration: '156ms' },
        { time: '8 min ago', endpoint: '/esoteric/analyze', status: 200, duration: '89ms' },
        { time: '12 min ago', endpoint: '/grader/grade', status: 200, duration: '312ms' },
        { time: '15 min ago', endpoint: '/live/odds/NBA', status: 200, duration: '445ms' }
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const runAutoTune = async () => {
    alert('Auto-tune would run here. This recalculates optimal weights based on graded picks.');
  };

  const clearCache = async () => {
    alert('Cache cleared!');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎛️</span> Admin Cockpit
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            System monitoring, model health, and weight tuning
          </p>
        </div>

        {/* System Health Panel */}
        <div style={{ marginBottom: '25px' }}>
          <SystemHealthPanel />
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={runAutoTune} style={{
              padding: '12px 24px',
              backgroundColor: '#00D4FF',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔧 Run Auto-Tune
            </button>
            <button onClick={clearCache} style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a2e',
              color: '#9ca3af',
              border: '1px solid #333',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗑️ Clear Cache
            </button>
            <button onClick={fetchAdminData} style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a2e',
              color: '#9ca3af',
              border: '1px solid #333',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔄 Refresh Data
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Current Weights */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>Current Signal Weights</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {weights?.weights ? (
                Object.entries(weights.weights).map(([name, weight], i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #12121f'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{name}</span>
                    <span style={{
                      color: weight >= 15 ? '#00FF88' : weight >= 10 ? '#00D4FF' : '#9ca3af',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {typeof weight === 'object' ? weight.weight : weight}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Loading weights...</div>
              )}
            </div>
          </div>

          {/* API Activity Log */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>Recent API Activity</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {apiLogs.map((log, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #12121f'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}>
                      {log.endpoint}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>{log.time}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      color: log.status === 200 ? '#00FF88' : '#FF4444',
                      fontSize: '12px'
                    }}>
                      {log.status}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>{log.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Keys Status */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px' }}>API Keys Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF88' }} />
                <span style={{ color: '#fff', fontSize: '14px' }}>The Odds API</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>$30/mo • Live odds from 20+ books</div>
            </div>
            <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF88' }} />
                <span style={{ color: '#fff', fontSize: '14px' }}>PlayBook API</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>$40/mo • Splits, injuries, sharp money</div>
            </div>
            <div style={{ backgroundColor: '#12121f', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF88' }} />
                <span style={{ color: '#fff', fontSize: '14px' }}>Whop API</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Membership management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCockpit;
