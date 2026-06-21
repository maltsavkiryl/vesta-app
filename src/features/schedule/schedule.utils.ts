import { formatLocalDate, getLocalToday, resolveLocalDate } from "@/core/date"
import type {
  AppStoreState,
  AvailabilityOverride,
  AvailabilityStatus,
  AvailabilityTemplate,
  AvailabilityTemplateDay,
  AvailabilityWeekday,
  PlanningWindow,
  RequestItem,
  Shift,
} from "@/core/models"

export const availabilityWeekdays: AvailabilityWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

export const availabilityWeekdayLabels: Record<AvailabilityWeekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

export function getWeekdayKey(dateString: string): AvailabilityWeekday {
  // Parse at local noon so the weekday never drifts across the UTC boundary.
  const date = resolveLocalDate(dateString) ?? new Date()
  const day = date.getDay()
  return availabilityWeekdays[(day + 6) % 7] ?? "monday"
}

export function getTemplateAvailability(
  template: AvailabilityTemplate,
  dateString: string,
): AvailabilityTemplateDay {
  return template[getWeekdayKey(dateString)]
}

export function getEffectiveAvailability(
  template: AvailabilityTemplate,
  overrides: Record<string, AvailabilityOverride>,
  dateString: string,
) {
  const override = overrides[dateString]
  if (override) return override
  const fallback = getTemplateAvailability(template, dateString)
  return { date: dateString, ...fallback }
}

export function enumerateDateRange(startDate: string, endDate: string) {
  const dates: string[] = []
  const cursor = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)

  while (cursor <= end) {
    // Emit the LOCAL calendar day; toISOString() would report the UTC day and
    // can shift the date in non-UTC zones.
    dates.push(formatLocalDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export function getPlanningWindowCoverage(
  planningWindow: PlanningWindow,
  _template: AvailabilityTemplate,
  overrides: Record<string, AvailabilityOverride>,
) {
  const dates = enumerateDateRange(planningWindow.startDate, planningWindow.endDate)
  // A day only counts as "covered" when the employee has set an EXPLICIT
  // override for it. The weekly template is a sensible default, not an answer
  // to "what are you doing this specific week" — counting template-filled days
  // made coverage read 100% the moment a template existed.
  const completedDates = dates.filter((date) => Boolean(overrides[date]))

  return {
    completedDates,
    dates,
    isComplete: completedDates.length === dates.length,
  }
}

export function getActivePlanningWindow(state: Pick<AppStoreState, "planningWindows">) {
  return state.planningWindows.find((window) => window.status === "open")
}

export function getNextIncompleteAvailabilityDate(
  planningWindow: PlanningWindow | undefined,
  template: AvailabilityTemplate,
  overrides: Record<string, AvailabilityOverride>,
) {
  if (!planningWindow) return undefined
  const coverage = getPlanningWindowCoverage(planningWindow, template, overrides)
  return coverage.dates.find((date) => !overrides[date]) ?? coverage.dates[0]
}

export function getUpcomingShifts(shifts: Shift[], fromDate?: string) {
  const baseline = fromDate ?? getLocalToday()
  return shifts.filter((shift) => shift.date >= baseline)
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getMonthAnchor(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`)
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

export function buildMonthGrid(anchorDate: Date) {
  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  const firstDay = new Date(year, month, 1)
  // Monday-first (EU): shift Sunday (0) to the last column, Monday (1) to the
  // first. Matches the Monday-first availability model (`getWeekdayKey`).
  const firstOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<string | null> = []

  for (let index = 0; index < firstOffset; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toIsoDate(new Date(year, month, day, 12)))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

/** A `Date` for a shift's start, anchored at local time from `date` + `startTime`. */
export function getShiftStartDate(shift: Shift): Date {
  const [year, month, day] = shift.date.split("-").map(Number)
  const [hour, minute] = shift.startTime.split(":").map(Number)
  return new Date(year, month - 1, day, hour, minute, 0)
}

/**
 * A `Date` for a shift's end. When the end time is at or before the start time
 * (e.g. a shift that runs to "00:00"), it rolls over to the next day.
 */
export function getShiftEndDate(shift: Shift): Date {
  const start = getShiftStartDate(shift)
  const [hour, minute] = shift.endTime.split(":").map(Number)
  const end = new Date(start)
  end.setHours(hour, minute, 0, 0)
  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }
  return end
}

/**
 * The single most relevant upcoming shift: the one that is currently running or
 * starts soonest. Shifts that have already ended are ignored.
 */
export function getNextShift(shifts: Shift[], now: Date = new Date()): Shift | undefined {
  return shifts
    .filter((shift) => getShiftEndDate(shift).getTime() >= now.getTime())
    .sort(
      (left, right) => getShiftStartDate(left).getTime() - getShiftStartDate(right).getTime(),
    )[0]
}

/**
 * A short, human countdown to a future moment: "Starting now", "in 25 min",
 * "in 4h", "in 3 days". Returns `null` once the moment has passed.
 */
export function formatCountdown(target: Date, now: Date = new Date()): string | null {
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return null

  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "Starting now"
  if (minutes < 60) return `in ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const remainderMinutes = minutes % 60
    return remainderMinutes > 0 ? `in ${hours}h ${remainderMinutes}m` : `in ${hours}h`
  }

  const days = Math.round(hours / 24)
  return days === 1 ? "in 1 day" : `in ${days} days`
}

/** Monday (local noon) of the week containing `dateString`. */
export function getWeekStart(dateString: string): Date {
  const date = new Date(`${dateString}T12:00:00`)
  const offset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - offset)
  date.setHours(12, 0, 0, 0)
  return date
}

export type AgendaSectionKey = "this-week" | "next-week" | "later"

export interface AgendaSection {
  key: AgendaSectionKey
  label: string
  shifts: Shift[]
}

/**
 * Groups upcoming shifts into "This week" / "Next week" / "Later" buckets,
 * Monday-first, relative to `today`. Empty sections are omitted.
 */
export function groupUpcomingShiftsByWeek(
  shifts: Shift[],
  today: string = getLocalToday(),
): AgendaSection[] {
  const upcoming = getUpcomingShifts(shifts, today).sort((left, right) => {
    if (left.date !== right.date) return left.date.localeCompare(right.date)
    return left.startTime.localeCompare(right.startTime)
  })

  const weekStart = getWeekStart(today)
  const thisWeekEnd = toIsoDate(
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 12),
  )
  const nextWeekStart = toIsoDate(
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7, 12),
  )
  const nextWeekEnd = toIsoDate(
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 13, 12),
  )

  const buckets: Record<AgendaSectionKey, Shift[]> = {
    "this-week": [],
    "next-week": [],
    "later": [],
  }

  for (const shift of upcoming) {
    if (shift.date <= thisWeekEnd) {
      buckets["this-week"].push(shift)
    } else if (shift.date >= nextWeekStart && shift.date <= nextWeekEnd) {
      buckets["next-week"].push(shift)
    } else {
      buckets.later.push(shift)
    }
  }

  const labels: Record<AgendaSectionKey, string> = {
    "this-week": "This week",
    "next-week": "Next week",
    "later": "Later",
  }

  return (["this-week", "next-week", "later"] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, label: labels[key], shifts: buckets[key] }))
}

export function getShiftsForDate(shifts: Shift[], dateString: string) {
  return shifts
    .filter((shift) => shift.date === dateString)
    .sort((left, right) => left.startTime.localeCompare(right.startTime))
}

export function isDateWithinRange(dateString: string, startDate: string, endDate: string) {
  return dateString >= startDate && dateString <= endDate
}

export function getRequestsForDate(requests: RequestItem[], dateString: string) {
  return requests.filter((request) => {
    if (request.target.kind === "shift") return false
    if (!request.target.startDate) return false
    const endDate = request.target.endDate ?? request.target.startDate
    return isDateWithinRange(dateString, request.target.startDate, endDate)
  })
}

export type CalendarDayState = {
  availabilityStatus: AvailabilityStatus
  hasOverride: boolean
  hasShift: boolean
  isInPlanningWindow: boolean
  needsResponse: boolean
  shiftCount: number
}

export function getCalendarDayState(
  state: Pick<
    AppStoreState,
    "availabilityOverrides" | "availabilityTemplate" | "planningWindows" | "shifts"
  >,
  dateString: string,
): CalendarDayState {
  const effectiveAvailability = getEffectiveAvailability(
    state.availabilityTemplate,
    state.availabilityOverrides,
    dateString,
  )
  const dayShifts = getShiftsForDate(state.shifts, dateString)
  const openPlanningWindow = getActivePlanningWindow(state)

  return {
    availabilityStatus: effectiveAvailability.status,
    hasOverride: Boolean(state.availabilityOverrides[dateString]),
    hasShift: dayShifts.length > 0,
    isInPlanningWindow: openPlanningWindow
      ? isDateWithinRange(dateString, openPlanningWindow.startDate, openPlanningWindow.endDate)
      : false,
    needsResponse: dayShifts.some((shift) => shift.requiresResponse),
    shiftCount: dayShifts.length,
  }
}
