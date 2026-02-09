import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// Lazy load route components for code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const SmashSpotsPage = lazy(() => import('./SmashSpotsPage'));
const Splits = lazy(() => import('./Splits'));
const Esoteric = lazy(() => import('./Esoteric'));
const Signals = lazy(() => import('./Signals'));
const Grading = lazy(() => import('./Grading'));
const AdminCockpit = lazy(() => import('./AdminCockpit'));
const Profile = lazy(() => import('./Profile'));
const CLVDashboard = lazy(() => import('./CLVDashboard'));
const BacktestDashboard = lazy(() => import('./BacktestDashboard'));
const BankrollManager = lazy(() => import('./BankrollManager'));
const SharpAlerts = lazy(() => import('./SharpAlerts'));
const BestOdds = lazy(() => import('./BestOdds'));
const InjuryVacuum = lazy(() => import('./InjuryVacuum'));
const PerformanceDashboard = lazy(() => import('./PerformanceDashboard'));
const ConsensusMeterPage = lazy(() => import('./ConsensusMeter'));
const DailySummary = lazy(() => import('./DailySummary'));
const Leaderboard = lazy(() => import('./Leaderboard'));
const Props = lazy(() => import('./Props'));
const BetHistory = lazy(() => import('./BetHistory'));
const ParlayBuilder = lazy(() => import('./ParlayBuilder'));
const AchievementsPage = lazy(() => import('./Gamification'));
const HistoricalCharts = lazy(() => import('./HistoricalCharts'));
const Education = lazy(() => import('./Education'));

// Eagerly loaded components (providers, core UI)
import ComplianceFooter from './ComplianceFooter';
import { ToastProvider } from './Toast';
import OnboardingWizard, { isOnboardingComplete } from './Onboarding';
import { ThemeProvider, ThemeToggle, useTheme } from './ThemeContext';
import { GamificationProvider, LevelBadge } from './GamificationContext';
import { SignalNotificationProvider, SignalBell } from './SignalNotifications';
import { trackPageView } from './analytics';
import { BetSlipProvider, FloatingBetSlip } from './BetSlip';
import ErrorBoundary from './ErrorBoundary';
import { OfflineProvider, OfflineBanner, UpdateBanner } from './OfflineIndicator';
import { PushProvider, SmashAlertBell } from './PushNotifications';
import { StreamingProvider, StreamingStatusBadge } from './components/StreamingUpdater';
import { NotificationOnboardingModal, useNotificationOnboarding } from './NotificationOnboarding';
import SearchBar from './SearchBar';
import api from './api';
import { isAuthInvalid, onAuthInvalid } from './lib/api/client';

// Banner shown when API key is missing or invalid
const AuthInvalidBanner = () => {
  const [show, setShow] = useState(isAuthInvalid());

  useEffect(() => {
    return onAuthInvalid(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FF4444',
      color: '#fff',
      padding: '12px 20px',
      textAlign: 'center',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: 'bold'
    }}>
      API Key Missing or Invalid - Check your VITE_BOOKIE_API_KEY environment variable
    </div>
  );
};

// Simplified Navigation structure - fewer dropdowns, more direct links
// "Picks" is now direct link to /smash-spots (which has tabs for Props/Games/Sharp)
// "Research" replaces "Tools" - clearer purpose
// "My Bets" replaces "My Betting" - simpler label
const NAV_STRUCTURE = {
  research: {
    label: 'Research',
    icon: '🔍',
    items: [
      { path: '/odds', label: 'Best Odds', icon: '📊' },
      { path: '/injuries', label: 'Injuries', icon: '🏥' },
      { path: '/clv', label: 'CLV Tracker', icon: '📉' }
    ]
  },
  myBets: {
    label: 'My Bets',
    icon: '💼',
    items: [
      { path: '/parlay', label: 'Parlay Builder', icon: '🎰' },
      { path: '/history', label: 'Bet History', icon: '📋' },
      { path: '/analytics', label: 'Performance', icon: '📈' },
      { path: '/bankroll', label: 'Bankroll', icon: '💰' }
    ]
  }
};

// Flat links for mobile menu (moved outside component)
const ALL_NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/smash-spots', label: 'Picks', icon: '🎯' },
  ...NAV_STRUCTURE.research.items,
  ...NAV_STRUCTURE.myBets.items,
  { path: '/esoteric', label: 'Hidden Edge', icon: '✨' },
  { path: '/education', label: 'Education', icon: '📚' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { path: '/profile', label: 'Profile', icon: '👤' }
];

// Loading fallback for Suspense
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: '#00D4FF'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTop: '3px solid #00D4FF',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <div style={{ fontSize: '14px', color: '#9ca3af' }}>Loading...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// Dropdown Menu Component
const NavDropdown = ({ label, icon, items, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = items.some(item => location.pathname === item.path);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        style={{
          padding: '8px 14px',
          backgroundColor: isActive ? '#00D4FF20' : 'transparent',
          color: isActive ? '#00D4FF' : '#9ca3af',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <span style={{ fontSize: '10px', marginLeft: '2px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '8px 0',
          minWidth: '180px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                color: location.pathname === item.path ? '#00D4FF' : '#9ca3af',
                backgroundColor: location.pathname === item.path ? '#00D4FF15' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#00D4FF15'}
              onMouseLeave={(e) => e.target.style.backgroundColor = location.pathname === item.path ? '#00D4FF15' : 'transparent'}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = ({ onOpenNotificationModal }) => {
  const location = useLocation();
  const [health, setHealth] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => setHealth({ status: 'offline' }));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleClearCache = useCallback(async () => {
    setIsClearingCache(true);
    try {
      if (navigator.serviceWorker?.getRegistrations) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
      }
      if (window.caches?.keys) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }
      alert('Cache cleared. Hard refresh now (Cmd+Shift+R).');
    } catch (err) {
      console.error('Cache clear failed:', err);
      alert('Failed to clear cache. Try hard refresh.');
    } finally {
      setIsClearingCache(false);
    }
  }, []);


  return (
    <nav style={{
      backgroundColor: '#12121f',
      borderBottom: '1px solid #333',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎰</span>
          <span style={{
            color: '#00D4FF',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            Bookie-o-em
          </span>
        </Link>

        {/* Desktop Nav - Simplified with dropdowns */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Dashboard - Direct link */}
          <Link
            to="/"
            style={{
              padding: '8px 14px',
              backgroundColor: location.pathname === '/' ? '#00D4FF20' : 'transparent',
              color: location.pathname === '/' ? '#00D4FF' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>

          {/* Picks - Direct link (main CTA, has internal tabs) */}
          <Link
            to="/smash-spots"
            style={{
              padding: '8px 14px',
              backgroundColor: location.pathname === '/smash-spots' ? '#00D4FF20' : 'transparent',
              color: location.pathname === '/smash-spots' ? '#00D4FF' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🎯</span>
            <span>Picks</span>
          </Link>

          {/* Dropdown menus - simplified to just 2 */}
          <NavDropdown label="Research" icon="🔍" items={NAV_STRUCTURE.research.items} location={location} />
          <NavDropdown label="My Bets" icon="💼" items={NAV_STRUCTURE.myBets.items} location={location} />

          {/* Hidden Edge - Direct link (unique feature) */}
          <Link
            to="/esoteric"
            style={{
              padding: '8px 14px',
              backgroundColor: location.pathname === '/esoteric' ? '#8B5CF620' : 'transparent',
              color: location.pathname === '/esoteric' ? '#8B5CF6' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✨</span>
            <span>Hidden Edge</span>
          </Link>

          {/* Leaderboard - Direct link */}
          <Link
            to="/leaderboard"
            style={{
              padding: '8px 14px',
              backgroundColor: location.pathname === '/leaderboard' ? '#00D4FF20' : 'transparent',
              color: location.pathname === '/leaderboard' ? '#00D4FF' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏆</span>
            <span>Leaderboard</span>
          </Link>

          {/* Global Search - Desktop only */}
          <div className="desktop-only" style={{ marginLeft: '8px' }}>
            <SearchBar compact placeholder="Search..." />
          </div>
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StreamingStatusBadge />
          <SmashAlertBell onOpenModal={onOpenNotificationModal} />
          <SignalBell />
          <button
            className="desktop-only"
            onClick={handleClearCache}
            disabled={isClearingCache}
            style={{
              padding: '6px 10px',
              backgroundColor: isClearingCache ? '#333' : '#4B5563',
              color: isClearingCache ? '#666' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: isClearingCache ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Clear service worker + cache"
          >
            🧹 {isClearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
          <Link
            to="/profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: location.pathname === '/profile' ? '#00D4FF20' : '#1a1a2e',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontSize: '16px'
            }}
            title="Profile"
          >
            👤
          </Link>
          <ThemeToggle />
          <div className="desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: health?.status === 'healthy' || health?.status === 'online' ? '#00FF8815' : '#FF444415',
            padding: '6px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            color: health?.status === 'healthy' || health?.status === 'online' ? '#00FF88' : '#FF4444'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: health?.status === 'healthy' || health?.status === 'online' ? '#00FF88' : '#FF4444'
            }} />
            {health?.status === 'healthy' || health?.status === 'online' ? 'Live' : 'Offline'}
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown - grouped sections */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          backgroundColor: '#12121f',
          borderBottom: '1px solid #333',
          padding: '10px 20px 20px',
          display: 'none',
          flexDirection: 'column',
          gap: '5px',
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto'
        }}>
          {/* Dashboard */}
          <Link to="/" style={{
            padding: '12px 14px',
            backgroundColor: location.pathname === '/' ? '#00D4FF20' : 'transparent',
            color: location.pathname === '/' ? '#00D4FF' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            🏠 Dashboard
          </Link>

          {/* Picks - Main CTA */}
          <Link to="/smash-spots" style={{
            padding: '12px 14px',
            backgroundColor: location.pathname === '/smash-spots' ? '#00D4FF20' : 'transparent',
            color: location.pathname === '/smash-spots' ? '#00D4FF' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            🎯 Picks
          </Link>

          {/* Grouped sections */}
          {Object.entries(NAV_STRUCTURE).map(([key, section]) => (
            <div key={key} style={{ marginTop: '8px' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', padding: '8px 14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {section.icon} {section.label}
              </div>
              {section.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: '10px 14px 10px 28px',
                    backgroundColor: location.pathname === item.path ? '#00D4FF20' : 'transparent',
                    color: location.pathname === item.path ? '#00D4FF' : '#9ca3af',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Hidden Edge */}
          <Link to="/esoteric" style={{
            padding: '12px 14px',
            marginTop: '8px',
            backgroundColor: location.pathname === '/esoteric' ? '#8B5CF620' : 'transparent',
            color: location.pathname === '/esoteric' ? '#8B5CF6' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            ✨ Hidden Edge
          </Link>

          {/* Leaderboard */}
          <Link to="/leaderboard" style={{
            padding: '12px 14px',
            backgroundColor: location.pathname === '/leaderboard' ? '#00D4FF20' : 'transparent',
            color: location.pathname === '/leaderboard' ? '#00D4FF' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            🏆 Leaderboard
          </Link>

          {/* Profile */}
          <Link to="/profile" style={{
            padding: '12px 14px',
            marginTop: '8px',
            backgroundColor: location.pathname === '/profile' ? '#00D4FF20' : 'transparent',
            color: location.pathname === '/profile' ? '#00D4FF' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            👤 Profile & Settings
          </Link>
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            style={{
              padding: '12px 14px',
              marginTop: '8px',
              backgroundColor: '#4B5563',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 'bold',
              cursor: isClearingCache ? 'not-allowed' : 'pointer',
              opacity: isClearingCache ? 0.6 : 1
            }}
          >
            🧹 {isClearingCache ? 'Clearing Cache...' : 'Clear Cache'}
          </button>
        </div>
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-menu { display: ${mobileMenuOpen ? 'flex' : 'none'} !important; }
        }
      `}</style>
    </nav>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete());
  const { showModal, openModal, closeModal, onEnabled } = useNotificationOnboarding();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}
      {/* Notification Onboarding Modal */}
      <NotificationOnboardingModal
        isOpen={showModal}
        onClose={closeModal}
        onEnabled={onEnabled}
      />
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar onOpenNotificationModal={openModal} />
          <div style={{ flex: 1 }}>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/smash-spots" element={<SmashSpotsPage />} />
                  <Route path="/parlay" element={<ParlayBuilder />} />
                  <Route path="/history" element={<BetHistory />} />
                  <Route path="/analytics" element={<HistoricalCharts />} />
                  <Route path="/sharp" element={<SharpAlerts />} />
                  <Route path="/odds" element={<BestOdds />} />
                  <Route path="/injuries" element={<InjuryVacuum />} />
                  <Route path="/performance" element={<PerformanceDashboard />} />
                  <Route path="/consensus" element={<ConsensusMeterPage />} />
                  <Route path="/summary" element={<DailySummary />} />
                  <Route path="/splits" element={<Splits />} />
                  <Route path="/clv" element={<CLVDashboard />} />
                  <Route path="/backtest" element={<BacktestDashboard />} />
                  <Route path="/bankroll" element={<BankrollManager />} />
                  <Route path="/esoteric" element={<Esoteric />} />
                  <Route path="/signals" element={<Signals />} />
                  <Route path="/grading" element={<Grading />} />
                  <Route path="/admin" element={<AdminCockpit />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/props" element={<Props />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
          <ComplianceFooter />
        </div>
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary name="App" fullPage>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
        <OfflineProvider>
          <PushProvider>
            <GamificationProvider>
              <ToastProvider>
                <SignalNotificationProvider>
                  <StreamingProvider>
                    <BetSlipProvider>
                      <OfflineBanner />
                      <UpdateBanner />
                      <AuthInvalidBanner />
                      <AppContent />
                      <FloatingBetSlip />
                    </BetSlipProvider>
                  </StreamingProvider>
                </SignalNotificationProvider>
              </ToastProvider>
            </GamificationProvider>
          </PushProvider>
        </OfflineProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
