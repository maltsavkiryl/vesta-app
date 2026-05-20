import { useMemo, useState } from "react"
import { useRouter } from "expo-router"

import type { Shift } from "@/core/models"
import { useAppAction } from "@/features/actions/useAppAction"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { getMonthAnchor } from "@/features/schedule/schedule.utils"
import type { PlanningQuickActionOption } from "@/features/schedule/showPlanningQuickActions"
import { useSchedulePlanningState } from "@/features/schedule/useSchedulePlanningState"
import { fireHaptic } from "@/utils/haptics"

export function useScheduleScreen() {
  const router = useRouter()
  const { runAction } = useAppAction()
  const { submitPlanningWindow } = useScheduleActions()
  const { state } = useScheduleStateQuery()

  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthAnchor, setMonthAnchor] = useState(() => getMonthAnchor(today))
  const planningState = useSchedulePlanningState({
    monthAnchor,
    selectedDate,
    state,
  })
  const { activePlanningWindow, nextPlanningWindowDate } = planningState

  const handleEditSelectedDate = () =>
    runAction({
      type: "editAvailabilityOverride",
      date: selectedDate,
    })

  const handleOpenWeeklyTemplate = () => runAction({ type: "editAvailabilityTemplate" })

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

    if (activePlanningWindow) {
      options.push(
        nextPlanningWindowDate
          ? {
              label: "Complete planning window",
              onPress: handleCompletePlanningWindow,
              section: "secondary",
              systemImage: "calendar",
            }
          : {
              label: "Submit planning window",
              onPress: handleSubmitPlanningWindow,
              section: "secondary",
              systemImage: "checkmark.circle",
            },
      )
    }

    return options
  }, [
    activePlanningWindow,
    handleCompletePlanningWindow,
    handleEditSelectedDate,
    handleOpenWeeklyTemplate,
    handleSubmitPlanningWindow,
    nextPlanningWindowDate,
  ])

  const handlePrevMonth = () => {
    const previousAnchor = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1, 12)
    setMonthAnchor(previousAnchor)
    setSelectedDate(previousAnchor.toISOString().slice(0, 10))
  }

  const handleNextMonth = () => {
    const nextAnchor = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1, 12)
    setMonthAnchor(nextAnchor)
    setSelectedDate(nextAnchor.toISOString().slice(0, 10))
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

  const handleCreateRequest = () => {
    runAction({
      type: "createScheduleRequest",
      category: planningState.selectedDayShifts.length > 0 ? "shift_change" : "time_off",
      shiftId: planningState.selectedDayShifts[0]?.id,
    })
  }

  return {
    handleCreateRequest,
    handleEditSelectedDate,
    handleLongPressDate,
    handleNextMonth,
    handleOpenShift,
    handlePrevMonth,
    monthAnchor,
    planningQuickActions,
    selectedDate,
    setSelectedDate,
    ...planningState,
  }
}

export type ScheduleScreenModel = ReturnType<typeof useScheduleScreen>
