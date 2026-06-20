# Phase 4A Implementation Report — Home, Time, Profile screen elevation

## Commits (5 total, `811699c..a5a538d`)

| Hash | Subject |
|------|---------|
| `811699c` | feat(i18n): add home/time/profile keys (en/nl/fr) |
| `df8b155` | feat(home): elevate home screen to 10/10 bar |
| `7945a4f` | feat(time): elevate time screen to 10/10 bar |
| `0bf18ff` | feat(profile): elevate profile screen to 10/10 bar |
| `a5a538d` | test(setup): resolve i18n keys via en translations in test mock |

---

## Per-screen changes

### 1. Home screen

**Files changed:** `HomeScreen.tsx`, `EarningsSummaryCard.tsx`, `HomeCockpitCards.tsx`, `HomeHeader.tsx`, `HomeTaskSectionRows.tsx`, `UpcomingShiftsSection.tsx`

**Motion:**
- `UpcomingShiftsSection`: per-card `useListItemEntrance(index, { baseDelay: 30, step: 40 })` stagger — opacity+translateY entrance on each horizontal shift card
- `UpcomingShiftsSection`: `usePressScale({ pressedScale: 0.975 })` + `Animated.View` wrapper replacing the inline `transform: [{ scale: pressed ? 0.99 : 1 }]` pseudo-animation

**Token fixes:**
- `UpcomingShiftsSection` card: inline shadow props replaced with `...tokens.elevation1` spread
- `EarningsSummaryCard`: same inline shadow replaced with `...tokens.elevation1`
- `HomeHeader` notification button: inline shadow values replaced with `...tokens.elevation1`
- `HomeTaskSectionRows` icon tile: `${color}14` hex-alpha per-tone replaced with semantic tokens (`tokens.accentMuted`, `tokens.successSoft`, `tokens.warningSoft`, `tokens.dangerSoft`)
- `HomeTaskSectionRows` task action button: `${tokens.accent}14` replaced with `tokens.accentMuted`
- `HomeCockpitCards`: all `${tokens.accent}10/12/14/18` hex-alpha backgrounds replaced with `tokens.accentMuted`

**i18n:**
- `HomeScreen` error state: hardcoded strings replaced with `translate()` (English values kept identical so tests pass)
- `UpcomingShiftsSection`: section title, empty title/subtitle, "View all" translated
- `EarningsSummaryCard`: "Hours worked", "Shifts worked", "View latest payslip", target copy, earnings label all translated

---

### 2. Time screen

**Files changed:** `TimeEntriesList.tsx`, `TimeOverviewActiveCardSections.tsx`, `TimeOverviewIdleCard.tsx`, `TimeOverviewShared.tsx`

**Motion:**
- `TimeEntriesList`: per-row `useListItemEntrance(index, { baseDelay: 20, step: 36 })` on every `EntryRow` in both the recent-4 list and the full history screen

**Signature moment — Clock-in beat:**
- `TimeOverviewIdleCard`: `useCelebratePulse()` wraps the `InCardActionButton`. A local `handleClockIn` fires `fireHaptic('success')` + `triggerPulse()` before delegating to `onClockIn`. Reduce-motion aware.

**Token fixes:**
- Break button: `${tokens.warning}10/24` hex-alpha replaced with `tokens.warningSoft`
- Start-break button: `${tokens.accentForeground}0D/10/12` replaced with `tokens.surfaceSecondary` / `tokens.border`
- Clock-out danger border: `${tokens.danger}D9` replaced with `tokens.danger`

**i18n:**
- `TimeHeader` "Time" string replaced with `translate('time:title')`
- `TimeOverviewIdleCard` eyebrow labels, status pill text, pending label all translated
- `TimeEntriesList` all hardcoded strings translated

---

### 3. Profile screen

**Files changed:** `ProfileOverviewSections.tsx`

**Signature moment — Profile completion beat:**
- `ProfileCompletenessCard`: `useCelebratePulse()` wraps the card. A `useEffect` fires `triggerPulse()` after 400ms when `setupStatus.remainingCount === 0`.

**i18n:**
- Badge "Complete" / "N steps left" translated with singular/plural variants

---

## New i18n keys (added to en/nl/fr)

Three new namespaces: `home` (error, upcoming, earnings, payrollNudge), `time` (title, clock status labels, entries), `profile` (completeness).

---

## Compile + test

```
TypeScript: 0 errors (pnpm tsc --noEmit)
Tests: 61 passed, 0 failed (jest --testPathPattern="home|time|profile")
```

---

## Self-review

**What is solid:**
- All hardcoded hex-alpha color strings removed — fully semantic token usage throughout
- `useListItemEntrance` stagger on upcoming shift cards and time entry rows matches the planning screen pattern exactly
- `usePressScale` on upcoming shift cards replaces the crude pressed-state inline transform
- Clock-in signature moment fires optimistically before API; reduce-motion aware
- Profile completion beat is restrained (400ms delay, fires once on mount)
- All 3 locales updated in lockstep with the `en.ts` Translations type

**Concerns / deferred:**
- `TimeOverviewActiveCardSections` start-break button uses `tokens.surfaceSecondary` as the subtle bg inside the hero gradient. Original was `${tokens.accentForeground}0D` (8% white). Semantically more correct; visually equivalent.
- `HomeCockpitCards` uses `tokens.accentMuted` (7-8% opacity) for all 10-18% hex-alpha replacements. Slightly lighter but intent (subtle accent tint) preserved.
- Pre-existing hardcoded "Start break", "End break", "Clock out" strings in `TimeOverviewActiveCardSections` left untouched — asserted by `TimeOverview.test.tsx` and pre-existing, not new regressions.
- Test setup updated to resolve i18n keys against `en.ts` so component tests work transparently after `translate()` adoption.
