import Config from "@/config"
import { applyAppAction, normalizeEmail } from "@/services/app/app-state.reducer"
import {
  commitAccountPasswordChange,
  commitAccountAction,
  ensureDb,
  getAccountState,
  getSession,
  prependAccount,
  setSession,
} from "@/services/app/app.store"
import { createSeededAccountRecord, DEMO_AUTH_CREDENTIALS } from "@/services/app/app.transformer"
import type {
  AuthResult,
  MockBackendSessionDto,
  RegisterPayload,
  SignInPayload,
} from "@/services/app/app.types"

export { DEMO_AUTH_CREDENTIALS }

export function signIn(payload: SignInPayload): {
  result: AuthResult
  session: MockBackendSessionDto
  state: ReturnType<typeof getAccountState> | null
} {
  if (!Config.DEMO_AUTH_ENABLED) {
    return {
      result: { ok: false, message: "Online sign-in is not available in this build yet." },
      session: getSession(),
      state: null,
    }
  }

  const db = ensureDb()
  const email = normalizeEmail(payload.email)
  const account = db.accounts.find((candidate) => candidate.email === email)

  if (!account) {
    return {
      result: { ok: false, message: "No account was found for that email." },
      session: db.session,
      state: null,
    }
  }

  if (account.password !== payload.password) {
    return {
      result: { ok: false, message: "Incorrect password for this account." },
      session: db.session,
      state: null,
    }
  }

  const session = setSession({
    accountId: account.id,
    signedInAt: new Date().toISOString(),
  })

  return {
    result: { ok: true },
    session,
    state: getAccountState(account.id),
  }
}

export function register(payload: RegisterPayload) {
  const db = ensureDb()
  const email = normalizeEmail(payload.email)

  if (db.accounts.some((account) => account.email === email)) {
    return {
      result: {
        ok: false,
        message: "An account already exists for that email.",
      } satisfies AuthResult,
      session: db.session,
      state: null,
    }
  }

  const account = createSeededAccountRecord(payload)
  const session = {
    accountId: account.id,
    signedInAt: new Date().toISOString(),
  } satisfies MockBackendSessionDto

  const created = prependAccount(account, session)

  return {
    result: { ok: true } satisfies AuthResult,
    ...created,
  }
}

export function signOut() {
  return setSession({ accountId: null })
}

export function requestPasswordReset(email: string) {
  const db = ensureDb()
  const normalized = normalizeEmail(email)
  const account = db.accounts.find((candidate) => candidate.email === normalized)
  if (!account) return { ok: false, message: "No account was found for that email." }

  commitAccountAction(
    account.id,
    {
      type: "recordPasswordReset",
      payload: { email: normalized },
    },
    applyAppAction,
  )
  return { ok: true }
}

export function changePassword(accountId: string, currentPassword: string, nextPassword: string) {
  const db = ensureDb()
  const account = db.accounts.find((candidate) => candidate.id === accountId)
  if (!account) {
    return {
      result: { ok: false, message: "Missing account." } satisfies AuthResult,
      session: db.session,
      state: null,
    }
  }

  if (account.password !== currentPassword) {
    return {
      result: { ok: false, message: "Current password is incorrect." } satisfies AuthResult,
      session: db.session,
      state: null,
    }
  }

  const { state } = commitAccountPasswordChange(account.id, nextPassword, applyAppAction)

  return {
    result: { ok: true } satisfies AuthResult,
    session: getSession(),
    state,
  }
}

export function resetPassword(email: string, nextPassword: string) {
  const db = ensureDb()
  const normalized = normalizeEmail(email)
  const account = db.accounts.find((candidate) => candidate.email === normalized)
  if (!account) {
    return {
      result: {
        ok: false,
        message: "No account was found for that email.",
      } satisfies AuthResult,
      session: db.session,
      state: null,
    }
  }

  const { state } = commitAccountPasswordChange(account.id, nextPassword, applyAppAction)

  return {
    result: { ok: true } satisfies AuthResult,
    session: getSession(),
    state,
  }
}

export function completeOnboarding(
  accountId: string,
  payload: { role: string; employerId: string },
) {
  return commitAccountAction(accountId, { type: "completeOnboarding", payload }, applyAppAction)
}
