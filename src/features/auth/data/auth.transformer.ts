import type { MockBackendSessionDto } from "@/services/app/app.types"
import type { AppSession } from "@/services/app/app.session"

import type { AuthSessionDto } from "./auth.dto"

export type { AppSession } from "@/services/app/app.session"

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
