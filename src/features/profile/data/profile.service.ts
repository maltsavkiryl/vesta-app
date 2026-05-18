import type { UserProfile } from "@/core/models"
import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"

export function updateProfile(accountId: string, payload: Partial<UserProfile>) {
  return commitAccountAction(accountId, { type: "updateProfile", payload }, applyAppAction)
}

export function joinEmployer(accountId: string, employerId: string) {
  return commitAccountAction(
    accountId,
    { type: "joinEmployer", payload: { employerId } },
    applyAppAction,
  )
}

export function switchEmployer(accountId: string, employerId: string) {
  return commitAccountAction(
    accountId,
    { type: "switchEmployer", payload: { employerId } },
    applyAppAction,
  )
}
