import { ENDPOINTS, ENV } from "../core/integration_contract.js";

function fail(msg) {
  console.error("❌ " + msg);
  process.exit(1);
}

console.log("Validating integration contract...");

if (!Array.isArray(ENDPOINTS) || ENDPOINTS.length === 0) {
  fail("ENDPOINTS missing or empty");
}

for (const e of ENDPOINTS) {
  if (!e.key || !e.method || !e.path) {
    fail(`Invalid endpoint: ${JSON.stringify(e)}`);
  }
  if (!e.path.startsWith("/")) {
    fail(`Endpoint path must start with "/": ${e.key}`);
  }
}

if (!ENV.API_BASE || !ENV.API_KEY) {
  fail("ENV contract missing required keys");
}

console.log("✅ Integration contract valid");
