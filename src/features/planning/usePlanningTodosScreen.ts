/**
 * Screen-hook for Today's Tasks (Taken voor vandaag).
 *
 * Uses GET /employee/planning/todos which is self-scoped — no establishment
 * code needed in the URL. The response is a KioskTodosResultDto containing
 * a list of todos plus optional dressNote and note.
 */
import { useState } from "react"

import { getLocalToday } from "@/core/date"
import {
  useCompleteTodoMutation,
  useUncompleteTodoMutation,
} from "@/features/planning/data/planning.mutations"
import { usePlanningTodosQuery } from "@/features/planning/data/planning.queries"
import { useAppSession } from "@/providers/app-provider"

export function usePlanningTodosScreen() {
  const { accountId } = useAppSession()
  const today = getLocalToday()
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())
  const [uncompletingIds, setUncompletingIds] = useState<Set<string>>(new Set())

  const query = usePlanningTodosQuery()
  const completeMutation = useCompleteTodoMutation()
  const uncompleteMutation = useUncompleteTodoMutation()

  const handleComplete = async (todoId: string) => {
    if (!accountId) return
    setCompletingIds((prev) => new Set(prev).add(todoId))
    try {
      await completeMutation.mutateAsync({ todoCode: todoId })
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
    }
  }

  const handleUncomplete = async (todoId: string) => {
    if (!accountId) return
    setUncompletingIds((prev) => new Set(prev).add(todoId))
    try {
      await uncompleteMutation.mutateAsync({ todoCode: todoId })
    } finally {
      setUncompletingIds((prev) => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
    }
  }

  const result = query.state ?? null
  const todos = result?.todos ?? []
  const pendingTodos = todos.filter((t) => !t.isCompletedByMe)
  const completedTodos = todos.filter((t) => t.isCompletedByMe)

  return {
    completedTodos,
    completingIds,
    dressNote: result?.dressNote,
    handleComplete,
    handleUncomplete,
    isError: query.isError,
    isLoading: query.isLoading,
    note: result?.note,
    pendingTodos,
    refetch: query.refetch,
    today,
    todos,
    uncompletingIds,
  }
}

export type PlanningTodosScreenModel = ReturnType<typeof usePlanningTodosScreen>
