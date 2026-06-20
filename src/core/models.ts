export type AuthStatus = "signedOut" | "signedIn"

export type ShiftStatus = "confirmed" | "changed" | "pending"
export type AvailabilityStatus = "available" | "preferred" | "unavailable"
export type RequestStatus = "pending" | "approved" | "denied"
export type RequestType = "Time off" | "Shift swap" | "Unavailability"
export type RequestCategory = "time_off" | "shift_change" | "availability_issue"
export type AvailabilityWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
export type DocumentStatus = "action_required" | "processing" | "available" | "verified"
export type NotificationKind =
  | "schedule"
  | "clock"
  | "payroll"
  | "documents"
  | "availability"
  | "announcements"
export type ClockState = "idle" | "working" | "onBreak"
export type ClockSessionSource = "shift" | "employer"
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
  clockConfig: {
    requiresScheduledShift: boolean
    // When false (default), clock-in does not force a proof selfie; only employers
    // that explicitly require photo proof prompt for it.
    proofRequired?: boolean
  }
  worksite?: {
    latitude: number
    longitude: number
    radiusMeters: number
    addressLabel: string
  }
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
  preferredName: string
  avatarUri?: string
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
  motionPreference: "system" | "reduced" | "full"
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
  employerId?: string
  date: string
  dayLabel: string
  startTime: string
  endTime: string
  role: string
  venueName: string
  venueAddress: string
  status: ShiftStatus
  note?: string
  coworkers?: string[]
  changeSummary?: string
  requiresResponse?: boolean
  responseStatus?: "pending" | "acknowledged" | "declined"
}

export interface AvailabilityDay {
  date: string
  status: AvailabilityStatus
  startTime: string
  endTime: string
}

export interface AvailabilityTemplateDay {
  status: AvailabilityStatus
  startTime: string
  endTime: string
}

export type AvailabilityTemplate = Record<AvailabilityWeekday, AvailabilityTemplateDay>

export interface AvailabilityOverride extends AvailabilityDay {
  note?: string
}

export interface PlanningWindow {
  id: string
  label: string
  startDate: string
  endDate: string
  deadline: string
  submittedAt?: string
  status: "open" | "submitted" | "closed"
}

export interface RequestItem {
  id: string
  category: RequestCategory
  type: RequestType
  status: RequestStatus
  submittedAt: string
  target: {
    endDate?: string
    kind: "dates" | "shift"
    label: string
    shiftId?: string
    startDate?: string
  }
  reason: string
  note?: string
  statusDetail: string
  nextStep?: string
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
  archivedAt?: string
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

export interface ClockSessionContext {
  source: ClockSessionSource
  employerId: string
  shiftId?: string
  scheduledStart?: string
  scheduledEnd?: string
  role?: string
  venueName: string
  venueAddress: string
}

export interface TimeEntry extends ClockSessionContext {
  id: string
  date: string
  shiftLabel: string
  clockInAt: string
  clockOutAt: string
  grossSeconds: number
  workedSeconds: number
  breakSeconds: number
  status: TimeEntryStatus
  events: TimeEntryEvent[]
  clockInProofPhoto?: ProofPhoto
}

export interface ClockSession extends ClockSessionContext {
  state: ClockState
  startedAt?: string
  breakStartedAt?: string
  accumulatedBreakSeconds: number
  events: TimeEntryEvent[]
  clockInLocation?: LocationSnapshot
  clockInProofPhoto?: ProofPhoto
}

export type AppNavigationRoute =
  | "/profile/legal-documents"
  | "/profile/contracts"
  | "/profile/payslips"
  | "/(app)/(tabs)/profile"
  | "/(app)/(tabs)/schedule"
  | "/(app)/(tabs)/time"
  | "/(app)/(tabs)/inbox"
  | "/notifications"
  | "/(app)/tasks"
  | "/(app)/request"
  | "/(app)/availability-template"
  | `/(app)/shift/${string}`
  | `/(app)/availability/${string}`
  | `/(app)/document-upload/${string}`
  | `/(app)/document-contract/${string}`
  | `/(app)/document-payslip/${string}`

export type AppActionIntent =
  | { type: "navigate"; route: AppNavigationRoute }
  | { type: "uploadDocument"; title: string; documentId?: string }
  | { type: "editAvailabilityTemplate" }
  | { type: "editAvailabilityOverride"; date?: string }
  | { type: "createScheduleRequest"; category?: RequestCategory; shiftId?: string }
  | { type: "respondToShift"; shiftId: string }

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

// ---------------------------------------------------------------------------
// Planning domain models (slice 5b — corrected for /employee/planning/* API)
// ---------------------------------------------------------------------------

export interface PlanningCallClaim {
  id: string
  employeeId: string
  employeeName: string
  state: string
  claimedAt: string // ISO date-time
  availabilityIntent: string
}

/**
 * Open planning call returned by GET /employee/planning/calls/open.
 * employerCode + establishmentCode are NOT in the self-scoped response — they
 * are stored on the shift itself. We include them here so the claim mutation
 * can build the correct URL: POST /employers/{emp}/establishments/{est}/calls/{code}/claim.
 * The HTTP repo extracts them from the associated ShiftDto or passes through
 * from a context that knows the establishment.
 */
export interface PlanningCall {
  id: string
  shiftId: string
  /**
   * Employer unique code — required by the claim endpoint.
   * Derived from the employee's active employer context (accountId).
   */
  employerCode: string
  /**
   * Establishment unique code — required by the claim endpoint.
   * Derived from the associated ShiftDto.establishmentUniqueCode when available.
   */
  establishmentCode: string
  mode: string
  status: string
  note?: string
  createdAt: string // ISO date-time
  claims: PlanningCallClaim[]
}

/**
 * Employee-facing todo from GET /employee/planning/todos.
 * The employee API exposes only isCompletedByMe (no requiredCount/completedCount/
 * completions — those are admin-only fields).
 */
export interface PlanningTodo {
  id: string
  scope: string
  date?: string // yyyy-MM-dd
  shiftId?: string
  label: string
  completionMode: string
  sortOrder: number
  isCompletedByMe: boolean
}

/**
 * Wrapper returned by GET /employee/planning/todos — includes optional
 * dressNote and note fields alongside the todo list.
 */
export interface PlanningTodosResult {
  todos: PlanningTodo[]
  dressNote?: string
  note?: string
}

// ---------------------------------------------------------------------------
// Shift Swap / Change request models
// ---------------------------------------------------------------------------

export interface ShiftSwapRequest {
  id: string
  requesterShiftId: string
  targetShiftId: string
  requesterEmployeeId: string
  targetEmployeeId: string
  status: string
  note?: string
  createdAt: string // ISO date-time
}

export interface CreateShiftSwapInput {
  requesterShiftId: string
  targetShiftId: string
  note?: string
}

/** A colleague shift that the requester's shift can be swapped into. */
export interface PlanningSwapCandidate {
  shiftId: string
  employeeId: string
  employeeName: string
  shiftDate: string // yyyy-MM-dd
  startTime: string // HH:mm
  endTime: string // HH:mm
  teamId: string
  teamName: string
  taskId: string
  taskName: string
  city: string
}

export interface DecideShiftSwapInput {
  swapCode: string
  accept: boolean
  note?: string
}

export interface ShiftChangeRequest {
  id: string
  shiftId: string
  employeeId: string
  status: string
  requestedDate?: string // yyyy-MM-dd
  requestedStartTime?: string // HH:mm
  requestedEndTime?: string // HH:mm
  note?: string
  createdAt: string // ISO date-time
}

export interface CreateShiftChangeInput {
  shiftId: string
  requestedDate?: string // yyyy-MM-dd
  requestedStartTime?: string // HH:mm
  requestedEndTime?: string // HH:mm
  note?: string
}

export interface MyRequests {
  swapRequests: ShiftSwapRequest[]
  changeRequests: ShiftChangeRequest[]
}

// ---------------------------------------------------------------------------
// Leave entitlement model
// ---------------------------------------------------------------------------

/**
 * The employee's annual leave entitlement for the current calendar year.
 * Returned by GET /employee/planning/leave.
 * This is NOT a list of leave requests.
 */
export interface LeaveEntitlement {
  calendarYear: number
  statutoryDays: number
  employerPolicyDays: number
  totalDays: number
  /** Annual leave entitlement in hours. */
  entitlementHours: number
  /** 0 = Local, 1 = Prisma */
  source: number
}

export interface AppStoreState {
  authStatus: AuthStatus
  profile: UserProfile
  employers: Employer[]
  employerDirectory: Employer[]
  shifts: Shift[]
  availabilityTemplate: AvailabilityTemplate
  availabilityOverrides: Record<string, AvailabilityOverride>
  planningWindows: PlanningWindow[]
  requests: RequestItem[]
  documents: DocumentItem[]
  notifications: NotificationItem[]
  timeEntries: TimeEntry[]
  clockSession: ClockSession
  highlights: HomeHighlight[]
  tasks: HomeTask[]
  signedContractIds: string[]
  lastPasswordResetEmail?: string
}
