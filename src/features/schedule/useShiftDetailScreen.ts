import { useLocalSearchParams } from "expo-router"

import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { fireHaptic } from "@/utils/haptics"

export function useShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { state } = useScheduleStateQuery()
  const { respondToShift } = useScheduleActions()
  const shift = state?.shifts.find((item) => item.id === id)

  const handleAcknowledgeUpdate = async () => {
    if (!shift) {
      return
    }

    const result = await respondToShift(shift.id)
    if (!result.ok) {
      fireHaptic("error")
      return
    }

    fireHaptic("success")
  }

  return {
    handleAcknowledgeUpdate,
    shift,
  }
}
