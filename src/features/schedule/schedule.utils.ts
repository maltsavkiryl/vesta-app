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
  const date = new Date(dateString)
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
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export function getPlanningWindowCoverage(
  planningWindow: PlanningWindow,
  template: AvailabilityTemplate,
  overrides: Record<string, AvailabilityOverride>,
) {
  const dates = enumerateDateRange(planningWindow.startDate, planningWindow.endDate)
  const completedDates = dates.filter((date) => {
    const availability = getEffectiveAvailability(template, overrides, date)
    return Boolean(availability.status && availability.startTime && availability.endTime)
  })

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
  const baseline = fromDate ?? new Date().toISOString().slice(0, 10)
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
  const firstOffset = firstDay.getDay()
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
