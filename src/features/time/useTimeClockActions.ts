import { useCallback } from "react"
import { Alert } from "react-native"

import type { Employer, Shift, UserProfile } from "@/core/models"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { formatClockStartDistance, resolveClockStart } from "@/features/time/data/time.workflow"
import { fireHaptic } from "@/utils/haptics"

import { showClockEmployerOptions } from "./showClockEmployerOptions"
import { captureLocationSnapshot, captureOptionalClockInPhoto } from "./timeCapture"

export function useTimeClockActions({
  employers,
  endBreak,
  profileRole,
  shifts,
  startBreak,
  startClock,
}: {
  employers: Employer[]
  endBreak: ReturnType<typeof useTimeActions>["endBreak"]
  profileRole: UserProfile["role"]
  shifts: Shift[]
  startBreak: ReturnType<typeof useTimeActions>["startBreak"]
  startClock: ReturnType<typeof useTimeActions>["startClock"]
}) {
  const handleClockIn = useCallback(async () => {
    const occurredAt = new Date().toISOString()
    const location = await captureLocationSnapshot()
    const resolution = resolveClockStart({
      employers,
      location,
      profileRole,
      shifts,
    })
    if (!resolution.ok) {
      fireHaptic("error")
      Alert.alert("Clock-in unavailable", resolution.error.message)
      return
    }

    let selectedOption = resolution.data.recommendedOption
    if (resolution.data.mode === "multiple-employers") {
      const selectedEmployerId = await showClockEmployerOptions({
        options: resolution.data.options.map((option) => ({
          description: option.inGeofence
            ? "In geofence"
            : (formatClockStartDistance(option.distanceMeters) ?? option.locationLabel),
          id: option.employerId,
          title: option.employerName,
        })),
      })
      if (!selectedEmployerId) return
      selectedOption =
        resolution.data.options.find((option) => option.employerId === selectedEmployerId) ??
        selectedOption
    }

    const proofPhoto = await captureOptionalClockInPhoto()
    if (proofPhoto === null) return

    const result = await startClock({
      clockContext: selectedOption.context,
      occurredAt,
      location,
      proofPhoto,
    })
    if (!result.ok) {
      fireHaptic("error")
      Alert.alert("Clock-in unavailable", result.error.message)
      return
    }

    fireHaptic("success")
  }, [employers, profileRole, shifts, startClock])

  const handleStartBreak = useCallback(async () => {
    const result = await startBreak({
      occurredAt: new Date().toISOString(),
      location: await captureLocationSnapshot(),
    })
    if (!result.ok) {
      fireHaptic("error")
      Alert.alert("Break unavailable", result.error.message)
      return
    }

    fireHaptic("success")
  }, [startBreak])

  const handleEndBreak = useCallback(async () => {
    const result = await endBreak({
      occurredAt: new Date().toISOString(),
      location: await captureLocationSnapshot(),
    })
    if (!result.ok) {
      fireHaptic("error")
      Alert.alert("Break unavailable", result.error.message)
      return
    }

    fireHaptic("success")
  }, [endBreak])

  return {
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
  }
}
