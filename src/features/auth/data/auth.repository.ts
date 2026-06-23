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

/** An employer the signed-in identity can act as, shown in the picker. */
export interface PendingEmployer {
  uniqueCode: string
  name: string
}

/**
 * Outcome of a sign-in attempt: either a fully established session, or — when
 * the identity is linked to more than one employer — a request to pick which
 * one to continue as before a session can be created.
 */
export type SignInResult =
  | { kind: "signed-in"; session: AppSession }
  | { kind: "select-employer"; employers: PendingEmployer[] }

export interface AuthRepository {
  changePassword(
    accountId: string,
    currentPassword: string,
    nextPassword: string,
  ): Promise<Result<{ changedAt: string }, AuthError>>
  completeOnboarding(
    accountId: string,
    input: CompleteOnboardingInput,
  ): Promise<Result<AppSession, AuthError>>
  getSession(): Promise<AppSession>
  register(input: RegisterPayload): Promise<Result<AppSession, AuthError>>
  requestPasswordReset(email: string): Promise<Result<{ email: string }, AuthError>>
  resetPassword(
    email: string,
    nextPassword: string,
  ): Promise<Result<{ changedAt: string; email: string }, AuthError>>
  signIn(input: SignInPayload): Promise<Result<SignInResult, AuthError>>
  /** Signs in via Google (Entra-federated); same outcome shape as signIn. */
  signInWithGoogle(): Promise<Result<SignInResult, AuthError>>
  /** Completes sign-in for a multi-employer identity once an employer is chosen. */
  selectEmployer(employerUniqueCode: string): Promise<Result<AppSession, AuthError>>
  /**
   * Accepts an employer invitation reached via an email / notification deep
   * link. Same outcome shape as signIn: a session, or an employer picker when
   * the identity now belongs to more than one employer.
   */
  acceptInvitation(invitationToken: string): Promise<Result<SignInResult, AuthError>>
  /** Employers awaiting selection from the most recent multi-employer sign-in. */
  getPendingEmployers(): PendingEmployer[]
  signOut(): Promise<AppSession>
}
