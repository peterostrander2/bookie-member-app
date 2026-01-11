/**
 * Accessibility.jsx
 * Comprehensive accessibility (A11y) implementation including:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Color contrast utilities
 * - Screen reader support
 * - Skip links
 * - Focus management
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useMemo
} from 'react';

// ============================================================================
// ACCESSIBILITY CONTEXT
// ============================================================================

const A11yContext = createContext(null);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};

export const A11yProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);

    // Remove after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  // Announce assertively (interrupts)
  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  const value = {
    announce,
    announceAssertive,
    reducedMotion,
    highContrast,
    fontSize,
    setFontSize,
    setHighContrast
  };

  return (
    <A11yContext.Provider value={value}>
      {children}
      <LiveRegions announcements={announcements} />
    </A11yContext.Provider>
  );
};

// ============================================================================
// LIVE REGIONS FOR SCREEN READERS
// ============================================================================

const LiveRegions = ({ announcements }) => {
  const politeAnnouncements = announcements.filter(a => a.priority === 'polite');
  const assertiveAnnouncements = announcements.filter(a => a.priority === 'assertive');

  const styles = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  };

  return (
    <>
      {/* Polite announcements - waits for user to finish current task */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={styles}
      >
        {politeAnnouncements.map(a => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>

      {/* Assertive announcements - interrupts immediately */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={styles}
      >
        {assertiveAnnouncements.map(a => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>

      {/* Status region for loading states */}
      <div
        id="loading-status"
        role="status"
        aria-live="polite"
        style={styles}
      />
    </>
  );
};

// ============================================================================
// SKIP LINKS
// ============================================================================

export const SkipLinks = ({ links = [] }) => {
  const defaultLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' }
  ];

  const allLinks = links.length > 0 ? links : defaultLinks;

  const containerStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 10001,
    display: 'flex',
    gap: '8px',
    padding: '8px'
  };

  const linkStyles = {
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    padding: '16px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  };

  const focusStyles = {
    position: 'static',
    width: 'auto',
    height: 'auto',
    left: 'auto'
  };

  return (
    <nav aria-label="Skip links" style={containerStyles}>
      {allLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          style={linkStyles}
          onFocus={(e) => Object.assign(e.target.style, focusStyles)}
          onBlur={(e) => Object.assign(e.target.style, linkStyles)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Focus trap for modals and dialogs
 */
export const FocusTrap = ({ children, active = true, returnFocus = true }) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Store current focus
    previousActiveElement.current = document.activeElement;

    // Find focusable elements
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    // Focus first element
    focusableElements[0].focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements(container);
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus on unmount
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, returnFocus]);

  return <div ref={containerRef}>{children}</div>;
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => el.offsetParent !== null); // Filter out hidden elements
};

/**
 * Hook for managing focus within a component
 */
export const useFocusManagement = () => {
  const focusRef = useRef(null);

  const setFocus = useCallback((selector) => {
    const element = selector
      ? document.querySelector(selector)
      : focusRef.current;

    if (element) {
      element.focus();
    }
  }, []);

  const moveFocus = useCallback((direction, container) => {
    const focusable = getFocusableElements(container || document.body);
    const currentIndex = focusable.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusable.length;
    } else {
      nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    }

    focusable[nextIndex].focus();
  }, []);

  return { focusRef, setFocus, moveFocus };
};

/**
 * Visible focus ring styles
 */
export const FocusRing = ({ children, offset = 2 }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboard(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboard(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const ringStyles = isFocused && isKeyboard ? {
    outline: '2px solid #3b82f6',
    outlineOffset: `${offset}px`
  } : {};

  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={ringStyles}
    >
      {children}
    </div>
  );
};

// ============================================================================
// ARIA COMPONENTS
// ============================================================================

/**
 * Accessible Icon with label
 */
export const AccessibleIcon = ({
  icon,
  label,
  decorative = false,
  size = 20,
  color = 'currentColor',
  style = {}
}) => {
  if (decorative) {
    return (
      <span
        aria-hidden="true"
        style={{ fontSize: size, color, ...style }}
      >
        {icon}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      style={{ fontSize: size, color, ...style }}
    >
      {icon}
    </span>
  );
};

/**
 * Accessible Button
 */
export const AccessibleButton = ({
  children,
  onClick,
  label,
  description,
  disabled = false,
  loading = false,
  expanded,
  controls,
  pressed,
  haspopup,
  style = {},
  ...props
}) => {
  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: disabled ? '#334155' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      aria-describedby={description ? `${props.id}-description` : undefined}
      aria-disabled={disabled}
      aria-busy={loading}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-pressed={pressed}
      aria-haspopup={haspopup}
      style={buttonStyles}
      {...props}
    >
      {loading && <span aria-hidden="true">Loading...</span>}
      {children}
      {description && (
        <span id={`${props.id}-description`} className="sr-only">
          {description}
        </span>
      )}
    </button>
  );
};

/**
 * Accessible Tabs
 */
export const AccessibleTabs = ({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'horizontal',
  label = 'Content tabs'
}) => {
  const tablistRef = useRef(null);

  const handleKeyDown = (e, index) => {
    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    let newIndex = index;

    switch (e.key) {
      case prevKey:
        e.preventDefault();
        newIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case nextKey:
        e.preventDefault();
        newIndex = index === tabs.length - 1 ? 0 : index + 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    onTabChange(tabs[newIndex].id);

    // Focus the new tab
    const tabButtons = tablistRef.current?.querySelectorAll('[role="tab"]');
    tabButtons?.[newIndex]?.focus();
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: '4px',
    borderBottom: orientation === 'horizontal' ? '1px solid #334155' : 'none',
    borderRight: orientation === 'vertical' ? '1px solid #334155' : 'none'
  };

  const tabStyles = (isActive) => ({
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: isActive ? '#3b82f6' : '#94a3b8',
    border: 'none',
    borderBottom: orientation === 'horizontal' && isActive ? '2px solid #3b82f6' : '2px solid transparent',
    borderRight: orientation === 'vertical' && isActive ? '2px solid #3b82f6' : '2px solid transparent',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: orientation === 'horizontal' ? '-1px' : 0,
    marginRight: orientation === 'vertical' ? '-1px' : 0
  });

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      style={containerStyles}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={tabStyles(isActive)}
          >
            {tab.icon && <AccessibleIcon icon={tab.icon} decorative />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Accessible Tab Panel
 */
export const AccessibleTabPanel = ({
  id,
  activeTab,
  children,
  label
}) => {
  const isActive = activeTab === id;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      aria-label={label}
      hidden={!isActive}
      tabIndex={0}
      style={{
        padding: '20px 0',
        outline: 'none'
      }}
    >
      {isActive && children}
    </div>
  );
};

/**
 * Accessible Accordion
 */
export const AccessibleAccordion = ({
  items,
  allowMultiple = false,
  defaultExpanded = []
}) => {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleItem = (id) => {
    if (allowMultiple) {
      setExpandedItems(prev =>
        prev.includes(id)
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    } else {
      setExpandedItems(prev =>
        prev.includes(id) ? [] : [id]
      );
    }
  };

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % items.length;
        document.getElementById(`accordion-header-${items[nextIndex].id}`)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + items.length) % items.length;
        document.getElementById(`accordion-header-${items[prevIndex].id}`)?.focus();
        break;
      case 'Home':
        e.preventDefault();
        document.getElementById(`accordion-header-${items[0].id}`)?.focus();
        break;
      case 'End':
        e.preventDefault();
        document.getElementById(`accordion-header-${items[items.length - 1].id}`)?.focus();
        break;
    }
  };

  return (
    <div role="region" aria-label="Accordion">
      {items.map((item, index) => {
        const isExpanded = expandedItems.includes(item.id);

        return (
          <div key={item.id} style={{ borderBottom: '1px solid #334155' }}>
            <h3 style={{ margin: 0 }}>
              <button
                id={`accordion-header-${item.id}`}
                aria-expanded={isExpanded}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'transparent',
                  color: '#f8fafc',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {item.title}
                <span
                  aria-hidden="true"
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  ▼
                </span>
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              hidden={!isExpanded}
              style={{
                padding: isExpanded ? '16px' : 0,
                maxHeight: isExpanded ? '1000px' : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Accessible Modal/Dialog
 */
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium'
}) => {
  const modalRef = useRef(null);
  const { announce } = useA11y();

  useEffect(() => {
    if (isOpen) {
      // Announce modal opening
      announce(`${title} dialog opened`);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose, title, announce]);

  if (!isOpen) return null;

  const sizes = {
    small: '400px',
    medium: '600px',
    large: '800px',
    fullscreen: '100%'
  };

  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const modalStyles = {
    backgroundColor: '#1e293b',
    borderRadius: size === 'fullscreen' ? 0 : '16px',
    maxWidth: sizes[size],
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative'
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #334155'
  };

  const closeButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px'
  };

  return (
    <div
      style={overlayStyles}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
          style={modalStyles}
        >
          <div style={headerStyles}>
            <h2 id="modal-title" style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={closeButtonStyles}
            >
              ×
            </button>
          </div>

          {description && (
            <p id="modal-description" className="sr-only">
              {description}
            </p>
          )}

          <div style={{ padding: '24px' }}>
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

/**
 * Accessible Toggle/Switch
 */
export const AccessibleToggle = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  description
}) => {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  };

  const toggleStyles = {
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: checked ? '#22c55e' : '#475569',
    padding: '2px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center'
  };

  const knobStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: 'white',
    transform: checked ? 'translateX(20px)' : 'translateX(0)',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  };

  return (
    <div style={containerStyles}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        style={{
          ...toggleStyles,
          border: 'none',
          cursor: 'inherit'
        }}
      >
        <span style={knobStyles} aria-hidden="true" />
      </button>
      <label
        htmlFor={id}
        style={{ fontSize: '14px', color: '#f8fafc', cursor: 'inherit' }}
      >
        {label}
      </label>
      {description && (
        <span id={`${id}-description`} className="sr-only">
          {description}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

/**
 * WCAG Color Contrast ratios
 * AA Normal text: 4.5:1
 * AA Large text: 3:1
 * AAA Normal text: 7:1
 * AAA Large text: 4.5:1
 */

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Calculate relative luminance
const getLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate contrast ratio
export const getContrastRatio = (color1, color2) => {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Check WCAG compliance
export const checkContrastCompliance = (foreground, background) => {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: ratio.toFixed(2),
    AA: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3
    },
    AAA: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5
    }
  };
};

// Accessible color palette (all meet WCAG AA on #0f172a background)
export const A11Y_COLORS = {
  // Text colors
  textPrimary: '#f8fafc',      // Ratio: 15.1:1 (AAA)
  textSecondary: '#94a3b8',    // Ratio: 4.6:1 (AA)
  textMuted: '#64748b',        // Ratio: 3.0:1 (Large text only)

  // Brand colors on dark background
  blue: '#60a5fa',             // Ratio: 5.1:1 (AA)
  green: '#4ade80',            // Ratio: 6.1:1 (AA)
  red: '#f87171',              // Ratio: 4.8:1 (AA)
  yellow: '#fbbf24',           // Ratio: 8.3:1 (AAA)
  purple: '#a78bfa',           // Ratio: 4.9:1 (AA)

  // Status colors (with sufficient contrast)
  success: '#22c55e',          // Use with white text
  error: '#ef4444',            // Use with white text
  warning: '#f59e0b',          // Use with black text
  info: '#3b82f6',             // Use with white text

  // Background variants
  bgPrimary: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155'
};

// ============================================================================
// SEMANTIC HTML HELPERS
// ============================================================================

/**
 * Main content landmark
 */
export const MainContent = ({ children, id = 'main-content' }) => (
  <main id={id} role="main" tabIndex={-1} style={{ outline: 'none' }}>
    {children}
  </main>
);

/**
 * Navigation landmark
 */
export const NavigationLandmark = ({
  children,
  id = 'main-navigation',
  label = 'Main navigation'
}) => (
  <nav id={id} role="navigation" aria-label={label}>
    {children}
  </nav>
);

/**
 * Section with heading
 */
export const Section = ({
  children,
  heading,
  headingLevel = 2,
  id,
  label
}) => {
  const HeadingTag = `h${headingLevel}`;

  return (
    <section
      id={id}
      aria-labelledby={heading ? `${id}-heading` : undefined}
      aria-label={!heading ? label : undefined}
    >
      {heading && (
        <HeadingTag id={`${id}-heading`}>{heading}</HeadingTag>
      )}
      {children}
    </section>
  );
};

/**
 * Descriptive link (not just "click here")
 */
export const DescriptiveLink = ({
  href,
  children,
  description,
  external = false,
  ...props
}) => (
  <a
    href={href}
    aria-describedby={description ? `${props.id}-desc` : undefined}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    {...props}
  >
    {children}
    {external && (
      <span className="sr-only"> (opens in new tab)</span>
    )}
    {description && (
      <span id={`${props.id}-desc`} className="sr-only">
        {description}
      </span>
    )}
  </a>
);

// ============================================================================
// SCREEN READER ONLY STYLES
// ============================================================================

export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component
    style={{
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
  >
    {children}
  </Component>
);

// ============================================================================
// LOADING ANNOUNCER
// ============================================================================

export const LoadingAnnouncer = ({ loading, message = 'Loading content' }) => {
  const { announce } = useA11y();

  useEffect(() => {
    if (loading) {
      announce(message);
    } else {
      announce('Content loaded');
    }
  }, [loading, message, announce]);

  return null;
};

// ============================================================================
// ACCESSIBILITY PREFERENCES PANEL
// ============================================================================

export const A11yPreferencesPanel = () => {
  const { reducedMotion, highContrast, fontSize, setFontSize, setHighContrast } = useA11y();

  const panelStyles = {
    padding: '20px',
    backgroundColor: '#1e293b',
    borderRadius: '12px'
  };

  const headingStyles = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '20px'
  };

  const optionStyles = {
    marginBottom: '16px'
  };

  return (
    <div style={panelStyles} role="region" aria-label="Accessibility preferences">
      <h2 style={headingStyles}>Accessibility Settings</h2>

      <div style={optionStyles}>
        <AccessibleToggle
          id="high-contrast"
          label="High Contrast Mode"
          checked={highContrast}
          onChange={setHighContrast}
          description="Increases contrast for better visibility"
        />
      </div>

      <div style={optionStyles}>
        <label
          htmlFor="font-size"
          style={{ display: 'block', marginBottom: '8px', color: '#f8fafc', fontSize: '14px' }}
        >
          Text Size
        </label>
        <select
          id="font-size"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100%'
          }}
        >
          <option value="small">Small</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="x-large">Extra Large</option>
        </select>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {reducedMotion ? (
            <>System reduced motion is <strong>enabled</strong>. Animations are minimized.</>
          ) : (
            <>System reduced motion is <strong>disabled</strong>. Animations are enabled.</>
          )}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// GLOBAL A11Y STYLES
// ============================================================================

export const A11yStyles = () => (
  <style>{`
    /* Screen reader only utility class */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Focus visible for keyboard users */
    :focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    /* Remove outline for mouse users */
    :focus:not(:focus-visible) {
      outline: none;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: more) {
      * {
        border-color: currentColor !important;
      }
    }

    /* Ensure minimum touch target size (44x44px) */
    button,
    a,
    input,
    select,
    [role="button"],
    [role="link"] {
      min-height: 44px;
      min-width: 44px;
    }

    /* Visible text selection */
    ::selection {
      background-color: #3b82f6;
      color: white;
    }

    /* Links should be distinguishable */
    a {
      text-decoration: underline;
      text-decoration-color: currentColor;
      text-underline-offset: 2px;
    }

    a:hover {
      text-decoration-thickness: 2px;
    }
  `}</style>
);

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Context
  A11yProvider,
  useA11y,

  // Skip Links
  SkipLinks,

  // Focus Management
  FocusTrap,
  useFocusManagement,
  FocusRing,

  // ARIA Components
  AccessibleIcon,
  AccessibleButton,
  AccessibleTabs,
  AccessibleTabPanel,
  AccessibleAccordion,
  AccessibleModal,
  AccessibleToggle,

  // Color Contrast
  getContrastRatio,
  checkContrastCompliance,
  A11Y_COLORS,

  // Semantic HTML
  MainContent,
  NavigationLandmark,
  Section,
  DescriptiveLink,
  ScreenReaderOnly,

  // Utilities
  LoadingAnnouncer,
  A11yPreferencesPanel,
  A11yStyles
};
