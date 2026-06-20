import { useMemo } from "react"
import { useRouter } from "expo-router"

import { getLocalToday, addLocalDays } from "@/core/date"
import type { Shift } from "@/core/models"
import { usePlanningScheduleQuery } from "@/features/planning/data/planning.queries"
import { groupUpcomingShiftsByWeek } from "@/features/schedule/schedule.utils"

export function usePlanningShiftsScreen() {
  const router = useRouter()
  const today = getLocalToday()
  const to = addLocalDays(today, 14) // 2-week horizon

  const query = usePlanningScheduleQuery({
    from: today,
    to,
  })

  const shifts = useMemo(() => query.state ?? [], [query.state])
  const agendaSections = useMemo(() => groupUpcomingShiftsByWeek(shifts, today), [shifts, today])

  const handleOpenShift = (shiftId: Shift["id"]) => {
    router.push(`/(app)/shift/${shiftId}` as never)
  }

  return {
    agendaSections,
    handleOpenShift,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    shifts,
    today,
  }
}

export type PlanningShiftsScreenModel = ReturnType<typeof usePlanningShiftsScreen>
