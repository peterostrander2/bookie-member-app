#!/bin/bash
# Dependency Vulnerability Scan - npm audit with detailed reporting
# Usage: ./scripts/dependency_vuln_scan.sh
# Cron: 0 10 * * 0 (weekly on Sunday at 10 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/vuln_scan.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "DEPENDENCY VULNERABILITY SCAN - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Run npm audit
echo "" >> "$LOG_FILE"
echo "[NPM AUDIT]" >> "$LOG_FILE"

if [ -f "package-lock.json" ]; then
    NPM_RESULT=$(npm audit --json 2>/dev/null || echo "{}")

    CRITICAL=$(echo "$NPM_RESULT" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).metadata?.vulnerabilities?.critical || 0" 2>/dev/null || echo "0")
    HIGH=$(echo "$NPM_RESULT" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).metadata?.vulnerabilities?.high || 0" 2>/dev/null || echo "0")
    MODERATE=$(echo "$NPM_RESULT" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).metadata?.vulnerabilities?.moderate || 0" 2>/dev/null || echo "0")
    LOW=$(echo "$NPM_RESULT" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).metadata?.vulnerabilities?.low || 0" 2>/dev/null || echo "0")

    echo "  Critical: $CRITICAL" >> "$LOG_FILE"
    echo "  High: $HIGH" >> "$LOG_FILE"
    echo "  Moderate: $MODERATE" >> "$LOG_FILE"
    echo "  Low: $LOW" >> "$LOG_FILE"

    if [ "$CRITICAL" -gt 0 ]; then
        echo "" >> "$LOG_FILE"
        echo "  🔴 CRITICAL vulnerabilities require immediate attention!" >> "$LOG_FILE"
        npm audit 2>/dev/null | grep -A5 "critical" | head -20 | sed 's/^/    /' >> "$LOG_FILE" || true
        ISSUES=$((ISSUES + CRITICAL))
    fi

    if [ "$HIGH" -gt 0 ]; then
        echo "" >> "$LOG_FILE"
        echo "  🟡 HIGH vulnerabilities should be addressed soon" >> "$LOG_FILE"
        ISSUES=$((ISSUES + HIGH))
    fi

    if [ "$CRITICAL" -eq 0 ] && [ "$HIGH" -eq 0 ]; then
        echo "" >> "$LOG_FILE"
        echo "  ✅ No critical or high vulnerabilities" >> "$LOG_FILE"
    fi
else
    echo "  ⚠️  No package-lock.json found" >> "$LOG_FILE"
fi

# Check for outdated packages
echo "" >> "$LOG_FILE"
echo "[OUTDATED PACKAGES]" >> "$LOG_FILE"
OUTDATED=$(npm outdated --json 2>/dev/null || echo "{}")
OUTDATED_COUNT=$(echo "$OUTDATED" | node -pe "Object.keys(JSON.parse(require('fs').readFileSync('/dev/stdin').toString())).length" 2>/dev/null || echo "0")
echo "  Packages with updates available: $OUTDATED_COUNT" >> "$LOG_FILE"

if [ "$OUTDATED_COUNT" -gt 0 ]; then
    echo "" >> "$LOG_FILE"
    echo "  Major updates available:" >> "$LOG_FILE"
    npm outdated 2>/dev/null | head -10 | sed 's/^/    /' >> "$LOG_FILE" || true
fi

# Check for known problematic packages
echo "" >> "$LOG_FILE"
echo "[PROBLEMATIC PACKAGES CHECK]" >> "$LOG_FILE"
RISKY_DEPS=("event-stream" "flatmap-stream" "left-pad" "is-promise")
for dep in "${RISKY_DEPS[@]}"; do
    if grep -q "\"$dep\"" package-lock.json 2>/dev/null; then
        echo "  ⚠️  Found potentially risky package: $dep" >> "$LOG_FILE"
    fi
done
echo "  ✅ No known problematic packages detected" >> "$LOG_FILE"

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "🔴 VULN SCAN: $ISSUES critical/high issues" >> "$LOG_FILE"
else
    echo "✅ VULN SCAN: No critical vulnerabilities" >> "$LOG_FILE"
fi
echo "============================================" >> "$LOG_FILE"

tail -35 "$LOG_FILE"

exit $((ISSUES > 0 ? 1 : 0))
