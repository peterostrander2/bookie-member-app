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
| SmashSpots | `SmashSpots.jsx` | Main picks display with filtering, sorting, confidence tiers |
| Props | `Props.jsx` | Player props with edge calculation, skeleton loading |
| BetslipModal | `BetslipModal.jsx` | Click-to-bet sportsbook selection (8 books) |
| BetSlip | `BetSlip.jsx` | Floating bet slip with parlay calculator |
| Gamification | `Gamification.jsx` | XP, levels, achievements system |
| Leaderboard | `Leaderboard.jsx` | Community rankings with backend integration |
| Charts | `Charts.jsx` | SVG performance charts (no external deps) |

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

### Key Files to Review First
1. `api.js` - All backend connections + auth helpers
2. `App.jsx` - Routing and providers
3. `SmashSpots.jsx` - Main picks UI
4. `BetslipModal.jsx` - Click-to-bet feature
5. `Gamification.jsx` - XP/achievements system

---

## Future Work Suggestions

### Testing (Priority: High)
| Task | Description | Effort |
|------|-------------|--------|
| Unit tests | Jest + React Testing Library for components | Medium |
| E2E tests | Playwright for critical user flows | Medium |
| API mocking | MSW for consistent test data | Low |

### Performance (Priority: Medium)
| Task | Description | Effort |
|------|-------------|--------|
| React.memo | Memoize expensive components (SmashSpots cards) | Low |
| useMemo/useCallback | Optimize re-renders in lists | Low |
| Code splitting | Lazy load routes with React.lazy | Medium |
| Bundle analysis | Identify large dependencies | Low |

### Features (Priority: Low-Medium)
| Task | Description | Effort |
|------|-------------|--------|
| Push notifications | Firebase Cloud Messaging for SMASH alerts | High |
| Social sharing | Share picks to Twitter/Discord | Medium |
| Historical charts | Performance over time visualization | Medium |
| User preferences | Persist filters, favorite sports | Low |
| Offline mode | Cache picks for offline viewing | Medium |

### Analytics (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| Google Analytics | Track page views, user flows | Low |
| Event tracking | Track bet placements, feature usage | Low |
| Error monitoring | Sentry for production errors | Low |

### Infrastructure (Priority: Low)
| Task | Description | Effort |
|------|-------------|--------|
| CI/CD pipeline | GitHub Actions for auto-deploy | Medium |
| Staging environment | Separate Railway env for testing | Low |
| API rate limiting | Frontend throttling for API calls | Low |
