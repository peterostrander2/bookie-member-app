import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { GamificationProvider, LevelBadge } from './Gamification';
import { SignalNotificationProvider, SignalBell } from './SignalNotifications';
import { BetSlipProvider, FloatingBetSlip } from './BetSlip';
import ErrorBoundary from './ErrorBoundary';
import { OfflineProvider, OfflineBanner, UpdateBanner } from './OfflineIndicator';
import { PushProvider, SmashAlertBell } from './PushNotifications';
import { NotificationOnboardingModal, useNotificationOnboarding } from './NotificationOnboarding';
import SearchBar from './SearchBar';
import api from './api';

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

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => setHealth({ status: 'offline' }));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Simplified navigation structure - 6 main items instead of 19
  const navStructure = {
    picks: {
      label: 'Picks',
      icon: '🔥',
      items: [
        { path: '/smash-spots', label: 'AI Picks', icon: '🎯' },
        { path: '/props', label: 'Player Props', icon: '🏀' },
        { path: '/sharp', label: 'Sharp Money', icon: '💵' },
        { path: '/signals', label: 'All Signals', icon: '⚡' }
      ]
    },
    tools: {
      label: 'Tools',
      icon: '🛠️',
      items: [
        { path: '/odds', label: 'Best Odds', icon: '🎯' },
        { path: '/injuries', label: 'Injuries', icon: '🏥' },
        { path: '/clv', label: 'CLV Tracker', icon: '📉' },
        { path: '/backtest', label: 'Backtest', icon: '🔬' }
      ]
    },
    betting: {
      label: 'My Betting',
      icon: '📊',
      items: [
        { path: '/parlay', label: 'Parlay Builder', icon: '🎰' },
        { path: '/history', label: 'Bet History', icon: '📋' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/bankroll', label: 'Bankroll', icon: '💰' },
        { path: '/grading', label: 'Grading', icon: '📝' }
      ]
    },
    community: {
      label: 'Community',
      icon: '👥',
      items: [
        { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        { path: '/achievements', label: 'Achievements', icon: '🏅' }
      ]
    }
  };

  // Flat links for mobile menu
  const allLinks = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    ...navStructure.picks.items,
    ...navStructure.tools.items,
    ...navStructure.betting.items,
    { path: '/esoteric', label: 'Esoteric', icon: '🔮' },
    { path: '/education', label: 'Education', icon: '📚' },
    ...navStructure.community.items,
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

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

          {/* Dropdown menus */}
          <NavDropdown label="Picks" icon="🔥" items={navStructure.picks.items} location={location} />
          <NavDropdown label="Tools" icon="🛠️" items={navStructure.tools.items} location={location} />
          <NavDropdown label="My Betting" icon="📊" items={navStructure.betting.items} location={location} />

          {/* Esoteric - Direct link (unique feature) */}
          <Link
            to="/esoteric"
            style={{
              padding: '8px 14px',
              backgroundColor: location.pathname === '/esoteric' ? '#00D4FF20' : 'transparent',
              color: location.pathname === '/esoteric' ? '#00D4FF' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔮</span>
            <span>Esoteric</span>
          </Link>

          <NavDropdown label="Community" icon="👥" items={navStructure.community.items} location={location} />

          {/* Global Search - Desktop only */}
          <div className="desktop-only" style={{ marginLeft: '8px' }}>
            <SearchBar compact placeholder="Search..." />
          </div>
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SmashAlertBell onOpenModal={onOpenNotificationModal} />
          <SignalBell />
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

          {/* Grouped sections */}
          {Object.entries(navStructure).map(([key, section]) => (
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

          {/* Esoteric */}
          <Link to="/esoteric" style={{
            padding: '12px 14px',
            marginTop: '8px',
            backgroundColor: location.pathname === '/esoteric' ? '#00D4FF20' : 'transparent',
            color: location.pathname === '/esoteric' ? '#00D4FF' : '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}>
            🔮 Esoteric Edge
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
    import('./analytics').then(({ trackPageView }) => {
      trackPageView(location.pathname, document.title);
    });
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
    <BrowserRouter>
      <ThemeProvider>
        <OfflineProvider>
          <PushProvider>
            <GamificationProvider>
              <ToastProvider>
                <SignalNotificationProvider>
                  <BetSlipProvider>
                    <OfflineBanner />
                    <UpdateBanner />
                    <AppContent />
                    <FloatingBetSlip />
                  </BetSlipProvider>
                </SignalNotificationProvider>
              </ToastProvider>
            </GamificationProvider>
          </PushProvider>
        </OfflineProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
