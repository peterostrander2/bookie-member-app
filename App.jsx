import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

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

const Navbar = () => {
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

  const links = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/smash-spots', label: 'Smash Spots', icon: '🔥' },
    { path: '/parlay', label: 'Parlay', icon: '🎰' },
    { path: '/history', label: 'My Bets', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/sharp', label: 'Sharp Money', icon: '💵' },
    { path: '/odds', label: 'Best Odds', icon: '🎯' },
    { path: '/injuries', label: 'Injuries', icon: '🏥' },
    { path: '/performance', label: 'Performance', icon: '📈' },
    { path: '/clv', label: 'CLV', icon: '📉' },
    { path: '/backtest', label: 'Backtest', icon: '🔬' },
    { path: '/bankroll', label: 'Bankroll', icon: '💰' },
    { path: '/esoteric', label: 'Esoteric', icon: '🔮' },
    { path: '/signals', label: 'Signals', icon: '⚡' },
    { path: '/grading', label: 'Grading', icon: '📝' },
    { path: '/leaderboard', label: 'Leaders', icon: '🏆' },
    { path: '/props', label: 'Props', icon: '🎯' },
    { path: '/achievements', label: 'Badges', icon: '🏅' },
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

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '5px' }}>
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '8px 14px',
                backgroundColor: location.pathname === link.path ? '#00D4FF20' : 'transparent',
                color: location.pathname === link.path ? '#00D4FF' : '#9ca3af',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SmashAlertBell />
          <SignalBell />
          <LevelBadge />
          <ThemeToggle />
          <div className="desktop-only" style={{
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

      {/* Mobile menu dropdown */}
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
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '12px 14px',
                backgroundColor: location.pathname === link.path ? '#00D4FF20' : 'transparent',
                color: location.pathname === link.path ? '#00D4FF' : '#9ca3af',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
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
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
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
