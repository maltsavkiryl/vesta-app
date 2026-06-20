# Vesta Mobile — Planning / Employee Experience (slice 5b)

Wire the (currently mocked) `schedule` feature to the REAL backend employee planning API
(`/employee/planning/...` on `API_URL` which already ends in `/api/v1`) and add the missing
employee capabilities: claim open calls, swap shifts, request changes, check off tasks, view leave.

Backend contract: `/Users/kirylmaltsav/Workspace/vestatime-api/apps/api/contracts/openapi/Vesta.Workforce.Api.json`
(employee endpoints under `/employee/planning/*` + the call claim at `/employers/{e}/establishments/{est}/calls/{c}/claim`).

## Endpoints (employee-auth, self-scoped — Bearer token already attached by httpClient)
- GET  /employee/planning/schedule?from=&to=        → my shifts
- GET  /employee/planning/availability?from=&to=    → my resolved availability
- PUT  /employee/planning/availability               → submit my availability (windows+overrides; 403 if rule off)
- GET  /employee/planning/todos                      → my todos today (+ brief: dressNote/note)
- POST /employee/planning/todos/{code}/complete | /uncomplete
- GET  /employee/planning/calls/open?from=&to=       → open calls I can claim
- POST /employers/{emp}/establishments/{est}/calls/{code}/claim   → claim a call
- POST /employee/shift-swaps                          → create swap request
- POST /employee/shift-swaps/{code}/decide            → accept/reject (counterparty)
- POST /employee/shift-changes                        → create change request
- GET  /employee/planning/requests (or /employee/requests) → my swap+change requests
- GET  /employee/planning/leave                       → my current-year entitlement (hours/days/source)

## Approach
1. **Data layer** (`src/features/planning/data/` or extend `schedule`): hand-written `*Dto` interfaces matching the
   spec, transformers DTO→`@/core/models` (Shift/AvailabilityTemplate/AvailabilityOverride/RequestItem + new
   PlanningCall/PlanningTodo/LeaveEntitlement models), an **HTTP repository** implementing the existing
   `ScheduleRepository` interface (extended with the new methods) via `httpClient`, returning `Result<T,Error>` for
   writes. queries (`enabled: Boolean(accountId)`, key `[feature, accountId, scope]`) + mutations (invalidate on success).
   Wire into `src/composition/repositories.ts` (replace `createMockScheduleRepository()` with the HTTP repo; keep mock
   as fallback for any endpoint not yet live). Date handling via `@/core/date` (resolveLocalDate/getLocalToday), date-fns subpath imports.
2. **UI**: wire existing Schedule / Availability / ShiftDetail / Request screens to the live data; ADD: open-calls list + claim action, today's todos + check-off (optimistic), leave summary card, swap/change request flows (create + see my requests). Use the design system (AppScrollScreen, Text, etc.), loading/error/empty states, large touch targets. Navigation via expo-router (extend the schedule tab + stack screens).
3. **i18n**: add `planning:*` keys to en/nl/fr (Dutch primary). 4. **Tests**: light integration tests per repo policy (screens render, mutation wiring), follow jest-expo + testing-library + the test/setup mocks.

Follow AGENTS.md + `.agents/skills` repo policy: feature-owned repos/workflows, thin shells, Result<T,E> for domain errors, error union types, decompose large screens into hooks+components.
