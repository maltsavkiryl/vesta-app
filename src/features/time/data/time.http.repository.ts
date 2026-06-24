/**
 * HTTP implementation of TimeRepository against the employee timer API.
 *
 *  - GET  /employee/timer/current?establishmentUniqueCode=…   open entry
 *  - GET  /employee/timer/entries?from&to                      history
 *  - POST /employee/timer/clock-in | clock-out | break/start | break/end
 *
 * Two cross-cutting concerns the lean API can't carry on its own:
 *  1. Rich UI context (venue, the current break's start) — held in a small local
 *     "clock-meta" record (MMKV) maintained by the in-app punch actions.
 *  2. Offline resilience — every punch captures its real occurredAt; if it can't
 *     reach the server it's queued (time.offlineQueue) and the UI falls back to an
 *     optimistic local session until the queue drains on reconnect.
 */
import { addLocalDays, getLocalToday } from "@/core/date"
import type { ClockSession, TimeEntry } from "@/core/models"
import type { ClockError } from "@/features/time/data/time.errors"
import type {
  TimeOverview,
  TimeRepository,
  ClockCommandInput,
} from "@/features/time/data/time.repository"
import { translate } from "@/i18n/translate"
import type { HttpClient } from "@/services/api/httpClient"
import { failure, success, type Result } from "@/shared/result"
import { load, remove, save } from "@/utils/storage"

import type { EmployeePunchBody, TimeEntryDto, TimeEntryResultDto } from "./time.dto"
import {
  ENDPOINT,
  enqueuePunch,
  flushClockQueue,
  hasQueuedPunches,
  isOfflineFailure,
  type ClockPunchAction,
} from "./time.offlineQueue"
import {
  idleClockSession,
  optimisticClockSession,
  toClockSession,
  toTimeEntries,
  type ClockMeta,
} from "./time.transformer"

const CLOCK_META_KEY = "vesta.clock-meta"
const HISTORY_PAST_DAYS = 90

function loadClockMeta(): ClockMeta | null {
  return load<ClockMeta>(CLOCK_META_KEY)
}
function saveClockMeta(meta: ClockMeta) {
  save(CLOCK_META_KEY, meta)
}
function clearClockMeta() {
  remove(CLOCK_META_KEY)
}

function toClockError(type: ClockError["type"], message: string): ClockError {
  return { type, message }
}

function secondsBetween(fromIso: string | undefined, toIso: string): number {
  if (!fromIso) return 0
  return Math.max(Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000), 0)
}

export function createTimeHttpRepository(http: HttpClient): TimeRepository {
  function punchBody(
    establishmentUniqueCode: string,
    occurredAtUtc: string,
    input?: ClockCommandInput,
  ): EmployeePunchBody {
    return {
      establishmentUniqueCode,
      lat: input?.location?.latitude,
      lng: input?.location?.longitude,
      occurredAtUtc,
    }
  }

  // Sends a punch; on offline failure queues it and returns "queued" so callers
  // can fall back to optimistic local state. Server rejections surface as errors.
  async function sendPunch(
    action: ClockPunchAction,
    body: EmployeePunchBody,
  ): Promise<"ok" | "queued" | "rejected"> {
    const drained = await flushClockQueue(http)
    // If older punches are still queued (offline / partial drain), this newer
    // punch must go behind them to preserve order — never post it ahead.
    if (!drained || hasQueuedPunches()) {
      enqueuePunch({ action, body })
      return "queued"
    }
    const res = await http.post(ENDPOINT[action], body)
    if (res.ok) return "ok"
    if (isOfflineFailure(res)) {
      enqueuePunch({ action, body })
      return "queued"
    }
    return "rejected"
  }

  async function getClockSession(): Promise<ClockSession> {
    const meta = loadClockMeta()
    if (!meta) return idleClockSession()

    const drained = await flushClockQueue(http)
    // Still offline with pending punches → trust the optimistic local session.
    if (!drained || hasQueuedPunches()) return optimisticClockSession(meta)

    const res = await http.get<TimeEntryDto>("/employee/timer/current", {
      establishmentUniqueCode: meta.establishmentUniqueCode,
    })
    if (!res.ok || !res.data) {
      // 404 → no open entry server-side; drop the stale local meta.
      if (res.status === 404) clearClockMeta()
      return res.status === 404 ? idleClockSession() : optimisticClockSession(meta)
    }
    const session = toClockSession(res.data, meta)
    if (session.state === "idle") clearClockMeta()
    return session
  }

  async function getTimeEntries(): Promise<TimeEntry[]> {
    const today = getLocalToday()
    const res = await http.get<TimeEntryResultDto>("/employee/timer/entries", {
      from: addLocalDays(today, -HISTORY_PAST_DAYS),
      to: today,
    })
    if (!res.ok || !res.data) throw new Error(translate("time:errors.loadFailed"))
    return toTimeEntries(res.data.entries ?? [])
  }

  return {
    getClockSession,
    getTimeEntries,
    async getTimeEntry(_accountId, entryId) {
      const entries = await getTimeEntries()
      return entries.find((entry) => entry.id === entryId) ?? null
    },
    async getTimeOverview(): Promise<TimeOverview> {
      const clockSession = await getClockSession()
      // History needs the network; return what we have offline rather than throw.
      const timeEntries = hasQueuedPunches() ? [] : await getTimeEntries().catch(() => [])
      return { clockSession, timeEntries }
    },
    async clockIn(_accountId, input) {
      const establishment = input?.clockContext?.employerId
      if (!input?.clockContext || !establishment) {
        return failure(toClockError("no-clock-context", translate("time:errors.chooseWorkplace")))
      }
      const occurredAtUtc = new Date().toISOString()
      const outcome = await sendPunch("clock-in", punchBody(establishment, occurredAtUtc, input))
      if (outcome === "rejected") {
        return failure(toClockError("already-clocked-in", translate("time:errors.startFailed")))
      }
      saveClockMeta({
        establishmentUniqueCode: establishment,
        context: input.clockContext,
        optimistic: { state: "working", startedAt: occurredAtUtc, accumulatedBreakSeconds: 0 },
      })
      return success(await getClockSession())
    },
    async startBreak(_accountId, input) {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", translate("time:errors.noSession")))
      const occurredAtUtc = new Date().toISOString()
      const outcome = await sendPunch(
        "break-start",
        punchBody(meta.establishmentUniqueCode, occurredAtUtc, input),
      )
      if (outcome === "rejected")
        return failure(toClockError("break-invalid", translate("time:errors.breakStartFailed")))
      saveClockMeta({
        ...meta,
        breakStartedAt: occurredAtUtc,
        optimistic: meta.optimistic ? { ...meta.optimistic, state: "onBreak" } : undefined,
      })
      return success(await getClockSession())
    },
    async endBreak(_accountId, input) {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", translate("time:errors.noSession")))
      const occurredAtUtc = new Date().toISOString()
      const outcome = await sendPunch(
        "break-end",
        punchBody(meta.establishmentUniqueCode, occurredAtUtc, input),
      )
      if (outcome === "rejected")
        return failure(toClockError("break-invalid", translate("time:errors.breakEndFailed")))
      saveClockMeta({
        ...meta,
        breakStartedAt: undefined,
        optimistic: meta.optimistic
          ? {
              ...meta.optimistic,
              state: "working",
              accumulatedBreakSeconds:
                meta.optimistic.accumulatedBreakSeconds +
                secondsBetween(meta.breakStartedAt, occurredAtUtc),
            }
          : undefined,
      })
      return success(await getClockSession())
    },
    async clockOut(_accountId, input): Promise<Result<TimeEntry, ClockError>> {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", translate("time:errors.noSession")))
      const occurredAtUtc = new Date().toISOString()
      const outcome = await sendPunch(
        "clock-out",
        punchBody(meta.establishmentUniqueCode, occurredAtUtc, input),
      )
      if (outcome === "rejected")
        return failure(toClockError("not-clocked-in", translate("time:errors.clockOutFailed")))
      clearClockMeta()
      // History may be unavailable offline; the punch is queued and will sync.
      const entries = await getTimeEntries().catch(() => [])
      const latest = entries[0]
      if (!latest) {
        return success({
          source: input?.clockContext?.source ?? "employer",
          employerId: meta.establishmentUniqueCode,
          venueName: meta.context.venueName,
          venueAddress: meta.context.venueAddress,
          // Sanitise the timestamp (drop ':'/'.') so the id is safe as a route
          // param; this entry isn't in the synced history yet, so the detail
          // screen treats an unknown id as a pending/not-yet-synced entry.
          id: `pending-${occurredAtUtc.replace(/[:.]/g, "-")}`,
          date: occurredAtUtc.slice(0, 10),
          shiftLabel: translate("time:clockedShift"),
          clockInAt: meta.optimistic?.startedAt ?? occurredAtUtc,
          clockOutAt: occurredAtUtc,
          grossSeconds: 0,
          workedSeconds: 0,
          breakSeconds: 0,
          status: "review",
          events: [],
        })
      }
      return success(latest)
    },
  }
}
