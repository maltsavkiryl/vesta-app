import { getLocalToday, getRelativeDayLabel } from "./date"
import type {
  AppStoreState,
  AvailabilityOverride,
  AvailabilityTemplate,
  Employer,
  PlanningWindow,
  Shift,
  UserProfile,
} from "./models"
import { buildTimeEntryFromClockSession } from "./timeEntries"

/**
 * Resolves a `yyyy-MM-dd` string a given number of days from the local today.
 * Seeded schedule data is anchored relative to "now" (not hard-coded calendar
 * dates) so the agenda + planning cockpit always demo with live, upcoming data.
 */
function offsetFromToday(days: number): string {
  const [year, month, day] = getLocalToday().split("-").map(Number)
  const date = new Date(year, month - 1, day + days, 12)
  const isoMonth = String(date.getMonth() + 1).padStart(2, "0")
  const isoDay = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${isoMonth}-${isoDay}`
}

/** A deadline timestamp `days` from today at the given local hour. */
function deadlineFromToday(days: number, hour = 18): string {
  const [year, month, day] = getLocalToday().split("-").map(Number)
  return new Date(year, month - 1, day + days, hour, 0, 0).toISOString()
}

const employerDirectory: Employer[] = [
  {
    id: "bistro-noir",
    code: "BIST01",
    name: "Bistro Noir",
    type: "Restaurant",
    city: "Brussels",
    teamSize: 12,
    rating: 4.8,
    clockConfig: {
      requiresScheduledShift: true,
    },
    worksite: {
      latitude: 50.84554,
      longitude: 4.36952,
      radiusMeters: 180,
      addressLabel: "Rue de la Loi 123, Brussels",
    },
  },
  {
    id: "grand-cafe",
    code: "GRAN02",
    name: "Grand Cafe",
    type: "Cafe",
    city: "Brussels",
    teamSize: 8,
    rating: 4.6,
    clockConfig: {
      requiresScheduledShift: false,
    },
    worksite: {
      latitude: 50.84789,
      longitude: 4.35678,
      radiusMeters: 160,
      addressLabel: "Grand Place 8, Brussels",
    },
  },
  {
    id: "lux-hotel",
    code: "LUXH03",
    name: "The Lux Hotel",
    type: "Hotel",
    city: "Brussels",
    teamSize: 45,
    rating: 4.9,
    clockConfig: {
      requiresScheduledShift: true,
    },
    worksite: {
      latitude: 50.84172,
      longitude: 4.35889,
      radiusMeters: 220,
      addressLabel: "Avenue Louise 200, Brussels",
    },
  },
  {
    id: "terra-italiana",
    code: "TERR14",
    name: "Terrazza Italiana",
    type: "Restaurant",
    city: "Ghent",
    teamSize: 14,
    rating: 4.6,
    clockConfig: {
      requiresScheduledShift: false,
    },
    worksite: {
      latitude: 51.05434,
      longitude: 3.71742,
      radiusMeters: 180,
      addressLabel: "Korenmarkt 11, Ghent",
    },
  },
  {
    id: "harbor-bakery",
    code: "HARB25",
    name: "Harbor Bakery",
    type: "Bakery",
    city: "Antwerp",
    teamSize: 9,
    rating: 4.7,
    clockConfig: {
      requiresScheduledShift: false,
    },
    worksite: {
      latitude: 51.22177,
      longitude: 4.39941,
      radiusMeters: 140,
      addressLabel: "Suikerrui 20, Antwerp",
    },
  },
  {
    id: "canal-bar",
    code: "CANA36",
    name: "Canal Bar",
    type: "Bar",
    city: "Brussels",
    teamSize: 11,
    rating: 4.5,
    clockConfig: {
      requiresScheduledShift: true,
    },
    worksite: {
      latitude: 50.8509,
      longitude: 4.34076,
      radiusMeters: 150,
      addressLabel: "Quai aux Briques 32, Brussels",
    },
  },
]

const profile: UserProfile = {
  id: "sofia-fischer",
  firstName: "Sofia",
  lastName: "Fischer",
  email: "demo.employee@vesta.local",
  role: "Waiter",
  preferredName: "Sofia",
  avatarUri: undefined,
  phone: "",
  dateOfBirth: "",
  nationality: "Belgian",
  homeCity: "Brussels",
  address: {
    street: "",
    postalCode: "",
    city: "Brussels",
    country: "Belgium",
  },
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  onboardingComplete: true,
  bio: "Front-of-house employee balancing hospitality, availability planning, and shift swaps.",
  language: "en",
  motionPreference: "system",
  themePreference: "system",
  security: {
    faceIdEnabled: false,
    biometricType: "Face ID",
    passwordLastChangedAt: "Apr 12, 2026",
  },
  privacy: {
    analyticsEnabled: true,
    crashReportsEnabled: true,
    employerDataSharingEnabled: true,
  },
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
    workPermitStatus: "EU/EEA citizen",
    payrollStatus: "Ready for payroll",
  },
  notificationPreferences: {
    shiftReminders: true,
    scheduleChanges: true,
    documentRequests: true,
    payslips: true,
    employerAnnouncements: false,
  },
}

// Anchored relative to the local today so the agenda + next-shift hero always
// have live, upcoming shifts to render. `dayLabel` is baked at seed time for
// legacy callers; date-driven UI should prefer `getRelativeDayLabel(shift.date)`.
const shiftDates = {
  shift1: offsetFromToday(0),
  shift2: offsetFromToday(1),
  shift3: offsetFromToday(2),
  shift4: offsetFromToday(4),
  shift5: offsetFromToday(6),
  shift6: offsetFromToday(9),
} as const

const shifts: Shift[] = [
  {
    id: "shift-1",
    employerId: "bistro-noir",
    date: shiftDates.shift1,
    dayLabel: getRelativeDayLabel(shiftDates.shift1),
    startTime: "17:00",
    endTime: "23:00",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "confirmed",
    note: "Arrive 15 minutes early for team briefing.",
    coworkers: ["Emma D.", "Lucas M.", "Yasmine K."],
  },
  {
    id: "shift-2",
    employerId: "bistro-noir",
    date: shiftDates.shift2,
    dayLabel: getRelativeDayLabel(shiftDates.shift2),
    startTime: "12:00",
    endTime: "18:00",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "confirmed",
    coworkers: ["Emma D.", "Noah P."],
  },
  {
    id: "shift-3",
    employerId: "bistro-noir",
    date: shiftDates.shift3,
    dayLabel: getRelativeDayLabel(shiftDates.shift3),
    startTime: "18:00",
    endTime: "23:30",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "changed",
    note: "Kitchen closes later due to event service.",
    coworkers: ["Emma D.", "Lucas M.", "Yasmine K."],
    changeSummary: "End time moved from 23:00 to 23:30 for the event service.",
    requiresResponse: true,
    responseStatus: "pending",
  },
  {
    id: "shift-4",
    employerId: "bistro-noir",
    date: shiftDates.shift4,
    dayLabel: getRelativeDayLabel(shiftDates.shift4),
    startTime: "17:00",
    endTime: "00:00",
    role: "Bartender",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "pending",
    coworkers: ["Mila R.", "Jonas T."],
    changeSummary: "Manager added this extra Friday bar shift to the rota.",
  },
  {
    id: "shift-5",
    employerId: "bistro-noir",
    date: shiftDates.shift5,
    dayLabel: getRelativeDayLabel(shiftDates.shift5),
    startTime: "11:00",
    endTime: "17:00",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "confirmed",
    coworkers: ["Emma D.", "Nina B."],
  },
  {
    id: "shift-6",
    employerId: "bistro-noir",
    date: shiftDates.shift6,
    dayLabel: getRelativeDayLabel(shiftDates.shift6),
    startTime: "17:00",
    endTime: "23:00",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Rue de la Loi 123, Brussels",
    status: "confirmed",
    coworkers: ["Lara C.", "Noah P."],
  },
]

const availabilityTemplate: AvailabilityTemplate = {
  monday: { status: "available", startTime: "12:00", endTime: "22:00" },
  tuesday: { status: "preferred", startTime: "17:00", endTime: "23:00" },
  wednesday: { status: "available", startTime: "17:00", endTime: "23:30" },
  thursday: { status: "unavailable", startTime: "09:00", endTime: "17:00" },
  friday: { status: "preferred", startTime: "17:00", endTime: "00:00" },
  saturday: { status: "preferred", startTime: "12:00", endTime: "23:00" },
  sunday: { status: "available", startTime: "11:00", endTime: "18:00" },
}

// The open planning window spans today+3..today+9. Three of those seven days
// carry an explicit override, so real coverage reads 3/7 (not 100%) and the
// cockpit has something to chip away at.
const planningWindowStart = offsetFromToday(3)
const planningWindowEnd = offsetFromToday(9)

const availabilityOverrides: Record<string, AvailabilityOverride> = {
  [offsetFromToday(3)]: {
    date: offsetFromToday(3),
    status: "available",
    startTime: "12:00",
    endTime: "23:00",
  },
  [offsetFromToday(4)]: {
    date: offsetFromToday(4),
    status: "preferred",
    startTime: "17:00",
    endTime: "00:00",
  },
  [offsetFromToday(5)]: {
    date: offsetFromToday(5),
    status: "unavailable",
    startTime: "09:00",
    endTime: "17:00",
    note: "Exam evening",
  },
}

const planningWindows: PlanningWindow[] = [
  {
    id: "planning-window-1",
    label: "Next week",
    startDate: planningWindowStart,
    endDate: planningWindowEnd,
    deadline: deadlineFromToday(2),
    status: "open",
  },
  {
    id: "planning-window-2",
    label: "Last week",
    startDate: offsetFromToday(-10),
    endDate: offsetFromToday(-4),
    deadline: deadlineFromToday(-11),
    submittedAt: deadlineFromToday(-12),
    status: "submitted",
  },
]

export function buildNewTimeEntry(
  clockSession: AppStoreState["clockSession"],
  clockOutAt: string,
  clockOutLocation = clockSession.events[clockSession.events.length - 1]?.location,
) {
  return buildTimeEntryFromClockSession({
    clockOutAt,
    clockOutLocation,
    clockSession,
  })
}

export function createInitialState(): AppStoreState {
  return {
    authStatus: "signedOut",
    profile,
    employers: employerDirectory,
    employerDirectory,
    shifts,
    availabilityOverrides,
    availabilityTemplate,
    planningWindows,
    requests: [
      {
        id: "request-1",
        category: "time_off",
        type: "Time off",
        status: "pending",
        submittedAt: "2026-05-15T09:12:00.000Z",
        target: {
          kind: "dates",
          label: "May 26 - May 27",
          startDate: "2026-05-26",
          endDate: "2026-05-27",
        },
        reason: "Personal",
        statusDetail: "Waiting for manager review",
        nextStep: "Manager approval expected before Thursday",
      },
      {
        id: "request-2",
        category: "shift_change",
        type: "Shift swap",
        status: "approved",
        submittedAt: "2026-05-10T14:45:00.000Z",
        target: {
          kind: "shift",
          label: "May 12 evening shift",
          shiftId: "shift-1",
        },
        reason: "Swap evening shift with Lara",
        statusDetail: "Approved by Lara and manager",
        nextStep: "No further action needed",
      },
    ],
    documents: [
      {
        id: "document-1",
        title: "ID card verification",
        subtitle: "Required for payroll activation",
        category: "Identity",
        status: "action_required",
        ctaLabel: "Upload now",
      },
      {
        id: "document-2",
        title: "April payslip",
        subtitle: "Available for download",
        category: "Payroll",
        status: "available",
        ctaLabel: "View payslip",
      },
      {
        id: "document-3",
        title: "Employment contract",
        subtitle: "Signed and archived",
        category: "Contracts",
        status: "verified",
        ctaLabel: "View contract",
      },
    ],
    notifications: [
      {
        id: "notification-1",
        kind: "schedule",
        title: "Shift updated",
        body: "Friday May 22 now runs until midnight.",
        relativeTime: "1h ago",
        unread: true,
        action: { type: "navigate", route: "/(app)/shift/shift-4" },
      },
      {
        id: "notification-2",
        kind: "documents",
        title: "Document requested",
        body: "Upload your ID card to keep payroll on track.",
        relativeTime: "4h ago",
        unread: true,
        action: {
          type: "uploadDocument",
          documentId: "document-1",
          title: "ID card verification",
        },
      },
      {
        id: "notification-3",
        kind: "availability",
        title: "Availability deadline",
        body: "Set your availability for next week before Sunday evening.",
        relativeTime: "2d ago",
        unread: false,
        action: { type: "editAvailabilityOverride", date: "2026-05-18" },
      },
    ],
    timeEntries: [],
    clockSession: {
      source: "shift",
      employerId: "bistro-noir",
      state: "idle",
      accumulatedBreakSeconds: 0,
      scheduledStart: "17:00",
      scheduledEnd: "23:00",
      role: "Waiter",
      venueName: "Bistro Noir",
      venueAddress: "Rue de la Loi 123, Brussels",
      events: [],
    },
    highlights: [
      {
        id: "highlight-1",
        title: "Earned this month",
        value: "EUR 1,486.50",
        subtitle: "62% of your monthly target",
      },
      {
        id: "highlight-2",
        title: "Today's shift",
        value: "17:00 - 23:00",
        subtitle: "Clock in at Bistro Noir to start tracking hours",
      },
      {
        id: "highlight-3",
        title: "Response score",
        value: "98%",
        subtitle: "You confirm schedule changes quickly",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Upload your ID card",
        subtitle: "Required before the next payroll run",
        urgency: "high",
        actionLabel: "Upload",
        action: {
          type: "uploadDocument",
          documentId: "document-1",
          title: "ID card verification",
        },
      },
      {
        id: "task-2",
        title: "Review updated Wednesday shift",
        subtitle: "Your end time changed due to event service",
        urgency: "medium",
        actionLabel: "Review",
        action: { type: "respondToShift", shiftId: "shift-3" },
      },
      {
        id: "task-3",
        title: "Set next week's availability",
        subtitle: "Help the team finalize rota planning",
        urgency: "low",
        actionLabel: "Set",
        action: { type: "editAvailabilityOverride", date: "2026-05-18" },
      },
    ],
    signedContractIds: ["contract-1"],
  }
}
