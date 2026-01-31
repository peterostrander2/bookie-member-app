import fs from "node:fs";
import path from "node:path";
import { ENV, DEFAULTS, ENDPOINTS } from "../core/integration_contract.js";

const lines = [];
lines.push("# AUDIT MAP (Frontend)");
lines.push("");
lines.push("**AUTO-GENERATED from core/integration_contract.js - DO NOT EDIT MANUALLY**");
lines.push("");
lines.push("Run: node scripts/generate_audit_map.mjs");
lines.push("");

lines.push("## Environment Variables");
lines.push("");
lines.push("| Variable | Default | Purpose |");
lines.push("|---|---|---|");
lines.push("| " + ENV.API_BASE + " | " + DEFAULTS.API_BASE + " | Backend base URL |");
lines.push("| " + ENV.API_KEY + " | *(required)* | Backend API authentication |");
lines.push("");

lines.push("## Backend Endpoints");
lines.push("");
lines.push("| Key | Method | Path | Required |");
lines.push("|---|---|---|---|");
for (const e of ENDPOINTS) {
  lines.push("| " + e.key + " | " + e.method + " | " + e.path + " | " + (e.required ? "Yes" : "No") + " |");
}
lines.push("");

const out = lines.join("\n");
const outPath = path.resolve("docs/AUDIT_MAP.md");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, "utf8");
console.log("Generated " + outPath);
