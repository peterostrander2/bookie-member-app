#!/usr/bin/env bash
set -euo pipefail

OUTPUT="docs/PROJECT_MAP.md"
mkdir -p docs

cat > "$OUTPUT" << 'HEADER'
# PROJECT MAP

**AUTO-GENERATED** - Run `./scripts/generate_project_map.sh` to regenerate.

## Core Contracts (Single Sources of Truth)

| Contract | What It Defines |
|----------|-----------------|
| `core/frontend_scoring_contract.js` | Tier thresholds, colors (matches backend) |
| `core/integration_contract.js` | Backend API endpoints, env vars |
| `lib/api/client.js` | Centralized API client (all backend calls) |

## Key Directories

- `core/` - Canonical contracts
- `lib/` - Shared utilities (API client, helpers)
- `docs/` - Documentation (MASTER_INDEX, AUDIT_MAP, etc.)
- `scripts/` - Validators, CI checks, generators
- `tasks/` - lessons.md (self-improvement), todo.md (planning)

## Entry Points

1. **New sessions:** Read `SESSION_START.md`
2. **Making changes:** Read `docs/MASTER_INDEX.md` → route to canonical file
3. **When things break:** Read `docs/RECOVERY.md`
4. **Before committing:** Follow `COMMIT_CHECKLIST.md`
5. **After user corrections:** Update `tasks/lessons.md`
HEADER

echo "✅ Generated $OUTPUT"
