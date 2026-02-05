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
- DevTools -> Application -> Service Workers -> Unregister
- Hard reload the page

## 5) Contract drift

Symptoms:
- Hardcoded values don't match backend thresholds
- Validator scripts fail

Fix:
- Run validators:
  - `node scripts/validate_frontend_contracts.mjs`
  - `node scripts/validate_no_frontend_literals.mjs`
  - `node scripts/validate_no_eval.mjs`
- Fix any violations by importing from `core/frontend_scoring_contract.js`
- See `docs/LESSONS.md` for full history of contract drift bugs

## 6) Missing backend fields in UI

Symptoms:
- New panels (boost breakdown, GLITCH, etc.) show empty or don't appear
- Backend returns fields but frontend doesn't display them

Fix:
- Check `normalizePick()` in `api.js` passes through the field
- Check the display component exists in `components/`
- Check both `GameSmashList.jsx` AND `PropsSmashList.jsx` import the component
- Verify with: `curl ... | jq '.game_picks.picks[0] | keys'`

## 7) Pre-commit hook not running

Symptoms:
- Bad commits slip through without validation

Fix:
```bash
bash scripts/install_git_hooks.sh
```

## 8) Stale engine count references

Symptoms:
- UI says "3/4 engines" or "4 engines" when backend uses 5

Fix:
```bash
grep -rn "3/4\|4 engine\|four engine" --include="*.jsx" --include="*.js"
# Fix any matches
```
