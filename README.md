# Bookie Member App (Frontend)

Start here:
- `SESSION_START.md`
- `docs/MASTER_INDEX.md`

## Quick start

```bash
npm install
npm run dev
```

Required environment variables:
- `VITE_API_BASE_URL`
- `VITE_BOOKIE_API_KEY`

## Validation / CI sanity

```bash
node scripts/validate_no_frontend_literals.mjs
node scripts/validate_frontend_contracts.mjs
node scripts/validate_no_eval.mjs
./scripts/ci_sanity_check_frontend.sh
```

## Preview (production build)

```bash
npm run build
npm run preview -- --port 4173
```
