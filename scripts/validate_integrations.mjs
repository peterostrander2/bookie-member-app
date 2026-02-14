#!/usr/bin/env node
/**
 * PROOF 1: Integration Proof Validator
 *
 * Validates that all CRITICAL integrations are properly configured
 * and validated by the backend.
 *
 * Calls: GET /live/debug/integrations
 * Pass: All CRITICAL integrations show status: VALIDATED
 * Fail: Any CRITICAL integration shows UNREACHABLE or NOT_CONFIGURED
 *
 * Run: VITE_BOOKIE_API_KEY=xxx node scripts/validate_integrations.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

// Critical integrations that MUST be validated
const CRITICAL_INTEGRATIONS = [
  'odds_api',
  'playbook_api',
];

// Non-critical integrations (warn if not validated, but don't fail)
const OPTIONAL_INTEGRATIONS = [
  'weather_api',
  'injury_api',
  'news_api',
];

// =============================================================================
// HELPERS
// =============================================================================

function getApiKey() {
  const key = process.env.VITE_BOOKIE_API_KEY;
  if (!key) {
    console.error('❌ ERROR: VITE_BOOKIE_API_KEY environment variable is required');
    process.exit(1);
  }
  return key;
}

function getBaseUrl() {
  return process.env.VITE_API_BASE_URL || 'https://web-production-7b2a.up.railway.app';
}

async function fetchIntegrations(apiKey) {
  const url = `${getBaseUrl()}/live/debug/integrations`;
  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(`Failed to fetch integrations: ${err.message}`);
  }
}

function getStatusIcon(status) {
  switch (status?.toUpperCase()) {
    case 'VALIDATED': return '✅';
    case 'CONFIGURED': return '⚙️';
    case 'NOT_CONFIGURED': return '⚠️';
    case 'UNREACHABLE': return '❌';
    case 'DISABLED': return '⏸️';
    default: return '❓';
  }
}

function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case 'VALIDATED': return '\x1b[32m'; // green
    case 'CONFIGURED': return '\x1b[33m'; // yellow
    case 'NOT_CONFIGURED': return '\x1b[33m'; // yellow
    case 'UNREACHABLE': return '\x1b[31m'; // red
    case 'DISABLED': return '\x1b[90m'; // gray
    default: return '\x1b[0m';
  }
}

const RESET = '\x1b[0m';

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('============================================');
  console.log('PROOF 1: Integration Proof Validator');
  console.log('============================================\n');

  const apiKey = getApiKey();

  let integrations;
  try {
    integrations = await fetchIntegrations(apiKey);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Handle both array format and object format
  const integrationMap = new Map();
  if (Array.isArray(integrations)) {
    integrations.forEach(i => integrationMap.set(i.name || i.key, i));
  } else if (typeof integrations === 'object') {
    // Object format: { odds_api: { status: 'VALIDATED', ... }, ... }
    Object.entries(integrations).forEach(([key, value]) => {
      integrationMap.set(key, { name: key, ...value });
    });
  }

  console.log('Integration Status:\n');

  // Check critical integrations
  console.log('CRITICAL (must be VALIDATED):');
  for (const name of CRITICAL_INTEGRATIONS) {
    const integration = integrationMap.get(name);
    const status = integration?.status?.toUpperCase() || 'NOT_FOUND';
    const icon = getStatusIcon(status);
    const color = getStatusColor(status);

    console.log(`  ${icon} ${color}${name}${RESET}: ${status}`);

    if (status !== 'VALIDATED') {
      errors.push(`${name}: ${status} (expected VALIDATED)`);
    }
  }

  console.log('\nOPTIONAL (warn if not validated):');
  for (const name of OPTIONAL_INTEGRATIONS) {
    const integration = integrationMap.get(name);
    const status = integration?.status?.toUpperCase() || 'NOT_FOUND';
    const icon = getStatusIcon(status);
    const color = getStatusColor(status);

    console.log(`  ${icon} ${color}${name}${RESET}: ${status}`);

    if (status !== 'VALIDATED' && status !== 'DISABLED') {
      warnings.push(`${name}: ${status}`);
    }
  }

  // Show any other integrations not in our lists
  const knownIntegrations = new Set([...CRITICAL_INTEGRATIONS, ...OPTIONAL_INTEGRATIONS]);
  const otherIntegrations = Array.from(integrationMap.entries())
    .filter(([name]) => !knownIntegrations.has(name));

  if (otherIntegrations.length > 0) {
    console.log('\nOTHER:');
    for (const [name, integration] of otherIntegrations) {
      const status = integration?.status?.toUpperCase() || 'UNKNOWN';
      const icon = getStatusIcon(status);
      const color = getStatusColor(status);
      console.log(`  ${icon} ${color}${name}${RESET}: ${status}`);
    }
  }

  // Summary
  console.log('\n============================================');

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`❌ VALIDATION FAILED: ${errors.length} critical integration(s) not validated\n`);
    errors.forEach(e => console.log(`   - ${e}`));
    console.log('\n   Ensure odds_api and playbook_api are properly configured.');
    console.log('============================================');
    process.exit(1);
  }

  console.log('✅ ALL CRITICAL INTEGRATIONS VALIDATED');
  console.log('   Data sources are properly wired.');
  console.log('============================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
