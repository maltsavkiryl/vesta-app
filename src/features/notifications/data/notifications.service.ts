import { applyAppAction } from "@/services/app/app-state.reducer"
import { commitAccountAction } from "@/services/app/app.store"

export function markNotificationRead(accountId: string, id: string) {
  return commitAccountAction(
    accountId,
    { type: "markNotificationRead", payload: { id } },
    applyAppAction,
  )
}

export function markAllNotificationsRead(accountId: string) {
  return commitAccountAction(accountId, { type: "markAllNotificationsRead" }, applyAppAction)
}
