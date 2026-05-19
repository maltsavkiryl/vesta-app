import type {
  AvailabilityOverride,
  AvailabilityTemplate,
  Employer,
  PlanningWindow,
  RequestCategory,
  RequestItem,
  Shift,
} from "@/core/models"
import type { Result } from "@/shared/result"

import type { ScheduleError } from "./schedule.errors"

export interface ScheduleOverview {
  availabilityOverrides: Record<string, AvailabilityOverride>
  availabilityTemplate: AvailabilityTemplate
  employers: Employer[]
  planningWindows: PlanningWindow[]
  requests: RequestItem[]
  shifts: Shift[]
}

export interface CreateRequestInput {
  category: RequestCategory
  note?: string
  reason: string
  statusDetail: string
  target: RequestItem["target"]
  type: RequestItem["type"]
}

export interface ScheduleRepository {
  createRequest(
    accountId: string,
    input: CreateRequestInput,
  ): Promise<Result<RequestItem, ScheduleError>>
  getSchedule(accountId: string): Promise<ScheduleOverview>
  respondToShift(accountId: string, shiftId: string): Promise<Result<Shift, ScheduleError>>
  saveAvailabilityOverride(
    accountId: string,
    day: AvailabilityOverride,
  ): Promise<Result<AvailabilityOverride, ScheduleError>>
  saveAvailabilityTemplate(
    accountId: string,
    template: AvailabilityTemplate,
  ): Promise<Result<AvailabilityTemplate, ScheduleError>>
  submitPlanningWindow(
    accountId: string,
    planningWindowId: string,
  ): Promise<Result<PlanningWindow, ScheduleError>>
}
