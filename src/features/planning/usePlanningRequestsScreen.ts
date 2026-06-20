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
import { useDecideShiftSwapMutation, useCancelShiftSwapMutation } from "@/features/planning/data/planning.mutations"
import { useProfileQuery } from "@/features/profile/data/profile.queries"

const EMPTY_REQUESTS = { swapRequests: [], changeRequests: [] }

export function usePlanningRequestsScreen() {
  const router = useRouter()
  const requestsQuery = useMyRequestsQuery()
  const decideMutation = useDecideShiftSwapMutation()
  const cancelMutation = useCancelShiftSwapMutation()
  const { data: profile } = useProfileQuery()

  const myEmployeeId = profile?.id

  const handleNewShiftSwap = () => {
    router.push("/(app)/planning-swap-new" as never)
  }

  const handleNewChangeRequest = () => {
    router.push("/(app)/planning-change-new" as never)
  }

  const handleDecideSwap = async (swapCode: string, accept: boolean) => {
    await decideMutation.mutateAsync({ swapCode, accept })
  }

  const handleCancelSwap = async (swapCode: string) => {
    await cancelMutation.mutateAsync(swapCode)
  }

  const refetch = () => {
    void requestsQuery.refetch()
  }

  return {
    handleCancelSwap,
    handleDecideSwap,
    handleNewChangeRequest,
    handleNewShiftSwap,
    isError: requestsQuery.isError,
    isLoading: requestsQuery.isLoading,
    myEmployeeId,
    requests: requestsQuery.state ?? EMPTY_REQUESTS,
    refetch,
  }
}

export type PlanningRequestsScreenModel = ReturnType<typeof usePlanningRequestsScreen>
