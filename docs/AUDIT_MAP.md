# AUDIT MAP (Frontend)

**AUTO-GENERATED from core/integration_contract.js - DO NOT EDIT MANUALLY**

Run: node scripts/generate_audit_map.mjs

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| VITE_API_BASE | https://web-production-7b2a.up.railway.app | Backend base URL |
| VITE_API_KEY | *(required)* | Backend API authentication |

## Backend Endpoints

| Key | Method | Path | Required |
|---|---|---|---|
| health | GET | /health | Yes |
| integrations | GET | /live/debug/integrations | Yes |
| scheduler | GET | /live/scheduler/status | Yes |
| best_bets_nba | GET | /live/best-bets/nba | Yes |
| best_bets_nhl | GET | /live/best-bets/nhl | No |
| best_bets_nfl | GET | /live/best-bets/nfl | No |
| best_bets_mlb | GET | /live/best-bets/mlb | No |
| grader_status | GET | /live/grader/status | Yes |
| storage_health | GET | /internal/storage/health | Yes |
