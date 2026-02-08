#!/bin/bash
# Test Coverage Report - Vitest coverage with detailed reporting
# Usage: ./scripts/test_coverage_report.sh
# Cron: 0 8 * * 1 (weekly on Monday at 8 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/test_coverage.log"

# Thresholds
MIN_COVERAGE=60
WARN_COVERAGE=80

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "TEST COVERAGE REPORT - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Run tests with coverage
echo "" >> "$LOG_FILE"
echo "[RUNNING VITEST WITH COVERAGE]" >> "$LOG_FILE"

COVERAGE_OUTPUT=$(npm run test:coverage 2>&1 || true)

echo "$COVERAGE_OUTPUT" | tail -50 >> "$LOG_FILE"

# Extract coverage percentage
TOTAL_COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep -E "All files" | grep -oE "[0-9]+\.[0-9]+" | head -1 || echo "0")

echo "" >> "$LOG_FILE"
echo "[COVERAGE RESULT]" >> "$LOG_FILE"
if [ -n "$TOTAL_COVERAGE" ] && [ "$TOTAL_COVERAGE" != "0" ]; then
    COVERAGE_INT=${TOTAL_COVERAGE%.*}
    if [ "$COVERAGE_INT" -lt "$MIN_COVERAGE" ]; then
        echo "  🔴 Coverage: ${TOTAL_COVERAGE}% (BELOW MINIMUM ${MIN_COVERAGE}%)" >> "$LOG_FILE"
    elif [ "$COVERAGE_INT" -lt "$WARN_COVERAGE" ]; then
        echo "  🟡 Coverage: ${TOTAL_COVERAGE}% (below target ${WARN_COVERAGE}%)" >> "$LOG_FILE"
    else
        echo "  ✅ Coverage: ${TOTAL_COVERAGE}%" >> "$LOG_FILE"
    fi
else
    echo "  ⚠️  Could not determine coverage percentage" >> "$LOG_FILE"
fi

# Test results
echo "" >> "$LOG_FILE"
echo "[TEST RESULTS]" >> "$LOG_FILE"
PASSED=$(echo "$COVERAGE_OUTPUT" | grep -oE "[0-9]+ passed" | head -1 || echo "0 passed")
FAILED=$(echo "$COVERAGE_OUTPUT" | grep -oE "[0-9]+ failed" | head -1 || echo "0 failed")
echo "  $PASSED, $FAILED" >> "$LOG_FILE"

# Check for files with no tests
echo "" >> "$LOG_FILE"
echo "[FILES WITHOUT TESTS]" >> "$LOG_FILE"
# Find component files
COMPONENTS=$(find src -name "*.jsx" -o -name "*.tsx" 2>/dev/null | grep -v ".test." | grep -v ".spec." | head -20)
UNTESTED=0
for comp in $COMPONENTS; do
    BASENAME=$(basename "$comp" | sed 's/\.[^.]*$//')
    TEST_FILE=$(find src -name "${BASENAME}.test.*" -o -name "${BASENAME}.spec.*" 2>/dev/null | head -1)
    if [ -z "$TEST_FILE" ]; then
        echo "  ⚠️  $comp (no test file)" >> "$LOG_FILE"
        UNTESTED=$((UNTESTED + 1))
        if [ "$UNTESTED" -ge 10 ]; then
            echo "  ... (showing first 10)" >> "$LOG_FILE"
            break
        fi
    fi
done

if [ "$UNTESTED" -eq 0 ]; then
    echo "  ✅ All components have test files" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "Coverage report available at: coverage/index.html" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

tail -50 "$LOG_FILE"
