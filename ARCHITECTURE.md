# Bookie-o-em Architecture Documentation

## System Overview

Bookie-o-em is an AI-powered sports betting analysis platform that combines machine learning signals, professional bettor tracking, and esoteric indicators to generate high-conviction betting recommendations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Backend** | FastAPI (Python) |
| **Hosting** | Vercel (Frontend) + Railway (Backend) |
| **Data APIs** | The Odds API, Playbook API |
| **Auth** | Whop (Membership) |
| **Storage** | localStorage (Client), Railway DB (Server) |

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
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │    │  │
│  │  │  │ pickExplainer│ │ correlation  │ │ backtest  │  │    │  │
│  │  │  │ .js          │ │ Detector.js  │ │ Storage.js│  │    │  │
│  │  │  └──────────────┘ └──────────────┘ └───────────┘  │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                               │ api.js                           │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   BACKEND (FastAPI)    │
                    │  ┌─────────────────┐  │
                    │  │ /live/slate     │  │
                    │  │ /splits/{sport} │  │
                    │  │ /injuries       │  │
                    │  │ /sharp-money    │  │
                    │  │ /esoteric       │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
     ┌────────┴────────┐ ┌─────┴─────┐ ┌─────────┴─────────┐
     │  The Odds API   │ │ Playbook  │ │ Internal Models   │
     │  (Live Odds)    │ │   API     │ │ (ML/Esoteric)     │
     └─────────────────┘ └───────────┘ └───────────────────┘
```

---

## Core Components

### 1. Signal Engine (`signalEngine.js`)

The brain of the system. Aggregates 17 signals into a single confidence score.

```javascript
// Signal Categories
DATA SIGNALS (Highest Impact):
├── sharp_money (18)    // Professional bettor action
├── line_value (15)     // Best odds vs market
├── ml_value (14)       // Moneyline discrepancies
└── market_lean (13)    // Juice/vig analysis

ML/AI SIGNALS:
├── key_spread (12)     // Key numbers (3, 7 in NFL)
├── kelly_edge (12)     // Calculated edge metric
├── ensemble (10)       // XGBoost + LightGBM + RF
├── lstm_brain (10)     // Neural network trends
├── injury_impact (10)  // Usage vacuum calculation
├── rest_fatigue (8)    // Schedule/travel
├── public_fade (8)     // Fade public money
└── key_number (6)      // Live odds key levels

ESOTERIC SIGNALS:
├── numerology (4)      // Life path numbers
├── moon_phase (3)      // Lunar cycle impact
├── gematria (3)        // Team name numerology
├── sacred_geometry (2) // Tesla 3-6-9, Fibonacci
└── zodiac (2)          // Astrological elements
```

**Sport Modifiers:**
```javascript
NFL: key_spread × 1.5, sharp_money × 1.2
NBA: rest_fatigue × 1.4, injury_impact × 1.3
MLB: sharp_money × 1.3
NCAAB: public_fade × 1.5
```

**Tier Classification:**
| Confidence | Tier | Expected WR |
|------------|------|-------------|
| 80%+ | GOLDEN_CONVERGENCE | 62-65% |
| 70-79% | SUPER_SIGNAL | 58-62% |
| 60-69% | HARMONIC_ALIGNMENT | 55-58% |
| <60% | PARTIAL_ALIGNMENT | 52-55% |

---

### 2. CLV Tracker (`clvTracker.js`)

Tracks Closing Line Value - the gold standard for measuring betting edge.

```
Flow:
1. recordPick() → Saves opening line when pick is made
2. recordClosingLine() → Saves closing line at game start
3. gradePick() → Records win/loss result
4. getStats() → Calculates CLV metrics by tier/sport

Storage: localStorage (bookie_clv_picks)
```

**Why CLV Matters:**
- Beating closing lines = long-term profitability
- Even losing bets with positive CLV indicate edge
- Tracks if you're getting good numbers

---

### 3. Kelly Calculator (`kellyCalculator.js`)

Optimal bet sizing using Kelly Criterion.

```
Formula: f* = (bp - q) / b
  Where:
  - f* = fraction of bankroll to bet
  - b = net odds (decimal - 1)
  - p = probability of winning
  - q = probability of losing

Default: Quarter Kelly (0.25) for safety
```

**Risk Metrics:**
- Risk of Ruin calculation
- Monte Carlo simulation
- Bet history tracking

---

### 4. Correlation Detector (`correlationDetector.js`)

Identifies portfolio risk from correlated picks.

```
Correlation Types:
├── Same Game (30 points) - Multiple bets on one game
├── Same Team (20 points) - Team appears in multiple bets
├── Directional Bias (15-25 points) - All favorites/underdogs
├── Spread Clustering (15 points) - Similar spread sizes
└── Total Clustering (15 points) - Similar totals

Diversification Score: 100 - correlation_points
- 80-100: Good
- 60-79: Caution
- 40-59: Warning
- 0-39: Danger
```

---

### 5. Pick Explainer (`pickExplainer.js`)

Translates signals into plain English.

```
Output:
├── headline: "🔥 SMASH 85%: Multiple edges converging"
├── summary: Plain English explanation
├── bullets: Key factors with levels (high/medium/low)
├── risks: Potential concerns
└── confidenceBreakdown: {data, ml, esoteric}
```

---

### 6. Consensus Meter (`ConsensusMeter.jsx`)

Visual indicator of signal alignment.

```
Triple Alignment (🎯): ML + Sharp + Esoteric all agree
Double Alignment (⚡): 2 of 3 categories agree
Single Signal (📊): Only 1 category strong
No Alignment (⚠️): Mixed signals
```

---

## Data Flow

### Pick Generation Flow

```
1. User selects sport
2. SmashSpots calls api.getSmashSpots(sport)
3. Backend fetches from Odds API + internal models
4. Frontend receives game data
5. signalEngine.calculateConfidence() processes each game
6. Games filtered by confidence >= 55%
7. Sorted by confidence descending
8. Displayed with tier badges, signals, explanations
```

### Pick Tracking Flow

```
1. User clicks "Track" button
2. recordPick() saves to localStorage with:
   - Opening line, odds, book
   - Confidence, tier, signals
   - Timestamp
3. At game start: recordClosingLine()
4. After game: gradePick() with WIN/LOSS/PUSH
5. CLV calculated: closing_implied - opening_implied
6. Stats aggregated by tier, sport, signal
```

---

## Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard | Home with stats, alerts, quick links |
| `/smash-spots` | SmashSpots | Today's picks with full analysis |
| `/sharp` | SharpAlerts | Sharp money tracking |
| `/odds` | BestOdds | Odds comparison across books |
| `/injuries` | InjuryVacuum | Injury impact analysis |
| `/performance` | PerformanceDashboard | Historical accuracy |
| `/consensus` | ConsensusMeterPage | Signal alignment info |
| `/summary` | DailySummary | End-of-day recap |
| `/clv` | CLVDashboard | CLV tracking |
| `/backtest` | BacktestDashboard | Signal validation |
| `/bankroll` | BankrollManager | Kelly sizing |
| `/esoteric` | Esoteric | Gematria/numerology tools |
| `/signals` | Signals | View all 17 signals |
| `/grading` | Grading | Grade picks |
| `/profile` | Profile | User settings |
| `/admin` | AdminCockpit | Admin tools |

---

## Storage Schema

### localStorage Keys

```javascript
// CLV Tracker
bookie_clv_picks: [
  {
    id: "pick_1704067200000_abc123",
    sport: "NBA",
    home_team: "Lakers",
    away_team: "Celtics",
    side: "HOME",
    bet_type: "spread",
    opening_line: -3.5,
    opening_odds: -110,
    closing_line: -4.5,
    confidence: 78,
    tier: "SUPER_SIGNAL",
    result: "WIN",
    clv: 1.2,
    timestamp: 1704067200000
  }
]

// Backtest Storage
bookie_backtest_predictions: [
  {
    id: "pred_...",
    gameId: "...",
    signals: { sharp_money: 85, line_value: 72, ... },
    prediction: "HOME",
    confidence: 78,
    result: "WIN"
  }
]

// Bankroll
bookie_bankroll_settings: {
  bankroll: 10000,
  kellyFraction: 0.25,
  maxBetPercent: 5
}

bookie_bet_history: [
  {
    id: "bet_...",
    amount: 250,
    odds: -110,
    result: "WIN",
    pnl: 227.27
  }
]

// Notifications
bookie_notification_settings: {
  enabled: true,
  goldenPicks: true,
  sharpAlerts: true,
  lineMoves: false,
  gameStarts: false,
  results: true
}
```

---

## API Endpoints (Backend)

```
GET /health
GET /live/slate/{sport}
GET /splits/{sport}
GET /injuries/{sport}
GET /sharp-money/{sport}
GET /esoteric/today-energy
GET /esoteric/analyze
GET /grader/weights
POST /grader/grade
```

---

## Error Handling Strategy

```javascript
// API calls: Graceful degradation
api.getSplits(sport).catch(() => null)

// localStorage: Try/catch with fallbacks
try {
  localStorage.setItem(key, value);
} catch (e) {
  console.error('Storage error:', e);
}

// Signal calculations: Safe defaults
if (!game) return { confidence: 50, tier: 'PARTIAL_ALIGNMENT' }
```

---

## Performance Considerations

1. **Parallel API calls** - fetchSignalContext uses Promise.all
2. **Memoization** - Use React.useMemo for expensive calculations
3. **localStorage limits** - Trim old data (1000 predictions max)
4. **Lazy loading** - Routes load on demand

---

## Security Notes

1. **No secrets in frontend** - API keys on backend only
2. **Input validation** - All user inputs validated
3. **XSS prevention** - React escapes by default
4. **No raw localStorage access in UI** - Always through utility functions

---

## Future Considerations

1. **Real-time updates** - WebSocket for live odds
2. **Push notifications** - Service worker integration
3. **Mobile app** - React Native wrapper
4. **User accounts** - Sync picks across devices
5. **Backtesting engine** - Historical simulation
6. **Export/Import** - Backup and restore pick history

---

## File Structure

```
bookie-member-app/
├── App.jsx                    # Router + Navbar
├── api.js                     # Backend API client
├── Dashboard.jsx              # Home page
├── SmashSpots.jsx             # Main picks page
│
├── # Phase 1: Foundation
├── signalEngine.js            # Signal aggregation
├── clvTracker.js              # CLV tracking
├── CLVDashboard.jsx           # CLV UI
├── backtestStorage.js         # Backtest data
├── BacktestDashboard.jsx      # Backtest UI
├── kellyCalculator.js         # Kelly sizing
├── BankrollManager.jsx        # Bankroll UI
│
├── # Phase 2: Signal Enhancement
├── SharpAlerts.jsx            # Sharp money page
├── BestOdds.jsx               # Odds comparison
├── InjuryVacuum.jsx           # Injury analysis
├── HarmonicBadge.jsx          # Convergence badges
│
├── # Phase 3: Intelligence
├── pickExplainer.js           # Plain English explanations
├── correlationDetector.js     # Portfolio correlation
├── PerformanceDashboard.jsx   # Historical accuracy
│
├── # Phase 4: Integration
├── ConsensusMeter.jsx         # Consensus visualization
├── DailySummary.jsx           # Daily recap
├── notifications.js           # Browser notifications
│
├── # Supporting
├── Esoteric.jsx               # Gematria/numerology
├── Signals.jsx                # Signal display
├── Grading.jsx                # Pick grading
├── Splits.jsx                 # Betting splits
├── Profile.jsx                # User profile
├── AdminCockpit.jsx           # Admin tools
└── ComplianceFooter.jsx       # Legal disclaimer
```

---

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

---

*Last Updated: January 2026*
*Version: 1.0 (Phase 1-4 Complete)*
