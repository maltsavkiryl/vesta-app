import type { NotificationItem } from "@/core/models"

export interface NotificationsRepository {
  archive(accountId: string, notificationId: string): Promise<NotificationItem[]>
  archiveAll(accountId: string): Promise<NotificationItem[]>
  getNotifications(accountId: string): Promise<NotificationItem[]>
  markAllRead(accountId: string): Promise<NotificationItem[]>
  markRead(accountId: string, notificationId: string): Promise<NotificationItem[]>
}
