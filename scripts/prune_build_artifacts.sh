#!/bin/bash
# Prune Build Artifacts - Clean old builds, caches
# Usage: ./scripts/prune_build_artifacts.sh
# Cron: 0 5 * * 0 (weekly on Sunday at 5 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/prune.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "PRUNE BUILD ARTIFACTS - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

FREED_KB=0

# Clean Vite cache
echo "" >> "$LOG_FILE"
echo "[VITE CACHE]" >> "$LOG_FILE"
if [ -d "node_modules/.vite" ]; then
    SIZE=$(du -sk node_modules/.vite | cut -f1)
    rm -rf node_modules/.vite
    FREED_KB=$((FREED_KB + SIZE))
    echo "  Cleared node_modules/.vite (${SIZE}KB)" >> "$LOG_FILE"
else
    echo "  No Vite cache found" >> "$LOG_FILE"
fi

# Clean old dist builds (keep current)
echo "" >> "$LOG_FILE"
echo "[DIST DIRECTORY]" >> "$LOG_FILE"
if [ -d "dist" ]; then
    # Check if dist is older than 7 days
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DIST_AGE=$(( ($(date +%s) - $(stat -f %m dist)) / 86400 ))
    else
        DIST_AGE=$(( ($(date +%s) - $(stat -c %Y dist)) / 86400 ))
    fi

    if [ "$DIST_AGE" -gt 7 ]; then
        SIZE=$(du -sk dist | cut -f1)
        echo "  ⚠️  dist is $DIST_AGE days old (${SIZE}KB) - keeping but flagging" >> "$LOG_FILE"
    else
        SIZE=$(du -sk dist | cut -f1)
        echo "  dist: ${SIZE}KB ($DIST_AGE days old)" >> "$LOG_FILE"
    fi
fi

# Clean Storybook cache
echo "" >> "$LOG_FILE"
echo "[STORYBOOK CACHE]" >> "$LOG_FILE"
if [ -d "node_modules/.cache/storybook" ]; then
    SIZE=$(du -sk node_modules/.cache/storybook | cut -f1)
    rm -rf node_modules/.cache/storybook
    FREED_KB=$((FREED_KB + SIZE))
    echo "  Cleared Storybook cache (${SIZE}KB)" >> "$LOG_FILE"
else
    echo "  No Storybook cache found" >> "$LOG_FILE"
fi

# Clean Playwright cache (but keep browsers)
echo "" >> "$LOG_FILE"
echo "[PLAYWRIGHT]" >> "$LOG_FILE"
if [ -d "playwright-report" ]; then
    SIZE=$(du -sk playwright-report | cut -f1)
    rm -rf playwright-report
    FREED_KB=$((FREED_KB + SIZE))
    echo "  Cleared playwright-report (${SIZE}KB)" >> "$LOG_FILE"
fi
if [ -d "test-results" ]; then
    SIZE=$(du -sk test-results | cut -f1)
    rm -rf test-results
    FREED_KB=$((FREED_KB + SIZE))
    echo "  Cleared test-results (${SIZE}KB)" >> "$LOG_FILE"
fi

# Clean coverage reports
echo "" >> "$LOG_FILE"
echo "[COVERAGE]" >> "$LOG_FILE"
if [ -d "coverage" ]; then
    SIZE=$(du -sk coverage | cut -f1)
    rm -rf coverage
    FREED_KB=$((FREED_KB + SIZE))
    echo "  Cleared coverage (${SIZE}KB)" >> "$LOG_FILE"
else
    echo "  No coverage directory found" >> "$LOG_FILE"
fi

# Clean old log files
echo "" >> "$LOG_FILE"
echo "[LOG FILES]" >> "$LOG_FILE"
OLD_LOGS=$(find "$LOG_DIR" -name "*.log" -mtime +30 2>/dev/null || true)
if [ -n "$OLD_LOGS" ]; then
    for logfile in $OLD_LOGS; do
        SIZE=$(du -k "$logfile" | cut -f1)
        FREED_KB=$((FREED_KB + SIZE))
        echo "  Removing: $(basename "$logfile") (${SIZE}KB)" >> "$LOG_FILE"
        rm -f "$logfile"
    done
else
    echo "  No logs older than 30 days" >> "$LOG_FILE"
fi

# Truncate large logs
for logfile in "$LOG_DIR"/*.log; do
    if [ -f "$logfile" ]; then
        LINES=$(wc -l < "$logfile" | tr -d ' ')
        if [ "$LINES" -gt 5000 ]; then
            echo "  Truncating $(basename "$logfile"): $LINES -> 5000 lines" >> "$LOG_FILE"
            tail -5000 "$logfile" > "${logfile}.tmp" && mv "${logfile}.tmp" "$logfile"
        fi
    fi
done

# Summary
echo "" >> "$LOG_FILE"
FREED_MB=$((FREED_KB / 1024))
echo "============================================" >> "$LOG_FILE"
echo "✅ PRUNE COMPLETE - Freed ${FREED_MB}MB" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

tail -30 "$LOG_FILE"
