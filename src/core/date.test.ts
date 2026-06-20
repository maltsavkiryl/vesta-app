import { format } from "date-fns"

import { getLocalToday, getRelativeDayLabel, isToday } from "./date"

describe("getLocalToday", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns the local date in yyyy-MM-dd format", () => {
    expect(getLocalToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("composes date-fns format on the local clock (not toISOString/UTC)", () => {
    // The bug being fixed: `new Date().toISOString().slice(0, 10)` reports the
    // UTC day, which flips a day early/late around local midnight. The helper
    // must mirror the LOCAL calendar day.
    expect(getLocalToday()).toBe(format(new Date(), "yyyy-MM-dd"))
  })

  it("reports the local day at an instant where UTC has rolled to another day", () => {
    // Pick a local time that straddles the UTC date boundary for THIS machine:
    //  - west of UTC (offset > 0): late evening rolls UTC forward a day
    //  - east of UTC (offset < 0): early morning leaves UTC on the previous day
    // Either way the naive `toISOString().slice(0, 10)` reports the wrong day.
    const offsetMinutes = new Date(2026, 5, 13).getTimezoneOffset()
    const hour = offsetMinutes > 0 ? 23 : 0
    const minute = 30
    const instant = new Date(2026, 5, 13, hour, minute, 0)
    jest.useFakeTimers().setSystemTime(instant)

    const expectedLocalDay = format(instant, "yyyy-MM-dd")
    expect(getLocalToday()).toBe(expectedLocalDay)

    // Only assert the divergence when the machine actually has an offset; on a
    // UTC machine local and UTC days always agree, so there is nothing to prove.
    if (offsetMinutes !== 0) {
      expect(instant.toISOString().slice(0, 10)).not.toBe(expectedLocalDay)
    }
  })
})

describe("isToday", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns true for the local today and false otherwise", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 13, 9, 0, 0))
    expect(isToday("2026-06-13")).toBe(true)
    expect(isToday("2026-06-12")).toBe(false)
    expect(isToday("2026-06-14")).toBe(false)
  })

  it("returns false for unparseable input", () => {
    expect(isToday("not-a-date")).toBe(false)
  })
})

describe("getRelativeDayLabel", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it("labels today and tomorrow (localized)", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 13, 9, 0, 0))

    expect(getRelativeDayLabel("2026-06-13", "en")).toBe("Today")
    expect(getRelativeDayLabel("2026-06-14", "en")).toBe("Tomorrow")
    expect(getRelativeDayLabel("2026-06-13", "nl")).toBe("Vandaag")
    expect(getRelativeDayLabel("2026-06-14", "fr")).toBe("Demain")
  })

  it("falls back to a weekday label for other dates", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 13, 9, 0, 0))
    // 2026-06-19 is a Friday.
    expect(getRelativeDayLabel("2026-06-19", "en")).toBe("Fri 19")
  })

  it("returns an empty string for unparseable input", () => {
    expect(getRelativeDayLabel("not-a-date")).toBe("")
  })
})
