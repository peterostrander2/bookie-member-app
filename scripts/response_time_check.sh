#!/bin/bash
# Response Time Check - Monitor deployed frontend response times
# Usage: ./scripts/response_time_check.sh
# Cron: */30 * * * * (every 30 minutes)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/response_times.log"

# Update this to your deployed frontend URL
FRONTEND_URL="${FRONTEND_URL:-https://bookie-member-app.railway.app}"
SLOW_THRESHOLD_MS=3000
CRITICAL_THRESHOLD_MS=8000

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "FRONTEND RESPONSE TIME - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
echo "Target: $FRONTEND_URL" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

ISSUES=0

# Check main page load
START=$(date +%s%N)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$FRONTEND_URL" 2>/dev/null || echo "000")
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))

if [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Main page: TIMEOUT/UNREACHABLE" >> "$LOG_FILE"
    ISSUES=$((ISSUES + 1))
elif [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Main page: HTTP $HTTP_CODE (${DURATION_MS}ms)" >> "$LOG_FILE"
    ISSUES=$((ISSUES + 1))
elif [ "$DURATION_MS" -gt "$CRITICAL_THRESHOLD_MS" ]; then
    echo "🔴 Main page: ${DURATION_MS}ms CRITICAL" >> "$LOG_FILE"
    ISSUES=$((ISSUES + 1))
elif [ "$DURATION_MS" -gt "$SLOW_THRESHOLD_MS" ]; then
    echo "🟡 Main page: ${DURATION_MS}ms SLOW" >> "$LOG_FILE"
else
    echo "✅ Main page: ${DURATION_MS}ms" >> "$LOG_FILE"
fi

# Check static assets
echo "" >> "$LOG_FILE"
echo "[STATIC ASSETS]" >> "$LOG_FILE"

# Get the HTML and extract asset URLs
HTML=$(curl -s --max-time 10 "$FRONTEND_URL" 2>/dev/null || echo "")
if [ -n "$HTML" ]; then
    # Extract JS/CSS file references
    ASSETS=$(echo "$HTML" | grep -oE '(src|href)="[^"]*\.(js|css)"' | grep -oE '"[^"]*"' | tr -d '"' | head -5)

    for asset in $ASSETS; do
        # Handle relative URLs
        if [[ "$asset" == /* ]]; then
            ASSET_URL="${FRONTEND_URL}${asset}"
        elif [[ "$asset" == http* ]]; then
            ASSET_URL="$asset"
        else
            ASSET_URL="${FRONTEND_URL}/${asset}"
        fi

        START=$(date +%s%N)
        ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$ASSET_URL" 2>/dev/null || echo "000")
        END=$(date +%s%N)
        ASSET_MS=$(( (END - START) / 1000000 ))

        BASENAME=$(basename "$asset" | cut -c1-30)
        if [ "$ASSET_CODE" = "200" ]; then
            echo "  ✅ $BASENAME: ${ASSET_MS}ms" >> "$LOG_FILE"
        else
            echo "  ❌ $BASENAME: HTTP $ASSET_CODE" >> "$LOG_FILE"
        fi
    done
fi

# Check TTFB (Time To First Byte)
echo "" >> "$LOG_FILE"
echo "[TTFB METRICS]" >> "$LOG_FILE"
TTFB=$(curl -s -o /dev/null -w "%{time_starttransfer}" --max-time 10 "$FRONTEND_URL" 2>/dev/null || echo "0")
TTFB_MS=$(echo "$TTFB * 1000" | bc | cut -d. -f1)
if [ "$TTFB_MS" -gt 1000 ]; then
    echo "  🟡 TTFB: ${TTFB_MS}ms (consider CDN)" >> "$LOG_FILE"
else
    echo "  ✅ TTFB: ${TTFB_MS}ms" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️  $ISSUES issue(s) detected" >> "$LOG_FILE"
else
    echo "✅ All checks passed" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
tail -25 "$LOG_FILE"

exit $ISSUES
