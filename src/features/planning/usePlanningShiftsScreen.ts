import { useMemo } from "react"
import { useRouter } from "expo-router"
import { getLocalToday } from "@/core/date"
import { usePlanningShiftsQuery } from "@/features/planning/data/planning.queries"
import { usePlanningEmployeeCode } from "@/features/planning/usePlanningEmployeeCode"
import type { Shift } from "@/core/models"
import { groupUpcomingShiftsByWeek } from "@/features/schedule/schedule.utils"

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function usePlanningShiftsScreen() {
  const router = useRouter()
  const employeeCode = usePlanningEmployeeCode()
  const today = getLocalToday()
  const to = addDays(today, 14) // 2-week horizon

  const query = usePlanningShiftsQuery({
    from: today,
    to,
    employeeCode: employeeCode ?? undefined,
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
