import { formatHours, formatSeconds } from "./time.utils"

describe("formatSeconds", () => {
  it("formats as zero-padded HH:MM:SS", () => {
    expect(formatSeconds(0)).toBe("00:00:00")
    expect(formatSeconds(61)).toBe("00:01:01")
    expect(formatSeconds(3661)).toBe("01:01:01")
  })

  it("clamps negative input to zero (no negative timers)", () => {
    expect(formatSeconds(-50)).toBe("00:00:00")
  })

  it("does not roll hours over at 24 (open-ended elapsed time)", () => {
    expect(formatSeconds(25 * 3600)).toBe("25:00:00")
  })
})

describe("formatHours", () => {
  it("shows minutes only under an hour", () => {
    expect(formatHours(0)).toBe("0m")
    expect(formatHours(59)).toBe("0m")
    expect(formatHours(15 * 60)).toBe("15m")
  })

  it("shows whole hours without trailing minutes", () => {
    expect(formatHours(3600)).toBe("1h")
    expect(formatHours(2 * 3600)).toBe("2h")
  })

  it("combines hours and minutes", () => {
    expect(formatHours(3600 + 30 * 60)).toBe("1h 30m")
  })
})
