import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import SmashSpots from './SmashSpots';
import Splits from './Splits';
import Esoteric from './Esoteric';
import Signals from './Signals';
import Grading from './Grading';
import AdminCockpit from './AdminCockpit';
import Profile from './Profile';
import CLVDashboard from './CLVDashboard';
import BacktestDashboard from './BacktestDashboard';
import BankrollManager from './BankrollManager';
import SharpAlerts from './SharpAlerts';
import BestOdds from './BestOdds';
import InjuryVacuum from './InjuryVacuum';
import PerformanceDashboard from './PerformanceDashboard';
import ConsensusMeterPage from './ConsensusMeter';
import DailySummary from './DailySummary';
import Leaderboard from './Leaderboard';
import Props from './Props';
import ComplianceFooter from './ComplianceFooter';
import { ToastProvider } from './Toast';
import OnboardingWizard, { isOnboardingComplete } from './Onboarding';
import { ThemeProvider, ThemeToggle, useTheme } from './ThemeContext';
import { GamificationProvider, LevelBadge } from './Gamification';
import AchievementsPage from './Gamification';
import { SignalNotificationProvider, SignalBell } from './SignalNotifications';
import { BetSlipProvider, FloatingBetSlip } from './BetSlip';
import api from './api';

const Navbar = () => {
  const location = useLocation();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => setHealth({ status: 'offline' }));
  }, []);

  const links = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/smash-spots', label: 'Smash Spots', icon: '🔥' },
    { path: '/sharp', label: 'Sharp Money', icon: '💵' },
    { path: '/odds', label: 'Best Odds', icon: '🎯' },
    { path: '/injuries', label: 'Injuries', icon: '🏥' },
    { path: '/performance', label: 'Performance', icon: '📊' },
    { path: '/clv', label: 'CLV', icon: '📈' },
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

        <div style={{ display: 'flex', gap: '5px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SignalBell />
          <LevelBadge />
          <ThemeToggle />
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
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete());

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/smash-spots" element={<SmashSpots />} />
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
        <GamificationProvider>
          <ToastProvider>
            <SignalNotificationProvider>
              <BetSlipProvider>
                <AppContent />
                <FloatingBetSlip />
              </BetSlipProvider>
            </SignalNotificationProvider>
          </ToastProvider>
        </GamificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
