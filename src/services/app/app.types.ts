import type {
  AppStoreState,
  AvailabilityOverride,
  AvailabilityTemplate,
  ClockSession,
  DocumentItem,
  EarningsSummary,
  Employer,
  HomeHighlight,
  HomeTask,
  LocationSnapshot,
  NotificationItem,
  PlanningWindow,
  ProofPhoto,
  RequestItem,
  Shift,
  TimeEntry,
  UserProfile,
} from "@/core/models"

export type AuthResult = { ok: true } | { ok: false; message: string }

export type DocumentUploadPayload = {
  documentId?: string
  fileName: string
  fileSize?: number
  mimeType?: string
  title: string
  uri: string
}

export type ClockActionPayload = {
  occurredAt?: string
  location?: LocationSnapshot
  proofPhoto?: ProofPhoto
}

export type SignInPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type AppAction =
  | { type: "signIn"; payload: { email: string } }
  | { type: "register"; payload: { firstName: string; lastName: string; email: string } }
  | { type: "signOut" }
  | { type: "completeOnboarding"; payload: { role: string; employerId: string } }
  | { type: "updateProfile"; payload: Partial<UserProfile> }
  | { type: "updatePasswordMetadata"; payload: { changedAt: string } }
  | { type: "saveAvailabilityOverride"; payload: AvailabilityOverride }
  | { type: "saveAvailabilityTemplate"; payload: AvailabilityTemplate }
  | { type: "submitPlanningWindow"; payload: { id: string; submittedAt: string } }
  | { type: "createRequest"; payload: RequestItem }
  | { type: "respondToShift"; payload: { id: string } }
  | { type: "markNotificationRead"; payload: { id: string } }
  | { type: "markAllNotificationsRead" }
  | { type: "archiveNotification"; payload: { id: string } }
  | { type: "archiveAllNotifications" }
  | { type: "startClock"; payload?: ClockActionPayload }
  | { type: "startBreak"; payload?: ClockActionPayload }
  | { type: "endBreak"; payload?: ClockActionPayload }
  | { type: "confirmClockOut"; payload?: ClockActionPayload }
  | { type: "uploadDocument"; payload: DocumentUploadPayload }
  | { type: "signContract"; payload: { contractId: string } }
  | { type: "joinEmployer"; payload: { employerId: string } }
  | { type: "recordPasswordReset"; payload: { email: string } }

export interface AccountSnapshotDto extends Omit<AppStoreState, "authStatus"> {}

export interface ProfileAggregateDto {
  employerDirectory: Employer[]
  employers: Employer[]
  lastPasswordResetEmail?: string
  profile: UserProfile
  version: 1
}

export interface ScheduleAggregateDto {
  availabilityOverrides: Record<string, AvailabilityOverride>
  availabilityTemplate: AvailabilityTemplate
  planningWindows: PlanningWindow[]
  requests: RequestItem[]
  shifts: Shift[]
  version: 1
}

export interface TimeAggregateDto {
  clockSession: ClockSession
  earnings: EarningsSummary
  timeEntries: TimeEntry[]
  version: 1
}

export interface DocumentsAggregateDto {
  documents: DocumentItem[]
  signedContractIds: string[]
  version: 1
}

export interface NotificationsAggregateDto {
  notifications: NotificationItem[]
  version: 1
}

export interface HomeAggregateDto {
  highlights: HomeHighlight[]
  tasks: HomeTask[]
  version: 1
}

export interface MockAccountAggregatesDto {
  documents: DocumentsAggregateDto
  home: HomeAggregateDto
  notifications: NotificationsAggregateDto
  profile: ProfileAggregateDto
  schedule: ScheduleAggregateDto
  time: TimeAggregateDto
}

export interface MockAccountDto {
  aggregates: MockAccountAggregatesDto
  createdAt: string
  email: string
  id: string
  password: string
  updatedAt: string
}

export interface MockBackendSessionDto {
  accountId: string | null
  signedInAt?: string
}

export interface MockBackendDbDto {
  accounts: MockAccountDto[]
  seededAt: string
  session: MockBackendSessionDto
  version: number
}

export interface LegacyPersistedAppState {
  state: AppStoreState
  version: number
}
