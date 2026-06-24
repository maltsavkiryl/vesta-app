import type { ApisauceInstance } from "apisauce"

import {
  decodeJwtExp,
  type AccessTokenResponse,
  type EmployeeLoginResponse,
} from "@/features/auth/data/auth.api"
import type { AuthError } from "@/features/auth/data/auth.errors"
import { translate } from "@/i18n/translate"
import { failure, success, type Result } from "@/shared/result"

import {
  acquireIdToken,
  refreshIdToken,
  signOutIdentity,
  type AcquireIdTokenOptions,
} from "./identityProvider"
import { tokenStore } from "./tokenStore"

let currentAccountId: string | null = null

export interface AuthPendingEmployer {
  uniqueCode: string
  name: string
}
export type AuthSignInOutcome =
  | { kind: "signed-in"; accountId: string; profileComplete: boolean }
  | { kind: "select-employer"; employers: AuthPendingEmployer[] }

// Held between login and employer selection for a multi-employer identity. The
// id token never leaves this module — the picker UI sends back only the chosen
// employer code, not the token.
let pendingIdToken: string | null = null
let pendingEmployers: AuthPendingEmployer[] = []

function expiresAtMs(token: AccessTokenResponse): number {
  const exp = decodeJwtExp(token.access_token)
  return exp ? exp * 1000 : Date.now() + token.expires_in * 1000
}

export function createAuthService(authApi: Pick<ApisauceInstance, "post">) {
  // Exchanges an id token + a chosen employer for an employee session token.
  async function completeSelection(
    idToken: string,
    employerUniqueCode: string,
  ): Promise<Result<{ accountId: string; profileComplete: boolean }, AuthError>> {
    const selected = await authApi.post<AccessTokenResponse>("/auth/employees/select-employer", {
      idToken,
      employerUniqueCode,
    })
    if (!selected.ok || !selected.data)
      return failure<AuthError>({
        type: "invalid-credentials",
        message: "Could not start a session for this employer.",
      })
    await tokenStore.set({
      accessToken: selected.data.access_token,
      expiresAt: expiresAtMs(selected.data),
      accountId: employerUniqueCode,
      profileComplete: selected.data.profile_complete,
    })
    currentAccountId = employerUniqueCode
    pendingIdToken = null
    pendingEmployers = []
    return success({
      accountId: employerUniqueCode,
      profileComplete: selected.data.profile_complete,
    })
  }

  async function exchange(idToken: string): Promise<Result<AuthSignInOutcome, AuthError>> {
    const login = await authApi.post<EmployeeLoginResponse>("/auth/employees/login", { idToken })
    if (!login.ok || !login.data)
      return failure<AuthError>({ type: "invalid-credentials", message: "Sign-in failed." })
    const memberships = login.data.memberships
    if (memberships.length === 0)
      return failure<AuthError>({
        type: "account-not-found",
        message: "No employer is linked to this account yet.",
      })
    // A single membership signs in straight away; more than one needs a choice.
    if (memberships.length === 1) {
      const result = await completeSelection(idToken, memberships[0].employerUniqueCode)
      return result.ok ? success<AuthSignInOutcome>({ kind: "signed-in", ...result.data }) : result
    }
    pendingIdToken = idToken
    pendingEmployers = memberships.map((membership) => ({
      uniqueCode: membership.employerUniqueCode,
      name: membership.employerName,
    }))
    return success<AuthSignInOutcome>({ kind: "select-employer", employers: pendingEmployers })
  }

  return {
    async signIn(options?: AcquireIdTokenOptions): Promise<Result<AuthSignInOutcome, AuthError>> {
      const idToken = await acquireIdToken(options)
      return exchange(idToken)
    },
    getPendingEmployers(): AuthPendingEmployer[] {
      return pendingEmployers
    },
    async selectEmployer(
      employerUniqueCode: string,
    ): Promise<Result<{ accountId: string; profileComplete: boolean }, AuthError>> {
      if (!pendingIdToken)
        return failure<AuthError>({
          type: "invalid-credentials",
          message: "Your sign-in expired. Please sign in again.",
        })
      return completeSelection(pendingIdToken, employerUniqueCode)
    },
    // Accepts an employer invitation (from an email / notification deep link).
    // The accept response is just a scoped token and omits the employer code,
    // so once the membership exists server-side we re-run the login exchange to
    // establish the session from the refreshed memberships — a single membership
    // signs straight in, multiple yields the employer picker. One id token is
    // reused for both calls.
    async acceptInvitation(invitationToken: string): Promise<Result<AuthSignInOutcome, AuthError>> {
      let idToken: string
      try {
        idToken = await acquireIdToken()
      } catch {
        return failure<AuthError>({
          type: "invalid-credentials",
          message: "We couldn't verify your identity. Please try again.",
        })
      }
      const accepted = await authApi.post<AccessTokenResponse>(
        "/auth/employee-invitations/accept",
        { invitationToken, idToken },
      )
      if (!accepted.ok || !accepted.data)
        return failure<AuthError>({
          type: "validation",
          message: translate("auth:acceptInvitation.invalidExpired"),
        })
      return exchange(idToken)
    },
    async loadSession(): Promise<{ accountId: string; profileComplete: boolean } | null> {
      const token = await tokenStore.load()
      if (!token) {
        currentAccountId = null
        return null
      }
      currentAccountId = token.accountId
      return { accountId: token.accountId, profileComplete: token.profileComplete }
    },
    async reauthenticate(): Promise<boolean> {
      try {
        const idToken = await refreshIdToken()
        // Re-establish the previously-selected employer directly so a
        // multi-employer user isn't re-prompted to pick on a token refresh.
        const token = await tokenStore.load()
        if (token?.accountId) {
          const result = await completeSelection(idToken, token.accountId)
          return result.ok
        }
        const result = await exchange(idToken)
        return result.ok && result.data.kind === "signed-in"
      } catch {
        return false
      }
    },
    getCurrentAccountId(): string | null {
      return currentAccountId
    },
    async signOut(): Promise<void> {
      currentAccountId = null
      await tokenStore.clear()
      await signOutIdentity()
    },
  }
}

export type AuthService = ReturnType<typeof createAuthService>
