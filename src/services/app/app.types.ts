import type {
  AppStoreState,
  AvailabilityDay,
  LocationSnapshot,
  ProofPhoto,
  RequestItem,
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

export interface AccountSnapshotDto extends Omit<AppStoreState, "authStatus"> {}

export interface MockAccountDto {
  createdAt: string
  email: string
  id: string
  password: string
  state: AccountSnapshotDto
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
