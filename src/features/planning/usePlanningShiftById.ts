import { useMemo } from "react"
import { getLocalToday } from "@/core/date"
import { usePlanningScheduleQuery } from "@/features/planning/data/planning.queries"
import type { Shift } from "@/core/models"

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Finds a shift by ID in the cached planning schedule (today → +14 days).
 * Used as a fallback when a shift isn't found in the schedule store.
 */
export function usePlanningShiftById(id: string | undefined): Shift | undefined {
  const today = getLocalToday()
  const to = addDays(today, 14)
  const { state } = usePlanningScheduleQuery({ from: today, to })
  return useMemo(
    () => (id ? (state ?? []).find((s) => s.id === id) : undefined),
    [id, state],
  )
}
