# MASTER INDEX — START HERE (Frontend)

Quick entry points:
- `SESSION_START.md` (new session checklist)
- `docs/RECOVERY.md` (what to do if things break)
- `docs/LESSONS.md` (mistakes we've made and how we prevent them)

**Single entry point for all frontend code and documentation changes.**

Before touching code or docs: use this file to route yourself to the canonical source. Goal: **zero drift between frontend <-> backend**.

---

## Non-Negotiable Workflow

1) **Classify the change** using Decision Tree below
2) **Edit canonical contract** (core/*_contract.js) — not random components
3) **Run validators** (ALL THREE must pass)
4) **Update dependent docs** (only what validators require)
5) **Commit code + docs together**
6) **Verify Railway deployment**

---

## Decision Tree — Where to Look and What to Edit

### A) Tier System / Score Display
**Examples:** Tier colors, threshold displays, TITANIUM/GOLD_STAR labels

**Canonical source (edit here only):**
- `core/frontend_scoring_contract.js`

**Where implementation lives (should import from contract):**
- `signalEngine.js` - Client-side calculations
- Any component displaying tiers/scores

**Backend contract (MUST match):**
- Backend: `~/Desktop/ai-betting-backend-main/core/scoring_contract.py`

**Never do:**
- Hardcode `6.5`, `7.5`, `8.0`, `6.8`, `5.5` anywhere — even in comments or strings
- Hardcode `"TITANIUM"`, `"GOLD_STAR"`, `"EDGE_LEAN"` strings
- Use different tier colors than contract
- Recalculate tiers on client (trust backend final_score)

---

### B) Backend API Integration
**Examples:** Endpoint URLs, API key handling, response parsing

**Canonical sources:**
- `core/integration_contract.js` - Endpoint definitions, env vars, base URL
- `lib/api/client.js` - Centralized fetch helpers (ALL requests go through here)
- `api.js` - API method implementations (imports from client)

**Never do:**
- Call `fetch`/`axios`/`new Request` outside `lib/api/client.js`
- Hardcode backend URL anywhere (must come from contract via client)
- Import fetch helpers from anywhere except `lib/api/client.js`
- Duplicate endpoint logic across files

---

### C) Wiring New Backend Fields
**Examples:** Backend adds a new boost, signal, or status field

**Step-by-step (MUST follow this order):**
1. Update `normalizePick()` in `api.js` to pass through the new field
2. Create display component in `components/` directory
3. Import and integrate in BOTH `GameSmashList.jsx` AND `PropsSmashList.jsx`
4. Update `CLAUDE.md` field tables and invariants
5. Run all validators

**Never do:**
- Add a field to a component without updating `normalizePick()` first
- Add a component to GameSmashList without also adding to PropsSmashList
- Assume field exists without checking API response

---

### D) Scoring Constants / Thresholds
**Examples:** Changing a threshold, adding a boost cap, updating weights

**Canonical source (edit here only):**
- `core/frontend_scoring_contract.js`

**What lives here:**
- `ENGINE_WEIGHTS` - AI 25%, Research 35%, Esoteric 20%, Jarvis 20%
- `CONTEXT_MODIFIER_CAP` - +-0.35
- `BOOST_CAPS` - confluence 3.0, msrf 1.0, jason_sim 1.5, serp 0.55, ensemble 0.5, phase8 0.5, glitch 0.5, gematria 0.5, harmonic 0.5
- `TITANIUM_THRESHOLD`, `GOLD_STAR_THRESHOLD`, `MIN_FINAL_SCORE`, `MONITOR_THRESHOLD`
- `TITANIUM_RULE`, `GOLD_STAR_GATES`, `TIERS`, `TIER_COLORS`

**Never do:**
- Use raw numbers in components, comments, or template strings
- Reference `7.5` when you mean `GOLD_STAR_THRESHOLD`
- Reference `8.0` when you mean `TITANIUM_THRESHOLD`

---

### E) E2E Testing
**Examples:** Adding new E2E tests, fixing test failures, testing new pages

**Canonical sources:**
- `e2e/fixtures.js` - Shared Playwright fixture (onboarding skip, localStorage setup)
- `e2e/*.spec.js` - Test spec files (import from `./fixtures`, never `@playwright/test`)
- `playwright.config.js` - Test configuration (2 projects: Desktop Chrome, Mobile Chrome/Pixel 5)

**Required patterns:**
```javascript
// ALL spec files MUST import from fixtures
import { test, expect } from './fixtures';

// Broad text selectors MUST use .first()
await expect(page.getByText(/Player Props|Game Picks/i).first()).toBeVisible();

// Page headings: use getByRole, not getByText
await expect(page.getByRole('heading', { name: /Bet History/i })).toBeVisible();

// Form inputs: use getByLabel, not locator('input')
const awayInput = page.getByLabel(/Away Team/i);

// Pages with API polling: NEVER use waitForLoadState('networkidle')
await expect(page.getByRole('heading', { name: /.../ })).toBeVisible({ timeout: 10000 });

// Vite HMR race: verify React rendered before asserting
try { await page.waitForSelector('h1', { timeout: 10000 }); }
catch { await expect(page.locator('body')).toBeVisible(); return; }
```

**When adding localStorage-gated UI (modals, wizards, banners):**
1. Add the skip key to `e2e/fixtures.js` → `addInitScript()`
2. Re-run full E2E suite to verify no regressions

**Never do:**
- Import from `@playwright/test` in spec files (use `./fixtures`)
- Use `waitForLoadState('networkidle')` on pages with API calls
- Use `getByText()` to verify page rendered (matches raw source strings)
- Use generic `locator('select').first()` without checking element type in component
- Write a test for only one browser — tests run on both Desktop Chrome and Mobile Chrome

---

### F) Adding New E2E Tests

**Step-by-step:**
1. Add test to existing spec file (prefer over new files)
2. Import from `./fixtures`: `import { test, expect } from './fixtures';`
3. Use defensive patterns (`if (await element.isVisible())`) for data-dependent checks
4. Run full suite: `npm run test:e2e` (not just the new test)
5. Check both Desktop Chrome AND Mobile Chrome results

**Existing spec files:**
| File | Covers |
|------|--------|
| `e2e/navigation.spec.js` | Page routing, mobile navigation |
| `e2e/smash-spots.spec.js` | Picks, tabs, sport selection, v20.5 panels |
| `e2e/bet-slip.spec.js` | Bet slip interactions, parlay calculator |
| `e2e/parlay-builder.spec.js` | Parlay builder, calculator, history |
| `e2e/esoteric.spec.js` | Esoteric page, matchup analyzer, v20.5 enhancements |
| `e2e/sharp-odds-injuries.spec.js` | Sharp alerts, best odds, injury vacuum, cross-page navigation |
| `e2e/analytics-profile-bankroll.spec.js` | Analytics, profile, bankroll, performance, props |
| `e2e/remaining-pages.spec.js` | Smoke tests for all remaining routes (100% coverage) |

---

## Canonical Sources — Quick Table

| Topic | Canonical File(s) | What It Defines |
|---|---|---|
| Scoring/Tiers | `core/frontend_scoring_contract.js` | Thresholds, tier names, colors, weights, boost caps |
| API Config | `core/integration_contract.js` | Base URL, env vars, endpoints |
| API Client | `lib/api/client.js` | Centralized fetch, auth headers |
| API Methods | `api.js` | All endpoint implementations + `normalizePick()` |
| Pick Normalization | `api.js` → `normalizePick()` | Gateway for ALL backend fields to frontend |
| Components | `App.jsx` | Routing, lazy loading |
| Signals | `signalEngine.js` | Client calculations |
| Storage | `storageUtils.js` | localStorage keys |
| Lessons | `docs/LESSONS.md` | Historical mistakes and prevention (35 lessons) |
| 7-Proofs | `docs/7-PROOFS.md` | System validation framework for community launch |
| Test Mocks | `test/api.test.js` → `mockResponse()` | Canonical mock pattern for API tests |
| Test Setup | `test/setup.js` | Global mocks, env stubs, rate limit bypass |
| E2E Fixtures | `e2e/fixtures.js` | Shared page fixture (onboarding skip, localStorage) |
| E2E Config | `playwright.config.js` | Desktop Chrome + Mobile Chrome/Pixel 5 |

---

## Score Breakdown Components (v20.5)

| Component | File | Purpose |
|-----------|------|---------|
| BoostBreakdownPanel | `components/BoostBreakdownPanel.jsx` | Option A score breakdown (base_4 + 6 boosts = final) |
| StatusBadgeRow | `components/StatusBadgeRow.jsx` | MSRF active/SERP/Jason/ML status badges |
| GlitchSignalsPanel | `components/GlitchSignalsPanel.jsx` | GLITCH protocol (nested object extraction: void_moon, kp_index, noosphere, benford) |
| EsotericContributionsPanel | `components/EsotericContributionsPanel.jsx` | Esoteric contributions by category (12 verified backend keys) |

**Integration:** All 4 components appear in BOTH `GameSmashList.jsx` and `PropsSmashList.jsx`.

---

## Shared UI Components

### components/Badges.jsx
| Component | Purpose | Props |
|-----------|---------|-------|
| ScoreBadge | Score with color coding | `score`, `maxScore`, `label`, `tooltip` |
| TierBadge | Tier label with win rate | `confidence`, `showWinRate` |
| BadgeDisplay | Row of status badges | `badges[]` |
| TierLegend | Tier legend with thresholds | (none - uses contract constants) |

### components/FilterControls.jsx
| Component | Purpose | Props |
|-----------|---------|-------|
| FilterControls | Tier/type/sort filters | `mode` ("game"\|"props"), `filters`, `setFilters`, `sortBy`, `setSortBy` |

**Mode differences:**
- `game`: Market buttons (SPREAD/TOTAL/ML), sort by Confidence/Edge
- `props`: Prop type dropdown, sort by Score/Edge/Odds

**Pattern:** If a UI element appears in BOTH GameSmashList and PropsSmashList, extract to `components/`.

---

## Shared Utilities (src/utils/)

| File | Exports | Used By |
|------|---------|---------|
| `pickNormalize.js` | `formatOdds`, `formatTime`, `formatTimeAgo`, `formatLine`, `getBookInfo`, `getPickScore`, `isTitanium`, `filterCommunityPicks`, `communitySort` | 15+ files |
| `tierConfig.js` | `TIER_CONFIGS`, `getTierConfigFromPick`, `getTierConfig` | SmashList files |
| `constants.js` | `AI_MODELS`, `PILLARS`, `STAT_BADGE_STYLE`, `getAgreeingModels`, `getAligningPillars`, + 14 style constants | SmashList files |

**Style constants in constants.js (for performance):**
- `TEXT_MUTED`, `TEXT_SECONDARY`, `TEXT_SUCCESS` — color-only styles
- `TEXT_MUTED_SM`, `TEXT_SECONDARY_SM`, `TEXT_SUCCESS_SM`, `TEXT_BODY` — with font sizes
- `FLEX_WRAP_GAP_6`, `FLEX_WRAP_GAP_4`, `FLEX_COL_GAP_8`, `FLEX_START_GAP_8` — flex layouts
- `MB_8`, `MB_16` — margin bottom

**Pattern:** Before writing a utility function, check if it exists in `src/utils/`. Use `grep -r "export.*function" src/utils/` to list available utilities.

---

## Performance Patterns

### Bundle Tracking
| Chunk | Target | Current |
|-------|--------|---------|
| SmashSpotsPage | < 100 KB | 98.28 KB ✅ |
| Main index | < 350 KB | 344.25 KB ✅ |

### Key Optimizations Applied
1. **Shared style constants** — 49 inline styles → constants (Lesson 32)
2. **useMemo for computed objects** — tierDisplayConfig, etc. (Lesson 33)
3. **Pure functions outside components** — formatCountdown, formatTime
4. **memo() on child components** — PropCard, GameCard, TierLegend
5. **Code splitting** — 22 lazy-loaded routes

### Performance Audit Commands
```bash
# Check inline style count (lower = better)
grep -c "style={{" GameSmashList.jsx PropsSmashList.jsx SmashSpotsPage.jsx

# Check memoization usage
grep -c "useMemo\|useCallback\|memo(" SmashSpotsPage.jsx

# Build with size analysis
npm run build:analyze
```

### When to Memoize
- **useMemo**: Computed objects that depend on state/props
- **useCallback**: Event handlers passed to child components
- **memo()**: Components that receive stable props but parent re-renders often
- **Move outside**: Pure functions with no state/props dependencies

---

## Validators — What to Run

```bash
# CONTRACT VALIDATORS — ALL THREE must pass before committing (MANDATORY)
node scripts/validate_frontend_contracts.mjs    # Hardcoded literals, direct fetch, missing imports
node scripts/validate_no_frontend_literals.mjs  # Scoring literals even in comments/strings
node scripts/validate_no_eval.mjs               # eval/new Function prevention

# 7-PROOFS VALIDATORS — Run before deploy (requires API key)
VITE_BOOKIE_API_KEY=xxx npm run validate:all    # All 5 validators at once
# Or individually:
npm run validate:integrations  # Proof 1: Critical integrations VALIDATED
npm run validate:variance      # Proof 3: AI scores have variance (not constant)
npm run validate:coverage      # Proof 4: Market types present
npm run validate:boundaries    # Proof 5: All picks pass contracts
npm run validate:live          # Proof 6: Live picks have context fields

# Tests
npm test

# Build
npm run build
```

**Contract Validators (prevent code drift):**
| Validator | Catches |
|-----------|---------|
| `validate_frontend_contracts.mjs` | Hardcoded thresholds (6.5, 7.5, 8.0), direct fetch calls, missing contract imports |
| `validate_no_frontend_literals.mjs` | Scoring literals in comments and template strings |
| `validate_no_eval.mjs` | eval() and new Function() usage |

**7-Proofs Validators (verify system health):**
| Validator | Proof | Catches |
|-----------|-------|---------|
| `validate_integrations.mjs` | 1 | odds_api or playbook_api not VALIDATED |
| `validate_score_variance.mjs` | 3 | AI scores constant (regression) |
| `validate_market_coverage.mjs` | 4 | Missing market types when games exist |
| `validate_output_boundaries.mjs` | 5 | Picks violating contracts (score < 6.5, invalid tier) |
| `validate_live_fields.mjs` | 6 | Live picks missing game_status/data_age_ms |

See `docs/7-PROOFS.md` for full framework documentation.

---

## Testing Patterns

### API Test Mock Pattern
**All API test mocks MUST use the `mockResponse()` helper** in `test/api.test.js`:
```javascript
mockResponse(data)                                    // ok: true, status: 200
mockResponse(null, { ok: false, status: 500 })       // error response
```

**Why:** `safeJson()` calls `response.text()` (not `.json()`), `authFetch()` calls `response.clone().text()` for error logging.

**Auth endpoint assertions MUST include `cache: 'no-store'`:**
```javascript
{ headers: { 'X-API-Key': 'test-api-key' }, cache: 'no-store' }
```

### API Error Handling Pattern
**Methods with `|| default` MUST be wrapped in try-catch:**
```javascript
async getParlay(userId) {
  try {
    return safeJson(await authFetch(url)) || { legs: [], combined_odds: null };
  } catch {
    return { legs: [], combined_odds: null };
  }
},
```

**Why:** `|| default` only works when `safeJson` returns null (non-ok response). Network errors throw before `safeJson` runs.

### useEffect Async Cleanup Pattern
**All async operations in useEffect MUST have cleanup:**
```javascript
// Pattern A: Single fetch with cancelled flag
useEffect(() => {
  let cancelled = false;
  const fetchData = async () => {
    const data = await api.getData();
    if (cancelled) return;  // Check before EVERY setState
    setData(data);
  };
  fetchData();
  return () => { cancelled = true; };
}, [dependency]);

// Pattern B: Component-wide mount tracking
const isMountedRef = useRef(true);
useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);
// Then in any async handler: if (!isMountedRef.current) return;
```

### Error Handling Pattern for User-Facing Components
**User-facing components MUST show both console + toast errors:**
```javascript
} catch (err) {
  console.error('Error fetching data:', err);
  toast.error('Failed to load data');  // User sees this
  setData([]);  // Graceful fallback
}
```

### Null Guard Pattern for Helper Functions
**Functions processing API data MUST guard against null/undefined:**
```javascript
const processSignals = (signals) => {
  const safeSignals = Array.isArray(signals) ? signals : [];
  return safeSignals.filter(s => s.score >= 50);
};

const explainPick = (analysis) => {
  if (!analysis) return { bullets: [], risks: [] };
  const { signals = [], confidence = 0 } = analysis;
  // ...
};
```

---

## Code Duplication Prevention

**Check before writing new code:**
```bash
# Check for existing utilities
grep -r "export.*function\|export const" src/utils/ | grep -v ".test"

# Check for duplicate function definitions
grep -r "const formatTime\|const formatOdds\|const formatDate" --include="*.jsx"

# Check shared components exist
ls components/*.jsx

# Verify symmetric imports (both SmashList files should import same components)
diff <(grep "import.*from.*components" GameSmashList.jsx | sort) \
     <(grep "import.*from.*components" PropsSmashList.jsx | sort)
```

**Where shared code lives:**
- UI Components: `components/Badges.jsx` (ScoreBadge, TierBadge, BadgeDisplay, TierLegend)
- UI Components: `components/FilterControls.jsx` (FilterControls with mode prop)
- Formatting: `src/utils/pickNormalize.js` (formatOdds, formatTime, formatTimeAgo, getBookInfo)
- Config: `src/utils/tierConfig.js` (TIER_CONFIGS, getTierConfigFromPick)
- Constants: `src/utils/constants.js` (AI_MODELS, PILLARS, getAgreeingModels, getAligningPillars)
- Styles: `src/utils/constants.js` (TEXT_MUTED, FLEX_*, MB_* — 14 style constants for perf)

---

## Hard Bans

- Hardcode tier thresholds (6.5, 7.5, 8.0) anywhere — even in comments
- Hardcode tier names ("TITANIUM", "GOLD_STAR") anywhere except contract
- Call `fetch`/`axios`/`new Request` outside `lib/api/client.js`
- Access `import.meta.env` directly in components
- Recalculate tiers on client (trust backend)
- Edit generated files (`docs/AUDIT_MAP.md`)
- Add backend fields to components without updating `normalizePick()` first
- Update GameSmashList without updating PropsSmashList (or vice versa)
- Use bare `{ json: () => ... }` objects in test mocks (use `mockResponse()`)
- Write API methods with `|| default` without try-catch for network errors
- Call `.toFixed()` or numeric methods on backend fields without verifying they're numbers
- Use `||` for field precedence in normalizePick (use `??` — nullish coalescing)
- Build components against assumed data shapes without verifying against real API
- Display per-pick data on pages using global endpoints (today-energy)
- Guess field key names — always verify with `curl | jq 'keys'`
- Hardcode enum validation arrays without checking actual backend values (enums expand)
- Ship a new core logic module without corresponding unit tests
- Add a new route without at least a smoke E2E test
- Async operations in useEffect without cleanup (cancelled flag or isMountedRef)
- console.error in user-facing components without accompanying toast.error
- Helper functions that process API data without null/undefined guards
- Copy-paste components between GameSmashList and PropsSmashList (extract to components/)
- Duplicate utility functions (check src/utils/ first)
- Simulate/fake backend data with Math.random() or shuffling (use real data or empty state)
- Use MOCK_* constants or generateMock*() functions in production components (test/mocks only)
- Show fake usernames, statistics, or alerts when API fails (show empty state instead)

---

## Backend Integration

**Backend Repo:** `~/Desktop/ai-betting-backend-main`
**Backend URL:** `https://web-production-7b2a.up.railway.app`
**Env vars (frontend):** `VITE_API_BASE_URL`, `VITE_BOOKIE_API_KEY`

**Frontend MUST match backend (v20.5):**
1. **Tiers:** TITANIUM (>=8.0, 3/4 engines >=8.0, context excluded), GOLD_STAR (>=7.5, gates), EDGE_LEAN (>=6.5)
2. **Never show picks:** with final_score < 6.5
3. **Engine scores:** ai_score (25%), research_score (35%), esoteric_score (20%), jarvis_score (20%), context_score (+-0.35 modifier)
4. **Boost fields:** confluence_boost, msrf_boost, jason_sim_boost, serp_boost, ensemble_adjustment
5. **Status fields:** msrf_status, serp_status, jason_status, msrf_metadata, serp_shadow_mode
6. **Signal dicts:** glitch_signals, esoteric_contributions

---

## Daily Learning Loop (Frontend)

- **Dashboard card** pulls from: `GET /live/grader/daily-lesson`
- Endpoint also supports:
  - `/live/grader/daily-lesson/latest`
  - `/live/grader/daily-lesson?days_back=1`
- Expected behavior:
  - Before 6 AM ET: show "not available yet"
  - After 6 AM ET: show bullets for the day

---

## Golden Command Sequence

```bash
# 1. Validate contracts (MANDATORY)
node scripts/validate_frontend_contracts.mjs
node scripts/validate_no_frontend_literals.mjs
node scripts/validate_no_eval.mjs

# 2. Unit tests (210 tests, ALL must pass)
npm run test:run

# 3. Build
npm run build

# 4. E2E tests (~150 tests across 8 specs, requires dev server on :5173)
npm run test:e2e

# 5. E2E fixture check
grep -rn "from '@playwright/test'" e2e/*.spec.js
# ^ Should return EMPTY

# 6. 7-Proofs validation (before deploy, requires API key)
VITE_BOOKIE_API_KEY=xxx npm run validate:all
# All 5 validators must pass

# 7. Commit and push
git add -A && git commit -m "feat: ... + docs: ..."
git push origin main
```

**If tests fail after changing api.js or lib/api/client.js:**
1. Check that test mocks use `mockResponse()` helper
2. Check that auth endpoint assertions include `cache: 'no-store'`
3. Check that API methods with `|| default` have try-catch
4. See Lessons 9 and 10 in `docs/LESSONS.md`
