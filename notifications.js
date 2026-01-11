/**
 * NOTIFICATION SYSTEM v2.0
 *
 * Comprehensive notification infrastructure featuring:
 * - Browser notification API integration
 * - In-app notification center
 * - Notification preferences with quiet hours
 * - Notification history with read/unread status
 * - Digest mode for daily/weekly summaries
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  SETTINGS: 'bookie_notification_settings',
  HISTORY: 'bookie_notification_history',
  DIGEST: 'bookie_digest_settings'
};

export const NotificationTypes = {
  GOLDEN_PICK: 'golden_pick',
  HIGH_CONFIDENCE_PICK: 'high_confidence_pick',
  SHARP_ALERT: 'sharp_alert',
  LINE_MOVE: 'line_move',
  INJURY_UPDATE: 'injury_update',
  BET_RESULT: 'bet_result',
  GAME_START: 'game_start',
  SYSTEM: 'system'
};

export const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Icon mappings for notification types
const NotificationIcons = {
  [NotificationTypes.GOLDEN_PICK]: '🌟',
  [NotificationTypes.HIGH_CONFIDENCE_PICK]: '🎯',
  [NotificationTypes.SHARP_ALERT]: '💰',
  [NotificationTypes.LINE_MOVE]: '📈',
  [NotificationTypes.INJURY_UPDATE]: '🏥',
  [NotificationTypes.BET_RESULT]: '🎲',
  [NotificationTypes.GAME_START]: '⏰',
  [NotificationTypes.SYSTEM]: '🔔'
};

// Color mappings for notification types
const NotificationColors = {
  [NotificationTypes.GOLDEN_PICK]: '#FFD700',
  [NotificationTypes.HIGH_CONFIDENCE_PICK]: '#00FF88',
  [NotificationTypes.SHARP_ALERT]: '#00D4FF',
  [NotificationTypes.LINE_MOVE]: '#A855F7',
  [NotificationTypes.INJURY_UPDATE]: '#FF6B6B',
  [NotificationTypes.BET_RESULT]: '#F97316',
  [NotificationTypes.GAME_START]: '#6b7280',
  [NotificationTypes.SYSTEM]: '#9ca3af'
};

// ============================================================================
// BROWSER NOTIFICATION API
// ============================================================================

/**
 * Check if browser notifications are supported
 */
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Request notification permission from user
 */
export const requestPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get current permission status
 */
export const getPermissionStatus = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
};

/**
 * Send a browser notification
 */
export const sendBrowserNotification = (title, options = {}) => {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  // Check quiet hours
  if (isQuietHours()) return null;

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: options.priority === NotificationPriority.URGENT,
    silent: options.priority === NotificationPriority.LOW,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      if (options.navigateTo) {
        window.location.hash = options.navigateTo;
      }
      notification.close();
    };

    // Auto-close based on priority
    const timeout = options.timeout || (
      options.priority === NotificationPriority.URGENT ? 15000 :
      options.priority === NotificationPriority.HIGH ? 10000 :
      options.priority === NotificationPriority.MEDIUM ? 6000 : 4000
    );

    if (options.autoClose !== false) {
      setTimeout(() => notification.close(), timeout);
    }

    return notification;
  } catch (error) {
    console.error('Error sending browser notification:', error);
    return null;
  }
};

// ============================================================================
// QUIET HOURS
// ============================================================================

/**
 * Check if current time is within quiet hours
 */
export const isQuietHours = () => {
  const settings = getNotificationSettings();
  if (!settings.quietHoursEnabled) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;

  const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
};

/**
 * Get time until quiet hours end
 */
export const getTimeUntilQuietHoursEnd = () => {
  if (!isQuietHours()) return null;

  const settings = getNotificationSettings();
  const now = new Date();
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);

  const endTime = new Date(now);
  endTime.setHours(endHour, endMin, 0, 0);

  if (endTime <= now) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return endTime - now;
};

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * Get notification settings
 */
export const getNotificationSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading notification settings:', error);
  }
  return getDefaultSettings();
};

/**
 * Get default notification settings
 */
const getDefaultSettings = () => ({
  // Master switch
  enabled: false,
  browserNotifications: true,
  inAppNotifications: true,
  soundEnabled: false,

  // By type
  goldenPicks: true,
  highConfidencePicks: true,
  sharpAlerts: true,
  lineMoves: false,
  injuryUpdates: true,
  betResults: true,
  gameStarts: false,
  systemAlerts: true,

  // Thresholds
  minConfidenceThreshold: 75, // Only notify for picks >= this confidence
  minDivergenceThreshold: 25, // Only notify for sharp alerts >= this divergence %
  lineMovementThreshold: 1.5, // Points of line movement to trigger alert

  // Quiet hours
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',

  // Digest preferences
  digestEnabled: false,
  dailyDigestTime: '09:00',
  weeklyDigestDay: 'monday',
  weeklyDigestTime: '10:00'
});

/**
 * Save notification settings
 */
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

/**
 * Check if a specific notification type is enabled
 */
export const isNotificationTypeEnabled = (type) => {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;

  switch (type) {
    case NotificationTypes.GOLDEN_PICK:
      return settings.goldenPicks;
    case NotificationTypes.HIGH_CONFIDENCE_PICK:
      return settings.highConfidencePicks;
    case NotificationTypes.SHARP_ALERT:
      return settings.sharpAlerts;
    case NotificationTypes.LINE_MOVE:
      return settings.lineMoves;
    case NotificationTypes.INJURY_UPDATE:
      return settings.injuryUpdates;
    case NotificationTypes.BET_RESULT:
      return settings.betResults;
    case NotificationTypes.GAME_START:
      return settings.gameStarts;
    case NotificationTypes.SYSTEM:
      return settings.systemAlerts;
    default:
      return false;
  }
};

// ============================================================================
// NOTIFICATION HISTORY
// ============================================================================

/**
 * Add a notification to history
 */
export const addToHistory = (notification) => {
  try {
    const history = getNotificationHistory();

    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      dismissed: false,
      ...notification,
      icon: notification.icon || NotificationIcons[notification.type] || '🔔',
      color: notification.color || NotificationColors[notification.type] || '#00D4FF'
    };

    history.unshift(newNotification);

    // Keep last 200 notifications
    const trimmed = history.slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('notification-added', {
      detail: newNotification
    }));

    return newNotification;
  } catch (error) {
    console.error('Error adding notification to history:', error);
    return null;
  }
};

/**
 * Get notification history
 */
export const getNotificationHistory = (limit = 200) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (stored) {
      return JSON.parse(stored).slice(0, limit);
    }
  } catch (error) {
    console.error('Error reading notification history:', error);
  }
  return [];
};

/**
 * Get unread notification count
 */
export const getUnreadCount = () => {
  const history = getNotificationHistory();
  return history.filter(n => !n.read && !n.dismissed).length;
};

/**
 * Mark notification as read
 */
export const markAsRead = (notificationId) => {
  try {
    const history = getNotificationHistory();
    const index = history.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      history[index].read = true;
      history[index].readAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

      window.dispatchEvent(new CustomEvent('notification-read', {
        detail: { id: notificationId }
      }));
    }
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = () => {
  try {
    const history = getNotificationHistory();
    const now = Date.now();
    history.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = now;
      }
    });
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    window.dispatchEvent(new CustomEvent('notifications-all-read'));
    return true;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return false;
  }
};

/**
 * Dismiss notification
 */
export const dismissNotification = (notificationId) => {
  try {
    const history = getNotificationHistory();
    const index = history.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      history[index].dismissed = true;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
    return true;
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return false;
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('notifications-cleared'));
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

// ============================================================================
// SMART NOTIFICATION DISPATCH
// ============================================================================

/**
 * Send a notification (browser + in-app) with all checks
 */
export const sendNotification = (type, data, options = {}) => {
  const settings = getNotificationSettings();

  // Check if notifications are enabled
  if (!settings.enabled) return null;

  // Check if this type is enabled
  if (!isNotificationTypeEnabled(type)) return null;

  // Check quiet hours
  if (isQuietHours() && options.priority !== NotificationPriority.URGENT) {
    // Still add to history, but don't send browser notification
    return addToHistory({
      type,
      ...data,
      ...options,
      silenced: true
    });
  }

  // Apply threshold checks
  if (type === NotificationTypes.HIGH_CONFIDENCE_PICK || type === NotificationTypes.GOLDEN_PICK) {
    if (data.confidence && data.confidence < settings.minConfidenceThreshold) {
      return null;
    }
  }

  if (type === NotificationTypes.SHARP_ALERT) {
    if (data.divergence && data.divergence < settings.minDivergenceThreshold) {
      return null;
    }
  }

  if (type === NotificationTypes.LINE_MOVE) {
    if (data.movement && Math.abs(data.movement) < settings.lineMovementThreshold) {
      return null;
    }
  }

  // Add to history
  const historyEntry = addToHistory({
    type,
    ...data,
    ...options
  });

  // Send browser notification if enabled
  if (settings.browserNotifications && getPermissionStatus() === 'granted') {
    sendBrowserNotification(data.title || getDefaultTitle(type), {
      body: data.body || data.message,
      priority: options.priority || NotificationPriority.MEDIUM,
      navigateTo: data.navigateTo,
      onClick: options.onClick
    });
  }

  // Play sound if enabled
  if (settings.soundEnabled && options.priority !== NotificationPriority.LOW) {
    playNotificationSound(options.priority);
  }

  return historyEntry;
};

/**
 * Get default title for notification type
 */
const getDefaultTitle = (type) => {
  switch (type) {
    case NotificationTypes.GOLDEN_PICK: return '🌟 Golden Convergence Pick!';
    case NotificationTypes.HIGH_CONFIDENCE_PICK: return '🎯 High-Confidence Pick Available';
    case NotificationTypes.SHARP_ALERT: return '💰 Sharp Money Alert';
    case NotificationTypes.LINE_MOVE: return '📈 Line Movement Alert';
    case NotificationTypes.INJURY_UPDATE: return '🏥 Injury Update';
    case NotificationTypes.BET_RESULT: return '🎲 Bet Result';
    case NotificationTypes.GAME_START: return '⏰ Game Starting Soon';
    case NotificationTypes.SYSTEM: return '🔔 System Notification';
    default: return 'Notification';
  }
};

/**
 * Play notification sound
 */
const playNotificationSound = (priority) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different priorities
    if (priority === NotificationPriority.URGENT) {
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
    } else if (priority === NotificationPriority.HIGH) {
      oscillator.frequency.value = 660;
      gainNode.gain.value = 0.2;
    } else {
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
    }

    oscillator.start();
    setTimeout(() => oscillator.stop(), 150);
  } catch (error) {
    // Silently fail - sound is non-critical
  }
};

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

/**
 * Notify about a new high-confidence pick
 */
export const notifyNewPick = (pick) => {
  const isGolden = pick.tier === 'GOLDEN_CONVERGENCE' || pick.confidence >= 90;
  const type = isGolden ? NotificationTypes.GOLDEN_PICK : NotificationTypes.HIGH_CONFIDENCE_PICK;

  return sendNotification(type, {
    title: isGolden ? '🌟 Golden Convergence Pick!' : '🎯 New High-Confidence Pick',
    body: `${pick.away_team} @ ${pick.home_team}: ${pick.side} ${pick.line} (${pick.confidence}% confidence)`,
    message: `${pick.side} ${pick.line}`,
    confidence: pick.confidence,
    navigateTo: '#smash-spots',
    data: { pick }
  }, {
    priority: isGolden ? NotificationPriority.URGENT : NotificationPriority.HIGH
  });
};

/**
 * Notify about sharp money alert
 */
export const notifySharpMoney = (alert) => {
  return sendNotification(NotificationTypes.SHARP_ALERT, {
    title: '💰 Sharp Money Alert',
    body: `${alert.divergence}% divergence on ${alert.side} - ${alert.game}`,
    message: `${alert.divergence}% divergence`,
    divergence: alert.divergence,
    navigateTo: '#sharp-alerts',
    data: { alert }
  }, {
    priority: alert.divergence >= 30 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM
  });
};

/**
 * Notify about line movement
 */
export const notifyLineMove = (move) => {
  const direction = move.newLine > move.oldLine ? 'up' : 'down';
  const movement = Math.abs(move.newLine - move.oldLine);

  return sendNotification(NotificationTypes.LINE_MOVE, {
    title: '📈 Line Movement Alert',
    body: `${move.game}: ${move.oldLine} → ${move.newLine} (moved ${direction} ${movement.toFixed(1)} pts)`,
    message: `${move.oldLine} → ${move.newLine}`,
    movement,
    navigateTo: '#best-odds',
    data: { move }
  }, {
    priority: movement >= 2 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM
  });
};

/**
 * Notify about injury update
 */
export const notifyInjury = (injury) => {
  return sendNotification(NotificationTypes.INJURY_UPDATE, {
    title: '🏥 Injury Update',
    body: `${injury.player} (${injury.team}): ${injury.status} - ${injury.description}`,
    message: `${injury.player}: ${injury.status}`,
    navigateTo: '#dashboard',
    data: { injury }
  }, {
    priority: injury.isKeyPlayer ? NotificationPriority.HIGH : NotificationPriority.MEDIUM
  });
};

/**
 * Notify about bet result
 */
export const notifyBetResult = (result) => {
  const won = result.result === 'WIN';
  const push = result.result === 'PUSH';

  return sendNotification(NotificationTypes.BET_RESULT, {
    title: won ? '✅ Bet Won!' : push ? '⬜ Push' : '❌ Bet Lost',
    body: `${result.game}: ${result.pick} - ${result.result}${result.pnl ? ` (${result.pnl >= 0 ? '+' : ''}$${result.pnl})` : ''}`,
    message: `${result.pick}: ${result.result}`,
    navigateTo: '#bankroll',
    data: { result }
  }, {
    priority: won ? NotificationPriority.HIGH : NotificationPriority.MEDIUM
  });
};

/**
 * Notify about game starting
 */
export const notifyGameStart = (game) => {
  return sendNotification(NotificationTypes.GAME_START, {
    title: '⏰ Game Starting Soon',
    body: `${game.away_team} @ ${game.home_team} starts in ${game.minutes} minutes`,
    message: `Starts in ${game.minutes} min`,
    navigateTo: '#dashboard',
    data: { game }
  }, {
    priority: game.minutes <= 5 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM
  });
};

/**
 * Send system notification
 */
export const notifySystem = (title, body, priority = NotificationPriority.LOW) => {
  return sendNotification(NotificationTypes.SYSTEM, {
    title,
    body,
    message: body
  }, { priority });
};

// ============================================================================
// DIGEST MODE
// ============================================================================

/**
 * Get digest settings
 */
export const getDigestSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIGEST);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading digest settings:', error);
  }

  return {
    enabled: false,
    dailyDigest: true,
    weeklyDigest: true,
    dailyTime: '09:00',
    weeklyDay: 'monday',
    weeklyTime: '10:00',
    includeStats: true,
    includePicks: true,
    includeSharp: true,
    lastDailyDigest: null,
    lastWeeklyDigest: null
  };
};

/**
 * Save digest settings
 */
export const saveDigestSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIGEST, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving digest settings:', error);
    return false;
  }
};

/**
 * Generate daily digest content
 */
export const generateDailyDigest = (stats) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    title: `📊 Daily Digest - ${yesterday.toLocaleDateString()}`,
    sections: [
      {
        title: 'Performance',
        content: `Record: ${stats.wins}-${stats.losses} | Win Rate: ${stats.winRate}% | P/L: ${stats.pnl >= 0 ? '+' : ''}$${stats.pnl}`
      },
      {
        title: 'Best Pick',
        content: stats.bestPick ? `${stats.bestPick.pick} (${stats.bestPick.result})` : 'No picks yesterday'
      },
      {
        title: 'Sharp Money Alerts',
        content: `${stats.sharpAlerts} alerts triggered`
      },
      {
        title: 'Today\'s Outlook',
        content: `${stats.upcomingPicks} potential picks across ${stats.upcomingGames} games`
      }
    ]
  };
};

/**
 * Generate weekly digest content
 */
export const generateWeeklyDigest = (stats) => {
  return {
    title: `📈 Weekly Performance Report`,
    sections: [
      {
        title: 'Week Summary',
        content: `Record: ${stats.wins}-${stats.losses} | Win Rate: ${stats.winRate}% | ROI: ${stats.roi}%`
      },
      {
        title: 'Bankroll Change',
        content: `${stats.bankrollChange >= 0 ? '+' : ''}$${stats.bankrollChange} (${stats.bankrollChangePercent}%)`
      },
      {
        title: 'Best Performing Sport',
        content: stats.bestSport ? `${stats.bestSport.name}: ${stats.bestSport.winRate}% win rate` : 'N/A'
      },
      {
        title: 'Signal Performance',
        content: stats.topSignal ? `Best signal: ${stats.topSignal.name} (${stats.topSignal.winRate}%)` : 'N/A'
      },
      {
        title: 'Key Insights',
        content: stats.insights?.join('; ') || 'Keep tracking for personalized insights'
      }
    ]
  };
};

/**
 * Check and send scheduled digests
 */
export const checkScheduledDigests = (statsProvider) => {
  const settings = getDigestSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

  // Check daily digest
  if (settings.dailyDigest && currentTime === settings.dailyTime) {
    const lastDaily = settings.lastDailyDigest ? new Date(settings.lastDailyDigest) : null;
    if (!lastDaily || lastDaily.toDateString() !== now.toDateString()) {
      const stats = statsProvider?.getDailyStats?.() || {};
      const digest = generateDailyDigest(stats);
      notifySystem(digest.title, digest.sections.map(s => `${s.title}: ${s.content}`).join(' | '));
      saveDigestSettings({ ...settings, lastDailyDigest: now.toISOString() });
    }
  }

  // Check weekly digest
  if (settings.weeklyDigest && currentDay === settings.weeklyDay && currentTime === settings.weeklyTime) {
    const lastWeekly = settings.lastWeeklyDigest ? new Date(settings.lastWeeklyDigest) : null;
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    if (!lastWeekly || lastWeekly < weekAgo) {
      const stats = statsProvider?.getWeeklyStats?.() || {};
      const digest = generateWeeklyDigest(stats);
      notifySystem(digest.title, digest.sections.map(s => `${s.title}: ${s.content}`).join(' | '), NotificationPriority.HIGH);
      saveDigestSettings({ ...settings, lastWeeklyDigest: now.toISOString() });
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get notifications grouped by date
 */
export const getNotificationsGroupedByDate = () => {
  const history = getNotificationHistory();
  const groups = {};

  history.forEach(notif => {
    const date = new Date(notif.timestamp);
    const key = date.toDateString();

    if (!groups[key]) {
      groups[key] = {
        date: key,
        isToday: key === new Date().toDateString(),
        isYesterday: key === new Date(Date.now() - 86400000).toDateString(),
        notifications: []
      };
    }

    groups[key].notifications.push(notif);
  });

  return Object.values(groups).sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );
};

/**
 * Filter notifications by type
 */
export const filterNotificationsByType = (type) => {
  const history = getNotificationHistory();
  return history.filter(n => n.type === type);
};

/**
 * Get notification statistics
 */
export const getNotificationStats = () => {
  const history = getNotificationHistory();
  const now = Date.now();
  const dayAgo = now - 86400000;
  const weekAgo = now - 604800000;

  return {
    total: history.length,
    unread: history.filter(n => !n.read).length,
    today: history.filter(n => n.timestamp > dayAgo).length,
    thisWeek: history.filter(n => n.timestamp > weekAgo).length,
    byType: Object.keys(NotificationTypes).reduce((acc, type) => {
      acc[type] = history.filter(n => n.type === NotificationTypes[type]).length;
      return acc;
    }, {})
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Constants
  NotificationTypes,
  NotificationPriority,
  NotificationIcons,
  NotificationColors,

  // Browser API
  isNotificationSupported,
  requestPermission,
  getPermissionStatus,
  sendBrowserNotification,

  // Quiet hours
  isQuietHours,
  getTimeUntilQuietHoursEnd,

  // Settings
  getNotificationSettings,
  saveNotificationSettings,
  isNotificationTypeEnabled,

  // History
  addToHistory,
  getNotificationHistory,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearAllNotifications,

  // Smart dispatch
  sendNotification,

  // Templates
  notifyNewPick,
  notifySharpMoney,
  notifyLineMove,
  notifyInjury,
  notifyBetResult,
  notifyGameStart,
  notifySystem,

  // Digest
  getDigestSettings,
  saveDigestSettings,
  generateDailyDigest,
  generateWeeklyDigest,
  checkScheduledDigests,

  // Helpers
  getNotificationsGroupedByDate,
  filterNotificationsByType,
  getNotificationStats
};
