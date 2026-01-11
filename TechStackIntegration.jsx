import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';

// ============================================================================
// TECH STACK INTEGRATION - Professional Library Integration Patterns
// Provides adapters and configurations for recommended libraries
// ============================================================================

// ============================================================================
// INSTALLATION COMMANDS
// ============================================================================

/*
npm install @tanstack/react-query @tanstack/react-table zustand
npm install recharts framer-motion
npm install react-toastify tippy.js @tippyjs/react
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install @sentry/react posthog-js
npm install vitest @testing-library/react @testing-library/jest-dom
*/

// ============================================================================
// 1. REACT QUERY CONFIGURATION
// Replace custom useQuery hook with TanStack Query
// ============================================================================

// React Query Client Configuration
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

// Query Keys Factory - Type-safe query key management
export const queryKeys = {
  all: ['bookie'] as const,

  // Picks
  picks: () => [...queryKeys.all, 'picks'] as const,
  picksBySport: (sport) => [...queryKeys.picks(), sport] as const,
  pickDetail: (id) => [...queryKeys.picks(), 'detail', id] as const,

  // Sharp Money
  sharpMoney: () => [...queryKeys.all, 'sharp'] as const,
  sharpBySport: (sport) => [...queryKeys.sharpMoney(), sport] as const,

  // Injuries
  injuries: () => [...queryKeys.all, 'injuries'] as const,
  injuriesByTeam: (team) => [...queryKeys.injuries(), team] as const,

  // Performance
  performance: () => [...queryKeys.all, 'performance'] as const,
  performanceByRange: (range) => [...queryKeys.performance(), range] as const,

  // Community
  community: () => [...queryKeys.all, 'community'] as const,
  leaderboard: () => [...queryKeys.community(), 'leaderboard'] as const,
  consensus: (pickId) => [...queryKeys.community(), 'consensus', pickId] as const,

  // User
  user: () => [...queryKeys.all, 'user'] as const,
  userProfile: () => [...queryKeys.user(), 'profile'] as const,
  userBets: () => [...queryKeys.user(), 'bets'] as const,
  userBankroll: () => [...queryKeys.user(), 'bankroll'] as const,
};

// Custom hooks using React Query pattern
export const createQueryHooks = (useQuery, useMutation, useQueryClient) => ({
  // Picks
  usePicks: (sport, options = {}) =>
    useQuery({
      queryKey: queryKeys.picksBySport(sport),
      queryFn: () => fetch(`/api/picks/${sport}`).then(r => r.json()),
      ...options
    }),

  // Sharp Money
  useSharpMoney: (sport, options = {}) =>
    useQuery({
      queryKey: queryKeys.sharpBySport(sport),
      queryFn: () => fetch(`/api/sharp/${sport}`).then(r => r.json()),
      refetchInterval: 30000, // 30 seconds for live data
      ...options
    }),

  // Injuries
  useInjuries: (sport, options = {}) =>
    useQuery({
      queryKey: queryKeys.injuries(),
      queryFn: () => fetch(`/api/injuries/${sport}`).then(r => r.json()),
      ...options
    }),

  // Performance
  usePerformance: (range = '30d', options = {}) =>
    useQuery({
      queryKey: queryKeys.performanceByRange(range),
      queryFn: () => fetch(`/api/performance?range=${range}`).then(r => r.json()),
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options
    }),

  // Mutations
  usePlaceBet: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (bet) => fetch('/api/bets', {
        method: 'POST',
        body: JSON.stringify(bet)
      }).then(r => r.json()),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBets() });
        queryClient.invalidateQueries({ queryKey: queryKeys.userBankroll() });
      }
    });
  },

  useVoteOnPick: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ pickId, vote }) => fetch(`/api/picks/${pickId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote })
      }).then(r => r.json()),
      onSuccess: (_, { pickId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.consensus(pickId) });
      }
    });
  }
});

// ============================================================================
// 2. ZUSTAND STORE PATTERNS
// Global UI state management
// ============================================================================

// Store creator factory (to be used with zustand's create)
export const createUIStore = (set, get) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Active Sport
  activeSport: 'NFL',
  setActiveSport: (sport) => set({ activeSport: sport }),

  // Modals
  modals: {},
  openModal: (id, data = null) => set((state) => ({
    modals: { ...state.modals, [id]: { isOpen: true, data } }
  })),
  closeModal: (id) => set((state) => ({
    modals: { ...state.modals, [id]: { isOpen: false, data: null } }
  })),
  isModalOpen: (id) => get().modals[id]?.isOpen || false,

  // Notifications Panel
  notificationsPanelOpen: false,
  setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),

  // Search
  searchOpen: false,
  searchQuery: '',
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filters
  activeFilters: {},
  setFilter: (key, value) => set((state) => ({
    activeFilters: { ...state.activeFilters, [key]: value }
  })),
  clearFilters: () => set({ activeFilters: {} }),
});

export const createBankrollStore = (set, get) => ({
  bankroll: 1000,
  unitSize: 10,
  bets: [],

  setBankroll: (amount) => set({ bankroll: amount }),
  setUnitSize: (size) => set({ unitSize: size }),

  addBet: (bet) => set((state) => ({
    bets: [...state.bets, { ...bet, id: Date.now(), timestamp: new Date() }]
  })),

  settleBet: (betId, result) => set((state) => {
    const bet = state.bets.find(b => b.id === betId);
    if (!bet) return state;

    const payout = result === 'win'
      ? bet.stake * (bet.odds > 0 ? bet.odds / 100 : 100 / Math.abs(bet.odds))
      : -bet.stake;

    return {
      bets: state.bets.map(b =>
        b.id === betId ? { ...b, result, payout, settledAt: new Date() } : b
      ),
      bankroll: state.bankroll + payout + (result === 'win' ? bet.stake : 0)
    };
  }),

  getStats: () => {
    const bets = get().bets.filter(b => b.result);
    const wins = bets.filter(b => b.result === 'win').length;
    const totalProfit = bets.reduce((sum, b) => sum + (b.payout || 0), 0);

    return {
      totalBets: bets.length,
      wins,
      losses: bets.length - wins,
      winRate: bets.length > 0 ? (wins / bets.length * 100) : 0,
      totalProfit,
      roi: bets.length > 0
        ? (totalProfit / bets.reduce((sum, b) => sum + b.stake, 0) * 100)
        : 0
    };
  }
});

export const createNotificationStore = (set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => set((state) => ({
    notifications: [
      { ...notification, id: Date.now(), read: false, timestamp: new Date() },
      ...state.notifications
    ].slice(0, 100),
    unreadCount: state.unreadCount + 1
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 })
});

// ============================================================================
// 3. FRAMER MOTION ANIMATION PRESETS
// Reusable animation configurations
// ============================================================================

export const motionPresets = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  },

  // Scale
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },

  // Card hover
  cardHover: {
    whileHover: { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },

  // Button press
  buttonPress: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  },

  // Modal
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },

  // Drawer
  drawerLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  drawerRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Toast
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    transition: { duration: 0.3 }
  },

  // Confetti
  confetti: (i) => ({
    initial: { opacity: 1, y: 0, rotate: 0 },
    animate: {
      opacity: [1, 1, 0],
      y: [0, -100 - Math.random() * 100, 200],
      x: (Math.random() - 0.5) * 200,
      rotate: Math.random() * 720 - 360
    },
    transition: { duration: 1.5 + Math.random() * 0.5, ease: 'easeOut' }
  }),

  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  },

  // Shake
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    }
  }
};

// Animated components factory for Framer Motion
export const createAnimatedComponents = (motion) => ({
  AnimatedCard: ({ children, ...props }) => (
    <motion.div {...motionPresets.cardHover} {...props}>
      {children}
    </motion.div>
  ),

  AnimatedButton: ({ children, ...props }) => (
    <motion.button {...motionPresets.buttonPress} {...props}>
      {children}
    </motion.button>
  ),

  AnimatedPage: ({ children, ...props }) => (
    <motion.div {...motionPresets.pageTransition} {...props}>
      {children}
    </motion.div>
  ),

  AnimatedModal: ({ isOpen, onClose, children }) => (
    <>
      {isOpen && (
        <>
          <motion.div
            {...motionPresets.modalOverlay}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 999
            }}
          />
          <motion.div
            {...motionPresets.modalContent}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </>
  ),

  AnimatedList: ({ items, renderItem }) => (
    <motion.div {...motionPresets.staggerContainer} animate="animate">
      {items.map((item, i) => (
        <motion.div key={item.id || i} {...motionPresets.staggerItem}>
          {renderItem(item, i)}
        </motion.div>
      ))}
    </motion.div>
  )
});

// ============================================================================
// 4. RECHARTS CONFIGURATION
// Chart theme and common configurations
// ============================================================================

export const chartTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#a855f7',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#fbbf24',
    neutral: '#64748b',
    grid: '#334155',
    background: '#1e293b',
    text: '#94a3b8'
  },

  fonts: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    size: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16
    }
  }
};

export const chartDefaults = {
  margin: { top: 20, right: 30, bottom: 20, left: 30 },

  xAxis: {
    axisLine: { stroke: chartTheme.colors.grid },
    tickLine: { stroke: chartTheme.colors.grid },
    tick: { fill: chartTheme.colors.text, fontSize: chartTheme.fonts.size.sm }
  },

  yAxis: {
    axisLine: { stroke: chartTheme.colors.grid },
    tickLine: { stroke: chartTheme.colors.grid },
    tick: { fill: chartTheme.colors.text, fontSize: chartTheme.fonts.size.sm }
  },

  grid: {
    strokeDasharray: '3 3',
    stroke: chartTheme.colors.grid
  },

  tooltip: {
    contentStyle: {
      background: chartTheme.colors.background,
      border: `1px solid ${chartTheme.colors.grid}`,
      borderRadius: 8,
      color: chartTheme.colors.text
    }
  },

  legend: {
    wrapperStyle: {
      color: chartTheme.colors.text
    }
  }
};

// Chart presets for common use cases
export const chartPresets = {
  performanceChart: {
    type: 'area',
    dataKey: 'profit',
    stroke: chartTheme.colors.success,
    fill: `${chartTheme.colors.success}33`,
    strokeWidth: 2
  },

  winRateChart: {
    type: 'bar',
    dataKeys: ['wins', 'losses'],
    colors: [chartTheme.colors.success, chartTheme.colors.danger]
  },

  oddsDistribution: {
    type: 'pie',
    colors: [
      chartTheme.colors.primary,
      chartTheme.colors.secondary,
      chartTheme.colors.success,
      chartTheme.colors.warning
    ]
  },

  sportBreakdown: {
    type: 'radar',
    stroke: chartTheme.colors.primary,
    fill: `${chartTheme.colors.primary}44`
  }
};

// ============================================================================
// 5. REACT HOOK FORM + ZOD SCHEMAS
// Form validation schemas
// ============================================================================

// Zod schemas for forms (to be used with zod)
export const formSchemas = {
  // Bet placement
  placeBet: `
    z.object({
      pickId: z.string(),
      stake: z.number().min(0.5).max(100),
      odds: z.number(),
      betType: z.enum(['spread', 'moneyline', 'total', 'prop']),
      notes: z.string().optional()
    })
  `,

  // Bankroll setup
  bankrollSetup: `
    z.object({
      startingBankroll: z.number().min(100).max(1000000),
      unitSize: z.number().min(0.5).max(10),
      riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
      kellyFraction: z.number().min(0.1).max(1)
    })
  `,

  // User profile
  userProfile: `
    z.object({
      displayName: z.string().min(2).max(50),
      email: z.string().email(),
      favoriteTeams: z.array(z.string()).max(10),
      favoriteSportsbooks: z.array(z.string()).max(5),
      notificationPreferences: z.object({
        sharpMoney: z.boolean(),
        lineMoves: z.boolean(),
        injuries: z.boolean(),
        dailyRecap: z.boolean()
      })
    })
  `,

  // Grading
  gradePick: `
    z.object({
      pickId: z.string(),
      grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']),
      notes: z.string().max(500).optional(),
      tags: z.array(z.string()).max(5),
      categories: z.array(z.string())
    })
  `
};

// Form default values
export const formDefaults = {
  placeBet: {
    stake: 1,
    betType: 'spread',
    notes: ''
  },

  bankrollSetup: {
    startingBankroll: 1000,
    unitSize: 1,
    riskTolerance: 'moderate',
    kellyFraction: 0.5
  },

  userProfile: {
    favoriteTeams: [],
    favoriteSportsbooks: [],
    notificationPreferences: {
      sharpMoney: true,
      lineMoves: true,
      injuries: true,
      dailyRecap: false
    }
  }
};

// ============================================================================
// 6. REACT TOASTIFY CONFIGURATION
// ============================================================================

export const toastConfig = {
  position: 'bottom-right',
  autoClose: 4000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'dark',

  // Custom styles to match our theme
  style: {
    background: '#1e293b',
    color: '#f1f5f9',
    borderRadius: '12px',
    border: '1px solid #334155'
  }
};

// Toast presets
export const toastPresets = {
  betPlaced: (bet) => ({
    type: 'success',
    message: `Bet placed: ${bet.team} ${bet.spread || bet.line}`,
    icon: '✅'
  }),

  betWon: (bet) => ({
    type: 'success',
    message: `Winner! ${bet.team} +$${bet.profit.toFixed(2)}`,
    icon: '🎉'
  }),

  betLost: (bet) => ({
    type: 'error',
    message: `Lost: ${bet.team} -$${Math.abs(bet.loss).toFixed(2)}`,
    icon: '😔'
  }),

  sharpAlert: (alert) => ({
    type: 'info',
    message: `🦈 Sharp money on ${alert.team}`,
    icon: '🦈'
  }),

  lineMove: (move) => ({
    type: 'warning',
    message: `Line moved: ${move.team} ${move.old} → ${move.new}`,
    icon: '📉'
  }),

  injuryUpdate: (injury) => ({
    type: 'warning',
    message: `🏥 ${injury.player} (${injury.team}) - ${injury.status}`,
    icon: '🏥'
  })
};

// ============================================================================
// 7. TIPPY.JS TOOLTIP CONFIGURATION
// ============================================================================

export const tippyDefaults = {
  theme: 'bookie',
  animation: 'shift-away',
  duration: [200, 150],
  delay: [100, 0],
  arrow: true,
  placement: 'top',
  interactive: false,
  appendTo: () => document.body
};

// Custom Tippy theme CSS (add to global styles)
export const tippyThemeCSS = `
  .tippy-box[data-theme~='bookie'] {
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid #334155;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .tippy-box[data-theme~='bookie'] .tippy-arrow::before {
    border-top-color: #1e293b;
  }

  .tippy-box[data-theme~='bookie'][data-placement^='bottom'] .tippy-arrow::before {
    border-bottom-color: #1e293b;
  }

  .tippy-box[data-theme~='bookie'][data-placement^='left'] .tippy-arrow::before {
    border-left-color: #1e293b;
  }

  .tippy-box[data-theme~='bookie'][data-placement^='right'] .tippy-arrow::before {
    border-right-color: #1e293b;
  }
`;

// Tooltip content presets
export const tooltipContent = {
  clv: {
    title: 'Closing Line Value',
    content: 'Difference between your bet odds and the closing odds. Positive CLV indicates you beat the market.'
  },
  sharp: {
    title: 'Sharp Money',
    content: 'Bets from professional/winning bettors. High sharp % often signals smart money on a side.'
  },
  kelly: {
    title: 'Kelly Criterion',
    content: 'Mathematical formula for optimal bet sizing based on edge and odds.'
  },
  steam: {
    title: 'Steam Move',
    content: 'Sudden, significant line movement across multiple sportsbooks simultaneously.'
  },
  rlm: {
    title: 'Reverse Line Movement',
    content: 'Line moves opposite to public betting percentage, indicating sharp action.'
  },
  unit: {
    title: 'Unit',
    content: 'Standard bet size. 1 unit = 1% of bankroll is a conservative approach.'
  },
  roi: {
    title: 'Return on Investment',
    content: 'Total profit divided by total amount wagered, expressed as percentage.'
  },
  push: {
    title: 'Push',
    content: 'Bet results in a tie. Original stake is returned, no win or loss.'
  }
};

// ============================================================================
// 8. LUCIDE ICONS MAPPING
// Map our emoji icons to Lucide equivalents
// ============================================================================

export const iconMapping = {
  // Navigation
  '🏠': 'Home',
  '🎯': 'Target',
  '🦈': 'Fish',
  '💰': 'DollarSign',
  '🏥': 'Hospital',
  '📊': 'BarChart3',
  '💵': 'Wallet',
  '👥': 'Users',
  '🔮': 'Sparkles',
  '📈': 'TrendingUp',
  '🎓': 'GraduationCap',
  '⚙️': 'Settings',
  '🔔': 'Bell',

  // Actions
  '✓': 'Check',
  '✗': 'X',
  '➕': 'Plus',
  '➖': 'Minus',
  '🔍': 'Search',
  '📝': 'Edit',
  '🗑️': 'Trash2',
  '📋': 'Clipboard',
  '🔗': 'Link',

  // Status
  '✅': 'CheckCircle',
  '❌': 'XCircle',
  '⚠️': 'AlertTriangle',
  'ℹ️': 'Info',
  '🔥': 'Flame',
  '❄️': 'Snowflake',

  // Sports
  '🏈': 'Circle', // Use custom SVG for football
  '🏀': 'Circle', // Use custom SVG for basketball
  '⚾': 'Circle', // Use custom SVG for baseball
  '🏒': 'Circle', // Use custom SVG for hockey

  // Misc
  '📅': 'Calendar',
  '⏰': 'Clock',
  '📉': 'TrendingDown',
  '🔄': 'RefreshCw',
  '📤': 'Upload',
  '📥': 'Download'
};

// ============================================================================
// 9. DATE-FNS HELPERS
// Common date formatting utilities
// ============================================================================

export const dateHelpers = {
  // Format game time
  formatGameTime: (date) => {
    // format(new Date(date), 'EEE, MMM d • h:mm a')
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  // Relative time (e.g., "2 hours ago")
  formatRelative: (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  },

  // Format date range
  formatDateRange: (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const sameMonth = s.getMonth() === e.getMonth();
    const sameYear = s.getFullYear() === e.getFullYear();

    if (sameMonth && sameYear) {
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  },

  // Is today
  isToday: (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  // Is this week
  isThisWeek: (date) => {
    const d = new Date(date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart;
  }
};

// ============================================================================
// 10. SENTRY & ANALYTICS CONFIGURATION
// ============================================================================

export const sentryConfig = {
  dsn: process.env.REACT_APP_SENTRY_DSN || '',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    // Add browser tracing, replay, etc.
  ],
  beforeSend(event) {
    // Filter out certain errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  }
};

export const analyticsEvents = {
  // Page views
  PAGE_VIEW: 'page_view',

  // User actions
  BET_PLACED: 'bet_placed',
  BET_SETTLED: 'bet_settled',
  PICK_VIEWED: 'pick_viewed',
  PICK_VOTED: 'pick_voted',
  FILTER_APPLIED: 'filter_applied',
  SEARCH_PERFORMED: 'search_performed',

  // Features
  FEATURE_USED: 'feature_used',
  CALCULATOR_USED: 'calculator_used',
  EXPORT_COMPLETED: 'export_completed',

  // Engagement
  SESSION_STARTED: 'session_started',
  NOTIFICATION_CLICKED: 'notification_clicked',
  SHARE_COMPLETED: 'share_completed'
};

export const trackEvent = (eventName, properties = {}) => {
  // PostHog
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, properties);
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties);
  }
};

// ============================================================================
// 11. TANSTACK TABLE CONFIGURATION
// ============================================================================

export const tableDefaults = {
  // Default column settings
  defaultColumn: {
    size: 150,
    minSize: 50,
    maxSize: 500
  },

  // Enable features
  enableSorting: true,
  enableFiltering: true,
  enableColumnResizing: true,
  enableRowSelection: false,
  enablePagination: true,

  // Pagination
  initialState: {
    pagination: {
      pageSize: 25
    }
  }
};

// Column helpers for common data types
export const columnHelpers = {
  // Team column
  team: (accessorKey = 'team') => ({
    accessorKey,
    header: 'Team',
    cell: ({ getValue }) => getValue()
  }),

  // Odds column
  odds: (accessorKey = 'odds') => ({
    accessorKey,
    header: 'Odds',
    cell: ({ getValue }) => {
      const v = getValue();
      return v > 0 ? `+${v}` : v;
    }
  }),

  // Spread column
  spread: (accessorKey = 'spread') => ({
    accessorKey,
    header: 'Spread',
    cell: ({ getValue }) => {
      const v = getValue();
      return v > 0 ? `+${v}` : v;
    }
  }),

  // Money column
  money: (accessorKey, header = 'Amount') => ({
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const v = getValue();
      return `$${v.toFixed(2)}`;
    }
  }),

  // Percentage column
  percent: (accessorKey, header = '%') => ({
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const v = getValue();
      return `${v.toFixed(1)}%`;
    }
  }),

  // Date column
  date: (accessorKey = 'date', header = 'Date') => ({
    accessorKey,
    header,
    cell: ({ getValue }) => dateHelpers.formatRelative(getValue())
  }),

  // Status column
  status: (accessorKey = 'status') => ({
    accessorKey,
    header: 'Status',
    cell: ({ getValue }) => {
      const v = getValue();
      const colors = {
        win: '#22c55e',
        loss: '#ef4444',
        push: '#fbbf24',
        pending: '#64748b'
      };
      return (
        <span style={{ color: colors[v] || colors.pending }}>
          {v.toUpperCase()}
        </span>
      );
    }
  })
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  queryClientConfig,
  queryKeys,
  createQueryHooks,
  createUIStore,
  createBankrollStore,
  createNotificationStore,
  motionPresets,
  createAnimatedComponents,
  chartTheme,
  chartDefaults,
  chartPresets,
  formSchemas,
  formDefaults,
  toastConfig,
  toastPresets,
  tippyDefaults,
  tooltipContent,
  iconMapping,
  dateHelpers,
  sentryConfig,
  analyticsEvents,
  trackEvent,
  tableDefaults,
  columnHelpers
};
