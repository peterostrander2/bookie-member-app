#!/bin/bash
# Memory Leak Check - Find common React memory leak patterns
# Usage: ./scripts/memory_leak_check.sh
# Cron: 0 */4 * * * (every 4 hours)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/memory_leak.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "MEMORY LEAK CHECK - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Check for useEffect without cleanup
echo "" >> "$LOG_FILE"
echo "[USEEFFECT WITHOUT CLEANUP]" >> "$LOG_FILE"

# Find useEffect with subscriptions/timers but no cleanup
LEAKY_EFFECTS=$(grep -rn "useEffect" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
                grep -v node_modules || true)

# Look for patterns that typically need cleanup
SUBSCRIPTION_PATTERNS="addEventListener|setInterval|setTimeout|subscribe|\.on\(|fetch\|AbortController"

NEEDS_CLEANUP=$(grep -rn "useEffect.*{" -A 20 --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
                grep -E "$SUBSCRIPTION_PATTERNS" | head -20 || true)

if [ -n "$NEEDS_CLEANUP" ]; then
    # Check if these have return statements (cleanup)
    echo "  Effects with subscriptions/timers (verify cleanup exists):" >> "$LOG_FILE"

    echo "$NEEDS_CLEANUP" | cut -d: -f1 | sort -u | while read -r file; do
        if [ -f "$file" ]; then
            # Very basic check - look for addEventListener without removeEventListener in same file
            HAS_ADD=$(grep -c "addEventListener" "$file" 2>/dev/null || echo "0")
            HAS_REMOVE=$(grep -c "removeEventListener" "$file" 2>/dev/null || echo "0")

            if [ "$HAS_ADD" -gt "$HAS_REMOVE" ]; then
                echo "    ⚠️  $file: addEventListener without matching removeEventListener" >> "$LOG_FILE"
                ISSUES=$((ISSUES + 1))
            fi

            # Check setInterval without clearInterval
            HAS_SET=$(grep -c "setInterval" "$file" 2>/dev/null || echo "0")
            HAS_CLEAR=$(grep -c "clearInterval" "$file" 2>/dev/null || echo "0")

            if [ "$HAS_SET" -gt "$HAS_CLEAR" ]; then
                echo "    ⚠️  $file: setInterval without matching clearInterval" >> "$LOG_FILE"
                ISSUES=$((ISSUES + 1))
            fi
        fi
    done
else
    echo "  ✅ No obvious subscription patterns without cleanup" >> "$LOG_FILE"
fi

# Check for state updates after unmount
echo "" >> "$LOG_FILE"
echo "[ASYNC STATE UPDATES]" >> "$LOG_FILE"

# Find async operations in useEffect that set state
ASYNC_STATE=$(grep -rn "useEffect" -A 30 --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
              grep -E "async|\.then\(" | grep -E "set[A-Z]" | head -10 || true)

if [ -n "$ASYNC_STATE" ]; then
    echo "  Async state updates in effects (verify unmount handling):" >> "$LOG_FILE"
    echo "$ASYNC_STATE" | cut -d: -f1 | sort -u | head -5 | while read -r file; do
        # Check if file uses AbortController or isMounted pattern
        if [ -f "$file" ]; then
            HAS_ABORT=$(grep -c "AbortController\|isMounted\|cancelled" "$file" 2>/dev/null || echo "0")
            if [ "$HAS_ABORT" -eq 0 ]; then
                echo "    ⚠️  $file: async state update without abort/mounted check" >> "$LOG_FILE"
            fi
        fi
    done
else
    echo "  ✅ Async patterns appear safe" >> "$LOG_FILE"
fi

# Check for closures capturing stale state
echo "" >> "$LOG_FILE"
echo "[STALE CLOSURE PATTERNS]" >> "$LOG_FILE"

# Look for useCallback/useMemo without proper dependencies
EMPTY_DEPS=$(grep -rn "useCallback\|useMemo" -A 5 --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
             grep "\[\]" | head -10 || true)

if [ -n "$EMPTY_DEPS" ]; then
    echo "  Empty dependency arrays (verify no stale closures):" >> "$LOG_FILE"
    echo "$EMPTY_DEPS" | cut -d: -f1 | sort -u | head -5 | sed 's/^/    /' >> "$LOG_FILE"
fi

# Check for refs without cleanup
echo "" >> "$LOG_FILE"
echo "[REF USAGE]" >> "$LOG_FILE"

REF_COUNT=$(grep -rn "useRef" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "  Total useRef usages: $REF_COUNT" >> "$LOG_FILE"

# Check local Node processes if running dev server
echo "" >> "$LOG_FILE"
echo "[LOCAL NODE PROCESSES]" >> "$LOG_FILE"

NODE_PROCS=$(ps aux | grep -E "node.*vite|node.*react" | grep -v grep || true)
if [ -n "$NODE_PROCS" ]; then
    echo "$NODE_PROCS" | awk '{printf "  PID %s: %s MB (RSS), %s%% CPU\n", $2, $6/1024, $3}' >> "$LOG_FILE"
else
    echo "  No dev server running" >> "$LOG_FILE"
fi

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️  MEMORY CHECK: $ISSUES potential leak patterns" >> "$LOG_FILE"
else
    echo "✅ MEMORY CHECK: No obvious leak patterns" >> "$LOG_FILE"
fi
echo "============================================" >> "$LOG_FILE"

tail -45 "$LOG_FILE"

exit $((ISSUES > 3 ? 1 : 0))
