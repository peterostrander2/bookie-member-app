#!/bin/bash
# Auto Cleanup Script for bookie-member-app
# Removes temp files, cache, and stale artifacts
# Usage: ./scripts/auto_cleanup.sh [--dry-run]

set -e
cd "$(dirname "$0")/.."

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "DRY RUN MODE - No files will be deleted"
    echo ""
fi

echo "============================================"
echo "AUTO CLEANUP - bookie-member-app"
echo "============================================"
echo "Started: $(date)"
echo ""

CLEANED=0

# 1. Clean dist/build output
echo "[1/6] Cleaning build output..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo "      Found: dist/ ($DIST_SIZE)"
    if [ "$DRY_RUN" = false ]; then
        rm -rf dist
        echo "      Cleaned!"
        CLEANED=$((CLEANED + 1))
    fi
else
    echo "      None found"
fi

# 2. Clean node_modules cache
echo "[2/6] Cleaning npm cache..."
if [ -d "node_modules/.cache" ]; then
    CACHE_SIZE=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
    echo "      Found: node_modules/.cache ($CACHE_SIZE)"
    if [ "$DRY_RUN" = false ]; then
        rm -rf node_modules/.cache
        echo "      Cleaned!"
        CLEANED=$((CLEANED + 1))
    fi
else
    echo "      None found"
fi

# 3. Clean test artifacts
echo "[3/6] Cleaning test artifacts..."
TEST_ARTIFACTS=0
for dir in "playwright-report" "test-results" "coverage"; do
    if [ -d "$dir" ]; then
        echo "      Found: $dir/"
        TEST_ARTIFACTS=$((TEST_ARTIFACTS + 1))
        if [ "$DRY_RUN" = false ]; then
            rm -rf "$dir"
        fi
    fi
done
if [ "$TEST_ARTIFACTS" -gt 0 ]; then
    echo "      Cleaned $TEST_ARTIFACTS test artifact directories!"
    CLEANED=$((CLEANED + TEST_ARTIFACTS))
else
    echo "      None found"
fi

# 4. Clean temp/log files
echo "[4/6] Cleaning temp and log files..."
TEMP_FILES=$(find . -name "*.tmp" -o -name "*.log" -o -name "*.bak" -o -name "*~" -o -name ".DS_Store" 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
echo "      Found: $TEMP_FILES temp/log files"
if [ "$DRY_RUN" = false ] && [ "$TEMP_FILES" -gt 0 ]; then
    find . -name "*.tmp" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    find . -name "*.bak" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    find . -name "*~" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    find . -name ".DS_Store" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    echo "      Cleaned!"
    CLEANED=$((CLEANED + TEMP_FILES))
fi

# 5. Clean empty directories
echo "[5/6] Cleaning empty directories..."
EMPTY_DIRS=$(find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
echo "      Found: $EMPTY_DIRS empty directories"
if [ "$DRY_RUN" = false ] && [ "$EMPTY_DIRS" -gt 0 ]; then
    find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" -delete 2>/dev/null || true
    echo "      Cleaned!"
    CLEANED=$((CLEANED + EMPTY_DIRS))
fi

# 6. Regenerate project map if script exists
echo "[6/6] Regenerating project map..."
if [ -f "./scripts/generate_project_map.sh" ]; then
    if [ "$DRY_RUN" = false ]; then
        ./scripts/generate_project_map.sh 2>/dev/null || echo "      (Map generation skipped)"
    else
        echo "      Would run: generate_project_map.sh"
    fi
else
    echo "      No project map script found"
fi

echo ""
echo "============================================"
echo "DISK USAGE SUMMARY"
echo "============================================"
echo "Project size:  $(du -sh . 2>/dev/null | cut -f1)"
if [ -d "node_modules" ]; then
    echo "node_modules:  $(du -sh node_modules 2>/dev/null | cut -f1)"
fi
if [ -d "dist" ]; then
    echo "dist/:         $(du -sh dist 2>/dev/null | cut -f1)"
fi

echo ""
echo "============================================"
echo "CLEANUP COMPLETE"
echo "============================================"
echo "Finished: $(date)"
if [ "$DRY_RUN" = true ]; then
    echo "Mode: DRY RUN (no changes made)"
else
    echo "Items cleaned: $CLEANED"
fi
