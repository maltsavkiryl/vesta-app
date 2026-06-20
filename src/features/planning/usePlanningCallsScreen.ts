/**
 * Screen-hook for Open Calls (Open oproepen).
 *
 * Uses GET /employee/planning/calls/open — self-scoped, no establishment code
 * needed in the URL. The employee's JWT identifies them.
 *
 * The claim mutation still requires employerCode + establishmentCode because
 * the claim endpoint is: POST /employers/{emp}/establishments/{est}/calls/{code}/claim.
 * These are passed directly from the PlanningCall domain model (which the
 * HTTP repo populates from the employee's active employer context).
 */
import { useState } from "react"

import { useClaimCallMutation } from "@/features/planning/data/planning.mutations"
import { usePlanningCallsQuery } from "@/features/planning/data/planning.queries"

export type ClaimState =
  | "idle"
  | "claiming"
  | "claimed"
  | "error"
  | "already-claimed"
  | "forbidden"
  | "conflict"

export function usePlanningCallsScreen() {
  const [claimStates, setClaimStates] = useState<Record<string, ClaimState>>({})

  // Self-scoped: no establishment code required
  const query = usePlanningCallsQuery()
  const claimMutation = useClaimCallMutation()

  const handleClaim = async (callId: string, employerCode: string, establishmentCode: string) => {
    setClaimStates((prev) => ({ ...prev, [callId]: "claiming" }))
    const result = await claimMutation.mutateAsync({
      callCode: callId,
      employerCode,
      establishmentCode,
    })

    if (!result.ok) {
      const errorType = result.error?.type
      if (errorType === "already-claimed") {
        setClaimStates((prev) => ({ ...prev, [callId]: "already-claimed" }))
      } else if (errorType === "forbidden") {
        setClaimStates((prev) => ({ ...prev, [callId]: "forbidden" }))
      } else if (errorType === "conflict") {
        setClaimStates((prev) => ({ ...prev, [callId]: "conflict" }))
      } else {
        setClaimStates((prev) => ({ ...prev, [callId]: "error" }))
      }
      return
    }

    setClaimStates((prev) => ({ ...prev, [callId]: "claimed" }))
  }

  return {
    calls: query.state ?? [],
    claimStates,
    handleClaim,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export type PlanningCallsScreenModel = ReturnType<typeof usePlanningCallsScreen>
