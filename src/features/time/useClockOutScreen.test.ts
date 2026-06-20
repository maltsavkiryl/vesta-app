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

describe("useClockOutScreen summary", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClockSummary.mockReturnValue({
      breakSeconds: 0,
      payableSeconds: 3600, // exactly one hour
      startedAtLabel: "09:00",
    })
  })

  it("returns worked time without any earnings/pay figures", () => {
    mockUseTimeDataQuery.mockReturnValue({
      data: {
        clockSession: { id: "session-1", startedAt: "2026-06-12T09:00:00.000Z" },
      },
    })

    const { result } = renderHook(() => useClockOutScreen())

    expect(result.current.summary?.workedLabel).toBeTruthy()
    expect(result.current.summary?.startedAtLabel).toBe("09:00")
    expect(result.current.summary).not.toHaveProperty("earnings")
    expect(result.current.summary).not.toHaveProperty("rateLabel")
  })
})
