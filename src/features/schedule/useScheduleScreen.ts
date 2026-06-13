import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "expo-router"

import { getLocalToday } from "@/core/date"
import type { Shift } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import {
  formatCountdown,
  getMonthAnchor,
  getNextShift,
  getPlanningWindowCoverage,
  getShiftEndDate,
  getShiftStartDate,
  groupUpcomingShiftsByWeek,
} from "@/features/schedule/schedule.utils"
import type { PlanningQuickActionOption } from "@/features/schedule/showPlanningQuickActions"
import { useSchedulePlanningState } from "@/features/schedule/useSchedulePlanningState"
import { fireHaptic } from "@/utils/haptics"

export type ScheduleViewMode = "agenda" | "calendar"

const noop = () => {}

export function useScheduleScreen() {
  const router = useRouter()
  const { runAction } = useAppAction()
  const { submitPlanningWindow } = useScheduleActions()
  const { state, isError, isLoading, refetch } = useScheduleStateQuery()

  const today = getLocalToday()
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthAnchor, setMonthAnchor] = useState(() => getMonthAnchor(today))
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("agenda")

  // A coarse "now" that re-renders the next-shift countdown roughly every
  // minute. Cheap, and keeps "in 4h" honest without a per-second timer.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const planningState = useSchedulePlanningState({
    monthAnchor,
    selectedDate,
    state,
  })
  const { activePlanningWindow, nextPlanningWindowDate } = planningState

  const shifts = useMemo(() => state?.shifts ?? [], [state?.shifts])

  const nextShift = useMemo(() => getNextShift(shifts, now), [shifts, now])
  const nextShiftCountdown = nextShift
    ? (formatCountdown(getShiftStartDate(nextShift), now) ??
      (getShiftEndDate(nextShift).getTime() >= now.getTime() ? "On now" : null))
    : null

  const agendaSections = useMemo(() => groupUpcomingShiftsByWeek(shifts, today), [shifts, today])

  const planningCoverage =
    state && activePlanningWindow
      ? getPlanningWindowCoverage(
          activePlanningWindow,
          state.availabilityTemplate,
          state.availabilityOverrides,
        )
      : undefined
  const planningDeadlineCountdown = activePlanningWindow
    ? formatCountdown(new Date(activePlanningWindow.deadline), now)
    : null

  const handleEditSelectedDate = useCallback(
    () =>
      runAction({
        type: "editAvailabilityOverride",
        date: selectedDate,
      }),
    [runAction, selectedDate],
  )

  const handleOpenWeeklyTemplate = useCallback(
    () => runAction({ type: "editAvailabilityTemplate" }),
    [runAction],
  )

  const handleCompletePlanningWindow = () => {
    if (!nextPlanningWindowDate) {
      return
    }

    return runAction({
      type: "editAvailabilityOverride",
      date: nextPlanningWindowDate,
    })
  }

  const handleSubmitPlanningWindow = async () => {
    if (!activePlanningWindow) {
      return
    }

    const result = await submitPlanningWindow(activePlanningWindow.id)
    if (!result.ok) {
      fireHaptic("error")
      return
    }

    fireHaptic("success")
  }

  // The gear keeps only genuinely secondary tools now that "Submit
  // availability" is a first-class button in the planning cockpit card.
  const planningQuickActions = useMemo(() => {
    const options: PlanningQuickActionOption[] = [
      {
        label: "Edit selected date",
        onPress: handleEditSelectedDate,
        systemImage: "square.and.pencil",
      },
      {
        label: "Weekly template",
        onPress: handleOpenWeeklyTemplate,
        systemImage: "repeat",
      },
    ]

    return options
  }, [handleEditSelectedDate, handleOpenWeeklyTemplate])

  const handlePrevMonth = () => {
    setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1, 12))
  }

  const handleNextMonth = () => {
    setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1, 12))
  }

  // Snaps both the visible month and the selection back to today. The old
  // month-nav handlers used to clobber the selection with the 1st of the month.
  const handleJumpToToday = () => {
    setMonthAnchor(getMonthAnchor(today))
    setSelectedDate(today)
    fireHaptic("selection")
  }

  const handleLongPressDate = (date: string) => {
    setSelectedDate(date)
    void runAction({
      type: "editAvailabilityOverride",
      date,
    })
  }

  const handleOpenShift = (shiftId: Shift["id"]) => {
    router.push(`/(app)/shift/${shiftId}` as never)
  }

  const handleViewCalendarDate = (date: string) => {
    setSelectedDate(date)
    setMonthAnchor(getMonthAnchor(date))
    setViewMode("calendar")
  }

  const handleCreateRequest = () => {
    runAction({
      type: "createScheduleRequest",
      category: planningState.selectedDayShifts.length > 0 ? "shift_change" : "time_off",
      shiftId: planningState.selectedDayShifts[0]?.id,
    })
  }

  return {
    agendaSections,
    handleCompletePlanningWindow,
    handleCreateRequest,
    handleEditSelectedDate,
    handleJumpToToday,
    handleLongPressDate,
    handleNextMonth,
    handleOpenShift,
    handlePrevMonth,
    handleSubmitPlanningWindow,
    handleViewCalendarDate,
    isError,
    isLoading,
    monthAnchor,
    nextShift,
    nextShiftCountdown,
    planningCoverage,
    planningDeadlineCountdown,
    planningQuickActions,
    refetch: refetch ?? noop,
    selectedDate,
    setSelectedDate,
    setViewMode,
    today,
    viewMode,
    ...planningState,
  }
}

export type ScheduleScreenModel = ReturnType<typeof useScheduleScreen>
