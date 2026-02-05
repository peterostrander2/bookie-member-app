# ~~Frontend Handoff: SmashSpots v10.4~~ (SUPERSEDED)

> **WARNING: This document is STALE (v10.4). Current version is v20.5.**
> For current API schema, field paths, and pick contract, see:
> - `CLAUDE.md` → "Frontend-Backend Contract (v17.3)" section
> - `CLAUDE.md` → "INVARIANT 4: API Field Paths (Pick Contract v1)"
> - `core/frontend_scoring_contract.js` for tier thresholds and weights
>
> Key differences from v10.4 to v20.5:
> - 5 engines (AI, Research, Esoteric, Jarvis, Context) instead of 2
> - TITANIUM_SMASH tier added (3/4 engines ≥ 8.0)
> - 6 boost fields (confluence, msrf, jason_sim, serp, ensemble, live)
> - Signal dicts (glitch_signals, esoteric_contributions) are nested objects
> - Status fields (msrf_status, serp_status, jason_status)
> - `pick.tier` and `pick.units` are source of truth (never recompute)

---

# Original v10.4 Documentation (archived below)

## Endpoint
```
GET /live/best-bets/{sport}
```

**Sports:** `nba`, `nfl`, `mlb`, `nhl`

## Auth
```
Header: X-API-Key: YOUR_KEY
```

## Response Schema
```json
{
  "sport": "NBA",
  "picks": [...],           // ROOT ARRAY - use this for SmashSpots
  "props": { "picks": [...] },
  "game_picks": { "picks": [...] },
  "timestamp": "ISO"
}
```

**Use `response.picks`** - merged array of top 3 game picks + top 7 props (10 total).

---

## Pick Object Schema
```json
{
  "player": "LeBron James",        // null for game picks
  "tier": "GOLD_STAR",             // GOLD_STAR | EDGE_LEAN | MONITOR | PASS
  "final_score": 7.82,             // 0-10
  "smash_spot": true,              // TRUE SMASH - highlight this!
  "confluence_level": "JARVIS_PERFECT",  // IMMORTAL | JARVIS_PERFECT | PERFECT | MODERATE | DIVERGENT
  "alignment_pct": 85.2,           // Research/Esoteric alignment %
  "jarvis_active": true,           // JARVIS triggers fired

  "game": "Lakers @ Celtics",
  "matchup": "Lakers vs Celtics",
  "selection": "LeBron James Over 25.5",
  "line": 25.5,
  "odds": -110,
  "game_time": "2026-01-19T00:00:00Z",

  "badges": ["SMASH_SPOT", "SHARP_MONEY", "JARVIS_TRIGGER"],
  "reasons": [
    "RESEARCH: Sharp Split +1.0",
    "RESEARCH: Prime Time +0.2",
    "ESOTERIC: Jarvis Trigger 201 +0.4",
    "CONFLUENCE: JARVIS PERFECT +0.5"
  ],

  "scoring_breakdown": {
    "research_score": 8.3,
    "esoteric_score": 7.1,
    "base_score": 5.8,
    "pillar_boost": 2.5,
    "confluence_boost": 0.5,
    "alignment_pct": 88.0
  }
}
```

---

## SmashSpot Display Logic

```javascript
// TRUE SMASH - Rare, high-conviction pick
if (pick.smash_spot === true) {
  // Show fire emoji, gold border, featured placement
  // Conditions: final >= 7.5 AND jarvis_active AND alignment >= 80%
}

// Tier-based styling
switch (pick.tier) {
  case "GOLD_STAR":   // Score >= 7.5 - Strong play
  case "EDGE_LEAN":   // Score >= 6.5 - Lean play
  case "MONITOR":     // Score >= 5.5 - Watch
  case "PASS":        // Score < 5.5 - Skip
}
```

---

## Tier Thresholds (v12.0)

| Tier | Condition | Action | UI Suggestion |
|------|-----------|--------|---------------|
| TITANIUM_SMASH | final≥8.0 + 3/4 engines≥6.5 | SMASH | Cyan, ultra-prominent |
| GOLD_STAR | >= 7.5 | SMASH | Gold, prominent |
| EDGE_LEAN | >= 6.5 | PLAY | Green |
| MONITOR | >= 5.5 | WATCH | Yellow |
| PASS | < 5.5 | SKIP | Gray/hidden |

**Note:** TITANIUM requires `pick.titanium_triggered === true` from backend.

---

## SmashSpot vs GOLD_STAR

| | GOLD_STAR | SmashSpot |
|---|-----------|-----------|
| **Requirement** | final >= 7.5 | final >= 7.5 AND jarvis_active AND alignment >= 80% |
| **Meaning** | High score | TRUE confluence - research + esoteric agree |
| **Frequency** | Common | Rare |
| **UI** | Gold star | Fire, featured |

---

## Example: Fetch and Render

```javascript
const response = await fetch('/live/best-bets/nba', {
  headers: { 'X-API-Key': API_KEY }
});
const data = await response.json();

// Render SmashSpots
data.picks.forEach(pick => {
  if (pick.smash_spot) {
    renderFeaturedPick(pick);  // True SmashSpot
  } else if (pick.tier === 'GOLD_STAR') {
    renderGoldStar(pick);      // Strong pick
  } else if (pick.tier === 'EDGE_LEAN') {
    renderEdgeLean(pick);      // Lean pick
  }
  // Skip MONITOR and PASS for main display
});
```

---

## Confluence Levels

| Level | Meaning |
|-------|---------|
| IMMORTAL | Perfect alignment + JARVIS 2178 trigger |
| JARVIS_PERFECT | Perfect alignment + any JARVIS trigger |
| PERFECT | Research & Esoteric fully agree |
| MODERATE | Partial agreement |
| DIVERGENT | Research & Esoteric disagree |

---

## Badges

| Badge | Meaning |
|-------|---------|
| SMASH_SPOT | True SmashSpot (rare) |
| SHARP_MONEY | Sharp bettors on this side |
| JARVIS_TRIGGER | Gematria signal fired |
| REVERSE_LINE | Line moving opposite public |
| PRIME_TIME | National TV game boost |
