/**
 * Screen-hook for Today's Tasks (Taken voor vandaag).
 *
 * DATA GAP: establishmentCode is required by the todos query but the employee
 * profile has no "my establishment" shorthand. We fall back to accountId
 * (employer unique code) — the API may return an empty list if the employee
 * belongs to a different establishment code. This will need resolving once
 * the backend exposes the employee's establishment.
 */
import { useAppSession } from "@/providers/app-provider"
import { usePlanningTodosQuery } from "@/features/planning/data/planning.queries"
import { useCompleteTodoMutation } from "@/features/planning/data/planning.mutations"
import { getLocalToday } from "@/core/date"
import type { GetTodosParams } from "@/features/planning/data/planning.repository"

export function usePlanningTodosScreen() {
  const { accountId } = useAppSession()
  const today = getLocalToday()

  // Fall back to accountId as establishmentCode — see DATA GAP comment above.
  const todosParams: GetTodosParams = {
    establishmentCode: accountId ?? "",
    from: today,
    to: today,
  }

  const query = usePlanningTodosQuery(todosParams)
  const completeMutation = useCompleteTodoMutation(todosParams)

  const handleComplete = async (todoId: string) => {
    if (!accountId) return
    await completeMutation.mutateAsync({
      employerCode: accountId,
      establishmentCode: accountId,
      todoCode: todoId,
    })
  }

  const todos = query.state ?? []
  const pendingTodos = todos.filter((t) => !t.isComplete)
  const completedTodos = todos.filter((t) => t.isComplete)

  return {
    completedTodos,
    handleComplete,
    isCompleting: completeMutation.isPending,
    isError: query.isError,
    isLoading: query.isLoading,
    pendingTodos,
    refetch: query.refetch,
    today,
    todos,
  }
}

export type PlanningTodosScreenModel = ReturnType<typeof usePlanningTodosScreen>
