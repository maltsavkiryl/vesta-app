import type { Result } from "@/shared/result"

import type { AuthError } from "./auth.errors"
import type { AuthRepository, CompleteOnboardingInput } from "./auth.repository"
import type { AppSession } from "./auth.transformer"

export function completeOnboardingWorkflow(
  repository: AuthRepository,
  accountId: string,
  input: CompleteOnboardingInput,
): Promise<Result<AppSession, AuthError>> {
  if (!input.role.trim() || !input.employerId.trim()) {
    return Promise.resolve({
      ok: false,
      error: {
        type: "onboarding-invalid",
        message: "Choose a role and employer before completing onboarding.",
      },
    })
  }

  return repository.completeOnboarding(accountId, input)
}
