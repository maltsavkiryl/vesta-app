/**
 * HTTP implementation of TimeRepository against the employee timer API.
 *
 *  - GET  /employee/timer/current?establishmentUniqueCode=…   open entry
 *  - GET  /employee/timer/entries?from&to                      history
 *  - POST /employee/timer/clock-in | clock-out | break/start | break/end
 *
 * The lean API returns clock state + durations only, so the rich UI context
 * (venue, the current break's start) is kept in a small local "clock meta"
 * record that the in-app punch actions maintain. There is no offline queue yet:
 * the backend records punches at server time (no client timestamp), so replaying
 * queued punches would record the wrong time — that needs a backend change first.
 */
import { addLocalDays, getLocalToday } from "@/core/date"
import type { ClockSession, TimeEntry } from "@/core/models"
import type { ClockError } from "@/features/time/data/time.errors"
import type {
  TimeOverview,
  TimeRepository,
  ClockCommandInput,
} from "@/features/time/data/time.repository"
import type { HttpClient } from "@/services/api/httpClient"
import { failure, success, type Result } from "@/shared/result"
import { load, remove, save } from "@/utils/storage"

import type { EmployeePunchBody, TimeEntryDto, TimeEntryResultDto } from "./time.dto"
import { idleClockSession, toClockSession, toTimeEntries, type ClockMeta } from "./time.transformer"

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

export function createTimeHttpRepository(http: HttpClient): TimeRepository {
  function punchBody(
    establishmentUniqueCode: string,
    input?: ClockCommandInput,
  ): EmployeePunchBody {
    return {
      establishmentUniqueCode,
      lat: input?.location?.latitude,
      lng: input?.location?.longitude,
    }
  }

  async function getClockSession(): Promise<ClockSession> {
    const meta = loadClockMeta()
    if (!meta) return idleClockSession()

    const res = await http.get<TimeEntryDto>("/employee/timer/current", {
      establishmentUniqueCode: meta.establishmentUniqueCode,
    })
    // 404 → no open entry server-side; drop the stale local meta.
    if (!res.ok || !res.data) {
      if (res.status === 404) clearClockMeta()
      return idleClockSession()
    }
    return toClockSession(res.data, meta)
  }

  async function getTimeEntries(): Promise<TimeEntry[]> {
    const today = getLocalToday()
    const res = await http.get<TimeEntryResultDto>("/employee/timer/entries", {
      from: addLocalDays(today, -HISTORY_PAST_DAYS),
      to: today,
    })
    if (!res.ok || !res.data) throw new Error("Failed to load time entries")
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
      const [clockSession, timeEntries] = await Promise.all([getClockSession(), getTimeEntries()])
      return { clockSession, timeEntries }
    },
    async clockIn(_accountId, input) {
      const establishment = input?.clockContext?.employerId
      if (!input?.clockContext || !establishment) {
        return failure(toClockError("no-clock-context", "Choose a workplace before starting."))
      }
      const res = await http.post("/employee/timer/clock-in", punchBody(establishment, input))
      if (!res.ok) {
        return failure(toClockError("already-clocked-in", "Could not start the timer."))
      }
      saveClockMeta({ establishmentUniqueCode: establishment, context: input.clockContext })
      return success(await getClockSession())
    },
    async startBreak(_accountId, input) {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", "There is no active clock session."))
      const res = await http.post(
        "/employee/timer/break/start",
        punchBody(meta.establishmentUniqueCode, input),
      )
      if (!res.ok) return failure(toClockError("break-invalid", "Could not start a break."))
      saveClockMeta({ ...meta, breakStartedAt: new Date().toISOString() })
      return success(await getClockSession())
    },
    async endBreak(_accountId, input) {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", "There is no active clock session."))
      const res = await http.post(
        "/employee/timer/break/end",
        punchBody(meta.establishmentUniqueCode, input),
      )
      if (!res.ok) return failure(toClockError("break-invalid", "Could not end the break."))
      saveClockMeta({ ...meta, breakStartedAt: undefined })
      return success(await getClockSession())
    },
    async clockOut(_accountId, input): Promise<Result<TimeEntry, ClockError>> {
      const meta = loadClockMeta()
      if (!meta) return failure(toClockError("not-clocked-in", "There is no active clock session."))
      const res = await http.post(
        "/employee/timer/clock-out",
        punchBody(meta.establishmentUniqueCode, input),
      )
      if (!res.ok) return failure(toClockError("not-clocked-in", "Could not clock out."))
      clearClockMeta()
      const entries = await getTimeEntries()
      const latest = entries[0]
      if (!latest) return failure(toClockError("not-found", "Clocked out, but no entry was found."))
      return success(latest)
    },
  }
}
