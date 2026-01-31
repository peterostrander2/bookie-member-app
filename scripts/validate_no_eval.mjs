import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXT_ALLOW = new Set([".js", ".jsx", ".mjs"]);
const SKIP_DIRS = new Set(["e2e", "test", "stories", "src/mocks"]);

const BANNED = [
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
];

const ALLOWLIST = new Set([
  path.resolve(ROOT, "scripts/validate_no_eval.mjs"),
]);

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

function stripComments(code) {
  code = code.replace(/\/\/.*$/gm, "");
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  return code;
}

console.log("Checking for eval/new Function usage...");

const files = walk(ROOT);
const violations = [];

for (const f of files) {
  if (ALLOWLIST.has(f)) continue;
  const relPath = path.relative(ROOT, f);
  const txt = fs.readFileSync(f, "utf8");
  const codeOnly = stripComments(txt);
  for (const pattern of BANNED) {
    if (pattern.test(codeOnly)) {
      violations.push({ file: relPath, pattern: pattern.source });
    }
  }
}

if (violations.length) {
  console.error("❌ eval/new Function usage found. Remove or replace.");
  for (const v of violations.slice(0, 20)) {
    console.error(`- ${v.file}: ${v.pattern}`);
  }
  process.exit(1);
}

console.log("✅ No eval/new Function usage found");
