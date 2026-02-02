# Todo - Bookie Member App

> Plan tracking: Current and upcoming work

---

## Completed Features (Reference)

All major features are complete. See CLAUDE.md "What's Complete" for full list:
- UI/UX with dark theme
- Click-to-bet (8 sportsbooks)
- Gamification (XP, levels)
- PWA support
- Push notifications
- Offline mode
- Historical charts
- 91 unit tests
- CI/CD pipeline

---

## Backend Integration Gaps

### Esoteric Engine (Backend Needed)

These signals need backend implementation:

- [ ] **Founder's Echo** - Requires team founding year database
- [ ] **Life Path Sync** - Requires player birth dates, jersey numbers
- [ ] **Biorhythms** - Requires player birth dates for sine-wave calc
- [ ] **Gann's Square of Nine** - 180°/360° angle calculations on spread/total
- [ ] **50% Retracement** - Requires season-high/low line history
- [ ] **Schumann Frequency** - Real-time 7.83 Hz API or simulation
- [ ] **Atmospheric Drag** - Elevation + humidity for outdoor venues
- [ ] **Hurst Exponent** - Point differential time series analysis
- [ ] **Noosphere Velocity** - Twitter/social sentiment API
- [ ] **Void Moon Filter** - Astronomical API for void-of-course periods
- [ ] **Teammate Void** - Same-team prop detection with correlation
- [ ] **Correlation Matrix** - Historical leg correlation data

---

## Potential Improvements

*Only implement if explicitly requested*

### Performance
- [ ] Virtual scrolling for long pick lists (if >100 picks causes lag)
- [ ] Image lazy loading (if images are added)

### Features
- [ ] Multi-language support
- [ ] Custom themes beyond dark/light
- [ ] Advanced parlay correlation warnings

### Testing
- [ ] Increase E2E test coverage
- [ ] Visual regression testing
- [ ] Performance benchmarks

---

## Maintenance Tasks

### Regular Checks
- [ ] Update dependencies quarterly
- [ ] Review Sentry error reports
- [ ] Check GA4 analytics for UX issues
- [ ] Verify PWA install flow

### Before Major Changes
1. [ ] Review `tasks/lessons.md`
2. [ ] Run test suite: `npm run test`
3. [ ] Check build warnings: `npm run build`
4. [ ] Test on mobile device

---

## Current Session Work

*Update this section during active development*

```markdown
### Session: [Date]
**Branch:** claude/[feature-name]-[sessionId]
**Goal:** [What we're trying to accomplish]

**Progress:**
- [ ] Task 1
- [ ] Task 2

**Blockers:**
- None

**Next steps:**
- Step 1
```

---

## Template: Adding Tasks

```markdown
### [Task Title]
**Priority:** High/Medium/Low
**Status:** Not Started / In Progress / Blocked / Done
**Depends on:** [Backend API / Other task]

Description of what needs to be done.

**Acceptance criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
```
