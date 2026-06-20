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
  LeaveEntitlement,
  MyRequests,
  PlanningCall,
  PlanningCallClaim,
  PlanningSwapCandidate,
  PlanningTodo,
  PlanningTodosResult,
  Shift,
  ShiftChangeRequest,
  ShiftStatus,
  ShiftSwapRequest,
} from "@/core/models"

import type {
  AvailabilityIntentDto,
  AvailabilityOverrideDto,
  AvailabilityWindowDto,
  KioskTodoDto,
  KioskTodosResultDto,
  MyLeaveEntitlementDto,
  MyRequestsDto,
  PlanningCallClaimDto,
  PlanningCallDto,
  ShiftChangeRequestDto,
  ShiftDto,
  ShiftStatusDto,
  ShiftSwapCandidateDto,
  ShiftSwapRequestDto,
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

/** Convert availability domain model back to window DTO (for PUT request body). */
export function fromAvailabilityTemplate(template: AvailabilityTemplate): AvailabilityWindowDto[] {
  return WEEKDAY_NAMES.flatMap((weekday, index) => {
    const day = template[weekday]
    if (!day) return []
    const intent: AvailabilityIntentDto =
      day.status === "available" ? "Want" : day.status === "preferred" ? "Standby" : "Unavailable"
    return [{ weekday: index, startTime: day.startTime, endTime: day.endTime, intent }]
  })
}

export function fromAvailabilityOverride(override: AvailabilityOverride): AvailabilityOverrideDto {
  const intent: AvailabilityIntentDto =
    override.status === "available"
      ? "Want"
      : override.status === "preferred"
        ? "Standby"
        : "Unavailable"
  return {
    date: override.date,
    startTime: override.startTime,
    endTime: override.endTime,
    intent,
    note: override.note ?? null,
    confirmed: false,
  }
}

// ---------------------------------------------------------------------------
// Planning Calls  (GET /employee/planning/calls/open)
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
 * @param establishmentCode - Derived from the associated shift's establishmentUniqueCode
 *   or from surrounding context. Required to build the claim URL.
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
// Todos  (GET /employee/planning/todos → KioskTodosResultDto)
// ---------------------------------------------------------------------------

export function toPlanningTodo(dto: KioskTodoDto): PlanningTodo {
  return {
    id: dto.uniqueCode,
    scope: dto.scope,
    date: dto.date ?? undefined,
    shiftId: dto.shiftUniqueCode ?? undefined,
    label: dto.label,
    completionMode: dto.completionMode,
    sortOrder: dto.sortOrder,
    isCompletedByMe: dto.isCompletedByMe,
  }
}

export function toPlanningTodosResult(dto: KioskTodosResultDto): PlanningTodosResult {
  return {
    todos: dto.todos.map(toPlanningTodo),
    dressNote: dto.dressNote ?? undefined,
    note: dto.note ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Shift Swap Requests
// ---------------------------------------------------------------------------

export function toShiftSwapRequest(dto: ShiftSwapRequestDto): ShiftSwapRequest {
  return {
    id: dto.uniqueCode,
    requesterShiftId: dto.requesterShiftUniqueCode,
    targetShiftId: dto.targetShiftUniqueCode,
    requesterEmployeeId: dto.requesterEmployeeUniqueCode,
    targetEmployeeId: dto.targetEmployeeUniqueCode,
    status: dto.status,
    note: dto.note ?? undefined,
    createdAt: dto.createTime,
  }
}

// ---------------------------------------------------------------------------
// Shift Change Requests
// ---------------------------------------------------------------------------

export function toShiftChangeRequest(dto: ShiftChangeRequestDto): ShiftChangeRequest {
  return {
    id: dto.uniqueCode,
    shiftId: dto.shiftUniqueCode,
    employeeId: dto.employeeUniqueCode,
    status: dto.status,
    requestedDate: dto.requestedDate ?? undefined,
    requestedStartTime: dto.requestedStartTime ?? undefined,
    requestedEndTime: dto.requestedEndTime ?? undefined,
    note: dto.note ?? undefined,
    createdAt: dto.createTime,
  }
}

// ---------------------------------------------------------------------------
// My Requests  (GET /employee/planning/requests)
// ---------------------------------------------------------------------------

export function toMyRequests(dto: MyRequestsDto): MyRequests {
  return {
    swapRequests: dto.swapRequests.map(toShiftSwapRequest),
    changeRequests: dto.changeRequests.map(toShiftChangeRequest),
  }
}

// ---------------------------------------------------------------------------
// Shift Swap Candidates  (GET /employee/planning/shift-swaps/candidates)
// ---------------------------------------------------------------------------

export function toSwapCandidate(dto: ShiftSwapCandidateDto): PlanningSwapCandidate {
  return {
    shiftId: dto.shiftUniqueCode,
    employeeId: dto.employeeUniqueCode,
    employeeName: dto.employeeName,
    shiftDate: dto.shiftDate,
    startTime: dto.startTime,
    endTime: dto.endTime,
    teamId: dto.teamUniqueCode,
    teamName: dto.teamName,
    taskId: dto.planningTaskUniqueCode,
    taskName: dto.planningTaskName,
    city: dto.establishmentCity,
  }
}

export function toSwapCandidates(dtos: ShiftSwapCandidateDto[]): PlanningSwapCandidate[] {
  return dtos.map(toSwapCandidate)
}

// ---------------------------------------------------------------------------
// Leave Entitlement  (GET /employee/planning/leave)
// ---------------------------------------------------------------------------

export function toLeaveEntitlement(dto: MyLeaveEntitlementDto): LeaveEntitlement {
  return {
    calendarYear: dto.calendarYear,
    statutoryDays: dto.statutoryDays,
    employerPolicyDays: dto.employerPolicyDays,
    totalDays: dto.totalDays,
    entitlementHours: dto.entitlementHours,
    source: dto.source,
  }
}
