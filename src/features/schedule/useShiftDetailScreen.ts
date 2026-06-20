import { useLocalSearchParams } from "expo-router"

import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { openVenueInMaps } from "@/features/schedule/openVenueInMaps"
import { fireHaptic } from "@/utils/haptics"

export function useShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { state } = useScheduleStateQuery()
  const { declineShift, respondToShift } = useScheduleActions()
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

  const handleDeclineShift = async () => {
    if (!shift) {
      return
    }

    const result = await declineShift(shift.id)
    if (!result.ok) {
      fireHaptic("error")
      return
    }

    fireHaptic("warning")
  }

  const handleOpenMaps = () => {
    if (!shift) {
      return
    }

    void openVenueInMaps(shift.venueAddress)
  }

  return {
    handleAcknowledgeUpdate,
    handleDeclineShift,
    handleOpenMaps,
    shift,
  }
}
