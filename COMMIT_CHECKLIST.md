# COMMIT CHECKLIST

**Use this checklist before every commit to prevent drift.**

---

## Pre-Commit Checklist

### 1. Code + Docs Together
- [ ] If you changed scoring logic → update `core/frontend_scoring_contract.js`
- [ ] If you changed API integration → update `core/integration_contract.js`
- [ ] If you changed env vars → update `.env.example` + `docs/MASTER_INDEX.md`
- [ ] If you added/changed endpoints → regenerate `docs/AUDIT_MAP.md`
- [ ] Code and docs committed in the **same commit**

### 2. Run Validators
```bash
# Combined validator (checks all contracts)
node scripts/validate_frontend_contracts.mjs

# Full CI sanity check
./scripts/ci_sanity_check_frontend.sh
```
- [ ] All validators pass (exit code 0)

### 3. Run Unit Tests
```bash
npm run test:run
```
- [ ] All 210 unit tests pass

### 4. Build Check
```bash
npm run build
```
- [ ] Build succeeds without errors

### 5. E2E Tests (if UI changed)
```bash
npm run test:e2e
```
- [ ] All ~150 E2E tests pass (requires dev server on :5173)
- [ ] E2E fixture check: `grep -rn "from '@playwright/test'" e2e/*.spec.js` returns EMPTY

### 6. Commit
```bash
git add -A
git commit -m "type: description

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## What NOT to Do

- ❌ Commit code without running validators
- ❌ Update docs without updating code (or vice versa)
- ❌ Hardcode tier thresholds (use `core/frontend_scoring_contract.js`)
- ❌ Hardcode API URLs (use `lib/api/client.js`)
- ❌ Call `fetch`/`axios`/`new Request` outside `lib/api/client.js`
- ❌ Edit generated files manually (`docs/AUDIT_MAP.md`)
- ❌ Import `@playwright/test` directly in E2E specs (use `./fixtures`)
- ❌ Add localStorage-gated UI without updating `e2e/fixtures.js`
- ❌ Use `waitForLoadState('networkidle')` on pages with API polling
- ❌ Ship new core logic modules without unit tests
- ❌ Add new routes without E2E smoke tests
- ❌ Hardcode enum validation arrays — always check for backend enum expansion

---

## Quick Commands

```bash
# Validate everything (unit tests + build)
node scripts/validate_frontend_contracts.mjs && npm run test:run && npm run build

# Full CI check
./scripts/ci_sanity_check_frontend.sh

# E2E tests (requires dev server on :5173)
npm run test:e2e

# E2E fixture integrity
grep -rn "from '@playwright/test'" e2e/*.spec.js  # Should return EMPTY

# Regenerate audit map after endpoint changes
node scripts/generate_audit_map.mjs
```

---

## Commit Message Format

```
type: short description

- Detail 1
- Detail 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
