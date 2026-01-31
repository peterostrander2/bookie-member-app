import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry } from './sentry';
import { initAnalytics } from './analytics';
import ErrorBoundary from './ErrorBoundary';

// Initialize error monitoring (before app renders)
initSentry();

// Initialize analytics
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fullPage message="The app hit an unexpected error. Please try again.">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
