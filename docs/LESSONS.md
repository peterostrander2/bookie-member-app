# LESSONS LEARNED — Frontend

Every lesson here was learned the hard way. Each one has an automated prevention mechanism.

**Rule:** Before starting work, skim this file. Before committing, run the validators.

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

**Automated Gate:** `npm run test:run` — 91 tests must all pass.

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

## Pattern: How New Lessons Get Added

When you encounter a new mistake:

1. **Document it here** with: When, Problem, Root Cause, Impact, Fix, Prevention, Automated Gate
2. **Add an invariant** to CLAUDE.md if it's a recurring pattern
3. **Update MASTER_INDEX.md** Hard Bans section if applicable
4. **Create or update a validator script** if the mistake can be caught automatically
5. **Update the verification checklist** in CLAUDE.md

The goal: every mistake should be catchable automatically. If it can't be automated, document the manual check clearly.

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
| Invariants | CLAUDE.md MASTER INVARIANTS | 15 rules that must never be violated |
| Manual: data shapes | `curl ... \| jq '.picks[0].glitch_signals'` | Nested objects mistaken for flat numbers |
| Manual: field keys | `curl ... \| jq '.picks[0].esoteric_contributions \| keys'` | Component key mismatches |
| Build | `npm run build` | Syntax errors, import failures |
| Tests | `npm run test:run` | Regression failures, mock drift, network error handling |
