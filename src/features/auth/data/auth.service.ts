import Config from "@/config"
import { applyAppAction, normalizeEmail } from "@/services/app/app-state.reducer"
import {
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
      result: { ok: false, message: "Production authentication is not connected yet." },
      session: getSession(),
      state: null,
    }
  }

  const db = ensureDb()
  const email = normalizeEmail(payload.email)
  const account = db.accounts.find((candidate) => candidate.email === email)

  if (!account) {
    return {
      result: { ok: false, message: "No local demo account exists for that email yet." },
      session: db.session,
      state: null,
    }
  }

  if (account.password !== payload.password) {
    return {
      result: { ok: false, message: "Incorrect password for this local demo account." },
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
        message: "A local demo account already exists for that email.",
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
  if (!account) return getSession()

  commitAccountAction(
    account.id,
    {
      type: "recordPasswordReset",
      payload: { email: normalized },
    },
    applyAppAction,
  )
  return getSession()
}

export function completeOnboarding(
  accountId: string,
  payload: { role: string; employerId: string },
) {
  return commitAccountAction(accountId, { type: "completeOnboarding", payload }, applyAppAction)
}
