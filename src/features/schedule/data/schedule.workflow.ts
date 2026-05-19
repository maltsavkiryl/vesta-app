import type { Result } from "@/shared/result"

import type { ScheduleError } from "./schedule.errors"
import type { CreateRequestInput, ScheduleRepository } from "./schedule.repository"

export function createRequestWorkflow(
  repository: ScheduleRepository,
  accountId: string,
  input: CreateRequestInput,
): ReturnType<ScheduleRepository["createRequest"]> | Promise<Result<never, ScheduleError>> {
  if (!input.target.label.trim() || !input.reason.trim()) {
    return Promise.resolve({
      ok: false,
      error: {
        type: "validation",
        message: "Choose what the request is for and add a reason before sending it.",
      },
    })
  }

  return repository.createRequest(accountId, input)
}
