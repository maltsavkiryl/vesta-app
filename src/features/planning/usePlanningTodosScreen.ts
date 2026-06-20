/**
 * Screen-hook for Today's Tasks (Taken voor vandaag).
 *
 * Uses GET /employee/planning/todos which is self-scoped — no establishment
 * code needed in the URL. The response is a KioskTodosResultDto containing
 * a list of todos plus optional dressNote and note.
 */
import { useAppSession } from "@/providers/app-provider"
import { usePlanningTodosQuery } from "@/features/planning/data/planning.queries"
import { useCompleteTodoMutation, useUncompleteTodoMutation } from "@/features/planning/data/planning.mutations"
import { getLocalToday } from "@/core/date"

export function usePlanningTodosScreen() {
  const { accountId } = useAppSession()
  const today = getLocalToday()

  const query = usePlanningTodosQuery()
  const completeMutation = useCompleteTodoMutation()
  const uncompleteMutation = useUncompleteTodoMutation()

  const handleComplete = async (todoId: string) => {
    if (!accountId) return
    await completeMutation.mutateAsync({ todoCode: todoId })
  }

  const handleUncomplete = async (todoId: string) => {
    if (!accountId) return
    await uncompleteMutation.mutateAsync({ todoCode: todoId })
  }

  const result = query.state ?? null
  const todos = result?.todos ?? []
  const pendingTodos = todos.filter((t) => !t.isCompletedByMe)
  const completedTodos = todos.filter((t) => t.isCompletedByMe)

  return {
    completedTodos,
    dressNote: result?.dressNote,
    handleComplete,
    handleUncomplete,
    isCompleting: completeMutation.isPending,
    isError: query.isError,
    isLoading: query.isLoading,
    isUncompleting: uncompleteMutation.isPending,
    note: result?.note,
    pendingTodos,
    refetch: query.refetch,
    today,
    todos,
  }
}

export type PlanningTodosScreenModel = ReturnType<typeof usePlanningTodosScreen>
