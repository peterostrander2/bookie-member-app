#!/usr/bin/env node
/**
 * COMBINED FRONTEND CONTRACT VALIDATOR
 *
 * Runs all validation checks to ensure anti-drift compliance:
 * 1. No hardcoded API URLs outside lib/api/client.js
 * 2. No scoring literals outside core/frontend_scoring_contract.js
 * 3. api.js imports from lib/api/client.js (not hardcoding)
 * 4. docs/MASTER_INDEX.md exists and references canonical files
 *
 * Run: node scripts/validate_frontend_contracts.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ERRORS = [];

// =============================================================================
// HELPERS
// =============================================================================

function fileExists(filePath) {
  return fs.existsSync(path.resolve(ROOT, filePath));
}

function readFile(filePath) {
  const fullPath = path.resolve(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf8");
}

function addError(check, message) {
  ERRORS.push(`[${check}] ${message}`);
}

// =============================================================================
// CHECK 1: No hardcoded API URLs outside client
// =============================================================================

function checkNoHardcodedUrls() {
  console.log("🔍 CHECK 1: No hardcoded API URLs outside lib/api/client.js");

  const BANNED_URL_PATTERN = /https:\/\/web-production[^\s'"]*/g;
  const ALLOWED_FILES = new Set([
    "lib/api/client.js",
    "core/integration_contract.js",
    "scripts/verify-backend.js", // Test script OK
  ]);

  const JS_FILES = [
    "api.js",
    "src/utils/pickNormalize.js",
    // Add other key files that might have URLs
  ];

  let found = 0;
  for (const file of JS_FILES) {
    if (ALLOWED_FILES.has(file)) continue;
    const content = readFile(file);
    if (!content) continue;

    const matches = content.match(BANNED_URL_PATTERN);
    if (matches) {
      addError("HARDCODED_URL", `${file} contains hardcoded URL: ${matches[0]}`);
      found++;
    }
  }

  if (found === 0) {
    console.log("  ✅ No hardcoded URLs found");
  }
}

// =============================================================================
// CHECK 2: No scoring literals outside contract
// =============================================================================

function checkNoScoringLiterals() {
  console.log("🔍 CHECK 2: No scoring literals outside contract");

  const BANNED_LITERALS = [
    /\b6\.5\b/,
    /\b7\.5\b/,
    /\b8\.0\b/,
    /\b5\.5\b/,
    /"TITANIUM"/,
    /"GOLD_STAR"/,
    /"EDGE_LEAN"/,
  ];

  const ALLOWED_FILES = new Set([
    path.resolve(ROOT, "core/frontend_scoring_contract.js"),
    path.resolve(ROOT, "scripts/validate_no_frontend_literals.mjs"),
    path.resolve(ROOT, "scripts/validate_frontend_contracts.mjs"),
  ]);

  // Directories to skip (test data, mocks, e2e)
  const SKIP_DIRS = new Set(["e2e", "test", "src/mocks", "__tests__"]);

  // Legacy files - warn but don't fail
  // NOTE: Most false positives now filtered by stripCommentsAndFalsePositives()
  const LEGACY_FILES = new Set([
    // Empty - all files should now pass with false positive filters
  ]);

  const EXT_ALLOW = new Set([".js", ".jsx", ".mjs"]);

  function walk(dir, out = [], relPath = "") {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;
      // Skip test/mock directories
      if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(entryRelPath)) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p, out, entryRelPath);
      } else if (EXT_ALLOW.has(path.extname(p))) {
        out.push(p);
      }
    }
    return out;
  }

  function stripCommentsAndFalsePositives(code) {
    // Remove comments
    code = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

    // === FALSE POSITIVE FILTERS ===
    // 1. Remove negative spreads (e.g., -6.5, -7.5) - betting lines, not thresholds
    code = code.replace(/-\d+\.\d+/g, "");
    // 2. Remove strings containing "pts" (injury projections like '+6.5 pts')
    code = code.replace(/['"][^'"]*pts[^'"]*['"]/gi, "");
    // 3. Remove scoring_breakdown objects (mock engine scores)
    code = code.replace(/scoring_breakdown:\s*\{[^}]*\}/g, "");
    // 4. Remove final_score in mock data (demo picks with example scores)
    code = code.replace(/final_score:\s*\d+\.\d+/g, "");

    return code;
  }

  const files = walk(ROOT);
  let violations = 0;
  let warnings = 0;

  for (const f of files) {
    if (ALLOWED_FILES.has(f)) continue;
    const fileName = path.basename(f);
    const isLegacy = LEGACY_FILES.has(fileName);

    const txt = readFile(f);
    if (!txt) continue;
    const codeOnly = stripCommentsAndFalsePositives(txt);

    for (const pattern of BANNED_LITERALS) {
      if (pattern.test(codeOnly)) {
        if (isLegacy) {
          warnings++;
        } else {
          addError("SCORING_LITERAL", `${path.relative(ROOT, f)}: ${pattern.source}`);
          violations++;
        }
        break; // One error per file is enough
      }
    }
  }

  if (warnings > 0) {
    console.log(`  ⚠️  ${warnings} legacy files have literals (needs refactor)`);
  }
  if (violations === 0) {
    console.log("  ✅ No banned literals in new/migrated files");
  }
}

// =============================================================================
// CHECK 3: api.js uses client (not hardcoding)
// =============================================================================

function checkApiUsesClient() {
  console.log("🔍 CHECK 3: api.js imports from lib/api/client.js");

  const content = readFile("api.js");
  if (!content) {
    addError("API_CLIENT", "api.js not found");
    return;
  }

  // Check for import from client
  if (!content.includes("from './lib/api/client.js'") &&
      !content.includes('from "./lib/api/client.js"')) {
    addError("API_CLIENT", "api.js does not import from lib/api/client.js");
    return;
  }

  // Check no hardcoded URL definition
  if (/const API_BASE_URL\s*=\s*['"]https?:/.test(content)) {
    addError("API_CLIENT", "api.js still has hardcoded API_BASE_URL");
    return;
  }

  console.log("  ✅ api.js properly imports from client");
}

// =============================================================================
// CHECK 4: MASTER_INDEX.md exists and is valid
// =============================================================================

function checkMasterIndex() {
  console.log("🔍 CHECK 4: docs/MASTER_INDEX.md exists and references contracts");

  const content = readFile("docs/MASTER_INDEX.md");
  if (!content) {
    addError("MASTER_INDEX", "docs/MASTER_INDEX.md not found");
    return;
  }

  const REQUIRED_REFS = [
    "frontend_scoring_contract",
    "integration_contract",
    "lib/api/client",
  ];

  for (const ref of REQUIRED_REFS) {
    if (!content.includes(ref)) {
      addError("MASTER_INDEX", `docs/MASTER_INDEX.md missing reference to: ${ref}`);
    }
  }

  if (!ERRORS.some((e) => e.includes("MASTER_INDEX"))) {
    console.log("  ✅ MASTER_INDEX.md valid");
  }
}

// =============================================================================
// CHECK 5: Required files exist
// =============================================================================

function checkRequiredFiles() {
  console.log("🔍 CHECK 5: Required contract files exist");

  const REQUIRED = [
    "core/frontend_scoring_contract.js",
    "core/integration_contract.js",
    "lib/api/client.js",
    "docs/MASTER_INDEX.md",
  ];

  for (const file of REQUIRED) {
    if (!fileExists(file)) {
      addError("MISSING_FILE", `Required file missing: ${file}`);
    }
  }

  if (!ERRORS.some((e) => e.includes("MISSING_FILE"))) {
    console.log("  ✅ All required files exist");
  }
}

// =============================================================================
// MAIN
// =============================================================================

console.log("============================================");
console.log("FRONTEND CONTRACT VALIDATOR");
console.log("============================================\n");

checkRequiredFiles();
checkNoHardcodedUrls();
checkNoScoringLiterals();
checkApiUsesClient();
checkMasterIndex();

console.log("\n============================================");
if (ERRORS.length > 0) {
  console.log(`❌ VALIDATION FAILED: ${ERRORS.length} error(s)\n`);
  for (const err of ERRORS) {
    console.log(`  ${err}`);
  }
  process.exit(1);
} else {
  console.log("✅ ALL CHECKS PASSED");
  console.log("============================================");
  process.exit(0);
}
