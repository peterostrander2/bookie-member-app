# COMMIT CHECKLIST

**Use this checklist before every commit to prevent drift.**

---

## Pre-Commit Checklist

### 1. Code + Docs Together
- [ ] If you changed scoring logic → update `core/frontend_scoring_contract.js`
- [ ] If you changed API integration → update `core/integration_contract.js`
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

### 3. Run Tests
```bash
npm test
```
- [ ] All tests pass

### 4. Build Check
```bash
npm run build
```
- [ ] Build succeeds without errors

### 5. Commit
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
- ❌ Add API calls outside `api.js`
- ❌ Edit generated files manually (`docs/AUDIT_MAP.md`)

---

## Quick Commands

```bash
# Validate everything
node scripts/validate_frontend_contracts.mjs && npm test && npm run build

# Full CI check
./scripts/ci_sanity_check_frontend.sh

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
