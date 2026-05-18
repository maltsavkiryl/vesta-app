import Config from "@/config"
import type { RequestItem } from "@/core/models"
import type { AuthError } from "@/features/auth/data/auth.errors"
import type {
  AuthRepository,
  CompleteOnboardingInput,
  RegisterPayload,
  SignInPayload,
} from "@/features/auth/data/auth.repository"
import { toAppSession, type AppSession } from "@/features/auth/data/auth.transformer"
import type { DocumentUploadError } from "@/features/documents/data/documents.errors"
import type {
  DocumentContract,
  DocumentsRepository,
} from "@/features/documents/data/documents.repository"
import { getContracts } from "@/features/documents/documents.utils"
import type { HomeRepository } from "@/features/home/data/home.repository"
import type { NotificationsRepository } from "@/features/notifications/data/notifications.repository"
import type { ProfileError } from "@/features/profile/data/profile.errors"
import type { ProfileRepository } from "@/features/profile/data/profile.repository"
import type {
  CreateRequestInput,
  ScheduleRepository,
} from "@/features/schedule/data/schedule.repository"
import type { ClockError } from "@/features/time/data/time.errors"
import type { TimeRepository } from "@/features/time/data/time.repository"
import { applyAppAction, normalizeEmail } from "@/services/app/app-state.reducer"
import {
  commitAccountAction,
  ensureDb,
  getAccountState,
  getSession,
  prependAccount,
  setSession,
} from "@/services/app/app.store"
import { createSeededAccountRecord } from "@/services/app/app.transformer"
import { failure, success } from "@/shared/result"

function buildSessionForAccount(accountId: string | null): AppSession {
  const session = getSession()
  if (!accountId) {
    return toAppSession(session)
  }
  const state = getAccountState(accountId)
  return toAppSession(session, !state.profile.onboardingComplete)
}

function getSignedInState(accountId: string) {
  return getAccountState(accountId)
}

function getUpdatedRequestPayload(input: CreateRequestInput): RequestItem {
  return {
    id: `request-${Date.now()}`,
    status: "pending",
    ...input,
  }
}

function toProfileError(error: ProfileError["type"], message: string): ProfileError {
  return { type: error, message }
}

function toClockError(error: ClockError["type"], message: string): ClockError {
  return { type: error, message }
}

function toDocumentError(error: DocumentUploadError["type"], message: string): DocumentUploadError {
  return { type: error, message }
}

function lastItem<T>(items: T[]): T {
  return items[0] as T
}

function createMockAuthRepository(): AuthRepository {
  return {
    async completeOnboarding(accountId: string, input: CompleteOnboardingInput) {
      const nextState = commitAccountAction(
        accountId,
        { type: "completeOnboarding", payload: input },
        applyAppAction,
      )
      return success(buildSessionForAccount(nextState.authStatus === "signedIn" ? accountId : null))
    },
    async getSession() {
      const session = getSession()
      return buildSessionForAccount(session.accountId)
    },
    async register(input: RegisterPayload) {
      const db = ensureDb()
      const email = normalizeEmail(input.email)

      if (db.accounts.some((account) => account.email === email)) {
        return failure<AuthError>({
          type: "account-exists",
          message: "A local demo account already exists for that email.",
        })
      }

      const account = createSeededAccountRecord(input)
      const session = {
        accountId: account.id,
        signedInAt: new Date().toISOString(),
      }
      prependAccount(account, session)
      return success(buildSessionForAccount(account.id))
    },
    async requestPasswordReset(email: string) {
      const db = ensureDb()
      const normalized = normalizeEmail(email)
      const account = db.accounts.find((candidate) => candidate.email === normalized)
      if (!account) {
        return failure<AuthError>({
          type: "reset-unavailable",
          message: "No local demo account exists for that email yet.",
        })
      }

      commitAccountAction(
        account.id,
        {
          type: "recordPasswordReset",
          payload: { email: normalized },
        },
        applyAppAction,
      )
      return success({ email: normalized })
    },
    async signIn(input: SignInPayload) {
      if (!Config.DEMO_AUTH_ENABLED) {
        return failure<AuthError>({
          type: "demo-disabled",
          message: "Production authentication is not connected yet.",
        })
      }

      const db = ensureDb()
      const email = normalizeEmail(input.email)
      const account = db.accounts.find((candidate) => candidate.email === email)

      if (!account) {
        return failure<AuthError>({
          type: "account-not-found",
          message: "No local demo account exists for that email yet.",
        })
      }

      if (account.password !== input.password) {
        return failure<AuthError>({
          type: "invalid-credentials",
          message: "Incorrect password for this local demo account.",
        })
      }

      setSession({
        accountId: account.id,
        signedInAt: new Date().toISOString(),
      })
      return success(buildSessionForAccount(account.id))
    },
    async signOut() {
      setSession({ accountId: null })
      return buildSessionForAccount(null)
    },
  }
}

function createMockProfileRepository(): ProfileRepository {
  return {
    async getEmployers(accountId) {
      const state = getSignedInState(accountId)
      return {
        activeEmployerId: state.activeEmployerId,
        employerDirectory: state.employerDirectory,
        employers: state.employers,
      }
    },
    async getProfile(accountId) {
      return getSignedInState(accountId).profile
    },
    async joinEmployer(accountId, employerId) {
      const state = getSignedInState(accountId)
      const employer = state.employerDirectory.find((candidate) => candidate.id === employerId)
      if (!employer) {
        return failure(toProfileError("employer-not-found", "Employer not found."))
      }
      if (state.employers.some((candidate) => candidate.id === employerId)) {
        return failure(
          toProfileError("employer-already-joined", "This employer is already linked."),
        )
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "joinEmployer", payload: { employerId } },
        applyAppAction,
      )
      return success({
        activeEmployerId: nextState.activeEmployerId,
        employerDirectory: nextState.employerDirectory,
        employers: nextState.employers,
      })
    },
    async switchEmployer(accountId, employerId) {
      const state = getSignedInState(accountId)
      if (!state.employers.some((candidate) => candidate.id === employerId)) {
        return failure(toProfileError("employer-not-found", "Employer not linked to this account."))
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "switchEmployer", payload: { employerId } },
        applyAppAction,
      )
      return success({
        activeEmployerId: nextState.activeEmployerId,
        employerDirectory: nextState.employerDirectory,
        employers: nextState.employers,
      })
    },
    async updateProfile(accountId, profile) {
      const nextState = commitAccountAction(
        accountId,
        { type: "updateProfile", payload: profile },
        applyAppAction,
      )
      return success(nextState.profile)
    },
  }
}

function createMockScheduleRepository(): ScheduleRepository {
  return {
    async createRequest(accountId, input) {
      const payload = getUpdatedRequestPayload(input)
      const nextState = commitAccountAction(
        accountId,
        { type: "createRequest", payload },
        applyAppAction,
      )
      return success(lastItem(nextState.requests))
    },
    async getAvailability(accountId) {
      return getSignedInState(accountId).availability
    },
    async getRequests(accountId) {
      return getSignedInState(accountId).requests
    },
    async getSchedule(accountId) {
      const state = getSignedInState(accountId)
      return {
        activeEmployerId: state.activeEmployerId,
        availability: state.availability,
        employers: state.employers,
        requests: state.requests,
        shifts: state.shifts,
      }
    },
    async saveAvailability(accountId, day) {
      const nextState = commitAccountAction(
        accountId,
        { type: "updateAvailability", payload: day },
        applyAppAction,
      )
      return success(nextState.availability[day.date] ?? day)
    },
  }
}

function createMockTimeRepository(): TimeRepository {
  return {
    async clockIn(accountId, input) {
      const current = getSignedInState(accountId)
      if (current.clockSession.state !== "idle") {
        return failure(toClockError("already-clocked-in", "You are already clocked in."))
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "startClock", payload: input },
        applyAppAction,
      )
      return success(nextState.clockSession)
    },
    async clockOut(accountId, input) {
      const current = getSignedInState(accountId)
      if (current.clockSession.state === "idle" || !current.clockSession.startedAt) {
        return failure(toClockError("not-clocked-in", "There is no active clock session."))
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "confirmClockOut", payload: input },
        applyAppAction,
      )
      return success(lastItem(nextState.timeEntries))
    },
    async endBreak(accountId, input) {
      const current = getSignedInState(accountId)
      if (current.clockSession.state !== "onBreak") {
        return failure(toClockError("break-invalid", "There is no active break to end."))
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "endBreak", payload: input },
        applyAppAction,
      )
      return success(nextState.clockSession)
    },
    async getClockSession(accountId) {
      return getSignedInState(accountId).clockSession
    },
    async getTimeEntries(accountId) {
      return getSignedInState(accountId).timeEntries
    },
    async getTimeEntry(accountId, entryId) {
      return getSignedInState(accountId).timeEntries.find((entry) => entry.id === entryId) ?? null
    },
    async getTimeOverview(accountId) {
      const state = getSignedInState(accountId)
      return {
        clockSession: state.clockSession,
        earnings: state.earnings,
        timeEntries: state.timeEntries,
      }
    },
    async startBreak(accountId, input) {
      const current = getSignedInState(accountId)
      if (current.clockSession.state !== "working") {
        return failure(toClockError("break-invalid", "You can only start a break while working."))
      }
      const nextState = commitAccountAction(
        accountId,
        { type: "startBreak", payload: input },
        applyAppAction,
      )
      return success(nextState.clockSession)
    },
  }
}

function createMockDocumentsRepository(): DocumentsRepository {
  return {
    async getContracts(accountId) {
      const state = getSignedInState(accountId)
      return getContracts(state.signedContractIds).map(
        (contract): DocumentContract => ({
          body: contract.body,
          date: contract.date,
          id: contract.id,
          name: contract.name,
          status: contract.status,
          type: contract.type,
        }),
      )
    },
    async getDocuments(accountId) {
      return getSignedInState(accountId).documents
    },
    async signContract(accountId, contractId) {
      const nextState = commitAccountAction(
        accountId,
        { type: "signContract", payload: { contractId } },
        applyAppAction,
      )
      const contract = getContracts(nextState.signedContractIds)
        .map(
          (item): DocumentContract => ({
            body: item.body,
            date: item.date,
            id: item.id,
            name: item.name,
            status: item.status,
            type: item.type,
          }),
        )
        .find((candidate) => candidate.id === contractId)
      if (!contract) {
        return failure(toDocumentError("not-found", "Contract not found."))
      }
      return success(contract)
    },
    async uploadDocument(accountId, input) {
      const nextState = commitAccountAction(
        accountId,
        { type: "uploadDocument", payload: input },
        applyAppAction,
      )
      const document = input.documentId
        ? nextState.documents.find((candidate) => candidate.id === input.documentId)
        : nextState.documents[0]
      if (!document) {
        return failure(toDocumentError("upload-failed", "Unable to save the uploaded document."))
      }
      return success(document)
    },
  }
}

function createMockNotificationsRepository(): NotificationsRepository {
  return {
    async getNotifications(accountId) {
      return getSignedInState(accountId).notifications
    },
    async markAllRead(accountId) {
      const nextState = commitAccountAction(
        accountId,
        { type: "markAllNotificationsRead" },
        applyAppAction,
      )
      return nextState.notifications
    },
    async markRead(accountId, notificationId) {
      const nextState = commitAccountAction(
        accountId,
        { type: "markNotificationRead", payload: { id: notificationId } },
        applyAppAction,
      )
      return nextState.notifications
    },
  }
}

function createMockHomeRepository(): HomeRepository {
  return {
    async getHomeOverview(accountId) {
      const state = getSignedInState(accountId)
      return {
        earnings: state.earnings,
        notifications: state.notifications,
        profile: state.profile,
        selectedEmployer: state.employers.find(
          (employer) => employer.id === state.activeEmployerId,
        ),
        shifts: state.shifts,
        tasks: state.tasks,
        unreadNotifications: state.notifications.filter((notification) => notification.unread)
          .length,
      }
    },
  }
}

function createApiNotReadyError() {
  return new Error("HTTP adapters are not implemented yet.")
}

function createApiRepositories() {
  return {
    auth: {
      completeOnboarding: async () => {
        throw createApiNotReadyError()
      },
      getSession: async () => toAppSession({ accountId: null }),
      register: async () => {
        throw createApiNotReadyError()
      },
      requestPasswordReset: async () => {
        throw createApiNotReadyError()
      },
      signIn: async () => {
        throw createApiNotReadyError()
      },
      signOut: async () => toAppSession({ accountId: null }),
    } satisfies AuthRepository,
    documents: {
      getContracts: async () => [],
      getDocuments: async () => [],
      signContract: async () => {
        throw createApiNotReadyError()
      },
      uploadDocument: async () => {
        throw createApiNotReadyError()
      },
    } satisfies DocumentsRepository,
    home: {
      getHomeOverview: async () => {
        throw createApiNotReadyError()
      },
    } satisfies HomeRepository,
    notifications: {
      getNotifications: async () => [],
      markAllRead: async () => [],
      markRead: async () => [],
    } satisfies NotificationsRepository,
    profile: {
      getEmployers: async () => {
        throw createApiNotReadyError()
      },
      getProfile: async () => {
        throw createApiNotReadyError()
      },
      joinEmployer: async () => {
        throw createApiNotReadyError()
      },
      switchEmployer: async () => {
        throw createApiNotReadyError()
      },
      updateProfile: async () => {
        throw createApiNotReadyError()
      },
    } satisfies ProfileRepository,
    schedule: {
      createRequest: async () => {
        throw createApiNotReadyError()
      },
      getAvailability: async () => {
        throw createApiNotReadyError()
      },
      getRequests: async () => {
        throw createApiNotReadyError()
      },
      getSchedule: async () => {
        throw createApiNotReadyError()
      },
      saveAvailability: async () => {
        throw createApiNotReadyError()
      },
    } satisfies ScheduleRepository,
    time: {
      clockIn: async () => {
        throw createApiNotReadyError()
      },
      clockOut: async () => {
        throw createApiNotReadyError()
      },
      endBreak: async () => {
        throw createApiNotReadyError()
      },
      getClockSession: async () => {
        throw createApiNotReadyError()
      },
      getTimeEntries: async () => {
        throw createApiNotReadyError()
      },
      getTimeEntry: async () => {
        throw createApiNotReadyError()
      },
      getTimeOverview: async () => {
        throw createApiNotReadyError()
      },
      startBreak: async () => {
        throw createApiNotReadyError()
      },
    } satisfies TimeRepository,
  }
}

export interface AppRepositories {
  auth: AuthRepository
  documents: DocumentsRepository
  home: HomeRepository
  notifications: NotificationsRepository
  profile: ProfileRepository
  schedule: ScheduleRepository
  time: TimeRepository
}

export function createAppRepositories(): AppRepositories {
  const adapter = Config.API_URL ? "mock" : "mock"
  if (adapter === "mock") {
    return {
      auth: createMockAuthRepository(),
      documents: createMockDocumentsRepository(),
      home: createMockHomeRepository(),
      notifications: createMockNotificationsRepository(),
      profile: createMockProfileRepository(),
      schedule: createMockScheduleRepository(),
      time: createMockTimeRepository(),
    }
  }

  return createApiRepositories()
}

export const appRepositories = createAppRepositories()
