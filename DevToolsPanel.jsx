import React, { useState, useEffect, createContext, useContext } from 'react';
import api from './api';
import { DBSyncIndicator, DBSyncCard } from './DBSyncIndicator';

// ============================================================================
// DEV TOOLS CONTEXT
// ============================================================================

const DevToolsContext = createContext({
  isDebugMode: false,
  toggleDebug: () => {},
  logs: [],
  addLog: () => {}
});

export const DevToolsProvider = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    try {
      return localStorage.getItem('bookie_debug_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [logs, setLogs] = useState([]);

  const toggleDebug = () => {
    const newValue = !isDebugMode;
    setIsDebugMode(newValue);
    try {
      localStorage.setItem('bookie_debug_mode', String(newValue));
    } catch {
      // localStorage not available
    }
  };

  const addLog = (type, message, data = null) => {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Intercept console in debug mode
  useEffect(() => {
    if (!isDebugMode) return;

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      addLog('info', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, [isDebugMode]);

  return (
    <DevToolsContext.Provider value={{ isDebugMode, toggleDebug, logs, addLog }}>
      {children}
    </DevToolsContext.Provider>
  );
};

export const useDevTools = () => useContext(DevToolsContext);

// ============================================================================
// DEBUG TOGGLE BUTTON
// ============================================================================

export const DebugToggle = ({ style = {} }) => {
  const { isDebugMode, toggleDebug } = useDevTools();

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: isDebugMode ? 'rgba(139, 92, 246, 0.2)' : '#1a1a2e',
    border: `1px solid ${isDebugMode ? '#8B5CF6' : '#333'}`,
    borderRadius: '6px',
    color: isDebugMode ? '#8B5CF6' : '#9ca3af',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...style
  };

  return (
    <button style={buttonStyle} onClick={toggleDebug}>
      <span>{isDebugMode ? '🔧' : '⚙️'}</span>
      <span>Debug {isDebugMode ? 'ON' : 'OFF'}</span>
    </button>
  );
};

// ============================================================================
// RAW RESPONSE VIEWER
// ============================================================================

const RawResponseViewer = ({ endpoint, sport = 'NBA' }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchRaw = async () => {
    setLoading(true);
    try {
      const data = await api.getRawResponse(endpoint, sport);
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    }
    setLoading(false);
  };

  const containerStyle = {
    backgroundColor: '#12121f',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#1a1a2e',
    borderBottom: '1px solid #333'
  };

  const codeStyle = {
    padding: '16px',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#10B981',
    backgroundColor: '#0a0a14',
    maxHeight: expanded ? 'none' : '200px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00D4FF', fontFamily: 'monospace', fontSize: '12px' }}>
            {endpoint}
          </span>
          {response && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              backgroundColor: response.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: response.ok ? '#10B981' : '#EF4444'
            }}>
              {response.status || 'ERR'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchRaw}
            disabled={loading}
            style={{
              padding: '4px 12px',
              backgroundColor: '#00D4FF20',
              border: '1px solid #00D4FF40',
              borderRadius: '4px',
              color: '#00D4FF',
              fontSize: '11px',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Fetch'}
          </button>
          {response && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: '4px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#9ca3af',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
      </div>
      {response && (
        <pre style={codeStyle}>
          {JSON.stringify(response.data || response, null, 2)}
        </pre>
      )}
    </div>
  );
};

// ============================================================================
// DEV TOOLS PANEL
// ============================================================================

const DevToolsPanel = ({ style = {} }) => {
  const { isDebugMode, logs } = useDevTools();
  const [activeTab, setActiveTab] = useState('endpoints');
  const [sport, setSport] = useState('NBA');
  const [apiHealth, setApiHealth] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Common endpoints to test
  const endpoints = [
    { path: 'best-bets', label: 'Best Bets / SmashSpots' },
    { path: 'sharp', label: 'Sharp Money' },
    { path: 'splits', label: 'Betting Splits' },
    { path: 'props', label: 'Player Props' },
    { path: 'sport-dashboard', label: 'Sport Dashboard (consolidated)' },
    { path: '/health', label: 'Health Check' },
    { path: '/esoteric/today-energy', label: 'Today Energy' }
  ];

  useEffect(() => {
    if (isDebugMode && activeTab === 'health') {
      api.getAPIHealth().then(setApiHealth);
    }
    if (isDebugMode && activeTab === 'dashboard') {
      api.getSportDashboard(sport).then(setDashboardData);
    }
  }, [isDebugMode, activeTab, sport]);

  if (!isDebugMode) return null;

  const panelStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#12121f',
    borderTop: '2px solid #8B5CF6',
    maxHeight: '50vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
    ...style
  };

  const tabsStyle = {
    display: 'flex',
    gap: '2px',
    padding: '8px 16px',
    backgroundColor: '#1a1a2e',
    borderBottom: '1px solid #333'
  };

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#8B5CF620' : 'transparent',
    color: isActive ? '#8B5CF6' : '#9ca3af',
    border: 'none',
    borderRadius: '6px 6px 0 0',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400
  });

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '16px'
  };

  return (
    <div style={panelStyle}>
      <div style={tabsStyle}>
        <span style={{ color: '#8B5CF6', fontWeight: 600, marginRight: '16px', fontSize: '12px' }}>
          🔧 Dev Tools
        </span>
        <button style={tabStyle(activeTab === 'endpoints')} onClick={() => setActiveTab('endpoints')}>
          Endpoints
        </button>
        <button style={tabStyle(activeTab === 'health')} onClick={() => setActiveTab('health')}>
          API Health
        </button>
        <button style={tabStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          Dashboard Data
        </button>
        <button style={tabStyle(activeTab === 'logs')} onClick={() => setActiveTab('logs')}>
          Logs ({logs.length})
        </button>
        <div style={{ flex: 1 }} />
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '11px'
          }}
        >
          <option value="NBA">NBA</option>
          <option value="NFL">NFL</option>
          <option value="MLB">MLB</option>
          <option value="NHL">NHL</option>
        </select>
      </div>

      <div style={contentStyle}>
        {activeTab === 'endpoints' && (
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px' }}>
              Test API Endpoints (Sport: {sport})
            </h4>
            {endpoints.map(ep => (
              <RawResponseViewer key={ep.path} endpoint={ep.path} sport={sport} />
            ))}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px' }}>
              API Health & Grader
            </h4>
            {apiHealth ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h5 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Status</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: apiHealth.status === 'healthy' ? '#10B981' : '#EF4444'
                    }} />
                    <span style={{ color: '#fff', fontSize: '14px' }}>
                      {apiHealth.status}
                    </span>
                  </div>
                  {apiHealth.version && (
                    <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px' }}>
                      Version: {apiHealth.version}
                    </div>
                  )}
                </div>

                {apiHealth.grader && (
                  <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h5 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Grader Weights</h5>
                    <pre style={{ color: '#10B981', fontSize: '10px', fontFamily: 'monospace' }}>
                      {JSON.stringify(apiHealth.grader, null, 2)}
                    </pre>
                  </div>
                )}

                {apiHealth.scheduler && (
                  <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '16px',
                    gridColumn: '1 / -1'
                  }}>
                    <h5 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Scheduler Status</h5>
                    <pre style={{ color: '#F59E0B', fontSize: '10px', fontFamily: 'monospace' }}>
                      {JSON.stringify(apiHealth.scheduler, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#9ca3af' }}>Loading health data...</div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px' }}>
              Sport Dashboard Data ({sport})
            </h4>
            {dashboardData ? (
              <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px' }}>
                <DBSyncCard data={dashboardData} />
                <div style={{
                  backgroundColor: '#0a0a14',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '16px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  <pre style={{ color: '#10B981', fontSize: '10px', fontFamily: 'monospace' }}>
                    {JSON.stringify(dashboardData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ color: '#9ca3af' }}>Loading dashboard data...</div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px' }}>
              Console Logs ({logs.length})
            </h4>
            <div style={{
              backgroundColor: '#0a0a14',
              border: '1px solid #333',
              borderRadius: '8px',
              maxHeight: '250px',
              overflow: 'auto'
            }}>
              {logs.length === 0 ? (
                <div style={{ padding: '16px', color: '#6b7280', fontSize: '12px' }}>
                  No logs captured yet. Actions will appear here.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #1a1a2e',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#6b7280', minWidth: '80px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{
                      color: log.type === 'error' ? '#EF4444' : '#10B981',
                      minWidth: '40px'
                    }}>
                      [{log.type}]
                    </span>
                    <span style={{ color: '#9ca3af', flex: 1 }}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// FLOATING DEBUG BUTTON
// ============================================================================

export const FloatingDebugButton = () => {
  const { isDebugMode, toggleDebug } = useDevTools();
  const [visible, setVisible] = useState(false);

  // Show button with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebug();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDebug]);

  // Only show in development
  useEffect(() => {
    setVisible(import.meta.env.DEV || localStorage.getItem('bookie_show_debug') === 'true');
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={toggleDebug}
      style={{
        position: 'fixed',
        bottom: isDebugMode ? 'calc(50vh + 10px)' : '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isDebugMode ? '#8B5CF6' : '#1a1a2e',
        border: `2px solid ${isDebugMode ? '#A78BFA' : '#333'}`,
        color: isDebugMode ? '#fff' : '#9ca3af',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}
      title="Toggle Dev Tools (Ctrl+Shift+D)"
    >
      {isDebugMode ? '✕' : '🔧'}
    </button>
  );
};

export default DevToolsPanel;
