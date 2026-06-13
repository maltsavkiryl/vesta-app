import { buildMonthGrid, getMonthAnchor } from "./schedule.utils"

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
