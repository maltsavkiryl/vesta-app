# Slice 5b — Planning UI Report

## Status

COMPLETE. TypeScript: 0 errors. 4 commits: `6f89a88`..`8b87fbd`.

---

## Screens / Components Built

### 1. My Schedule — `PlanningShiftsScreen`

- **Screen**: `src/features/planning/PlanningShiftsScreen.tsx`
- **Hook**: `src/features/planning/usePlanningShiftsScreen.ts`
- **Sections**: `src/features/planning/PlanningShiftsSections.tsx` (`PlanningShiftCard`, `PlanningAgendaSection`, `PlanningShiftsEmpty`)
- **Data hook**: `usePlanningShiftsQuery({ from: today, to: today+14d, employeeCode })` from `planning.queries.ts`
- **Employee code**: sourced via `usePlanningEmployeeCode` → `useProfileQuery().data?.id`
- States: loading (native pull-to-refresh), error+retry, empty, populated agenda list
- Reuses `groupUpcomingShiftsByWeek` from `schedule.utils.ts`; each shift is a `PlanningShiftCard` (date/role/venue/note)

### 2. Today's Tasks — `PlanningTodosScreen`

- **Screen**: `src/features/planning/PlanningTodosScreen.tsx`
- **Hook**: `src/features/planning/usePlanningTodosScreen.ts`
- **Sections**: `src/features/planning/PlanningTodosSections.tsx` (`PlanningTodoItem`, `PlanningTodosSection`, `PlanningTodosEmpty`)
- **Data hooks**: `usePlanningTodosQuery` + `useCompleteTodoMutation` (optimistic, from `planning.mutations.ts`)
- Checkbox rows with strikethrough on complete; pending/completed split sections
- Large tap targets (minHeight: 52); accessible role="checkbox" + state.checked
- Optimistic UI: todo flips immediately, rolls back on API error

### 3. Open Calls — `PlanningCallsScreen`

- **Screen**: `src/features/planning/PlanningCallsScreen.tsx`
- **Hook**: `src/features/planning/usePlanningCallsScreen.ts`
- **Sections**: `src/features/planning/PlanningCallsSections.tsx` (`PlanningCallCard`, `PlanningCallsEmpty`)
- **Data hooks**: `usePlanningCallsQuery` + `useClaimCallMutation`
- Per-call claim state machine: `idle → claiming → claimed | error | already-claimed | forbidden`
- Error messages shown inline (Dutch); claimed badge shown; button disabled after claim
- `PlanningError.type` (not `.kind`) used correctly from `planning.errors.ts`

### 4. Availability — reuses existing stack screens

- The existing `/(app)/availability/[date]` and `/(app)/availability-template` stack screens are already wired and functional.
- `PlanningHubScreen` exposes a calendar icon button that pushes `/(app)/availability-template` directly.
- No new availability screen was built — the existing `AvailabilityScreen` and `AvailabilityTemplateScreen` serve this role. They use the mock schedule state for template data (backed by `useScheduleStateQuery` from the mock repo). When the planning repo exposes `getAvailability`, that should update these screens.

### 5. Requests — `PlanningRequestsScreen`

- **Screen**: `src/features/planning/PlanningRequestsScreen.tsx`
- **Hook**: `src/features/planning/usePlanningRequestsScreen.ts`
- **Sections**: `src/features/planning/PlanningRequestsSections.tsx`
- Shows leave requests from `useLeaveRequestsQuery` + schedule requests from `useScheduleStateQuery`
- Two quick-action shortcuts: "Shift ruilen" → `/(app)/request?category=shift_change`; "Wijziging aanvragen" → `/(app)/request?category=time_off`
- These reuse the existing `RequestScreen` (fully functional for creating requests)
- Status badges: Goedgekeurd/Afgewezen/In behandeling/Geannuleerd (Dutch)

### 6. Leave — `PlanningLeaveScreen`

- **Screen**: `src/features/planning/PlanningLeaveScreen.tsx`
- **Hook**: `src/features/planning/usePlanningLeaveScreen.ts`
- **Sections**: `src/features/planning/PlanningLeaveSections.tsx`
- **Data hooks**: `useLeaveBalancesQuery` + `useLeaveRequestsQuery` + `useCreateLeaveRequestMutation`
- `PlanningLeaveBalanceCard`: MetricGrid showing statutory/employer/total days; "synced from payroll" note
- Current-year balance extracted via `calendarYear === new Date().getFullYear()`
- Leave creation form (simplified: date range + notes, leaveTypeId=1 as default); success state with dismiss
- `PlanningLeaveBalanceEmpty` when no balance available

### 7. Hub + Navigation — `PlanningHubScreen`

- **Screen**: `src/features/planning/PlanningHubScreen.tsx`
- 5-tab `AppSegmentedControl` switching: Planning | Taken | Oproepen | Aanvragen | Verlof
- Calendar button top-right for availability template access
- The existing `schedule` tab (`src/app/(app)/(tabs)/schedule.tsx`) now renders `PlanningHubScreen`
- Added stack route registrations in `src/app/(app)/_layout.tsx`: `planning-todos`, `planning-calls`, `planning-requests`, `planning-leave` (for deep-link use)
- Route entry files: `src/app/(app)/planning-todos.tsx` etc.

---

## Navigation Changes

| Route | Change |
|---|---|
| `(tabs)/schedule` | Now renders `PlanningHubScreen` instead of `ScheduleScreen` |
| `(app)/planning-todos` | New stack screen → `PlanningTodosScreen` |
| `(app)/planning-calls` | New stack screen → `PlanningCallsScreen` |
| `(app)/planning-requests` | New stack screen → `PlanningRequestsScreen` |
| `(app)/planning-leave` | New stack screen → `PlanningLeaveScreen` |
| `(app)/availability-template` | Unchanged — reused from existing stack |
| `(app)/availability/[date]` | Unchanged — reused from existing stack |

---

## i18n Keys Added (`planning` namespace)

All three locales updated: `src/i18n/en.ts`, `src/i18n/nl.ts`, `src/i18n/fr.ts`.

Sections: `planning.title`, `planning.sections.*`, `planning.schedule.*`, `planning.calls.*`, `planning.todos.*`, `planning.availability.*`, `planning.requests.*`, `planning.leave.*`

Dutch primary (per spec): "Mijn planning", "Taken voor vandaag", "Open oproepen", "Claimen", "Beschikbaarheid", "Shift ruilen", "Wijziging aanvragen", "Mijn aanvragen", "Verlof".

Note: Screens currently use hardcoded Dutch strings directly (not via `t()` calls) to match the pattern found in the existing schedule screens. If i18n `t()` wiring is required, that would be a follow-up pass.

---

## Data-Layer Gaps Found

| Gap | Detail | Workaround |
|---|---|---|
| **establishmentCode** | Both `usePlanningCallsQuery` and `usePlanningTodosQuery` require `establishmentCode`, but the employee profile/session has no "my establishment" shorthand. | Fall back to `accountId` (employer code). API may return empty arrays — acceptable for v1. Documented in screen-hook comments. |
| **Leave type picker** | `CreateLeaveRequestInput.leaveTypeId` is required but there is no `getLeaveTypes` endpoint in the data layer. | Hardcode `leaveTypeId: 1` as the default. A leave type selector should be added once the endpoint exists. |
| **Availability overrides query** | `getAvailability` returns `AvailabilityTemplate` (weekly template only). Overrides (`AvailabilityOverride[]`) are in the DTO but not exposed as a separate query hook. | The existing availability screen reads overrides from the mock schedule state. Wire to `getAvailability` when backend exposes a combined endpoint. |
| **Shift swap / change request read** | No planning API endpoint exists for reading submitted shift-swap or change requests. | Surface these from the existing mock `scheduleState.requests`. |
| **Employee todo complete endpoint** | Data report noted the current impl uses the admin PUT endpoint as a proxy. | No UI change needed — the UI calls `completeTodo` correctly; only the HTTP repo needs updating. |

---

## Typecheck Output

```
TypeScript: No errors found
```

(Run: `pnpm tsc --noEmit` in `vesta-mobile`)

---

## Self-Review

- ✅ Thin shell screens + screen-hooks + section components pattern (all screens < 60 lines)
- ✅ No DTO types in components — all domain models from `@/core/models`
- ✅ Design tokens via `useDesignTokens()` — no hardcoded colors
- ✅ Large native touch targets (minHeight ≥ 52px on all interactive rows)
- ✅ Loading/error/empty states on all screens
- ✅ Optimistic todo completion with rollback
- ✅ Claim state machine covers idle/claiming/claimed/error/already-claimed/forbidden
- ✅ i18n keys added to all 3 locales
- ✅ Navigation wired: hub tab + stack routes
- ✅ Commits staged only planning files + i18n + navigation — no unrelated files
- ✅ `PlanningError.type` (not `.kind`) used correctly
- ✅ Text `weight` values limited to valid enum (fixed `"regular"` → `"normal"` in PlanningTodosSections)

## Concerns

1. **Five-segment control usability**: `AppSegmentedControl` with 5 items may be cramped on narrow screens (SE, older Androids). Consider splitting into a 3+2 layout or a scroll-based tab bar if usability testing surfaces this.
2. **establishmentCode fallback**: Using `accountId` (employer code) as `establishmentCode` is a semantic mismatch. The backend needs to expose the employee's own establishment — without it, todos/calls will return empty lists in production.
3. **Leave type picker absent**: The current leave form submits `leaveTypeId: 1` unconditionally. A proper leave type selector requires a `GET /leave-types` endpoint in the data layer.
4. **Availability not wired to planning repo**: The weekly template screen still reads from the mock schedule state. Once `getAvailability` from `PlanningHttpRepository` is tested end-to-end, `AvailabilityTemplateScreen` should be updated to use it.
5. **Five-tab hub vs separate screens**: The hub embeds all sub-screens as inline renders. If any sub-screen has heavy list content, this may cause scroll conflicts. Alternative: use push navigation for all sub-screens and keep the hub as a menu/dashboard.
