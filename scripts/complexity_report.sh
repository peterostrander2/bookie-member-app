#!/bin/bash
# Complexity Report - Flag complex functions and components
# Usage: ./scripts/complexity_report.sh
# Cron: 0 7 * * 1 (weekly on Monday at 7 AM)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/complexity.log"

# Thresholds
MAX_FUNCTION_LINES=100
MAX_FILE_LINES=500
MAX_NESTING=4

mkdir -p "$LOG_DIR"

echo "============================================" >> "$LOG_FILE"
echo "COMPLEXITY REPORT - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Find large files
echo "" >> "$LOG_FILE"
echo "[LARGE FILES (>$MAX_FILE_LINES lines)]" >> "$LOG_FILE"

LARGE_FILES=0
find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read -r file; do
    LINES=$(wc -l < "$file" | tr -d ' ')
    if [ "$LINES" -gt "$MAX_FILE_LINES" ]; then
        echo "  🟡 $file: $LINES lines" >> "$LOG_FILE"
        LARGE_FILES=$((LARGE_FILES + 1))
    fi
done

if [ "$LARGE_FILES" -eq 0 ]; then
    echo "  ✅ No files exceed $MAX_FILE_LINES lines" >> "$LOG_FILE"
fi

# Find deeply nested code
echo "" >> "$LOG_FILE"
echo "[DEEP NESTING (>$MAX_NESTING levels)]" >> "$LOG_FILE"

DEEP_NESTING=$(grep -rn "^                        " --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10 || true)
if [ -n "$DEEP_NESTING" ]; then
    echo "  Files with deep nesting:" >> "$LOG_FILE"
    echo "$DEEP_NESTING" | cut -d: -f1 | sort -u | head -5 | while read -r file; do
        echo "    ⚠️  $file" >> "$LOG_FILE"
    done
else
    echo "  ✅ No deeply nested code detected" >> "$LOG_FILE"
fi

# Find long functions (heuristic based on consecutive lines without blank)
echo "" >> "$LOG_FILE"
echo "[LONG FUNCTIONS (>$MAX_FUNCTION_LINES lines)]" >> "$LOG_FILE"

node << 'EOF' 2>/dev/null >> "$LOG_FILE" || echo "  Could not analyze (Node.js issue)" >> "$LOG_FILE"
const fs = require('fs');
const path = require('path');

function findLongFunctions(dir) {
  const results = [];

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.includes('node_modules') && file !== 'dist') {
        walk(filePath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(file) && !file.includes('.test.') && !file.includes('.spec.')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');

          // Simple heuristic: find function declarations and count lines until closing
          let inFunction = false;
          let funcStart = 0;
          let funcName = '';
          let braceCount = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Detect function start
            const funcMatch = line.match(/(?:function|const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[=:]\s*(?:async\s*)?\(?|(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (funcMatch && !inFunction) {
              inFunction = true;
              funcStart = i;
              funcName = funcMatch[1] || funcMatch[2] || 'anonymous';
              braceCount = 0;
            }

            if (inFunction) {
              braceCount += (line.match(/{/g) || []).length;
              braceCount -= (line.match(/}/g) || []).length;

              if (braceCount <= 0 && i > funcStart) {
                const length = i - funcStart + 1;
                if (length > 100) {
                  results.push({ file: filePath, func: funcName, length, line: funcStart + 1 });
                }
                inFunction = false;
              }
            }
          }
        } catch (e) {}
      }
    }
  }

  try {
    walk(dir);
  } catch (e) {}

  return results.sort((a, b) => b.length - a.length).slice(0, 10);
}

const longFuncs = findLongFunctions('./src');
if (longFuncs.length === 0) {
  console.log('  ✅ No functions exceed 100 lines');
} else {
  for (const f of longFuncs) {
    console.log(`  🟡 ${f.file}:${f.line} - ${f.func}() - ${f.length} lines`);
  }
}
EOF

# Check for complex components (many props)
echo "" >> "$LOG_FILE"
echo "[COMPONENTS WITH MANY PROPS]" >> "$LOG_FILE"

MANY_PROPS=$(grep -rnoE "function [A-Z][a-zA-Z]*\([^)]{100,}\)" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | head -5 || true)
if [ -n "$MANY_PROPS" ]; then
    echo "  Components with complex signatures:" >> "$LOG_FILE"
    echo "$MANY_PROPS" | while read -r line; do
        FILE=$(echo "$line" | cut -d: -f1)
        echo "    ⚠️  $FILE" >> "$LOG_FILE"
    done
else
    echo "  ✅ No overly complex component signatures" >> "$LOG_FILE"
fi

# Check for callback hell
echo "" >> "$LOG_FILE"
echo "[CALLBACK PATTERNS]" >> "$LOG_FILE"
CALLBACKS=$(grep -rn "\.then.*\.then.*\.then" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -5 || true)
if [ -n "$CALLBACKS" ]; then
    echo "  Potential callback chains (consider async/await):" >> "$LOG_FILE"
    echo "$CALLBACKS" | cut -d: -f1-2 | sed 's/^/    ⚠️  /' >> "$LOG_FILE"
else
    echo "  ✅ No excessive promise chaining detected" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

tail -50 "$LOG_FILE"
