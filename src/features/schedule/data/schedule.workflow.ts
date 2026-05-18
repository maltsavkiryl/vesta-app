import type { Result } from "@/shared/result"

import type { ScheduleError } from "./schedule.errors"
import type { CreateRequestInput, ScheduleRepository } from "./schedule.repository"

export function createRequestWorkflow(
  repository: ScheduleRepository,
  accountId: string,
  input: CreateRequestInput,
): ReturnType<ScheduleRepository["createRequest"]> | Promise<Result<never, ScheduleError>> {
  if (!input.dateRange.trim() || !input.reason.trim()) {
    return Promise.resolve({
      ok: false,
      error: {
        type: "validation",
        message: "Add dates and a reason before sending the request.",
      },
    })
  }

  return repository.createRequest(accountId, input)
}
