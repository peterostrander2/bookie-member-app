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

### Creating PRs Manually
Since `gh` CLI may not be available, create PRs directly via:
```
https://github.com/peterostrander2/bookie-member-app/pull/new/{branch-name}
```

### Branch Naming
Claude branches follow pattern: `claude/{feature-name}-{sessionId}`
