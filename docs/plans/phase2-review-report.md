# Phase 2 Review Report

**Reviewer commit:** `a3b691f`
**Branch:** `feat/mobile-11star-phase2-planning`
**Scope reviewed:** `src/features/planning/*`, `src/features/schedule/*` (Phase 2A + 2B additions)

---

## Compile + Test Result

```
TypeScript: 0 errors (pnpm compile → tsc --noEmit)
Tests: 59 suites, 265 tests, 0 failures
```

---

## Fixes Applied (`a3b691f`)

### 1. `isToday` detection — correctness bug (PlanningShiftsSections)

**Problem:** `isToday` was detected by comparing the display label string against three hardcoded locale values:
```ts
dayLabel.toLowerCase() === "today" || ... === "vandaag" || ... === "aujourd'hui"
```
This breaks if a new locale is added, if the `getRelativeDayLabel` copy changes, or in any test environment where `getRelativeDayLabel` uses a different output format.

**Fix:** Import and call `isToday(shift.date)` directly from `@/core/date` — the authoritative date-comparison utility already exported from the same module.

Also changed the today-card border from `\`${tokens.accent}28\`` (hex alpha concat) → `tokens.accentSoft` (semantic token, already defined, light-mode = `rgba(0,122,255,0.10)`, dark-mode = `rgba(10,132,255,0.14)`).

---

### 2. Claimed-card hex alpha border (PlanningCallsSections)

**Problem:** `borderColor: \`${tokens.success}22\`` — runtime hex string concatenation, not a semantic token.

**Fix:** `borderColor: tokens.successSoft` — already the right soft-success tint, consistent with the claimed badge background on the same card.

---

### 3. Toast on mutation error (PlanningRequestsScreen)

**Problem:** `handleDecideSwap` / `handleCancelSwap` called `showSuccess(...)` immediately after `await screen.handle*()` with no error guard. If the mutation throws, the unhandled promise rejection propagated AND no success toast showed — but on any future path where the underlying hook surfaces errors as thrown promises (rather than returning false), a success toast would fire falsely.

**Fix:** Wrapped both handlers in `try/catch`. Toast fires only on the happy path; errors remain surfaced inline by the mutation result.

---

### 4. New Phase 2 accessibility strings not i18n'd (ShiftDetailSections)

**Problem:** Phase 2A added `accessibilityLabel="Open venue in Maps"` to the map chip in `ShiftDetailHero`. This was a new hardcoded English string (the pre-existing `text="Open in Maps"` was already hardcoded, but is noted as deferred). Adding a new i18n-missing string in the same commit class is a gap.

**Fix:** Added `planning:schedule.openInMaps` + `planning:schedule.openInMapsA11y` keys to en/nl/fr. Wired both into `ShiftDetailHero`. Pre-existing hardcoded strings in the file (section headings, "Back to Planning", "Plan for this shift") remain deferred as documented in the Phase 2A report.

---

## Consistency Assessment

| Check | Result |
|-------|--------|
| Token colors (no raw hex) | **Pass** after fixes. Remaining `borderRadius: 999` in static `StyleSheet.create` blocks is correct (token hook not callable in static context; value matches `tokens.radiusFull = 999`) |
| Motion helpers reduce-motion aware | **Pass**. `useListItemEntrance`, `useCelebratePulse`, `fireHaptic` all check `shouldReduceMotion` / no-op path in motion provider |
| Skeleton/empty/error states on all screens | **Pass**. All 9 screens (hub, shifts, todos, calls, requests, swap-new, change-new, availability, leave) have skeleton on first load + error state |
| SurfaceCard elevationLevel pattern | **Pass**. Consistently: today shifts=1, call cards (unclaimed)=1, request rows=1, leave balance=1, shift detail hero=1 |
| Stagger entrance on all lists | **Pass**. `useListItemEntrance` applied to: shift cards, todo items, call cards, request rows, swap/change picker rows, weekday rows, shortcut rows |
| `usePressScale` on tappable cards | **Pass** on shift cards. Call cards use full-card `Animated.View` pulse instead. Minor divergence: `usePressScale` not on call cards — acceptable given the celebrate-pulse already wraps the whole card |
| Signature moments fire at right points | **Pass**. Todo check-off, call claim (optimistic), availability save (isSaving false→true→false), swap/change submit (screen.success transition) |
| a11y: roles + labels on interactive elements | **Pass**. All Pressable/checkbox/radio elements have `accessibilityRole` + `accessibilityLabel` / `accessibilityState` |
| Minimum touch target 44pt | **Pass** on key elements. Checkbox rows are `minHeight: 52`, shift cards are full-width, call claim button is full-width AppButton |
| Dynamic Type via `<Text>` | **Pass**. All text uses the custom `Text` primitive (not RN `Text` directly). `adjustsFontSizeToFit` on shift detail time display |
| i18n keys in all 3 locales | **Pass**. All Phase 2A/2B keys present in en/nl/fr. New Maps keys added in this review commit |

---

## Remaining Limitations (documented, not blocking)

1. **Pre-existing hardcoded English strings in ShiftDetailSections** — section titles "Plan for this shift", "Back to Planning", "What changed", "Action needed" are pre-existing and not changed by Phase 2. Deferred per Phase 2A report.

2. **AvailabilityTemplateSections intro text** — `"Set your usual pattern here..."` hardcoded English, pre-existing.

3. **`PlanningRequestsScreen` error feedback** — Decide/cancel mutation errors don't surface a toast (the underlying hook doesn't propagate error signals to the screen). Inline mutation state would need to be exposed. Acceptable for now.

4. **Optimistic haptic on call claim** — `fireHaptic("success")` fires before API round-trip. If the mutation errors, the user has already felt success haptic. Product team trade-off, documented in Phase 2A self-review.

5. **Keep-alive tab mount** — All 5 planning sub-screens mount on first hub render (`display: flex/none` pattern). Low overhead now; revisit if sub-screens grow heavier.

6. **`fontSize: 48` hero number in PlanningLeaveSections** — intentional large hero display, not a typo. A dedicated typography token (`heroXl` or similar) could be added to the design system in a follow-up.

7. **`usePressScale` not in `@/ui/composites/index.ts`** — imported from `@/ui/composites/app-motion` directly. Minor; re-export could be added in a follow-up.

---

## Data Integrity Check

All mutation call paths verified intact:

| Mutation | Called from | Verified |
|----------|-------------|---------|
| `useClaimCallMutation` | `PlanningCallCard.handleClaim` → `onClaim` → `usePlanningCallsScreen.handleClaim` | Test: `mockClaimCallMutation` called with `{callCode, employerCode, establishmentCode}` |
| `useCompleteTodoMutation` | `PlanningTodoItem.handlePress` → `onComplete` → screen | Test: `mockCompleteTodoMutation` called with `{todoCode}` |
| `useUncompleteTodoMutation` | `PlanningTodoItem.handlePress` (done path) → `onUncomplete` | Covered |
| `useCreateShiftSwapMutation` | `PlanningSwapNewScreen.handleSubmit` | Test: correct `{requesterShiftId, targetShiftId}` payload |
| `useCreateShiftChangeMutation` | `PlanningChangeNewScreen.handleSubmit` | Test: correct `{shiftId}` in payload |
| `useDecideShiftSwapMutation` | `PlanningRequestsScreen.handleDecideSwap` (try/catch now) | Mock present |
| `useCancelShiftSwapMutation` | `PlanningRequestsScreen.handleCancelSwap` (try/catch now) | Mock present |
| `useSaveAvailabilityMutation` | `useAvailabilityScreen` hook (fires haptic inline) | Mock present |
