import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "expo-router"

import { getClockSnapshot } from "@/core/date"
import { createInitialState } from "@/core/mockState"
import type { TimeEntry } from "@/core/models"
import { useTimeActions } from "@/features/time/data/time.mutations"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import { formatCurrency } from "@/utils/formatters"

import { weekData } from "./time.data"
import { captureLocationSnapshot, captureOptionalClockInPhoto } from "./timeCapture"

export function useTimeScreen() {
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
  const payableSeconds = snapshot.payableSeconds
  const earnings = formatCurrency((payableSeconds / 3600) * state.earnings.averageHourlyRate)
  const totalBreakSeconds = snapshot.breakSeconds
  const weekTotal =
    weekData.filter((item) => !item.today).reduce((sum, item) => sum + item.hours, 0) +
    elapsedSeconds / 3600

  const openEntry = useCallback(
    (entry: TimeEntry) => router.push(`/(app)/time-entry/${entry.id}` as never),
    [router],
  )

  const handleClockIn = useCallback(async () => {
    const occurredAt = new Date().toISOString()
    const location = await captureLocationSnapshot(state.clockSession.venueAddress)
    const proofPhoto = await captureOptionalClockInPhoto()
    if (proofPhoto === null) return
    startClock({ occurredAt, location, proofPhoto })
  }, [startClock, state.clockSession.venueAddress])

  const handleStartBreak = useCallback(async () => {
    startBreak({
      occurredAt: new Date().toISOString(),
      location: await captureLocationSnapshot(state.clockSession.venueAddress),
    })
  }, [startBreak, state.clockSession.venueAddress])

  const handleEndBreak = useCallback(async () => {
    endBreak({
      occurredAt: new Date().toISOString(),
      location: await captureLocationSnapshot(state.clockSession.venueAddress),
    })
  }, [endBreak, state.clockSession.venueAddress])

  return {
    earnings,
    elapsedSeconds,
    handleClockIn,
    handleEndBreak,
    handleStartBreak,
    openClockOut: () => router.push("/(app)/clock-out" as never),
    openEntry,
    openTimeEntries: () => router.push("/(app)/time-entries" as never),
    snapshot,
    state,
    totalBreakSeconds,
    weekTotal,
  }
}
