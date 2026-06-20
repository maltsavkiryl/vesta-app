/**
 * HTTP implementation of NotificationsRepository against the employee inbox API.
 *
 * Endpoints (self-scoped — the JWT identifies the employee):
 *  - GET    /employee/notifications?offset&limit
 *  - POST   /employee/notifications/{uniqueCode}/read
 *  - POST   /employee/notifications/read-all
 *  - DELETE /employee/notifications/{uniqueCode}        (soft-delete = archive)
 *
 * Mutations return the freshly-refetched list to honour the repository contract
 * (the mock does the same). The backend has no bulk-delete, so archiveAll deletes
 * each currently-visible notification.
 */
import type { NotificationItem } from "@/core/models"
import type { NotificationsRepository } from "@/features/notifications/data/notifications.repository"
import type { HttpClient } from "@/services/api/httpClient"

import type { PagedNotificationsDto } from "./notifications.dto"
import { toNotificationItem } from "./notifications.transformer"

// One page comfortably covers an employee inbox; pagination can be layered on in
// a later polish pass if inboxes ever grow beyond this.
const PAGE_LIMIT = 100

export function createNotificationsHttpRepository(http: HttpClient): NotificationsRepository {
  async function fetchList(): Promise<NotificationItem[]> {
    const res = await http.get<PagedNotificationsDto>("/employee/notifications", {
      offset: 0,
      limit: PAGE_LIMIT,
    })
    if (!res.ok || !res.data) throw new Error("Failed to load notifications")
    return res.data.items.map(toNotificationItem)
  }

  return {
    getNotifications: () => fetchList(),
    async markRead(_accountId, notificationId) {
      await http.post(`/employee/notifications/${notificationId}/read`)
      return fetchList()
    },
    async markAllRead() {
      await http.post("/employee/notifications/read-all")
      return fetchList()
    },
    async archive(_accountId, notificationId) {
      await http.delete(`/employee/notifications/${notificationId}`)
      return fetchList()
    },
    async archiveAll() {
      const current = await fetchList()
      await Promise.all(current.map((item) => http.delete(`/employee/notifications/${item.id}`)))
      return fetchList()
    },
  }
}
