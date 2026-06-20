import type { ClockSessionContext } from "@/core/models"

import type { TimeEntryDto } from "./time.dto"
import {
  idleClockSession,
  parseDurationSeconds,
  toClockSession,
  toTimeEntry,
  type ClockMeta,
} from "./time.transformer"

const context: ClockSessionContext = {
  source: "shift",
  employerId: "est-1",
  shiftId: "shift-1",
  venueName: "Bistro Noir",
  venueAddress: "Grand Place 1",
}

const openDto: TimeEntryDto = {
  id: 1,
  employerUniqueCode: "emp-1",
  establishmentUniqueCode: "est-1",
  establishmentDisplayName: "Bistro Noir",
  employeeUniqueCode: "e-1",
  status: "Working",
  startTime: "2026-06-20T08:00:00Z",
  workDuration: "02:30:00",
  breakDuration: "00:15:00",
}

describe("time.transformer", () => {
  it("parses .NET TimeSpan strings into seconds", () => {
    expect(parseDurationSeconds("02:30:00")).toBe(9000)
    expect(parseDurationSeconds("00:15:00")).toBe(900)
    expect(parseDurationSeconds("1.01:00:00")).toBe(86400 + 3600)
    expect(parseDurationSeconds(null)).toBe(0)
  })

  it("maps an open entry to a working clock session with local context", () => {
    const meta: ClockMeta = { establishmentUniqueCode: "est-1", context }
    const session = toClockSession(openDto, meta)
    expect(session.state).toBe("working")
    expect(session.startedAt).toBe("2026-06-20T08:00:00Z")
    expect(session.accumulatedBreakSeconds).toBe(900)
    expect(session.venueName).toBe("Bistro Noir")
    expect(session.shiftId).toBe("shift-1")
    expect(session.breakStartedAt).toBeUndefined()
  })

  it("carries the local break start only while on break", () => {
    const meta: ClockMeta = {
      establishmentUniqueCode: "est-1",
      context,
      breakStartedAt: "2026-06-20T10:00:00Z",
    }
    expect(toClockSession({ ...openDto, status: "OnBreak" }, meta).breakStartedAt).toBe(
      "2026-06-20T10:00:00Z",
    )
    // working state ignores any stale break start
    expect(toClockSession(openDto, meta).breakStartedAt).toBeUndefined()
  })

  it("treats a completed/absent entry as idle", () => {
    expect(toClockSession({ ...openDto, status: "Completed" }, null).state).toBe("idle")
    expect(toClockSession(null, null)).toEqual(idleClockSession())
  })

  it("maps a completed entry to a history row", () => {
    const entry = toTimeEntry({ ...openDto, status: "Completed", endTime: "2026-06-20T10:45:00Z" })
    expect(entry.id).toBe("1")
    expect(entry.workedSeconds).toBe(9000)
    expect(entry.breakSeconds).toBe(900)
    expect(entry.grossSeconds).toBe(9900)
    expect(entry.status).toBe("approved")
    expect(entry.clockOutAt).toBe("2026-06-20T10:45:00Z")
  })
})
