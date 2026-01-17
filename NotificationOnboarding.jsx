/**
 * NOTIFICATION ONBOARDING
 *
 * Modal that explains notification benefits before enabling.
 * Shows examples of what users will receive.
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePush } from './PushNotifications';
import { useSignalNotifications } from './SignalNotifications';
import { useToast } from './Toast';

// Notification Onboarding Modal
export const NotificationOnboardingModal = ({ isOpen, onClose, onEnabled }) => {
  const { subscribe, isSubscribed, preferences, updatePreferences } = usePush();
  const { toggleNotifications, isEnabled: signalEnabled } = useSignalNotifications();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPrefs, setSelectedPrefs] = useState({
    smashAlerts: true,
    sharpMoney: true,
    dailySummary: false,
    resultNotifications: true,
    confidenceThreshold: 85,
    emailNotifications: false,
    email: ''
  });

  // Accessibility: refs for focus management
  const headingRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Accessibility: Focus management and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus heading when modal opens or step changes
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 100);

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, step, onClose]);

  if (!isOpen) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      // Enable push notifications
      await subscribe();

      // Update preferences
      updatePreferences(selectedPrefs);

      // Enable signal notifications if not already
      if (!signalEnabled) {
        toggleNotifications();
      }

      // Save email preference to localStorage (backend would sync)
      if (selectedPrefs.emailNotifications && selectedPrefs.email) {
        localStorage.setItem('bookie_notification_email', selectedPrefs.email);
      }

      toast.success('Notifications enabled! You\'ll never miss a SMASH pick.');
      onEnabled?.();
      onClose();
    } catch (error) {
      if (error.message.includes('denied')) {
        toast.error('Please allow notifications in your browser settings');
      } else {
        toast.error('Failed to enable notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const exampleNotifications = [
    {
      type: 'smash',
      icon: '🔥',
      title: 'SMASH Alert: LeBron James',
      body: 'Over 25.5 points (91% confidence) - Lakers vs Celtics',
      time: '2 min ago',
      color: '#00FF88'
    },
    {
      type: 'sharp',
      icon: '🦈',
      title: 'Sharp Money Alert',
      body: '68% of money on Celtics -3.5 despite only 45% tickets',
      time: '5 min ago',
      color: '#00D4FF'
    },
    {
      type: 'result',
      icon: '✅',
      title: 'Bet Result: WIN',
      body: 'LeBron Over 25.5 pts hit with 32 points! +$91',
      time: '1 hour ago',
      color: '#10B981'
    }
  ];

  const benefits = [
    {
      icon: '🎯',
      title: 'Never Miss a SMASH Pick',
      description: 'Get instant alerts when our AI finds 85%+ confidence opportunities'
    },
    {
      icon: '🦈',
      title: 'Sharp Money Movement',
      description: 'Know when professional bettors make significant moves'
    },
    {
      icon: '⏰',
      title: 'Timely Updates',
      description: 'Line movements, injury news, and game results in real-time'
    },
    {
      icon: '⚙️',
      title: 'Fully Customizable',
      description: 'Control exactly what notifications you receive and when'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
        style={{
          backgroundColor: '#0a0a0f',
          borderRadius: '20px',
          border: '1px solid #333',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Step 0: Benefits Overview */}
        {step === 0 && (
          <>
            {/* Header */}
            <div style={{
              padding: '24px 24px 0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <h2
                id="notification-modal-title"
                ref={headingRef}
                tabIndex={-1}
                style={{
                  color: '#fff',
                  fontSize: '22px',
                  margin: '0 0 8px',
                  fontWeight: 'bold',
                  outline: 'none'
                }}
              >
                Enable SMASH Alerts
              </h2>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                margin: 0,
                lineHeight: 1.5
              }}>
                Get notified instantly when our AI detects high-confidence betting opportunities
              </p>
            </div>

            {/* Benefits Grid */}
            <div style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {benefits.map((benefit, i) => (
                <div key={i} style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #2a2a4a'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{benefit.icon}</div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                    {benefit.title}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px', lineHeight: 1.4 }}>
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Example Notifications Preview */}
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{
                color: '#6b7280',
                fontSize: '11px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Example Notifications
              </div>
              <div style={{
                backgroundColor: '#12121f',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {exampleNotifications.slice(0, 2).map((notif, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '8px',
                    border: `1px solid ${notif.color}30`
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: `${notif.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {notif.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>
                        {notif.title}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.3 }}>
                        {notif.body}
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '10px', flexShrink: 0 }}>
                      {notif.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 2,
                  padding: '14px',
                  backgroundColor: '#10B981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🔔</span> Customize & Enable
              </button>
            </div>
          </>
        )}

        {/* Step 1: Customize Preferences */}
        {step === 1 && (
          <>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px'
                }}
              >
                ←
              </button>
              <div>
                <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>
                  Customize Notifications
                </h2>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>
                  Choose what you want to be notified about
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div style={{ padding: '20px 24px' }}>
              {/* Confidence Threshold */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #10B98140'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                      Confidence Threshold
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>
                      Only notify for picks above this confidence
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#10B98130',
                    color: '#10B981',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {selectedPrefs.confidenceThreshold}%+
                  </div>
                </div>
                <input
                  type="range"
                  min="65"
                  max="95"
                  step="5"
                  value={selectedPrefs.confidenceThreshold}
                  onChange={(e) => setSelectedPrefs(p => ({ ...p, confidenceThreshold: parseInt(e.target.value) }))}
                  aria-label="Confidence threshold"
                  aria-valuetext={`${selectedPrefs.confidenceThreshold}% confidence`}
                  style={{
                    width: '100%',
                    accentColor: '#10B981'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  fontSize: '10px',
                  color: '#6b7280'
                }}>
                  <span>65% (More alerts)</span>
                  <span>95% (Fewer, higher quality)</span>
                </div>
              </div>

              {/* Notification Types */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <NotificationToggle
                  icon="🔥"
                  label="SMASH Alerts"
                  description={`High-conviction picks (${selectedPrefs.confidenceThreshold}%+ confidence)`}
                  checked={selectedPrefs.smashAlerts}
                  onChange={(v) => setSelectedPrefs(p => ({ ...p, smashAlerts: v }))}
                  highlight
                />
                <NotificationToggle
                  icon="🦈"
                  label="Sharp Money"
                  description="Alerts when professional bettors make moves"
                  checked={selectedPrefs.sharpMoney}
                  onChange={(v) => setSelectedPrefs(p => ({ ...p, sharpMoney: v }))}
                />
                <NotificationToggle
                  icon="📊"
                  label="Daily Summary"
                  description="Morning digest with top picks for the day"
                  checked={selectedPrefs.dailySummary}
                  onChange={(v) => setSelectedPrefs(p => ({ ...p, dailySummary: v }))}
                />
                <NotificationToggle
                  icon="✅"
                  label="Bet Results"
                  description="Get notified when your tracked bets settle"
                  checked={selectedPrefs.resultNotifications}
                  onChange={(v) => setSelectedPrefs(p => ({ ...p, resultNotifications: v }))}
                />
              </div>

              {/* Email Notifications */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #333'
              }}>
                <NotificationToggle
                  icon="📧"
                  label="Email Notifications"
                  description="Also receive alerts via email (optional)"
                  checked={selectedPrefs.emailNotifications}
                  onChange={(v) => setSelectedPrefs(p => ({ ...p, emailNotifications: v }))}
                />
                {selectedPrefs.emailNotifications && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={selectedPrefs.email}
                      onChange={(e) => setSelectedPrefs(p => ({ ...p, email: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#0a0a0f',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '6px' }}>
                      We'll only email you for the notifications you've enabled above
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid #333'
            }}>
              <button
                onClick={handleEnable}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: loading ? '#333' : '#10B981',
                  color: loading ? '#666' : '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  'Enabling...'
                ) : (
                  <>
                    <span>🔔</span> Enable Notifications
                  </>
                )}
              </button>
              <div style={{
                textAlign: 'center',
                marginTop: '12px',
                color: '#6b7280',
                fontSize: '11px'
              }}>
                You can change these settings anytime in your Profile
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Toggle component for notification preferences
const NotificationToggle = ({ icon, label, description, checked, onChange, highlight = false }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: highlight && checked ? '#10B98110' : '#12121f',
    borderRadius: '10px',
    border: highlight && checked ? '1px solid #10B98130' : '1px solid transparent'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '20px' }} aria-hidden="true">{icon}</span>
      <div>
        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{label}</div>
        <div style={{ color: '#6b7280', fontSize: '11px' }}>{description}</div>
      </div>
    </div>
    <label style={{
      position: 'relative',
      width: '48px',
      height: '26px',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        style={{
          // Visually hidden but accessible to screen readers
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      />
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#10B981' : '#333',
        borderRadius: '26px',
        transition: 'background-color 0.2s'
      }} />
      <span style={{
        position: 'absolute',
        top: '3px',
        left: checked ? '25px' : '3px',
        width: '20px',
        height: '20px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s'
      }} />
    </label>
  </div>
);

// Hook to manage notification onboarding state
export const useNotificationOnboarding = () => {
  const { isSubscribed } = usePush();
  const [showModal, setShowModal] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(() => {
    try {
      return localStorage.getItem('bookie_notification_prompted') === 'true';
    } catch {
      return false;
    }
  });

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    // Mark as prompted so we don't auto-show again
    localStorage.setItem('bookie_notification_prompted', 'true');
    setHasBeenPrompted(true);
  };

  const onEnabled = () => {
    localStorage.setItem('bookie_notification_prompted', 'true');
    setHasBeenPrompted(true);
  };

  return {
    showModal,
    openModal,
    closeModal,
    onEnabled,
    isSubscribed,
    hasBeenPrompted,
    shouldPrompt: !isSubscribed && !hasBeenPrompted
  };
};

export default NotificationOnboardingModal;
