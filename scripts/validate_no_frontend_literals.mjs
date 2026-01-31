import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXT_ALLOW = new Set([".js", ".jsx", ".mjs"]);

// Banned literals (should come from contract)
const BANNED = [
  /\b6\.5\b/,
  /\b7\.5\b/,
  /\b8\.0\b/,
  /\b6\.8\b/,
  /\b5\.5\b/,
  /"TITANIUM"/,
  /"GOLD_STAR"/,
  /"EDGE_LEAN"/,
];

// Files allowed to have these literals (canonical sources)
const ALLOWLIST = new Set([
  path.resolve(ROOT, "core/frontend_scoring_contract.js"),
  path.resolve(ROOT, "core/integration_contract.js"),
  path.resolve(ROOT, "scripts/validate_no_frontend_literals.mjs"),
  path.resolve(ROOT, "scripts/validate_frontend_contracts.mjs"),
  path.resolve(ROOT, "scripts/generate_audit_map.mjs"),
]);

// Legacy files - allowed but should be refactored (warn only)
// NOTE: Most false positives now filtered by stripCommentsAndFalsePositives()
const LEGACY_ALLOWLIST = new Set([
  // Empty - all files should now pass with false positive filters
]);

// Directories to skip (test data, mocks, etc.)
const SKIP_DIRS = new Set(["e2e", "test", "stories", "src/mocks"]);

function walk(dir, out = [], relPath = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;
    if (entry.name === "dist") continue;
    const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;
    if (SKIP_DIRS.has(entryRelPath)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out, entryRelPath);
    else if (EXT_ALLOW.has(path.extname(p))) out.push(p);
  }
  return out;
}

// Strip comments and false-positive patterns from code for checking
function stripCommentsAndFalsePositives(code) {
  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  // === FALSE POSITIVE FILTERS ===

  // 1. Remove negative spreads (e.g., -6.5, -7.5) - these are betting lines, not thresholds
  code = code.replace(/-\d+\.\d+/g, '');

  // 2. Remove demo/mock fixture functions (getDemo*, getMock*, MOCK_*)
  code = code.replace(/const\s+getDemo\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\};/g, '');
  code = code.replace(/const\s+MOCK_\w+\s*=\s*\[[\s\S]*?\];/g, '');

  // 3. Remove strings containing "pts" (injury projections like '+6.5 pts')
  code = code.replace(/['"][^'"]*pts[^'"]*['"]/gi, '');

  // 4. Remove scoring_breakdown objects (mock engine scores)
  code = code.replace(/scoring_breakdown:\s*\{[^}]*\}/g, '');

  // 5. Remove final_score in mock data (demo picks with example scores)
  code = code.replace(/final_score:\s*\d+\.\d+/g, '');

  return code;
}

console.log("Checking for hardcoded literals...");

const files = walk(ROOT);
const violations = [];
const legacyWarnings = [];

for (const f of files) {
  if (ALLOWLIST.has(f)) continue;
  const relPath = path.relative(ROOT, f);
  const fileName = path.basename(f);
  const isLegacy = LEGACY_ALLOWLIST.has(fileName);

  const txt = fs.readFileSync(f, "utf8");
  const codeOnly = stripCommentsAndFalsePositives(txt);
  for (const pattern of BANNED) {
    if (pattern.test(codeOnly)) {
      if (isLegacy) {
        legacyWarnings.push({ file: relPath, pattern: pattern.source });
      } else {
        violations.push({ file: relPath, pattern: pattern.source });
      }
    }
  }
}

if (legacyWarnings.length) {
  console.warn("⚠️ Legacy files with hardcoded literals (needs refactor):");
  const uniqueFiles = [...new Set(legacyWarnings.map(w => w.file))];
  for (const f of uniqueFiles.slice(0, 10)) {
    console.warn(`  - ${f}`);
  }
}

if (violations.length) {
  console.error("❌ Hardcoded literals found. Import from core/frontend_scoring_contract.js");
  for (const v of violations.slice(0, 20)) {
    console.error(`- ${v.file}: ${v.pattern}`);
  }
  process.exit(1);
}

console.log("✅ No banned literals in new/migrated files");
