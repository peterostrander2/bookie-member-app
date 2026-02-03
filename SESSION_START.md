# Frontend Session Start

If you are opening a new session, read these in order:

1) `docs/MASTER_INDEX.md` (system map)
2) `core/frontend_scoring_contract.js` (single source of tier/threshold truth)
3) `lib/api/client.js` (single API client and auth rules)
4) `scripts/validate_frontend_contracts.mjs` (anti-drift enforcement)

## Fast checks

```bash
node scripts/validate_frontend_contracts.mjs
node scripts/validate_no_frontend_literals.mjs
node scripts/validate_no_eval.mjs
```

## Session Hygiene (Prevent Context Limits)

**Commit frequently to avoid hitting Claude Code context limits:**
```bash
# Every 30-60 minutes during long sessions
./scripts/checkpoint_commit.sh
```

When you see "Conversation compacted" warnings, checkpoint immediately.

See `docs/SESSION_HYGIENE.md` for full guide.

## Common tasks

- Fix API errors: ensure `VITE_API_BASE_URL` + `VITE_BOOKIE_API_KEY` are set.
- Never use `fetch` directly outside `lib/api/client.js`.
- Never hardcode tier/threshold literals; import from `core/frontend_scoring_contract.js`.
