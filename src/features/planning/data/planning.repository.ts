/**
 * PlanningRepository — extends ScheduleRepository with the employee planning
 * capabilities added in slice 5b:
 *   - open planning calls + claim
 *   - daily todos + complete/uncomplete
 *   - leave balances + leave requests + create leave request
 *   - shifts for a date range (employer/establishment-scoped)
 *   - employee availability (GET + PUT)
 */

import type { AvailabilityTemplate, LeaveBalance, LeaveRequest, PlanningCall, PlanningTodo, Shift } from "@/core/models"
import type { Result } from "@/shared/result"
import type { ScheduleRepository } from "@/features/schedule/data/schedule.repository"

import type { PlanningError } from "./planning.errors"
import type { CreateLeaveRequestInput } from "@/core/models"

export interface GetShiftsParams {
  from: string // yyyy-MM-dd
  to: string // yyyy-MM-dd
  establishmentCode?: string
  employeeCode?: string
}

export interface GetCallsParams {
  establishmentCode: string
  from?: string
  to?: string
}

export interface GetTodosParams {
  establishmentCode: string
  from?: string // yyyy-MM-dd
  to?: string // yyyy-MM-dd
}

export interface ClaimCallInput {
  employerCode: string
  establishmentCode: string
  callCode: string
}

export interface CompleteTodoInput {
  employerCode: string
  establishmentCode: string
  todoCode: string
}

export interface GetLeaveBalancesParams {
  employerCode: string
  employeeCode: string
}

export interface GetLeaveRequestsParams {
  employerCode: string
  employeeCode: string
}

export interface CreateLeaveRequestParams {
  employerCode: string
  employeeCode: string
  input: CreateLeaveRequestInput
}

export interface PlanningRepository extends ScheduleRepository {
  /**
   * Fetch the employee's own shifts for a date range.
   * Uses: GET /employers/{emp}/establishments/{est}/shifts?from&to&employeeCode
   */
  getShifts(accountId: string, params: GetShiftsParams): Promise<Shift[]>

  /**
   * Fetch open planning calls for an establishment.
   * Uses: GET /employers/{emp}/establishments/{est}/calls
   */
  getOpenCalls(accountId: string, params: GetCallsParams): Promise<PlanningCall[]>

  /**
   * Claim a planning call (employee self-assigns).
   * Uses: POST /employers/{emp}/establishments/{est}/calls/{code}/claim
   */
  claimCall(
    accountId: string,
    input: ClaimCallInput,
  ): Promise<Result<void, PlanningError>>

  /**
   * Fetch todos for an establishment in a date range.
   * Uses: GET /employers/{emp}/establishments/{est}/todos?from&to
   */
  getTodos(accountId: string, params: GetTodosParams): Promise<PlanningTodo[]>

  /**
   * Mark a todo as completed by the calling employee.
   * Uses: POST /employers/{emp}/establishments/{est}/todos/{code}/complete  (virtual — see impl notes)
   */
  completeTodo(
    accountId: string,
    input: CompleteTodoInput,
  ): Promise<Result<PlanningTodo, PlanningError>>

  /**
   * Fetch leave balances for an employee.
   * Uses: GET /employers/{emp}/employees/{emp_code}/leave-balances
   */
  getLeaveBalances(accountId: string, params: GetLeaveBalancesParams): Promise<LeaveBalance[]>

  /**
   * Fetch leave requests for an employee.
   * Uses: GET /employers/{emp}/employees/{emp_code}/leave-requests
   */
  getLeaveRequests(accountId: string, params: GetLeaveRequestsParams): Promise<LeaveRequest[]>

  /**
   * Create a leave request on behalf of the employee.
   * Uses: POST /employers/{emp}/employees/{emp_code}/leave-requests
   */
  createLeaveRequest(
    accountId: string,
    params: CreateLeaveRequestParams,
  ): Promise<Result<LeaveRequest, PlanningError>>

  /**
   * Fetch the employee's full availability template + overrides.
   * Uses: GET /employers/{emp}/employees/{emp_code}/availability
   */
  getAvailability(
    accountId: string,
    employerCode: string,
    employeeCode: string,
  ): Promise<AvailabilityTemplate>
}
