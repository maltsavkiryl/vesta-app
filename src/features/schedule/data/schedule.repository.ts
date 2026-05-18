import type { AvailabilityDay, Employer, RequestItem, Shift } from "@/core/models"
import type { Result } from "@/shared/result"

import type { ScheduleError } from "./schedule.errors"

export interface ScheduleOverview {
  activeEmployerId: string
  availability: Record<string, AvailabilityDay>
  employers: Employer[]
  requests: RequestItem[]
  shifts: Shift[]
}

export interface CreateRequestInput {
  dateRange: string
  note?: string
  reason: string
  type: RequestItem["type"]
}

export interface ScheduleRepository {
  createRequest(
    accountId: string,
    input: CreateRequestInput,
  ): Promise<Result<RequestItem, ScheduleError>>
  getAvailability(accountId: string): Promise<Record<string, AvailabilityDay>>
  getRequests(accountId: string): Promise<RequestItem[]>
  getSchedule(accountId: string): Promise<ScheduleOverview>
  saveAvailability(
    accountId: string,
    day: AvailabilityDay,
  ): Promise<Result<AvailabilityDay, ScheduleError>>
}
