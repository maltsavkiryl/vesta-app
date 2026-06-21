import { renderHook } from "@testing-library/react-native"

import type { ClockSession } from "@/core/models"

import {
  endClockLiveActivity,
  startClockLiveActivity,
  updateClockLiveActivity,
} from "./clockLiveActivity"
import { useClockLiveActivitySync } from "./useClockLiveActivitySync"

let mockSession: ClockSession | undefined

jest.mock("@/features/time/data/time.queries", () => ({
  useClockSessionQuery: () => mockSession,
}))
jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ isSignedIn: true }),
}))
jest.mock("./clockLiveActivity", () => ({
  ...jest.requireActual("./clockLiveActivity"),
  startClockLiveActivity: jest.fn().mockResolvedValue(null),
  updateClockLiveActivity: jest.fn().mockResolvedValue(undefined),
  endClockLiveActivity: jest.fn().mockResolvedValue(undefined),
}))

function workingSession(startedAt: string): ClockSession {
  return {
    source: "shift",
    employerId: "est-1",
    venueName: "Bistro Noir",
    venueAddress: "Grand Place 1",
    state: "working",
    startedAt,
    accumulatedBreakSeconds: 0,
    events: [],
  }
}

describe("useClockLiveActivitySync", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSession = undefined
  })

  it("starts on clock-in, updates on break, and ends on clock-out", () => {
    mockSession = workingSession("2026-06-20T08:00:00Z")
    const { rerender } = renderHook(() => useClockLiveActivitySync())
    expect(startClockLiveActivity).toHaveBeenCalledTimes(1)

    mockSession = { ...mockSession, state: "onBreak", breakStartedAt: "2026-06-20T10:00:00Z" }
    rerender(undefined)
    expect(updateClockLiveActivity).toHaveBeenCalledTimes(1)

    mockSession = undefined
    rerender(undefined)
    expect(endClockLiveActivity).toHaveBeenCalledWith("2026-06-20T08:00:00Z")
  })

  it("does nothing when there is no active session", () => {
    renderHook(() => useClockLiveActivitySync())
    expect(startClockLiveActivity).not.toHaveBeenCalled()
    expect(endClockLiveActivity).not.toHaveBeenCalled()
  })
})
