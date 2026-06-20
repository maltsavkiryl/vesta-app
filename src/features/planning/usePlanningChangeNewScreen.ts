import { useState, useMemo } from "react"
import { useRouter } from "expo-router"
import { getLocalToday } from "@/core/date"
import { usePlanningScheduleQuery } from "@/features/planning/data/planning.queries"
import { useCreateShiftChangeMutation } from "@/features/planning/data/planning.mutations"

function addDays(d: string, days: number): string {
  const date = new Date(`${d}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function usePlanningChangeNewScreen() {
  const router = useRouter()
  const today = getLocalToday()
  const to = addDays(today, 14)
  const { state: shifts, isLoading } = usePlanningScheduleQuery({ from: today, to })
  const mutation = useCreateShiftChangeMutation()

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [requestedDate, setRequestedDate] = useState("")
  const [requestedStartTime, setRequestedStartTime] = useState("")
  const [requestedEndTime, setRequestedEndTime] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const myShifts = useMemo(() => shifts ?? [], [shifts])
  const canSubmit = Boolean(selectedShiftId)

  const handleSubmit = async () => {
    if (!selectedShiftId) return
    setError(null)
    const result = await mutation.mutateAsync({
      input: {
        shiftId: selectedShiftId,
        requestedDate: requestedDate.trim() || undefined,
        requestedStartTime: requestedStartTime.trim() || undefined,
        requestedEndTime: requestedEndTime.trim() || undefined,
        note: note.trim() || undefined,
      },
    })
    if (!result.ok) {
      setError("Kon aanvraag niet indienen.")
      return
    }
    setSuccess(true)
  }

  const handleDismiss = () => router.back()

  return {
    canSubmit,
    error,
    handleDismiss,
    handleSubmit,
    isLoading,
    isSubmitting: mutation.isPending,
    myShifts,
    note,
    requestedDate,
    requestedEndTime,
    requestedStartTime,
    selectedShiftId,
    setNote,
    setRequestedDate,
    setRequestedEndTime,
    setRequestedStartTime,
    setSelectedShiftId,
    success,
  }
}

export type PlanningChangeNewScreenModel = ReturnType<typeof usePlanningChangeNewScreen>
