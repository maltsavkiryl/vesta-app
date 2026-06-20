import { getLocalToday } from "@/core/date"
import { createInitialState } from "@/core/mockState"
import type { AvailabilityTemplate, PlanningWindow, Shift } from "@/core/models"

import { applyShiftDecline } from "./data/schedule.service"
import {
  buildMonthGrid,
  getMonthAnchor,
  getNextShift,
  getPlanningWindowCoverage,
  getUpcomingShifts,
  groupUpcomingShiftsByWeek,
} from "./schedule.utils"

function makeShift(overrides: Partial<Shift> & Pick<Shift, "id" | "date" | "startTime">): Shift {
  return {
    dayLabel: "",
    endTime: "23:00",
    role: "Waiter",
    status: "confirmed",
    venueAddress: "Somewhere",
    venueName: "Bistro Noir",
    ...overrides,
  }
}

describe("buildMonthGrid (Monday-first)", () => {
  it("aligns a month that starts on a Sunday to the last (Sunday) column", () => {
    // 2026-02-01 is a Sunday → Monday-first column index 6.
    const cells = buildMonthGrid(getMonthAnchor("2026-02-01"))

    expect(cells.slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(cells[6]).toBe("2026-02-01")
  })

  it("aligns a month that starts on a Monday to the first column", () => {
    // 2026-06-01 is a Monday → Monday-first column index 0.
    const cells = buildMonthGrid(getMonthAnchor("2026-06-01"))

    expect(cells[0]).toBe("2026-06-01")
  })

  it("places the 1st in the Monday-first column matching its weekday for any month", () => {
    const anchor = getMonthAnchor("2026-03-01")
    const cells = buildMonthGrid(anchor)

    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const expectedColumn = (firstDay.getDay() + 6) % 7

    // Leading cells before the 1st are empty, the 1st sits in its column,
    // and subsequent days fill sequentially (proving column alignment).
    expect(cells.slice(0, expectedColumn).every((cell) => cell === null)).toBe(true)
    expect(cells[expectedColumn]).toBe("2026-03-01")
    expect(cells[expectedColumn + 1]).toBe("2026-03-02")
  })

  it("keeps the grid a whole number of weeks", () => {
    const cells = buildMonthGrid(getMonthAnchor("2026-02-01"))
    expect(cells.length % 7).toBe(0)
  })
})

describe("mock seed data is anchored to today", () => {
  it("seeds every shift on or after today so the agenda is never empty", () => {
    const state = createInitialState()
    const today = getLocalToday()

    expect(state.shifts.length).toBeGreaterThan(0)
    expect(getUpcomingShifts(state.shifts, today)).toHaveLength(state.shifts.length)
  })

  it("seeds an open planning window with a future deadline", () => {
    const state = createInitialState()
    const open = state.planningWindows.find((window) => window.status === "open")

    expect(open).toBeDefined()
    expect(new Date(open!.deadline).getTime()).toBeGreaterThan(Date.now())
  })
})

describe("getNextShift", () => {
  it("returns the soonest shift that has not ended yet", () => {
    const now = new Date("2026-06-15T10:00:00")
    const shifts = [
      makeShift({ id: "later", date: "2026-06-18", startTime: "12:00" }),
      makeShift({ id: "soon", date: "2026-06-15", startTime: "17:00" }),
      makeShift({ id: "past", date: "2026-06-14", startTime: "09:00", endTime: "12:00" }),
    ]

    expect(getNextShift(shifts, now)?.id).toBe("soon")
  })

  it("keeps a currently-running shift as the next shift", () => {
    const now = new Date("2026-06-15T18:00:00")
    const shifts = [
      makeShift({ id: "running", date: "2026-06-15", startTime: "17:00", endTime: "23:00" }),
    ]

    expect(getNextShift(shifts, now)?.id).toBe("running")
  })

  it("returns undefined when every shift has ended", () => {
    const now = new Date("2026-06-20T10:00:00")
    const shifts = [
      makeShift({ id: "old", date: "2026-06-14", startTime: "09:00", endTime: "12:00" }),
    ]

    expect(getNextShift(shifts, now)).toBeUndefined()
  })
})

describe("groupUpcomingShiftsByWeek", () => {
  it("splits shifts into this-week and next-week buckets (Monday-first)", () => {
    // 2026-06-15 is a Monday, so this week is Jun 15–21, next week Jun 22–28.
    const today = "2026-06-15"
    const shifts = [
      makeShift({ id: "this-a", date: "2026-06-15", startTime: "10:00" }),
      makeShift({ id: "this-b", date: "2026-06-21", startTime: "10:00" }),
      makeShift({ id: "next-a", date: "2026-06-22", startTime: "10:00" }),
      makeShift({ id: "later-a", date: "2026-07-05", startTime: "10:00" }),
    ]

    const sections = groupUpcomingShiftsByWeek(shifts, today)

    expect(sections.map((section) => section.key)).toEqual(["this-week", "next-week", "later"])
    expect(sections[0].shifts.map((shift) => shift.id)).toEqual(["this-a", "this-b"])
    expect(sections[1].shifts.map((shift) => shift.id)).toEqual(["next-a"])
    expect(sections[2].shifts.map((shift) => shift.id)).toEqual(["later-a"])
  })

  it("omits empty sections and excludes past shifts", () => {
    const today = "2026-06-15"
    const shifts = [
      makeShift({ id: "past", date: "2026-06-10", startTime: "10:00" }),
      makeShift({ id: "next", date: "2026-06-24", startTime: "10:00" }),
    ]

    const sections = groupUpcomingShiftsByWeek(shifts, today)

    expect(sections.map((section) => section.key)).toEqual(["next-week"])
  })
})

describe("getPlanningWindowCoverage", () => {
  const template: AvailabilityTemplate = {
    monday: { status: "available", startTime: "09:00", endTime: "17:00" },
    tuesday: { status: "available", startTime: "09:00", endTime: "17:00" },
    wednesday: { status: "available", startTime: "09:00", endTime: "17:00" },
    thursday: { status: "available", startTime: "09:00", endTime: "17:00" },
    friday: { status: "available", startTime: "09:00", endTime: "17:00" },
    saturday: { status: "available", startTime: "09:00", endTime: "17:00" },
    sunday: { status: "available", startTime: "09:00", endTime: "17:00" },
  }
  const window: PlanningWindow = {
    id: "pw",
    label: "Test",
    startDate: "2026-06-15",
    endDate: "2026-06-17",
    deadline: "2026-06-14T18:00:00.000Z",
    status: "open",
  }

  it("counts only days with an explicit override, not template-filled days", () => {
    const overrides = {
      "2026-06-16": {
        date: "2026-06-16",
        status: "available" as const,
        startTime: "10:00",
        endTime: "18:00",
      },
    }

    const coverage = getPlanningWindowCoverage(window, template, overrides)

    expect(coverage.dates).toHaveLength(3)
    expect(coverage.completedDates).toEqual(["2026-06-16"])
    expect(coverage.isComplete).toBe(false)
  })

  it("is complete only when every day has an override", () => {
    const overrides = Object.fromEntries(
      ["2026-06-15", "2026-06-16", "2026-06-17"].map((date) => [
        date,
        { date, status: "available" as const, startTime: "10:00", endTime: "18:00" },
      ]),
    )

    const coverage = getPlanningWindowCoverage(window, template, overrides)

    expect(coverage.completedDates).toHaveLength(3)
    expect(coverage.isComplete).toBe(true)
  })
})

describe("applyShiftDecline", () => {
  it("sets responseStatus to declined and clears the response flag", () => {
    const shifts = [
      makeShift({
        id: "shift-3",
        date: "2026-06-16",
        startTime: "18:00",
        requiresResponse: true,
        responseStatus: "pending",
      }),
      makeShift({ id: "shift-other", date: "2026-06-17", startTime: "12:00" }),
    ]

    const next = applyShiftDecline(shifts, "shift-3")

    expect(next[0].responseStatus).toBe("declined")
    expect(next[0].requiresResponse).toBe(false)
    // Untouched shift is preserved as-is.
    expect(next[1]).toEqual(shifts[1])
  })
})
