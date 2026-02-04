# Phase 0: API Client Infrastructure Technical Spec

**Author:** Senior Staff Engineer Review
**Date:** February 2026
**Status:** REVISED after discovery of sister backend (`ai-betting-backend-main`)
**Priority:** Reference document for API integration efforts

---

## Executive Summary

**CRITICAL FINDING:** The original assessment was based on the frontend repo (`bookie-member-app/backend`). After discovering the **actual production backend** at `/Users/apple/Desktop/ai-betting-backend-main`, the situation is significantly better than initially assessed.

### Actual State (Sister Backend)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ API                  │ Code Exists? │ HTTP Calls? │ Contract? │ Status        │
├───────────────────────────────────────────────────────────────────────────────┤
│ The Odds API         │ ✅ Yes       │ ✅ Yes      │ ✅ Yes    │ FULLY WORKING │
│ Playbook API         │ ✅ Yes       │ ✅ Yes      │ ✅ Yes    │ FULLY WORKING │
│ BallDontLie          │ ✅ Yes       │ ✅ Yes      │ ✅ Yes    │ FULLY WORKING │
│ Astronomy API        │ ✅ Yes       │ ✅ Yes      │ ✅ Yes    │ INTEGRATED    │
│ NOAA Space Weather   │ ❌ No        │ ❌ No       │ ✅ Yes    │ CONTRACT ONLY │
│ SerpAPI              │ ❌ No        │ ❌ No       │ ✅ Yes    │ CONTRACT ONLY │
│ Twitter API          │ ❌ No        │ ❌ No       │ ✅ Yes    │ CONTRACT ONLY │
│ FRED API             │ ❌ No        │ ❌ No       │ ✅ Yes    │ CONTRACT ONLY │
│ Finnhub API          │ ❌ No        │ ❌ No       │ ✅ Yes    │ CONTRACT ONLY │
│ Weather API          │ ⚠️ Stub     │ ❌ No       │ ✅ Yes    │ STUBBED       │
└───────────────────────────────────────────────────────────────────────────────┘
```

### What's Actually Ready vs What Needs Work

| Category | APIs | Status |
|----------|------|--------|
| **PRODUCTION READY** | Odds API, Playbook, BallDontLie, Astronomy | No work needed |
| **NEEDS CODE** | NOAA, SerpAPI, Twitter, FRED, Finnhub | Contract exists, implementation needed |
| **STUBBED** | Weather | Disabled, needs real implementation for outdoor sports |

---

## Part 1: Architecture Discovery (Sister Backend)

### Repository Structure

The **actual production backend** lives at:
```
/Users/apple/Desktop/ai-betting-backend-main/
├── core/
│   ├── integration_contract.py    ← Single source of truth for 14 APIs
│   ├── time_et.py                 ← ET timezone handling
│   └── titanium.py                ← 3-of-4 Titanium rule
├── signals/
│   └── public_fade.py             ← Public fade signal (single source)
├── alt_data_sources/
│   └── balldontlie.py             ← BallDontLie client (788 lines)
├── playbook_api.py                ← Playbook client (279 lines)
├── esoteric_engine.py             ← Imports from astronomical_api
├── jarvis_savant_engine.py        ← Jarvis gematria triggers
├── player_birth_data.py           ← 307 player birthdates
└── live_data_router.py            ← Main FastAPI router
```

### 4-Engine Scoring System

The sister backend uses a **4-engine architecture**, not the 16-signal weighted system in the frontend repo:

```python
# Engine weights (IMMUTABLE)
AI_WEIGHT = 0.25        # 25% - 8 AI models
RESEARCH_WEIGHT = 0.30  # 30% - Sharp/splits/variance/public fade
ESOTERIC_WEIGHT = 0.20  # 20% - Numerology/astro/fib/vortex/daily
JARVIS_WEIGHT = 0.15    # 15% - Gematria/triggers/mid-spread

# Scoring formula
BASE = (AI × 0.25) + (Research × 0.30) + (Esoteric × 0.20) + (Jarvis × 0.15)
FINAL = BASE + confluence_boost + jason_sim_boost
```

### Tier Classification

| Tier | Requirement | Notes |
|------|-------------|-------|
| TITANIUM_SMASH | ≥3 of 4 engines ≥ 8.0 | Overrides all other tiers |
| GOLD_STAR | final ≥ 7.5 + passes hard gates | Hard gates on each engine |
| EDGE_LEAN | final ≥ 6.5 | Default for qualifying picks |
| MONITOR | final ≥ 5.5 | Hidden from frontend |
| PASS | final < 5.5 | Hidden from frontend |

---

## Part 2: Fully Integrated APIs (NO WORK NEEDED)

### 2.1 Playbook API (`playbook_api.py`)

**File:** `/Users/apple/Desktop/ai-betting-backend-main/playbook_api.py`
**Lines:** 279
**Status:** ✅ FULLY INTEGRATED

**Implemented Endpoints:**
- `/splits` - Public betting splits
- `/injuries` - Injury reports by team
- `/lines` - Current spread/total/ML
- `/teams` - Team metadata
- `/games` - Game objects
- `/splits-history` - Historical splits

**Integration Points:**
- Feeds the **Research Engine** (30% weight)
- Used for sharp money divergence, public fade context
- Does NOT feed Jarvis or Esoteric (prevents double-counting)

**Key Functions:**
```python
async def fetch_playbook_data(league: str) -> dict
async def get_sharp_splits(league: str) -> dict
async def get_injuries(league: str) -> list
```

### 2.2 BallDontLie API (`alt_data_sources/balldontlie.py`)

**File:** `/Users/apple/Desktop/ai-betting-backend-main/alt_data_sources/balldontlie.py`
**Lines:** 788
**Status:** ✅ FULLY INTEGRATED

**Implemented Functions:**
```python
def grade_nba_prop(prop_type, player_name, line, side, game_id) -> dict
def get_player_game_stats(player_id, game_id) -> dict
def get_player_season_averages(player_id, season) -> dict
```

**Critical Note:** BallDontLie does NOT provide player birthdates.
Birthdates come from `player_birth_data.py` (307 players hardcoded).

**Integration Points:**
- Used by AutoGrader for NBA prop grading
- Player stats used for form analysis
- Season averages used for projection baselines

### 2.3 Astronomy API (via `astronomical_api`)

**Status:** ✅ INTEGRATED
**Import:** `esoteric_engine.py` imports from `astronomical_api`

**Provides:**
- Moon phase calculations
- Void-of-course moon detection
- Planetary hour calculations

**Integration Points:**
- Feeds the **Esoteric Engine** (20% weight)
- Moon phase affects esoteric scoring
- Void moon triggers warnings

### 2.4 The Odds API

**Status:** ✅ FULLY INTEGRATED
**Contract:** `core/integration_contract.py` line ~15

**Provides:**
- Live odds for all 5 sports
- Player props
- Line movements
- Historical lines (for RLM detection)

**Integration Points:**
- Primary data source for all pick generation
- Feeds Research Engine with line variance data
- Public percentages derived from odds movements

---

## Part 3: APIs Needing Implementation (CONTRACT EXISTS)

These APIs are defined in `core/integration_contract.py` but have **NO implementation code**.

### 3.1 NOAA Space Weather API

**Contract Entry:**
```python
"noaa_space_weather": {
    "required": False,
    "env_vars": ["NOAA_BASE_URL"],
    "feeds_engine": "esoteric",
    "ping_url": None,
    "description": "Geomagnetic activity (Kp index)"
}
```

**Needs Implementation:**
- Client to fetch Kp index from `https://services.swpc.noaa.gov`
- Endpoint: `/products/noaa-planetary-k-index.json`
- Integration with Esoteric Engine

**Proposed File:** `alt_data_sources/noaa_space_weather.py`

```python
"""
NOAA Space Weather API client.
Provides Kp index (geomagnetic storm indicator) for Esoteric Engine.
"""
import httpx
from typing import Dict, Any

NOAA_BASE_URL = "https://services.swpc.noaa.gov"

async def get_kp_index() -> Dict[str, Any]:
    """
    Get current Kp index (geomagnetic activity).

    Kp Scale:
    - 0-3: Quiet (stable energy, favorites)
    - 4: Active (neutral)
    - 5-6: Minor/Moderate storm (chaos, underdogs)
    - 7-9: Strong/Severe storm (extreme chaos)

    Returns:
        {
            "kp_index": 3.5,
            "category": "quiet",
            "esoteric_bias": "stable",
            "chaos_factor": 35  # 0-100 for esoteric scoring
        }
    """
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{NOAA_BASE_URL}/products/noaa-planetary-k-index.json")
        response.raise_for_status()
        data = response.json()

    # Parse latest Kp value
    if isinstance(data, list) and len(data) > 0:
        latest = data[-1]
        kp = float(latest.get("Kp", 3))
    else:
        kp = 3.0  # Default to quiet

    # Map to esoteric signal
    if kp >= 7:
        category, bias, chaos = "storm", "chaos", 90
    elif kp >= 5:
        category, bias, chaos = "active", "mild_chaos", 70
    elif kp >= 4:
        category, bias, chaos = "unsettled", "neutral", 55
    elif kp >= 2:
        category, bias, chaos = "quiet", "stable", 40
    else:
        category, bias, chaos = "very_quiet", "very_stable", 25

    return {
        "kp_index": kp,
        "category": category,
        "esoteric_bias": bias,
        "chaos_factor": chaos
    }
```

**Integration Effort:** ~2-4 hours

### 3.2 SerpAPI (Google Trends)

**Contract Entry:**
```python
"serpapi": {
    "required": False,
    "env_vars": ["SERPAPI_KEY"],
    "feeds_engine": "research",
    "description": "Search velocity, news aggregation"
}
```

**Needs Implementation:**
- Search velocity for player/team names
- Trending detection for injury news
- "Silent spike" detection (sudden search increase)

**Integration Effort:** ~4-6 hours

### 3.3 Twitter API

**Contract Entry:**
```python
"twitter_api": {
    "required": False,
    "env_vars": ["TWITTER_BEARER"],
    "feeds_engine": "research",
    "description": "Sentiment analysis, breaking news"
}
```

**Needs Implementation:**
- Sentiment analysis on player/team mentions
- Breaking news detection (injuries, lineup changes)
- Noosphere velocity calculations

**Integration Effort:** ~6-8 hours (Twitter API v2 is complex)

### 3.4 FRED API (Economic Data)

**Contract Entry:**
```python
"fred_api": {
    "required": False,
    "env_vars": ["FRED_API_KEY"],
    "feeds_engine": "esoteric",
    "description": "Consumer confidence, economic sentiment"
}
```

**Needs Implementation:**
- Consumer Confidence Index
- Economic sentiment indicators
- Correlation with betting patterns (esoteric)

**Integration Effort:** ~2-4 hours

### 3.5 Finnhub API (Stock Sentiment)

**Contract Entry:**
```python
"finnhub_api": {
    "required": False,
    "env_vars": ["FINNHUB_KEY"],
    "feeds_engine": "esoteric",
    "description": "Sportsbook stock prices, market sentiment"
}
```

**Needs Implementation:**
- Track DraftKings (DKNG), Flutter (FLUT) stock movements
- Correlate sportsbook stock sentiment with betting confidence
- Esoteric "market nervous" indicator

**Integration Effort:** ~2-4 hours

---

## Part 4: Single Source of Truth Patterns

The sister backend has excellent separation of concerns. These patterns MUST be preserved.

### 4.1 Public Fade Signal (`signals/public_fade.py`)

**Critical Rule:** Public fade is calculated ONCE and returns:
1. `research_boost` - Applied ONLY in Research Engine
2. `is_fade_opportunity` - Context flag for other engines (NO numeric boost)

```python
@dataclass
class PublicFadeSignal:
    public_pct: float
    research_boost: float = 0.0      # For Research Engine ONLY
    is_fade_opportunity: bool = False  # Context flag, NO numeric use
```

**NEVER do:**
```python
# BAD: Double-counting
research_score += signal.research_boost
jarvis_score += 1.0 if signal.is_fade_opportunity else 0  # NO!
```

### 4.2 ET Timezone (`core/time_et.py`)

**Single Source of Truth:** All ET timezone logic MUST use this module.

```python
from core.time_et import now_et, et_day_bounds, filter_events_et
```

**NEVER do:**
- Use `datetime.now()` for slate filtering
- Use pytz (only zoneinfo allowed)
- Create alternative date helpers

### 4.3 Titanium Rule (`core/titanium.py`)

**Single Source of Truth:** The 3-of-4 rule is computed here ONLY.

```python
from core.titanium import compute_titanium_flag

titanium, diagnostics = compute_titanium_flag(ai, research, esoteric, jarvis)
```

**NEVER do:**
- Recompute titanium logic elsewhere
- Use different thresholds in different places

---

## Part 5: Integration Contract Deep Dive

The integration contract at `core/integration_contract.py` defines all 14 APIs.

### Contract Schema

```python
INTEGRATIONS = {
    "api_name": {
        "required": bool,           # True = mandatory for operation
        "env_vars": List[str],      # Required environment variables
        "feeds_engine": str,        # Which engine uses this data
        "ping_url": Optional[str],  # URL for connectivity test
        "description": str,         # Human-readable purpose
    }
}
```

### Current Contract (14 APIs)

| API | Required | Feeds Engine | Status |
|-----|----------|--------------|--------|
| odds_api | ✅ | research | VALIDATED |
| playbook_api | ✅ | research | VALIDATED |
| balldontlie | ✅ | grader | VALIDATED |
| weather_api | ❌ | research | STUBBED |
| astronomy_api | ❌ | esoteric | CONFIGURED |
| noaa_space_weather | ❌ | esoteric | CONTRACT ONLY |
| fred_api | ❌ | esoteric | CONTRACT ONLY |
| finnhub_api | ❌ | esoteric | CONTRACT ONLY |
| serpapi | ❌ | research | CONTRACT ONLY |
| twitter_api | ❌ | research | CONTRACT ONLY |
| whop_api | ❌ | auth | CONFIGURED |
| database | ✅ | storage | VALIDATED |
| redis | ❌ | cache | CONFIGURED |
| railway_storage | ✅ | persistence | VALIDATED |

---

## Part 6: Recommended Implementation Priority

### Phase 1: Quick Wins (1-2 days)

| API | Effort | Impact | Notes |
|-----|--------|--------|-------|
| NOAA | 2-4 hrs | Medium | Simple JSON fetch, feeds esoteric |
| FRED | 2-4 hrs | Low | Economic sentiment, experimental |
| Finnhub | 2-4 hrs | Low | Stock sentiment, experimental |

### Phase 2: Medium Effort (3-5 days)

| API | Effort | Impact | Notes |
|-----|--------|--------|-------|
| SerpAPI | 4-6 hrs | Medium | Search velocity, news detection |
| Weather | 4-6 hrs | Medium | Outdoor sports (NFL, MLB) |

### Phase 3: Complex (1-2 weeks)

| API | Effort | Impact | Notes |
|-----|--------|--------|-------|
| Twitter | 6-8 hrs | High | Sentiment, breaking news, complex API |

---

## Part 7: What NOT to Do

### Anti-Pattern 1: Creating Redundant Clients

**DON'T create new client files for APIs that already exist:**
- `playbook_api.py` - Already exists, fully working
- `balldontlie.py` - Already exists, fully working
- `astronomical_api` - Already integrated

### Anti-Pattern 2: Double-Counting Signals

**DON'T apply the same signal multiple times:**
```python
# BAD
research_score += playbook_sharp_signal
jarvis_score += playbook_sharp_signal  # Double-counting!
```

**DO use the `feeds_engine` field from the contract:**
```python
# GOOD - Each API feeds ONE engine only
if INTEGRATIONS["playbook_api"]["feeds_engine"] == "research":
    research_score += playbook_sharp_signal
```

### Anti-Pattern 3: Ignoring Existing Patterns

**DON'T create new timezone helpers:**
```python
# BAD - Creating alternative
def my_get_et_time():
    return datetime.now(ZoneInfo("America/New_York"))
```

**DO use existing single source of truth:**
```python
# GOOD
from core.time_et import now_et
```

---

## Part 8: Testing Requirements

Before any new API integration goes live:

### Unit Tests
```python
# test_noaa_client.py
def test_get_kp_index_returns_valid_structure():
    result = get_kp_index()
    assert "kp_index" in result
    assert "chaos_factor" in result
    assert 0 <= result["chaos_factor"] <= 100
```

### Integration Tests
```python
# test_noaa_integration.py
def test_noaa_feeds_esoteric_engine():
    # Verify NOAA data flows to esoteric engine only
    esoteric_result = calculate_esoteric_score(with_noaa=True)
    research_result = calculate_research_score(with_noaa=True)

    # NOAA should affect esoteric, not research
    assert esoteric_result != baseline_esoteric
    assert research_result == baseline_research  # Unchanged
```

### Calibration Tests
```python
# test_noaa_calibration.py
def test_noaa_does_not_inflate_scores():
    # Run scoring with and without NOAA
    with_noaa = get_picks_with_noaa()
    without_noaa = get_picks_without_noaa()

    # Average score should not increase significantly
    avg_with = sum(p["final_score"] for p in with_noaa) / len(with_noaa)
    avg_without = sum(p["final_score"] for p in without_noaa) / len(without_noaa)

    assert abs(avg_with - avg_without) < 0.5  # Max 0.5 point drift
```

---

## Part 9: Environment Variables Checklist

### Currently Configured (Railway)

```bash
# TIER 1: REQUIRED (All working)
ODDS_API_KEY=✅
PLAYBOOK_API_KEY=✅
BALLDONTLIE_API_KEY=✅

# TIER 2: CONFIGURED (Need implementation)
NOAA_BASE_URL=https://services.swpc.noaa.gov  # No key needed
ASTRONOMY_API_ID=✅
SERPAPI_KEY=✅
TWITTER_BEARER=✅
FRED_API_KEY=✅
FINNHUB_KEY=✅

# INFRASTRUCTURE (Working)
DATABASE_URL=✅
REDIS_URL=✅
RAILWAY_VOLUME_MOUNT_PATH=/data
```

### Status Verification Endpoint

```bash
curl https://web-production-7b2a.up.railway.app/live/debug/integrations \
  -H "X-API-Key: YOUR_KEY"
```

Expected output:
```json
{
  "validated": ["odds_api", "playbook_api", "balldontlie", "railway_storage"],
  "configured": ["astronomy", "noaa", "fred", "finnhub", "serpapi", "twitter"],
  "not_configured": []
}
```

---

## Summary

### Original Assessment vs Reality

| Aspect | Original (Frontend Repo) | Reality (Sister Backend) |
|--------|--------------------------|-------------------------|
| Working APIs | 1 (Odds API only) | 4 (Odds, Playbook, BallDontLie, Astronomy) |
| Architecture | 16-signal weights | 4-engine scoring |
| Player birthdates | Unknown | 307 players hardcoded |
| Integration contract | None | Comprehensive (14 APIs) |
| Single source of truth | Scattered | Clean separation |

### Actual Work Needed

| Priority | Item | Effort |
|----------|------|--------|
| High | NOAA Space Weather implementation | 2-4 hours |
| Medium | Weather API for outdoor sports | 4-6 hours |
| Medium | SerpAPI for search velocity | 4-6 hours |
| Low | Twitter sentiment | 6-8 hours |
| Low | FRED/Finnhub experimental | 4-8 hours |

### Key Takeaways

1. **Playbook and BallDontLie are DONE** - No work needed
2. **NOAA is the main gap** - In contract, no code
3. **Architecture is solid** - 4-engine system with clean separation
4. **Single source of truth patterns** - Must be preserved
5. **Integration contract** - All 14 APIs defined, 4 validated

---

## Appendix: Key File Locations

### Sister Backend (`ai-betting-backend-main`)

| File | Purpose | Lines |
|------|---------|-------|
| `core/integration_contract.py` | API definitions | ~150 |
| `core/time_et.py` | ET timezone | ~80 |
| `core/titanium.py` | 3-of-4 rule | ~50 |
| `signals/public_fade.py` | Public fade signal | 204 |
| `playbook_api.py` | Playbook client | 279 |
| `alt_data_sources/balldontlie.py` | BDL client | 788 |
| `esoteric_engine.py` | Esoteric scoring | ~400 |
| `jarvis_savant_engine.py` | Jarvis gematria | ~300 |
| `player_birth_data.py` | 307 birthdates | ~500 |

### Frontend Backend (`bookie-member-app/backend`)

| File | Purpose | Notes |
|------|---------|-------|
| `live_data_router.py` | Main router | 5800+ lines, monolithic |

**Note:** The frontend backend is a monolithic file that appears to duplicate some sister backend logic. The sister backend is the authoritative source.
