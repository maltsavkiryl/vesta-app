import { createInitialState } from "@/core/mockState"
import type { AppStoreState } from "@/core/models"

import { normalizeEmail, withStateAuthStatus } from "./app-state.reducer"
import type {
  AccountSnapshotDto,
  LegacyPersistedAppState,
  MockAccountDto,
  MockBackendDbDto,
  MockBackendSessionDto,
  RegisterPayload,
} from "./app.types"

export const DEMO_AUTH_CREDENTIALS = {
  email: "demo.employee@vesta.local",
  password: "demo-password",
} as const

export const LEGACY_APP_STATE_STORAGE_KEY = "vesta-mobile.app-state"
export const MOCK_BACKEND_STORAGE_KEY = "vesta-mobile.mock-backend"
export const MOCK_BACKEND_VERSION = 1

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createAccountId(email: string) {
  const base = normalizeEmail(email)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return base || `account-${Date.now()}`
}

export function toAccountSnapshotDto(state: AppStoreState): AccountSnapshotDto {
  const { authStatus: _authStatus, ...snapshot } = cloneValue(state)
  return snapshot
}

export function toAppStoreState(
  snapshot: AccountSnapshotDto,
  authStatus: AppStoreState["authStatus"],
): AppStoreState {
  return withStateAuthStatus(cloneValue(snapshot), authStatus)
}

function applySeedOverrides(
  state: AppStoreState,
  payload: { email: string; firstName?: string; lastName?: string; onboardingComplete?: boolean },
) {
  return {
    ...state,
    profile: {
      ...state.profile,
      email: normalizeEmail(payload.email),
      firstName: payload.firstName ?? state.profile.firstName,
      lastName: payload.lastName ?? state.profile.lastName,
      onboardingComplete: payload.onboardingComplete ?? state.profile.onboardingComplete,
      role: payload.onboardingComplete === false ? undefined : state.profile.role,
    },
  }
}

export function createSeededAccountRecord(payload: RegisterPayload): MockAccountDto {
  const now = new Date().toISOString()
  const seededState = applySeedOverrides(createInitialState(), {
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    onboardingComplete: false,
  })

  return {
    createdAt: now,
    email: normalizeEmail(payload.email),
    id: createAccountId(payload.email),
    password: payload.password,
    state: toAccountSnapshotDto({
      ...seededState,
      authStatus: "signedIn",
    }),
    updatedAt: now,
  }
}

export function createDemoAccountRecord(): MockAccountDto {
  const now = new Date().toISOString()
  const seededState = applySeedOverrides(createInitialState(), {
    email: DEMO_AUTH_CREDENTIALS.email,
    onboardingComplete: true,
  })

  return {
    createdAt: now,
    email: DEMO_AUTH_CREDENTIALS.email,
    id: createAccountId(DEMO_AUTH_CREDENTIALS.email),
    password: DEMO_AUTH_CREDENTIALS.password,
    state: toAccountSnapshotDto({
      ...seededState,
      authStatus: "signedOut",
    }),
    updatedAt: now,
  }
}

export function createMockBackendDb(): MockBackendDbDto {
  return {
    accounts: [createDemoAccountRecord()],
    seededAt: new Date().toISOString(),
    session: {
      accountId: null,
    },
    version: MOCK_BACKEND_VERSION,
  }
}

export function migrateLegacyPersistedState(
  legacy: LegacyPersistedAppState | null,
): Pick<MockBackendDbDto, "accounts" | "session"> | null {
  if (!legacy?.state) return null

  const email = normalizeEmail(legacy.state.profile.email || DEMO_AUTH_CREDENTIALS.email)
  const now = new Date().toISOString()
  const accountRecord: MockAccountDto = {
    createdAt: now,
    email,
    id: createAccountId(email),
    password: DEMO_AUTH_CREDENTIALS.password,
    state: toAccountSnapshotDto({
      ...legacy.state,
      authStatus: "signedIn",
    }),
    updatedAt: now,
  }
  const session: MockBackendSessionDto =
    legacy.state.authStatus === "signedIn"
      ? {
          accountId: accountRecord.id,
          signedInAt: now,
        }
      : {
          accountId: null,
        }

  return {
    accounts: [accountRecord],
    session,
  }
}
