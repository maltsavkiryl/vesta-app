import { useMemo } from "react"

import { getLocalToday, addLocalDays } from "@/core/date"
import type { Shift } from "@/core/models"
import { usePlanningScheduleQuery } from "@/features/planning/data/planning.queries"

/**
 * Finds a shift by ID in the cached planning schedule (today → +14 days).
 * Used as a fallback when a shift isn't found in the schedule store.
 */
export function usePlanningShiftById(id: string | undefined): Shift | undefined {
  const today = getLocalToday()
  const to = addLocalDays(today, 14)
  const { state } = usePlanningScheduleQuery({ from: today, to })
  return useMemo(() => (id ? (state ?? []).find((s) => s.id === id) : undefined), [id, state])
}
