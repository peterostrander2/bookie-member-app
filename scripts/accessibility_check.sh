#!/bin/bash
# Accessibility Check - Basic a11y audit for React components
# Usage: ./scripts/accessibility_check.sh
# Cron: 0 7 * * 0 (weekly on Sunday at 7 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/accessibility.log"

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "ACCESSIBILITY CHECK - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ISSUES=0

# Check for images without alt text
echo "" >> "$LOG_FILE"
echo "[IMAGES WITHOUT ALT TEXT]" >> "$LOG_FILE"

NO_ALT=$(grep -rn "<img" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
         grep -v "alt=" | grep -v node_modules | head -10 || true)

if [ -n "$NO_ALT" ]; then
    COUNT=$(echo "$NO_ALT" | wc -l | tr -d ' ')
    echo "  🔴 Found $COUNT images without alt attribute:" >> "$LOG_FILE"
    echo "$NO_ALT" | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT))
else
    echo "  ✅ All images have alt attributes" >> "$LOG_FILE"
fi

# Check for empty alt="" (should be intentional for decorative images)
echo "" >> "$LOG_FILE"
echo "[EMPTY ALT ATTRIBUTES]" >> "$LOG_FILE"

EMPTY_ALT=$(grep -rn 'alt=""' --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
            grep -v node_modules | head -10 || true)

if [ -n "$EMPTY_ALT" ]; then
    COUNT=$(echo "$EMPTY_ALT" | wc -l | tr -d ' ')
    echo "  Found $COUNT images with empty alt (OK if decorative):" >> "$LOG_FILE"
    echo "$EMPTY_ALT" | cut -d: -f1-2 | sed 's/^/    /' >> "$LOG_FILE"
fi

# Check for buttons without accessible text
echo "" >> "$LOG_FILE"
echo "[BUTTONS WITHOUT ACCESSIBLE TEXT]" >> "$LOG_FILE"

# Find buttons that only have icons/no text
ICON_ONLY_BUTTONS=$(grep -rn "<button" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
                    grep -v "aria-label" | grep -v ">.*[a-zA-Z].*<" | \
                    grep -v node_modules | head -10 || true)

if [ -n "$ICON_ONLY_BUTTONS" ]; then
    COUNT=$(echo "$ICON_ONLY_BUTTONS" | wc -l | tr -d ' ')
    echo "  ⚠️  Found $COUNT buttons possibly missing accessible text:" >> "$LOG_FILE"
    echo "$ICON_ONLY_BUTTONS" | cut -d: -f1-2 | sed 's/^/    /' >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT))
else
    echo "  ✅ Buttons appear to have accessible text" >> "$LOG_FILE"
fi

# Check for form inputs without labels
echo "" >> "$LOG_FILE"
echo "[FORM INPUTS WITHOUT LABELS]" >> "$LOG_FILE"

# Find inputs without associated labels or aria-label
UNLABELED_INPUTS=$(grep -rn "<input" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
                   grep -v "aria-label" | grep -v "id=" | \
                   grep -v node_modules | head -10 || true)

if [ -n "$UNLABELED_INPUTS" ]; then
    COUNT=$(echo "$UNLABELED_INPUTS" | wc -l | tr -d ' ')
    echo "  ⚠️  Found $COUNT inputs possibly missing labels:" >> "$LOG_FILE"
    echo "$UNLABELED_INPUTS" | cut -d: -f1-2 | sed 's/^/    /' >> "$LOG_FILE"
else
    echo "  ✅ Form inputs appear to have labels" >> "$LOG_FILE"
fi

# Check for click handlers on non-interactive elements
echo "" >> "$LOG_FILE"
echo "[CLICK HANDLERS ON NON-INTERACTIVE ELEMENTS]" >> "$LOG_FILE"

NON_INTERACTIVE=$(grep -rn "onClick" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | \
                  grep -E "<(div|span|p|section|article)" | \
                  grep -v "role=" | grep -v "tabIndex" | \
                  grep -v node_modules | head -10 || true)

if [ -n "$NON_INTERACTIVE" ]; then
    COUNT=$(echo "$NON_INTERACTIVE" | wc -l | tr -d ' ')
    echo "  ⚠️  Found $COUNT click handlers on non-interactive elements:" >> "$LOG_FILE"
    echo "$NON_INTERACTIVE" | cut -d: -f1-2 | sed 's/^/    /' >> "$LOG_FILE"
    echo "    Consider adding role='button' and tabIndex={0}" >> "$LOG_FILE"
    ISSUES=$((ISSUES + COUNT))
else
    echo "  ✅ Click handlers are on appropriate elements" >> "$LOG_FILE"
fi

# Check for color contrast issues (basic heuristic)
echo "" >> "$LOG_FILE"
echo "[COLOR USAGE]" >> "$LOG_FILE"

# Look for hardcoded colors that might have contrast issues
LIGHT_COLORS=$(grep -rnoE "color:\s*['\"]?(#[fFeEdDcCbB][a-fA-F0-9]{5}|white|#fff)" \
               --include="*.jsx" --include="*.tsx" --include="*.css" src/ 2>/dev/null | \
               grep -v node_modules | wc -l | tr -d ' ')

echo "  Light text colors found: $LIGHT_COLORS (verify contrast)" >> "$LOG_FILE"

# Check for ARIA usage
echo "" >> "$LOG_FILE"
echo "[ARIA USAGE STATS]" >> "$LOG_FILE"
ARIA_LABELS=$(grep -rn "aria-label" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
ARIA_ROLES=$(grep -rn "role=" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "  aria-label usage: $ARIA_LABELS" >> "$LOG_FILE"
echo "  role usage: $ARIA_ROLES" >> "$LOG_FILE"

# Summary
echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️  A11Y CHECK: $ISSUES potential issues found" >> "$LOG_FILE"
else
    echo "✅ A11Y CHECK: No obvious issues detected" >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"
echo "For comprehensive testing, run Lighthouse or axe-core" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

tail -50 "$LOG_FILE"

exit $((ISSUES > 5 ? 1 : 0))
