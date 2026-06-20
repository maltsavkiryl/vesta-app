/**
 * Screen-hook for the Leave / Verlof screen.
 *
 * GET /employee/planning/leave returns the employee's current-year leave
 * ENTITLEMENT (statutory days + employer policy days + hours) — NOT a list
 * of leave requests and NOT a create-leave-request flow.
 *
 * If leave request creation becomes available in the API contract, wire it
 * here using useCreateShiftChangeMutation or a dedicated hook.
 */
import { useLeaveEntitlementQuery } from "@/features/planning/data/planning.queries"

export function usePlanningLeaveScreen() {
  const entitlementQuery = useLeaveEntitlementQuery()

  const refetch = () => {
    void entitlementQuery.refetch()
  }

  return {
    entitlement: entitlementQuery.state ?? null,
    isError: entitlementQuery.isError,
    isLoading: entitlementQuery.isLoading,
    refetch,
  }
}

export type PlanningLeaveScreenModel = ReturnType<typeof usePlanningLeaveScreen>
