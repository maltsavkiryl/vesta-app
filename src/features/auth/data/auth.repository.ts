import type { Result } from "@/shared/result"

import type { AuthError } from "./auth.errors"
import type { AppSession } from "./auth.transformer"

export interface SignInPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface CompleteOnboardingInput {
  employerId: string
  role: string
}

export interface AuthRepository {
  completeOnboarding(
    accountId: string,
    input: CompleteOnboardingInput,
  ): Promise<Result<AppSession, AuthError>>
  getSession(): Promise<AppSession>
  register(input: RegisterPayload): Promise<Result<AppSession, AuthError>>
  requestPasswordReset(email: string): Promise<Result<{ email: string }, AuthError>>
  signIn(input: SignInPayload): Promise<Result<AppSession, AuthError>>
  signOut(): Promise<AppSession>
}
