/**
 * BROWSER NOTIFICATION SUPPORT
 *
 * Enables push notifications for high-conviction picks,
 * sharp money alerts, and important system events.
 */

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Request notification permission
export const requestPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
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

// Check current permission status
export const getPermissionStatus = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    // Auto-close after timeout
    if (options.autoClose !== false) {
      setTimeout(() => notification.close(), options.timeout || 8000);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

/**
 * Notification templates for different events
 */
export const NotificationTypes = {
  GOLDEN_PICK: 'golden_pick',
  SHARP_ALERT: 'sharp_alert',
  LINE_MOVE: 'line_move',
  GAME_START: 'game_start',
  RESULT: 'result'
};

// Pre-built notification templates
export const notifyGoldenPick = (pickInfo) => {
  return sendNotification('Golden Convergence Pick!', {
    body: `${pickInfo.away_team} @ ${pickInfo.home_team}: ${pickInfo.side} ${pickInfo.line}`,
    tag: 'golden-pick',
    icon: '/golden-icon.png',
    data: { type: NotificationTypes.GOLDEN_PICK, pickInfo }
  });
};

export const notifySharpMoney = (alertInfo) => {
  return sendNotification('Sharp Money Alert!', {
    body: `${alertInfo.divergence}% divergence on ${alertInfo.side} - ${alertInfo.game}`,
    tag: 'sharp-alert',
    icon: '/sharp-icon.png',
    data: { type: NotificationTypes.SHARP_ALERT, alertInfo }
  });
};

export const notifyLineMove = (moveInfo) => {
  return sendNotification('Significant Line Move', {
    body: `${moveInfo.game}: ${moveInfo.old_line} -> ${moveInfo.new_line} (${moveInfo.direction})`,
    tag: 'line-move',
    data: { type: NotificationTypes.LINE_MOVE, moveInfo }
  });
};

export const notifyGameStart = (gameInfo) => {
  return sendNotification('Game Starting Soon', {
    body: `${gameInfo.away_team} @ ${gameInfo.home_team} starts in ${gameInfo.minutes} minutes`,
    tag: `game-${gameInfo.id}`,
    data: { type: NotificationTypes.GAME_START, gameInfo }
  });
};

export const notifyResult = (resultInfo) => {
  const won = resultInfo.result === 'WIN';
  return sendNotification(won ? 'Pick Won!' : 'Pick Lost', {
    body: `${resultInfo.pick}: ${resultInfo.result}`,
    tag: `result-${resultInfo.id}`,
    icon: won ? '/win-icon.png' : '/loss-icon.png',
    data: { type: NotificationTypes.RESULT, resultInfo }
  });
};

/**
 * Notification settings storage
 */
const SETTINGS_KEY = 'bookie_notification_settings';

export const getNotificationSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading notification settings:', error);
  }

  // Default settings
  return {
    enabled: false,
    goldenPicks: true,
    sharpAlerts: true,
    lineMoves: false,
    gameStarts: false,
    results: true
  };
};

export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

/**
 * Check if a specific notification type is enabled
 */
export const isNotificationEnabled = (type) => {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;

  switch (type) {
    case NotificationTypes.GOLDEN_PICK:
      return settings.goldenPicks;
    case NotificationTypes.SHARP_ALERT:
      return settings.sharpAlerts;
    case NotificationTypes.LINE_MOVE:
      return settings.lineMoves;
    case NotificationTypes.GAME_START:
      return settings.gameStarts;
    case NotificationTypes.RESULT:
      return settings.results;
    default:
      return false;
  }
};

/**
 * Smart notification - only sends if enabled and permitted
 */
export const smartNotify = (type, data) => {
  if (getPermissionStatus() !== 'granted') return null;
  if (!isNotificationEnabled(type)) return null;

  switch (type) {
    case NotificationTypes.GOLDEN_PICK:
      return notifyGoldenPick(data);
    case NotificationTypes.SHARP_ALERT:
      return notifySharpMoney(data);
    case NotificationTypes.LINE_MOVE:
      return notifyLineMove(data);
    case NotificationTypes.GAME_START:
      return notifyGameStart(data);
    case NotificationTypes.RESULT:
      return notifyResult(data);
    default:
      return null;
  }
};

export default {
  isNotificationSupported,
  requestPermission,
  getPermissionStatus,
  sendNotification,
  NotificationTypes,
  notifyGoldenPick,
  notifySharpMoney,
  notifyLineMove,
  notifyGameStart,
  notifyResult,
  getNotificationSettings,
  saveNotificationSettings,
  isNotificationEnabled,
  smartNotify
};
