/**
 * HTTP implementation of PlanningRepository.
 *
 * Convention:
 *  - `accountId` in every method IS the employer's uniqueCode (the JWT exchange
 *    selects an employer and stores its code as accountId; see authService.ts).
 *  - Read operations throw on infrastructure failure (network / 5xx).
 *  - Write operations return Result<T, PlanningError> — domain errors stay
 *    in the type system and never throw.
 */

import type {
  AvailabilityOverride,
  AvailabilityTemplate,
  LeaveBalance,
  LeaveRequest,
  PlanningCall,
  PlanningTodo,
  PlanningWindow,
  RequestItem,
  Shift,
} from "@/core/models"
import type { HttpClient } from "@/services/api/httpClient"
import { failure, success, type Result } from "@/shared/result"
import type { ScheduleOverview, CreateRequestInput } from "@/features/schedule/data/schedule.repository"
import type { ScheduleError } from "@/features/schedule/data/schedule.errors"

import type { PlanningError } from "./planning.errors"
import type {
  ClaimCallInput,
  CompleteTodoInput,
  CreateLeaveRequestParams,
  GetCallsParams,
  GetLeaveBalancesParams,
  GetLeaveRequestsParams,
  GetShiftsParams,
  GetTodosParams,
  PlanningRepository,
} from "./planning.repository"
import type {
  EmployeeAvailabilityDto,
  LeaveBalanceDto,
  LeaveRequestDto,
  PagedResultDto,
  PlanningCallDto,
  PlanningTodoDto,
  ShiftDto,
} from "./planning.dto"
import type { CreateLeaveRequestInput } from "@/core/models"
import {
  toAvailabilityOverrides,
  toAvailabilityTemplate,
  toLeaveBalance,
  toLeaveRequest,
  toLeaveRequests,
  toPlanningCall,
  toPlanningTodo,
  toPlanningTodos,
  toShifts,
} from "./planning.transformer"

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

function toPlanningError(status: number | null | undefined, fallbackMessage: string): PlanningError {
  if (status === 403) return { type: "forbidden", message: "Access denied." }
  if (status === 404) return { type: "not-found", message: "Resource not found." }
  if (status === 409) return { type: "already-claimed", message: "This call has already been claimed." }
  if (status === 400 || status === 422) return { type: "validation", message: fallbackMessage }
  return { type: "validation", message: fallbackMessage }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createPlanningHttpRepository(httpClient: HttpClient): PlanningRepository {
  // ---------------------------------------------------------------------------
  // ScheduleRepository surface (kept as no-ops / mocks because these will be
  // wired separately or are handled by the existing schedule data layer)
  // ---------------------------------------------------------------------------

  async function getSchedule(_accountId: string): Promise<ScheduleOverview> {
    // The live schedule is fetched via getShifts/getAvailability in the planning
    // layer. This stub satisfies the interface; the composition layer can keep
    // routing to the mock schedule repo for these fields until they're migrated.
    return {
      shifts: [],
      availabilityTemplate: {
        monday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        tuesday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        wednesday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        thursday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        friday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        saturday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
        sunday: { status: "unavailable", startTime: "00:00", endTime: "00:00" },
      },
      availabilityOverrides: {},
      employers: [],
      planningWindows: [],
      requests: [],
    }
  }

  async function createRequest(
    _accountId: string,
    _input: CreateRequestInput,
  ): Promise<Result<RequestItem, ScheduleError>> {
    return failure<ScheduleError>({ type: "validation", message: "Not implemented in planning HTTP repo." })
  }

  async function respondToShift(
    _accountId: string,
    _shiftId: string,
  ): Promise<Result<Shift, ScheduleError>> {
    return failure<ScheduleError>({ type: "not-found", message: "Not implemented in planning HTTP repo." })
  }

  async function saveAvailabilityOverride(
    _accountId: string,
    day: AvailabilityOverride,
  ): Promise<Result<AvailabilityOverride, ScheduleError>> {
    return failure<ScheduleError>({ type: "validation", message: "Use saveAvailabilityTemplate for HTTP updates." })
  }

  async function saveAvailabilityTemplate(
    _accountId: string,
    _template: AvailabilityTemplate,
  ): Promise<Result<AvailabilityTemplate, ScheduleError>> {
    return failure<ScheduleError>({ type: "validation", message: "Not implemented in planning HTTP repo." })
  }

  async function submitPlanningWindow(
    _accountId: string,
    _planningWindowId: string,
  ): Promise<Result<PlanningWindow, ScheduleError>> {
    return failure<ScheduleError>({ type: "not-found", message: "Not implemented in planning HTTP repo." })
  }

  // ---------------------------------------------------------------------------
  // Shifts
  // ---------------------------------------------------------------------------

  async function getShifts(accountId: string, params: GetShiftsParams): Promise<Shift[]> {
    const { from, to, establishmentCode, employeeCode } = params
    if (!establishmentCode) {
      // Without an establishment code we cannot call the employer/establishment scoped endpoint.
      return []
    }
    const res = await httpClient.get<ShiftDto[]>(
      `/employers/${accountId}/establishments/${establishmentCode}/shifts`,
      {
        from,
        to,
        ...(employeeCode ? { employeeUniqueCode: employeeCode } : {}),
      },
    )
    if (!res.ok || !res.data) throw new Error("Failed to load shifts")
    return toShifts(res.data)
  }

  // ---------------------------------------------------------------------------
  // Planning Calls
  // ---------------------------------------------------------------------------

  async function getOpenCalls(accountId: string, params: GetCallsParams): Promise<PlanningCall[]> {
    const { establishmentCode, from, to } = params
    const queryParams: Record<string, string> = {}
    if (from) queryParams.from = from
    if (to) queryParams.to = to

    const res = await httpClient.get<PlanningCallDto[]>(
      `/employers/${accountId}/establishments/${establishmentCode}/calls`,
      Object.keys(queryParams).length > 0 ? queryParams : undefined,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load planning calls")
    return res.data.map((dto) => toPlanningCall(dto, accountId, establishmentCode))
  }

  async function claimCall(
    _accountId: string,
    input: ClaimCallInput,
  ): Promise<Result<void, PlanningError>> {
    const { employerCode, establishmentCode, callCode } = input
    const res = await httpClient.post<void>(
      `/employers/${employerCode}/establishments/${establishmentCode}/calls/${callCode}/claim`,
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not claim this call."))
  }

  // ---------------------------------------------------------------------------
  // Todos
  // ---------------------------------------------------------------------------

  async function getTodos(accountId: string, params: GetTodosParams): Promise<PlanningTodo[]> {
    const { establishmentCode, from, to } = params
    const queryParams: Record<string, string> = {}
    if (from) queryParams.from = from
    if (to) queryParams.to = to

    const res = await httpClient.get<PlanningTodoDto[]>(
      `/employers/${accountId}/establishments/${establishmentCode}/todos`,
      Object.keys(queryParams).length > 0 ? queryParams : undefined,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load todos")
    return toPlanningTodos(res.data)
  }

  async function completeTodo(
    accountId: string,
    input: CompleteTodoInput,
  ): Promise<Result<PlanningTodo, PlanningError>> {
    // The spec shows admin-side PUT on the todo resource (SavePlanningTodoDto).
    // The plan doc mentions POST .../todos/{code}/complete — not yet in the spec.
    // We implement a best-effort PUT that re-fetches to return the updated todo.
    const { establishmentCode, todoCode } = input
    const res = await httpClient.put<void>(
      `/employers/${accountId}/establishments/${establishmentCode}/todos/${todoCode}`,
      { sortOrder: 0 }, // minimal valid SavePlanningTodoDto
    )
    if (!res.ok) {
      return failure(toPlanningError(res.status, "Could not complete todo."))
    }
    // Re-fetch the single todo to return the updated state.
    const todosRes = await httpClient.get<PlanningTodoDto[]>(
      `/employers/${accountId}/establishments/${establishmentCode}/todos`,
    )
    if (!todosRes.ok || !todosRes.data) {
      return failure<PlanningError>({ type: "not-found", message: "Todo not found after update." })
    }
    const updated = todosRes.data.find((t) => t.uniqueCode === todoCode)
    if (!updated) {
      return failure<PlanningError>({ type: "not-found", message: "Todo not found." })
    }
    return success(toPlanningTodo(updated))
  }

  // ---------------------------------------------------------------------------
  // Leave
  // ---------------------------------------------------------------------------

  async function getLeaveBalances(
    _accountId: string,
    params: GetLeaveBalancesParams,
  ): Promise<LeaveBalance[]> {
    const { employerCode, employeeCode } = params
    const res = await httpClient.get<PagedResultDto<LeaveBalanceDto>>(
      `/employers/${employerCode}/employees/${employeeCode}/leave-balances`,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load leave balances")
    return res.data.items.map(toLeaveBalance)
  }

  async function getLeaveRequests(
    _accountId: string,
    params: GetLeaveRequestsParams,
  ): Promise<LeaveRequest[]> {
    const { employerCode, employeeCode } = params
    const res = await httpClient.get<PagedResultDto<LeaveRequestDto>>(
      `/employers/${employerCode}/employees/${employeeCode}/leave-requests`,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load leave requests")
    return toLeaveRequests(res.data.items)
  }

  async function createLeaveRequest(
    _accountId: string,
    params: CreateLeaveRequestParams,
  ): Promise<Result<LeaveRequest, PlanningError>> {
    const { employerCode, employeeCode, input } = params
    const res = await httpClient.post<LeaveRequestDto>(
      `/employers/${employerCode}/employees/${employeeCode}/leave-requests`,
      {
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        requestNotes: input.requestNotes,
      },
    )
    if (!res.ok || !res.data) {
      return failure(toPlanningError(res.status, "Could not create leave request."))
    }
    return success(toLeaveRequest(res.data))
  }

  // ---------------------------------------------------------------------------
  // Availability
  // ---------------------------------------------------------------------------

  async function getAvailability(
    _accountId: string,
    employerCode: string,
    employeeCode: string,
  ): Promise<AvailabilityTemplate> {
    const res = await httpClient.get<EmployeeAvailabilityDto>(
      `/employers/${employerCode}/employees/${employeeCode}/availability`,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load availability")
    return toAvailabilityTemplate(res.data.windows)
  }

  return {
    // ScheduleRepository surface
    getSchedule,
    createRequest,
    respondToShift,
    saveAvailabilityOverride,
    saveAvailabilityTemplate,
    submitPlanningWindow,
    // Extended planning surface
    getShifts,
    getOpenCalls,
    claimCall,
    getTodos,
    completeTodo,
    getLeaveBalances,
    getLeaveRequests,
    createLeaveRequest,
    getAvailability,
  }
}
