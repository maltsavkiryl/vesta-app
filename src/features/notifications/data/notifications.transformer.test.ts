import type { NotificationDto } from "./notifications.dto"
import { toNotificationItem } from "./notifications.transformer"

const baseDto: NotificationDto = {
  uniqueCode: "n-1",
  type: "ScheduleChanged",
  title: "Your shift changed",
  body: "Friday now starts at 18:00",
  isImportant: false,
  isRead: false,
  createdAtUtc: "2026-06-20T08:00:00Z",
}

describe("notifications.transformer", () => {
  it("maps core fields and unread state", () => {
    const item = toNotificationItem(baseDto)
    expect(item.id).toBe("n-1")
    expect(item.title).toBe("Your shift changed")
    expect(item.body).toBe("Friday now starts at 18:00")
    expect(item.unread).toBe(true)
    expect(typeof item.relativeTime).toBe("string")
  })

  it("treats a read notification as not unread", () => {
    expect(toNotificationItem({ ...baseDto, isRead: true }).unread).toBe(false)
  })

  it("maps notification type names to inbox kinds", () => {
    expect(toNotificationItem({ ...baseDto, type: "ScheduleChanged" }).kind).toBe("schedule")
    expect(toNotificationItem({ ...baseDto, type: "InvoiceGenerated" }).kind).toBe("payroll")
    expect(toNotificationItem({ ...baseDto, type: "ContractReady" }).kind).toBe("documents")
    expect(toNotificationItem({ ...baseDto, type: "EmployerRegistered" }).kind).toBe(
      "announcements",
    )
  })

  it("falls back to ordinal enum mapping when the type is numeric", () => {
    expect(toNotificationItem({ ...baseDto, type: 5 }).kind).toBe("schedule")
    expect(toNotificationItem({ ...baseDto, type: 3 }).kind).toBe("payroll")
  })

  it("falls back to subjectDisplay then empty string for a missing body", () => {
    expect(toNotificationItem({ ...baseDto, body: null, subjectDisplay: "Bistro" }).body).toBe(
      "Bistro",
    )
    expect(toNotificationItem({ ...baseDto, body: null, subjectDisplay: null }).body).toBe("")
  })
})
