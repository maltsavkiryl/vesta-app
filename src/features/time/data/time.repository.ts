import type { ClockSession, ClockSessionContext, TimeEntry } from "@/core/models"
import type { Result } from "@/shared/result"

import type { ClockError } from "./time.errors"

export interface ClockCommandInput {
  clockContext?: ClockSessionContext
  occurredAt?: string
  location?: ClockSession["clockInLocation"]
  proofPhoto?: ClockSession["clockInProofPhoto"]
}

export interface TimeOverview {
  clockSession: ClockSession
  timeEntries: TimeEntry[]
  earnings: {
    averageHourlyRate: number
    earnedAmount: number
    hoursWorked: number
    monthLabel: string
    shiftsWorked: number
    targetAmount: number
  }
}

export interface TimeRepository {
  clockIn(accountId: string, input?: ClockCommandInput): Promise<Result<ClockSession, ClockError>>
  clockOut(accountId: string, input?: ClockCommandInput): Promise<Result<TimeEntry, ClockError>>
  endBreak(accountId: string, input?: ClockCommandInput): Promise<Result<ClockSession, ClockError>>
  getClockSession(accountId: string): Promise<ClockSession>
  getTimeEntries(accountId: string): Promise<TimeEntry[]>
  getTimeEntry(accountId: string, entryId: string): Promise<TimeEntry | null>
  getTimeOverview(accountId: string): Promise<TimeOverview>
  startBreak(
    accountId: string,
    input?: ClockCommandInput,
  ): Promise<Result<ClockSession, ClockError>>
}
