#!/bin/bash
# Broken Import Check - Find broken imports and missing dependencies
# Usage: ./scripts/broken_import_check.sh
# Cron: 0 6 * * 1 (weekly on Monday at 6 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/broken_imports.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "BROKEN IMPORT CHECK - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Check for imports from non-existent local files
echo "" >> "$LOG_FILE"
echo "[LOCAL IMPORT VALIDATION]" >> "$LOG_FILE"

# Extract relative imports and check if files exist
BROKEN_IMPORTS=0
grep -rhoE "from ['\"]\.\.?/[^'\"]+['\"]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
    sort -u | head -100 | while read -r import_line; do
    # Extract the path
    IMPORT_PATH=$(echo "$import_line" | grep -oE "\.\.?/[^'\"]+")

    # Find a file that contains this import
    SOURCE_FILE=$(grep -rl "$import_line" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -1)

    if [ -n "$SOURCE_FILE" ]; then
        SOURCE_DIR=$(dirname "$SOURCE_FILE")
        RESOLVED_PATH="$SOURCE_DIR/$IMPORT_PATH"

        # Check if the file exists (with various extensions)
        if [ ! -f "$RESOLVED_PATH" ] && \
           [ ! -f "${RESOLVED_PATH}.js" ] && \
           [ ! -f "${RESOLVED_PATH}.jsx" ] && \
           [ ! -f "${RESOLVED_PATH}.ts" ] && \
           [ ! -f "${RESOLVED_PATH}.tsx" ] && \
           [ ! -f "${RESOLVED_PATH}/index.js" ] && \
           [ ! -f "${RESOLVED_PATH}/index.jsx" ] && \
           [ ! -f "${RESOLVED_PATH}/index.ts" ] && \
           [ ! -f "${RESOLVED_PATH}/index.tsx" ]; then
            echo "  ❌ $SOURCE_FILE imports non-existent: $IMPORT_PATH" >> "$LOG_FILE"
            BROKEN_IMPORTS=$((BROKEN_IMPORTS + 1))
        fi
    fi
done

if [ "$BROKEN_IMPORTS" -eq 0 ]; then
    echo "  ✅ All local imports appear valid" >> "$LOG_FILE"
fi

# Check for missing npm dependencies
echo "" >> "$LOG_FILE"
echo "[NPM DEPENDENCY CHECK]" >> "$LOG_FILE"

# Get list of dependencies from package.json
if [ -f "package.json" ]; then
    DEPS=$(node -pe "Object.keys({...require('./package.json').dependencies, ...require('./package.json').devDependencies}).join('\n')" 2>/dev/null || echo "")

    # Find imports of npm packages
    NPM_IMPORTS=$(grep -rhoE "from ['\"][a-zA-Z@][^'\"]*['\"]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
                  grep -v "^\." | sed "s/from ['\"]//;s/['\"]$//" | \
                  cut -d/ -f1-2 | sort -u | head -50)

    for pkg in $NPM_IMPORTS; do
        # Handle scoped packages
        if [[ "$pkg" == @* ]]; then
            PKG_NAME=$(echo "$pkg" | cut -d/ -f1-2)
        else
            PKG_NAME=$(echo "$pkg" | cut -d/ -f1)
        fi

        # Skip built-in modules
        if [[ "$PKG_NAME" == "react" ]] || [[ "$PKG_NAME" == "react-dom" ]]; then
            continue
        fi

        # Check if package is in dependencies
        if ! echo "$DEPS" | grep -q "^$PKG_NAME$"; then
            # Check if it's in node_modules anyway
            if [ ! -d "node_modules/$PKG_NAME" ]; then
                echo "  ❌ Package not in dependencies: $PKG_NAME" >> "$LOG_FILE"
                ISSUES=$((ISSUES + 1))
            fi
        fi
    done

    if [ "$ISSUES" -eq 0 ]; then
        echo "  ✅ All npm imports have corresponding dependencies" >> "$LOG_FILE"
    fi
fi

# Check for circular imports (basic detection)
echo "" >> "$LOG_FILE"
echo "[CIRCULAR IMPORT CHECK]" >> "$LOG_FILE"

# This is a basic heuristic - look for files that import each other
POTENTIAL_CIRCULAR=0
find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -50 | while read -r file_a; do
    BASENAME_A=$(basename "$file_a" | sed 's/\.[^.]*$//')
    DIR_A=$(dirname "$file_a")

    # Get what this file imports
    IMPORTS_A=$(grep -hoE "from ['\"]\.\.?/[^'\"]+['\"]" "$file_a" 2>/dev/null | grep -oE "\.\.?/[^'\"]+")

    for imp in $IMPORTS_A; do
        RESOLVED="$DIR_A/$imp"
        # Check if that file imports back
        for ext in "" ".js" ".jsx" ".ts" ".tsx"; do
            TARGET="${RESOLVED}${ext}"
            if [ -f "$TARGET" ]; then
                if grep -q "$BASENAME_A" "$TARGET" 2>/dev/null; then
                    echo "  ⚠️  Potential circular: $file_a <-> $TARGET" >> "$LOG_FILE"
                    POTENTIAL_CIRCULAR=$((POTENTIAL_CIRCULAR + 1))
                    break
                fi
            fi
        done
    done
done | head -5

# Try to build to catch import errors
echo "" >> "$LOG_FILE"
echo "[BUILD VALIDATION]" >> "$LOG_FILE"
echo "  Running: npm run build (type-check imports)" >> "$LOG_FILE"

BUILD_OUTPUT=$(npm run build 2>&1 || true)
BUILD_ERRORS=$(echo "$BUILD_OUTPUT" | grep -i "error\|cannot find\|module not found" | head -5 || true)

if [ -n "$BUILD_ERRORS" ]; then
    echo "  ❌ Build errors found:" >> "$LOG_FILE"
    echo "$BUILD_ERRORS" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + 1))
else
    echo "  ✅ Build completed without import errors" >> "$LOG_FILE"
fi

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "❌ IMPORT CHECK: $ISSUES issues found" >> "$LOG_FILE"
else
    echo "✅ IMPORT CHECK: All imports valid" >> "$LOG_FILE"
fi
echo "============================================" >> "$LOG_FILE"

tail -40 "$LOG_FILE"

exit $ISSUES
