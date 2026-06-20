# S5b Claim Fix Report

## Problem

`claimCall` was posting to `/employers//establishments//calls/{code}/claim` with empty
employer and establishment path segments because `getOpenCalls` passed `""` for both codes
when constructing domain `PlanningCall` objects.

## Root cause

1. `PlanningCallDto` did not include `establishmentUniqueCode` — the backend field was absent
   from the hand-written DTO interface.
2. `getOpenCalls` in the HTTP repository called `toPlanningCall(dto, "", "")`, hardcoding
   empty strings for both employer and establishment codes.
3. The session employer (`accountId`) was never forwarded from the query hook to the
   repository function.

## Files changed

| File | Change |
|---|---|
| `src/features/planning/data/planning.dto.ts` | Added `establishmentUniqueCode: string` to `PlanningCallDto` |
| `src/features/planning/data/planning.repository.ts` | Added optional `employerCode?: string` to `GetOpenCallsParams` |
| `src/features/planning/data/planning.queries.ts` | `usePlanningCallsQuery` now merges `accountId` as `employerCode` into params before calling `getOpenCalls` |
| `src/features/planning/data/planning.http.repository.ts` | `getOpenCalls` reads `params.employerCode` and `dto.establishmentUniqueCode`; passes real codes to `toPlanningCall` |

No changes required in `planning.transformer.ts`, core models, `PlanningCallsScreen`, or
`usePlanningCallsScreen` — those were already correctly wired to use `call.employerCode` and
`call.establishmentCode` from the domain model.

## Claim URL now built

```
POST /employers/{accountId}/establishments/{dto.establishmentUniqueCode}/calls/{dto.uniqueCode}/claim
```

Both segments are now populated from real data:
- employer = session `accountId` forwarded via `GetOpenCallsParams.employerCode`
- establishment = `PlanningCallDto.establishmentUniqueCode` from the backend response

## Compile result

```
tsc --noEmit -p . --pretty
(exit 0 — 0 errors)
```

## Test result

```
Test Suites: 1 failed (pre-existing biometric timeout in app-lock-provider.test.tsx), 54 passed, 55 total
Tests:       1 failed (pre-existing), 227 passed, 228 total
```

The single failing test (`AppLockProvider › gates the app behind a biometric unlock…`) is a
pre-existing flaky timeout in an unrelated provider — it existed on HEAD before this fix and
is not caused by these changes.

## Commit

`4714390` on `feat/planning-employee-experience`
