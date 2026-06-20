/**
 * TanStack Query hooks for the employee planning feature.
 *
 * Key structure: ["planning", accountId, scope, ...params]
 * All read hooks surface { state, isLoading, isError, refetch }.
 *
 * These hooks access appRepositories.planning (wired in composition/repositories.ts).
 * If the repo is not yet wired, queries return empty arrays with no error.
 */

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

import type {
  GetCallsParams,
  GetLeaveBalancesParams,
  GetLeaveRequestsParams,
  GetTodosParams,
  GetShiftsParams,
} from "./planning.repository"

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const planningQueryKeys = {
  all: (accountId: string | null) => ["planning", accountId] as const,
  shifts: (accountId: string | null, params: GetShiftsParams) =>
    ["planning", accountId, "shifts", params] as const,
  calls: (accountId: string | null, params: GetCallsParams) =>
    ["planning", accountId, "calls", params] as const,
  todos: (accountId: string | null, params: GetTodosParams) =>
    ["planning", accountId, "todos", params] as const,
  leaveBalances: (accountId: string | null, params: GetLeaveBalancesParams) =>
    ["planning", accountId, "leave-balances", params] as const,
  leaveRequests: (accountId: string | null, params: GetLeaveRequestsParams) =>
    ["planning", accountId, "leave-requests", params] as const,
}

// ---------------------------------------------------------------------------
// Shifts
// ---------------------------------------------------------------------------

export function usePlanningShiftsQuery(params: GetShiftsParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getShifts(accountId!, params),
    queryKey: planningQueryKeys.shifts(accountId, params),
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
// Open Calls
// ---------------------------------------------------------------------------

export function usePlanningCallsQuery(params: GetCallsParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getOpenCalls(accountId!, params),
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
// Todos
// ---------------------------------------------------------------------------

export function usePlanningTodosQuery(params: GetTodosParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getTodos(accountId!, params),
    queryKey: planningQueryKeys.todos(accountId, params),
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
// Leave Balances
// ---------------------------------------------------------------------------

export function useLeaveBalancesQuery(params: GetLeaveBalancesParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getLeaveBalances(accountId!, params),
    queryKey: planningQueryKeys.leaveBalances(accountId, params),
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
// Leave Requests
// ---------------------------------------------------------------------------

export function useLeaveRequestsQuery(params: GetLeaveRequestsParams) {
  const { accountId } = useAppSession()
  const query = useQuery({
    enabled: Boolean(accountId) && Boolean(appRepositories.planning),
    queryFn: () => appRepositories.planning!.getLeaveRequests(accountId!, params),
    queryKey: planningQueryKeys.leaveRequests(accountId, params),
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
