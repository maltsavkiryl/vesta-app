import type { AvailabilityDay, RequestItem } from "@/core/models"
import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"

export function updateAvailability(accountId: string, payload: AvailabilityDay) {
  return commitAccountAction(accountId, { type: "updateAvailability", payload }, applyAppAction)
}

export function createRequest(accountId: string, payload: Omit<RequestItem, "id" | "status">) {
  return commitAccountAction(
    accountId,
    {
      type: "createRequest",
      payload: {
        id: `request-${Date.now()}`,
        ...payload,
        status: "pending",
      },
    },
    applyAppAction,
  )
}
