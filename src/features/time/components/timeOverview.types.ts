import type { ClockSession } from "@/core/models"

export interface IdleClockCardState {
  actionLabel: string
  detailLabel: string
  disabled?: boolean
  helperLabel: string
  kind: "shift" | "single-employer" | "multiple-employers" | "unavailable"
  subtitle: string
  title: string
}

export type TimeOverviewCardController = {
  clockInPending: boolean
  elapsedSeconds: number
  handleClockIn: () => void
  handleEndBreak: () => void
  handleStartBreak: () => void
  idleState: IdleClockCardState
  openClockOut: () => void
  payableSeconds: number
  snapshot: {
    breakSeconds: number
    payableSeconds: number
    workedSeconds: number
  }
  state: {
    clockSession: ClockSession
  }
  totalBreakSeconds: number
}
