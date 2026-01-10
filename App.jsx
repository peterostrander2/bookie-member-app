import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ComplianceFooter from './ComplianceFooter';
import ErrorBoundary from './ErrorBoundary';
import {
  EnhancedNavbar,
  Breadcrumbs,
  MobileBottomNav,
  BackToTop,
  ResponsiveNavStyles
} from './Navigation';
import api from './api';

const App = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <BrowserRouter>
      <ResponsiveNavStyles />
      <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <EnhancedNavbar health={health} />
        <Breadcrumbs />
        <div style={{ flex: 1 }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/smash-spots" element={<ErrorBoundary><SmashSpots /></ErrorBoundary>} />
              <Route path="/sharp" element={<ErrorBoundary><SharpAlerts /></ErrorBoundary>} />
              <Route path="/odds" element={<ErrorBoundary><BestOdds /></ErrorBoundary>} />
              <Route path="/injuries" element={<ErrorBoundary><InjuryVacuum /></ErrorBoundary>} />
              <Route path="/performance" element={<ErrorBoundary><PerformanceDashboard /></ErrorBoundary>} />
              <Route path="/consensus" element={<ErrorBoundary><ConsensusMeterPage /></ErrorBoundary>} />
              <Route path="/summary" element={<ErrorBoundary><DailySummary /></ErrorBoundary>} />
              <Route path="/splits" element={<ErrorBoundary><Splits /></ErrorBoundary>} />
              <Route path="/clv" element={<ErrorBoundary><CLVDashboard /></ErrorBoundary>} />
              <Route path="/backtest" element={<ErrorBoundary><BacktestDashboard /></ErrorBoundary>} />
              <Route path="/bankroll" element={<ErrorBoundary><BankrollManager /></ErrorBoundary>} />
              <Route path="/esoteric" element={<ErrorBoundary><Esoteric /></ErrorBoundary>} />
              <Route path="/signals" element={<ErrorBoundary><Signals /></ErrorBoundary>} />
              <Route path="/grading" element={<ErrorBoundary><Grading /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><AdminCockpit /></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
            </Routes>
          </ErrorBoundary>
        </div>
        <ComplianceFooter />
        <MobileBottomNav />
        <BackToTop />
      </div>
    </BrowserRouter>
  );
};

export default App;
