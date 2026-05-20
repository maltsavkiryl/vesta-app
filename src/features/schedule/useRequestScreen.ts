import { useMemo, useState } from "react"
import { useLocalSearchParams } from "expo-router"

import type { RequestCategory } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { isRequestCategory, requestCategoryConfig } from "@/features/schedule/requestCategories"
import {
  getRequestActionCopy,
  getRequestDetailTargetLabel,
  getRequestSuccessCopy,
  getRequestSummaryTarget,
  getTargetSectionCopy,
  getTodayDateString,
} from "@/features/schedule/request-screen.utils"
import { enumerateDateRange } from "@/features/schedule/schedule.utils"
import { fireHaptic } from "@/utils/haptics"

export function useRequestScreen() {
  const { createRequest } = useScheduleActions()
  const { state } = useScheduleStateQuery()
  const params = useLocalSearchParams<{ category?: RequestCategory; shiftId?: string }>()

  const category = isRequestCategory(params.category) ? params.category : "time_off"
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedShiftId, setSelectedShiftId] = useState(params.shiftId ?? "")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [done, setDone] = useState(false)

  const today = getTodayDateString()
  const config = requestCategoryConfig[category]
  const actionCopy = getRequestActionCopy(category)
  const targetSectionCopy = getTargetSectionCopy(category)
  const successCopy = getRequestSuccessCopy(category)
  const activePlanningWindow = state?.planningWindows.find((window) => window.status === "open")
  const requestDates = activePlanningWindow
    ? enumerateDateRange(activePlanningWindow.startDate, activePlanningWindow.endDate)
    : []
  const upcomingShifts = useMemo(
    () =>
      (state?.shifts ?? []).filter(
        (shift) => shift.id === params.shiftId || shift.date >= today,
      ),
    [params.shiftId, state?.shifts, today],
  )
  const selectedShift = upcomingShifts.find((shift) => shift.id === selectedShiftId)
  const targetSelected =
    category === "shift_change" ? Boolean(selectedShiftId) : selectedDates.length > 0
  const summaryTarget = getRequestSummaryTarget(category, selectedDates, selectedShift)
  const detailTargetLabel = getRequestDetailTargetLabel(category, selectedDates, selectedShift)
  const canSubmit = Boolean(reason.trim()) && targetSelected

  const toggleDate = (date: string) => {
    setSelectedDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date].sort((left, right) => left.localeCompare(right)),
    )
  }

  const handleSubmit = async () => {
    const result = await createRequest({
      category,
      note: note.trim() || undefined,
      reason,
      statusDetail:
        category === "shift_change"
          ? "Waiting for colleague and manager approval"
          : "Waiting for manager review",
      target:
        category === "shift_change"
          ? {
              kind: "shift" as const,
              label: summaryTarget,
              shiftId: selectedShiftId,
            }
          : {
              endDate: selectedDates[selectedDates.length - 1],
              kind: "dates" as const,
              label: summaryTarget,
              startDate: selectedDates[0],
            },
      type: config.type,
    })
    if (!result.ok) {
      fireHaptic("error")
      return
    }

    fireHaptic("success")
    setDone(true)
  }

  return {
    actionCopy,
    canSubmit,
    category,
    config,
    detailTargetLabel,
    done,
    handleSubmit,
    note,
    reason,
    requestDates,
    selectedDates,
    selectedShiftId,
    setNote,
    setReason,
    setSelectedShiftId,
    successCopy,
    summaryTarget,
    targetSectionCopy,
    toggleDate,
    upcomingShifts,
  }
}
