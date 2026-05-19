import { createInitialState } from "@/core/mockState"
import type { TimeEntry } from "@/core/models"
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
export const MOCK_BACKEND_VERSION = 3
const SEEDED_TIME_ENTRY_IDS = new Set(["time-1", "time-2", "time-3"])

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null) {
    return value
  }

  return JSON.parse(JSON.stringify(value)) as T
}

function sanitizeEmployers<T>(employers: T[]): T[] {
  return employers.map((employer) => {
    if (!employer || typeof employer !== "object" || !("active" in employer)) {
      return employer
    }

    const { active: _active, ...sanitizedEmployer } = employer as T & { active?: boolean }
    return sanitizedEmployer as T
  })
}

function createDefaultAggregates(): MockAccountAggregatesDto {
  return toPersistedAggregates({
    ...createInitialState(),
    authStatus: "signedOut",
  })
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function buildEarningsFromTimeEntries(
  timeEntries: TimeEntry[],
  fallback: TimeAggregateDto["earnings"],
): TimeAggregateDto["earnings"] {
  const earnedAmount = roundTo(
    timeEntries.reduce((sum, entry) => sum + entry.earningsAmount, 0),
    2,
  )
  const hoursWorked = roundTo(
    timeEntries.reduce((sum, entry) => sum + entry.workedSeconds, 0) / 3600,
    1,
  )

  return {
    averageHourlyRate:
      hoursWorked > 0 ? roundTo(earnedAmount / hoursWorked, 2) : fallback.averageHourlyRate,
    earnedAmount,
    hoursWorked,
    monthLabel: fallback.monthLabel,
    shiftsWorked: timeEntries.length,
    targetAmount: fallback.targetAmount,
  }
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
    employerDirectory: sanitizeEmployers(cloneValue(snapshot.employerDirectory)),
    employers: sanitizeEmployers(cloneValue(snapshot.employers)),
    lastPasswordResetEmail: snapshot.lastPasswordResetEmail,
    profile: cloneValue(snapshot.profile),
    version: 1,
  }
  const schedule: ScheduleAggregateDto = {
    availabilityOverrides: cloneValue(snapshot.availabilityOverrides),
    availabilityTemplate: cloneValue(snapshot.availabilityTemplate),
    planningWindows: cloneValue(snapshot.planningWindows),
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
  const defaults = createDefaultAggregates()
  const profile = aggregates.profile ?? defaults.profile
  const schedule = aggregates.schedule ?? defaults.schedule
  const time = aggregates.time ?? defaults.time
  const documents = aggregates.documents ?? defaults.documents
  const notifications = aggregates.notifications ?? defaults.notifications
  const home = aggregates.home ?? defaults.home

  return withStateAuthStatus(
    {
      availabilityOverrides: cloneValue(
        schedule.availabilityOverrides ?? defaults.schedule.availabilityOverrides,
      ),
      availabilityTemplate: cloneValue(
        schedule.availabilityTemplate ?? defaults.schedule.availabilityTemplate,
      ),
      clockSession: cloneValue(time.clockSession ?? defaults.time.clockSession),
      documents: cloneValue(documents.documents ?? defaults.documents.documents),
      earnings: cloneValue(time.earnings ?? defaults.time.earnings),
      employerDirectory: sanitizeEmployers(
        cloneValue(profile.employerDirectory ?? defaults.profile.employerDirectory),
      ),
      employers: sanitizeEmployers(cloneValue(profile.employers ?? defaults.profile.employers)),
      highlights: cloneValue(home.highlights ?? defaults.home.highlights),
      lastPasswordResetEmail: profile.lastPasswordResetEmail,
      notifications: cloneValue(
        notifications.notifications ?? defaults.notifications.notifications,
      ),
      profile: {
        ...cloneValue(defaults.profile.profile),
        ...cloneValue(profile.profile ?? defaults.profile.profile),
      },
      planningWindows: cloneValue(schedule.planningWindows ?? defaults.schedule.planningWindows),
      requests: cloneValue(schedule.requests ?? defaults.schedule.requests),
      shifts: cloneValue(schedule.shifts ?? defaults.schedule.shifts),
      signedContractIds: cloneValue(
        documents.signedContractIds ?? defaults.documents.signedContractIds,
      ),
      tasks: cloneValue(home.tasks ?? defaults.home.tasks),
      timeEntries: cloneValue(time.timeEntries ?? defaults.time.timeEntries),
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

export function migrateMockBackendDb(db: MockBackendDbDto): MockBackendDbDto {
  const defaults = createDefaultAggregates()
  const migratedAccounts = db.accounts.map((account) => {
    const currentTime = account.aggregates.time ?? defaults.time
    const timeEntries = currentTime.timeEntries ?? defaults.time.timeEntries
    const filteredTimeEntries = timeEntries.filter((entry) => !SEEDED_TIME_ENTRY_IDS.has(entry.id))

    if (filteredTimeEntries.length === timeEntries.length) {
      return account
    }

    return {
      ...account,
      aggregates: {
        ...account.aggregates,
        home: {
          ...(account.aggregates.home ?? defaults.home),
          highlights:
            filteredTimeEntries.length === 0
              ? cloneValue(defaults.home.highlights)
              : cloneValue((account.aggregates.home ?? defaults.home).highlights),
        },
        time: {
          ...currentTime,
          earnings:
            filteredTimeEntries.length === 0
              ? cloneValue(defaults.time.earnings)
              : buildEarningsFromTimeEntries(filteredTimeEntries, currentTime.earnings),
          timeEntries: cloneValue(filteredTimeEntries),
        },
      },
      updatedAt: new Date().toISOString(),
    }
  })

  return {
    ...db,
    accounts: migratedAccounts,
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
