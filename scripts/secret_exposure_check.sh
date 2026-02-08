#!/bin/bash
# Secret Exposure Check - Find exposed secrets in frontend code
# Usage: ./scripts/secret_exposure_check.sh
# Cron: 15 9 * * 1 (weekly on Monday at 9:15 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/secret_exposure.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "SECRET EXPOSURE CHECK - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Check for hardcoded secrets in code
echo "" >> "$LOG_FILE"
echo "[HARDCODED SECRETS SCAN]" >> "$LOG_FILE"

# Patterns to search for
SECRET_PATTERNS=(
    "api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9]"
    "secret[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9]"
    "password\s*[:=]\s*['\"][^'\"]+['\"]"
    "token\s*[:=]\s*['\"][a-zA-Z0-9]"
    "Bearer\s+[a-zA-Z0-9._-]+"
    "sk_live_[a-zA-Z0-9]+"
    "pk_live_[a-zA-Z0-9]+"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -rniE "$pattern" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
              grep -v node_modules | grep -v ".env" | grep -v dist | head -5 || true)
    if [ -n "$MATCHES" ]; then
        echo "  ⚠️  Potential secret pattern: $pattern" >> "$LOG_FILE"
        echo "$MATCHES" | sed 's/^/    /' >> "$LOG_FILE"
        ISSUES=$((ISSUES + 1))
    fi
done

if [ "$ISSUES" -eq 0 ]; then
    echo "  ✅ No obvious hardcoded secrets found" >> "$LOG_FILE"
fi

# Check for exposed .env in git
echo "" >> "$LOG_FILE"
echo "[GIT EXPOSURE CHECK]" >> "$LOG_FILE"
if git ls-files | grep -qE "\.env$|\.env\.local$|\.env\.production$"; then
    echo "  🔴 Environment files tracked in git!" >> "$LOG_FILE"
    git ls-files | grep -E "\.env" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + 1))
else
    echo "  ✅ No .env files tracked in git" >> "$LOG_FILE"
fi

# Check .gitignore
echo "" >> "$LOG_FILE"
echo "[GITIGNORE CHECK]" >> "$LOG_FILE"
SHOULD_IGNORE=(".env" ".env.local" ".env.production" "*.pem" "*.key")
for pattern in "${SHOULD_IGNORE[@]}"; do
    if grep -q "$pattern" .gitignore 2>/dev/null; then
        echo "  ✅ $pattern in .gitignore" >> "$LOG_FILE"
    else
        echo "  ⚠️  $pattern NOT in .gitignore" >> "$LOG_FILE"
    fi
done

# Check for secrets in dist (production bundle)
echo "" >> "$LOG_FILE"
echo "[PRODUCTION BUNDLE CHECK]" >> "$LOG_FILE"
if [ -d "dist" ]; then
    BUNDLE_SECRETS=$(grep -rniE "api[_-]?key|secret|password|token" dist/*.js 2>/dev/null | \
                     grep -v "process.env" | head -5 || true)
    if [ -n "$BUNDLE_SECRETS" ]; then
        echo "  ⚠️  Potential secrets in production bundle:" >> "$LOG_FILE"
        echo "$BUNDLE_SECRETS" | sed 's/^/    /' >> "$LOG_FILE"
        ISSUES=$((ISSUES + 1))
    else
        echo "  ✅ No obvious secrets in production bundle" >> "$LOG_FILE"
    fi
else
    echo "  No dist directory to check" >> "$LOG_FILE"
fi

# Check for console.log with sensitive data
echo "" >> "$LOG_FILE"
echo "[CONSOLE LOGGING CHECK]" >> "$LOG_FILE"
SENSITIVE_LOGS=$(grep -rniE "console\.(log|info|debug).*\b(password|secret|token|key|auth)\b" \
                 --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
                 grep -v node_modules | grep -v dist | head -5 || true)
if [ -n "$SENSITIVE_LOGS" ]; then
    echo "  ⚠️  Console logs with sensitive keywords:" >> "$LOG_FILE"
    echo "$SENSITIVE_LOGS" | sed 's/^/    /' >> "$LOG_FILE"
else
    echo "  ✅ No sensitive data in console logs" >> "$LOG_FILE"
fi

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️  SECRET CHECK: $ISSUES potential exposures found" >> "$LOG_FILE"
else
    echo "✅ SECRET CHECK: No exposures detected" >> "$LOG_FILE"
fi
echo "============================================" >> "$LOG_FILE"

tail -40 "$LOG_FILE"

exit $ISSUES
