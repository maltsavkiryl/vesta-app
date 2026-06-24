/**
 * TanStack Query mutation hooks for the employee planning feature.
 *
 * Mutations invalidate the relevant planning query keys on success.
 * Todo completion uses an optimistic update: the todo isCompletedByMe flag is
 * flipped locally immediately and rolled back on failure.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { PlanningTodo, PlanningTodosResult } from "@/core/models"
import { translate } from "@/i18n/translate"
import { useAppSession } from "@/providers/app-provider"

import { planningQueryKeys } from "./planning.queries"
import type {
  ClaimCallInput,
  CompleteTodoInput,
  CreateShiftChangeParams,
  CreateShiftSwapParams,
  DecideShiftSwapParams,
  GetOpenCallsParams,
} from "./planning.repository"

// ---------------------------------------------------------------------------
// Claim a planning call
// ---------------------------------------------------------------------------

export function useClaimCallMutation(callsParams: GetOpenCallsParams = {}) {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (input: ClaimCallInput) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.claimCall(input)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({
        queryKey: planningQueryKeys.calls(accountId, callsParams),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Complete a todo (optimistic)
// ---------------------------------------------------------------------------

export function useCompleteTodoMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()
  const queryKey = planningQueryKeys.todos(accountId)

  return useMutation({
    mutationFn: (input: CompleteTodoInput) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.completeTodo(input)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PlanningTodosResult>(queryKey)

      queryClient.setQueryData<PlanningTodosResult>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          todos: old.todos.map(
            (todo): PlanningTodo =>
              todo.id === input.todoCode ? { ...todo, isCompletedByMe: true } : todo,
          ),
        }
      })

      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: (result, _input, context) => {
      if (!result.ok && context?.previous !== undefined) {
        // Roll back on domain error too
        queryClient.setQueryData(queryKey, context.previous)
        return
      }
      // Refetch to get authoritative server state
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

// ---------------------------------------------------------------------------
// Uncomplete a todo (optimistic)
// ---------------------------------------------------------------------------

export function useUncompleteTodoMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()
  const queryKey = planningQueryKeys.todos(accountId)

  return useMutation({
    mutationFn: (input: CompleteTodoInput) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.uncompleteTodo(input)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PlanningTodosResult>(queryKey)

      queryClient.setQueryData<PlanningTodosResult>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          todos: old.todos.map(
            (todo): PlanningTodo =>
              todo.id === input.todoCode ? { ...todo, isCompletedByMe: false } : todo,
          ),
        }
      })

      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: (result, _input, context) => {
      if (!result.ok && context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
        return
      }
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

// ---------------------------------------------------------------------------
// Create shift swap request
// ---------------------------------------------------------------------------

export function useCreateShiftSwapMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (params: CreateShiftSwapParams) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.createShiftSwap(params)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: planningQueryKeys.requests(accountId) })
    },
  })
}

// ---------------------------------------------------------------------------
// Decide (accept/reject) a shift swap
// ---------------------------------------------------------------------------

export function useDecideShiftSwapMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (params: DecideShiftSwapParams) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.decideShiftSwap(params)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: planningQueryKeys.requests(accountId) })
      void queryClient.invalidateQueries({ queryKey: ["planning", accountId, "schedule"] })
    },
  })
}

// ---------------------------------------------------------------------------
// Cancel a shift swap
// ---------------------------------------------------------------------------

export function useCancelShiftSwapMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (swapCode: string) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.cancelShiftSwap(swapCode)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: planningQueryKeys.requests(accountId) })
    },
  })
}

// ---------------------------------------------------------------------------
// Create shift change request
// ---------------------------------------------------------------------------

export function useCreateShiftChangeMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (params: CreateShiftChangeParams) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.createShiftChange(params)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: planningQueryKeys.requests(accountId) })
    },
  })
}

// ---------------------------------------------------------------------------
// Save availability (PUT /employee/planning/availability)
// ---------------------------------------------------------------------------

export function useSaveAvailabilityMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: ({
      template,
      overrides,
    }: {
      template: import("@/core/models").AvailabilityTemplate
      overrides: import("@/core/models").AvailabilityOverride[]
    }) => {
      if (!appRepositories.planning) throw new Error(translate("planning:repoUnavailable"))
      return appRepositories.planning.saveMyAvailability(template, overrides)
    },
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: planningQueryKeys.availability(accountId) })
    },
  })
}
