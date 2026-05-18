import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react"
import { format } from "date-fns"

import Config from "@/config"
import { formatTimeLabel, getClockSnapshot } from "@/core/date"
import { buildNewTimeEntry, createInitialState } from "@/core/mockState"
import type {
  AppStoreState,
  AvailabilityDay,
  DocumentItem,
  Employer,
  LocationSnapshot,
  ProofPhoto,
  RequestItem,
  UserProfile,
} from "@/core/models"
import { buildTimeEntryEvent } from "@/core/timeEntries"
import {
  createClockLiveActivityPayload,
  endClockLiveActivity,
  isClockLiveActivitySupported,
  startClockLiveActivity,
  updateClockLiveActivity,
} from "@/services/liveActivity/clockLiveActivity"
import { load, save } from "@/utils/storage"

const APP_STATE_STORAGE_KEY = "vesta-mobile.app-state"
const APP_STATE_STORAGE_VERSION = 2

export const DEMO_AUTH_CREDENTIALS = {
  email: "demo.employee@vesta.local",
  password: "demo-password",
} as const

type AuthResult = { ok: true } | { ok: false; message: string }
type PersistedAppState = {
  version: typeof APP_STATE_STORAGE_VERSION
  state: AppStoreState
}
type DocumentUploadPayload = {
  documentId?: string
  fileName: string
  fileSize?: number
  mimeType?: string
  title: string
  uri: string
}
type ClockActionPayload = {
  occurredAt?: string
  location?: LocationSnapshot
  proofPhoto?: ProofPhoto
}

type AppAction =
  | { type: "hydrate"; payload: AppStoreState }
  | { type: "signIn"; payload: { email: string } }
  | { type: "register"; payload: { firstName: string; lastName: string; email: string } }
  | { type: "signOut" }
  | { type: "completeOnboarding"; payload: { role: string; employerId: string } }
  | { type: "updateProfile"; payload: Partial<UserProfile> }
  | { type: "updateAvailability"; payload: AvailabilityDay }
  | { type: "createRequest"; payload: RequestItem }
  | { type: "markNotificationRead"; payload: { id: string } }
  | { type: "markAllNotificationsRead" }
  | { type: "startClock"; payload?: ClockActionPayload }
  | { type: "startBreak"; payload?: ClockActionPayload }
  | { type: "endBreak"; payload?: ClockActionPayload }
  | { type: "confirmClockOut"; payload?: ClockActionPayload }
  | { type: "uploadDocument"; payload: DocumentUploadPayload }
  | { type: "signContract"; payload: { contractId: string } }
  | { type: "switchEmployer"; payload: { employerId: string } }
  | { type: "joinEmployer"; payload: { employerId: string } }
  | { type: "recordPasswordReset"; payload: { email: string } }

function reducer(state: AppStoreState, action: AppAction): AppStoreState {
  switch (action.type) {
    case "hydrate":
      return action.payload
    case "signIn":
      return {
        ...state,
        authStatus: "signedIn",
        profile: {
          ...state.profile,
          email: action.payload.email,
        },
      }
    case "register":
      return {
        ...state,
        authStatus: "signedIn",
        profile: {
          ...state.profile,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          onboardingComplete: false,
          role: undefined,
        },
      }
    case "signOut":
      return {
        ...state,
        authStatus: "signedOut",
      }
    case "completeOnboarding":
      return {
        ...state,
        activeEmployerId: action.payload.employerId,
        employers: state.employers.map((employer) => ({
          ...employer,
          active: employer.id === action.payload.employerId,
        })),
        profile: {
          ...state.profile,
          onboardingComplete: true,
          role: action.payload.role,
        },
      }
    case "updateProfile":
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      }
    case "updateAvailability":
      return {
        ...state,
        availability: {
          ...state.availability,
          [action.payload.date]: action.payload,
        },
        tasks: state.tasks.map((task) =>
          task.action.type === "editAvailability"
            ? { ...task, completed: true, actionLabel: "Done" }
            : task,
        ),
      }
    case "createRequest":
      return {
        ...state,
        requests: [action.payload, ...state.requests],
      }
    case "markNotificationRead":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id ? { ...notification, unread: false } : notification,
        ),
      }
    case "markAllNotificationsRead":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          unread: false,
        })),
      }
    case "startClock": {
      const occurredAt = action.payload?.occurredAt ?? new Date().toISOString()
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "working",
          startedAt: occurredAt,
          breakStartedAt: undefined,
          accumulatedBreakSeconds: 0,
          events: [
            buildTimeEntryEvent({
              location: action.payload?.location,
              occurredAt,
              type: "clockIn",
            }),
          ],
          clockInLocation: action.payload?.location,
          clockInProofPhoto: action.payload?.proofPhoto,
        },
      }
    }
    case "startBreak": {
      const occurredAt = action.payload?.occurredAt ?? new Date().toISOString()
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "onBreak",
          breakStartedAt: occurredAt,
          events: [
            ...state.clockSession.events,
            buildTimeEntryEvent({
              location: action.payload?.location,
              occurredAt,
              type: "breakStart",
            }),
          ],
        },
      }
    }
    case "endBreak": {
      if (!state.clockSession.breakStartedAt) return state
      const occurredAt = action.payload?.occurredAt ?? new Date().toISOString()
      const breakDelta = Math.max(
        Math.floor(
          (new Date(occurredAt).getTime() - new Date(state.clockSession.breakStartedAt).getTime()) /
            1000,
        ),
        0,
      )
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "working",
          breakStartedAt: undefined,
          accumulatedBreakSeconds: state.clockSession.accumulatedBreakSeconds + breakDelta,
          events: [
            ...state.clockSession.events,
            buildTimeEntryEvent({
              location: action.payload?.location,
              occurredAt,
              type: "breakEnd",
            }),
          ],
        },
      }
    }
    case "confirmClockOut": {
      const clockOutAt = action.payload?.occurredAt ?? new Date().toISOString()
      const newTimeEntry = buildNewTimeEntry(
        state.clockSession,
        clockOutAt,
        action.payload?.location,
      )
      return {
        ...state,
        timeEntries: [newTimeEntry, ...state.timeEntries],
        clockSession: {
          ...state.clockSession,
          state: "idle",
          startedAt: undefined,
          breakStartedAt: undefined,
          accumulatedBreakSeconds: 0,
          events: [],
          clockInLocation: undefined,
          clockInProofPhoto: undefined,
        },
      }
    }
    case "uploadDocument": {
      const uploadedAt = new Date().toISOString()
      const uploadDetails = {
        ctaLabel: "View file",
        status: "processing" as const,
        subtitle: "Uploaded for HR review",
        uploadedAt,
        uploadedFileName: action.payload.fileName,
        uploadedFileSize: action.payload.fileSize,
        uploadedMimeType: action.payload.mimeType,
        uploadedUri: action.payload.uri,
      }
      const updatedDocuments = action.payload.documentId
        ? state.documents.map((document) =>
            document.id === action.payload.documentId
              ? {
                  ...document,
                  ...uploadDetails,
                }
              : document,
          )
        : [
            {
              id: `document-${Date.now()}`,
              title: action.payload.title,
              category: "Identity",
              ...uploadDetails,
            } satisfies DocumentItem,
            ...state.documents,
          ]

      return {
        ...state,
        documents: updatedDocuments,
        tasks: state.tasks.map((task) =>
          task.action.type === "uploadDocument" &&
          (!task.action.documentId || task.action.documentId === action.payload.documentId)
            ? { ...task, completed: true, actionLabel: "Done" }
            : task,
        ),
      }
    }
    case "signContract":
      return {
        ...state,
        signedContractIds: state.signedContractIds.includes(action.payload.contractId)
          ? state.signedContractIds
          : [...state.signedContractIds, action.payload.contractId],
      }
    case "switchEmployer":
      return {
        ...state,
        activeEmployerId: action.payload.employerId,
        employers: state.employers.map((employer) => ({
          ...employer,
          active: employer.id === action.payload.employerId,
        })),
      }
    case "joinEmployer": {
      const employer = state.employerDirectory.find(
        (candidate) => candidate.id === action.payload.employerId,
      )
      if (!employer || state.employers.some((existing) => existing.id === employer.id)) {
        return state
      }
      return {
        ...state,
        employers: [...state.employers, employer],
      }
    }
    case "recordPasswordReset":
      return {
        ...state,
        lastPasswordResetEmail: action.payload.email,
      }
    default:
      return state
  }
}

export interface AppContextValue {
  state: AppStoreState
  isSignedIn: boolean
  needsOnboarding: boolean
  selectedEmployer?: Employer
  unreadNotifications: number
  signIn: (payload: { email: string; password: string }) => AuthResult
  register: (payload: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => void
  requestPasswordReset: (email: string) => void
  signOut: () => void
  completeOnboarding: (payload: { role: string; employerId: string }) => void
  updateProfile: (payload: Partial<UserProfile>) => void
  updateAvailability: (payload: AvailabilityDay) => void
  createRequest: (payload: {
    type: RequestItem["type"]
    dateRange: string
    reason: string
    note?: string
  }) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  startClock: (payload?: ClockActionPayload) => void
  startBreak: (payload?: ClockActionPayload) => void
  endBreak: (payload?: ClockActionPayload) => void
  confirmClockOut: (payload?: ClockActionPayload) => void
  uploadDocument: (payload: DocumentUploadPayload) => void
  signContract: (contractId: string) => void
  switchEmployer: (employerId: string) => void
  joinEmployer: (employerId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function sanitizeProfileForPersistence(profile: UserProfile): UserProfile {
  return {
    ...profile,
    bankAccount: {
      iban: "",
      bic: "",
      bankName: "",
      accountHolder: "",
    },
    legal: {
      nationalRegisterNumber: "",
      taxId: "",
      socialSecurityNumber: "",
      workPermitStatus: profile.legal.workPermitStatus,
      payrollStatus: profile.legal.payrollStatus,
    },
  }
}

export function createStateForPersistence(state: AppStoreState): PersistedAppState {
  return {
    version: APP_STATE_STORAGE_VERSION,
    state: {
      ...state,
      profile: sanitizeProfileForPersistence(state.profile),
    },
  }
}

export function restorePersistedState(persisted: PersistedAppState | null): AppStoreState {
  const initialState = createInitialState()

  if (!persisted || persisted.version !== APP_STATE_STORAGE_VERSION) {
    return initialState
  }

  return {
    ...initialState,
    ...persisted.state,
    profile: sanitizeProfileForPersistence({
      ...initialState.profile,
      ...persisted.state.profile,
    }),
    employerDirectory: initialState.employerDirectory,
    earnings: initialState.earnings,
    highlights: initialState.highlights,
  }
}

function getStoredState() {
  return restorePersistedState(load<PersistedAppState>(APP_STATE_STORAGE_KEY))
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, getStoredState)
  const lastClockLiveActivitySessionId = useRef<string | null>(null)

  useEffect(() => {
    save(APP_STATE_STORAGE_KEY, createStateForPersistence(state))
  }, [state])

  useEffect(() => {
    const payload = createClockLiveActivityPayload(state.clockSession)
    const previousSessionId = lastClockLiveActivitySessionId.current

    void (async () => {
      if (!(await isClockLiveActivitySupported())) {
        lastClockLiveActivitySessionId.current = payload?.sessionId ?? null
        return
      }

      try {
        if (!payload) {
          if (previousSessionId) {
            await endClockLiveActivity(previousSessionId)
          }
          return
        }

        if (!previousSessionId) {
          await startClockLiveActivity(payload)
          return
        }

        if (previousSessionId !== payload.sessionId) {
          await endClockLiveActivity(previousSessionId)
          await startClockLiveActivity(payload)
          return
        }

        await updateClockLiveActivity(payload)
      } catch (error) {
        if (__DEV__) {
          console.warn("Unable to sync Live Activity", error)
        }
      } finally {
        lastClockLiveActivitySessionId.current = payload?.sessionId ?? null
      }
    })()
  }, [state.clockSession])

  const signIn = useCallback(
    ({ email }: { email: string; password: string }): AuthResult => {
      const normalizedEmail = normalizeEmail(email)

      if (!Config.DEMO_AUTH_ENABLED) {
        return {
          ok: false,
          message: "Production authentication is not connected yet.",
        }
      }

      dispatch({ type: "signIn", payload: { email: normalizedEmail } })
      return { ok: true }
    },
    [dispatch],
  )

  const register = useCallback(
    (payload: { firstName: string; lastName: string; email: string }) =>
      dispatch({ type: "register", payload }),
    [dispatch],
  )

  const requestPasswordReset = useCallback(
    (email: string) => dispatch({ type: "recordPasswordReset", payload: { email } }),
    [dispatch],
  )

  const signOut = useCallback(() => dispatch({ type: "signOut" }), [dispatch])

  const completeOnboarding = useCallback(
    (payload: { role: string; employerId: string }) =>
      dispatch({ type: "completeOnboarding", payload }),
    [dispatch],
  )

  const updateProfile = useCallback(
    (payload: Partial<UserProfile>) => dispatch({ type: "updateProfile", payload }),
    [dispatch],
  )

  const updateAvailability = useCallback(
    (payload: AvailabilityDay) => dispatch({ type: "updateAvailability", payload }),
    [dispatch],
  )

  const createRequest = useCallback(
    (payload: { type: RequestItem["type"]; dateRange: string; reason: string; note?: string }) =>
      dispatch({
        type: "createRequest",
        payload: {
          id: `request-${Date.now()}`,
          type: payload.type,
          dateRange: payload.dateRange,
          reason: payload.reason,
          note: payload.note,
          status: "pending",
        },
      }),
    [dispatch],
  )

  const markNotificationRead = useCallback(
    (id: string) => dispatch({ type: "markNotificationRead", payload: { id } }),
    [dispatch],
  )

  const markAllNotificationsRead = useCallback(
    () => dispatch({ type: "markAllNotificationsRead" }),
    [dispatch],
  )

  const startClock = useCallback(
    (payload?: ClockActionPayload) => dispatch({ type: "startClock", payload }),
    [dispatch],
  )
  const startBreak = useCallback(
    (payload?: ClockActionPayload) => dispatch({ type: "startBreak", payload }),
    [dispatch],
  )
  const endBreak = useCallback(
    (payload?: ClockActionPayload) => dispatch({ type: "endBreak", payload }),
    [dispatch],
  )
  const confirmClockOut = useCallback(
    (payload?: ClockActionPayload) => dispatch({ type: "confirmClockOut", payload }),
    [dispatch],
  )

  const uploadDocument = useCallback(
    (payload: DocumentUploadPayload) => dispatch({ type: "uploadDocument", payload }),
    [dispatch],
  )

  const signContract = useCallback(
    (contractId: string) => dispatch({ type: "signContract", payload: { contractId } }),
    [dispatch],
  )

  const switchEmployer = useCallback(
    (employerId: string) => dispatch({ type: "switchEmployer", payload: { employerId } }),
    [dispatch],
  )

  const joinEmployer = useCallback(
    (employerId: string) => dispatch({ type: "joinEmployer", payload: { employerId } }),
    [dispatch],
  )

  const selectedEmployer = useMemo(
    () => state.employers.find((employer) => employer.id === state.activeEmployerId),
    [state.activeEmployerId, state.employers],
  )

  const unreadNotifications = useMemo(
    () => state.notifications.filter((notification) => notification.unread).length,
    [state.notifications],
  )

  const value = useMemo<AppContextValue>(() => {
    return {
      state,
      isSignedIn: state.authStatus === "signedIn",
      needsOnboarding: state.authStatus === "signedIn" && !state.profile.onboardingComplete,
      selectedEmployer,
      unreadNotifications,
      signIn,
      register,
      requestPasswordReset,
      signOut,
      completeOnboarding,
      updateProfile,
      updateAvailability,
      createRequest,
      markNotificationRead,
      markAllNotificationsRead,
      startClock,
      startBreak,
      endBreak,
      confirmClockOut,
      uploadDocument,
      signContract,
      switchEmployer,
      joinEmployer,
    }
  }, [
    createRequest,
    completeOnboarding,
    confirmClockOut,
    joinEmployer,
    markAllNotificationsRead,
    markNotificationRead,
    register,
    requestPasswordReset,
    selectedEmployer,
    signIn,
    signOut,
    signContract,
    startBreak,
    startClock,
    state,
    switchEmployer,
    unreadNotifications,
    updateAvailability,
    updateProfile,
    uploadDocument,
    endBreak,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppSession() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppSession must be used within AppProvider")
  }
  return context
}

export function useClockSummary(now: Date = new Date()) {
  const { state } = useAppSession()
  const snapshot = getClockSnapshot(state.clockSession, now)
  return {
    ...snapshot,
    startedAtLabel: state.clockSession.startedAt
      ? formatTimeLabel(new Date(state.clockSession.startedAt))
      : undefined,
    breakMinutes: Math.floor(snapshot.breakSeconds / 60),
    workedLabel: `${Math.floor(snapshot.payableSeconds / 3600)}h ${Math.floor(
      (snapshot.payableSeconds % 3600) / 60,
    )}m`,
    totalLabel: format(now, "EEEE, MMM d"),
  }
}
