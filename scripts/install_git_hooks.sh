#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR=".git/hooks"
mkdir -p "$HOOK_DIR"

cat > "$HOOK_DIR/pre-commit" << 'PREHOOK'
#!/usr/bin/env bash
set -euo pipefail
echo "🔒 Pre-commit: Frontend anti-drift checks"
./scripts/ci_sanity_check_frontend.sh
PREHOOK

chmod +x "$HOOK_DIR/pre-commit"
echo "✅ Installed .git/hooks/pre-commit"
