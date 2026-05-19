import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { getClockSnapshot } from "@/core/date"
import { createInitialState } from "@/core/mockState"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import { fireHaptic } from "@/utils/haptics"

import { captureLocationSnapshot, captureOptionalClockInPhoto } from "./timeCapture"

export function useTimeCardController() {
  const router = useRouter()
  const { endBreak, startBreak, startClock } = useTimeActions()
  const query = useTimeDataQuery()
  const fallbackState = useMemo(() => {
    const initialState = createInitialState()
    return {
      clockSession: initialState.clockSession,
      earnings: initialState.earnings,
      timeEntries: initialState.timeEntries,
    }
  }, [])
  const state = query.data ?? fallbackState
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (state.clockSession.state === "idle") return
    const intervalId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [state.clockSession.state])

  const snapshot = useMemo(
    () => getClockSnapshot(state.clockSession, now),
    [now, state.clockSession],
  )
  const elapsedSeconds = state.clockSession.startedAt
    ? Math.max(
        Math.floor((now.getTime() - new Date(state.clockSession.startedAt).getTime()) / 1000),
        0,
      )
    : 0
  const totalBreakSeconds = snapshot.breakSeconds

  const handleClockIn = useCallback(async () => {
    const occurredAt = new Date().toISOString()
    const location = await captureLocationSnapshot()
    const proofPhoto = await captureOptionalClockInPhoto()
    if (proofPhoto === null) return
    const result = await startClock({ occurredAt, location, proofPhoto })
    if (!result.ok) {
      fireHaptic("error")
      Alert.alert("Clock-in unavailable", result.error.message)
      return
    }

    fireHaptic("success")
  }, [startClock])

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
    elapsedSeconds,
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
    openClockOut: () => {
      fireHaptic("selection")
      router.push("/(app)/clock-out" as never)
    },
    snapshot,
    state,
    totalBreakSeconds,
  }
}
