import React, { useState } from 'react';
import api from './api';
import { resetOnboarding } from './Onboarding';
import { useToast } from './Toast';

const Profile = () => {
  const toast = useToast();
  const [user, setUser] = useState({
    name: 'Member',
    email: 'member@example.com',
    plan: 'annual',
    planName: 'Annual Plan',
    memberSince: '2025-01-01',
    nextBilling: '2026-01-01',
    discordConnected: false,
    discordUsername: null
  });

  const [bankroll, setBankroll] = useState({
    starting: 1000,
    current: 1150,
    kellyFraction: 0.25,
    maxBetSize: 5,
    unitSize: 25
  });

  const [notifications, setNotifications] = useState({
    dailyPicks: true,
    sharpAlerts: true,
    harmonicConvergence: true,
    weeklyReport: true
  });

  const handleBankrollChange = (field, value) => {
    setBankroll(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleNotificationToggle = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const connectDiscord = () => {
    // Would redirect to Discord OAuth
    alert('This would redirect to Discord OAuth for connection');
  };

  const managePlan = () => {
    // Would redirect to Whop billing
    window.open('https://whop.com/hub', '_blank');
  };

  const handleRestartTour = () => {
    resetOnboarding();
    toast.info('Tour reset! Refresh to see the onboarding wizard.');
  };

  const roi = ((bankroll.current - bankroll.starting) / bankroll.starting * 100).toFixed(1);

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>👤</span> Profile & Settings
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Manage your subscription, connections, and preferences
          </p>
        </div>

        {/* Subscription Status */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '20px',
          border: '1px solid #8B5CF640'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>CURRENT PLAN</div>
              <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {user.planName}
              </div>
              <div style={{
                backgroundColor: '#00FF8830',
                color: '#00FF88',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                ACTIVE
              </div>
            </div>
            <button onClick={managePlan} style={{
              padding: '12px 24px',
              backgroundColor: '#8B5CF6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Manage Plan
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Member Since</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{user.memberSince}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Next Billing</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{user.nextBilling}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Email</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Discord Connection */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#5865F2',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💬
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Discord</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                  {user.discordConnected 
                    ? `Connected as ${user.discordUsername}` 
                    : 'Connect for alerts and community access'}
                </div>
              </div>
            </div>
            <button onClick={connectDiscord} style={{
              padding: '10px 20px',
              backgroundColor: user.discordConnected ? '#1a1a2e' : '#5865F2',
              color: user.discordConnected ? '#9ca3af' : '#fff',
              border: user.discordConnected ? '1px solid #333' : 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              {user.discordConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Bankroll Settings */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💰 Bankroll Settings
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Starting Bankroll ($)
              </label>
              <input
                type="number"
                value={bankroll.starting}
                onChange={(e) => handleBankrollChange('starting', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Current Bankroll ($)
              </label>
              <input
                type="number"
                value={bankroll.current}
                onChange={(e) => handleBankrollChange('current', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Kelly Fraction (0.1 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1"
                value={bankroll.kellyFraction}
                onChange={(e) => handleBankrollChange('kellyFraction', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Max Bet Size (% of bankroll)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={bankroll.maxBetSize}
                onChange={(e) => handleBankrollChange('maxBetSize', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#12121f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            backgroundColor: '#12121f',
            borderRadius: '8px',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Current ROI</div>
              <div style={{ color: roi >= 0 ? '#00FF88' : '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>
                {roi >= 0 ? '+' : ''}{roi}%
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>Unit Size</div>
              <div style={{ color: '#00D4FF', fontSize: '24px', fontWeight: 'bold' }}>
                ${(bankroll.current * (bankroll.maxBetSize / 100)).toFixed(0)}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>P/L</div>
              <div style={{ color: bankroll.current >= bankroll.starting ? '#00FF88' : '#FF4444', fontSize: '24px', fontWeight: 'bold' }}>
                {bankroll.current >= bankroll.starting ? '+' : ''}${(bankroll.current - bankroll.starting).toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Notifications
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { key: 'dailyPicks', label: 'Daily Picks Alert', desc: 'Get notified when new picks are posted (5pm ET)' },
              { key: 'sharpAlerts', label: 'Sharp Money Alerts', desc: 'Instant alerts when sharp action is detected' },
              { key: 'harmonicConvergence', label: 'Harmonic Convergence', desc: 'When Math + Magic align on a pick' },
              { key: 'weeklyReport', label: 'Weekly Performance Report', desc: 'Summary of the week\'s results' }
            ].map(notif => (
              <div key={notif.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#12121f',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', marginBottom: '2px' }}>{notif.label}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>{notif.desc}</div>
                </div>
                <button
                  onClick={() => handleNotificationToggle(notif.key)}
                  style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: notifications[notif.key] ? '#00FF88' : '#333',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: notifications[notif.key] ? '24px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* App Settings */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ App Settings
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#12121f',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', marginBottom: '2px' }}>Restart Onboarding Tour</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>See the welcome wizard again</div>
            </div>
            <button
              onClick={handleRestartTour}
              style={{
                padding: '8px 16px',
                backgroundColor: '#00D4FF20',
                color: '#00D4FF',
                border: '1px solid #00D4FF40',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Restart Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
