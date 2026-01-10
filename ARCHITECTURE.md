# Bookie-o-em Architecture Documentation

## System Overview

Bookie-o-em is an AI-powered sports betting analysis platform that combines machine learning signals, professional bettor tracking, and 18 esoteric indicator modules to generate high-conviction betting recommendations.

**Current Version: v14.0 NOOSPHERE VELOCITY**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Backend** | FastAPI (Python) |
| **Hosting** | Vercel (Frontend) + Railway (Backend) |
| **Data APIs** | The Odds API |
| **Auth** | Whop (Membership) |
| **Storage** | localStorage (Client), Railway (Server) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     App.jsx (Router)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │  Dashboard  │  │ SmashSpots  │  │ SharpAlerts     │    │  │
│  │  │  (Home)     │  │ (Picks)     │  │ BestOdds        │    │  │
│  │  │             │  │             │  │ InjuryVacuum    │    │  │
│  │  └─────────────┘  └──────┬──────┘  └─────────────────┘    │  │
│  │                          │                                 │  │
│  │  ┌───────────────────────┴───────────────────────────┐    │  │
│  │  │              SIGNAL ENGINE (Core)                  │    │  │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │    │  │
│  │  │  │ signalEngine │ │ clvTracker   │ │ kelly     │  │    │  │
│  │  │  │ .js          │ │ .js          │ │ Calculator│  │    │  │
│  │  │  └──────────────┘ └──────────────┘ └───────────┘  │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                               │ api.js                           │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   BACKEND (FastAPI)    │
                    │   v14.0 NOOSPHERE      │
                    │  ┌─────────────────┐  │
                    │  │ live_data_router│  │
                    │  │ (5,869 lines)   │  │
                    │  │ 18 modules      │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
     ┌────────┴────────┐ ┌─────┴─────┐ ┌─────────┴─────────┐
     │  The Odds API   │ │  Esoteric │ │ Noosphere Engine  │
     │  (Live Odds)    │ │  Modules  │ │ (Info Asymmetry)  │
     └─────────────────┘ └───────────┘ └───────────────────┘
```

---

## Backend Engine Versions

### v14.0 NOOSPHERE VELOCITY (Current - MAIN MODEL)
*"Someone always knows." - Information Asymmetry Detection*

| Module | Signal | Action |
|--------|--------|--------|
| **Insider Leak** | Silent Spike (volume + no news) | FADE team |
| **Main Character Syndrome** | Underdog volume > Favorite | BET DOG |
| **Phantom Injury** | Player spike + injury queries | BET UNDER |

**Weight in Main Model: 17** (3rd highest)

### v13.0 GANN PHYSICS
*W.D. Gann's $130 → $12,000 geometric principles*

| Module | Principle | Signal |
|--------|-----------|--------|
| **50% Retracement** | Gravity Check | Fade at 50% zone after blowouts |
| **Rule of Three** | Exhaustion Node | 3 consecutive covers = FADE 4th |
| **Annulifier Cycle** | Harmonic Lock | W-L-W-L pattern = 5th LOCKED |

### v11.0 OMNI-GLITCH
*The Final Dimension - 6 Chaos Modules*

| Module | Theory | Signal |
|--------|--------|--------|
| **Vortex Math** | Tesla 3-6-9 | Root 9 = LOCKED, Root 3/6 = CHAOS |
| **Shannon Entropy** | Pattern Break | Low entropy streak = SNAP-BACK |
| **Atmospheric Drag** | Barometric | High pressure = UNDERS |
| **Void of Course Moon** | Time Vacuum | FADE FAVORITES |
| **Gann Spiral** | Square of Nine | Cardinal Cross = LOCKED |
| **Mars-Uranus Nuclear** | Shock Aspect | BLIND BET BIGGEST DOG |

### v10.4 SCALAR-SAVANT
*The Abyss - 6 Deep Glitch Modules*

| Module | Theory | Signal |
|--------|--------|--------|
| **Bio-Sine Wave** | Biorhythms (23/28/33 day cycles) | Peak = OVER, Trough = UNDER |
| **Chrome Resonance** | Color Psychology | RED teams +60% in close games |
| **Lunacy Factor** | Enhanced Moon | Full = Dogs/Overs, New = Favs/Unders |
| **Schumann Spike** | Earth Hz (7.83 baseline) | High Hz = Fade shooters |
| **Saturn Block** | Planetary | Jupiter = Overs, Saturn = Unders |
| **Zebra Privilege** | Ref Bias + Star Tiers | Star protection in crunch time |

### v10.3 RESONANCE LAYER
*Cosmic Alignment Detection*

| Module | Data | Signal |
|--------|------|--------|
| **Founder's Echo** | 124 franchise founding dates | Anniversary/date alignment boost |
| **Life Path Sync** | 90+ star player birthdates | Destiny game detection |

---

## Main Model Signal Weights

```
SIGNAL_WEIGHTS = {
    # DATA SIGNALS (Highest Impact)
    "sharp_money": 22,        # Professional bettor action
    "line_edge": 18,          # Best odds vs market
    "noosphere_velocity": 17, # v14.0 - Information asymmetry (NEW)
    "injury_vacuum": 16,      # Usage vacuum calculation
    "game_pace": 15,          # Pace-adjusted projections
    "travel_fatigue": 14,     # Schedule/travel impact
    "back_to_back": 13,       # Rest disadvantage
    "defense_vs_position": 12,# Matchup analysis
    "public_fade": 11,        # Fade public money (65%+ = CRUSH)
    "steam_moves": 10,        # Line movement detection
    "home_court": 10,         # Home advantage
    "weather": 10,            # Outdoor game conditions
    "minutes_projection": 10, # Playing time estimates
    "referee": 8,             # Ref crew tendencies
    "game_script": 8,         # Projected game flow
    "ensemble_ml": 8,         # ML model ensemble

    # JARVIS EDGE SIGNALS
    "jarvis_trigger": 5,      # 2178, 201, 33, 93, 322
    "crush_zone": 4,          # Public 65%+ fade zone
    "goldilocks": 3,          # Mid-spread sweet spot (+4 to +9)
    "nhl_protocol": 4,        # NHL dog protocol

    # ESOTERIC SIGNALS (Standalone Module)
    "gematria": 3,            # 6-cipher system
    "moon_phase": 2,          # Lunar cycle
    "numerology": 2,          # Date/jersey alignment
    "sacred_geometry": 2,     # Tesla 3-6-9, Fibonacci
    "zodiac": 1               # Planetary energy
}
```

---

## Databases

| Database | Count | Used By |
|----------|-------|---------|
| `FRANCHISE_FOUNDING_DATES` | 124 teams | Founder's Echo |
| `STAR_PLAYER_BIRTHDATES` | 90+ players | Life Path Sync |
| `TEAM_COLORS` | 124 teams | Chrome Resonance |
| `TEAM_BASELINE_VOLUMES` | 77 teams | Noosphere Velocity |
| `VENUE_ATMOSPHERICS` | 11 venues | Atmospheric Drag |
| `STAR_PLAYER_TIERS` | 30+ players | Zebra Privilege |
| `REF_CREW_HOME_BIAS` | 10 crews | Zebra Privilege |
| `JARVIS_TRIGGERS` | 5 numbers | Gematria Edge |
| `POWER_NUMBERS` | 7 categories | Numerology |

---

## API Endpoints (Backend)

### Core Endpoints
```
GET  /health                    # System status + all module info
GET  /live/health               # Detailed health with DB counts
GET  /live/today-energy         # Daily esoteric reading
GET  /live/props/{sport}        # Player props with confidence
GET  /live/best-bets/{sport}    # Top game picks
```

### v10.3 Resonance Layer
```
POST /live/founders-echo        # Franchise founding alignment
POST /live/life-path-sync       # Player destiny game check
GET  /live/star-players         # All players with birthdates
GET  /live/franchise-dates      # All franchise founding dates
```

### v10.4 SCALAR-SAVANT
```
POST /live/biorhythm            # Player biorhythm state
POST /live/chrome-resonance     # Team color matchup
GET  /live/lunacy-factor        # Enhanced moon phase
GET  /live/schumann-spike       # Earth frequency
POST /live/saturn-block         # Planetary aspects
POST /live/zebra-privilege      # Ref bias + star protection
GET  /live/scalar-savant-status # All module status
```

### v11.0 OMNI-GLITCH
```
POST /live/vortex-math          # Tesla 3-6-9 circuit
POST /live/shannon-entropy      # Pattern break detection
POST /live/atmospheric-drag     # Barometric effects
GET  /live/void-moon            # Void of course moon
POST /live/gann-spiral          # Square of Nine
GET  /live/mars-uranus          # Nuclear shock aspect
GET  /live/omni-glitch-status   # All chaos module status
```

### v13.0 GANN PHYSICS
```
POST /live/gann-retracement     # 50% gravity check
POST /live/gann-rule-of-three   # Exhaustion node
POST /live/gann-annulifier      # Harmonic lock
POST /live/gann-physics-full    # All three combined
GET  /live/gann-physics-status  # Module status
```

### v14.0 NOOSPHERE VELOCITY
```
POST /live/noosphere/insider-leak      # Silent spike detection
POST /live/noosphere/main-character    # Underdog energy
POST /live/noosphere/phantom-injury    # Hidden injury signal
POST /live/noosphere/full-analysis     # All three combined
GET  /live/noosphere/status            # Module status
```

### Esoteric Tools
```
POST /live/calculate-ciphers    # 6-cipher gematria
POST /live/date-numerology      # Date breakdown
POST /live/jersey-analysis      # Jersey number alignment
POST /live/check-trigger        # Jarvis trigger check
GET  /live/jarvis-triggers      # All trigger numbers
GET  /live/validate-immortal    # Validate 2178
```

---

## Core Frontend Components

### 1. Signal Engine (`signalEngine.js`)

The brain of the frontend. Aggregates signals into confidence score.

**Tier Classification:**
| Confidence | Tier | Recommendation |
|------------|------|----------------|
| 80%+ | GOLDEN_CONVERGENCE | SMASH |
| 70-79% | SUPER_SIGNAL | STRONG |
| 60-69% | HARMONIC_ALIGNMENT | PLAY |
| 55-59% | PARTIAL_ALIGNMENT | LEAN |
| <55% | - | PASS |

### 2. CLV Tracker (`clvTracker.js`)

Tracks Closing Line Value - the gold standard for measuring betting edge.

### 3. Kelly Calculator (`kellyCalculator.js`)

Optimal bet sizing using Kelly Criterion (default: Quarter Kelly).

### 4. Correlation Detector (`correlationDetector.js`)

Identifies portfolio risk from correlated picks.

### 5. Pick Explainer (`pickExplainer.js`)

Translates signals into plain English explanations.

---

## Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard | Home with stats, alerts |
| `/smash-spots` | SmashSpots | Today's picks |
| `/sharp` | SharpAlerts | Sharp money tracking |
| `/odds` | BestOdds | Odds comparison |
| `/injuries` | InjuryVacuum | Injury impact |
| `/performance` | PerformanceDashboard | Historical accuracy |
| `/clv` | CLVDashboard | CLV tracking |
| `/backtest` | BacktestDashboard | Signal validation |
| `/bankroll` | BankrollManager | Kelly sizing |
| `/esoteric` | Esoteric | Gematria/numerology |
| `/signals` | Signals | View all signals |
| `/grading` | Grading | Grade picks |
| `/profile` | Profile | User settings |
| `/admin` | AdminCockpit | Admin tools |

---

## File Structure

```
bookie-member-app/
├── App.jsx                    # Router + Navbar
├── api.js                     # Backend API client
├── Dashboard.jsx              # Home page
├── SmashSpots.jsx             # Main picks page
│
├── # Signal & Analysis
├── signalEngine.js            # Signal aggregation
├── clvTracker.js              # CLV tracking
├── kellyCalculator.js         # Kelly sizing
├── pickExplainer.js           # Plain English explanations
├── correlationDetector.js     # Portfolio correlation
├── backtestStorage.js         # Backtest data
│
├── # Dashboard Pages
├── CLVDashboard.jsx           # CLV UI
├── BacktestDashboard.jsx      # Backtest UI
├── BankrollManager.jsx        # Bankroll UI
├── PerformanceDashboard.jsx   # Historical accuracy
├── SharpAlerts.jsx            # Sharp money page
├── BestOdds.jsx               # Odds comparison
├── InjuryVacuum.jsx           # Injury analysis
├── ConsensusMeter.jsx         # Consensus visualization
├── DailySummary.jsx           # Daily recap
│
├── # Feature Pages
├── Esoteric.jsx               # Gematria/numerology
├── Signals.jsx                # Signal display
├── Grading.jsx                # Pick grading
├── Splits.jsx                 # Betting splits
├── Profile.jsx                # User profile
├── AdminCockpit.jsx           # Admin tools
│
├── # Supporting
├── HarmonicBadge.jsx          # Convergence badges
├── ComplianceFooter.jsx       # Legal disclaimer
├── SportTabs.jsx              # Sport selector
├── SystemHealthPanel.jsx      # Backend status
├── ValueWaterfall.jsx         # Value visualization
├── CommunityVote.jsx          # Man vs Machine voting
│
├── # Utilities
├── notifications.js           # Browser notifications
├── storageUtils.js            # localStorage helpers
│
├── # Config
├── index.html
├── index.css
├── main.jsx
├── package.json
├── vite.config.js
│
└── backend/                   # Python Backend (also in ai-betting-backend)
    ├── main.py                # FastAPI app
    ├── live_data_router.py    # 5,869 lines - ALL modules
    ├── requirements.txt       # Dependencies
    ├── Procfile               # Railway config
    └── runtime.txt            # Python version
```

---

## Repository Structure

| Repository | Purpose | Deployment |
|------------|---------|------------|
| `ai-betting-backend` | Production backend | Railway |
| `bookie-frontend` | Web UI | Vercel |
| `bookie-member-app` | Member app + backup backend | Vercel |

---

## Build Commands

```bash
# Frontend Development
npm run dev

# Frontend Production build
npm run build

# Backend Development (local)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Backend runs on Railway automatically
```

---

## Future Roadmap

1. **Real-time updates** - WebSocket for live odds
2. **Push notifications** - Service worker integration
3. **Discord Bot** - Daily Man vs Machine results
4. **Whop Integration** - User tracking with membership ID
5. **Vote History** - Track AI vs Community accuracy
6. **Mobile app** - React Native wrapper

---

*Last Updated: January 2026*
*Version: 14.0 NOOSPHERE VELOCITY*
*Total Esoteric Modules: 18*
