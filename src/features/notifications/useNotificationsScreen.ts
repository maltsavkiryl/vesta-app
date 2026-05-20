import { useMemo } from "react"

import type { NotificationItem } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { useNotificationActions } from "@/features/notifications/data/notifications.mutations"
import { useNotificationsStateQuery } from "@/features/notifications/data/notifications.queries"

export const groupLabels = {
  earlier: "Earlier this week",
  today: "Today",
  yesterday: "Yesterday",
} as const

export type NotificationGroupKey = keyof typeof groupLabels

export function groupNotification(notification: NotificationItem): NotificationGroupKey {
  if (notification.relativeTime.includes("h") || notification.relativeTime.includes("m")) {
    return "today"
  }
  if (notification.relativeTime.includes("1d")) return "yesterday"
  return "earlier"
}

export function useNotificationsScreen() {
  const {
    archiveAllNotifications,
    archiveNotification,
    markAllNotificationsRead,
    markNotificationRead,
  } = useNotificationActions()
  const { notifications } = useNotificationsStateQuery()
  const { runAction } = useAppAction()

  const grouped = useMemo(() => {
    return notifications.reduce<Record<NotificationGroupKey, NotificationItem[]>>(
      (acc, notification) => {
        acc[groupNotification(notification)].push(notification)
        return acc
      },
      { earlier: [], today: [], yesterday: [] },
    )
  }, [notifications])

  const unreadCount = notifications.filter((item) => item.unread).length

  const handlePress = (notification: NotificationItem) => {
    void markNotificationRead(notification.id)
    void runAction(notification.action)
  }

  return {
    archiveAllNotifications,
    archiveNotification,
    grouped,
    handlePress,
    markAllNotificationsRead,
    notifications,
    unreadCount,
  }
}

export type NotificationsScreenState = ReturnType<typeof useNotificationsScreen>
