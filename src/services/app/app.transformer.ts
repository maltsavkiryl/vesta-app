import { createInitialState } from "@/core/mockState"
import type { AppStoreState } from "@/core/models"

import { normalizeEmail, withStateAuthStatus } from "./app-state.reducer"
import type {
  AccountSnapshotDto,
  DocumentsAggregateDto,
  HomeAggregateDto,
  LegacyPersistedAppState,
  MockAccountDto,
  MockAccountAggregatesDto,
  MockBackendDbDto,
  MockBackendSessionDto,
  NotificationsAggregateDto,
  ProfileAggregateDto,
  RegisterPayload,
  ScheduleAggregateDto,
  TimeAggregateDto,
} from "./app.types"

export const DEMO_AUTH_CREDENTIALS = {
  email: "demo.employee@vesta.local",
  password: "demo-password",
} as const

export const LEGACY_APP_STATE_STORAGE_KEY = "vesta-mobile.app-state"
export const MOCK_BACKEND_STORAGE_KEY = "vesta-mobile.mock-backend"
export const MOCK_BACKEND_VERSION = 2

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

export function toPersistedAggregates(state: AppStoreState): MockAccountAggregatesDto {
  const snapshot = toAccountSnapshotDto(state)

  const profile: ProfileAggregateDto = {
    activeEmployerId: snapshot.activeEmployerId,
    employerDirectory: cloneValue(snapshot.employerDirectory),
    employers: cloneValue(snapshot.employers),
    lastPasswordResetEmail: snapshot.lastPasswordResetEmail,
    profile: cloneValue(snapshot.profile),
    version: 1,
  }
  const schedule: ScheduleAggregateDto = {
    availability: cloneValue(snapshot.availability),
    requests: cloneValue(snapshot.requests),
    shifts: cloneValue(snapshot.shifts),
    version: 1,
  }
  const time: TimeAggregateDto = {
    clockSession: cloneValue(snapshot.clockSession),
    earnings: cloneValue(snapshot.earnings),
    timeEntries: cloneValue(snapshot.timeEntries),
    version: 1,
  }
  const documents: DocumentsAggregateDto = {
    documents: cloneValue(snapshot.documents),
    signedContractIds: cloneValue(snapshot.signedContractIds),
    version: 1,
  }
  const notifications: NotificationsAggregateDto = {
    notifications: cloneValue(snapshot.notifications),
    version: 1,
  }
  const home: HomeAggregateDto = {
    highlights: cloneValue(snapshot.highlights),
    tasks: cloneValue(snapshot.tasks),
    version: 1,
  }

  return {
    documents,
    home,
    notifications,
    profile,
    schedule,
    time,
  }
}

export function toAppStoreStateFromAggregates(
  aggregates: MockAccountAggregatesDto,
  authStatus: AppStoreState["authStatus"],
): AppStoreState {
  return withStateAuthStatus(
    {
      activeEmployerId: aggregates.profile.activeEmployerId,
      availability: cloneValue(aggregates.schedule.availability),
      clockSession: cloneValue(aggregates.time.clockSession),
      documents: cloneValue(aggregates.documents.documents),
      earnings: cloneValue(aggregates.time.earnings),
      employerDirectory: cloneValue(aggregates.profile.employerDirectory),
      employers: cloneValue(aggregates.profile.employers),
      highlights: cloneValue(aggregates.home.highlights),
      lastPasswordResetEmail: aggregates.profile.lastPasswordResetEmail,
      notifications: cloneValue(aggregates.notifications.notifications),
      profile: cloneValue(aggregates.profile.profile),
      requests: cloneValue(aggregates.schedule.requests),
      shifts: cloneValue(aggregates.schedule.shifts),
      signedContractIds: cloneValue(aggregates.documents.signedContractIds),
      tasks: cloneValue(aggregates.home.tasks),
      timeEntries: cloneValue(aggregates.time.timeEntries),
    },
    authStatus,
  )
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
    aggregates: toPersistedAggregates({
      ...seededState,
      authStatus: "signedIn",
    }),
    email: normalizeEmail(payload.email),
    id: createAccountId(payload.email),
    password: payload.password,
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
    aggregates: toPersistedAggregates({
      ...seededState,
      authStatus: "signedOut",
    }),
    email: DEMO_AUTH_CREDENTIALS.email,
    id: createAccountId(DEMO_AUTH_CREDENTIALS.email),
    password: DEMO_AUTH_CREDENTIALS.password,
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
    aggregates: toPersistedAggregates({
      ...legacy.state,
      authStatus: "signedIn",
    }),
    createdAt: now,
    email,
    id: createAccountId(email),
    password: DEMO_AUTH_CREDENTIALS.password,
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
