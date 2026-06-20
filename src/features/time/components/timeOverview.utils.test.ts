import { getShiftDurationHours } from "./timeOverview.utils"

describe("getShiftDurationHours", () => {
  it("handles overnight shifts", () => {
    expect(getShiftDurationHours("22:00", "02:00")).toBe(4)
  })
})
