/**
 * Screen-hook for My Requests (Mijn aanvragen) — planning-specific view.
 *
 * This screen shows swap + change requests from the self-scoped
 * GET /employee/planning/requests endpoint (MyRequestsDto).
 *
 * There is no leave-request endpoint under /employee/planning —
 * leave entitlement is a separate read at GET /employee/planning/leave.
 */
import { useRouter } from "expo-router"
import { useMyRequestsQuery } from "@/features/planning/data/planning.queries"

const EMPTY_REQUESTS = { swapRequests: [], changeRequests: [] }

export function usePlanningRequestsScreen() {
  const router = useRouter()
  const requestsQuery = useMyRequestsQuery()

  const handleNewShiftSwap = () => {
    router.push("/(app)/request?category=shift_change" as never)
  }

  const handleNewChangeRequest = () => {
    router.push("/(app)/request?category=time_off" as never)
  }

  const refetch = () => {
    void requestsQuery.refetch()
  }

  return {
    handleNewChangeRequest,
    handleNewShiftSwap,
    isError: requestsQuery.isError,
    isLoading: requestsQuery.isLoading,
    requests: requestsQuery.state ?? EMPTY_REQUESTS,
    refetch,
  }
}

export type PlanningRequestsScreenModel = ReturnType<typeof usePlanningRequestsScreen>
