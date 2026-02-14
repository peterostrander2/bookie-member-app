# CLAUDE.md - Bookie Member App

## Sister Repositories

| Repo | Purpose | URL |
|------|---------|-----|
| **This repo** | Frontend dashboard (React/Vite) | [bookie-member-app](https://github.com/peterostrander2/bookie-member-app) |
| **Backend** | API server (Python/FastAPI) | [ai-betting-backend](https://github.com/peterostrander2/ai-betting-backend) |

**Production API:** https://web-production-7b2a.up.railway.app

---

## Overview
Member dashboard for Bookie-o-em AI betting signals.

## Development Workflow

**IMPORTANT:** Before doing any UI, frontend, or React development, ALWAYS call the storybook MCP server to get further instructions.

## Backend Connection
**API URL:** https://web-production-7b2a.up.railway.app

### Key Endpoints
```
GET /live/best-bets/{sport}   # AI-scored picks (cached 2m)
GET /live/sharp/{sport}       # Sharp money signals
GET /live/splits/{sport}      # Betting splits
GET /live/props/{sport}       # Player props
GET /live/esoteric-edge       # Esoteric analysis
GET /esoteric/today-energy    # Daily energy reading
GET /live/sportsbooks         # Available sportsbooks
GET /live/line-shop/{sport}   # Line shopping across books
POST /live/betslip/generate   # Generate sportsbook deep links
```

### Bet Tracking Endpoints
```
POST /live/bets/track         # Record placed bet
POST /live/bets/grade/{id}    # Mark outcome (WIN/LOSS/PUSH)
GET  /live/bets/history       # Bet history with stats
```

### Parlay Builder Endpoints
```
GET  /live/parlay/{user_id}   # Fetch current parlay slip
POST /live/parlay/add         # Add leg to parlay
POST /live/parlay/calculate   # Preview odds without saving
POST /live/parlay/place       # Submit parlay for tracking
DEL  /live/parlay/clear/{id}  # Clear parlay slip
GET  /live/parlay/history     # Parlay history and stats
```

### User Preferences
```
GET  /live/user/preferences/{user_id}  # Get preferences
POST /live/user/preferences/{user_id}  # Set preferences
```

### Sports
`nba`, `nfl`, `mlb`, `nhl`

## Signal Architecture
Display these scoring components to users:
- **8 AI Models** (max 8 pts) - Ensemble, LSTM, Monte Carlo, etc.
- **8 Pillars** (max 8 pts) - Sharp splits, reverse line, situational spots
- **JARVIS Triggers** (max 4 pts) - Gematria signals
- **Esoteric Edge** - Numerology, moon phase, daily energy

### Tier System (v20.5)
Backend `tiering.py` is the single source of truth. Frontend uses backend fields.

| Condition | Tier | Units | Action | Color |
|-----------|------|-------|--------|-------|
| final≥8.0 + 3/4 engines≥8.0 | TITANIUM_SMASH | 2.5 | SMASH | #00FFFF (Cyan) |
| ≥7.5 | GOLD_STAR | 2.0 | SMASH | #FFD700 (Gold) |
| ≥6.5 | EDGE_LEAN | 1.0 | PLAY | #10B981 (Green) |
| ≥5.5 | MONITOR | 0.0 | WATCH | #F59E0B (Amber) |
| <5.5 | PASS | 0.0 | SKIP | #6B7280 (Gray) |

**v20.5 Scoring (Option A):**
- TITANIUM requires both final_score ≥ 8.0 AND 3/4 weighted engines ≥ 8.0 (context excluded)
- Community filter: Only picks ≥ 6.5 shown to community
- Engine scores (Option A: 4 weighted engines + context modifier, all 0-10):
  - ai_score (25% weight) - 8 AI models
  - research_score (35% weight) - Sharp money, line variance, public fade
  - esoteric_score (20% weight) - Numerology, astro, fibonacci
  - jarvis_score (20% weight) - Gematria triggers
  - context_score (modifier ±0.35 cap) - Defense rank, pace, injury vacuum
- Boost fields (added to final after BASE_4):
  - context_modifier (±0.35), confluence_boost (0-3.0), msrf_boost (0-1.0)
  - jason_sim_boost (-1.5 to +0.5), serp_boost (0-0.55), ensemble_adjustment (±0.5)
  - phase8 (0-0.5), glitch (0-0.5), gematria (0-0.5), harmonic (0-0.5)

**Frontend behavior:**
- Uses backend `pick.tier` and `pick.units` fields (source of truth)
- Uses `pick.titanium_triggered` for TITANIUM detection
- Falls back to score-based tier derivation only for legacy compatibility
- Tier filters include TITANIUM_SMASH option

---

## Esoteric Edge API Expectations

### Frontend Implementations (signalEngine.js)
These signals are calculated client-side:
- **Gematria** (6 ciphers): ordinal, reverseOrdinal, reduction, reverseReduction, jewish, sumerian
- **JARVIS Triggers**: 2178 (Immortal), 201, 33, 93, 322
- **Moon Phase**: 8 phases with energy scoring
- **Life Path Numerology**: Master numbers detection
- **Tesla 3-6-9**: Mod-9 alignment checks
- **Chrome Resonance**: ASCII hex-code analysis (NEW)
- **Vortex Math**: Parlay leg synchronization (NEW)

### Backend Expected Response: `GET /live/esoteric-edge`
The backend should return signals that require external data or complex calculations:

```json
{
  "timestamp": "2024-01-15T12:00:00Z",
  "daily_energy": {
    "betting_outlook": "BULLISH|NEUTRAL|BEARISH",
    "overall_energy": 7.5,
    "moon_phase": "waxing_gibbous",
    "void_moon": {
      "is_void": false,
      "void_start": null,
      "void_end": null,
      "warning": null
    },
    "schumann_frequency": {
      "current_hz": 7.83,
      "deviation": 0.12,
      "status": "NORMAL|ELEVATED|SUPPRESSED"
    },
    "planetary_hours": {
      "current_ruler": "Jupiter",
      "favorable_for": "expansion, underdogs"
    }
  },
  "game_signals": [
    {
      "game_id": "abc123",
      "home_team": "Lakers",
      "away_team": "Celtics",
      "signals": {
        "founders_echo": {
          "home_match": false,
          "away_match": true,
          "founding_year_home": 1947,
          "founding_year_away": 1946,
          "gematria_match": "away",
          "boost": 5
        },
        "gann_square": {
          "spread_angle": 180,
          "total_angle": 270,
          "resonant": true,
          "insight": "Spread at 180° harmonic"
        },
        "fibonacci_retracement": {
          "current_line": -5.5,
          "season_high": -12,
          "season_low": 3,
          "retracement_pct": 43,
          "near_50_pct": false
        },
        "atmospheric": {
          "elevation_ft": 340,
          "humidity_pct": 65,
          "ball_travel_modifier": 1.02,
          "applies": false
        },
        "hurst_exponent": {
          "h_value": 0.62,
          "regime": "TRENDING",
          "insight": "Momentum favors continuation"
        }
      },
      "esoteric_score": 72,
      "esoteric_favored": "away"
    }
  ],
  "prop_signals": [
    {
      "player_id": "lebron123",
      "player_name": "LeBron James",
      "signals": {
        "biorhythms": {
          "birth_date": "1984-12-30",
          "physical": 85,
          "emotional": 62,
          "intellectual": 78,
          "composite": 75,
          "peak_type": "PHYSICAL"
        },
        "life_path_sync": {
          "player_life_path": 6,
          "game_date_life_path": 8,
          "jersey_number": 23,
          "jersey_reduced": 5,
          "sync_score": 45
        }
      }
    }
  ],
  "parlay_warnings": [
    {
      "type": "TEAMMATE_VOID",
      "legs": ["LeBron James Over 25.5 pts", "Anthony Davis Over 28.5 pts"],
      "reason": "Same-team props cannibalize each other",
      "correlation": -0.35
    },
    {
      "type": "NEGATIVE_CORRELATION",
      "legs": ["Lakers -5.5", "Under 224.5"],
      "reason": "Favorite cover + under has -0.22 correlation",
      "correlation": -0.22
    }
  ],
  "noosphere": {
    "sentiment_velocity": 2.3,
    "trending_direction": "BULLISH",
    "social_volume_delta": 145,
    "insight": "Rapid positive sentiment shift"
  }
}
```

### Backend Expected Response: `GET /esoteric/today-energy`
```json
{
  "date": "2024-01-15",
  "betting_outlook": "BULLISH",
  "overall_energy": 7.8,
  "moon_phase": "waxing_gibbous",
  "moon_emoji": "🌔",
  "life_path": 8,
  "planetary_ruler": "Jupiter",
  "day_energy": "expansion",
  "natural_bias": "underdogs",
  "tesla_number": 6,
  "tesla_alignment": "STRONG",
  "void_moon_periods": [
    { "start": "2024-01-15T14:30:00Z", "end": "2024-01-15T18:45:00Z" }
  ],
  "schumann_reading": {
    "frequency_hz": 7.95,
    "status": "SLIGHTLY_ELEVATED",
    "betting_impact": "Heightened intuition"
  },
  "recommendation": "Tesla alignment active. Trust underdogs today.",
  "lucky_numbers": [6, 8, 15, 23],
  "jarvis_day": false,
  "power_numbers_active": ["Tesla 6"]
}
```

---

## Backend Esoteric Engine Checklist

### esoteric.py - JARVIS / Symbolic Numerology
| Signal | Status | Notes |
|--------|--------|-------|
| Gematria Calculator | Frontend | 6 ciphers in signalEngine.js |
| Founder's Echo | **BACKEND NEEDED** | Requires team founding year database |
| Life Path Sync | **BACKEND NEEDED** | Requires player birth dates, jersey numbers |
| Biorhythms | **BACKEND NEEDED** | Requires player birth dates for sine-wave calc |
| Chrome Resonance | Frontend | Added to signalEngine.js |

### physics.py - Arcane Physics Engine
| Signal | Status | Notes |
|--------|--------|-------|
| Gann's Square of Nine | **BACKEND NEEDED** | 180°/360° angle calculations on spread/total |
| 50% Retracement | **BACKEND NEEDED** | Requires season-high/low line history |
| Schumann Frequency | **BACKEND NEEDED** | Real-time 7.83 Hz API or simulation |
| Atmospheric Drag | **BACKEND NEEDED** | Elevation + humidity for outdoor venues |
| Hurst Exponent | **BACKEND NEEDED** | Point differential time series analysis |

### hive_mind.py - Collective / Sentiment Layer
| Signal | Status | Notes |
|--------|--------|-------|
| Noosphere Velocity | **BACKEND NEEDED** | Twitter/social sentiment API |
| Void Moon Filter | **BACKEND NEEDED** | Astronomical API for void-of-course periods |

### parlay_architect.py - Correlated Parlay Engine
| Signal | Status | Notes |
|--------|--------|-------|
| Teammate Void | **BACKEND NEEDED** | Same-team prop detection with correlation |
| Correlation Matrix | **BACKEND NEEDED** | Historical leg correlation data |
| Vortex Math | Frontend | Added to BetSlip.jsx parlay calculator |

---

## Stack
React 19, Vite 5, JavaScript (no TypeScript), inline styles (no Tailwind in components)

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.3 | UI framework |
| react-dom | 19.2.3 | React DOM renderer |
| react-router-dom | 6.x | Client-side routing |
| zod | 4.x | Schema validation |
| ai | 6.x | Vercel AI SDK |
| @json-render/core | 0.2.x | JSON rendering |
| @json-render/react | 0.2.x | React JSON components |
| @sentry/react | - | Error monitoring |

## React Best Practices
Follow the guidelines in `.claude/REACT_GUIDELINES.md` for Vite + React development.

Additional rules available in `.claude/skills/react-best-practices/SKILL.md` (Vercel patterns).

**Key principles:**
- Keep components small and focused
- Prefer local state; lift only when needed
- Centralize API calls in `api.js`
- Handle loading/error/empty states
- Use `React.lazy()` for code splitting
- Memoize only when it prevents real work

## Quick Start
```bash
# Install dependencies
npm install

# Development server (port 5173)
npm run dev

# Run tests (210 tests across 14 files)
npm run test

# Build for production
npm run build

# Analyze bundle
npm run build:analyze
```

## Environment Variables
Create `.env.local` for development:
```bash
# Required
VITE_BOOKIE_API_KEY=your-api-key              # Backend auth for /live/* endpoints

# Optional - Production monitoring
VITE_SENTRY_DSN=https://...@sentry.io  # Error monitoring
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX    # Google Analytics

# Optional - Push notifications
VITE_VAPID_PUBLIC_KEY=...              # Web Push VAPID key

# Optional - Override API URL
VITE_API_BASE_URL=https://custom-backend.com

# Development flags
VITE_RATE_LIMIT=false                  # Disable rate limiting in dev
```

## Production Environment (Railway)

### Frontend Service (bookie-member-app)
```bash
VITE_BOOKIE_API_KEY=bookie-prod-2026-xK9mP2nQ7vR4
VITE_API_BASE_URL=https://web-production-7b2a.up.railway.app
VITE_SENTRY_DSN=https://ccb0b500db139f1b7df6c4a269bc04e7@o4510720913833984.ingest.us.sentry.io/4510720944570368
VITE_GA_MEASUREMENT_ID=<your-measurement-id>
VITE_VAPID_PUBLIC_KEY=BLxvqRoFaLbldx0OCjMtctyCF1Ar1WvQsqMib7AmXMo7VVE8AYnb240PF1C08v9EzZ2p_yGKDletzbBfLzrkd60
```

### Backend Service (web)
```bash
API_AUTH_ENABLED=true
API_AUTH_KEY=bookie-prod-2026-xK9mP2nQ7vR4
VAPID_PUBLIC_KEY=BLxvqRoFaLbldx0OCjMtctyCF1Ar1WvQsqMib7AmXMo7VVE8AYnb240PF1C08v9EzZ2p_yGKDletzbBfLzrkd60
VAPID_PRIVATE_KEY=motkVzVapKsL7kxEn9qZ82DnFbtK7wsXs9T_QFHMTTQ
```

### Services Overview
| Service | Purpose | URL |
|---------|---------|-----|
| Sentry | Error monitoring | https://sentry.io (Project: bookie-member-app) |
| Google Analytics | User analytics | https://analytics.google.com |
| Railway | Hosting | https://railway.app |

## File Structure Overview
```
bookie-member-app/
├── .claude/
│   ├── REACT_GUIDELINES.md           # Vite + React best practices
│   └── skills/
│       ├── react-best-practices/     # Vercel React patterns (45 rules)
│       └── web-design-guidelines/    # Web design patterns
├── public/
│   ├── sw.js              # Service worker (offline + push)
│   ├── manifest.json      # PWA manifest
│   └── icon-*.png         # App icons
├── test/
│   ├── setup.js           # Vitest config + mocks
│   ├── api.test.js        # API client tests
│   ├── esoteric.test.js   # Signal engine tests
│   └── *.test.jsx         # Component tests
├── e2e/
│   └── *.spec.js          # Playwright E2E tests
├── .github/workflows/
│   └── ci.yml             # GitHub Actions CI/CD
├── App.jsx                # Main app + routing + providers
├── main.jsx               # Entry point
├── api.js                 # All API calls + auth
├── index.css              # Global styles
├── CLAUDE.md              # This file
└── [40+ component files]
```

## All Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main dashboard |
| `/smash-spots` | SmashSpotsPage | AI picks (Props + Games tabs) |
| `/parlay` | ParlayBuilder | Multi-leg parlay builder |
| `/history` | BetHistory | Bet tracking with grading |
| `/analytics` | HistoricalCharts | Performance charts |
| `/sharp` | SharpAlerts | Sharp money signals |
| `/odds` | BestOdds | Line shopping |
| `/injuries` | InjuryVacuum | Injury reports |
| `/performance` | PerformanceDashboard | Performance metrics |
| `/consensus` | ConsensusMeter | Betting consensus |
| `/summary` | DailySummary | Daily summary |
| `/splits` | Splits | Betting splits |
| `/clv` | CLVDashboard | CLV tracking |
| `/backtest` | BacktestDashboard | Backtesting |
| `/bankroll` | BankrollManager | Bankroll management |
| `/esoteric` | Esoteric | Esoteric signals |
| `/signals` | Signals | Signal overview |
| `/grading` | Grading | Pick grading |
| `/leaderboard` | Leaderboard | Community rankings |
| `/props` | Props | Player props |
| `/achievements` | Gamification | XP/badges |
| `/profile` | Profile | User settings |
| `/admin` | AdminCockpit | Admin panel |

## Patterns
- Use fetch for API calls (see api.js)
- Handle loading/error states for all endpoints
- Cache responses client-side when appropriate
- Use inline styles (no CSS modules or Tailwind in JSX)
- Lazy load route components with React.lazy

## GitHub Workflow
**Repo:** https://github.com/peterostrander2/bookie-member-app

### Creating PRs
Always generate a clickable PR link for the user:
```
https://github.com/peterostrander2/bookie-member-app/pull/new/{branch-name}
```
User will click the link to create the PR manually.

### Branch Naming
Claude branches follow pattern: `claude/{feature-name}-{sessionId}`

---

## Current Feature Implementation Status

### Core Components (Completed)
| Component | File | Description |
|-----------|------|-------------|
| SmashSpotsPage | `SmashSpotsPage.jsx` | Two-tab container (Props/Games) with sport selector |
| PropsSmashList | `PropsSmashList.jsx` | Player props tab (points, rebounds, assists) |
| GameSmashList | `GameSmashList.jsx` | Game picks tab (spreads, totals, moneylines) |
| Props | `Props.jsx` | Player props with edge calculation, skeleton loading |
| BetslipModal | `BetslipModal.jsx` | Click-to-bet sportsbook selection (8 books) |
| BetSlip | `BetSlip.jsx` | Floating bet slip with parlay calculator |
| BetHistory | `BetHistory.jsx` | Bet tracking history with WIN/LOSS/PUSH grading |
| ParlayBuilder | `ParlayBuilder.jsx` | Multi-leg parlay builder with odds calculator |
| Gamification | `Gamification.jsx` | XP, levels, achievements system |
| Leaderboard | `Leaderboard.jsx` | Community rankings with backend integration |
| Charts | `Charts.jsx` | SVG performance charts (no external deps) |
| HistoricalCharts | `HistoricalCharts.jsx` | Performance analytics over time |
| OfflineIndicator | `OfflineIndicator.jsx` | Offline mode provider and UI |
| PushNotifications | `PushNotifications.jsx` | Push notification system |
| BoostBreakdownPanel | `components/BoostBreakdownPanel.jsx` | Option A score breakdown (all 6 boost fields) |
| StatusBadgeRow | `components/StatusBadgeRow.jsx` | MSRF active/SERP/Jason/ML status badges |
| GlitchSignalsPanel | `components/GlitchSignalsPanel.jsx` | GLITCH protocol signals (nested object extraction: void_moon, kp_index, noosphere, benford) |
| EsotericContributionsPanel | `components/EsotericContributionsPanel.jsx` | Esoteric contributions grouped by category (12 verified backend keys) |

### Smash Spots Architecture
```
/smash-spots → SmashSpotsPage.jsx
                ├── Tab 1: Player Props (PropsSmashList)
                └── Tab 2: Game Picks (GameSmashList)
```
Both tabs pull from `/live/best-bets/{sport}` endpoint.

**Display Tiers (v20.5):**
- TITANIUM SMASH (≥8.0 + 3/4 engines ≥8.0, context excluded) - Cyan with glow
- GOLD STAR (≥7.5) - Gold
- EDGE LEAN (≥6.5) - Green
- MONITOR (≥5.5) - Amber (hidden by default)
- PASS (<5.5) - Gray (hidden by default)

### UI/UX Components (Completed)
| Component | File | Description |
|-----------|------|-------------|
| Toast | `Toast.jsx` | Global notification system |
| Skeleton | `Skeleton.jsx` | Loading skeletons with shimmer |
| ErrorBoundary | `ErrorBoundary.jsx` | Error catching with fallback UI |
| PullToRefresh | `PullToRefresh.jsx` | Mobile touch gesture refresh |
| ThemeContext | `ThemeContext.jsx` | Dark/light mode toggle |
| Onboarding | `Onboarding.jsx` | 5-step new user wizard |
| SignalNotifications | `SignalNotifications.jsx` | Real-time signal alerts |

### PWA Support (Completed)
- `public/manifest.json` - Web app manifest
- `public/sw.js` - Service worker for offline caching
- `index.html` - PWA meta tags

### Click-to-Bet Integration (Completed)
**Sportsbooks supported:**
- DraftKings, FanDuel, BetMGM, Caesars
- PointsBet, William Hill, Barstool, BetRivers

**Features:**
- Odds comparison grid across all 8 books
- "BEST" badge highlights best odds
- Deep links to sportsbook betslips (when available)
- Fallback to sportsbook homepage

### API Client (`api.js`)
All endpoints implemented:
- Health/status checks
- Live data (games, props, splits, sharp)
- Esoteric (today-energy, edge analysis)
- Predictions (brain, live)
- Grading system
- Community voting
- Click-to-bet (sportsbooks, line-shop, betslip/generate)

### API Authentication (Completed)
- `X-API-Key` header sent on all `/live/*` endpoints
- Uses `VITE_BOOKIE_API_KEY` environment variable
- `authFetch` helper for authenticated GET requests
- `getAuthHeaders` helper for authenticated POST requests
- Set `VITE_BOOKIE_API_KEY` in Railway Variables for production

---

## Context Providers (App.jsx)
```jsx
<ThemeProvider>
  <OfflineProvider>
    <PushProvider>
      <GamificationProvider>
        <ToastProvider>
          <SignalNotificationProvider>
            <BetSlipProvider>
              <OfflineBanner />
              <UpdateBanner />
              <App />
            </BetSlipProvider>
          </SignalNotificationProvider>
        </ToastProvider>
      </GamificationProvider>
    </PushProvider>
  </OfflineProvider>
</ThemeProvider>
```

## Mobile Responsiveness
- Hamburger menu at 1024px breakpoint
- Pull-to-refresh on touch devices
- PWA installable

---

## Handoff Notes for Future Sessions

### What's Complete
1. Full UI/UX overhaul with dark theme
2. Click-to-bet sportsbook integration (8 books)
3. Gamification system (XP, levels, achievements)
4. Signal notifications with bell icon
5. Floating bet slip with parlay calculator
6. Loading skeletons and error boundaries
7. PWA support (manifest, service worker)
8. All backend endpoints connected
9. API authentication for `/live/*` endpoints
10. Two-category Smash Spots (Props + Games tabs)
11. Bet History page with WIN/LOSS/PUSH tracking
12. Parlay Builder with odds calculator and history
13. Testing infrastructure (210 unit tests across 14 files, 150 E2E tests across 8 specs)
14. CI/CD pipeline (GitHub Actions → Railway)
15. Code splitting (22 lazy-loaded routes)
16. Error monitoring (Sentry integration)
17. Bundle analysis (rollup-plugin-visualizer)
18. User preferences persistence (localStorage + backend sync)
19. Google Analytics 4 with page view tracking
20. Comprehensive event tracking system
21. API rate limiting (token bucket with queuing)
22. Staging environment documentation
23. Social sharing (Twitter/Discord/Clipboard)
24. Historical performance charts (cumulative P/L, rolling win rate, sport breakdown)
25. Offline mode (service worker caching, offline banner, stale-while-revalidate)
26. Push notifications (SMASH alerts, configurable preferences, bell icon)
27. Option A boost breakdown panel (all 6 boost fields displayed)
28. Status badges (MSRF active, SERP active/shadow, Jason block/boost, ML adjust)
29. GLITCH protocol signals panel (void moon, noosphere, kp-index, benford — nested object extraction)
30. Esoteric contributions panel (numerology, astronomical, mathematical, signals, situational)
31. Void Moon warning banner on Esoteric page (uses void_of_course path from today-energy)

### Key Files to Review First
1. `api.js` - All backend connections + auth helpers + rate limiting
2. `App.jsx` - Routing, providers, code splitting, page view tracking
3. `sentry.js` - Error monitoring configuration
4. `analytics.js` - Google Analytics + event tracking
5. `ShareButton.jsx` - Social sharing component
6. `rateLimit.js` - API rate limiting with token bucket
7. `usePreferences.js` - User preferences hook
8. `HistoricalCharts.jsx` - Performance analytics over time
9. `OfflineIndicator.jsx` - Offline mode provider and UI components
10. `PushNotifications.jsx` - Push notification system
11. `SmashSpotsPage.jsx` - Main picks container with tabs
12. `PropsSmashList.jsx` - Player props picks
13. `GameSmashList.jsx` - Game picks (spreads/totals/ML)
14. `BetslipModal.jsx` - Click-to-bet feature
15. `BetHistory.jsx` - Bet tracking and grading
16. `ParlayBuilder.jsx` - Parlay builder with calculator
17. `Gamification.jsx` - XP/achievements system

---

## Testing Infrastructure

### Unit Tests (Vitest)
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage  # With coverage
```

**Test files:** `test/*.test.js`, `test/*.test.jsx` (14 files, 210 tests)
- `api.test.js` - API client tests (33 tests)
- `esoteric.test.js` - Chrome Resonance, Vortex Math tests (28 tests)
- `kellyCalculator.test.js` - Kelly Criterion, odds conversion, bankroll sizing (34 tests)
- `correlationDetector.test.js` - Pick correlation, diversification scoring (16 tests)
- `clvTracker.test.js` - CLV tracking, closing lines, grading, statistics (20 tests)
- `pickExplainer.test.js` - Pick explanations, headlines, signal mapping (10 tests)
- `signalEngine.test.js` - Gematria ciphers, JARVIS triggers, daily readings (22 tests)
- `BetSlip.test.jsx` - Bet slip component tests
- `BetHistory.test.jsx` - Bet history component tests
- `ParlayBuilder.test.jsx` - Parlay builder tests
- `BoostBreakdownPanel.test.jsx` - Boost breakdown display (4 tests)
- `StatusBadgeRow.test.jsx` - Status badge rendering (4 tests)
- `GlitchSignalsPanel.test.jsx` - GLITCH protocol signals (4 tests)
- `EsotericContributionsPanel.test.jsx` - Esoteric contributions display (4 tests)

### Test Mock Pattern (IMPORTANT)
API tests use a `mockResponse()` helper that creates proper Response-like objects.
**All mock responses MUST include** `ok`, `status`, `text()`, and `clone()` to match
what `safeJson()` and `authFetch()` expect.

```javascript
// CORRECT - use mockResponse helper
fetch.mockResolvedValueOnce(mockResponse({ status: 'healthy' }))
fetch.mockResolvedValueOnce(mockResponse(null, { ok: false, status: 500 }))

// WRONG - bare object missing text(), clone()
fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) })  // Will break safeJson
fetch.mockResolvedValueOnce({ ok: false })                         // Will break authFetch
```

**Auth endpoint assertions MUST include `cache: 'no-store'`:**
```javascript
// CORRECT
expect(fetch).toHaveBeenCalledWith(url, { headers: {...}, cache: 'no-store' })

// WRONG - missing cache
expect(fetch).toHaveBeenCalledWith(url, { headers: {...} })
```

### E2E Tests (Playwright)
```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Interactive UI mode
npm run test:e2e:headed # Run in headed browser
```

**CRITICAL:** All E2E spec files MUST import `test` and `expect` from `./fixtures`, never from `@playwright/test`.
```javascript
// CORRECT
import { test, expect } from './fixtures';

// WRONG - bypasses shared localStorage setup
import { test, expect } from '@playwright/test';
```

**Test files:** `e2e/*.spec.js` (8 files, ~150 tests, 100% route coverage)
- `navigation.spec.js` - Page navigation and routing (16 tests)
- `smash-spots.spec.js` - Picks viewing, tab switching, v20.5 panels (24 tests)
- `bet-slip.spec.js` - Bet slip interactions (18 tests)
- `parlay-builder.spec.js` - Parlay building flow (16 tests)
- `esoteric.spec.js` - Esoteric matchup analyzer, cosmic energy (32 tests)
- `sharp-odds-injuries.spec.js` - Sharp alerts, best odds, injury vacuum, cross-page nav (16 tests)
- `analytics-profile-bankroll.spec.js` - Analytics, profile, bankroll, performance, props (16 tests)
- `remaining-pages.spec.js` - Smoke tests for all remaining routes (12 tests)

### API Mocking (MSW)
Mock handlers available in `src/mocks/handlers.js` for development:
- All `/live/*` endpoints with realistic mock data
- Configurable per-test overrides
- Error simulation support

---

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)
Automated pipeline that runs on every push and PR:

**Jobs:**
1. **Test** - Runs 210 unit tests with Vitest
2. **Build** - Compiles production bundle (only if tests pass)
3. **Deploy** - Deploys to Railway (only on merge to main)

**Required Secrets (set in GitHub repo settings):**
```
VITE_BOOKIE_API_KEY      - API key for backend authentication
RAILWAY_TOKEN     - Railway API token for deployments
RAILWAY_SERVICE_ID - Railway service ID for this app
```

**To get Railway secrets:**
1. Go to Railway dashboard > Account Settings > Tokens
2. Create new token, copy to `RAILWAY_TOKEN`
3. Get service ID from Railway project URL or CLI: `railway status`

**Workflow triggers:**
- Push to `main`/`master` → Full pipeline (test → build → deploy)
- Pull request → Test + Build only (no deploy)

---

## Code Splitting (React.lazy)

### Implementation
All 22 route components are lazy loaded with `React.lazy()` and wrapped in `Suspense`:

```jsx
// App.jsx - Lazy imports
const Dashboard = lazy(() => import('./Dashboard'));
const SmashSpotsPage = lazy(() => import('./SmashSpotsPage'));
// ... 20 more routes

// Suspense wrapper with loading spinner
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    ...
  </Routes>
</Suspense>
```

### Build Output
Each route gets its own chunk file:
```
dist/assets/Dashboard-*.js       (16 kB)
dist/assets/SmashSpotsPage-*.js  (20 kB)
dist/assets/Esoteric-*.js        (24 kB)
dist/assets/index-*.js           (241 kB) ← Core bundle
```

### Benefits
- **Faster initial load** - Only core bundle (241 kB) loads initially
- **On-demand loading** - Route chunks load when user navigates
- **Better caching** - Unchanged routes stay cached

### Eagerly Loaded (Core Bundle)
These remain in the main bundle since they're needed immediately:
- Context providers (Theme, Gamification, BetSlip, etc.)
- Navbar, ComplianceFooter
- ErrorBoundary
- api.js

---

## Error Monitoring (Sentry)

### Setup
Sentry is configured in `sentry.js` and initialized in `main.jsx`.

**Required Environment Variable:**
```
VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
```

Set this in Railway Variables for production.

**Features:**
- Automatic error capture in production
- ErrorBoundary integration (captures component errors with stack traces)
- 10% transaction sampling for performance monitoring
- Common non-actionable errors filtered out

**Helper Functions:**
```javascript
import { captureError, setUser, clearUser } from './sentry';

// Capture error with context
captureError(error, { userId: '123', action: 'placeParlay' });

// Set user context after login
setUser('user123', 'user@email.com');

// Clear on logout
clearUser();
```

---

## User Preferences

### Hook Usage
```javascript
import { usePreferences, useFavoriteSport } from './usePreferences';

// Full preferences
const { preferences, updatePreference, resetPreferences } = usePreferences();
updatePreference('favoriteSport', 'NFL');

// Quick access for favorite sport
const { favoriteSport, setFavoriteSport } = useFavoriteSport();
```

### Available Preferences
```javascript
{
  favoriteSport: 'NBA',           // Persisted sport selection
  defaultTab: 'props',            // Smash Spots tab preference
  showConfidenceScores: true,
  showEsotericSignals: true,
  betSlipPosition: 'right',
  notifications: {
    smashAlerts: true,
    sharpMoney: true,
    lineMovement: false,
  },
  display: {
    compactMode: false,
    showOddsAs: 'american',       // 'american', 'decimal', 'fractional'
  },
}
```

**Storage:** localStorage + optional backend sync via `/live/user/preferences/{userId}`

---

## Bundle Analysis

Run bundle analysis to identify large dependencies:
```bash
npm run build:analyze
```

Opens `stats.html` with interactive treemap visualization.

**Current bundle breakdown:**
- Main bundle: 252 kB (80 kB gzipped)
- Route chunks: 4-24 kB each (code-split)

---

## Analytics (Google Analytics 4)

### Setup
Analytics configured in `analytics.js` and initialized in `main.jsx`.

**Required Environment Variable:**
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Set this in Railway Variables for production.

### Page View Tracking
Automatic page view tracking on route changes (in `AppContent`):
```javascript
useEffect(() => {
  import('./analytics').then(({ trackPageView }) => {
    trackPageView(location.pathname, document.title);
  });
}, [location.pathname]);
```

### Event Tracking
Pre-built event functions for common actions:
```javascript
import { BetEvents, ParlayEvents, FeatureEvents } from './analytics';

// Bet tracking
BetEvents.viewPick('NBA', 'spread', 85);
BetEvents.addToBetSlip('NBA', 'moneyline', -110);
BetEvents.placeBet('NBA', 'spread', -110, 100);

// Parlay tracking
ParlayEvents.addLeg('NBA', 'player_prop', -150);
ParlayEvents.place(3, 50, 450);

// Feature usage
FeatureEvents.changeSport('NFL');
FeatureEvents.clickSportsbook('DraftKings', 'NBA');
```

---

## API Rate Limiting

### Configuration
Rate limiting configured in `rateLimit.js` and integrated with `api.js`.

**Rate Limits:**
| Category | Limit | Endpoints |
|----------|-------|-----------|
| default | 30 req/min | General endpoints |
| live | 20 req/min | `/live/*` endpoints |
| heavy | 5 req/min | `/live/parlay/calculate`, `/live/betslip/generate` |

**Disable in Development:**
```
VITE_RATE_LIMIT=false
```

### Usage
Rate limiting is automatic for all API calls. Requests that exceed limits are queued.

```javascript
import { getRateLimitStatus } from './rateLimit';

// Check current status
const status = getRateLimitStatus();
// { default: { used: 5, limit: 30, remaining: 25 }, ... }
```

### Error Handling
```javascript
import { RateLimitError } from './api';

try {
  await api.getLiveGames('NBA');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${error.retryAfter}s`);
  }
}
```

---

## Staging Environment

### Railway Setup

1. **Create staging service:**
   - Go to Railway dashboard
   - Click "New" → "Empty Project"
   - Name it `bookie-member-app-staging`

2. **Connect GitHub:**
   - Settings → Connect GitHub
   - Select the repository
   - Set deploy branch to `staging` or `develop`

3. **Copy Environment Variables:**
   ```
   VITE_BOOKIE_API_KEY=<staging-api-key>
   VITE_SENTRY_DSN=<staging-sentry-dsn>
   VITE_GA_MEASUREMENT_ID=<staging-ga-id>
   ```

4. **Set different API URL (optional):**
   If you have a staging backend, add:
   ```
   VITE_API_BASE_URL=https://staging-api.example.com
   ```

### Workflow
```
feature-branch → PR → staging → test → main → production
```

### CI/CD for Staging
Update `.github/workflows/ci.yml` to deploy to staging:
```yaml
deploy-staging:
  if: github.ref == 'refs/heads/staging'
  needs: build
  steps:
    - uses: railwayapp/deploy@v1
      with:
        service-id: ${{ secrets.RAILWAY_STAGING_SERVICE_ID }}
```

---

## Social Sharing

### ShareButton Component (`ShareButton.jsx`)
Share picks and parlays to Twitter/X, Discord, or clipboard.

**Usage:**
```jsx
import { ShareButton } from './ShareButton';

// Share a single pick
<ShareButton
  pick={{
    player: 'LeBron James',
    side: 'Over',
    line: 25.5,
    stat_type: 'points',
    odds: -110,
    confidence: 85,
  }}
  size="small"
/>

// Share a parlay
<ShareButton
  parlay={legs}
  combinedOdds={+450}
  stake={100}
/>
```

**Features:**
- Native share on mobile (Web Share API)
- Post to X/Twitter with formatted text
- Copy for Discord (with code block formatting)
- Copy to clipboard

**Integrated In:**
- `PropsSmashList.jsx` - Share button on each prop card
- `GameSmashList.jsx` - Share button on each game pick
- `ParlayBuilder.jsx` - Share button when 2+ legs added

---

## Historical Performance Charts (`HistoricalCharts.jsx`)

### Route
`/analytics` - Performance Analytics page

### Features
- **Cumulative P/L Chart** - Track profit/loss over time with AreaChart
- **Rolling Win Rate** - 10-bet window showing win rate trends
- **Daily Volume** - Betting volume visualization
- **Sport Breakdown** - Performance by sport with win rate bars
- **Bet Type Breakdown** - Performance by bet type (props, spreads, etc.)
- **30-Day Activity Calendar** - Heatmap showing winning/losing days
- **Recent Results Strip** - Last 20 bet outcomes
- **Streak Tracking** - Current streak and best/worst streaks

### Time Filters
- 7 Days / 30 Days / 90 Days / All Time

### Chart Types
Toggle between: P/L, Win Rate, Volume

---

## Offline Mode (`OfflineIndicator.jsx`, `public/sw.js`)

### Service Worker v2 Features
- **Stale-While-Revalidate** - Returns cached data immediately, fetches fresh in background
- **API Caching** - Caches API responses with configurable TTL per endpoint
- **Background Sync** - Syncs offline bets when connection restored
- **Cache Management** - Automatic cleanup of old cache versions

### API Cache TTL
| Endpoint | TTL | Strategy |
|----------|-----|----------|
| `/live/best-bets/` | 2 min | Stale-while-revalidate |
| `/live/props/` | 2 min | Stale-while-revalidate |
| `/live/sharp/` | 5 min | Stale-while-revalidate |
| `/live/sportsbooks` | 30 min | Stale-while-revalidate |
| `/esoteric/today-energy` | 1 hour | Stale-while-revalidate |

### React Components

**OfflineProvider** - Context for offline state:
```javascript
import { useOffline } from './OfflineIndicator';

const { isOnline, isServiceWorkerReady, updateServiceWorker, clearCache } = useOffline();
```

**OfflineBanner** - Shows "You're offline" banner when disconnected

**UpdateBanner** - Shows "New version available" with update button

**CacheStatusDisplay** - Shows cache status in Profile settings

### useOfflineFirst Hook
```javascript
import { useOfflineFirst } from './OfflineIndicator';

const { data, loading, error, isCached, isOnline } = useOfflineFirst(
  () => api.getBestBets('NBA'),
  'nba-picks',
  [sport]
);
```

---

## Push Notifications (`PushNotifications.jsx`)

### Setup Requirements
**Environment Variable:**
```
VITE_VAPID_PUBLIC_KEY=<your-vapid-public-key>
```

### Backend Endpoints (Expected)
```
POST /live/push/subscribe    # Register push subscription
POST /live/push/unsubscribe  # Remove subscription
POST /live/push/preferences  # Update notification preferences
```

### React Components

**PushProvider** - Context for push notification state:
```javascript
import { usePush } from './PushNotifications';

const { isSupported, isSubscribed, subscribe, unsubscribe, preferences, updatePreferences } = usePush();
```

**SmashAlertBell** - Navbar button to toggle SMASH alerts

**PushNotificationSettings** - Full settings panel (in Profile page)

### Notification Preferences
```javascript
{
  smashAlerts: true,        // High-conviction picks (85%+)
  sharpMoney: true,         // Sharp money movement
  dailySummary: false,      // Morning digest
  resultNotifications: true // Bet results
}
```

### Helper Functions
```javascript
import { showLocalNotification, triggerSmashNotification } from './PushNotifications';

// Local notification
showLocalNotification('Title', { body: 'Message' });

// Trigger SMASH alert (checks preferences)
triggerSmashNotification({
  player: 'LeBron James',
  side: 'Over',
  line: 25.5,
  confidence: 90
});
```

---

## Future Work Suggestions

### Performance (Priority: Medium)
| Task | Description | Effort |
|------|-------------|--------|
| React.memo | ✅ DONE - Memoized SmashSpots cards | - |
| useMemo/useCallback | ✅ DONE - Optimized lists | - |
| Code splitting | ✅ DONE - 22 routes lazy loaded | - |
| Bundle analysis | ✅ DONE - Visualizer configured | - |

### Features (Priority: Low-Medium)
| Task | Description | Effort |
|------|-------------|--------|
| Push notifications | ✅ DONE - SMASH alerts with configurable preferences | - |
| Social sharing | ✅ DONE - Twitter/Discord/Clipboard sharing | - |
| Historical charts | ✅ DONE - Cumulative P/L, rolling win rate, sport breakdown | - |
| User preferences | ✅ DONE - localStorage + backend sync | - |
| Offline mode | ✅ DONE - Service worker caching with stale-while-revalidate | - |

### Analytics (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| Google Analytics | ✅ DONE - GA4 with page view tracking | - |
| Event tracking | ✅ DONE - Comprehensive event system | - |
| Error monitoring | ✅ DONE - Sentry integration | - |

### Infrastructure (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| CI/CD pipeline | ✅ DONE - GitHub Actions for auto-deploy | - |
| Staging environment | ✅ DONE - Documented setup | - |
| API rate limiting | ✅ DONE - Token bucket with queuing | - |

---

## Session History

### Session: January 2026 (claude/setup-live-api-endpoints-AFkgX)

**Completed in this session:**
1. Code splitting with React.lazy (22 routes)
2. Sentry error monitoring integration
3. Bundle analysis with rollup-plugin-visualizer
4. User preferences hook with localStorage
5. Google Analytics 4 integration
6. Comprehensive event tracking system
7. API rate limiting (token bucket algorithm)
8. Social sharing (Twitter/Discord/Clipboard)
9. Historical performance charts
10. Offline mode with enhanced service worker
11. Push notifications for SMASH alerts

**New files created:**
- `sentry.js` - Error monitoring
- `analytics.js` - GA4 + event tracking
- `rateLimit.js` - Token bucket rate limiting
- `usePreferences.js` - User preferences hook
- `ShareButton.jsx` - Social sharing component
- `HistoricalCharts.jsx` - Performance analytics
- `OfflineIndicator.jsx` - Offline mode provider
- `PushNotifications.jsx` - Push notification system

**Files modified:**
- `App.jsx` - Added providers, lazy loading, analytics
- `main.jsx` - Initialize Sentry and analytics
- `api.js` - Integrated rate limiting
- `Profile.jsx` - Added push/cache settings
- `public/sw.js` - Enhanced with API caching
- `vite.config.js` - Added visualizer plugin
- `package.json` - Added build:analyze script
- `test/setup.js` - Mocks for rate limiting
- `ErrorBoundary.jsx` - Sentry integration
- `SmashSpotsPage.jsx` - Preferences integration
- `PropsSmashList.jsx` - ShareButton integration
- `GameSmashList.jsx` - ShareButton integration
- `ParlayBuilder.jsx` - ShareButton integration

**Tests:** 91 tests passing

**Build:** 266 kB main bundle + 22 route chunks

---

### Session: January 2026 (claude/review-claude-md-AbZ7i)

**Completed in this session:**
1. Upgraded React 18 → React 19 (19.2.3)
2. Added Vercel AI SDK (`ai` package)
3. Added Zod for schema validation
4. Added @json-render/core and @json-render/react
5. Installed Vercel React best practices agent skills
6. Created Vite-specific React guidelines

**New files created:**
- `.claude/REACT_GUIDELINES.md` - Vite + React best practices handoff
- `.claude/skills/react-best-practices/` - 45 Vercel React rules
- `.claude/skills/web-design-guidelines/` - Web design patterns

**Dependencies added:**
- `react@19.2.3`, `react-dom@19.2.3`
- `@testing-library/react@16.x` (React 19 support)
- `ai@6.0.39` - Vercel AI SDK
- `zod@4.3.5` - Schema validation
- `@json-render/core@0.2.0`, `@json-render/react@0.2.0`

**Tests:** 91 tests passing (React 19 compatible)

---

### Session: January 2026 (v10.87 Backend Compatibility)

**Completed in this session:**
1. Added TITANIUM_SMASH tier (≥9.0 score, 2.5 units, cyan #00FFFF)
2. Fixed GOLD_STAR units (1.5 → 2.0 to match backend tiering.py)
3. Updated tier filters to include TITANIUM_SMASH option
4. Frontend now uses backend `pick.units` field when available
5. Updated TierLegend components with TITANIUM tier display

**Files modified:**
- `SmashSpotsPage.jsx` - Added TITANIUM_SMASH to TIER_CONFIG, updated getUnitSizeFromTier() to use backend units
- `PropsSmashList.jsx` - Added TITANIUM_SMASH to TIER_CONFIGS, updated TierLegend and FilterControls
- `GameSmashList.jsx` - Added TITANIUM_SMASH to TIER_CONFIGS, updated TierLegend and GameFilterControls
- `CLAUDE.md` - Updated tier documentation to match backend v10.87

**Backend compatibility:**
- Matches backend `tiering.py` thresholds: TITANIUM≥9.0, GOLD≥7.5, EDGE≥6.5, MONITOR≥5.5
- Uses new v10.86-87 fields: `units`, `confidence_label`, `confidence_pct`
- Falls back to score-based derivation for backward compatibility

**Tests:** 91 tests passing

---

### Session: February 2026 (Build Fixes + Auth Hardening)

**Completed in this session:**
1. Fixed Vite build warnings about mixed static/dynamic imports
2. Added production-only service worker registration
3. Configured Vite with React deduplication (`resolve.dedupe`)
4. Simplified usePreferences hook API
5. Added API key checks to prevent polling without valid credentials
6. Added fail-fast auth protection (stops polling on 401/403, shows banner)
7. Added `safeJson` helper to prevent JSON parse crashes on non-JSON responses
8. Added React Router v7 future flags (v7_startTransition, v7_relativeSplatPath)
9. Added PWA mobile-web-app-capable meta tag
10. Created `.env.local` with production API credentials

**New files created:**
- `GamificationContext.jsx` - Extracted context/provider/hooks from Gamification.jsx for code splitting
- `.env.local` - Local environment configuration

**Files modified:**
- `App.jsx`:
  - Static import for `trackPageView` from analytics (fixes mixed import warning)
  - Import GamificationProvider from GamificationContext
  - Added `AuthInvalidBanner` component for fail-fast auth display
  - BrowserRouter with v7 future flags
- `Gamification.jsx` - Now only contains page component, imports from GamificationContext
- `Grading.jsx` - Updated import to use GamificationContext
- `index.html`:
  - Added `mobile-web-app-capable` meta tag
  - Service worker registration now production-only (`import.meta.env.PROD`)
- `vite.config.js` - Added `resolve.dedupe: ['react', 'react-dom']`
- `usePreferences.js`:
  - Shortened API: `prefs`, `updatePref`, `updatePrefs`, `reset`
  - Added loading state
  - Backward compatibility aliases maintained
- `lib/api/client.js`:
  - Added auth failure detection (`authInvalid`, `authListeners`)
  - Added `isAuthInvalid()` and `onAuthInvalid()` exports
  - Added `safeJson()` helper for safe JSON parsing
  - `authFetch` now fails-fast on auth invalid, sets flag on 400/401/403
- `api.js`:
  - Replaced ALL `.json()` calls with `safeJson()` + fallback defaults
  - Every method returns graceful defaults ([], {}, null) on failure
- `SignalNotifications.jsx` - Added apiKey check + auth invalid subscription
- `SystemHealthPanel.jsx` - Added apiKey check + auth invalid subscription
- `SmashSpotsPage.jsx` - Added apiKey check + auth invalid subscription for auto-refresh

**Key patterns implemented:**

**Fail-fast auth protection:**
```javascript
// In lib/api/client.js
let authInvalid = false;
const authListeners = new Set();

export const isAuthInvalid = () => authInvalid;
export const onAuthInvalid = (callback) => {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
};

// In polling components
useEffect(() => {
  if (!apiKey || isAuthInvalid()) return;
  const unsubscribe = onAuthInvalid(() => clearInterval(interval));
  return () => { clearInterval(interval); unsubscribe(); };
}, []);
```

**Safe JSON parsing:**
```javascript
export const safeJson = async (response) => {
  if (!response.ok) return null;
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch { return null; }
};
```

**Build:** No warnings, clean output
**Tests:** 91 tests passing

---

### Session: February 2026 (v17.3 5-Engine Display)

**Completed in this session:**
1. Added all 5 engine scores to pick cards (AI, Research, Esoteric, Jarvis, Context)
2. Added Harmonic Convergence badge (purple) when Research + Esoteric both >= 7.5
3. Added MSRF Turn Date badge (gold) when turn date resonance detected
4. Added Context Layer expandable details (defense rank, pace, vacuum, officials)
5. Updated tier legend to reflect 3/5 engines for Titanium

**Files modified:**
- `GameSmashList.jsx` - Added 5 engine display, Harmonic/MSRF badges, Context details
- `PropsSmashList.jsx` - Added 5 engine display, Harmonic/MSRF badges, Context details
- `SmashSpotsPage.jsx` - Updated tier comments and legend for 5 engines
- `CLAUDE.md` - Updated engine documentation

**Engine Display (Option A):**
```jsx
// 4 weighted engines + context modifier shown with tooltips
AI (25%) | Research (35%) | Esoteric (20%) | Jarvis (20%) | Context (±0.35 modifier)
```

**New Visual Elements:**
- Context score badge with "Defense rank, pace, injury vacuum" tooltip
- Purple HARMONIC badge when `harmonic_boost > 0`
- Gold TURN DATE badge when `msrf_boost > 0`
- Expandable "Context Details" section showing def_rank, pace, vacuum, officials

**Build:** No warnings, clean output

---

### Session: February 2026 (v20.5 Backend Wiring)

**Completed in this session:**
1. Fixed `frontend_scoring_contract.js` engine weights (research 0.30→0.35, jarvis 0.15→0.20)
2. Added CONTEXT_MODIFIER_CAP and BOOST_CAPS constants to contract
3. Updated `normalizePick()` in api.js to pass through all boost/status/signal fields
4. Created `components/BoostBreakdownPanel.jsx` - Option A score breakdown
5. Created `components/StatusBadgeRow.jsx` - MSRF/SERP/Jason/ML status badges
6. Created `components/GlitchSignalsPanel.jsx` - GLITCH protocol with progress bars
7. Created `components/EsotericContributionsPanel.jsx` - Esoteric by category
8. Integrated all 4 new panels into GameSmashList.jsx and PropsSmashList.jsx
9. Added Void Moon warning, GLITCH section, Phase 8 indicators to Esoteric.jsx
10. Fixed hardcoded scoring literals in comments/strings (Lesson 7)

**New files created:**
- `components/BoostBreakdownPanel.jsx`
- `components/StatusBadgeRow.jsx`
- `components/GlitchSignalsPanel.jsx`
- `components/EsotericContributionsPanel.jsx`

**Files modified:**
- `core/frontend_scoring_contract.js` - Fixed weights, added boost caps
- `api.js` - Updated normalizePick() with all v20.5 fields
- `GameSmashList.jsx` - Imported and integrated 4 new panels
- `PropsSmashList.jsx` - Imported and integrated 4 new panels
- `SmashSpotsPage.jsx` - Fixed hardcoded literal in TITANIUM legend
- `Esoteric.jsx` - Added Void Moon, GLITCH, Phase 8 sections

**Key patterns implemented:**

**Option A Formula (displayed in BoostBreakdownPanel):**
```
BASE_4 = AI(0.25) + Research(0.35) + Esoteric(0.20) + Jarvis(0.20)
FINAL = min(10, BASE_4 + context_modifier + confluence_boost + msrf_boost
             + jason_sim_boost + serp_boost + ensemble_adjustment)
```

**Build:** Clean, 1.65s
**Validators:** All 3 pass

---

### Session: February 2026 (Test Infrastructure Fix)

**Completed in this session:**
1. Fixed all 27 failing tests in `api.test.js` (test mocks didn't match `safeJson`/`authFetch` implementation)
2. Created `mockResponse()` helper for proper Response-like mock objects with `ok`, `text()`, `clone()`
3. Updated all auth endpoint assertions to include `cache: 'no-store'`
4. Added try-catch network error handling to 7 API methods that should return graceful defaults

**Files modified:**
- `api.js` - Added try-catch to getTodayEnergy, getSportsbooks, trackBet, getBetHistory, getParlay, getParlayHistory, getUserPreferences
- `test/api.test.js` - Added mockResponse helper, fixed all 32 test mocks and assertions

**Key pattern established:**

**Network error handling (api.js):**
```javascript
// Methods that return defaults MUST catch network errors
async getParlay(userId) {
  try {
    return safeJson(await authFetch(url)) || { legs: [], combined_odds: null };
  } catch {
    return { legs: [], combined_odds: null };
  }
},
```

**Tests:** 91/91 passing (0 failures)
**Build:** Clean, 1.62s
**Validators:** All 3 pass

---

### Session: February 2026 (16-Bug Investigation & Fix)

**Completed in this session:**
1. Investigated and fixed 16 bugs across 8 files in the v20.5 frontend-backend wiring
2. Rewrote GlitchSignalsPanel to handle nested objects (not flat numbers)
3. Fixed normalizePick ai_score precedence (`||` → `??`) and confidence fallback
4. Updated frontend_scoring_contract.js BOOST_CAPS to match verified backend values
5. Rewrote EsotericContributionsPanel with correct 12 backend keys (removed 7 dead, added 4 missing)
6. Rewrote StatusBadgeRow to use `msrf_boost > 0` (removed dead `msrf_metadata.level`)
7. Fixed React.memo comparisons in both SmashList files to include v20.5 fields
8. Removed duplicate TURN DATE inline badges (consolidated in StatusBadgeRow)
9. Fixed Esoteric.jsx: void_moon→void_of_course path, removed GLITCH/Phase 8 sections (per-pick only)
10. Disabled Historical Accuracy section (data not available from today-energy endpoint)
11. Fixed sample data detection heuristic in Esoteric.jsx
12. Fixed `$` literal in TierLegend template string
13. Added 5 new lessons (11-15), 4 new invariants (12-15), 5 new NEVER DO items (16-20)

**Root Causes Identified:**
- Components built against assumed/planned data shapes, never verified against actual API
- Contract values copied from documentation, not verified against live backend
- Per-pick data confused with global daily data (different endpoints)
- `||` operator used for field precedence (treats 0 as falsy)
- Component field key names guessed instead of verified

**Files modified:**
- `components/GlitchSignalsPanel.jsx` - Complete rewrite (nested objects)
- `components/EsotericContributionsPanel.jsx` - Complete rewrite (correct 12 keys)
- `components/StatusBadgeRow.jsx` - Complete rewrite (msrf_boost check)
- `core/frontend_scoring_contract.js` - BOOST_CAPS, TITANIUM_RULE corrected
- `api.js` - ai_score precedence fix, confidence fallback fix
- `GameSmashList.jsx` - memo comparison, TURN DATE removal
- `PropsSmashList.jsx` - memo comparison, TURN DATE removal, $ literal fix
- `Esoteric.jsx` - void_of_course path, removed dead sections, sample detection

**Build:** Clean, all validators pass
**Tests:** 91/91 passing

---

### Session: February 2026 (Esoteric Enhancements + E2E Tests)

**Completed in this session:**
1. Fixed `getTodayEnergy()` sample data detection — added `_is_fallback` flag
2. Enhanced Esoteric page: daily energy overview, Schumann resonance card, void moon timing, JARVIS day badge, power numbers section
3. Added 10 E2E tests for v20.5 panels (5 smash-spots, 5 esoteric)
4. Updated MSW mock handler for today-energy endpoint with new fields

**Files modified:**
- `api.js` - `_is_fallback` flag in getTodayEnergy
- `Esoteric.jsx` - 5 new conditional sections, dead code cleanup
- `src/mocks/handlers.js` - schumann_reading, void_moon_periods, jarvis_day mock data
- `e2e/smash-spots.spec.js` - 5 v20.5 panel tests
- `e2e/esoteric.spec.js` - 5 v20.5 enhancement tests
- `test/api.test.js` - Updated getTodayEnergy tests for `_is_fallback`

**Build:** Clean, all validators pass
**Tests:** 92/92 unit, 96/96 E2E (at time of commit)

---

### Session: February 2026 (E2E Stabilization + Community Beta Prep)

**Completed in this session:**
1. Fixed ALL E2E tests (0 → 106 passing) by creating shared Playwright fixture
2. Fixed Parlay Builder hardcoded `default_user` — unique per-browser user IDs
3. Verified Daily Learning Loop already wired in Dashboard (not missing as assumed)
4. Added MSW mock handler for `/live/grader/daily-lesson`
5. Added try-catch to `api.getDailyLesson()` per INVARIANT 11
6. Fixed 5+ E2E selector issues across all spec files
7. Added comprehensive documentation (5 new lessons, 4 new NEVER DO items, 1 new invariant)

**Root cause of E2E failures:**
- Onboarding wizard (`bookie_onboarding_complete` localStorage key) covered entire page
- Playwright runs with clean localStorage → wizard always shows → blocks all interactions

**New files created:**
- `e2e/fixtures.js` - Shared Playwright fixture (onboarding skip via `addInitScript`)

**Files modified:**
- `ParlayBuilder.jsx` - `getUserId()` replacing hardcoded `default_user`
- `api.js` - try-catch added to `getDailyLesson()`
- `src/mocks/handlers.js` - daily-lesson mock handler added
- `e2e/navigation.spec.js` - import fix, strict mode violations, heading selectors
- `e2e/smash-spots.spec.js` - import fix, sport selector button vs select
- `e2e/esoteric.spec.js` - import fix, input label selector, Vite HMR race handling
- `e2e/bet-slip.spec.js` - import fix
- `e2e/parlay-builder.spec.js` - import fix, test assertion updates

**Key patterns established:**
- `e2e/fixtures.js` → all E2E tests import from here (INVARIANT 16)
- `page.waitForSelector('h1')` → verify React rendered (not raw Vite source)
- `getByRole('heading')` > `getByText()` for page headings
- `getByLabel()` > `locator('input')` for form inputs

**Documentation updated:**
- `docs/LESSONS.md` - Lessons 16-20 (E2E patterns)
- `docs/RECOVERY.md` - Recovery entries 14-17 (E2E troubleshooting)
- `docs/MASTER_INDEX.md` - Section E (E2E testing), Section F (adding new E2E tests)
- `SESSION_START.md` - E2E fixture check, E2E selector rules
- `COMMIT_CHECKLIST.md` - E2E test step, fixture integrity check
- `ARCHITECTURE.md` - React 18→19, v20.5 tier system, test counts
- `.claude/SMASHSPOTS_API.md` - Marked as superseded (v10.4 → v20.5)
- `CLAUDE.md` - INVARIANT 16, NEVER DO 21-24, session history, test counts

**Build:** Clean, all validators pass
**Tests:** 92/92 unit, 106/106 E2E

---

### Session: February 2026 (Test Expansion + UNFAVORABLE Bug Fix)

**Completed in this session:**
1. Fixed UNFAVORABLE betting_outlook enum — backend sends `UNFAVORABLE` but validator and Esoteric.jsx only recognized BULLISH/NEUTRAL/BEARISH
2. Added 118 new unit tests across 9 new test files (92 → 210 total)
3. Added 44 new E2E tests across 3 new spec files (106 → ~150 total)
4. Achieved 100% route coverage in E2E tests (all 23 routes covered)

**Bug fix:**
- `scripts/verify-backend.js` — Added `'UNFAVORABLE'` to validOutlooks array
- `Esoteric.jsx` — Grouped BEARISH + UNFAVORABLE as negative outlooks using `['BEARISH', 'UNFAVORABLE'].includes()`

**New unit test files created:**
- `test/kellyCalculator.test.js` — 34 tests (odds conversion, Kelly fraction, bankroll sizing, bet tracking)
- `test/correlationDetector.test.js` — 16 tests (correlation analysis, adjusted sizing, pick correlation)
- `test/clvTracker.test.js` — 20 tests (pick CRUD, closing lines, grading, statistics)
- `test/pickExplainer.test.js` — 10 tests (headline generation, signal filtering, risk factors)
- `test/signalEngine.test.js` — 22 tests (gematria ciphers, JARVIS triggers, daily readings, cosmic confluence)
- `test/BoostBreakdownPanel.test.jsx` — 4 tests (null pick, boost fields, negative jason)
- `test/StatusBadgeRow.test.jsx` — 4 tests (null pick, TURN DATE badge, JASON BLOCK badge)
- `test/GlitchSignalsPanel.test.jsx` — 4 tests (void moon active/clear, kp-index value)
- `test/EsotericContributionsPanel.test.jsx` — 4 tests (grouped categories, color coding)

**New E2E spec files created:**
- `e2e/sharp-odds-injuries.spec.js` — 16 tests (/sharp, /odds, /injuries, cross-page nav)
- `e2e/analytics-profile-bankroll.spec.js` — 16 tests (/analytics, /profile, /bankroll, /performance, /props)
- `e2e/remaining-pages.spec.js` — 12 tests (9 page load smoke tests + 3 interaction tests)

**Key lesson (Lesson 21):** Backend enum values can expand without frontend notice. Always validate enum arrays include ALL values the backend sends, not just the documented ones.

**Build:** Clean, all validators pass
**Tests:** 210/210 unit, ~150 E2E (8 spec files)

---

### Session: February 2026 (v20.12 Frontend Integration)

**Completed in this session:**
1. Implemented v20.12 frontend support for backend Phase 9 features
2. Created `ReasonPanel.jsx` - Expandable categorized reasons with v20.12 feature badges
3. Created `StreamingUpdater.jsx` - SSE client with auto-reconnect and exponential backoff
4. Updated `normalizePick()` with 15 new v20.12 field passthroughs
5. Integrated ReasonPanel into both GameSmashList.jsx and PropsSmashList.jsx (INVARIANT 8)
6. Integrated StreamingProvider into App.jsx provider hierarchy
7. Added StreamingStatusBadge to navbar (Live/Connecting/Polling status)
8. Updated memo comparison functions for v20.12 fields

**New files created:**
- `components/ReasonPanel.jsx` - Expandable "Why This Pick" panel with AI/Esoteric/Context categories
- `components/StreamingUpdater.jsx` - SSE provider, hooks (useStreaming, useStreamingEvents, usePicksWithLiveUpdates)

**Files modified:**
- `api.js` - Added v20.12 fields to normalizePick (reason arrays, stadium, travel, officials)
- `GameSmashList.jsx` - ReasonPanel integration + memo comparison updates
- `PropsSmashList.jsx` - ReasonPanel integration + memo comparison updates (symmetric with GameSmashList)
- `App.jsx` - StreamingProvider wrapper + StreamingStatusBadge in navbar

**v20.12 Backend Features Supported:**
| Feature | Backend Fields | Frontend Display |
|---------|---------------|------------------|
| Reason Arrays | ai_reasons, esoteric_reasons, context_reasons | ReasonPanel with category grouping |
| Stadium Altitude | scoring_impact, altitude_impact, stadium_data | Altitude badge (Denver +0.3, Utah +0.2) |
| Travel Fatigue | away_fatigue, home_boost, travel_data | Travel fatigue badges |
| Officials Fallback | officials_fallback, officials_data | Officials badge when ESPN hasn't assigned refs |
| SSE Streaming | /live/stream/status endpoint | StreamingStatusBadge, live pick updates |

**Lesson learned:** Edit tool requires EXACT string matching (see Lesson 17). Always Read before Edit.

**Commit:** `baa7ff6 feat: add v20.12 frontend support for reason arrays and SSE streaming`
**Build:** Clean (341 KB main bundle)
**Tests:** 210/210 passing

---

### Session: February 2026 (Bug Fixes - Race Conditions, Error Handling, Null Guards)

**Completed in this session:**
1. Fixed race conditions in useEffect hooks across 4 components
2. Added user-visible toast.error() notifications for API failures
3. Added null/undefined guards to helper functions

**Files modified:**
- `Dashboard.jsx` - Added isMountedRef and cancelled flag patterns to fetchData, fetchSharpAlert, fetchTopPick
- `BetHistory.jsx` - Added useCallback with mount checks to loadBetHistory, wrapped handleGrade in try-catch
- `Esoteric.jsx` - Moved fetchBackendEnergy inside useEffect with proper cleanup
- `SmashSpotsPage.jsx` - Added cancelled flag to TodaysBestBets fetch with cleanup
- `GameSmashList.jsx` - Added toast.error() for failed game picks fetch
- `PropsSmashList.jsx` - Added toast.error() for failed player props fetch
- `pickExplainer.js` - Added null guards to explainPick(), generateConfidenceBreakdown(), generateRisks()

**Documentation updated:**
- `docs/LESSONS.md` - Added Lessons 24-26 (race conditions, error feedback, null guards)
- `docs/RECOVERY.md` - Added entries 20-22 (recovery steps for these patterns)
- `docs/MASTER_INDEX.md` - Added React patterns section and 3 new hard bans
- `CLAUDE.md` - Added Invariants 23-25

**Key patterns established:**
- useEffect async cleanup with `cancelled` flag or `isMountedRef`
- toast.error() alongside console.error() for user-facing components
- Array.isArray() guards before .filter()/.map()/.forEach()

**Commit:** `38f1fb6 fix: add defensive guards for race conditions, error handling, and null safety`
**Build:** Clean (341 KB main bundle)
**Tests:** 210/210 passing

---

### Session: February 2026 (Frontend Audit - Fake Data Removal)

**Completed in this session:**
1. Full frontend audit of functionality wiring and data flow
2. Identified and removed all fake/mock data from 7 production components
3. Replaced mock fallbacks with proper empty state handling
4. Added Lesson 34 documenting fake data patterns

**Files modified:**
- `GameSmashList.jsx` - Removed `generateGameStats()` with Math.random(), removed `keyStats` useMemo
- `SystemHealthPanel.jsx` - Fixed random drift/bias fallbacks to use null checks
- `Leaderboard.jsx` - Changed `mockLeaders` to `emptyLeaders` with empty arrays
- `BestOdds.jsx` - Removed `MOCK_BOOKS`, `BASE_GAMES`, `generateMockGames()` (~70 lines)
- `InjuryVacuum.jsx` - Removed `generateMockInjuries()` (~95 lines)
- `Splits.jsx` - Removed `MOCK_SPLITS`, random percentage generation (~50 lines)
- `SharpAlerts.jsx` - Removed `generateMockAlerts()` (~75 lines)

**Documentation updated:**
- `docs/LESSONS.md` - Added Lesson 34 (fake/mock data in production)
- `docs/RECOVERY.md` - Added recovery entry 30 (fake data symptoms and fix)
- `docs/MASTER_INDEX.md` - Updated lesson count (33→34), added new Hard Bans

**Key pattern established:**
- NEVER use mock fallbacks in production components
- Show empty state on API failure: `setData([])` instead of `setData(generateMockData())`
- Detection command: `grep -rn "Math\.random\|MOCK_\|generateMock" *.jsx | grep -v test | grep -v mocks`

**Commits:**
- `6b081d8 fix: remove fake random stats from GameSmashList`
- `cf5f067 fix: remove all fake/mock data from production components`

**Build:** Clean
**Tests:** 210/210 unit, 36 E2E passing

---

### Session: February 2026 (7-Proofs Validation Framework)

**Completed in this session:**
1. Implemented 5 validation scripts for the 7-Proofs framework
2. Created DailyReportCard component for Proof 7 (grader display)
3. Added npm scripts and CI integration for validators
4. Documented framework across LESSONS.md, RECOVERY.md, 7-PROOFS.md, MASTER_INDEX.md

**New files created:**
- `scripts/validate_integrations.mjs` - Proof 1: Critical integration status check
- `scripts/validate_score_variance.mjs` - Proof 3: AI constant detection (unique >= 4, stddev >= 0.15)
- `scripts/validate_market_coverage.mjs` - Proof 4: Market type diversity
- `scripts/validate_output_boundaries.mjs` - Proof 5: Contract enforcement (final_score >= 6.5, valid tiers)
- `scripts/validate_live_fields.mjs` - Proof 6: Live betting context fields
- `src/components/DailyReportCard.jsx` - Proof 7: Grader report display
- `docs/7-PROOFS.md` - Comprehensive framework documentation

**Files modified:**
- `api.js` - Added `getDailyGraderReport()` method
- `package.json` - Added 6 validate:* npm scripts
- `scripts/run_final_audit.sh` - Added validate:all call when API key available
- `PerformanceDashboard.jsx` - Integrated DailyReportCard in System tab
- `docs/LESSONS.md` - Added Lesson 35 (7-Proofs framework)
- `docs/RECOVERY.md` - Added recovery entries 31-35 for validation failures
- `docs/MASTER_INDEX.md` - Updated validators table, Golden Command Sequence
- `CLAUDE.md` - Added INVARIANT 26

**Key validation thresholds:**
- AI score variance: unique >= 4 AND stddev >= 0.15 (for >= 5 picks)
- Final score boundary: >= 6.5 (community filter)
- Engine score range: [0, 10]
- Live data freshness: data_age_ms < 5 minutes
- Critical integrations: odds_api, playbook_api = VALIDATED

**Commands added:**
```bash
npm run validate:all              # Run all 5 validators
npm run validate:integrations     # Proof 1
npm run validate:variance         # Proof 3
npm run validate:coverage         # Proof 4
npm run validate:boundaries       # Proof 5
npm run validate:live             # Proof 6
```

**Build:** Clean (1.23s)
**Tests:** 210/210 passing

---

## 🚨 MASTER INVARIANTS (NEVER VIOLATE) 🚨

**READ THIS FIRST BEFORE TOUCHING SCORING OR DISPLAY CODE**

---

### INVARIANT 1: Never Recompute Backend Values

**RULE:** Frontend MUST render `final_score`, `tier`, `titanium_triggered`, and `units` directly from API response. NEVER recompute these values.

**Why:** Backend scoring formula is complex (5 engines + confluence + Jason Sim + hard gates). Frontend recomputation will ALWAYS be wrong.

**DO:**
```jsx
// ✅ CORRECT - Use backend values directly
<div>Score: {pick.final_score.toFixed(1)}</div>
<div>Tier: {pick.tier}</div>
{pick.titanium_triggered && <Badge>TITANIUM</Badge>}
```

**NEVER:**
```jsx
// ❌ WRONG - Recomputing score
const score = (pick.ai_score * 0.15) + (pick.research_score * 0.20) + ...;

// ❌ WRONG - Deriving tier from score
const tier = score >= 7.5 ? 'GOLD_STAR' : 'EDGE_LEAN';
```

---

### INVARIANT 2: Option A Engine Display

**RULE:** All pick cards MUST display all 4 engine scores + context modifier with correct weights.

**Engine Weights (Option A - MUST match backend scoring_contract.py):**
| Engine | Weight | Field | Tooltip |
|--------|--------|-------|---------|
| AI | 25% | `ai_score` | 8 AI models |
| Research | 35% | `research_score` | Sharp money, line variance, public fade |
| Esoteric | 20% | `esoteric_score` | Numerology, astro, fibonacci |
| Jarvis | 20% | `jarvis_score` | Gematria triggers |
| **Context** | **±0.35 cap** | `context_score` | Defense rank, pace, injury vacuum (modifier, not weighted) |

**Files that MUST show all engines:**
- `GameSmashList.jsx` (line ~662)
- `PropsSmashList.jsx` (line ~925)

**NEVER:** Display incorrect weights. Context is a bounded modifier (±0.35), NOT a 30% weighted engine.

---

### INVARIANT 3: Titanium 3/4 Rule Display

**RULE:** Titanium badge and legend MUST reference "3/4 engines" — meaning 3 of the 4 weighted engines (AI, Research, Esoteric, Jarvis). Context is a bounded modifier, NOT a counted engine for TITANIUM gating.

**Backend Rule:** `titanium_triggered=true` only when >= 3 of 4 weighted engines >= 8.0 AND final_score >= 8.0

**Files that reference this:**
- `SmashSpotsPage.jsx` line ~65 (comment)
- `SmashSpotsPage.jsx` line ~86 (legend text)
- `SmashSpotsPage.jsx` line ~466 (TITANIUM banner)
- `core/frontend_scoring_contract.js` → `TITANIUM_RULE.engineCount = 4`

**NEVER:** Say "3/5 engines" — Context is excluded from the engine count for TITANIUM gating.

---

### INVARIANT 4: API Field Paths (Pick Contract v1)

**RULE:** Use correct field paths from API response. Check top-level first, then scoring_breakdown.

**Field Access Pattern:**
```jsx
// ✅ CORRECT - Nullish coalescing with fallback
{(pick.ai_score ?? pick.scoring_breakdown?.ai_score)}
{(pick.context_score ?? pick.scoring_breakdown?.context_score)}
```

**Required Top-Level Fields (v20.5):**
```javascript
{
  // Identity
  pick_id, sport, matchup, home_team, away_team,

  // Timing
  start_time_et, has_started, is_live,

  // 5 Engine Scores (0-10)
  ai_score, research_score, esoteric_score, jarvis_score, context_score,

  // Final Score & Tier
  final_score, tier, units, titanium_triggered,

  // Bet Details
  pick_type, selection, line, odds_american, book,

  // v17.3 Boosts
  harmonic_boost,    // 0 or 1.5
  msrf_boost,        // 0, 0.25, 0.5, or 1.0

  // v17.3 Context Layer
  context_layer: {
    def_rank,              // 1-30
    pace,                  // ~94-106
    vacuum,                // 0-1
    officials_adjustment,  // ±0.5
    park_adjustment        // MLB only
  },

  // v20.5 Option A Boost Fields
  base_4_score,            // Weighted average of 4 engines
  context_modifier,        // ±0.35 bounded
  confluence_boost,        // 0 to 3.0
  jason_sim_boost,         // -1.5 to +0.5 (can be negative!)
  serp_boost,              // 0 to 0.55
  ensemble_adjustment,     // ±0.5
  live_adjustment,         // In-play adjustment

  // v20.5 Status Fields
  msrf_status,             // VALIDATED | CONFIGURED | DISABLED
  serp_status,             // VALIDATED | CONFIGURED | DISABLED
  jason_status,            // VALIDATED | CONFIGURED | DISABLED
  msrf_metadata,           // { source, reason, dates_found } (NOT level!)
  serp_shadow_mode,        // true = SERP running but not affecting score

  // v20.5 Signal Dicts — NESTED OBJECTS, not flat numbers!
  glitch_signals: {
    void_moon: { is_void, confidence, void_start, void_end },
    kp_index: { kp_value, level },
    noosphere: { velocity, trending },
    benford: { score, anomaly_detected },
  },
  esoteric_contributions: {
    // Actual backend keys (verified Feb 2026):
    numerology, astro, fib_alignment, vortex, daily_edge,
    glitch, biorhythm, gann, founders_echo, phase8, harmonic, msrf
    // NOT: gematria, lunar, mercury, solar, fib_retracement, rivalry, streak, biorhythms
  },
}
```

---

### INVARIANT 5: Badge Display Conditions

**RULE:** Badges MUST only appear when their conditions are met.

| Badge | Condition | Color | Field |
|-------|-----------|-------|-------|
| TITANIUM SMASH | `titanium_triggered === true` | Cyan #00FFFF | `pick.titanium_triggered` |
| JARVIS | `jarvis_active === true` | Gold #FFD700 | `pick.jarvis_active` |
| HARMONIC | `harmonic_boost > 0` | Purple #A855F7 | `pick.harmonic_boost` |
| TURN DATE | `msrf_boost > 0` | Gold #EAB308 | `pick.msrf_boost` (shows +value) |
| SERP ACTIVE | `serp_boost > 0 && !serp_shadow_mode` | Cyan #00D4FF | `pick.serp_boost` |
| SERP SHADOW | `serp_shadow_mode === true` | Gray #6B7280 | `pick.serp_shadow_mode` |
| JASON BLOCK | `jason_sim_boost < 0` | Red #EF4444 | `pick.jason_sim_boost` |
| JASON BOOST | `jason_sim_boost > 0` | Green #10B981 | `pick.jason_sim_boost` |
| ML ADJUST | `ensemble_adjustment !== 0` | Blue #3B82F6 | `pick.ensemble_adjustment` |

**REMOVED (Feb 2026):** MSRF LEVEL badge (`msrf_metadata?.level`) — backend never sends `level` in msrf_metadata. Replaced by TURN DATE badge which checks `msrf_boost > 0`.

**NEVER:** Hardcode badge visibility or derive from other fields.

---

### INVARIANT 6: Context Layer Expandable

**RULE:** Context Details section only appears when context_layer has real data.

**Condition:**
```jsx
{pick.context_layer && (pick.context_layer.def_rank || pick.context_layer.pace || pick.context_layer.vacuum > 0) && (
  <details>...</details>
)}
```

**Color Coding:**
| Field | Green | Yellow | Red |
|-------|-------|--------|-----|
| def_rank | <= 10 | 11-19 | >= 20 |
| pace | >= 102 | 99-101 | <= 98 |
| vacuum | > 0 | - | - |
| officials | > 0 | - | < 0 |

---

### INVARIANT 7: Zero Hardcoded Scoring Literals

**RULE:** ALL scoring thresholds, weights, and caps MUST be imported from `core/frontend_scoring_contract.js`. NEVER use raw numbers in components, comments, or template strings.

**Automated Enforcement:**
```bash
node scripts/validate_frontend_contracts.mjs   # Catches hardcoded literals in code
node scripts/validate_no_frontend_literals.mjs  # Catches literals in comments/strings too
```

**What this catches:**
- Hardcoded `7.5`, `8.0`, `6.5`, `5.5` in JSX, comments, or template strings
- Direct `fetch`/`axios` calls outside `lib/api/client.js`
- Missing imports from the contract file

**DO:**
```jsx
import { GOLD_STAR_THRESHOLD, TITANIUM_THRESHOLD } from './core/frontend_scoring_contract';
// Comment: Harmonic triggers when both >= GOLD_STAR_THRESHOLD
const range = `≥${TITANIUM_THRESHOLD} + 3/5 engines ≥${TITANIUM_THRESHOLD}`;
```

**NEVER:**
```jsx
// ❌ Even in comments: "when Research AND Esoteric both >= 7.5"
// ❌ In strings: `≥${TITANIUM_THRESHOLD} + 3/5 engines ≥8.0`
```

**Prevention:** Run validators before every commit. See `docs/LESSONS.md` for full history.

---

### INVARIANT 8: Symmetric Component Updates

**RULE:** GameSmashList.jsx and PropsSmashList.jsx MUST always have the same scoring display components. If you add/remove/change a panel in one, you MUST do the same in the other.

**Components that MUST appear in BOTH files:**
- Engine score display (AI, Research, Esoteric, Jarvis, Context)
- StatusBadgeRow
- BoostBreakdownPanel
- GlitchSignalsPanel
- EsotericContributionsPanel

**Verification:**
```bash
# Both files should import the same scoring components
grep -n "import.*from.*components/" GameSmashList.jsx PropsSmashList.jsx
```

---

### INVARIANT 9: normalizePick() Passthrough

**RULE:** When backend adds new fields, `normalizePick()` in `api.js` MUST be updated to pass them through. The normalizer is the single gateway for all pick data.

**Current passthrough fields (v20.12):**
```javascript
// Boost fields (v20.5)
base_4_score, context_modifier, confluence_boost, msrf_boost,
jason_sim_boost, serp_boost, ensemble_adjustment, live_adjustment

// Status fields (v20.5)
msrf_status, serp_status, jason_status, msrf_metadata, serp_shadow_mode

// Signal dicts (v20.5)
glitch_signals, esoteric_contributions

// v20.12: Reason arrays
ai_reasons, esoteric_reasons, context_reasons, reasons

// v20.12: Stadium/altitude impact
stadium_data, altitude_impact, scoring_impact

// v20.12: Travel fatigue
travel_data, travel_fatigue, away_fatigue, home_boost

// v20.12: Officials fallback
officials_data, officials_fallback
```

**If a field shows as `undefined` in a component, check normalizePick() FIRST.**

**v20.12 memo comparison fields (both SmashList files):**
```javascript
// Must be in arePropsEqual/arePicksEqual for re-render on update
p.ai_reasons === n.ai_reasons &&
p.esoteric_reasons === n.esoteric_reasons &&
p.context_reasons === n.context_reasons &&
p.scoring_impact === n.scoring_impact &&
p.away_fatigue === n.away_fatigue &&
p.home_boost === n.home_boost &&
p.officials_fallback === n.officials_fallback
```

---

### INVARIANT 10: Test Mocks Must Match Implementation

**RULE:** API test mocks MUST provide proper Response-like objects that match what `safeJson()` and `authFetch()` actually call. Test assertions for auth endpoints MUST include `cache: 'no-store'`.

**Required mock shape:**
```javascript
const mockResponse = (data, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  clone() { return { ...this, text: () => Promise.resolve(JSON.stringify(data)) }; },
});
```

**Why this matters:**
- `safeJson()` calls `response.text()`, not `response.json()` — mocks without `text()` silently return `null`
- `authFetch()` calls `response.clone().text()` for error logging — mocks without `clone()` throw
- `authFetch()` adds `cache: 'no-store'` — assertions without it fail

**NEVER:**
```javascript
// Missing text(), clone() — safeJson returns null, authFetch throws
fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) })

// Missing cache: 'no-store' — assertion fails for auth endpoints
expect(fetch).toHaveBeenCalledWith(url, { headers: { 'X-API-Key': '...' } })
```

---

### INVARIANT 11: API Methods Must Handle Network Errors

**RULE:** All API methods that return default/fallback values on non-ok responses MUST also catch network errors (fetch rejections) and return the same defaults.

**Pattern:**
```javascript
async getParlay(userId) {
  try {
    return safeJson(await authFetch(url)) || { legs: [], combined_odds: null };
  } catch {
    return { legs: [], combined_odds: null };
  }
},
```

**Why:** `safeJson` only handles non-ok responses (returns null). But if `fetch` itself rejects (network error, DNS failure), the error propagates past the `|| default` fallback and crashes.

**Methods with try-catch (v20.5):**
- `getTodayEnergy` → `{ betting_outlook: 'NEUTRAL', overall_energy: 5.0 }`
- `getSportsbooks` → `{ sportsbooks: [], active_count: 0 }`
- `trackBet` → `null`
- `getBetHistory` → `{ bets: [], stats: {} }`
- `getParlay` → `{ legs: [], combined_odds: null }`
- `getParlayHistory` → `{ parlays: [], stats: {} }`
- `getUserPreferences` → `{}`

**When adding new API methods:** If it has `|| default` at the end, wrap in try-catch.

---

### INVARIANT 12: Verify Data Shapes Against Actual API Responses

**RULE:** Before building ANY display component, fetch real data from the backend and inspect the actual field structure. NEVER assume data shapes from documentation or plan files.

**Why:** `glitch_signals` was assumed to contain flat numbers (e.g., `void_moon: 0.5`) but actually contains nested objects (e.g., `void_moon: { is_void: true, confidence: 0.69, void_start: "20:00 UTC" }`). This caused TypeError crashes.

**Verification command:**
```bash
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0].glitch_signals'
# Inspect ACTUAL structure before writing component code
```

**NEVER:** Write component code that calls `.toFixed()`, `.toString()`, or numeric operations on a field without first confirming it IS a number (not an object).

---

### INVARIANT 13: Endpoint-to-Data Mapping

**RULE:** Know which API endpoint provides which data. Per-pick data (glitch_signals, esoteric_contributions) comes from `/live/best-bets/{sport}`. Global daily data (moon_phase, betting_outlook) comes from `/esoteric/today-energy`.

**Data Source Map:**
| Data | Endpoint | Scope |
|------|----------|-------|
| `glitch_signals` | `/live/best-bets/{sport}` | Per-pick |
| `esoteric_contributions` | `/live/best-bets/{sport}` | Per-pick |
| `msrf_boost`, `serp_boost`, etc. | `/live/best-bets/{sport}` | Per-pick |
| `void_of_course` | `/esoteric/today-energy` | Daily global |
| `betting_outlook`, `overall_energy` | `/esoteric/today-energy` | Daily global |
| `moon_phase`, `life_path` | `/esoteric/today-energy` | Daily global |

**NEVER:** Display per-pick fields (glitch_signals, mercury_retrograde, rivalry_intensity) on the Esoteric.jsx page — that data doesn't come from the today-energy endpoint.

---

### INVARIANT 14: normalizePick() Precedence Rules

**RULE:** In `normalizePick()`, prefer top-level backend fields over nested `scoring_breakdown` fields. Use `??` (nullish coalescing), NEVER `||` (logical OR).

**Why `||` is wrong:**
```javascript
// WRONG: ai_models (0-8 scale) overrides ai_score (0-10 scale) when non-zero
ai_score: item.scoring_breakdown?.ai_models || item.ai_score

// CORRECT: prefer top-level ai_score, fall back to sub-score only if null/undefined
ai_score: item.ai_score ?? item.scoring_breakdown?.ai_models
```

**Also: confidence fallback:**
```javascript
// WRONG: total_score * 10 conflates 0-10 scoring with 0-100 percentage
confidence: confidenceToPercent(item.confidence) || item.total_score * 10 || 70

// CORRECT: use backend's confidence_score field (already 0-100)
confidence: confidenceToPercent(item.confidence) || item.confidence_score || 70
```

**NEVER:** Use `||` for field precedence — it treats `0` as falsy and skips valid zero values.

---

### INVARIANT 15: Component Field Names Must Match Backend Keys Exactly

**RULE:** When building components that read from backend data dicts (glitch_signals, esoteric_contributions, etc.), the field keys in the component MUST match the actual backend keys exactly. No guessing, no synonyms.

**Verified backend `esoteric_contributions` keys (Feb 2026):**
```
numerology, astro, fib_alignment, vortex, daily_edge,
glitch, biorhythm, gann, founders_echo, phase8, harmonic, msrf
```

**Dead keys that DON'T exist in backend:**
```
gematria, lunar, mercury, solar, fib_retracement, rivalry, streak, biorhythms (plural)
```

**Common mistakes:**
- `biorhythms` (plural) vs `biorhythm` (singular) — backend uses singular
- `lunar` vs `phase8` — backend combines lunar/mercury/solar into `phase8`
- `gematria` — backend uses `harmonic` for this concept

**Verification:**
```bash
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0].esoteric_contributions | keys'
```

---

### INVARIANT 16: E2E Tests Must Use Shared Fixtures

**RULE:** All E2E test spec files MUST import `test` and `expect` from `./fixtures`, never from `@playwright/test`. The shared fixture skips the onboarding wizard by setting localStorage before page scripts run.

**Why:** Playwright runs with clean localStorage. Without the fixture, the onboarding wizard renders at z-index 10000 and intercepts all clicks, failing every test.

**Fixture file:** `e2e/fixtures.js`
```javascript
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
```

**When adding new localStorage-gated UI:**
1. Add the skip key to the `addInitScript` block in `e2e/fixtures.js`
2. Re-run full E2E suite: `npm run test:e2e`

**E2E Selector Best Practices:**
- Use `getByRole('heading', { name: /.../ })` for page headings (not `getByText`)
- Use `getByLabel(/.../)` for form inputs (not `locator('input')`)
- Add `.first()` to broad `getByText()` selectors
- Never use `waitForLoadState('networkidle')` on pages with API polling
- To verify page rendered (not raw Vite source), check for `<h1>` element, not text content

**Verification:**
```bash
# All specs must import from ./fixtures
grep -rn "from '@playwright/test'" e2e/*.spec.js
# Should return EMPTY

# Full E2E suite (~150 tests across 8 spec files)
npm run test:e2e
```

---

### INVARIANT 17: Enum Arrays Must Match Backend Reality

**RULE:** All frontend enum validation arrays (valid outlooks, valid tiers, valid statuses) MUST include every value the backend can send, including newly added values. When the backend expands an enum, the frontend validator and display code must be updated immediately.

**Why:** Backend added `UNFAVORABLE` to `betting_outlook` but frontend only recognized BULLISH/NEUTRAL/BEARISH. The validator flagged live data as invalid, and display code fell through to default styling with no visual distinction.

**Pattern:**
```javascript
// WRONG: Closed enum that can't handle new values
const validOutlooks = ['BULLISH', 'NEUTRAL', 'BEARISH'];

// CORRECT: Include all known backend values
const validOutlooks = ['BULLISH', 'NEUTRAL', 'BEARISH', 'UNFAVORABLE'];

// DISPLAY: Group semantically similar values
const isNegative = ['BEARISH', 'UNFAVORABLE'].includes(outlook);
```

**Prevention:**
- When backend adds enum values, update ALL places that validate or switch on that enum
- Grep for the enum field name across the codebase: `grep -rn "betting_outlook\|validOutlooks" --include="*.js" --include="*.jsx"`
- Default/fallback styling should be visually distinct (amber/warning), never invisible

**Automated Gate:** `node scripts/verify-backend.js` validates known enums against live API.

---

### INVARIANT 18: Test Coverage Gate

**RULE:** New core logic files (calculators, trackers, engines) MUST have corresponding unit tests before being considered complete. New routes MUST have at least a smoke E2E test.

**Current coverage:**
- 14 unit test files covering all core logic modules
- 8 E2E spec files covering all 23 routes (100% route coverage)

**When adding new modules:**
1. Create the module
2. Create `test/<module>.test.js` with tests for all exported functions
3. If it's a new route, add a smoke test to the appropriate E2E spec file
4. Verify: `npm run test:run` shows the new tests pass

**When adding new routes:**
1. Add the route to `App.jsx`
2. Add a smoke test to `e2e/remaining-pages.spec.js` (or appropriate spec)
3. Verify: all E2E specs still import from `./fixtures`

**NEVER:** Ship a new core module without tests. The test expansion from 92→210 tests exists precisely because untested code silently broke.

---

### INVARIANT 19: API Method → Backend Endpoint Verification

**RULE:** Every `api.js` method MUST have a corresponding endpoint in the backend `live_data_router.py`. Before adding a new `api.js` method, verify the backend route exists by checking the router file or testing with curl.

**Why this exists:** Lesson 16 — `getGradedPicks()` called `GET /live/picks/graded` which didn't exist. The frontend silently fell back to MOCK_PICKS, hiding the broken connection for weeks.

**Checklist for new API methods:**
1. Find the `@router.get` or `@router.post` decorator in `live_data_router.py`
2. Verify the HTTP method (GET vs POST) matches
3. Verify the path matches exactly (e.g., `/picks/graded` not `/picks/grade`)
4. Test with curl before writing frontend code: `curl -H "X-API-Key: KEY" URL/live/picks/graded`
5. Ensure try-catch wrapping with appropriate defaults (Invariant 11)

**NEVER:** Add an `api.js` method without confirming the backend endpoint exists. NEVER use mock/fallback data that looks real — use empty state or error banners for failed connections.

---

### INVARIANT 20: v20.12 Reason Arrays and Feature Fields

**RULE:** Backend v20.12 sends categorized reason arrays and feature fields. These MUST be passed through `normalizePick()` and displayed in both SmashList components.

**v20.12 Reason Arrays:**
```javascript
// Categorized reasons from backend
ai_reasons: [],        // AI model predictions and consensus signals
esoteric_reasons: [],  // Numerology, gematria, cosmic alignment
context_reasons: [],   // Stadium altitude, travel fatigue, officials
reasons: [],           // Legacy flat array (fallback)
```

**v20.12 Feature Fields:**
```javascript
// Stadium/Altitude Impact
stadium_data: null,    // Stadium details
altitude_impact: null, // Raw altitude value
scoring_impact: 0,     // Denver +0.3, Utah +0.2

// Travel Fatigue
travel_data: null,     // Distance, rest days
travel_fatigue: 0,     // Overall fatigue modifier
away_fatigue: 0,       // Away team penalty (negative)
home_boost: 0,         // Home team advantage (positive)

// Officials Fallback (Pillar 16)
officials_data: null,  // Lead ref, tendencies
officials_fallback: false, // true when ESPN hasn't assigned refs
```

**Display Components:**
- `components/ReasonPanel.jsx` - Expandable categorized reasons panel
- Uses `<details>` for expand/collapse
- Categories: AI Analysis (🤖), Esoteric Signals (⚡), Context Factors (📊)
- Shows v20.12 feature badges (Altitude, Travel Fatigue, Officials)

**MUST appear in both:**
- `GameSmashList.jsx`
- `PropsSmashList.jsx`

---

### INVARIANT 21: SSE Streaming Connection

**RULE:** Real-time updates use Server-Sent Events (SSE) via `StreamingProvider`. The streaming context provides live pick updates, line movements, and SMASH alerts.

**SSE Endpoint:** `GET /live/stream/status`

**Event Types:**
```javascript
const EVENT_TYPES = {
  PICK_UPDATE: 'pick_update',      // Score/line changes
  LINE_MOVEMENT: 'line_movement',  // Odds shifts
  LIVE_SCORE: 'live_score',        // Game scores
  SMASH_ALERT: 'smash_alert',      // New SMASH triggers
  STATUS: 'status',                // Connection status
  HEARTBEAT: 'heartbeat',          // Keep-alive
};
```

**Provider Hierarchy (App.jsx):**
```jsx
<StreamingProvider enabled={true}>
  <SmashAlertProvider>
    <TimezoneProvider>
      ...
    </TimezoneProvider>
  </SmashAlertProvider>
</StreamingProvider>
```

**Hooks:**
- `useStreaming()` - Connection status, events array
- `useStreamingEvents(type, callback)` - Subscribe to specific event types
- `usePicksWithLiveUpdates(picks)` - Auto-merge live updates into picks

**Status Badge:** `StreamingStatusBadge` in navbar shows:
- 🟢 Live (connected)
- 🟡 Connecting... (reconnecting)
- ⚪ Polling (SSE not supported)

**Reconnection:** Exponential backoff (5s, 10s, 20s, 40s, 80s), max 5 attempts.

**NEVER:** Block the UI waiting for SSE. Fallback to polling gracefully.

---

### INVARIANT 22: Edit Tool Exact String Matching

**RULE:** When using the Edit tool, the `old_string` MUST match the file content EXACTLY, including comment syntax (`/` vs `//`), whitespace, and indentation.

**Why this exists:** Session Feb 2026 — Edit failed because `old_string` used `/` for comments but the actual file had `//`. The Edit tool does exact string matching with no fuzzy logic.

**Prevention:**
1. ALWAYS read the exact lines before editing: `Read tool with offset/limit`
2. Copy the EXACT text from the Read output, including all whitespace
3. Pay attention to comment syntax: `//`, `/*`, `#`, `--`
4. Verify indentation matches (tabs vs spaces)

**DO:**
```bash
# Read the exact content first
Read file_path with offset=275, limit=20
# Then use the EXACT text from that output
```

**NEVER:** Assume comment syntax or whitespace. Always verify with Read first.

---

### INVARIANT 23: useEffect Async Cleanup

**RULE:** All async operations in useEffect MUST have cleanup to prevent state updates after unmount.

**Why this exists:** Session Feb 2026 — Dashboard, BetHistory, Esoteric, SmashSpotsPage all had async fetches without cleanup, causing React warnings and potential memory leaks.

**Pattern A (single fetch):**
```javascript
useEffect(() => {
  let cancelled = false;
  const fetchData = async () => {
    const data = await api.getData();
    if (cancelled) return;  // Check before EVERY setState
    setData(data);
  };
  fetchData();
  return () => { cancelled = true; };
}, []);
```

**Pattern B (component-wide):**
```javascript
const isMountedRef = useRef(true);
useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);
// Then in handlers: if (!isMountedRef.current) return;
```

**NEVER:** Call setState in async callback without checking mount state first.

---

### INVARIANT 24: User-Visible Error Feedback

**RULE:** User-facing components that fetch data MUST show toast.error() when fetch fails, not just console.error().

**Why this exists:** Session Feb 2026 — GameSmashList and PropsSmashList only logged errors to console. Users saw empty states with no explanation.

**Pattern:**
```javascript
} catch (err) {
  console.error('Error fetching data:', err);
  toast.error('Failed to load data');  // User sees this
  setData([]);  // Graceful fallback
}
```

**Exception:** Background/polling operations (e.g., SharpAlerts) can fail silently if they have mock data fallback.

**NEVER:** Use only console.error() for user-facing fetch failures.

---

### INVARIANT 25: Null Guards in Helper Functions

**RULE:** Helper functions that process API data MUST guard against null/undefined input before calling array methods or destructuring.

**Why this exists:** Session Feb 2026 — pickExplainer.js crashed with "Cannot read property 'filter' of undefined" when analysis was null.

**Pattern:**
```javascript
const explainPick = (analysis) => {
  if (!analysis) return { bullets: [], risks: [] };  // Early return
  const { signals = [], confidence = 0 } = analysis;  // Default values
  const safeSignals = Array.isArray(signals) ? signals : [];  // Array guard
  return safeSignals.filter(s => s.score >= 50);
};
```

**NEVER:** Call .filter(), .map(), .forEach() on a field without first checking it's an array.

---

### INVARIANT 26: 7-Proofs Validation Before Deploy

**RULE:** Before any production deploy, run `npm run validate:all` with a valid API key. All 5 validators must pass.

**Why this exists:** Session Feb 2026 — Community launch prep required systematic validation that the entire system is operational, not just "the site loads."

**The 7 Proofs:**
| Proof | Script | Pass Condition |
|-------|--------|----------------|
| 1. Integration | `validate_integrations.mjs` | odds_api=VALIDATED, playbook_api=VALIDATED |
| 2. Engine | (in best-bets response) | All 5 engine scores present, no nulls |
| 3. Non-degeneracy | `validate_score_variance.mjs` | unique(ai_score) >= 4, stddev >= 0.15 |
| 4. Market | `validate_market_coverage.mjs` | spread + total markets present |
| 5. Boundaries | `validate_output_boundaries.mjs` | All picks pass contracts |
| 6. Live | `validate_live_fields.mjs` | is_live picks have context fields |
| 7. Grader | `DailyReportCard.jsx` | Daily report displays in Performance Dashboard |

**Run command:**
```bash
VITE_BOOKIE_API_KEY=xxx npm run validate:all
```

**Full documentation:** `docs/7-PROOFS.md`

**NEVER:** Deploy to production without running the 7-proofs validators. Silent failures in integrations, constant AI scores, or boundary violations can go unnoticed until users report issues.

---

## 📋 FRONTEND-BACKEND CONTRACT (v17.3)

### API Response Structure

**Endpoint:** `GET /live/best-bets/{sport}`

```json
{
  "sport": "NBA",
  "date_et": "2026-02-02",
  "game_picks": {
    "count": 10,
    "picks": [
      {
        "pick_id": "c39fd3f5b3ed",
        "sport": "NBA",
        "matchup": "Houston Rockets @ Indiana Pacers",
        "home_team": "Indiana Pacers",
        "away_team": "Houston Rockets",

        "start_time_et": "7:10 PM ET",
        "has_started": false,
        "is_live": false,

        "ai_score": 7.19,
        "research_score": 4.5,
        "esoteric_score": 4.8,
        "jarvis_score": 5.0,
        "context_score": 7.17,
        "final_score": 9.65,

        "tier": "EDGE_LEAN",
        "titanium_triggered": false,
        "units": 1.0,

        "pick_type": "spread",
        "selection": "Indiana Pacers",
        "line": 6.5,
        "odds_american": -104,
        "book": "LowVig.ag",

        "harmonic_boost": 0.0,
        "msrf_boost": 0.0,

        "context_layer": {
          "def_rank": 4,
          "pace": 101.0,
          "vacuum": 0.0,
          "officials_adjustment": 0.0,
          "park_adjustment": 0.0
        },

        "signals_fired": ["Sharp Money Detection"],
        "confidence_label": "HIGH"
      }
    ]
  },
  "props": {
    "count": 0,
    "picks": []
  }
}
```

### Field Availability by Version

| Field | v12.0 | v17.3 | v20.5 | v20.12 |
|-------|-------|-------|-------|--------|
| ai_score | ✅ | ✅ | ✅ | ✅ |
| research_score | ✅ | ✅ | ✅ | ✅ |
| esoteric_score | ✅ | ✅ | ✅ | ✅ |
| jarvis_score | ✅ | ✅ | ✅ | ✅ |
| context_score | ❌ | ✅ | ✅ | ✅ |
| context_layer | ❌ | ✅ | ✅ | ✅ |
| harmonic_boost | ❌ | ✅ | ✅ | ✅ |
| msrf_boost | ❌ | ✅ | ✅ | ✅ |
| base_4_score | ❌ | ❌ | ✅ | ✅ |
| context_modifier | ❌ | ❌ | ✅ | ✅ |
| confluence_boost | ❌ | ❌ | ✅ | ✅ |
| jason_sim_boost | ❌ | ❌ | ✅ | ✅ |
| serp_boost | ❌ | ❌ | ✅ | ✅ |
| ensemble_adjustment | ❌ | ❌ | ✅ | ✅ |
| live_adjustment | ❌ | ❌ | ✅ | ✅ |
| msrf_status | ❌ | ❌ | ✅ | ✅ |
| serp_status | ❌ | ❌ | ✅ | ✅ |
| jason_status | ❌ | ❌ | ✅ | ✅ |
| msrf_metadata | ❌ | ❌ | ✅ | ✅ |
| serp_shadow_mode | ❌ | ❌ | ✅ | ✅ |
| glitch_signals | ❌ | ❌ | ✅ | ✅ |
| esoteric_contributions | ❌ | ❌ | ✅ | ✅ |
| **ai_reasons** | ❌ | ❌ | ❌ | ✅ |
| **esoteric_reasons** | ❌ | ❌ | ❌ | ✅ |
| **context_reasons** | ❌ | ❌ | ❌ | ✅ |
| **reasons** | ❌ | ❌ | ❌ | ✅ |
| **stadium_data** | ❌ | ❌ | ❌ | ✅ |
| **altitude_impact** | ❌ | ❌ | ❌ | ✅ |
| **scoring_impact** | ❌ | ❌ | ❌ | ✅ |
| **travel_data** | ❌ | ❌ | ❌ | ✅ |
| **travel_fatigue** | ❌ | ❌ | ❌ | ✅ |
| **away_fatigue** | ❌ | ❌ | ❌ | ✅ |
| **home_boost** | ❌ | ❌ | ❌ | ✅ |
| **officials_data** | ❌ | ❌ | ❌ | ✅ |
| **officials_fallback** | ❌ | ❌ | ❌ | ✅ |

---

## 📚 MASTER FILE INDEX

### Core Display Components

| File | Purpose | Key Lines |
|------|---------|-----------|
| `GameSmashList.jsx` | Game picks (spreads, totals, ML) | 662-740: Engine display, badges, context, boost panels |
| `PropsSmashList.jsx` | Player props display | 925-1020: Engine display, badges, context, boost panels |
| `SmashSpotsPage.jsx` | Container with tabs, tier legend | 65-89: Tier config, 460-470: TITANIUM banner |
| `BetslipModal.jsx` | Click-to-bet sportsbook selection | Deep links, odds comparison |

### Score Breakdown Components (v20.5)

| File | Purpose |
|------|---------|
| `components/BoostBreakdownPanel.jsx` | Option A score breakdown: base_4, context, confluence, msrf, jason_sim, serp, ensemble, live |
| `components/StatusBadgeRow.jsx` | Status badges: MSRF active (+value), SERP active/shadow, Jason block/boost, ML adjust |
| `components/GlitchSignalsPanel.jsx` | GLITCH protocol: void_moon (nested), kp_index (nested), noosphere (nested), benford (nested) |
| `components/EsotericContributionsPanel.jsx` | Esoteric contributions by category: numerology, astronomical, mathematical, signals, situational (12 verified keys) |

### v20.12 Components

| File | Purpose |
|------|---------|
| `components/ReasonPanel.jsx` | Expandable "Why This Pick" panel with categorized reasons (AI, Esoteric, Context) and v20.12 feature badges (Altitude, Travel, Officials) |
| `components/StreamingUpdater.jsx` | SSE client with StreamingProvider, StreamingStatusBadge, useStreaming hook, auto-reconnect with exponential backoff |

### API & Data

| File | Purpose |
|------|---------|
| `api.js` | All API calls, auth headers, error handling, `normalizePick()` passes through all boost/status/signal fields |
| `lib/api/client.js` | Base fetch client, auth failure detection |
| `usePreferences.js` | User preferences hook (favorite sport, etc.) |

### Contract & Validation

| File | Purpose |
|------|---------|
| `core/frontend_scoring_contract.js` | Tier thresholds, engine weights, boost caps (SINGLE SOURCE OF TRUTH) |
| `scripts/validate_frontend_contracts.mjs` | Catches hardcoded literals, direct fetch calls, missing imports |
| `scripts/validate_no_frontend_literals.mjs` | Catches scoring thresholds outside contract |
| `scripts/validate_no_eval.mjs` | Prevents eval/new Function usage |

### Signal Processing

| File | Purpose |
|------|---------|
| `signalEngine.js` | Client-side gematria, moon phase, numerology |

### Testing (14 unit test files, 210 tests + 8 E2E spec files, ~150 tests)

| File | Purpose |
|------|---------|
| `test/api.test.js` | API client tests (33 tests) |
| `test/esoteric.test.js` | Chrome Resonance, Vortex Math (28 tests) |
| `test/kellyCalculator.test.js` | Kelly Criterion, odds conversion, bankroll (34 tests) |
| `test/correlationDetector.test.js` | Pick correlation, diversification (16 tests) |
| `test/clvTracker.test.js` | CLV tracking, closing lines, grading (20 tests) |
| `test/pickExplainer.test.js` | Explanations, headlines, risk factors (10 tests) |
| `test/signalEngine.test.js` | Gematria, JARVIS, daily readings (22 tests) |
| `test/BetSlip.test.jsx` | Bet slip component tests |
| `test/BetHistory.test.jsx` | Bet history component tests |
| `test/ParlayBuilder.test.jsx` | Parlay builder tests |
| `test/BoostBreakdownPanel.test.jsx` | Boost breakdown display (4 tests) |
| `test/StatusBadgeRow.test.jsx` | Status badge rendering (4 tests) |
| `test/GlitchSignalsPanel.test.jsx` | GLITCH protocol signals (4 tests) |
| `test/EsotericContributionsPanel.test.jsx` | Esoteric contributions (4 tests) |
| `e2e/*.spec.js` | Playwright E2E tests (8 files, 100% route coverage) |

---

## 🔴 LESSONS LEARNED (NEVER REPEAT)

### Lesson 1: Missing Engine Display
**Problem:** Frontend showed only 2 engines (Research, Esoteric) while backend provided 5.

**Root Cause:** Code was written for v10.4 with 2 engines, never updated when backend added more.

**Prevention:**
- When backend adds new fields, IMMEDIATELY update frontend display
- Check `docs/FRONTEND_INTEGRATION.md` in backend repo for field mapping
- Grep for engine display code: `grep -n "research_score\|esoteric_score" *.jsx`

### Lesson 2: Outdated Engine Count in Comments/Legends
**Problem:** UI said "3/4 engines" when backend uses 5 engines.

**Root Cause:** Comments and legend text weren't updated when Context engine was added.

**Prevention:**
- Search for engine count references: `grep -rn "3/4\|4 engine\|four engine" .`
- Update ALL references when engine count changes
- Keep comments in sync with actual implementation

### Lesson 3: Field Path Mismatches
**Problem:** Frontend checked `pick.scoring_breakdown?.research_score` but backend provided `pick.research_score` at top level.

**Root Cause:** API response structure changed but frontend wasn't updated.

**Prevention:**
- Use nullish coalescing: `pick.field ?? pick.scoring_breakdown?.field`
- Test with actual API response, not assumptions
- Save API response to file and verify field paths: `curl ... | jq '.picks[0] | keys'`

### Lesson 4: Badge Condition Errors
**Problem:** Badges appeared when they shouldn't (or didn't appear when they should).

**Root Cause:** Used wrong comparison operators or wrong field names.

**Prevention:**
- Document exact conditions in comments above badge code
- Use strict comparisons: `> 0` not `!== 0` for boost fields
- Test with picks that have both triggered and non-triggered states

### Lesson 5: Color Code Inconsistency
**Problem:** Context Details showed wrong colors for defense rank.

**Root Cause:** Color logic was inverted (lower rank = better defense, but code showed red).

**Prevention:**
- Document color meaning in comments: `// Lower rank = better defense = green`
- Test with edge cases: rank 1, rank 15, rank 30
- Keep color logic consistent across all components

### Lesson 6: Backend Contradiction Gate Bug (Feb 2026)
**Problem:** NHL picks showed BOTH Over AND Under on same total (e.g., O 6.5 and U 6.5 both returned).

**Root Cause:** Backend contradiction gate silently failed. When props list was empty, it returned `{}` instead of proper dict with `contradictions_detected` key, causing KeyError swallowed by fallback.

**Impact:** Frontend displayed impossible picks (can't bet both sides).

**Backend Fix:** Return proper dict structure: `{"contradictions_detected": 0, "picks_dropped": 0}`.

**Frontend Lesson:**
- If you see both Over AND Under on same line, it's a backend bug
- Report immediately - contradiction gate should prevent this
- Never try to "fix" this in frontend by filtering client-side

### Lesson 7: Hardcoded Literals in Comments and Strings (Feb 2026)
**Problem:** Validator caught `7.5` in JSX comments and `8.0` in template strings, even though code logic used the contract constants correctly.

**Root Cause:** Comments like `{/* >= 7.5 */}` and template strings like `` `≥8.0` `` contained raw literals that drifted when thresholds changed.

**Impact:** If thresholds change, comments/strings would show stale values, misleading future developers.

**Prevention:**
- Reference constant NAMES in comments: `{/* >= GOLD_STAR_THRESHOLD */}`
- Use template interpolation in strings: `` `≥${TITANIUM_THRESHOLD}` ``
- Run `node scripts/validate_no_frontend_literals.mjs` which catches literals even in comments
- The validator is the last line of defense; write correct code first

**Automated Gate:** `validate_frontend_contracts.mjs` and `validate_no_frontend_literals.mjs` both check for this pattern.

### Lesson 8: Missing Backend Fields Not Wired to Frontend (Feb 2026)
**Problem:** Backend v20.5 sent 6 boost fields, GLITCH signals, esoteric contributions, and status indicators. Frontend displayed none of them (only badge icons for 2 boosts).

**Root Cause:** `normalizePick()` in api.js didn't pass through the new fields. Even if components existed, the data was being stripped at the API normalization layer.

**Impact:** Users couldn't see the full scoring breakdown, status indicators, or esoteric signal details.

**Prevention:**
- When backend adds fields, update `normalizePick()` in api.js FIRST
- Then create display components
- Then integrate into both GameSmashList.jsx AND PropsSmashList.jsx
- Verify with: `curl ... | jq '.game_picks.picks[0] | keys'` then check normalizePick passes each key

### Lesson 9: Test Mocks Drifted From Implementation (Feb 2026)
**Problem:** 27 of 32 api.test.js tests failed. Test mocks used bare objects `{ json: () => ... }` that didn't match what `safeJson()` and `authFetch()` actually call.

**Root Cause:** When `lib/api/client.js` was introduced with `safeJson()` (uses `response.text()` not `.json()`) and `authFetch()` (uses `response.clone().text()` for error logging, adds `cache: 'no-store'`), the test mocks were never updated.

**Impact:** Tests silently passed for months via catch blocks masking the failures, then broke when assertions checked return values. 27 tests reported passing that weren't actually testing the right behavior.

**Fix Applied:**
1. Created `mockResponse()` helper with `ok`, `text()`, `clone()`, `status`
2. Updated all 32 test mocks to use it
3. Updated auth endpoint assertions to include `cache: 'no-store'`

**Prevention:**
- When changing API client internals (`safeJson`, `authFetch`, `apiFetch`), ALWAYS run `npm run test:run` and check for failures
- Use the `mockResponse()` helper for ALL new test mocks — never bare objects
- Auth endpoint assertions MUST include `cache: 'no-store'`

**Automated Gate:** `npm run test:run` — 210 tests must pass before commit.

### Lesson 10: API Methods Missing Network Error Handling (Feb 2026)
**Problem:** API methods like `getTodayEnergy`, `getSportsbooks`, `getParlay` etc. had `|| default` fallbacks for non-ok responses, but didn't catch network errors (fetch rejections). Network failures crashed instead of returning defaults.

**Root Cause:** `safeJson()` handles `response.ok === false` → returns null → `|| default` works. But `fetch` rejections throw BEFORE `safeJson()` runs, skipping the `|| default` entirely.

**Impact:** Any network error (DNS failure, timeout, offline) crashed the component instead of showing empty/default state.

**Fix Applied:** Added try-catch to 7 API methods that should return graceful defaults.

**Prevention:**
- When writing API methods with `|| default` pattern, ALWAYS wrap in try-catch
- The catch block should return the same default as the `||` fallback
- Test with `fetch.mockRejectedValueOnce(new Error('Network error'))` to verify

**Automated Gate:** Test suite includes error tests for each method.

---

### Lesson 11: Backend Data Shape Mismatch (Nested Objects vs Flat Numbers)
**Problem:** GlitchSignalsPanel called `.toFixed()` on nested objects, crashing on every signal.
**Root Cause:** Component assumed `glitch_signals.void_moon` was a number (0.5), but backend sends `{is_void: true, confidence: 0.69, void_start: "20:00 UTC"}`. Same for `kp_index` (`{kp_value: 2.7, level: "QUIET"}`).
**Impact:** TypeError crashes for any pick with GLITCH signals.

**Fix Applied:** Rewrote GlitchSignalsPanel to extract correct nested values:
```javascript
// WRONG: signals.void_moon.toFixed(2) — TypeError: object has no method toFixed
// CORRECT: signals.void_moon.is_void ? 'ACTIVE' : 'CLEAR'
```

**Prevention:**
- ALWAYS fetch real API data before building components (see INVARIANT 12)
- Never call numeric methods on fields without verifying they ARE numbers
- `curl ... | jq '.picks[0].glitch_signals'` to see actual structure

**Automated Gate:** None (requires real API verification — see verification checklist)

---

### Lesson 12: Contract Drift from Backend Reality
**Problem:** `frontend_scoring_contract.js` had wrong BOOST_CAPS and TITANIUM_RULE values:
- confluence was 1.5 (actual: 3.0 — 2x over)
- jason_sim was ±0.5 (actual: -1.5 to +0.5 — 3x over)
- serp was 0.5 (actual: 0.55)
- TITANIUM_RULE said 3/5 engines >= 6.5 (actual: 3/4 engines >= 8.0)
- Missing boost types: phase8, glitch, gematria, harmonic

**Root Cause:** Contract was written from documentation/plan, never verified against live backend data.

**Prevention:**
- When writing contract values, verify against live API data (not docs)
- Check: `curl ... | jq '.picks[0] | {confluence_boost, jason_sim_boost, serp_boost}'`
- Look for values that exceed documented caps — that means caps are wrong

**Automated Gate:** None (requires manual verification against backend)

---

### Lesson 13: Wrong API Endpoint for Component Data
**Problem:** Esoteric.jsx displayed GLITCH Protocol section, Phase 8 indicators (mercury_retrograde, rivalry_intensity, streak_momentum, solar_flare), and void_moon using wrong field paths. These fields don't exist on `/esoteric/today-energy`.

**Root Cause:** Confused per-pick data (from `/live/best-bets/{sport}`) with daily aggregate data (from `/esoteric/today-energy`). Built UI sections for data the endpoint doesn't provide.

**Fix Applied:** Removed GLITCH section, Phase 8 section, and Historical Accuracy section from Esoteric.jsx. Fixed void_moon path (`void_moon` → `void_of_course`).

**Prevention:**
- Before adding a UI section, verify the endpoint returns that data
- See INVARIANT 13 for endpoint-to-data mapping
- `curl ... | jq 'keys'` on the actual endpoint to see what's available

**Automated Gate:** None (requires manual API verification)

---

### Lesson 14: normalizePick Precedence Bugs
**Problem:** `ai_score` showed wrong value (0-8 sub-score instead of 0-10 engine score). Confidence showed inflated values from `total_score * 10`.

**Root Cause:** `item.scoring_breakdown?.ai_models || item.ai_score` — `||` operator means non-zero `ai_models` (0-8 scale) overrides correct `ai_score` (0-10 scale). Also `total_score * 10` conflated 0-10 scoring with 0-100 percentage.

**Fix Applied:**
```javascript
ai_score: item.ai_score ?? item.scoring_breakdown?.ai_models  // ?? not ||
confidence: confidenceToPercent(item.confidence) || item.confidence_score || 70
```

**Prevention:**
- Use `??` for field precedence, NEVER `||` (see INVARIANT 14)
- Prefer top-level fields over nested breakdown fields
- `total_score * 10` is NEVER correct for confidence — use `confidence_score`

**Automated Gate:** None (requires code review vigilance)

---

### Lesson 15: Component Key Name Mismatches
**Problem:** EsotericContributionsPanel had 7 dead keys that don't exist in backend data and was missing 4 keys that do exist. Also had typo: `biorhythms` (plural) vs `biorhythm` (singular).

**Root Cause:** Component keys were written from a plan/spec, never verified against actual `esoteric_contributions` dict from the backend.

**Dead keys removed:** gematria, lunar, mercury, solar, fib_retracement, rivalry, streak
**Missing keys added:** glitch, phase8, harmonic, msrf
**Typo fixed:** biorhythms → biorhythm

**Prevention:**
- ALWAYS verify component field names against actual backend response (see INVARIANT 15)
- `curl ... | jq '.picks[0].esoteric_contributions | keys'`
- Never use synonyms or assumed names — use the EXACT backend key

**Automated Gate:** None (requires real API verification)

---

### Lesson 16: Grading Page Calling Non-Existent Backend Endpoint (Feb 2026)
**Problem:** `Grading.jsx` called `api.getGradedPicks()` which hit `GET /live/picks/graded` — an endpoint that didn't exist in the backend. The frontend silently fell back to `MOCK_PICKS`, displaying fake data as if it were real. Users saw realistic-looking picks with fake results, never knowing the backend connection was broken.

**Root Cause:** Three compounding issues:
1. `api.js` had `getGradedPicks()` calling a non-existent endpoint (never verified against `live_data_router.py`)
2. `Grading.jsx` had a `MOCK_PICKS` fallback that activated on any error — including 404 from the missing endpoint
3. The mock data was realistic enough (player names, stats, results) that the broken connection was invisible

**Fix Applied:**
- Added `GET /picks/graded` endpoint to backend `live_data_router.py`
- Removed `MOCK_PICKS` from `Grading.jsx` — shows empty state on no data
- Fixed `fetchPicks` to only run on mount (not on tab change — same data, just filtered)
- Used `pick.pick_id || pick.id` for grade API calls
- Added try-catch to `api.getGradedPicks()` (Invariant 11)
- Improved pick rendering for game picks (spread/moneyline) not just props

**Prevention:**
- NEVER add `api.js` methods without verifying the backend endpoint exists in `live_data_router.py`
- NEVER use realistic mock data as fallbacks — show empty state or error banner instead
- When a page shows data but the feature "isn't working," check the network tab for 404s first
- Add endpoint existence checks to pre-commit CI

**Automated Gate:** Frontend CI `verify-backend.sh` checks health/energy (should be extended to validate all api.js endpoints)

---

### Lesson 17: Edit Tool Exact String Matching Failures (Feb 2026)
**Problem:** Edit tool failed with "String to replace not found in file" when trying to update `api.js`. The `old_string` used `/` for comments but the actual file had `//` (double slash).

**Root Cause:** The Edit tool does EXACT string matching with no fuzzy logic. Even a single character difference (like `/` vs `//`) causes complete failure. The string was composed from memory/assumption rather than reading the exact file content first.

**Impact:** Wasted round-trips and confusion. Had to re-read the file to get exact content.

**Fix Applied:** Read the exact lines 275-294 from api.js, then used the precise text for the edit.

**Prevention:**
- ALWAYS read the exact lines before editing with `Read tool offset=X limit=Y`
- Copy text EXACTLY from Read output, including comment syntax and whitespace
- Pay attention to: `//` vs `/`, tabs vs spaces, trailing whitespace
- Never compose edit strings from memory — always verify first

**Automated Gate:** None (requires workflow discipline)

---

### Lesson 18: v20.12 Frontend Integration Pattern (Feb 2026)
**Problem:** Backend v20.12 shipped with 4 new features (stadium altitude, travel fatigue, officials fallback, SSE streaming) but frontend displayed none of them.

**Root Cause:** Frontend work wasn't done when backend shipped. The plan listed "22-29 hours of frontend work needed" but wasn't started.

**Impact:** Users couldn't see the new backend data (reason arrays, streaming updates, feature badges).

**Fix Applied:**
1. Updated `normalizePick()` in api.js with 15 new v20.12 field passthroughs
2. Created `ReasonPanel.jsx` - expandable categorized reasons component
3. Created `StreamingUpdater.jsx` - SSE client with auto-reconnect
4. Integrated ReasonPanel into BOTH GameSmashList.jsx AND PropsSmashList.jsx (INVARIANT 8)
5. Integrated StreamingProvider into App.jsx provider hierarchy
6. Added StreamingStatusBadge to navbar
7. Updated memo comparison functions to include v20.12 fields

**Files Changed:**
- `api.js` - normalizePick v20.12 fields
- `GameSmashList.jsx` - ReasonPanel + memo comparison
- `PropsSmashList.jsx` - ReasonPanel + memo comparison (symmetric)
- `App.jsx` - StreamingProvider wrapper + StreamingStatusBadge
- `components/ReasonPanel.jsx` - NEW
- `components/StreamingUpdater.jsx` - NEW

**Prevention:**
- When backend adds features, immediately update frontend (don't let it accumulate)
- Follow the pattern: normalizePick → Component → Integration (both SmashLists) → App wrapper
- Update memo comparison functions when adding fields that affect rendering
- Always verify SSE endpoint works before integrating: `curl /live/stream/status`

**Automated Gate:** Build + 210 tests must pass. No specific v20.12 validators yet.

---

## ✅ VERIFICATION CHECKLIST (Before Deploy)

### 1. Contract Validators (MANDATORY - run first)
```bash
node scripts/validate_frontend_contracts.mjs
node scripts/validate_no_frontend_literals.mjs
node scripts/validate_no_eval.mjs
# ALL must pass with zero errors
```

### 2. Build Check
```bash
npm run build
# Must complete with NO errors
```

### 3. Unit Test Suite
```bash
npm run test:run
# All 210 tests must pass
```

### 3b. E2E Test Suite
```bash
# Requires dev server running on :5173
npm run test:e2e
# All ~150 tests must pass

# Fixture integrity check
grep -rn "from '@playwright/test'" e2e/*.spec.js
# Should return EMPTY — all must import from './fixtures'
```

### 4. API Field Verification
```bash
# Verify backend returns all expected fields (v20.5)
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0] | {
    ai_score, research_score, esoteric_score, jarvis_score, context_score,
    harmonic_boost, msrf_boost, context_layer,
    base_4_score, context_modifier, confluence_boost,
    jason_sim_boost, serp_boost, ensemble_adjustment,
    msrf_status, serp_status, glitch_signals, esoteric_contributions
  }'

# Verify v20.12 fields
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0] | {
    ai_reasons, esoteric_reasons, context_reasons, reasons,
    scoring_impact, altitude_impact, stadium_data,
    away_fatigue, home_boost, travel_data,
    officials_fallback, officials_data
  }'

# Verify SSE endpoint
curl -s "https://web-production-7b2a.up.railway.app/live/stream/status" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | jq
# Should return: { enabled: true, sse_available: true, ... }
```

### 5. Visual Verification (Local Dev)
```bash
npm run dev
# Open http://localhost:5173/smash-spots
```

Check:
- [ ] All 5 engine scores display (AI, Research, Esoteric, Jarvis, Context)
- [ ] Tooltips show correct weights on hover
- [ ] Context Details expands and shows def_rank, pace, vacuum
- [ ] Boost Breakdown panel shows all 6 boosts with correct signs
- [ ] Status badges appear when conditions met (MSRF, SERP, Jason, ML)
- [ ] GLITCH Protocol panel shows signals with progress bars
- [ ] Esoteric Contributions panel shows grouped categories
- [ ] JARVIS badge appears when `jarvis_active: true`
- [ ] **v20.12:** ReasonPanel "Why This Pick" expands with categorized reasons
- [ ] **v20.12:** Altitude badge appears for Denver/Utah home games
- [ ] **v20.12:** Travel fatigue badges appear for B2B/road teams
- [ ] **v20.12:** StreamingStatusBadge in navbar shows Live/Connecting/Polling
- [ ] TITANIUM banner mentions "3/4 engines"
- [ ] Tier legend shows correct thresholds (uses contract constants)
- [ ] Negative jason_sim_boost shows in red

### 6. All Sports Check
```bash
for sport in NBA NHL NFL MLB NCAAB; do
  echo "=== $sport ==="
  curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/$sport" \
    -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
    jq '{games: .game_picks.count, props: .props.count}'
done
```

### 7. Stale Reference Grep
```bash
# Verify no outdated references
grep -rn "3/5\|5 engine\|five engine" --include="*.jsx" --include="*.js" | grep -i titanium
# Should return EMPTY (TITANIUM is 3/4 engines, context excluded)
```

### 8. Data Shape Verification (NEW - prevents Lesson 11)
```bash
# Verify glitch_signals are nested objects, not flat numbers
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0].glitch_signals | to_entries[] | {key, value_type: (.value | type)}'
# Each value_type should be "object", not "number"

# Verify esoteric_contributions keys match component
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0].esoteric_contributions | keys'
# Should show: astro, biorhythm, daily_edge, fib_alignment, founders_echo, gann, glitch, harmonic, msrf, numerology, phase8, vortex
```

---

## 🚫 NEVER DO THESE

1. **NEVER** recompute `final_score`, `tier`, or `titanium_triggered` on frontend
2. **NEVER** display fewer than 5 scores (AI, Research, Esoteric, Jarvis, Context)
3. **NEVER** say "3/5 engines" for TITANIUM — it's 3/4 weighted engines (context excluded)
4. **NEVER** hardcode tier thresholds - import from `core/frontend_scoring_contract.js`
5. **NEVER** hardcode scoring literals even in comments or template strings - use constant NAMES
6. **NEVER** derive badge visibility from score - use explicit boolean fields
7. **NEVER** assume field paths without checking actual API response
8. **NEVER** skip contract validators before committing
9. **NEVER** push without verifying all 5 sports return data
10. **NEVER** update engine display in one file without updating the other (GameSmashList + PropsSmashList)
11. **NEVER** change color coding without documenting the meaning
12. **NEVER** add backend fields to components without first updating `normalizePick()` in api.js
13. **NEVER** skip `normalizePick()` when wiring new backend fields - it's the single gateway
14. **NEVER** use bare `{ json: () => ... }` objects in test mocks - use `mockResponse()` helper
15. **NEVER** write API methods with `|| default` without wrapping in try-catch for network errors
16. **NEVER** call `.toFixed()` or numeric methods on backend fields without verifying they're numbers (not nested objects)
17. **NEVER** use `||` for field precedence in normalizePick — use `??` (nullish coalescing)
18. **NEVER** build components against assumed/planned data shapes — always verify against real API data first
19. **NEVER** display per-pick data (glitch_signals, esoteric_contributions) on pages using global endpoints (today-energy)
20. **NEVER** guess field key names — always verify with `curl | jq 'keys'` against actual backend response
21. **NEVER** import from `@playwright/test` in E2E spec files — import from `./fixtures` (shared fixture skips onboarding)
22. **NEVER** add localStorage-gated UI (modals, wizards, banners) without adding the skip key to `e2e/fixtures.js`
23. **NEVER** use `waitForLoadState('networkidle')` in E2E tests on pages with API polling (BetHistory, Dashboard, SmashSpots)
24. **NEVER** use `getByText()` to verify a page rendered — raw Vite source code contains all string literals and will match
25. **NEVER** hardcode enum validation arrays without checking the actual backend values — enums expand (e.g., UNFAVORABLE added to betting_outlook)
26. **NEVER** ship a new core logic module (calculator, tracker, engine) without corresponding unit tests
27. **NEVER** add a new route without adding at least a smoke E2E test to verify it loads

---

## 🔧 QUICK REFERENCE

### Engine Weights (Option A)
```
AI:       25%      →  ai_score
Research: 35%      →  research_score  ← LARGEST
Esoteric: 20%      →  esoteric_score
Jarvis:   20%      →  jarvis_score
Context:  ±0.35    →  context_score   (modifier, not weighted)
```

### Tier Thresholds
```
TITANIUM_SMASH: final >= 8.0 AND 3/4 engines >= 8.0 (context excluded)
GOLD_STAR:      final >= 7.5 (+ hard gates)
EDGE_LEAN:      final >= 6.5
MONITOR:        final >= 5.5 (hidden)
PASS:           final < 5.5 (hidden)
```

### Badge Colors
```
TITANIUM:     #00FFFF (Cyan)
GOLD_STAR:    #FFD700 (Gold)
EDGE_LEAN:    #10B981 (Green)
JARVIS:       #FFD700 (Gold)
HARMONIC:     #A855F7 (Purple)
TURN DATE:    #EAB308 (Gold) — msrf_boost > 0
SERP ACTIVE:  #00D4FF (Cyan)
SERP SHADOW:  #6B7280 (Gray)
JASON BLOCK:  #EF4444 (Red)
JASON BOOST:  #10B981 (Green)
ML ADJUST:    #3B82F6 (Blue)
```

### Context Layer Color Coding
```
def_rank:  <= 10 green, 11-19 yellow, >= 20 red (lower = better)
pace:      >= 102 green, 99-101 neutral, <= 98 red (higher = faster)
vacuum:    > 0 green (injury opportunity)
officials: > 0 green (favorable), < 0 red (unfavorable)
```

---

## Session Management

**To prevent Claude Code context limit errors:**

1. Checkpoint commit every 30-60 minutes:
```bash
   ./scripts/checkpoint_commit.sh
```

2. Use `/compact` in Claude Code when you see:
   - "Conversation compacted" messages
   - Slower responses
   - Large repeated file reads

3. Split large refactors across multiple sessions

See `docs/SESSION_HYGIENE.md` for complete guide.

---

## 🤖 Automation & Cron Jobs

### Overview
33 automated jobs run via cron across both repositories. No manual intervention needed as long as Mac is awake.

### Cron Schedule (Frontend - bookie-member-app)

| Schedule | Script | Purpose |
|----------|--------|---------|
| Every 30 min | `response_time_check.sh` | Monitor deployed app response times |
| Every 4 hours | `memory_leak_check.sh` | Find React memory leak patterns |
| Daily 6 AM | `console_log_scan.sh` | Find stray console.log/debugger |
| Daily 9 AM | `daily_health_check.sh` | Full frontend health check |
| Sunday 5 AM | `prune_build_artifacts.sh` | Clean Vite cache, old builds |
| Sunday 7 AM | `dead_code_scan.sh` | Find unused components/exports |
| Sunday 7:30 AM | `accessibility_check.sh` | Basic a11y audit |
| Sunday 10:15 AM | `dependency_vuln_scan.sh` | npm audit with details |
| Monday 6 AM | `broken_import_check.sh` | Validate all imports |
| Monday 7 AM | `complexity_report.sh` | Flag complex components |
| Monday 8 AM | `test_coverage_report.sh` | Vitest coverage report |
| Monday 8:30 AM | `bundle_size_check.sh` | Track bundle bloat |
| Monday 9:15 AM | `secret_exposure_check.sh` | Find exposed secrets |
| Monday 9:30 AM | `feature_flag_audit.sh` | Audit feature flags |

### Log Location
```bash
~/bookie-member-app/logs/cron.log  # All cron output
```

### Verify Cron is Running
```bash
crontab -l | grep bookie-member-app | wc -l  # Should show 15+ lines
tail -20 ~/bookie-member-app/logs/cron.log   # Recent activity
```

### Manual Script Runs
```bash
# Morning check-in
./scripts/session_start.sh

# Before deploys
./scripts/contract_sync_check.sh  # Run from backend repo

# Quick health check
./scripts/daily_health_check.sh
```

### CRITICAL: Path Validation (Lesson 66)
Cron jobs silently fail if paths are wrong:
```bash
# Verify paths in crontab match reality
crontab -l | grep "bookie-member-app"
ls -d ~/bookie-member-app  # Must exist
```

---

## 🧠 DAILY LEARNING LOOP (Dashboard)

**Invariant:** The dashboard must surface the backend's daily lesson after the 6:00 AM ET audit.

### API Endpoint
- `GET /live/grader/daily-lesson`
- `GET /live/grader/daily-lesson/latest`
- `GET /live/grader/daily-lesson?days_back=1`

### UI Behavior
- Show lesson bullets when available.
- Before 6 AM ET: show “not available yet” state.
- If missing: show empty state (never crash).

### Source of truth
- Backend writes lessons to `/data/grader_data/audit_logs/lesson_YYYY-MM-DD.json`
