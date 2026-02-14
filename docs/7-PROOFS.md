# 7-Proofs Validation Framework

**Purpose:** Systematic validation that the AI betting system is fully operational before community launch.

Not just "the site loads" — proves that every data source is wired, every engine produces varied scores, every output is within contract bounds, and grading is running.

---

## Quick Start

```bash
# Run all validators at once (requires API key)
VITE_BOOKIE_API_KEY=xxx npm run validate:all

# Or run individually
VITE_BOOKIE_API_KEY=xxx npm run validate:integrations
VITE_BOOKIE_API_KEY=xxx npm run validate:variance
VITE_BOOKIE_API_KEY=xxx npm run validate:coverage
VITE_BOOKIE_API_KEY=xxx npm run validate:boundaries
VITE_BOOKIE_API_KEY=xxx npm run validate:live
```

---

## The 7 Proofs

| Proof | Script | Pass Condition |
|-------|--------|----------------|
| 1. Integration | `validate_integrations.mjs` | odds_api=VALIDATED, playbook_api=VALIDATED |
| 2. Engine | (in best-bets response) | All 5 engine scores present, no nulls |
| 3. Non-degeneracy | `validate_score_variance.mjs` | unique(ai_score) >= 4, stddev >= 0.15 |
| 4. Market | `validate_market_coverage.mjs` | spread + total markets present when games exist |
| 5. Boundaries | `validate_output_boundaries.mjs` | All picks: final_score >= 6.5, valid tier, engines in [0,10] |
| 6. Live | `validate_live_fields.mjs` | is_live picks have game_status, data_age_ms |
| 7. Grader | `DailyReportCard.jsx` | Daily report fetches and displays in Performance Dashboard |

---

## Proof 1: Integration Status

**File:** `scripts/validate_integrations.mjs`

**What it validates:**
- Calls `GET /live/debug/integrations`
- Checks that critical integrations show `status: VALIDATED`

**Critical integrations:**
- `odds_api` — Must be VALIDATED
- `playbook_api` — Must be VALIDATED

**Optional integrations (warn only):**
- `weather_api`, `injury_api`, `news_api`

**Failure indicates:**
- Backend config issue
- Third-party API down
- Missing API credentials

---

## Proof 3: Non-Degeneracy (AI Constant Detection)

**File:** `scripts/validate_score_variance.mjs`

**What it validates:**
- Fetches `GET /live/best-bets/{sport}` for each sport
- Extracts `ai_score` from all picks
- For >= 5 picks, checks:
  - `unique(ai_score) >= 4`
  - `stddev(ai_score) >= 0.15`

**Why this matters:**
- Catches AI model regression
- Detects if AI is returning constant scores (broken model)
- Ensures real variance in predictions

**Failure indicates:**
- AI model is stuck/broken
- Backend not calling AI correctly
- Model weights zeroed out

---

## Proof 4: Market Coverage

**File:** `scripts/validate_market_coverage.mjs`

**What it validates:**
- Fetches `GET /live/best-bets/{sport}?debug=1`
- Checks market type diversity in picks
- Warns if spread or total markets missing when games exist

**Expected market types:**
- NBA/NHL/NFL/MLB: spread, total, moneyline, player_prop
- NCAAB: spread, total, moneyline

**Failure indicates:**
- Odds API filtering issue
- Backend market processing broken
- Sport-specific config problem

---

## Proof 5: Output Boundary Validation

**File:** `scripts/validate_output_boundaries.mjs`

**What it validates:**
- Fetches `GET /live/best-bets/{sport}` for each sport
- For every pick, checks:
  - `final_score >= 6.5` (community filter)
  - `tier` is valid (TITANIUM, TITANIUM_SMASH, GOLD_STAR, EDGE_LEAN)
  - All 4 engine scores present and in range [0, 10]

**Why this matters:**
- Ensures contract compliance
- Catches scoring bugs before users see them
- Validates tier assignment logic

**Failure indicates:**
- Backend scoring bug
- Community filter not applied
- Engine score calculation error

---

## Proof 6: Live Betting Fields

**File:** `scripts/validate_live_fields.mjs`

**What it validates:**
- Fetches `GET /live/best-bets/{sport}` for each sport
- For picks where `is_live: true`:
  - `game_status` present and valid
  - `data_age_ms` present and < 5 minutes

**Why this matters:**
- Live bets need current context
- Stale data = bad live recommendations

**Failure indicates:**
- Live data pipeline broken
- Game status not being tracked
- Data freshness issue

---

## Proof 7: Grader Daily Report

**File:** `src/components/DailyReportCard.jsx`

**What it displays:**
- Picks graded count
- Win rate by tier (TITANIUM, GOLD_STAR, EDGE_LEAN)
- Overall win rate
- CLV metrics

**Endpoint:** `GET /live/grader/daily-report`

**UI behavior:**
- Before 6 AM ET: "Report not available yet"
- After 6 AM ET: Full report display

**Where it appears:** Performance Dashboard > System tab

---

## Integration with CI/CD

### run_final_audit.sh

The `scripts/run_final_audit.sh` script now includes:

```bash
# Run 7-Proofs validation if API key is available
if [ -n "$VITE_BOOKIE_API_KEY" ]; then
  npm run validate:all
fi
```

### npm scripts

```json
{
  "validate:integrations": "node scripts/validate_integrations.mjs",
  "validate:variance": "node scripts/validate_score_variance.mjs",
  "validate:coverage": "node scripts/validate_market_coverage.mjs",
  "validate:boundaries": "node scripts/validate_output_boundaries.mjs",
  "validate:live": "node scripts/validate_live_fields.mjs",
  "validate:all": "npm run validate:integrations && npm run validate:variance && npm run validate:coverage && npm run validate:boundaries && npm run validate:live"
}
```

---

## Failure Recovery

### Proof 1 Failure (Integration)

```bash
# Check backend integrations endpoint
curl -s "https://web-production-7b2a.up.railway.app/live/debug/integrations" \
  -H "X-API-Key: xxx" | jq

# Common fixes:
# - Restart backend service
# - Check third-party API status
# - Verify API credentials in Railway
```

### Proof 3 Failure (AI Variance)

```bash
# Check AI scores directly
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: xxx" | jq '[.game_picks.picks[].ai_score] | unique'

# Should show 4+ unique values
# If all same: AI model regression — check backend logs
```

### Proof 5 Failure (Boundaries)

```bash
# Find violating picks
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: xxx" | jq '.game_picks.picks[] | select(.final_score < 6.5)'

# Should return empty
# If not: community filter not applied — check backend scoring
```

### Proof 6 Failure (Live Fields)

```bash
# Check live picks
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: xxx" | jq '.game_picks.picks[] | select(.is_live == true) | {game_status, data_age_ms}'

# Both fields should exist for live games
# If missing: live data pipeline broken
```

---

## What "100% Working" Means

After all 7 proofs pass, you can make this **engineering correctness claim**:

> "100% of critical integrations are validated and used when relevant.
> 100% of picks pass contract gates.
> 0 silent engine degradations.
> Live freshness + status correct.
> Auditable logs + grading are running."

This is an **engineering correctness claim**, not a gambling outcome claim.

---

## Files Reference

### Validation Scripts

| File | Proof | Lines |
|------|-------|-------|
| `scripts/validate_integrations.mjs` | 1 | ~100 |
| `scripts/validate_score_variance.mjs` | 3 | ~90 |
| `scripts/validate_market_coverage.mjs` | 4 | ~100 |
| `scripts/validate_output_boundaries.mjs` | 5 | ~100 |
| `scripts/validate_live_fields.mjs` | 6 | ~110 |

### Display Component

| File | Proof | Purpose |
|------|-------|---------|
| `src/components/DailyReportCard.jsx` | 7 | Grader report display |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Added validate:* scripts |
| `scripts/run_final_audit.sh` | Added validate:all call |
| `api.js` | Added getDailyGraderReport() |
| `PerformanceDashboard.jsx` | Integrated DailyReportCard |

---

## Lesson 35

The 7-Proofs framework is documented as Lesson 35 in `docs/LESSONS.md`.

See that file for the full lesson including root cause, impact, and prevention patterns.
