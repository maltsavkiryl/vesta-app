/**
 * Screen-hook for My Requests (Mijn aanvragen) — planning-specific view.
 *
 * This screen shows leave requests from the planning data layer.
 * Shift swap and change requests are created via the existing RequestScreen
 * (/(app)/request?category=shift_change|time_off) which is already wired.
 *
 * DATA GAP: There is no "shift swap" or "change request" read endpoint in the
 * planning data layer — the existing RequestItem model (from schedule state)
 * is the only source for those. Leave requests come from useLeaveRequestsQuery.
 * For this version we show leave requests from planning + a "New request" shortcut
 * into the existing schedule request flow.
 */
import { useMemo } from "react"
import { useRouter } from "expo-router"
import { useAppSession } from "@/providers/app-provider"
import { useLeaveRequestsQuery } from "@/features/planning/data/planning.queries"
import { usePlanningEmployeeCode } from "@/features/planning/usePlanningEmployeeCode"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"

export function usePlanningRequestsScreen() {
  const router = useRouter()
  const { accountId } = useAppSession()
  const employeeCode = usePlanningEmployeeCode()

  const leaveRequestsQuery = useLeaveRequestsQuery({
    employerCode: accountId ?? "",
    employeeCode: employeeCode ?? "",
  })

  // Also surface the existing schedule requests (shift swap / change)
  const { state: scheduleState } = useScheduleStateQuery()
  const scheduleRequests = useMemo(() => scheduleState?.requests ?? [], [scheduleState?.requests])

  const handleNewShiftSwap = () => {
    router.push("/(app)/request?category=shift_change" as never)
  }

  const handleNewChangeRequest = () => {
    router.push("/(app)/request?category=time_off" as never)
  }

  const refetch = () => {
    void leaveRequestsQuery.refetch()
  }

  return {
    handleNewChangeRequest,
    handleNewShiftSwap,
    isError: leaveRequestsQuery.isError,
    isLoading: leaveRequestsQuery.isLoading,
    leaveRequests: leaveRequestsQuery.state ?? [],
    refetch,
    scheduleRequests,
  }
}

export type PlanningRequestsScreenModel = ReturnType<typeof usePlanningRequestsScreen>
