/**
 * TanStack Query mutation hooks for the employee planning feature.
 *
 * Mutations invalidate the relevant planning query keys on success.
 * Todo completion uses an optimistic update: the todo is flipped locally
 * immediately and rolled back on failure.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { PlanningTodo } from "@/core/models"
import { useAppSession } from "@/providers/app-provider"

import type { ClaimCallInput, CompleteTodoInput, CreateLeaveRequestParams, GetTodosParams } from "./planning.repository"
import { planningQueryKeys } from "./planning.queries"

// ---------------------------------------------------------------------------
// Claim a planning call
// ---------------------------------------------------------------------------

export function useClaimCallMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (input: ClaimCallInput) => {
      if (!appRepositories.planning) throw new Error("Planning repository not available.")
      return appRepositories.planning.claimCall(accountId!, input)
    },
    onSuccess: (result, input) => {
      if (!accountId || !result.ok) return
      // Invalidate calls for the establishment we just claimed from.
      void queryClient.invalidateQueries({
        queryKey: planningQueryKeys.calls(accountId, { establishmentCode: input.establishmentCode }),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Complete a todo (optimistic)
// ---------------------------------------------------------------------------

export function useCompleteTodoMutation(todosParams: GetTodosParams) {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (input: CompleteTodoInput) => {
      if (!appRepositories.planning) throw new Error("Planning repository not available.")
      return appRepositories.planning.completeTodo(accountId!, input)
    },
    // Optimistic update: immediately flip isComplete on the cached todo list.
    onMutate: async (input) => {
      if (!accountId) return
      const queryKey = planningQueryKeys.todos(accountId, todosParams)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PlanningTodo[]>(queryKey)

      queryClient.setQueryData<PlanningTodo[]>(queryKey, (old) =>
        old?.map((todo) =>
          todo.id === input.todoCode
            ? { ...todo, isComplete: true, completedCount: todo.completedCount + 1 }
            : todo,
        ),
      )

      return { previous, queryKey }
    },
    onError: (_error, _input, context) => {
      // Roll back the optimistic update on failure.
      if (context?.queryKey && context.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
    },
    onSuccess: (result, _input, context) => {
      if (!accountId || !result.ok) return
      // Replace the optimistic update with the server response.
      if (context?.queryKey) {
        queryClient.setQueryData<PlanningTodo[]>(context.queryKey, (old) =>
          old?.map((todo) => (todo.id === result.data.id ? result.data : todo)),
        )
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Create leave request
// ---------------------------------------------------------------------------

export function useCreateLeaveRequestMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAppSession()

  return useMutation({
    mutationFn: (params: CreateLeaveRequestParams) => {
      if (!appRepositories.planning) throw new Error("Planning repository not available.")
      return appRepositories.planning.createLeaveRequest(accountId!, params)
    },
    onSuccess: (result, params) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({
        queryKey: planningQueryKeys.leaveRequests(accountId, {
          employerCode: params.employerCode,
          employeeCode: params.employeeCode,
        }),
      })
      void queryClient.invalidateQueries({
        queryKey: planningQueryKeys.leaveBalances(accountId, {
          employerCode: params.employerCode,
          employeeCode: params.employeeCode,
        }),
      })
    },
  })
}
