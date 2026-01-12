/**
 * NAVIGATION COMPONENTS
 *
 * Enhanced navigation with:
 * - Active state highlighting
 * - Breadcrumbs
 * - Mobile bottom nav
 * - Back to top button
 * - Keyboard navigation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

// CSS animations
const navStyles = `
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('nav-styles')) {
  const style = document.createElement('style');
  style.id = 'nav-styles';
  style.textContent = navStyles;
  document.head.appendChild(style);
}

// Route metadata for breadcrumbs
const routeMeta = {
  '/': { label: 'Dashboard', icon: '🏠', parent: null },
  '/smash-spots': { label: 'Smash Spots', icon: '🔥', parent: '/' },
  '/sharp': { label: 'Sharp Money', icon: '💵', parent: '/' },
  '/odds': { label: 'Best Odds', icon: '🎯', parent: '/' },
  '/injuries': { label: 'Injuries', icon: '🏥', parent: '/' },
  '/performance': { label: 'Performance', icon: '📊', parent: '/' },
  '/clv': { label: 'CLV Tracker', icon: '📈', parent: '/performance' },
  '/backtest': { label: 'Backtest', icon: '🔬', parent: '/performance' },
  '/bankroll': { label: 'Bankroll', icon: '💰', parent: '/' },
  '/esoteric': { label: 'Esoteric Edge', icon: '🔮', parent: '/' },
  '/signals': { label: 'Signals', icon: '⚡', parent: '/esoteric' },
  '/grading': { label: 'Grading', icon: '📝', parent: '/performance' },
  '/profile': { label: 'Profile', icon: '👤', parent: '/' },
  '/splits': { label: 'Splits', icon: '📊', parent: '/sharp' },
  '/consensus': { label: 'Consensus', icon: '🎯', parent: '/smash-spots' },
  '/summary': { label: 'Daily Summary', icon: '📋', parent: '/' },
  '/admin': { label: 'Admin', icon: '⚙️', parent: '/' }
};

/**
 * Enhanced Navbar with active highlighting
 */
export const EnhancedNavbar = ({ health }) => {
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navRef = useRef(null);

  const links = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/smash-spots', label: 'Smash Spots', icon: '🔥' },
    { path: '/sharp', label: 'Sharp Money', icon: '💵' },
    { path: '/odds', label: 'Best Odds', icon: '🎯' },
    { path: '/injuries', label: 'Injuries', icon: '🏥' },
    { path: '/performance', label: 'Performance', icon: '📊' },
    { path: '/bankroll', label: 'Bankroll', icon: '💰' },
    { path: '/esoteric', label: 'Esoteric', icon: '🔮' }
  ];

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      setFocusedIndex(prev => Math.min(prev + 1, links.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      const linkEl = navRef.current?.querySelectorAll('a')[focusedIndex];
      linkEl?.click();
    }
  }, [focusedIndex, links.length]);

  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('keydown', handleKeyDown);
      return () => nav.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      style={{
        backgroundColor: '#12121f',
        borderBottom: '1px solid #333',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎰</span>
          <span style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '18px' }}>
            Bookie-o-em
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <div
          style={{ display: 'flex', gap: '2px' }}
          className="desktop-nav"
        >
          {links.map((link, idx) => {
            const isActive = location.pathname === link.path;
            const isFocused = focusedIndex === idx;

            return (
              <Link
                key={link.path}
                to={link.path}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isActive ? '#00D4FF20' : isFocused ? '#ffffff10' : 'transparent',
                  color: isActive ? '#00D4FF' : '#9ca3af',
                  textDecoration: 'none',
                  borderRadius: '6px 6px 0 0',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  position: 'relative',
                  borderBottom: isActive ? '2px solid #00D4FF' : '2px solid transparent',
                  marginBottom: '-1px',
                  outline: isFocused ? '2px solid #00D4FF' : 'none',
                  outlineOffset: '-2px'
                }}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(-1)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#ffffff10';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <span style={{
                  fontSize: '14px',
                  filter: isActive ? 'none' : 'grayscale(50%)',
                  transition: 'filter 0.2s'
                }}>
                  {link.icon}
                </span>
                <span style={{ fontWeight: isActive ? '600' : '400' }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: health?.status === 'healthy' || health?.status === 'online' ? '#00FF8815' : '#FF444415',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: health?.status === 'healthy' || health?.status === 'online' ? '#00FF88' : '#FF4444'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: health?.status === 'healthy' || health?.status === 'online' ? '#00FF88' : '#FF4444'
          }} />
          {health?.status === 'healthy' || health?.status === 'online' ? 'Online' : 'Offline'}
        </div>
      </div>
    </nav>
  );
};

/**
 * Breadcrumbs Component
 */
export const Breadcrumbs = () => {
  const location = useLocation();
  const path = location.pathname;

  // Build breadcrumb trail
  const buildTrail = (currentPath) => {
    const trail = [];
    let p = currentPath;

    while (p && routeMeta[p]) {
      trail.unshift({ path: p, ...routeMeta[p] });
      p = routeMeta[p].parent;
    }

    return trail;
  };

  const trail = buildTrail(path);

  // Don't show breadcrumbs on dashboard
  if (path === '/' || trail.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: '12px 20px',
        backgroundColor: '#0a0a0f',
        borderBottom: '1px solid #1a1a2e'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <ol style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontSize: '13px'
        }}>
          {trail.map((item, idx) => {
            const isLast = idx === trail.length - 1;

            return (
              <li key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {idx > 0 && (
                  <span style={{ color: '#4b5563' }}>/</span>
                )}
                {isLast ? (
                  <span style={{ color: '#00D4FF', fontWeight: '500' }}>
                    <span style={{ marginRight: '4px' }}>{item.icon}</span>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    style={{
                      color: '#9ca3af',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

/**
 * Mobile Bottom Navigation Bar
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/smash-spots', label: 'Picks', icon: '🔥' },
    { path: '/sharp', label: 'Sharp', icon: '💵' },
    { path: '/performance', label: 'Stats', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#12121f',
        borderTop: '1px solid #333',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        display: 'none', // Hidden by default, shown via media query
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease'
      }}
      className="mobile-bottom-nav"
    >
      {links.map(link => {
        const isActive = location.pathname === link.path;

        return (
          <Link
            key={link.path}
            to={link.path}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '8px 16px',
              textDecoration: 'none',
              color: isActive ? '#00D4FF' : '#6b7280',
              fontSize: '10px',
              fontWeight: isActive ? '600' : '400',
              position: 'relative'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '2px',
                backgroundColor: '#00D4FF',
                borderRadius: '0 0 2px 2px'
              }} />
            )}
            <span style={{
              fontSize: '20px',
              filter: isActive ? 'none' : 'grayscale(60%)'
            }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

/**
 * Back to Top Button
 */
export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '80px', // Above mobile nav
        right: '20px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#00D4FF',
        color: '#000',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
        zIndex: 999,
        animation: 'fadeIn 0.3s ease',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 212, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
      }}
    >
      ↑
    </button>
  );
};

/**
 * Responsive Navigation Styles
 * Add this to your global CSS or inject via style tag
 */
export const ResponsiveNavStyles = () => (
  <style>{`
    /* Hide desktop nav on mobile */
    @media (max-width: 768px) {
      .desktop-nav {
        display: none !important;
      }
      .mobile-bottom-nav {
        display: flex !important;
      }
    }

    /* Show desktop nav, hide mobile nav on desktop */
    @media (min-width: 769px) {
      .desktop-nav {
        display: flex !important;
      }
      .mobile-bottom-nav {
        display: none !important;
      }
    }

    /* Adjust main content padding for mobile nav */
    @media (max-width: 768px) {
      main, .main-content {
        padding-bottom: 70px !important;
      }
    }

    /* Focus styles for accessibility */
    a:focus-visible, button:focus-visible {
      outline: 2px solid #00D4FF;
      outline-offset: 2px;
    }

    /* Keyboard navigation indicator */
    [data-keyboard-nav="true"] *:focus {
      outline: 2px solid #00D4FF !important;
      outline-offset: 2px;
    }
  `}</style>
);

/**
 * Hook for keyboard navigation in lists
 */
export const useKeyboardNav = (items, onSelect) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) onSelect(items[activeIndex], activeIndex);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      default:
        break;
    }
  }, [items, activeIndex, onSelect]);

  return { activeIndex, setActiveIndex, handleKeyDown };
};

export default {
  EnhancedNavbar,
  Breadcrumbs,
  MobileBottomNav,
  BackToTop,
  ResponsiveNavStyles,
  useKeyboardNav
};
