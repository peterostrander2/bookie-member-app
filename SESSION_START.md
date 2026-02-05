# Frontend Session Start

If you are opening a new session, read these in order:

1) `docs/MASTER_INDEX.md` (system map + decision tree)
2) `docs/LESSONS.md` (mistakes we've made — skim to avoid repeating)
3) `core/frontend_scoring_contract.js` (single source of tier/threshold truth)
4) `lib/api/client.js` (single API client and auth rules)

## Fast checks (run first thing)

```bash
node scripts/validate_frontend_contracts.mjs
node scripts/validate_no_frontend_literals.mjs
node scripts/validate_no_eval.mjs
```

## Install pre-commit hook (if not installed)

```bash
bash scripts/install_git_hooks.sh
```

## Session Hygiene (Prevent Context Limits)

**Commit frequently to avoid hitting Claude Code context limits:**
```bash
# Every 30-60 minutes during long sessions
./scripts/checkpoint_commit.sh
```

When you see "Conversation compacted" warnings, checkpoint immediately.

See `docs/SESSION_HYGIENE.md` for full guide.

## Critical Rules

- Never use `fetch` directly outside `lib/api/client.js`.
- Never hardcode tier/threshold literals — even in comments. Import from `core/frontend_scoring_contract.js`.
- When wiring new backend fields: update `normalizePick()` in `api.js` FIRST.
- Always update BOTH `GameSmashList.jsx` AND `PropsSmashList.jsx` symmetrically.
- Run all 3 validators before every commit.

## Common tasks

- Fix API errors: ensure `VITE_API_BASE_URL` + `VITE_BOOKIE_API_KEY` are set.
- Missing data in UI? Check `normalizePick()` in `api.js` passes the field through.
- Contract drift? Run validators and fix violations.
- See `docs/RECOVERY.md` for full troubleshooting guide.
