# Lessons Learned - Bookie Member App

> Self-improvement loop: Document mistakes to prevent repetition

---

## Critical Patterns

### 1. Never Recompute Backend Values

**The mistake:**
```javascript
// WRONG - Recomputing on frontend
const finalScore = (ai * 0.25) + (research * 0.30) + (esoteric * 0.20) + (jarvis * 0.15);
const tier = finalScore >= 7.5 ? "GOLD_STAR" : "EDGE_LEAN";
```

**Why it's wrong:**
- Backend formula includes `confluence_boost` and `jason_sim_boost`
- GOLD_STAR has hard gates beyond just the score (ai >= 6.8, research >= 5.5, etc.)
- TITANIUM requires 3/4 engines >= 8.0, not just a score threshold
- Leads to tier mismatches between frontend display and actual backend calculations

**The fix:**
```javascript
// CORRECT - Use backend values directly
<div>Score: {pick.final_score}</div>
<div>Tier: {pick.tier}</div>
{pick.titanium_triggered && <span>TITANIUM</span>}
```

**Lesson:** Backend `tiering.py` is the single source of truth. Frontend displays, never computes.

---

### 2. Fail-Fast Auth Protection (Feb 2026)

**The problem:**
- Components were polling endpoints without checking if API key was valid
- 401/403 errors caused infinite retry loops
- JSON parse crashes on non-JSON error responses (HTML error pages)

**The fix:**
```javascript
// In lib/api/client.js
let authInvalid = false;
export const isAuthInvalid = () => authInvalid;
export const onAuthInvalid = (callback) => {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
};

// In polling components
useEffect(() => {
  if (!apiKey || isAuthInvalid()) return;
  const unsubscribe = onAuthInvalid(() => clearInterval(interval));
  return () => { clearInterval(interval); unsubscribe(); };
}, []);
```

**Lesson:** Always guard polling with auth validity checks. Stop polling immediately on auth failure.

---

### 3. Safe JSON Parsing

**The crash:**
```javascript
const data = await response.json(); // Crashes if response is HTML error page
```

**The fix:**
```javascript
export const safeJson = async (response) => {
  if (!response.ok) return null;
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch { return null; }
};

// Every method returns graceful defaults
const data = await safeJson(response) || [];
```

**Lesson:** Never call `.json()` without error handling. Servers return HTML on errors.

---

### 4. Tier System Sync (v12.0)

**The problem:** Frontend tier thresholds didn't match backend `tiering.py`

**The fix:**
- TITANIUM_SMASH: `final >= 8.0` AND `3/4 engines >= 6.5`
- GOLD_STAR: `final >= 7.5`
- EDGE_LEAN: `final >= 6.5`
- MONITOR: `final >= 5.5`
- PASS: `final < 5.5`

**Additional rules:**
- Use `pick.titanium_triggered` for TITANIUM detection (not score alone)
- Use `pick.units` from backend when available
- Fall back to score-based derivation only for legacy compatibility

**Lesson:** When backend changes tier logic, frontend MUST be updated to match. Tiers are not just score thresholds.

---

### 5. Daily Lesson Must Be Visible (Feb 2026)

**The problem:**
- Autograder learned daily, but the frontend didn’t surface a daily lesson to users.

**The fix:**
- Added a Daily Lesson card on the dashboard.
- Pulls from `/live/grader/daily-lesson` (fallback to yesterday if today isn’t ready).

**Lesson:** The learning loop is only complete if the user can see the daily lesson.

---

## React/Vite Patterns

### Import Organization
- Static imports for providers and core components
- Dynamic imports (`React.lazy`) for route components
- Mixed static/dynamic imports cause Vite warnings

### Service Worker Registration
```javascript
// Only register SW in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### React Router v7 Prep
```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

---

## Code Review Red Flags

- [ ] Computing `final_score`, `tier`, or `titanium` on frontend
- [ ] Polling without checking `isAuthInvalid()`
- [ ] Direct `.json()` calls without `safeJson()` wrapper
- [ ] Tier thresholds that don't match backend `tiering.py`
- [ ] Missing API key check before API calls
- [ ] Service worker registration in development mode

---

## Testing Checklist

Before deploying frontend changes:

1. Verify tier display matches backend response
2. Check auth failure handling (try invalid API key)
3. Test offline mode (disconnect network)
4. Verify no console errors on fresh load
5. Check build output for warnings

---

## Template: Adding New Lessons

```markdown
### [Title] ([Date])

**The problem:**
What went wrong

**The fix:**
Code or configuration change

**Lesson:**
Key takeaway for future development
```
