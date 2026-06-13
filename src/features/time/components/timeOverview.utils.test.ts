import { computeAccruedEarnings, getShiftDurationHours } from "./timeOverview.utils"

describe("computeAccruedEarnings", () => {
  it("accrues a full hour of pay from 3600 payable seconds", () => {
    expect(computeAccruedEarnings(3600, 15)).toBeCloseTo(15)
  })

  it("scales linearly with payable seconds (the live ticker basis)", () => {
    // 30 minutes at €12/hr → €6.00
    expect(computeAccruedEarnings(1800, 12)).toBeCloseTo(6)
    // 1 second at €18/hr → €0.005
    expect(computeAccruedEarnings(1, 18)).toBeCloseTo(18 / 3600)
  })

  it("never goes negative for clamped inputs", () => {
    expect(computeAccruedEarnings(-100, 15)).toBe(0)
    expect(computeAccruedEarnings(3600, -15)).toBe(0)
  })
})

describe("getShiftDurationHours", () => {
  it("handles overnight shifts", () => {
    expect(getShiftDurationHours("22:00", "02:00")).toBe(4)
  })
})
