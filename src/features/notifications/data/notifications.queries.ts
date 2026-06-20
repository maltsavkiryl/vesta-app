import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"

export const notificationsQueryKeys = {
  list: (accountId: string | null) => ["notifications", accountId, "list"] as const,
}

// Keeps the inbox feeling live without a persistent SSE socket (which drains
// battery and dies on backgrounding). Background-delivered changes arrive via
// push; the foreground poll catches everything else while the app is open.
const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000

export function useNotificationsQuery() {
  const { accountId } = useAppSession()
  return useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.notifications.getNotifications(accountId!),
    queryKey: notificationsQueryKeys.list(accountId),
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })
}

export function useUnreadNotificationsQuery() {
  const query = useNotificationsQuery()
  return useMemo(
    () => query.data?.filter((notification) => notification.unread).length ?? 0,
    [query.data],
  )
}

export function useNotificationsStateQuery() {
  const notificationsQuery = useNotificationsQuery()
  const unreadCount = useUnreadNotificationsQuery()

  return useMemo(
    () => ({
      notifications: notificationsQuery.data ?? [],
      unreadCount,
    }),
    [notificationsQuery.data, unreadCount],
  )
}
