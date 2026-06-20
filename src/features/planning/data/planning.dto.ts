/**
 * Hand-written DTO interfaces matching the Vesta Workforce API OpenAPI spec.
 * Source: GET /api/v1/employee/planning/* paths in Vesta.Workforce.Api.correct.json.
 * These types MUST NOT leak into screens or UI components — transform them
 * via planning.transformer.ts before use.
 */

// ---------------------------------------------------------------------------
// Shared enums (string unions mirroring the spec enums)
// ---------------------------------------------------------------------------

export type AvailabilityIntentDto = "Want" | "Standby" | "Unavailable"
export type FillTypeDto = "Internal" | "External"
export type TransportMethodDto =
  | "PrivateTransport"
  | "PublicTransportTrain"
  | "Bicycle"
  | "OtherPublicTransport"
  | "OnFoot"
  | "None"
export type ShiftStatusDto = "Concept" | "Published"

// ---------------------------------------------------------------------------
// Availability DTOs
// ---------------------------------------------------------------------------

/**
 * One recurring weekly availability window.
 * weekday: 0 = Monday … 6 = Sunday.
 */
export interface AvailabilityWindowDto {
  weekday: number
  startTime: string // HH:mm
  endTime: string // HH:mm
  intent: AvailabilityIntentDto
  note?: string | null
}

/** One per-date availability override. */
export interface AvailabilityOverrideDto {
  date: string // yyyy-MM-dd
  startTime: string // HH:mm
  endTime: string // HH:mm
  intent: AvailabilityIntentDto
  note?: string | null
  confirmed: boolean
}

/** Full availability: recurring pattern + per-date overrides. */
export interface EmployeeAvailabilityDto {
  windows: AvailabilityWindowDto[]
  overrides: AvailabilityOverrideDto[]
}

/** Replace-set availability update body. */
export interface UpdateEmployeeAvailabilityDto {
  windows: AvailabilityWindowDto[]
  overrides: AvailabilityOverrideDto[]
}

// ---------------------------------------------------------------------------
// Shift DTOs
// ---------------------------------------------------------------------------

export interface ShiftDto {
  uniqueCode: string
  establishmentUniqueCode: string
  employeeUniqueCode?: string | null
  teamUniqueCode?: string | null
  planningTaskUniqueCode?: string | null
  shiftDate: string // yyyy-MM-dd
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: ShiftStatusDto
  isGenerated: boolean
  eventUniqueCode?: string | null
  locationUniqueCode?: string | null
  addressStreet: string
  addressHouseNumber: string
  addressBoxNumber?: string | null
  addressZipCode: string
  addressCity: string
  addressCountry: string
  overrideAddressStreet?: string | null
  overrideAddressHouseNumber?: string | null
  overrideAddressBoxNumber?: string | null
  overrideAddressZipCode?: string | null
  overrideAddressCity?: string | null
  overrideAddressCountry?: string | null
  transportMethod?: TransportMethodDto | null
  dressNote?: string | null
  note?: string | null
  fillType: FillTypeDto
  agencyUniqueCode?: string | null
  externalWorkerName?: string | null
  externalVehicle?: string | null
}

// ---------------------------------------------------------------------------
// Planning Call DTOs  (GET /employee/planning/calls/open)
// ---------------------------------------------------------------------------

export interface PlanningCallClaimDto {
  uniqueCode: string
  employeeUniqueCode: string
  employeeName: string
  state: string
  claimedAtUtc: string // ISO date-time
  availabilityIntent: string
}

export interface PlanningCallCandidateDto {
  employeeUniqueCode: string
  employeeName: string
  availabilityIntent: string
}

export interface PlanningCallDto {
  uniqueCode: string
  shiftUniqueCode: string
  /** Establishment that owns this call — required to build the claim URL. */
  establishmentUniqueCode: string
  target: string
  mode: string
  status: string
  agencyUniqueCode?: string | null
  note?: string | null
  createTime: string // ISO date-time
  claims: PlanningCallClaimDto[]
  candidates: PlanningCallCandidateDto[]
}

// ---------------------------------------------------------------------------
// Todo DTOs  (GET /employee/planning/todos → KioskTodosResultDto)
// ---------------------------------------------------------------------------

/**
 * Employee-facing todo item (KioskTodoDto in the spec).
 * Note: the employee endpoint only exposes isCompletedByMe (not requiredCount/
 * completedCount/completions which are admin-side fields).
 */
export interface KioskTodoDto {
  uniqueCode: string
  scope: string
  date?: string | null // yyyy-MM-dd
  shiftUniqueCode?: string | null
  label: string
  completionMode: string
  sortOrder: number
  isCompletedByMe: boolean
}

/** Wrapper returned by GET /employee/planning/todos */
export interface KioskTodosResultDto {
  todos: KioskTodoDto[]
  dressNote?: string | null
  note?: string | null
}

// ---------------------------------------------------------------------------
// Shift Swap DTOs  (GET /employee/planning/requests + POST /employee/planning/shift-swaps)
// ---------------------------------------------------------------------------

export interface ShiftSwapRequestDto {
  uniqueCode: string
  requesterShiftUniqueCode: string
  targetShiftUniqueCode: string
  requesterEmployeeUniqueCode: string
  targetEmployeeUniqueCode: string
  status: string
  note?: string | null
  createTime: string // ISO date-time
}

export interface CreateShiftSwapRequestDto {
  requesterShiftUniqueCode: string
  targetShiftUniqueCode: string
  note?: string | null
}

export interface DecideShiftSwapDto {
  /** true = accept/approve, false = reject */
  accept: boolean
  note?: string | null
}

// ---------------------------------------------------------------------------
// Shift Change DTOs  (GET /employee/planning/requests + POST /employee/planning/shift-changes)
// ---------------------------------------------------------------------------

export interface ShiftChangeRequestDto {
  uniqueCode: string
  shiftUniqueCode: string
  employeeUniqueCode: string
  status: string
  requestedDate?: string | null // yyyy-MM-dd
  requestedStartTime?: string | null // HH:mm
  requestedEndTime?: string | null // HH:mm
  note?: string | null
  createTime: string // ISO date-time
}

export interface CreateShiftChangeRequestDto {
  shiftUniqueCode: string
  requestedDate?: string | null // yyyy-MM-dd
  requestedStartTime?: string | null // HH:mm
  requestedEndTime?: string | null // HH:mm
  note?: string | null
}

// ---------------------------------------------------------------------------
// My Requests DTO  (GET /employee/planning/requests)
// ---------------------------------------------------------------------------

export interface MyRequestsDto {
  swapRequests: ShiftSwapRequestDto[]
  changeRequests: ShiftChangeRequestDto[]
}

// ---------------------------------------------------------------------------
// Leave Entitlement DTO  (GET /employee/planning/leave)
// ---------------------------------------------------------------------------

/**
 * The employee's own annual leave entitlement for the current calendar year.
 * This is NOT a leave-request list — it is the statutory + employer-policy
 * entitlement totals.
 */
export interface MyLeaveEntitlementDto {
  calendarYear: number
  statutoryDays: number
  employerPolicyDays: number
  totalDays: number
  /** Annual leave entitlement in hours. */
  entitlementHours: number
  /** 0 = Local, 1 = Prisma */
  source: number
}
