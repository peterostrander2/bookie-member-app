# Weekly Maintenance Checklist

## Overview
Follow this schedule to keep the bookie-member-app codebase clean and healthy.

---

## Monday: Health Check

- [ ] Run daily health check
  ```bash
  ./scripts/daily_health_check.sh
  ```
- [ ] Review any issues flagged
- [ ] Check for new TODOs added last week
- [ ] Verify all tests pass
  ```bash
  npm test
  ```

---

## Tuesday: Cleanup

- [ ] Run auto cleanup (dry run first)
  ```bash
  ./scripts/auto_cleanup.sh --dry-run
  ./scripts/auto_cleanup.sh
  ```
- [ ] Review large components (>50KB)
- [ ] Remove unused console.log statements
- [ ] Clean up any temporary branches
  ```bash
  git branch --merged | grep -v main | xargs -r git branch -d
  ```

---

## Wednesday: Dependencies

- [ ] Check for outdated packages
  ```bash
  npm outdated
  ```
- [ ] Check for security vulnerabilities
  ```bash
  npm audit
  ```
- [ ] Update minor versions if safe
  ```bash
  npm update
  ```
- [ ] Review package.json for unused deps

---

## Thursday: Tests

- [ ] Run full test suite
  ```bash
  npm test
  ```
- [ ] Run e2e tests
  ```bash
  npx playwright test
  ```
- [ ] Check test coverage
- [ ] Add tests for new components from this week

---

## Friday: Documentation Review

- [ ] Update CLAUDE.md if architecture changed
- [ ] Review and update README.md
- [ ] Check that API contracts match implementation
  ```bash
  node scripts/validate_integration_contract.mjs
  ```
- [ ] Update PROJECT_MAP.md
  ```bash
  ./scripts/generate_project_map.sh
  ```

---

## Quick Reference

### Daily (2 min)
```bash
cd ~/bookie-member-app
./scripts/daily_health_check.sh
```

### Before Each Commit
```bash
npm test
./scripts/ci_sanity_check_frontend.sh
```

### Before Deploy
```bash
npm run build
./scripts/final_audit.sh
```

---

## Automation

These tasks are already automated:
- Pre-commit hooks: `./scripts/install_git_hooks.sh`
- CI sanity: Runs on every push
- Contract validation: `./scripts/validate_integration_contract.mjs`

To enable pre-commit hooks:
```bash
./scripts/install_git_hooks.sh
```

---

## Issue Triage

If health check finds issues:

| Issue Type | Action |
|------------|--------|
| Large components (>50KB) | Split into smaller components |
| Too many console.logs | Remove or use proper logging |
| Outdated dependencies | Update with `npm update` |
| Failing tests | Fix before merging |
| Build errors | Check imports and syntax |

---

Last updated: February 2025
