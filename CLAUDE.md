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
| final≥8.0 + 3/5 engines≥8.0 | TITANIUM_SMASH | 2.5 | SMASH | #00FFFF (Cyan) |
| ≥7.5 | GOLD_STAR | 2.0 | SMASH | #FFD700 (Gold) |
| ≥6.5 | EDGE_LEAN | 1.0 | PLAY | #10B981 (Green) |
| ≥5.5 | MONITOR | 0.0 | WATCH | #F59E0B (Amber) |
| <5.5 | PASS | 0.0 | SKIP | #6B7280 (Gray) |

**v20.5 Scoring (Option A):**
- TITANIUM requires both final_score ≥ 8.0 AND 3/5 engines ≥ 8.0
- Community filter: Only picks ≥ 6.5 shown to community
- Engine scores (Option A: 4 weighted engines + context modifier, all 0-10):
  - ai_score (25% weight) - 8 AI models
  - research_score (35% weight) - Sharp money, line variance, public fade
  - esoteric_score (20% weight) - Numerology, astro, fibonacci
  - jarvis_score (20% weight) - Gematria triggers
  - context_score (modifier ±0.35 cap) - Defense rank, pace, injury vacuum
- Boost fields (added to final after BASE_4):
  - context_modifier (±0.35), confluence_boost (0-1.5), msrf_boost (0-1.0)
  - jason_sim_boost (±0.5), serp_boost (0-0.5), ensemble_adjustment (±0.5)

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

# Run tests (91 tests)
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
| StatusBadgeRow | `components/StatusBadgeRow.jsx` | MSRF/SERP/Jason/ML status badges |
| GlitchSignalsPanel | `components/GlitchSignalsPanel.jsx` | GLITCH protocol signals with progress bars |
| EsotericContributionsPanel | `components/EsotericContributionsPanel.jsx` | Esoteric contributions grouped by category |

### Smash Spots Architecture
```
/smash-spots → SmashSpotsPage.jsx
                ├── Tab 1: Player Props (PropsSmashList)
                └── Tab 2: Game Picks (GameSmashList)
```
Both tabs pull from `/live/best-bets/{sport}` endpoint.

**Display Tiers (v20.5):**
- TITANIUM SMASH (≥8.0 + 3/5 engines ≥8.0) - Cyan with glow
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
13. Testing infrastructure (91 unit tests, E2E with Playwright)
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
28. Status badges (MSRF level, SERP active/shadow, Jason block/boost, ML adjust)
29. GLITCH protocol signals panel (chrome resonance, void moon, noosphere, hurst, kp-index, benford)
30. Esoteric contributions panel (numerology, astronomical, mathematical, situational)
31. Void Moon warning banner on Esoteric page
32. Phase 8 esoteric indicators (Mercury Retrograde, Rivalry, Streak, Solar Flare)

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

**Test files:** `test/*.test.js`, `test/*.test.jsx`
- `api.test.js` - API client tests (32 tests)
- `esoteric.test.js` - Chrome Resonance, Vortex Math tests (28 tests)
- `BetSlip.test.jsx` - Bet slip component tests
- `BetHistory.test.jsx` - Bet history component tests
- `ParlayBuilder.test.jsx` - Parlay builder tests

### E2E Tests (Playwright)
```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Interactive UI mode
npm run test:e2e:headed # Run in headed browser
```

**Test files:** `e2e/*.spec.js`
- `navigation.spec.js` - Page navigation and routing
- `smash-spots.spec.js` - Picks viewing, tab switching
- `bet-slip.spec.js` - Bet slip interactions
- `parlay-builder.spec.js` - Parlay building flow
- `esoteric.spec.js` - Esoteric matchup analyzer

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
1. **Test** - Runs 91 unit tests with Vitest
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

### INVARIANT 3: Titanium 3/5 Rule Display

**RULE:** Titanium badge and legend MUST reference "3/5 engines" not "3/4 engines".

**Backend Rule:** `titanium_triggered=true` only when >= 3 of 5 engines >= 8.0

**Files that reference this:**
- `SmashSpotsPage.jsx` line ~65 (comment)
- `SmashSpotsPage.jsx` line ~86 (legend text)
- `SmashSpotsPage.jsx` line ~466 (TITANIUM banner)

**NEVER:** Say "3/4 engines" - this is outdated (v12.0). Current is v17.3 with 5 engines.

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
  confluence_boost,        // 0 to 1.5
  jason_sim_boost,         // -0.5 to +0.5 (can be negative!)
  serp_boost,              // 0 to 0.5
  ensemble_adjustment,     // ±0.5
  live_adjustment,         // In-play adjustment

  // v20.5 Status Fields
  msrf_status,             // VALIDATED | CONFIGURED | DISABLED
  serp_status,             // VALIDATED | CONFIGURED | DISABLED
  jason_status,            // VALIDATED | CONFIGURED | DISABLED
  msrf_metadata,           // { level, points, source }
  serp_shadow_mode,        // true = SERP running but not affecting score

  // v20.5 Signal Dicts
  glitch_signals,          // { chrome_resonance, void_moon, noosphere, hurst, kp_index, benford }
  esoteric_contributions,  // { numerology, astro, fib_alignment, lunar, mercury, ... }
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
| TURN DATE | `msrf_boost > 0` | Gold #EAB308 | `pick.msrf_boost` |
| MSRF LEVEL | `msrf_metadata?.level` exists | Gold #EAB308 | `pick.msrf_metadata` |
| SERP ACTIVE | `serp_boost > 0 && !serp_shadow_mode` | Cyan #00D4FF | `pick.serp_boost` |
| SERP SHADOW | `serp_shadow_mode === true` | Gray #6B7280 | `pick.serp_shadow_mode` |
| JASON BLOCK | `jason_sim_boost < 0` | Red #EF4444 | `pick.jason_sim_boost` |
| JASON BOOST | `jason_sim_boost > 0` | Green #10B981 | `pick.jason_sim_boost` |
| ML ADJUST | `ensemble_adjustment !== 0` | Blue #3B82F6 | `pick.ensemble_adjustment` |

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

**Current passthrough fields (v20.5):**
```javascript
// Boost fields
base_4_score, context_modifier, confluence_boost, msrf_boost,
jason_sim_boost, serp_boost, ensemble_adjustment, live_adjustment

// Status fields
msrf_status, serp_status, jason_status, msrf_metadata, serp_shadow_mode

// Signal dicts
glitch_signals, esoteric_contributions
```

**If a field shows as `undefined` in a component, check normalizePick() FIRST.**

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

| Field | v12.0 | v17.3 | v20.5 |
|-------|-------|-------|-------|
| ai_score | ✅ | ✅ | ✅ |
| research_score | ✅ | ✅ | ✅ |
| esoteric_score | ✅ | ✅ | ✅ |
| jarvis_score | ✅ | ✅ | ✅ |
| context_score | ❌ | ✅ | ✅ |
| context_layer | ❌ | ✅ | ✅ |
| harmonic_boost | ❌ | ✅ | ✅ |
| msrf_boost | ❌ | ✅ | ✅ |
| base_4_score | ❌ | ❌ | ✅ |
| context_modifier | ❌ | ❌ | ✅ |
| confluence_boost | ❌ | ❌ | ✅ |
| jason_sim_boost | ❌ | ❌ | ✅ |
| serp_boost | ❌ | ❌ | ✅ |
| ensemble_adjustment | ❌ | ❌ | ✅ |
| live_adjustment | ❌ | ❌ | ✅ |
| msrf_status | ❌ | ❌ | ✅ |
| serp_status | ❌ | ❌ | ✅ |
| jason_status | ❌ | ❌ | ✅ |
| msrf_metadata | ❌ | ❌ | ✅ |
| serp_shadow_mode | ❌ | ❌ | ✅ |
| glitch_signals | ❌ | ❌ | ✅ |
| esoteric_contributions | ❌ | ❌ | ✅ |

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
| `components/StatusBadgeRow.jsx` | Status badges: MSRF level, SERP active/shadow, Jason block/boost, ML adjust |
| `components/GlitchSignalsPanel.jsx` | GLITCH protocol: chrome resonance, void moon, noosphere, hurst, kp-index, benford |
| `components/EsotericContributionsPanel.jsx` | Esoteric contributions by category: numerology, astronomical, mathematical, situational |

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

### Testing

| File | Purpose |
|------|---------|
| `test/api.test.js` | API client tests (32 tests) |
| `test/esoteric.test.js` | Signal engine tests (28 tests) |
| `test/BetSlip.test.jsx` | Bet slip component tests |
| `e2e/*.spec.js` | Playwright E2E tests |

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

### 3. Test Suite
```bash
npm run test:run
# All tests must pass
```

### 4. API Field Verification
```bash
# Verify backend returns all expected fields
curl -s "https://web-production-7b2a.up.railway.app/live/best-bets/NBA" \
  -H "X-API-Key: bookie-prod-2026-xK9mP2nQ7vR4" | \
  jq '.game_picks.picks[0] | {
    ai_score, research_score, esoteric_score, jarvis_score, context_score,
    harmonic_boost, msrf_boost, context_layer,
    base_4_score, context_modifier, confluence_boost,
    jason_sim_boost, serp_boost, ensemble_adjustment,
    msrf_status, serp_status, glitch_signals, esoteric_contributions
  }'
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
- [ ] TITANIUM banner mentions "3/5 engines"
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
grep -rn "3/4\|4 engine\|four engine" --include="*.jsx" --include="*.js"
# Should return EMPTY
```

---

## 🚫 NEVER DO THESE

1. **NEVER** recompute `final_score`, `tier`, or `titanium_triggered` on frontend
2. **NEVER** display fewer than 5 engines (AI, Research, Esoteric, Jarvis, Context)
3. **NEVER** say "3/4 engines" or "4 engines" - it's 5 engines since v17.1
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
TITANIUM_SMASH: final >= 8.0 AND 3/5 engines >= 8.0
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
TURN DATE:    #EAB308 (Gold)
MSRF LEVEL:   #EAB308 (Gold)
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
