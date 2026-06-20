/**
 * DTO → domain model transformers for the planning feature.
 * Nothing from this file should be imported into screens or UI components;
 * they work only with the domain models from @/core/models.
 */

import type {
  AvailabilityOverride,
  AvailabilityStatus,
  AvailabilityTemplate,
  AvailabilityWeekday,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestStatus,
  PlanningCall,
  PlanningCallClaim,
  PlanningTodo,
  PlanningTodoCompletion,
  Shift,
  ShiftStatus,
} from "@/core/models"

import type {
  AvailabilityIntentDto,
  AvailabilityOverrideDto,
  AvailabilityWindowDto,
  LeaveBalanceDto,
  LeaveRequestDto,
  LeaveRequestStatusDto,
  PlanningCallClaimDto,
  PlanningCallDto,
  PlanningTodoCompletionDto,
  PlanningTodoDto,
  ShiftDto,
  ShiftStatusDto,
} from "./planning.dto"

// ---------------------------------------------------------------------------
// Enum mappers
// ---------------------------------------------------------------------------

const WEEKDAY_NAMES: AvailabilityWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

function toAvailabilityStatus(intent: AvailabilityIntentDto): AvailabilityStatus {
  switch (intent) {
    case "Want":
      return "available"
    case "Standby":
      return "preferred"
    case "Unavailable":
    default:
      return "unavailable"
  }
}

function toShiftStatus(status: ShiftStatusDto): ShiftStatus {
  // Concept → pending, Published → confirmed
  return status === "Published" ? "confirmed" : "pending"
}

function toLeaveRequestStatus(status: LeaveRequestStatusDto): LeaveRequestStatus {
  switch (status) {
    case "Approved":
      return "approved"
    case "Rejected":
      return "rejected"
    case "Cancelled":
      return "cancelled"
    case "Submitted":
    default:
      return "submitted"
  }
}

// ---------------------------------------------------------------------------
// Shift
// ---------------------------------------------------------------------------

function buildAddress(dto: ShiftDto): string {
  // Use override address when present, otherwise fall back to base address
  const street = dto.overrideAddressStreet ?? dto.addressStreet
  const houseNumber = dto.overrideAddressHouseNumber ?? dto.addressHouseNumber
  const zip = dto.overrideAddressZipCode ?? dto.addressZipCode
  const city = dto.overrideAddressCity ?? dto.addressCity
  return [street, houseNumber, zip, city].filter(Boolean).join(", ")
}

export function toShift(dto: ShiftDto): Shift {
  return {
    id: dto.uniqueCode,
    date: dto.shiftDate,
    dayLabel: dto.shiftDate, // display layer can resolve via getRelativeDayLabel
    startTime: dto.startTime,
    endTime: dto.endTime,
    role: dto.fillType === "External" ? (dto.externalWorkerName ?? "External") : "",
    venueName: dto.addressCity,
    venueAddress: buildAddress(dto),
    status: toShiftStatus(dto.status),
    note: dto.note ?? undefined,
    employerId: dto.establishmentUniqueCode,
  }
}

export function toShifts(dtos: ShiftDto[]): Shift[] {
  return dtos.map(toShift)
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export function toAvailabilityTemplate(windows: AvailabilityWindowDto[]): AvailabilityTemplate {
  const template = {} as AvailabilityTemplate

  for (const window of windows) {
    const weekday = WEEKDAY_NAMES[window.weekday]
    if (!weekday) continue
    template[weekday] = {
      status: toAvailabilityStatus(window.intent),
      startTime: window.startTime,
      endTime: window.endTime,
    }
  }

  // Fill in any missing weekdays with a default
  for (const weekday of WEEKDAY_NAMES) {
    if (!template[weekday]) {
      template[weekday] = { status: "unavailable", startTime: "00:00", endTime: "00:00" }
    }
  }

  return template
}

export function toAvailabilityOverride(dto: AvailabilityOverrideDto): AvailabilityOverride {
  return {
    date: dto.date,
    status: toAvailabilityStatus(dto.intent),
    startTime: dto.startTime,
    endTime: dto.endTime,
    note: dto.note ?? undefined,
  }
}

export function toAvailabilityOverrides(
  dtos: AvailabilityOverrideDto[],
): Record<string, AvailabilityOverride> {
  return Object.fromEntries(dtos.map((dto) => [dto.date, toAvailabilityOverride(dto)]))
}

// ---------------------------------------------------------------------------
// Planning Calls
// ---------------------------------------------------------------------------

function toPlanningCallClaim(dto: PlanningCallClaimDto): PlanningCallClaim {
  return {
    id: dto.uniqueCode,
    employeeId: dto.employeeUniqueCode,
    employeeName: dto.employeeName,
    state: dto.state,
    claimedAt: dto.claimedAtUtc,
    availabilityIntent: dto.availabilityIntent,
  }
}

/**
 * @param employerCode - The employer unique code (= accountId in the session).
 * @param establishmentCode - The establishment unique code from the surrounding list context.
 */
export function toPlanningCall(
  dto: PlanningCallDto,
  employerCode: string,
  establishmentCode: string,
): PlanningCall {
  return {
    id: dto.uniqueCode,
    shiftId: dto.shiftUniqueCode,
    employerCode,
    establishmentCode,
    mode: dto.mode,
    status: dto.status,
    note: dto.note ?? undefined,
    createdAt: dto.createTime,
    claims: dto.claims.map(toPlanningCallClaim),
  }
}

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

function toPlanningTodoCompletion(dto: PlanningTodoCompletionDto): PlanningTodoCompletion {
  return {
    employeeId: dto.employeeUniqueCode,
    employeeName: dto.employeeName,
    completedAt: dto.completedAtUtc,
    channel: dto.channel,
  }
}

export function toPlanningTodo(dto: PlanningTodoDto): PlanningTodo {
  return {
    id: dto.uniqueCode,
    establishmentCode: dto.establishmentUniqueCode,
    scope: dto.scope,
    date: dto.date ?? undefined,
    shiftId: dto.shiftUniqueCode ?? undefined,
    label: dto.label,
    completionMode: dto.completionMode,
    sortOrder: dto.sortOrder,
    requiredCount: dto.requiredCount,
    completedCount: dto.completedCount,
    isComplete: dto.isComplete,
    completions: dto.completions.map(toPlanningTodoCompletion),
  }
}

export function toPlanningTodos(dtos: PlanningTodoDto[]): PlanningTodo[] {
  return dtos.map(toPlanningTodo)
}

// ---------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------

export function toLeaveBalance(dto: LeaveBalanceDto): LeaveBalance {
  return {
    calendarYear: dto.calendarYear,
    statutoryDays: dto.statutoryDays,
    employerPolicyDays: dto.employerPolicyDays,
    totalDays: dto.totalDays,
  }
}

export function toLeaveRequest(dto: LeaveRequestDto): LeaveRequest {
  return {
    id: String(dto.id),
    employeeId: dto.employeeUniqueCode,
    employerCode: dto.employerUniqueCode,
    leaveTypeId: dto.leaveTypeId,
    leaveTypeName: dto.leaveTypeName ?? undefined,
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: toLeaveRequestStatus(dto.status),
    requestNotes: dto.requestNotes ?? undefined,
    decisionNotes: dto.decisionNotes ?? undefined,
  }
}

export function toLeaveRequests(dtos: LeaveRequestDto[]): LeaveRequest[] {
  return dtos.map(toLeaveRequest)
}
