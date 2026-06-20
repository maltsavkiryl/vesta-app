# Slice 5b — Planning Data Layer Report

## Status

COMPLETE. TypeScript: 0 errors. 4 commits: `4fd7fff`..`88dbc0f`.

---

## Files Created

| File | Purpose |
|---|---|
| `src/features/planning/data/planning.dto.ts` | Hand-written DTO interfaces matching the OpenAPI spec |
| `src/features/planning/data/planning.transformer.ts` | DTO → domain model mappers |
| `src/features/planning/data/planning.errors.ts` | `PlanningError` union |
| `src/features/planning/data/planning.repository.ts` | `PlanningRepository` interface (extends `ScheduleRepository`) |
| `src/features/planning/data/planning.http.repository.ts` | HTTP implementation via `httpClient` |
| `src/features/planning/data/planning.queries.ts` | TanStack Query read hooks |
| `src/features/planning/data/planning.mutations.ts` | TanStack Query mutation hooks |

**Modified:**
- `src/core/models.ts` — new domain models appended
- `src/composition/repositories.ts` — `planning` slot added + HTTP repo wired

---

## New Core Models (`src/core/models.ts`)

```ts
type LeaveRequestStatus = "submitted" | "approved" | "rejected" | "cancelled"

interface PlanningCallClaim { id, employeeId, employeeName, state, claimedAt, availabilityIntent }
interface PlanningCall { id, shiftId, employerCode, establishmentCode, mode, status, note?, createdAt, claims }
interface PlanningTodoCompletion { employeeId, employeeName, completedAt, channel }
interface PlanningTodo { id, establishmentCode, scope, date?, shiftId?, label, completionMode, sortOrder, requiredCount, completedCount, isComplete, completions }
interface LeaveBalance { calendarYear, statutoryDays, employerPolicyDays, totalDays }
interface LeaveRequest { id, employeeId, employerCode, leaveTypeId, leaveTypeName?, startDate, endDate, status, requestNotes?, decisionNotes? }
interface CreateLeaveRequestInput { leaveTypeId, startDate, endDate, requestNotes? }
```

---

## Repository Interface (`PlanningRepository` extends `ScheduleRepository`)

```ts
// Verbatim method signatures for the UI agent:

getShifts(accountId: string, params: GetShiftsParams): Promise<Shift[]>
// GetShiftsParams = { from: string, to: string, establishmentCode?: string, employeeCode?: string }

getOpenCalls(accountId: string, params: GetCallsParams): Promise<PlanningCall[]>
// GetCallsParams = { establishmentCode: string, from?: string, to?: string }

claimCall(accountId: string, input: ClaimCallInput): Promise<Result<void, PlanningError>>
// ClaimCallInput = { employerCode: string, establishmentCode: string, callCode: string }

getTodos(accountId: string, params: GetTodosParams): Promise<PlanningTodo[]>
// GetTodosParams = { establishmentCode: string, from?: string, to?: string }

completeTodo(accountId: string, input: CompleteTodoInput): Promise<Result<PlanningTodo, PlanningError>>
// CompleteTodoInput = { employerCode: string, establishmentCode: string, todoCode: string }

getLeaveBalances(accountId: string, params: GetLeaveBalancesParams): Promise<LeaveBalance[]>
// GetLeaveBalancesParams = { employerCode: string, employeeCode: string }

getLeaveRequests(accountId: string, params: GetLeaveRequestsParams): Promise<LeaveRequest[]>
// GetLeaveRequestsParams = { employerCode: string, employeeCode: string }

createLeaveRequest(accountId: string, params: CreateLeaveRequestParams): Promise<Result<LeaveRequest, PlanningError>>
// CreateLeaveRequestParams = { employerCode: string, employeeCode: string, input: CreateLeaveRequestInput }

getAvailability(accountId: string, employerCode: string, employeeCode: string): Promise<AvailabilityTemplate>
```

---

## Query Hooks (`planning.queries.ts`)

| Hook | Query Key | Return Shape |
|---|---|---|
| `usePlanningShiftsQuery(params)` | `["planning", accountId, "shifts", params]` | `{state: Shift[], isLoading, isError, refetch}` |
| `usePlanningCallsQuery(params)` | `["planning", accountId, "calls", params]` | `{state: PlanningCall[], isLoading, isError, refetch}` |
| `usePlanningTodosQuery(params)` | `["planning", accountId, "todos", params]` | `{state: PlanningTodo[], isLoading, isError, refetch}` |
| `useLeaveBalancesQuery(params)` | `["planning", accountId, "leave-balances", params]` | `{state: LeaveBalance[], isLoading, isError, refetch}` |
| `useLeaveRequestsQuery(params)` | `["planning", accountId, "leave-requests", params]` | `{state: LeaveRequest[], isLoading, isError, refetch}` |

All hooks guard on `Boolean(accountId) && Boolean(appRepositories.planning)`.

## Mutation Hooks (`planning.mutations.ts`)

| Hook | Invalidates | Notes |
|---|---|---|
| `useClaimCallMutation()` | `["planning", accountId, "calls", ...]` | Returns `Result<void, PlanningError>` |
| `useCompleteTodoMutation(todosParams)` | replaces cache entry | Optimistic update + rollback on error |
| `useCreateLeaveRequestMutation()` | leave-requests + leave-balances | Returns `Result<LeaveRequest, PlanningError>` |

---

## Composition Wiring

`appRepositories.planning` is:
- `null` in mock mode (no `API_URL`) — all query hooks skip via `enabled: false`
- `createPlanningHttpRepository(httpClient)` in HTTP mode

---

## Key Architecture Decisions

1. **accountId = employerUniqueCode**: The auth exchange stores the selected employer's `uniqueCode` as `accountId` in the token store. The HTTP repo uses it directly as the employer path param.
2. **Employee code**: Must be supplied by callers (screens/hooks) from the profile query (`/employee` → `EmployeeDto.uniqueCode`). Not stored in the session.
3. **Establishment code**: Comes from the objects themselves (`PlanningTodo.establishmentCode`, `PlanningCall.establishmentCode`) or is supplied by the screen as a parameter. The API does not have a generic "my establishment" shorthand.
4. **Todo completion endpoint**: The spec only shows an admin `PUT /todos/{code}`. The impl uses that as a best-effort endpoint for now. When a proper employee-complete endpoint is added to the spec, only `completeTodo` in the HTTP repo needs updating.
5. **ScheduleRepository stubs**: `PlanningHttpRepository` implements the full `ScheduleRepository` surface with stub methods that return failures. The composition layer keeps `schedule: createMockScheduleRepository()` for those fields; `planning` is a separate slot.

---

## Typecheck Output

```
TypeScript: No errors found
```

(Run: `pnpm compile` in `vesta-mobile`)

---

## Self-Review

- ✅ No DTO types leak into hooks/mutations — only domain models cross the transformer boundary
- ✅ Reads throw, writes return Result<T,E>
- ✅ PlanningError union is defined and used consistently
- ✅ Optimistic todo check-off with correct rollback
- ✅ Query keys follow the `["planning", accountId, scope, params]` pattern
- ✅ `enabled: Boolean(accountId) && Boolean(appRepositories.planning)` on all queries
- ✅ Commits staged only new planning files + minimal changes to models + repositories

## Concerns for UI Agent

1. **Employee code source**: UI screens using `getLeaveBalances`, `getLeaveRequests`, etc. must supply `employeeCode` — get it from `useProfileQuery()` → `state.profile.id` (which maps from `EmployeeDto.uniqueCode`).
2. **Establishment code source**: For calls/todos, the screen must know which establishment to query. In the current data model, the employee's employer has no establishment code in the domain. Consider fetching from a new `getEstablishments` endpoint or deriving from `Employer.code` once backend exposes it.
3. **Todo complete endpoint**: The current impl uses the admin PUT endpoint as a proxy. This will need updating if/when a proper employee-complete route is added.
4. **getAvailability** returns `AvailabilityTemplate` (weekday windows only). The overrides (`AvailabilityOverride[]`) are also available from the DTO but not yet exposed as a separate query hook — add if needed for the availability screen.
