/**
 * InteractionEnhancements.jsx
 * Comprehensive interaction improvements including:
 * - Hover effects (lift, shadow, color shift)
 * - Click feedback (ripple, scale, copied tooltip)
 * - Toast notifications (success/error)
 * - Tooltips with definitions
 * - Keyboard shortcuts
 * - Micro-interactions (confetti, counters, transitions)
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
// HOVER EFFECTS
// ============================================================================

/**
 * HoverCard - Card that lifts with shadow on hover
 */
export const HoverCard = ({
  children,
  style = {},
  hoverScale = 1.02,
  hoverShadow = '0 12px 40px rgba(0, 0, 0, 0.3)',
  hoverY = -4,
  onClick,
  disabled = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyles = {
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transform: isHovered && !disabled
      ? `translateY(${hoverY}px) scale(${hoverScale})`
      : 'translateY(0) scale(1)',
    boxShadow: isHovered && !disabled ? hoverShadow : style.boxShadow || 'none',
    cursor: onClick && !disabled ? 'pointer' : 'default',
    ...style
  };

  return (
    <div
      className={className}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
};

/**
 * HoverButton - Button with color shift on hover
 */
export const HoverButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style = {},
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const variants = {
    primary: {
      bg: '#3b82f6',
      hoverBg: '#2563eb',
      text: 'white'
    },
    secondary: {
      bg: '#475569',
      hoverBg: '#334155',
      text: 'white'
    },
    success: {
      bg: '#22c55e',
      hoverBg: '#16a34a',
      text: 'white'
    },
    danger: {
      bg: '#ef4444',
      hoverBg: '#dc2626',
      text: 'white'
    },
    ghost: {
      bg: 'transparent',
      hoverBg: 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6'
    },
    outline: {
      bg: 'transparent',
      hoverBg: 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6',
      border: '1px solid #3b82f6'
    }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: '13px' },
    medium: { padding: '12px 24px', fontSize: '14px' },
    large: { padding: '16px 32px', fontSize: '16px' }
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.medium;

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Add ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  const buttonStyles = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: isHovered && !disabled ? v.hoverBg : v.bg,
    color: v.text,
    border: v.border || 'none',
    borderRadius: '8px',
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transform: isPressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  const rippleStyles = {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'scale(0)',
    animation: 'ripple 0.6s ease-out forwards',
    pointerEvents: 'none'
  };

  return (
    <button
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            ...rippleStyles,
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100
          }}
        />
      ))}
      {loading && <span style={{ animation: 'spin 1s linear infinite' }}>&#x21BB;</span>}
      {icon && !loading && <span>{icon}</span>}
      {children}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
};

/**
 * HoverNavItem - Navigation item with underline on hover
 */
export const HoverNavItem = ({
  children,
  active = false,
  onClick,
  icon,
  style = {}
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    color: active || isHovered ? '#3b82f6' : '#94a3b8',
    backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: active ? 600 : 500,
    fontSize: '14px',
    ...style
  };

  const underlineStyles = {
    position: 'absolute',
    bottom: '4px',
    left: '16px',
    right: '16px',
    height: '2px',
    backgroundColor: '#3b82f6',
    transform: isHovered || active ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform 0.2s ease',
    borderRadius: '1px'
  };

  return (
    <div
      style={itemStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span>{icon}</span>}
      {children}
      <div style={underlineStyles} />
    </div>
  );
};

// ============================================================================
// CLICK FEEDBACK
// ============================================================================

/**
 * Ripple effect hook
 */
export const useRipple = (ref) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = useCallback((event) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, [ref]);

  return { ripples, addRipple };
};

/**
 * CopyButton - Button with "Copied!" feedback
 */
export const CopyButton = ({
  text,
  children,
  onCopy,
  style = {},
  successDuration = 2000
}) => {
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });

      onCopy?.();
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const buttonStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: copied ? '#22c55e' : '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...style
  };

  const tooltipStyles = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    pointerEvents: 'none',
    opacity: copied ? 1 : 0,
    transition: 'opacity 0.2s ease',
    zIndex: 10000,
    whiteSpace: 'nowrap'
  };

  return (
    <>
      <button ref={buttonRef} style={buttonStyles} onClick={handleCopy}>
        {copied ? '✓' : '📋'}
        {children || (copied ? 'Copied!' : 'Copy')}
      </button>
      {copied && (
        <div style={tooltipStyles}>
          Copied!
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #22c55e'
          }} />
        </div>
      )}
    </>
  );
};

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  const containerStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px'
  };

  return (
    <div style={containerStyles}>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  };

  const types = {
    success: { bg: '#22c55e', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    warning: { bg: '#f59e0b', icon: '⚠' },
    info: { bg: '#3b82f6', icon: 'ℹ' }
  };

  const t = types[type] || types.info;

  const toastStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    borderLeft: `4px solid ${t.bg}`,
    animation: isExiting ? 'slideOut 0.2s ease forwards' : 'slideIn 0.3s ease',
    cursor: 'pointer'
  };

  const iconStyles = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: t.bg,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const messageStyles = {
    flex: 1,
    fontSize: '14px',
    color: '#f8fafc',
    lineHeight: 1.4
  };

  const closeStyles = {
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1
  };

  return (
    <div style={toastStyles} onClick={handleRemove}>
      <div style={iconStyles}>{t.icon}</div>
      <div style={messageStyles}>{message}</div>
      <span style={closeStyles}>×</span>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// TOOLTIPS
// ============================================================================

/**
 * Tooltip definitions for betting terms
 */
export const TOOLTIP_DEFINITIONS = {
  clv: {
    title: 'Closing Line Value (CLV)',
    content: 'The difference between the odds you bet at and the closing line. Positive CLV means you consistently beat the market, a key indicator of long-term profitability.',
    example: 'If you bet -110 and it closed at -120, you got +10 cents of CLV.'
  },
  sharp_money: {
    title: 'Sharp Money',
    content: 'Bets placed by professional or "sharp" bettors who have a proven track record. Books track these accounts and move lines when they bet.',
    example: 'When sharp money comes in on a team, the line often moves 0.5-2 points.'
  },
  divergence: {
    title: 'Line Divergence',
    content: 'When different sportsbooks have significantly different odds on the same event. This creates arbitrage opportunities or indicates disagreement about true odds.',
    example: 'Book A has Team X at +150 while Book B has them at +180.'
  },
  kelly: {
    title: 'Kelly Criterion',
    content: 'A mathematical formula that determines optimal bet sizing based on your edge and bankroll. Full Kelly maximizes growth but has high variance; fractional Kelly reduces risk.',
    formula: 'Kelly % = (bp - q) / b, where b=odds, p=win probability, q=1-p'
  },
  roi: {
    title: 'Return on Investment (ROI)',
    content: 'Your profit divided by total amount wagered, expressed as a percentage. Tracks overall efficiency regardless of bet volume.',
    example: '10% ROI means you profit $10 for every $100 wagered.'
  },
  vig: {
    title: 'Vigorish (Vig/Juice)',
    content: 'The commission sportsbooks charge on bets. Standard vig is -110 on both sides (4.55% margin). Lower vig means better value for bettors.',
    example: '-110/-110 has 4.55% vig, -105/-105 has only 2.38% vig.'
  },
  ev: {
    title: 'Expected Value (EV)',
    content: 'The average amount you expect to win or lose per bet over the long run. Positive EV (+EV) bets are profitable over time.',
    formula: 'EV = (Probability × Win Amount) - (1-Probability × Loss Amount)'
  },
  steam: {
    title: 'Steam Move',
    content: 'A sudden, significant line movement across multiple sportsbooks simultaneously, often triggered by sharp action or breaking news.',
    example: 'Line moves from -3 to -5 at 10+ books within minutes.'
  },
  reverse_line: {
    title: 'Reverse Line Movement',
    content: 'When the line moves opposite to where the public betting percentage would suggest. Indicates sharp money on the other side.',
    example: '80% of bets on Team A, but line moves toward Team B.'
  },
  usage_vacuum: {
    title: 'Usage Vacuum',
    content: 'When a key player is out, their usage (shots, targets, touches) gets redistributed to other players, creating prop betting opportunities.',
    example: 'Star WR out → slot receiver usage increases 40%.'
  },
  smash_spot: {
    title: 'Smash Spot',
    content: 'A high-confidence betting opportunity where multiple positive signals align. Our algorithm identifies these by scoring picks across 17 different factors.',
    threshold: 'Generally requires 75%+ overall score with strong sharp alignment.'
  },
  harmonic: {
    title: 'Harmonic Resonance',
    content: 'When esoteric factors (numerology, astrology, gematria) align with statistical analysis, creating reinforced confidence in a pick.',
    factors: 'Moon phase, planetary hours, master numbers, jersey gematria.'
  }
};

/**
 * Signal definitions for Smash Spots
 */
export const SIGNAL_TOOLTIPS = {
  sharp_money: 'Professional bettor action detected on this side',
  steam_moves: 'Rapid line movement across multiple books',
  reverse_line: 'Line moving opposite to public betting %',
  clv_history: 'Historical closing line value performance',
  market_width: 'Spread between best and worst available odds',
  volume_spike: 'Unusual betting volume on this market',
  model_edge: 'Our statistical model shows positive expected value',
  injury_impact: 'Injury news creates betting opportunity',
  weather_factor: 'Weather conditions favor one side',
  situational: 'Schedule, travel, or motivational factors',
  historical_trend: 'Strong historical pattern applies',
  correlation_safe: 'Low correlation with other active bets',
  jarvis_confidence: 'AI model confidence score',
  consensus_pick: 'Alignment with expert consensus',
  value_rating: 'Current odds vs true probability assessment',
  recency_weight: 'Recent performance trends',
  esoteric_alignment: 'Numerological/astrological factors align'
};

/**
 * Tooltip component
 */
export const Tooltip = ({
  children,
  content,
  title,
  position = 'top',
  delay = 200,
  maxWidth = 300
}) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const positions = {
          top: { x: rect.left + rect.width / 2, y: rect.top - 10 },
          bottom: { x: rect.left + rect.width / 2, y: rect.bottom + 10 },
          left: { x: rect.left - 10, y: rect.top + rect.height / 2 },
          right: { x: rect.right + 10, y: rect.top + rect.height / 2 }
        };
        setCoords(positions[position]);
        setShow(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const transforms = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)'
  };

  const arrowPositions = {
    top: { bottom: '-6px', left: '50%', transform: 'translateX(-50%)', borderTop: '6px solid #1e293b' },
    bottom: { top: '-6px', left: '50%', transform: 'translateX(-50%)', borderBottom: '6px solid #1e293b' },
    left: { right: '-6px', top: '50%', transform: 'translateY(-50%)', borderLeft: '6px solid #1e293b' },
    right: { left: '-6px', top: '50%', transform: 'translateY(-50%)', borderRight: '6px solid #1e293b' }
  };

  const tooltipStyles = {
    position: 'fixed',
    left: coords.x,
    top: coords.y,
    transform: transforms[position],
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '12px 16px',
    maxWidth,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    border: '1px solid #334155',
    zIndex: 10001,
    opacity: show ? 1 : 0,
    visibility: show ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    pointerEvents: 'none'
  };

  const arrowStyles = {
    position: 'absolute',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    ...arrowPositions[position]
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ cursor: 'help' }}
      >
        {children}
      </span>
      <div style={tooltipStyles}>
        {title && (
          <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '6px', fontSize: '14px' }}>
            {title}
          </div>
        )}
        <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
          {content}
        </div>
        <div style={arrowStyles} />
      </div>
    </>
  );
};

/**
 * InfoTooltip - Question mark icon that shows tooltip on hover
 */
export const InfoTooltip = ({ term, size = 16 }) => {
  const definition = TOOLTIP_DEFINITIONS[term];

  if (!definition) {
    return null;
  }

  return (
    <Tooltip title={definition.title} content={definition.content} maxWidth={350}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#334155',
        color: '#94a3b8',
        fontSize: size * 0.65,
        marginLeft: '6px',
        cursor: 'help'
      }}>
        ?
      </span>
    </Tooltip>
  );
};

/**
 * SignalTooltip - Tooltip for signal explanations
 */
export const SignalTooltip = ({ signal, children }) => {
  const content = SIGNAL_TOOLTIPS[signal] || 'Signal indicator';

  return (
    <Tooltip content={content} position="top">
      {children}
    </Tooltip>
  );
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

const KeyboardContext = createContext(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
};

export const KeyboardShortcutProvider = ({ children, onNavigate, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const shortcuts = useMemo(() => ({
    'd': { label: 'Dashboard', action: () => onNavigate?.('dashboard') },
    's': { label: 'Smash Spots', action: () => onNavigate?.('smash-spots') },
    'm': { label: 'Sharp Money', action: () => onNavigate?.('sharp') },
    'o': { label: 'Best Odds', action: () => onNavigate?.('odds') },
    'p': { label: 'Performance', action: () => onNavigate?.('performance') },
    'b': { label: 'Bankroll', action: () => onNavigate?.('bankroll') },
    'i': { label: 'Injuries', action: () => onNavigate?.('injuries') },
    'c': { label: 'Community', action: () => onNavigate?.('community') },
    'r': { label: 'Refresh Data', action: () => onRefresh?.() },
    '/': { label: 'Search', action: () => document.querySelector('[data-search-input]')?.focus() },
    '?': { label: 'Show Shortcuts', action: () => setShowModal(true) },
    'Escape': { label: 'Close Modal', action: () => setShowModal(false) }
  }), [onNavigate, onRefresh]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (
        !isEnabled ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        // Still allow Escape
        if (e.key === 'Escape' && showModal) {
          setShowModal(false);
        }
        return;
      }

      // Ignore if modifier keys are pressed (except for ?)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      const shortcut = shortcuts[key] || shortcuts[e.key];

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isEnabled, showModal]);

  return (
    <KeyboardContext.Provider value={{ shortcuts, showModal, setShowModal, isEnabled, setIsEnabled }}>
      {children}
      {showModal && <KeyboardShortcutsModal onClose={() => setShowModal(false)} shortcuts={shortcuts} />}
    </KeyboardContext.Provider>
  );
};

const KeyboardShortcutsModal = ({ onClose, shortcuts }) => {
  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.2s ease'
  };

  const modalStyles = {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '480px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    animation: 'scaleIn 0.2s ease'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const titleStyles = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const closeStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  };

  const shortcutStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0f172a',
    borderRadius: '8px'
  };

  const keyStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    padding: '0 8px',
    backgroundColor: '#334155',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#f8fafc',
    fontFamily: 'monospace'
  };

  const labelStyles = {
    fontSize: '14px',
    color: '#94a3b8'
  };

  const shortcutEntries = Object.entries(shortcuts).filter(([key]) => key !== 'Escape');

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={e => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>
            <span>&#x2328;</span> Keyboard Shortcuts
          </h2>
          <button style={closeStyles} onClick={onClose}>×</button>
        </div>
        <div style={gridStyles}>
          {shortcutEntries.map(([key, { label }]) => (
            <div key={key} style={shortcutStyles}>
              <span style={keyStyles}>{key === '/' ? '/' : key.toUpperCase()}</span>
              <span style={labelStyles}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Press <span style={keyStyles}>Esc</span> to close
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================

/**
 * Confetti animation for wins
 */
export const useConfetti = () => {
  const [particles, setParticles] = useState([]);

  const fire = useCallback((options = {}) => {
    const {
      count = 50,
      origin = { x: 0.5, y: 0.5 },
      colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      spread = 60
    } = options;

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: origin.x * 100,
      y: origin.y * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (Math.random() - 0.5) * spread + 270,
      velocity: 30 + Math.random() * 30,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20
    }));

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 3000);
  }, []);

  return { particles, fire };
};

export const ConfettiCanvas = ({ particles }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (particles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleStates = particles.map(p => ({
      ...p,
      x: (p.x / 100) * canvas.width,
      y: (p.y / 100) * canvas.height,
      vx: Math.cos(p.angle * Math.PI / 180) * p.velocity,
      vy: Math.sin(p.angle * Math.PI / 180) * p.velocity,
      opacity: 1
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particleStates.forEach(p => {
        p.x += p.vx * 0.1;
        p.y += p.vy * 0.1;
        p.vy += 0.5; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.01;

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-5, -3, 10, 6);
          ctx.restore();
        }
      });

      if (particleStates.some(p => p.opacity > 0)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10002
      }}
    />
  );
};

/**
 * Pulse animation for new items
 */
export const PulseIndicator = ({ active = true, color = '#22c55e', size = 10 }) => {
  if (!active) return null;

  const styles = {
    container: {
      position: 'relative',
      width: size,
      height: size
    },
    dot: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color
    },
    ring: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      animation: 'pulse-ring 1.5s ease-out infinite'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.dot} />
      <div style={styles.ring} />
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Animated counter for statistics
 */
export const AnimatedCounter = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  style = {}
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    startValueRef.current = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current = startValueRef.current + (value - startValueRef.current) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

/**
 * Slide transition wrapper
 */
export const SlideTransition = ({
  children,
  direction = 'left',
  show = true,
  duration = 300
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const transforms = {
    left: show ? 'translateX(0)' : 'translateX(-100%)',
    right: show ? 'translateX(0)' : 'translateX(100%)',
    up: show ? 'translateY(0)' : 'translateY(-100%)',
    down: show ? 'translateY(0)' : 'translateY(100%)'
  };

  const styles = {
    transform: transforms[direction],
    opacity: show ? 1 : 0,
    transition: `transform ${duration}ms ease, opacity ${duration}ms ease`
  };

  return <div style={styles}>{children}</div>;
};

/**
 * Progress bar with animation
 */
export const AnimatedProgressBar = ({
  value,
  max = 100,
  height = 8,
  color = '#3b82f6',
  backgroundColor = '#334155',
  showLabel = false,
  duration = 500,
  style = {}
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Small delay for animation
    requestAnimationFrame(() => {
      setWidth((value / max) * 100);
    });
  }, [value, max]);

  const containerStyles = {
    height,
    backgroundColor,
    borderRadius: height / 2,
    overflow: 'hidden',
    position: 'relative',
    ...style
  };

  const barStyles = {
    height: '100%',
    width: `${width}%`,
    backgroundColor: color,
    borderRadius: height / 2,
    transition: `width ${duration}ms ease-out`
  };

  const labelStyles = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: width > 50 ? 'white' : '#94a3b8'
  };

  return (
    <div style={containerStyles}>
      <div style={barStyles} />
      {showLabel && (
        <span style={labelStyles}>{Math.round(value)}%</span>
      )}
    </div>
  );
};

/**
 * Skeleton loading animation
 */
export const SkeletonPulse = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style = {}
}) => {
  const styles = {
    width,
    height,
    borderRadius,
    backgroundColor: '#334155',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    ...style
  };

  return (
    <>
      <div style={styles} />
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Number flip animation
 */
export const FlipNumber = ({ value, style = {} }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsFlipping(true);
      setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 150);
    }
  }, [value, displayValue]);

  const numberStyles = {
    display: 'inline-block',
    transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0)',
    transition: 'transform 0.15s ease',
    ...style
  };

  return <span style={numberStyles}>{displayValue}</span>;
};

/**
 * Shake animation for errors
 */
export const useShake = () => {
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const shakeStyles = isShaking ? {
    animation: 'shake 0.5s ease'
  } : {};

  return { isShaking, shake, shakeStyles };
};

/**
 * Global interaction styles
 */
export const InteractionStyles = () => (
  <style>{`
    /* Shake animation */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    /* Fade animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    /* Scale animations */
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes scaleOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.9); }
    }

    /* Bounce animation */
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Spin animation */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Global pointer cursor for clickable elements */
    button, [role="button"], a, .clickable {
      cursor: pointer;
    }

    button:disabled, [role="button"][aria-disabled="true"] {
      cursor: not-allowed;
    }

    /* Smooth transitions for interactive elements */
    button, a, input, select, textarea {
      transition: all 0.2s ease;
    }

    /* Focus styles for accessibility */
    :focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    /* Remove default button styles */
    button {
      font-family: inherit;
    }
  `}</style>
);

// ============================================================================
// COMBINED PROVIDERS
// ============================================================================

export const InteractionProvider = ({ children, onNavigate, onRefresh }) => {
  const { particles, fire } = useConfetti();

  return (
    <ToastProvider>
      <KeyboardShortcutProvider onNavigate={onNavigate} onRefresh={onRefresh}>
        <InteractionStyles />
        <ConfettiCanvas particles={particles} />
        <InteractionContext.Provider value={{ fireConfetti: fire }}>
          {children}
        </InteractionContext.Provider>
      </KeyboardShortcutProvider>
    </ToastProvider>
  );
};

const InteractionContext = createContext({ fireConfetti: () => {} });

export const useInteraction = () => useContext(InteractionContext);

export default {
  // Hover Effects
  HoverCard,
  HoverButton,
  HoverNavItem,
  // Click Feedback
  useRipple,
  CopyButton,
  // Toasts
  ToastProvider,
  useToast,
  // Tooltips
  Tooltip,
  InfoTooltip,
  SignalTooltip,
  TOOLTIP_DEFINITIONS,
  SIGNAL_TOOLTIPS,
  // Keyboard Shortcuts
  KeyboardShortcutProvider,
  useKeyboardShortcuts,
  // Micro-interactions
  useConfetti,
  ConfettiCanvas,
  PulseIndicator,
  AnimatedCounter,
  SlideTransition,
  AnimatedProgressBar,
  SkeletonPulse,
  FlipNumber,
  useShake,
  // Combined
  InteractionProvider,
  useInteraction,
  InteractionStyles
};
