# Phase 0 Report — vesta-mobile Planning i18n + Pickers

**Branch**: feat/mobile-11star-phase0  
**Date**: 2026-06-20  
**Commits**: 4 logical chunks

---

## 1. Forms — what each now uses for input

### PlanningSwapNewScreen
- **My shift picker**: existing `ShiftPickerRow` pressable (unchanged)
- **Colleague's shift ID**: replaced raw `TextInput` with `TextField` (labeled, `planning:requests.targetShiftId`)
- **Note**: replaced raw `TextInput` with `TextField` (labeled, `planning:requests.noteOptional`)
- **Submit label**: `planning:requests.submitting` while in flight, `planning:requests.shiftSwap` otherwise

### PlanningChangeNewScreen
- **My shift picker**: existing `ShiftPickerRow` pressable (unchanged)
- **Requested date**: inline `DateTimePicker` (`mode="date"`, `display="spinner"`) behind a `PickerRow` pressable — only one picker open at a time
- **Start time**: inline `DateTimePicker` (`mode="time"`, `minuteInterval=5`) behind `PickerRow`
- **End time**: inline `DateTimePicker` (`mode="time"`, `minuteInterval=5`) behind `PickerRow`
- **Note**: `TextField` (labeled, `planning:requests.noteOptional`)
- **Submit label**: `planning:requests.submitting` / `planning:requests.changeRequest`

Hook interface (`setRequestedDate`, `setRequestedStartTime`, `setRequestedEndTime`) unchanged — still accept strings. Date/time conversion (`toDateString` / `toTimeString`) happens in the screen component.

---

## 2. i18n keys added

All keys added to `en.ts` (source of truth), `nl.ts`, and `fr.ts`.

### `planning.sections.tabs` (5 new keys)
`shifts` / `todos` / `calls` / `requests` / `leave`

### `planning.todos` (2 new keys)
`sectionTodo` / `sectionDone`

### `planning.availability` (1 new key)
`editAccessibilityLabel`

### `planning.requests` (9 new keys)
`swapSubtitle` / `changeSubtitle` / `noteOptional` / `notePlaceholder` / `submitting` / `targetShiftId` / `desiredChange` / `requestedDate` / `requestedStartTime` / `requestedEndTime`

### `planning.leave` (4 new keys)
`statutory` / `employer` / `total` / `hoursLabel`

**Total**: 21 new keys × 3 locales = 63 new translation strings.

### No hardcoded planning strings remain
All Dutch strings in the 6 planning screens have been replaced with `translate()` calls.

---

## 3. Tests

**File**: `src/features/planning/planning.test.tsx`  
**Count**: 19 tests across 6 suites

| Suite | Tests |
|---|---|
| PlanningShiftsScreen | 3 (empty / shifts render / error) |
| PlanningTodosScreen | 3 (empty / render / complete mutation) |
| PlanningCallsScreen | 3 (empty / render / claim mutation) |
| PlanningSwapNewScreen | 3 (disabled / disabled+shift / enabled+submit) |
| PlanningChangeNewScreen | 4 (disabled / enabled / mutation / picker rows) |
| PlanningLeaveScreen | 3 (empty / balance card / error) |

---

## 4. Compile and test output

```
# pnpm compile
> tsc --noEmit -p . --pretty
(no output — 0 errors)

# pnpm test --testPathPattern="planning"
Tests: 19 passed, 19 total
Test Suites: 1 passed, 1 total
Time: 2.3s
```

---

## 5. Self-review / concerns

- **DateTimePicker display mode**: using `display="spinner"` to match the existing AvailabilityTimePickerScreen. On Android, `spinner` may appear differently — consider `display="default"` if Android QA shows issues.
- **Picker row UX**: tapping a picker row toggles it open/closed. Only one is open at a time. This is functional but not polished — a Phase 1 visual pass should consider a modal or sheet pattern.
- **targetShiftId approach**: still a free-text field since the employee API exposes no endpoint to enumerate colleague shifts. The label and structure are now correct. When a colleague-shift API is available, replace with an autocomplete/search picker.
- **i18n mock in tests**: the test mock returns `"key {}"` so assertions use regex patterns on key names rather than actual translated text. This is intentional and consistent with the existing test patterns in the codebase.
- **`planning.sections.tabs` structure**: added as a nested object inside `sections`. This keeps tab labels grouped logically but means the translate path is `planning:sections.tabs.shifts`. If a flat structure is preferred, keys can be moved to `planning.tabs.*`.
