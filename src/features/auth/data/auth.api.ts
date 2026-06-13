import type { AppSession } from "@/services/app/app.session"

export interface AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  profile_complete: boolean
}
export interface EmployerMembershipResponse {
  employerUniqueCode: string
  employerName: string
}
export interface EmployeeLoginResponse {
  memberships: EmployerMembershipResponse[]
}

export function decodeJwtExp(jwt: string): number | null {
  const parts = jwt.split(".")
  if (parts.length < 2) return null
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json =
      typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf8")
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

export function toAppSessionFromToken(
  token: AccessTokenResponse,
  accountId: string,
  signedInAt: string,
): AppSession {
  return {
    accountId,
    isSignedIn: true,
    needsOnboarding: !token.profile_complete,
    signedInAt,
  }
}
