#!/bin/bash
# Feature Flag Audit - List active flags, find stale ones
# Usage: ./scripts/feature_flag_audit.sh
# Cron: 30 9 * * 1 (weekly on Monday at 9:30 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/feature_flags.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "FEATURE FLAG AUDIT - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Common feature flag patterns in React apps
FLAG_PATTERNS=(
    "FEATURE_"
    "ENABLE_"
    "USE_"
    "FLAG_"
    "VITE_FEATURE_"
    "REACT_APP_FEATURE_"
    "isEnabled"
    "featureFlag"
    "useFeature"
)

echo "" >> "$LOG_FILE"
echo "[FEATURE FLAGS IN CODE]" >> "$LOG_FILE"

TOTAL_FLAGS=0
for pattern in "${FLAG_PATTERNS[@]}"; do
    FLAGS=$(grep -rn "$pattern" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
            grep -v node_modules | head -20 || true)

    if [ -n "$FLAGS" ]; then
        COUNT=$(echo "$FLAGS" | wc -l | tr -d ' ')
        TOTAL_FLAGS=$((TOTAL_FLAGS + COUNT))
        echo "  Pattern '$pattern': $COUNT occurrences" >> "$LOG_FILE"
    fi
done

echo "  Total flag references: $TOTAL_FLAGS" >> "$LOG_FILE"

# Check environment variables
echo "" >> "$LOG_FILE"
echo "[ENVIRONMENT FEATURE FLAGS]" >> "$LOG_FILE"

for env_file in .env .env.local .env.production .env.development; do
    if [ -f "$env_file" ]; then
        ENV_FLAGS=$(grep -E "^(VITE_FEATURE_|VITE_ENABLE_|REACT_APP_FEATURE_)" "$env_file" 2>/dev/null || true)
        if [ -n "$ENV_FLAGS" ]; then
            echo "  $env_file:" >> "$LOG_FILE"
            echo "$ENV_FLAGS" | sed 's/^/    /' >> "$LOG_FILE"
        fi
    fi
done

# Find all unique flag names
echo "" >> "$LOG_FILE"
echo "[UNIQUE FLAGS FOUND]" >> "$LOG_FILE"
UNIQUE_FLAGS=$(grep -rohE "(FEATURE_|ENABLE_|VITE_FEATURE_)[A-Z_]+" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include=".env*" . 2>/dev/null | \
               grep -v node_modules | sort -u || true)

if [ -n "$UNIQUE_FLAGS" ]; then
    echo "$UNIQUE_FLAGS" | while read -r flag; do
        USAGE=$(grep -rn "$flag" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | wc -l | tr -d ' ')
        echo "  $flag (used $USAGE times)" >> "$LOG_FILE"
    done
else
    echo "  No feature flags found" >> "$LOG_FILE"
fi

# Check for conditional rendering patterns
echo "" >> "$LOG_FILE"
echo "[CONDITIONAL RENDERING PATTERNS]" >> "$LOG_FILE"

# Look for common feature flag usage patterns
CONDITIONALS=$(grep -rn "process\.env\.\(VITE_\|REACT_APP_\).*\?" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | head -10 || true)
if [ -n "$CONDITIONALS" ]; then
    echo "  Conditional renders based on env:" >> "$LOG_FILE"
    echo "$CONDITIONALS" | cut -d: -f1-2 | sort -u | sed 's/^/    /' >> "$LOG_FILE"
fi

# Check for flags with TODO comments
echo "" >> "$LOG_FILE"
echo "[FLAGS WITH TODO COMMENTS]" >> "$LOG_FILE"
TODO_FLAGS=$(grep -rn -B2 -A2 "FEATURE_\|ENABLE_\|FLAG_" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | \
             grep -i "TODO\|FIXME\|REMOVE\|TEMPORARY" | head -5 || true)
if [ -n "$TODO_FLAGS" ]; then
    echo "$TODO_FLAGS" | sed 's/^/  /' >> "$LOG_FILE"
else
    echo "  ✅ No TODOs found near feature flags" >> "$LOG_FILE"
fi

# Check for stale flags (defined but never checked)
echo "" >> "$LOG_FILE"
echo "[POTENTIALLY STALE FLAGS]" >> "$LOG_FILE"
if [ -n "$UNIQUE_FLAGS" ]; then
    echo "$UNIQUE_FLAGS" | while read -r flag; do
        # Check if flag is used in conditionals
        CONDITIONAL_USE=$(grep -rn "if.*$flag\|$flag.*[?&|]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | wc -l | tr -d ' ')

        if [ "$CONDITIONAL_USE" -eq 0 ]; then
            echo "  ⚠️  $flag - defined but never checked conditionally" >> "$LOG_FILE"
        fi
    done
fi

echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
echo "Recommendation: Review flags quarterly" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

tail -50 "$LOG_FILE"
