/**
 * PlanningRepository — employee self-scoped planning capabilities.
 * All GET /employee/planning/* endpoints are self-scoped (no employer/establishment
 * in the URL path — the JWT token identifies the employee).
 *
 * Exception: POST .../calls/{code}/claim still targets the employer+establishment
 * scoped URL because it's an action on an establishment resource.
 */

import type {
  AvailabilityTemplate,
  CreateShiftChangeInput,
  CreateShiftSwapInput,
  LeaveEntitlement,
  MyRequests,
  PlanningCall,
  PlanningSwapCandidate,
  PlanningTodosResult,
  Shift,
} from "@/core/models"
import type { ScheduleRepository } from "@/features/schedule/data/schedule.repository"
import type { Result } from "@/shared/result"

import type { PlanningError } from "./planning.errors"

// ---------------------------------------------------------------------------
// Parameter types for self-scoped queries
// ---------------------------------------------------------------------------

export interface GetScheduleParams {
  from: string // yyyy-MM-dd
  to: string // yyyy-MM-dd
}

export interface GetOpenCallsParams {
  from?: string // yyyy-MM-dd
  to?: string // yyyy-MM-dd
  /**
   * The session employer's unique code (accountId).
   * Passed through to toPlanningCall so the domain model carries the correct
   * employer code for the claim URL without an extra context lookup in the repo.
   */
  employerCode?: string
}

export interface ClaimCallInput {
  /** Employer unique code — required by the claim endpoint path. */
  employerCode: string
  /** Establishment unique code — required by the claim endpoint path. */
  establishmentCode: string
  callCode: string
}

export interface CompleteTodoInput {
  todoCode: string
}

export interface CreateShiftSwapParams {
  input: CreateShiftSwapInput
}

export interface DecideShiftSwapParams {
  swapCode: string
  accept: boolean
  note?: string
}

export interface CreateShiftChangeParams {
  input: CreateShiftChangeInput
}

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

export interface PlanningRepository extends ScheduleRepository {
  /**
   * Fetch the employee's own shifts for a date range (self-scoped).
   * Uses: GET /employee/planning/schedule?from&to
   */
  getMySchedule(params: GetScheduleParams): Promise<Shift[]>

  /**
   * Fetch the employee's full availability (recurring windows + date overrides).
   * Uses: GET /employee/planning/availability
   */
  getMyAvailability(): Promise<{
    template: AvailabilityTemplate
    overrides: Record<string, import("@/core/models").AvailabilityOverride>
  }>

  /**
   * Replace-set the employee's availability (windows + overrides).
   * Uses: PUT /employee/planning/availability
   */
  saveMyAvailability(
    template: AvailabilityTemplate,
    overrides: import("@/core/models").AvailabilityOverride[],
  ): Promise<Result<void, PlanningError>>

  /**
   * Fetch today's todos for the employee (self-scoped).
   * Uses: GET /employee/planning/todos
   */
  getMyTodos(): Promise<PlanningTodosResult>

  /**
   * Mark a todo as completed by the calling employee.
   * Uses: POST /employee/planning/todos/{todoCode}/complete
   */
  completeTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>>

  /**
   * Unmark a todo as completed.
   * Uses: POST /employee/planning/todos/{todoCode}/uncomplete
   */
  uncompleteTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>>

  /**
   * Fetch open planning calls the employee can claim.
   * Uses: GET /employee/planning/calls/open?from&to
   */
  getOpenCalls(params: GetOpenCallsParams): Promise<PlanningCall[]>

  /**
   * Claim a planning call (employee self-assigns).
   * Uses: POST /employers/{emp}/establishments/{est}/calls/{code}/claim
   * (This is the only endpoint that still uses the employer+establishment path.)
   */
  claimCall(input: ClaimCallInput): Promise<Result<void, PlanningError>>

  /**
   * Fetch the employee's own swap + change requests.
   * Uses: GET /employee/planning/requests
   */
  getMyRequests(): Promise<MyRequests>

  /**
   * Create a shift swap request.
   * Uses: POST /employee/planning/shift-swaps
   */
  createShiftSwap(params: CreateShiftSwapParams): Promise<Result<void, PlanningError>>

  /**
   * Accept or reject a swap request targeting this employee.
   * Uses: POST /employee/planning/shift-swaps/{swapCode}/decide
   */
  decideShiftSwap(params: DecideShiftSwapParams): Promise<Result<void, PlanningError>>

  /**
   * Cancel a swap request created by this employee.
   * Uses: POST /employee/planning/shift-swaps/{swapCode}/cancel
   */
  cancelShiftSwap(swapCode: string): Promise<Result<void, PlanningError>>

  /**
   * Create a shift change request.
   * Uses: POST /employee/planning/shift-changes
   */
  createShiftChange(params: CreateShiftChangeParams): Promise<Result<void, PlanningError>>

  /**
   * Fetch the employee's leave entitlement for the current year.
   * Uses: GET /employee/planning/leave
   * Returns entitlement totals (statutory + policy days + hours) — NOT a list
   * of leave requests.
   */
  getLeaveEntitlement(): Promise<LeaveEntitlement>

  /**
   * Fetch colleague shifts that the given shift can be swapped into.
   * Uses: GET /employee/planning/shift-swaps/candidates?shiftUniqueCode={code}
   */
  getSwapCandidates(shiftUniqueCode: string): Promise<PlanningSwapCandidate[]>
}
