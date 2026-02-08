#!/bin/bash
# Bundle Size Check - Monitor bundle size, alert on bloat
# Usage: ./scripts/bundle_size_check.sh
# Cron: 0 8 * * 1 (weekly on Monday at 8 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/bundle_size.log"

# Thresholds in KB
WARN_SIZE_KB=500
CRIT_SIZE_KB=1000

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "BUNDLE SIZE CHECK - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Build if dist doesn't exist or is old
if [ ! -d "dist" ] || [ $(find dist -mmin +1440 2>/dev/null | wc -l) -gt 0 ]; then
    echo "Building production bundle..." >> "$LOG_FILE"
    npm run build >> "$LOG_FILE" 2>&1 || true
fi

if [ -d "dist" ]; then
    echo "" >> "$LOG_FILE"
    echo "[BUNDLE SIZES]" >> "$LOG_FILE"

    # Check JS bundles
    echo "  JavaScript:" >> "$LOG_FILE"
    find dist -name "*.js" -type f | while read -r file; do
        SIZE_KB=$(du -k "$file" | cut -f1)
        BASENAME=$(basename "$file")
        if [ "$SIZE_KB" -gt "$CRIT_SIZE_KB" ]; then
            echo "    🔴 $BASENAME: ${SIZE_KB}KB (CRITICAL >$CRIT_SIZE_KB)" >> "$LOG_FILE"
        elif [ "$SIZE_KB" -gt "$WARN_SIZE_KB" ]; then
            echo "    🟡 $BASENAME: ${SIZE_KB}KB (>$WARN_SIZE_KB)" >> "$LOG_FILE"
        else
            echo "    ✅ $BASENAME: ${SIZE_KB}KB" >> "$LOG_FILE"
        fi
    done

    # Check CSS bundles
    echo "" >> "$LOG_FILE"
    echo "  CSS:" >> "$LOG_FILE"
    find dist -name "*.css" -type f | while read -r file; do
        SIZE_KB=$(du -k "$file" | cut -f1)
        BASENAME=$(basename "$file")
        echo "    $BASENAME: ${SIZE_KB}KB" >> "$LOG_FILE"
    done

    # Total dist size
    echo "" >> "$LOG_FILE"
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    echo "  Total dist size: $TOTAL_SIZE" >> "$LOG_FILE"

    # Check for source maps in production (should not exist)
    MAPS=$(find dist -name "*.map" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$MAPS" -gt 0 ]; then
        echo "" >> "$LOG_FILE"
        echo "  ⚠️  $MAPS source map files in dist (consider removing for production)" >> "$LOG_FILE"
    fi

    # Track size history
    echo "" >> "$LOG_FILE"
    echo "[SIZE HISTORY]" >> "$LOG_FILE"
    HISTORY_FILE="$LOG_DIR/bundle_history.csv"
    TOTAL_KB=$(du -k dist | tail -1 | cut -f1)
    echo "$(date +%Y-%m-%d),$TOTAL_KB" >> "$HISTORY_FILE"
    tail -7 "$HISTORY_FILE" | while read -r line; do
        echo "  $line" >> "$LOG_FILE"
    done
else
    echo "❌ No dist directory found" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
tail -30 "$LOG_FILE"
