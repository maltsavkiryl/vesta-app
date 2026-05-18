import { useMemo } from "react"

import { useAuthSession } from "@/features/auth/data/auth.queries"
import { useCurrentAppStateQuery } from "@/services/app/app.queries"

export function useNotificationsQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(accountId, (state) => state.notifications)
}

export function useUnreadNotificationsQuery() {
  const { accountId } = useAuthSession()
  return useCurrentAppStateQuery(
    accountId,
    (state) => state.notifications.filter((notification) => notification.unread).length,
  )
}

export function useNotificationsStateQuery() {
  const notificationsQuery = useNotificationsQuery()
  const unreadCountQuery = useUnreadNotificationsQuery()

  return useMemo(
    () => ({
      notifications: notificationsQuery.data ?? [],
      unreadCount: unreadCountQuery.data ?? 0,
    }),
    [notificationsQuery.data, unreadCountQuery.data],
  )
}
