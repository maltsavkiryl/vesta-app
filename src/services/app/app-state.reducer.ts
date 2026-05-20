import { buildNewTimeEntry } from "@/core/mockState"
import type { AppStoreState, DocumentItem, TimeEntry, UserProfile } from "@/core/models"
import { buildTimeEntryEvent } from "@/core/timeEntries"

import type { AppAction } from "./app.types"

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function applyAppAction(state: AppStoreState, action: AppAction): AppStoreState {
  switch (action.type) {
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
        employers: state.employers.some((employer) => employer.id === action.payload.employerId)
          ? state.employers
          : (() => {
              const employer = state.employerDirectory.find(
                (candidate) => candidate.id === action.payload.employerId,
              )
              return employer ? [...state.employers, employer] : state.employers
            })(),
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
    case "updatePasswordMetadata":
      return {
        ...state,
        profile: {
          ...state.profile,
          security: {
            ...state.profile.security,
            passwordLastChangedAt: action.payload.changedAt,
          },
        },
      }
    case "saveAvailabilityOverride":
      return {
        ...state,
        availabilityOverrides: {
          ...state.availabilityOverrides,
          [action.payload.date]: action.payload,
        },
      }
    case "saveAvailabilityTemplate":
      return {
        ...state,
        availabilityTemplate: action.payload,
      }
    case "submitPlanningWindow":
      return {
        ...state,
        planningWindows: state.planningWindows.map((window) =>
          window.id === action.payload.id
            ? {
                ...window,
                status: "submitted",
                submittedAt: action.payload.submittedAt,
              }
            : window,
        ),
      }
    case "createRequest":
      return {
        ...state,
        requests: [action.payload, ...state.requests],
      }
    case "respondToShift":
      return {
        ...state,
        shifts: state.shifts.map((shift) =>
          shift.id === action.payload.id
            ? {
                ...shift,
                requiresResponse: false,
                responseStatus: "acknowledged",
              }
            : shift,
        ),
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
    case "archiveNotification":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id
            ? {
                ...notification,
                archivedAt: new Date().toISOString(),
                unread: false,
              }
            : notification,
        ),
      }
    case "archiveAllNotifications":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          archivedAt: notification.archivedAt ?? new Date().toISOString(),
          unread: false,
        })),
      }
    case "startClock": {
      const occurredAt = action.payload?.occurredAt ?? new Date().toISOString()
      const clockContext = action.payload?.clockContext ?? {
        employerId: state.clockSession.employerId,
        role: state.clockSession.role,
        scheduledEnd: state.clockSession.scheduledEnd,
        scheduledStart: state.clockSession.scheduledStart,
        shiftId: state.clockSession.shiftId,
        source: state.clockSession.source,
        venueAddress: state.clockSession.venueAddress,
        venueName: state.clockSession.venueName,
      }
      return {
        ...state,
        clockSession: {
          ...clockContext,
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

export function withStateAuthStatus(
  state: Omit<AppStoreState, "authStatus">,
  authStatus: AppStoreState["authStatus"],
): AppStoreState {
  return {
    ...state,
    authStatus,
  }
}

export function withProfileUpdate(
  profile: UserProfile,
  payload: Partial<UserProfile>,
): UserProfile {
  return {
    ...profile,
    ...payload,
  }
}

export function isValidTimeEntry(entry: TimeEntry, parseDateValue: (value: string) => Date | null) {
  return Boolean(
    parseDateValue(entry.date) &&
    parseDateValue(entry.clockInAt) &&
    parseDateValue(entry.clockOutAt) &&
    entry.events.every((event) => Boolean(parseDateValue(event.occurredAt))),
  )
}
