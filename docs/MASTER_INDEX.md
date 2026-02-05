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
- `BOOST_CAPS` - confluence 1.5, msrf 1.0, jason_sim 0.5, serp 0.5, ensemble 0.5
- `TITANIUM_THRESHOLD`, `GOLD_STAR_THRESHOLD`, `MIN_FINAL_SCORE`, `MONITOR_THRESHOLD`
- `TITANIUM_RULE`, `GOLD_STAR_GATES`, `TIERS`, `TIER_COLORS`

**Never do:**
- Use raw numbers in components, comments, or template strings
- Reference `7.5` when you mean `GOLD_STAR_THRESHOLD`
- Reference `8.0` when you mean `TITANIUM_THRESHOLD`

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
| Lessons | `docs/LESSONS.md` | Historical mistakes and prevention (10 lessons) |
| Test Mocks | `test/api.test.js` → `mockResponse()` | Canonical mock pattern for API tests |
| Test Setup | `test/setup.js` | Global mocks, env stubs, rate limit bypass |

---

## Score Breakdown Components (v20.5)

| Component | File | Purpose |
|-----------|------|---------|
| BoostBreakdownPanel | `components/BoostBreakdownPanel.jsx` | Option A score breakdown (base_4 + 6 boosts = final) |
| StatusBadgeRow | `components/StatusBadgeRow.jsx` | MSRF/SERP/Jason/ML status indicator badges |
| GlitchSignalsPanel | `components/GlitchSignalsPanel.jsx` | GLITCH protocol signals with progress bars |
| EsotericContributionsPanel | `components/EsotericContributionsPanel.jsx` | Esoteric contributions by category |

**Integration:** All 4 components appear in BOTH `GameSmashList.jsx` and `PropsSmashList.jsx`.

---

## Validators — What to Run

```bash
# ALL THREE must pass before committing (MANDATORY)
node scripts/validate_frontend_contracts.mjs    # Hardcoded literals, direct fetch, missing imports
node scripts/validate_no_frontend_literals.mjs  # Scoring literals even in comments/strings
node scripts/validate_no_eval.mjs               # eval/new Function prevention

# Or run CI sanity check (includes all validators)
./scripts/ci_sanity_check_frontend.sh

# Tests
npm test

# Build
npm run build
```

**What validators catch:**
| Validator | Catches |
|-----------|---------|
| `validate_frontend_contracts.mjs` | Hardcoded thresholds (6.5, 7.5, 8.0), direct fetch calls, missing contract imports |
| `validate_no_frontend_literals.mjs` | Scoring literals in comments and template strings |
| `validate_no_eval.mjs` | eval() and new Function() usage |

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

---

## Backend Integration

**Backend Repo:** `~/Desktop/ai-betting-backend-main`
**Backend URL:** `https://web-production-7b2a.up.railway.app`
**Env vars (frontend):** `VITE_API_BASE_URL`, `VITE_BOOKIE_API_KEY`

**Frontend MUST match backend (v20.5):**
1. **Tiers:** TITANIUM (>=8.0, 3/5 engines >=8.0), GOLD_STAR (>=7.5, gates), EDGE_LEAN (>=6.5)
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

# 2. Test (91 tests, ALL must pass)
npm run test:run

# 3. Build
npm run build

# 4. Commit and push
git add -A && git commit -m "feat: ... + docs: ..."
git push origin main
```

**If tests fail after changing api.js or lib/api/client.js:**
1. Check that test mocks use `mockResponse()` helper
2. Check that auth endpoint assertions include `cache: 'no-store'`
3. Check that API methods with `|| default` have try-catch
4. See Lessons 9 and 10 in `docs/LESSONS.md`
