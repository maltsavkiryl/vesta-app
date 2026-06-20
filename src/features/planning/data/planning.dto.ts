/**
 * Hand-written DTO interfaces matching the Vesta Workforce API OpenAPI spec.
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
export type LeaveRequestStatusDto = "Submitted" | "Approved" | "Rejected" | "Cancelled"

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
// Planning Call DTOs
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
// Todo DTOs
// ---------------------------------------------------------------------------

export interface PlanningTodoCompletionDto {
  employeeUniqueCode: string
  employeeName: string
  completedAtUtc: string // ISO date-time
  channel: string
}

export interface PlanningTodoDto {
  uniqueCode: string
  establishmentUniqueCode: string
  scope: string
  date?: string | null // yyyy-MM-dd
  shiftUniqueCode?: string | null
  label: string
  completionMode: string
  sortOrder: number
  requiredCount: number
  completedCount: number
  isComplete: boolean
  completions: PlanningTodoCompletionDto[]
}

// ---------------------------------------------------------------------------
// Leave DTOs
// ---------------------------------------------------------------------------

export interface LeaveBalanceDto {
  calendarYear: number
  statutoryDays: number
  employerPolicyDays: number
  totalDays: number
}

export interface PagedResultDto<T> {
  items: T[]
  offset: number
  limit: number
  totalCount: number
}

export interface LeaveRequestDto {
  id: number
  employeeUniqueCode: string
  employeeDisplayName?: string | null
  employerUniqueCode: string
  leaveTypeId: number
  leaveTypeName?: string | null
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  status: LeaveRequestStatusDto
  requestNotes?: string | null
  decisionNotes?: string | null
  approverIdentityId?: string | null
}

export interface CreateLeaveRequestDto {
  leaveTypeId: number
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  requestNotes?: string | null
}
