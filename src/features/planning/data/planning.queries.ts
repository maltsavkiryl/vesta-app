/**
 * TanStack Query hooks for the employee planning feature.
 *
 * All endpoints are self-scoped (GET /employee/planning/*) — no employer or
 * establishment code in the URL. The employee is identified by their JWT.
 *
 * Key structure: ["planning", accountId, scope]
 * All read hooks surface { state, isLoading, isError, refetch }.
 *
 * accountId is used only as a query-key seed to scope cache entries to the
 * active session — it does not appear in the request URL.
 */

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

import type { GetOpenCallsParams, GetScheduleParams } from "./planning.repository"

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const planningQueryKeys = {
  all: (accountId: string | null) => ["planning", accountId] as const,
  schedule: (accountId: string | null, params: GetScheduleParams) =>
    ["planning", accountId, "schedule", params] as const,
  availability: (accountId: string | null) =>
    ["planning", accountId, "availability"] as const,
  todos: (accountId: string | null) =>
    ["planning", accountId, "todos"] as const,
  calls: (accountId: string | null, params: GetOpenCallsParams) =>
    ["planning", accountId, "calls", params] as const,
  requests: (accountId: string | null) =>
    ["planning", accountId, "requests"] as const,
  leave: (accountId: string | null) =>
    ["planning", accountId, "leave"] as const,
}

// ---------------------------------------------------------------------------
// Schedule  (GET /employee/planning/schedule?from=&to=)
// ---------------------------------------------------------------------------

export function usePlanningScheduleQuery(params: GetScheduleParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getMySchedule(params),
    queryKey: planningQueryKeys.schedule(accountId, params),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}

// ---------------------------------------------------------------------------
// Availability  (GET /employee/planning/availability)
// ---------------------------------------------------------------------------

export function usePlanningAvailabilityQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getMyAvailability(),
    queryKey: planningQueryKeys.availability(accountId),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}

// ---------------------------------------------------------------------------
// Todos  (GET /employee/planning/todos)
// ---------------------------------------------------------------------------

export function usePlanningTodosQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getMyTodos(),
    queryKey: planningQueryKeys.todos(accountId),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}

// ---------------------------------------------------------------------------
// Open Calls  (GET /employee/planning/calls/open?from=&to=)
// ---------------------------------------------------------------------------

export function usePlanningCallsQuery(params: GetOpenCallsParams = {}) {
  const { accountId } = useAppSession()
  const paramsWithEmployer: GetOpenCallsParams = accountId
    ? { ...params, employerCode: accountId }
    : params
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getOpenCalls(paramsWithEmployer),
    queryKey: planningQueryKeys.calls(accountId, params),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}

// ---------------------------------------------------------------------------
// My Requests  (GET /employee/planning/requests)
// ---------------------------------------------------------------------------

export function useMyRequestsQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getMyRequests(),
    queryKey: planningQueryKeys.requests(accountId),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}

// ---------------------------------------------------------------------------
// Leave Entitlement  (GET /employee/planning/leave)
// ---------------------------------------------------------------------------

export function useLeaveEntitlementQuery() {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getLeaveEntitlement(),
    queryKey: planningQueryKeys.leave(accountId),
  })

  return useMemo(
    () => ({
      state: query.data,
      isError: query.isError,
      isLoading: query.isLoading,
      refetch: query.refetch,
    }),
    [query.data, query.isError, query.isLoading, query.refetch],
  )
}
