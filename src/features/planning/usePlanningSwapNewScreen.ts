import { useState, useMemo } from "react"
import { useRouter } from "expo-router"
import { getLocalToday, addLocalDays } from "@/core/date"
import { translate } from "@/i18n/translate"
import { usePlanningScheduleQuery, usePlanningSwapCandidatesQuery } from "@/features/planning/data/planning.queries"
import { useCreateShiftSwapMutation } from "@/features/planning/data/planning.mutations"

export function usePlanningSwapNewScreen() {
  const router = useRouter()
  const today = getLocalToday()
  const to = addLocalDays(today, 14)
  const { state: shifts, isLoading } = usePlanningScheduleQuery({ from: today, to })
  const mutation = useCreateShiftSwapMutation()

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [selectedCandidateShiftId, setSelectedCandidateShiftId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    state: candidates,
    isLoading: isCandidatesLoading,
    isError: isCandidatesError,
  } = usePlanningSwapCandidatesQuery(selectedShiftId)

  const myShifts = useMemo(() => shifts ?? [], [shifts])
  const candidateList = useMemo(() => candidates ?? [], [candidates])
  const canSubmit = Boolean(selectedShiftId && selectedCandidateShiftId)

  const handleSelectShift = (shiftId: string) => {
    setSelectedShiftId(shiftId)
    // Clear candidate selection when my shift changes
    setSelectedCandidateShiftId(null)
  }

  const handleSubmit = async () => {
    if (!selectedShiftId || !selectedCandidateShiftId) return
    setError(null)
    const result = await mutation.mutateAsync({
      input: {
        requesterShiftId: selectedShiftId,
        targetShiftId: selectedCandidateShiftId,
        note: note.trim() || undefined,
      },
    })
    if (!result.ok) {
      setError(translate("planning:requests.submitError"))
      return
    }
    setSuccess(true)
  }

  const handleDismiss = () => router.back()

  return {
    candidateList,
    canSubmit,
    error,
    handleDismiss,
    handleSelectShift,
    handleSubmit,
    isCandidatesError,
    isCandidatesLoading,
    isLoading,
    isSubmitting: mutation.isPending,
    myShifts,
    note,
    selectedCandidateShiftId,
    selectedShiftId,
    setNote,
    setSelectedCandidateShiftId,
    success,
  }
}

export type PlanningSwapNewScreenModel = ReturnType<typeof usePlanningSwapNewScreen>
