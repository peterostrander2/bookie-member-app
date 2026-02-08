#!/bin/bash
# Daily Health Check Script for bookie-member-app
# Run time: ~60 seconds
# Usage: ./scripts/daily_health_check.sh

set -e
cd "$(dirname "$0")/.."

echo "============================================"
echo "DAILY HEALTH CHECK - bookie-member-app"
echo "============================================"
echo "Started: $(date)"
echo ""

ISSUES=0

# 1. Check for unused imports (common React issue)
echo "[1/7] Checking for potential unused imports..."
UNUSED_IMPORTS=$(grep -rh "^import.*from" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "      Total import statements: $UNUSED_IMPORTS"

# 2. Find duplicate component/function names
echo "[2/7] Checking for duplicate function names..."
DUPE_FUNCS=$(grep -rh "^function \|^const .* = (" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | sort | uniq -d | head -5)
if [ -n "$DUPE_FUNCS" ]; then
    echo "      WARNING: Potential duplicate functions found:"
    echo "$DUPE_FUNCS" | while read line; do echo "        - $line"; done
    ISSUES=$((ISSUES + 1))
else
    echo "      OK - No duplicate function names"
fi

# 3. Find large files (>50KB for frontend)
echo "[3/7] Checking for large files (>50KB)..."
LARGE_FILES=$(find . \( -name "*.js" -o -name "*.jsx" \) -size +50k -not -path "./node_modules/*" -not -path "./dist/*" 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
    echo "      Large files found (consider splitting):"
    echo "$LARGE_FILES" | while read f; do
        SIZE=$(ls -lh "$f" | awk '{print $5}')
        echo "        - $f ($SIZE)"
    done
else
    echo "      OK - No oversized files"
fi

# 4. Find TODO/FIXME/HACK comments
echo "[4/7] Checking for TODO/FIXME/HACK comments..."
TODO_COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 0 ]; then
    echo "      Found $TODO_COUNT TODO/FIXME/HACK comments"
    echo "      Top 5:"
    grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | head -5 | while read line; do
        echo "        - $line"
    done
else
    echo "      OK - No pending TODOs"
fi

# 5. Check for console.log statements (should be removed in prod)
echo "[5/7] Checking for console.log statements..."
CONSOLE_COUNT=$(grep -rn "console\.log\|console\.warn\|console\.error" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v "// allowed" | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt 10 ]; then
    echo "      WARNING: $CONSOLE_COUNT console statements found"
    ISSUES=$((ISSUES + 1))
else
    echo "      OK - Console usage is minimal ($CONSOLE_COUNT)"
fi

# 6. Check node_modules freshness
echo "[6/7] Checking node_modules..."
if [ -d "node_modules" ]; then
    if [ "package.json" -nt "node_modules" ]; then
        echo "      WARNING: package.json newer than node_modules - run npm install"
        ISSUES=$((ISSUES + 1))
    else
        echo "      OK - node_modules is up to date"
    fi
else
    echo "      WARNING: node_modules missing - run npm install"
    ISSUES=$((ISSUES + 1))
fi

# 7. Check for build errors (quick syntax check)
echo "[7/7] Quick build check..."
if command -v npx &> /dev/null && [ -f "vite.config.js" ]; then
    if npx vite build --mode production 2>&1 | grep -q "error"; then
        echo "      WARNING: Build has errors"
        ISSUES=$((ISSUES + 1))
    else
        echo "      OK - No build errors detected"
    fi
else
    echo "      Skipped - vite not available"
fi

echo ""
echo "============================================"
echo "QUICK STATS"
echo "============================================"
echo "JS/JSX files:    $(find . \( -name "*.js" -o -name "*.jsx" \) -not -path "./node_modules/*" -not -path "./dist/*" | wc -l | tr -d ' ')"
echo "Test files:      $(find ./test -name "*.test.js" -o -name "*.spec.js" 2>/dev/null | wc -l | tr -d ' ')"
echo "Components:      $(find . -name "*.jsx" -not -path "./node_modules/*" -not -path "./dist/*" | wc -l | tr -d ' ')"
echo "Doc files:       $(find . -name "*.md" -not -path "./node_modules/*" | wc -l | tr -d ' ')"
echo ""

echo "============================================"
echo "HEALTH CHECK COMPLETE"
echo "============================================"
echo "Finished: $(date)"
if [ "$ISSUES" -gt 0 ]; then
    echo "Issues found: $ISSUES (review above)"
    exit 1
else
    echo "Status: HEALTHY"
    exit 0
fi
