/**
 * NOTIFICATION CENTER v1.0
 *
 * In-app notification center featuring:
 * - Notification bell with unread badge
 * - Notification dropdown/panel
 * - Notification preferences
 * - Notification history with filters
 * - Digest mode settings
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationHistory,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearAllNotifications,
  getNotificationsGroupedByDate,
  getNotificationStats,
  isNotificationSupported,
  requestPermission,
  getPermissionStatus,
  NotificationTypes,
  isQuietHours,
  getTimeUntilQuietHoursEnd,
  getDigestSettings,
  saveDigestSettings
} from './notifications';

// ========== NOTIFICATION BELL (Header Component) ==========

export const NotificationBell = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const count = getUnreadCount();
      if (count > unreadCount) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);
      }
      setUnreadCount(count);
    };

    updateCount();

    // Listen for notification events
    const handleNewNotification = () => updateCount();
    window.addEventListener('notification-added', handleNewNotification);
    window.addEventListener('notification-read', handleNewNotification);
    window.addEventListener('notifications-all-read', handleNewNotification);

    // Poll periodically
    const interval = setInterval(updateCount, 5000);

    return () => {
      window.removeEventListener('notification-added', handleNewNotification);
      window.removeEventListener('notification-read', handleNewNotification);
      window.removeEventListener('notifications-all-read', handleNewNotification);
      clearInterval(interval);
    };
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={`${unreadCount} unread notifications`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: animate ? 'shake 0.5s ease-in-out' : 'none'
        }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          backgroundColor: '#FF4444',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '50%',
          minWidth: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) rotate(-5deg); }
          50% { transform: translateX(3px) rotate(5deg); }
          75% { transform: translateX(-3px) rotate(-5deg); }
        }
      `}</style>
    </button>
  );
};

// ========== NOTIFICATION DROPDOWN ==========

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = () => {
    setNotifications(getNotificationHistory(50));
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    loadNotifications();
  };

  const handleDismiss = (id) => {
    dismissNotification(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications.filter(n => !n.dismissed);
    if (activeTab === 'unread') return notifications.filter(n => !n.read && !n.dismissed);
    return notifications.filter(n => n.type === activeTab && !n.dismissed);
  }, [notifications, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '380px',
        maxHeight: '500px',
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        border: '1px solid #333',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#00D4FF',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Quiet Hours Notice */}
      {isQuietHours() && (
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#FFD70015',
          borderBottom: '1px solid #333',
          color: '#FFD700',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🌙</span>
          <span>Quiet hours active - notifications silenced</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '10px 15px',
        borderBottom: '1px solid #333',
        overflowX: 'auto'
      }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: NotificationTypes.GOLDEN_PICK, label: '🌟 Picks' },
          { key: NotificationTypes.SHARP_ALERT, label: '💰 Sharp' },
          { key: NotificationTypes.BET_RESULT, label: '🎲 Results' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === tab.key ? '#00D4FF' : 'transparent',
              color: activeTab === tab.key ? '#000' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{
        maxHeight: '350px',
        overflowY: 'auto'
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={() => handleMarkAsRead(notif.id)}
              onDismiss={() => handleDismiss(notif.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 15px',
        borderTop: '1px solid #333',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => { onClose(); window.location.hash = '#notifications'; }}
          style={{
            background: 'none',
            border: 'none',
            color: '#00D4FF',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
};

// ========== NOTIFICATION ITEM ==========

const NotificationItem = ({ notification, onMarkRead, onDismiss }) => {
  const timeAgo = getTimeAgo(notification.timestamp);

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead();
    }
    if (notification.navigateTo) {
      window.location.hash = notification.navigateTo;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '12px 15px',
        borderBottom: '1px solid #222',
        display: 'flex',
        gap: '12px',
        backgroundColor: notification.read ? 'transparent' : '#00D4FF08',
        cursor: notification.navigateTo ? 'pointer' : 'default',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#ffffff05' : '#00D4FF12'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : '#00D4FF08'}
    >
      {/* Icon */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: `${notification.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0
      }}>
        {notification.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: notification.read ? 'normal' : 'bold',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {notification.title}
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {notification.body || notification.message}
        </div>
        <div style={{
          color: '#6b7280',
          fontSize: '10px',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{timeAgo}</span>
          {notification.silenced && <span style={{ color: '#FFD700' }}>🌙 Silenced</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {!notification.read && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00D4FF'
          }} />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '14px'
          }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ========== FULL NOTIFICATION CENTER PAGE ==========

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [digestSettings, setDigestSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [permissionStatus, setPermissionStatus] = useState('default');

  const loadData = useCallback(() => {
    setNotifications(getNotificationHistory(200));
    setSettings(getNotificationSettings());
    setDigestSettings(getDigestSettings());
    setStats(getNotificationStats());
    setPermissionStatus(getPermissionStatus());
  }, []);

  useEffect(() => {
    loadData();

    // Listen for updates
    const handleUpdate = () => loadData();
    window.addEventListener('notification-added', handleUpdate);
    window.addEventListener('notification-read', handleUpdate);
    window.addEventListener('notifications-all-read', handleUpdate);
    window.addEventListener('notifications-cleared', handleUpdate);

    return () => {
      window.removeEventListener('notification-added', handleUpdate);
      window.removeEventListener('notification-read', handleUpdate);
      window.removeEventListener('notifications-all-read', handleUpdate);
      window.removeEventListener('notifications-cleared', handleUpdate);
    };
  }, [loadData]);

  const handleSaveSettings = (newSettings) => {
    saveNotificationSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveDigestSettings = (newSettings) => {
    saveDigestSettings(newSettings);
    setDigestSettings(newSettings);
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      clearAllNotifications();
      loadData();
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications.filter(n => !n.dismissed);
    if (filterType === 'unread') return notifications.filter(n => !n.read && !n.dismissed);
    return notifications.filter(n => n.type === filterType && !n.dismissed);
  }, [notifications, filterType]);

  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(notif => {
      const date = new Date(notif.timestamp);
      const key = date.toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let label = key;
      if (key === today) label = 'Today';
      else if (key === yesterday) label = 'Yesterday';

      if (!groups[key]) {
        groups[key] = { label, notifications: [] };
      }
      groups[key].notifications.push(notif);
    });

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([_, group]) => group);
  }, [filteredNotifications]);

  if (!settings) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔔 Notification Center
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Manage your notifications and preferences
          </p>
        </div>

        {/* Permission Banner */}
        {permissionStatus !== 'granted' && isNotificationSupported() && (
          <div style={{
            backgroundColor: '#00D4FF15',
            border: '1px solid #00D4FF50',
            borderRadius: '12px',
            padding: '15px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ color: '#00D4FF', fontWeight: 'bold', marginBottom: '4px' }}>
                Enable Browser Notifications
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                Get notified about picks, sharp money alerts, and bet results even when the app is in the background.
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              style={{
                padding: '10px 20px',
                backgroundColor: '#00D4FF',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              Enable
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <MiniStatCard label="Total" value={stats.total} color="#00D4FF" />
            <MiniStatCard label="Unread" value={stats.unread} color={stats.unread > 0 ? '#FF4444' : '#00FF88'} />
            <MiniStatCard label="Today" value={stats.today} color="#FFD700" />
            <MiniStatCard label="This Week" value={stats.thisWeek} color="#A855F7" />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
          {[
            { key: 'history', label: '📜 History' },
            { key: 'preferences', label: '⚙️ Preferences' },
            { key: 'digest', label: '📧 Digest' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.key ? '#00D4FF' : '#1a1a2e',
                color: activeTab === tab.key ? '#000' : '#9ca3af',
                border: activeTab === tab.key ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            {/* Filter Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: NotificationTypes.GOLDEN_PICK, label: '🌟 Picks' },
                  { key: NotificationTypes.SHARP_ALERT, label: '💰 Sharp' },
                  { key: NotificationTypes.LINE_MOVE, label: '📈 Lines' },
                  { key: NotificationTypes.INJURY_UPDATE, label: '🏥 Injuries' },
                  { key: NotificationTypes.BET_RESULT, label: '🎲 Results' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: filterType === filter.key ? '#00D4FF30' : '#0a0a0f',
                      color: filterType === filter.key ? '#00D4FF' : '#6b7280',
                      border: `1px solid ${filterType === filter.key ? '#00D4FF50' : '#333'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { markAllAsRead(); loadData(); }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#00D4FF',
                    border: '1px solid #00D4FF50',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Mark all read
                </button>
                <button
                  onClick={handleClearAll}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#FF4444',
                    border: '1px solid #FF444450',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
              {groupedNotifications.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔔</div>
                  <div style={{ fontSize: '16px' }}>No notifications yet</div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Notifications will appear here when you receive them
                  </div>
                </div>
              ) : (
                groupedNotifications.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <div style={{
                      padding: '10px 15px',
                      backgroundColor: '#0a0a0f',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {group.label}
                    </div>
                    {group.notifications.map(notif => (
                      <NotificationHistoryItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={() => { markAsRead(notif.id); loadData(); }}
                        onDismiss={() => { dismissNotification(notif.id); loadData(); }}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <NotificationPreferences
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}

        {/* Digest Tab */}
        {activeTab === 'digest' && digestSettings && (
          <DigestSettings
            settings={digestSettings}
            onSave={handleSaveDigestSettings}
          />
        )}
      </div>
    </div>
  );
};

// ========== NOTIFICATION HISTORY ITEM ==========

const NotificationHistoryItem = ({ notification, onMarkRead, onDismiss }) => {
  const timeAgo = getTimeAgo(notification.timestamp);

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead();
    }
    if (notification.navigateTo) {
      window.location.hash = notification.navigateTo;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '15px',
        borderBottom: '1px solid #222',
        display: 'flex',
        gap: '15px',
        backgroundColor: notification.read ? 'transparent' : '#00D4FF08',
        cursor: notification.navigateTo ? 'pointer' : 'default'
      }}
    >
      {/* Icon */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        backgroundColor: `${notification.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0
      }}>
        {notification.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '4px'
        }}>
          <div style={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: notification.read ? 'normal' : 'bold'
          }}>
            {notification.title}
          </div>
          <div style={{
            color: '#6b7280',
            fontSize: '11px',
            flexShrink: 0,
            marginLeft: '10px'
          }}>
            {timeAgo}
          </div>
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '13px',
          marginBottom: '8px'
        }}>
          {notification.body || notification.message}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!notification.read && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#00D4FF20',
              color: '#00D4FF',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              New
            </span>
          )}
          {notification.silenced && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#FFD70020',
              color: '#FFD700',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              🌙 Silenced
            </span>
          )}
          {notification.navigateTo && (
            <span style={{ color: '#00D4FF', fontSize: '11px' }}>
              Click to view →
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== NOTIFICATION PREFERENCES ==========

const NotificationPreferences = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (key) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Master Toggle */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <ToggleRow
          label="Enable Notifications"
          description="Master switch for all notifications"
          checked={localSettings.enabled}
          onChange={() => handleToggle('enabled')}
          highlight
        />
      </div>

      {/* Delivery Method */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Delivery Method</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ToggleRow
            label="Browser Notifications"
            description="Show system notifications"
            checked={localSettings.browserNotifications}
            onChange={() => handleToggle('browserNotifications')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="In-App Notifications"
            description="Show notifications in the app"
            checked={localSettings.inAppNotifications}
            onChange={() => handleToggle('inAppNotifications')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="Sound"
            description="Play notification sounds"
            checked={localSettings.soundEnabled}
            onChange={() => handleToggle('soundEnabled')}
            disabled={!localSettings.enabled}
          />
        </div>
      </div>

      {/* By Type */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Notification Types</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ToggleRow
            label="🌟 Golden Convergence Picks"
            description="Highest confidence picks"
            checked={localSettings.goldenPicks}
            onChange={() => handleToggle('goldenPicks')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="🎯 High-Confidence Picks"
            description="Strong signal picks"
            checked={localSettings.highConfidencePicks}
            onChange={() => handleToggle('highConfidencePicks')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="💰 Sharp Money Alerts"
            description="When sharp money diverges"
            checked={localSettings.sharpAlerts}
            onChange={() => handleToggle('sharpAlerts')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="📈 Line Movement"
            description="Significant line changes on bookmarked games"
            checked={localSettings.lineMoves}
            onChange={() => handleToggle('lineMoves')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="🏥 Injury Updates"
            description="Key player status changes"
            checked={localSettings.injuryUpdates}
            onChange={() => handleToggle('injuryUpdates')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="🎲 Bet Results"
            description="When your bets win or lose"
            checked={localSettings.betResults}
            onChange={() => handleToggle('betResults')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="⏰ Game Starting"
            description="Reminders before games start"
            checked={localSettings.gameStarts}
            onChange={() => handleToggle('gameStarts')}
            disabled={!localSettings.enabled}
          />
        </div>
      </div>

      {/* Thresholds */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Thresholds</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SliderSetting
            label="Minimum Pick Confidence"
            value={localSettings.minConfidenceThreshold}
            onChange={(v) => handleChange('minConfidenceThreshold', v)}
            min={50}
            max={95}
            unit="%"
            description="Only notify for picks with this confidence or higher"
            disabled={!localSettings.enabled}
          />
          <SliderSetting
            label="Sharp Money Divergence"
            value={localSettings.minDivergenceThreshold}
            onChange={(v) => handleChange('minDivergenceThreshold', v)}
            min={10}
            max={50}
            unit="%"
            description="Only notify for divergence above this threshold"
            disabled={!localSettings.enabled}
          />
          <SliderSetting
            label="Line Movement"
            value={localSettings.lineMovementThreshold}
            onChange={(v) => handleChange('lineMovementThreshold', v)}
            min={0.5}
            max={5}
            step={0.5}
            unit=" pts"
            description="Only notify for line moves larger than this"
            disabled={!localSettings.enabled}
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Quiet Hours</h3>
        <ToggleRow
          label="🌙 Enable Quiet Hours"
          description="Silence notifications during specified times"
          checked={localSettings.quietHoursEnabled}
          onChange={() => handleToggle('quietHoursEnabled')}
          disabled={!localSettings.enabled}
        />
        {localSettings.quietHoursEnabled && (
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={localSettings.quietHoursStart}
                onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                disabled={!localSettings.enabled}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
                End Time
              </label>
              <input
                type="time"
                value={localSettings.quietHoursEnd}
                onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                disabled={!localSettings.enabled}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== DIGEST SETTINGS ==========

const DigestSettings = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (key) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Master Toggle */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <ToggleRow
          label="Enable Digest Mode"
          description="Receive summary notifications instead of individual alerts"
          checked={localSettings.enabled}
          onChange={() => handleToggle('enabled')}
          highlight
        />
      </div>

      {/* Daily Digest */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>📅 Daily Digest</h3>
        <ToggleRow
          label="Daily Summary"
          description="Get a daily summary of yesterday's activity"
          checked={localSettings.dailyDigest}
          onChange={() => handleToggle('dailyDigest')}
          disabled={!localSettings.enabled}
        />
        {localSettings.dailyDigest && localSettings.enabled && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
              Send At
            </label>
            <input
              type="time"
              value={localSettings.dailyTime}
              onChange={(e) => handleChange('dailyTime', e.target.value)}
              style={{
                width: '150px',
                padding: '10px',
                backgroundColor: '#0a0a0f',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
      </div>

      {/* Weekly Digest */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>📈 Weekly Report</h3>
        <ToggleRow
          label="Weekly Performance Report"
          description="Get a comprehensive weekly performance summary"
          checked={localSettings.weeklyDigest}
          onChange={() => handleToggle('weeklyDigest')}
          disabled={!localSettings.enabled}
        />
        {localSettings.weeklyDigest && localSettings.enabled && (
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
                Day
              </label>
              <select
                value={localSettings.weeklyDay}
                onChange={(e) => handleChange('weeklyDay', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              >
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
                Time
              </label>
              <input
                type="time"
                value={localSettings.weeklyTime}
                onChange={(e) => handleChange('weeklyTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0a0f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* What to Include */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 15px', fontSize: '14px' }}>Include in Digest</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ToggleRow
            label="Performance Stats"
            description="Win rate, ROI, P/L summary"
            checked={localSettings.includeStats}
            onChange={() => handleToggle('includeStats')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="Pick Summary"
            description="Best picks and outcomes"
            checked={localSettings.includePicks}
            onChange={() => handleToggle('includePicks')}
            disabled={!localSettings.enabled}
          />
          <ToggleRow
            label="Sharp Money Activity"
            description="Notable sharp money movements"
            checked={localSettings.includeSharp}
            onChange={() => handleToggle('includeSharp')}
            disabled={!localSettings.enabled}
          />
        </div>
      </div>
    </div>
  );
};

// ========== HELPER COMPONENTS ==========

const ToggleRow = ({ label, description, checked, onChange, disabled, highlight }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: highlight ? '10px 0' : '0',
    opacity: disabled ? 0.5 : 1
  }}>
    <div>
      <div style={{ color: '#fff', fontSize: '13px', fontWeight: highlight ? 'bold' : 'normal' }}>
        {label}
      </div>
      <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
        {description}
      </div>
    </div>
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        backgroundColor: checked ? '#00D4FF' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        position: 'absolute',
        top: '3px',
        left: checked ? '25px' : '3px',
        transition: 'left 0.2s'
      }} />
    </button>
  </div>
);

const SliderSetting = ({ label, value, onChange, min, max, step = 1, unit, description, disabled }) => (
  <div style={{ opacity: disabled ? 0.5 : 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ color: '#fff', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}
    />
    <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
      {description}
    </div>
  </div>
);

const MiniStatCard = ({ label, value, color }) => (
  <div style={{
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center'
  }}>
    <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ color, fontSize: '22px', fontWeight: 'bold' }}>
      {value}
    </div>
  </div>
);

// ========== UTILITY FUNCTIONS ==========

const getTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

export default NotificationCenter;
