/**
 * MOBILE OPTIMIZATION SYSTEM v1.0
 *
 * Comprehensive mobile-first components:
 * - Responsive breakpoint hooks
 * - Mobile navigation (bottom tabs, hamburger menu)
 * - Touch-optimized components
 * - Mobile-friendly tables
 * - Pull-to-refresh & infinite scroll
 * - Native share integration
 */

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

// ============================================================================
// BREAKPOINT SYSTEM
// ============================================================================

export const BREAKPOINTS = {
  mobile: 375,
  mobileLarge: 480,
  tablet: 768,
  desktop: 1200,
  desktopLarge: 1440
};

export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  touch: '(hover: none) and (pointer: coarse)'
};

// Hook to detect current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setBreakpoint('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }

      // Check for touch device
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia(MEDIA_QUERIES.touch).matches
      );
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return { breakpoint, isMobile, isTablet, isDesktop, isTouchDevice };
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const { breakpoint } = useBreakpoint();
  return values[breakpoint] || values.desktop || values.mobile;
};

// ============================================================================
// RESPONSIVE CONTEXT
// ============================================================================

const ResponsiveContext = createContext({
  breakpoint: 'desktop',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false
});

export const ResponsiveProvider = ({ children }) => {
  const breakpointData = useBreakpoint();

  return (
    <ResponsiveContext.Provider value={breakpointData}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = () => useContext(ResponsiveContext);

// ============================================================================
// MOBILE NAVIGATION - BOTTOM TAB BAR
// ============================================================================

const bottomTabStyles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: '#1a1a2e',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '64px',
    minHeight: '44px',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent'
  },
  tabActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)'
  },
  icon: {
    fontSize: '24px',
    marginBottom: '4px'
  },
  label: {
    fontSize: '10px',
    fontWeight: '500'
  }
};

export const BottomTabBar = ({ tabs, activeTab, onTabChange }) => {
  const { isMobile } = useBreakpoint();

  if (!isMobile) return null;

  return (
    <nav style={bottomTabStyles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            ...bottomTabStyles.tab,
            ...(activeTab === tab.id ? bottomTabStyles.tabActive : {}),
            background: 'none',
            border: 'none'
          }}
          aria-label={tab.label}
        >
          <span style={{
            ...bottomTabStyles.icon,
            color: activeTab === tab.id ? '#00D4FF' : '#6b7280'
          }}>
            {tab.icon}
          </span>
          <span style={{
            ...bottomTabStyles.label,
            color: activeTab === tab.id ? '#00D4FF' : '#6b7280'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

// Default navigation tabs
export const DEFAULT_TABS = [
  { id: 'picks', icon: '🎯', label: 'Picks' },
  { id: 'analysis', icon: '📊', label: 'Analysis' },
  { id: 'bankroll', icon: '💰', label: 'Bankroll' },
  { id: 'community', icon: '👥', label: 'Community' },
  { id: 'more', icon: '☰', label: 'More' }
];

// ============================================================================
// HAMBURGER MENU
// ============================================================================

const hamburgerStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1001,
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease'
  },
  overlayOpen: {
    opacity: 1,
    visibility: 'visible'
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '280px',
    maxWidth: '80vw',
    height: '100%',
    backgroundColor: '#1a1a2e',
    zIndex: 1002,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 'env(safe-area-inset-top, 20px)'
  },
  drawerOpen: {
    transform: 'translateX(0)'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#fff'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    color: '#fff',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    minHeight: '56px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};

export const HamburgerMenu = ({ isOpen, onClose, menuItems, header }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          ...hamburgerStyles.overlay,
          ...(isOpen ? hamburgerStyles.overlayOpen : {})
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          ...hamburgerStyles.drawer,
          ...(isOpen ? hamburgerStyles.drawerOpen : {})
        }}
      >
        <div style={hamburgerStyles.header}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
            {header || 'Menu'}
          </div>
          <button
            onClick={onClose}
            style={hamburgerStyles.closeButton}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                onClose();
              }}
              style={hamburgerStyles.menuItem}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#00D4FF',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ============================================================================
// SWIPE GESTURE HOOK
// ============================================================================

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = Math.abs(touchStart.current.y - touchEnd.current.y);

    // Only trigger if horizontal swipe is significant and vertical is minimal
    if (Math.abs(deltaX) > threshold && deltaY < 100) {
      if (deltaX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// ============================================================================
// TOUCH-OPTIMIZED BUTTON
// ============================================================================

const touchButtonStyles = {
  base: {
    minWidth: '44px',
    minHeight: '44px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation'
  },
  primary: {
    background: 'linear-gradient(135deg, #00D4FF 0%, #00FF88 100%)',
    color: '#000'
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  danger: {
    background: 'rgba(255, 68, 68, 0.2)',
    color: '#FF4444',
    border: '1px solid rgba(255, 68, 68, 0.3)'
  },
  ghost: {
    background: 'transparent',
    color: '#00D4FF'
  },
  small: {
    minHeight: '36px',
    padding: '8px 16px',
    fontSize: '14px'
  },
  large: {
    minHeight: '56px',
    padding: '16px 32px',
    fontSize: '18px'
  },
  fullWidth: {
    width: '100%'
  }
};

export const TouchButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  disabled = false,
  onClick,
  style = {},
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle = {
    ...touchButtonStyles.base,
    ...touchButtonStyles[variant],
    ...(size === 'small' ? touchButtonStyles.small : {}),
    ...(size === 'large' ? touchButtonStyles.large : {}),
    ...(fullWidth ? touchButtonStyles.fullWidth : {}),
    ...(isPressed ? { transform: 'scale(0.98)', opacity: 0.9 } : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
    ...style
  };

  return (
    <button
      style={buttonStyle}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// ============================================================================
// MOBILE-FRIENDLY TABLE
// ============================================================================

const mobileTableStyles = {
  wrapper: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '12px',
    border: '1px solid #333'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #333'
  }
};

export const MobileTable = ({
  columns,
  data,
  cardRenderer,
  mobileBreakpoint = 768
}) => {
  const { isMobile } = useBreakpoint();
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'table', 'cards'

  const showCards = viewMode === 'cards' || (viewMode === 'auto' && isMobile);

  if (showCards && cardRenderer) {
    return (
      <div>
        {/* View Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '12px',
          gap: '8px'
        }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '8px 12px',
              backgroundColor: viewMode === 'cards' ? '#00D4FF' : 'transparent',
              color: viewMode === 'cards' ? '#000' : '#6b7280',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '8px 12px',
              backgroundColor: viewMode === 'table' ? '#00D4FF' : 'transparent',
              color: viewMode === 'table' ? '#000' : '#6b7280',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Table
          </button>
        </div>

        {/* Card View */}
        <div>
          {data.map((row, idx) => (
            <div key={idx} style={mobileTableStyles.card}>
              {cardRenderer(row, idx)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Table View
  return (
    <div style={mobileTableStyles.wrapper}>
      <table style={mobileTableStyles.table}>
        <thead>
          <tr style={{ backgroundColor: '#12121f' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '12px 16px',
                  textAlign: col.align || 'left',
                  color: '#9ca3af',
                  fontWeight: '500',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  position: col.sticky ? 'sticky' : 'static',
                  left: col.sticky ? 0 : 'auto',
                  backgroundColor: col.sticky ? '#12121f' : 'transparent',
                  zIndex: col.sticky ? 1 : 'auto'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
              }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    padding: '12px 16px',
                    textAlign: col.align || 'left',
                    color: '#fff',
                    fontSize: '14px',
                    whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                    position: col.sticky ? 'sticky' : 'static',
                    left: col.sticky ? 0 : 'auto',
                    backgroundColor: col.sticky ? '#1a1a2e' : 'transparent',
                    zIndex: col.sticky ? 1 : 'auto'
                  }}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// PULL TO REFRESH
// ============================================================================

export const usePullToRefresh = (onRefresh, options = {}) => {
  const { threshold = 80, resistance = 2.5 } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      const distance = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [isPulling, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

export const PullToRefreshContainer = ({ children, onRefresh, style = {} }) => {
  const {
    containerRef,
    pullDistance,
    isRefreshing,
    pullProgress,
    handlers
  } = usePullToRefresh(onRefresh);

  return (
    <div
      ref={containerRef}
      {...handlers}
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        height: '100%',
        ...style
      }}
    >
      {/* Pull indicator */}
      <div
        style={{
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: pullDistance === 0 ? 'height 0.2s ease' : 'none',
          overflow: 'hidden'
        }}
      >
        {isRefreshing ? (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #333',
            borderTopColor: '#00D4FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <div style={{
            transform: `rotate(${pullProgress * 180}deg)`,
            transition: 'transform 0.1s',
            fontSize: '24px',
            opacity: pullProgress
          }}>
            ↓
          </div>
        )}
      </div>

      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>

      {children}
    </div>
  );
};

// ============================================================================
// INFINITE SCROLL
// ============================================================================

export const useInfiniteScroll = (loadMore, options = {}) => {
  const { threshold = 200, hasMore = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          try {
            await loadMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, threshold, hasMore, isLoading]);

  return {
    sentinelRef,
    isLoading,
    LoadMoreSentinel: () => (
      <div ref={sentinelRef} style={{ height: '20px' }}>
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #333',
              borderTopColor: '#00D4FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
      </div>
    )
  };
};

// ============================================================================
// NATIVE SHARE
// ============================================================================

export const useNativeShare = () => {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && navigator.share);
  }, []);

  const share = useCallback(async (data) => {
    if (canShare) {
      try {
        await navigator.share(data);
        return { success: true };
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          return { success: false, error };
        }
        return { success: false, cancelled: true };
      }
    }
    return { success: false, unsupported: true };
  }, [canShare]);

  const shareUrl = useCallback((url, title, text) => {
    return share({ url, title, text });
  }, [share]);

  const sharePick = useCallback((pick) => {
    const text = `🎯 My pick: ${pick.name}\n📊 Confidence: ${pick.confidence}%\n\n#SportsBetting #Bookie`;
    return share({
      title: `Bookie Pick: ${pick.name}`,
      text,
      url: pick.url || window.location.href
    });
  }, [share]);

  return { canShare, share, shareUrl, sharePick };
};

export const ShareButton = ({ data, children, style = {} }) => {
  const { canShare, share } = useNativeShare();

  if (!canShare) return null;

  return (
    <TouchButton
      variant="secondary"
      icon="📤"
      onClick={() => share(data)}
      style={style}
    >
      {children || 'Share'}
    </TouchButton>
  );
};

// ============================================================================
// RESPONSIVE GRID
// ============================================================================

export const ResponsiveGrid = ({ children, columns = {}, gap = 16, style = {} }) => {
  const { breakpoint } = useBreakpoint();

  const cols = columns[breakpoint] || columns.desktop || 3;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// MOBILE HEADER
// ============================================================================

export const MobileHeader = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  showBack = false,
  onBack
}) => {
  const { isMobile } = useBreakpoint();

  if (!isMobile) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#0a0a0f',
        borderBottom: '1px solid #333',
        padding: '12px 16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      {showBack && (
        <button
          onClick={onBack}
          style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: '#fff'
          }}
          aria-label="Go back"
        >
          ←
        </button>
      )}

      {leftAction && !showBack && (
        <div style={{ minWidth: '44px' }}>{leftAction}</div>
      )}

      <div style={{ flex: 1, textAlign: leftAction || showBack ? 'center' : 'left' }}>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: '#6b7280', fontSize: '12px' }}>
            {subtitle}
          </div>
        )}
      </div>

      {rightAction && (
        <div style={{ minWidth: '44px' }}>{rightAction}</div>
      )}
    </header>
  );
};

// ============================================================================
// MOBILE PAGE WRAPPER
// ============================================================================

export const MobilePageWrapper = ({
  children,
  hasBottomNav = true,
  hasPullToRefresh = false,
  onRefresh,
  style = {}
}) => {
  const { isMobile } = useBreakpoint();

  const content = hasPullToRefresh ? (
    <PullToRefreshContainer onRefresh={onRefresh}>
      {children}
    </PullToRefreshContainer>
  ) : children;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        paddingBottom: isMobile && hasBottomNav ? '64px' : 0,
        ...style
      }}
    >
      {content}
    </div>
  );
};

// ============================================================================
// RESPONSIVE STYLES HELPER
// ============================================================================

export const getResponsiveStyles = (breakpoint) => ({
  container: {
    padding: breakpoint === 'mobile' ? '12px' : breakpoint === 'tablet' ? '16px' : '24px',
    maxWidth: breakpoint === 'mobile' ? '100%' : breakpoint === 'tablet' ? '100%' : '1200px',
    margin: '0 auto'
  },
  card: {
    padding: breakpoint === 'mobile' ? '16px' : '20px',
    borderRadius: breakpoint === 'mobile' ? '12px' : '16px'
  },
  heading: {
    fontSize: breakpoint === 'mobile' ? '24px' : breakpoint === 'tablet' ? '28px' : '32px'
  },
  text: {
    fontSize: breakpoint === 'mobile' ? '14px' : '16px'
  },
  button: {
    padding: breakpoint === 'mobile' ? '12px 20px' : '10px 24px',
    fontSize: breakpoint === 'mobile' ? '16px' : '14px'
  },
  grid: {
    columns: breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 3,
    gap: breakpoint === 'mobile' ? '12px' : '20px'
  },
  spacing: {
    xs: breakpoint === 'mobile' ? '4px' : '8px',
    sm: breakpoint === 'mobile' ? '8px' : '12px',
    md: breakpoint === 'mobile' ? '12px' : '16px',
    lg: breakpoint === 'mobile' ? '16px' : '24px',
    xl: breakpoint === 'mobile' ? '24px' : '32px'
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Breakpoints
  BREAKPOINTS,
  MEDIA_QUERIES,
  useBreakpoint,
  useResponsiveValue,
  ResponsiveProvider,
  useResponsive,

  // Navigation
  BottomTabBar,
  DEFAULT_TABS,
  HamburgerMenu,
  MobileHeader,

  // Gestures
  useSwipeGesture,

  // Components
  TouchButton,
  MobileTable,
  ResponsiveGrid,
  ShareButton,
  MobilePageWrapper,

  // Features
  usePullToRefresh,
  PullToRefreshContainer,
  useInfiniteScroll,
  useNativeShare,

  // Helpers
  getResponsiveStyles
};
