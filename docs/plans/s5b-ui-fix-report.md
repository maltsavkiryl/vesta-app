# Slice 5b — UI Fix Report

## Status

COMPLETE. TypeScript: 0 errors (`pnpm compile`). Tests: 228 pass, 0 fail.
Commits: `1315c3d..df4fb0f` (8 commits on `feat/planning-employee-experience`).

---

## Fixes Applied

### C1 — claimCall employer code

**Problem**: `getOpenCalls` called `toPlanningCall(dto, "", "")` — empty employer and establishment codes.

**Fix**: `usePlanningCallsScreen.ts` passes `call.employerCode` to `handleClaim`; that value is still empty from the repo's empty string. Added `accountId` fallback in the screen hook:
```ts
const effectiveEmployerCode = employerCodeFromCall || accountId || ""
```
The `accountId` from `useAppSession()` is the employer unique code (session employer). Establishment code remains empty — this is the documented limitation from the data-fix report: `ShiftDto.establishmentUniqueCode` is not carried on `PlanningCallDto`, so the claim POST will target `/employers/{emp}/establishments//calls/{code}/claim` until the backend includes establishment in the call DTO.

---

### C2/C3 — Real shift swap + change forms; decide/cancel actions

**New files**:
- `src/features/planning/usePlanningSwapNewScreen.ts` — loads my upcoming shifts via `usePlanningScheduleQuery`; picks requester shift + colleague shift code; calls `useCreateShiftSwapMutation`
- `src/features/planning/PlanningSwapNewScreen.tsx` — shift picker list + colleague shift code field + note field
- `src/features/planning/usePlanningChangeNewScreen.ts` — loads my shifts; picks shift + optional date/time/note; calls `useCreateShiftChangeMutation`
- `src/features/planning/PlanningChangeNewScreen.tsx` — shift picker + optional change fields
- `src/app/(app)/planning-swap-new.tsx` — route file
- `src/app/(app)/planning-change-new.tsx` — route file

**Changed**:
- `src/app/(app)/_layout.tsx` — registered `planning-swap-new` and `planning-change-new` as `pageSheet` screens
- `src/features/planning/usePlanningRequestsScreen.ts` — `handleNewShiftSwap` → `/(app)/planning-swap-new`; `handleNewChangeRequest` → `/(app)/planning-change-new`; added `myEmployeeId` from `useProfileQuery`; wired `handleDecideSwap` via `useDecideShiftSwapMutation` and `handleCancelSwap` via `useCancelShiftSwapMutation`
- `src/features/planning/PlanningRequestsSections.tsx` — `PlanningSwapRequestRow` now accepts `myEmployeeId`, `onDecide`, `onCancel`; shows Accept/Reject buttons when `request.targetEmployeeId === myEmployeeId && status === "pending"`; shows Cancel when `request.requesterEmployeeId === myEmployeeId && status === "pending"`

---

### C4 — Live availability in AvailabilityTemplateScreen

**Changed**: `src/features/schedule/AvailabilityTemplateScreen.tsx`
- Replaced `useScheduleStateQuery` import with `usePlanningAvailabilityQuery`
- Template reads from `state?.template` (live planning data) instead of `state?.availabilityTemplate` (mock schedule store)
- On error, shows an error empty state with `planning:availability.selfServiceDisabled` as hint text

---

### C5 — Shift detail reads planning cache as fallback

**New file**: `src/features/planning/usePlanningShiftById.ts`
- Queries planning schedule (today → +14 days) and finds shift by ID

**Changed**: `src/features/schedule/useShiftDetailScreen.ts`
- Calls `usePlanningShiftById(id)` and falls back to it when the shift isn't in the schedule store

**Test fix**: `src/features/schedule/ScheduleEmptyStates.test.tsx`
- Added `jest.mock("@/features/planning/usePlanningShiftById", ...)` to prevent `useAppSession` error outside `AppProvider`

---

### I1 — i18n: translate() wired across all planning screens

All hardcoded Dutch literals replaced with `translate("planning:...")` calls. Files changed:
- `PlanningCallsScreen.tsx`
- `PlanningCallsSections.tsx`
- `PlanningShiftsScreen.tsx`
- `PlanningShiftsSections.tsx`
- `PlanningRequestsScreen.tsx`
- `PlanningRequestsSections.tsx`
- `PlanningLeaveScreen.tsx`
- `PlanningLeaveSections.tsx`
- `PlanningTodosScreen.tsx`
- `PlanningTodosSections.tsx`
- `PlanningHubScreen.tsx`

---

### I2 — Fix junk invalidation key in decideShiftSwap

**Changed**: `src/features/planning/data/planning.mutations.ts`

`useDecideShiftSwapMutation` `onSuccess` was invalidating `planningQueryKeys.schedule(accountId, { from: "", to: "" })` — a key nobody holds. Replaced with prefix invalidation:
```ts
void queryClient.invalidateQueries({ queryKey: ["planning", accountId, "schedule"] })
```
This clears all date-range variants from the cache so the schedule refreshes after a swap decision.

---

### I3 — dressNote/note brief in todos screen

**Changed**: `src/features/planning/usePlanningTodosScreen.ts` — exposes `note` (was already exposing `dressNote`)

**Changed**: `src/features/planning/PlanningTodosSections.tsx` — added `PlanningTodosBrief` component that renders a `GroupedSection` titled `translate("planning:todos.brief")` with dressNote and note content.

**Changed**: `src/features/planning/PlanningTodosScreen.tsx` — renders `<PlanningTodosBrief>` above the todo lists.

---

### I4 — Leave entitlement display improvements

**Changed**: `src/features/planning/PlanningLeaveSections.tsx`
- Year header uses `translate("planning:leave.currentYear", { year: String(year) })`
- Hours metric row only shown when `entitlementHours > 0`; when 0 the days row shows without confusion
- `source === 1` (Prisma) → shows `translate("planning:leave.syncedFromPayroll")` note in muted text

---

### M1 — Remove dead code

- Deleted `src/features/planning/usePlanningEmployeeCode.ts` (zero callers; all endpoints are self-scoped)
- Removed `PlanningNewLeaveCard` from `src/features/planning/PlanningLeaveSections.tsx` (unwired stub with no endpoint)

---

### M4 — conflict claimState message

**Changed**: `src/features/planning/PlanningCallsSections.tsx`
- `hasError` now includes `claimState === "conflict"`
- `errorMessage` chain adds conflict case
- Added `planning:calls.conflict` key to `en.ts`, `nl.ts`, `fr.ts`

---

### M5 — uncomplete todo action

**Changed**: `src/features/planning/usePlanningTodosScreen.ts`
- Added `handleUncomplete` via `useUncompleteTodoMutation`
- Exposes `isUncompleting`

**Changed**: `src/features/planning/PlanningTodosSections.tsx`
- `PlanningTodoItem` accepts `onUncomplete` prop; tapping a completed todo calls `onUncomplete`
- `disabled` only blocks while `isCompleting` (not when done)
- `PlanningTodosSection` threads `onUncomplete` through

**Changed**: `src/features/planning/PlanningTodosScreen.tsx`
- Passes `onUncomplete` to both `PlanningTodosSection` components

---

## Hook → Screen Wiring Map (final state)

| Screen | Hook(s) | Mutations |
|---|---|---|
| PlanningShiftsScreen | `usePlanningScheduleQuery` | — |
| PlanningTodosScreen | `usePlanningTodosQuery` | `useCompleteTodoMutation`, `useUncompleteTodoMutation` |
| PlanningCallsScreen | `usePlanningCallsQuery` | `useClaimCallMutation` |
| PlanningRequestsScreen | `useMyRequestsQuery` | `useDecideShiftSwapMutation`, `useCancelShiftSwapMutation` |
| PlanningLeaveScreen | `useLeaveEntitlementQuery` | — |
| PlanningSwapNewScreen | `usePlanningScheduleQuery` | `useCreateShiftSwapMutation` |
| PlanningChangeNewScreen | `usePlanningScheduleQuery` | `useCreateShiftChangeMutation` |
| AvailabilityTemplateScreen | `usePlanningAvailabilityQuery` | — |
| ShiftDetailScreen | `useScheduleStateQuery` + `usePlanningShiftById` | (existing schedule mutations) |

---

## Compile + Test

```
TypeScript: 0 errors (pnpm compile)
Tests: 228 passed, 0 failed (pnpm test)
```

---

## Self-Review

- No DTO types used in screen components
- All mutations return `Result<void, PlanningError>` and handle errors inline
- Query invalidation uses prefix keys, not stale exact keys
- `translate()` used for all user-facing strings (no hardcoded Dutch)
- Hooks are thin shells; UI components are pure renderers
- Dead code (`usePlanningEmployeeCode`, `PlanningNewLeaveCard`) removed

---

## Remaining Concerns

1. **Establishment code in claimCall**: `PlanningCallDto` does not carry `establishmentUniqueCode`. Claim POST URL becomes `/employers/{emp}/establishments//calls/{code}/claim`. Fix requires either backend change (include establishment in call DTO) or a secondary request to resolve the shift's establishment.

2. **Swap target shift code**: `PlanningSwapNewScreen` asks user to type a colleague's shift unique code as free text. This is a poor UX; a future improvement would be a searchable employee→shift selector if the backend exposes a suitable endpoint.

3. **AvailabilityTemplateDayScreen write path**: The per-day edit (`/(app)/availability-template/[day]`) still calls `saveAvailabilityOverride` from schedule actions, which is a no-op in the planning HTTP repo. Full planning availability write requires wiring `useSaveAvailabilityMutation` into that screen.

4. **403 on availability fetch**: The `usePlanningAvailabilityQuery` throws on a 403 (reads throw). `AvailabilityTemplateScreen` shows an error state with the selfServiceDisabled message, but it can't distinguish 403 from 500 at the query level.
