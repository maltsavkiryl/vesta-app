import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
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
  RequestItem,
  UserProfile,
} from "@/core/models"
import { load, save } from "@/utils/storage"

const APP_STATE_STORAGE_KEY = "vesta-mobile.app-state"
const APP_STATE_STORAGE_VERSION = 1

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
  | { type: "startClock" }
  | { type: "startBreak" }
  | { type: "endBreak" }
  | { type: "confirmClockOut" }
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
    case "startClock":
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "working",
          startedAt: new Date().toISOString(),
          breakStartedAt: undefined,
          accumulatedBreakSeconds: 0,
        },
      }
    case "startBreak":
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "onBreak",
          breakStartedAt: new Date().toISOString(),
        },
      }
    case "endBreak": {
      if (!state.clockSession.breakStartedAt) return state
      const breakDelta = Math.max(
        Math.floor((Date.now() - new Date(state.clockSession.breakStartedAt).getTime()) / 1000),
        0,
      )
      return {
        ...state,
        clockSession: {
          ...state.clockSession,
          state: "working",
          breakStartedAt: undefined,
          accumulatedBreakSeconds: state.clockSession.accumulatedBreakSeconds + breakDelta,
        },
      }
    }
    case "confirmClockOut": {
      const snapshot = getClockSnapshot(state.clockSession, new Date())
      const newTimeEntry = buildNewTimeEntry(snapshot.payableSeconds, snapshot.breakSeconds)
      return {
        ...state,
        timeEntries: [newTimeEntry, ...state.timeEntries],
        clockSession: {
          ...state.clockSession,
          state: "idle",
          startedAt: undefined,
          breakStartedAt: undefined,
          accumulatedBreakSeconds: 0,
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
          task.href.includes("documents")
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
  startClock: () => void
  startBreak: () => void
  endBreak: () => void
  confirmClockOut: () => void
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

  useEffect(() => {
    save(APP_STATE_STORAGE_KEY, createStateForPersistence(state))
  }, [state])

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

  const startClock = useCallback(() => dispatch({ type: "startClock" }), [dispatch])
  const startBreak = useCallback(() => dispatch({ type: "startBreak" }), [dispatch])
  const endBreak = useCallback(() => dispatch({ type: "endBreak" }), [dispatch])
  const confirmClockOut = useCallback(() => dispatch({ type: "confirmClockOut" }), [dispatch])

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
