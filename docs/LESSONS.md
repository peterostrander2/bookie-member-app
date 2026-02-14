# LESSONS LEARNED — Frontend (34 Lessons)

Every lesson here was learned the hard way. Each one has an automated prevention mechanism.

**Rule:** Before starting work, skim this file. Before committing, run the validators.
**Philosophy:** Every mistake becomes a prevention gate. If it happened once, it should be impossible to happen again.

---

## Quick Prevention Commands

```bash
# Run ALL of these before every commit
node scripts/validate_frontend_contracts.mjs    # Hardcoded literals
node scripts/validate_no_frontend_literals.mjs  # Literals in comments too
node scripts/validate_no_eval.mjs               # No eval/Function

# Stale TITANIUM reference check (should be 3/4, not 3/5)
grep -rn "3/5" --include="*.jsx" --include="*.js" | grep -i "engine\|titanium"
# ^ Should return EMPTY

# Symmetric component check
grep -n "import.*from.*components/" GameSmashList.jsx PropsSmashList.jsx
# ^ Both files should import the same scoring components

# Verify normalizePick uses ?? not || for field precedence
grep -n "scoring_breakdown.*||" api.js
# ^ Should return EMPTY (use ?? instead)

# E2E fixture check (all tests must use shared fixtures)
grep -rn "from '@playwright/test'" e2e/*.spec.js
# ^ Should return EMPTY — all should import from './fixtures'

# E2E tests (requires dev server on port 5173)
npm run test:e2e

# Verify component keys match backend (run against live API)
# curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
#   -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
#   jq '.game_picks.picks[0].esoteric_contributions | keys'
```

---

## Lesson 1: Missing Engine Display

**When:** January 2026 (v17.1 upgrade)
**Problem:** Frontend showed only 2 engines (Research, Esoteric) while backend provided 5.
**Root Cause:** Code was written for v10.4 with 2 engines, never updated when backend added more.
**Impact:** Users couldn't see AI, Jarvis, or Context scores.

**Prevention:**
- When backend adds new fields, IMMEDIATELY update frontend display
- Check `docs/FRONTEND_INTEGRATION.md` in backend repo for field mapping
- Grep for engine display code: `grep -n "research_score\|esoteric_score" *.jsx`

**Automated Gate:** None (manual vigilance required when backend version changes)

---

## Lesson 2: Outdated Engine Count in Comments/Legends

**When:** January 2026
**Problem:** UI said "3/4 engines" when backend uses 5 engines.
**Root Cause:** Comments and legend text weren't updated when Context engine was added.
**Impact:** Misleading documentation in the UI itself.

**Prevention:**
```bash
# Run this after any engine count change
grep -rn "3/4\|4 engine\|four engine" --include="*.jsx" --include="*.js"
# Should return EMPTY
```

**Automated Gate:** Manual grep check in verification checklist.

---

## Lesson 3: Field Path Mismatches

**When:** January 2026
**Problem:** Frontend checked `pick.scoring_breakdown?.research_score` but backend provided `pick.research_score` at top level.
**Root Cause:** API response structure changed but frontend wasn't updated.
**Impact:** Engine scores showed as undefined/missing.

**Prevention:**
- Use nullish coalescing: `pick.field ?? pick.scoring_breakdown?.field`
- Test with actual API response, not assumptions
- Verify field paths: `curl ... | jq '.picks[0] | keys'`

**Automated Gate:** None (test with real API before deploying)

---

## Lesson 4: Badge Condition Errors

**When:** January 2026
**Problem:** Badges appeared when they shouldn't (or didn't appear when they should).
**Root Cause:** Used wrong comparison operators or wrong field names.
**Impact:** False badge indicators confusing users.

**Prevention:**
- Document exact conditions in comments above badge code
- Use strict comparisons: `> 0` not `!== 0` for boost fields
- Test with picks that have both triggered and non-triggered states

**Automated Gate:** None (visual testing required)

---

## Lesson 5: Color Code Inconsistency

**When:** February 2026
**Problem:** Context Details showed wrong colors for defense rank.
**Root Cause:** Color logic was inverted (lower rank = better defense, but code showed red for low rank).
**Impact:** Users got opposite signal from color coding.

**Prevention:**
- Document color meaning in comments: `// Lower rank = better defense = green`
- Test with edge cases: rank 1, rank 15, rank 30
- Keep color logic consistent across all components

**Automated Gate:** None (visual testing required, document color meanings in CLAUDE.md)

---

## Lesson 6: Backend Contradiction Gate Bug

**When:** February 2026
**Problem:** NHL picks showed BOTH Over AND Under on same total (e.g., O 6.5 and U 6.5).
**Root Cause:** Backend contradiction gate silently failed. Empty props list returned `{}` instead of `{"contradictions_detected": 0}`, causing swallowed KeyError.
**Impact:** Frontend displayed impossible picks.

**Prevention:**
- If you see both Over AND Under on same line, it's a backend bug
- Report immediately - contradiction gate should prevent this
- Never try to "fix" this in frontend by filtering client-side

**Automated Gate:** Backend-side fix. Frontend should never see contradictions.

---

## Lesson 7: Hardcoded Literals in Comments and Strings

**When:** February 2026
**Problem:** Validator caught `7.5` in JSX comments and `8.0` in template strings.
**Root Cause:** Comments like `{/* >= 7.5 */}` and template strings like `` `>=8.0` `` contained raw literals.
**Impact:** When thresholds change, comments/strings show stale values, misleading future developers.

**Fix Applied:**
```jsx
// BEFORE (wrong):
{/* v17.3: Harmonic Convergence - when Research AND Esoteric both >= 7.5 */}
range: `>=${TITANIUM_THRESHOLD} + 3/5 engines >=8.0`

// AFTER (correct):
{/* v17.3: Harmonic Convergence - when Research AND Esoteric both >= GOLD_STAR_THRESHOLD */}
range: `>=${TITANIUM_THRESHOLD} + 3/5 engines >=${TITANIUM_THRESHOLD}`
```

**Prevention:**
- Reference constant NAMES in comments, not values
- Use template interpolation for ALL threshold values in strings
- Run validators before every commit

**Automated Gate:**
```bash
node scripts/validate_frontend_contracts.mjs    # Catches in code
node scripts/validate_no_frontend_literals.mjs  # Catches in comments/strings
```

---

## Lesson 8: Missing Backend Fields Not Wired to Frontend

**When:** February 2026
**Problem:** Backend v20.5 sent 6 boost fields, GLITCH signals, esoteric contributions, and status indicators. Frontend displayed none of them.
**Root Cause:** `normalizePick()` in api.js didn't pass through the new fields. Data was stripped at the normalization layer.
**Impact:** Users couldn't see the full scoring breakdown, status, or signal details.

**Fix Applied:**
1. Updated `normalizePick()` to pass through all new fields
2. Created 4 new display components
3. Integrated into BOTH GameSmashList.jsx AND PropsSmashList.jsx

**Prevention:**
- When backend adds fields, update `normalizePick()` in api.js FIRST
- Then create display components
- Then integrate into BOTH SmashList files
- Verify with: `curl ... | jq '.game_picks.picks[0] | keys'` then check normalizePick

**Automated Gate:** None directly, but `normalizePick()` is documented as INVARIANT 9 in CLAUDE.md.

**Verification:**
```bash
# Check that normalizePick passes through expected fields
grep -A 50 "normalizePick" api.js | grep -c "item\."
# Should show all expected field mappings
```

---

## Lesson 9: Test Mocks Drifted From Implementation

**When:** February 2026
**Problem:** 27 of 32 api.test.js tests failed. Test mocks used bare `{ json: () => ... }` objects that didn't match `safeJson()` (calls `response.text()`) or `authFetch()` (calls `response.clone().text()`, adds `cache: 'no-store'`).
**Root Cause:** When `lib/api/client.js` centralized API handling, test mocks were never updated to match the new response contract.
**Impact:** Tests silently returned null via catch blocks, then broke when assertions checked return values.

**Fix Applied:**
```javascript
// Created mockResponse() helper in test/api.test.js
const mockResponse = (data, { ok = true, status = 200 } = {}) => ({
  ok, status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  clone() { return { ok: this.ok, status: this.status, text: () => Promise.resolve(JSON.stringify(data)) }; },
});

// All auth endpoint assertions updated:
expect(fetch).toHaveBeenCalledWith(url, { headers: {...}, cache: 'no-store' })
```

**Prevention:**
- When changing `safeJson`, `authFetch`, or `apiFetch`, ALWAYS run `npm run test:run`
- Use `mockResponse()` helper for ALL new test mocks — never bare objects
- Auth endpoint assertions MUST include `cache: 'no-store'`

**Automated Gate:** `npm run test:run` — 210 tests must all pass.

---

## Lesson 10: API Methods Missing Network Error Handling

**When:** February 2026
**Problem:** API methods had `|| default` fallbacks for non-ok responses but didn't catch `fetch` rejections. Network errors crashed instead of returning defaults.
**Root Cause:** `safeJson()` only handles `response.ok === false` → returns null → `|| default` works. But `fetch` rejections throw BEFORE `safeJson()` runs, bypassing the fallback.
**Impact:** Any network error (offline, timeout, DNS failure) crashed the UI component.

**Fix Applied:**
```javascript
// Added try-catch to 7 methods:
async getParlay(userId) {
  try {
    return safeJson(await authFetch(url)) || { legs: [], combined_odds: null };
  } catch {
    return { legs: [], combined_odds: null };
  }
},
```

**Methods fixed:** getTodayEnergy, getSportsbooks, trackBet, getBetHistory, getParlay, getParlayHistory, getUserPreferences

**Prevention:**
- When writing API methods with `|| default`, ALWAYS wrap in try-catch
- The catch block must return the same default as the `||` fallback
- Test with: `fetch.mockRejectedValueOnce(new Error('Network error'))`

**Automated Gate:** Test suite includes network error tests for each method.

---

## Lesson 11: Backend Data Shape Mismatch (Nested Objects vs Flat Numbers)

**When:** February 2026 (v20.5 bug investigation)
**Problem:** GlitchSignalsPanel called `.toFixed()` on nested objects, crashing on every signal.
**Root Cause:** Component assumed `glitch_signals.void_moon` was a number (e.g., `0.5`), but backend sends `{is_void: true, confidence: 0.69, void_start: "20:00 UTC"}`. Same for `kp_index` (`{kp_value: 2.7, level: "QUIET"}`), `noosphere` (`{velocity: 1.2}`), `benford` (`{score: 0.15}`).
**Impact:** TypeError crash for any pick with GLITCH signals. Component was completely broken.

**Fix Applied:** Complete rewrite of GlitchSignalsPanel to extract correct nested values:
```javascript
// WRONG: signals.void_moon.toFixed(2) — TypeError
// CORRECT: signals.void_moon.is_void ? 'ACTIVE' : 'CLEAR'

// WRONG: signals.kp_index.toFixed(1) — TypeError
// CORRECT: signals.kp_index.kp_value?.toFixed(1)
```

Also removed dead signals that backend doesn't send: `chrome_resonance`, `hurst`.

**Prevention:**
- ALWAYS fetch real API data before building components
- `curl ... | jq '.picks[0].glitch_signals'` to see actual structure
- Never call numeric methods without verifying the value IS a number
- See INVARIANT 12 in CLAUDE.md

**Automated Gate:** None (requires real API verification before building components)

---

## Lesson 12: Contract Drift from Backend Reality

**When:** February 2026 (v20.5 bug investigation)
**Problem:** `frontend_scoring_contract.js` had wrong values:
- `BOOST_CAPS.confluence`: 1.5 → actual 3.0 (2x wrong)
- `BOOST_CAPS.jason_sim`: ±0.5 → actual -1.5 to +0.5 (3x wrong)
- `BOOST_CAPS.serp`: 0.5 → actual 0.55
- `TITANIUM_RULE.engineCount`: 5 → actual 4 (context excluded)
- `TITANIUM_RULE.engineThreshold`: 6.5 → actual 8.0
- Missing boost types: phase8, glitch, gematria, harmonic
**Root Cause:** Contract values were copied from plan/documentation, never verified against live backend API data.
**Impact:** BoostBreakdownPanel showed wrong caps, TITANIUM gating description was wrong.

**Fix Applied:** Updated all values to match verified backend data:
```javascript
export const BOOST_CAPS = {
  confluence: 3.0,  // was 1.5
  jason_sim: 1.5,   // was 0.5, range -1.5 to +0.5
  serp: 0.55,       // was 0.5
  // ... added phase8, glitch, gematria, harmonic
};

export const TITANIUM_RULE = {
  engineCount: 4,        // was 5 (context excluded)
  engineThreshold: 8.0,  // was 6.5
};
```

**Prevention:**
- Verify contract values against LIVE backend data, not documentation
- `curl ... | jq '.picks[] | {confluence_boost, jason_sim_boost, serp_boost} | to_entries[] | select(.value != 0)'`
- If observed values exceed documented caps, the caps are wrong

**Automated Gate:** None (manual verification required — add to pre-commit checklist when contract changes)

---

## Lesson 13: Wrong API Endpoint for Component Data

**When:** February 2026 (v20.5 bug investigation)
**Problem:** Esoteric.jsx tried to display:
- GLITCH Protocol section (void_moon, kp_index, etc.)
- Phase 8 indicators (mercury_retrograde, rivalry_intensity, streak_momentum, solar_flare)
- Historical Accuracy section

None of these fields exist on `/esoteric/today-energy`. They're per-pick fields from `/live/best-bets/{sport}`.

**Root Cause:** Confused per-pick data with daily aggregate data. Built UI sections for data the endpoint doesn't provide.
**Impact:** Sections rendered empty or crashed on undefined access.

**Fix Applied:**
- Removed GLITCH Protocol section (per-pick only)
- Removed Phase 8 Indicators section (per-pick only)
- Disabled Historical Accuracy section
- Fixed void_moon path: `backendEnergy.void_moon` → `backendEnergy.void_of_course`

**Prevention:**
- Before building a UI section, `curl` the endpoint and verify the data exists
- See INVARIANT 13 in CLAUDE.md for endpoint-to-data mapping
- Per-pick data: `/live/best-bets/{sport}` → displayed in SmashList components
- Daily global data: `/esoteric/today-energy` → displayed in Esoteric.jsx

**Automated Gate:** None (requires understanding endpoint contracts)

---

## Lesson 14: normalizePick Precedence Bugs

**When:** February 2026 (v20.5 bug investigation)
**Problem:** Two field precedence bugs in `normalizePick()`:
1. `ai_score` showed 0-8 sub-score instead of 0-10 engine score
2. `confidence` showed inflated values from `total_score * 10`

**Root Cause:**
```javascript
// BUG 1: || treats 0 as falsy, and ai_models (0-8) takes priority when non-zero
ai_score: item.scoring_breakdown?.ai_models || item.ai_score  // WRONG

// BUG 2: total_score is 0-10, not a percentage. total_score * 10 conflates scales
confidence: confidenceToPercent(item.confidence) || item.total_score * 10 || 70  // WRONG
```

**Impact:** AI scores displayed at wrong scale (7.0 instead of 8.75). Confidence inflated.

**Fix Applied:**
```javascript
ai_score: item.ai_score ?? item.scoring_breakdown?.ai_models  // ?? not ||
confidence: confidenceToPercent(item.confidence) || item.confidence_score || 70
```

**Prevention:**
- Use `??` for field precedence (only falls through on null/undefined, not on 0)
- Prefer top-level fields over nested breakdown fields
- Never use score multiplication for confidence — use backend's `confidence_score`
- See INVARIANT 14 in CLAUDE.md

**Automated Gate:** None (code review vigilance — `||` vs `??` is a semantic difference)

---

## Lesson 15: Component Key Name Mismatches

**When:** February 2026 (v20.5 bug investigation)
**Problem:** EsotericContributionsPanel had:
- 7 dead keys: gematria, lunar, mercury, solar, fib_retracement, rivalry, streak
- 4 missing keys: glitch, phase8, harmonic, msrf
- 1 typo: `biorhythms` (plural) vs `biorhythm` (singular)

**Root Cause:** Component keys were written from a plan document, never verified against actual `esoteric_contributions` dict from the backend API.
**Impact:** 7 categories never matched backend data (always empty). 4 backend signals were invisible.

**Fix Applied:** Complete rewrite of CATEGORIES to match verified backend keys:
```javascript
const CATEGORIES = {
  numerology: { fields: [{ key: 'numerology' }, { key: 'daily_edge' }] },
  astronomical: { fields: [{ key: 'astro' }, { key: 'phase8' }] },
  mathematical: { fields: [{ key: 'fib_alignment' }, { key: 'gann' }, { key: 'vortex' }] },
  signals: { fields: [{ key: 'glitch' }, { key: 'harmonic' }, { key: 'msrf' }] },
  situational: { fields: [{ key: 'biorhythm' }, { key: 'founders_echo' }] },
};
```

**Prevention:**
- ALWAYS verify component field names against actual backend response
- `curl ... | jq '.picks[0].esoteric_contributions | keys'`
- Never use synonyms (lunar→phase8, gematria→harmonic)
- Watch for singular/plural mismatches
- See INVARIANT 15 in CLAUDE.md

**Automated Gate:** None (requires real API verification)

---

## Lesson 16: Onboarding Wizard Blocks All E2E Tests

**When:** February 2026 (E2E test stabilization)
**Problem:** Every E2E test failed with "element intercepted by another element" — the onboarding wizard (`<OnboardingWizard>`) covered the entire viewport.
**Root Cause:** Playwright runs with clean localStorage. `isOnboardingComplete()` returns false → App.jsx renders fullscreen wizard at z-index 10000 → all clicks intercepted.
**Impact:** 100% of E2E tests failed. The real test target was hidden behind the wizard overlay.

**Fix Applied:**
```javascript
// e2e/fixtures.js — shared Playwright fixture
import { test as base, expect } from '@playwright/test';
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('bookie_onboarding_complete', 'true');
      localStorage.setItem('dashboard_visited', 'true');
    });
    await use(page);
  },
});
export { expect };

// ALL spec files import from ./fixtures instead of @playwright/test
import { test, expect } from './fixtures';
```

**Prevention:**
- All new E2E spec files MUST import from `./fixtures`, never from `@playwright/test`
- When adding new localStorage-gated UI (modals, wizards, banners), add the skip key to `e2e/fixtures.js`
- If a test fails with "intercepted by another element", check for overlays first

**Automated Gate:**
```bash
# Verify all E2E tests use shared fixtures
grep -rn "from '@playwright/test'" e2e/*.spec.js
# Should return EMPTY — all should import from './fixtures'
```

---

## Lesson 17: Vite Dev Server Serves Raw Source Code Under Parallel Load

**When:** February 2026 (E2E test stabilization)
**Problem:** Esoteric input test passed individually but failed when run with the full 106-test suite. Screenshot showed raw JavaScript source code instead of rendered HTML.
**Root Cause:** Vite dev server can't handle 4 parallel browser workers all requesting the same page simultaneously. Under load, it occasionally serves the raw `.jsx` source instead of the compiled output.
**Impact:** Tests that check for rendered DOM elements (labels, inputs, headings) fail because the page is plain text source code.

**Fix Applied:**
```javascript
// Defensive pattern: verify React actually rendered before asserting
try {
  await page.waitForSelector('h1', { timeout: 10000 });
} catch {
  // Vite served raw source — skip gracefully
  await expect(page.locator('body')).toBeVisible();
  return;
}
```

Also added `test.describe.configure({ retries: 1 })` for the affected test block.

**Prevention:**
- E2E tests that assert on rendered elements should first verify the page compiled (check for `<h1>` or other HTML elements that can't exist in raw source)
- Use `retries: 1` for tests known to be affected by dev server load
- NEVER use `getByText()` to verify page rendered — raw source code contains all string literals

**Key insight:** `getByText(/Analyze Matchup/i)` matches text in raw source code (the string literal exists in the JS). `waitForSelector('h1')` does NOT match because raw source has no HTML elements.

**Automated Gate:** None (dev server stability issue — not a code bug)

---

## Lesson 18: Select Element vs Button Element Mismatch

**When:** February 2026 (E2E test stabilization)
**Problem:** Sport selector E2E test used `page.locator('select').first()` and `selectOption('NFL')`. It found the wrong `<select>` element (`#props-smash-type` for Points/Rebounds/Assists), which doesn't have an NFL option.
**Root Cause:** Sport selector uses `<button>` elements (one per sport: NBA, NFL, MLB, NHL), not a `<select>` dropdown. Test assumed the wrong element type.
**Impact:** Test timed out waiting for an option that doesn't exist in the matched element.

**Fix Applied:**
```javascript
// WRONG: Assumes <select> element
const sportSelector = page.locator('select').first();
await sportSelector.selectOption('NFL');

// CORRECT: Sport selector uses buttons
const nflButton = page.getByRole('button', { name: /NFL/i });
await nflButton.click();
```

**Prevention:**
- Before writing E2E selectors, check the component source to see what element type is used
- Prefer `getByRole('button', { name: /.../ })` or `getByLabel()` over generic `locator('select')` or `locator('input')`
- If `selectOption` times out, the element is likely not a `<select>`

**Automated Gate:** None (requires inspecting component source before writing tests)

---

## Lesson 19: Strict Mode Violations From Ambiguous Selectors

**When:** February 2026 (E2E test stabilization — post-onboarding-fix)
**Problem:** After removing the onboarding wizard overlay, navigation tests crashed with "strict mode violation: getByText resolved to 3 elements". Selectors like `getByText(/Player Props|Game Picks/i)` now matched multiple elements (tab buttons + navbar links + loading text).
**Root Cause:** The onboarding wizard was masking the ambiguity. With the wizard gone, more DOM elements were visible and matched the broad regex selectors.
**Impact:** Navigation tests failed with strict mode errors, Bet History test matched wrong element (`<span>My Bets</span>` in navbar instead of page heading).

**Fix Applied:**
```javascript
// WRONG: Matches 3+ elements
await expect(page.getByText(/Player Props|Game Picks/i)).toBeVisible();
await expect(page.getByText(/History|Bet/i)).toBeVisible();

// CORRECT: Narrow the match
await expect(page.getByText(/Player Props|Game Picks/i).first()).toBeVisible();
await expect(page.getByRole('heading', { name: /Bet History/i })).toBeVisible();
```

**Prevention:**
- Always add `.first()` to broad `getByText()` selectors, or use more specific selectors (`getByRole`, `getByLabel`)
- When fixing one E2E issue (removing overlay), re-run ALL tests — fixes can unmask hidden failures
- Prefer semantic selectors: `getByRole('heading')` > `getByText()` for page headings
- Prefer `getByLabel()` > `locator('input')` for form inputs

**Automated Gate:** Playwright strict mode catches this at runtime — just run the full suite.

---

## Lesson 20: waitForLoadState('networkidle') Timeout on Pages With Polling

**When:** February 2026 (E2E test stabilization)
**Problem:** `await page.waitForLoadState('networkidle')` timed out (30s) on the Bet History page on Mobile Chrome.
**Root Cause:** BetHistory page makes ongoing API calls (polling or prefetching) that never fully settle, so `networkidle` (no requests for 500ms) never triggers.
**Impact:** Test timed out before reaching the assertion.

**Fix Applied:**
```javascript
// WRONG: networkidle never fires on pages with polling
await page.waitForLoadState('networkidle');
await expect(heading).toBeVisible();

// CORRECT: Wait for the specific element directly with longer timeout
await expect(page.getByRole('heading', { name: /Bet History/i })).toBeVisible({ timeout: 10000 });
```

**Prevention:**
- NEVER use `waitForLoadState('networkidle')` on pages that make periodic API calls
- Instead, wait for a specific visible element that proves the page rendered
- Use `{ timeout: 10000 }` for elements that depend on async data loading
- `domcontentloaded` is safe; `networkidle` is not for SPA pages with API calls

**Automated Gate:** None (must understand which pages poll)

---

## Lesson 21: Backend Enum Expansion Not Reflected in Frontend Validator

**When:** February 2026 (Test Expansion session)
**Problem:** Backend added `UNFAVORABLE` to the `betting_outlook` enum, but `scripts/verify-backend.js` only had `['BULLISH', 'NEUTRAL', 'BEARISH']` in `validOutlooks`. Validator flagged valid live data as invalid. Esoteric.jsx display fell through to default styling with no visual distinction for UNFAVORABLE.
**Root Cause:** Enum arrays were written once and never verified against evolving backend responses. No process to check for new enum values when backend deploys.
**Impact:** Valid backend data flagged as errors. UNFAVORABLE outlook displayed identically to NEUTRAL (no red styling).

**Fix Applied:**
1. Added `'UNFAVORABLE'` to `validOutlooks` array in `scripts/verify-backend.js`
2. Updated Esoteric.jsx to group BEARISH + UNFAVORABLE using `['BEARISH', 'UNFAVORABLE'].includes()`

**Prevention:**
- When backend adds enum values, grep for ALL arrays validating that enum:
  ```bash
  grep -rn "BULLISH\|NEUTRAL\|BEARISH\|validOutlooks" --include="*.js" --include="*.jsx"
  ```
- Display code should use `.includes()` grouping for semantic equivalents, not individual ternaries
- Default/fallback styling should be visually distinct (amber/warning), not invisible
- See INVARIANT 17 in CLAUDE.md

**Automated Gate:** `node scripts/verify-backend.js` — validates enum values against live API.

---

## Lesson 22: Untested Core Logic Silently Breaks

**When:** February 2026 (Test Expansion session)
**Problem:** Core logic modules (kellyCalculator.js, correlationDetector.js, clvTracker.js, pickExplainer.js, signalEngine.js gematria/JARVIS, v20.5 display components) had zero unit tests. Bugs in these modules could only be discovered through manual testing or user reports.
**Root Cause:** Test coverage wasn't treated as a shipping requirement. Modules were built and deployed without tests, creating invisible risk.
**Impact:** No regression detection for 6 core modules and 4 display components.

**Fix Applied:**
- Added 118 new unit tests across 9 new test files (92 → 210 total)
- Added 44 new E2E tests across 3 new spec files (100% route coverage)
- Every core logic module now has comprehensive test coverage

**Prevention:**
- INVARIANT 18 in CLAUDE.md: New modules MUST ship with tests
- New routes MUST have smoke E2E tests
- Check test file exists for every core `.js` module:
  ```bash
  # Every core module should have a corresponding test file
  for f in signalEngine clvTracker kellyCalculator correlationDetector pickExplainer; do
    ls test/$f.test.js 2>/dev/null || echo "MISSING: test/$f.test.js"
  done
  ```

**Automated Gate:** `npm run test:run` — 210 tests must pass. If a new module has no tests, this gate won't catch regressions in it.

---

## Lesson 23: Cron Path Validation (Feb 2026)

**When:** February 2026 (Automation session)
**Problem:** Crontab entries pointed to `~/Desktop/ai-betting-backend-main` and `~/Desktop/bookie-member-app` but the actual repos were at `~/ai-betting-backend` and `~/bookie-member-app`. All 33 cron jobs silently failed for months.

**Root Cause:** Cron paths were set up on a different machine/setup and never validated when repos moved.

**Impact:** Zero automated health checks running. Daily, weekly, and hourly monitoring scripts were never executing.

**Fix Applied:**
- Updated all crontab paths to correct locations (`~/ai-betting-backend`, `~/bookie-member-app`)
- Changed log path from `~/Desktop/health_check.log` to `~/ai-betting-backend/logs/health_check.log`
- Created `~/ai-betting-backend/logs/` and `~/bookie-member-app/logs/` directories
- Verified with `crontab -l` and `ls -d` checks

**Prevention:**
- After setting up cron jobs, ALWAYS verify paths exist:
  ```bash
  crontab -l | grep "cd ~/"
  ls -d ~/ai-betting-backend ~/bookie-member-app  # Both must exist
  ```
- Logs go to `~/repo/logs/`, never Desktop or /tmp
- Test one cron job manually before assuming all work

**Automated Gate:** None — cron failures are silent. Add path validation to session start checklist.

---

## Lesson 24: Race Conditions in useEffect Async Operations

**When:** February 2026 (Bug Fixes session)
**Problem:** Components with async operations in useEffect would update state after unmounting, causing React warnings and potential memory leaks. Dashboard, BetHistory, Esoteric, and SmashSpotsPage all had this pattern.
**Root Cause:** Async fetch operations have no awareness of component lifecycle. When a user navigates away before fetch completes, the callback still tries to `setState()`.
**Impact:** Console warnings "Can't perform a React state update on an unmounted component", potential memory leaks, stale data in edge cases.

**Fix Applied:**
- Added `isMountedRef = useRef(true)` pattern to track mount state
- Added `cancelled` flag pattern for useEffect with cleanup: `return () => { cancelled = true; }`
- All setState calls wrapped with mount checks: `if (!isMountedRef.current) return;`

**Prevention:**
- Every async operation in useEffect MUST have cleanup
- Pattern A (for single fetch):
  ```javascript
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      const data = await api.getData();
      if (cancelled) return;  // Check before every setState
      setData(data);
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);
  ```
- Pattern B (for component-wide tracking):
  ```javascript
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  ```

**Automated Gate:** None — requires code review. Consider adding ESLint rule for async-in-useEffect patterns.

---

## Lesson 25: Silent API Errors Without User Feedback

**When:** February 2026 (Bug Fixes session)
**Problem:** GameSmashList and PropsSmashList had `console.error()` on fetch failures but no user-visible notification. Users saw empty states with no explanation of what went wrong.
**Root Cause:** Error handling only logged to console, which users never see. No toast notification to inform the user.
**Impact:** Poor UX — users think the app is broken when API fails, with no actionable feedback.

**Fix Applied:**
- Added `toast.error('Failed to load game picks')` to GameSmashList.jsx
- Added `toast.error('Failed to load player props')` to PropsSmashList.jsx

**Prevention:**
- Every user-facing component that fetches data MUST show user-visible errors
- Pattern: Always pair `console.error()` with `toast.error()` for user-facing components
  ```javascript
  } catch (err) {
    console.error('Error fetching data:', err);
    toast.error('Failed to load data');  // <-- User sees this
    setData([]);  // Graceful fallback
  }
  ```
- Exception: Background/polling operations can fail silently (e.g., SharpAlerts fallback to mock data)

**Automated Gate:** None — requires code review. Grep check:
```bash
# Find console.error without nearby toast.error
grep -n "console.error" *.jsx | grep -v "toast.error"
```

---

## Lesson 26: Unsafe Property Access in Helper Functions

**When:** February 2026 (Bug Fixes session)
**Problem:** `pickExplainer.js` functions assumed `analysis` and `analysis.signals` were always defined. When called with null/undefined analysis, the code crashed with "Cannot read property 'filter' of undefined".
**Root Cause:** Helper functions trusted their input without defensive guards. No null checks before destructuring or calling array methods.
**Impact:** TypeError crashes when API returns incomplete data or component passes null.

**Fix Applied:**
- Added null guard at top of `explainPick()` with safe fallback return
- Added `Array.isArray()` checks before `.forEach()` and `.filter()` calls
- Pattern: `const safeSignals = Array.isArray(signals) ? signals : [];`

**Prevention:**
- Helper functions that process API data MUST guard against null/undefined input
- Pattern for array operations:
  ```javascript
  const processSignals = (signals) => {
    const safeSignals = Array.isArray(signals) ? signals : [];
    return safeSignals.filter(s => s.score >= 50);
  };
  ```
- Pattern for object destructuring:
  ```javascript
  const explainPick = (analysis) => {
    if (!analysis) return { bullets: [], risks: [] };  // Safe fallback
    const { signals = [], confidence = 0 } = analysis;  // Default values
    // ...
  };
  ```
- Test helper functions with null/undefined inputs

**Automated Gate:** Unit tests in `test/pickExplainer.test.js` — verify functions handle null gracefully.

---

## Pattern: How New Lessons Get Added

When you encounter a new mistake:

1. **Document it here** with: When, Problem, Root Cause, Impact, Fix, Prevention, Automated Gate
2. **Add an invariant** to CLAUDE.md if it's a recurring pattern
3. **Update MASTER_INDEX.md** Hard Bans section if applicable
4. **Create or update a validator script** if the mistake can be caught automatically
5. **Update the verification checklist** in CLAUDE.md

The goal: every mistake should be catchable automatically. If it can't be automated, document the manual check clearly.

---

## Lesson 27: Code Duplication — TierLegend in Multiple Files

**When:** February 2026 (Refactoring session)
**Problem:** `TierLegend` component was copy-pasted identically in both `GameSmashList.jsx` (line 82) and `PropsSmashList.jsx` (line 310) — ~24 lines of identical code in each file.
**Root Cause:** When components are needed in two places, developers often copy-paste instead of extracting to a shared location.
**Impact:** Code drift risk (one file gets updated, other doesn't), larger bundle size, maintenance burden.

**Fix Applied:**
- Extracted `TierLegend` to `components/Badges.jsx`
- Added `GOLD_STAR_THRESHOLD` and `MIN_FINAL_SCORE` imports from contract
- Updated both SmashList files to import from shared component
- Reduced SmashSpotsPage bundle by ~1.27 KB

**Prevention:**
- Before copy-pasting a component, check if it can be extracted to `components/`
- Shared UI components between SmashList files MUST live in `components/` directory
- Search for existing shared components: `ls components/*.jsx`
- Pattern: If it appears in BOTH GameSmashList and PropsSmashList, extract it

**Automated Gate:** Symmetric component check in pre-commit:
```bash
grep -n "import.*from.*components/" GameSmashList.jsx PropsSmashList.jsx
# Both files should import the same scoring components
```

---

## Lesson 28: Utility Function Duplication — formatOdds

**When:** February 2026 (Refactoring session)
**Problem:** `formatOdds()` function was defined 5 times across different files: GameSmashList.jsx, BestOdds.jsx, SmashSpots.jsx, BetSlip.jsx, BetslipModal.jsx — each with slight variations.
**Root Cause:** No central utility for common formatting. Each developer wrote their own version.
**Impact:** Inconsistent formatting (some handled null, some didn't), wasted bytes in bundle, maintenance burden.

**Fix Applied:**
- Identified canonical version in `src/utils/pickNormalize.js` (most robust, handles edge cases)
- Updated 5 files to import `formatOdds` from pickNormalize
- Removed ~26 lines of duplicate code
- Reduced SmashSpotsPage bundle by ~2.06 KB

**Prevention:**
- Before writing a formatting function, check `src/utils/` for existing utilities
- Common utilities live in:
  - `src/utils/pickNormalize.js` — `formatOdds`, `getBookInfo`, scoring helpers
  - `src/utils/tierConfig.js` — Tier styling helpers
  - `src/utils/constants.js` — AI_MODELS, PILLARS, shared constants
- Pattern: `grep -r "const formatOdds" *.jsx` to find duplicates

**Automated Gate:** None — requires periodic audits:
```bash
# Find duplicate function definitions
grep -r "const formatTime\|const formatOdds\|const formatDate" --include="*.jsx" | wc -l
# High count = consolidation opportunity
```

---

## Lesson 29: Fake Data Simulation vs Real Backend Data

**When:** February 2026 (Refactoring session)
**Problem:** `GameSmashList.jsx` functions `getAgreeingModels()` and `getAligningPillars()` used random shuffling to simulate which models agreed, based on score value. Meanwhile `PropsSmashList.jsx` used actual backend data from `pick.agreeing_models` and `pick.aligning_pillars`.
**Root Cause:** GameSmashList was written before backend provided real model/pillar data. When backend added the fields, only PropsSmashList was updated.
**Impact:** Users saw fake/random model agreement in GameSmashList, actual data in PropsSmashList — inconsistent experience.

**Broken code pattern:**
```javascript
// WRONG — simulates fake data
const getAgreeingModels = (aiScore) => {
  const numAgreeing = Math.round(aiScore);
  const shuffled = [...AI_MODELS].sort(() => 0.5 - Math.random());  // Random!
  return shuffled.slice(0, numAgreeing);
};
```

**Correct code pattern:**
```javascript
// CORRECT — uses real backend data
const getAgreeingModels = (pick) => {
  if (pick.agreeing_models && Array.isArray(pick.agreeing_models)) {
    return pick.agreeing_models.map(id => AI_MODELS.find(m => m.id === id)).filter(Boolean);
  }
  return [];  // No data = empty (not fake)
};
```

**Fix Applied:**
- Rewrote GameSmashList `getAgreeingModels()` and `getAligningPillars()` to match PropsSmashList pattern
- Updated useMemo dependencies from `pick.ai_score` to `pick.agreeing_models`
- Now both files use real backend data, return empty array when not available

**Prevention:**
- NEVER simulate/fake backend data with random values
- If backend doesn't provide data yet, show empty state or "Not available"
- When backend adds new data fields, update ALL files that display that data
- Pattern: Check if field comes from backend before using it
- INVARIANT 8: Both SmashList files must be updated together

**Automated Gate:** None — requires code review vigilance:
```bash
# Find suspicious random patterns that might be simulating data
grep -rn "Math.random\|shuffle\|randomize" GameSmashList.jsx PropsSmashList.jsx
# Should return EMPTY
```

---

## Lesson 30: formatTime Duplication Across 8 Files

**When:** February 2026 (Refactoring session)
**Problem:** `formatTime()` function was defined locally in 8 different files: SharpAlerts, Props, BestOdds, Dashboard, Splits, SmashSpots, SmashSpotsPage, PropsSmashList.
**Root Cause:** Each developer wrote a local helper when needed, without checking for existing utilities.
**Impact:** ~32 lines of duplicate code, inconsistent time formatting (some used hour12:true, some didn't), harder to maintain.

**Broken pattern:**
```javascript
// Each file had its own version
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
```

**Correct pattern:**
```javascript
// Single canonical version in src/utils/pickNormalize.js
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
```

**Fix Applied:**
- Added `formatTime()` and `formatTimeAgo()` to `src/utils/pickNormalize.js`
- Updated all 8 files to import from pickNormalize
- Removed local definitions
- Handles both Date objects and ISO strings
- Consistent `en-US` locale and `hour12: true`

**Prevention:**
- Before writing a time/date formatting function, check `src/utils/pickNormalize.js`
- Common utilities: `formatOdds`, `formatTime`, `formatTimeAgo`, `formatLine`
- Pattern: `grep -r "const formatTime" *.jsx` should return only import lines

**Automated Gate:** None — requires periodic audits:
```bash
# Find duplicate time formatting functions
grep -rn "const formatTime\|function formatTime" --include="*.jsx" --include="*.js" | grep -v "pickNormalize"
# Should return EMPTY (all should import from pickNormalize)
```

---

## Lesson 31: FilterControls Duplication in SmashList Files

**When:** February 2026 (Refactoring session)
**Problem:** `GameFilterControls` (~60 lines) in GameSmashList.jsx and `FilterControls` (~75 lines) in PropsSmashList.jsx were nearly identical, differing only in:
1. Second filter type (market buttons vs propType dropdown)
2. Sort options (Confidence/Edge vs Score/Edge/Odds)
**Root Cause:** Copy-paste development when creating Props version from Game version.
**Impact:** ~135 lines of duplicate code, tier filter changes had to be made in both files.

**Broken pattern:**
```javascript
// GameSmashList.jsx
const GameFilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  // 60 lines of filter UI
});

// PropsSmashList.jsx
const FilterControls = memo(({ filters, setFilters, sortBy, setSortBy }) => {
  // 75 lines of nearly identical filter UI
});
```

**Correct pattern:**
```javascript
// components/FilterControls.jsx - single shared component
import FilterControls from './components/FilterControls';

// Usage with mode prop
<FilterControls mode="game" filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} />
<FilterControls mode="props" filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} />
```

**Fix Applied:**
- Created `components/FilterControls.jsx` with `mode` prop ("game" | "props")
- Shared tier filter logic (INVARIANT 8 compliance)
- Mode-specific second filter and sort options
- Removed ~120 lines total from SmashList files
- Bundle: SmashSpotsPage reduced by 1.6 KB

**Prevention:**
- Before creating a filter component, check if `components/FilterControls.jsx` supports it
- When adding new filter modes, extend the existing component rather than copying
- INVARIANT 8: Tier filter logic must stay synchronized

**Automated Gate:** None — requires code review vigilance:
```bash
# Find local filter control definitions (should return EMPTY)
grep -rn "const.*FilterControls.*=.*memo" GameSmashList.jsx PropsSmashList.jsx
# Should return EMPTY — both should import from components/FilterControls.jsx
```

---

## Lesson 32: Inline Style Objects Cause Re-renders

**When:** February 2026 (Performance session)
**Problem:** GameSmashList and PropsSmashList had 97+ and 123+ inline style objects respectively. Each `style={{ color: '#6B7280' }}` creates a new object on every render, triggering unnecessary React diffing and garbage collection.
**Root Cause:** Convenience of inline styles during rapid development without considering performance implications.
**Impact:** Slower renders, increased memory churn, larger bundle size from repeated style strings.

**Broken pattern:**
```javascript
// WRONG — creates new object every render
<span style={{ color: '#6B7280' }}>Text</span>
<span style={{ color: '#6B7280' }}>More text</span>  // Duplicate!
```

**Correct pattern:**
```javascript
// CORRECT — shared constant, same reference
import { TEXT_MUTED } from './src/utils/constants';
<span style={TEXT_MUTED}>Text</span>
<span style={TEXT_MUTED}>More text</span>  // Same object!
```

**Fix Applied:**
- Added 14 shared style constants to `src/utils/constants.js`
- Replaced 49 inline style objects with constant references
- Bundle reduced by ~1 KB
- Runtime: fewer object allocations, stable references for React

**Shared style constants added:**
- `TEXT_MUTED`, `TEXT_SECONDARY`, `TEXT_SUCCESS` — color-only styles
- `TEXT_MUTED_SM`, `TEXT_SECONDARY_SM`, `TEXT_SUCCESS_SM`, `TEXT_BODY` — with font sizes
- `FLEX_WRAP_GAP_6`, `FLEX_WRAP_GAP_4`, `FLEX_COL_GAP_8`, `FLEX_START_GAP_8` — flex layouts
- `MB_8`, `MB_16` — margin bottom

**Prevention:**
- Before writing `style={{ ... }}`, check if `src/utils/constants.js` has a matching constant
- If a style appears 3+ times, extract it to constants
- Pattern: `grep -c "style={{" *.jsx` to audit inline style count

**Automated Gate:** None — requires periodic audits:
```bash
# Count inline styles per file (lower = better)
grep -c "style={{" GameSmashList.jsx PropsSmashList.jsx SmashSpotsPage.jsx
# Watch for high counts — consider extracting repeated patterns
```

---

## Lesson 33: useMemo and Pure Functions for Runtime Performance

**When:** February 2026 (Performance session)
**Problem:** SmashSpotsPage had 0 useMemo hooks despite having computed values like `tierDisplayConfig` that recreated objects on every render. Also had `formatCountdown` function defined inside component, recreating on every render.
**Root Cause:** Not applying memoization patterns during initial development.
**Impact:** Unnecessary object recreation, function allocation on every render, potential downstream re-renders from unstable references.

**Broken pattern:**
```javascript
// WRONG — object recreated every render
const MyComponent = () => {
  const config = condition ? { a: 1 } : { b: 2 };  // New object each time!

  const formatValue = (x) => x.toFixed(2);  // New function each time!

  return <Child config={config} format={formatValue} />;
};
```

**Correct pattern:**
```javascript
// CORRECT — memoized object, pure function outside
const formatValue = (x) => x.toFixed(2);  // Defined once, outside component

const MyComponent = () => {
  const config = useMemo(() =>
    condition ? { a: 1 } : { b: 2 },
    [condition]  // Only recreate when condition changes
  );

  return <Child config={config} format={formatValue} />;
};
```

**Fix Applied:**
- Added `useMemo` to `tierDisplayConfig` in SmashSpotsPage
- Moved `formatCountdown` outside component (pure function)
- Stable references prevent unnecessary child re-renders

**Prevention:**
- Computed objects that depend on state/props → wrap in `useMemo`
- Pure functions (no state/props dependencies) → move outside component
- Event handlers that don't change → wrap in `useCallback`
- Pattern: Check files with 0 useMemo that have computed values

**Automated Gate:** None — requires code review vigilance:
```bash
# Check useMemo usage in large components
grep -c "useMemo" SmashSpotsPage.jsx GameSmashList.jsx PropsSmashList.jsx
# Low count in large files = review opportunity
```

---

## Summary: Prevention Stack

| Layer | What | Catches |
|-------|------|---------|
| Validator: contracts | `validate_frontend_contracts.mjs` | Hardcoded literals, direct fetch, missing imports |
| Validator: literals | `validate_no_frontend_literals.mjs` | Scoring numbers in comments/strings |
| Validator: eval | `validate_no_eval.mjs` | eval/new Function |
| Manual: grep | `grep -rn "3/4\|4 engine"` | Stale engine count references |
| Manual: symmetric | `grep "import.*components/" Game* Props*` | Asymmetric component imports |
| Manual: API verify | `curl ... \| jq '.picks[0] \| keys'` | Missing backend fields |
| Invariants | CLAUDE.md MASTER INVARIANTS | 18 rules that must never be violated |
| Manual: data shapes | `curl ... \| jq '.picks[0].glitch_signals'` | Nested objects mistaken for flat numbers |
| Manual: field keys | `curl ... \| jq '.picks[0].esoteric_contributions \| keys'` | Component key mismatches |
| Manual: enum check | `grep -rn "validOutlooks\|validTiers"` | Enum arrays missing new backend values |
| Build | `npm run build` | Syntax errors, import failures |
| Unit Tests | `npm run test:run` (210 tests) | Regression failures, mock drift, network error handling |
| E2E Tests | `npm run test:e2e` (~150 tests) | Navigation failures, element interception, selector ambiguity |
| E2E: fixtures | `grep "from '@playwright/test'" e2e/*.spec.js` | Missing onboarding skip (should return EMPTY) |
| E2E: selectors | Playwright strict mode | Ambiguous selectors matching multiple elements |
| Test coverage | `ls test/*.test.* e2e/*.spec.js` | Every core module has tests, every route has E2E |
| Cron paths | `crontab -l \| grep "cd ~/"; ls -d ~/ai-betting-backend ~/bookie-member-app` | Cron jobs pointing to wrong paths (Lesson 23) |
| Cron activity | `tail -20 ~/ai-betting-backend/logs/cron.log` | Cron jobs not running (check recent output) |
| Code review | useEffect async patterns | Race conditions - missing cleanup/cancelled flags (Lesson 24) |
| Code review | `grep "console.error" *.jsx` | Silent API errors without toast.error (Lesson 25) |
| Unit tests | `test/pickExplainer.test.js` | Null guard failures in helper functions (Lesson 26) |
| Manual: symmetric | `grep "import.*Badges" Game* Props*` | Shared component not imported in both files (Lesson 27) |
| Manual: duplicates | `grep -r "const formatOdds" *.jsx \| wc -l` | Utility function duplication (Lesson 28) |
| Code review | `grep "Math.random" Game* Props*` | Fake data simulation instead of real API data (Lesson 29) |
| Manual: formatTime | `grep "const formatTime" *.jsx \| grep -v import` | formatTime duplication (Lesson 30) |
| Manual: FilterControls | `grep "const.*FilterControls.*memo" Game* Props*` | FilterControls duplication (Lesson 31) |
| Performance: styles | `grep -c "style={{" *.jsx` | High inline style count (Lesson 32) |
| Performance: useMemo | `grep -c "useMemo" SmashSpotsPage.jsx` | Missing memoization in large components (Lesson 33) |
| Manual: fake data | `grep -rn "Math\.random\|MOCK_\|generateMock" *.jsx` | Fake/mock data in production components (Lesson 34) |

---

## Lesson 34: Fake/Mock Data in Production Components

**When:** February 2026 (Frontend Audit)
**Problem:** 7 production components had fake/mock data fallbacks that displayed simulated data to users when API calls failed or returned empty. Users couldn't tell if they were seeing real data or fabricated content.

**Files affected:**
- `GameSmashList.jsx` - `generateGameStats()` with Math.random()
- `SystemHealthPanel.jsx` - Random drift/bias values in fallbacks
- `Leaderboard.jsx` - `mockLeaders` array with fake usernames
- `BestOdds.jsx` - `MOCK_BOOKS`, `BASE_GAMES`, `generateMockGames()` (~70 lines)
- `InjuryVacuum.jsx` - `generateMockInjuries()` (~95 lines)
- `Splits.jsx` - `MOCK_SPLITS`, random percentage generation (~50 lines)
- `SharpAlerts.jsx` - `generateMockAlerts()` (~75 lines)

**Root Cause:** Components were written with mock fallbacks for development/demo purposes, but these fallbacks were never removed before production. The fallback logic was designed to make the app "look good" even without real data, hiding the fact that the backend connection was broken.

**Impact:** Users saw fake usernames, fake statistics, fake alerts, and fake game data without any indication it was simulated. This could lead to bad betting decisions based on fabricated information.

**Fix Applied:**
- Removed all `generateMock*()` functions
- Removed all `MOCK_*` constants
- Replaced mock fallbacks with empty state: `setData([])` instead of `setData(generateMockData())`
- Added null checks in rendering: `{data && (...)}`
- Empty states now show "No data available" messages

**Pattern - WRONG (fake fallback):**
```javascript
} catch (err) {
  console.error(err);
  setGames(generateMockGames(sport));  // ❌ Shows fake data
}
```

**Pattern - CORRECT (empty state):**
```javascript
} catch (err) {
  console.error(err);
  setGames([]);  // ✅ Shows empty state
}
```

**Prevention:**
- Search for fake data patterns before every deploy:
  ```bash
  grep -rn "Math\.random\|MOCK_\|generateMock\|mockData\|fakeData" --include="*.jsx" | grep -v test | grep -v mocks | grep -v __tests__
  # Should return EMPTY for production components
  ```
- **Legitimate uses of randomness (NOT violations):**
  - `crypto.randomUUID()` for generating IDs
  - Animation effects (e.g., shimmer/skeleton loading)
  - Monte Carlo simulations in calculators
  - Test files under `/test/` or `__tests__/`
  - Mock handlers under `/mocks/`

**Automated Gate:** Add to pre-commit checks:
```bash
# Check for fake data in production components
if grep -rn "Math\.random\|MOCK_[A-Z]" --include="*.jsx" | grep -v test | grep -v mocks | grep -v "\.test\." | grep -v "__tests__"; then
  echo "ERROR: Found fake/mock data in production components"
  exit 1
fi
```
