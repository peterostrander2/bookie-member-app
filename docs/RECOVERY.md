# Frontend Recovery Guide

## 1) 400 / Auth errors

Symptoms:
- API calls return 400/401/403
- Error banner shows missing/invalid API key

Fix:
- Set `VITE_API_BASE_URL` and `VITE_BOOKIE_API_KEY`
- Restart Vite after changing env vars

## 2) Sample data showing in UI

Cause:
- Backend is serving fallback data

Fix:
- Check backend env keys (`ODDS_API_KEY`, `PLAYBOOK_API_KEY`)
- Restart backend service

## 3) White/blank screen

Fix:
- Check ErrorBoundary logs
- Confirm `main.jsx` wraps `<App />` with ErrorBoundary

## 4) Service worker cache issues

Fix:
- DevTools → Application → Service Workers → Unregister
- Hard reload the page

## 5) Contract drift

Fix:
- Run validators:
  - `node scripts/validate_frontend_contracts.mjs`
  - `node scripts/validate_no_frontend_literals.mjs`
  - `node scripts/validate_no_eval.mjs`
