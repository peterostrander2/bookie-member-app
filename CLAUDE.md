# CLAUDE.md - Bookie Member App

## Overview
Member dashboard for Bookie-o-em AI betting signals.

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

### Confidence Levels
| Score | Label | Display |
|-------|-------|---------|
| 10.0+ | SMASH | Maximum conviction |
| 8.0-9.9 | HIGH | Strong play |
| 6.0-7.9 | MEDIUM | Standard play |
| <6.0 | LOW | Weak signal |

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
React/Vite, JavaScript, Tailwind CSS

## Patterns
- Use fetch for API calls (see api.js)
- Handle loading/error states for all endpoints
- Cache responses client-side when appropriate

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

### Smash Spots Architecture
```
/smash-spots → SmashSpotsPage.jsx
                ├── Tab 1: Player Props (PropsSmashList)
                └── Tab 2: Game Picks (GameSmashList)
```
Both tabs pull from `/live/best-bets/{sport}` endpoint.

**Confidence Tiers:**
- SMASH (85%+) - Green
- STRONG (75-84%) - Yellow
- LEAN (65-74%) - Blue
- WATCH (<65%) - Gray

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
- Uses `VITE_API_KEY` environment variable
- `authFetch` helper for authenticated GET requests
- `getAuthHeaders` helper for authenticated POST requests
- Set `VITE_API_KEY` in Railway Variables for production

---

## Context Providers (App.jsx)
```jsx
<ThemeProvider>
  <GamificationProvider>
    <ToastProvider>
      <SignalNotificationProvider>
        <BetSlipProvider>
          <App />
        </BetSlipProvider>
      </SignalNotificationProvider>
    </ToastProvider>
  </GamificationProvider>
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

### Key Files to Review First
1. `api.js` - All backend connections + auth helpers
2. `App.jsx` - Routing, providers, code splitting
3. `sentry.js` - Error monitoring configuration
4. `usePreferences.js` - User preferences hook
5. `SmashSpotsPage.jsx` - Main picks container with tabs
6. `PropsSmashList.jsx` - Player props picks
7. `GameSmashList.jsx` - Game picks (spreads/totals/ML)
8. `BetslipModal.jsx` - Click-to-bet feature
9. `BetHistory.jsx` - Bet tracking and grading
10. `ParlayBuilder.jsx` - Parlay builder with calculator
11. `Gamification.jsx` - XP/achievements system

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
VITE_API_KEY      - API key for backend authentication
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
| Push notifications | Firebase Cloud Messaging for SMASH alerts | High |
| Social sharing | Share picks to Twitter/Discord | Medium |
| Historical charts | Performance over time visualization | Medium |
| User preferences | ✅ DONE - localStorage + backend sync | - |
| Offline mode | Cache picks for offline viewing | Medium |

### Analytics (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| Google Analytics | Track page views, user flows | Low |
| Event tracking | Track bet placements, feature usage | Low |
| Error monitoring | ✅ DONE - Sentry integration | - |

### Infrastructure (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| CI/CD pipeline | ✅ DONE - GitHub Actions for auto-deploy | - |
| Staging environment | Separate Railway env for testing | Low |
| API rate limiting | Frontend throttling for API calls | Low |
