/**
 * ANALYTICS MODULE
 *
 * Google Analytics 4 integration with custom event tracking.
 * Tracks page views, user actions, and app performance.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export function initAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.log('Google Analytics not configured - tracking disabled');
    return;
  }

  // Only initialize in production
  if (import.meta.env.DEV) {
    console.log('Analytics disabled in development');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually for SPA
  });
}

// Track page view (call on route change)
export function trackPageView(path, title) {
  if (!window.gtag) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view:', path, title);
    }
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

// Track custom events
export function trackEvent(eventName, params = {}) {
  if (!window.gtag) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Event:', eventName, params);
    }
    return;
  }

  window.gtag('event', eventName, params);
}

// ============================================
// PRE-DEFINED EVENT TRACKING FUNCTIONS
// ============================================

// Bet Tracking Events
export const BetEvents = {
  viewPick: (sport, pickType, confidence) => {
    trackEvent('view_pick', { sport, pick_type: pickType, confidence });
  },

  addToBetSlip: (sport, pickType, odds) => {
    trackEvent('add_to_betslip', { sport, pick_type: pickType, odds });
  },

  removeFromBetSlip: (pickId) => {
    trackEvent('remove_from_betslip', { pick_id: pickId });
  },

  placeBet: (sport, betType, odds, stake) => {
    trackEvent('place_bet', { sport, bet_type: betType, odds, stake });
  },

  gradeBet: (betId, outcome) => {
    trackEvent('grade_bet', { bet_id: betId, outcome });
  },
};

// Parlay Events
export const ParlayEvents = {
  addLeg: (sport, legType, odds) => {
    trackEvent('parlay_add_leg', { sport, leg_type: legType, odds });
  },

  removeLeg: (legId) => {
    trackEvent('parlay_remove_leg', { leg_id: legId });
  },

  calculate: (legCount, combinedOdds) => {
    trackEvent('parlay_calculate', { leg_count: legCount, combined_odds: combinedOdds });
  },

  place: (legCount, stake, potentialPayout) => {
    trackEvent('parlay_place', { leg_count: legCount, stake, potential_payout: potentialPayout });
  },

  clear: () => {
    trackEvent('parlay_clear');
  },
};

// Feature Usage Events
export const FeatureEvents = {
  changeSport: (sport) => {
    trackEvent('change_sport', { sport });
  },

  changeTab: (tabName) => {
    trackEvent('change_tab', { tab: tabName });
  },

  toggleTheme: (theme) => {
    trackEvent('toggle_theme', { theme });
  },

  openBetslipModal: (pickId) => {
    trackEvent('open_betslip_modal', { pick_id: pickId });
  },

  clickSportsbook: (sportsbook, sport) => {
    trackEvent('click_sportsbook', { sportsbook, sport });
  },

  viewEsoteric: (signalType) => {
    trackEvent('view_esoteric', { signal_type: signalType });
  },

  useMatchupAnalyzer: (homeTeam, awayTeam) => {
    trackEvent('use_matchup_analyzer', { home_team: homeTeam, away_team: awayTeam });
  },
};

// Achievement/Gamification Events
export const GamificationEvents = {
  levelUp: (newLevel) => {
    trackEvent('level_up', { level: newLevel });
  },

  earnXP: (amount, source) => {
    trackEvent('earn_xp', { amount, source });
  },

  unlockAchievement: (achievementId, achievementName) => {
    trackEvent('unlock_achievement', { achievement_id: achievementId, name: achievementName });
  },
};

// Error Events (supplement Sentry)
export const ErrorEvents = {
  apiError: (endpoint, statusCode) => {
    trackEvent('api_error', { endpoint, status_code: statusCode });
  },

  componentError: (componentName) => {
    trackEvent('component_error', { component: componentName });
  },
};

// Performance Events
export const PerformanceEvents = {
  appLoaded: (loadTimeMs) => {
    trackEvent('app_loaded', { load_time_ms: loadTimeMs });
  },

  routeLoaded: (route, loadTimeMs) => {
    trackEvent('route_loaded', { route, load_time_ms: loadTimeMs });
  },
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  BetEvents,
  ParlayEvents,
  FeatureEvents,
  GamificationEvents,
  ErrorEvents,
  PerformanceEvents,
};
