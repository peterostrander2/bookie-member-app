# Handoff Document — Bookie Member App

**Session:** January 2026
**Branch:** `claude/review-claude-md-AbZ7i`
**Status:** Ready for PR

---

## Summary

This session upgraded the project to React 19, added AI/validation dependencies, and established React development best practices documentation.

---

## What Changed

### 1. React 19 Upgrade

**Before:** React 18.3.1
**After:** React 19.2.3

```bash
# Upgraded packages
react: 18.3.1 → 19.2.3
react-dom: 18.2.0 → 19.2.3
@testing-library/react: 14.1.0 → 16.x
```

**Why:** Required for `@json-render/react` which has a peer dependency on React 19.

**Verification:** All 91 tests pass.

---

### 2. New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2.3 | UI framework (upgraded) |
| `react-dom` | 19.2.3 | React DOM renderer (upgraded) |
| `zod` | 4.3.5 | Runtime schema validation |
| `ai` | 6.0.39 | Vercel AI SDK for AI integrations |
| `@json-render/core` | 0.2.0 | JSON-to-UI rendering engine |
| `@json-render/react` | 0.2.0 | React bindings for json-render |

**Install command used:**
```bash
npm install react@19 react-dom@19 @testing-library/react@latest
npm install zod ai @json-render/core @json-render/react
```

---

### 3. React Best Practices Documentation

Created `.claude/REACT_GUIDELINES.md` with Vite + React specific guidelines:

**Key sections:**
- Component boundaries (small, focused, local state preferred)
- Data fetching (centralized, avoid useEffect chains)
- Performance + bundle size (memoization, code splitting)
- Rendering correctness (avoid derived state, unnecessary effects)
- Vite-specific defaults (`import.meta.env`, dynamic imports)
- Performance audit priority checklist

**Why:** The original guidelines were Next.js-focused (Server Components, RSC). This project uses Vite + React, so a tailored version was needed.

---

### 4. Vercel Agent Skills

Installed from `vercel-labs/agent-skills`:

```
.claude/skills/
├── react-best-practices/    # 45 rules across 8 categories
│   ├── SKILL.md             # Quick reference
│   ├── AGENTS.md            # Full compiled guide (65KB)
│   └── rules/               # Individual rule files
└── web-design-guidelines/   # Web design patterns
```

**Rule categories:**
| Priority | Category | Impact | Applies to Vite? |
|----------|----------|--------|------------------|
| 1 | Eliminating Waterfalls | CRITICAL | ✅ Yes |
| 2 | Bundle Size Optimization | CRITICAL | ✅ Yes |
| 3 | Server-Side Performance | HIGH | ❌ Next.js only |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | ✅ Yes |
| 5 | Re-render Optimization | MEDIUM | ✅ Yes |
| 6 | Rendering Performance | MEDIUM | ✅ Yes |
| 7 | JavaScript Performance | LOW-MEDIUM | ✅ Yes |
| 8 | Advanced Patterns | LOW | ✅ Yes |

---

### 5. Updated CLAUDE.md

Changes to the main project documentation:

1. **Stack section** — Updated from React 18 to React 19
2. **Key Dependencies table** — Added all new packages
3. **React Best Practices section** — References the new guidelines
4. **File Structure** — Added `.claude/` directory
5. **Session History** — Documented this session

---

## Files Created

| File | Description |
|------|-------------|
| `.claude/REACT_GUIDELINES.md` | Vite + React best practices (77 lines) |
| `.claude/skills/react-best-practices/*` | 45 Vercel React rules (54 files) |
| `.claude/skills/web-design-guidelines/*` | Web design patterns |

---

## Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added dependencies, updated React versions |
| `package-lock.json` | Lock file updated |
| `CLAUDE.md` | Stack, dependencies, file structure, session history |

---

## Commits

```
1ed9fb6 Update CLAUDE.md with React 19 and new dependencies
86e2c5b Upgrade to React 19 and add AI dependencies
c13b57a Add Vite + React specific guidelines
866a188 Add Vercel React best practices agent skills
```

---

## Testing

```bash
npm run test:run
# ✓ test/api.test.js (32 tests)
# ✓ test/esoteric.test.js (28 tests)
# ✓ test/BetSlip.test.jsx (11 tests)
# ✓ test/ParlayBuilder.test.jsx (12 tests)
# ✓ test/BetHistory.test.jsx (8 tests)
#
# Test Files  5 passed (5)
#      Tests  91 passed (91)
```

**Note:** Some `act()` warnings appear but don't affect test results. These are React 19 strictness improvements.

---

## How to Use the New Packages

### Zod — Schema Validation
```javascript
import { z } from 'zod';

const BetSchema = z.object({
  player: z.string(),
  line: z.number(),
  odds: z.number(),
  confidence: z.number().min(0).max(100),
});

// Validate API response
const validated = BetSchema.parse(apiResponse);
```

### Vercel AI SDK
```javascript
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Analyze this betting matchup...',
});
```

### JSON Render
```javascript
import { JsonRender } from '@json-render/react';

const schema = {
  type: 'card',
  title: 'Pick of the Day',
  children: [...]
};

<JsonRender schema={schema} />
```

---

## PR Checklist

- [x] React 19 upgrade complete
- [x] All 91 tests passing
- [x] Dependencies installed and locked
- [x] Documentation updated (CLAUDE.md)
- [x] Best practices guidelines created
- [x] Vercel skills installed
- [x] All changes committed and pushed

---

## Create PR

https://github.com/peterostrander2/bookie-member-app/pull/new/claude/review-claude-md-AbZ7i

---

## Next Steps (Optional)

1. **Use Zod** — Add schema validation to API responses in `api.js`
2. **Use AI SDK** — Build AI-powered features (chat, analysis)
3. **Use JSON Render** — Dynamic UI from backend-driven schemas
4. **Apply Vercel rules** — Run performance audit using `.claude/skills/react-best-practices/`

---

## Quick Reference

```bash
# Run dev server
npm run dev

# Run tests
npm run test:run

# Build production
npm run build

# Analyze bundle
npm run build:analyze
```

**Current versions:**
```
react: 19.2.3
zod: 4.3.5
ai: 6.0.39
@json-render/core: 0.2.0
@json-render/react: 0.2.0
```
