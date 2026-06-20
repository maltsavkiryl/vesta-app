# Phase 0 Planning Feature — Review Report

**Branch**: `feat/mobile-11star-phase0`
**Reviewer**: automated cleanup pass (post-implementation)
**Date**: 2026-06-20

---

## Summary

Phase 0 closed the planning feature's production gaps: real date/time pickers for swap/change forms, complete i18n, and 19 integration tests. This review found and fixed 5 classes of issues.

---

## Findings & Fixes Applied

### 1. Correctness: `toDateString` used UTC instead of local date

**File**: `src/features/planning/PlanningChangeNewScreen.tsx`

`toDateString(d)` was implemented as `d.toISOString().slice(0, 10)`, which returns the **UTC** date string. For Belgian users (UTC+1/+2), a picker value late in the day could submit the wrong calendar day to the API.

**Fix**: Added `formatLocalDate(date: Date): string` to `src/core/date.ts` (backed by date-fns `format(date, "yyyy-MM-dd")`, which operates in local time). Replaced `toDateString` usage with `formatLocalDate`.

Also replaced `toTimeString` with the existing `formatTimeLabel(date: Date)` from `@/core/date` (same output, single source of truth).

### 2. Correctness: `addDays` local helper duplicated in 4 files, used `toISOString().slice()`

**Files**: `usePlanningShiftsScreen.ts`, `usePlanningShiftById.ts`, `usePlanningChangeNewScreen.ts`, `usePlanningSwapNewScreen.ts`

All four files had an inline `addDays` helper that parsed a `yyyy-MM-dd` at local noon but then converted back via `toISOString().slice(0, 10)` — reintroducing UTC drift for the result.

**Fix**: Added `addLocalDays(dateString, days): string` to `src/core/date.ts` using `resolveLocalDate` + `format(date, "yyyy-MM-dd")`. Removed all four duplicates and imported the shared helper. The 2-week query window is now timezone-safe.

### 3. Correctness: Hardcoded Dutch error messages in hooks

**Files**: `usePlanningSwapNewScreen.ts`, `usePlanningChangeNewScreen.ts`

Both hooks set `setError("Kon aanvraag niet indienen.")` on mutation failure — Dutch hardcoded, bypassing i18n.

**Fix**: Added `translate` import to both hooks; changed to `translate("planning:requests.submitError")`.

### 4. Unused `TextInput` import in `PlanningSwapNewScreen.tsx`

The refactoring to `TextField` left a dead `TextInput` import from `react-native`.

**Fix**: Removed the import.

### 5. Test quality: error paths not covered

The 19 original tests had no coverage of the `ok: false` mutation response path (the error row never appeared in a test).

**Fix**: Added 2 new tests (one for swap, one for change) using `act()` to properly flush the async state update and assert that the translated error key is rendered. Total tests: **21**.

---

## Verified API Payload Correctness

- **Swap form** (`usePlanningSwapNewScreen.ts`): submits `{ requesterShiftId, targetShiftId, note }` which the HTTP repo maps to `{ requesterShiftUniqueCode, targetShiftUniqueCode, note }` — matching `CreateShiftSwapRequestDto`. Correct.
- **Change form** (`usePlanningChangeNewScreen.ts`): submits `{ shiftId, requestedDate?, requestedStartTime?, requestedEndTime?, note? }` — all optional fields default to `undefined` (sent as `null` to API per HTTP repo). Matching `CreateShiftChangeRequestDto`. Correct.
- **Submit disabled**: swap requires `selectedShiftId AND targetShiftCode.trim()`; change requires only `selectedShiftId` (date/time are optional). Correct per API spec.
- **Date format**: `yyyy-MM-dd` (local, fixed in this pass). Correct.
- **Time format**: `HH:mm` from `formatTimeLabel`. Correct.

---

## i18n Completeness

All planning feature strings are routed through `translate()`. The `en`, `nl`, and `fr` locale files all have real translations (not Dutch copied into en/fr — verified by reading each file). No hardcoded user-facing strings remain in the feature after this pass.

---

## Compile & Test Output

```
tsc --noEmit: 0 errors
jest: 249 passed, 249 total (21 planning tests + 228 pre-existing)
```

---

## Known Limitations to Carry Forward

1. **Colleague-swap-target API gap**: The `targetShiftId` field on the swap form is a free-text input because there is no API endpoint to list a colleague's shifts. This is documented in the code with a label ("Colleague's shift ID") and the field is validated (non-empty required). A real UX solution would require a new API endpoint (GET /employee/planning/colleague-shifts or similar) — deferred.

2. **Live-backend E2E not yet run**: All tests run against mocked repositories. No end-to-end test against a staging or production backend has been executed. The HTTP repository layer (`planning.http.repository.ts`) maps payloads correctly per spec inspection, but this should be verified with a live backend before the first release.

3. **DateTimePicker `display="spinner"` on Android**: The picker uses `display="spinner"` which renders inline. On Android this may look different from native date/time dialogs. Consider `display="default"` or platform-specific values for production polish.
