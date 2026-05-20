import { useMemo } from "react"

import {
  buildMonthGrid,
  getActivePlanningWindow,
  getCalendarDayState,
  getEffectiveAvailability,
  getPlanningWindowCoverage,
  getRequestsForDate,
  getShiftsForDate,
} from "@/features/schedule/schedule.utils"
import type { ScheduleOverview } from "@/features/schedule/data/schedule.repository"

const DEFAULT_DAY_STATE = {
  availabilityStatus: "available" as const,
  hasOverride: false,
  hasShift: false,
  isInPlanningWindow: false,
  needsResponse: false,
  shiftCount: 0,
}

function createDefaultAvailability(date: string) {
  return {
    date,
    status: "available" as const,
    startTime: "09:00",
    endTime: "17:00",
  }
}

export function useSchedulePlanningState({
  monthAnchor,
  selectedDate,
  state,
}: {
  monthAnchor: Date
  selectedDate: string
  state?: ScheduleOverview
}) {
  const monthCells = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor])
  const activePlanningWindow = state ? getActivePlanningWindow(state) : undefined
  const planningCoverage =
    state && activePlanningWindow
      ? getPlanningWindowCoverage(
          activePlanningWindow,
          state.availabilityTemplate,
          state.availabilityOverrides,
        )
      : undefined
  const selectedDayState =
    state?.availabilityTemplate && state.availabilityOverrides
      ? getCalendarDayState(state, selectedDate)
      : DEFAULT_DAY_STATE
  const selectedDayAvailability = state
    ? getEffectiveAvailability(
        state.availabilityTemplate,
        state.availabilityOverrides,
        selectedDate,
      )
    : createDefaultAvailability(selectedDate)
  const selectedDayShifts = useMemo(
    () => (state ? getShiftsForDate(state.shifts, selectedDate) : []),
    [selectedDate, state],
  )
  const selectedShiftIds = useMemo(
    () => new Set(selectedDayShifts.map((shift) => shift.id)),
    [selectedDayShifts],
  )
  const selectedDayRequests = useMemo(() => {
    const dateRequests = state ? getRequestsForDate(state.requests, selectedDate) : []
    const shiftRequests =
      state?.requests.filter(
        (request) =>
          request.target.kind === "shift" &&
          Boolean(request.target.shiftId && selectedShiftIds.has(request.target.shiftId)),
      ) ?? []

    return [...dateRequests, ...shiftRequests]
  }, [selectedDate, selectedShiftIds, state])
  const pendingRequests = (state?.requests ?? []).filter((request) => request.status === "pending")
  const visibleRequests = (
    pendingRequests.length > 0 ? pendingRequests : (state?.requests ?? [])
  ).slice(0, 4)
  const selectedShiftNeedingResponse = selectedDayShifts.find((shift) => shift.requiresResponse)
  const nextPlanningWindowDate =
    activePlanningWindow && state
      ? planningCoverage?.dates.find((date) => !state.availabilityOverrides[date])
      : undefined
  const availabilitySourceLabel = selectedDayState.hasOverride
    ? "Using a date override"
    : "Using your weekly template"
  const selectedDateAvailabilityLabel =
    selectedDayAvailability.status === "unavailable"
      ? "Unavailable"
      : selectedDayAvailability.status === "preferred"
        ? "Preferred to work"
        : "Available"
  const selectedDateAvailabilitySubtitle =
    selectedDayAvailability.status === "unavailable"
      ? availabilitySourceLabel
      : `${selectedDayAvailability.startTime} - ${selectedDayAvailability.endTime} · ${availabilitySourceLabel}`

  const hasSelectedDayShift = selectedDayShifts.length > 0
  const selectedDateSubtitle = hasSelectedDayShift
    ? ""
    : selectedDayAvailability.status === "unavailable"
      ? "You marked this date as unavailable."
      : "You are free on this date unless a new shift is assigned later."
  const selectedDateOverrideNote =
    hasSelectedDayShift && selectedDayState.hasOverride
      ? "Availability for this date is using a date override."
      : null
  const selectedDateShiftNote =
    selectedDayShifts.length > 1 ? `${selectedDayShifts.length} shifts are listed below.` : null

  const getDayState = (date: string) => (state ? getCalendarDayState(state, date) : DEFAULT_DAY_STATE)

  return {
    activePlanningWindow,
    availabilitySourceLabel,
    getDayState,
    hasSelectedDayShift,
    monthCells,
    nextPlanningWindowDate,
    selectedDateAvailabilityLabel,
    selectedDateAvailabilitySubtitle,
    selectedDateOverrideNote,
    selectedDateShiftNote,
    selectedDateSubtitle,
    selectedDayAvailability,
    selectedDayRequests,
    selectedDayShifts,
    selectedDayState,
    selectedShiftNeedingResponse,
    visibleRequests,
  }
}
