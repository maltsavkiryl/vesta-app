import type { ApisauceInstance } from "apisauce"

import { decodeJwtExp, type AccessTokenResponse, type EmployeeLoginResponse } from "@/features/auth/data/auth.api"
import type { AuthError } from "@/features/auth/data/auth.errors"
import { failure, success, type Result } from "@/shared/result"

import { acquireIdToken, refreshIdToken, signOutIdentity } from "./identityProvider"
import { tokenStore } from "./tokenStore"

let currentAccountId: string | null = null

function expiresAtMs(token: AccessTokenResponse): number {
  const exp = decodeJwtExp(token.access_token)
  return exp ? exp * 1000 : Date.now() + token.expires_in * 1000
}

export function createAuthService(authApi: Pick<ApisauceInstance, "post">) {
  async function exchange(idToken: string): Promise<Result<string, AuthError>> {
    const login = await authApi.post<EmployeeLoginResponse>("/auth/employees/login", { idToken })
    if (!login.ok || !login.data)
      return failure<AuthError>({ type: "invalid-credentials", message: "Sign-in failed." })
    const memberships = login.data.memberships
    if (memberships.length === 0)
      return failure<AuthError>({
        type: "account-not-found",
        message: "No employer is linked to this account yet.",
      })
    // TODO(slice-later): employer picker when memberships.length > 1
    const employerUniqueCode = memberships[0].employerUniqueCode
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
    })
    currentAccountId = employerUniqueCode
    return success(employerUniqueCode)
  }

  return {
    async signIn(): Promise<Result<string, AuthError>> {
      const idToken = await acquireIdToken()
      return exchange(idToken)
    },
    async reauthenticate(): Promise<boolean> {
      try {
        const idToken = await refreshIdToken()
        const result = await exchange(idToken)
        return result.ok
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
