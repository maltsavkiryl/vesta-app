import type {
  AppStoreState,
  AvailabilityOverride,
  AvailabilityTemplate,
  RequestItem,
  Shift,
} from "@/core/models"
import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"
import type { AppAction } from "@/services/app/app.types"

/**
 * Marks a shift as declined ("Can't make it"). Pure and unit-testable: maps the
 * matching shift to `responseStatus: "declined"` and clears its response flag.
 */
export function applyShiftDecline(shifts: Shift[], shiftId: string): Shift[] {
  return shifts.map((shift) =>
    shift.id === shiftId
      ? { ...shift, requiresResponse: false, responseStatus: "declined" as const }
      : shift,
  )
}

// Synthetic action handled locally so decline lives entirely in the schedule
// data layer (the shared reducer only knows how to "acknowledge"). Everything
// else delegates to the canonical reducer.
type DeclineShiftAction = { type: "declineShift"; payload: { id: string } }

function applyScheduleAction(
  state: AppStoreState,
  action: AppAction | DeclineShiftAction,
): AppStoreState {
  if (action.type === "declineShift") {
    return { ...state, shifts: applyShiftDecline(state.shifts, action.payload.id) }
  }
  return applyAppAction(state, action)
}

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

export function declineShift(accountId: string, id: string) {
  return commitAccountAction(
    accountId,
    { type: "declineShift", payload: { id } } as unknown as AppAction,
    applyScheduleAction as (state: AppStoreState, action: AppAction) => AppStoreState,
  )
}
