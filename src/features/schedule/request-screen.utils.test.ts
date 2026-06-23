import type { Shift } from "@/core/models"

import {
  formatRequestDateListLabel,
  getRequestActionCopy,
  getRequestDetailTargetLabel,
  getRequestSummaryTarget,
  getTargetSectionCopy,
} from "./request-screen.utils"

jest.mock("@/core/date", () => ({
  formatShortDate: (value: string) => `short(${value})`,
  formatFullDate: (value: string) => `full(${value})`,
  getShiftTimeRange: (shift: { startTime: string; endTime: string }) =>
    `${shift.startTime}-${shift.endTime}`,
  getLocalToday: () => "2026-06-23",
}))

const shift = {
  dayLabel: "Mon",
  role: "Waiter",
  venueName: "Bistro",
  startTime: "09:00",
  endTime: "17:00",
} as unknown as Shift

describe("formatRequestDateListLabel", () => {
  it("is empty for no dates, a single label for one, and a sorted range for many", () => {
    expect(formatRequestDateListLabel([])).toBe("")
    expect(formatRequestDateListLabel(["2026-01-02"])).toBe("short(2026-01-02)")
    expect(formatRequestDateListLabel(["2026-01-05", "2026-01-02"])).toBe(
      "short(2026-01-02) - short(2026-01-05)",
    )
  })
})

describe("category copy", () => {
  it("returns the right section copy per category", () => {
    expect(getTargetSectionCopy("shift_change").sectionTitle).toBe("Shift")
    expect(getTargetSectionCopy("availability_issue").sectionTitle).toBe("Affected dates")
    expect(getTargetSectionCopy("time_off").sectionTitle).toBe("Dates")
  })

  it("returns the right action copy per category", () => {
    expect(getRequestActionCopy("shift_change").submitLabel).toBe("Send shift swap")
    expect(getRequestActionCopy("availability_issue").submitLabel).toBe("Send unavailability")
    expect(getRequestActionCopy("time_off").submitLabel).toBe("Send time off")
  })
})

describe("summary + detail targets", () => {
  it("summarizes a shift_change from the selected shift, empty without one", () => {
    expect(getRequestSummaryTarget("shift_change", [], shift)).toBe("Mon · 09:00-17:00")
    expect(getRequestSummaryTarget("shift_change", [], undefined)).toBe("")
  })

  it("summarizes date-based requests from the selected dates", () => {
    expect(getRequestSummaryTarget("time_off", ["2026-01-02"])).toBe("short(2026-01-02)")
  })

  it("builds detail labels for shifts and date counts", () => {
    expect(getRequestDetailTargetLabel("shift_change", [], shift)).toBe("Waiter · Bistro")
    expect(getRequestDetailTargetLabel("time_off", ["2026-01-02"])).toBe("full(2026-01-02)")
    expect(getRequestDetailTargetLabel("time_off", ["2026-01-02", "2026-01-03"])).toBe(
      "2 dates selected",
    )
  })
})
