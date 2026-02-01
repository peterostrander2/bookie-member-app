# MASTER INDEX — START HERE (Frontend)

Quick entry points:
- `SESSION_START.md` (new session checklist)
- `docs/RECOVERY.md` (what to do if things break)

**Single entry point for all frontend code and documentation changes.**

Before touching code or docs: use this file to route yourself to the canonical source. Goal: **zero drift between frontend ↔ backend**.

---

## Non-Negotiable Workflow

1) **Classify the change** using Decision Tree below
2) **Edit canonical contract** (core/*_contract.js) — not random components
3) **Run validators** (scripts/ci_sanity_check_frontend.sh)
4) **Update dependent docs** (only what validators require)
5) **Commit code + docs together**
6) **Verify Vercel deployment**

---

## Decision Tree — Where to Look and What to Edit

### A) Tier System / Score Display
**Examples:** Tier colors, threshold displays, TITANIUM/GOLD_STAR labels

**Canonical source (edit here only):**
- `core/frontend_scoring_contract.js`

**Where implementation lives (should import from contract):**
- `signalEngine.js` - Client-side calculations
- Any component displaying tiers/scores

**Backend contract (MUST match):**
- Backend: `~/Desktop/ai-betting-backend-main/core/scoring_contract.py`

**Never do:**
- Hardcode `6.5`, `7.5`, `8.0`, `6.8`, `5.5` anywhere except contract
- Hardcode `"TITANIUM"`, `"GOLD_STAR"`, `"EDGE_LEAN"` strings
- Use different tier colors than contract
- Recalculate tiers on client (trust backend final_score)

---

### B) Backend API Integration
**Examples:** Endpoint URLs, API key handling, response parsing

**Canonical sources:**
- `core/integration_contract.js` - Endpoint definitions, env vars, base URL
- `lib/api/client.js` - Centralized fetch helpers (ALL requests go through here)
- `api.js` - API method implementations (imports from client)

**Never do:**
- Call `fetch`/`axios`/`new Request` outside `lib/api/client.js`
- Hardcode backend URL anywhere (must come from contract via client)
- Import fetch helpers from anywhere except `lib/api/client.js`
- Duplicate endpoint logic across files

---

## Canonical Sources — Quick Table

| Topic | Canonical File(s) | What It Defines |
|---|---|---|
| Scoring/Tiers | `core/frontend_scoring_contract.js` | Thresholds, tier names, colors |
| API Config | `core/integration_contract.js` | Base URL, env vars, endpoints |
| API Client | `lib/api/client.js` | Centralized fetch, auth headers |
| API Methods | `api.js` | All endpoint implementations |
| Components | `App.jsx` | Routing, lazy loading |
| Signals | `signalEngine.js` | Client calculations |
| Storage | `storageUtils.js` | localStorage keys |

---

## Validators — What to Run

```bash
# Run all validators (combined)
node scripts/validate_frontend_contracts.mjs

# Or run CI sanity check (includes all validators)
./scripts/ci_sanity_check_frontend.sh

# Individual validators
node scripts/validate_integration_contract.mjs
node scripts/validate_no_frontend_literals.mjs
node scripts/generate_audit_map.mjs

# Tests
npm test
```

---

## Hard Bans

- ❌ Hardcode tier thresholds (6.5, 7.5, 8.0) anywhere except contract
- ❌ Hardcode tier names ("TITANIUM", "GOLD_STAR") anywhere except contract
- ❌ Call `fetch`/`axios`/`new Request` outside `lib/api/client.js`
- ❌ Access `import.meta.env` directly in components
- ❌ Recalculate tiers on client (trust backend)
- ❌ Edit generated files (`docs/AUDIT_MAP.md`)

---

## Backend Integration

**Backend Repo:** `~/Desktop/ai-betting-backend-main`  
**Backend URL:** `https://web-production-7b2a.up.railway.app`  
**Env vars (frontend):** `VITE_API_BASE_URL`, `VITE_BOOKIE_API_KEY`  

**Frontend MUST match backend:**
1. **Tiers:** TITANIUM (≥8.0, 3/4 rule), GOLD_STAR (≥7.5, gates), EDGE_LEAN (≥6.5)
2. **Never show picks:** with final_score < 6.5
3. **Engine scores:** ai_score, research_score, esoteric_score, jarvis_score

---

## Golden Command Sequence

```bash
./scripts/ci_sanity_check_frontend.sh
npm test
npm run build
git add -A && git commit -m "feat: ... + docs: ..."
git push origin main
```
