export type TimeOverviewCardController = {
  elapsedSeconds: number
  handleClockIn: () => void
  handleEndBreak: () => void
  handleStartBreak: () => void
  openClockOut: () => void
  snapshot: {
    breakSeconds: number
  }
  state: {
    clockSession: {
      accumulatedBreakSeconds: number
      breakStartedAt?: string
      clockInLocation?: {
        addressLabel: string
      }
      clockInProofPhoto?: {
        capturedAt: string
        uri: string
      }
      role: string
      scheduledEnd: string
      scheduledStart: string
      startedAt?: string
      state: "idle" | "working" | "onBreak"
      venueAddress: string
      venueName: string
    }
  }
  totalBreakSeconds: number
}
