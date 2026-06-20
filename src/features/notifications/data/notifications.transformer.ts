import { toRelativeTime } from "@/core/format"
import type { NotificationItem, NotificationKind } from "@/core/models"

import type { NotificationDto, NotificationTypeDto } from "./notifications.dto"

// Maps the backend notification type onto the employee app's notification kind,
// which only drives the inbox icon/tone. Employer-oriented types collapse to
// "announcements" — the employee sees them as generic informational items.
const kindByTypeName: Record<NotificationTypeDto, NotificationKind> = {
  ScheduleChanged: "schedule",
  InvoiceGenerated: "payroll",
  ContractReady: "documents",
  ContractEndingSoon: "documents",
  ContractCommuteTravelDistanceMissing: "documents",
  EmployerRegistered: "announcements",
  EmployeeOnboarded: "announcements",
  DimonaFailed: "announcements",
}

// Fallback when the enum arrives as its ordinal (1-based, mirroring the C# enum).
const kindByTypeOrdinal: Record<number, NotificationKind> = {
  1: "announcements",
  2: "announcements",
  3: "payroll",
  4: "documents",
  5: "schedule",
  6: "documents",
  7: "documents",
  8: "announcements",
}

function resolveKind(type: NotificationDto["type"]): NotificationKind {
  if (typeof type === "number") return kindByTypeOrdinal[type] ?? "announcements"
  return kindByTypeName[type] ?? "announcements"
}

export function toNotificationItem(dto: NotificationDto): NotificationItem {
  return {
    id: dto.uniqueCode,
    kind: resolveKind(dto.type),
    title: dto.title,
    body: dto.body ?? dto.subjectDisplay ?? "",
    relativeTime: toRelativeTime(dto.createdAtUtc),
    unread: !dto.isRead,
    // Deep-link actions are derived from notification subjects in the navigation
    // slice (S6); until then notifications open the inbox and mark themselves read.
  }
}
