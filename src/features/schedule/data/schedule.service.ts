import type { AvailabilityOverride, AvailabilityTemplate, RequestItem } from "@/core/models"
import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"

export function saveAvailabilityOverride(accountId: string, payload: AvailabilityOverride) {
  return commitAccountAction(
    accountId,
    { type: "saveAvailabilityOverride", payload },
    applyAppAction,
  )
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

export function saveAvailabilityTemplate(accountId: string, payload: AvailabilityTemplate) {
  return commitAccountAction(
    accountId,
    { type: "saveAvailabilityTemplate", payload },
    applyAppAction,
  )
}

export function submitPlanningWindow(accountId: string, id: string, submittedAt: string) {
  return commitAccountAction(
    accountId,
    { type: "submitPlanningWindow", payload: { id, submittedAt } },
    applyAppAction,
  )
}

export function respondToShift(accountId: string, id: string) {
  return commitAccountAction(accountId, { type: "respondToShift", payload: { id } }, applyAppAction)
}
