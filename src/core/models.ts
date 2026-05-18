export type AuthStatus = "signedOut" | "signedIn"

export type ShiftStatus = "confirmed" | "changed" | "pending"
export type AvailabilityStatus = "available" | "preferred" | "unavailable"
export type RequestStatus = "pending" | "approved" | "denied"
export type RequestType = "Time off" | "Shift swap" | "Unavailability"
export type DocumentStatus = "action_required" | "processing" | "available" | "verified"
export type NotificationKind =
  | "schedule"
  | "clock"
  | "payroll"
  | "documents"
  | "availability"
  | "announcements"
export type ClockState = "idle" | "working" | "onBreak"
export type TimeEntryStatus = "approved" | "review"
export type TimeEntryEventType = "clockIn" | "breakStart" | "breakEnd" | "clockOut"

export interface Employer {
  id: string
  code: string
  name: string
  type: string
  city: string
  teamSize: number
  rating: number
  active?: boolean
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
  preferredName: string
  phone: string
  dateOfBirth: string
  nationality: string
  homeCity: string
  address: {
    street: string
    postalCode: string
    city: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  onboardingComplete: boolean
  bio: string
  language: string
  themePreference: "system" | "light" | "dark"
  security: {
    faceIdEnabled: boolean
    biometricType: string
    passwordLastChangedAt: string
  }
  privacy: {
    analyticsEnabled: boolean
    crashReportsEnabled: boolean
    employerDataSharingEnabled: boolean
  }
  bankAccount: {
    iban: string
    bic: string
    bankName: string
    accountHolder: string
  }
  legal: {
    nationalRegisterNumber: string
    taxId: string
    socialSecurityNumber: string
    workPermitStatus: string
    payrollStatus: string
  }
  notificationPreferences: {
    shiftReminders: boolean
    scheduleChanges: boolean
    documentRequests: boolean
    payslips: boolean
    employerAnnouncements: boolean
  }
}

export interface Shift {
  id: string
  date: string
  dayLabel: string
  startTime: string
  endTime: string
  role: string
  venueName: string
  venueAddress: string
  status: ShiftStatus
  note?: string
}

export interface AvailabilityDay {
  date: string
  status: AvailabilityStatus
  startTime: string
  endTime: string
}

export interface RequestItem {
  id: string
  type: RequestType
  status: RequestStatus
  dateRange: string
  reason: string
  note?: string
}

export interface DocumentItem {
  id: string
  title: string
  subtitle: string
  category: "Identity" | "Payroll" | "Contracts"
  status: DocumentStatus
  ctaLabel: string
  uploadedAt?: string
  uploadedFileName?: string
  uploadedFileSize?: number
  uploadedMimeType?: string
  uploadedUri?: string
}

export interface NotificationItem {
  id: string
  kind: NotificationKind
  title: string
  body: string
  relativeTime: string
  unread: boolean
  action?: AppActionIntent
}

export interface LocationSnapshot {
  latitude: number
  longitude: number
  addressLabel: string
  accuracyMeters?: number
}

export interface ProofPhoto {
  uri: string
  capturedAt: string
  fileName?: string
  fileSize?: number
  mimeType?: string
}

export interface TimeEntryEvent {
  id: string
  type: TimeEntryEventType
  occurredAt: string
  location?: LocationSnapshot
}

export interface TimeEntry {
  id: string
  date: string
  shiftLabel: string
  venueName: string
  venueAddress: string
  clockInAt: string
  clockOutAt: string
  grossSeconds: number
  workedSeconds: number
  breakSeconds: number
  earningsAmount: number
  status: TimeEntryStatus
  events: TimeEntryEvent[]
  clockInProofPhoto?: ProofPhoto
}

export interface ClockSession {
  state: ClockState
  startedAt?: string
  breakStartedAt?: string
  accumulatedBreakSeconds: number
  scheduledStart: string
  scheduledEnd: string
  role: string
  venueName: string
  venueAddress: string
  events: TimeEntryEvent[]
  clockInLocation?: LocationSnapshot
  clockInProofPhoto?: ProofPhoto
}

export interface EarningsSummary {
  monthLabel: string
  targetAmount: number
  earnedAmount: number
  shiftsWorked: number
  hoursWorked: number
  averageHourlyRate: number
}

export type AppNavigationRoute =
  | "/(app)/(tabs)/documents"
  | "/(app)/(tabs)/profile"
  | "/(app)/(tabs)/schedule"
  | "/(app)/(tabs)/time"
  | "/notifications"
  | "/(app)/tasks"
  | "/(app)/request"
  | `/(app)/shift/${string}`
  | `/(app)/availability/${string}`
  | `/(app)/document-contract/${string}`
  | `/(app)/document-payslip/${string}`

export type AppActionIntent =
  | { type: "navigate"; route: AppNavigationRoute }
  | { type: "uploadDocument"; title: string; documentId?: string }
  | { type: "editAvailability"; date?: string }

export interface HomeTask {
  id: string
  title: string
  subtitle: string
  urgency: "high" | "medium" | "low"
  actionLabel: string
  action: AppActionIntent
  completed?: boolean
}

export interface HomeHighlight {
  id: string
  title: string
  value: string
  subtitle: string
}

export interface AppStoreState {
  authStatus: AuthStatus
  profile: UserProfile
  activeEmployerId: string
  employers: Employer[]
  employerDirectory: Employer[]
  shifts: Shift[]
  availability: Record<string, AvailabilityDay>
  requests: RequestItem[]
  documents: DocumentItem[]
  notifications: NotificationItem[]
  timeEntries: TimeEntry[]
  clockSession: ClockSession
  earnings: EarningsSummary
  highlights: HomeHighlight[]
  tasks: HomeTask[]
  signedContractIds: string[]
  lastPasswordResetEmail?: string
}
