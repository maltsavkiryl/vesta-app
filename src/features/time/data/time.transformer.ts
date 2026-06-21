import { formatLocalDate } from "@/core/date"
import type { ClockSession, ClockSessionContext, ClockState, TimeEntry } from "@/core/models"

import type { TimeEntryDto } from "./time.dto"

/** Local context the lean API omits but the rich clock UI needs. */
export interface ClockMeta {
  establishmentUniqueCode: string
  context: ClockSessionContext
  breakStartedAt?: string
  /**
   * Optimistic local session, set while punches are queued offline. When present
   * (and the queue is non-empty) the UI renders this instead of the server entry,
   * so clocking in/out works without a connection.
   */
  optimistic?: {
    state: Exclude<ClockState, "idle">
    startedAt: string
    accumulatedBreakSeconds: number
  }
}

/** Parses a .NET TimeSpan ("HH:MM:SS" or "d.HH:MM:SS[.fff]") into seconds. */
export function parseDurationSeconds(value: string | null | undefined): number {
  if (!value) return 0
  const match = /^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})/.exec(value)
  if (!match) return 0
  const [, days, hours, minutes, seconds] = match
  return Number(days ?? 0) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

function toState(status: TimeEntryDto["status"]): ClockState {
  if (typeof status === "number") {
    if (status === 2) return "onBreak"
    if (status === 1) return "working"
    return "idle"
  }
  if (status === "OnBreak") return "onBreak"
  if (status === "Working") return "working"
  return "idle"
}

function emptyContext(): ClockSessionContext {
  return { source: "employer", employerId: "", venueName: "", venueAddress: "" }
}

/** A not-clocked-in session (no establishment context). */
export function idleClockSession(): ClockSession {
  return {
    ...emptyContext(),
    state: "idle",
    accumulatedBreakSeconds: 0,
    events: [],
  }
}

/** Builds the clock session from optimistic local meta (used while offline). */
export function optimisticClockSession(meta: ClockMeta): ClockSession {
  if (!meta.optimistic) return idleClockSession()
  return {
    ...meta.context,
    state: meta.optimistic.state,
    startedAt: meta.optimistic.startedAt,
    breakStartedAt: meta.optimistic.state === "onBreak" ? meta.breakStartedAt : undefined,
    accumulatedBreakSeconds: meta.optimistic.accumulatedBreakSeconds,
    events: [],
  }
}

/**
 * Maps the server's open time entry into a ClockSession. The lean DTO supplies
 * state/start/accumulated-break; the local meta supplies the venue context and
 * the current break's start (which the API does not return) so the live timer
 * and break ticker behave.
 */
export function toClockSession(dto: TimeEntryDto | null, meta: ClockMeta | null): ClockSession {
  const state = dto ? toState(dto.status) : "idle"
  if (!dto || state === "idle") return idleClockSession()

  return {
    ...(meta?.context ?? emptyContext()),
    venueName: meta?.context.venueName || dto.establishmentDisplayName || "",
    state,
    startedAt: dto.startTime,
    breakStartedAt: state === "onBreak" ? meta?.breakStartedAt : undefined,
    accumulatedBreakSeconds: parseDurationSeconds(dto.breakDuration),
    events: [],
  }
}

/** Maps a completed server time entry into the history row model. */
export function toTimeEntry(dto: TimeEntryDto): TimeEntry {
  const workedSeconds = parseDurationSeconds(dto.workDuration)
  const breakSeconds = parseDurationSeconds(dto.breakDuration)

  return {
    source: "employer",
    employerId: dto.establishmentUniqueCode,
    venueName: dto.establishmentDisplayName ?? "",
    venueAddress: "",
    id: String(dto.id),
    date: formatLocalDate(new Date(dto.startTime)),
    shiftLabel: "Clocked shift",
    clockInAt: dto.startTime,
    clockOutAt: dto.endTime ?? dto.startTime,
    grossSeconds: workedSeconds + breakSeconds,
    workedSeconds,
    breakSeconds,
    status: "approved",
    events: [],
  }
}

export function toTimeEntries(dtos: TimeEntryDto[]): TimeEntry[] {
  return dtos.map(toTimeEntry)
}
