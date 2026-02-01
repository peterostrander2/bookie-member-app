/**
 * SIGNAL NOTIFICATIONS
 *
 * Polls for new high-confidence signals and notifies users
 * when smash spots or golden convergence picks appear.
 */

import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import api from './api';
import { useToast } from './Toast';
import { isAuthInvalid, onAuthInvalid } from './lib/api/client';

const apiKey = import.meta.env.VITE_BOOKIE_API_KEY;
const POLL_INTERVAL = 60000; // 1 minute
const STORAGE_KEY = 'bookie_seen_signals';

// Context for signal notifications
const SignalNotificationContext = createContext();

export const useSignalNotifications = () => {
  const context = useContext(SignalNotificationContext);
  if (!context) {
    throw new Error('useSignalNotifications must be used within SignalNotificationProvider');
  }
  return context;
};

export const SignalNotificationProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem('bookie_signal_notifications') !== 'disabled';
    } catch {
      return true;
    }
  });
  const [newSignals, setNewSignals] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const toast = useToast();
  const seenSignalsRef = useRef(new Set());
  const pollInFlightRef = useRef(false);
  const pollBackoffUntilRef = useRef(0);
  const pollErrorStreakRef = useRef(0);

  // Load seen signals from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        seenSignalsRef.current = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading seen signals:', e);
    }
  }, []);

  // Save seen signals to storage
  const saveSeenSignals = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenSignalsRef.current]));
    } catch (e) {
      console.error('Error saving seen signals:', e);
    }
  };

  // Generate unique signal ID
  const getSignalId = (signal, sport) => {
    return `${sport}_${signal.game_id || signal.id}_${signal.bet_type}_${signal.side}`;
  };

  // Check for new signals
  const checkForNewSignals = async () => {
    if (!isEnabled) return;
    if (pollInFlightRef.current) return;
    if (Date.now() < pollBackoffUntilRef.current) return;

    pollInFlightRef.current = true;
    try {
      const sports = ['nba', 'nfl', 'mlb', 'nhl'];
      const allNewSignals = [];

    for (const sport of sports) {
      try {
        const data = await api.getBestBets(sport);
        if (data?.data && Array.isArray(data.data)) {
          // Filter for high-confidence signals only (SMASH, GOLDEN)
          const highConfidence = data.data.filter(signal => {
            const score = signal.total_score || signal.confidence || 0;
            const tier = signal.tier || '';
            return score >= 10 || tier.includes('GOLDEN') || tier.includes('SMASH');
          });

          for (const signal of highConfidence) {
            const signalId = getSignalId(signal, sport);
            if (!seenSignalsRef.current.has(signalId)) {
              seenSignalsRef.current.add(signalId);
              allNewSignals.push({ ...signal, sport: sport.toUpperCase() });
            }
          }
        }
      } catch (e) {
        // Silently fail for individual sports
      }
    }

      if (allNewSignals.length > 0) {
        setNewSignals(prev => [...allNewSignals, ...prev].slice(0, 20));
        saveSeenSignals();

      // Show toast for top signal
      const topSignal = allNewSignals[0];
      const teamInfo = topSignal.team || topSignal.home_team || 'New';
      const tierLabel = topSignal.tier?.includes('GOLDEN') ? 'GOLDEN' :
                       topSignal.tier?.includes('SMASH') ? 'SMASH' : 'HIGH';

      toast.success(
        `${tierLabel} Signal: ${teamInfo} (${topSignal.sport})`,
        { duration: 6000 }
      );

      // Browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Smash Spot!', {
          body: `${tierLabel}: ${teamInfo} - ${topSignal.sport}`,
          icon: '/favicon.ico',
          tag: 'bookie-signal'
        });
      }
    }

      setLastCheck(new Date());
      pollErrorStreakRef.current = 0;
    } catch (err) {
      pollErrorStreakRef.current += 1;
      const backoffMs = Math.min(60000, 1000 * (2 ** pollErrorStreakRef.current));
      pollBackoffUntilRef.current = Date.now() + backoffMs;
    } finally {
      pollInFlightRef.current = false;
    }
  };

  // Poll for new signals
  useEffect(() => {
    if (!isEnabled || !apiKey || isAuthInvalid()) return;

    // Initial check after short delay
    const initialTimeout = setTimeout(checkForNewSignals, 5000);

    // Regular polling
    const interval = setInterval(checkForNewSignals, POLL_INTERVAL);

    // Stop polling if auth becomes invalid
    const unsubscribe = onAuthInvalid(() => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    });

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      unsubscribe();
    };
  }, [isEnabled]);

  // Toggle notifications
  const toggleNotifications = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('bookie_signal_notifications', newState ? 'enabled' : 'disabled');

    if (newState) {
      toast.success('Signal notifications enabled');
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      toast.info('Signal notifications disabled');
    }
  };

  // Request browser notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Clear a signal from the new list
  const clearSignal = (signalId) => {
    setNewSignals(prev => prev.filter(s => getSignalId(s, s.sport.toLowerCase()) !== signalId));
  };

  // Clear all new signals
  const clearAllSignals = () => {
    setNewSignals([]);
  };

  return (
    <SignalNotificationContext.Provider value={{
      isEnabled,
      toggleNotifications,
      newSignals,
      clearSignal,
      clearAllSignals,
      lastCheck,
      requestPermission,
      checkForNewSignals
    }}>
      {children}
    </SignalNotificationContext.Provider>
  );
};

// Signal Bell Icon for navbar
export const SignalBell = () => {
  const { isEnabled, toggleNotifications, newSignals } = useSignalNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const hasNew = newSignals.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          fontSize: '18px',
          position: 'relative',
          color: isEnabled ? '#00D4FF' : '#6b7280'
        }}
        title={isEnabled ? 'Signal notifications on' : 'Signal notifications off'}
      >
        🔔
        {hasNew && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '10px',
            height: '10px',
            backgroundColor: '#FF4444',
            borderRadius: '50%',
            border: '2px solid #12121f'
          }} />
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: '300px',
          backgroundColor: '#1a1a2e',
          borderRadius: '10px',
          border: '1px solid #333',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
              Signal Alerts
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleNotifications(); }}
              style={{
                padding: '4px 10px',
                backgroundColor: isEnabled ? '#00FF8830' : '#FF444430',
                color: isEnabled ? '#00FF88' : '#FF4444',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {newSignals.length === 0 ? (
              <div style={{ padding: '30px 15px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                No new signals
              </div>
            ) : (
              newSignals.slice(0, 5).map((signal, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid #333',
                    backgroundColor: i === 0 ? '#00D4FF10' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{
                      color: signal.tier?.includes('GOLDEN') ? '#FFD700' : '#00FF88',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {signal.tier?.includes('GOLDEN') ? 'GOLDEN' : 'SMASH'} • {signal.sport}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '10px' }}>
                      {signal.total_score?.toFixed(1) || '10+'} pts
                    </span>
                  </div>
                  <div style={{ color: '#fff', fontSize: '13px' }}>
                    {signal.team || signal.home_team} {signal.side} {signal.line}
                  </div>
                </div>
              ))
            )}
          </div>

          {newSignals.length > 0 && (
            <div style={{ padding: '10px 15px', borderTop: '1px solid #333' }}>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#00D4FF20',
                  color: '#00D4FF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                View All Signals →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignalNotificationProvider;
