#!/bin/bash
# Dead Code Scan - Find unused components, exports, imports
# Usage: ./scripts/dead_code_scan.sh
# Cron: 0 7 * * 0 (weekly on Sunday at 7 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/dead_code.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "DEAD CODE SCAN - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Find unused exports
echo "" >> "$LOG_FILE"
echo "[POTENTIALLY UNUSED EXPORTS]" >> "$LOG_FILE"

# Get all exported names
EXPORTS=$(grep -rhoE "export (const|function|class|default) [a-zA-Z_][a-zA-Z0-9_]*" \
          --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
          sed 's/export \(const\|function\|class\|default\) //' | sort -u | head -50)

UNUSED_EXPORTS=0
for exp in $EXPORTS; do
    # Skip common/expected names
    if [[ "$exp" == "default" ]] || [[ "$exp" == "App" ]] || [[ "$exp" == "main" ]]; then
        continue
    fi

    # Count imports of this export
    IMPORT_COUNT=$(grep -rn "import.*$exp\|import.*{ *$exp" \
                   --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
                   grep -v node_modules | wc -l | tr -d ' ')

    if [ "$IMPORT_COUNT" -eq 0 ]; then
        # Find where it's defined
        DEFINED=$(grep -rn "export.*$exp" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -1)
        if [ -n "$DEFINED" ]; then
            echo "  ⚠️  $exp - never imported" >> "$LOG_FILE"
            echo "      Defined at: $DEFINED" >> "$LOG_FILE"
            UNUSED_EXPORTS=$((UNUSED_EXPORTS + 1))
            if [ "$UNUSED_EXPORTS" -ge 10 ]; then
                echo "  ... (showing first 10)" >> "$LOG_FILE"
                break
            fi
        fi
    fi
done

if [ "$UNUSED_EXPORTS" -eq 0 ]; then
    echo "  ✅ No obvious unused exports found" >> "$LOG_FILE"
fi

# Find unused components (JSX files never imported)
echo "" >> "$LOG_FILE"
echo "[POTENTIALLY UNUSED COMPONENTS]" >> "$LOG_FILE"

UNUSED_COMPONENTS=0
find src -name "*.jsx" -o -name "*.tsx" 2>/dev/null | grep -v ".test." | grep -v ".spec." | grep -v "index" | while read -r file; do
    BASENAME=$(basename "$file" | sed 's/\.[^.]*$//')

    # Check if component is imported anywhere
    IMPORTS=$(grep -rn "import.*$BASENAME\|from.*$BASENAME" \
              --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
              grep -v node_modules | grep -v "$(basename "$file")" | wc -l | tr -d ' ')

    if [ "$IMPORTS" -eq 0 ]; then
        echo "  ⚠️  $file - never imported" >> "$LOG_FILE"
        UNUSED_COMPONENTS=$((UNUSED_COMPONENTS + 1))
    fi
done | head -15

# Find unused CSS classes
echo "" >> "$LOG_FILE"
echo "[CSS ANALYSIS]" >> "$LOG_FILE"
CSS_FILES=$(find src -name "*.css" -o -name "*.scss" 2>/dev/null | wc -l | tr -d ' ')
echo "  CSS files: $CSS_FILES" >> "$LOG_FILE"

# Count CSS classes defined vs used
if [ "$CSS_FILES" -gt 0 ]; then
    CLASSES_DEFINED=$(grep -rohE "\.[a-zA-Z_-][a-zA-Z0-9_-]*\s*{" src/*.css src/**/*.css 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    echo "  Classes defined: ~$CLASSES_DEFINED" >> "$LOG_FILE"
fi

# Find unused images/assets
echo "" >> "$LOG_FILE"
echo "[UNUSED ASSETS]" >> "$LOG_FILE"
if [ -d "src/assets" ] || [ -d "public" ]; then
    ASSETS=$(find src/assets public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.gif" \) 2>/dev/null | head -20)
    UNUSED_ASSETS=0

    for asset in $ASSETS; do
        BASENAME=$(basename "$asset")
        # Check if referenced in code
        REFS=$(grep -rn "$BASENAME" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.css" src/ 2>/dev/null | wc -l | tr -d ' ')
        if [ "$REFS" -eq 0 ]; then
            SIZE=$(du -h "$asset" | cut -f1)
            echo "  ⚠️  $BASENAME ($SIZE) - never referenced" >> "$LOG_FILE"
            UNUSED_ASSETS=$((UNUSED_ASSETS + 1))
            if [ "$UNUSED_ASSETS" -ge 5 ]; then
                break
            fi
        fi
    done

    if [ "$UNUSED_ASSETS" -eq 0 ]; then
        echo "  ✅ All assets appear to be in use" >> "$LOG_FILE"
    fi
else
    echo "  No assets directory found" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
echo "Note: Review manually - some may be dynamically imported" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

tail -50 "$LOG_FILE"
