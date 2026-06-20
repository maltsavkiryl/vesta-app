/**
 * Hand-written DTO interfaces matching the Vesta Workforce API employee timer.
 * Source: GET/POST /api/v1/employee/timer/* (TimeEntryDto, TimeEntryResultDto).
 * MUST NOT leak into screens — transform via time.transformer.ts.
 */

/** Mirrors Domain EntryStatus. May arrive as the enum name or its ordinal. */
export type TimeEntryStatusDto = "Working" | "OnBreak" | "Completed"

export interface TimeEntryDto {
  id: number
  employerUniqueCode: string
  establishmentUniqueCode: string
  establishmentDisplayName?: string | null
  employeeUniqueCode: string
  employeeDisplayName?: string | null
  status: TimeEntryStatusDto | number
  startTime: string
  endTime?: string | null
  contractId?: number | null
  /** .NET TimeSpan, serialised as "HH:MM:SS" (or "d.HH:MM:SS"). */
  workDuration: string
  breakDuration: string
}

export interface TimeEntryResultDto {
  entries: TimeEntryDto[]
}

/** Body for the employee punch endpoints (carries the establishment + geo). */
export interface EmployeePunchBody {
  establishmentUniqueCode: string
  lat?: number
  lng?: number
}
