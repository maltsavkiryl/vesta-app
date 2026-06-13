import { renderHook } from "@testing-library/react-native"

import { useClockOutScreen } from "./useClockOutScreen"

const mockUseTimeDataQuery = jest.fn()
const mockUseClockSummary = jest.fn()

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}))

jest.mock("@/features/time/data/time.mutations", () => ({
  useTimeActions: () => ({ confirmClockOut: jest.fn() }),
}))

jest.mock("@/features/time/data/time.queries", () => ({
  useClockSummary: () => mockUseClockSummary(),
  useTimeDataQuery: () => mockUseTimeDataQuery(),
}))

jest.mock("./timeCapture", () => ({
  captureLocationSnapshot: jest.fn(),
}))

describe("useClockOutScreen pay rate", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClockSummary.mockReturnValue({
      breakSeconds: 0,
      payableSeconds: 3600, // exactly one hour
      startedAtLabel: "09:00",
    })
  })

  it("uses the employee's real average hourly rate (not the old €12.02 constant)", () => {
    mockUseTimeDataQuery.mockReturnValue({
      data: {
        clockSession: { id: "session-1", startedAt: "2026-06-12T09:00:00.000Z" },
        earnings: { averageHourlyRate: 15 },
      },
    })

    const { result } = renderHook(() => useClockOutScreen())

    expect(result.current.summary?.rateLabel).toContain("15.00")
    // One hour at €15/hr → €15.00 estimate.
    expect(result.current.summary?.earnings).toContain("15.00")
    expect(result.current.summary?.rateLabel).not.toContain("12.02")
    expect(result.current.summary?.earnings).not.toContain("12.02")
  })
})
