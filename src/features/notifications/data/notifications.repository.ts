import type { NotificationItem } from "@/core/models"

export interface NotificationsRepository {
  getNotifications(accountId: string): Promise<NotificationItem[]>
  markAllRead(accountId: string): Promise<NotificationItem[]>
  markRead(accountId: string, notificationId: string): Promise<NotificationItem[]>
}
