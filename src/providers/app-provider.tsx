import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react"
import { format } from "date-fns"

import { formatTimeLabel, getClockSnapshot } from "@/core/date"
import { buildNewTimeEntry, createInitialState } from "@/core/mockState"
import type {
  AppStoreState,
  AvailabilityDay,
  Employer,
  RequestItem,
  UserProfile,
} from "@/core/models"
import { load, save } from "@/utils/storage"

const APP_STATE_STORAGE_KEY = "vesta-mobile.app-state"

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
  | { type: "completeDocumentTask"; payload: { id: string } }
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
    case "completeDocumentTask":
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.payload.id
            ? {
                ...document,
                status: "verified",
                subtitle: "Uploaded and verified",
                ctaLabel: "View file",
              }
            : document,
        ),
        tasks: state.tasks.map((task) =>
          task.href.includes("documents")
            ? { ...task, completed: true, actionLabel: "Done" }
            : task,
        ),
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
  signIn: (payload: { email: string; password: string }) => void
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
  completeDocumentTask: (id: string) => void
  switchEmployer: (employerId: string) => void
  joinEmployer: (employerId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function getStoredState() {
  return load<AppStoreState>(APP_STATE_STORAGE_KEY) ?? createInitialState()
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, getStoredState)

  useEffect(() => {
    save(APP_STATE_STORAGE_KEY, state)
  }, [state])

  const value = useMemo<AppContextValue>(() => {
    const selectedEmployer = state.employers.find(
      (employer) => employer.id === state.activeEmployerId,
    )

    return {
      state,
      isSignedIn: state.authStatus === "signedIn",
      needsOnboarding: state.authStatus === "signedIn" && !state.profile.onboardingComplete,
      selectedEmployer,
      unreadNotifications: state.notifications.filter((notification) => notification.unread).length,
      signIn: ({ email }) => dispatch({ type: "signIn", payload: { email } }),
      register: ({ firstName, lastName, email }) =>
        dispatch({ type: "register", payload: { firstName, lastName, email } }),
      requestPasswordReset: (email) =>
        dispatch({ type: "recordPasswordReset", payload: { email } }),
      signOut: () => dispatch({ type: "signOut" }),
      completeOnboarding: (payload) => dispatch({ type: "completeOnboarding", payload }),
      updateProfile: (payload) => dispatch({ type: "updateProfile", payload }),
      updateAvailability: (payload) => dispatch({ type: "updateAvailability", payload }),
      createRequest: ({ type, dateRange, reason, note }) =>
        dispatch({
          type: "createRequest",
          payload: {
            id: `request-${Date.now()}`,
            type,
            dateRange,
            reason,
            note,
            status: "pending",
          },
        }),
      markNotificationRead: (id) => dispatch({ type: "markNotificationRead", payload: { id } }),
      markAllNotificationsRead: () => dispatch({ type: "markAllNotificationsRead" }),
      startClock: () => dispatch({ type: "startClock" }),
      startBreak: () => dispatch({ type: "startBreak" }),
      endBreak: () => dispatch({ type: "endBreak" }),
      confirmClockOut: () => dispatch({ type: "confirmClockOut" }),
      completeDocumentTask: (id) => dispatch({ type: "completeDocumentTask", payload: { id } }),
      switchEmployer: (employerId) => dispatch({ type: "switchEmployer", payload: { employerId } }),
      joinEmployer: (employerId) => dispatch({ type: "joinEmployer", payload: { employerId } }),
    }
  }, [state])

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
