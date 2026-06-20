# Slice 5b — Data Layer Fix Report

## Status

COMPLETE. TypeScript: 0 errors. All 18 files modified, committed in 2 logical commits.

---

## Problem Summary

The original data layer was built against a stale OpenAPI contract that lacked the `/employee/planning/*` paths. The implementer wired to employer-scoped leave endpoints (`/employers/{emp}/employees/{code}/leave-balances`, `/leave-requests`, `/availability`) and invented shapes that don't exist in the real API. This fix rewrites the entire data layer against the correct contract at `/tmp/Vesta.Workforce.Api.correct.json`.

---

## Corrected Endpoint → Method Mapping

| Method | Endpoint | Repository Method | Hook |
|---|---|---|---|
| GET | `/employee/planning/schedule?from=&to=` | `getMySchedule(params)` | `usePlanningScheduleQuery(params)` |
| GET | `/employee/planning/availability` | `getMyAvailability()` | `usePlanningAvailabilityQuery()` |
| PUT | `/employee/planning/availability` | `saveMyAvailability(template, overrides)` | `useSaveAvailabilityMutation()` |
| GET | `/employee/planning/todos` | `getMyTodos()` | `usePlanningTodosQuery()` |
| POST | `/employee/planning/todos/{todoCode}/complete` | `completeTodo({todoCode})` | `useCompleteTodoMutation()` |
| POST | `/employee/planning/todos/{todoCode}/uncomplete` | `uncompleteTodo({todoCode})` | `useUncompleteTodoMutation()` |
| GET | `/employee/planning/calls/open?from=&to=` | `getOpenCalls(params)` | `usePlanningCallsQuery(params?)` |
| POST | `/employers/{emp}/establishments/{est}/calls/{code}/claim` | `claimCall(input)` | `useClaimCallMutation(callsParams?)` |
| GET | `/employee/planning/requests` | `getMyRequests()` | `useMyRequestsQuery()` |
| POST | `/employee/planning/shift-swaps` | `createShiftSwap(params)` | `useCreateShiftSwapMutation()` |
| POST | `/employee/planning/shift-swaps/{swapCode}/decide` | `decideShiftSwap(params)` | `useDecideShiftSwapMutation()` |
| POST | `/employee/planning/shift-swaps/{swapCode}/cancel` | `cancelShiftSwap(swapCode)` | `useCancelShiftSwapMutation()` |
| POST | `/employee/planning/shift-changes` | `createShiftChange(params)` | `useCreateShiftChangeMutation()` |
| GET | `/employee/planning/leave` | `getLeaveEntitlement()` | `useLeaveEntitlementQuery()` |

Note: `claimCall` is the only method that still uses the employer+establishment URL. The employer and establishment codes are carried on the `PlanningCall` domain model so the UI can pass them through.

---

## Final Repository Interface

```ts
interface PlanningRepository extends ScheduleRepository {
  getMySchedule(params: GetScheduleParams): Promise<Shift[]>
  // GetScheduleParams = { from: string, to: string }

  getMyAvailability(): Promise<{ template: AvailabilityTemplate; overrides: Record<string, AvailabilityOverride> }>

  saveMyAvailability(template: AvailabilityTemplate, overrides: AvailabilityOverride[]): Promise<Result<void, PlanningError>>

  getMyTodos(): Promise<PlanningTodosResult>

  completeTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>>
  // CompleteTodoInput = { todoCode: string }

  uncompleteTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>>

  getOpenCalls(params: GetOpenCallsParams): Promise<PlanningCall[]>
  // GetOpenCallsParams = { from?: string, to?: string }

  claimCall(input: ClaimCallInput): Promise<Result<void, PlanningError>>
  // ClaimCallInput = { employerCode: string, establishmentCode: string, callCode: string }

  getMyRequests(): Promise<MyRequests>

  createShiftSwap(params: CreateShiftSwapParams): Promise<Result<void, PlanningError>>
  // CreateShiftSwapParams = { input: CreateShiftSwapInput }
  // CreateShiftSwapInput = { requesterShiftId, targetShiftId, note? }

  decideShiftSwap(params: DecideShiftSwapParams): Promise<Result<void, PlanningError>>
  // DecideShiftSwapParams = { swapCode: string, accept: boolean, note? }

  cancelShiftSwap(swapCode: string): Promise<Result<void, PlanningError>>

  createShiftChange(params: CreateShiftChangeParams): Promise<Result<void, PlanningError>>
  // CreateShiftChangeParams = { input: CreateShiftChangeInput }
  // CreateShiftChangeInput = { shiftId, requestedDate?, requestedStartTime?, requestedEndTime?, note? }

  getLeaveEntitlement(): Promise<LeaveEntitlement>
}
```

---

## Query Hooks

| Hook | Query Key | Return Shape |
|---|---|---|
| `usePlanningScheduleQuery(params)` | `["planning", accountId, "schedule", params]` | `{state: Shift[] \| undefined, isLoading, isError, refetch}` |
| `usePlanningAvailabilityQuery()` | `["planning", accountId, "availability"]` | `{state: {template, overrides} \| undefined, ...}` |
| `usePlanningTodosQuery()` | `["planning", accountId, "todos"]` | `{state: PlanningTodosResult \| undefined, ...}` |
| `usePlanningCallsQuery(params?)` | `["planning", accountId, "calls", params]` | `{state: PlanningCall[] \| undefined, ...}` |
| `useMyRequestsQuery()` | `["planning", accountId, "requests"]` | `{state: MyRequests \| undefined, ...}` |
| `useLeaveEntitlementQuery()` | `["planning", accountId, "leave"]` | `{state: LeaveEntitlement \| undefined, ...}` |

---

## Mutation Hooks

| Hook | Invalidates | Notes |
|---|---|---|
| `useClaimCallMutation(callsParams?)` | `calls` key | Returns `Result<void, PlanningError>` |
| `useCompleteTodoMutation()` | `todos` key (invalidate + optimistic) | Optimistic: flips `isCompletedByMe = true` |
| `useUncompleteTodoMutation()` | `todos` key (invalidate + optimistic) | Optimistic: flips `isCompletedByMe = false` |
| `useCreateShiftSwapMutation()` | `requests` key | Returns `Result<void, PlanningError>` |
| `useDecideShiftSwapMutation()` | `requests` + `schedule` keys | Returns `Result<void, PlanningError>` |
| `useCancelShiftSwapMutation()` | `requests` key | Returns `Result<void, PlanningError>` |
| `useCreateShiftChangeMutation()` | `requests` key | Returns `Result<void, PlanningError>` |
| `useSaveAvailabilityMutation()` | `availability` key | Returns `Result<void, PlanningError>` |

---

## New Domain Models (`src/core/models.ts`)

```ts
interface PlanningCall { id, shiftId, employerCode, establishmentCode, mode, status, note?, createdAt, claims }
interface PlanningCallClaim { id, employeeId, employeeName, state, claimedAt, availabilityIntent }

interface PlanningTodo { id, scope, date?, shiftId?, label, completionMode, sortOrder, isCompletedByMe }
interface PlanningTodosResult { todos: PlanningTodo[], dressNote?, note? }

interface ShiftSwapRequest { id, requesterShiftId, targetShiftId, requesterEmployeeId, targetEmployeeId, status, note?, createdAt }
interface CreateShiftSwapInput { requesterShiftId, targetShiftId, note? }
interface DecideShiftSwapInput { swapCode, accept, note? }

interface ShiftChangeRequest { id, shiftId, employeeId, status, requestedDate?, requestedStartTime?, requestedEndTime?, note?, createdAt }
interface CreateShiftChangeInput { shiftId, requestedDate?, requestedStartTime?, requestedEndTime?, note? }

interface MyRequests { swapRequests: ShiftSwapRequest[], changeRequests: ShiftChangeRequest[] }

interface LeaveEntitlement { calendarYear, statutoryDays, employerPolicyDays, totalDays, entitlementHours, source }
```

---

## Removed (Wrong Leave-Request Stuff)

The following were removed because no `/employee/planning/leave-request` endpoint exists:

| Removed | Replacement |
|---|---|
| `useLeaveBalancesQuery` | `useLeaveEntitlementQuery` |
| `useLeaveRequestsQuery` | `useMyRequestsQuery` (for swap/change requests) |
| `useCreateLeaveRequestMutation` | (no endpoint — removed entirely) |
| `LeaveBalance`, `LeaveRequest`, `LeaveRequestStatus` (models) | `LeaveEntitlement`, `ShiftSwapRequest`, `ShiftChangeRequest`, `MyRequests` |
| `LeaveBalanceDto`, `LeaveRequestDto`, `CreateLeaveRequestDto`, `PagedResultDto` (DTOs) | `MyLeaveEntitlementDto`, `ShiftSwapRequestDto`, `ShiftChangeRequestDto`, `MyRequestsDto` |
| `toLeaveBalance`, `toLeaveRequest`, `toLeaveRequests` (transformers) | `toLeaveEntitlement`, `toShiftSwapRequest`, `toShiftChangeRequest`, `toMyRequests` |
| `PlanningTodoDto` (wrong shape) | `KioskTodoDto` (employee-facing: `isCompletedByMe` instead of `requiredCount`/`completedCount`/`completions`) |
| `PlanningTodoCompletionDto`, `PlanningTodoCompletion` (model) | removed (not in employee API) |
| `getShifts(accountId, params)` (employer-scoped) | `getMySchedule(params)` (self-scoped) |
| `getTodos(accountId, params)` (requires `establishmentCode`) | `getMyTodos()` (self-scoped, no params) |
| `getOpenCalls(accountId, params)` (requires `establishmentCode`) | `getOpenCalls(params)` (self-scoped, date params only) |
| `getLeaveBalances`, `getLeaveRequests`, `createLeaveRequest` | `getLeaveEntitlement()` |
| `getAvailability(accountId, employerCode, employeeCode)` | `getMyAvailability()` |
| `GetShiftsParams`, `GetCallsParams`, `GetTodosParams`, `GetLeaveBalancesParams`, `GetLeaveRequestsParams`, `CreateLeaveRequestParams` | `GetScheduleParams`, `GetOpenCallsParams`, `CompleteTodoInput` (simplified) |

---

## Typecheck Output

```
TypeScript: 0 errors (pnpm compile, tsc --noEmit)
```

---

## Self-Review

- All self-scoped GET endpoints have no employer/establishment in the URL
- claimCall is correctly the only method still using employer+establishment path
- PlanningTodo.isCompletedByMe (not isComplete) throughout
- PlanningTodosResult wrapper properly extracted in screen hooks
- Result<T,E> on all writes; reads throw
- Optimistic updates for completeTodo/uncompleteTodo with rollback
- Query keys: `["planning", accountId, scope]` — no stale params
- No DTO types leak into screens
- composition/repositories.ts unchanged — planning slot still wires createPlanningHttpRepository(httpClient)

## UI Files Updated (alongside data layer)

These screen/hook files were broken by the data-layer changes and were fixed in the same commit:

| File | What Changed |
|---|---|
| `src/features/planning/usePlanningShiftsScreen.ts` | `usePlanningShiftsQuery` → `usePlanningScheduleQuery`; removed `employeeCode` param (self-scoped) |
| `src/features/planning/usePlanningCallsScreen.ts` | Removed `GetCallsParams` / `establishmentCode` fallback; `usePlanningCallsQuery()` now takes no required args |
| `src/features/planning/usePlanningTodosScreen.ts` | Removed `GetTodosParams` / `establishmentCode`; `todos` is now derived from `PlanningTodosResult.todos`; `isComplete` → `isCompletedByMe` |
| `src/features/planning/usePlanningLeaveScreen.ts` | Replaced `useLeaveBalancesQuery` + `useLeaveRequestsQuery` + `useCreateLeaveRequestMutation` with `useLeaveEntitlementQuery`; removed create-leave-request flow |
| `src/features/planning/usePlanningRequestsScreen.ts` | Replaced `useLeaveRequestsQuery` with `useMyRequestsQuery`; removed schedule requests merge |
| `src/features/planning/PlanningLeaveSections.tsx` | Replaced `LeaveBalance`/`LeaveRequest` with `LeaveEntitlement`; removed `PlanningLeaveRequestsSection`/`PlanningLeaveRequestRow` |
| `src/features/planning/PlanningLeaveScreen.tsx` | Removed `PlanningLeaveRequestsSection` usage; simplified to entitlement-only display |
| `src/features/planning/PlanningTodosSections.tsx` | `todo.isComplete` → `todo.isCompletedByMe`; removed `requiredCount`/`completedCount` display |
| `src/features/planning/PlanningTodosScreen.tsx` | `screen.todos` now comes from screen hook as plain `PlanningTodo[]` (no `.length` on `PlanningTodosResult`) |
| `src/features/planning/PlanningRequestsSections.tsx` | Replaced `LeaveRequest` with `ShiftSwapRequest`/`ShiftChangeRequest`; `PlanningRequestsListSection` now takes `requests: MyRequests` |
| `src/features/planning/PlanningRequestsScreen.tsx` | Updated `PlanningRequestsListSection` props: `leaveRequests`/`scheduleRequests` → `requests` |

## Concerns / Follow-ups

1. **PlanningCall.employerCode/establishmentCode**: The `GET /employee/planning/calls/open` response does not include these fields. The HTTP repo currently passes empty strings. The UI must supply them from context (the employee's active employer = `accountId`). The establishment code requires knowing which establishment the call's shift belongs to — this is on `ShiftDto.establishmentUniqueCode`. A future improvement: fetch the shift alongside the call and extract the establishment code, or have the backend include it in the call DTO.

2. **Availability overrides domain model**: `AvailabilityOverride.status` uses `AvailabilityStatus` ("available"/"preferred"/"unavailable") but `AvailabilityOverrideDto.confirmed` has no equivalent. The `fromAvailabilityOverride` transformer sets `confirmed: false` always — once the backend semantics are clearer this may need updating.

3. **`usePlanningEmployeeCode` hook**: Now unused by any planning screen (all endpoints are self-scoped). It can be removed in a cleanup pass if no other feature needs it.

4. **`PlanningNewLeaveCard` component**: Kept as a stub in `PlanningLeaveSections.tsx` but no longer wired in the leave screen. Safe to remove in a future cleanup.
