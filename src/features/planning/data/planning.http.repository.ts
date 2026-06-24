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

import { addLocalDays, getLocalToday } from "@/core/date"
import type {
  AvailabilityOverride,
  AvailabilityTemplate,
  LeaveEntitlement,
  MyRequests,
  PlanningCall,
  PlanningSwapCandidate,
  PlanningTodosResult,
  PlanningWindow,
  RequestItem,
  Shift,
} from "@/core/models"
import type { ScheduleError } from "@/features/schedule/data/schedule.errors"
import type {
  ScheduleOverview,
  CreateRequestInput,
} from "@/features/schedule/data/schedule.repository"
import { translate } from "@/i18n/translate"
import type { HttpClient } from "@/services/api/httpClient"
import { failure, success, type Result } from "@/shared/result"

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

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

function toPlanningError(
  status: number | null | undefined,
  fallbackMessage: string,
): PlanningError {
  if (status === 403)
    return { type: "forbidden", message: translate("planning:errors.accessDenied") }
  if (status === 404) return { type: "not-found", message: translate("planning:errors.notFound") }
  if (status === 409) return { type: "conflict", message: translate("planning:errors.conflict") }
  if (status === 422)
    return { type: "already-claimed", message: translate("planning:errors.alreadyClaimed") }
  if (status === 400) return { type: "validation", message: fallbackMessage }
  return { type: "validation", message: fallbackMessage }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createPlanningHttpRepository(httpClient: HttpClient): PlanningRepository {
  // ---------------------------------------------------------------------------
  // ScheduleRepository surface — the planning repo is the single source for the
  // schedule tab and the shift/availability screens. Reads compose the real
  // planning endpoints; availability writes go through PUT availability.
  // ---------------------------------------------------------------------------

  // The schedule view spans roughly a month back (for recent history) to a
  // quarter ahead (the planning horizon).
  const SCHEDULE_PAST_DAYS = 31
  const SCHEDULE_FUTURE_DAYS = 92

  async function getSchedule(_accountId: string): Promise<ScheduleOverview> {
    const today = getLocalToday()
    const [shifts, availability] = await Promise.all([
      getMySchedule({
        from: addLocalDays(today, -SCHEDULE_PAST_DAYS),
        to: addLocalDays(today, SCHEDULE_FUTURE_DAYS),
      }),
      getMyAvailability(),
    ])
    return {
      shifts,
      availabilityTemplate: availability.template,
      availabilityOverrides: availability.overrides,
      // Employers, planning windows and the generic request list are mock-era
      // concepts with no employee endpoint. Real requests live in the planning
      // hub (getMyRequests); swaps/changes use the dedicated planning flows.
      employers: [],
      planningWindows: [],
      requests: [],
    }
  }

  async function saveAvailabilityOverride(
    _accountId: string,
    day: AvailabilityOverride,
  ): Promise<Result<AvailabilityOverride, ScheduleError>> {
    // PUT availability replaces the whole set, so merge onto the current state.
    const current = await getMyAvailability()
    const overrides = { ...current.overrides, [day.date]: day }
    const result = await saveMyAvailability(current.template, Object.values(overrides))
    if (!result.ok) {
      return failure<ScheduleError>({
        type: "validation",
        message: translate("planning:errors.saveAvailabilityFailed"),
      })
    }
    return success(day)
  }

  async function saveAvailabilityTemplate(
    _accountId: string,
    template: AvailabilityTemplate,
  ): Promise<Result<AvailabilityTemplate, ScheduleError>> {
    const current = await getMyAvailability()
    const result = await saveMyAvailability(template, Object.values(current.overrides))
    if (!result.ok) {
      return failure<ScheduleError>({
        type: "validation",
        message: translate("planning:errors.saveAvailabilityFailed"),
      })
    }
    return success(template)
  }

  async function createRequest(
    _accountId: string,
    _input: CreateRequestInput,
  ): Promise<Result<RequestItem, ScheduleError>> {
    // The generic request form has no single employee endpoint; swaps and changes
    // use the dedicated planning flows, time-off is expressed via availability.
    return failure<ScheduleError>({
      type: "validation",
      message: translate("planning:errors.usePlanningTools"),
    })
  }

  async function respondToShift(
    _accountId: string,
    _shiftId: string,
  ): Promise<Result<Shift, ScheduleError>> {
    // Real shifts never require an in-app acknowledgement (the field is unset by
    // the transformer), so this path is unreachable for server-backed shifts.
    return failure<ScheduleError>({
      type: "not-found",
      message: translate("planning:errors.noResponseNeeded"),
    })
  }

  async function submitPlanningWindow(
    _accountId: string,
    _planningWindowId: string,
  ): Promise<Result<PlanningWindow, ScheduleError>> {
    return failure<ScheduleError>({
      type: "not-found",
      message: translate("planning:errors.windowsFromAvailability"),
    })
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
    return failure(toPlanningError(res.status, translate("planning:errors.saveAvailabilityFailed")))
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
    const res = await httpClient.post<void>(`/employee/planning/todos/${input.todoCode}/complete`)
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.completeTodoFailed")))
  }

  async function uncompleteTodo(input: CompleteTodoInput): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(`/employee/planning/todos/${input.todoCode}/uncomplete`)
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.uncompleteTodoFailed")))
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
    return failure(toPlanningError(res.status, translate("planning:errors.claimFailed")))
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

  async function createShiftSwap(
    params: CreateShiftSwapParams,
  ): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>("/employee/planning/shift-swaps", {
      requesterShiftUniqueCode: params.input.requesterShiftId,
      targetShiftUniqueCode: params.input.targetShiftId,
      note: params.input.note ?? null,
    })
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.swapCreateFailed")))
  }

  async function decideShiftSwap(
    params: DecideShiftSwapParams,
  ): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(
      `/employee/planning/shift-swaps/${params.swapCode}/decide`,
      { accept: params.accept, note: params.note ?? null },
    )
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.swapDecideFailed")))
  }

  async function cancelShiftSwap(swapCode: string): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>(`/employee/planning/shift-swaps/${swapCode}/cancel`)
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.swapCancelFailed")))
  }

  // ---------------------------------------------------------------------------
  // Shift Changes  (POST /employee/planning/shift-changes)
  // ---------------------------------------------------------------------------

  async function createShiftChange(
    params: CreateShiftChangeParams,
  ): Promise<Result<void, PlanningError>> {
    const res = await httpClient.post<void>("/employee/planning/shift-changes", {
      shiftUniqueCode: params.input.shiftId,
      requestedDate: params.input.requestedDate ?? null,
      requestedStartTime: params.input.requestedStartTime ?? null,
      requestedEndTime: params.input.requestedEndTime ?? null,
      note: params.input.note ?? null,
    })
    if (res.ok) return success(undefined)
    return failure(toPlanningError(res.status, translate("planning:errors.changeCreateFailed")))
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
