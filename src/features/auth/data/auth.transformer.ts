import type { MockBackendSessionDto } from "@/services/app/app.types"

import type { AuthSessionDto } from "./auth.dto"

export interface AppSession {
  accountId: string | null
  isSignedIn: boolean
  needsOnboarding: boolean
  signedInAt?: string
}

export function toAppSession(session: MockBackendSessionDto, needsOnboarding = false): AppSession {
  return {
    accountId: session.accountId,
    isSignedIn: Boolean(session.accountId),
    needsOnboarding: Boolean(session.accountId) && needsOnboarding,
    signedInAt: session.signedInAt,
  }
}

export function toAuthSessionDto(session: AppSession): AuthSessionDto {
  return {
    accountId: session.accountId,
    needsOnboarding: session.needsOnboarding,
    signedInAt: session.signedInAt,
  }
}
