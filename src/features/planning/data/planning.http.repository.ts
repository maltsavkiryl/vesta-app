/**
 * HTTP implementation of PlanningRepository.
 *
 * All /employee/planning/* endpoints are self-scoped — the JWT token identifies
 * the employee. No employer/establishment code appears in these URLs (except
 * the claimCall mutation, which targets the employer+establishment resource).
 *
 * Convention:
 *  - Read operations throw on infrastructure failure (network / 5xx).
 *  - Write operations return Result<T, PlanningError> — domain errors stay
 *    in the type system and never throw.
 */

import type {
  AvailabilityOverride,
  AvailabilityTemplate,
  LeaveEntitlement,
  MyRequests,
  PlanningCall,
  PlanningSwapCandidate,
  PlanningTodosResult,
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
  CreateShiftChangeParams,
  CreateShiftSwapParams,
  DecideShiftSwapParams,
  GetOpenCallsParams,
  GetScheduleParams,
  PlanningRepository,
} from "./planning.repository"
import type {
  EmployeeAvailabilityDto,
  KioskTodosResultDto,
  MyLeaveEntitlementDto,
  MyRequestsDto,
  PlanningCallDto,
  ShiftDto,
  ShiftSwapCandidateDto,
  UpdateEmployeeAvailabilityDto,
} from "./planning.dto"
import {
  fromAvailabilityOverride,
  fromAvailabilityTemplate,
  toAvailabilityOverrides,
  toAvailabilityTemplate,
  toLeaveEntitlement,
  toMyRequests,
  toPlanningCall,
  toPlanningTodosResult,
  toShifts,
  toSwapCandidates,
} from "./planning.transformer"
import type { PlanningWindow } from "@/core/models"

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

function toPlanningError(status: number | null | undefined, fallbackMessage: string): PlanningError {
  if (status === 403) return { type: "forbidden", message: "Access denied." }
  if (status === 404) return { type: "not-found", message: "Resource not found." }
  if (status === 409) return { type: "conflict", message: "This action conflicts with an existing state." }
  if (status === 422) return { type: "already-claimed", message: "This call has already been claimed." }
  if (status === 400) return { type: "validation", message: fallbackMessage }
  return { type: "validation", message: fallbackMessage }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createPlanningHttpRepository(httpClient: HttpClient): PlanningRepository {
  // ---------------------------------------------------------------------------
  // ScheduleRepository surface (no-ops — kept to satisfy the interface contract;
  // the composition layer routes to the schedule repo for these)
  // ---------------------------------------------------------------------------

  async function getSchedule(_accountId: string): Promise<ScheduleOverview> {
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
    _day: AvailabilityOverride,
  ): Promise<Result<AvailabilityOverride, ScheduleError>> {
    return failure<ScheduleError>({ type: "validation", message: "Use saveMyAvailability for HTTP updates." })
  }

  async function saveAvailabilityTemplate(
    _accountId: string,
    _template: AvailabilityTemplate,
  ): Promise<Result<AvailabilityTemplate, ScheduleError>> {
    return failure<ScheduleError>({ type: "validation", message: "Use saveMyAvailability for HTTP updates." })
  }

  async function submitPlanningWindow(
    _accountId: string,
    _planningWindowId: string,
  ): Promise<Result<PlanningWindow, ScheduleError>> {
    return failure<ScheduleError>({ type: "not-found", message: "Not implemented in planning HTTP repo." })
  }

  // ---------------------------------------------------------------------------
  // Schedule  (GET /employee/planning/schedule?from=&to=)
  // ---------------------------------------------------------------------------

  async function getMySchedule(params: GetScheduleParams): Promise<Shift[]> {
    const res = await httpClient.get<ShiftDto[]>("/employee/planning/schedule", {
      from: params.from,
      to: params.to,
    })
    if (!res.ok || !res.data) throw new Error("Failed to load schedule")
    return toShifts(res.data)
  }

  // ---------------------------------------------------------------------------
  // Availability  (GET/PUT /employee/planning/availability)
  // ---------------------------------------------------------------------------

  async function getMyAvailability(): Promise<{
    template: AvailabilityTemplate
    overrides: Record<string, AvailabilityOverride>
  }> {
    const res = await httpClient.get<EmployeeAvailabilityDto>("/employee/planning/availability")
    if (!res.ok || !res.data) throw new Error("Failed to load availability")
    return {
      template: toAvailabilityTemplate(res.data.windows),
      overrides: toAvailabilityOverrides(res.data.overrides),
    }
  }

  async function saveMyAvailability(
    template: AvailabilityTemplate,
    overrides: AvailabilityOverride[],
  ): Promise<Result<void, PlanningError>> {
    const body: UpdateEmployeeAvailabilityDto = {
      windows: fromAvailabilityTemplate(template),
      overrides: overrides.map(fromAvailabilityOverride),
    }
    const res = await httpClient.put<void>("/employee/planning/availability", body)
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not save availability."))
  }

  // ---------------------------------------------------------------------------
  // Todos  (GET /employee/planning/todos, POST .../complete, POST .../uncomplete)
  // ---------------------------------------------------------------------------

  async function getMyTodos(): Promise<PlanningTodosResult> {
    const res = await httpClient.get<KioskTodosResultDto>("/employee/planning/todos")
    if (!res.ok || !res.data) throw new Error("Failed to load todos")
    return toPlanningTodosResult(res.data)
  }

  async function completeTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(
      `/employee/planning/todos/${input.todoCode}/complete`,
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not complete todo."))
  }

  async function uncompleteTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(
      `/employee/planning/todos/${input.todoCode}/uncomplete`,
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not uncomplete todo."))
  }

  // ---------------------------------------------------------------------------
  // Open Calls  (GET /employee/planning/calls/open?from=&to=)
  // ---------------------------------------------------------------------------

  async function getOpenCalls(params: GetOpenCallsParams): Promise<PlanningCall[]> {
    const query: Record<string, string> = {}
    if (params.from) query.from = params.from
    if (params.to) query.to = params.to

    const res = await httpClient.get<PlanningCallDto[]>(
      "/employee/planning/calls/open",
      Object.keys(query).length > 0 ? query : undefined,
    )
    if (!res.ok || !res.data) throw new Error("Failed to load open calls")

    // The employer code comes from the session (passed via params.employerCode).
    // The establishment code is now carried directly on PlanningCallDto
    // (dto.establishmentUniqueCode) — the backend exposes it so the mobile app
    // can build the correct claim URL without a separate lookup.
    const employerCode = params.employerCode ?? ""
    return res.data.map((dto) => toPlanningCall(dto, employerCode, dto.establishmentUniqueCode))
  }

  // ---------------------------------------------------------------------------
  // Claim Call  (POST /employers/{emp}/establishments/{est}/calls/{code}/claim)
  // This is the only endpoint that still uses the employer+establishment URL.
  // ---------------------------------------------------------------------------

  async function claimCall(input: ClaimCallInput): Promise<Result<void, PlanningError>> {
    const { employerCode, establishmentCode, callCode } = input
    const res = await httpClient.post<void>(
      `/employers/${employerCode}/establishments/${establishmentCode}/calls/${callCode}/claim`,
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not claim this call."))
  }

  // ---------------------------------------------------------------------------
  // My Requests  (GET /employee/planning/requests)
  // ---------------------------------------------------------------------------

  async function getMyRequests(): Promise<MyRequests> {
    const res = await httpClient.get<MyRequestsDto>("/employee/planning/requests")
    if (!res.ok || !res.data) throw new Error("Failed to load requests")
    return toMyRequests(res.data)
  }

  // ---------------------------------------------------------------------------
  // Shift Swaps  (POST /employee/planning/shift-swaps/*)
  // ---------------------------------------------------------------------------

  async function createShiftSwap(params: CreateShiftSwapParams): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>("/employee/planning/shift-swaps", {
      requesterShiftUniqueCode: params.input.requesterShiftId,
      targetShiftUniqueCode: params.input.targetShiftId,
      note: params.input.note ?? null,
    })
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not create shift swap request."))
  }

  async function decideShiftSwap(params: DecideShiftSwapParams): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(
      `/employee/planning/shift-swaps/${params.swapCode}/decide`,
      { accept: params.accept, note: params.note ?? null },
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not decide shift swap."))
  }

  async function cancelShiftSwap(swapCode: string): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(
      `/employee/planning/shift-swaps/${swapCode}/cancel`,
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not cancel shift swap."))
  }

  // ---------------------------------------------------------------------------
  // Shift Changes  (POST /employee/planning/shift-changes)
  // ---------------------------------------------------------------------------

  async function createShiftChange(params: CreateShiftChangeParams): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>("/employee/planning/shift-changes", {
      shiftUniqueCode: params.input.shiftId,
      requestedDate: params.input.requestedDate ?? null,
      requestedStartTime: params.input.requestedStartTime ?? null,
      requestedEndTime: params.input.requestedEndTime ?? null,
      note: params.input.note ?? null,
    })
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, "Could not create shift change request."))
  }

  // ---------------------------------------------------------------------------
  // Leave Entitlement  (GET /employee/planning/leave)
  // ---------------------------------------------------------------------------

  async function getLeaveEntitlement(): Promise<LeaveEntitlement> {
    const res = await httpClient.get<MyLeaveEntitlementDto>("/employee/planning/leave")
    if (!res.ok || !res.data) throw new Error("Failed to load leave entitlement")
    return toLeaveEntitlement(res.data)
  }

  // ---------------------------------------------------------------------------
  // Swap Candidates  (GET /employee/planning/shift-swaps/candidates?shiftUniqueCode=)
  // ---------------------------------------------------------------------------

  async function getSwapCandidates(shiftUniqueCode: string): Promise<PlanningSwapCandidate[]> {
    const res = await httpClient.get<ShiftSwapCandidateDto[]>(
      "/employee/planning/shift-swaps/candidates",
      { shiftUniqueCode },
    )
    if (!res.ok || !res.data) throw new Error("Failed to load swap candidates")
    return toSwapCandidates(res.data)
  }

  return {
    // ScheduleRepository surface (no-ops)
    getSchedule,
    createRequest,
    respondToShift,
    saveAvailabilityOverride,
    saveAvailabilityTemplate,
    submitPlanningWindow,
    // Self-scoped planning surface
    getMySchedule,
    getMyAvailability,
    saveMyAvailability,
    getMyTodos,
    completeTodo,
    uncompleteTodo,
    getOpenCalls,
    claimCall,
    getMyRequests,
    createShiftSwap,
    decideShiftSwap,
    cancelShiftSwap,
    createShiftChange,
    getLeaveEntitlement,
    getSwapCandidates,
  }
}
