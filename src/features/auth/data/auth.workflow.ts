import type { Result } from "@/shared/result"

import type { AuthError } from "./auth.errors"
import type { AuthRepository, CompleteOnboardingInput } from "./auth.repository"
import type { AppSession } from "./auth.transformer"

export function completeOnboardingWorkflow(
  repository: AuthRepository,
  accountId: string,
  input: CompleteOnboardingInput,
): Promise<Result<AppSession, AuthError>> {
  // Employer is optional here — joining an employer is invite/QR-driven and can be
  // done later, so "Skip for now" must be able to complete onboarding. Role always
  // has a sensible default from the screen.
  if (!input.role.trim()) {
    return Promise.resolve({
      ok: false,
      error: {
        type: "onboarding-invalid",
        message: "Choose a role before completing onboarding.",
      },
    })
  }

  return repository.completeOnboarding(accountId, input)
}
