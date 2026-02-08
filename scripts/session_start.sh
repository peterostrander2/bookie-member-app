#!/bin/bash
# Session Start Script - Run this when you begin working
# Usage: ./scripts/session_start.sh

cd "$(dirname "$0")/.."

echo "============================================"
echo "SESSION START - bookie-member-app"
echo "============================================"
echo "Time: $(date)"
echo ""

# 1. Git status
echo "[GIT STATUS]"
BRANCH=$(git branch --show-current)
echo "Branch: $BRANCH"

UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "⚠️  Uncommitted changes: $UNCOMMITTED files"
    git status --porcelain | head -5
    [ "$UNCOMMITTED" -gt 5 ] && echo "   ... and $((UNCOMMITTED - 5)) more"
else
    echo "✅ Working tree clean"
fi

LAST_COMMIT=$(git log -1 --format="%ar - %s" 2>/dev/null)
echo "Last commit: $LAST_COMMIT"
echo ""

# 2. Check recent health logs
echo "[HEALTH STATUS]"
if [ -f "logs/health_check.log" ]; then
    LAST_HEALTH=$(tail -1 logs/health_check.log 2>/dev/null | grep -o "Status:.*\|Issues found:.*" | head -1)
    HEALTH_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" logs/health_check.log 2>/dev/null)
    echo "Last health check: $HEALTH_TIME"
    echo "Result: ${LAST_HEALTH:-Unknown}"
else
    echo "No health check logs yet"
fi

if [ -f "logs/ci_sanity.log" ]; then
    CI_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" logs/ci_sanity.log 2>/dev/null)
    CI_STATUS=$(tail -5 logs/ci_sanity.log 2>/dev/null | grep -o "PASSED\|FAILED" | tail -1)
    echo "Last CI sanity: $CI_TIME ${CI_STATUS:-}"
fi
echo ""

# 3. Check node_modules freshness
echo "[DEPENDENCIES]"
if [ -d "node_modules" ]; then
    if [ "package.json" -nt "node_modules" ]; then
        echo "⚠️  package.json newer than node_modules - run: npm install"
    else
        echo "✅ node_modules up to date"
    fi
else
    echo "❌ node_modules missing - run: npm install"
fi
echo ""

# 4. Quick stats
echo "[PROJECT STATS]"
echo "Components: $(find . -name '*.jsx' -not -path './node_modules/*' -not -path './dist/*' | wc -l | tr -d ' ')"
echo "JS files: $(find . -name '*.js' -not -path './node_modules/*' -not -path './dist/*' | wc -l | tr -d ' ')"
echo "Test files: $(find ./test -name '*.test.*' 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# 5. Reminders
echo "[REMINDERS]"
echo "• Run health check: ./scripts/daily_health_check.sh"
echo "• Run tests: npm test"
echo "• Run dev server: npm run dev"
echo "• Check tasks: cat tasks/todo.md"
echo ""

echo "============================================"
echo "Ready to work! 🚀"
echo "============================================"
