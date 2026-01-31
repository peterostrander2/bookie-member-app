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
  path.resolve(ROOT, "scripts/generate_audit_map.mjs"),
]);

// Legacy files - allowed but should be refactored (warn only)
const LEGACY_ALLOWLIST = new Set([
  "BestOdds.jsx",
  "GameSmashList.jsx",
  "PropsSmashList.jsx",
  "InjuryVacuum.jsx",
  "Onboarding.jsx",
  "SharpAlerts.jsx",
  "Splits.jsx",
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

// Strip comments from code for checking
function stripComments(code) {
  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
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
  const codeOnly = stripComments(txt);
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
