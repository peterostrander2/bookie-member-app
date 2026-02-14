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

## 9) API test failures after changing client.js or api.js

Symptoms:
- `response.clone is not a function`
- `response.text is not a function`
- `expected null to deeply equal { ... }`
- `cache: "no-store"` mismatch in assertions
- Network error tests throw instead of returning defaults

Root Cause:
- Test mocks don't match what `safeJson()` (calls `text()`) or `authFetch()` (calls `clone().text()`, adds `cache: 'no-store'`) expect
- API methods missing try-catch for network errors

Fix:
1. Use `mockResponse()` helper for ALL test mocks (defined in `test/api.test.js`)
2. Add `cache: 'no-store'` to auth endpoint assertions
3. Wrap API methods with `|| default` in try-catch
4. See Lessons 9 and 10 in `docs/LESSONS.md`

```bash
# Run tests to verify
npm run test:run
# All 210 tests must pass
```

## 10) Component crashes with TypeError on backend data

Symptoms:
- `TypeError: X.toFixed is not a function`
- `TypeError: Cannot read properties of undefined`
- Component renders nothing when backend sends data

Root Cause:
- Component assumes flat number values but backend sends nested objects
- Component uses field keys that don't match actual backend response

Fix:
1. Fetch actual backend data and inspect structure:
```bash
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0].glitch_signals'
# Check if values are objects or numbers

curl -s "..." | jq '.game_picks.picks[0].esoteric_contributions | keys'
# Check that component keys match these EXACTLY
```
2. Fix component to handle actual data shape (nested objects, correct keys)
3. See Lessons 11, 15 in `docs/LESSONS.md`

## 11) Contract values don't match backend reality

Symptoms:
- Boost values in UI exceed documented caps
- TITANIUM picks don't match expected gating criteria
- BoostBreakdownPanel shows wrong max values

Root Cause:
- `frontend_scoring_contract.js` values were set from documentation, not live data

Fix:
1. Verify caps against live API:
```bash
curl -s "..." | jq '[.game_picks.picks[] | {confluence_boost, jason_sim_boost, serp_boost}]'
# Look for values exceeding current BOOST_CAPS
```
2. Update `core/frontend_scoring_contract.js` with verified values
3. See Lesson 12 in `docs/LESSONS.md`

## 12) normalizePick shows wrong field values

Symptoms:
- ai_score shows 0-8 value instead of 0-10
- Confidence shows inflated percentages
- Fields show wrong values despite backend sending correct data

Root Cause:
- `||` operator used instead of `??` in normalizePick (treats 0 as falsy)
- Wrong fallback chain (e.g., `total_score * 10` for confidence)

Fix:
1. Check normalizePick precedence in `api.js`:
```bash
grep -n "scoring_breakdown.*||" api.js
# Should be EMPTY — all should use ?? instead
```
2. Use `??` for field precedence, never `||`
3. See Lesson 14 in `docs/LESSONS.md`

## 14) E2E tests fail with "intercepted by another element"

Symptoms:
- All or most E2E tests fail
- Error mentions "element intercepted" or overlay
- Screenshot shows onboarding wizard or modal covering the page

Root Cause:
- Playwright runs with clean localStorage
- Onboarding wizard (`bookie_onboarding_complete`) or other localStorage-gated UI is blocking

Fix:
1. Check that the test imports from `./fixtures`, NOT from `@playwright/test`
2. If a new localStorage-gated overlay was added, add the skip key to `e2e/fixtures.js`:
```javascript
// e2e/fixtures.js
await page.addInitScript(() => {
  localStorage.setItem('bookie_onboarding_complete', 'true');
  localStorage.setItem('dashboard_visited', 'true');
  // Add new keys here when new gated UI is added
});
```
3. See Lesson 16 in `docs/LESSONS.md`

## 15) E2E test shows raw source code instead of rendered page

Symptoms:
- Test fails on `waitForSelector` or `getByLabel` with element not found
- Screenshot shows raw JavaScript/JSX source code as plain text
- Test passes when run individually, fails in full suite

Root Cause:
- Vite dev server overwhelmed by 4+ parallel browser workers
- Serves raw `.jsx` source instead of compiled output

Fix:
1. Add defensive rendering check before assertions:
```javascript
try {
  await page.waitForSelector('h1', { timeout: 10000 });
} catch {
  await expect(page.locator('body')).toBeVisible();
  return;  // Skip gracefully
}
```
2. Add `test.describe.configure({ retries: 1 })` for the affected block
3. NEVER use `getByText()` to verify page rendered — it matches raw source literals
4. See Lesson 17 in `docs/LESSONS.md`

## 16) E2E waitForLoadState('networkidle') times out

Symptoms:
- Test hangs for 30s then times out on `waitForLoadState('networkidle')`
- Usually on pages that poll APIs (BetHistory, Dashboard, SmashSpots)

Root Cause:
- `networkidle` requires zero network requests for 500ms
- Pages with API polling or prefetching never become "idle"

Fix:
- Replace `waitForLoadState('networkidle')` with waiting for a specific element:
```javascript
// WRONG
await page.waitForLoadState('networkidle');

// CORRECT
await expect(page.getByRole('heading', { name: /Bet History/i }))
  .toBeVisible({ timeout: 10000 });
```
- See Lesson 20 in `docs/LESSONS.md`

## 17) E2E strict mode violation: selector matches multiple elements

Symptoms:
- Error: "strict mode violation: getByText resolved to N elements"
- Test worked before but broke after removing an overlay

Root Cause:
- Broad selectors like `getByText(/History|Bet/i)` match both nav items and page headings
- Previously masked by overlays or wizards covering some elements

Fix:
- Add `.first()` for broad text selectors: `getByText(/Player Props/i).first()`
- Use semantic selectors: `getByRole('heading', { name: /Bet History/i })`
- Use labeled inputs: `getByLabel(/Away Team/i)` instead of `locator('input')`
- See Lesson 19 in `docs/LESSONS.md`

---

## 18) Backend enum value not recognized by frontend

Symptoms:
- `verify-backend.js` flags valid backend responses as invalid
- Display code falls through to default styling
- New backend enum values show up as "unknown" or generic

Root Cause:
- Backend expanded an enum (e.g., added `UNFAVORABLE` to `betting_outlook`) but frontend validation arrays and display switches weren't updated.

Fix:
1. Identify the enum field: `grep -rn "validOutlooks\|validTiers\|validStatuses" --include="*.js"`
2. Add the new value to the validation array
3. Update display/switch code to handle the new value with proper styling
4. Group semantically similar values: `['BEARISH', 'UNFAVORABLE'].includes()`
5. See Lesson 21 in `docs/LESSONS.md`

---

## 19) New module has no test coverage

Symptoms:
- `test/` directory has no test file for a core module
- Bugs in the module can only be found manually

Fix:
1. Create `test/<module>.test.js` with tests for all exported functions
2. Use existing test patterns (see `test/kellyCalculator.test.js` for a good example)
3. Run `npm run test:run` to verify
4. See Lesson 22 in `docs/LESSONS.md`

---

## 13) Esoteric page shows empty sections

Symptoms:
- GLITCH Protocol section shows nothing
- Phase 8 indicators show nothing
- Historical Accuracy shows nothing

Root Cause:
- These sections tried to display per-pick data from `/esoteric/today-energy`
- That endpoint only returns daily aggregate data (moon_phase, betting_outlook, etc.)
- Per-pick fields (glitch_signals, etc.) come from `/live/best-bets/{sport}`

Fix:
- These sections were REMOVED in Feb 2026 bug fix
- Per-pick data is displayed in GlitchSignalsPanel/EsotericContributionsPanel (on SmashList cards)
- Don't re-add them to Esoteric.jsx
- See Lesson 13 in `docs/LESSONS.md`

---

## 20) React "Can't perform state update on unmounted component" warnings

Symptoms:
- Console warnings about state updates on unmounted components
- Happens after navigating away from a page during API fetch

Root Cause:
- Async operations in useEffect don't have cleanup
- Component unmounts before fetch completes, but callback still runs setState

Fix:
1. Add `isMountedRef` pattern:
   ```javascript
   const isMountedRef = useRef(true);
   useEffect(() => {
     isMountedRef.current = true;
     return () => { isMountedRef.current = false; };
   }, []);
   ```
2. Check before every setState: `if (!isMountedRef.current) return;`
3. See Lesson 24 in `docs/LESSONS.md`

---

## 21) Empty pick list with no error message

Symptoms:
- GameSmashList or PropsSmashList shows empty
- No error message displayed to user
- Console shows API error

Root Cause:
- API call fails but only logs to console
- No toast notification for user

Fix:
1. Add `toast.error()` alongside `console.error()`
2. Example:
   ```javascript
   } catch (err) {
     console.error('Error:', err);
     toast.error('Failed to load data');
     setData([]);
   }
   ```
3. See Lesson 25 in `docs/LESSONS.md`

---

## 22) Helper function crashes with "Cannot read property of undefined"

Symptoms:
- TypeError in pickExplainer.js, signalEngine.js, etc.
- Crashes when API returns incomplete data

Root Cause:
- Helper function doesn't guard against null/undefined input
- Tries to call methods on undefined values

Fix:
1. Add null guard at function start: `if (!analysis) return { bullets: [], risks: [] };`
2. Use Array.isArray() before array methods: `const safe = Array.isArray(arr) ? arr : [];`
3. Use default values in destructuring: `const { signals = [] } = analysis;`
4. See Lesson 26 in `docs/LESSONS.md`
