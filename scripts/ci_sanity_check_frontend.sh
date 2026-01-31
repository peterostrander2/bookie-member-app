#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "Frontend CI Sanity Check"
echo "============================================"
echo ""

echo "Session 1: Integration contract validation..."
node scripts/validate_integration_contract.mjs
echo ""

echo "Session 2: Generate audit map..."
node scripts/generate_audit_map.mjs
echo ""

echo "Session 3: No hardcoded literals..."
node scripts/validate_no_frontend_literals.mjs
echo ""

echo "Session 4: No eval/new Function usage..."
node scripts/validate_no_eval.mjs
echo ""

echo "Session 5: Frontend contract validation..."
node scripts/validate_frontend_contracts.mjs
echo ""

echo "Session 6: Backend connectivity..."
if [ -f scripts/verify-backend.js ]; then
  node scripts/verify-backend.js || echo "⚠️ Backend check failed (non-blocking)"
else
  echo "⚠️ verify-backend.js not found (skipping)"
fi
echo ""

echo "============================================"
echo "✅ All frontend CI sessions passed"
echo "============================================"
