import { translate } from "@/i18n/translate"
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
  // done later, so translate("onboarding:welcome.skip") must be able to complete onboarding. Role always
  // has a sensible default from the screen.
  if (!input.role.trim()) {
    return Promise.resolve({
      ok: false,
      error: {
        type: "onboarding-invalid",
        message: translate("auth:chooseRoleError"),
      },
    })
  }

  return repository.completeOnboarding(accountId, input)
}
