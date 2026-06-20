/**
 * Screen-hook for Open Calls (Open oproepen).
 *
 * DATA GAP: establishmentCode is required by the calls query but the employee
 * profile has no "my establishment" shorthand. We fall back to accountId
 * (employer unique code) — the API may return an empty list if the employee
 * belongs to a different establishment code.
 */
import { useState } from "react"
import { useAppSession } from "@/providers/app-provider"
import { usePlanningCallsQuery } from "@/features/planning/data/planning.queries"
import { useClaimCallMutation } from "@/features/planning/data/planning.mutations"
import type { GetCallsParams } from "@/features/planning/data/planning.repository"

export type ClaimState = "idle" | "claiming" | "claimed" | "error" | "already-claimed" | "forbidden"

export function usePlanningCallsScreen() {
  const { accountId } = useAppSession()
  const [claimStates, setClaimStates] = useState<Record<string, ClaimState>>({})

  // Fall back to accountId as establishmentCode — see DATA GAP comment above.
  const callsParams: GetCallsParams = {
    establishmentCode: accountId ?? "",
  }

  const query = usePlanningCallsQuery(callsParams)
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
