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

# Stale reference check
grep -rn "3/4\|4 engine\|four engine" --include="*.jsx" --include="*.js"
# ^ Should return EMPTY

# Symmetric component check
grep -n "import.*from.*components/" GameSmashList.jsx PropsSmashList.jsx
# ^ Both files should import the same scoring components
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
| Invariants | CLAUDE.md MASTER INVARIANTS | 9 rules that must never be violated |
| Build | `npm run build` | Syntax errors, import failures |
| Tests | `npm run test:run` | Regression failures |
