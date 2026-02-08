#!/bin/bash
# Console Log Scan - Find stray console.log statements
# Usage: ./scripts/console_log_scan.sh
# Cron: 0 6 * * * (daily at 6 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/console_scan.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "CONSOLE LOG SCAN - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Find console.log statements
echo "" >> "$LOG_FILE"
echo "[CONSOLE.LOG STATEMENTS]" >> "$LOG_FILE"

CONSOLE_LOGS=$(grep -rn "console\.log" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
               grep -v "// eslint-disable" | grep -v node_modules | head -20 || true)

if [ -n "$CONSOLE_LOGS" ]; then
    COUNT=$(echo "$CONSOLE_LOGS" | wc -l | tr -d ' ')
    echo "  ⚠️  Found $COUNT console.log statements:" >> "$LOG_FILE"
    echo "$CONSOLE_LOGS" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT))
else
    echo "  ✅ No console.log statements found" >> "$LOG_FILE"
fi

# Find console.error (these might be intentional)
echo "" >> "$LOG_FILE"
echo "[CONSOLE.ERROR STATEMENTS]" >> "$LOG_FILE"

CONSOLE_ERRORS=$(grep -rn "console\.error" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
                 grep -v node_modules | head -10 || true)

if [ -n "$CONSOLE_ERRORS" ]; then
    COUNT=$(echo "$CONSOLE_ERRORS" | wc -l | tr -d ' ')
    echo "  Found $COUNT console.error statements (may be intentional):" >> "$LOG_FILE"
    echo "$CONSOLE_ERRORS" | sed 's/^/    /' >> "$LOG_FILE"
else
    echo "  ✅ No console.error statements found" >> "$LOG_FILE"
fi

# Find console.warn
echo "" >> "$LOG_FILE"
echo "[CONSOLE.WARN STATEMENTS]" >> "$LOG_FILE"

CONSOLE_WARNS=$(grep -rn "console\.warn" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
                grep -v node_modules | head -10 || true)

if [ -n "$CONSOLE_WARNS" ]; then
    COUNT=$(echo "$CONSOLE_WARNS" | wc -l | tr -d ' ')
    echo "  Found $COUNT console.warn statements:" >> "$LOG_FILE"
    echo "$CONSOLE_WARNS" | sed 's/^/    /' >> "$LOG_FILE"
else
    echo "  ✅ No console.warn statements found" >> "$LOG_FILE"
fi

# Find debugger statements
echo "" >> "$LOG_FILE"
echo "[DEBUGGER STATEMENTS]" >> "$LOG_FILE"

DEBUGGERS=$(grep -rn "^\s*debugger" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
            grep -v node_modules || true)

if [ -n "$DEBUGGERS" ]; then
    COUNT=$(echo "$DEBUGGERS" | wc -l | tr -d ' ')
    echo "  🔴 Found $COUNT debugger statements (REMOVE BEFORE DEPLOY):" >> "$LOG_FILE"
    echo "$DEBUGGERS" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT * 2))  # Weight debugger more heavily
else
    echo "  ✅ No debugger statements found" >> "$LOG_FILE"
fi

# Find alert() calls
echo "" >> "$LOG_FILE"
echo "[ALERT STATEMENTS]" >> "$LOG_FILE"

ALERTS=$(grep -rn "\balert(" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
         grep -v node_modules | head -5 || true)

if [ -n "$ALERTS" ]; then
    COUNT=$(echo "$ALERTS" | wc -l | tr -d ' ')
    echo "  ⚠️  Found $COUNT alert() calls:" >> "$LOG_FILE"
    echo "$ALERTS" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT))
else
    echo "  ✅ No alert() calls found" >> "$LOG_FILE"
fi

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️  CONSOLE SCAN: $ISSUES items to review" >> "$LOG_FILE"
else
    echo "✅ CONSOLE SCAN: Code is clean" >> "$LOG_FILE"
fi
echo "============================================" >> "$LOG_FILE"

tail -40 "$LOG_FILE"

exit $((ISSUES > 5 ? 1 : 0))
