import { useCallback, useRef, useState } from "react"
import { Alert } from "react-native"

import type { Employer, Shift, UserProfile } from "@/core/models"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { formatClockStartDistance, resolveClockStart } from "@/features/time/data/time.workflow"
import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

import { showClockEmployerOptions } from "./showClockEmployerOptions"
import { captureClockInProofPhoto, captureLocationSnapshot } from "./timeCapture"

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
  // Drives an inline "Getting location…" affordance on the CTA instead of a
  // frozen button, so clock-in feels responsive while we resolve context.
  const [clockInPending, setClockInPending] = useState(false)
  // Synchronous ref guard — useState updates are async so two rapid taps could
  // both pass the pending check before the first tap's state update renders.
  const clockInPendingRef = useRef(false)
  // Guards the break start/end punches against double-taps (a slow location +
  // network round-trip would otherwise let a second tap fire a duplicate punch).
  const [breakPending, setBreakPending] = useState(false)

  const handleClockIn = useCallback(async () => {
    if (clockInPendingRef.current) return
    clockInPendingRef.current = true
    setClockInPending(true)
    try {
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
        Alert.alert(translate("time:errors.clockInUnavailable"), resolution.error.message)
        return
      }

      let selectedOption = resolution.data.recommendedOption
      if (resolution.data.mode === "multiple-employers") {
        const selectedEmployerId = await showClockEmployerOptions({
          options: resolution.data.options.map((option) => ({
            description: option.inGeofence
              ? translate("time:card.inGeofence")
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

      // Only employers that explicitly require photo proof prompt for a selfie.
      // The default (proofRequired falsy) skips the camera entirely.
      const selectedEmployer = employers.find(
        (employer) => employer.id === selectedOption.context.employerId,
      )
      let proofPhoto: Awaited<ReturnType<typeof captureClockInProofPhoto>> | undefined
      if (selectedEmployer?.clockConfig.proofRequired) {
        proofPhoto = await captureClockInProofPhoto()
        if (proofPhoto === null) {
          fireHaptic("warning")
          return
        }
      }

      const result = await startClock({
        clockContext: selectedOption.context,
        occurredAt,
        location,
        proofPhoto: proofPhoto ?? undefined,
      })
      if (!result.ok) {
        fireHaptic("error")
        Alert.alert(translate("time:errors.clockInUnavailable"), result.error.message)
        return
      }

      fireHaptic("success")
    } finally {
      clockInPendingRef.current = false
      setClockInPending(false)
    }
  }, [employers, profileRole, shifts, startClock])

  const handleStartBreak = useCallback(async () => {
    if (breakPending) return
    setBreakPending(true)
    try {
      const result = await startBreak({
        occurredAt: new Date().toISOString(),
        location: await captureLocationSnapshot(),
      })
      if (!result.ok) {
        fireHaptic("error")
        Alert.alert(translate("time:errors.breakUnavailable"), result.error.message)
        return
      }

      fireHaptic("success")
    } finally {
      setBreakPending(false)
    }
  }, [breakPending, startBreak])

  const handleEndBreak = useCallback(async () => {
    if (breakPending) return
    setBreakPending(true)
    try {
      const result = await endBreak({
        occurredAt: new Date().toISOString(),
        location: await captureLocationSnapshot(),
      })
      if (!result.ok) {
        fireHaptic("error")
        Alert.alert(translate("time:errors.breakUnavailable"), result.error.message)
        return
      }

      fireHaptic("success")
    } finally {
      setBreakPending(false)
    }
  }, [breakPending, endBreak])

  return {
    breakPending,
    clockInPending,
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
  }
}
