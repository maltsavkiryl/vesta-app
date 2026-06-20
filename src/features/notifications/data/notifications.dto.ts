/**
 * Hand-written DTO interfaces matching the Vesta Workforce API.
 * Source: GET /api/v1/employee/notifications (NotificationDto + PagedResultDto).
 * These types MUST NOT leak into screens or UI components — transform them via
 * notifications.transformer.ts before use.
 */

/** Mirrors Domain.Notifications.NotificationType. The API may serialise the enum
 *  as its name (string) or its ordinal (number); the transformer accepts both. */
export type NotificationTypeDto =
  | "EmployerRegistered"
  | "EmployeeOnboarded"
  | "InvoiceGenerated"
  | "ContractReady"
  | "ScheduleChanged"
  | "ContractEndingSoon"
  | "ContractCommuteTravelDistanceMissing"
  | "DimonaFailed"

export interface NotificationDto {
  uniqueCode: string
  type: NotificationTypeDto | number
  title: string
  body?: string | null
  subjectType?: string | null
  subjectId?: string | null
  subjectDisplay?: string | null
  employerUniqueCode?: string | null
  isImportant: boolean
  isRead: boolean
  readAtUtc?: string | null
  createdAtUtc: string
}

export interface PagedNotificationsDto {
  items: NotificationDto[]
  offset: number
  limit: number
  totalCount: number
}
