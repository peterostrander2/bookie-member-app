# Claude Code Handoff — React Best Practices (Vite + React)

You are working inside this repository.
Default goal: ship correct, fast, maintainable React code with minimal bundle size and minimal client-side work.

Note: This project uses Vite + React (not Next.js). Server Components / RSC rules do NOT apply.

## 1) Always follow React Best Practices
This repo may include the Vercel react-best-practices skill:
`.claude/skills/react-best-practices/SKILL.md`

When editing any React code, apply those rules where applicable.
If missing, install with:
`npx add-skill vercel-labs/agent-skills`

## 2) Decision rules (hard rules)
### Component boundaries
- Keep components small and focused.
- Lift state up only when needed; prefer local state when possible.
- Avoid prop drilling when it causes complexity (consider context or state stores).

### Data fetching
- Do NOT fetch inside random components unless that component truly owns the data.
- Prefer a dedicated data layer:
  - React Query / TanStack Query (preferred if present)
  - a single service module for API calls
- Avoid fetch chains inside `useEffect` when possible.
- Always handle: loading / error / empty states.

### Performance + bundle size
- Avoid unnecessary re-renders:
  - Don't create new objects/arrays inline in hot render paths.
  - Memoize expensive computations (`useMemo`) when it prevents real work.
  - Stabilize callbacks (`useCallback`) only when it prevents rerenders in memoized children.
- Avoid heavy dependencies in critical UI paths.
- Prefer code splitting for heavy/rare screens:
  - `React.lazy()` + `<Suspense />`
  - or `import()` in the router layer
- Prefer virtualization for large lists (if list size is large).

### Rendering correctness
- Avoid state derived from props unless necessary (prefer computed values).
- Avoid unnecessary `useEffect`. Prefer direct rendering from state/props.
- Avoid duplicated sources of truth.

### Styling/UI
- Keep UI consistent with existing design system.
- Don't introduce a new UI library without explicit request.

## 3) When you code, ALWAYS do this checklist
Before final output:
- [ ] Any avoidable `useEffect` fetching or chained requests?
- [ ] Are loading/error/empty states handled?
- [ ] Any obvious rerender causes (inline objects, unstable props, expensive maps)?
- [ ] Any heavy deps pulled into the main bundle unnecessarily?
- [ ] Any code-splitting opportunities for rare/large screens?
- [ ] Types correct (TypeScript) and no `any` unless unavoidable?
- [ ] API calls centralized and consistent?

## 4) Output format expectations
When making code changes:
1) Give a brief "what changed + why" summary.
2) Provide minimal diffs or full updated files.
3) Call out tradeoffs (perf vs complexity).

## 5) Vite-specific defaults
- Prefer `import.meta.env` for env vars (do not use `process.env`).
- Keep secrets server-side only (never ship private keys to client).
- Prefer dynamic imports / route-level splitting for large bundles.

## 6) If user asks for a performance pass
Do a strict audit and propose fixes in this priority:
1) Remove unnecessary renders + expensive computations
2) Reduce bundle size (split heavy deps, lazy load routes)
3) Improve data fetching strategy and caching
4) Fix list performance (virtualization)
5) Improve UI responsiveness (debounce/throttle where needed)
